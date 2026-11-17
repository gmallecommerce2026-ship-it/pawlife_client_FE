'use client';
// src/components/home/QrTag3DCanvas.tsx
// Viên QR Tag 3D dựng bằng code (three.js qua React Three Fiber):
//  - Đĩa tròn mép bo (dạng lens), nhìn ngang vẫn tròn
//  - Mặt trước là logo, mặt sau là mã QR vẽ bằng code; cả hai đặt thẳng đứng (đầu icon hướng lên trên)
//  - Đĩa tự xoay quanh trục đứng để lật trước/sau theo tiến độ cuộn, kèm dao động nhẹ khi đứng yên

import { useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const FRONT_SRC = '/images/qr-tag-only.webp';
const RADIUS = 1;          // bán kính đĩa (đường kính 2 đơn vị ~ 3.2 cm thật)
// Độ dày đĩa theo ảnh thật: khoảng 1/4 đường kính (≈ 0.8 cm trên tag 3.2 cm), mép bo tròn đều.
const HALF_THICK = 0.25;   // nửa độ dày đĩa
const EDGE = 0.18;         // bán kính bo mép (lớn để mép tròn như ảnh chụp cạnh)
// Góc xoay ảnh trên mặt đĩa. 0 = đầu icon hướng lên trên.
// (Trước đây là Math.PI / 2 nên icon bị nằm ngang, đầu quay sang trái.)
// Nếu ảnh gốc của bạn vẫn lệch, đổi thành Math.PI / 2, -Math.PI / 2 hoặc Math.PI.
const FACE_ROT = 0;

// Tiến độ cuộn → góc xoay quanh trục đứng (rad). Mỗi nửa vòng là một lần lật.
const SPIN_T = [0, 0.38, 0.5, 0.62, 0.8, 0.9, 1];
const SPIN_A = [0, 0, Math.PI, 2 * Math.PI, 2 * Math.PI, 3 * Math.PI, 4 * Math.PI];
function spinAt(t: number): number {
  if (t <= SPIN_T[0]) return SPIN_A[0];
  for (let i = 0; i < SPIN_T.length - 1; i++) {
    if (t <= SPIN_T[i + 1]) {
      const u = (t - SPIN_T[i]) / (SPIN_T[i + 1] - SPIN_T[i]);
      const e = u * u * (3 - 2 * u);
      return SPIN_A[i] + (SPIN_A[i + 1] - SPIN_A[i]) * e;
    }
  }
  return SPIN_A[SPIN_A.length - 1];
}

/* Mặt tròn có mép bo: profile quay quanh trục Y tạo thành thân đĩa */
function makeLensGeometry(): THREE.LatheGeometry {
  const pts: THREE.Vector2[] = [];
  const R = RADIUS;
  const h = HALF_THICK;
  const e = EDGE;
  const arcSteps = 10;
  pts.push(new THREE.Vector2(0, h));
  // Mép trên: cung tròn từ mặt trên xuống thành bên
  for (let i = 0; i <= arcSteps; i++) {
    const a = Math.PI / 2 - (i / arcSteps) * (Math.PI / 2);
    pts.push(new THREE.Vector2(R - e + e * Math.cos(a), h - e + e * Math.sin(a)));
  }
  // Mép dưới: cung tròn từ thành xuống mặt dưới
  for (let i = 0; i <= arcSteps; i++) {
    const a = 0 - (i / arcSteps) * (Math.PI / 2);
    pts.push(new THREE.Vector2(R - e + e * Math.cos(a), -(h - e) + e * Math.sin(a)));
  }
  pts.push(new THREE.Vector2(0, -h));
  return new THREE.LatheGeometry(pts, 160);
}

/* Mặt sau: mã QR mô phỏng (3 mẫu định vị + ô ngẫu nhiên). Thay bằng mã thật khi có dữ liệu. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* Khe xỏ dây ở mép trên của đĩa, như trên ảnh thật */
function drawHole(g: CanvasRenderingContext2D, S: number) {
  const w = S * 0.16;
  const h = S * 0.045;
  const x = (S - w) / 2;
  const y = S * 0.075;
  g.fillStyle = '#E5E7EB';
  g.beginPath();
  g.roundRect(x, y, w, h, h / 2);
  g.fill();
}

/* Mặt trước dự phòng: vẽ bằng canvas khi chưa có file /images/qr-tag-only.webp.
   Vệt cam cong xấp xỉ logo trong ảnh; có ảnh thật thì ảnh đó sẽ thay thế. */
function makeFrontFallback(): THREE.CanvasTexture {
  const S = 512;
  const canvas = document.createElement('canvas');
  canvas.width = S;
  canvas.height = S;
  const g = canvas.getContext('2d')!;
  g.fillStyle = '#FFFFFF';
  g.fillRect(0, 0, S, S);
  drawHole(g, S);

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
  tex.center.set(0.5, 0.5);
  tex.rotation = FACE_ROT;
  return tex;
}

function makeBackTexture(): THREE.CanvasTexture {
  const S = 512;
  const N = 25;
  const canvas = document.createElement('canvas');
  canvas.width = S;
  canvas.height = S;
  const g = canvas.getContext('2d')!;
  g.fillStyle = '#FFFFFF';
  g.fillRect(0, 0, S, S);
  drawHole(g, S);

  const cell = S / (N + 8);
  const off = (S - N * cell) / 2;
  const inFinder = (x: number, y: number) =>
    (x < 7 && y < 7) || (x >= N - 7 && y < 7) || (x < 7 && y >= N - 7);
  const drawFinder = (x0: number, y0: number) => {
    g.fillStyle = '#1F2937';
    g.fillRect(off + x0 * cell, off + y0 * cell, 7 * cell, 7 * cell);
    g.fillStyle = '#FFFFFF';
    g.fillRect(off + (x0 + 1) * cell, off + (y0 + 1) * cell, 5 * cell, 5 * cell);
    g.fillStyle = '#1F2937';
    g.fillRect(off + (x0 + 2) * cell, off + (y0 + 2) * cell, 3 * cell, 3 * cell);
  };

  const rnd = seeded(7);
  g.fillStyle = '#1F2937';
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      if (inFinder(x, y)) continue;
      if (rnd() > 0.5) g.fillRect(off + x * cell, off + y * cell, cell, cell);
    }
  }
  drawFinder(0, 0);
  drawFinder(N - 7, 0);
  drawFinder(0, N - 7);

  // Nhãn mã của tag, như trên mặt sau ảnh thật
  g.fillStyle = '#6B7280';
  g.font = 'bold 34px sans-serif';
  g.textAlign = 'center';
  g.fillText('PL-02516', S / 2, S * 0.9);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.repeat.x = -1; // mặt sau nhìn từ phía đối diện nên lật ngang để chữ đọc đúng
  tex.offset.x = 1;
  return tex;
}

