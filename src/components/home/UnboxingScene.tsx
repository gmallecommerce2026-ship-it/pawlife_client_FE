'use client';
// src/components/home/UnboxingScene.tsx
// Cảnh 3D duy nhất: hộp và vòng cùng nằm trong một không gian three.js.
//  - Hộp: đáy có lõm tròn vừa khít vòng, bốn thành 2 mm, nắp có bản lề, khe gập, hai cánh gài bên, lưỡi gài nửa tròn, chữ và logo
//  - Vòng: nằm trong lõm; khi nắp mở thì nhấc lên theo quỹ đạo cong 3D, tiến về camera, xoay theo mốc cuộn
//  - Mọi chuyển động đọc tiến độ cuộn qua ref và làm mượt bằng damping trong useFrame, không dùng state React theo từng khung hình

import { useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  HALF_THICK,
  makeBackTexture,
  makeFrontFallback,
  makeGrainTexture,
  makeRingGeometry,
  spinAt,
} from './QrTag3DCanvas';

const FRONT_SRC = '/images/qr-tag-only.webp';
const RING_LOGO = '/images/qr-tag-only.webp';

/* Kích thước thế giới: hộp 8 cm = 4 đơn vị → 1 cm = 0.5 đơn vị */
const B = 4;               // cạnh hộp
const H = 0.5;             // chiều cao thành (1 cm)
const BOARD = 0.1;         // độ dày bìa (2 mm)
const IN = 0.06;           // lùi của cạnh gấp trước
const EAR_W = 0.55;        // rộng cánh gài bên (~1.1 cm)
const S_RING = 0.6875;     // đĩa đường kính 2.75 cm → 1.375 đơn vị
const RING_REST_Y = HALF_THICK * S_RING + 0.003;
const ORANGE = '#E89B5A';

/* Đường cong Catmull-Rom một chiều: trơn, không khựng giữa các mốc */
type Key = [number, number];
function evalCurve(keys: Key[], t: number): number {
  const last = keys.length - 1;
  if (t <= keys[0][0]) return keys[0][1];
  if (t >= keys[last][0]) return keys[last][1];
  let i = 0;
  while (i < last - 1 && t > keys[i + 1][0]) i++;
  const [t0, P1] = keys[i];
  const [t1, P2] = keys[i + 1];
  const P0 = keys[Math.max(0, i - 1)][1];
  const P3 = keys[Math.min(last, i + 2)][1];
  const u = (t - t0) / (t1 - t0 || 1);
  return (
    0.5 *
    (2 * P1 +
      (-P0 + P2) * u +
      (2 * P0 - 5 * P1 + 4 * P2 - P3) * u * u +
      (-P0 + 3 * P1 - 3 * P2 + P3) * u * u * u)
  );
}

/* Cánh gài bên: tấm bìa có mũi nhọn ở đáy, dựng trong mặt YZ, dày 2 mm */
const earShape = new THREE.Shape();
earShape.moveTo(0, 0);
earShape.lineTo(EAR_W, 0);
earShape.lineTo(EAR_W, -H * 0.8);
earShape.lineTo(EAR_W / 2, -H);
earShape.lineTo(0, -H * 0.8);
earShape.closePath();
const earGeo = new THREE.ExtrudeGeometry(earShape, { depth: BOARD, bevelEnabled: false });

/* Gờ gài phía trước nắp (nắp gài kiểu gấp origami, theo video): gờ bọc ra ngoài thành trước, có lưỡi gài nửa tròn ở giữa
   và hai răng gài nhọn hai bên, lồng vào khe gài trên thành khay. Dựng trong mặt XY, dày 2 mm theo trục Z. */
const SK = 0.18;       // cao gờ (~0.35 cm)
const TAB_R = 0.2;     // bán kính lưỡi gài nửa tròn (dài ~0.8 cm)
const tabShape = new THREE.Shape();
tabShape.moveTo(-TAB_R, 0);
tabShape.absarc(0, 0, TAB_R, Math.PI, 2 * Math.PI, false);
tabShape.closePath();
const tabGeo = new THREE.ExtrudeGeometry(tabShape, { depth: BOARD, bevelEnabled: false });
const hookShape = new THREE.Shape();
hookShape.moveTo(0, 0);
hookShape.lineTo(0.07, 0);
hookShape.lineTo(0.035, -0.12);
hookShape.closePath();
const hookGeo = new THREE.ExtrudeGeometry(hookShape, { depth: BOARD, bevelEnabled: false });

