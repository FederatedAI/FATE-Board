import { https } from 'fate-tools';
import codes from './codes';
import apis from './request';

export default https(apis, process.env.VUE_MOCK === 'true', codes);
