import Vue from 'vue';
import axios from 'axios';
import { MessageBox, Message } from 'element-ui';
import store from '@/store';
// import router from '@/router';

// create an axios instance
const service = axios.create({
  // baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 60000, // request timeout
});

// request interceptor
service.interceptors.request.use(
  (config) => {
    // do something before request is sent
    if (store.getters.token) {
      // let each request carry token
      // please modify it according to the actual situation
      config.headers['Authorization'] = 'Bearer ' + store.getters.token;
    }
    return config;
  },
  (error) => {
    // do something with request error
    console.log(error); // for debug
    return Promise.reject(error);
  },
);

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
   */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  (response) => {
    const res = response.data;

    // if the custom code is abnormal.
    if (![102, 103, 200, 201, 207].includes(res.code)) {
      // no permission
      if (res.code == 204 || res.code == 403) {
        MessageBox.alert(res.msg, '提示', {
          type: 'warning',
          showClose: false,
          callback: () => {
            if (res.code == 403) {
              // store.dispatch('user/resetBaseInfo').then(() => {
              //   router.push('/')
              // })
            }
          },
        });
        return;
      }

      // no login
      if (res.code === 402 || res.code === 406 || res.code === 100) {
        // to re-login
        MessageBox.alert(res.msg, '提示', {
          type: 'warning',
          showClose: false,
          callback: async () => {
            // // resetToken
            // await store.dispatch('user/resetToken')
            // // resetUserInfo
            // await store.dispatch('user/resetUserInfo')
            // // restRoutes
            // await store.dispatch('permission/restRoutes')
            // window.location.href = res.data || '/'
          },
        });
        return;
      }
      // other error
      Message({
        // message: error.message,
        message: res.msg || 'Error',
        type: 'error',
        duration: 3 * 1000,
      });
      return Promise.reject(new Error(res.msg || 'Error'));
    } else {
      return Promise.resolve(res);
    }
  },
  (error) => {
    console.log('Error::: ' + error); // for debug
    Message({
      // message: error.message,
      message: '网络错误，请刷新重试',
      type: 'error',
      duration: 3 * 1000,
    });
    return Promise.reject(error);
  },
);

/**
 * 导出 axios 原始实例，可以方便在使用时不被拦截器的设置所影响
 */
// 在全局通过 this.$axios 使用
Vue.prototype.$axios = axios;

// 在其他文件引入
export const $axios = axios;

export default service;
