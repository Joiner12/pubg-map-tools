<script setup lang='ts'>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import markerSvg from '@/assets/svg/map-marker.svg';
import gridBg from '@/assets/svg/microgrid.svg';
import groundVehiclesSvg from '@/assets/svg/groundVehicles.svg';
import airVehiclesSvg from '@/assets/svg/airVehicles.svg';
import secretRoomsSvg from '@/assets/svg/secretRooms.svg';
import bearCaveSvg from '@/assets/svg/bearCave.svg';
import crowbarRoomSvg from '@/assets/svg/crowbarRoom.svg';
import experimentalCampSvg from '@/assets/svg/experimentalCamp.svg';
import emergencyDoorSvg from '@/assets/svg/emergencyDoor.svg';
import type { ICoords, IMapTag, ISecretRoom, MapTagType } from '@/libs/types';
import { calcDistance, getMiddlePoint } from '@/libs/distance';
import { getMapParams, type mapNamesUnion } from '@/libs/mapsParams';
import PulseLoader from 'vue-spinner/src/PulseLoader.vue';
import { getAllMapTags, getTagType, getTagIcon } from '@/libs/mapTags';
import SecretRoomList from './SecretRoomList.vue';
import secretRooms from '@/config/secretRooms';
import bearCave from '@/config/bearCave';
import crowbarRoom from '@/config/crowbarRoom';
import groundVehicles from '@/config/groundVehicles';
import airVehicles from '@/config/airVehicles';
import experimentalCamp from '@/config/experimentalCamp';
import emergencyDoor from '@/config/emergencyDoor';

const props = defineProps({
  mapName: {
    type: String,
    required: true,
  }
});

const emptyCoords: ICoords = { x: 0, y: 0 };
const [MIN_ZOOM, MAX_ZOOM, ZOOM_STEP] = [0.1, 2.0, 0.05];

// 状态
const currentMap = ref(props.mapName);
const currentZoom = ref(0);
const wrapper = ref<HTMLDivElement | null>(null);
const canvas = ref<HTMLCanvasElement | null>(null);
const context = ref<CanvasRenderingContext2D | null>(null);
const image = ref<HTMLImageElement | null>(null);
const backgroundImg = ref<HTMLImageElement | null>(null);
const markerImg = ref<HTMLImageElement | null>(null);
const gridImage = ref<HTMLImageElement | null>(null);
const groundVehicleImg = ref<HTMLImageElement | null>(null);
const airVehicleImg = ref<HTMLImageElement | null>(null);
const secretRoomImg = ref<HTMLImageElement | null>(null);
const dragging = ref(false);
const movingMarker = ref<number | null>(null);
const touchStart = ref<ICoords>({ ...emptyCoords });
const offset = ref<ICoords>({ ...emptyCoords });
const currentOffset = ref<ICoords>({ ...emptyCoords });
const coordsStart = ref<ICoords>({ ...emptyCoords });
const dots = ref<ICoords[]>([]);
const maploading = ref(true);
const mousePosition = ref<ICoords | null>(null);
const showCoordinates = ref(true);

// 添加手机模式检测
const isMobile = ref(false);
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768;
};

// 添加标签显示控制
const showGroundVehicles = ref(false);
const showAirVehicles = ref(false);
const showSecretRooms = ref(false);
const showBearCaves = ref(false);
const showCrowbarRooms = ref(false);
const showExperimentalCamps = ref(false);
const showEmergencyDoors = ref(false);
const bearCaveImg = ref<HTMLImageElement | null>(null);
const crowbarRoomImg = ref<HTMLImageElement | null>(null);
const experimentalCampImg = ref<HTMLImageElement | null>(null);
const emergencyDoorImg = ref<HTMLImageElement | null>(null);
const mapTags = ref<IMapTag[]>([]);
const hoveredTag = ref<IMapTag | null>(null);

// 添加密室相关状态
const secretRoomsList = computed(() => {
  return props.mapName ? secretRooms[props.mapName as mapNamesUnion] || [] : [];
});

const bearCavesList = computed(() => {
  return props.mapName ? bearCave[props.mapName as mapNamesUnion] || [] : [];
});

const crowbarRoomsList = computed(() => {
  return props.mapName ? crowbarRoom[props.mapName as mapNamesUnion] || [] : [];
});

const experimentalCampsList = computed(() => {
  return props.mapName ? experimentalCamp[props.mapName as mapNamesUnion] || [] : [];
});

const hasExperimentalCamps = computed(() => {
  return experimentalCampsList.value.length > 0;
});

const emergencyDoorsList = computed(() => {
  return props.mapName ? emergencyDoor[props.mapName as mapNamesUnion] || [] : [];
});

const hasEmergencyDoors = computed(() => {
  return emergencyDoorsList.value.length > 0;
});

// 添加计算属性来判断各类型标记是否存在
const hasGroundVehicles = computed(() => {
  const groundVehicleTags = mapTags.value.filter(tag => getTagType(tag) === 'groundVehicle');
  return groundVehicleTags.length > 0;
});

const hasAirVehicles = computed(() => {
  const airVehicleTags = mapTags.value.filter(tag => getTagType(tag) === 'airVehicle');
  return airVehicleTags.length > 0;
});

const hasSecretRooms = computed(() => {
  return secretRoomsList.value.length > 0;
});

const hasBearCaves = computed(() => {
  return bearCavesList.value.length > 0;
});

const hasCrowbarRooms = computed(() => {
  return crowbarRoomsList.value.length > 0;
});

// 添加动画帧请求ID
const animationFrameId = ref<number | null>(null);

// 添加动画时间状态
const animationTime = ref(0);

// 添加动画循环函数
const animate = () => {
  animationTime.value = Date.now() * 0.001;
  draw();
  animationFrameId.value = requestAnimationFrame(animate);
};

// 添加触摸相关状态
const initialPinchDistance = ref<number | null>(null);
const initialZoom = ref<number>(MIN_ZOOM);

// 添加测量模式状态
const isMeasureMode = ref(false);
const measureTouchStart = ref<ICoords | null>(null);

// 计算两个触摸点之间的距离
const getTouchDistance = (touch1: Touch, touch2: Touch): number => {
  const dx = touch1.clientX - touch2.clientX;
  const dy = touch1.clientY - touch2.clientY;
  return Math.sqrt(dx * dx + dy * dy);
};

// 方法
const drawBackground = () => {
  if (!canvas.value || !backgroundImg.value) return;
  const ctx = canvas.value.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.value.width / currentZoom.value, canvas.value.height / currentZoom.value);
  ctx.drawImage(backgroundImg.value, 0, 0, canvas.value.width / currentZoom.value, canvas.value.height / currentZoom.value);
};

const setZoom = () => {
  if (!canvas.value) return;
  const ctx = canvas.value.getContext("2d");
  if (!ctx) return;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(currentZoom.value, currentZoom.value);
};

