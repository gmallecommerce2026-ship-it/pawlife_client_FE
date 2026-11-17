'use client';
// src/components/home/QrTag3DCanvas.tsx
// Viên QR Tag 3D dựng bằng code (three.js qua React Three Fiber):
//  - Đĩa tròn có độ dày, mặt trước là logo (ảnh tag gốc), mặt sau là mã QR vẽ bằng code
//  - Vòng khoá kim loại ở đỉnh, nối với đĩa bằng một đoạn ngắn
//  - Đĩa tự xoay quanh trục đứng (lật trước/sau) và đung đưa như con lắc quanh điểm treo
//  - Góc xoay theo tiến độ cuộn (progressRef), kèm dao động nhỏ khi đứng yên

import { useMemo, useRef, type MutableRefObject } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const FRONT_SRC = '/images/qr-tag-only.webp';
const RADIUS = 1;
const THICKNESS = 0.12;
const RING_Y = 1.28;      // tâm vòng khoá (phía trên đĩa)
const PIVOT_Y = 1.45;     // điểm treo: đỉnh vòng khoá

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

/* Bộ sinh số giả ngẫu nhiên có hạt giống: mã QR không đổi giữa các lần tải */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* Mặt sau: mã QR mô phỏng (3 mẫu định vị + ô ngẫu nhiên). Thay bằng mã thật khi có dữ liệu. */
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

  g.fillStyle = '#6B7280';
  g.font = 'bold 22px sans-serif';
  g.textAlign = 'center';
  g.fillText('PawLife · Quét để xem hồ sơ', S / 2, S - 12);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  // Mặt đáy của đĩa nhìn từ phía sau nên bị ngược: lật ngang để chữ đọc đúng
  tex.wrapS = THREE.RepeatWrapping;
  tex.repeat.x = -1;
  tex.offset.x = 1;
  return tex;
}

function Tag({ progressRef }: { progressRef: MutableRefObject<number> }) {
  const frontTex = useMemo(() => {
    const t = new THREE.TextureLoader().load(FRONT_SRC);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  const backTex = useMemo(() => makeBackTexture(), []);

  const geometry = useMemo(() => new THREE.CylinderGeometry(RADIUS, RADIUS, THICKNESS, 128, 1), []);
  const sideMat = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: '#F4F4F5', roughness: 0.35, clearcoat: 1, clearcoatRoughness: 0.1 }),
    [],
  );
  const frontMat = useMemo(
    () => new THREE.MeshPhysicalMaterial({ map: frontTex, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.08 }),
    [frontTex],
  );
  const backMat = useMemo(
    () => new THREE.MeshPhysicalMaterial({ map: backTex, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.1 }),
    [backTex],
  );
  const metalMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#C9CED6', metalness: 0.9, roughness: 0.25 }),
    [],
  );

  const pivot = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (spin.current) spin.current.rotation.y = spinAt(progressRef.current) + Math.sin(t * 0.9) * 0.1;
    if (pivot.current) pivot.current.rotation.z = Math.sin(t * 1.3) * 0.1 + Math.sin(t * 0.5) * 0.03;
  });

  return (
    // Điểm treo ở đỉnh vòng khoá: con lắc đung đưa quanh đây
    <group ref={pivot} position={[0, PIVOT_Y, 0]}>
      <group position={[0, -PIVOT_Y, 0]}>
        {/* Trục xoay đi qua tâm đĩa và vòng khoá */}
        <group ref={spin}>
          {/* Đĩa: nắp trên = mặt trước, nắp dưới = mặt sau, thân = viền */}
          <mesh geometry={geometry} rotation={[Math.PI / 2, 0, 0]} material={[sideMat, frontMat, backMat]} />

          {/* Vòng khoá + đoạn nối với đĩa */}
          <mesh position={[0, RING_Y, 0]} material={metalMat}>
            <torusGeometry args={[0.17, 0.03, 16, 48]} />
          </mesh>
          <mesh position={[0, RING_Y - 0.22, 0]} material={metalMat}>
            <cylinderGeometry args={[0.025, 0.025, 0.14, 12]} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

export default function QrTag3DCanvas({ progressRef }: { progressRef: MutableRefObject<number> }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 28 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 4, 5]} intensity={1.6} />
      <directionalLight position={[-4, -2, 3]} intensity={0.5} color="#FFE8D2" />
      <Tag progressRef={progressRef} />
    </Canvas>
  );
}