function Tag({ progressRef }: { progressRef: MutableRefObject<number> }) {
  const [frontTex, setFrontTex] = useState<THREE.Texture>(() => makeFrontFallback());
  useEffect(() => {
    let alive = true;
    new THREE.TextureLoader().load(
      FRONT_SRC,
      (t) => {
        if (!alive) return;
        t.colorSpace = THREE.SRGBColorSpace;
        t.center.set(0.5, 0.5);
        t.rotation = FACE_ROT;
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
  }, []);
  const backTex = useMemo(() => {
    const t = makeBackTexture();
    t.center.set(0.5, 0.5);
    t.rotation = FACE_ROT;
    return t;
  }, []);

  const lens = useMemo(() => makeLensGeometry(), []);
  const faceGeo = useMemo(() => new THREE.CircleGeometry(RADIUS - EDGE + 0.01, 128), []);
  const bodyMat = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: '#FFFFFF', roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.1 }),
    [],
  );
  const frontMat = useMemo(
    () => new THREE.MeshPhysicalMaterial({ map: frontTex, roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.08 }),
    [frontTex],
  );
  const backMat = useMemo(
    () => new THREE.MeshPhysicalMaterial({ map: backTex, roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.08 }),
    [backTex],
  );

  const spin = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (spin.current) {
      spin.current.rotation.y = spinAt(progressRef.current) + Math.sin(clock.elapsedTime * 0.9) * 0.1;
    }
  });

  return (
    <group ref={spin}>
      {/* Thân đĩa mép bo, đặt nằm trong mặt phẳng XY để mặt trước hướng về camera */}
      <mesh geometry={lens} rotation={[Math.PI / 2, 0, 0]} material={bodyMat} />
      {/* Mặt trước và mặt sau */}
      <mesh geometry={faceGeo} position={[0, 0, HALF_THICK + 0.002]} material={frontMat} />
      <mesh geometry={faceGeo} position={[0, 0, -(HALF_THICK + 0.002)]} rotation={[0, Math.PI, 0]} material={backMat} />
    </group>
  );
}

export default function QrTag3DCanvas({ progressRef }: { progressRef: MutableRefObject<number> }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 28 }}
      gl={{ antialias: true, alpha: true }}
      flat
      dpr={[1, 2]}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={1.5} />
      <hemisphereLight args={['#FFFFFF', '#F3EDE6', 1.1]} />
      <directionalLight position={[3, 4, 6]} intensity={1.8} />
      <directionalLight position={[-4, -2, 4]} intensity={0.6} color="#FFF4EA" />
      <Tag progressRef={progressRef} />
    </Canvas>
  );
}
