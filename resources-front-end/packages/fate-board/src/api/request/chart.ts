export default {
  getModelOutput: {
    url: 'v1/tracking/component/output/model',
    method: 'post',
  },

  getDataOutput:  {
    url: 'v1/tracking/component/output/data',
    method: 'post'
  },

  getMetrics: {
    url: '/v1/tracking/component/metrics',
    method: 'post',
  },

  getMetricData: {
    url: '/v1/tracking/component/metric_data',
    method: 'post'
  },

  getMetricsData: {
    url: '/v1/tracking/component/metric_data/batch',
    method: 'post',
  }
};
