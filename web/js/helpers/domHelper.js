var DomHelper = (function () {
    var MARK = "&";

    //重绘
    function repaint(id) {
    }
    
    /**
     * 获取等值元素
     * @param {*} $srcDiv 原来的子模块 
     * @param {*} $dstDiv 现在的子模块
     */
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
                maxId = NumberHelper.getMaxId();
            if (NumberHelper.nameToId(id) !== maxId) {
                var newId = NumberHelper.idToName(maxId + 1, 4);
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

    function copy($dom) {
        if (!$dom) return;
        let $copy = $dom.clone(true);
        $copy.css({
            position: 'fixed',
            top: $dom.offset().top - $(document).scrollTop(),
            left: $dom.offset().left,
            zIndex: 800,
        }).attr('id', $copy.attr('id') + '_copy').addClass('selected copy-dom').off();

        return $copy
    }

    function isInPhone($phoneContainer, $node, nodeOffsetTop, nodeOffsetLeft) {
        if (!$phoneContainer || !$node || $phoneContainer.is(':hidden')) return;
            var p_top = $phoneContainer.offset().top,
                p_bottom = $phoneContainer.offset().top + $phoneContainer.height(),
                p_left = $phoneContainer.offset().left,
                p_right = $phoneContainer.offset().left + $phoneContainer.width(),
                ui_width = $node.width(),
                ui_height = $node.height();
            return (nodeOffsetTop >= p_top && (nodeOffsetTop + ui_height) <= p_bottom && nodeOffsetLeft >= p_left && (nodeOffsetLeft + ui_width) <= p_right)
    }

    return {
        repaint: repaint,
        getEqualElements: getEqualElements,
        clearIds: clearIds,
        setIds: setIds,
        copy: copy,
        isInPhone: isInPhone
    };
})();