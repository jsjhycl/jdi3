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
        fillCategorySelect: function(result) {
            var data = result["子分类"].map(function (item) { //遍历result的子分类
				return {
					name: item,
					value: item
				};
			});
            Common.fillRadio($("#model_resource_subCategory"), "model_resource_subCategory", data); //调用Common的fillRadio的资源分类
            Common.fillRadio($("#Changemodel_subCategory"), "model_resource_subCategory", data); //调用Common的fillRadio的资源分类
			//表单资源提交表单
			Common.fillSelect($('[name="template_category"]'), null, result["表单分类"], null, true); //填充表单分类下拉框
            Common.fillRadio($("#template_subCategory"), "template_subCategory", data); //填充表单分类的单选框
            Common.fillRadio($("#Changetemplate_subCategory"), "Changetemplate_subCategory", data); //填充表单分类的单选框            
			//布局资源提交表单
			// Common.fillSelect($('[name="model_category"]'), null, result["布局分类"], null, true); //填充布局分类的下拉框
			// Common.fillSelect($('[name="model_userGrade"]'), null, result["布局用户级别"], null, true); //填充用户级别的下拉框
			// Common.fillSelect($('[name="model_feature"]'), null, result["布局特性"], null, true); //填充布局特性的下拉框
			// Common.fillSelect($('[name="model_area"]'), null, result["布局区域"], null, true);
            // Common.fillSelect($('[name="model_autoCreate"]'), null, result["自动分表"], null, true); //新增自动分表属性
			// Common.fillSelect($('#property_page_Area'), null, result["布局区域"], null, true); //新增自动分表属性
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
        },
        getTdLocation: function($td) {
            if (!$td) return;

            let location = $td.attr('location');
            if (!location) return;

            let rowMap = location.split(':')[0],
                colMap = location.split(':')[1] || rowMap,
                colStart = rowMap.split('-')[0] * 1,
                rowStart = rowMap.split('-')[1] * 1,
                colEnd = colMap.split('-')[0] * 1,
                rowEnd = colMap.split('-')[1] * 1;
            return {
                colStart,
                rowStart,
                colEnd,
                rowEnd
            }
        },

        getCursortPosition: function(dom) {
            var cursorPos = 0;
            if (document.selection) {
                // IE Support
                dom.focus ();
                var selectRange = document.selection.createRange();
                selectRange.moveStart ('character', -dom.value.length);
                cursorPos = selectRange.text.length;
            }else if (dom.selectionStart || dom.selectionStart == '0') {
                // Firefox support
                cursorPos = dom.selectionStart;
            }
            return cursorPos;
        },
        insertAfterText: function(dom, value) {
            let selectRange;
            if (document.selection) {
                dom.focus();
                selectRange = document.selection.createRange();
                selectRange.text = value;
                dom.focus();
            }else if (dom.selectionStart || dom.selectionStart == '0') {
                let startPos = dom.selectionStart,
                    endPos = dom.selectionEnd,
                    scrollTop = dom.scrollTop;
                dom.value = dom.value.substring(0, startPos) + value + dom.value.substring(endPos, dom.value.length);
                dom.focus();
                dom.selectionStart = startPos + value.length;
                dom.selectionEnd = startPos + value.length;
                dom.scrollTop = scrollTop;
            }
            else {
                dom.value += value;
                dom.focus();
            }
        },
        uid: function () {
            var s = [];
            var hexDigits = "0123456789abcdef";
            for (var i = 0; i < 36; i++) {
                s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
            }
            s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
            s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
            s[8] = s[13] = s[18] = s[23] = "-";

            var uuid = s.join("");
            return uuid;
        },
    };
})();