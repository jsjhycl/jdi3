import { app, BrowserWindow, Menu, globalShortcut } from "electron";
import path = require("path");
import { appMenu } from "./main/menus";

let win: BrowserWindow;

/* 创建一个窗口实例 */
function createMainWindow() {
  win = new BrowserWindow({
    // autoHideMenuBar:true,
    width: 1430,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "./render/injectGlobal"), // 预加载的一个脚本
      nativeWindowOpen: true
    }
  });
  win.loadFile("./web/designer/index.html"); // 首页
  // win.loadURL('https://xcv.jingkan.net');
  // win.loadFile('./index.html');
  // 关闭
  win.on("closed", () => {
    (<BrowserWindow | null>win) = null;
  });
  win.webContents.on(
    "new-window",
    (event, url, frameName, disposition, options, additionalFeatures) => {
      //有更多的控制以后再说，目前用到"定制功能 "
      event.preventDefault();
      Object.assign(options, {
        modal: true,
        parent: win
      });
      //@ts-ignore
      event.newGuest = new BrowserWindow(options);
    }
  );
}

app.on("ready", () => {
  Menu.setApplicationMenu(appMenu); // 导航
  // 开发者工具
  globalShortcut.register("CommandOrControl+F12", () => {
    let isOpen = win.webContents.isDevToolsOpened();
    if (!isOpen) win.webContents.openDevTools();
    else win.webContents.closeDevTools();
  });
  globalShortcut.register("CommandOrControl+F5", () => {
    win.webContents.reloadIgnoringCache();
  });
  createMainWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (win === null) createMainWindow();
});
