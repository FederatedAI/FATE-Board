import assets from './assets';
import auth from './auth';
import chart from './chart';
import job from './job';
import security from './security';

export default Object.assign({}, auth, job, security, assets, chart);
