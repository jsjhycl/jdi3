// 二维码模态框

/**
 * 
 * @param {Object} data 
 *          {
 *              action: "",
 *              data: "",
 *           }
 * @param {Function} callBack 
 */
function renderQrModal(data, callBack) {

    var uid = null; // 唯一编号
    var _cancel = false; // 取消递归
    var qrTimer = null;

    
    // 渲染模态框
    function _renderHtml() {
        var title = data.title;
        delete data['title']
        if (!$('.qr-modal') || $('.qr-modal').length <= 0) {
            $qrModal = $(`<div class="qr-modal">
                                <div class="qr-box container-fluid">
                                    <div class="qr-title">${title || "" }</div>
                                    <div class="qr-code"></div>
                                </div>
                            </div>`);
            $('body').append($qrModal)
        }
    }

    // 重置
    function _reset() {
        $('.qr-modal').find('qr-result').text('').next('btn').attr('disabled', 'disabled');
    }

    // 渲染二维码
    function _renderQrCode() {
        data['uid'] = Common.uid();
        data['fp'] = 'JDIQR';
        data['data'] = data['data'].toString();
        try {
            new QRCode($('.qr-modal').find('.qr-code').get(0), {
                text: JSON.stringify(data),
                width: 200,
                height: 200,
                colorDark: "#000000",
                colorLight: "#ffffff",
            });
        } catch (err) {
            console.log('err: ', err);
            alert('二维码生成失败!')
        }
        uid = data.uid;
    }

    function _bindEvent() {
        var nameSpace = '.qrModal';

        $(document).off(nameSpace);
        $(document).on('click' + nameSpace, function (event) {
            if ($(event.target).hasClass('qr-modal')) {
                event.stopPropagation();
                clearTimeout(qrTimer);
                uid = null;
                _cancel = true;
                $('.qr-modal').remove();
            }
        });
    }

    // 轮询
    async function _query() {
        try {
            // 取消请求
            if (_cancel) return clearTimeout(qrTimer);

            var result = await new Service().canSave(uid)

            if (result) {
                    
                // 扫描成功
                callBack();
                $('.qr-modal').remove();
            } else {
                qrTimer = setTimeout(function () {
                    _query()
                }, 1800)
            }
        } catch (err) {
            clearTimeout(qrTimer);
            alert(err);
            $('.qr-modal').remove();
        }
    }

    ;
    (function () {
        _renderHtml();
        _reset();
        _renderQrCode();
        _query();
        _bindEvent();
    })();
}