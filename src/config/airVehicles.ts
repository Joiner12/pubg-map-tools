import type { IVehicleSpawn } from "@/libs/types";
import type { mapNamesUnion } from "@/libs/mapsParams";

// 飞行载具刷新点配置
// 每个地图的飞行载具刷新点配置
type AirVehicleConfig = {
  [key in mapNamesUnion]?: IVehicleSpawn[];
};

const airVehicles: AirVehicleConfig = {
  // 艾伦格地图飞行载具刷新点
  erangel: [],

  // 米拉玛地图飞行载具刷新点
  miramar: [],
};

export default airVehicles;
