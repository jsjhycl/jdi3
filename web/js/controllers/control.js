function Control() {
    this.CONTROL_TYPES = {
        text: '<input data-type="text" type="text" value="">',
        button: '<input data-type="button" type="button" value="button">',
        circleBtn: '<input data-type="circleBtn" type="button" value="circleBtn">',
        dotBtn: '<input data-type="dotBtn" type="button" value="dotBtn">',
        checkbox: '<input data-type="checkbox" type="checkbox" value="">',
        img: '<img data-type="img">',
        div: '<div data-type="div"></div>',
        arrow: '<canvas data-type="arrow" width="60" height="40"></canvas>',
        hidden: '<input data-type="hidden" type="hidden">'
    };
    this.CONTROL_HTML = {
        text: '<input data-type="text" type="text">',
        button: '<input data-type="button" type="button">',
        circleBtn: '<input data-type="circleBtn" type="button">',
        dotBtn: '<input data-type="dotBtn" type="button">',
        checkbox: '<input data-type="checkbox" type="checkbox">',
        img: '<div data-type="img"></div>',
        div: '<div data-type="div"></div>',
        arrow: '<canvas data-type="arrow"></canvas>',
        hidden: '<input data-type="hidden" type="hidden">'
    };
    this.getArrowConfig = function (subtype, w, h) {
        var result = { dots: [], rotate: 0 },
            triangle = 45;
        switch (subtype) {
            case 'left-arrow':
                result.rotate = 180;
            case 'right-arrow':
                result.dots = [
                    [0, h / 3],
                    [w - triangle, h / 3],
                    [w - triangle, 0],
                    [w, h / 2],
                    [w - triangle, h],
                    [w - triangle, h / 3 * 2],
                    [0, h / 3 * 2]
                ];
                break;
            case 'bottom-arrow':
                result.rotate = 180;
            case 'up-arrow':
                result.dots = [
                    [w / 3 * 1, h],
                    [w / 3 * 1, triangle],
                    [0, triangle],
                    [w / 2, 0],
                    [w, triangle],
                    [w / 3 * 2, triangle],
                    [w / 3 * 2, h],
                ]
                break;
            case "bottom-right-arrow":
                result.rotate = 180;
            case "up-left-arrow":
                result.dots = [
                    [0, h / 3],
                    [w - triangle, h / 3],
                    [w - triangle, 0],
                    [w, h / 2],
                    [w - triangle, h],
                    [w - triangle, h / 3 * 2],
                    [h / 3, h / 3 * 2],
                    [h / 3, h],
                    [0, h]
                ]
                break;
            case "up-right-arrow":
                result.rotate = 180;
            case "bottom-left-arrow":
                result.dots = [
                    [w / 3, h],
                    [w / 3, triangle],
                    [0, triangle],
                    [w / 2, 0],
                    [w, triangle],
                    [w / 3 * 2, triangle],
                    [w / 3 * 2, h - w / 3],
                    [w, h - w / 3],
                    [w, h]
                ]
                break;
        }
        return result;
    };
    this.rotateCenter = function (ctx, rotate, w, h) {
        if (!ctx || !rotate) return;
        ctx.translate(w / 2, h / 2);
        ctx.rotate(rotate * Math.PI / 180);
        ctx.translate(-w / 2, -h / 2);
    };
}

