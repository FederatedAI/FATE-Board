export default {
  /**
   * parameter: {
   *  username, // 用户名称
   *  password  // 用户密码
   * }
   */
  signIn: {
    url: '/user/login',
    method: 'post',
  },
  signOut: {
    url: '/user/logout',
    method: 'post',
  },
};
