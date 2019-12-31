"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const request_1 = __importDefault(require("request"));
function requestPromise(url) {
    return new Promise((resolve, reject) => {
        request_1.default(url, (err, data, body) => {
            if (!err)
                resolve(body);
            else
                reject(err);
        });
    });
}
exports.requestPromise = requestPromise;
const gitUrl = 'https://raw.githubusercontent.com/jsjhycl/jdi3/official/', localPath = './resources/app', //'./resources/app'
versionPath = 'versions.json';
/* 获取本地版本信息 */
function getLocalVersion() {
    let localInfo = JSON.parse(fs_1.default.readFileSync(path_1.default.join(localPath, versionPath)).toString());
    return localInfo.version;
}
exports.getLocalVersion = getLocalVersion;
/* 获取版本信息是否需要升级 */
async function getVersion() {
    try {
        //@ts-ignore
        let remoteInfo = JSON.parse(await requestPromise(gitUrl + versionPath)), localInfo = JSON.parse(fs_1.default.readFileSync(path_1.default.join(localPath, versionPath)).toString());
        if (!remoteInfo.list || remoteInfo.list.length <= 0)
            throw "获取升级信息失败";
        if (remoteInfo.version != localInfo.version) {
            let newVersion = remoteInfo.list[remoteInfo.list.length - 1];
            return { status: 0, result: { remoteVersion: remoteInfo.version, localVersion: localInfo.version, newVersion: newVersion } };
        }
        else
            return { status: 0, result: false };
    }
    catch (err) {
        return { status: -1, result: err.toString() };
    }
}
exports.getVersion = getVersion;
/* 获取升级文件 */
async function upgrade(version) {
    try {
        //@ts-ignore
        let remoteInfo = JSON.parse(await requestPromise(gitUrl + versionPath)), localInfo = JSON.parse(fs_1.default.readFileSync(path_1.default.join(localPath, versionPath)).toString());
        if (!remoteInfo.list || remoteInfo.list.length <= 0 || !localInfo.version)
            return { status: -1, result: "获取版本信息失败" };
        // 升级版本的内容
        let upgradeItem = remoteInfo.list[remoteInfo.list.length - 1];
        version = version || upgradeItem.version;
        // 获取需要更新的版本文件(从当前版本到最新版本所有需要更新的文件都放在files)
        let localVersion = localInfo.version;
        let lindex = remoteInfo.list.findIndex((p) => p.version == localVersion);
        let upgradeItems = remoteInfo.list.splice(lindex + 1);
        let files = [];
        upgradeItems.forEach((uitem, index) => {
            uitem.files.forEach((file) => {
                if (files.indexOf(file) < 0)
                    files.push(file);
            });
        });
        return { status: 0, result: files };
    }
    catch (err) {
        return { status: -1, result: err.toString() };
    }
}
exports.upgrade = upgrade;
/* 下载文件并保存到对应路径 */
async function remote2local(filePath) {
    try {
        let requestData = await requestPromise(gitUrl + filePath);
        createDirectorySync(path_1.default.join(localPath, filePath));
        //@ts-ignore
        fs_1.default.writeFileSync(path_1.default.join(localPath, filePath), requestData);
        return { status: 0, result: true };
    }
    catch (err) {
        return { status: -1, result: err.toString() };
    }
}
exports.remote2local = remote2local;
/* 创建文件夹 */
function createDirectorySync(p) {
    let parts = path_1.default.dirname(path_1.default.normalize(p)).split(path_1.default.sep);
    //@ts-ignore
    let current = path_1.default.join(parts.shift(), path_1.default.sep);
    while (parts.length > 0) {
        //@ts-ignore
        current = path_1.default.join(current, parts.shift());
        if (!fs_1.default.existsSync(current))
            fs_1.default.mkdirSync(current);
    }
}
