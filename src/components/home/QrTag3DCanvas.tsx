'use client';
// src/components/home/QrTag3DCanvas.tsx
// Viên QR Tag 3D (three.js qua React Three Fiber):
//  - Đĩa tròn đường kính 2.75 cm, dày 0.475 cm, mép bo, mặt trước hơi lõm như ảnh thật
//  - Khe xỏ dây ở mép trên (dày ~0.1 cm) là lỗ xuyên thấu thật (cắt khỏi hình học, không phải vẽ giả)
//  - Mặt trước là logo; mặt sau là QR nhỏ kèm nhãn PL-XXXXX bên dưới
//  - Đĩa xoay quanh trục đứng theo tiến độ cuộn; độ sáng thay đổi theo góc quay để có bóng khi xoay ngang

import { useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RING_RADIUS, CAM_Z, CAM_FOV, CANVAS_SCALE } from './ringConfig';

const FRONT_SRC = '/images/qr-tag-only.png';
const RADIUS = RING_RADIUS;   // bán kính đĩa; 1 đơn vị ≈ 1.375 cm
export const HALF_THICK = 0.173;     // nửa độ dày: 0.475 cm / 2.75 cm × (đường kính 2 đơn vị)
const EDGE = 0.16;            // bán kính bo mép (gần bằng nửa dày: viền tròn đều)
const DISH = 0.03;            // độ lõm nhẹ của mặt trước và mặt sau (đơn vị 3D); tiếp tuyến = 0 ở mép
// Khe ghim: cung tròn đồng tâm với viền, dài ~0.5 cm (giữ nguyên), bề dày (chiều rộng khe) ~0.1 cm = một nửa trước đây, nằm ở mép trên.
// Giữ nguyên đường tâm của khe (RADIUS - 0.1275), chỉ thu bề dày từ 0.145 xuống 0.0725
const HOLE_MID = RADIUS - 0.1275;
const HOLE_W = 0.0725;
const HOLE_R_IN = HOLE_MID - HOLE_W / 2;
const HOLE_R_OUT = HOLE_MID + HOLE_W / 2;
const HOLE_CENTER = Math.PI / 2;
const HOLE_HALF_ANG = 0.2;
// Độ sáng thấp nhất khi mặt quay sang cạnh (0 → 1), tạo bóng khi xoay qua
const SHADE_MIN = 0.42;
const NS = 256; // số mẫu quanh đĩa
const NC = 40;  // số mẫu từ tâm ra mép (mỗi mặt)
const NA = 16;  // số mẫu của mỗi cung bo mép

// Xoay quanh trục đứng theo mốc cuộn: đồng bộ với các chương trên trang.
// 0.34 → 0.44: lật để lộ mặt sau khi bay ra; 0.76: lật lại để lộ mặt sau ở chương "Mặt sau"; 1: về mặt trước.
const SPIN_T = [0, 0.34, 0.44, 0.52, 0.76, 1];
const SPIN_A = [0, 0, Math.PI, 2 * Math.PI, 3 * Math.PI, 4 * Math.PI];
export function spinAt(t: number): number {
  if (t <= SPIN_T[0]) return SPIN_A[0];
  for (let i = 0; i < SPIN_T.length - 1; i++) {
    if (t <= SPIN_T[i + 1]) {
      const u = (t - SPIN_T[i]) / (SPIN_T[i + 1] - SPIN_T[i]);
      const e = 0.5 - 0.5 * Math.cos(Math.PI * u); // ease-in-out êm
      return SPIN_A[i] + (SPIN_A[i + 1] - SPIN_A[i]) * e;
    }
  }
  return SPIN_A[SPIN_A.length - 1];
}

/* Khe ghim: điểm (x, y) có nằm trong cung khe không */
function inHole(x: number, y: number): boolean {
  const r = Math.hypot(x, y);
  if (r < HOLE_R_IN || r > HOLE_R_OUT) return false;
  let d = Math.atan2(y, x) - HOLE_CENTER;
  d = Math.atan2(Math.sin(d), Math.cos(d));
  return Math.abs(d) <= HOLE_HALF_ANG;
}

type ProfilePt = { r: number; z: number; nr: number; nz: number; g: number };

/* Đĩa một khối: mặt trước (g=0), thân gồm mép bo (g=1), mặt sau (g=2).
   Dựng bằng lưới cực quanh trục Z; các ô nằm trong khe xỏ dây bị bỏ đi nên lỗ xuyên thấu thật.
   Pháp tuyến tính sẵn theo hình học: mặt lõm nhẹ, mép bo tròn đều, không bị nội suy cong. */
