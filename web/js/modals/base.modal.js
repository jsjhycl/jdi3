/**
 * 模态框基类
 * @param $modal
 * @param $element
 * @constructor
 */
function BaseModal($modal, $element) {
    if (!$modal || $modal.length <= 0) throw "无效的模态框！"; //如果$modal或则$modal的长度小于零throw一个错误

    this.$modal = $modal; //赋值
    this.$modalBody = $modal.find(".modal-body"); //获取模态框的modal-body
    this.$element = $element || null; //如果$element有值就用改值否则为空

    this.basicEvents = function (isJSON, openFn, saveFn, clearFn) { //绑定事件
        isJSON = !!isJSON; //isJSon转换为布尔值
        var that = this;

        // $('.noMask-modal .close').trigger('click'); // 12/25 添加

        //模态框显示事件
        that.$modal.off("show.bs.modal"); //移除show.bs.modal上的所有事件
        that.$modal.on("show.bs.modal", {
            $element: that.$element
        }, function (event) { //给show.bs.modal上绑定事件
            var data = null,
                $element = event.data.$element; //获取元素
            if ($element && $element.length > 0) { //如果$element存在且$element的长度大于零
                data = $element.val() || null; //data等于$elemt的值或则为空
                if (isJSON) { //如果isJSon为真
                    data = Common.parseData(data); //执行Common的parseData方法
                }
            }
            if (openFn) { //如果openFn为true
                openFn.call(that, data);
            }
        });

        //关闭功能
        var $close = that.$modal.find(".modal-header .close"); //获取模态框上的close类名的元素
        if ($close && $close.length > 0) { //如果$close大于等于0
            $close.off("click"); //移除$close事件
            $close.on("click", function () { //绑定事件
                that.$modal.modal("hide"); //模态框隐藏
            });
        }

        //保存功能
        var $save = that.$modal.find(".modal-footer .save"); //获取模态框上的.save元素
        if ($save && $save.length > 0) { //如果$save或则$save的长度大于零
            $save.off("click"); //移除事件
            $save.on("click", function () { //移除事件
                if (saveFn) { //如果issaveFn为真
                    var result = saveFn.call(that); //绑定事件
                    if (result === -1 || result === "judgeFalse") return false
                }
                that.$modal.modal("hide"); //隐藏模态框
            });
        }

        //清除功能
        var $clear = that.$modal.find(".modal-footer .clear"); //获取模态框上的.clear元素
        if ($clear && $clear.length > 0) { //如果$clear或则$clear的长度大于零
            $clear.off("click"); //移除事件
            $clear.on("click", function () { //移除事件
                if (clearFn) { //如果clearFn为真
                    var result = clearFn.call(that); //绑定事件
                    if (result) that.$modal.modal("hide"); //隐藏模态框
                }
            });
        }
    };
}