import config from './configuration';

export default function getLocal(key: string) {
  const value = localStorage.getItem(key) || '';
  if (value) {
    const data = value.split(config.ExpireMark);
    if (data.length > 1) {
      const now = new Date().getTime();
      if (now > Number(data[1])) {
        localStorage.removeItem(key);
        return '';
      } else {
        return data[0];
      }
    } else {
      return value;
    }
  } else {
    return '';
  }
}
