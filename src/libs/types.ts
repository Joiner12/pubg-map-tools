export interface ICoords {
  x: number;
  y: number;
}

export interface IMapTag {
  id: string;
  position: ICoords;
  name: string;
  description?: string;
  type?: MapTagType;
}

export interface IVehicleSpawn extends IMapTag {
  vehicleType: string; // 载具类型
  respawnTime?: number; // 刷新时间（分钟）
}

export interface ISecretRoom extends IMapTag {
  lootLevel: number; // 战利品等级 1-3
  keyRequired?: boolean; // 是否需要钥匙
}

export interface IBearCave extends IMapTag {
  type: "bearCave";
}

export interface ICrowbarRoom extends IMapTag {
  type: "crowbarRoom";
}

export interface IExperimentalCamp extends IMapTag {
  type: "experimentalCamp";
}

export type MapTagType =
  | "groundVehicle"
  | "airVehicle"
  | "secretRoom"
  | "bearCave"
  | "crowbarRoom"
  | "experimentalCamp"
  | "emergencyDoor";
