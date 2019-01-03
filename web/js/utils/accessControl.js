var AccessControl = (function () {
    return {
        executeControlType: function (controlType) {
            var $elems = $('[data-target="#dataSource_static_modal"],[data-target="#dataSource_db_modal"]');
            if (controlType === "文本输入框" || controlType === "下拉列表") {
                $elems.prop("disabled", false);
            } else {
                $elems.prop("disabled", true);
            }
        },
        executeIsSave: function (isSave) {
            isSave = !!isSave;
            var $workspace = $("#workspace"),
                $propDbTable = $("#property_db_table"),
                $propDbField = $("#property_db_field"),
                $propDbDesc = $("#property_db_desc"),
                customId = $workspace.attr("data-customId"),
                id = $("#property_id").val(),
                cname = $("#property_cname").val(),
                $control = $workspace.find("#" + id),
                $elem = id === "BODY" ? $workspace : $control,
                property = new Property();
            $propDbTable.val(isSave ? customId : "");
            property.save($elem, $propDbTable);
            $propDbField.val(isSave ? id : "");
            property.save($elem, $propDbField);
            $propDbDesc.val(isSave ? cname : "");
            property.save($elem, $propDbDesc);
        }
    };
})();