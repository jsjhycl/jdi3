function InsertFnArgsModal(position) {
    var that = this;
    this.$modal = $("#insertFunctionArgsModal");
    position ? this.$modal.css(position) : '';
    this.$title = this.$modal.find(".modal-title");
    this.$argsBody = this.$modal.find(".function-args");
    this.$close = this.$modal.find(".close");
    this.manyArgs = false;// 默认不含 ... （即多个相同参数）
    this.NAMESPACE = '.insertFnArgs';
    
    this.addMoreArgs = function(event) {
        let str = '',
            $el = event ? $(event.currentTarget) : that.$argsBody.find('input').last(),
            val = $el.val().trim();
            text = $el.parent().prev().text();
        if (val !== '') {
            let { $1, $2 } = Common.cutString(text);
            str += that._setArg(($1 + ( parseInt($2) + 1)));
        }
        that.$argsBody.append(str)
    };

    // 设置参数选项
    this._setArg = function(name, value) {
        value = value ? ('value="' + value + '"') : '';
        let str = '<div class="form-group">' +
                  '<label class="col-sm-4 control-label">'+
                  name +
                  '：</label>' +
                  '<div class="col-sm-8">' + 
                  '<input type="text" class="form-control" ' +
                  value +
                  '">' +
                  '</div>' +
                  '</div>'
        return str;
    };

    // 还原默认样式
    this._resetStyle = function() {
        this.$modal.height('auto')
    }
}

InsertFnArgsModal.prototype = {
    init: function(fnName, args, $source) {
        var that = this,
            html = "",
            title = '',
            iscustomInsertFn = fnName == 'customInsertFn';   // 判断是否是自定义函数
        
        that.setDraggable();
        that.bindEvents();
        that._resetStyle();

        if (fnName && args && args.length > 0) {
            $.each(args, function(index, item) {
                if (item === '...') {
                    that.manyArgs = true;
                    return; 
                }
                html += that._setArg(item);
            });
            title = '<span data-moreargs="' + that.manyArgs.toString() + '" data-args="' + args + '" class="insert-fn-name">' + fnName + '</span>函数参数'
            
            if (that.manyArgs) {
                $(document).on('input.args', '#insertFunctionArgsModal .function-args .form-group:last-child input', that.addMoreArgs)
            } else {
                $(document).off('input.args')
            }

        } else if (iscustomInsertFn) {
            title = '<span class="custom-insertFn-config">自定义插入函数配置</span>'
            html += '<textarea class="form-control custom-insertFn" placehold="请输入自定义插入函数配置"></textarea>';
        } else {
            that.$close.trigger('click');
            return alert('当前函数暂无参数配置！');
        }

        that.$title.html(title);
        that.$argsBody.empty().append(html);

        // 存在表达式
        let exp = $("#property_expression").val().trim(),
            selectedArgs = '';
        if (exp != '') {
            let str = '';
            if (!iscustomInsertFn) {
                let reg = /[a-zA-Z]+\([\w\,\{\}]*\)/g,
                    result = exp.match(reg);
                if (result && result.length > 0) {
                    let fnName = that.$title.find('.insert-fn-name').text(),
                        args = that.$title.find('.insert-fn-name').data('args');
                    args = args && args.split(',');
                    $.each(result, function(index, item) {
                        let reg2 = /([a-zA-Z]+)\(([\w\{\}\,]+)\)/g;
                        reg2.test(item);
                        let ofnName = RegExp.$1,
                            oArgs = RegExp.$2;
                        if (fnName == ofnName) {
                            selectedArgs = oArgs;
                            let arr = oArgs.split(','),
                                isManyArgs = args.findIndex(function(item) { return item == '...' });
                            if (isManyArgs > 0) { arr.push('') }
                                $.each(arr, function(idx, iitem) {
                                    let  arg = args[idx];
                                    if (!arg || arg == '...' || (iitem == '' && idx == arr.length - 1)) { 
                                        arg = 'value' + (idx + 1);
                                    }
                                    str += that._setArg(arg, iitem);
                                });
                            that.$argsBody.empty().append(str);
                            return false;
                        }
                    });
                }
            } else {
                let reg = /\{\w+\}*/g,
                    result = exp.match(reg);
                result && result.length >0 ? selectedArgs = result.join(',') : '';
                str = '<textarea class="form-control custom-insertFn" placehold="请输入自定义插入函数配置">' + exp + '</textarea>';
                that.$argsBody.empty().append(str);
            }
        }
        WorkspaceUtil.insertFns($("#openInsertFnModal"), false, selectedArgs);
        that.$modal.show();
        that.$argsBody.find('input, textarea').first().addClass('selected').get(0).focus();

    },
    
    bindEvents: function() {
        var that = this;
        that.$modal.off(that.NAMESPACE);
        $(document).off('input.args');

        // 关闭模态框
        that.$modal.on('click' + that.NAMESPACE, '.close, .clear', function(event) {
            WorkspaceUtil.resetView(true);
            that.$modal.hide();
        })

        // 确定按钮点击事件
        that.$modal.on('click' + that.NAMESPACE, '.save', function(event) {
            event.stopPropagation();
            let argsArr = [],
                $argsInputs = that.$argsBody.find('input'),
                last = $argsInputs.length > 0 ? $argsInputs.length - 1 : null,
                $textarea = that.$argsBody.find('textarea');
                str = "";
            if (!Number.isNaN(parseInt(last))) {
                $argsInputs.each(function(index, item) {
                    let val = $(this).val().trim();
                    if (index == last && val == '') return;
                    else argsArr.push(val);
                });
                fnName = that.$title.find('.insert-fn-name').text();
                str = fnName + '(' + argsArr.join(',') + ')'; // 将函数名和值都保存到表达式中
            } else {
                str = $textarea && $textarea.val();
            }
            let $originSelected = $("#workspace .focus"),
                id = $originSelected.attr('id');
            if (id) {
                new Property().setValue(id, 'expression', str);
                $originSelected.trigger('click')
            }
            WorkspaceUtil.resetView();
            that.$modal.find('.close').trigger('click');
        })

        // 给输入框绑定focusin事件
        that.$modal.on('focusin' + that.NAMESPACE, '.function-args input', function(event) {
            that.$argsBody.find("input").removeClass('selected');
            $(this).addClass('selected');
        })
    },
    
    // 设置可拖拽
    setDraggable: function() {
        var that = this;
        that.$modal.draggable();
    },

    close: function() {
        this.$modal.find('.close').trigger('click');
    }

}