const draw = () => {
  if (!canvas.value || !image.value || !gridImage.value) return;
  drawBackground();

  const canvasEl = canvas.value;
  const ctx = canvasEl.getContext("2d");
  if (!ctx) return;

  // 计算图片和画布的宽高比
  const imgRatio = image.value.width / image.value.height;
  const canvasRatio = canvasEl.width / canvasEl.height;

  // 在最小缩放级别时，确保整个地图可见
  if (currentZoom.value === MIN_ZOOM) {
    // 计算适合画布的缩放比例
    let scale;
    let newWidth, newHeight;

    // 根据宽高比决定如何缩放
    if (imgRatio > canvasRatio) {
      // 图片更宽，以宽度为基准进行缩放
      scale = canvasEl.width / currentZoom.value / image.value.width;
      newWidth = canvasEl.width / currentZoom.value;
      newHeight = image.value.height * scale;
    } else {
      // 图片更高，以高度为基准进行缩放
      scale = canvasEl.height / currentZoom.value / image.value.height;
      newHeight = canvasEl.height / currentZoom.value;
      newWidth = image.value.width * scale;
    }

    // 计算居中位置
    const x = (canvasEl.width / currentZoom.value - newWidth) / 2;
    const y = (canvasEl.height / currentZoom.value - newHeight) / 2;

    coordsStart.value = {
      x: x - currentOffset.value.x / currentZoom.value,
      y: y - currentOffset.value.y / currentZoom.value,
    };

    // 绘制地图和网格
    ctx.drawImage(
      image.value,
      coordsStart.value.x,
      coordsStart.value.y,
      newWidth,
      newHeight
    );

    ctx.drawImage(
      gridImage.value,
      coordsStart.value.x,
      coordsStart.value.y,
      newWidth,
      newHeight
    );

    drawMarks();
    drawMapTags();
    return;
  }

  // 正常缩放级别的处理
  const x = (canvasEl.width / currentZoom.value - image.value.width) / 2;
  const y = (canvasEl.height / currentZoom.value - image.value.height) / 2;

  coordsStart.value = {
    x: x - currentOffset.value.x / currentZoom.value,
    y: y - currentOffset.value.y / currentZoom.value,
  };

  ctx.drawImage(
    image.value,
    coordsStart.value.x,
    coordsStart.value.y,
  );

  ctx.drawImage(
    gridImage.value,
    coordsStart.value.x,
    coordsStart.value.y,
  );

  drawMarks();
  drawMapTags();
};

const drawMarks = () => {
  if (!canvas.value || !markerImg.value || !image.value) return;
  const ctx = canvas.value.getContext('2d');
  if (!ctx) return;

  // 计算缩放比例
  let scale = 1;
  if (currentZoom.value === MIN_ZOOM) {
    const canvasEl = canvas.value;
    const imgRatio = image.value.width / image.value.height;
    const canvasRatio = canvasEl.width / canvasEl.height;

    if (imgRatio > canvasRatio) {
      // 图片更宽，以宽度为基准
      scale = canvasEl.width / currentZoom.value / image.value.width;
    } else {
      // 图片更高，以高度为基准
      scale = canvasEl.height / currentZoom.value / image.value.height;
    }
  }

  for (const dot of dots.value) {
    let x, y;

    if (currentZoom.value === MIN_ZOOM) {
      // 在最小缩放级别时，需要调整标记点位置
      x = coordsStart.value.x + dot.x * scale - markerImg.value.width / currentZoom.value / 2;
      y = coordsStart.value.y + dot.y * scale - markerImg.value.height / currentZoom.value;
    } else {
      // 正常缩放级别
      x = coordsStart.value.x + dot.x - markerImg.value.width / currentZoom.value / 2;
      y = coordsStart.value.y + dot.y - markerImg.value.height / currentZoom.value;
    }

    ctx.drawImage(
      markerImg.value,
      x,
      y,
      markerImg.value.width / currentZoom.value,
      markerImg.value.height / currentZoom.value
    );
  }

  if (dots.value.length === 2) {
    const range = calcDistance(dots.value);
    drawLine();
    drawRangeValue(range);
  }
};

const drawLine = () => {
  if (!canvas.value || !image.value) return;
  const ctx = canvas.value.getContext('2d');
  if (!ctx) return;

  // 计算缩放比例
  let scale = 1;
  if (currentZoom.value === MIN_ZOOM) {
    const canvasEl = canvas.value;
    const imgRatio = image.value.width / image.value.height;
    const canvasRatio = canvasEl.width / canvasEl.height;

    if (imgRatio > canvasRatio) {
      // 图片更宽，以宽度为基准
      scale = canvasEl.width / currentZoom.value / image.value.width;
    } else {
      // 图片更高，以高度为基准
      scale = canvasEl.height / currentZoom.value / image.value.height;
    }
  }

  ctx.beginPath();

  if (currentZoom.value === MIN_ZOOM) {
    // 在最小缩放级别时，需要调整线条位置
    ctx.moveTo(coordsStart.value.x + dots.value[0].x * scale, coordsStart.value.y + dots.value[0].y * scale);
    ctx.lineTo(coordsStart.value.x + dots.value[1].x * scale, coordsStart.value.y + dots.value[1].y * scale);
  } else {
    // 正常缩放级别
    ctx.moveTo(coordsStart.value.x + dots.value[0].x, coordsStart.value.y + dots.value[0].y);
    ctx.lineTo(coordsStart.value.x + dots.value[1].x, coordsStart.value.y + dots.value[1].y);
  }

  ctx.strokeStyle = "yellow";
  ctx.lineWidth = 1.5 / currentZoom.value;
  ctx.stroke();
};

