const bufa=Buffer.from('runoob');
console.log(bufa.toString('ascii'));//ascii仅支持7位ASCLL数据。如果设置去掉高位的话，这中编码是非常快的。
console.log(bufa.toString('utf8'));//多字节编码的Unicode字符.许多网页和其他文档格式都使用UTF-8
console.log(bufa.toString('utf16le'));//2或者4个字节
console.log(bufa.toString('ucs2'));
console.log(bufa.toString('base64'));
console.log(bufa.toString('latin1'));
console.log(bufa.toString('binary'));
console.log(bufa.toString('hex'));


//var a = 'abcdefg';
//var buf=Buffer.from([0x1,0x2,0x3]);
//console.log(buf);
//const buf1=Buffer.alloc(256,0);
//var len=buf1.write("www.baidu.com");
//console.log(len);
//console.log(buf1.toString('ascii',0,len));
//var a=JSON.stringify(buf);
//console.log(a);
//var capy=JSON.parse(a,(key,value) =>  {
//   return value&&value.type=='Buffer'?Buffer.from(value.data):value;
//});
//console.log(capy);
//
//
//
//var buffer1=Buffer.from("菜鸟教程");
//var buffer2=Buffer.from("www.baidu.com");
//var buffer3=Buffer.concat([buffer1,buffer2]);
//console.log(buffer3.toString());
//console.log(buffer3.length);







