export default {
  getRunningJobs: {
    url: '/job/query/status',
    method: 'get',
  },

  /**
   * job_id: string
   */
  killJob: {
    url: '/job/v1/pipeline/job/stop',
    method: 'post',
  },

  /**
   * job_id: string
   */
  retryJob: {
    url: '/job/v1/rerun',
    method: 'post',
  },

  queryJobsTotal: {
    url: '/job/query/totalrecord',
    method: 'get',
  },

  /**
   * pageNum,
   * pageSize,
   * // limitation: {
   *  jobId
   *  partyId
   *  fDescription
   *  partner
   *  note
   *  role
   * },
   * // sortPara (后续扩展)
   */
  queryJobs: {
    url: '/job/query/page/new',
    method: 'post',
  },

  jobDownload: {
    url: '/job/download',
    method: 'post',
    responseType: 'blob',
  },

  getComponentPara: {
    url: '/v1/tracking/component/parameters',
    method: 'post',
  },
  
  /**
   * parameter: {
   *  job_id: string,
   *  role: role,
   *  party_id: partyId,
   *  notes: notes
   * }
   */
  noteUpdate: {
    url: '/job/update',
    method: 'put',
  }
};
