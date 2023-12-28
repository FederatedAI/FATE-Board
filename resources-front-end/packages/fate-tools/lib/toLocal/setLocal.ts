import config from './configuration';

export default function setLocal(key: string, item: string, expire?: number) {
  if (expire && expire > 0) {
    const date = new Date().getTime() + expire;
    item += `${config.ExpireMark}${date}`;
  }
  localStorage.setItem(key, item);
}
