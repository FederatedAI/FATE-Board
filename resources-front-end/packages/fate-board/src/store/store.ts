import { createStore } from 'vuex';
import Mods from './modules';

export default createStore({
  devtools: false,
  modules: Mods,
});
