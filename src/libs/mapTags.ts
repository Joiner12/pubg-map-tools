import type { IMapTag, IVehicleSpawn, ISecretRoom, MapTagType } from "./types";
import type { mapNamesUnion } from "./mapsParams";
import groundVehicles from "@/config/groundVehicles";
import airVehicles from "@/config/airVehicles";
import secretRooms from "@/config/secretRooms";
import experimentalCamp from "@/config/experimentalCamp";
import bearCave from "@/config/bearCave";
import crowbarRoom from "@/config/crowbarRoom";

// 获取指定地图的所有标签
export const getAllMapTags = (mapName: mapNamesUnion): IMapTag[] => {
  const tags: IMapTag[] = [];

  // 获取地面载具标签
  const groundVehicleTags = groundVehicles[mapName] || [];
  tags.push(...groundVehicleTags);

  // 获取飞行载具标签
  const airVehicleTags = airVehicles[mapName] || [];
  tags.push(...airVehicleTags);

  // 获取密室标签
  const secretRoomTags = secretRooms[mapName] || [];
  tags.push(...secretRoomTags);

  // 获取熊洞标签
  const bearCaveTags = bearCave[mapName] || [];
  tags.push(...bearCaveTags);

  // 获取撬锁房间标签
  const crowbarRoomTags = crowbarRoom[mapName] || [];
  tags.push(...crowbarRoomTags);

  // 获取实验营地标签
  const experimentalCampTags = experimentalCamp[mapName] || [];
  tags.push(...experimentalCampTags);

  return tags;
};

// 获取指定类型的标签
export const getMapTagsByType = (
  mapName: mapNamesUnion,
  tagType: MapTagType
): IMapTag[] => {
  switch (tagType) {
    case "groundVehicle":
      return groundVehicles[mapName] || [];
    case "airVehicle":
      return airVehicles[mapName] || [];
    case "secretRoom":
      return secretRooms[mapName] || [];
    case "experimentalCamp":
      return experimentalCamp[mapName] || [];
    case "bearCave":
      return bearCave[mapName] || [];
    case "crowbarRoom":
      return crowbarRoom[mapName] || [];
    default:
      return [];
  }
};

// 获取标签图标
export const getTagIcon = (tagType: MapTagType): string => {
  switch (tagType) {
    case "groundVehicle":
      return "🚗"; // 可以替换为实际图标路径
    case "airVehicle":
      return "🚁"; // 可以替换为实际图标路径
    case "secretRoom":
      return "🔒"; // 可以替换为实际图标路径
    case "experimentalCamp":
      return "🏕️";
    default:
      return "📍";
  }
};

// 判断标签类型
export const getTagType = (tag: IMapTag): MapTagType => {
  if (tag.type === "airVehicle") {
    return "airVehicle";
  }
  if (tag.type === "groundVehicle") {
    return "groundVehicle";
  }
  if (tag.type === "crowbarRoom") {
    return "crowbarRoom";
  }
  if (tag.type === "experimentalCamp") {
    return "experimentalCamp";
  }
  if (tag.type === "bearCave") {
    return "bearCave";
  }
  return "secretRoom";
};
