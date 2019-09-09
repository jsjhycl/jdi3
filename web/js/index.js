//初始化
async function init() {
	//筛选
	new Filter('加载').set();
	//初始化属性栏
	await new Propertybar($("#propertybar")).init(false, null);

	//初始化工作区
	var $workspace = $("#workspace"); //获取工作区
	$workspace.css({
		"width": $("#width").val(),
		"height": $("#height").val(),
		"background-color": $("#bgColor").val()
    });
    
	new FileService().readFile("./profiles/category.json", "UTF-8", function(result){
		if (DataType.isObject(result)) { //判断result是否为对象
			Common.fillCategorySelect(result)
		}
	});
	 
	//子模块设计器的位置，全局变量
	submodulesOffset = {
		top:"5",
		left:"5",
	};
    
	//右键菜单
	new ContextMenu().done(1, $workspace);
	// add at 2017/12/27绑定draggable
	// $(".modal .modal-dialog .modal-content").draggable({handle: ".modal-header"});
	$(".modal .modal-dialog ").draggable({
		handle: ".modal-header"
	}); //优化弹窗的拖拽
	$("#events_modal .modal-dialog").resizable({
		handles: "all"
	});
}

//导航栏
function navbar() {

	//新建表单资源
	var createTemplate = new CreateTemplate();
	createTemplate.bindEvents();

	//新建表单资源
	var createResource = new CreateResource();
	createResource.execute(); //初始化新建布局表单
	createResource.bindEvents(); //绑定新建布局表单资源

	//打开表单资源
	var openTemplate = new OpenTemplate($("#open_template_modal"));
	openTemplate.execute();

    // 表单查询配置
    var templateModal = new OpenConfigModal($("#template_config_modal"), 0);
    templateModal.execute();

	//打开资源布局
	var openResource = new OpenResource($("#open_resource_modal"));
	openResource.execute();

    // 表单查询配置
    var resourcesModal = new OpenConfigModal($("#resource_config_modal"), 1);
    resourcesModal.execute();

    // 修改category文件
    var changeCategoryModal = new ChangeCategoryModal($("#change_category_moda"));
    changeCategoryModal.execute();

    // 修改路由文件
    var ChangeRouterModal = new ChangeRouter($("#change_router_modal"));
    ChangeRouterModal.execute();

    // 修改全局变量
    var ChangeGlobalModal = new ChangeGlobal($("#change_global_modal"));
    ChangeGlobalModal.execute();

	//另存为
	var saveAsModal = new SaveAsModal($("#saveAsModal"));
	saveAsModal.execute();
	saveAsModal.bindEvents();

	//发布布局
	var publishModal = new PublishModal($("#publishModal"));
	publishModal.execute();
	publishModal.bindEvents();

	//工作区设置
	var workspaceModal = new WorkspaceModal($("#workspaceModal"));
	workspaceModal.execute();

	//数据入库配置
	var dbDesignerModal = new DbDesignerModal($("#dbDesignerModal"));
	dbDesignerModal.execute();
	dbDesignerModal.bindEvents();

	//数据库设计器
	var setDbDesignerModal = new SetDbDesignerModal($("#setDbDesignerModal"))
	setDbDesignerModal.execute();
	setDbDesignerModal.bindEvents()

	//插入函数
	var insertFnModal = new InsertFnModal($("#insertFunctionModal"));
	insertFnModal.execute();

	//提交
	var submitModal = new SubmitModal($("#changeId"), $("#submit"));
	submitModal.execute();
	submitModal.bindEvents();

	(function save(){
		$("#submit").click(function(){
			new Workspace().save(true,null,null)
		})
	})();

	(function(){
		$("#openSetDB").click(function(){
			var cnames = new Property().getArrayByKey("cname"),
			flag = false;
			cnames.splice(cnames.indexOf("BODY"),1)
			cnames.forEach(function(item){
				if(/^[A-Za-z]+$/.test(item)){
					return flag = true;
				}
			})
			if(flag){
				var sure = window.confirm("你还有元素没有配置中文名,是否确认配置数据库？")
				if(!sure) return;
				$("#setDbDesignerModal").modal("show")
			}else{
				$("#setDbDesignerModal").modal("show")
			}
		})
	})();

	//删除
	(function remove() {
		$("#delete").click(function () {
			new Control().remove();
		});
	})();
	(function changeID(){
		$("#changeID").click(function(){
			if($("#workspace").attr('data-type')){
				$("#changeId").modal("show")
			}else{
				alert("请打开资源")
			}
		})
	})();
	
	//重新调用表单
	(function recall() {
		$("#recall").click(function () {
			var $workspace = $("#workspace"), //获取工作区
				id = $workspace.attr("data-id"), //获取工作区的data-id
				name = $workspace.attr("data-name"), //获取工作区data-name
                subtype = $workspace.attr("data-type");
			if (id && subtype === "布局") { //判断是否type等于资源subtype等于布局id存在
				var result = confirm("确定要重新调用表单吗？"); //确认是否
				if (!result) return;
                
                new Service().query("newProducts", [{col: "customId", value: id}], null, null, null, function(rst) {
                    if (Array.isArray(rst) && rst[0]) {
                        new Workspace().load(id, name, "布局", null, null, null); //加载工作区
                        new Main().open();
                    } else {
                        return alert("调用失败！");
                    }
                });
			}
		});
	})();

	//预览
	(function preview() {
		$("#preview").click(function () { //绑定事件
            new Workspace().save(false,null,null,null,null)
				var id = $("#workspace").attr("data-id"); //获取工作区id
				if (!id) return alert("未保存！");
				var subtype = $("#workspace").attr("data-type");
				subtype = subtype == "布局" ? 1 : 0;
				var href = jdi.fileApi.getConfigUrl().serverUrl + "/home/model?customId=" + id + "&type=" + subtype + "&isPreview=preview"; //拼接路径
				require('electron').shell.openExternal(href); //使用electron打开默认浏览器   
		});
	})();

	//标尺查看器
	(function controlRuler() {
		var flag = false;
		$("#controlRuler").click(function () {
			new Ruler().controlCoordinates(flag) //调用标尺查看器
			flag = !flag;
		})
    })();
    
    // 全局函数配置
//表达式配置
(function () {
    function globalExprMethods($dom, localFunction, remoteFunction) {
        $dom.exprGenerator({
            $source: $("#workspace"),
            // $result: $("#property_expression"),
            data: function() { return new Property().getValue('BODY', 'globalMethods') },
            hasBrace: true,
            global: true,
            functions: [{
                    data: localFunction,
                    title: "本地函数"
                },
                {
                    data: remoteFunction,
                    title: "远程函数"
                }
            ],
            onSetProperty: function (data) {
                new Property().setValue('BODY', 'globalMethods', data)
            },
            onClearProperty: function () {
                new Property().remove('BODY', 'globalMethods');
            }
        });
    }

    $(document).on("click", "#globalExprMethods", function () {
        var $this = $(this),
            fileService = new FileService();
            
        $.when(fileService.readFile("/profiles/local_functions.json", "UTF-8"),
        fileService.readFile("/profiles/remote_functions.json", "UTF-8")).done(function (result1, result2) {
            if (!result1 || !result2) return;
            globalExprMethods($this, result1, result2);
        }).fail(function (err) {
            console.log(err);
            alert("全局函数配置器生成失败！");
        });
    });
})();
}

