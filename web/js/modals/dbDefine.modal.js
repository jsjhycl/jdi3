/**
 * 数据库定义配置
 * @param $modal
 * @constructor
 */
function DbDefineModal($modal) {
    BaseModal.call(this, $modal, null);//绑定基弹窗
}

DbDefineModal.prototype = {
    initData: function () {
        var that = this;
        new ProductService().list("模型", 20, function (result) {//调用ProductService的list方法
            Common.handleResult(result, function (data) {//调用Common的HandleResult方法
                if (!Array.isArray(data)) return;//如果结果不是数组退出函数

                var html = "";//声明变量
                for (var i = 0; i < data.length; i++) {//遍历小于data的长度
                    var item = data[i];
                    html += '<tr data-id="' + item.id + '" data-customId="' + item.basicInfo.customId + '">' +
                        '<td><a>' + item.name + '</a></td>' +
                        '<td class="text-center">' + item.type + '</td></tr>';//生成html
                }
                that.$modalBody.find(".table").empty().append(html);//在弹窗中找到table元素把html元素放进去
            });
        });
    },
    execute: function () {
        var that = this;
        that.basicEvents(null, that.initData, null, null);//绑定基础事件
    },
    bindEvents: function () {
        var that = this;
        that.$modal.on("click", ".modal-body .table a", function () {//半丁事件
            var $tr = $(this).parents("tr"),//获取tr元素
                id = $tr.data("id"),//获取id
                name = $(this).text(),//获取name值
                customId = $tr.attr("data-customId");//获取customId
            that.$modal.modal("hide");//弹窗隐藏
            new Workspace().load(id, name, "数据库定义", "模型", "定义", customId, null);//实例化工作区定义调用load方法
            new Main().open();//实例化main调用open方法
        });
    }
};