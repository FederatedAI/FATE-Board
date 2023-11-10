export default function setSession(key: string, value: string) {
  sessionStorage.setItem(key, value);
}
