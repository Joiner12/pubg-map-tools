<script setup>
import MapCard from "@/components/MapCard.vue";
import { getThumbnails } from '@/libs/mapsParams';
import bgImg from '@/assets/img/pubg-bg.jpg';
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useMapStore } from '@/stores/map';
import { getCnMapName } from '@/libs/utils';

const router = useRouter();
const mapStore = useMapStore();
const bgimg = `url(${bgImg})`;
const maps = getThumbnails();

const navigateTo = (path) => {
  router.push(path);
};

onMounted(() => {
  mapStore.changeCurrentMap('');
});
</script>

<template>
  <div class="main">
    <div class="main_cards">
      <map-card v-for="map in maps" :key="map" :map-img="map.thumb" :map-name="getCnMapName(map.name)"
        @click="navigateTo(`/${map.name.toLowerCase()}`)" />
    </div>
  </div>
</template>

<style scoped>
.main {
  height: calc(100% - 60px);
  background-color: rgb(247, 244, 242);
  background-image: v-bind(bgimg);
  background-size: cover;
  background-position: top;
  filter: brightness(0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: auto;
}

.main_cards {
  width: 100%;
  margin-top: 10%;
  padding-bottom: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}
</style>