/* Quỹ đạo vòng: X nhân với hệ số theo khung hình (màn hẹp thì thu lại) */
const RING_X: Key[] = [[0, 0], [0.12, 0], [0.26, 0], [0.36, -1.2], [0.52, -1.4], [0.64, -0.2], [0.72, 1.2], [0.8, 1.4], [0.9, 0], [1, 0]];
const RING_Y: Key[] = [[0, RING_REST_Y], [0.12, RING_REST_Y], [0.26, 0.6], [0.36, 1.6], [0.52, 1.0], [0.64, 1.5], [0.72, 1.0], [0.8, 1.2], [0.9, 2.0], [1, 2.0]];
const RING_Z: Key[] = [[0, 0], [0.12, 0], [0.26, 0.2], [0.36, 1.4], [0.52, 2.2], [0.64, 1.6], [0.72, 2.4], [0.8, 2.0], [0.9, 1.0], [1, 1.0]];
// Nghiêng: từ nằm phẳng (-π/2) đến mặt hướng camera
const RING_RX: Key[] = [[0, -Math.PI / 2], [0.26, -0.9], [0.36, -0.3], [0.5, -0.3], [1, -0.3]];
// Nắp (theo video mẫu): 1) nhấc nhẹ ~10° để gỡ lưỡi gài, 2) lật nhanh lên, lố tới ~112° rồi hồi về ~109°
const LID: Key[] = [[0, 0], [0.03, 0], [0.07, 0.14], [0.1, 0.18], [0.21, 1.84], [0.28, 1.95], [0.38, 1.9], [1, 1.9]];
// Nắp trượt ra trước (đơn vị thế giới) khi gỡ lưỡi gài khỏi khe, rồi về chỗ cũ khi đã lật lên
const LID_PULL: Key[] = [[0, 0], [0.03, 0], [0.07, 0.07], [0.12, 0.07], [0.2, 0], [1, 0]];
// Camera: lùi nhẹ rồi tiến về vòng ở giữa hành trình (dolly)
const CAM_Y: Key[] = [[0, 6.5], [0.5, 5.4], [1, 6.5]];
const CAM_Z: Key[] = [[0, 12], [0.5, 9.5], [1, 12]];

