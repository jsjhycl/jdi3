var Table = {
    index: function ($elem) {
        if ($elem.is("td")) return $elem.index();

        var $td = $elem.parents("td");
        if ($td.length <= 0) return -1;
        return $td.index();
    }
};