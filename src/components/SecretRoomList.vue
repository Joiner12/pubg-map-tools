<!-- SecretRoomList.vue -->
<template>
    <div class="secret-room-list" :class="{ 'list-expanded': isExpanded }">
        <div class="list-header" @click="toggleExpand">
            <div class="header-content">
                <img :src="secretRoomsSvg" alt="密室" class="header-icon" />
                <span>密室列表</span>
                <span class="room-count">({{ rooms.length }})</span>
            </div>
            <div class="expand-icon" :class="{ 'expanded': isExpanded }">
                <span>›</span>
            </div>
        </div>

        <div class="list-content" v-show="isExpanded">
            <div v-for="room in rooms" :key="room.id" class="room-item"
                :class="{ 'high-level': room.lootLevel === 3, 'mid-level': room.lootLevel === 2, 'low-level': room.lootLevel === 1 }"
                @mouseover="$emit('hover', room)" @mouseleave="$emit('hover', null)">
                <div class="room-main-info">
                    <span class="room-name">{{ room.name }}</span>
                    <div class="room-tags">
                        <span class="loot-level">Lv.{{ room.lootLevel }}</span>
                        <span class="key-required" v-if="room.keyRequired">🔑</span>
                    </div>
                </div>
                <div class="room-description">{{ room.description }}</div>
                <div class="room-coords">
                    <span>x: {{ room.position.x.toFixed(1) }}</span>
                    <span>y: {{ room.position.y.toFixed(1) }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { ISecretRoom } from '@/libs/types';
import secretRoomsSvg from '@/assets/svg/secretRooms.svg';

defineProps<{
    rooms: ISecretRoom[];
}>();

defineEmits<{
    (e: 'hover', room: ISecretRoom | null): void;
}>();

const isExpanded = ref(true);

const toggleExpand = () => {
    isExpanded.value = !isExpanded.value;
};
</script>

<style scoped>
.secret-room-list {
    position: absolute;
    left: 20px;
    top: 20px;
    width: 300px;
    background: rgba(0, 0, 0, 0.85);
    border-radius: 8px;
    color: white;
    z-index: 1000;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 165, 0, 0.3);
    backdrop-filter: blur(8px);
}

.list-header {
    padding: 12px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    border-bottom: 1px solid rgba(255, 165, 0, 0.2);
    transition: background-color 0.2s;
}

.list-header:hover {
    background: rgba(255, 165, 0, 0.1);
}

.header-content {
    display: flex;
    align-items: center;
    gap: 8px;
}

.header-icon {
    width: 20px;
    height: 20px;
}

.room-count {
    color: rgba(255, 165, 0, 0.8);
    font-size: 0.9em;
}

.expand-icon {
    font-size: 20px;
    transition: transform 0.3s;
}

.expand-icon.expanded {
    transform: rotate(90deg);
}

.list-content {
    max-height: calc(100vh - 200px);
    overflow-y: auto;
    padding: 8px;
}

.room-item {
    padding: 12px;
    margin: 8px 0;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.05);
    transition: all 0.2s;
    border: 1px solid transparent;
}

.room-item:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateX(4px);
}

.room-main-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
}

.room-name {
    font-weight: bold;
    color: #fff;
}

.room-tags {
    display: flex;
    gap: 8px;
    align-items: center;
}

.loot-level {
    font-size: 0.8em;
    padding: 2px 6px;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.1);
}

.key-required {
    font-size: 0.9em;
}

.room-description {
    font-size: 0.9em;
    color: rgba(255, 255, 255, 0.7);
    margin: 4px 0;
}

.room-coords {
    display: flex;
    gap: 12px;
    font-size: 0.8em;
    color: rgba(255, 165, 0, 0.8);
    margin-top: 4px;
}

.high-level {
    border-color: rgba(255, 69, 0, 0.5);
}

.mid-level {
    border-color: rgba(255, 165, 0, 0.5);
}

.low-level {
    border-color: rgba(144, 238, 144, 0.5);
}

/* 滚动条样式 */
.list-content::-webkit-scrollbar {
    width: 6px;
}

.list-content::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
}

.list-content::-webkit-scrollbar-thumb {
    background: rgba(255, 165, 0, 0.5);
    border-radius: 3px;
}

.list-content::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 165, 0, 0.7);
}
</style>