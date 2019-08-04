var GLOBAL_PROPERTY = {};

var Common = (function () {
    return {
        parseData: function parseData(data) {
            try {
                return JSON.parse(data);
            } catch (e) {
                console.log("Common.parseData e:", e);
                return null;
            }
        },
        fillSelect: function fillSelect($select, defaultOption, options, selectedValue, isPrompt) {
            if (!$select || $select.length <= 0) return;
            if (!Array.isArray(options)) {
                options = [];
            }
            isPrompt = !!isPrompt;
            var data = Array.prototype.slice.call(options, 0);
            if (DataType.isObject(defaultOption)) {
                data.unshift(defaultOption);
            }
            var html = "";
            data.forEach(function (item) {
                var value = item.value,
                    prompt = "",
                    selected = "";
                if (isPrompt && value) {
                    prompt = "(" + value + ")";
                }
                if (value === selectedValue) {
                    selected = ' selected';
                }
                html += '<option value="' + value + '"' + selected + '>' + item.name + prompt + '</option>';
            });
            $select.empty().append(html);
            if (selectedValue) {
                $select.val(selectedValue);
            }
        },
        fillRadio: function ($container, name, data) {
            if (!$container || $container.length <= 0) return;
            if (!Array.isArray(data)) {
                data = [];
            }
            var html = "",
                items = Array.prototype.slice.call(data, 0);
            items.forEach(function (item, index) {
                var checked = "";
                if (index === 0) {
                    checked = " checked";
                }
                html += '<label class="checkbox-inline">' +
                    '<input type="radio" name="' + name + '" value="' + item.value + '"' + checked + '>' + item.name +
                    '</label>';
            });
            $container.empty().append(html);
        },
        handleResult: function (result, callback) {
            var failedMsg = "操作失败！\n消息：";
            if (DataType.isObject(result)) {
                var data = result.result;
                if (result.status === 0) callback(data);
                else alert(failedMsg + JSON.stringify(data, null, 2));
            } else alert(failedMsg + "服务器数据获取异常！");
        },
        cutString: function(str) {
          if (!str) return;
          let reg = /([a-zA-Z]+)([0-9]+)/;
          reg.test(str)
          return { $1: RegExp.$1, $2: Number(RegExp.$2) }
        },
        duplicate: function (data) {
            var result = {};
            for (var key in data) {
                result[key] = data[key];
            }
            return result;
        },
        recurseObject: function (data, key) {
            var that = this;
            if (key.indexOf(".") > -1) {
                var temp = that.duplicate(data),
                    keys = key.split(".");
                for (var i = 0; i < keys.length; i++) {
                    var ckey = keys[i],
                        cvalue = temp[ckey];
                    if (!cvalue) {
                        break;
                    } else {
                        temp = cvalue;
                    }
                }
                return temp;
            } else {
                return data[key];
            }
        }
    };
})();