import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import 'element-plus/dist/index.css';
import { createApp } from 'vue';
// import App from './LineOrBarApp.vue';
// import App from './DAGGraphicApp.vue';
// import App from './HeatMap.vue';
import App from './Tree.vue';
// import App from './Gauge.vue';

const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, <any>component)
}
app.mount('#app');
