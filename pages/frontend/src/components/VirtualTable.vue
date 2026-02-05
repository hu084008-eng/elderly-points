<template>
  <el-table-v2
    :columns="columns"
    :data="data"
    :width="width"
    :height="height"
    :row-height="rowHeight"
    fixed
  />
</template>

<script setup>
defineProps({
  columns: { type: Array, required: true },
  data: { type: Array, required: true },
  width: { type: Number, default: 1000 },
  height: { type: Number, default: 400 },
  rowHeight: { type: Number, default: 50 }
})
</script>
