(function ($, window, document, undefined) {
    var ua = window.navigator.userAgent.toLowerCase(),
        browser = {
            msie: (/msie ([\d.]+)/).test(ua),
            firefox: (/firefox\/([\d.]+)/).test(ua),
            chrome: (/chrome\/([\d.]+)/).test(ua)
        };

    //获取Range对象
    function getRange(win) {
        if (browser.msie) {
            return win.document.selection.createRange();
        } else {
            return win.getSelection().getRangeAt(0);
        }
    }

    //获取Range对象的内容
    function getRangeText(range) {
        if (browser.msie) {
            return range.htmlText;
        } else {
            var temp = document.createElement("DIV");
            temp.appendChild(range.cloneContents());
            return temp.innerHTML;
        }
    }

    //修改Range对象的内容
    function updateRangeText(rangeText, name, value) {
        var temp = document.createElement("DIV");
        temp.innerHTML = rangeText;
        setNodeStyle(temp, name, value);
        return temp.innerHTML;
    }

    //设置节点样式
    function setNodeStyle(dom, name, value) {
        var nodes = dom.childNodes;
        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            //非空纯文本节点
            if (node.nodeType === 3 && node.innerHTML === undefined && node.nodeValue !== "" && node.parentNode.nodeName !== "SPAN") {
                var span = document.createElement("SPAN");
                span.style[name] = value;
                span.innerHTML = node.nodeValue;
                var parent = node.parentNode;
                parent.replaceChild(span, node);
            } else if (node.nodeType === 1 && node.nodeName !== "SCRIPT" && node.hasChildNodes()) {
                if (node.nodeName === "SPAN") {
                    node.style[name] = value;
                } else {
                    setNodeStyle(node, name, value);
                }
            }
        }
        return dom;
    }

    //替换Range对象的内容
    function replaceRangeText(range, html) {
        if (browser.msie) {
            range.select();
            range.pasteHTML(html);
        } else {
            var temp = document.createElement("DIV");
            temp.innerHTML = html;
            var nodes = [];
            for (var i = 0; i < temp.childNodes.length; i++) {
                nodes.push(temp.childNodes[i]);
            }
            range.deleteContents();
            for (var j in nodes) {
                temp.removeChild(nodes[j]);
                range.insertNode(nodes[j]);
            }
        }
    }


    var EVENT_NAMESPACE = ".editor_event",
        CACHE_KEY = "editor_cache";

    var Editor = function (elements, options) {
        this.$elements = elements;
        this.options = options;
    };

    Editor.prototype = {
        init: function () {
            var that = this;
            return that.$elements.each(function () {
                var cache = that.cacheData(this);
                if (!cache.disabled) {
                    that.renderDOM(this);
                    that.setToolbar(this);
                    that.setIframe(this);
                    that.bindEvents(this);
                }
            });
        },
        cacheData: function (element) {
            var that = this,
                cache = $.data(element, CACHE_KEY);
            if (!cache) {
                cache = $.extend({}, $.fn.editor.defaults, that.options || {});
            } else {
                cache = $.extend(cache, that.options || {});
            }
            $(element).off(EVENT_NAMESPACE);
            $.data(element, CACHE_KEY, cache);
            return cache;
        },
        renderDOM: function (element) {
            var html = '<ul class="editor-toolbar"></ul><iframe class="editor-iframe"></iframe>';
            $(element).addClass("editor").empty().append(html);
        },
        setToolbar: function (element) {
            var that = this,
                html = "",
                cache = $.data(element, CACHE_KEY),
                toolbar = cache.toolbar;
            toolbar.forEach(function (item) {
                var str = null,
                    controlType = item.controlType;
                if (controlType === "select") {
                    var $select = $('<select class="editor-toolbar-select" data-command="' + item.command + '"></select>');
                    that.fillSelect($select, item.items, null, null);
                    str = '<li>' +
                        '<label class="editor-toolbar-label">' + item.label + '</label>' +
                        $select.get(0).outerHTML +
                        '</li>';
                } else if (controlType === "icon") {
                    str = '<li><i class="editor-toolbar-icon" data-command="' + item.command + '" unselectable="on"></i></li>';
                }
                html += str;
            });
            $(element).find(".editor-toolbar").append(html);
        },
        setIframe: function (element) {
            var $iframe = $(element).find(".editor-iframe");
            $iframe.height($(window).outerHeight() - 27);
            var iframe = $iframe.first().get(0),
                doc = iframe.contentWindow.document;
            if (browser.firefox) {
                iframe.onload = function () {
                    doc.designMode = "on";
                }
            } else {
                doc.designMode = "on";
            }
            doc.open();
            doc.write('<!DOCTYPE html><html><head><title>子模块设计</title></head><body></body></html>');
            doc.close();
        },
        bindEvents: function (element) {
            $(element).on("click" + EVENT_NAMESPACE, ".editor-toolbar li i", {element: element}, function (event) {
                var element = event.data.element,
                    iframe = $(element).find(".editor-iframe").first().get(0);
                command = $(this).attr("data-command");
                if (command === "Img") {
                    var src = prompt("请输入图片地址：", "");
                    if (src) {
                        var range = getRange(iframe.contentWindow),
                            rangeText = getRangeText(range);
                        // var html = rangeText.replace('<img src="' + src + '">');
                        var html = '<img src="' + src + '">';
                        replaceRangeText(range, html);
                    }
                } else {
                    var doc = iframe.contentWindow.document;
                    doc.execCommand(command, false, null);
                }
            });

            $(element).on("change" + EVENT_NAMESPACE, ".editor-toolbar li select", {element: element}, function (event) {
                var element = event.data.element,
                    doc = $(element).find(".editor-iframe").first().get(0).contentWindow.document,
                    value = $(this).val(),
                    command = $(this).attr("data-command");
                if (command === "LineHeight") {
                    $(doc.body).css("line-height", value);
                } else {
                    doc.execCommand(command, false, value);
                }
            });
        },
        fillSelect: function ($select, data) {
            if (!$select || $select.length <= 0) {
                return;
            }
            if (!Array.isArray(data)) {
                return;
            }
            var html = "";
            data.forEach(function (item) {
                html += '<option value="' + item.value + '">' + item.name + '</option>';
            });
            $select.empty().append(html);
        }
    };

    $.fn.extend({
        editor: function (options) {
            if (typeof options === "string") {
                var args = Array.prototype.slice.call(arguments, 1);
                return $.fn.editor.methods[options](this, args);
            }
            return new Editor(this, options).init();
        }
    });

    $.fn.editor.defaults = {
        disabled: false,
        toolbar: [
            {command: "Img", controlType: "icon"},
            {command: "Bold", controlType: "icon"},
            {command: "Underline", controlType: "icon"},
            {command: "Italic", controlType: "icon"},
            {
                command: "FontName", controlType: "select", label: "字体", items: [
                {name: "宋体", value: "宋体"},
                {name: "微软雅黑", value: "微软雅黑"},
                {name: "Times New Roman", value: "Times New Roman"},
                {name: "Courier New", value: "Courier New"},
                {name: "Verdana", value: "Verdana"}
            ]
            },
            {
                command: "FontSize", controlType: "select", label: "尺寸", items: [
                {name: 1, value: 1},
                {name: 2, value: 2},
                {name: 3, value: 3},
                {name: 4, value: 4},
                {name: 5, value: 5},
                {name: 6, value: 6},
                {name: 7, value: 7}
            ]
            },
            {
                command: "LineHeight", controlType: "select", label: "行距", items: [
                {name: "1.0", value: "1.0"},
                {name: "1.2", value: "1.2"},
                {name: "1.5", value: "1.5"},
                {name: "1.8", value: "1.8"},
                {name: "2.0", value: "2.0"},
                {name: "2.5", value: "2.5"}
            ]
            }
        ],
        onStart: function () {
        },
        onStop: function () {
        }
    };

    $.fn.editor.methods = {
        options: function (elements) {
            return $.data(elements[0], CACHE_KEY);
        },
        enable: function (elements) {
            return elements.each(function () {
                $(this).editor({disabled: false});
            });
        },
        disable: function (elements) {
            return elements.each(function () {
                $(this).editor({disabled: true});
            });
        },
        getBody: function (elements) {
            var $iframe = $(elements[0]).find(".editor-iframe"),
                iframe = $iframe.first().get(0);
            return $(iframe.contentWindow.document.body);
        }
    };

    $(window).resize(function () {
        $(".editor .editor-iframe:visible").height($(window).height() - 27);
    });

})(jQuery, window, document);