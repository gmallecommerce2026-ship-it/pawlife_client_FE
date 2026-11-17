'use client';
// src/components/home/UnboxingScene.tsx
// Cảnh 3D duy nhất: hộp và vòng cùng nằm trong một không gian three.js.
//  - Hộp: đáy có lõm tròn vừa khít vòng, bốn thành 2 mm, nắp có bản lề, khe gập, hai tai ghim, chữ và logo
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
const EAR_W = 0.55;        // rộng tai ghim (~1.1 cm)
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

/* Quỹ đạo vòng: X nhân với hệ số theo khung hình (màn hẹp thì thu lại) */
const RING_X: Key[] = [[0, 0], [0.12, 0], [0.26, 0], [0.36, -1.2], [0.52, -1.4], [0.64, -0.2], [0.72, 1.2], [0.8, 1.4], [0.9, 0], [1, 0]];
const RING_Y: Key[] = [[0, RING_REST_Y], [0.12, RING_REST_Y], [0.26, 0.6], [0.36, 1.6], [0.52, 1.0], [0.64, 1.5], [0.72, 1.0], [0.8, 1.2], [0.9, 2.0], [1, 2.0]];
const RING_Z: Key[] = [[0, 0], [0.12, 0], [0.26, 0.2], [0.36, 1.4], [0.52, 2.2], [0.64, 1.6], [0.72, 2.4], [0.8, 2.0], [0.9, 1.0], [1, 1.0]];
// Nghiêng: từ nằm phẳng (-π/2) đến mặt hướng camera
const RING_RX: Key[] = [[0, -Math.PI / 2], [0.26, -0.9], [0.36, -0.3], [0.5, -0.3], [1, -0.3]];
// Nắp: 0 → 100°
const LID: Key[] = [[0, 0], [0.03, 0], [0.2, 1.745], [1, 1.745]];
// Hộp mờ dần khi vòng đã bay lên
const BOX_FADE: Key[] = [[0, 1], [0.3, 1], [0.4, 0], [1, 0]];
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
    return () => {
      scene.environment = null;
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);

  /* Vật liệu hộp */
  const lidTex = useMemo(() => makeLidTexture(), []);
  const orangeMat = useMemo(() => new THREE.MeshStandardMaterial({ color: ORANGE, roughness: 0.65, transparent: true }), []);
  const liningMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#FFFDF9', roughness: 0.8, transparent: true }), []);
  const lidTopMat = useMemo(() => new THREE.MeshStandardMaterial({ map: lidTex, roughness: 0.65, transparent: true }), [lidTex]);
  const recessMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#E6D9CA', roughness: 0.9, transparent: true }), []);
  const creaseMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#7A3E12', transparent: true, opacity: 0.35 }), []);
  const windowMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.2, transparent: true, opacity: 0.6 }), []);
  const boxMats = useMemo(
    () => [orangeMat, liningMat, lidTopMat, recessMat, creaseMat, windowMat],
    [orangeMat, liningMat, lidTopMat, recessMat, creaseMat, windowMat],
  );

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
  const enamel = { roughness: 0.38, roughnessMap: grain, bumpMap: grain, bumpScale: 0.4, clearcoat: 0.7, clearcoatRoughness: 0.06, ior: 1.5, specularIntensity: 0.6, envMapIntensity: 0.8 };
  const ringBody = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#FFFFFF', ...enamel, side: THREE.DoubleSide }), [grain]);
  const ringFront = useMemo(() => new THREE.MeshPhysicalMaterial({ map: frontTex, ...enamel, side: THREE.DoubleSide }), [frontTex, grain]);
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
    if (lidRef.current) lidRef.current.rotation.x = -evalCurve(LID, t);

    const op = evalCurve(BOX_FADE, t);
    for (const m of boxMats) m.opacity = m === creaseMat ? 0.35 * op : m === windowMat ? 0.6 * op : op;
    if (boxRef.current) boxRef.current.visible = op > 0.01;

    state.camera.position.set(0, evalCurve(CAM_Y, t), evalCurve(CAM_Z, t));
    state.camera.lookAt(0, 0.4, 0);
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <hemisphereLight args={['#FFFFFF', '#8A6E58', 0.45]} />
      <directionalLight
        position={[3, 6, 5]}
        intensity={1.4}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
      />

      {/* Hộp: đáy, bốn thành, lõm tròn, nắp */}
      <group ref={boxRef}>
        <mesh position={[0, -BOARD / 2, 0]} castShadow receiveShadow material={[orangeMat, orangeMat, liningMat, orangeMat, orangeMat, orangeMat]}>
          <boxGeometry args={[B, BOARD, B]} />
        </mesh>
        <mesh position={[0, H / 2, B / 2 - BOARD / 2]} castShadow material={orangeMat}>
          <boxGeometry args={[B, H, BOARD]} />
        </mesh>
        <mesh position={[0, H / 2, -B / 2 + BOARD / 2]} castShadow material={orangeMat}>
          <boxGeometry args={[B, H, BOARD]} />
        </mesh>
        <mesh position={[-(B / 2 - BOARD / 2), H / 2, 0]} castShadow material={orangeMat}>
          <boxGeometry args={[BOARD, H, B - 2 * BOARD]} />
        </mesh>
        <mesh position={[B / 2 - BOARD / 2, H / 2, 0]} castShadow material={orangeMat}>
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
          {/* Hai tai ghim: nối vào đầu cạnh gấp trước, hạ xuống theo chiều cao hộp */}
          {[-1, 1].map((sg) => (
            <mesh key={sg} position={[sg * (B / 2 - IN + EAR_W / 2), -H / 2, B - IN - BOARD / 2]} castShadow material={orangeMat}>
              <boxGeometry args={[EAR_W, H, BOARD]} />
            </mesh>
          ))}
        </group>
      </group>

      {/* Vòng: nằm trong lõm, nhấc lên và bay theo quỹ đạo 3D */}
      <group ref={ringRef} scale={S_RING}>
        <mesh geometry={ringGeo} material={[ringFront, ringBody, ringBack]} castShadow />
      </group>

      {/* Bóng đổ nhẹ trên nền */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -BOARD - 0.002, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <shadowMaterial opacity={0.18} />
      </mesh>
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
