import fs from 'fs';
import path from 'path';
import request from 'request';

function requestPromise(url: string) {
    return new Promise((resolve, reject) => {
        request(url, (err, data, body) => {
            if (!err)
                resolve(body);
            else
                reject(err);
        })
    })
}

const gitUrl: string = 'https://raw.githubusercontent.com/jsjhycl/jdi3/official/',
    localPath: string = './resources/app',//'./resources/app'
    versionPath: string = 'versions.json';

/* 获取本地版本信息 */
function getLocalVersion() {
    let localInfo = JSON.parse(fs.readFileSync(path.join(localPath, versionPath)).toString());
    return localInfo.version;
}

/* 获取版本信息是否需要升级 */
async function getVersion() {
    try {
        //@ts-ignore
        let remoteInfo = JSON.parse(await requestPromise(gitUrl + versionPath)),
            localInfo = JSON.parse(fs.readFileSync(path.join(localPath, versionPath)).toString());
        if (!remoteInfo.list || remoteInfo.list.length <= 0)
            throw "获取升级信息失败";
        if (remoteInfo.version != localInfo.version) {
            let newVersion = remoteInfo.list[remoteInfo.list.length - 1];
            return { status: 0, result: { remoteVersion: remoteInfo.version, localVersion: localInfo.version, newVersion: newVersion } };
        } else
            return { status: 0, result: false };
    } catch (err) {
        return { status: -1, result: err.toString() };
    }
}

/* 获取升级文件 */
async function upgrade(version?: string) {
    try {
        //@ts-ignore
        let remoteInfo = JSON.parse(await requestPromise(gitUrl + versionPath)),
            localInfo = JSON.parse(fs.readFileSync(path.join(localPath, versionPath)).toString());
        if (!remoteInfo.list || remoteInfo.list.length <= 0 || !localInfo.version)
            return { status: -1, result: "获取版本信息失败" };
        // 升级版本的内容
        let upgradeItem = remoteInfo.list[remoteInfo.list.length - 1];
        version = version || upgradeItem.version;
        // 获取需要更新的版本文件(从当前版本到最新版本所有需要更新的文件都放在files)
        let localVersion = localInfo.version;
        let lindex = remoteInfo.list.findIndex((p: any) => p.version == localVersion);
        let upgradeItems = remoteInfo.list.splice(lindex + 1);
        let files: string[] = [];
        upgradeItems.forEach((uitem: any, index: number) => {
            uitem.files.forEach((file: string) => {
                if (files.indexOf(file) < 0)
                    files.push(file);
            })
        });
        return { status: 0, result: files };
    } catch (err) {
        return { status: -1, result: err.toString() };
    }
}

/* 下载文件并保存到对应路径 */
async function remote2local(filePath: string) {
    try {
        let requestData = await requestPromise(gitUrl + filePath);
        createDirectorySync(path.join(localPath, filePath));
        //@ts-ignore
        fs.writeFileSync(path.join(localPath, filePath), requestData);
        return { status: 0, result: true }
    } catch (err) {
        return { status: -1, result: err.toString() };
    }
}

/* 创建文件夹 */
function createDirectorySync(p: string) {
    let parts = path.dirname(path.normalize(p)).split(path.sep);
    //@ts-ignore
    let current = path.join(parts.shift(), path.sep);
    while (parts.length > 0) {
        //@ts-ignore
        current = path.join(current, parts.shift());
        if (!fs.existsSync(current)) fs.mkdirSync(current);
    }
}

export { requestPromise, getLocalVersion, getVersion, upgrade, remote2local }