export function makeRingGeometry(): THREE.BufferGeometry {
  const R = RADIUS;
  const h = HALF_THICK;
  const e = EDGE;
  const rE = R - e;

  const dishSlope = (r: number) => (4 * DISH * r * (1 - (r / rE) ** 2)) / (rE * rE);
  const capNormal = (r: number, top: boolean): [number, number] => {
    const nr = -dishSlope(r);
    const nz = top ? 1 : -1;
    const l = Math.hypot(nr, nz);
    return [nr / l, nz / l];
  };

  const prof: ProfilePt[] = [];
  // Mặt trước: từ tâm ra mép, lõm nhẹ
  for (let i = 0; i <= NC; i++) {
    const r = (rE * i) / NC;
    const [nr, nz] = capNormal(r, true);
    prof.push({ r, z: h - DISH * (1 - (r / rE) ** 2) ** 2, nr, nz, g: 0 });
  }
  // Mép trên: cung từ (rE, h) xuống (R, h - e)
  for (let k = 1; k <= NA; k++) {
    const a = (Math.PI / 2) * (1 - k / NA);
    prof.push({ r: rE + e * Math.cos(a), z: h - e + e * Math.sin(a), nr: Math.cos(a), nz: Math.sin(a), g: 1 });
  }
  // Mép dưới: cung từ (R, -(h - e)) xuống (rE, -h)
  for (let k = 0; k <= NA; k++) {
    const b = -(Math.PI / 2) * (k / NA);
    prof.push({ r: rE + e * Math.cos(b), z: -(h - e) + e * Math.sin(b), nr: Math.cos(b), nz: Math.sin(b), g: 1 });
  }
  // Mặt sau: từ mép vào tâm, lõm nhẹ
  for (let i = NC - 1; i >= 0; i--) {
    const r = (rE * i) / NC;
    const [nr, nz] = capNormal(r, false);
    prof.push({ r, z: -h + DISH * (1 - (r / rE) ** 2) ** 2, nr, nz, g: 2 });
  }

  const M = prof.length;
  const pos: number[] = [];
  const nor: number[] = [];
  const uv: number[] = [];
  for (let j = 0; j < M; j++) {
    const p = prof[j];
    for (let i = 0; i < NS; i++) {
      const t = (2 * Math.PI * i) / NS;
      const c = Math.cos(t);
      const s = Math.sin(t);
      const x = p.r * c;
      const y = p.r * s;
      pos.push(x, y, p.z);
      nor.push(p.nr * c, p.nr * s, p.nz);
      // mặt sau nhìn từ phía đối diện nên lật ngang u để ảnh đọc đúng
      const mirror = p.g === 2 ? -1 : 1;
      uv.push(0.5 + (mirror * x) / (2 * R), 0.5 + y / (2 * R));
    }
  }

  const V = (k: number) => new THREE.Vector3(pos[3 * k], pos[3 * k + 1], pos[3 * k + 2]);
  const N = (k: number) => new THREE.Vector3(nor[3 * k], nor[3 * k + 1], nor[3 * k + 2]);
  const groups: number[][] = [[], [], []];
  const idx = (j: number, i: number) => j * NS + (i % NS);
  const zTop = (r: number) =>
    r < rE ? h - DISH * (1 - (r / rE) ** 2) ** 2 : h - e + e * Math.sqrt(Math.max(0, 1 - ((r - rE) / e) ** 2));
  const tri = (q: number[], a: number, b: number, c: number) => {
    // đảm bảo thứ tự đỉnh cùng chiều với pháp tuyến
    const fn = new THREE.Vector3().subVectors(V(b), V(a)).cross(new THREE.Vector3().subVectors(V(c), V(a)));
    if (fn.dot(N(a)) < 0) {
      q.push(a, c, b);
    } else {
      q.push(a, b, c);
    }
  };

  // Vách trong của khe: đi quanh cung trong rồi cung ngoài, pháp tuyến hướng vào lòng khe
  const NH = 24;
  const wallPts: [number, number, number, number][] = [];
  for (let k = 0; k <= NH; k++) {
    const th = HOLE_CENTER - HOLE_HALF_ANG + (2 * HOLE_HALF_ANG * k) / NH;
    wallPts.push([HOLE_R_IN * Math.cos(th), HOLE_R_IN * Math.sin(th), Math.cos(th), Math.sin(th)]);
  }
  for (let k = 0; k <= NH; k++) {
    const th = HOLE_CENTER + HOLE_HALF_ANG - (2 * HOLE_HALF_ANG * k) / NH;
    wallPts.push([HOLE_R_OUT * Math.cos(th), HOLE_R_OUT * Math.sin(th), -Math.cos(th), -Math.sin(th)]);
  }
  const wallBase = pos.length / 3;
  for (const [x, y, nx, ny] of wallPts) {
    const zt = zTop(Math.hypot(x, y));
    pos.push(x, y, zt, x, y, -zt);
    nor.push(nx, ny, 0, nx, ny, 0);
    uv.push(0, 0, 0, 0);
  }
  const W2 = wallPts.length;
  for (let k = 0; k < W2; k++) {
    const k2 = (k + 1) % W2;
    const aT = wallBase + 2 * k;
    const bT = wallBase + 2 * k2;
    tri(groups[1], aT, aT + 1, bT + 1);
    tri(groups[1], aT, bT + 1, bT);
  }

  for (let j = 0; j < M - 1; j++) {
    const g = prof[j].g === prof[j + 1].g ? prof[j].g : 1;
    const q = groups[g];
    const rc = (prof[j].r + prof[j + 1].r) / 2;
    for (let i = 0; i < NS; i++) {
      const tc = (2 * Math.PI * (i + 0.5)) / NS;
      if (inHole(rc * Math.cos(tc), rc * Math.sin(tc))) continue;
      const a = idx(j, i);
      const b = idx(j, i + 1);
      const c = idx(j + 1, i + 1);
      const d = idx(j + 1, i);
      tri(q, a, b, c);
      tri(q, a, c, d);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  const all: number[] = [];
  for (let g = 0; g < 3; g++) {
    geo.addGroup(all.length, groups[g].length, g);
    for (const k of groups[g]) all.push(k);
  }
  geo.setIndex(all);
  return geo;
}

/* Mặt sau: mã QR mô phỏng (3 mẫu định vị + ô ngẫu nhiên) kèm nhãn PL-XXXXX bên dưới. Thay bằng mã thật khi có dữ liệu. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* Mặt trước dự phòng: vẽ bằng canvas khi chưa có file /images/qr-tag-only.png. */
export function makeFrontFallback(): THREE.CanvasTexture {
  const S = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = S;
  canvas.height = S;
  const g = canvas.getContext('2d')!;
  g.fillStyle = '#FFFFFF';
  g.fillRect(0, 0, S, S);

  g.strokeStyle = '#EE8A2E';
  g.lineCap = 'round';
  g.lineWidth = S * 0.11;
  g.beginPath();
  g.arc(S * 0.5, S * 0.56, S * 0.2, Math.PI * 0.95, Math.PI * 1.95);
  g.stroke();
  g.beginPath();
  g.arc(S * 0.38, S * 0.36, S * 0.05, Math.PI * 0.4, Math.PI * 1.9);
  g.lineWidth = S * 0.05;
  g.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* Mặt sau: QR nhỏ ở giữa, nhãn PL-02516 bên dưới */
/* Hạt men: nhiễu mịn dùng làm bản đồ độ nhám và bump, tạo vi chi tiết bề mặt sứ */
export function makeGrainTexture(): THREE.CanvasTexture {
  const S = 512;
  const canvas = document.createElement('canvas');
  canvas.width = S;
  canvas.height = S;
  const g = canvas.getContext('2d')!;
  const img = g.createImageData(S, S);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 185 + Math.floor(Math.random() * 70);
    img.data[i] = v;
    img.data[i + 1] = v;
    img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  return tex;
}

export function makeBackTexture(): THREE.CanvasTexture {
  const S = 1024;
  const N = 25;
  const canvas = document.createElement('canvas');
  canvas.width = S;
  canvas.height = S;
  const g = canvas.getContext('2d')!;
  g.fillStyle = '#FFFFFF';
  g.fillRect(0, 0, S, S);

  const qr = S * 0.5;
  const cell = qr / N;
  const ox = (S - qr) / 2;
  const oy = S * 0.16;
  const inFinder = (x: number, y: number) =>
    (x < 7 && y < 7) || (x >= N - 7 && y < 7) || (x < 7 && y >= N - 7);
  const drawFinder = (x0: number, y0: number) => {
    g.fillStyle = '#1F2937';
    g.fillRect(ox + x0 * cell, oy + y0 * cell, 7 * cell, 7 * cell);
    g.fillStyle = '#FFFFFF';
    g.fillRect(ox + (x0 + 1) * cell, oy + (y0 + 1) * cell, 5 * cell, 5 * cell);
    g.fillStyle = '#1F2937';
    g.fillRect(ox + (x0 + 2) * cell, oy + (y0 + 2) * cell, 3 * cell, 3 * cell);
  };

  const rnd = seeded(7);
  g.fillStyle = '#1F2937';
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      if (inFinder(x, y)) continue;
      if (rnd() > 0.5) g.fillRect(ox + x * cell, oy + y * cell, cell, cell);
    }
  }
  drawFinder(0, 0);
  drawFinder(N - 7, 0);
  drawFinder(0, N - 7);

  // Nhãn PL-XXXXX ngay dưới QR
  g.fillStyle = '#6B7280';
  g.font = `bold ${Math.round(S * 0.075)}px sans-serif`;
  g.textAlign = 'center';
  g.fillText('PL-02516', S / 2, oy + qr + S * 0.12);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function Tag({ progressRef }: { progressRef: MutableRefObject<number> }) {
  const { gl, scene } = useThree();
  const maxAniso = gl.capabilities.getMaxAnisotropy();

  // Phòng studio phản chiếu: cho men sứ có highlight và độ bóng thật khi xoay
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    return () => {
      scene.environment = null;
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);

  const [frontTex, setFrontTex] = useState<THREE.Texture>(() => makeFrontFallback());
  useEffect(() => {
    let alive = true;
    new THREE.TextureLoader().load(
      FRONT_SRC,
      (t) => {
        if (!alive) return;
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = maxAniso;
        setFrontTex(t);
      },
      undefined,
      () => {
        /* Không có ảnh thật: giữ mặt dự phòng */
      },
    );
    return () => {
      alive = false;
    };
  }, [maxAniso]);
  const backTex = useMemo(() => makeBackTexture(), []);
  const grain = useMemo(() => makeGrainTexture(), []);
  useEffect(() => {
    frontTex.anisotropy = maxAniso;
    backTex.anisotropy = maxAniso;
  }, [frontTex, backTex, maxAniso]);
  const ring = useMemo(() => makeRingGeometry(), []);

  // Men sứ: nhám vừa, có hạt nhỏ, lớp phủ bóng mỏng, phản xạ theo môi trường
  const enamel = {
    roughness: 0.38,
    roughnessMap: grain,
    bumpMap: grain,
    bumpScale: 0.4,
    clearcoat: 0.7,
    clearcoatRoughness: 0.06,
    ior: 1.5,
    specularIntensity: 0.6,
    envMapIntensity: 0.8,
  };

  const bodyMat = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: '#FFFFFF', ...enamel, side: THREE.DoubleSide }),
    [grain],
  );
  const frontMat = useMemo(
    () => new THREE.MeshPhysicalMaterial({ map: frontTex, ...enamel, side: THREE.DoubleSide }),
    [frontTex, grain],
  );
  const backMat = useMemo(
    () => new THREE.MeshPhysicalMaterial({ map: backTex, ...enamel, side: THREE.DoubleSide }),
    [backTex, grain],
  );

  const spin = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!spin.current) return;
    const a = spinAt(progressRef.current) + Math.sin(clock.elapsedTime * 0.9) * 0.1;
    spin.current.rotation.y = a;
    // Bóng khi xoay: mặt đối diện camera sáng đủ, quay sang cạnh thì tối dần
    const shade = SHADE_MIN + (1 - SHADE_MIN) * Math.pow(Math.abs(Math.cos(a)), 0.6);
    bodyMat.color.setScalar(shade);
    frontMat.color.setScalar(shade);
    backMat.color.setScalar(shade);
  });

  return (
    <group ref={spin}>
      <mesh geometry={ring} material={[frontMat, bodyMat, backMat]} />
    </group>
  );
}

export default function QrTag3DCanvas({ progressRef }: { progressRef: MutableRefObject<number> }) {
  return (
    <div style={{ position: 'absolute', left: `${-(CANVAS_SCALE - 1) * 50}%`, top: `${-(CANVAS_SCALE - 1) * 50}%`, width: `${CANVAS_SCALE * 100}%`, height: `${CANVAS_SCALE * 100}%` }}>
      <Canvas
        camera={{ position: [0, 0, CAM_Z], fov: CAM_FOV }}
        gl={{ antialias: true, alpha: true }}
        flat
        dpr={[1, 2]}
        style={{ background: 'transparent' }}
      >
        {/* ánh sáng vừa phải: logo không bị cháy sang vàng khi gần camera */}
        <ambientLight intensity={0.5} />
        <hemisphereLight args={['#FFFFFF', '#8A6E58', 0.45]} />
        <directionalLight position={[3, 5, 6]} intensity={1.5} />
        <directionalLight position={[-5, -2, 2]} intensity={0.3} color="#FFF4EA" />
        <Tag progressRef={progressRef} />
      </Canvas>
    </div>
  );
}