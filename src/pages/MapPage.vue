<script setup>
import MapCanvas from "@/components/MapCanvas.vue";
import { onMounted } from 'vue';
import { useMapStore } from '@/stores/map';

const props = defineProps({
  mapName: {
    type: String,
    required: true,
  }
});

const mapStore = useMapStore();

onMounted(() => {
  mapStore.changeCurrentMap(props.mapName);
});
</script>

<template>
  <div class="page__wrapper">
    <map-canvas :mapName="mapName" />
  </div>
</template>

<style scoped>
.page__wrapper {
  flex: 1;
  height: calc(100% - 60px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>
