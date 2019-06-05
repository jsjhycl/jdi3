function InsertFnModal($modal) {
    if (!$modal || $modal.length <= 0) throw "无效的模态框！";

    this.$modal = $modal;
    this.$select = $modal.find("select.insert-fns-select");
    this.$insertFnsBody = $modal.find(".insert-fns");
    this.$fnDesc = $modal.find('.insert-fn-desc');
    this.$save = $modal.find('.save');
    this.NAMESPACE = '.InsertFnModal';
    
    // 设置函数选项
    this._setFnOpt = function(fns) {
        if (!fns || fns.length <= 0) return;
        let opts = "";
        $.each(fns, function(index, item) {
            opts += '<div class="insert-fn-item ' + (index === 0 ? 'selected"' : '"') + (item.desc ? '  data-desc="' + item.desc + '"' : ''  ) + ' data-args='+JSON.stringify(item.args)+' data-index="'+ index +'">' + item.name + '</div>'
        })
        this._setFnDesc(fns[0].name, fns[0].args, fns[0].desc);
        this.$insertFnsBody.empty().append(opts);
    };

    // 设置函数描述
    this._setFnDesc = function(fn, args, desc) {
        let p1 = '<p>' + fn + '(' + args.join(',') + ')</p>',
            p2 = desc ? ('<p>' + desc + '</p>') : '';
        this.$fnDesc.html(p1 + p2);
    };

    // 获取位置
    this._getPosition = function() {
        return { top: this.$modal.css('top'), left: this.$modal.css('left') };
    };

    this._render = function(result, index) {
        let that = this,
            first = result[0].desc,
            options = "";
        $.each(result, function(index, item) {
            options += '<option data-fns=' + JSON.stringify(item.fns) +' value="' + item.desc + '" >'+ item.desc +'</option>'
            index === 0 ? that._setFnOpt(item.fns): '';
        })
        that.$select.empty().append(options).val(first);
        that.$modal.find('input[type="radio"]').eq(index).prop('checked', true)
    }
}

InsertFnModal.prototype = {
    initData: function(data) {
        let that = this,
            result = new CommonService().getFileSync('/profile/insert_function.json');
        if (!result || result.length <= 0) {
            alert('暂无插入函数配置!');
            that.$modal.hide();
            return
        }
        that._render(result, 0);
    },
    
    bindEvents: function() {
        var that = this;
        $(document).off(that.NAMESPACE);
        that.$modal.off(that.NAMESPACE);
        that.$select.off(that.NAMESPACE);

        // 关闭模态框
        that.$modal.on('click' + that.NAMESPACE, '.clear, .close', function(event) {
            that.$modal.hide();
            WorkspaceUtil.resetView(true);
        })

        // 选择框change事件
        that.$select.on('change' + that.NAMESPACE, function(event) {
            let $curOpt = $(event.currentTarget).find('option:selected'),
                fns = $curOpt.data('fns');
            that._setFnOpt(fns)
            $(this).get(0).blur();
        })

        // 函数选择点击事件
        that.$modal.on('click' + that.NAMESPACE, '.insert-fn-item', function(event) {
            that.$modal.find('.insert-fn-item').removeClass('selected');
            let $this = $(this);
            $this.addClass('selected');
            that._setFnDesc($this.html(), $this.data('args'), $this.data('desc'));
        })

        // 上下选择键，回车键事件
        // keyCode 上: 38; 下: 40; 回车: 13
        $(document).on('keydown' + that.NAMESPACE, function(event) {
            let isShow = that.$modal.css('display') === 'block',
                keyCode = event.keyCode || 0;
            if (isShow && ( keyCode == 38 || keyCode == 40 || keyCode == 13)) {
                event.preventDefault();
                let $items = that.$insertFnsBody.find('.insert-fn-item'),
                    length = $items.length - 1,
                    curIndex = that.$insertFnsBody.find('.selected').data('index');
                if (keyCode == 38 && curIndex > 0) {
                    $items.removeClass('selected');
                    that.$insertFnsBody.find($('[data-index=' + (curIndex - 1) + ']')).addClass('selected');
                    $this = that.$insertFnsBody.find('.selected')
                    that._setFnDesc($this.html(), $this.data('args'), $this.data('desc'));
                } else if (keyCode == 40 && curIndex < length){
                    $items.removeClass('selected');
                    that.$insertFnsBody.find($('[data-index=' + (curIndex + 1) + ']')).addClass('selected');
                    $this = that.$insertFnsBody.find('.selected')
                    that._setFnDesc($this.html(), $this.data('args'), $this.data('desc'));
                } else if (keyCode == 13) {
                    that.$modal.find('.insert-fn-item.selected').trigger('dblclick');
                }
            }
        })

        // 函数双击事件
        that.$modal.on('dblclick' + that.NAMESPACE, '.insert-fn-item', function(event) {
            event.stopPropagation();
            let $ev = $(event.currentTarget),
                fnName = $ev.text(),
                args = $ev.data('args');
            that.$modal.hide();
            new InsertFnArgsModal(that._getPosition()).init(fnName, args);
        })

        // 模态框确定按钮事件
        that.$modal.on('click' + that.NAMESPACE, '.save', function(event) {
            event.stopPropagation();
            let $selectedOpt = that.$insertFnsBody.find('.selected'),
                fnName = $selectedOpt.text(),
                args = $selectedOpt.data('args');
            if (!fnName || !args) return;
            that.$modal.hide();

            new InsertFnArgsModal(that._getPosition()).init(fnName, args);
        })

        // 自定义插入函数
        that.$modal.on('click' + that.NAMESPACE, '.custom-insertFn', function(event) {
            that.$modal.hide();
            new InsertFnArgsModal().init('customInsertFn');
        })

        // 本地/远程 函数切换
        that.$modal.on('change' + that.NAMESPACE, '[name="functionType"]', function(event) {
            let urlObj = {
                'local': {
                    url: '/profile/insert_function.json',
                    index: 0
                },
                'remote': {
                    url: '/profile/remote2_function.json',
                    index: 1
                }
            },
                type = $(this).data('type');
                result = new CommonService().getFileSync(urlObj[type].url);
            if (!result || result.length <= 0) { return alert('暂无该函数配置！') };
            that._render(result, urlObj[type].index)
        })
    },

     //设置可拖拽
    setDraggable: function() {
        this.$modal.draggable()
    },

    execute: function () {
        this.setDraggable();
        this.bindEvents();
    },

    // 打开模态框
    open: function() {
        let that = this,
            isShow = !(that.$modal.css('display') == 'none');
        if (isShow) {
            return;
        } else {
            let isShow2 = !(that.$modal.css('display') == 'none');
            if (isShow2) {
                that.$modal.hide();
            } else {
                that.initData();
                that.$modal.show()
            }
        }
    },

    // 关闭模态框
    close: function() {
        this.$modal.find('.close').trigger('click');
    }
}