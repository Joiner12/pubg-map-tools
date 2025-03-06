export const zoomLevels = [0.2, 0.3, 0.5, 0.75, 1];

export const mapDistanceMod = 1000 / 1024;

export const getCnMapName = (map: string) => {
  switch (map.toLowerCase()) {
    case "miramar":
      return "米拉玛";
    case "sanhok":
      return "萨诺";
    case "vikendi":
      return "维寒迪";
    case "erangel":
      return "艾伦格";
    case "desert_main":
      return "沙漠地图";
    case "taego":
      return "泰戈";
    case "deston":
      return "帝斯顿";
    case "rondo":
      return "荣都";
    default:
      return map;
  }
};
