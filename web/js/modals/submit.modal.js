/**
 * 提交配置
 * @param $modal
 * @param $submit
 * @constructor
 */
function SubmitModal($modal, $submit) {
    this.$modal = $modal
    this.$modalBody = $modal.find(".modal-body")
    this.$submit = $submit;
    this.data = {};
    this.USER = "admin"

    // this.$resourceName = this.$modal.find("#Changetemplate_name")
    // this.$resourceCategory = this.$modal.find("#Changetemplate_category")
    // this.$resourceSubcategory = this.$modal.find('[name="Changetemplate_subCategory"]:checked')

    // this.$modalName = this.$modal.find("#Changemodel_name")
    // this.$modalFeature = this.$modal.find("#Changemodel_feature")
    // this.$modalCategory = this.$modal.find("#Changemodel_category")
    // this.$modalArea = this.$modal.find("#Changemodel_area")
    // this.$modalSubcategory = this.$modal.find("#Changemodel_subCategory")
    // this.$modalSpare1 = this.$modal.find("#Changemodel_spare1")
    // this.$modalSpare2 = this.$modal.find("#Changemodel_spare2")
    // this.$modalUserGrade = this.$modal.find("#Changemodel_userGrade")
    // this.$modalAutoCreate = this.$modal.find("#Changemodel_autoCreate")
    // this.queryBasicInfo = async function (dbCollection, condition) {
    //     return await new Service().query(dbCollection, condition, ["basicInfo"])
    // }

    this.$resoureName = $('#Changemodel_name')
    this.$firstCategory = $('#Changemodel_firstCategory');
    this.$secondeCategory = $('#Changemodel_secondeCategory');
    this.$thridCategory = $('#Changemodel_thridCategory');
    this.$fourthCategory = $('#Changemodel_fourthCategory');
    this.$fifthCategory = $('#Changemodel_fifthCategory');
    this.$sixthCategory = $('#Changemodel_sixthCategory');
    this.$seventhCategory = $('#Changemodel_seventhCategory');
    this.$eighthCategory = $('#Changemodel_eighthCategory');
    this.$ninthCategory = $('#Changemodel_ninthCategory');
    this.treeData = null;


    this.getDb = function (dbCollection, condition) {
        return new Service().query(dbCollection, condition)
    }
    this.setData = function (data, type) {
        console.log(data, type)
        var that = this;
        // if (type == "表单") {
        //     this.$resourceName.val(this.data.name)
        //     this.$resourceCategory.val(this.data.basicInfo.category)

        //     var subCategory = this.data.basicInfo.subCategory,
        //         $subCategory = this.$modal.find(`[name="Changetemplate_subCategory"][value="${subCategory}"]`);
        //     $subCategory.attr("checked", true)
        // }
        if (type == "布局") {
            var name = this.data.name,
                firstCategory = data.basicInfo.contactId.slice(0, 1),
                secondeCategory = data.basicInfo.contactId.slice(1, 2) + "," + data.basicInfo.contactId.slice(2, 3),
                thridCategory = data.basicInfo.autoCreate,
                fourthCategory = data.basicInfo.category,
                fifthCategory = data.basicInfo.fifthCategory,
                sixthCategory = data.basicInfo.area,
                seventhCategory = data.basicInfo.spare1,
                eighthCategory = data.basicInfo.spare2,
                ninthCategory = data.basicInfo.userGrade,
                subCategory = data.basicInfo.subCategory;
            var firstData = new ArrayToTree().getFirstData(that.treeData),
                secondData = new ArrayToTree().getSearchData([firstCategory], that.treeData),
                thridData = new ArrayToTree().getSearchData([firstCategory, secondeCategory], that.treeData),
                fourthData = new ArrayToTree().getSearchData([firstCategory, secondeCategory, thridCategory], that.treeData),
                fifthData = new ArrayToTree().getSearchData([firstCategory, secondeCategory, thridCategory, fourthCategory], that.treeData),
                sixthData = new ArrayToTree().getSearchData([firstCategory, secondeCategory, thridCategory, fourthCategory, fifthCategory], that.treeData),
                sevenData = new ArrayToTree().getSearchData([firstCategory, secondeCategory, thridCategory, fourthCategory, fifthCategory, sixthCategory], that.treeData),
                eighthData = new ArrayToTree().getSearchData([firstCategory, secondeCategory, thridCategory, fourthCategory, fifthCategory, sixthCategory, seventhCategory], that.treeData),
                ninthData = new ArrayToTree().getSearchData([firstCategory, secondeCategory, thridCategory, fourthCategory, fifthCategory, sixthCategory, seventhCategory, eighthCategory], that.treeData);
            that.$resoureName.val(name)
            $("#Changemodel_subCategory").find(`[type="radio"][value="${subCategory}"]`).prop('checked', true)
            Common.fillSelect(that.$firstCategory, {
                name: "请选择表属性",
                value: ""
            }, firstData, firstCategory, true)
            Common.fillSelect(that.$secondeCategory, {
                name: "请选择表序号",
                value: ""
            }, secondData, secondeCategory, true)
            Common.fillSelect(that.$thridCategory, {
                name: "请选择布局属性",
                value: ""
            }, thridData, thridCategory, true)
            Common.fillSelect(that.$fourthCategory, {
                name: "请选择一级目录",
                value: ""
            }, fourthData, fourthCategory, true)
            Common.fillSelect(that.$fifthCategory, {
                name: "请选择二级目录",
                value: ""
            }, fifthData, fifthCategory, true)
            Common.fillSelect(that.$sixthCategory, {
                name: "请选择布局区域",
                value: ""
            }, sixthData, sixthCategory, true)
            Common.fillSelect(that.$seventhCategory, {
                name: "请选择备用1",
                value: ""
            }, sevenData, seventhCategory, true)
            Common.fillSelect(that.$eighthCategory, {
                name: "请选择备用",
                value: ""
            }, eighthData, eighthCategory, true)
            Common.fillSelect(that.$ninthCategory, {
                name: "请选择布局等级",
                value: ""
            }, ninthData, ninthCategory, true)
            // this.$modalName.val(this.data.name)
            // this.$modalFeature.val(this.data.basicInfo.feature)
            // this.$modalCategory.val(this.data.basicInfo.category)
            // this.$modalArea.val(this.data.basicInfo.area)
            // this.$modalSubcategory.val(this.data.basicInfo.subCategory)
            // this.$modalSpare1.val(this.data.basicInfo.spare1 || 0)
            // this.$modalSpare2.val(this.data.basicInfo.spare2 || 0)
            // this.$modalUserGrade.val(this.data.basicInfo.userGrade)
            // this.$modalAutoCreate.val(this.data.basicInfo.autoCreate)
        }
    }
    this.globalJsonPath = "./profiles/global.json";
}

