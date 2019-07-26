//初始化
function init() {
	//筛选
	new Filter('初始化', '加载').set();
	//初始化属性栏
	new Propertybar($("#propertybar")).init(false, null);

	//初始化工作区
	var $workspace = $("#workspace"); //获取工作区
	$workspace.css({
		"width": $("#width").val(),
		"height": $("#height").val(),
		"background-color": $("#bgColor").val()
	});
	//初始化下拉列表
	new CommonService().getFile("/profile/category.json", function (result) {
		if (DataType.isObject(result)) { //判断result是否为对象
			var data = result["子分类"].map(function (item) { //遍历result的子分类
				return {
					name: item,
					value: item
				};
			});
			Common.fillRadio($("#model_resource_subCategory"), "model_resource_subCategory", data); //调用Common的fillRadio的资源分类
			//表单资源提交表单
			Common.fillSelect($('[name="template_category"]'), null, result["表单分类"], null, true); //填充表单分类下拉框
			Common.fillRadio($("#template_subCategory"), "template_subCategory", data); //填充表单分类的单选框
			//布局资源提交表单
			Common.fillSelect($('[name="model_category"]'), null, result["布局分类"], null, true);//填充布局分类的下拉框
			Common.fillSelect($('[name="model_userGrade"]'), null, result["布局用户级别"], null, true);//填充用户级别的下拉框
			Common.fillSelect($('[name="model_feature"]'), null, result["布局特性"], null, true);//填充布局特性的下拉框
            Common.fillSelect($('[name="model_area"]'), null, result["布局区域"], null, true);
        }
	});
	//右键菜单
	new ContextMenu().done(1, $workspace);
	// add at 2017/12/27绑定draggable
	// $(".modal .modal-dialog .modal-content").draggable({handle: ".modal-header"});
	$(".modal .modal-dialog ").draggable({
		handle: ".modal-header"
	}); //优化弹窗的拖拽
}