/* Texture nắp: màu cam, chữ mảnh, logo ở giữa */
function makeLidTexture(): THREE.CanvasTexture {
  const S = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = S;
  canvas.height = S;
  const g = canvas.getContext('2d')!;
  g.fillStyle = ORANGE;
  g.fillRect(0, 0, S, S);
  g.fillStyle = '#FFFFFF';
  g.textBaseline = 'middle';
  g.font = '500 34px sans-serif';
  g.textAlign = 'left';
  g.fillText('PawLife', 56, 80);
  g.font = '400 28px sans-serif';
  g.textAlign = 'right';
  g.fillText('Pet QR Tag', S - 56, 84);
  g.font = '400 20px sans-serif';
  g.globalAlpha = 0.85;
  g.textAlign = 'center';
  g.fillText('The QR tag dành cho thú cưng', S / 2, S - 70);
  g.globalAlpha = 1;
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* Các mức độ cao tách biệt để không z-fighting (đơn vị thế giới):
   đáy hộp  GROUND_Y            = -0.100
   gốc cỏ   SOIL_Y + 0.008      = -0.112
   bóng     SOIL_Y + 0.006      = -0.114
   đất nền  SOIL_Y              = -0.120 */
const GROUND_Y = -BOARD;               // đáy hộp
const SOIL_Y = GROUND_Y - 0.02;        // đất nền thấp hơn đáy hộp 0.02
const SHADOW_Y = SOIL_Y + 0.006;       // bóng tiếp xúc nằm trên đất 0.006
const GRASS_ROOT_Y = SOIL_Y + 0.008;   // gốc cỏ cắm nhẹ vào đất, cách đáy hộp 0.012
const GRASS_HALF = 9;

/* Tinh chỉnh cỏ quanh hộp */
const GRASS_COUNT = 12000;   // tổng số lá
const GRASS_PAD = 0.35;      // vùng đệm ngoài thành hộp: tuyệt đối không mọc lá
const GRASS_THIN = 1.2;      // bề rộng dải thưa ngay ngoài vùng đệm
const GRASS_THIN_KEEP = 0.7; // tỉ lệ giữ lại lá trong dải thưa
const GRASS_MIN_H = 0.2;     // hệ số chiều cao sát hộp (0.2 → 1.0)
const GRASS_RAMP = 1.6;      // khoảng cách (ngoài footprint) để cỏ cao lại đủ
const GRASS_CAP0 = 0.05;     // trần chiều cao ở sát hộp (phía camera)
const GRASS_CAPK = 0.55;     // độ dốc trần theo khoảng cách; phải < dốc tia nhìn tới chân hộp (~0.66)
const GRASS_BOX = B / 2 + 0.03; // nửa cạnh footprint dùng trong shader

/* Lá cỏ gộp thành một lưới: mỗi lá là dải 4 đoạn, cong nhẹ, tông đậm ở gốc, sáng ở ngọn */
function makeGrassGeometry(): THREE.BufferGeometry {
  const N = GRASS_COUNT;
  const L = 4;
  const pos: number[] = [];
  const col: number[] = [];
  const aH: number[] = [];
  const aBase: number[] = [];
  const aLen: number[] = [];
  const aYaw: number[] = [];
  const aLean: number[] = [];
  const nrm: number[] = [];
  const idx: number[] = [];
  let seed = 1234;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const EX = B / 2 + GRASS_PAD; // nửa cạnh vùng cấm (footprint + đệm)
  let placed = 0;
  let tries = 0;
  while (placed < N && tries < N * 20) {
    tries++;
    const bx = (rnd() * 2 - 1) * GRASS_HALF;
    const bz = (rnd() * 2 - 1) * GRASS_HALF;
    // Loại trừ: không có lá nào mọc dưới đáy hộp hay trong dải đệm quanh hộp
    const ex = Math.abs(bx) - EX;
    const ez = Math.abs(bz) - EX;
    if (ex < 0 && ez < 0) continue;
    // Dải thưa ngay ngoài vùng đệm: giảm mật độ để không thành vòng cỏ dày sát hộp
    const dOut = Math.hypot(Math.max(ex, 0), Math.max(ez, 0));
    if (dOut < GRASS_THIN && rnd() > GRASS_THIN_KEEP) continue;
    placed++;
    const yaw = rnd() * Math.PI * 2;
    const H = 1.3 + rnd() * 1.3;
    const W = 0.07 + rnd() * 0.03;
    const bend = (rnd() - 0.5) * 0.9;
    const lean = 0.7 + rnd() * 0.6;
    const tone = 0.85 + rnd() * 0.3;
    const v0 = pos.length / 3;
    for (let k = 0; k <= L; k++) {
      const t = k / L;
      const hw = (W * 0.5) * (1 - t * 0.85);
      const y = H * t;
      const z = bend * H * t * t * 0.35;
      const shade = (0.5 + 0.5 * t) * tone;
      for (const x of [-hw, hw]) {
        pos.push(x, y, z);
        col.push(0.14 * shade, (0.26 + 0.1 * t) * shade, 0.07 * shade);
        aH.push(t);
        aBase.push(bx, GRASS_ROOT_Y, bz);
        aLen.push(H);
        aYaw.push(yaw);
        aLean.push(lean);
        nrm.push(0, 1, 0);
      }
    }
    for (let k = 0; k < L; k++) {
      const a = v0 + 2 * k;
      idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3));
  g.setAttribute('aH', new THREE.Float32BufferAttribute(aH, 1));
  g.setAttribute('aBase', new THREE.Float32BufferAttribute(aBase, 3));
  g.setAttribute('aLen', new THREE.Float32BufferAttribute(aLen, 1));
  g.setAttribute('aYaw', new THREE.Float32BufferAttribute(aYaw, 1));
  g.setAttribute('aLean', new THREE.Float32BufferAttribute(aLean, 1));
  g.setIndex(idx);
  return g;
}

/* Cánh đồng cỏ: gió đung đưa; cỏ sát hộp ngắn dần và tủa nhẹ ra ngoài.
   Không còn lá nào dưới đáy hộp (đã loại ở CPU) nên không cần ép dẹt → hết z-fighting. */
function GrassField() {
  const geo = useMemo(() => makeGrassGeometry(), []);
  const mat = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9, side: THREE.DoubleSide });
    m.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = { value: 0 };
      shader.uniforms.uBox = { value: new THREE.Vector2(GRASS_BOX, GRASS_BOX) };
      shader.uniforms.uMinH = { value: GRASS_MIN_H };
      shader.uniforms.uRamp = { value: GRASS_RAMP };
      shader.uniforms.uCap0 = { value: GRASS_CAP0 };
      shader.uniforms.uCapK = { value: GRASS_CAPK };
      shader.vertexShader = shader.vertexShader
        .replace(
          '#include <common>',
          `#include <common>
attribute float aH;
attribute float aLen;
attribute vec3 aBase;
attribute float aYaw;
attribute float aLean;
uniform float uTime;
uniform vec2 uBox;
uniform float uMinH;
uniform float uRamp;
uniform float uCap0;
uniform float uCapK;`,
        )
        .replace(
          '#include <begin_vertex>',
          `vec3 lp = position;
float h = aH;

// Khoảng cách từ GỐC lá tới footprint hộp: tính theo gốc để cả lá co giãn đồng nhất, không méo
vec2 qb = abs(aBase.xz) - uBox;
vec2 qo = max(qb, vec2(0.0));
float dB = length(qo);
vec2 sgn = sign(aBase.xz);
vec2 outDir = dB > 0.0001 ? normalize(qo * sgn) : (qb.x > qb.y ? vec2(sgn.x, 0.0) : vec2(0.0, sgn.y));

// Ramp chiều cao: GRASS_MIN_H sát hộp → 1.0 ở xa
float ramp = mix(uMinH, 1.0, smoothstep(0.0, uRamp, dB));
// Trần chiều cao theo tia nhìn của camera (chỉ phía trước/hai bên, phía sau hộp không cần): lá không che mặt trước
float zf = smoothstep(-1.0, 1.0, aBase.z);
float capS = (uCap0 + uCapK * dB) / aLen;
float s = min(ramp, mix(1.0, capS, zf));

lp.y *= s;
lp.z *= s;

// Gió: biên độ tỉ lệ theo độ cao lá đã co, nên lá sát hộp gần như đứng yên (không trượt qua mép hộp)
float ph = aBase.x * 0.55 + aBase.z * 0.8;
float gust = sin(uTime * 1.1 + ph) * 0.5 + sin(uTime * 2.3 + ph * 1.7) * 0.25 + 0.25;
float sway = gust * h * h * 0.35 * aLean * s;
lp.x += sway;
lp.z += sway * 0.3;

float cy = cos(aYaw);
float sy = sin(aYaw);
vec3 wp = aBase + vec3(cy * lp.x + sy * lp.z, lp.y, -sy * lp.x + cy * lp.z);

// Tủa nhẹ ra ngoài quanh cạnh hộp (chỉ theo hướng ra xa hộp)
float near = 1.0 - smoothstep(0.0, 1.6, dB);
wp.xz += outDir * (near * h * h * 0.3 * aLean);

// Chốt an toàn: đỉnh lá nào lọt vào footprint thì đẩy ra mép (không lá nào thò qua thành/đáy)
vec2 q2 = abs(wp.xz) - uBox;
float insideW = step(max(q2.x, q2.y), 0.0);
vec2 n2 = q2.x > q2.y ? vec2(sign(wp.x), 0.0) : vec2(0.0, sign(wp.z));
wp.xz += n2 * (-max(q2.x, q2.y) + 0.02) * insideW;

vec3 transformed = wp;`,
        );
      m.userData.shader = shader;
    };
    return m;
  }, []);
  useFrame(({ clock }) => {
    const sh = mat.userData.shader;
    if (sh) sh.uniforms.uTime.value = clock.elapsedTime;
  });
  // geometry giữ toạ độ cục bộ nên bounding sphere nhỏ: tắt frustum culling cho chắc
  return <mesh geometry={geo} material={mat} receiveShadow frustumCulled={false} />;
}

