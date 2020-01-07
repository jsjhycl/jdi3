//新建布局资源模态框
function CreateResource() {
    this.$createResource = $("#create_resource_modal")
    BaseModal.call(this, this.$createResource);
    this.$resoureRelId = this.$createResource.find('[name="model_resource_relId"]')
    this.data = []
    this.USER = "admin"
    this.dbCollection = "newProducts"
    this.$resoureName = this.$createResource.find('[name="model_resource_name"]')
    this._fillRelId = function () {
        var that = this,
            value = that.$createResource.find('[name="model_resource_subCategory"]:checked').val(),
            defaultOption = {
                name: "请选择关联表单",
                value: "",
                nameAndValue: "请选择关联表单"
            },
            options = that.data.filter(function (fitem) {
                return value === fitem.basicInfo.subCategory;
            }).map(function (mitem) {
                return {
                    name: `${mitem.name}`,
                    value: mitem.customId,
                    nameAndValue: `${mitem.name}(${mitem.customId})`
                }
            });
        options.unshift(defaultOption)
        var str = "";
        // console.log(value)
        options.forEach(function (item) {
            str += `<option value="${item.value}" data-name="${item.name}">${item.nameAndValue}</option>`
        })
        that.$resoureRelId.empty().append(str)
        // Common.fillSelect(that.$resoureRelId, defaultOption, options, null, false);

        that.$createResource.find("#model_subCategory").val(value)
    }
    this.queryModal = function (condition) {
        return new Service().queryCount(this.dbCollection, condition);
    }
    this.saveDb = function (params) {
        return new Service().insert(this.dbCollection, params);
    }
    this.clearData = function () {
        this.$resoureName.val("")
    }

    this.$resoureName = $('#model_resource_name')
    this.$firstCategory = $('#modal_firstCategory');
    this.$secondeCategory = $('#modal_secondCategory');
    this.$thridCategory = $('#modal_thridCategory');
    this.$fourthCategory = $('#modal_fourthCategory');
    this.$fifthCategory = $('#modal_fifthCategory');
    this.$sixthCategory = $('#modal_sixthCategory');
    this.$seventhCategory = $('#modal_seventhCategory');
    this.$eighthCategory = $('#modal_eighthCategory');
    this.$ninthCategory = $('#modal_ninthCategory');

    this.treeData = null;
}
CreateResource.prototype = {
    initData: async function () {
        var that = this;
        //查询表单中的布局
        // that.$createResource.find("#model_resource_name").val("")
        // that.$createResource.find("#model_spare1").val(0)
        // that.$createResource.find("#model_spare2").val(0)
        // that.$createResource.find("#model_area").val("B")
        // var dbCollection = "newResources";
        // new Service().query(dbCollection, null, null).then(res => {
        //     if (!Array.isArray(res)) return;
        //     that.data = res;
        //     that._fillRelId()
        // })
        that.clearData();
        var treeData = await new ArrayToTree().getTreeData();
        that.treeData = treeData;
        var firstData = new ArrayToTree().getFirstData(treeData),
            secondData = [],
            thridData = [],
            fourthData = [],
            fifthData = [],
            sixthData = [],
            sevenData = [],
            eighthData = [],
            ninthData = [];
        // secondData = new ArrayToTree().getSearchData([firstData[0].value], that.treeData),
        // thridData = new ArrayToTree().getSearchData([firstData[0].value, secondData[0].value], that.treeData),
        // fourthData = new ArrayToTree().getSearchData([firstData[0].value, secondData[0].value, thridData[0].value], that.treeData),
        // fifthData = new ArrayToTree().getSearchData([firstData[0].value, secondData[0].value, thridData[0].value, fourthData[0].value], that.treeData),
        // sixthData = new ArrayToTree().getSearchData([firstData[0].value, secondData[0].value, thridData[0].value, fourthData[0].value, fifthData[0].value], that.treeData),
        // sevenData = new ArrayToTree().getSearchData([firstData[0].value, secondData[0].value, thridData[0].value, fourthData[0].value, fifthData[0].value, sixthData[0].value], that.treeData),
        // eighthData = new ArrayToTree().getSearchData([firstData[0].value, secondData[0].value, thridData[0].value, fourthData[0].value, fifthData[0].value, sixthData[0].value, sevenData[0].value], that.treeData),
        // ninthData = new ArrayToTree().getSearchData([firstData[0].value, secondData[0].value, thridData[0].value, fourthData[0].value, fifthData[0].value, sixthData[0].value, sevenData[0].value, eighthData], that.treeData);

        Common.fillSelect(that.$firstCategory, {
            name: "请选择表属性",
            value: ""
        }, firstData, null, true)
        Common.fillSelect(that.$secondeCategory, {
            name: "请选择表序号",
            value: ""
        }, secondData, null, true)
        Common.fillSelect(that.$thridCategory, {
            name: "请选择布局属性",
            value: ""
        }, thridData, null, true)
        Common.fillSelect(that.$fourthCategory, {
            name: "请选择一级目录",
            value: ""
        }, fourthData, null, true)
        Common.fillSelect(that.$fifthCategory, {
            name: "请选择二级目录",
            value: ""
        }, fifthData, null, true)
        Common.fillSelect(that.$sixthCategory, {
            name: "请选择布局区域",
            value: ""
        }, sixthData, null, true)
        Common.fillSelect(that.$seventhCategory, {
            name: "请选择备用1",
            value: ""
        }, sevenData, null, true)
        Common.fillSelect(that.$eighthCategory, {
            name: "请选择备用",
            value: ""
        }, eighthData, null, true)
        Common.fillSelect(that.$ninthCategory, {
            name: "请选择布局等级",
            value: ""
        }, ninthData, null, true)

        // console.log("treeData:", treeData)
        // console.log("firstData :", firstData)
        // console.log("secondData:", secondData)
    },
    bindEvents: function () {
        var that = this;
        //切换资源分类
        // that.$createResource.on("click", '[name="model_resource_subCategory"]', function () {
        //     that._fillRelId();
        // })
        // //选择关联表单事件
        // that.$createResource.on("change", '[name="model_resource_relId"]', function () {
        //     var value = $(this).val();
        //     if (value) {
        //         var text = $(this).find("option:selected").attr("data-name");
        //         that.$resoureName.val(text);
        //     } else {
        //         that.$resoureName.val("");
        //     }
        // });
        that.$firstCategory.on("change", function () {
            var firstValue = $(this).val();
            secondData = new ArrayToTree().getSearchData([firstValue], that.treeData);
            Common.fillSelect(that.$secondeCategory, {
                name: "请选择表序号",
                value: ""
            }, secondData, null, true)

            that.$thridCategory.find('option').remove()
            that.$fourthCategory.find('option').remove()
            that.$fifthCategory.find('option').remove()
            that.$sixthCategory.find('option').remove()
            that.$seventhCategory.find('option').remove()
            that.$eighthCategory.find('option').remove()
            that.$ninthCategory.find('option').remove()
        })
        that.$secondeCategory.on("change", function () {
            var firstValue = that.$firstCategory.val(),
                secondValue = that.$secondeCategory.val(),
                thridData = new ArrayToTree().getSearchData([firstValue, secondValue], that.treeData);
            Common.fillSelect(that.$thridCategory, {
                name: "请选择布局属性",
                value: ""
            }, thridData, null, true)

            that.$fourthCategory.find('option').remove()
            that.$fifthCategory.find('option').remove()
            that.$sixthCategory.find('option').remove()
            that.$seventhCategory.find('option').remove()
            that.$eighthCategory.find('option').remove()
            that.$ninthCategory.find('option').remove()
        })

        that.$thridCategory.on("change", function () {
            var firstValue = that.$firstCategory.val(),
                secondValue = that.$secondeCategory.val(),
                thridValue = that.$thridCategory.val(),
                fourthData = new ArrayToTree().getSearchData([firstValue, secondValue, thridValue], that.treeData)

            Common.fillSelect(that.$fourthCategory, {
                name: "请选择一级目录",
                value: ""
            }, fourthData, null, true)
            that.$fifthCategory.find('option').remove()
            that.$sixthCategory.find('option').remove()
            that.$seventhCategory.find('option').remove()
            that.$eighthCategory.find('option').remove()
            that.$ninthCategory.find('option').remove()
        })

        that.$fourthCategory.on("change", function () {
            var firstValue = that.$firstCategory.val(),
                secondValue = that.$secondeCategory.val(),
                thridValue = that.$thridCategory.val(),
                fourtValue = that.$fourthCategory.val(),
                fifthData = new ArrayToTree().getSearchData([firstValue, secondValue, thridValue, fourtValue], that.treeData)
            Common.fillSelect(that.$fifthCategory, {
                name: "请选择二级目录",
                value: ""
            }, fifthData, null, true)

            that.$sixthCategory.find('option').remove()
            that.$seventhCategory.find('option').remove()
            that.$eighthCategory.find('option').remove()
            that.$ninthCategory.find('option').remove()
        })

        that.$fifthCategory.on('change', function () {
            var firstValue = that.$firstCategory.val(),
                secondValue = that.$secondeCategory.val(),
                thridValue = that.$thridCategory.val(),
                fourtValue = that.$fourthCategory.val(),
                fifthValue = that.$fifthCategory.val(),
                sixthData = new ArrayToTree().getSearchData([firstValue, secondValue, thridValue, fourtValue, fifthValue], that.treeData)
            Common.fillSelect(that.$sixthCategory, {
                name: "请选择布局区域",
                value: ""
            }, sixthData, null, true)

            that.$seventhCategory.find('option').remove()
            that.$eighthCategory.find('option').remove()
            that.$ninthCategory.find('option').remove()
        })

        that.$sixthCategory.on('change', function () {
            var firstValue = that.$firstCategory.val(),
                secondValue = that.$secondeCategory.val(),
                thridValue = that.$thridCategory.val(),
                fourtValue = that.$fourthCategory.val(),
                fifthValue = that.$fifthCategory.val(),
                sixthValue = that.$sixthCategory.val(),
                sevenData = new ArrayToTree().getSearchData([firstValue, secondValue, thridValue, fourtValue, fifthValue, sixthValue], that.treeData);
            Common.fillSelect(that.$seventhCategory, {
                name: "请选择备用1",
                value: ""
            }, sevenData, null, true)

            that.$eighthCategory.find('option').remove()
            that.$ninthCategory.find('option').remove()

        })
        that.$seventhCategory.on('change', function () {
            var firstValue = that.$firstCategory.val(),
                secondValue = that.$secondeCategory.val(),
                thridValue = that.$thridCategory.val(),
                fourtValue = that.$fourthCategory.val(),
                fifthValue = that.$fifthCategory.val(),
                sixthValue = that.$sixthCategory.val(),
                sevenValue = that.$seventhCategory.val(),
                eighthData = new ArrayToTree().getSearchData([firstValue, secondValue, thridValue, fourtValue, fifthValue, sixthValue, sevenValue], that.treeData)
            Common.fillSelect(that.$eighthCategory, {
                name: "请选择综合",
                value: ""
            }, eighthData, null, true)
            that.$ninthCategory.find('option').remove()
        })

        that.$eighthCategory.on('change', function () {
            var firstValue = that.$firstCategory.val(),
                secondValue = that.$secondeCategory.val(),
                thridValue = that.$thridCategory.val(),
                fourtValue = that.$fourthCategory.val(),
                fifthValue = that.$fifthCategory.val(),
                sixthValue = that.$sixthCategory.val(),
                sevenValue = that.$seventhCategory.val(),
                eighthValue = that.$eighthCategory.val(),
                ninthData = new ArrayToTree().getSearchData([firstValue, secondValue, thridValue, fourtValue, fifthValue, sixthValue, sevenValue, eighthValue], that.treeData)
            Common.fillSelect(that.$ninthCategory, {
                name: "请选择布局等级",
                value: ""
            }, ninthData, null, true)
        })

        that.$createResource.find(".modal-footer .save").click(function () {
            var name = that.$resoureName.val(),
                type = that.$createResource.find('[name="model_resource_subCategory"]:checked').val(),
                firstCategory = that.$firstCategory.val(),
                secondeCategory = that.$secondeCategory.val(),
                thridCategory = that.$thridCategory.val(),
                fourthCategory = that.$fourthCategory.val(),
                fifthCategory = that.$fifthCategory.val(),
                sixthCategory = that.$sixthCategory.val(),
                seventhCategory = that.$seventhCategory.val(),
                eighthCategory = that.$eighthCategory.val(),
                ninthCategory = that.$ninthCategory.val();
            // console.log(name, type, firstCategory, secondeCategory, thridCategory, fourthCategory, fifthCategory, sixthCategory, seventhCategory, eighthCategory, ninthCategory, secondeCategory.split(',')[0], secondeCategory.split(',')[1])
            if (!name || !type || !firstCategory || !secondeCategory || !thridCategory || !fourthCategory || !fifthCategory || !sixthCategory || !seventhCategory || !eighthCategory || !ninthCategory) return alert("请填写完整的数据");
            var id = firstCategory + secondeCategory.split(',')[0] + secondeCategory.split(',')[1] + thridCategory + fourthCategory + fifthCategory + sixthCategory + seventhCategory + eighthCategory + ninthCategory;
            // console.log(id)
            if (id.length != 10) return alert("布局编码不等于10位")
            params = [{
                        col: "_id",
                        value: id
                    },
                    {
                        col: "name",
                        value: name
                    },
                    {
                        col: "customId",
                        value: id
                    },
                    {
                        col: "createTime",
                        value: new Date().toFormatString(null, true)
                    },
                    {
                        col: "createor",
                        value: that.USER
                    },
                    {
                        col: "edit",
                        value: that.USER + "," + new Date().toFormatString(null, true)
                    },
                    {
                        col: "basicInfo",
                        value: {
                            // category: fifthCategory,
                            // subCategory: type,
                            // feature: fourthCategory,
                            // userGrade: ninthCategory,
                            // autoCreate: thridCategory,
                            // area: sixthCategory, //布局区域=》布局区域
                            // spare1: seventhCategory, //备用1=》备用1
                            // spare2: eighthCategory, //备用2=>综合
                            // contactId: firstCategory + secondeCategory.split(',')[0] + secondeCategory.split(',')[1] //关联ID => ""
                            category: fourthCategory, //一级目录
                            subCategory: subCategory, //布局分类
                            feature: firstCategory, //布局体系
                            fifthCategory: fifthCategory,
                            userGrade: ninthCategory, //用户等级
                            autoCreate: thridCategory, //自动分表
                            area: sixthCategory, //布局区域=》布局区域
                            spare1: seventhCategory, //备用1=》备用1
                            spare2: eighthCategory, //备用2=>综合
                            contactId: firstCategory + secondeCategory.split(',')[0] + secondeCategory.split(',')[1] //关联ID => ""
                        }
                    },
                    {
                        col: "version",
                        value: {
                            info: []
                        }
                    }

                ],
                condition = [{
                    col: "customId",
                    value: id
                }];

            var relTemplate = "",
                contactId = firstCategory + secondeCategory.split(',')[0] + secondeCategory.split(',')[1];

            that.queryModal(condition).then(res => {
                if (res.length > 0) return alert("布局编号已存在");
                that.saveDb(params).then(res => {
                    if (res.ok == 1 && res.n == 1) {
                        new Workspace().load(id, name, "布局", contactId, relTemplate, that.USER, true);
                        that.$createResource.modal("hide")
                        $("#workspace").css({
                            "width": "0px",
                            "height": "0px"
                        })
                        new Main().open()
                    }
                })


            })


        })



        //保存资源
        // that.$createResource.find(".modal-footer .save").click(function () {
        // var name = that.$resoureName.val(),
        //     category = that.$createResource.find('[name="model_category"]').val(),
        //     subCategory = that.$createResource.find('[name="model_subCategory"]').val(),
        //     feature = that.$createResource.find('[name="model_feature"]').val(),
        //     userGrade = that.$createResource.find('[name="model_userGrade"]').val(),
        //     area = that.$createResource.find('[name="model_area"]').val(),
        //     autoCreate = that.$createResource.find('[name="model_autoCreate"]').val(),
        //     spare1 = that.$createResource.find('[name="model_spare1"]').val(),
        //     spare2 = that.$createResource.find('[name="model_spare2"]').val(),
        //     contactId = that.$createResource.find('[name="model_resource_relId"]').val();

        // if (!name || !category || !subCategory || !feature || !userGrade || !area || !autoCreate || !spare1 || !spare2 || !contactId) return alert("请填写完整的数据");

        // var id = autoCreate + userGrade + feature + category + area + spare1 + spare2 + contactId.replace(/\((.*)\)/img, ""),
        //     params = [{
        //             col: "_id",
        //             value: id
        //         },
        //         {
        //             col: "name",
        //             value: name
        //         },
        //         {
        //             col: "customId",
        //             value: id
        //         },
        //         {
        //             col: "createTime",
        //             value: new Date().toFormatString(null, true)
        //         },
        //         {
        //             col: "createor",
        //             value: that.USER
        //         },
        //         {
        //             col: "edit",
        //             value: that.USER + "," + new Date().toFormatString(null, true)
        //         },
        //         {
        //             col: "basicInfo",
        //             value: {
        //                 category: category,
        //                 subCategory: subCategory,
        //                 feature: feature,
        //                 userGrade: userGrade,
        //                 area: area,
        //                 autoCreate: autoCreate,
        //                 spare1: spare1,
        //                 spare2: spare2,
        //                 contactId: contactId
        //             }
        //         },
        //         {
        //             col: "version",
        //             value: {
        //                 info: []
        //             }
        //         }

        //     ],
        //     condition = [{
        //         col: "customId",
        //         value: id
        //     }];

        // var relTemplate = "";
        // that.data.forEach(item => {
        //     if (item.customId == contactId) {
        //         relTemplate = item
        //     }
        // })
        // that.queryModal(condition).then(res => {
        //     if (res.length > 0) return alert("布局编号已存在");
        //     that.saveDb(params).then(res => {
        //         if (res.ok == 1 && res.n == 1) {
        //             new Workspace().load(id, name, "布局", contactId, relTemplate, that.USER, true);
        //             that.$createResource.modal("hide")
        //             $("#workspace").css({
        //                 "width": "0px",
        //                 "height": "0px"
        //             })
        //             new Main().open()
        //         }
        //     })


        // })
        // })
    },
    execute: function () {
        // this.initData()
        this.basicEvents(true, this.initData);
    }
}