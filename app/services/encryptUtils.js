import sjcl from 'sjcl';

class EncryptUtils {
  constructor () {
  }

  encrypt(key, message) {
    // AES
    const cipherText = sjcl.encrypt(key, message)

    // minify
    const parsed = JSON.parse(cipherText);
    delete parsed.mode;
    delete parsed.iter;
    delete parsed.ks;
    delete parsed.ts;
    delete parsed.v;
    delete parsed.cipher;
    delete parsed.adata;

    // base64
    const minimalCipherText = btoa(JSON.stringify(parsed));
    return minimalCipherText
  }

  decrypt(key, minimalCipherText) {
    // decode base64
    const parsed = JSON.parse(atob(minimalCipherText));

    // decode minify
    const cipherText = Object.assign(parsed, {mode:"ccm",iter:10000,ks:128,ts:64,v:1,cipher:"aes",adata:""});
    const cipherTextStr = JSON.stringify(cipherText);

    // AES
    const plaintext = sjcl.decrypt(key, cipherTextStr)
    return plaintext
  }

}

const encryptUtils = new EncryptUtils()
export default encryptUtils