/* Bóng tiếp xúc (contact shadow): quầng tối mềm ngay dưới đáy hộp, làm hộp nổi trên bàn */
function ContactShadow() {
  const tex = useMemo(() => {
    const S = 512;
    const c = document.createElement('canvas');
    c.width = S;
    c.height = S;
    const g = c.getContext('2d')!;
    const grad = g.createRadialGradient(S / 2, S / 2, S * 0.2, S / 2, S / 2, S * 0.5);
    grad.addColorStop(0, 'rgba(20,28,12,0.6)');
    grad.addColorStop(0.6, 'rgba(20,28,12,0.25)');
    grad.addColorStop(1, 'rgba(20,28,12,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, S, S);
    return new THREE.CanvasTexture(c);
  }, []);
  return (
    // renderOrder âm: vẽ trước các mặt trong suốt của hộp (orangeMat transparent) → không bị đổi thứ tự theo khoảng cách camera gây nháy
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, SHADOW_Y, 0]} renderOrder={-1}>
      <planeGeometry args={[B * 1.7, B * 1.7]} />
      <meshBasicMaterial map={tex} transparent depthWrite={false} polygonOffset polygonOffsetFactor={-1} polygonOffsetUnits={-1} />
    </mesh>
  );
}

/* Đồ trang trí nhỏ đặt ở rìa: viên đá, không chắn hộp */
function DeskProps() {
  const stoneMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#8E8377', roughness: 0.95 }), []);
  return (
    <>
      <mesh material={stoneMat} position={[-4.9, 0.1, 2.8]} scale={[1, 0.5, 0.8]} castShadow receiveShadow>
        <icosahedronGeometry args={[0.32, 2]} />
      </mesh>
    </>
  );
}

