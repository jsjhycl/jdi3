var DataType = (function () {
    const DATA_TYPE_CONFIG = [
        "Null",
        "Undefined",
        "String",
        "Number",
        "Boolean",
        "Date",
        "Array",
        "Object",
        "RegExp",
        "Window",
        "HTMLDocument"
    ];
    const TYPE_TEXT_CONFIG = {
        "String": "字符串",
        "Number": "数字",
        "Boolean": "布尔型",
        "Date": "日期型",
        "Array": "数组",
        "Object": "对象",
        "Element": "元素"
    };
    const TEXT_TYPE_CONFIG = {
        "字符串": "String",
        "数字": "Number",
        "布尔型": "Boolean",
        "日期型": "Date",
        "数组": "Array",
        "对象": "Object",
        "元素": "Element"
    };

    var result = {};

    (function () {
        for (var i = 0; i < DATA_TYPE_CONFIG.length; i++) {
            var item = DATA_TYPE_CONFIG[i];
            (function (type) {
                result["is" + type] = function (obj) {
                    return Object.prototype.toString.call(obj) === "[object " + type + "]";
                };
            })(item);
        }
    })();

    result.toText = function (type) {
        return TYPE_TEXT_CONFIG[type];
    };

    result.toType = function (text) {
        return TEXT_TYPE_CONFIG[text];
    };

    result.convert = function (type, value, $chkb) {
        type = type || "String";
        switch (type) {
            case "String":
                value = String(value);
                break;
            case "Number":
                value = Number(value);
                break;
            case "Boolean":
                if ($chkb && $chkb.length > 0) {
                    value = $chkb.is(":checked");
                }
                break;
            case "Date":
                value = new Date(value);
                break;
            case "Object":
                value = Common.parseData(value || null);
                break;
            case "Array":
                value = Common.parseData(value || null);
                break;
            case "Element":
                break;
            default:
                value = String(value);
                break;
        }
        return value;
    };

    return result;
})();