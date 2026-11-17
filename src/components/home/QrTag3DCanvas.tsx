'use client';
// src/components/home/QrTag3DCanvas.tsx
// Viên QR Tag 3D (three.js qua React Three Fiber):
//  - Thân đĩa mép bo; mặt trước và mặt sau là mặt phẳng riêng, không bị lõm
//  - Ánh sáng và phản chiếu từ môi trường PBR (RoomEnvironment), không tải file ngoài
//  - Đĩa xoay quanh trục đứng để lật theo tiến độ cuộn, kèm dao động nhẹ khi đứng yên

import { useEffect, useMemo, useRef, type MutableRefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

const FRONT_SRC = '/images/qr-tag-only.webp';
const R = 1;              // bán kính đĩa
const EDGE = 0.04;        // bán kính bo mép
const BODY_H = 0.058;     // nửa độ dày thân (mặt phẳng trên của thân)
const FACE_Z = BODY_H + 0.002; // mặt tag nằm sát trên thân, không trùng mặt để khỏi nhấp nháy
const FACE_R = R - EDGE;  // mặt phẳng phủ phần phẳng, phần bo là thân
const FACE_ROT = Math.PI / 2; // xoay mặt 90° ngược chiều kim đồng hồ

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

/* Thân đĩa: profile quay quanh trục Y, mép bo tròn, mặt phẳng trên/dưới ở BODY_H */
function makeBodyGeometry(): THREE.LatheGeometry {
  const pts: THREE.Vector2[] = [];
  const n = 12;
  const rimCenter = R - EDGE;
  const rimY = BODY_H - EDGE;
  pts.push(new THREE.Vector2(0, BODY_H));
  for (let i = 0; i <= n; i++) {                 // mép trên: từ mặt trên xuống thành
    const a = Math.PI / 2 - (i / n) * (Math.PI / 2);
    pts.push(new THREE.Vector2(rimCenter + EDGE * Math.cos(a), rimY + EDGE * Math.sin(a)));
  }
  for (let i = 0; i <= n; i++) {                 // mép dưới: từ thành xuống mặt dưới
    const a = -(i / n) * (Math.PI / 2);
    pts.push(new THREE.Vector2(rimCenter + EDGE * Math.cos(a), -rimY + EDGE * Math.sin(a)));
  }
  pts.push(new THREE.Vector2(0, -BODY_H));
  return new THREE.LatheGeometry(pts, 192);
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

function makeBackTexture(): THREE.CanvasTexture {
  const S = 512;
  const N = 25;
  const canvas = document.createElement('canvas');
  canvas.width = S;
  canvas.height = S;
  const g = canvas.getContext('2d')!;
  g.fillStyle = '#FFFFFF';
  g.fillRect(0, 0, S, S);

  const cell = S / (N + 6);
  const off = (S - N * cell) / 2;
  const inFinder = (x: number, y: number) => (x < 7 && y < 7) || (x >= N - 7 && y < 7) || (x < 7 && y >= N - 7);
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

  g.fillStyle = '#6B7280';
  g.font = 'bold 22px sans-serif';
  g.textAlign = 'center';
  g.fillText('PawLife · Quét để xem hồ sơ', S / 2, S - 12);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.repeat.x = -1; // nhìn từ phía sau nên lật ngang để chữ đọc đúng
  tex.offset.x = 1;
  return tex;
}

function Tag({ progressRef }: { progressRef: MutableRefObject<number> }) {
  const { gl, scene } = useThree();

  // Môi trường PBR nội bộ: cho phản chiếu và ánh sáng mềm kiểu render thật
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

  const frontTex = useMemo(() => {
    const t = new THREE.TextureLoader().load(FRONT_SRC);
    t.colorSpace = THREE.SRGBColorSpace;
    t.center.set(0.5, 0.5);
    t.rotation = FACE_ROT;
    return t;
  }, []);
  const backTex = useMemo(() => {
    const t = makeBackTexture();
    t.center.set(0.5, 0.5);
    t.rotation = FACE_ROT;
    return t;
  }, []);

  const bodyGeo = useMemo(() => makeBodyGeometry(), []);
  const faceGeo = useMemo(() => new THREE.CircleGeometry(FACE_R, 160), []);
  const bodyMat = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: '#FFFFFF', roughness: 0.38, clearcoat: 0.3, clearcoatRoughness: 0.3, envMapIntensity: 0.9, side: THREE.FrontSide }),
    [],
  );
  const frontMat = useMemo(
    () => new THREE.MeshPhysicalMaterial({ map: frontTex, roughness: 0.38, clearcoat: 0.3, clearcoatRoughness: 0.3, envMapIntensity: 0.9, side: THREE.FrontSide }),
    [frontTex],
  );
  const backMat = useMemo(
    () => new THREE.MeshPhysicalMaterial({ map: backTex, roughness: 0.38, clearcoat: 0.3, clearcoatRoughness: 0.3, envMapIntensity: 0.9, side: THREE.FrontSide }),
    [backTex],
  );

  const spin = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (spin.current) spin.current.rotation.y = spinAt(progressRef.current) + Math.sin(clock.elapsedTime * 0.9) * 0.08;
  });

  return (
    <group ref={spin}>
      <mesh geometry={bodyGeo} rotation={[Math.PI / 2, 0, 0]} material={bodyMat} />
      <mesh geometry={faceGeo} position={[0, 0, FACE_Z]} material={frontMat} />
      <mesh geometry={faceGeo} position={[0, 0, -FACE_Z]} rotation={[0, Math.PI, 0]} material={backMat} />
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
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 4, 6]} intensity={1.4} />
      <directionalLight position={[-4, -2, 4]} intensity={0.5} color="#FFF4EA" />
      <Tag progressRef={progressRef} />
    </Canvas>
  );
}
