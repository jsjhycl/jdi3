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

let importExcel=require('../services/excel2html');
import {saveImage,saveFile} from '../services/ioHelper';
import { openFileDialog } from "./utils";
// @ts-ignore
window.jdi= {
    hello:hello,
    importExcel:importExcel,
    saveFile:saveFile,
    saveImage:saveImage,
    openFileDialog:openFileDialog
}
/**
 * 测试函数，此函数成功，说明注入成功
 */
function hello(){
console.log(importExcel);
    console.log('preload is ok.');
}