import { defineStore } from "pinia";

// 定义地图状态存储
export const useMapStore = defineStore("map", {
  state: () => ({
    currentMap: "",
  }),
  actions: {
    changeCurrentMap(mapName: string) {
      this.currentMap = mapName;
    },
  },
});
