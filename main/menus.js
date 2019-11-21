"use strict";
/**
 * electron菜单栏
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const fs_1 = __importDefault(require("fs"));
const utils_1 = require("./utils");
const upgrade_1 = require("../services/upgrade");
let xml2html = require('../services/excel2html'); // 引用了Excel转HTML方法
let config = require("../config.json");
const appMenuTemplate = [
    {
        label: "工具",
        submenu: [
            {
                label: 'Excel转Html',
                click: () => {
                    let file = utils_1.openFileDialog(["xlsx"])[0];
                    xml2html(file)
                        .then((html) => {
                        fs_1.default.writeFileSync('temp.html', html); // 将文件写入到缓存HTML
                        electron_1.shell.openExternal('temp.html'); // electron打开浏览器并打开指定文件
                    });
                }
            },
            {
                label: '开发者工具',
                role: "toggledevtools"
            },
            {
                label: '刷新',
                role: "reload"
            },
            {
                label: '强制刷新',
                role: "forcereload"
            },
            {
                type: "separator"
            },
            {
                label: "当前版本：" + upgrade_1.getLocalVersion(),
            },
            {
                label: '关闭',
                role: "close"
            }
        ]
    }
];
let appMenu = electron_1.Menu.buildFromTemplate(appMenuTemplate); // 默认引用方法
exports.appMenu = appMenu;
