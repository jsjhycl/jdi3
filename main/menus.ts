/**
 * electron菜单栏
 */

import { Menu, MenuItemConstructorOptions, shell } from 'electron';
import fs from 'fs';
import { openFileDialog } from './utils';
let xml2html =require('../services/excel2html');// 引用了Excel转HTML方法

const appMenuTemplate: MenuItemConstructorOptions[] = [
    {
        label: "工具",
        submenu: [
            {
                label: 'Excel转Html',
                click:()=>{
                    let file = openFileDialog(["xlsx"])[0];
                    xml2html(file)
                    .then((html:any)=>{
                        fs.writeFileSync('temp.html',html);// 将文件写入到缓存HTML
                        shell.openExternal('temp.html');// electron打开浏览器并打开指定文件
                    });
                }
            },
            {
                label: '开发者工具',
                role: "toggledevtools"
            },
            {
                label:'刷新',
                role:"reload"
            },
            {
                label:'强制刷新',
                role:"forcereload"
            },
            {
                type: "separator"
            },
            {
                label: '1.0.0.2(开发版本)'
            },
            {
                label: '关闭',
                role: "close"
            }
        ]
    }
]

let appMenu=Menu.buildFromTemplate(appMenuTemplate);// 默认引用方法

export {appMenu}