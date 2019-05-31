/**
 * 模态框帮助类
 * 提供通用的控件元素数据设置方法等；
 * @type {{setTableSelect, setFieldSelect, setInputData, setSelectData}}
 */
var ModalHelper = (function () {
    function setTableSelect(hasTrigger, $select, defaultOption, table, isPrompt) {
        if (!$select || $select.length <= 0) return;

        hasTrigger = !!hasTrigger;
        defaultOption = defaultOption || null;
        table = table || "";
        isPrompt = !!isPrompt;

        new Db().getTables(hasTrigger, function (tables) {
            var options = !Array.isArray(tables) ? [] : tables;
            Common.fillSelect($select, defaultOption, options, table, isPrompt);
        });
    }

    function setFieldSelect($select, defaultOption, table, field, isPrompt) {
        if (!$select || $select.length <= 0) return;

        defaultOption = defaultOption || null;
        field = field || "";
        isPrompt = !!isPrompt;

        if (!table) {
            Common.fillSelect($select, defaultOption, null, null, isPrompt);
            return;
        }

        new Db().getFields(table, function (fields) {
            var options = !Array.isArray(fields) ? [] : fields;
            Common.fillSelect($select, defaultOption, options, field, isPrompt);
        });
    }
    function setFieldSplitSelect($select, defaultOption, table, $field, fieldSplit, isPrompt) {
        if (!$select || $select.length <= 0) return;
        defaultOption = defaultOption || null;
        isPrompt = !!isPrompt;
        if (!$field || !table) {
            Common.fillSelect($select, defaultOption, null, null, isPrompt)
        }

        new Db().getFields(table, function (fields) {
            var options = !Array.isArray(fields) ? [] : fields,
            fieldSplits=[];
            options.forEach(function (item) {
                if (item.value == $field && item.fieldSplit) {
                    var i = item.fieldSplit;
                    for (i; i >= 1; i--) {
                        fieldSplits[i] = {name:"插入",value:i}
                    }
                }
            })
            Common.fillSelect($select, defaultOption, fieldSplits, fieldSplit, isPrompt);
        });
    }
    function setInputData($input, value, isJSON) {
        if (!$input || $input.length <= 0) return;

        value = value || "";
        isJSON = !!isJSON;

        if (value) {
            $input.val(isJSON ? JSON.stringify(value) : value);
        }
    }

    function setSelectData($select, defaultOption, options, value, isPrompt) {
        if (!$select || $select.length <= 0) return;

        defaultOption = defaultOption || null;
        if (!Array.isArray(options)) {
            options = [];
        }
        value = value || "";
        isPrompt = !!isPrompt;

        Common.fillSelect($select, defaultOption, options, value, isPrompt);
    }

    return {
        setTableSelect: setTableSelect,
        setFieldSelect: setFieldSelect,
        setFieldSplitSelect: setFieldSplitSelect,
        setInputData: setInputData,
        setSelectData: setSelectData
    };
})();