const drawRangeValue = (distance: number) => {
  if (!canvas.value || !image.value) return;
  const middlePoint = getMiddlePoint(dots.value);
  if (!middlePoint) return;

  const ctx = canvas.value.getContext('2d');
  if (!ctx) return;

  // 计算缩放比例
  let scale = 1;
  if (currentZoom.value === MIN_ZOOM) {
    const canvasEl = canvas.value;
    const imgRatio = image.value.width / image.value.height;
    const canvasRatio = canvasEl.width / canvasEl.height;

    if (imgRatio > canvasRatio) {
      scale = canvasEl.width / currentZoom.value / image.value.width;
    } else {
      scale = canvasEl.height / currentZoom.value / image.value.height;
    }
  }

  let labelPos: ICoords;

  if (currentZoom.value === MIN_ZOOM) {
    labelPos = {
      x: coordsStart.value.x + middlePoint.x * scale,
      y: coordsStart.value.y + middlePoint.y * scale + 10 / currentZoom.value
    };
  } else {
    labelPos = {
      x: coordsStart.value.x + middlePoint.x,
      y: coordsStart.value.y + middlePoint.y + 10 / currentZoom.value
    };
  }

  // 设置标签尺寸
  const padding = 16 / currentZoom.value;
  const height = 36 / currentZoom.value;
  const fontSize = 20 / currentZoom.value;
  const smallFontSize = 14 / currentZoom.value;

  // 计算文本宽度
  ctx.font = `bold ${fontSize}px Verdana`;
  const distanceText = distance.toFixed(0);
  const distanceWidth = ctx.measureText(distanceText).width;

  ctx.font = `${smallFontSize}px Verdana`;
  const unitText = "米";
  const unitWidth = ctx.measureText(unitText).width;

  const spacing = 4 / currentZoom.value; // 数字和单位之间的间距
  const totalWidth = distanceWidth + spacing + unitWidth + padding * 2;

  // 绘制背景
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = 8 / currentZoom.value;
  ctx.shadowOffsetY = 2 / currentZoom.value;

  // 绘制主背景
  ctx.beginPath();
  ctx.roundRect(
    labelPos.x - totalWidth / 2,
    labelPos.y - height / 2,
    totalWidth,
    height,
    8 / currentZoom.value
  );
  ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
  ctx.fill();

  // 绘制边框
  ctx.strokeStyle = 'rgba(255, 204, 0, 0.3)';
  ctx.lineWidth = 1 / currentZoom.value;
  ctx.stroke();

  ctx.restore();

  // 计算文本的整体宽度和中心位置
  const textTotalWidth = distanceWidth + spacing + unitWidth;
  const textStartX = labelPos.x - textTotalWidth / 2;
  const centerY = labelPos.y + fontSize * 0.35;

  // 绘制距离数字
  ctx.font = `bold ${fontSize}px Verdana`;
  ctx.fillStyle = '#ffcc00';
  ctx.textAlign = 'left';
  ctx.fillText(distanceText, textStartX, centerY);

  // 绘制单位
  ctx.font = `${smallFontSize}px Verdana`;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.fillText(unitText, textStartX + distanceWidth + spacing, centerY);
};

const placeMarks = (coords: ICoords) => {
  if (dots.value.length < 2) {
    dots.value.push(coords);
    drawMarks();
  }
  else {
    dots.value = [coords];
    draw();
  }
};

const moveMarker = (index: number, coords: ICoords) => {
  // TODO: need optimizations
  dots.value[index] = coords;
  draw();
};

const handleZoom = (direction: 'inc' | 'dec') => {
  const limit = direction === "inc" ? MAX_ZOOM : MIN_ZOOM;
  // 检查是否已经达到缩放限制
  if ((direction === "inc" && currentZoom.value >= limit) ||
    (direction === "dec" && currentZoom.value <= limit)) {
    return;
  }

  const delta = direction === "inc" ? ZOOM_STEP : -ZOOM_STEP;
  // 确保缩放值不会小于最小值或大于最大值
  const newZoom = +(currentZoom.value + delta).toFixed(2);
  currentZoom.value = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));

  setZoom();
  draw();
};

const incZoom = () => {
  handleZoom('inc');
};

const decZoom = () => {
  handleZoom('dec');
};

const getClickCoordsOverCanvas = (coords: ICoords): ICoords => {
  if (!canvas.value || !image.value) return { ...emptyCoords };
  const boundingRect = canvas.value.getBoundingClientRect();

  // 获取鼠标在画布上的相对位置
  const relativeX = (coords.x - boundingRect.x) / currentZoom.value;
  const relativeY = (coords.y - boundingRect.y) / currentZoom.value;

  // 计算点击位置相对于地图图片的坐标
  const clickCoords: ICoords = {
    x: -coordsStart.value.x + relativeX,
    y: -coordsStart.value.y + relativeY
  };

  // 如果是最小缩放级别，需要考虑地图的缩放比例
  if (currentZoom.value === MIN_ZOOM && image.value) {
    const canvasEl = canvas.value;
    const imgRatio = image.value.width / image.value.height;
    const canvasRatio = canvasEl.width / canvasEl.height;

    let scale;
    if (imgRatio > canvasRatio) {
      // 图片更宽，以宽度为基准
      scale = canvasEl.width / currentZoom.value / image.value.width;
    } else {
      // 图片更高，以高度为基准
      scale = canvasEl.height / currentZoom.value / image.value.height;
    }

    // 调整坐标以匹配缩放后的地图
    clickCoords.x = clickCoords.x / scale;
    clickCoords.y = clickCoords.y / scale;
  }

  return clickCoords;
};

const getMarkerUnderCursor = (coords: ICoords): number | null => {
  if (!markerImg.value) return null;
  const clickCoords = getClickCoordsOverCanvas(coords);

  for (const [index, dot] of dots.value.entries()) {
    if (
      clickCoords.x >= dot.x - markerImg.value.width / currentZoom.value / 2
      &&
      clickCoords.x <= dot.x + markerImg.value.width / currentZoom.value / 2
      &&
      clickCoords.y >= dot.y - markerImg.value.height / currentZoom.value
      &&
      clickCoords.y <= dot.y
    ) return index;
  }

  return null;
};

const handleWheel = (event: WheelEvent) => {
  if (dragging.value) return;

  // 阻止默认滚动行为
  event.preventDefault();

  const { deltaY, clientX, clientY } = event;
  const direction = deltaY > 0 ? 'dec' : 'inc';
  const limit = direction === "inc" ? MAX_ZOOM : MIN_ZOOM;

  // 检查是否已经达到缩放限制
  if ((direction === "inc" && currentZoom.value >= limit) ||
    (direction === "dec" && currentZoom.value <= limit)) {
    return;
  }

  // 获取鼠标相对于画布的位置
  if (!canvas.value || !image.value) return;
  const rect = canvas.value.getBoundingClientRect();
  const mouseX = clientX - rect.left;
  const mouseY = clientY - rect.top;

  // 计算当前缩放下的地图尺寸和位置
  const canvasWidth = canvas.value.width;
  const canvasHeight = canvas.value.height;
  const currentMapWidth = image.value.width * currentZoom.value;
  const currentMapHeight = image.value.height * currentZoom.value;

  // 计算地图在画布中的居中位置
  const mapX = (canvasWidth - currentMapWidth) / 2;
  const mapY = (canvasHeight - currentMapHeight) / 2;

  // 计算鼠标相对于地图内容的位置（考虑当前偏移和居中位置）
  const relativeX = (mouseX - mapX + currentOffset.value.x) / currentMapWidth;
  const relativeY = (mouseY - mapY + currentOffset.value.y) / currentMapHeight;

  // 计算新的缩放值
  const delta = direction === "inc" ? ZOOM_STEP : -ZOOM_STEP;
  const newZoom = +(currentZoom.value + delta).toFixed(2);
  currentZoom.value = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));

  // 计算新的地图尺寸
  const newMapWidth = image.value.width * currentZoom.value;
  const newMapHeight = image.value.height * currentZoom.value;

  // 计算新的地图居中位置
  const newMapX = (canvasWidth - newMapWidth) / 2;
  const newMapY = (canvasHeight - newMapHeight) / 2;

  // 计算新的偏移量，保持鼠标指向的地图位置不变
  currentOffset.value = {
    x: relativeX * newMapWidth - (mouseX - newMapX),
    y: relativeY * newMapHeight - (mouseY - newMapY)
  };
  offset.value = { ...currentOffset.value };

  setZoom();
  draw();
};

