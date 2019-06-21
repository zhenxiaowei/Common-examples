//crypto模块的目的是为了提供通用的加密和哈希算法。用js代码实现这些功能不是不可能，但速度会非常慢。nodejs用C/C++实现这些算法后，提供crypto这个模块暴露为js接口，这样用起来方便，运行速度也快

//MD5是一种常用的哈希算法，用于给任意数据"签名"，这个签名通常用一个十六进制的字符串表示
const crypto = require('crypto');
const hash = crypto.createHash('md5');
//可任意多次调用update()
hash.update('hello world');
hash.update('hello nodejs');
console.log(hash.digest('hex'));
//update()方法默认字符串编码为utf-8，也可以传入Buffer
//如果要计算SHA1，只需要把md5改为sha1，就可以得到sha1的结果，还可以使用更安全的sha256和sha512
