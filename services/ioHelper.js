"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 文件操作的一些方法
 */
const electron_1 = require("electron");
let { clipboard } = electron_1.remote; // 剪切板
const mkdirp_1 = __importDefault(require("mkdirp")); // 地柜创建目录及子目录
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
/**
 * 资源路径
 */
let resourcePath = path_1.default.join(__dirname, '../_template');
if (!fs_1.default.existsSync(resourcePath))
    mkdirp_1.default.sync(resourcePath); // 生成缓存文件夹路径
/**
 * 创建资源文件夹里的指定文件
 * @param resourceId 资源Id
 * @param name 文件名称
 * @returns 文件路径
 */
function getFileName(resourceId, name) {
    let fullPath = path_1.default.join(resourcePath, resourceId);
    let fileName = path_1.default.join(fullPath, name);
    if (!fs_1.default.existsSync(fullPath))
        mkdirp_1.default.sync(fullPath);
    return fileName;
}
function saveImage(source) {
    try {
        let targetFileName = getFileName(source.resourceId, source.name); // 没有创建，返回路径
        if (source.sourceName) { // 通过上传
            fs_1.default.copyFileSync(source.sourceName, targetFileName); // 拷贝文件
        }
        else { // 通过剪切板
            let sourceClipboard = clipboard.readImage(); // 固定方法
            let buffers = source.name.endsWith('png') ? sourceClipboard.toPNG() : sourceClipboard.toJPEG(40); // 文件后缀
            fs_1.default.writeFileSync(targetFileName, buffers); // 写入
        }
        return targetFileName;
    }
    catch (e) {
        console.log(e);
        return '';
    }
}
exports.saveImage = saveImage;
/**
 * 保存资源文件，目前统一保存为utf-8格式
 * return 保存的文件绝对路径
 */
function saveFile(source) {
    try {
        let fileName = getFileName(source.resourceId, source.name);
        fs_1.default.writeFileSync(fileName, source.content, 'utf-8');
        return fileName;
    }
    catch (e) {
        console.log(e);
        return '';
    }
}
exports.saveFile = saveFile;
