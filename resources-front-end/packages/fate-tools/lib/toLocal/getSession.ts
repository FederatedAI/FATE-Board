export default function getSession(key: string) {
  return sessionStorage.getItem(key);
}
