'use client';
// src/components/home/UnboxingScene.tsx
// Cảnh 3D duy nhất: hộp và vòng cùng nằm trong một không gian three.js.
//  - Hộp: đáy có lõm tròn vừa khít vòng, bốn thành 2 mm, nắp có bản lề, khe gập, gờ trước cao ~1 cm có khuyết nửa tròn, hai gờ bên, hai tam giác gài ở hai đầu gờ trước, chữ và logo
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
import { RING_RADIUS } from './ringConfig';

const FRONT_SRC = '/images/qr-tag-only.png';
const RING_LOGO = '/images/qr-tag-only.png';

/* Kích thước thế giới: hộp 8 cm = 4 đơn vị → 1 cm = 0.5 đơn vị */
const B = 4;               // cạnh hộp
const H = 0.5;             // chiều cao thành (1 cm)
const BOARD = 0.06;        // độ dày đáy hộp (~1.2 mm)
const WALL = 0.045;        // độ dày thành khay (~0.9 mm)
const LID_T = 0.05;        // độ dày tấm nắp (~1 mm)
const PAPER = 0.035;       // độ dày gờ gài và cánh gài (~0.7 mm): giấy mỏng, không còn khối Lego
const SKIRT_OPEN_DEG = 83; // góc mở thẳng gờ trước ra phía trước, sau khi nắp đã nhấc khỏi mép thành (độ, chỉnh trong khoảng 80–85)
const SKIRT_OPEN = THREE.MathUtils.degToRad(SKIRT_OPEN_DEG);
const TRI_OUT = 0.35;      // góc hai tam giác nở ra ngoài một chút sau khi đã rời chỗ gài (rad, ~20°)
const S_RING = 0.6875;     // đĩa đường kính 2.75 cm → 1.375 đơn vị
const RING_REST_Y = HALF_THICK * S_RING + 0.003;
const ORANGE = '#FFCA81';  // màu hộp (dùng chung cho thân hộp và nền texture nắp)

/* ===== UX trên mobile (thiết bị cảm ứng) — PC giữ nguyên hành vi cũ ===== */
const DAMP_DESKTOP = 4;        // độ bám tiến độ cuộn trên PC (giữ nguyên)
const DAMP_TOUCH = 8;          // mobile: hero đã có useSpring làm mượt, damp thêm tay nữa sẽ trễ gấp đôi nên tăng độ bám
const MAX_DT_TOUCH = 1 / 20;   // mobile: chặn bước thời gian khi khung hình bị khựng, tránh tiến độ nhảy một cú lớn (giật cục)
const DPR_MAX_TOUCH = 1.5;     // mobile: giới hạn độ phân giải render (máy 3x không cần vẽ 4 lần số điểm ảnh) → bớt tụt khung hình
const CLOSED_EPS = 0.0003;     // ngưỡng coi là "hộp đã đóng hẳn" (nắp, gờ trước, hai tam giác về đúng chỗ gài)

/* Thiết bị cảm ứng (điện thoại/máy tính bảng, kể cả chế độ giả lập mobile của DevTools) */
function isTouchDevice(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(pointer: coarse)').matches;
}

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

/* Gờ trước của nắp: tấm giấy mỏng cao gần bằng thành hộp (~1 cm), phủ NGOÀI thành trước.
   Giữa mép dưới gờ có khuyết nửa tròn CẮT VÀO gờ (không có lưỡi nhô ra); thành trước phía giữa phẳng, không có khe cho phần tròn.
   Hai đầu gờ có hai tam giác giấy gập 90° ra phía sau, cắm qua hai khe ở hai đầu thành trước vào trong hộp, nép mặt trong thành bên.
   Mở nắp: gờ mở thẳng ra phía trước (~83°) kéo hai tam giác tuột khỏi khe → rồi nắp mới lật lên.
   Hai gờ bên (bên dưới) thì nằm trong hộp, giữa tấm lót và thành bên. */
const SK = H - 0.02;       // cao gờ (~0.96 cm): gần bằng chiều cao thành hộp
const NOTCH_R = 0.2;       // bán kính khuyết nửa tròn (đường kính ~0.8 cm)
const TRI_L = 0.4;         // chiều dài tam giác gài (~0.8 cm)
const TRI_X = B / 2 - WALL - PAPER - 0.012; // vị trí gập của tam giác: ngay sát mặt trong thành bên
const SLOT_A = TRI_X - 0.005;               // mép trong của khe ở thành trước (phía giữa)
const SLOT_B = TRI_X + PAPER + 0.005;       // mép ngoài của khe (phía đầu thành)
const skirtShape = new THREE.Shape();
skirtShape.moveTo(-TRI_X, LID_T);
skirtShape.lineTo(TRI_X, LID_T);
skirtShape.lineTo(TRI_X, -SK);
skirtShape.lineTo(NOTCH_R, -SK);
skirtShape.absarc(0, -SK, NOTCH_R, 0, Math.PI, false); // nửa tròn khuyết lên phía trên, lõm vào gờ
skirtShape.lineTo(-TRI_X, -SK);
skirtShape.closePath();
const skirtGeo = new THREE.ExtrudeGeometry(skirtShape, { depth: PAPER, bevelEnabled: false });
/* Tam giác gài: cạnh đứng dính cả chiều cao đầu gờ, mũi nhọn hướng lên, dựng trong mặt XY (trục +x là hướng mũi khi mở phẳng) */
const triShape = new THREE.Shape();
triShape.moveTo(0, -SK);
triShape.lineTo(TRI_L * 0.75, -SK);        // đáy dài hơn, lấp khe phía dưới
triShape.lineTo(TRI_L, -SK * 0.45);        // vát chéo ở đầu cho giống tab gài
triShape.lineTo(TRI_L, 0);
triShape.lineTo(0, 0);
triShape.closePath();
const triGeo = new THREE.ExtrudeGeometry(triShape, { depth: PAPER, bevelEnabled: false });

/* Hai gờ bên: giấy mỏng cao bằng gờ trước, treo từ mép trái/phải của nắp, gài vào BÊN TRONG thành bên (giữa thành và tấm lót).
   Dài gần hết cạnh bên, chừa chỗ phía trước cho hai tam giác của gờ trước; hai đầu dưới bo tròn.
   Dựng trong mặt XY của shape (x shape = dọc theo hộp, y = chiều cao), xoay -90° quanh y khi đặt để thành tấm trong mặt YZ. */