Control.prototype = {
    createNumber: function (type) {
        var $workspace = $("#workspace"),
            arrs = [],
            prefix = "",
            $nodes = null;
        switch (type) {
            case "img":
                prefix = "IMG_";
                $nodes = $workspace.find('.workspace-node[data-type="img"]');
                break;
            case "div":
                prefix = "DIV_";
                $nodes = $workspace.find('.workspace-node[data-type="div"]');
                break;
            case "child":
                prefix = "";
                $nodes = $workspace
                    .find('.workspace-node:not(.workspace-node[data-type="img"],.workspace-node[data-type="div"]),.workspace-node[data-type="div"] :input');
                break;
            // case "arrow":
            //         prefix = "ARROW_";
            //         $nodes = $workspace.find('.workspace-node[data-type="arrow"]');
            //     break;
            default:
                prefix = "";
                $nodes = $workspace
                    .find('.workspace-node:not(.workspace-node[data-type="img"],.workspace-node[data-type="div"]),.workspace-node[data-type="div"] :input');
                break;
        }
        $nodes.each(function () {
            var id = $(this).attr("id");
            if (id) {
                arrs.push(id.substring(prefix.length));
            }
        });
        if (arrs.includes("ZZZZ")) {
            arrs.splice(arrs.indexOf("ZZZZ"), 1)
        }
        var max = arrs.max("String");
        if (!max) return prefix + "AAAA";
        else return prefix + NumberHelper.idToName(NumberHelper.nameToId(max) + 1, 4);
    },
    getControl: function (type) {
        var that = this;
        return $(that.CONTROL_TYPES[type]);
    },
    setControl: function (type, callback, is_phone) {
        var that = this,
            $node = $(that.CONTROL_TYPES[type]),
            contextMenu = new ContextMenu();
        is_phone = !!is_phone;
        $node.addClass("workspace-node").css({
            "position": "absolute",
            "z-index": 500
        });
        switch (type) {
            case "img":
                !is_phone && contextMenu.done(1, $node);
                break;
            case "div":
                !is_phone && contextMenu.done(2, $node);
                break;
            default:
                !is_phone ? contextMenu.done(3, $node) : contextMenu.done(4, $node);
                break;
        }
        if (callback) {
            callback.call(this, $node);
        }
    },
    renderHtml: function (id, basic, subtype) {
        var that = this,
            $node = $(that.CONTROL_HTML[basic.type]),
            $ori = $('#' + basic.id),
            type = new Property().getValue(basic.id, 'controlType');

        $node.attr({ "id": basic.id, "name": basic.name, value: basic.value || "" });

        if (type === '签名控件') $node.attr('control-type', '签名控件');

        basic.type === 'checkbox' && $ori.is(":checked") ? $node.attr('checked', 'checked') : $node.removeAttr('checked');
        $node.css({
            "position": "absolute",
            "left": basic.rect.left,
            "top": basic.rect.top,
            "width": basic.rect.width,
            "height": basic.rect.height,
            "z-index": basic.rect.zIndex
        });
        switch (basic.type) {
            case "img":
                var src = basic.attach.src;
                $node.css({
                    "background": "url(" + src + ") no-repeat center center",
                    "background-size": "100% 100%"
                });
                break;
            case "div":
                $node.append(basic.attach ? basic.attach.html : "");
                $ori.find(':checkbox').each(function () {
                    $(this).is(':checked') ? $node.find('#' + this.id).attr('checked', 'checked') : $node.find('#' + this.id).removeAttr('checked')
                })
                break;
            case "arrow":
                $node.attr({
                    "width": basic.rect.width,
                    "height": basic.rect.height,
                    "data-subtype": subtype,
                });
            default:
                break;
        }
        return $node.get(0).outerHTML;
    },
    remove: function () {
        var $selected = $("#workspace").find(".resizable").length > 0 ? $("#workspace").find(".resizable") : $("#phone_content").find(".resizable");
        if ($selected.length <= 0) return alert("请选择需要删除的元素");

        var result = confirm("确定删除选中的元素吗？");
        if (!result) return;

        $selected.each(function () {
            var $wsnode = $(this).find(".workspace-node");
            if ($wsnode.data("type") === "div") {
                $wsnode.find(":input").each(function () {
                    new Property().remove(this.id);
                });
            } else {
                new Property().remove($wsnode.attr("id"));
            }
        });
        $selected.remove();
        // new Workspace().save(false);
    },
    copy: function ($selected) {
        if (!$selected || $selected.length <= 0) return;

        if ($selected.length > 1) return alert("不支持复制多个控件");

        var type = $selected.attr("data-type");
        if (type === "img" || $selected.find(":input").length > 0) return alert("不支持的复制类型！");

        var id = $selected.attr("id");
        new Clipboard().setData("controlId", id);
    },
    paste: function () {
        var that = this,
            id = new Clipboard().getData("controlId");
        if (!id) return;

        var $elem = $("#" + id),
            type = $elem.attr("data-type");
        if (!type || type === "img" || $elem.find(":input").length > 0) return;

        that.setControl(type, function ($node) {
            var number = that.createNumber(type);
            $node.attr({
                "id": number,
                "name": number
            }).css({
                "left": "5px",
                "top": ($(window).scrollTop() + 5) + "px"
            });
            if (type === "div") {
                var name = prompt("输入新控件的内容：", "");
                if (name) {
                    $node.html(name);
                }
                new ContextMenu().done(2, $node);
            } else {
                new ContextMenu().done(3, $node);
            }
            $("#workspace").append($node);
            new Property().setDefault(number);
        });
    },
    getPhoneControlHtml: function ($el, id) {
        if (!$el || !id) return;

        var top = parseFloat($el.css('top')),
            left = parseFloat($el.css('left')),
            height = $el.outerHeight(),
            property = new Property(),
            cname = property.getValue(id, "cname"),
            relatedId = property.getValue(id, "relatedId"),
            newCname = !cname || cname != id ? property.getValue(id, "cname") : relatedId ? property.getValue(relatedId, "cname") : "";
        controlHtml = $($el.get(0).outerHTML).attr('id', GLOBAL_PROPERTY[id] && relatedId ? relatedId : id).get(0).outerHTML,
            spanHtml = "",
            $span = newCname ? $("<span style='position: absolute; visibility: hidden;'>" + newCname + "</span>") : "";
        if ($span) {
            var span_width = $span.appendTo($("body")).width(),
                span_height = $span.height();
            $span.remove();
            spanHtml += "<span style='position: absolute; top: " + (height > span_height ? (height - span_height) / 2 + top : top) + "px; left: " + (left - span_width - 8) + "px'>" + newCname + "</span>";
        }
        return controlHtml + spanHtml;
    },
    drawArrow: function ($cvs, subtype, w, h) {
        if (!$cvs || Number.isNaN(Number(w))) return;

        var ctx = $cvs.get(0).getContext('2d'),
            w = w || parseInt($cvs.attr("width")),
            h = h || parseInt($cvs.attr("height"));

        $cvs.attr({ width: w, height: h });
        var config = this.getArrowConfig(subtype, w, h);

        // 清空画布
        ctx.clearRect(0, 0, w, h);
        ctx.lineWidth = 1;
        // 旋转
        this.rotateCenter(ctx, config.rotate, w, h)
        // 画坐标
        var dots = config.dots;
        dots.forEach(function (item, idx) {
            if (idx === 0) return ctx.moveTo(...item);
            ctx.lineTo(...item);
            idx === dots.length - 1 && ctx.lineTo(...dots[0]);
        });
        // 线条色
        ctx.strokeStyle = "#CCC";
        ctx.stroke();
        ctx.fillStyle = "#FFF"
        ctx.fill();
        ctx.save();
    },
    setDrawControl: function (type, subtype, w, h, callback) {
        var that = this,
            $canvas = $(that.CONTROL_TYPES[type]);
        $canvas.addClass("workspace-node").css({
            "position": "absolute",
            "z-index": 500
        }).attr({
            "data-subtype": subtype
        });
        that.drawArrow($canvas, subtype, w, h);
        if (callback) {
            callback.call(this, $canvas);
        }
    },
};