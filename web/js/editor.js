$(function () {
    init();
    inputFile();
    apply();
});

function init() {
    textboxio.replace("#main", {
        paste: {
            style: "retain",
            enableFlashImport: true
        }
    });
}

function inputFile() {
    $("#inputFile").click(function () {
        jdi.importExcel().then(o => {
            var editor = textboxio.getActiveEditor();
            editor.content.set(o);
        }).catch(err => alert(err))
    })
}

function apply() {
    $("#apply").click(function () {
        var editor = textboxio.getActiveEditor(),
            content = editor.content.get().replace(/\s*<br\s*\/>/g, '<br />'),
            $temp = $('<div><div>' + content + '</div></div>'),
            style = '',
            script = '';
        if (content.indexOf('<style>') >= 0) {
            style = content.substring(content.indexOf('<style>'), content.indexOf('<\/style>') + 8);
            $temp = $(".ephox-hare-content-iframe").contents().find(".ephox-candy-mountain");
            // 目前sheet_contain不包含style
            // if ($temp.find(".sheet_contain").length > 0)
            // 	$temp = $temp.find(".sheet_contain");
        }
        if (content.indexOf('<script') >= 0)
            script = content.substring(content.indexOf('<script'), content.indexOf('<\/script>') + 9);
        $temp = setWidth($temp);
        _transform($temp);
        // return;
        content = (style || '') + $temp.html() + (script || '');
        if (content) {
            try {
                // window.opener.back ? window.opener.back(content) : window.opener.eval("back(`" + content + "`)");
                window.opener["back"](content);
                window.close();
            } catch (e) {
                alert(e);
            }
        }
    });
}

function setWidth($temp) {
    $temp.find(".item_contain").each(function (index, element) {
        if (!$(element).text())
            return true;
        // $(element).html($(element).html().replace(/<span class="space">&nbsp;<\/span>/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">"));
        var content = $(element).html().replace(/<span class="space">&nbsp;<\/span>/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">"),
            font = $(element).css("font");
        var result = replaceFormat(content, font);
        if (result.status == 1) {
            var splits = result.html.split(">");
            for (var i = 0; i < splits.length; i++) {
                var splitss = splits[i].split("<");
                splitss[0] = splitss[0].replace(/\s/g, '<span class="space">&nbsp;</span></span>');
                splits[i] = splitss.join("<");
            }
            var html = splits.join(">");
            $(element).html(html);
        }
    })
    return $temp;
}

function _transform($body) {
    //设置表格样式
    $body.find("table").each(function () {
        $(this).css({
            "border-collapse": "collapse",
            "table-layout": "fixed"
        });
    });
    //转换元素类型,p,div,li
    $body.find("td,p,div,li").each(function () {
        var $this = $(this),
            bgColor = $this.css("background-color").toLowerCase().trim(),
            transHtml = "",
            styles = "margin:0;padding:0;width:100%;height:100%;box-sizing:border-box;vertical-align: middle;";
        if (bgColor.match(/rgb\(255,\s*0,\s*0\)/) || bgColor.match("red")) { //红
            transHtml = '<input type="text" style="' + styles + 'border:none;" />';
        } else if (bgColor.match(/rgb\(\s*0\,\s*0\,\s*0\)/) || bgColor.match("black")) { //黑
            styles += ";clip:rect(1px " + ($this.width() - 2) + "px " + ($this.height() - 2) + "px 1px)";
            transHtml = '<input type="checkbox" value="' + ($this.text() || '') + '" style="' + styles + '" />';
        } else if (bgColor.match(/rgb\(255\,\s*255\,\s*0\)/) || bgColor.match("yellow")) { //黄
            transHtml = '<input type="button" value="' + $this.text() + '" style="' + styles + '" />';
        } else if (bgColor.match(/rgb\(112\,\s*48\,\s*160\)/)) {
            var textareaStyles = styles += ";resize:none";
            transHtml = '<textarea data-type="textarea" style="' + textareaStyles + '">' + $this.text() + '</textarea>';
        }
        if (transHtml) {
            $this.css({
                "padding": 0,
                "width": $this.width(),
                "height": $this.height(),
                "background-color": "transparent",
                "overflow": "hidden"
            });
            $this.html(transHtml);
        }
    });
}

function replaceFormat(content, font) {
    var styles = "margin:0;padding:0;box-sizing:border-box;vertical-align: top;line-height:normal;";
    // <%1%>,<%1,  %>,<%1,  ,***%>,<%1,,***%>四种情况
    var pat = /<%(\d|\d[,，]\s+|\d[,，]\s+[,，]([^%>]+)?|\d[,，]{2}([^%>]+)?)%>/g;
    // var pat = new RegExp("<%\\d[,，]?\\s*%>","g");
    var matchs = content.match(pat);
    if (!matchs || matchs.length <= 0)
        return { status: 0, html: content };
    matchs.forEach(function (element, index) {
        var ruleStr = element.replace("<%", "").replace("%>", "").replace("，", ","),
            ruleStrSplits = ruleStr.split(","),
            elementHtml = "";
        var rule = {
            type: parseInt(ruleStrSplits[0]),
            space: ruleStrSplits.length > 1 ? ruleStrSplits[1] : '',
            value: ruleStrSplits.length > 2 ? ruleStrSplits[2] : ''
        }
        var width = getWidth(rule.space, font);
        switch (rule.type) {
            case 0:
                var elementStyle = styles + 'width:' + width + 'px;font:' + font + ';';
                elementHtml = '<input type="text" style="' + elementStyle + '" />';
                break;
            case 1:
                var elementStyle = styles + 'width:' + width + 'px;font:' + font + ';';
                elementHtml = '<input type="button" value="' + (rule.value || 'button') + '" style="' + elementStyle + '" />';
                break;
            case 2:
                elementHtml = '<input type="checkbox" value="' + (rule.value || '') + '" style="' + styles + '" />';
                break;
            default:
                elementHtml = element;
                break;
        }
        content = content.replace(element, elementHtml);
    })
    return { status: 1, html: content };
}

function getWidth(text, font) {
    var obj = $("<span>").hide().appendTo(document.body);
    $(obj).html(text.replace(/\s/g, '&nbsp;')).css('font', font);
    var width = obj.width();
    obj.remove();
    return width;
}