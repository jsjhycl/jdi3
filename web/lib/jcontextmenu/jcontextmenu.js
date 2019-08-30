;(function ($, window, document, undefined) {
    var EVENT_NAMESPACE = ".jcontextmenu_event",
        CACHE_KEY = "jcontextmenu_cache";

    var ContextMenu = function (elements, options) {
        this.$elements = elements;
        this.options = options;
    };

    ContextMenu.prototype.constructor = ContextMenu;

    ContextMenu.prototype = {
        /**
         * 初始化
         */
        init: function () {
            var that = this;
            return that.$elements.each(function () {
                var cache = that.cacheData(this);
                if (!cache.disabled) {
                    that.bindEvents(this);
                }
            });
        },
        /**
         * 缓存数据
         * @param element
         */
        cacheData: function (element) {
            var that = this,
                cache = $.data(element, CACHE_KEY);
            if (!cache) {
                cache = $.extend({}, $.fn.jcontextmenu.defaults, that.options || {});
            } else {
                cache = $.extend(cache, that.options || {});
            }
            $(element).off(EVENT_NAMESPACE);
            $.data(element, CACHE_KEY, cache);
            return cache;
        },
        /**
         * 绑定事件
         * @param element
         */
        bindEvents: function (element) {
            var that = this;
            $(element).on("contextmenu" + EVENT_NAMESPACE, {target: element}, function (event) {
                that.renderDOM(event);
                return false;
            });
        },
        /**
         * 渲染DOM
         * @param event
         */
        renderDOM: function (event) {
            var that = this,
                $jcontextmenu = $(".jcontextmenu");
            if ($jcontextmenu.length <= 0) {
                $jcontextmenu = $('<div class="jcontextmenu"><div class="menu"></div></div>');
                $jcontextmenu.appendTo(document.body);
            }
            var $menu = $jcontextmenu.children(".menu");
            that.loadMenu($menu, event);
            that.setStyle($jcontextmenu, event);
        },
        /**
         * 加载菜单列表
         * @param $menu
         * @param event
         */
        loadMenu: function ($menu, event) {
            var that = this,
                cache = $.data(event.data.target, CACHE_KEY);
            $menu.empty();
            that.recurseLoadMenu($menu, cache.menus, event);
        },
        /**
         * 递归加载菜单列表
         * @param $menu
         * @param menus
         * @param event
         */
        recurseLoadMenu: function ($menu, menus, event) {
            var that = this;
            for (var i = 0; i < menus.length; i++) {
                var item = menus[i],
                    $menuitem = null;
                if (item.type === "menuitem") {
                    var hasSub = (item.submenus && item.submenus.length > 0) || item.dynamic,
                        $arrow = hasSub ? '<span class="arrow">></span>' : "",
                        $submenu = $('<div class="submenu"></div>');
                    $menuitem = $('<div class="menuitem"><a id="' + (item.id || "") + '">' + item.text + $arrow + '</a></div>');
                    //$menuitem绑定事件
                    (function (menuitem, item) {
                        menuitem.on("mouseover" + EVENT_NAMESPACE + " mouseout" + EVENT_NAMESPACE, function (e) {
                            if (e.type === "mouseover") {
                                $(this).children(".submenu").show();
                            } else if (e.type === "mouseout") {
                                $(this).children(".submenu").hide();
                            }
                        });
                        menuitem.on("click" + EVENT_NAMESPACE, function (e) {
                            if (item.handler) {
                                item.handler.call(event.data.target, e);
                                $(".jcontextmenu:visible").hide();
                            }
                        });
                    })($menuitem, item);
                    //$submenu填充子菜单
                    if (item.submenus && item.submenus.length > 0) {
                        $menuitem.append($submenu);
                        that.recurseLoadMenu($submenu, item.submenus, event);
                    }
                    //$submenu填充动态数据
                    if (item.dynamic) {
                        $menuitem.append($submenu);
                        item.dynamic.call(event.data.target, $submenu);
                    }
                } else if (item.type === "separator") {
                    $menuitem = $('<div class="separator"></div>');
                }
                $menu.append($menuitem);
            }
        },
        /**
         * 设置样式
         * @param $jcontextmenu
         * @param event
         */
        setStyle: function ($jcontextmenu, event) {
            if (!$jcontextmenu || $jcontextmenu.length <= 0) return;
            submodulesOffset = {
                "left": event.offsetX,
                "top": event.offsetY
            }
            $jcontextmenu.css({
                "left": event.pageX,
                "top": event.pageY
            }).show();
        }
    };

    $.fn.extend({
        jcontextmenu: function (options) {
            if (typeof options === "string") {
                var args = Array.prototype.slice.call(arguments, 1);
                return $.fn.jcontextmenu.methods[options](this, args);
            }
            return new ContextMenu(this, options).init();
        }
    });

    $.fn.jcontextmenu.defaults = {
        disabled: false,
        menus: [
            {
                type: "menuitem",
                text: "菜单1",
                handler: function (event) {
                    alert("您点击了“菜单1”！");
                }
            },
            {type: "separator"},
            {
                type: "menuitem",
                text: "菜单2",
                submenus: [
                    {type: "menuitem", text: "子菜单21"},
                    {type: "menuitem", text: "子菜单22"}
                ]
            }
        ],
        onStart: function () {
        },
        onStop: function () {
        }
    };

    $.fn.jcontextmenu.methods = {
        options: function (elements) {
            return $.data(elements[0], CACHE_KEY);
        },
        enable: function (elements) {
            return elements.each(function () {
                $(this).jcontextmenu({disabled: false});
            });
        },
        disable: function (elements) {
            return elements.each(function () {
                $(this).jcontextmenu({disabled: true});
            });
        }
    };
})(jQuery, window, document);