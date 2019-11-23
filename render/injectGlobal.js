"use strict";
/**
 * 引用到前端的方法
 */
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * This Module Can use Node & Electron
 */
//#region 如果使用loadUrl时可以解决与jquery的兼容问题
// @ts-ignore
// window.nodeRequire = require;
// // @ts-ignore
// delete window.require;
// // @ts-ignore
// delete window.exports;
// // @ts-ignore
// delete window.module;
//#endregion
let importExcel = require('../services/excel2html'); // Excel转HTML文件
const ioHelper_1 = require("../services/ioHelper"); // 文件操作，保存图片，保存文件
const utils_1 = require("./utils"); // 打开文件选择器
const fileApi = __importStar(require("../services/fileApi")); // 文件的上传下载压缩等一些操作
const upgradeApi = __importStar(require("../services/upgrade")); //文件升级操作
// @ts-ignore
// 该处window.jdi，前端可以引用jdi.来引用方法
window.jdi = {
    hello: hello,
    importExcel: importExcel,
    saveFile: ioHelper_1.saveFile,
    saveImage: ioHelper_1.saveImage,
    openFileDialog: utils_1.openFileDialog,
    fileApi: fileApi,
    upgradeApi: upgradeApi
};
/**
 * 测试函数，此函数成功，说明注入成功
 */
function hello() {
    console.log(importExcel);
    console.log('preload is ok.');
}
