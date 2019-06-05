function Filter(type, subtype) {
    this.type = type || null;
    this.subtype = subtype || null;
    /**
     * first: ["save","submit","recall","basic","validate","events","expression","dataSource","query","db"]。PS：basic之后（包含basic）为属性栏配置
     * second: ["id","name","cname","value","controlType","fontFamily","fontSize","color","backgroundColor","visibility","disable","readonly"…]。PS：控件属性数据配置
     */
    this.FILTER_CONFIG = {
        "初始化/加载":{
            zero:["asider","delete","preview","test"],
            first:[],
            second:[]
        },
        "资源/模板": {
            zero:[],
            first: ["save", "submit", "basic", "validate", "expression"],
            second: []
        },
        "资源/模型": {
            zero:[],
            first: ["save", "submit", "recall", "basic", "validate", "expression"],
            second: []
        },
        "产品/模板": {
            zero:[],
            first: ["save", "submit", "basic", "validate", "expression"],
            second: []
        },
        "产品/模型": {
            zero:[],
            first: ["save", "submit", "recall", "basic", "validate", "expression", "dataSource", "events", "query"],
            second: []
        },
        "数据库定义/模型": {
            zero:[],
            first: ["save", "submit", "basic", "validate", "expression", "dataSource", "events", "query", "db"],
            second: []
        },
        "发布": {zero:[],first: [], second: []}
    };
}

Filter.prototype.set = function () {
    var that = this,
        type = that.type,
        subtype = that.subtype,
        key = [type, subtype].filter(function (item) {
            return item;
        }).join("/"),
        filter = that.FILTER_CONFIG[key];
    $("[data-first-filter],[data-second-filter],[data-zero-filter]").show();

    $("[data-zero-filter]").each(function(){
        var zeroFilter = $(this).data("zeroFilter")
        if(filter["zero"].isExist(null,zeroFilter)){
            $(this).hide()
        }
    })
    //一级过滤
    $("[data-first-filter]").each(function () {
        var firstFilter = $(this).data("firstFilter");
        if (!filter["first"].isExist(null, firstFilter)) {
            $(this).hide();
        }
    });
    //二级过滤
    $("[data-second-filter]").each(function () {
        var secondFilter = $(this).data("secondFilter");
        if (filter["second"].isExist(null, secondFilter)) {
            $(this).hide();
        }
    });
};