const handleMouseDown = (event: PointerEvent) => {
  if (event.button == 0) {  // 左键点击
    if (isMeasureMode.value) {
      // 在测量模式下，左键点击添加测量点
      const dotCoords = getClickCoordsOverCanvas({ x: event.clientX, y: event.clientY });
      placeMarks(dotCoords);
      return;
    }

    if (dots.value.length > 0) {
      const markerUnderCursor = getMarkerUnderCursor({ x: event.clientX, y: event.clientY });

      if (markerUnderCursor !== null) {
        movingMarker.value = markerUnderCursor;
        return;
      }
    }

    touchStart.value.x = event.clientX;
    touchStart.value.y = event.clientY;
    dragging.value = true;
  }
  else if (event.button == 2) {  // 右键点击
    if (!canvas.value || !image.value) return;
    const dotCoords = getClickCoordsOverCanvas({ x: event.clientX, y: event.clientY });
    placeMarks(dotCoords);
  }
};

const handleMouseUp = () => {
  dragging.value = false;
  movingMarker.value = null;
  offset.value = { ...currentOffset.value };
};

const disableContextMenu = (event: MouseEvent) => {
  event.preventDefault();
};

const handleMouseMove = (event: PointerEvent) => {
  if (dragging.value) {
    // 计算鼠标移动的距离
    const deltaX = touchStart.value.x - event.clientX;
    const deltaY = touchStart.value.y - event.clientY;

    // 根据当前缩放级别调整偏移量
    currentOffset.value = {
      x: offset.value.x + deltaX,
      y: offset.value.y + deltaY
    };

    draw();
  } else if (movingMarker.value !== null) {
    const coordsUnderCursor = getClickCoordsOverCanvas({ x: event.clientX, y: event.clientY });
    moveMarker(movingMarker.value, coordsUnderCursor);
  }

  // 更新鼠标坐标
  if (canvas.value && image.value) {
    const coords = getClickCoordsOverCanvas({ x: event.clientX, y: event.clientY });

    // 将坐标转换为0-800范围内的值（PUBG地图标准尺寸）
    const mapSize = 800; // PUBG地图标准尺寸
    const normalizedX = Math.round((coords.x / image.value.width) * mapSize);
    const normalizedY = Math.round((coords.y / image.value.height) * mapSize);

    // 确保坐标在有效范围内
    if (normalizedX >= 0 && normalizedX <= mapSize && normalizedY >= 0 && normalizedY <= mapSize) {
      mousePosition.value = { x: normalizedX, y: normalizedY };
    }
  }

  // 检查标签悬停
  checkTagHover(event.clientX, event.clientY);
};

// 切换坐标显示
const toggleCoordinates = () => {
  showCoordinates.value = !showCoordinates.value;
};

// 添加清除标记和重置缩放的方法
const clearMarkers = () => {
  dots.value = [];
  draw();
};

const resetZoom = () => {
  // 重置缩放级别为最小值
  currentZoom.value = MIN_ZOOM;
  // 重置偏移量
  currentOffset.value = { ...emptyCoords };
  offset.value = { ...emptyCoords };

  setZoom();
  draw();
};

const handleResize = () => {
  if (!wrapper.value || !canvas.value) return;

  canvas.value.width = wrapper.value.offsetWidth;
  canvas.value.height = wrapper.value.offsetHeight;

  setZoom();
  draw();
};

// 添加标签类型定义
interface TagStyle {
  shadowColor: string;
  strokeColor: string;
  borderColor: string;
  img: HTMLImageElement | null;
}

