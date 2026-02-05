<template>
  <v-chart class="chart" :option="option" autoresize />
</template>

<script setup>
import { computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import VChart from 'vue-echarts'

use([CanvasRenderer, LineChart, GridComponent, TooltipComponent, LegendComponent])

const props = defineProps({
  data: { type: Array, default: () => [] }
})

const option = computed(() => ({
  tooltip: { trigger: 'axis' },
  legend: { data: ['积分发放', '积分兑换'] },
  grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
  xAxis: { type: 'category', boundaryGap: false, data: props.data.map(d => d.date) },
  yAxis: { type: 'value' },
  series: [
    { name: '积分发放', type: 'line', smooth: true, data: props.data.map(d => d.grant) },
    { name: '积分兑换', type: 'line', smooth: true, data: props.data.map(d => d.exchange) }
  ]
}))
</script>

<style scoped>
.chart { height: 300px; }
</style>
