// src/components/home/ringConfig.ts
// Số liệu hình học của viên tag, dùng chung cho canvas 3D và phần lõm trong hộp.
// File này không import three.js để có thể dùng ở cả component tĩnh lẫn component tải động.

/** bán kính đĩa (đơn vị 3D) */
export const RING_RADIUS = 1;
/** vị trí camera trên trục Z và góc nhìn dọc (độ) của canvas */
export const CAM_Z = 7;
export const CAM_FOV = 28;

/** Đường kính vòng so với chiều cao khung nhìn của canvas (0 → 1) */
export const RING_SCREEN_FRACTION =
  (2 * RING_RADIUS) / (2 * CAM_Z * Math.tan((CAM_FOV / 2) * (Math.PI / 180)));