function Scene({ progressRef }: { progressRef: MutableRefObject<number> }) {
  const { gl, scene } = useThree();
  const smooth = useRef(0);
  const boxRef = useRef<THREE.Group>(null);
  const lidRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Group>(null);

  // Phòng studio phản chiếu cho men sứ và bìa
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.fog = new THREE.Fog('#C7AD92', 16, 48);
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 0.95;
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.VSMShadowMap;
    return () => {
      scene.environment = null;
      scene.fog = null;
      gl.toneMapping = THREE.NoToneMapping;
      gl.shadowMap.type = THREE.PCFSoftShadowMap;
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);


  /* Vật liệu hộp */
  const lidTex = useMemo(() => makeLidTexture(), []);
  const cardGrain = useMemo(() => makeGrainTexture(), []);
  const orangeMat = useMemo(() => new THREE.MeshStandardMaterial({ color: ORANGE, roughness: 0.88, bumpMap: cardGrain, bumpScale: 0.02, transparent: true }), [cardGrain]);
  const liningMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#F5EEE4', roughness: 0.92, bumpMap: cardGrain, bumpScale: 0.015, transparent: true }), [cardGrain]);
  const lidTopMat = useMemo(() => new THREE.MeshStandardMaterial({ map: lidTex, roughness: 0.85, bumpMap: cardGrain, bumpScale: 0.015, transparent: true }), [lidTex, cardGrain]);
  const recessMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#E6D9CA', roughness: 0.9, transparent: true }), []);
  const creaseMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#7A3E12', transparent: true, opacity: 0.35 }), []);
  const windowMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.2, transparent: true, opacity: 0.6 }), []);

  // Chữ và logo của nắp: vẽ logo sau khi ảnh tải xong
  useEffect(() => {
    const img = new Image();
    img.src = RING_LOGO;
    img.onload = () => {
      const canvas = lidTex.image as HTMLCanvasElement;
      const g = canvas.getContext('2d');
      if (!g) return;
      const S = canvas.width;
      g.drawImage(img, S * 0.33, S * 0.33, S * 0.34, S * 0.34);
      lidTex.needsUpdate = true;
    };
  }, [lidTex]);

  /* Vật liệu vòng: men sứ, có hạt, phản xạ môi trường */
  const ringGeo = useMemo(() => makeRingGeometry(), []);
  const backTex = useMemo(() => makeBackTexture(), []);
  const grain = useMemo(() => makeGrainTexture(), []);
  const [frontTex, setFrontTex] = useState<THREE.Texture>(() => makeFrontFallback());
  useEffect(() => {
    let alive = true;
    new THREE.TextureLoader().load(
      FRONT_SRC,
      (t) => {
        if (!alive) return;
        t.colorSpace = THREE.SRGBColorSpace;
        setFrontTex(t);
      },
      undefined,
      () => {
        /* Không có ảnh thật: giữ hình dự phòng */
      },
    );
    return () => {
      alive = false;
    };
  }, []);
  const maxAniso = gl.capabilities.getMaxAnisotropy();
  useEffect(() => {
    frontTex.anisotropy = maxAniso;
    backTex.anisotropy = maxAniso;
  }, [frontTex, backTex, maxAniso]);
  const enamel = { roughness: 0.5, roughnessMap: grain, bumpMap: grain, bumpScale: 0.7, clearcoat: 0.22, clearcoatRoughness: 0.32, ior: 1.5, specularIntensity: 0.45, envMapIntensity: 0.65 };
  const ringBody = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#FFFFFF', ...enamel, side: THREE.DoubleSide }), [grain]);
  const ringFront = useMemo(() => new THREE.MeshPhysicalMaterial({ map: frontTex, ...enamel, roughness: 0.6, clearcoat: 0.05, envMapIntensity: 0.3, side: THREE.DoubleSide }), [frontTex, grain]);
  const ringBack = useMemo(() => new THREE.MeshPhysicalMaterial({ map: backTex, ...enamel, side: THREE.DoubleSide }), [backTex, grain]);

  // Đặt các thuộc tính thứ tự xoay trước khi dùng
  useEffect(() => {
    if (ringRef.current) ringRef.current.rotation.order = 'YXZ';
  }, []);

  useFrame((state, delta) => {
    // Làm mượt tiến độ: không giật khi cuộn nhanh hoặc dừng đột ngột
    const t = (smooth.current = THREE.MathUtils.damp(smooth.current, progressRef.current, 4, delta));
    const xs = Math.min(1, Math.max(0.5, state.viewport.width / 6));

    if (ringRef.current) {
      ringRef.current.position.set(evalCurve(RING_X, t) * xs, evalCurve(RING_Y, t), evalCurve(RING_Z, t));
      ringRef.current.rotation.x = evalCurve(RING_RX, t);
      ringRef.current.rotation.y = spinAt(t) + Math.sin(state.clock.elapsedTime * 0.9) * 0.08;
    }
    if (lidRef.current) {
      lidRef.current.rotation.x = -evalCurve(LID, t);
      // gỡ lưỡi gài: nắp trượt nhẹ ra trước rồi mới lật (chặn âm do nội suy Catmull-Rom)
      lidRef.current.position.z = -B / 2 + Math.max(0, evalCurve(LID_PULL, t));
    }


    state.camera.position.set(0, evalCurve(CAM_Y, t), evalCurve(CAM_Z, t));
    state.camera.lookAt(0, 0.4, 0);
  });

  return (
    <>
      <ambientLight intensity={0.12} />
      <hemisphereLight args={['#F4E8DA', '#4A3626', 0.12]} />
      {/* Đèn spot chính từ trên bên phải: vùng sáng có mép mềm, phần còn lại của bàn tối dần */}
      <spotLight
        position={[6, 10, 4]}
        target-position={[0, 0, 0]}
        angle={0.42}
        penumbra={0.9}
        intensity={260}
        decay={2}
        distance={40}
        color="#FFF1E0"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-radius={14}
        shadow-blurSamples={18}
        shadow-bias={-0.0004}
      />
      {/* Đèn viền phía sau: tách khối hộp khỏi nền */}
      <directionalLight position={[-4, 3, -5]} intensity={0.35} color="#FFE2C8" />

      {/* Hộp: đáy, bốn thành, lõm tròn, nắp */}
      <group ref={boxRef}>
        <mesh position={[0, -BOARD / 2, 0]} castShadow receiveShadow material={[orangeMat, orangeMat, liningMat, orangeMat, orangeMat, orangeMat]}>
          <boxGeometry args={[B, BOARD, B]} />
        </mesh>
        {/* Thành khay: mặt ngoài cam, mặt trong kem (theo video). Thứ tự mặt: +x, -x, +y, -y, +z, -z */}
        <mesh position={[0, H / 2, B / 2 - BOARD / 2]} castShadow material={[orangeMat, orangeMat, orangeMat, orangeMat, orangeMat, liningMat]}>
          <boxGeometry args={[B, H, BOARD]} />
        </mesh>
        <mesh position={[0, H / 2, -B / 2 + BOARD / 2]} castShadow material={[orangeMat, orangeMat, orangeMat, orangeMat, liningMat, orangeMat]}>
          <boxGeometry args={[B, H, BOARD]} />
        </mesh>
        <mesh position={[-(B / 2 - BOARD / 2), H / 2, 0]} castShadow material={[liningMat, orangeMat, orangeMat, orangeMat, orangeMat, orangeMat]}>
          <boxGeometry args={[BOARD, H, B - 2 * BOARD]} />
        </mesh>
        <mesh position={[B / 2 - BOARD / 2, H / 2, 0]} castShadow material={[orangeMat, liningMat, orangeMat, orangeMat, orangeMat, orangeMat]}>
          <boxGeometry args={[BOARD, H, B - 2 * BOARD]} />
        </mesh>
        {/* Lõm tròn vừa khít vòng */}
        <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]} material={recessMat} receiveShadow>
          <circleGeometry args={[S_RING * 1.04, 64]} />
        </mesh>

        {/* Nắp: bản lề ở cạnh sau, mở 0 → 100° */}
        <group ref={lidRef} position={[0, H, -B / 2]}>
          <mesh position={[0, BOARD / 2, B / 2]} castShadow material={[orangeMat, orangeMat, lidTopMat, liningMat, orangeMat, orangeMat]}>
            <boxGeometry args={[B, BOARD, B]} />
          </mesh>
          {/* Gờ gài phía trước: bọc ngoài thành trước, có lưỡi gài nửa tròn và hai răng gài nhọn */}
          <mesh position={[0, -SK / 2, B + BOARD / 2]} castShadow material={orangeMat}>
            <boxGeometry args={[B - 2 * IN, SK, BOARD]} />
          </mesh>
          <mesh position={[0, -SK, B]} castShadow material={orangeMat} geometry={tabGeo} />
          <mesh position={[-(TAB_R + 0.035), -SK, B]} castShadow material={orangeMat} geometry={hookGeo} />
          <mesh position={[TAB_R - 0.035, -SK, B]} castShadow material={orangeMat} geometry={hookGeo} />

          {/* Khe gập ở bản lề và ở cạnh gấp trước */}
          <mesh position={[0, BOARD + 0.002, 0.04]} rotation={[-Math.PI / 2, 0, 0]} material={creaseMat}>
            <planeGeometry args={[B, 0.05]} />
          </mesh>
          <mesh position={[0, BOARD + 0.002, B - IN]} rotation={[-Math.PI / 2, 0, 0]} material={creaseMat}>
            <planeGeometry args={[B, 0.05]} />
          </mesh>
          {/* Lỗ nửa tròn ở mặt trong, giữa cạnh gấp trước */}
          <mesh position={[0, -0.002, B]} rotation={[Math.PI / 2, 0, 0]} material={windowMat}>
            <circleGeometry args={[0.2, 32, Math.PI, Math.PI]} />
          </mesh>
          {/* Hai cánh gài bên: nối vào mép ngoài nắp, gập xuống ngoài thành hộp, mũi nhọn ở đáy */}
          {[-1, 1].map((sg) => (
            <mesh key={sg} position={[sg * (B / 2), 0, sg > 0 ? B - IN : B - IN - EAR_W]} rotation={[0, sg * Math.PI / 2, 0]} castShadow material={orangeMat} geometry={earGeo} />
          ))}
        </group>
      </group>

      {/* Vòng: nằm trong lõm, nhấc lên và bay theo quỹ đạo 3D */}
      <group ref={ringRef} scale={S_RING}>
        <mesh geometry={ringGeo} material={[ringFront, ringBody, ringBack]} castShadow />
      </group>

      {/* Mặt bàn: cùng hệ toạ độ với hộp và vòng, nhận bóng đổ */}
      {/* Đất nền dưới cỏ */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, SOIL_Y, 0]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#2E3A1C" roughness={1} polygonOffset polygonOffsetFactor={1} polygonOffsetUnits={1} />
      </mesh>
      <GrassField />
      <ContactShadow />
      <DeskProps />
    </>
  );
}

export default function UnboxingScene({ progressRef }: { progressRef: MutableRefObject<number> }) {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 6.5, 12], fov: 30 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
      style={{ background: 'transparent' }}
    >
      <Scene progressRef={progressRef} />
    </Canvas>
  );
}