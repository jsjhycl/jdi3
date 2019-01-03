var TableHelper = (function () {
    return {
        getTdIndex: function ($elem) {
            if (!$elem || $elem.length <= 0) return -1;
            if ($elem.is("td")) return $elem.index();

            var $td = $elem.parents("td");
            if ($td.length <= 0) return -1;
            return $td.index();
        },
        buildBtnInputTd: function (btnStyle, btnText, key) {
            btnStyle = btnStyle || "btn-config";
            btnText = btnText || "…";
            if (!key) return;

            return '<td>' +
                '<button class="btn btn-default btn-sm ' + btnStyle + '">' + btnText + '</button>' +
                '<input class="form-control" data-key="' + key + '" type="text">' +
                '</td>';
        }
    };
})();