//控件栏
function controlbar() {
	//draggable
	(function dragControl() {
		$("#controlbar .control-item:not([data-type='img'],[data-type='div'])").draggable({ //给draggable传递参数可拖动的控件
			helper: function () {
				var type = $(this).data("type");
				return new Control().getControl(type);
			},
			cursorAt: {
				left: 0,
				top: 0
			}
        });
        
        // 拖拽画图元素
        $("#controlbar .draw-item").draggable({ //给draggable传递参数可拖动的控件
			helper: function(event, ui) {
                var $target = $(event.currentTarget)
                return $($target.get(0).outerHTML).css({
                    width: $target.width() * 3,
                    height: $target.height() * 3
                }).get(0).outerHTML
            },
			cursorAt: {
				left: 0,
				top: 0
			}
		});
	})();



	//测试添加图片
	/*(function testAddImage() {
		$("#testbtn").click(function () {
			// jdi.fileApi.uploadToServer("123456").then(o=>console.log(o)).catch(err=>console.log(err));
			jdi.fileApi.downloadFromServer("123456").then(o=>console.log(o)).catch(err=>console.log(err))
			// jdi.saveImage({resourceId: $("#workspace").attr("data-id"), name: "123456.jpg"});
			//var name = jdi.saveFile({resourceId: $("#workspace").attr("data-id"), name: '1234.txt', content: '你好'});
		})
	})();*/

	//添加图片
	(function addImage() {
		$("#controlbar .control-item[data-type='img']").click(function () { //半丁事件
			$("#imgFile").click();
		});
		$("#imgFile").change(function () {
			var formData = new FormData($("#imgForm")[0]), //获取表单数据
                id = $("#workspace").attr("data-id"), //获取id
                name = $("#workspace").data("name"),
                img = new Control().createNumber("img") + ".jpg"; //生成img类型的id编号
                
            if (!name) return;
            new FileService().upImg(id, img, formData, function (rst) { //上传图片到服务器
                if (rst.status === 0) {
                    var control = new Control(); //实例化控件对象
                    control.setControl("img", function ($node) { //建立新的图片控件
                        var number = control.createNumber("img");
                        $node.attr({
                            "id": number,
                            "name": number,
                            "src": jdi.fileApi.getConfigUrl().serverUrl + new FileService().imgUrl + '/' + rst.result[0].fileName
                        }).css({
                            "left": "5px",
                            "top": "5px"
						});
                        new ContextMenu().done(1, $node); //生成控件的右键菜单浪
                        $("#workspace").append($node); //添加到工作区
					    new Property().setDefault(number); //初始化属性栏设置默认的属性
						$("#imgFile").val("")
                    });
                }
			});
		});
	})();

	//添加子模块
	(function addChild() {
		$('#controlbar .control-item[data-type="div"]').click(function () { //子模块设计器按钮点击
			submodulesOffset = {
				top:"5",
				left:"5",
			};
			var arrs = [
				"channelmode=no",
				"directories=no",
				"location=no",
				"menubar=no",
				"resizable=yes",
				"scrollbars=no",
				"status=no",
				"titlebar=no",
				"toolbar=no",
				"width=1000px",
				"height=700px",
				"top=100px",
				"left=200px"
			];
			let editor = window.open("./editor.html", "_blank", arrs.join(", ")); //打开新的界面
		});
	})();
}

