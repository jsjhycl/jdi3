import {nativeImage, remote} from "electron";

let {clipboard} = remote;
import mkdirp from 'mkdirp';
import path from 'path';

import fs from 'fs';

/**
 * 资源路径
 */
let resourcePath = path.join(__dirname, '../_template');
if (!fs.existsSync(resourcePath)) mkdirp.sync(resourcePath);

function getFileName(resourceId: string, name: string): string {
    let fullPath = path.join(resourcePath, resourceId);
    let fileName = path.join(fullPath, name);
    if (!fs.existsSync(fullPath)) mkdirp.sync(fullPath);
    return fileName;
}

/**
 * 定义图片传入参数的接口
 * @param sourceName 传入的文件名称
 * @param resourceId 资源号
 * @param name 保存图片名称
 */
interface sourceImage {
    sourceName?: string,
    resourceId: string,
    name: string
}

/**
 * 定义文件保存传入参数的接口
 * @param resourceId 资源号
 * @param name 资源名
 * @param content 文件内容
 */
interface sourceFile {
    resourceId: string,
    name: string,
    content: string
}

/**
 * 保存剪切板等其他来源的原生图形到文件
 * return 保存的图片绝对路径
 */
function saveImage(source: sourceImage): string;
function saveImage(source: sourceImage): string {
    try {
        let targetFileName = getFileName(source.resourceId, source.name);
        if (source.sourceName) {
            fs.copyFileSync(source.sourceName, targetFileName);
        } else {
            let sourceClipboard = clipboard.readImage();
            let buffers = source.name.endsWith('png') ? sourceClipboard.toPNG() : sourceClipboard.toJPEG(40);
            fs.writeFileSync(targetFileName, buffers);
        }
        return targetFileName;
    } catch (e) {
        console.log(e);
        return '';
    }
}

/**
 * 保存资源文件，目前统一保存为utf-8格式
 * return 保存的文件绝对路径
 */
function saveFile(source: sourceFile): string {
    try {
        let fileName = getFileName(source.resourceId, source.name);
        fs.writeFileSync(fileName, source.content, 'utf-8');
        return fileName;
    } catch (e) {
        console.log(e);
        return '';
    }
}

export {saveImage, saveFile}