const XS = B / 2 - WALL - 0.01;            // mép ngoài của gờ bên: sát mặt trong thành bên (khe 0.2 mm)
const SIDE_Z0 = 0.25;                      // đầu sau của gờ bên (tránh thành sau)
const SIDE_Z1 = B - TRI_L - 0.03;          // đầu trước: dừng trước chỗ hai tam giác của gờ trước
const SIDE_R = 0.12;                       // bo tròn hai góc dưới
const SIDE_OUT = 0.2;                      // góc hai gờ bên nở ra ngoài một chút khi nắp đã lật cao (rad, ~11°)
const sideShape = new THREE.Shape();
sideShape.moveTo(SIDE_Z0, 0);
sideShape.lineTo(SIDE_Z1, 0);
sideShape.lineTo(SIDE_Z1, -SK + SIDE_R);
sideShape.quadraticCurveTo(SIDE_Z1, -SK, SIDE_Z1 - SIDE_R, -SK);
sideShape.lineTo(SIDE_Z0 + SIDE_R, -SK);
sideShape.quadraticCurveTo(SIDE_Z0, -SK, SIDE_Z0, -SK + SIDE_R);
sideShape.closePath();
const sideGeo = new THREE.ExtrudeGeometry(sideShape, { depth: PAPER, bevelEnabled: false });

/* Tấm lót trắng: đặt vừa khít trong lòng hộp, dày 0.5 cm = nửa chiều cao hộp, giữa có lỗ tròn đặt QR tag.
   Cách thành bên đúng bằng bề dày giấy + khe nhỏ để hai gờ bên (và hai tam giác) lọt vào giữa tấm lót và thành;
   phía trước và phía sau sát thành. */
const INSERT_T = H / 2;                 // dày 0.5 cm
const INSERT_X = XS - PAPER - 0.005;    // nửa bề ngang tấm lót: mép ngoài sát mặt trong của gờ bên (x ≥ 1.91)
const INSERT_BACK = B / 2 - WALL;       // mép sau: sát mặt trong thành sau
const INSERT_FRONT = B / 2 - WALL;      // mép trước: sát mặt trong thành trước (gờ trước nằm ngoài thành)
const R_HOLE = S_RING * 1.04;           // bán kính lỗ đặt tag
const TEETH_N = 28;                     // số răng tam giác quanh lỗ
const TEETH_DEPTH = 0.19;               // dài răng
const TEETH_LEAN = 0.02;                // răng chúm nhẹ vào tâm lỗ
const TEETH_R = R_HOLE - 0.012;         // bán kính chân răng (cách vách lỗ một chút, vẫn rộng hơn tag)
const TEETH_TIP = 0.35;                 // bề rộng đầu dẹt so với chân răng (0 = tam giác nhọn, 1 = hình chữ nhật); 0.35 → hình thang cân cao, mũi bị cắt phẳng
const insertShape = new THREE.Shape();
// y của shape = -z thế giới (do xoay -90° quanh x): mép trước z = INSERT_FRONT ↔ y = -INSERT_FRONT; mép sau z = -INSERT_BACK ↔ y = +INSERT_BACK
insertShape.moveTo(-INSERT_X, -INSERT_FRONT);
insertShape.lineTo(INSERT_X, -INSERT_FRONT);
insertShape.lineTo(INSERT_X, INSERT_BACK);
insertShape.lineTo(-INSERT_X, INSERT_BACK);
insertShape.closePath();
const holePath = new THREE.Path();
holePath.absarc(0, 0, R_HOLE, 0, Math.PI * 2, true);
insertShape.holes.push(holePath);
const insertGeo = new THREE.ExtrudeGeometry(insertShape, { depth: INSERT_T, bevelEnabled: false, curveSegments: 64 });
/* Hàng răng hình thang cân bao quanh lỗ: chân răng (cạnh rộng) ở miệng lỗ, đầu dẹt (cạnh hẹp, như mũi nhọn bị cắt ngang) hướng xuống đáy hộp.
   Mỗi răng gồm 2 tam giác ghép thành một hình thang: A,B là hai đỉnh chân; C,D là hai đỉnh đầu dẹt */