// 中心区
function designer(){
    $("#designer").css({
        "height":$(window).height() - $(".navbar-fixed-top").height() - $("#toolbar").height(),
        "width":$(window).width() - $("#controlbar").width() - $("#propertybar").width()
    })
    $(window).resize(function(){
        $("#designer").css({
            "height":$(window).height() - $(".navbar-fixed-top").height() - $("#toolbar").height(),
            "width":$(window).width() - $("#controlbar").width() - $("#propertybar").width()
        })  
    })
}

//属性栏
function propertybar() {
	//保存属性
	(function () {
		var eventList = [ //定义事件列表
			{
				type: "input focusout blur",
				selector: "#propertybar :text"
			},
			{
				type: "change",
				selector: "#propertybar select"
			},
			{
				type: "click",
				selector: "#propertybar :checkbox"
			}
		];
		for (var i = 0; i < eventList.length; i++) { //遍历eventList
			var item = eventList[i];
			(function (item) {
                $(document).on(item.type, item.selector, function (event) { //绑定事件
					var id = $("#property_id").val(); //获取id
					if (id) {
						var $workspace = $("#workspace");
						$container = id.startsWith('phone_') ? $("#phone_content") : $workspace;
                        new Property().save(id === "BODY" ? $workspace : $container.find("#" + id), $(event.target)); //执行保存
					}
					//2017/09/08优化
					if (this.id === "property_controlType" && event.type === "change") { //如果是控件类型
						AccessControl.executeControlType($(this).val()); //静态数据源进行控制
					}
					//2017/09/27优化
					if (this.id === "property_db_isSave" && event.type === "click") { //如果是数据库的是否入库属性
						AccessControl.executeIsSave($(this).is(":checked")); //对数据库其他的属性控制
					}

					if (this.id === "property_controlType") {
                        var controlType = event.currentTarget.value;
						id && controlType === "上传控件" && AccessControl.setUploadEvent();
						id && controlType === "下拉列表" && AccessControl.showDataSourceTab();
                    }

                    if (this.id === "property_page_rowPersent") {
                        let _colPersent = new Property().getValue(id, 'page.colPersent');
                        AccessControl.setPagePersentVal($("#" + id), `${$(this).val()},${_colPersent}`);
                        AccessControl.clearRemainPagePVal(id, 'rowPersent');
                    }

                    if (this.id === "property_page_colPersent") {
                        let _rowPersent = new Property().getValue(id, 'page.rowPersent');
                        AccessControl.setPagePersentVal($("#" + id), `${_rowPersent},${$(this).val()}`);
                        AccessControl.clearRemainPagePVal(id, 'colPersent');
                    }
				});
			})(item);
		}
	})();

	//表达式配置
	(function () {
		function buildArgs($expr, staticGlobal, dynamicGlobal, localFunction, remoteFunction, systemFunction) {
            var global = {};
			if (DataType.isObject(staticGlobal)) {
				for (var key in staticGlobal) {
					var value = staticGlobal[key];
					global[value + "(静态)"] = "GLOBAL." + key;
				}
			}
			if (DataType.isObject(dynamicGlobal)) {
				for (var id in dynamicGlobal) {
					var property = dynamicGlobal[id];
					//此处过滤规则待优化
					// if (property.cname !== id) {
					global[property + "(动态)"] = "LOCAL." + id;
					// }
				}
			}
			$expr.exprGenerator({
				$source: $("#workspace"),
				$result: $("#property_expression"),
				hasBrace: true,
				toolbar: [
					// {title: "类型转换", type: "cast", data: {"数字": "数字", "字符": "字符"}, style: "cpanel-type"},
					// {
					// 	title: "算术运算符",
					// 	type: "normal",
					// 	data: {"+": "+", "-": "-", "*": "*", "/": "/"},
					// 	style: "cpanel-operator"
					// },
					{title: "全局变量", type: "normal", data: global, style: "cpanel-global"},
				],
				functions: [{
						data: localFunction,
						title: "本地函数"
					},
					{
						data: remoteFunction,
						title: "远程函数"
					}
				],
				systemFunction: systemFunction,
				onSetProperty: function (expr) {
					var id = $("#property_id").val();
					if (id) {
						new Property().setValue(id, "expression", expr);
					}
				},
				onClearProperty: function () {
					var id = $("#property_id").val();
					if (id) {
						new Property().remove(id, "expression");
					}
				}
			});
		}

		$(document).on("click", "#propertybar .btn-expr", function () {
			var $expr = $(this),
				commonService = new CommonService();
                fileService = new FileService();
                
			$.when(fileService.readFile("/profiles/global.json", "UTF-8"),
            fileService.readFile("/profiles/local_functions.json", "UTF-8"),
            fileService.readFile("/profiles/remote_functions.json", "UTF-8"),
            fileService.readFile("/profiles/system_functions.json", "UTF-8")).done(function (result1, result2, result3, result4) {
				if (!result1 || !result2 || !result3 || !result4) return;
                var staticGlobal = result1,
					localFunction = result2,
					remoteFunction = result3,
                    systemFunction = result4,
                    globalVariable = {},
                    localVariable = {};

                if (staticGlobal) {
                    if (Array.isArray(staticGlobal.global)) {
                        staticGlobal.global.forEach(el => {
                            globalVariable[el.key] = el.desc;
                        });
                    }
                    let workspaceId = $('#workspace').attr('data-id');
                    if (workspaceId && Array.isArray(staticGlobal[workspaceId])) {
                        staticGlobal[workspaceId].forEach(el => {
                            localVariable[el.key] = el.desc;
                        });
                    }
                }

				// if (globalId) {
				// 	commonService.getFile("/publish/" + globalId + "/property.json", function (dynamicGlobal) {
				// 		buildArgs($expr, staticGlobal, dynamicGlobal, localFunction, remoteFunction, systemFunction);
				// 	});
				// } else {
					buildArgs($expr, globalVariable, localVariable, localFunction, remoteFunction, systemFunction);
				// }
			}).fail(function (err) {
				console.log(err);
				alert("表达式生成器参数数据生成失败！");
			});
        });
	})();

	//静态数据源配置
	var staticDSModal = new StaticDataSourceModal($("#dataSource_static_modal"), $("#property_dataSource_static"));
	staticDSModal.execute();

	//数据库数据源配置
	var dbDSModal = new DbDataSourceModal($("#dataSource_db_modal"), $("#property_dataSource_db"));
	dbDSModal.execute();

	// 下拉列表数据源配置
	var sourceTabModal = new DataSourceTabModal($("#dataSource_db_tab_modal"), $("#property_dataSource_static"), $("#property_dataSource_db"))
	sourceTabModal.execute();

	
	//新的触发配置
	var eventmodal = new NewEventsModal($("#events_modal"), $("#property_events"))
	eventmodal.bindEvents();
    eventmodal.execute();
    
	//数据库查询
	var dbQueryModal = new DbQueryModal($("#query_db_modal"), $("#property_query_db"));
	dbQueryModal.execute();

	//存档路径
	var archivePathModal = new ArchivePathModal($("#archivePath_modal"), $("#property_archivePath"));
	archivePathModal.execute();
    archivePathModal.bindEvents();

    // 批量存档路径
    var archivePathBatchModal = new ArchivePathBatch($("#archivePathBatch_modal"));
	archivePathBatchModal.execute();
    
    // 嵌套查询
    var dbNestQueryModal = new DbNestQueryModal($("#query_nest_modal"), $("#property_query_nest"))
    dbNestQueryModal.execute();
}

