import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import 'element-plus/dist/index.css';
import { createApp } from 'vue';
import * as UIComponent from '../lib/main';
// import App from './Table.vue';
// import App from './Text.vue';
// import App from './Selection.vue';
// import App from './Tab.vue';
// import App from './UIParse.vue';
// import App from './BreadCrumb.vue';
import App from './Scroll.vue';

const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, <any>component)
}
app.use(UIComponent)
app.mount('#app');