function makeTeethGeometry(): THREE.BufferGeometry {
  const pos: number[] = [];
  const yTop = INSERT_T - 0.004;
  const yTip = yTop - TEETH_DEPTH;
  const step = (Math.PI * 2) / TEETH_N;
  for (let k = 0; k < TEETH_N; k++) {
    const a0 = k * step + step * 0.09;       // góc hai đỉnh chân răng
    const a1 = (k + 1) * step - step * 0.09;
    const am = (a0 + a1) / 2;
    const half = ((a1 - a0) / 2) * TEETH_TIP; // nửa bề rộng (theo góc) của đầu dẹt, đối xứng quanh trục răng
    const b0 = am - half;                     // góc hai đỉnh đầu dẹt
    const b1 = am + half;
    const rt = TEETH_R - TEETH_LEAN;          // đầu dẹt chúm nhẹ vào tâm lỗ như cũ
    const ax = TEETH_R * Math.cos(a0), az = TEETH_R * Math.sin(a0);
    const bx = TEETH_R * Math.cos(a1), bz = TEETH_R * Math.sin(a1);
    const cx = rt * Math.cos(b1), cz = rt * Math.sin(b1);
    const dx = rt * Math.cos(b0), dz = rt * Math.sin(b0);
    pos.push(
      ax, yTop, az,  bx, yTop, bz,  cx, yTip, cz, // tam giác A-B-C (cùng chiều quấn với răng cũ)
      ax, yTop, az,  cx, yTip, cz,  dx, yTip, dz, // tam giác A-C-D
    );
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return g;
}

/* Quỹ đạo vòng: X nhân với hệ số theo khung hình (màn hẹp thì thu lại) */
const RING_X: Key[] = [[0, 0], [0.12, 0], [0.26, 0], [0.36, -1.2], [0.52, -1.4], [0.64, -0.2], [0.72, 1.2], [0.8, 1.4], [0.9, 0], [1, 0]];
const RING_Y: Key[] = [[0, RING_REST_Y], [0.12, RING_REST_Y], [0.26, 0.6], [0.36, 1.6], [0.52, 1.0], [0.64, 1.5], [0.72, 1.0], [0.8, 1.2], [0.9, 2.0], [1, 2.0]];
const RING_Z: Key[] = [[0, 0], [0.12, 0], [0.26, 0.2], [0.36, 1.4], [0.52, 2.2], [0.64, 1.6], [0.72, 2.4], [0.8, 2.0], [0.9, 1.0], [1, 1.0]];
// Nghiêng: từ nằm phẳng (-π/2) đến mặt hướng camera
const RING_RX: Key[] = [[0, -Math.PI / 2], [0.26, -0.9], [0.36, -0.3], [0.5, -0.3], [1, -0.3]];
// Nắp (theo video mẫu): 1) gờ trước mở thẳng ra (t < 0.03) rồi nắp mới nhấc nhẹ ~10°, 2) lật nhanh lên, lố tới ~112° rồi hồi về ~109°
const LID: Key[] = [[0, 0], [0.03, 0], [0.07, 0.14], [0.1, 0.18], [0.21, 1.84], [0.28, 1.95], [0.38, 1.9], [1, 1.9]];
// Gờ trước (0 → 1): mở thẳng ra phía trước trước tiên, xong hẳn khi nắp bắt đầu lật (t ≈ 0.03) để hai tam giác tuột khỏi khe.
// Đóng lại thì ngược lại: nắp hạ phẳng, gờ gập xuống cuối cùng để hai tam giác cắm vào khe
const SKIRT: Key[] = [[0, 0], [0.028, 1], [0.04, 1], [1, 1]];
// Camera: lùi nhẹ rồi tiến về vòng ở giữa hành trình (dolly)
const CAM_Y: Key[] = [[0, 6.5], [0.5, 5.4], [1, 6.5]];
const CAM_Z: Key[] = [[0, 12], [0.5, 9.5], [1, 12]];
const LOOK_Y = 0.4;        // camera nhìn vào điểm (0, LOOK_Y, 0)

/* ===== Camera của điện thoại (cảnh thứ hai trong màn hình iPhone) ===== */
const PHONE_T = 0.82;                       // trạng thái cảnh: hộp đã mở, tag lộ mặt sau (= SCENE_T bên ScrollUnboxingHero)
const PHONE_RING: [number, number, number] = [0, 1.3, 2.4]; // tag "được cầm" trước hộp
const PHONE_DIR = new THREE.Vector3(0, 0.55, 0.83).normalize(); // hướng từ tag tới camera (nhìn chếch xuống)
const PHONE_DIST = 5.0;                     // khoảng cách khi đã lấy nét (nhỏ hơn → tag to hơn trong khung)
const PHONE_DIST_FAR = 8.5;                 // khoảng cách lúc mới bật camera
const PHONE_SPIN = 0;                       // nếu màn hình thấy MẶT TRƯỚC của tag thay vì mặt có QR, đổi thành Math.PI
/* Màn hình dọc/hẹp (điện thoại): camera tự lùi ra để luôn thấy cỏ bị hộp đè ở hai bên trái/phải.
   SIDE_NEED = nửa bề ngang (đơn vị thế giới) cần nhìn thấy tại mép TRƯỚC của hộp; hộp rộng 4 (nửa = 2) nên 3.1 chừa ~1.1 đơn vị cỏ mỗi bên.
   Tăng số này → camera xa hơn, hộp nhỏ hơn, thấy nhiều cỏ hơn. Màn hình ngang/PC cần ít hơn khoảng cách gốc nên không bị ảnh hưởng. */
const SIDE_NEED = 3.1;
const FRONT_OFFSET = 1.8;  // mép trước hộp gần camera hơn tâm hộp ~1.8 đơn vị theo trục nhìn

/* Làm sạch ảnh mặt trước khi nạp.
   Khe ghim giờ là lỗ xuyên thật trong hình học (rộng ~0.1 cm), nên mọi vệt "khe" có sẵn trong ảnh gốc đều thừa.
   Ảnh gốc có thể có khe vẽ đen hoặc vùng trong suốt (RGB = 0 → hiện đen khi bỏ qua alpha); trước kia lỗ 3D rộng hơn nên che mất,
   thu hẹp lỗ lại thì phần đó lộ ra thành vệt đen dưới khe. Cách xử lý:
   1) lót nền trắng dưới ảnh → vùng trong suốt thành trắng thay vì đen;
   2) trong dải phía dưới khe (trên mặt trước), điểm nào còn tối thì thay bằng màu lấy từ cùng góc nhưng sâu vào trong đĩa (nền trắng của tag).
   Chỉ động tới điểm TỐI trong dải đó nên logo cam và phần còn lại của ảnh không bị ảnh hưởng. */
const FRONT_FIX_R0 = 0.62;        // bán kính trong của dải kiểm tra (đơn vị tag, 1 = mép đĩa)
const FRONT_FIX_R1 = 0.84;        // bán kính ngoài: mặt trước chỉ phủ tới r ≈ 0.84, ngoài đó là mép bo (không dùng ảnh)
const FRONT_FIX_SPAN = 0.45;      // nửa bề rộng góc của dải quanh đỉnh đĩa (rad)
const FRONT_FIX_SRC_R = 0.58;     // lấy màu nền ở bán kính này (trong đĩa, đã chắc là nền trắng)
const FRONT_FIX_DARK = 100;       // điểm có kênh sáng nhất < ngưỡng này (0–255) coi là vệt tối cần xoá
function cleanFrontImage(img: HTMLImageElement): HTMLCanvasElement {
  const W = img.naturalWidth || img.width;
  const H = img.naturalHeight || img.height;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const g = canvas.getContext('2d', { willReadFrequently: true })!;
  g.fillStyle = '#FFFFFF';
  g.fillRect(0, 0, W, H);
  g.imageSmoothingQuality = 'high';
  g.drawImage(img, 0, 0, W, H);

  // Chỉ đọc phần trên của ảnh (đỉnh đĩa, nơi có khe): hàng 0 → ~40% chiều cao
  const R = RING_RADIUS;
  const rows = Math.min(H, Math.ceil(H * 0.4));
  const data = g.getImageData(0, 0, W, rows);
  const d = data.data;
  const px = (x: number) => Math.min(W - 1, Math.max(0, Math.floor((x / (2 * R) + 0.5) * W)));
  const py = (y: number) => Math.min(rows - 1, Math.max(0, Math.floor((0.5 - y / (2 * R)) * H)));
  for (let j = 0; j < rows; j++) {
    const y = (0.5 - (j + 0.5) / H) * 2 * R;
    for (let i = 0; i < W; i++) {
      const o = (j * W + i) * 4;
      if (Math.max(d[o], d[o + 1], d[o + 2]) >= FRONT_FIX_DARK) continue; // điểm sáng: giữ nguyên
      const x = ((i + 0.5) / W - 0.5) * 2 * R;
      const r = Math.hypot(x, y);
      if (r < FRONT_FIX_R0 || r > FRONT_FIX_R1) continue;
      const a = Math.atan2(y, x);
      if (Math.abs(a - Math.PI / 2) > FRONT_FIX_SPAN) continue;
      const so = (py(FRONT_FIX_SRC_R * Math.sin(a)) * W + px(FRONT_FIX_SRC_R * Math.cos(a))) * 4;
      d[o] = d[so];
      d[o + 1] = d[so + 1];
      d[o + 2] = d[so + 2];
      d[o + 3] = 255;
    }
  }
  g.putImageData(data, 0, 0);
  return canvas;
}

/* Vị trí logo trên mặt nắp (tỉ lệ theo cạnh texture): dùng chung cho màu, bản đồ bóng, nhám và bump để chúng khớp nhau từng điểm ảnh */
const LOGO_POS = 0.33;
const LOGO_SIZE = 0.34;
const LID_ROUGH = 0.88;        // độ nhám của bìa sần (giữ như cũ)
const LOGO_ROUGH = 0.3;        // độ nhám nền dưới lớp phủ của logo (thấp = bóng hơn)
const LOGO_COAT_ROUGH = 0.06;  // độ nhám lớp phủ bóng trên logo (càng thấp phản chiếu càng rõ, khoảng 0.03–0.15)

/* Texture nắp: màu cam, chữ mảnh, logo ở giữa.
   Vẽ ở độ phân giải cao (2048; mobile 1536 cho đỡ tốn bộ nhớ) rồi bật anisotropy ở Scene → chữ và logo nét hơn, nhất là khi nhìn nghiêng.
   Toạ độ vẽ vẫn tính trên hệ 1024 (hệ số k) nên bố cục không đổi. */
function makeLidTexture(): THREE.CanvasTexture {
  const SIZE = isTouchDevice() ? 1536 : 2048;
  const k = SIZE / 1024;
  const S = 1024; // hệ toạ độ logic
  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const g = canvas.getContext('2d')!;
  g.save();
  g.scale(k, k);
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
  g.restore(); // trả về hệ điểm ảnh thật: lúc vẽ logo sau khi ảnh tải xong không bị nhân tỉ lệ lần nữa
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* Các bản đồ riêng của mặt trên nắp, để logo bóng còn phần bìa vẫn sần:
   - bump: hạt giấy như cũ nhưng PHẲNG ở chỗ logo (lớp tráng bóng thì mịn)
   - gloss: trắng ở logo, đen ở nơi khác → điều khiển lớp phủ bóng (clearcoat)
   - rough: độ nhám theo từng điểm: sần ở bìa, thấp ở logo
   Ba bản đồ này là dữ liệu (không phải màu) nên để NoColorSpace. */
type LidMaps = { bump: THREE.CanvasTexture; gloss: THREE.CanvasTexture; rough: THREE.CanvasTexture };
function makeLidMaps(): LidMaps {
  const mk = (size: number) => {
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    return c;
  };
  // bump: nhiễu hạt, mật độ ~384 điểm/đơn vị như hạt giấy cũ (1536 điểm trên 4 đơn vị)
  const BS = 1536;
  const bc = mk(BS);
  const bg = bc.getContext('2d')!;
  const img = bg.createImageData(BS, BS);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 185 + Math.floor(Math.random() * 70);
    img.data[i] = v;
    img.data[i + 1] = v;
    img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  bg.putImageData(img, 0, 0);
  // gloss: nền đen
  const GS = 1024;
  const gc = mk(GS);
  const gg = gc.getContext('2d')!;
  gg.fillStyle = '#000000';
  gg.fillRect(0, 0, GS, GS);
  // rough: nền nhám (độ nhám nằm ở kênh G, giá trị xám = độ nhám × 255)
  const rc = mk(GS);
  const rg = rc.getContext('2d')!;
  const grey = (r: number) => { const v = Math.round(r * 255); return `rgb(${v},${v},${v})`; };
  rg.fillStyle = grey(LID_ROUGH);
  rg.fillRect(0, 0, GS, GS);
  const bump = new THREE.CanvasTexture(bc);
  const gloss = new THREE.CanvasTexture(gc);
  const rough = new THREE.CanvasTexture(rc);
  return { bump, gloss, rough };
}

/* Đóng dấu hình dáng logo (theo kênh alpha của ảnh) lên các bản đồ, với màu của từng bản đồ: logo có nền trong suốt thì chỉ phần logo bóng */
function paintLogoMaps(maps: LidMaps, img: HTMLImageElement) {
  const stamp = (tex: THREE.CanvasTexture, color: string) => {
    const canvas = tex.image as HTMLCanvasElement;
    const g = canvas.getContext('2d');
    if (!g) return;
    const S = canvas.width;
    const w = Math.max(1, Math.round(S * LOGO_SIZE));
    const tmp = document.createElement('canvas');
    tmp.width = w;
    tmp.height = w;
    const tg = tmp.getContext('2d')!;
    tg.imageSmoothingQuality = 'high';
    tg.drawImage(img, 0, 0, w, w);
    tg.globalCompositeOperation = 'source-in'; // giữ hình dáng logo, thay màu
    tg.fillStyle = color;
    tg.fillRect(0, 0, w, w);
    g.drawImage(tmp, S * LOGO_POS, S * LOGO_POS, S * LOGO_SIZE, S * LOGO_SIZE);
    tex.needsUpdate = true;
  };
  stamp(maps.bump, 'rgb(220,220,220)');                                            // phẳng, mức giữa dải hạt
  stamp(maps.gloss, '#FFFFFF');                                                    // có lớp phủ bóng
  stamp(maps.rough, `rgb(${Math.round(LOGO_ROUGH * 255)},${Math.round(LOGO_ROUGH * 255)},${Math.round(LOGO_ROUGH * 255)})`); // nhám thấp
}

/* Các mức độ cao (đơn vị thế giới). Hộp nằm đè lên một lớp cỏ dày GRASS_BED:
   đáy hộp   GROUND_Y                 ≈ -0.060
   ngọn cỏ sát hộp                    ≈ -0.04 … 0   (cỏ ngả ra ngoài từ dưới mép đáy)
   bóng      GROUND_Y - 0.012
   gốc cỏ    SOIL_Y + 0.01            ≈ -0.290
   đất nền   SOIL_Y                   = -0.300 */
const GROUND_Y = -BOARD;               // đáy hộp
const GRASS_BED = 0.24;                // độ dày lớp cỏ bị hộp đè bên dưới
const SOIL_Y = GROUND_Y - GRASS_BED;   // đất nền
const SHADOW_Y = GROUND_Y - 0.012;     // bóng tiếp xúc ngay dưới đáy hộp
const GRASS_ROOT_Y = SOIL_Y + 0.01;    // gốc cỏ cắm nhẹ vào đất
const GRASS_HALF = 9;

/* Tinh chỉnh ánh sáng và không khí */
const ENV_INTENSITY = 0.75;   // độ mạnh phản xạ môi trường (0.5 tối/tương phản hơn, 1 phẳng/sáng hơn)
const EXPOSURE = 1.05;        // phơi sáng tổng
const FOG_COLOR = '#CDB39A';  // trùng DESK_BASE trong ScrollUnboxingHero.tsx
const FOG_NEAR = 22;
const FOG_FAR = 62;
const KEY_INTENSITY = 300;    // đèn chính (ấm)
const FILL_INTENSITY = 0.7;   // đèn phụ lạnh phía trước-trái, mở bóng đổ
const RIM_INTENSITY = 1.1;    // đèn viền phía sau, tách hộp khỏi nền

/* Tinh chỉnh cỏ quanh hộp */
const GRASS_COUNT = 12000;   // tổng số lá
const GRASS_PAD = 0.03;      // khe hở nhỏ giữa gốc lá và mép hộp (không lá nào mọc dưới đáy hộp)
const GRASS_RING_SHARE = 0.3;// tỉ lệ lá dồn vào dải quanh hộp để mép hộp ngập trong cỏ, không lộ đất
const GRASS_RING_W = 1.4;    // bề rộng dải quanh hộp
const GRASS_MIN_H = 0.13;    // hệ số chiều cao sát hộp (0.13 → 1.0): ngọn cỏ sát hộp ngang đáy hộp
const GRASS_RAMP = 1.6;      // khoảng cách (ngoài mép hộp) để cỏ cao lại đủ
const GRASS_CAP0 = 0.26;     // trần chiều cao ở sát hộp (phía camera) ≈ GRASS_BED + chút
const GRASS_CAPK = 0.55;     // độ dốc trần theo khoảng cách; phải < dốc tia nhìn tới chân hộp (~0.66)
const GRASS_AO = 0.4;        // độ tối của cỏ sát hộp (ambient occlusion giả), 1 = không tối
const GRASS_BOX = B / 2 + GRASS_PAD; // nửa cạnh footprint dùng trong shader

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
  const EX = B / 2 + GRASS_PAD;          // nửa cạnh vùng cấm: chỉ đúng footprint hộp (+ khe nhỏ)
  const RING = B / 2 + GRASS_RING_W;     // nửa cạnh dải quanh hộp
  let placed = 0;
  let tries = 0;
  while (placed < N && tries < N * 20) {
    tries++;
    // một phần lá dồn vào dải quanh hộp để cỏ ngập sát mép; phần còn lại rải đều cả cánh đồng
    const span = rnd() < GRASS_RING_SHARE ? RING : GRASS_HALF;
    const bx = (rnd() * 2 - 1) * span;
    const bz = (rnd() * 2 - 1) * span;
    // Loại trừ duy nhất: dưới đáy hộp (hộp đè lên cỏ, nên không cần lá ở đó)
    if (Math.abs(bx) < EX && Math.abs(bz) < EX) continue;
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
        col.push((0.12 + 0.07 * t) * shade, (0.24 + 0.2 * t) * shade, 0.05 * shade);
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

/* Cánh đồng cỏ: gió đung đưa; hộp nằm đè lên cỏ, cỏ sát hộp ngắn dần, tối hơn và ngả ra ngoài từ dưới mép đáy.
   Không có lá nào dưới đáy hộp (loại ở CPU) nên không ép dẹt → hết z-fighting. */
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
      shader.uniforms.uAO = { value: GRASS_AO };
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
uniform float uCapK;
uniform float uAO;`,
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
wp.xz += outDir * (near * h * h * 0.45 * aLean);

// Chốt an toàn: đỉnh lá nào lọt vào footprint thì đẩy ra mép (không lá nào thò qua thành/đáy)
vec2 q2 = abs(wp.xz) - uBox;
float insideW = step(max(q2.x, q2.y), 0.0);
vec2 n2 = q2.x > q2.y ? vec2(sign(wp.x), 0.0) : vec2(0.0, sign(wp.z));
wp.xz += n2 * (-max(q2.x, q2.y) + 0.02) * insideW;

// AO giả: cỏ sát hộp tối hơn như bị hộp đè và che sáng
#ifdef USE_COLOR
  vColor.rgb *= mix(uAO, 1.0, smoothstep(0.0, 1.4, dB));
#endif

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
    grad.addColorStop(0, 'rgba(20,28,12,0.5)');
    grad.addColorStop(0.6, 'rgba(20,28,12,0.18)');
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

function Scene({ progressRef, touch, mode = 'main' }: { progressRef: MutableRefObject<number>; touch: boolean; mode?: 'main' | 'phone' }) {
  const { gl, scene } = useThree();
  const smooth = useRef(0);
  const pullLocked = useRef(false); // đang chặn kéo-để-tải-lại hay không (chỉ đổi khi chuyển trạng thái, không ghi style mỗi khung hình)
  const boxRef = useRef<THREE.Group>(null);
  const lidRef = useRef<THREE.Group>(null);
  const skirtRef = useRef<THREE.Group>(null);
  const triRefs = useRef<(THREE.Group | null)[]>([null, null]);
  const sideRefs = useRef<(THREE.Group | null)[]>([null, null]);
  const ringRef = useRef<THREE.Group>(null);

  // Phòng studio phản chiếu cho men sứ và bìa
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = ENV_INTENSITY;   // giảm phản xạ phòng studio để ánh sáng khối rõ hơn
    scene.fog = new THREE.Fog(FOG_COLOR, FOG_NEAR, FOG_FAR); // cùng màu nền trang → hòa vào nền, không phủ sương đục lên cỏ
    gl.toneMapping = THREE.NeutralToneMapping;    // giữ đúng màu cam thương hiệu, không bị nhạt/ngả như ACES
    gl.toneMappingExposure = EXPOSURE;
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.VSMShadowMap;
    return () => {
      scene.environment = null;
      scene.environmentIntensity = 1;
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
  const lidMaps = useMemo(() => makeLidMaps(), []);
  // Mặt trên nắp: bìa sần (nhám, có hạt) còn logo được "tráng bóng" bằng clearcoat giới hạn theo hình logo (clearcoatMap), bump phẳng ở logo
  const lidTopMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        map: lidTex,
        roughness: 1, // độ nhám thật lấy từ roughnessMap (nhân với 1)
        roughnessMap: lidMaps.rough,
        bumpMap: lidMaps.bump,
        bumpScale: 0.015,
        clearcoat: 1,
        clearcoatMap: lidMaps.gloss,
        clearcoatRoughness: LOGO_COAT_ROUGH,
        transparent: true,
      }),
    [lidTex, lidMaps],
  );
  const insertMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#F8F4EC', roughness: 0.93, bumpMap: cardGrain, bumpScale: 0.012 }), [cardGrain]);
  const teethMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#FBF8F2', roughness: 0.93, side: THREE.DoubleSide }), []);
  const holeWallMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#A99B89', roughness: 1, side: THREE.DoubleSide }), []);
  const teethGeo = useMemo(() => makeTeethGeometry(), []);
  const recessMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#E6D9CA', roughness: 0.9, transparent: true }), []);
  const creaseMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#7A3E12', transparent: true, opacity: 0.35 }), []);
  
  // Chữ và logo của nắp: vẽ logo sau khi ảnh tải xong
  useEffect(() => {
    const img = new Image();
    img.src = RING_LOGO;
    img.onload = () => {
      const canvas = lidTex.image as HTMLCanvasElement;
      const g = canvas.getContext('2d');
      if (!g) return;
      const S = canvas.width;
      g.imageSmoothingEnabled = true;
      g.imageSmoothingQuality = 'high';
      g.drawImage(img, S * LOGO_POS, S * LOGO_POS, S * LOGO_SIZE, S * LOGO_SIZE);
      lidTex.needsUpdate = true;
      paintLogoMaps(lidMaps, img); // cùng vị trí, cùng hình dáng → lớp bóng khớp đúng logo
    };
  }, [lidTex, lidMaps]);

  /* Vật liệu vòng: men sứ, có hạt, phản xạ môi trường */
  const ringGeo = useMemo(() => makeRingGeometry(), []);
  const backTex = useMemo(() => makeBackTexture(), []);
  const grain = useMemo(() => makeGrainTexture(), []);
  const [frontTex, setFrontTex] = useState<THREE.Texture>(() => makeFrontFallback());
  useEffect(() => {
    let alive = true;
    const img = new Image();
    img.onload = () => {
      if (!alive) return;
      const t = new THREE.CanvasTexture(cleanFrontImage(img)); // ảnh đã lót trắng và xoá vệt khe tối
      t.colorSpace = THREE.SRGBColorSpace;
      setFrontTex(t);
    };
    img.onerror = () => {
      /* Không có ảnh thật: giữ hình dự phòng */
    };
    img.src = FRONT_SRC;
    return () => {
      alive = false;
    };
  }, []);
  const maxAniso = gl.capabilities.getMaxAnisotropy();
  useEffect(() => {
    frontTex.anisotropy = maxAniso;
    backTex.anisotropy = maxAniso;
    // Mặt nắp: anisotropy tối đa để chữ/logo không nhoè khi nhìn nghiêng từ camera
    lidTex.anisotropy = maxAniso;
    lidMaps.gloss.anisotropy = maxAniso;
    lidMaps.rough.anisotropy = maxAniso;
  }, [frontTex, backTex, lidTex, lidMaps, maxAniso]);
  const enamel = { roughness: 0.5, roughnessMap: grain, bumpMap: grain, bumpScale: 0.7, clearcoat: 0.22, clearcoatRoughness: 0.32, ior: 1.5, specularIntensity: 0.45, envMapIntensity: 0.65 };
  // Mép bo và vách khe KHÔNG dùng bump/roughness map: UV của mép là phép chiếu phẳng nên trên mặt dốc hạt bị kéo thành vệt, gây các mảng đen ở mép dưới
  const ringBody = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#FFFFFF', ...enamel, bumpMap: null, roughnessMap: null, side: THREE.DoubleSide }), [grain]);
  const ringFront = useMemo(() => new THREE.MeshPhysicalMaterial({ map: frontTex, ...enamel, roughness: 0.6, clearcoat: 0.05, envMapIntensity: 0.3, side: THREE.DoubleSide }), [frontTex, grain]);
  const ringBack = useMemo(() => new THREE.MeshPhysicalMaterial({ map: backTex, ...enamel, side: THREE.DoubleSide }), [backTex, grain]);

  // Đặt các thuộc tính thứ tự xoay trước khi dùng
  useEffect(() => {
    if (ringRef.current) ringRef.current.rotation.order = 'YXZ';
  }, []);

  /* Mobile: chặn trình duyệt "kéo xuống để tải lại trang" (pull-to-refresh) khi hộp CHƯA đóng hẳn.
     Lỗi cũ: cuộn nhanh về đầu trang thì cuộn đã chạm 0 nhưng nắp còn đang đóng dở (do làm mượt), vuốt thêm một nhịp là trình duyệt reload.
     Cách làm: overscroll-behavior-y: none trên html/body khi hộp chưa đóng; chỉ trả lại hành vi gốc khi hộp đã đóng hẳn và đứng yên ở đầu trang.
     Trình duyệt xét thuộc tính này lúc bắt đầu một cử chỉ kéo nên mỗi cử chỉ mới sẽ thấy trạng thái đúng. */
  const overscrollBackup = useRef<{ html: string; body: string } | null>(null);
  const setPullLock = (locked: boolean) => {
    const html = document.documentElement;
    const body = document.body;
    if (locked) {
      if (!overscrollBackup.current) overscrollBackup.current = { html: html.style.overscrollBehaviorY, body: body.style.overscrollBehaviorY };
      html.style.overscrollBehaviorY = 'none';
      body.style.overscrollBehaviorY = 'none';
    } else if (overscrollBackup.current) {
      html.style.overscrollBehaviorY = overscrollBackup.current.html;
      body.style.overscrollBehaviorY = overscrollBackup.current.body;
      overscrollBackup.current = null;
    }
  };
  useEffect(() => {
    // Rời trang (unmount) thì trả lại nguyên trạng, không để ảnh hưởng các trang khác
    return () => {
      pullLocked.current = false;
      setPullLock(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame((state, delta) => {
    // Làm mượt tiến độ: không giật khi cuộn nhanh hoặc dừng đột ngột
    // Mobile: bám nhanh hơn (đỡ trễ vì hero đã có spring) và chặn khung hình khựng làm tiến độ nhảy cóc; PC giữ nguyên
    const phone = mode === 'phone';
    const dt = touch ? Math.min(delta, MAX_DT_TOUCH) : delta;
    const target = phone ? PHONE_T : progressRef.current;
    let t = (smooth.current = phone ? PHONE_T : THREE.MathUtils.damp(smooth.current, target, touch ? DAMP_TOUCH : DAMP_DESKTOP, dt));
    if (touch && !phone) {
      // Về sát đầu trang thì chốt đúng trạng thái đóng (damp chỉ tiến gần chứ không bao giờ chạm 0 → gờ/nắp còn hở một chút)
      if (target < CLOSED_EPS && t < CLOSED_EPS) t = smooth.current = target;
      const needLock = target > CLOSED_EPS || t > CLOSED_EPS; // chưa đóng hẳn → khoá kéo-để-tải-lại
      if (needLock !== pullLocked.current) {
        pullLocked.current = needLock;
        setPullLock(needLock);
      }
    }
    // Camera: khoảng cách gốc theo đường cong (dolly) nhưng không bao giờ gần hơn mức cần để thấy đủ SIDE_NEED ở hai bên theo tỉ lệ khung hình
    const cam = state.camera as THREE.PerspectiveCamera;
    const aspect = state.size.width / Math.max(1, state.size.height);
    const camY = evalCurve(CAM_Y, t);
    const camZ = evalCurve(CAM_Z, t);
    const d0 = Math.hypot(camY - LOOK_Y, camZ);                          // khoảng cách gốc tới điểm nhìn
    const dNeed = SIDE_NEED / (aspect * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2))) + FRONT_OFFSET;
    const dist = Math.max(d0, dNeed);
    const m = dist / d0;                                                  // = 1 trên PC (không đổi), > 1 khi màn hình hẹp
    // Quỹ đạo ngang của vòng: viewport đo ở khoảng cách gốc nên nhân với m để phần bay ra hai bên khớp bề ngang thực nhìn thấy
    const xs = Math.min(1, Math.max(0.5, (state.viewport.width * m) / 6));

    if (ringRef.current) {
      ringRef.current.position.set(evalCurve(RING_X, t) * xs, evalCurve(RING_Y, t), evalCurve(RING_Z, t));
      ringRef.current.rotation.x = evalCurve(RING_RX, t);
      ringRef.current.rotation.y = spinAt(t) + Math.sin(state.clock.elapsedTime * 0.9) * 0.08;
    }
    if (lidRef.current) {
      const lidA = Math.max(0, evalCurve(LID, t)); // chặn âm: nội suy Catmull-Rom có thể làm nắp lún nhẹ vào hộp ở đầu hành trình
      lidRef.current.rotation.x = -lidA;
      lidRef.current.position.z = -B / 2; // nắp không trượt: tam giác được rút ra nhờ gờ trước mở thẳng
      // 1) Gờ trước (phủ ngoài thành trước) quay quanh mép trước của nắp, mở thẳng ra phía trước ~83°: hai tam giác trượt theo cung tròn qua khe và tuột ra.
      //    Chặn về [0, 1] vì nội suy Catmull-Rom có thể lố nhẹ.
      const open = THREE.MathUtils.clamp(evalCurve(SKIRT, t), 0, 1);
      if (skirtRef.current) skirtRef.current.rotation.x = -SKIRT_OPEN * open;
      // 2) Tam giác: gài thì gập 90° vào trong (π/2); khi nắp đã nhấc cao khỏi mép thành thì nở ra ngoài một chút, không quặp vào trong
      //    (đợi nắp nhấc vì lúc gờ vừa mở xong, tam giác còn nằm ngay trong khe nên nở sớm sẽ quẹt vào thành)
      const out = THREE.MathUtils.smoothstep(lidA, 0.3, 0.7);
      triRefs.current.forEach((g, i) => {
        if (g) g.rotation.y = (i === 0 ? -1 : 1) * (Math.PI / 2 - TRI_OUT * out);
      });
      // 3) Hai gờ bên nằm sát mặt trong thành bên nên chỉ đi lên cùng nắp; đợi nắp lật cao (đầu gờ gần bản lề đã vượt mép thành) mới nở ra ngoài một chút
      const sideOut = THREE.MathUtils.smoothstep(lidA, 1.3, 1.84) * SIDE_OUT;
      sideRefs.current.forEach((g, i) => {
        if (g) g.rotation.z = (i === 0 ? -1 : 1) * sideOut;
      });
    }


    cam.position.set(0, LOOK_Y + (camY - LOOK_Y) * m, camZ * m); // lùi dọc theo đúng hướng nhìn cũ
    cam.lookAt(0, LOOK_Y, 0);
    if (phone && ringRef.current) {
      const time = state.clock.elapsedTime;
      // tag "nằm trong tay": hơi rung nhẹ như cầm thật
      ringRef.current.position.set(
        PHONE_RING[0] + Math.sin(time * 1.3) * 0.02,
        PHONE_RING[1] + Math.sin(time * 1.7) * 0.025,
        PHONE_RING[2],
      );
      ringRef.current.rotation.y += PHONE_SPIN;
      // camera tiến từ xa lại gần (lấy nét) trong ~2 giây đầu rồi giữ, tay cầm máy hơi lắc
      const k = THREE.MathUtils.smoothstep(time, 0.3, 2.4);
      const d = THREE.MathUtils.lerp(PHONE_DIST_FAR, PHONE_DIST, k);
      const rp = ringRef.current.position;
      cam.position.set(
        rp.x + Math.sin(time * 0.7) * 0.06,
        rp.y + d * PHONE_DIR.y + Math.sin(time * 0.9) * 0.04,
        rp.z + d * PHONE_DIR.z,
      );
      cam.lookAt(rp.x, rp.y, rp.z);
    }
    // Lùi camera bao nhiêu thì đẩy sương mù ra bấy nhiêu, để hộp và cỏ không bị phủ màu be nhiều hơn
    if (scene.fog) {
      const fog = scene.fog as THREE.Fog;
      fog.near = FOG_NEAR + (dist - d0);
      fog.far = FOG_FAR + (dist - d0);
    }
  });

  return (
    <>
      <ambientLight intensity={0.2} color="#FFF3E6" />
      <hemisphereLight args={['#FFF1DF', '#6B5A3E', 0.45]} />
      {/* Đèn chính ấm từ trên bên phải: góc rộng, mép rất mềm → vùng sáng lan hết khung, tối dần ra xa nhưng không đen */}
      <spotLight
        position={[5, 11, 6]}
        target-position={[0, 0, 0]}
        angle={0.95}
        penumbra={0.85}
        intensity={KEY_INTENSITY}
        decay={2}
        distance={50}
        color="#FFE9CF"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-radius={8}
        shadow-blurSamples={16}
        shadow-bias={-0.0004}
      />
      {/* Đèn phụ lạnh phía trước-trái (không đổ bóng): mở vùng tối, tạo tương phản ấm/lạnh cho mặt trước hộp */}
      <directionalLight position={[-6, 5, 9]} intensity={FILL_INTENSITY} color="#D6E4FF" />
      {/* Đèn viền ấm phía sau: tách khối hộp khỏi nền */}
      <directionalLight position={[-5, 4, -6]} intensity={RIM_INTENSITY} color="#FFD9B0" />

      {/* Hộp: đáy, bốn thành, lõm tròn, nắp */}
      <group ref={boxRef}>
        <mesh position={[0, -BOARD / 2, 0]} castShadow receiveShadow material={[orangeMat, orangeMat, liningMat, orangeMat, orangeMat, orangeMat]}>
          <boxGeometry args={[B, BOARD, B]} />
        </mesh>
        {/* Thành khay: cả mặt ngoài lẫn mặt trong đều cam (theo ảnh). Thành trước đứng thẳng, cùng mặt phẳng với hai thành bên (không thụt vào);
            chỉ có hai khe hẹp ở hai đầu cho hai tam giác của gờ trước chui qua */}
        <mesh position={[0, H / 2, B / 2 - WALL / 2]} castShadow material={orangeMat}>
          <boxGeometry args={[2 * SLOT_A, H, WALL]} />
        </mesh>
        {[-1, 1].map((sg) => (
          <mesh key={sg} position={[sg * (SLOT_B + B / 2) / 2, H / 2, B / 2 - WALL / 2]} castShadow material={orangeMat}>
            <boxGeometry args={[B / 2 - SLOT_B, H, WALL]} />
          </mesh>
        ))}
        <mesh position={[0, H / 2, -B / 2 + WALL / 2]} castShadow material={orangeMat}>
          <boxGeometry args={[B, H, WALL]} />
        </mesh>
        <mesh position={[-(B / 2 - WALL / 2), H / 2, 0]} castShadow material={orangeMat}>
          <boxGeometry args={[WALL, H, B - 2 * WALL]} />
        </mesh>
        <mesh position={[B / 2 - WALL / 2, H / 2, 0]} castShadow material={orangeMat}>
          <boxGeometry args={[WALL, H, B - 2 * WALL]} />
        </mesh>

        {/* Tấm lót trắng dày 0.5 cm (nửa chiều cao hộp), lỗ giữa đặt QR tag; mặt trên ngang mặt trên tag.
            Extrude dọc +z rồi xoay -90° quanh x nên chiều dày hướng lên +y */}
        <mesh geometry={insertGeo} material={insertMat} position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow />
        {/* Vách lỗ (tối hơn) và hàng răng tam giác bao quanh lỗ */}
        <mesh material={holeWallMat} position={[0, INSERT_T / 2, 0]}>
          <cylinderGeometry args={[R_HOLE - 0.003, R_HOLE - 0.003, INSERT_T - 0.004, 64, 1, true]} />
        </mesh>
        <mesh geometry={teethGeo} material={teethMat} />

        {/* Lõm tròn vừa khít vòng */}
        <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]} material={recessMat} receiveShadow>
          <circleGeometry args={[S_RING * 1.04, 64]} />
        </mesh>

        {/* Nắp: bản lề ở cạnh sau, mở 0 → 100° */}
        <group ref={lidRef} position={[0, H, -B / 2]}>
          <mesh position={[0, LID_T / 2, B / 2]} castShadow material={[orangeMat, orangeMat, lidTopMat, liningMat, orangeMat, orangeMat]}>
            <boxGeometry args={[B, LID_T, B]} />
          </mesh>
          {/* Gờ trước: giấy mỏng cao ~1 cm phủ ngoài thành trước, khuyết nửa tròn ở mép dưới; hai tam giác ở hai đầu gập ra sau, cắm qua hai khe vào trong hộp; cả cụm quay quanh mép trước của nắp khi mở */}
          <group ref={skirtRef} position={[0, 0, B]}>
            <mesh castShadow material={orangeMat} geometry={skirtGeo} />
            {[-1, 1].map((sg, i) => (
              <group key={sg} ref={(g) => { triRefs.current[i] = g; }} position={[sg * TRI_X, 0, 0]} scale={[sg, 1, 1]} rotation={[0, sg * Math.PI / 2, 0]}>
                <mesh castShadow material={orangeMat} geometry={triGeo} />
              </group>
            ))}
          </group>

          {/* Hai gờ bên: gài vào bên trong thành trái/phải, nở nhẹ ra ngoài khi nắp lật cao */}
          {[-1, 1].map((sg, i) => (
            <group key={sg} ref={(g) => { sideRefs.current[i] = g; }} position={[sg * XS, 0, 0]} scale={[sg, 1, 1]}>
              <mesh castShadow material={orangeMat} geometry={sideGeo} rotation={[0, -Math.PI / 2, 0]} />
            </group>
          ))}

          {/* Khe gập ở bản lề và ở cạnh gấp trước */}
          <mesh position={[0, LID_T + 0.002, 0.04]} rotation={[-Math.PI / 2, 0, 0]} material={creaseMat}>
            <planeGeometry args={[B, 0.05]} />
          </mesh>
          <mesh position={[0, LID_T + 0.002, B - 0.06]} rotation={[-Math.PI / 2, 0, 0]} material={creaseMat}>
            <planeGeometry args={[B, 0.05]} />
          </mesh>
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
        <meshStandardMaterial color="#3B4A22" roughness={1} polygonOffset polygonOffsetFactor={1} polygonOffsetUnits={1} />
      </mesh>
      {/* Lớp cỏ bị đè dưới hộp: khối tối lấp khoảng hở giữa đất và đáy hộp, nhìn như cỏ bị ép dưới hộp */}
      <mesh position={[0, SOIL_Y + (GRASS_BED - 0.01) / 2, 0]}>
        <boxGeometry args={[B - 0.04, GRASS_BED - 0.01, B - 0.04]} />
        <meshStandardMaterial color="#1F2B12" roughness={1} />
      </mesh>
      <GrassField />
      <ContactShadow />
      <DeskProps />
    </>
  );
}

export default function UnboxingScene({ progressRef, paused = false }: { progressRef: MutableRefObject<number>; paused?: boolean }) {
  // Component chỉ chạy ở trình duyệt (dynamic ssr:false) nên đọc matchMedia ngay lúc khởi tạo được
  const [touch] = useState<boolean>(() => isTouchDevice());
  return (
    <Canvas
      shadows
      camera={{ position: [0, 6.5, 12], fov: 30 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
            dpr={touch ? [1, DPR_MAX_TOUCH] : [1, 2]}
      frameloop={paused ? 'never' : 'always'}
      style={{ background: 'transparent' }}
    >
      <Scene progressRef={progressRef} touch={touch} />
    </Canvas>
  );
}

/* Cảnh thứ hai: "camera" bên trong màn hình iPhone (cùng cỏ, hộp, tag nhưng góc nhìn của điện thoại) */
export function PhoneCamScene() {
  const [touch] = useState<boolean>(() => isTouchDevice());
  const unused = useRef(0);
  return (
    <Canvas
      shadows
      camera={{ position: [0, 6, 9], fov: 58, near: 0.1, far: 100 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      dpr={touch ? [1, 1.25] : [1, 1.75]}
    >
      <color attach="background" args={[FOG_COLOR]} />
      <Scene progressRef={unused} touch={touch} mode="phone" />
    </Canvas>
  );
}