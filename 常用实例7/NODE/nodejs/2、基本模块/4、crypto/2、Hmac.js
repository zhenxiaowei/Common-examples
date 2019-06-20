//Hmac算法也是一种哈希算法，它可以利用MD5和SHA1等哈希算法，不同的是，Hmac还需要一个秘钥
const crypto = require('crypto');
const hmac = crypto.createHmac('sha256', 'secret-key');
hmac.update('hello world');
hmac.update('hello nodejs');
console.log(hmac.digest('hex'));





