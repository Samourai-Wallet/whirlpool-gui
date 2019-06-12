import sjcl from 'sjcl';

const CRYPT_KEY_LENGTH = 256
const CRYPT_TAG_LENGTH = 128
const CRYPT_ITERATIONS = 10000
class EncryptUtils {
  constructor () {
  }

  encrypt(key, message) {
    // AES
    const cipherText = sjcl.encrypt(key, message, {mode: "gcm", ks: CRYPT_KEY_LENGTH, ts: CRYPT_TAG_LENGTH, iter: CRYPT_ITERATIONS})

    // minify
    const parsed = JSON.parse(cipherText);
    const result = {
      iv: parsed.iv,
      salt: parsed.salt,
      ct: parsed.ct
    }
    return result;
  }

  /*decrypt(key, minimalCipherText) {
    // decode base64
    const parsed = JSON.parse(atob(minimalCipherText));

    // decode minify
    const cipherText = Object.assign(parsed, {mode:"ccm",iter:10000,ks:128,ts:64,v:1,cipher:"aes",adata:""});
    const cipherTextStr = JSON.stringify(cipherText);

    // AES
    const plaintext = sjcl.decrypt(key, cipherTextStr)
    return plaintext
  }*/

}

const encryptUtils = new EncryptUtils()
export default encryptUtils
