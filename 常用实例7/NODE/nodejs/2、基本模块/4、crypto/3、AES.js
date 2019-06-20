//AES是一种常用的对称加密算法，加解密都用同一个密钥。crypto模块提供了AES支持，但是需要自己封装好函数，便于使用：
const crypto = require('crypto');
function aesEncrypt(data, key) {
    const cipher = crypto.createCipher('aes192', key);
    var crypted = cipher.update(data, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
}
function aesDecrypt(encrypted, key) {
    const decipher = crypto.createDecipher('aes192', key);
    var decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}
var data='zxw';
var key='password';
var encrypted=aesEncrypt(data,key);//加密
var decrypted=aesDecrypt(encrypted,key);//解密
console.log(decrypted);

/*
* AES还有很多不同的算法，如：aes192，aes-128-ecb，aes-256-cbc等
* 加密的结果通常有两种表示方法：hex和base64
* */