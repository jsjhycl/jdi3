import {remote} from 'electron';
let {dialog} =remote;
/**
 * 打开本地文件选择器，返回选择的文件数组
 * @param filters 文件后缀筛选
 */
function openFileDialog(filters:string[]):any {// 该处any是因为可能会返回undefined
    let files = dialog.showOpenDialog({
        filters: [{ name: 'Excel', extensions: filters },
        { name: '*.*', extensions: ['*'] }],
    });
    return files;
}

export {openFileDialog}