"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const request_1 = __importDefault(require("request"));
let unzip = require('unzip'), // 解压缩模块
zipper = require('zip-local'), // 压缩模块
configs = require('../config.json'); // 配置
let config = {
    profileDir: path_1.default.join(__dirname, '../data/profiles'),
    templateDir: path_1.default.join(__dirname, '../_template'),
    uploadUrl: configs.serverUrl + '/newapi/getResource',
    downloadUrl: configs.serverUrl + '/newapi/sendResource' // 上传文件接口
};
/**
 * 获取配置中的url
 * return  返回配置中的url
 */
function getConfigUrl() {
    return configs; // 包含了设计器和解析器的url
}
exports.getConfigUrl = getConfigUrl;
/**
 * 获取指定路径的配置文件
 * @param fileName 指定文件名
 * return 返回文件内容，json
 */
function getProfile(fileName) {
    return JSON.parse(fs_1.default.readFileSync(path_1.default.join(config.profileDir, fileName)).toString());
}
exports.getProfile = getProfile;
/**
 * 将文件保存到指定路径
 * @param resourceId
 */
function setProfile(fileName, content) {
    try {
        fs_1.default.writeFileSync(path_1.default.join(config.profileDir, fileName), content);
        return true;
    }
    catch (err) {
        return false;
    }
}
exports.setProfile = setProfile;
/* 以下方法基于操作的模板，只生成在缓存文件夹 */
/**
 * 将文件压缩并上传到服务器
 * @param resourceId 资源号，代表文件夹
 */
function uploadToServer(resourceId) {
    let resourcePath = path_1.default.join(config.templateDir, resourceId); // 在缓存文件夹里寻找数据
    let exist = fs_1.default.existsSync(resourcePath);
    if (!exist)
        return Promise.reject('资源文件不存在');
    let zippath = path_1.default.join(config.templateDir, 'zip'); // 压缩路径
    if (!fs_1.default.existsSync(zippath))
        fs_1.default.mkdirSync(zippath);
    let resourcezipPath = path_1.default.join(zippath, resourceId + '.zip'); // 路径和名称
    // zip-local的压缩方法，通过流方式
    zipper.sync.zip(resourcePath).compress().save(resourcezipPath);
    // 将压缩的文件夹上传到服务器端
    return requestUrl(config.uploadUrl + '/' + resourceId, fs_1.default.createReadStream(resourcezipPath))
        .then((ostr) => {
        let o = JSON.parse(ostr.body);
        // 格式化返回
        if (o.status == 0)
            return { status: 0 };
        else
            return { status: -1, result: o.result };
    }).catch(err => {
        return { status: -1, result: err };
    });
}
/**
 * 将服务器端的数据下载到本地
 * @param resourceId 资源Id
 */
function downloadFromServer(resourceId) {
    try {
        let zippath = path_1.default.join(config.templateDir, 'zip', resourceId + '.zip'); // 压缩路径
        let fsStream = fs_1.default.createWriteStream(zippath); // 写入流
        request_1.default(config.downloadUrl + '/' + resourceId).pipe(fsStream); // 获取的数据写入到上诉文件
        return new Promise((resolve, reject) => {
            fsStream.on('close', (chunk) => {
                let resStream = unzip.Extract({ path: path_1.default.join(config.templateDir, resourceId) }); // 压缩包解析
                fs_1.default.createReadStream(zippath).pipe(resStream); // 流传输
                // 判断是否结束还是出错
                resStream.on('close', (chunk) => {
                    return resolve({ status: 0 });
                });
                resStream.on('error', () => {
                    return reject({ status: -1, result: "解压文件出现问题" });
                });
            });
            // 获取服务器数据是否出错
            fsStream.on('error', () => {
                return reject({ status: -1, result: "下载文件出现问题" });
            });
        });
    }
    catch (e) {
        return Promise.reject({ status: -1, result: "获取数据失败" });
    }
}
/**
 * request请求promise化
 * @param url 请求url
 * @param options 参数
 */
function requestUrl(url, options) {
    return new Promise((resolve, reject) => {
        let urlObj = {
            url: url,
            headers: {
                'Connection': 'close',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36'
            },
            cache: false
        };
        if (options) {
            urlObj.method = 'POST';
            urlObj.body = options;
            request_1.default.post(urlObj, done(resolve, reject));
        }
        else
            request_1.default(urlObj, done(resolve, reject));
    });
}
/* 回调函数的promise化 */
function done(resolve, reject) {
    return function (err, data) {
        if (err)
            reject(err);
        else
            resolve(data);
    };
}
