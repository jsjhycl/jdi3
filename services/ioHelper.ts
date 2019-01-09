import { nativeImage } from "electron";
import mkdirp from 'mkdirp';
import path from 'path';

import fs from 'fs';

/**
 * 资源路径
 */
let resourcePath =path.join(__dirname,'../_template');
if(!fs.existsSync(resourcePath)) mkdirp.sync(resourcePath);

function getFileName(resourceId:string,name:string):string{
    let fullPath =path.join(resourcePath,resourceId);
    let fileName =path.join(fullPath,name);
    if(!fs.existsSync(fullPath)) mkdirp.sync(fullPath);
    return fileName;
}

/**
 * 导入选中的图片文件到库中
 * @param sourceFilename 原文件名
 * @param resourceId 资源号
 * @param name 图片名
 */
function saveImage(sourceFilename:string,resourceId:string,name:string):string;
/**
 * 保存剪切板等其他来源的原生图形到文件
 * @param nativeImage 剪切板中的原生图形
 * @param resourceId 资源号
 * @param name 素材(图片)名
 */
function saveImage(nativeImage:nativeImage,resourceId:string,name:string):string;
function saveImage(source: string | nativeImage, resourceId: string,name:string): string {
    let targetFileName =getFileName(resourceId,name);
    if (typeof source === 'string') {
        fs.copyFileSync(source, targetFileName);
    } else {
        let buffers =name.endsWith('png')? source.toPNG():source.toJPEG(40);
        fs.writeFileSync(targetFileName, buffers);
    }
    return targetFileName;
}

/**
 * 保存资源文件，目前统一保存为utf-8格式
 * @param resourceId 资源号
 * @param name 资源名
 * @param content 文件内容
 * return 保存的文件名
 */
function saveFile(resourceId:string,name:string,content:string):string{
    let fileName =getFileName(resourceId,name);
    fs.writeFileSync(fileName,content,'utf-8');
    return fileName;
}

export {saveImage,saveFile}