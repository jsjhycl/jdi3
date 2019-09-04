var PropertyWatch = {
    selectWorkspace: function (view, key, name, change) {
        var that = this,
            $designer = $("#designer"),
            $workspace = $("#workspace"),
            $currentInput = $workspace.find(".focus"),
            $PropertyMask = $('<div id="propertyMask"><button class="close" data-dismiss="modal" style="color:red;opacity:1;outline:none;font-size:34px">&times;</button></div>'),
            $PropertyMaskContent = $('<div id="propertyMaskContent"></div>');
        $copyWorkSpace = $('<div id="copyWorkspace"></div>').html($workspace.html());
        $PropertyMaskContent.css({
            width: $designer.find("#ruler").width(),
            height: $designer.height(),
            overflow: "auto",
            margin: "auto",
            position: "relative"
        })
        $copyWorkSpace.css({
            width: $workspace.width(),
            height: $workspace.height(),
            background: $workspace.css("backgroundColor"),
            zIndex: 801,
            top: "18px"
        })
        $designer.css({
            display: "none"
        })
        $PropertyMask.css({
            padding: "0 10px 20px 20px",
            background: "rgb(0,0,0,.6)"
        })
        that.inputToBtn(view, $copyWorkSpace.find('input'), $workspace, key, name, change)
        $PropertyMaskContent.append($copyWorkSpace)
        $PropertyMask.append($PropertyMaskContent)
        $('body').append($PropertyMask)
        that.bindEvents()
    },
    inputToBtn: function (view, $doms, $originContainer, key, name, change) {
        $.each($doms, function (idnex, item) {
            var $dom = $(item),
                id = $dom.attr("id"),
                $origin = $originContainer.find("#" + id),
                isSelected = $dom.parent().hasClass("ui-draggable"),
                isNode = $dom.hasClass("workspace-node"),
                isFocus = $dom.hasClass('focus'),
                $span = $(`<span data-domId = "${id}" data-change="${change}" data-property="${key}" data-name="${name}" class="propertySpan"></span>`);
            // $temp = isSelected ? $dom.parent() : $dom;
            $temp = $dom;
            $span.css({
                // position:"static",
                width: isNode ? ($origin.outerWidth() ? $origin.outerWidth() : "151px") : "100%",
                height: isNode ? ($origin.outerHeight() ? $origin.outerHeight() : "27px") : "100%",
                position: $origin.css('position'),
                top: $origin.css('top'),
                left: $origin.css('left'),
                zIndex: 803,
                display: "block",
                boxSizing: "border-box"
            })

            switch (view) {
                case 'sameCname':

                    var cnames = new Property().getArrayByKey('cname'),
                        cname = new Property().getValue(id, "cname");
                    if (cnames.indexOf(cname) != cnames.lastIndexOf(cname)) {
                        $span.addClass('check-fn-node').html(cname)
                        $span.css({
                            "color": "red"
                        })
                    } else {
                        $span.addClass('check-fn-node').html(cname)
                    }
                    $span.attr({
                        'data-toggle': 'tooltip',
                        'data-placement': 'top',
                        'title': cname
                    });
                    break;
                case "property":
                    var value = new Property().getValue(id, key)
                    if (key == "id") {
                        value = id
                    };
                    if (typeof value == "object") {
                        value = JSON.stringify(value)
                    }

                    if (value) {
                        $span.attr({
                            'data-toggle': 'tooltip',
                            'data-placement': 'top',
                            'title': value
                        });
                    }
                    break;
            }
            $span.addClass('check-fn-node').html(value);
            $temp.replaceWith($span)
        })
    },
    resetView: function () {
        $("#propertyMask").remove()
    },

    bindEvents: function () {
        var that = this;
        $mask = $("#propertyMask");
        $mask.on("click", ".close", function () {
            $("#changePropertyBox").remove();
            that.resetView();
            $designer = $("#designer");
            $designer.css({
                display: "block"
            })
        })
        $mask.on("click", ".propertySpan", function () {
            $mask.find(".propertySpan").removeClass("selCurrent")
            var domId = $(this).attr("data-domid"),
                $control = $(`#workspace #${domId}`);
            new Property().load($control);
        })

        $mask.on("dblclick", ".propertySpan[data-change='true']", function (event) {
            $mask.find(".propertySpan").removeClass("selCurrent")
            $(this).addClass("selCurrent")
            $("#changePropertyBox").remove();
            var domId = $(this).attr("data-domid"),
                key = $(this).attr("data-property"),
                name = $(this).attr("data-name"),
                value = "",
                $div = $(`<div id="changePropertyBox">
                <div class="header">
                    <span>修改${name}属性</span>
                </div>
                <div class="content">
                    <textarea class="changePropertyValue"></textarea>
                    <button class="cancel btn btn-default btn-sm">取消</button>
                    <button class="propertySave btn btn-default btn-sm" data-domid="${domId}" data-property="${key}">保存</button>
                </div>
            </div>`);
            $div.css({
                position: "absolute",
                left: event.pageX,
                top: event.pageY,
                zIndex: 955
            })
            var $control = $(`#workspace #${domId}`)
            new Property().load($control);

            value = new Property().getValue(domId, key)
            if (typeof value == 'object') {
                value = JSON.stringify(value, null, 4)
            }

            $div.find(".changePropertyValue").val(value)
            $("body").append($div)
            that.execute()
        })

        $("body").on("click", ".navbar", function () {
            that.resetView()
            $designer = $("#designer");
            $designer.css({
                display: "block"
            })
        })

    },
    execute: function () {
        var that = this;
        $modal = $("#changePropertyBox");
        $modal.on("click", ".cancel", function () {
            $("#changePropertyBox").remove()
        })
        $modal.on("click", ".propertySave", function () {
            var value = $modal.find(".changePropertyValue").val(),
                id = $(this).attr("data-domId"),
                property = $(this).attr("data-property"),
                $mask = $("#propertyMask");
            $mask.find(`.propertySpan[data-domid='${id}']`).text(value);
            $mask.find(`.propertySpan[data-domid='${id}']`).attr("title", value);
            if (property == "expression" || property == "dataSource.db" || property == "events" || property == "query.db" || property == "archivePath" || Property == "query.nest") {
                if (!value) return;
                try {
                    value = JSON.parse(value)
                }catch{
                   return alert("请检查保存的数据格式是否正确?")
                }
            }
            new Property().setValue(id, property, value)
            var $control = $(`#workspace #${id}`)
            new Property().load($control);


            $("#changePropertyBox").remove()
        })
    }

}