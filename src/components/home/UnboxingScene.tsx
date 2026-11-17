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

/* Tai ghim: tấm bìa có mũi nhọn ở đáy, dựng trong mặt YZ, dày 2 mm */
const earShape = new THREE.Shape();
earShape.moveTo(0, 0);
earShape.lineTo(EAR_W, 0);
earShape.lineTo(EAR_W, -H * 0.8);
earShape.lineTo(EAR_W / 2, -H);
earShape.lineTo(0, -H * 0.8);
earShape.closePath();
const earGeo = new THREE.ExtrudeGeometry(earShape, { depth: BOARD, bevelEnabled: false });

/* Quỹ đạo vòng: X nhân với hệ số theo khung hình (màn hẹp thì thu lại) */
const RING_X: Key[] = [[0, 0], [0.12, 0], [0.26, 0], [0.36, -1.2], [0.52, -1.4], [0.64, -0.2], [0.72, 1.2], [0.8, 1.4], [0.9, 0], [1, 0]];
const RING_Y: Key[] = [[0, RING_REST_Y], [0.12, RING_REST_Y], [0.26, 0.6], [0.36, 1.6], [0.52, 1.0], [0.64, 1.5], [0.72, 1.0], [0.8, 1.2], [0.9, 2.0], [1, 2.0]];
const RING_Z: Key[] = [[0, 0], [0.12, 0], [0.26, 0.2], [0.36, 1.4], [0.52, 2.2], [0.64, 1.6], [0.72, 2.4], [0.8, 2.0], [0.9, 1.0], [1, 1.0]];
// Nghiêng: từ nằm phẳng (-π/2) đến mặt hướng camera
const RING_RX: Key[] = [[0, -Math.PI / 2], [0.26, -0.9], [0.36, -0.3], [0.5, -0.3], [1, -0.3]];
// Nắp: 0 → 100°
const LID: Key[] = [[0, 0], [0.03, 0], [0.2, 1.92], [1, 1.92]];
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

/* Mặt bàn gỗ: nền nâu sáng, vân dài uốn nhẹ theo chiều ngang, vài đốm tối */
function makeWoodTexture(): THREE.CanvasTexture {
  const S = 2048;
  const canvas = document.createElement('canvas');
  canvas.width = S;
  canvas.height = S;
  const g = canvas.getContext('2d')!;
  const grad = g.createLinearGradient(0, 0, 0, S);
  grad.addColorStop(0, '#C7A987');
  grad.addColorStop(0.5, '#BE9C79');
  grad.addColorStop(1, '#C4A482');
  g.fillStyle = grad;
  g.fillRect(0, 0, S, S);
  let seed = 17;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  // vân dọc theo trục X: nhiều đường mảnh, độ đậm khác nhau
  for (let k = 0; k < 900; k++) {
    const y0 = rnd() * S;
    const amp = 2 + rnd() * 10;
    const ph = rnd() * Math.PI * 2;
    const dark = rnd() < 0.6;
    g.strokeStyle = dark ? `rgba(92,62,38,${0.05 + rnd() * 0.12})` : `rgba(240,220,190,${0.04 + rnd() * 0.08})`;
    g.lineWidth = 0.6 + rnd() * 2.2;
    g.beginPath();
    for (let x = 0; x <= S; x += 32) {
      const y = y0 + Math.sin(x / 380 + ph) * amp + Math.sin(x / 90 + ph * 2) * (amp * 0.2);
      if (x === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.stroke();
  }
  // vài đốm sẫm nhỏ như vết gỗ tự nhiên
  for (let k = 0; k < 40; k++) {
    g.fillStyle = `rgba(80,52,30,${0.04 + rnd() * 0.05})`;
    g.beginPath();
    g.ellipse(rnd() * S, rnd() * S, 30 + rnd() * 90, 4 + rnd() * 8, 0, 0, Math.PI * 2);
    g.fill();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2.2, 2.2);
  return tex;
}

/* Đồ trang trí nhỏ đặt ở rìa bàn: cốc gốm và viên đá, không chắn hộp */
function DeskProps() {
  const cupGeo = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    const R = 0.42, Hh = 0.8, wall = 0.04;
    pts.push(new THREE.Vector2(0, 0));
    pts.push(new THREE.Vector2(R - 0.08, 0));
    pts.push(new THREE.Vector2(R, Hh));
    pts.push(new THREE.Vector2(R - wall, Hh));
    pts.push(new THREE.Vector2(R - wall - 0.04, 0.06));
    pts.push(new THREE.Vector2(0, 0.06));
    return new THREE.LatheGeometry(pts, 64);
  }, []);
  const cupMat = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: '#E8E0D3', roughness: 0.55, clearcoat: 0.25, clearcoatRoughness: 0.35, side: THREE.DoubleSide }),
    [],
  );
  const stoneMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#8E8377', roughness: 0.95 }), []);
  return (
    <>
      <mesh geometry={cupGeo} material={cupMat} position={[4.7, 0, -2.6]} castShadow receiveShadow />
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
    gl.toneMappingExposure = 1.0;
    return () => {
      scene.environment = null;
      scene.fog = null;
      gl.toneMapping = THREE.NoToneMapping;
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);

  const woodTex = useMemo(() => makeWoodTexture(), []);
  const woodMat = useMemo(() => new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.72 }), [woodTex]);

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
    if (lidRef.current) lidRef.current.rotation.x = -evalCurve(LID, t);


    state.camera.position.set(0, evalCurve(CAM_Y, t), evalCurve(CAM_Z, t));
    state.camera.lookAt(0, 0.4, 0);
  });

  return (
    <>
      <ambientLight intensity={0.22} />
      <hemisphereLight args={['#FFFFFF', '#8A6E58', 0.2]} />
      {/* Ánh sáng chiều từ phía trên bên phải: tạo vùng sáng và vùng bóng rõ trên mặt trước */}
      <directionalLight
        position={[5, 7, 3]}
        intensity={1.9}
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
          {/* Hai tai ghim: nối vào mép ngoài nắp, gập xuống ngoài thành hộp, mũi nhọn ở đáy */}
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
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -BOARD - 0.002, 0]} receiveShadow material={woodMat}>
        <planeGeometry args={[80, 80]} />
      </mesh>
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