SubmitModal.prototype = {
    initData: async function () {
        var that = this,
            $workspace = $("#workspace"),
            type = $workspace.attr("data-type"),
            id = $workspace.attr('data-id')
        dbCollection = type == "表单" ? "newResources" : "newProducts",
            condition = [{
                col: "customId",
                value: id
            }];
        if (type == "表单") {
            that.$modalBody.find('.nav-tabs li:eq(0) a[data-toggle="tab"]').click();
            that.$modalBody.find('.nav-tabs li:eq(1)').css("display", "none");
        } else {
            that.$modal.find('.nav-tabs li:eq(0)').css("display", "none");
            that.$modal.find('.nav-tabs li:eq(1) a[data-toggle="tab"]').click();
        }
        var treeData = await new ArrayToTree().getTreeData();
        that.treeData = treeData;
        that.getDb(dbCollection, condition).then(res => {
            that.data = res[0]
            that.setData(that.data, type)
        })

    },
    saveData: function () {
        // new Workspace().save(true)
    },
    execute: function () {
        var that = this;
    },
    changeGlobalJson: async function (oldId, newId) {
        var that = this,
            data = await new FileService().readFile(that.globalJsonPath);
        if (data[oldId]) {
            var newdata = $.extend(data[oldId], {})
            delete data[oldId]
            data[newId] = newdata
            new FileService().writeFile(that.globalJsonPath, JSON.stringify(data))
        }
    },
    bindEvents: function () {
        var that = this;
        that.$submit.click(function () {
            // var $workspace = $("#workspace"),
            //     id = $workspace.attr("data-id"),
            //     name = $workspace.attr("data-name"),
            //     subtype = $workspace.attr("data-subtype");
            // that.$modal.modal("show");
            // that.$modal.find("#resource_name").text(name);
            // if (subtype === "表单") {
            //     if(id){
            //         that.queryBasicInfo("newResources",[{col:"customId",value:id}]).then(res=>{
            //             if(res.length>0){
            //                 var basicInfo = res[0].basicInfo
            //                 that.$modal.find('[name="template_category"]').val(basicInfo.category)
            //                 that.$modal.find('[name="template_subCategory"]').each(function(){
            //                     if($(this).val()==basicInfo.subCategory){
            //                         $(this).attr("checked","true")
            //                     }
            //                 })
            //             }
            //         })
            //     }
            //     $('[name="template_name"]').val(name);
            //     that.$modal.find('.nav-tabs li:eq(0) a[data-toggle="tab"]').click();
            //     that.$modal.find('.nav-tabs li:eq(1)').css("display","none");

            // } else if (subtype === "布局") {
            //     $('[name="model_name"]').val(name);
            //     if(id){
            //         that.queryBasicInfo("newProducts",[{col:"customId",value:id}]).then(res=>{
            //             if(res.length>0){
            //                 var basicInfo  = res[0].basicInfo;
            //                 that.$modalBody.find("#model_feature").val(basicInfo.feature)
            //                 that.$modalBody.find("#model_category").val(basicInfo.category)
            //                 that.$modalBody.find("#model_area").val(basicInfo.area)
            //                 that.$modalBody.find("#model_subCategory").val(basicInfo.subCategory)
            //                 that.$modalBody.find("#model_userGrade").val(basicInfo.userGrade)
            //                 that.$modalBody.find("#model_autoCreate").val(basicInfo.autoCreate)
            //                 that.$modalBody.find("#model_spare1").val(basicInfo.spare1||"0")
            //                 that.$modalBody.find("#model_spare2").val(basicInfo.spare2||"0")
            //             }
            //         })
            //     }
            //     var relTemplate = Common.parseData($workspace.attr("data-relTemplate") || null);
            //     if (relTemplate) {
            //         $('[name="model_subCategory"]').val(relTemplate.basicInfo.subCategory);
            //     }
            //     that.$modal.find('.nav-tabs li:eq(0)').css("display","none");
            //     that.$modal.find('.nav-tabs li:eq(1) a[data-toggle="tab"]').click();
            // }

        });
        that.$modal.on("show.bs.modal", function () {
            that.initData()
        })
        that.$modal.find(".save").on("click", function () {
            var type = $("#workspace").attr("data-type"),
                oldId = $("#workspace").attr("data-id"),
                id = "",
                condition = [],
                data = that.data;
            if (type == "表单") {
                if (!that.$resourceName.val()) return alert("表单名为必填选项")
                id = data.customId.slice(1, data.customId.length);

                if (oldId != that.$resourceCategory.val() + id) {
                    new CreateTemplate()._getMaxId(that.$resourceCategory.val()).then(res => {
                        var newid = res;
                        condition = [{
                                col: "_id",
                                value: that.$resourceCategory.val() + newid
                            },
                            {
                                col: "name",
                                value: that.$resourceName.val()
                            },
                            {
                                col: "customId",
                                value: that.$resourceCategory.val() + newid
                            },
                            {
                                col: "createTime",
                                value: data.createTime
                            },
                            {
                                col: "createor",
                                value: data.createor
                            },
                            {
                                col: "basicInfo",
                                value: {
                                    category: that.$resourceCategory.val(),
                                    subCategory: that.$modal.find('[name="Changetemplate_subCategory"]:checked').val()
                                }
                            },
                            {
                                col: "edit",
                                value: data.edit + ";" + that.USER + "," + new Date().toFormatString(null, true)
                            }
                        ]
                        new CreateTemplate().updateMaxId(that.$resourceCategory.val(), newid)
                        new Workspace().save(true, null, that.$resourceCategory.val() + newid, condition, that.$resourceName.val())
                    })
                } else {
                    var dbCollection = type == "表单" ? "newResources" : "newProducts",
                        name = that.$resourceName.val()
                    condition = [{
                            col: "customId",
                            value: oldId
                        }],
                        data = [{
                            col: "name",
                            value: name
                        }, {
                            col: "basicInfo",
                            value: {
                                category: that.$resourceCategory.val(),
                                subCategory: that.$modal.find('[name="Changetemplate_subCategory"]:checked').val()
                            }
                        }];
                    var result = new Service().update(dbCollection, condition, data)
                    result.then(res => {
                        $("#workspace").attr("data-name", name)
                        var text = name + '<span class="text-danger">' + "(" + oldId + ")" + '</span>';
                        $("#name").empty().append(text);
                        alert("保存成功")
                    })

                }
            }
            if (type == "布局") {
                if (!that.$resoureName.val()) return alert("布局名为必填选项");
                // var autoCreate = that.$modalAutoCreate.val(),
                //     userGrade = that.$modalUserGrade.val(),
                //     feature = that.$modalFeature.val(),
                //     category = that.$modalCategory.val(),
                //     subCategory = that.$modalSubcategory.val(),
                //     area = that.$modalArea.val(),
                //     spare1 = that.$modalSpare1.val(),
                //     spare2 = that.$modalSpare2.val(),
                //     contactId = data.basicInfo.contactId.replace(/\((.*)\)/img, "");
                // if (data.customId.length > 10) {
                //     var saveAsNumber = data.customId.slice(10, that.data.customId.length)
                // }
                // id = autoCreate + userGrade + feature + category + area + spare1 + spare2 + contactId + (saveAsNumber ? saveAsNumber : "");
                console.log(data)
                var name = that.$resoureName.val(),
                    subCategory = that.$modalBody.find('[name="model_resource_subCategory"]:checked').val(),
                    firstCategory = that.$firstCategory.val(),
                    secondeCategory = that.$secondeCategory.val(),
                    thridCategory = that.$thridCategory.val(),
                    fourthCategory = that.$fourthCategory.val(),
                    fifthCategory = that.$fifthCategory.val(),
                    sixthCategory = that.$sixthCategory.val(),
                    seventhCategory = that.$seventhCategory.val(),
                    eighthCategory = that.$eighthCategory.val(),
                    ninthCategory = that.$ninthCategory.val();
                 if (!name || !subCategory || !firstCategory || !secondeCategory || !thridCategory || !fourthCategory || !fifthCategory || !sixthCategory || !seventhCategory || !eighthCategory || !ninthCategory) return alert("请填写完整的数据");
                    //  console.log(name, subCategory, firstCategory, secondeCategory, thridCategory, fourthCategory, fifthCategory, sixthCategory, seventhCategory, eighthCategory, ninthCategory, secondeCategory.split(',')[0], secondeCategory.split(',')[1])
                var id = firstCategory + secondeCategory.split(',')[0] + secondeCategory.split(',')[1] + thridCategory + fourthCategory + fifthCategory + sixthCategory + seventhCategory + eighthCategory + ninthCategory;
                if (id.length != 10) return alert("布局编码不等于10位")
                if (data.customId.length > 10) {
                    var saveAsNumber = data.customId.slice(10, that.data.customId.length)
                }
                id = id + (saveAsNumber ? saveAsNumber : "");
                condition = [{
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
                        col: "createor",
                        value: data.createor
                    },
                    {
                        col: "createTime",
                        value: data.createTime
                    },
                    {
                        col: "edit",
                        value: data.edit + ";" + that.USER + "," + new Date().toFormatString(null, true)
                    },
                    {
                        col: "basicInfo",
                        value: {
                            // category: fifthCategory,//一级目录
                            // subCategory: subCategory,//布局分类
                            // feature: fourthCategory,//布局体系
                            // userGrade: ninthCategory,//用户等级
                            // autoCreate: thridCategory,//自动分表
                            // area: sixthCategory, //布局区域=》布局区域
                            // spare1: seventhCategory, //备用1=》备用1
                            // spare2: eighthCategory, //备用2=>综合
                            // contactId: firstCategory + secondeCategory.split(',')[0] + secondeCategory.split(',')[1] //关联ID => ""
                            category: fourthCategory, //一级目录
                            subCategory: subCategory,//布局分类
                            feature: firstCategory,//布局体系
                            fifthCategory:fifthCategory,//二级目录
                            userGrade: ninthCategory,//用户等级
                            autoCreate: thridCategory,//自动分表
                            area: sixthCategory, //布局区域=》布局区域
                            spare1: seventhCategory, //备用1=》备用1
                            spare2: eighthCategory, //备用2=>综合
                            contactId: firstCategory + secondeCategory.split(',')[0] + secondeCategory.split(',')[1] //关联ID => ""
                        }
                    }
                ]
                if (oldId != id) {
                    new Workspace().save(true, null, id, condition, that.$resoureName.val())
                    that.changeGlobalJson(oldId, id)
                } else {
                    var dbCollection = type == "表单" ? "newResources" : "newProducts",
                        name = that.$resoureName.val(),
                        condition = [{
                            col: "customId",
                            value: oldId
                        }],
                        data = [{
                            col: "name",
                            value: name
                        },{
                            col: "basicInfo.subCategory",
                            value: subCategory
                        }];
                    var result = new Service().update(dbCollection, condition, data)
                    result.then(res => {
                        $("#workspace").attr("data-name", name)
                        var text = name + '<span class="text-danger">' + "(" + oldId + ")" + '</span>';
                        $("#name").empty().append(text);
                        alert("保存成功")
                    })
                }
            }
            that.$modal.modal("hide")
        })


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
    }
};