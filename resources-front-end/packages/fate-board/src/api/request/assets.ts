export default {
  queryFileds: {
    url: '/job/query/fields',
    method: 'post',
  },
  portConfig:  {
    url: 'v1/tracking/component/config',
    method: 'get'
  },
  getInstanceId: {
    url: '/v1/server/fateflow/info',
    method: 'post'
  }
};
