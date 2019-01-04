import {app, BrowserWindow, Menu, globalShortcut } from 'electron';
import path =require('path');
import { appMenu } from './main/menus';

let win:BrowserWindow;

function createMainWindow() {
    win = new BrowserWindow({
        autoHideMenuBar:true,
        width:1430,
        height:800,
        webPreferences:{
            preload:path.join(__dirname,'./render/injectGlobal'),
            nativeWindowOpen:true
        }
    });
    win.loadFile('./web/designer/index.html');
    win.on('closed', () => {
        (<BrowserWindow|null>win) = null;
    });
    win.webContents.on('new-window', (event, url, frameName, disposition, options, additionalFeatures) => {
        //有更多的控制以后再说，目前用到"定制功能 "
        //    console.log("frameName:",frameName,"disposition:",disposition,"options:",options,"additionalFeatures:",additionalFeatures,"url:",url)
    });
}

app.on('ready',()=>{
    Menu.setApplicationMenu(appMenu);
    globalShortcut.register('CommandOrControl+F12',()=>{
        let isOpen =win.webContents.isDevToolsOpened();
        if(!isOpen) win.webContents.openDevTools();
        else win.webContents.closeDevTools();
    });
    globalShortcut.register('CommandOrControl+F5',()=>{
        win.webContents.reloadIgnoringCache();
    });
    createMainWindow();
});

app.on("window-all-closed",()=>{
    if(process.platform!=='darwin') app.quit();
});

app.on('activate',()=>{
    if(win===null) createMainWindow();
});
