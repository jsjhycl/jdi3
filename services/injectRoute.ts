let importExcel=require('./excel2html');
export default {
    hello:hello,
    importExcel:importExcel
}

/**
 * 测试函数，此函数成功，说明注入成功
 */
function hello(){
console.log(importExcel);
    console.log('preload is ok.');
}