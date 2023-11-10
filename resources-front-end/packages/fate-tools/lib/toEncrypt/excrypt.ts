import Encrypt from 'encryptlong';

export default function encrypt(publicKey: string, data: string) {
  const encryptor = new Encrypt();
  encryptor.setPublicKey(publicKey);
  return encryptor.encryptLong(data);
}
