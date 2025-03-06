import type { IVehicleSpawn } from "@/libs/types";
import type { mapNamesUnion } from "@/libs/mapsParams";

// 地面载具刷新点配置
// 每个地图的载具刷新点配置
type GroundVehicleConfig = {
  [key in mapNamesUnion]?: IVehicleSpawn[];
};

const groundVehicles: GroundVehicleConfig = {
  // 艾伦格地图载具刷新点
  erangel: [],

  // 米拉玛地图载具刷新点
  miramar: [],
};

export default groundVehicles;
