function Control() {
    this.CONTROL_TYPES = {
        text: '<input data-type="text" type="text" value="">',
        button: '<input data-type="button" type="button" value="button">',
        checkbox: '<input data-type="checkbox" type="checkbox" value="">',
        img: '<img data-type="img">',
        div: '<div data-type="div"></div>',
        arrow: '<canvas data-type="arrow" width="60" height="40"></canvas>'
    };
    this.CONTROL_HTML = {
        text: '<input data-type="text" type="text">',
        button: '<input data-type="button" type="button">',
        checkbox: '<input data-type="checkbox" type="checkbox">',
        img: '<div data-type="img"></div>',
        div: '<div data-type="div"></div>',
        arrow: '<canvas data-type="arrow"></canvas>'
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
            $node = $(that.CONTROL_HTML[basic.type]);
        $node.attr({"id": basic.id, "name": basic.name, value: basic.value || ""});
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
                var src = "/lib/" + id + "/res/" + basic.attach.src,
                    img = !basic.attach ? "../public/images/demo.jpg" : (!basic.attach.src ? "../public/images/demo.jpg" : src);
                $node.css({
                    "background": "url(" + src + ") no-repeat center center",
                    "background-size": "100% 100%"
                });
                break;
            case "div":
                $node.append(basic.attach ? basic.attach.html : "");
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
    getPhoneControlHtml: function($el, id) {
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
                spanHtml += "<span style='position: absolute; top: "+ (height > span_height ? (height - span_height)/2 + top : top ) +"px; left: "+ (left - span_width - 8) +"px'>"+ newCname +"</span>";
            }
            return controlHtml + spanHtml;
    },

    drawRightArrow: function($cvs, w, h, color, rotate) {
        if (!$cvs || Number.isNaN(Number(w))) return;

        color = color || '#ccc';
        rotate = rotate || 0;

        var ctx = $cvs.get(0).getContext('2d'),
            w = w || parseInt($cvs.attr("width")),
            h = h || parseInt($cvs.attr("height"));
            d1 = [,],
            d2 = [,],
            d3 = [,],
            d4 = [,],
            d5 = [,],
            d6 = [,],
            d7 = [,];
        $cvs.attr({ width: w, height: h })
        d4[0] = w;
        d4[1] = h / 2;
        d1[0] = 0;
        d1[1] = h / 3 * 1;
        d2[0] = w * 0.618;
        d2[1] = h / 3 * 1;
        d3[0] = w * 0.618;
        d3[1] = 0
        d5[0] = w * 0.618;
        d5[1] = h;
        d6[0] = w * 0.618;
        d6[1] = h / 3 * 2;
        d7[0] = 0;
        d7[1] = h / 3 * 2

        ctx.clearRect(0, 0, w, h);
        ctx.translate( w / 2, h / 2);
        ctx.rotate(rotate * Math.PI/180);
        ctx.translate(-w / 2, -h / 2);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(...d1);
        ctx.lineTo(...d2);
        ctx.lineTo(...d3);
        ctx.lineTo(...d4);
        ctx.lineTo(...d5);
        ctx.lineTo(...d6);
        ctx.lineTo(...d7);
        ctx.lineTo(...d1);
        ctx.strokeStyle = color;
        ctx.stroke();
        ctx.closePath();
    },

    drawUpArrow: function($cvs, w, h, color, rotate) {
        if (!$cvs || Number.isNaN(Number(w))) return;
        color = color || '#ccc';
        rotate = rotate || 0;

        var ctx = $cvs.get(0).getContext('2d'),
            w = w || parseInt($cvs.attr("width")),
            h = h || parseInt($cvs.attr("height"));
            d1 = [,],
            d2 = [,],
            d3 = [,],
            d4 = [,],
            d5 = [,],
            d6 = [,],
            d7 = [,];
        $cvs.attr({ width: w, height: h })
        d4[0] = w /2;
        d4[1] = 0;

        d1[0] = w / 3 * 1;
        d1[1] = h;
        d2[0] = w / 3 * 1;
        d2[1] = h * 0.382;
        d3[0] = 0;
        d3[1] = h * 0.382;
        d5[0] = w;
        d5[1] = h * 0.382;
        d6[0] = w / 3 * 2;
        d6[1] = h * 0.382;
        d7[0] = w / 3 * 2;
        d7[1] = h;

        ctx.clearRect(0, 0, w, h);
        ctx.translate( w / 2, h / 2);
        ctx.rotate(rotate * Math.PI/180);
        ctx.translate(-w / 2, -h / 2);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(...d1);
        ctx.lineTo(...d2);
        ctx.lineTo(...d3);
        ctx.lineTo(...d4);
        ctx.lineTo(...d5);
        ctx.lineTo(...d6);
        ctx.lineTo(...d7);
        ctx.lineTo(...d1);
        ctx.strokeStyle = color;
        ctx.stroke();
        ctx.closePath();
    },

    drawArrow: function($canvas, subtype, w, h) {
        if (!$canvas || !subtype) return;
        var that = this;
        switch(subtype) {
            case "up-arrow":
                that.drawUpArrow($canvas, w, h, null, 0);
                break;
            case 'right-arrow':
                that.drawRightArrow($canvas, w, h, null, 0);
                break;
            case "bottom-arrow":
                that.drawUpArrow($canvas, w, h, null, 180);
                break;
            case "left-arrow":
                that.drawRightArrow($canvas, w, h, null, 180);
                break;
        }
    },

    setDrawControl: function(type, subtype, w, h, callback) {
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