var DOM = (function () {
    var MARK = "&";

    //重绘
    function repaint(id) {
    }

    //获取等值元素
    function getEqualElements($srcDiv, $dstDiv) {
        var result = [],
            getInputs = function ($div) {
                return $div.find(":input").filter(function () {
                    var id = this.id,
                        value = $(this).val();
                    return 4 === id.length && MARK !== value;
                });
            },
            $srcInputs = getInputs($srcDiv),
            $dstInputs = getInputs($dstDiv);
        $srcInputs.each(function () {
            var value = $(this).val(),
                $filter = $dstInputs.filter(function () {
                    return value === $(this).val();
                }).first();
            if ($filter.length === 1) {
                result.push({key: $(this), value: $filter});
            }
        });
        return result;
    }

    //清空编号
    function clearIds() {
    }

    //设置编号
    function setIds($div, rule) {
        var $inputs = $div.find(":input").filter(function () {
            var id = this.id,
                value = $(this).val();
            return 4 === id.length && (rule && rule === value);
        });
        $inputs.each(function () {
            var id = this.id,
                maxId = Numeration.getMaxId();
            if (Numeration.nameToId(id) !== maxId) {
                var newId = Numeration.idToName(maxId + 1, 4);
                $(this).attr({
                    id: newId,
                    name: newId
                });
                var property = new Property(),
                    svalue = property.getValue(id);
                property.setValue(newId, null, svalue);
                property.remove(id);
            }
        });
    }

    return {
        repaint: repaint,
        getEqualElements: getEqualElements,
        clearIds: clearIds,
        setIds: setIds
    };
})();