//工作区
function workspace() {
	new KeyEvent()
	//绘制标尺
	new Ruler().drawCoordinates()
	var $workspace = $("#workspace");

	//droppable
	$workspace.droppable({
		accept: ".control-item, .draw-item",
		drop: function (event, ui) {
            var isPhone = DomHelper.isInPhone($("#phone_warp"), $(ui.helper[0]), ui.offset.top, ui.offset.left);
            if (isPhone) return false;
            var $target = $(ui.helper[0]),
                type = ui.helper.data("type"),
                subtype = ui.helper.data("subtype"),
                control = new Control();
            if (!$target.hasClass("draw-item")) {
                control.setControl(type, function ($node) {
                	var number = control.createNumber(type),
                		offset = $workspace.offset();
                	$node.attr({
                		"id": number,
                		"name": number
                	}).css({
                		"left": event.pageX - offset.left,
                		"top": event.pageY - offset.top
                	});
                	$workspace.append($node);
                    new Property().setDefault(number);
                    return false;
                });
            } else {
                control.setDrawControl(type, subtype, $target.outerWidth(), $target.outerHeight(), function($canvas) {
                    var number = control.createNumber(type),
                        offset = $workspace.offset();
                	$canvas.attr({
                		"id": number,
                		"name": number
                	}).css({
                		"left": event.pageX - offset.left,
                		"top": event.pageY - offset.top
                	});
                    $workspace.append($canvas);
                    new Property().setDefault(number, type);
                })
            }
		}
	});

	//selectable
	$workspace.selectable({
		filter: ".workspace-node",
		delay: 50,
		// selected: function () {},//巨坑注意：此事件会被调用多次
		start: function (event, ui) {
			var $last = $workspace.find('.resizable').last(),
				id = $last.find('.workspace-node').first().attr('id');
			LAST_SELECTED_ID = id ? id : null;
		},
		stop: function (event, ui) {
			if (!event.ctrlKey) {
				$workspace.find(".workspace-node").jresizable("destroy");
			}
			$("#phone_content").find(".workspace-node").jresizable("destroy");
			$workspace.find(".ui-selected").jresizable({
				mode: "region",
				$container: $("#workspace"),
				color: "red",
				onStart: function () {
					$workspace.selectable("disable");
				},
				onStop: function () {
					$workspace.selectable("enable");
				}
			});
			ableToolBarBtn();
			new Property().clearDOM();
		}
	});

	//jresizable
	$workspace.on("click", ".workspace-node", function (event) {
		$workspace.jresizable("destroy");
		$workspace.removeClass("focus").css("overflow","visible");
		$("#delete").css('color', 'red');
		$("#phone_content").find(".workspace-node").jresizable("destroy");
		event.stopPropagation();
		var $this = $(this),
			isArrow = $this.data('type') === 'arrow',
			subtype = $this.data('subtype'),
			control = new Control();
		$(this).jresizable({
			mode: "single",
			multi: event.ctrlKey,
			color: "red", // czp修改了颜色
			onStart: function () {
				$workspace.selectable("disable");
			},
			onStop: function () {
				$workspace.selectable("enable");
			},
			onResize: function (width, height) {
				isArrow && control.drawArrow($this, subtype, width, height)
			},
		});
		ableToolBarBtn();
		$workspace.find(".resizable").length == 1 && (LAST_SELECTED_ID = $(this).attr('id'))
		$workspace.find(".ui-selected").removeClass("ui-selected");
		if (event.ctrlKey) {
			new Property().clearDOM();
		}
	});

	//加载属性
	$workspace.on("click", '.workspace-node[data-type!="div"],.workspace-node[data-type="div"] :input', function (event) {
		if (!event.ctrlKey) {
			event.stopPropagation();
			new Property().load($(event.target));
			ableToolBarBtn();
		}
	});

	//清除样式
	$workspace.on("click", function (event) {
		$("#delete").css('color', 'white');
		disableToolbarBtn();
		var $target = $(event.target);
		if (!$target.is(".workspace-node")) {
			$workspace.find(".ui-selected").removeClass("ui-selected");
			new Property().clearDOM();
			$workspace.find(".workspace-node").jresizable("destroy");
			$workspace.jresizable("destroy");
			$workspace.removeClass("focus").css("overflow","visible");
		}
		$(".jcontextmenu:visible").hide();
	});

	//清除右键菜单
	$("#designer").on("click", function () {
		$(".jcontextmenu:visible").hide();
	});

	// 记录每次移动时，选中元素的位置
	$workspace.on("mousedown", function () {
		$workspace.find(".resizable").each(function () {
			var $this = $(this);
			id = $this.find('.workspace-node').attr('id');
			if (id) {
				LAST_POSITION[id] = {
					top: parseFloat($this.css('top')) + parseFloat($(this).css('border-top-width')) + 'px',
					left: parseFloat($this.css('left')) + parseFloat($(this).css('border-left-width')) + 'px',
				};
			}
		})
	})
}