//导航栏
function navbar() {

	//资源
	// var resourceModal = new ResourceModal();
	// resourceModal.create();//给资源模态框绑定事件
	// resourceModal.open();//绑定事件

	//新建表单资源
	var createTemplate = new CreateTemplate();
	createTemplate.bindEvents();

	//新建表单资源
	var createResource = new CreateResource();
	createResource.initData(); //初始化新建布局表单
	createResource.bindEvents(); //绑定新建布局表单资源

	//打开表单资源
	var openTemplate = new OpenTemplate();
	openTemplate.initData();

	//打开资源布局
	var openResource = new OpenResource();
	openResource.initData();


	//另存为
	var saveAsModal = new SaveAsModal($("#saveAsModal"));
	saveAsModal.execute();
	saveAsModal.bindEvents();

	//产品
	var productModal = new ProductModal();
	productModal.receive(); //绑定模态框事件
	productModal.open();

	//数据库定义
	var dbDefineModal = new DbDefineModal($("#dbDefineModal"));
	dbDefineModal.execute();
	dbDefineModal.bindEvents();

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

	//产品记录查看器
	var recordModal = new RecordModal($("#recordModal"));
	recordModal.execute();

	//插入函数
	var insertFnModal = new InsertFnModal($("#insertFunctionModal"));
	insertFnModal.execute();

	(function saveAs() {
		$("#saveAs").click(function () {
			new Workspace().save(true, true)
		})
	})();

	//保存
	(function save() {
		$("#save").click(function () {
			new Workspace().save(true);
		});
	})();

	//提交
	var submitModal = new SubmitModal($("#submitModal"), $("#submit"));
	submitModal.execute();
	submitModal.bindEvents();

	//删除
	(function remove() {
		$("#delete").click(function () {
			new Control().remove();
		});
	})();

	//重新调用表单
	(function recall() {
		$("#recall").click(function () {
			var $workspace = $("#workspace"), //获取工作区
				id = $workspace.attr("data-id"), //获取工作区的data-id
				name = $workspace.attr("data-name"), //获取工作区data-name
				type = $workspace.attr("data-type"), //获取data-type
				subtype = $workspace.attr("data-subtype"); //获取data-subtype
			if (id && type === "资源" && subtype === "布局") { //判断是否type等于资源subtype等于布局id存在
				var result = confirm("确定要重新调用表单吗？"); //确认是否
				if (!result) return;

				new ResourceService().recall(id, function (result) { //调用重新调用表单
					Common.handleResult(result, function (data) {
						if (data !== id) return alert("调用失败！"); //入伙id不存在退出程序

						//此处的relTemplate参数不需要的原因，data-relTemplate已经绑定
						new Workspace().load(id, name, "资源", "布局", null, null, null); //加载工作区
						new Main().open();
					});
				});
			}
		});
	})();

	//预览
	(function preview() {
		$("#preview").click(function () { //绑定事件
			var id = $("#workspace").attr("data-id"); //获取工作区id
			if (!id) return;

			// var href = "http://36.33.216.13:3001/home/model?id=" + id + "&type=preview";
			var href = jdi.fileApi.getConfigUrl().resolverUrl + "/home/model?id=" + id + "&type=preview"; //拼接路径
			// $(this).attr("href", href);
			require('electron').shell.openExternal(href); //使用electron打开默认浏览器
		});
	})();

	//编号查看器
	// $("#viewer").numViewer({
	// 	$source: $("#workspace"),
	// 	selector: ".workspace-node"
	// });
	$("#viewer").click(function () {
		WorkspaceUtil.numViewer(); //调用编号查看器
	});

	//标尺查看器
	(function controlRuler() {
		var flag = false;
		$("#controlRuler").click(function () {
			new Ruler().controlCoordinates(flag) //调用标尺查看器
			flag = !flag;
		})
	})()
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
				img = new Control().createNumber("img") + ".jpg"; //生成img类型的id编号
			if (!id) return alert("无法上传没有编号的图片！");

			new CommonService().upload(id, img, formData, function (result) { //上传图片到服务器
				Common.handleResult(result, function () {
					var control = new Control(); //实例化控件对象
					control.setControl("img", function ($node) { //建立新的图片控件
						var number = control.createNumber("img");
						$node.attr({
							"id": number,
							"name": number,
							"src": "/lib/" + id + "/res/" + img
						}).css({
							"left": "5px",
							"top": "5px"
						});
						new ContextMenu().done(1, $node); //生成控件的右键菜单浪
						$("#workspace").append($node); //添加到工作区
						new Property().setDefault(number); //初始化属性栏设置默认的属性
					});
				});
			});
		});
	})();

	//添加子模块
	(function addChild() {
		$('#controlbar .control-item[data-type="div"]').click(function () { //子模块设计器按钮点击
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
			// timer = null,
			// html = null;
			// timer = setInterval(function(){
			//     if (editor.closed) {
			//         html = localStorage.cache
			//         back(html)
			//         clearInterval(timer)
			//    }
			// }, 500);
		});
	})();
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
				});
			})(item);
		}
	})();

	//表达式配置
	(function () {
		function buildArgs($expr, staticGlobal, dynamicGlobal, localFunction, remoteFunction) {
			var global = {};
			if (DataType.isObject(staticGlobal)) { //如果
				for (var key in staticGlobal) {
					var value = staticGlobal[key];
					global[value + "(静态)"] = "GLOBAL." + key;
				}
			}
			if (DataType.isObject(dynamicGlobal)) {
				for (var id in dynamicGlobal) {
					var property = dynamicGlobal[id];
					//此处过滤规则待优化
					if (property.cname !== id) {
						global[property.cname + "(动态)"] = "GLOBAL." + id;
					}
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
					// {title: "全局变量", type: "normal", data: global, style: "cpanel-global"},
					// {title: "本地函数", type: "local", data: localFunction, style: "cpanel-local"},
					// {title: "远程函数", type: "remote", data: remoteFunction, style: "cpanel-remote"}
                ],
                functions: [
                    {
                        data: localFunction,
                        title: "本地函数"
                    },
                    {
                        data: remoteFunction,
                        title: "远程函数"
                    }
                ],
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
			$.when(commonService.getAjax("/newapi/getprozz"),
				commonService.getAjax("/profile/global.json"),
				commonService.getAjax("/profile/local_functions.json"),
				commonService.getAjax("/profile/remote_functions.json")).done(function (result1, result2, result3, result4) {
				if (!result1 || !result2 || !result3 || !result4) return;
				
				var data1 = result1[0],
					data2 = result2[0],
					data3 = result3[0],
					data4 = result4[0];
				if (!data1 || !data2 || !data3 || !data4) return;
				
				var globalId = data1.status === 0 ? (data1.result ? data1.result.id : null) : null,
					staticGlobal = data2,
					localFunction = data3,
					remoteFunction = data4,
				
				关闭插入函数弹窗
				$("#insertFunctionArgsModal .close").trigger('click')

				if (globalId) {
					commonService.getFile("/publish/" + globalId + "/property.json", function (dynamicGlobal) {
						buildArgs($expr, staticGlobal, dynamicGlobal, localFunction, remoteFunction);
					});
				} else {
					buildArgs($expr, staticGlobal, null, localFunction, remoteFunction);
				}
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
	
	//触发配置
	// var eventsModal = new EventsModal($("#events_modal"), $("#property_events"));
	// eventsModal.execute();
	// eventsModal.bindEvents();

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
}

//工作区
function workspace() {
	new KeyEvent()
	//绘制标尺
	new Ruler().drawCoordinates()
	var $workspace = $("#workspace");

	//droppable
	$workspace.droppable({
		accept: ".control-item",
		drop: function (event, ui) {
            var isPhone = DomHelper.isInPhone($("#phone_warp"), $(ui.helper[0]), ui.offset.top, ui.offset.left);
            if (isPhone) return false;
			var type = ui.helper.data("type"),
				control = new Control();
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
		$("#delete").css('color', 'red');
		$("#phone_content").find(".workspace-node").jresizable("destroy");
		event.stopPropagation();
		$(this).jresizable({
			mode: "single",
			multi: event.ctrlKey,
			color: "red", // czp修改了颜色
			onStart: function () {
				$workspace.selectable("disable");
			},
			onStop: function () {
                $workspace.selectable("enable");
                console.log(1)
			}
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
		}
		$(".jcontextmenu:visible").hide();
	});

	//清除右键菜单
	$("#designer").on("click", function () {
		$(".jcontextmenu:visible").hide();
    });

    // 记录每次移动时，选中元素的位置
    $workspace.on("mousedown", function() {
        $workspace.find(".resizable").each(function() {
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
            $("#delete").css('color','red');
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
        $("#delete").css('color','red');
        
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
        accept: ".control-item, #workspace .resizable",
		drop: function (event, ui) {
			var type = ui.helper.data("type"),
                control = new Control(),
                property = new Property();
            if (type) {
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
            } else {
                // 从工作区拖拽
                var contextMenu = new ContextMenu();
                $("#workspace .resizable").each(function() {
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
			"left": "5px",
			"top": ($(window).scrollTop() + 5) + "px"
		});
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
	init();
	navbar();
	controlbar();
	toolbar();
	propertybar();
	workspace();
	phone();
	shortcut();
	disableToolbarBtn();
});