
import '@/style/default.scss';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import ElementPlus from 'element-plus';
import * as FBComponent from 'fate-ui-component';
import 'fate-ui-component/dist/css/main.css';
import * as FBVisualization from 'fate-visualization';
import 'fate-visualization/dist/css/main.css';
import * as Vue from 'vue';
import directive from './directive';
import Router from './router/router';
import Store from './store/store';
import App from './views/layout/GlobalLayout.vue';

const app = Vue.createApp(App);
directive(app)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, <any>component)
}
app.use(Store);
app.use(Router);
app.use(ElementPlus);
app.use(FBComponent);
app.use(FBVisualization);
app.mount('#app');
