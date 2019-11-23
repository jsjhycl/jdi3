"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
/**
 * 打开本地文件选择器，返回选择的文件数组
 * @param filters 文件后缀筛选
 */
function openFileDialog(filters) {
    let files = electron_1.dialog.showOpenDialog({
        filters: [{ name: 'Excel', extensions: filters },
            { name: '*.*', extensions: ['*'] }],
    });
    return files;
}
exports.openFileDialog = openFileDialog;
