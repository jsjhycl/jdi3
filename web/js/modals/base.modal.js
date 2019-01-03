/**
 * 模态框基类
 * @param $modal
 * @param $element
 * @constructor
 */
function BaseModal($modal, $element) {
    if (!$modal || $modal.length <= 0) throw "无效的模态框！";

    this.$modal = $modal;
    this.$modalBody = $modal.find(".modal-body");
    this.$element = $element || null;

    this.basicEvents = function (isJSON, openFn, saveFn, clearFn) {
        isJSON = !!isJSON;
        var that = this;
        
        // $('.noMask-modal .close').trigger('click'); // 12/25 添加
        
        //模态框显示事件
        that.$modal.off("show.bs.modal");
        that.$modal.on("show.bs.modal", {$element: that.$element}, function (event) {
            var data = null,
                $element = event.data.$element;
            if ($element && $element.length > 0) {
                data = $element.val() || null;
                if (isJSON) {
                    data = Common.parseData(data);
                }
            }
            if (openFn) {
                openFn.call(that, data);
            }
        });

        //关闭功能
        var $close = that.$modal.find(".modal-header .close");
        if ($close && $close.length > 0) {
            $close.off("click");
            $close.on("click", function () {
                that.$modal.modal("hide");
            });
        }

        //保存功能
        var $save = that.$modal.find(".modal-footer .save");
        if ($save && $save.length > 0) {
            $save.off("click");
            $save.on("click", function () {
                if (saveFn) {
                    saveFn.call(that);
                }
                that.$modal.modal("hide");
            });
        }

        //清除功能
        var $clear = that.$modal.find(".modal-footer .clear");
        if ($clear && $clear.length > 0) {
            $clear.off("click");
            $clear.on("click", function () {
                if (clearFn) {
                    clearFn.call(that);
                }
            });
        }
    };
}