// 绘制地图标签
const drawMapTags = () => {
  if (!canvas.value || !image.value) return;
  const ctx = canvas.value.getContext('2d');
  if (!ctx) return;

  // 计算缩放比例
  let scale = 1;
  if (currentZoom.value === MIN_ZOOM) {
    const canvasEl = canvas.value;
    const imgRatio = image.value.width / image.value.height;
    const canvasRatio = canvasEl.width / canvasEl.height;
    scale = imgRatio > canvasRatio
      ? canvasEl.width / currentZoom.value / image.value.width
      : canvasEl.height / currentZoom.value / image.value.height;
  }

  // 定义标签样式映射
  const tagStyles: Record<string, TagStyle> = {
    bearCave: {
      shadowColor: 'rgba(139, 69, 19, 0.8)',
      strokeColor: 'rgba(139, 69, 19, 0.6)',
      borderColor: 'rgba(139, 69, 19, 0.3)',
      img: bearCaveImg.value
    },
    crowbarRoom: {
      shadowColor: 'rgba(65, 105, 225, 0.8)',
      strokeColor: 'rgba(65, 105, 225, 0.6)',
      borderColor: 'rgba(65, 105, 225, 0.3)',
      img: crowbarRoomImg.value
    },
    experimentalCamp: {
      shadowColor: 'rgba(255, 69, 0, 0.8)',
      strokeColor: 'rgba(255, 69, 0, 0.6)',
      borderColor: 'rgba(255, 69, 0, 0.3)',
      img: experimentalCampImg.value
    },
    groundVehicle: {
      shadowColor: 'rgba(65, 105, 225, 0.8)',
      strokeColor: 'rgba(65, 105, 225, 0.6)',
      borderColor: 'rgba(65, 105, 225, 0.3)',
      img: groundVehicleImg.value
    },
    airVehicle: {
      shadowColor: 'rgba(220, 20, 60, 0.8)',
      strokeColor: 'rgba(220, 20, 60, 0.6)',
      borderColor: 'rgba(220, 20, 60, 0.3)',
      img: airVehicleImg.value
    },
    secretRoom: {
      shadowColor: 'rgba(255, 165, 0, 0.8)',
      strokeColor: 'rgba(255, 165, 0, 0.6)',
      borderColor: 'rgba(255, 165, 0, 0.3)',
      img: secretRoomImg.value
    },
    emergencyDoor: {
      shadowColor: 'rgba(0, 191, 255, 0.8)',
      strokeColor: 'rgba(0, 191, 255, 0.6)',
      borderColor: 'rgba(0, 191, 255, 0.3)',
      img: emergencyDoorImg.value
    }
  };

  // 设置固定的图标大小和动画参数
  const ICON_SIZE = 36;
  const HOVER_SCALE = 1.2;
  const PULSE_INTENSITY = 0.15;
  const PULSE_SPEED = 3;

  // 通用绘制标签函数
  const drawTag = (tag: any, tagType: string) => {
    if (!image.value) return;

    const mapSize = 800;
    const x = coordsStart.value.x + (tag.position.x / mapSize * image.value.width) * (currentZoom.value === MIN_ZOOM ? scale : 1);
    const y = coordsStart.value.y + (tag.position.y / mapSize * image.value.height) * (currentZoom.value === MIN_ZOOM ? scale : 1);

    const style = tagStyles[tagType];
    if (!style || !style.img) return;

    const isHovered = hoveredTag.value && hoveredTag.value.id === tag.id;
    const pulseScale = isHovered ? 1 + PULSE_INTENSITY * Math.sin(animationTime.value * PULSE_SPEED) : 1;
    const actualSize = ICON_SIZE * (isHovered ? HOVER_SCALE * pulseScale : 1) / currentZoom.value;

    if (isHovered) {
      ctx.save();
      // 绘制发光效果
      ctx.shadowColor = style.shadowColor;
      ctx.shadowBlur = 15 * pulseScale;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // 绘制虚线连接
      ctx.beginPath();
      ctx.strokeStyle = style.strokeColor;
      ctx.lineWidth = 2 / currentZoom.value;
      ctx.setLineDash([5 / currentZoom.value, 5 / currentZoom.value]);
      ctx.moveTo(x, y);
      ctx.lineTo(x, y - actualSize);
      ctx.stroke();

      // 绘制图标
      ctx.drawImage(style.img, x - actualSize / 2, y - actualSize, actualSize, actualSize);

      // 绘制名称标签
      const fontSize = 14 / currentZoom.value;
      ctx.font = `${fontSize}px Verdana`;
      const textWidth = ctx.measureText(tag.name).width;
      const padding = 8 / currentZoom.value;
      const textY = y - actualSize - (16 / currentZoom.value);

      // 绘制背景
      const bgHeight = 24 / currentZoom.value;
      const radius = 6 / currentZoom.value;
      const bgX = x - (textWidth / 2 + padding);
      const bgWidth = textWidth + padding * 2;

      ctx.beginPath();
      ctx.roundRect(bgX, textY - bgHeight / 2, bgWidth, bgHeight, radius);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.fill();

      // 绘制边框
      ctx.strokeStyle = style.borderColor;
      ctx.lineWidth = 1 / currentZoom.value;
      ctx.stroke();

      // 绘制文本
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(tag.name, x, textY);

      ctx.restore();
    } else {
      ctx.drawImage(style.img, x - actualSize / 2, y - actualSize, actualSize, actualSize);
    }
  };

  // 绘制各类型标记
  if (showBearCaves.value) {
    bearCavesList.value.forEach(cave => drawTag(cave, 'bearCave'));
  }
  if (showCrowbarRooms.value) {
    crowbarRoomsList.value.forEach(room => drawTag(room, 'crowbarRoom'));
  }
  if (showExperimentalCamps.value) {
    experimentalCampsList.value.forEach(camp => drawTag(camp, 'experimentalCamp'));
  }
  if (showGroundVehicles.value) {
    mapTags.value.filter(tag => getTagType(tag) === 'groundVehicle').forEach(tag => drawTag(tag, 'groundVehicle'));
  }
  if (showAirVehicles.value) {
    mapTags.value.filter(tag => getTagType(tag) === 'airVehicle').forEach(tag => drawTag(tag, 'airVehicle'));
  }
  if (showSecretRooms.value) {
    secretRoomsList.value.forEach(room => drawTag(room, 'secretRoom'));
  }
  if (showEmergencyDoors.value) {
    emergencyDoorsList.value.forEach(door => drawTag(door, 'emergencyDoor'));
  }
};

// 检查鼠标是否悬停在标签上
const checkTagHover = (mouseX: number, mouseY: number) => {
  if (!canvas.value || !image.value) return;

  const coords = getClickCoordsOverCanvas({ x: mouseX, y: mouseY });
  const mapSize = 800;

  const normalizedX = (coords.x / image.value.width) * mapSize;
  const normalizedY = (coords.y / image.value.height) * mapSize;

  const HOVER_DETECTION_RADIUS = 7;

  let foundHoveredTag = false;

  // 检查密室
  if (showSecretRooms.value) {
    for (const room of secretRoomsList.value) {
      const dx = normalizedX - room.position.x;
      const dy = normalizedY - room.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < HOVER_DETECTION_RADIUS) {
        hoveredTag.value = {
          id: room.id,
          name: room.name,
          position: room.position,
          type: 'secretRoom'
        };
        foundHoveredTag = true;
        break;
      }
    }
  }

  // 检查熊洞
  if (!foundHoveredTag && showBearCaves.value) {
    for (const cave of bearCavesList.value) {
      const dx = normalizedX - cave.position.x;
      const dy = normalizedY - cave.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < HOVER_DETECTION_RADIUS) {
        hoveredTag.value = {
          id: cave.id,
          name: cave.name,
          position: cave.position,
          type: 'bearCave'
        };
        foundHoveredTag = true;
        break;
      }
    }
  }

  // 检查撬棍房间
  if (!foundHoveredTag && showCrowbarRooms.value) {
    for (const room of crowbarRoomsList.value) {
      const dx = normalizedX - room.position.x;
      const dy = normalizedY - room.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < HOVER_DETECTION_RADIUS) {
        hoveredTag.value = {
          id: room.id,
          name: room.name,
          position: room.position,
          type: 'crowbarRoom'
        };
        foundHoveredTag = true;
        break;
      }
    }
  }

  // 检查载具标签
  if (!foundHoveredTag) {
    for (const tag of mapTags.value) {
      const tagType = getTagType(tag);

      // 只检查载具类型的标签
      if (
        (tagType === 'groundVehicle' && !showGroundVehicles.value) ||
        (tagType === 'airVehicle' && !showAirVehicles.value)
      ) {
        continue;
      }

      const dx = normalizedX - tag.position.x;
      const dy = normalizedY - tag.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < HOVER_DETECTION_RADIUS) {
        hoveredTag.value = tag;
        foundHoveredTag = true;
        break;
      }
    }
  }

  // 检查实验营地
  if (!foundHoveredTag && showExperimentalCamps.value) {
    for (const camp of experimentalCampsList.value) {
      const dx = normalizedX - camp.position.x;
      const dy = normalizedY - camp.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < HOVER_DETECTION_RADIUS) {
        hoveredTag.value = {
          id: camp.id,
          name: camp.name,
          position: camp.position,
          type: 'experimentalCamp'
        };
        foundHoveredTag = true;
        break;
      }
    }
  }

  // 检查安全门
  if (!foundHoveredTag && showEmergencyDoors.value) {
    for (const door of emergencyDoorsList.value) {
      const dx = normalizedX - door.position.x;
      const dy = normalizedY - door.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < HOVER_DETECTION_RADIUS) {
        hoveredTag.value = {
          id: door.id,
          name: door.name,
          position: door.position,
          type: 'emergencyDoor'
        };
        foundHoveredTag = true;
        break;
      }
    }
  }

  if (!foundHoveredTag && hoveredTag.value !== null) {
    hoveredTag.value = null;
  }

  if (foundHoveredTag && !animationFrameId.value) {
    animationTime.value = Date.now() * 0.001;
    animate();
  } else if (!foundHoveredTag && animationFrameId.value) {
    cancelAnimationFrame(animationFrameId.value);
    animationFrameId.value = null;
  }

  draw();
};

