/**
 * Sketchfab Model Configuration and Survey Results (Phase 1)
 *
 * Model: Earth Core by saVRee
 * URL: https://sketchfab.com/3d-models/earth-core-7bb72849e81f4bfab1a77a059fb422b3
 * UID: 7bb72849e81f4bfab1a77a059fb422b3
 * License / Tag: NoAI - Only embedded via Sketchfab Viewer API. Do not download or re-host.
 *
 * --- PHẢO SÁT NODE (Phase 1 Survey Results) ---
 * Tổng số nodes: 57
 * Animation: 'Take 01' (id: 'f22269def87543d69c95e13b8a357ff2', length: 2.458s)
 * - Tách lớp thành node riêng: CÓ (Model phân rã thành các đĩa/khối riêng biệt)
 * - Các node địa chất (Earth Core layers):
 *    - Plane.013 (instanceID 159, Geometry 161, mat: Earth) -> Vỏ Trái Đất (bề mặt lục địa / đại dương)
 *    - Plane.012 (instanceID 179, Geometry 181, mat: land) -> Thạch quyển / Đáy vỏ
 *    - Plane.011 (instanceID 225, Geometry 228, mat: lava, circle: 247) -> Manti trên (Upper Mantle)
 *    - Plane.010 (instanceID 261, Geometry 264, mat: lava, circle: 278) -> Manti dưới (Lower Mantle)
 *    - Plane.009 (instanceID 292, Geometry 295, mat: lava, circle: 309) -> Lõi ngoài (Outer Core)
 *    - Plane.008 (instanceID 323, Geometry 326/336, mat: land/lava, circle: 354) -> Lõi trong (Inner Core)
 * - Các node khí quyển (Atmospheric spheres):
 *    - Sphere.035 (59): Tầng đối lưu (Troposphere)
 *    - Sphere.034 (79): Tầng bình lưu (Stratosphere)
 *    - Sphere.033 (99): Tầng trung lưu (Mesosphere)
 *    - Sphere.032 (119): Tầng nhiệt (Thermosphere)
 *    - Sphere.031 (139): Tầng ngoài (Exosphere)
 *    - Sphere.026 (205): Lớp mây (Clouds)
 * - Kết luận:
 *   Model có khả năng điều khiển ẩn/hiện node độc lập thông qua `api.hide(instanceID)` và `api.show(instanceID)`.
 *   Kết hợp camera lookAt để phóng to tiêu điểm từng lớp một cách trực quan và mượt mà.
 */

export const SKETCHFAB_UID = '7bb72849e81f4bfab1a77a059fb422b3';
export const SKETCHFAB_API_SCRIPT_URL = 'https://static.sketchfab.com/api/sketchfab-viewer-1.12.1.js';

export const DEFAULT_CAMERA = {
  position: [18.8, -2.06, 4.03] as [number, number, number],
  target: [0.31, 0.38, 0.03] as [number, number, number],
  duration: 1.5,
};

export interface LayerNodeConfig {
  id: string;
  name: string;
  englishName: string;
  nodeIds: number[];
  camera: {
    position: [number, number, number];
    target: [number, number, number];
    duration?: number;
  };
}

// Map layer ids to node instance IDs & camera views
export const LAYER_NODE_MAP: Record<string, LayerNodeConfig> = {
  crust: {
    id: 'crust',
    name: 'Vỏ Trái Đất',
    englishName: 'Crust',
    nodeIds: [159, 179],
    camera: {
      position: [14.0, -1.8, 3.5],
      target: [0.3, 0.4, 0.0],
      duration: 1.2,
    },
  },
  'upper-mantle': {
    id: 'upper-mantle',
    name: 'Manti Trên',
    englishName: 'Upper Mantle',
    nodeIds: [225],
    camera: {
      position: [11.5, -1.5, 3.0],
      target: [0.3, 0.4, 0.0],
      duration: 1.2,
    },
  },
  'lower-mantle': {
    id: 'lower-mantle',
    name: 'Manti Dưới',
    englishName: 'Lower Mantle',
    nodeIds: [261],
    camera: {
      position: [9.0, -1.2, 2.5],
      target: [0.3, 0.4, 0.0],
      duration: 1.2,
    },
  },
  'outer-core': {
    id: 'outer-core',
    name: 'Lõi Ngoài',
    englishName: 'Outer Core',
    nodeIds: [292],
    camera: {
      position: [7.0, -0.9, 1.8],
      target: [0.3, 0.4, 0.0],
      duration: 1.2,
    },
  },
  'inner-core': {
    id: 'inner-core',
    name: 'Lõi Trong',
    englishName: 'Inner Core',
    nodeIds: [323],
    camera: {
      position: [5.2, -0.6, 1.2],
      target: [0.3, 0.4, 0.0],
      duration: 1.2,
    },
  },
};
