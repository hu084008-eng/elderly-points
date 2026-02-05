import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import VueECharts from 'vue-echarts'

import App from './App.vue'
import router from './router'
import { setupDirectives } from './directives'
import { setupFilters } from './filters'

const app = createApp(App)

// 注册全局指令和过滤器
setupDirectives(app)
setupFilters(app)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(createPinia())
app.use(router)
app.use(ElementPlus, { locale: zhCn })
app.component('v-chart', VueECharts)

app.mount('#app')
