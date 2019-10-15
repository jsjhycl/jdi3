/**
 * 事件向导页面
 */
function EventsGuide($modal, $elemts) {
    BaseModal.call(this, $modal, $elemts)
    this.$modal = $modal
    this.$elemts = $elemts
}
EventsGuide.prototype = {
    initData: function (data) {
        let that = this;
        that.$modal.Guide({
            data: data,
            type: "eventsGuide",
            items: [{
                    title: "添加事件和事件描述",
                    step: 0,
                    isFirst: true,
                    isFinally: false,
                    guideKey: "EventAndDesc",
                    branch: true
                },
                {
                    title: "事件触发触发条件",
                    step: 1,
                    isFirst: false,
                    isFinally: false,
                    guideKey: "EventCondition"
                },
                {
                    title: "执行方法",
                    step: 2,
                    isFirst: false,
                    isFinally: false,
                    guideKey: "EventMehods"
                },
                {
                    title: "配置方法",
                    step: 3,
                    isFirst: false,
                    isFinally: true,
                    guideKey: "MethodsDetail"
                }
            ]
        })
    },
    saveData: function () {},
    clearData: function () {},
    bindEvents: function () {},
    execute: function () {
        let that = this;
        that.basicEvents(true, that.initData, that.saveData, that.clearData)
    }
}