// 切换标签显示
const toggleGroundVehicles = () => {
  showGroundVehicles.value = !showGroundVehicles.value;
  draw();
};

const toggleAirVehicles = () => {
  showAirVehicles.value = !showAirVehicles.value;
  draw();
};

const toggleSecretRooms = () => {
  showSecretRooms.value = !showSecretRooms.value;
  draw();
};

const toggleExperimentalCamps = () => {
  showExperimentalCamps.value = !showExperimentalCamps.value;
  draw();
};

const toggleEmergencyDoors = () => {
  showEmergencyDoors.value = !showEmergencyDoors.value;
  draw();
};

const hoveredSecretRoom = ref<ISecretRoom | null>(null);

const handleSecretRoomHover = (room: ISecretRoom | null) => {
  hoveredSecretRoom.value = room;
  draw();
};

// 生命周期钩子
onMounted(() => {
  // 初始检测是否为手机模式
  checkMobile();
  // 添加窗口大小变化的监听器
  window.addEventListener('resize', checkMobile);

  const mapParams = getMapParams(props.mapName);
  if (!mapParams) return;

  // 使用最小缩放值而不是默认缩放值
  currentZoom.value = MIN_ZOOM;

  if (!wrapper.value || !canvas.value) return;
  context.value = canvas.value.getContext('2d');

  image.value = new Image();
  image.value.src = mapParams.layout;

  markerImg.value = new Image();
  markerImg.value.src = markerSvg;

  backgroundImg.value = new Image();
  backgroundImg.value.src = gridBg;

  image.value.onload = () => {
    if (!image.value || !canvas.value || !wrapper.value) return;

    canvas.value.width = wrapper.value.offsetWidth;
    canvas.value.height = wrapper.value.offsetHeight;

    gridImage.value = new Image();
    gridImage.value.src = mapParams.grid;

    groundVehicleImg.value = new Image();
    groundVehicleImg.value.src = groundVehiclesSvg;

    airVehicleImg.value = new Image();
    airVehicleImg.value.src = airVehiclesSvg;

    secretRoomImg.value = new Image();
    secretRoomImg.value.src = secretRoomsSvg;

    bearCaveImg.value = new Image();
    bearCaveImg.value.src = bearCaveSvg;

    crowbarRoomImg.value = new Image();
    crowbarRoomImg.value.src = crowbarRoomSvg;

    experimentalCampImg.value = new Image();
    experimentalCampImg.value.src = experimentalCampSvg;

    emergencyDoorImg.value = new Image();
    emergencyDoorImg.value.src = emergencyDoorSvg;

    gridImage.value.onload = () => {
      setZoom();
      draw();

      maploading.value = false;
    };
  };

  // 添加窗口大小变化的监听器
  window.addEventListener('resize', handleResize);

  // 加载地图标签
  if (props.mapName) {
    mapTags.value = getAllMapTags(props.mapName as any);
  }

  // 添加触摸事件监听器
  if (canvas.value) {
    canvas.value.addEventListener('touchstart', handleTouchStart);
    canvas.value.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.value.addEventListener('touchend', handleTouchEnd);
  }
});

// 组件卸载时移除事件监听器
onUnmounted(() => {
  if (animationFrameId.value) {
    cancelAnimationFrame(animationFrameId.value);
  }
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('resize', checkMobile);

  // 移除触摸事件监听器
  if (canvas.value) {
    canvas.value.removeEventListener('touchstart', handleTouchStart);
    canvas.value.removeEventListener('touchmove', handleTouchMove);
    canvas.value.removeEventListener('touchend', handleTouchEnd);
  }
});

// 监听地图变化，更新标签
watch(() => props.mapName, (newMap) => {
  if (newMap) {
    mapTags.value = getAllMapTags(newMap as any);
  }
});

// 处理触摸开始事件
const handleTouchStart = (event: TouchEvent) => {
  if (event.touches.length === 2) {
    // 两指触摸，准备缩放
    initialPinchDistance.value = getTouchDistance(event.touches[0], event.touches[1]);
    initialZoom.value = currentZoom.value;
    dragging.value = false;
  } else if (event.touches.length === 1) {
    if (isMeasureMode.value) {
      // 在测量模式下，记录触摸位置并添加标记
      const touch = event.touches[0];
      const coords = getClickCoordsOverCanvas({ x: touch.clientX, y: touch.clientY });
      placeMarks(coords);
    } else {
      // 正常模式下的单指拖动
      touchStart.value = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY
      };
      dragging.value = true;
    }
  }
};

// 处理触摸移动事件
const handleTouchMove = (event: TouchEvent) => {
  event.preventDefault(); // 阻止默认滚动行为

  if (event.touches.length === 2) {
    // 处理双指缩放
    const currentDistance = getTouchDistance(event.touches[0], event.touches[1]);

    if (initialPinchDistance.value !== null) {
      const scale = currentDistance / initialPinchDistance.value;
      const zoomDelta = (scale - 1) * 0.5; // 调整缩放灵敏度
      const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, initialZoom.value * (1 + zoomDelta)));

      if (newZoom !== currentZoom.value) {
        currentZoom.value = newZoom;
        setZoom();
        draw();
      }
    }
  } else if (event.touches.length === 1 && dragging.value) {
    // 处理单指拖动
    const deltaX = touchStart.value.x - event.touches[0].clientX;
    const deltaY = touchStart.value.y - event.touches[0].clientY;

    currentOffset.value = {
      x: offset.value.x + deltaX,
      y: offset.value.y + deltaY
    };

    draw();
  }
};

// 处理触摸结束事件
const handleTouchEnd = () => {
  if (dragging.value) {
    offset.value = { ...currentOffset.value };
  }
  dragging.value = false;
  initialPinchDistance.value = null;
};

// 添加测量模式切换方法
const toggleMeasureMode = () => {
  isMeasureMode.value = !isMeasureMode.value;
  if (!isMeasureMode.value) {
    // 退出测量模式时清除标记
    clearMarkers();
  }
};
</script>

