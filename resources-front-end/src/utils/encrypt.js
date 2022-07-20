import { JSEncrypt } from 'jsencrypt'

export default function rsa(publicKet, origin) {
  const jsencrypt = new JSEncrypt()
  jsencrypt.setPublicKey(publicKet)
  return jsencrypt.encrypt(origin)
}
