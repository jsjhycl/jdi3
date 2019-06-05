import fs from 'fs';
import path from 'path';
import request from 'request';

let unzip = require('unzip'),
    zipper = require('zip-local');

let config = {
    profileDir: path.join(__dirname, '../data/profiles'),
    templateDir: path.join(__dirname, '../_template'),
    uploadUrl: 'http://172.18.152.111:3000/newapi/getResource',
    downloadUrl: 'http://172.18.152.111:3000/newapi/sendResource'
}

/**
 * 获取指定路径的配置文件
 * @param fileName 指定文件名
 * return 返回文件内容，json
 */
function getProfile(fileName: string) {
    return JSON.parse(fs.readFileSync(path.join(config.profileDir, fileName)).toString())
}

/**
 * 将文件压缩并上传到服务器
 * @param resourceId 资源号，代表文件夹
 */

function uploadToServer(resourceId: string) {
    let resourcePath = path.join(config.templateDir, resourceId);
    let exist = fs.existsSync(resourcePath);
    if (!exist) return Promise.reject('资源文件不存在');
    let zippath = path.join(config.templateDir, 'zip');
    if (!fs.existsSync(zippath))
        fs.mkdirSync(zippath);
    let resourcezipPath = path.join(zippath, resourceId + '.zip');
    zipper.sync.zip(resourcePath).compress().save(resourcezipPath);
    return requestUrl(config.uploadUrl + '/' + resourceId, fs.createReadStream(resourcezipPath))
        .then((ostr: any) => {
            let o = JSON.parse(ostr.body);
            if (o.status == 0) return {status: 0}
            else return {status: -1, result: o.result}
        }).catch(err => {
            return {status: -1, result: err}
        })
}

function downloadFromServer(resourceId: string) {
    try {
        let zippath = path.join(config.templateDir, 'zip', resourceId + '.zip');
        let fsStream = fs.createWriteStream(zippath);
        request(config.downloadUrl + '/' + resourceId).pipe(fsStream);
        return new Promise((resolve, reject) => {
            fsStream.on('close', (chunk: any) => {
                let resStream = unzip.Extract({path: path.join(config.templateDir, resourceId)});
                fs.createReadStream(zippath).pipe(resStream);
                resStream.on('close', (chunk: any) => {
                    return resolve({status: 0});
                })
                resStream.on('error', () => {
                    return reject({status: -1, result: "解压文件出现问题"});
                })
            })
            fsStream.on('error', () => {
                return reject({status: -1, result: "下载文件出现问题"});
            })
        })
    } catch (e) {
        return Promise.reject({status: -1, result: "获取数据失败"});
    }
}

//stream.pipe(res);

/**
 * 定义request中请求参数接口
 */
interface urlOption {
    url: string,
    headers: any,
    cache: boolean,
    method?: string,
    body?: any
}

function requestUrl(url: string, options: any) {
    return new Promise((resolve, reject) => {
        let urlObj: urlOption = {
            url: url,
            headers: {
                'Connection': 'close',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36'
            },
            cache: false
        }
        if (options) {
            urlObj.method = 'POST';
            urlObj.body = options;
            request.post(urlObj, done(resolve, reject))
        }
        else request(urlObj, done(resolve, reject))
    })
}

function done(resolve: any, reject: any) {
    return function (err: any, data: any) {
        if (err) reject(err);
        else resolve(data);
    }
}

export {getProfile, uploadToServer, downloadFromServer}