function ChangeCategoryModal($modal) {
    BaseModal.call(this, $modal);
    this.$body = this.$modal.find(".modal-body");
    this.$select = this.$modal.find('[data-name="selectName"]');
    this.$option = this.$modal.find('[data-name="setOption"]');
    this.$add = this.$modal.find('.add');
    this.cates = null;
    this.NAME_SPACE = '.ChangeCategoryModal'

    this.renderOptions = function(data) {
        if (!Array.isArray(data)) return this.$option.empty();

        var html = "",
            type = null;    // 不是对象，就是字符串
        data.forEach(item => {
            !type && (type = DataType.isObject(item));
            html += this.getOptionItem(type, item);
        })
        this.$option.empty().append(html);
        this.getOptionItem(type, null, true);
        this.$select.data('type', type);
    };

    this.getOptionItem = function(type, data, flag = false) {
        var html = type
                        ? `
                        <div class="col-lg-12 option-item">
                            <div class="form-group">
                                <label class="col-lg-2 control-label">显示值：</label>
                                <div class="col-lg-4">
                                    <input type="text" class="form-control" data-name="name" value="${data ? data.name : ''}">
                                </div>
                                <label class="col-lg-2 control-label">实际值：</label>
                                <div class="col-lg-4">
                                    <input type="text" class="form-control" data-name="value" value="${data ? data.value : ''}">
                                </div>
                                <icon class="delete">X</icon>
                            </div>
                        </div>
                        `
                        : `
                            <div class="col-lg-6 option-item">
                                <div class="form-group">
                                    <label class="col-lg-4 control-label">显示值：</label>
                                    <div class="col-lg-8">
                                        <input type="text" class="form-control" data-name="" value="${data ? data : ''}">
                                    </div>
                                    <icon class="delete">X</icon>
                                </div>
                            </div>
                        `
        flag && this.$option.append(html);
        return html;
    }
}

ChangeCategoryModal.prototype = {
    initData: async function() {
        this.clear();
        await this.setData()
        this.bindEvents();
    },

    clear: function() {
        this.$modal.off(this.NAME_SPACE);
        this.cates = null;
        this.$add.hide();
        this.$option.empty();
    },

    setData: async function() {
        var cates = await new FileService().readFile("./profiles/category.json");
        if (!DataType.isObject(cates)) return alert('获取保存项文件失败！');

        var that = this,
            options = [];
        that.cates = cates;
        options = Object.keys(that.cates).map(i => { return { name: i, value: i }  })
        Common.fillSelect(this.$select, { name: "请选择修改项", value: "" }, options);
    },

    saveData: function() {
            var that = this,
                hasErr = false;
            Object.keys(that.cates).map(cate => {
                var type = DataType.isObject(that.cates[cate]);
                that.cates[cate] = that.cates[cate].filter(el => type ? (el.name != "" && el.value != "") : el != "" );
                var data = that.cates[cate];
                if (Array.isArray(data)) {
                    data.forEach(el => {
                        if (el.name == "" || el.value == "") {
                            alert(cate + ' 存在未填写完整选项');
                            hasErr = true;
                            return false;
                        }
                    })
                }
            })
            if (hasErr) {
                return -1
            }
            new FileService().writeFile("./profiles/category.json", JSON.stringify(that.cates), function() {
                Common.fillCategorySelect(that.cates);
            })
    },

    bindEvents: function() {
        var that = this;

        that.$modal.on('change' + that.NAME_SPACE, '[data-name="selectName"]', function(event) {
            var val = $(this).val();
            val ? that.$add.show() : that.$add.hide();
            that.renderOptions(that.cates[val])
        });

        that.$modal.on('click' + that.NAME_SPACE, '.delete', function(event) {
            var $parent = $(this).parent().parent(".option-item"),
                idx = $parent.index(),
                cate = that.$select.val();
            if (that.cates[cate] && that.cates[cate][idx]) {
                that.cates[cate].splice(idx, 1)
                $parent.remove();
            };
        });

        that.$modal.on('click' + that.NAME_SPACE, '.add', function(event) {
            that.getOptionItem(that.$select.data('type'), null, true);
        });

        that.$modal.on('input' + that.NAME_SPACE, ".option-item :input", function() {
            var val = $(this).val(),
                option_name = $(this).data('name'),
                $parent = $(this).parents(".option-item"),
                idx = $parent.index(),
                cate = that.$select.val(),
                type = that.$select.data('type');
            if (!that.cates[cate][idx]) { that.cates[cate][idx] = type ? { name: "", value: "" } : val };
            option_name && (that.cates[cate][idx][option_name] = val);
        })
        that.$modal.on("click"+that.NAME_SPACE,".cancel",function(){
            that.$modal.modal("hide");//模态框隐藏
        })
    },

    execute: function() {
        this.basicEvents(true, this.initData, this.saveData)
    }
}