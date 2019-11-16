/**
 * 引用到前端的方法
 */

import { globalShortcut } from "electron";

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

let importExcel = require('../services/excel2html');// Excel转HTML文件
import { saveImage, saveFile } from '../services/ioHelper';// 文件操作，保存图片，保存文件
import { openFileDialog } from "./utils";// 打开文件选择器
import * as fileApi from "../services/fileApi";// 文件的上传下载压缩等一些操作
import * as upgradeApi from "../services/upgrade";//文件升级操作
// @ts-ignore
// 该处window.jdi，前端可以引用jdi.来引用方法
window.jdi = {
    hello: hello,
    importExcel: importExcel,
    saveFile: saveFile,
    saveImage: saveImage,
    openFileDialog: openFileDialog,
    fileApi: fileApi,
    upgradeApi: upgradeApi
}

/**
 * 测试函数，此函数成功，说明注入成功
 */
function hello() {
    console.log(importExcel);
    console.log('preload is ok.');
}