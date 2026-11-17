// src/components/home/ringConfig.ts
// Số liệu hình học của viên tag, dùng chung cho canvas 3D và phần lõm trong hộp.
// File này không import three.js để có thể dùng ở cả component tĩnh lẫn component tải động.

/** bán kính đĩa (đơn vị 3D) */
export const RING_RADIUS = 1;
/** vị trí camera trên trục Z */
export const CAM_Z = 7;
/** góc nhìn dọc (độ) của canvas */
export const CAM_FOV = 53;
/** canvas 3D rộng gấp đôi khung vòng, để vòng khi zoom gần không bị cắt mép */
export const CANVAS_SCALE = 2;

/** Đường kính vòng so với khung vòng (không tính phần canvas thừa) */
export const RING_SCREEN_FRACTION =
  ((2 * RING_RADIUS) / (2 * CAM_Z * Math.tan((CAM_FOV / 2) * (Math.PI / 180)))) * CANVAS_SCALE;
