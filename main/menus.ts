import { Menu, MenuItemConstructorOptions, shell } from 'electron';
import fs from 'fs';
import { openFileDialog } from './utils';
let xml2html =require('../services/excel2html');

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
                        fs.writeFileSync('temp.html',html);
                        shell.openExternal('temp.html');
                    });
                }
            },
            {
                label: '开发者工具',
                role: "toggledevtools"
            },
            {
                type:"separator"
            },
            {
                label: '关闭',
                role: "close"
            }
        ]
    }
]

let appMenu=Menu.buildFromTemplate(appMenuTemplate);

export {appMenu}