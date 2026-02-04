<template>
  <div v-if="loading" class="loading-container" :style="{ height: height + 'px' }">
    <el-skeleton :rows="rows" animated />
  </div>
  <slot v-else />
</template>

<script setup>
defineProps({
  loading: { type: Boolean, default: false },
  rows: { type: Number, default: 5 },
  height: { type: Number, default: 200 }
})
</script>

<style scoped>
.loading-container {
  padding: 20px;
}
</style>
