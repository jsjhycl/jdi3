let _utils =require('./utils');
let fs =require('fs');

function excute(){
    let files =_utils.openFileDialog(['xlsx']);
    console.log(files,fs.readdirSync(__dirname));
    return files[0];
}
module.exports=excute;