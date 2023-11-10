import Encrypt from 'encryptlong';

export default function decrypt(privateKey: string, data: string) {
  const encryptor = new Encrypt();
  encryptor.setPrivateKey(privateKey);
  return encryptor.decryptLong(data);
}