<template>
  <div class="map__wrapper">
    <div v-if="maploading" class="map__loader">
      <PulseLoader color="#ffcc00"></PulseLoader>
    </div>

    <div class="map__canvas" ref="wrapper">
      <!-- 添加密室列表组件，在非手机模式下显示 -->
      <SecretRoomList v-if="!isMobile && showSecretRooms && hasSecretRooms" :rooms="secretRoomsList"
        @hover="handleSecretRoomHover" />

      <div class="map_buttons">
        <div class="map_bttn_wrapper">
          <button @click="incZoom" class="map_bttn">+</button>
          <div class="tooltip">放大</div>
        </div>
        <div class="map_bttn_wrapper">
          <button @click="decZoom" class="map_bttn">-</button>
          <div class="tooltip">缩小</div>
        </div>
        <div class="map_bttn_wrapper">
          <button @click="resetZoom" class="map_bttn">
            <span class="reset-icon">⟲</span>
          </button>
          <div class="tooltip">重置视图</div>
        </div>
        <!-- 添加测量模式按钮，仅在手机模式下显示 -->
        <div class="map_bttn_wrapper" v-if="isMobile">
          <button @click="toggleMeasureMode" class="map_bttn" :class="{ 'active': isMeasureMode }">
            <span class="measure-icon">📏</span>
          </button>
          <div class="tooltip">{{ isMeasureMode ? '退出测量' : '测量距离' }}</div>
        </div>
        <div class="map_bttn_wrapper">
          <button @click="clearMarkers" class="map_bttn">
            <span class="clear-icon">✕</span>
          </button>
          <div class="tooltip">清除标记</div>
        </div>
        <div class="map_bttn_wrapper">
          <button @click="toggleCoordinates" class="map_bttn">
            <span class="coords-icon">⊕</span>
          </button>
          <div class="tooltip">显示/隐藏坐标</div>
        </div>
        <div class="map_bttn_wrapper" v-if="hasGroundVehicles">
          <button @click="toggleGroundVehicles" class="map_bttn"
            :class="{ 'active': showGroundVehicles, 'ground-vehicle': true }">
            <img :src="groundVehiclesSvg" alt="地面载具" class="button-svg" />
          </button>
          <div class="tooltip">地面载具</div>
        </div>
        <div class="map_bttn_wrapper" v-if="hasAirVehicles">
          <button @click="toggleAirVehicles" class="map_bttn"
            :class="{ 'active': showAirVehicles, 'air-vehicle': true }">
            <img :src="airVehiclesSvg" alt="飞行载具" class="button-svg" />
          </button>
          <div class="tooltip">飞行载具</div>
        </div>
        <div class="map_bttn_wrapper" v-if="hasSecretRooms">
          <button @click="toggleSecretRooms" class="map_bttn"
            :class="{ 'active': showSecretRooms, 'secret-room': true }">
            <img :src="secretRoomsSvg" alt="密室位置" class="button-svg" />
          </button>
          <div class="tooltip">密室位置</div>
        </div>
        <div class="map_bttn_wrapper" v-if="hasBearCaves">
          <button @click="showBearCaves = !showBearCaves" class="map_bttn"
            :class="{ 'active': showBearCaves, 'bear-cave': true }">
            <img :src="bearCaveSvg" alt="熊洞" class="button-svg" />
          </button>
          <div class="tooltip">熊洞</div>
        </div>
        <div class="map_bttn_wrapper" v-if="hasCrowbarRooms">
          <button @click="showCrowbarRooms = !showCrowbarRooms" class="map_bttn"
            :class="{ 'active': showCrowbarRooms, 'crowbar-room': true }">
            <img :src="crowbarRoomSvg" alt="撬棍房" class="button-svg" />
          </button>
          <div class="tooltip">撬棍房</div>
        </div>
        <div class="map_bttn_wrapper" v-if="hasExperimentalCamps">
          <button @click="toggleExperimentalCamps" class="map_bttn"
            :class="{ 'active': showExperimentalCamps, 'experimental-camp': true }">
            <img :src="experimentalCampSvg" alt="实验营地" class="button-svg" />
          </button>
          <div class="tooltip">实验营地</div>
        </div>
        <div class="map_bttn_wrapper" v-if="hasEmergencyDoors">
          <button @click="toggleEmergencyDoors" class="map_bttn"
            :class="{ 'active': showEmergencyDoors, 'emergency-door': true }">
            <img :src="emergencyDoorSvg" alt="安全门" class="button-svg" />
          </button>
          <div class="tooltip">安全门</div>
        </div>
      </div>

      <!-- 坐标显示 -->
      <div v-if="showCoordinates && mousePosition" class="coordinates-display">
        <span>X: {{ mousePosition.x }}</span>
        <span>Y: {{ mousePosition.y }}</span>
      </div>

      <!-- 图例说明 -->
      <div class="map-legend"
        v-if="showGroundVehicles || showAirVehicles || showSecretRooms || showBearCaves || showCrowbarRooms || showExperimentalCamps || showEmergencyDoors">
        <div class="legend-title">图例</div>
        <div class="legend-item" v-if="showGroundVehicles">
          <img :src="groundVehiclesSvg" alt="地面载具" class="legend-svg" />
          <div class="legend-text">地面载具</div>
        </div>
        <div class="legend-item" v-if="showAirVehicles">
          <img :src="airVehiclesSvg" alt="飞行载具" class="legend-svg" />
          <div class="legend-text">飞行载具</div>
        </div>
        <div class="legend-item" v-if="showSecretRooms">
          <img :src="secretRoomsSvg" alt="密室位置" class="legend-svg" />
          <div class="legend-text">密室位置</div>
        </div>
        <div class="legend-item" v-if="showBearCaves && hasBearCaves">
          <img :src="bearCaveSvg" alt="熊洞" class="legend-svg" />
          <div class="legend-text">熊洞</div>
        </div>
        <div class="legend-item" v-if="showCrowbarRooms && hasCrowbarRooms">
          <img :src="crowbarRoomSvg" alt="撬棍房" class="legend-svg" />
          <div class="legend-text">撬棍房</div>
        </div>
        <div class="legend-item" v-if="showExperimentalCamps && hasExperimentalCamps">
          <img :src="experimentalCampSvg" alt="实验营地" class="legend-svg" />
          <div class="legend-text">实验营地</div>
        </div>
        <div class="legend-item" v-if="showEmergencyDoors && hasEmergencyDoors">
          <img :src="emergencyDoorSvg" alt="安全门" class="legend-svg" />
          <div class="legend-text">安全门</div>
        </div>
      </div>

      <canvas @contextmenu="disableContextMenu" @pointerdown="handleMouseDown" @pointerup="handleMouseUp"
        @pointermove="handleMouseMove" @wheel="handleWheel" ref="canvas" :class="{ 'measure-mode': isMeasureMode }">
      </canvas>
    </div>
  </div>
</template>

<style scoped>
.map__loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  position: absolute;
  background: rgba(0, 0, 0, 0.8);
  z-index: 10;
}

.map__canvas {
  height: 100%;
  width: 100%;
  flex: 1 0 auto;
  position: relative;
}

.map__wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #1a1a1a;
}

.map_buttons {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 8px;
  backdrop-filter: blur(5px);
}

.map_bttn_wrapper {
  position: relative;
}

