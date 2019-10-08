/**
 * 过滤函数模块
 * @param {*} type 初始化 资源 产品 数据库定义 发布
 * @param {*} subtype 加载 表单 布局
 */
function Filter(subtype) {
    this.subtype = subtype || null; //如果传入subtype就用subtype否则subtype为空
    /**
     * first: ["save","submit","recall","basic","validate","events","expression","dataSource","query","db"]。PS：basic之后（包含basic）为属性栏配置
     * second: ["id","name","cname","value","controlType","fontFamily","fontSize","color","backgroundColor","visibility","disable","readonly"…]。PS：控件属性数据配置
     */
    this.FILTER_CONFIG = { //定义一下过滤配置
        "加载": { //
            zero: ["asider", "delete", "preview", "test"], //0级过滤页面初始化的时候
            first: [], //一级过滤
            second: [] //二级过滤
        },
        "表单": {
            zero: [],
            first: ["save", "submit", "basic", "validate", "expression"],
            second: []
        },
        "布局": {
            zero: [],
            first: ["save", "submit", "recall", "basic", "validate", "expression", "dataSource", "events", "query", "db", "page", "deleteDb"],
            second: []
        },
        "发布": {
            zero: [],
            first: [],
            second: []
        }
    };
}

Filter.prototype.set = function () {
    var that = this,
        // type = that.type,//获取现在的type
        // subtype = that.subtype,//获取现在的subtype
        // key = [type, subtype].filter(function (item) {//把type和subtype和并并添加/
        //     return item;
        // }).join("/"),
        key = that.subtype,
        filter = that.FILTER_CONFIG[key];
    $("[data-first-filter],[data-second-filter],[data-zero-filter]").show(); //获取页面中所有属性data-first-filter和data-second-filter和data-zero-filter的元素让他们显示

    $("[data-zero-filter]").each(function () { //遍历所有属性为data-zero-filter属性的元素
        var zeroFilter = $(this).data("zeroFilter") //获取该元素的zeroFilter属性
        if (filter["zero"].isExist(null, zeroFilter)) { //如果当前元素属性存在zero数组中
            $(this).hide() //给该元素隐藏
        }
    })
    //一级过滤
    $("[data-first-filter]").each(function () { //遍历所有属性为data-first-filter属性的元素
        var firstFilter = $(this).data("firstFilter"); //获取该元素的firstFilter属性
        if (!filter["first"].isExist(null, firstFilter)) { //如果当前元素属性不存在first数组中
            $(this).hide(); //给该元素隐藏
        }
    });
    //二级过滤
    $("[data-second-filter]").each(function () { //遍历所有属性为data-second-filter属性的元素
        var secondFilter = $(this).data("secondFilter"); //获取该元素的secondFilter属性
        if (filter["second"].isExist(null, secondFilter)) { //如果当前元素属性不存在second数组中
            $(this).hide(); //给该元素隐藏
        }
    });
    // $("#toolbar").css('right',"260px")
    // $("#toolbar").css('left',"140px")
};