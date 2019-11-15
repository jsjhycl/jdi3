// 判断是否需要升级
(function () {
    jdi.upgradeApi.getVersion().then(data => {
        if (data.status == 0) {
            if (data.result) {
                var BrowserWindow = require("electron").remote.BrowserWindow;
                win = new BrowserWindow({ width: 420, height: 320, frame: false, alwaysOnTop: true })// frame: false
                win.on('close', function () { win = null });
                win.on('blur', function () { win = null });
                win.loadURL("file://" + __dirname + "/upgrade.html");
                win.show();
            }
        } else {
            alert(data.result);
        }
    }).catch(err => {
        console.log(err);
        alert(err.toString());
    })
}())