.map_bttn_wrapper .tooltip {
  position: absolute;
  right: 50px;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 13px;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  pointer-events: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.map_bttn_wrapper:hover .tooltip {
  opacity: 1;
  visibility: visible;
  right: 55px;
}

.map_bttn {
  background-color: rgba(0, 0, 0, 0.85);
  color: white;
  font-size: 20px;
  cursor: pointer;
  height: 36px;
  width: 36px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: hidden;
}

.map_bttn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.1), transparent);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.map_bttn:hover {
  background-color: rgba(0, 0, 0, 0.95);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.map_bttn:hover::before {
  opacity: 1;
}

.map_bttn:active {
  transform: translateY(0);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.reset-icon {
  font-size: 18px;
  color: #ffcc00;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.clear-icon {
  font-size: 16px;
  color: #ff4444;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.coords-icon {
  font-size: 16px;
  color: #00ccff;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.map_bttn:hover .reset-icon {
  transform: scale(1.15) rotate(180deg);
  text-shadow: 0 0 10px rgba(255, 204, 0, 0.6);
}

.map_bttn:hover .clear-icon {
  transform: scale(1.15) rotate(90deg);
  text-shadow: 0 0 10px rgba(255, 68, 68, 0.6);
}

.map_bttn:hover .coords-icon {
  transform: scale(1.15);
  text-shadow: 0 0 10px rgba(0, 204, 255, 0.6);
}

.coordinates-display {
  position: absolute;
  bottom: 20px;
  left: 20px;
  background: rgba(0, 0, 0, 0.85);
  color: #ffcc00;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-family: 'Monaco', 'Consolas', monospace;
  display: flex;
  gap: 20px;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 204, 0, 0.3);
  backdrop-filter: blur(5px);
}

.coordinates-display span {
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.map_bttn.active {
  background: rgba(255, 204, 0, 0.9);
  border-color: #ffcc00;
  box-shadow: 0 0 15px rgba(255, 204, 0, 0.4);
}

.map_bttn.ground-vehicle {
  border-color: rgba(65, 105, 225, 0.3);
}

.map_bttn.air-vehicle {
  border-color: rgba(220, 20, 60, 0.3);
}

.map_bttn.secret-room {
  border-color: rgba(255, 165, 0, 0.3);
}

.map_bttn.active.ground-vehicle {
  background: rgba(65, 105, 225, 0.9);
  border-color: rgb(65, 105, 225);
  box-shadow: 0 0 15px rgba(65, 105, 225, 0.4);
}

.map_bttn.active.air-vehicle {
  background: rgba(220, 20, 60, 0.9);
  border-color: rgb(220, 20, 60);
  box-shadow: 0 0 15px rgba(220, 20, 60, 0.4);
}

.map_bttn.active.secret-room {
  background: rgba(255, 165, 0, 0.9);
  border-color: rgb(255, 165, 0);
  box-shadow: 0 0 15px rgba(255, 165, 0, 0.4);
}

.map-legend {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.85);
  border-radius: 8px;
  padding: 12px 16px;
  color: white;
  font-size: 13px;
  z-index: 2;
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(5px);
  min-width: 120px;
}

.legend-title {
  font-weight: 600;
  margin-bottom: 10px;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  padding-bottom: 6px;
  color: #ffcc00;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.legend-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  padding: 4px 0;
  transition: all 0.2s ease;
}

.legend-item:hover {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.legend-text {
  flex: 1;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
}

.legend-svg {
  width: 20px;
  height: 20px;
  margin-right: 10px;
  opacity: 0.9;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.button-svg {
  width: 20px;
  height: 20px;
  opacity: 0.9;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.map_bttn:hover .button-svg {
  opacity: 1;
  transform: scale(1.15) rotate(8deg);
  filter: drop-shadow(0 4px 8px rgba(255, 204, 0, 0.4));
}

.map_bttn.active .button-svg {
  transform: scale(1.1);
  filter: drop-shadow(0 0 8px rgba(255, 204, 0, 0.6));
}

.map_bttn.ground-vehicle:hover .button-svg {
  filter: drop-shadow(0 4px 8px rgba(65, 105, 225, 0.4));
}

.map_bttn.air-vehicle:hover .button-svg {
  filter: drop-shadow(0 4px 8px rgba(220, 20, 60, 0.4));
}

.map_bttn.secret-room:hover .button-svg {
  filter: drop-shadow(0 4px 8px rgba(255, 165, 0, 0.4));
}

.reset-icon {
  font-size: 18px;
  color: #ffcc00;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.clear-icon {
  font-size: 16px;
  color: #ff4444;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.coords-icon {
  font-size: 16px;
  color: #00ccff;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.map_bttn:hover .reset-icon {
  transform: scale(1.15) rotate(180deg);
  text-shadow: 0 0 10px rgba(255, 204, 0, 0.6);
}

.map_bttn:hover .clear-icon {
  transform: scale(1.15) rotate(90deg);
  text-shadow: 0 0 10px rgba(255, 68, 68, 0.6);
}

.map_bttn:hover .coords-icon {
  transform: scale(1.15);
  text-shadow: 0 0 10px rgba(0, 204, 255, 0.6);
}

.legend-item:nth-child(2):hover .legend-svg {
  filter: drop-shadow(0 4px 8px rgba(65, 105, 225, 0.4));
}

.legend-item:nth-child(3):hover .legend-svg {
  filter: drop-shadow(0 4px 8px rgba(220, 20, 60, 0.4));
}

.legend-item:nth-child(4):hover .legend-svg {
  filter: drop-shadow(0 4px 8px rgba(255, 165, 0, 0.4));
}

.map_bttn.bear-cave {
  border-color: rgba(139, 69, 19, 0.3);
}

.map_bttn.crowbar-room {
  border-color: rgba(65, 105, 225, 0.3);
}

.map_bttn.active.bear-cave {
  background: rgba(139, 69, 19, 0.9);
  border-color: rgb(139, 69, 19);
  box-shadow: 0 0 15px rgba(139, 69, 19, 0.4);
}

.map_bttn.active.crowbar-room {
  background: rgba(65, 105, 225, 0.9);
  border-color: rgb(65, 105, 225);
  box-shadow: 0 0 15px rgba(65, 105, 225, 0.4);
}

.map_bttn.experimental-camp {
  border-color: rgba(255, 69, 0, 0.3);
}

.map_bttn.active.experimental-camp {
  background: rgba(255, 69, 0, 0.9);
  border-color: rgb(255, 69, 0);
  box-shadow: 0 0 15px rgba(255, 69, 0, 0.4);
}

.map_bttn.emergency-door {
  border-color: rgba(0, 191, 255, 0.3);
}

.map_bttn.active.emergency-door {
  background: rgba(0, 191, 255, 0.9);
  border-color: rgb(0, 191, 255);
  box-shadow: 0 0 15px rgba(0, 191, 255, 0.4);
}

canvas {
  cursor: crosshair;
}

.measure-icon {
  font-size: 18px;
  color: #00ff00;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.map_bttn:hover .measure-icon {
  transform: scale(1.15);
  text-shadow: 0 0 10px rgba(0, 255, 0, 0.6);
}

.map_bttn.active .measure-icon {
  color: #ffffff;
  text-shadow: 0 0 10px rgba(0, 255, 0, 0.8);
}

/* 在测量模式下修改光标样式 */
canvas.measure-mode {
  cursor: crosshair;
}
</style>
