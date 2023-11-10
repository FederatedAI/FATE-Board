import store from '@/store/store';
import { ElMessage } from 'element-plus';

export default {
  100: function warning(data: any) {
    ElMessage({
      showClose: true,
      message: `Code:100, warning: ${data.msg || data.data}`,
      center: true,
    });
  },

  10004: function NotFound(data: any) {
    return data
  },

  10015: async function loginFailed(data: any) {
    if (process.env.NODE_ENV === 'development') {
      ElMessage({
        showClose: true,
        message: `Code:10015, LoginFailed: ${data.msg || data.data}`,
        center: true,
      });
    }
    store.commit('SET_RESIGNIN', true)
    await store.dispatch('signInForMultPage')
    return true
  },

  error: function error(data: any) {
    ElMessage({
      showClose: true,
      message: `Code: ${data.code}, ${data.msg || data.data}`,
      center: true,
    });
  },
};
