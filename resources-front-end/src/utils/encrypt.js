export default function rsa(publicKet, origin) {
  if (window.JSEncrypt) {
    const jsencrypt = new window.JSEncrypt()
    jsencrypt.setPublicKey(publicKet)
    return jsencrypt.encrypt(origin)
  } else {
    return origin
  }
}
