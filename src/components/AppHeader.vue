<script setup>
import { mapList } from '@/libs/mapsParams';
import { getCnMapName } from '@/libs/utils';
import { useRouter } from 'vue-router';
import { useMapStore } from '@/stores/map';
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';

const router = useRouter();
const mapStore = useMapStore();
const mobileMenuOpen = ref(false);
const navItemRefs = ref([]);

// 为每个导航项创建ref
const setNavItemRef = (el, index) => {
  if (el) {
    navItemRefs.value[index] = el;
  }
};

// 计算当前活动标签的索引
const activeIndex = computed(() => {
  return mapList.findIndex(map => map === mapStore.currentMap);
});

// 计算指示器的样式
const indicatorStyle = computed(() => {
  if (activeIndex.value === -1 || !navItemRefs.value[activeIndex.value]) {
    return { opacity: 0 };
  }

  const activeItem = navItemRefs.value[activeIndex.value];
  return {
    width: `${activeItem.offsetWidth - 32}px`,
    transform: `translateX(${activeItem.offsetLeft + 16}px)`,
    opacity: 1
  };
});

const navigateTo = (path) => {
  router.push(path);
  mobileMenuOpen.value = false;
};

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};

// 处理窗口大小变化
const handleResize = () => {
  // 使用nextTick确保DOM已更新
  nextTick(() => {
    // 强制重新计算指示器样式
    if (activeIndex.value !== -1 && navItemRefs.value[activeIndex.value]) {
      const activeItem = navItemRefs.value[activeIndex.value];
      const indicator = document.querySelector('.nav-indicator');
      if (indicator) {
        indicator.style.width = `${activeItem.offsetWidth - 32}px`;
        indicator.style.transform = `translateX(${activeItem.offsetLeft + 16}px)`;
        indicator.style.opacity = '1';
      }
    }
  });
};

onMounted(() => {
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<template>
  <header class="header">
    <div class="header-container">
      <div class="logo" @click="navigateTo('/')">
        <!-- <span class="logo-bracket">[</span> -->
        <span class="logo-text">PUBG</span>
        <!-- <span class="logo-bracket">]</span> -->
        <span class="logo-title">地图助手</span>
      </div>

      <div class="mobile-menu-toggle" @click="toggleMobileMenu">
        <div class="hamburger" :class="{ 'active': mobileMenuOpen }">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      <nav class="nav-menu" :class="{ 'mobile-open': mobileMenuOpen }">
        <div v-for="(map, index) in mapList" :key="map" class="nav-item"
          :class="{ 'active': mapStore.currentMap === map }" @click="navigateTo(`/${map}`)"
          :ref="el => setNavItemRef(el, index)">
          {{ getCnMapName(map) }}
        </div>
        <div class="nav-indicator-container">
          <div class="nav-indicator" :style="indicatorStyle"></div>
        </div>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.header {
  position: relative;
  height: 60px;
  background-color: #1a1a1a;
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
}

.header-container {
  width: 100vw;
  height: 100%;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 18px;
  font-weight: 600;
  transition: transform 0.2s ease;
}

.logo:hover {
  transform: translateY(-2px);
}

.logo-bracket {
  color: #ffcc00;
  font-weight: 700;
}

.logo-text {
  color: #ffcc00;
  font-weight: 700;
  margin: 0 2px;
}

.logo-title {
  margin-left: 8px;
  font-weight: 500;
  color: #ffffff;
}

.nav-menu {
  position: relative;
  display: flex;
  align-items: center;
  gap: 5px;
}

.nav-item {
  position: relative;
  padding: 8px 16px;
  font-size: 16px;
  font-weight: 500;
  color: #cccccc;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.nav-item:hover {
  color: #ffffff;
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-item.active {
  color: #ffcc00;
  font-weight: 600;
}

.nav-indicator-container {
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 3px;
  pointer-events: none;
}

.nav-indicator {
  position: absolute;
  bottom: 0;
  height: 3px;
  background-color: #ffcc00;
  border-radius: 2px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.mobile-menu-toggle {
  display: none;
  cursor: pointer;
}

.hamburger {
  width: 24px;
  height: 20px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.hamburger span {
  display: block;
  height: 3px;
  width: 100%;
  background-color: #ffffff;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.hamburger.active span:nth-child(1) {
  transform: translateY(8.5px) rotate(45deg);
}

.hamburger.active span:nth-child(2) {
  opacity: 0;
}

.hamburger.active span:nth-child(3) {
  transform: translateY(-8.5px) rotate(-45deg);
}

@media (max-width: 768px) {
  .mobile-menu-toggle {
    display: block;
  }

  .nav-menu {
    position: absolute;
    top: 60px;
    left: 0;
    right: 0;
    flex-direction: column;
    background-color: #1a1a1a;
    padding: 10px 0;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-100%);
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
  }

  .nav-menu.mobile-open {
    transform: translateY(0);
    opacity: 1;
    visibility: visible;
  }

  .nav-item {
    width: 100%;
    text-align: center;
    padding: 12px 16px;
  }

  .nav-indicator-container {
    display: none;
  }

  .nav-item.active {
    background-color: rgba(255, 204, 0, 0.1);
  }
}
</style>
