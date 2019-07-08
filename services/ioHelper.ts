/**
 * 文件操作的一些方法
 */
import {nativeImage, remote} from "electron";

let {clipboard} = remote;// 剪切板
import mkdirp from 'mkdirp';// 地柜创建目录及子目录
import path from 'path';

import fs from 'fs';

/**
 * 资源路径
 */
let resourcePath = path.join(__dirname, '../_template');
if (!fs.existsSync(resourcePath)) mkdirp.sync(resourcePath);// 生成缓存文件夹路径

/**
 * 创建资源文件夹里的指定文件
 * @param resourceId 资源Id
 * @param name 文件名称
 * @returns 文件路径
 */
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
        let targetFileName = getFileName(source.resourceId, source.name);// 没有创建，返回路径
        if (source.sourceName) {// 通过上传
            fs.copyFileSync(source.sourceName, targetFileName);// 拷贝文件
        } else {// 通过剪切板
            let sourceClipboard = clipboard.readImage();// 固定方法
            let buffers = source.name.endsWith('png') ? sourceClipboard.toPNG() : sourceClipboard.toJPEG(40);// 文件后缀
            fs.writeFileSync(targetFileName, buffers);// 写入
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