// 手机页面配置
function phone() {
	var $phone_wrap = $("#phone_warp"),
		$phone_content = $("#phone #phone_content");

	$phone_wrap.draggable();

	$phone_content.selectable({
		filter: ".workspace-node",
		delay: 50,
		// selected: function () {},//巨坑注意：此事件会被调用多次
		stop: function (event, ui) {
			$("#delete").css('color', 'red');
			if (!event.ctrlKey) {
				$("#workspace").find(".workspace-node").jresizable("destroy");
				$phone_content.find(".workspace-node").jresizable("destroy");
			}
			$phone_content.find(".ui-selected").jresizable({
				mode: "region",
				$container: $("#phone_content"),
				color: "red",
				onStart: function () {
					$phone_content.selectable("disable");
				},
				onStop: function () {
					$phone_content.selectable("enable");
				}
			});
			new Property().clearDOM();
		}
	});

	$phone_content.on("click", ".workspace-node", function (event) {
		$("#delete").css('color', 'red');

		// 页面上存在一个选中元素的时候，可以 关联手机页面元素
		// 多个时，需要销毁
		// $("#workspace").find(".resizable").length > 1 && $("#workspace").find(".workspace-node").jresizable("destroy");
		$("#workspace").find(".workspace-node").jresizable("destroy");
		event.stopPropagation();
		$(this).jresizable({
			mode: "single",
			color: "red",
			$container: $("#phone_content"),
			scroll: true,
			containment: "#phone #phone_content",
			onStart: function () {
				$phone_content.selectable("disable");
			},
			onStop: function () {
				$phone_content.selectable("enable");
			}
		});
		$phone_content.find(".ui-selected").removeClass("ui-selected");
	});

	$phone_content.droppable({
		accept: ".control-item, #workspace .resizable, .draw-item",
		drop: function (event, ui) {
			var type = ui.helper.data("type"),
				control = new Control(),
                property = new Property();
			if (type) {
                if (type === 'arrow') {
                    let $target = $(ui.helper[0]);
                    control.setDrawControl(type, $target.data('subtype'), $target.outerWidth(), $target.outerHeight(), function($canvas) {
                        var id = 'phone_' + NumberHelper.getNewId(type, $phone_content),
                            offset = $phone_content.offset();
                        $canvas.attr({
                            "id": id,
                            "name": id
                        }).css({
                            "left": event.pageX - offset.left + $phone_content.scrollLeft(),
                            "top": event.pageY - offset.top + $phone_content.scrollTop()
                        });
                        $phone_content.append($canvas);
                        new Property().setDefault(id);
                    })
                } else {
                    control.setControl(type, function ($node) {
                        var id = 'phone_' + NumberHelper.getNewId(type, $phone_content),
                            offset = $phone_content.offset();
                        $node.attr({
                            "id": id,
                            "name": id
                        }).css({
                            "left": event.pageX - offset.left + $phone_content.scrollLeft(),
                            "top": event.pageY - offset.top + $phone_content.scrollTop()
                        });
                        $phone_content.append($node);
                        property.setDefault(id);
                        return false
                    }, true);
                }
			} else {
				// 从工作区拖拽
				var contextMenu = new ContextMenu();
				$("#workspace .resizable").each(function () {
					var $this = $(this),
						offset = $this.offset(),
						p_offset = $phone_content.offset();
					if (DomHelper.isInPhone($("#phone_warp"), $this, offset.top, offset.left)) {
						var $ori = $this.find(".workspace-node"),
							type = $ori.data('type'),
							oriId = $ori.attr('id'),
							oriProperty = property.getValue(oriId),
							newId = 'phone_' + NumberHelper.getNewId(type, $phone_content),
							$newDom = $($ori.get(0).outerHTML).removeAttr('class').attr('class', 'workspace-node')
							.attr({
								id: newId,
								name: newId
							}).css({
								"width": $ori.outerWidth(),
								"height": $ori.outerHeight(),
								"left": $ori.offset().left - p_offset.left + $phone_content.scrollLeft(),
								"top": $ori.offset().top - p_offset.top + $phone_content.scrollTop()
							});
						$this.css(LAST_POSITION[oriId]);
						oriProperty && property.setValue(newId, null, oriProperty);
						$newDom.appendTo($phone_content);
						contextMenu.done(4, $newDom);
					}
				})
			}
		}
	});

	$phone_content.on("click", function (event) {
		$("#delete").css('color', 'white');
		var $target = $(event.target);
		if (!$target.is(".workspace-node")) {
			$phone_content.find(".ui-selected").removeClass("ui-selected");
			new Property().clearDOM();
			$phone_content.find(".workspace-node").jresizable("destroy");
		}
	});

	$phone_content.on("click", '.workspace-node[data-type!="div"],.workspace-node[data-type="div"] :input', function (event) {
		if (!event.ctrlKey) {
			event.stopPropagation();
			new Property().load($(event.target));
			ableToolBarBtn();
		}
	});
}

//回调函数
function back(html) {
	var control = new Control(),
		contextMenu = new ContextMenu();
	control.setControl("div", function ($node) {
		var number = control.createNumber("div");
		$node.append(html).attr({
			"id": number,
			"name": number
		}).css({
			"left": submodulesOffset.left+"px",
			"top": submodulesOffset.top+ "px"
		});
		// submodulesOffset = {
		// 	top:"5",
		// 	left:"5",
		// };
		
		$("#workspace").append($node);
		contextMenu.done(2, $node);


		// 调整工作区的大小
		$node.height() > $("#workspace").height() && $("#workspace").height(Math.ceil($node.height()));
		$node.width() > $("#workspace").width() && $("#workspace").width(Math.ceil($node.width()));
		$node.find(":input").each(function () {
			var childNumber = control.createNumber("child");
			$(this).attr({
				"id": childNumber,
				"name": childNumber
			});
			new Property().setDefault(childNumber);
		});
		new Ruler().drawCoordinates()
		contextMenu.done(3, $node.find(":input"));
	});
}

$(document).ready(function () {
	init().then(() => {
		navbar();
        controlbar();
        designer();
		toolbar();
		propertybar();
		workspace();
		phone();
		shortcut();
		disableToolbarBtn();
	})
});