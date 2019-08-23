var TableHelper = (function () {
    return {
        getTdIndex: function ($elem) {
            if (!$elem || $elem.length <= 0) return -1;
            if ($elem.is("td")) return $elem.index();

            var $td = $elem.parents("td");
            if ($td.length <= 0) return -1;
            return $td.index();
        },
        buildBtnInputTd: function (btnStyle, btnText, key, noExpression) {
            btnStyle = btnStyle || "btn-config";
            btnText = btnText || "…";
            if (!key) return;

            return '<td>' +
                (noExpression ? '' : ('<button class="btn btn-default btn-sm ' + btnStyle + '">' + btnText + '</button>')) +
                '<input class="form-control" data-key="' + key + '" type="text">' +
                '</td>';
        },
        getRowAndCol: function($table) {
            if (!$table || $table.length <= 0) return;
            var $trs = $table.find('tr')
                col = 0,
                row = $trs.length;
            $trs.each(function() {
                var $tds = $(this).find("td"),
                    num = 0;
                $tds.each(function() {
                    num += $(this).attr('colspan') * 1 || 1;
                })
                num > col && (col = num);
            });
            return { row, col }
        }
    };
})();