"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = require("path");
const menus_1 = require("./main/menus");
let win;
/* 创建一个窗口实例 */
function createMainWindow() {
    win = new electron_1.BrowserWindow({
        // autoHideMenuBar:true,
        width: 1430,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, "./render/injectGlobal"),
            nativeWindowOpen: true
        }
    });
    win.loadFile("./web/designer/index.html"); // 首页
    // win.loadURL('https://xcv.jingkan.net');
    // win.loadFile('./index.html');
    // 关闭
    win.on("closed", () => {
        win = null;
    });
    win.webContents.on("new-window", (event, url, frameName, disposition, options, additionalFeatures) => {
        //有更多的控制以后再说，目前用到"定制功能 "
        event.preventDefault();
        Object.assign(options, {
            modal: true,
            parent: win
        });
        //@ts-ignore
        event.newGuest = new electron_1.BrowserWindow(options);
    });
}
electron_1.app.on("ready", () => {
    electron_1.Menu.setApplicationMenu(menus_1.appMenu); // 导航
    // 开发者工具
    electron_1.globalShortcut.register("CommandOrControl+F12", () => {
        let isOpen = win.webContents.isDevToolsOpened();
        if (!isOpen)
            win.webContents.openDevTools();
        else
            win.webContents.closeDevTools();
    });
    electron_1.globalShortcut.register("CommandOrControl+F5", () => {
        win.webContents.reloadIgnoringCache();
    });
    createMainWindow();
});
electron_1.app.on("window-all-closed", () => {
    if (process.platform !== "darwin")
        electron_1.app.quit();
});
electron_1.app.on("activate", () => {
    if (win === null)
        createMainWindow();
});
