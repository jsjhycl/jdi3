(function (jQuery, window, document, undefined) {
    var global_url = '',
        allDataArr = [];
    var CACHE_KEY = "cache_BuildTree",
        NAMESPACE = ".buildTree";
    var BuildTree = function (elements, options, callback) {
        this.$elements = elements;
        this.options = options;
        this.callback = callback;
    };
    BuildTree.prototype = {
        init: function () {
            var that = this;
            return that.$elements.each(function () {
                that.renderBody();
                that.rightHide();
                that.bindEvents();
                // that.getTreeDatas();
                that.resultTree();
                that.outputTree();
                that.removeTree();
            })
        },
        clear: function () {
            $(document).off(NAMESPACE);
        },
        cacheData: function (element) {
            var that = this,
                cache = $.data(element, CACHE_KEY);
            cache = $.extend({}, cache || {}, that.options || {});
            $.data(element, CACHE_KEY, cache);
            return cache;
        },
        // 渲染body
        //     <link rel="stylesheet" href="../lib/buildTree/buildTree.css">
        // <link rel="stylesheet" href="../lib/orgChart/jquery.orgchart.css"></link>
        renderBody: function () {
            var that = this,
                id = that.options.id;
            var $div = $('<div></div>');
            that.replaceItem($('#' + id), $div);
            $div.replaceAll("#" + id);
            $('#' + id).parent().css({ "width": "100%", "height": "100%", "margin": "0" });
            $('#' + id).html(`
                <div class="display-flex wrapper" id = "buildTreeWrap">
                <div class="contain">
                <div class="dis-flex-btw">
                    <p class = "tips">*右击添加窗口</p>
                    <button class="btn btn-primary" id='outputBtn'>保存</button>
                </div>
                <ul class="tree-list"></ul>
                </div>
                <div id="content">
                    <div class="display-flex">
                        <div class="form-horizontal">
                            <div class="modal-title rowCol" id="nodeModalLabel">
                                <div class="position">
                                    坐标：<span id="rowColNum"></span>
                                </div>
                            </div>
                            <div style="margin-top: 30px">
                                <div class="form-group">
                                    <label class="col-sm-3 control-label">表名</label>
                                    <div class="input-wrapper">
                                        <input type="text" class="form-control " id="path" placeholder="请输入路径">
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="col-sm-3 control-label">编号</label>
                                    <div class="input-wrapper">
                                        <ul id="selectType" class="dis-flex index-list"></ul>
                                    </div>
                                </div>
                                <div class="form-group" id="addCodeContent">
                                    <label class="col-sm-3 control-label" id="addCodeLable"></label>
                                    <div class="input-wrapper">
                                        <ul id="addSelectType" class="dis-flex index-list"></ul>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label for="firstname" class="col-sm-3 control-label">名称</label>
                                    <div class="input-wrapper">
                                        <input type="text" class="form-control" id="text" placeholder="请输入名称">
                                    </div>
                                    <ul id="selectList"></ul>
                                </div>
                                <div class="form-group">
                                    <label for="defaultText" class="col-sm-3 control-label">默认名称</label>
                                    <div class="input-wrapper">
                                        <input type="text" class="form-control" disabled id="defaultText" placeholder="请输入默认名称">
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label for="defaultNum" class="col-sm-3 control-label">默认编号</label>
                                    <div class="input-wrapper">
                                        <input type="text" class="form-control" disabled id="defaultNum" placeholder="请输入默认编号">
                                    </div>
                                </div>
                                <div class="form-group">
                                <label for="totalNum" class="col-sm-3 control-label">综合编号</label>
                                <div class="input-wrapper">
                                    <input type="text" class="form-control" disabled id="totalNum" placeholder="综合编号">
                                </div>
                            </div>
                            </div>
                        </div>
                        <div class="pos-rel">
                        <div class="tab-wrapper">
                            <div id="chart-container"></div>
                        </div>
                        <div class="btn-wrapper">
                        <button type="button" class="btn btn-default" id="closeBtn">关闭</button>
                    </div>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <ul id="rightMenu" class="menu-wrapper" style="display: none">
                    <li class="right-menu" id='addWindow'>添加窗口</li>
                    <li class="right-menu" id='removeBtn'>删除</li>
                </ul>
            </div>
            `)
            // <button type="button" class="btn btn-primary" id="saveSubmit">保存</button>
            // <li class="right-menu" id='outputBtn'>保存</li>

        },
        //替换元素中的属性
        replaceItem: function ($olds, $news) {
            const ATTRS_CONFIG = ["class", "id", "name", "style"]; // 定义属性配置数组
            var attrs = {}; // 新建属性对象
            for (var i = 0; i < ATTRS_CONFIG.length; i++) { // 遍历数组
                var name = ATTRS_CONFIG[i]; // 获取数组元素
                attrs[name] = $olds.attr(name); // 对属性对象添加属性
            }
            $news.attr(attrs); // 将属性对象的值复制给dom元素
        },
        // 右键隐藏
        rightHide: function () {
            document.oncontextmenu = function () { return false; }
            $('.contain').mousedown(function (e) {
                if (e.which === 3) {
                    let x = e.pageX,
                        y = e.pageY;
                    $('#rightMenu').show(100).css({
                        left: x,
                        top: y
                    }).find('li').click(function () {
                        $('#rightMenu').hide(100);
                    })
                }
            })
            $(document).click(function (e) {
                if (!$('#rightMenu').is(e.target) && $('#rightMenu').has(e.target).length === 0) $('#rightMenu').hide(100);
            })
        },
        // 单击事件
        bindEvents: function () {
            var that = this;
            //在contain中单击去掉li.active-item
            // $('.contain').click(function (e) {
            //     if (!$('li.tree-item').is(e.target) && $('li.tree-item').has(e.target).length === 0) {
            // $('li.tree-item').removeClass('active-item')
            // $('#content').hide(); //右侧窗口隐藏
            //     }
            // })
            //单击节点
            var $this = '',
                activeRow = 0,
                activeCol = 0;
            var nameSpace = '.buildTree';
            $(document).off(nameSpace);
            $(document).on('click' + nameSpace, '.tree-list .tree-item ', function (e) {
                $(this).addClass('active-item').siblings().removeClass('active-item');
                $this = $(this);
                activeRow = Number($(this).attr('data-row'));
                activeCol = Number($(this).attr('data-col'));
                $('#content').show();
                that.defaultNumName(activeCol, false, activeRow);//默认名称和编号
                $('#selectType').empty().append(that.renderNum());//渲染编号选择type
                //表序号多添加编号1
                if (activeCol === 1) {
                    that.addRenderCode()
                } else {
                    $('#addCodeLable').text('');
                    $("#addSelectType").empty();
                }
                $(this).find('.item-content').text().trim().length ? that.reviseTree(activeRow, activeCol) : that.setVal(activeRow, activeCol);
                that.useNum($this);//获取同级已用的编号
                var inputCheked = $('input[type="checkbox"]:checked');
                if (activeCol !== 1) {
                    inputCheked.length == 1 && activeCol !== 8 ? $('#text').attr('disabled', false) : $('#text').attr('disabled', true);
                    $('#defaultNum').val('0');
                } else {
                    inputCheked.length == 2 && activeCol !== 8 ? $('#text').attr('disabled', false) : $('#text').attr('disabled', true);
                    $('#defaultNum').val('0,0');
                }
                if (activeCol === 3 || activeCol === 4) that.levelRenderList(activeCol);//渲染一级二级下拉列表
                // that.closeNode($this);//关闭兄弟节点

                that.getTotalCode(activeRow, activeCol);//获取综合编号
                $('#totalNum').val($this.attr('data-totalNum'));//设置综合编号
            });
            //点击input进行名称输入
            //选中的值
            $(document).on('click' + nameSpace, '#selectType input', function () {
                var inputCheked = $('#selectType').find('input[type="checkbox"]:checked');
                var actPos = $("#rowColNum").text();
                var actY = that.getPos(actPos).y;
                if (inputCheked.length > 1) {
                    $(this).prop('checked', false);
                    return alert('先取消后在选择');
                }
                if ($(this).prop('checked') == true) {
                    $(this).parent().css('color', 'blue');
                    $('#text').attr('disabled', false);
                    if (Number(actY) !== 1) {
                        $('.tree-list .active-item').attr('title', $(this).val());
                    }
                } else {
                    $('#text').attr('disabled', true).val('');
                    $('.tree-list .active-item').attr('title', '');
                    $('#selectList').hide();
                    $(this).parent().css('color', '#333');
                }
                if (Number(actY) === 8) {
                    var indexListArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
                        levelName = ["Ⅲ八级", "Ⅲ七级", "Ⅲ六级", "Ⅲ五级", "Ⅲ四级", "Ⅲ三级", "Ⅲ二级", "Ⅲ一级", "Ⅱ九级", "Ⅱ八级", "Ⅱ七级", "Ⅱ六级", "Ⅱ五级", "Ⅱ四级", "Ⅱ三级", "Ⅱ二级", "Ⅱ一级", "Ⅰ九级", "Ⅰ八级", "Ⅰ七级", "Ⅰ六级", "Ⅰ五级", "Ⅰ四级", "Ⅰ三级", "Ⅰ二级", "Ⅰ一级"],
                        chekedVal = inputCheked.val();
                    var chekedIdx = indexListArr.findIndex(ele => ele === chekedVal);
                    $('#text').val(levelName[chekedIdx]).attr('disabled', true);
                }

            })
            $(document).on('click' + nameSpace, '#addSelectType input', function () {
                var inputCheked = $('#addSelectType input[type="checkbox"]:checked');
                if (inputCheked.length > 1) {
                    $(this).prop('checked', false);
                    return alert('先取消后在选择');
                }
                var code1 = $('#selectType input[type="checkbox"]:checked').val(),
                    code2 = $(this).val();
                var checkArr = [];
                if (!code1) {
                    $(this).prop('checked', false);
                    return alert('请先选择编号,在选择编号1');
                }
                checkArr.push(code1);
                checkArr.push(code2);
                $(this).prop('checked') == true ? $(this).parent().css('color', 'blue') : $(this).parent().css('color', '#333');
                $('.tree-list .active-item').attr('title', checkArr);
            })
            //添加窗口
            $(document).on('click' + nameSpace, '#addWindow', function (e) {
                e.stopPropagation();
                e.preventDefault();
                $('.tree-list').show();
                activeRow = Number($('.active-item').attr('data-row'));
                activeCol = Number($('.active-item').attr('data-col'));
                var flags = true;
                var iconSpan = $('.active-item').find('span').eq(0);
                var liLen = $('.tree-list li').length,
                    hasCls = $('.tree-list li').hasClass('active-item');
                if (hasCls) {
                    var colArr = [0, 6];
                    if (!colArr.includes(activeCol)) return alert('只能在一级或六级上添加子节点');
                }
                if (iconSpan.hasClass('colse-icon') && iconSpan.css('display') === 'inline') return alert('展开父级再添加');
                if (liLen !== 0) {
                    for (var m = 0; m < liLen.length; m++) {
                        var ele = liLen.eq(m);
                        !$(ele).find('.item-content').text().trim() && alert('填写内容');
                        if (!$(ele).find('.item-content').text().trim()) flags = false;
                        break;
                    }
                }
                var $this = $('li[data-row="' + activeRow + '"][data-col="' + activeCol + '"]'),
                    isFlag = false;
                var $thisNextItem = $this.nextAll();
                var totalF = 0,
                    descTotal = 8 - activeCol;
                for (var i = 0, m = 0; i < $thisNextItem.length; i++) {
                    var nextItemCol = Number($thisNextItem.eq(i).attr('data-col'));
                    if (nextItemCol === Number(activeCol)) {
                        if (activeCol == 0) {
                            activeRow = m == 0 ? activeRow + i : activeRow + i + 1;
                            m++;
                        }
                        break;
                    }
                    if (activeCol == 6 && nextItemCol === 7) totalF++;
                }

                if (totalF) activeRow = activeRow + (descTotal * totalF);
                $this = $('li[data-row="' + activeRow + '"]');
                if (flags) {
                    for (var n = descTotal; n > 0; n--) {
                        var rows = Number(activeRow) + 1,
                            cols = Number(activeCol) + n;

                        var maxRow = $('.tree-list li:last-child').attr('data-row'),
                            thisRow = '', thisCol = '';
                        if (hasCls) {
                            $this.nextAll().each((i, ele) => {
                                let dataRow = Number($(ele).attr('data-row')) + 1;
                                $(ele).attr('data-row', dataRow);
                            })
                            $this.after(that.renderTreeNode(rows, cols, true))
                        } else {
                            $('.tree-list').append(that.renderTreeNode(maxRow ? Number(maxRow) + 1 : 0, 0, true))
                            thisCol = 0;
                            isFlag = true;
                        }
                        //出现-icon
                        var renderLi = $(`li[data-row="${rows}"][data-col="${cols}"]`);
                        if (cols !== 8) {
                            renderLi.find('.expand-icon').show();
                        }
                        if ($('li.active-item').next().length !== 0) {
                            $('li.active-item').find('.expand-icon').show();
                            that.defaultNumName(cols, true, rows);//默认名称和编号
                        }
                        if (isFlag) break;
                    }
                    if (!isFlag) $('#content').mouseleave();
                }
            });
            //点击名称窗口
            $(document).on('click' + nameSpace, '#text', function (e) {
                e.stopPropagation();
                e.preventDefault();
                var actPos = $('#rowColNum').text(),
                    actY = that.getPos(actPos).y;
                if (actY === 3 || actY === 4) $('#selectList').show();
            })
            $(document).on('click' + nameSpace, '#selectList li', function (e) {
                e.stopPropagation();
                e.preventDefault();
                // if ($('.active-item').attr('data-col') === '1') $('#defaultNum').val('0,0');
                // $('#defaultNum').val('0');
                var $this = $(this),
                    thisText = $this.text();
                $('#text').val(thisText);
                $('#selectList').hide();
            })
            $(document).on('click' + nameSpace, function (e) {
                $('#selectList').hide();
            })
            //模态框保存
            // $(document).on('click' + nameSpace, '#saveBtn', function () {
            $(document).on('mouseleave' + nameSpace, '#content', function (e) {
                e.stopPropagation();
                e.preventDefault();
                var textVal = $("#text").val(),
                    actPos = $('#rowColNum').text(),
                    getPos = that.getPos(actPos),
                    actY = getPos.y,
                    actX = getPos.x,
                    inputCheked = $('#selectType').find('input[type="checkbox"]:checked');
                if (inputCheked.length) {
                    if (!textVal) return alert('请选择需要的名称');
                }
                //树形赋值
                if (inputCheked.length && textVal) {
                    $('.active-item').find('.item-content').text(textVal);
                } else {
                    var defaultText = $('#defaultText').val();
                    $('.active-item').find('.item-content').text(defaultText);
                }
                $('.active-item').attr('data-isnet', true);
                if (actY === 3 || actY === 4) {
                    that.levelRenderList(actY);
                }
                //判断title是否有值
                if (!$('.active-item').attr('title')) {
                    var defaultNum = $('#defaultNum').val();
                    $('.active-item').attr('title', defaultNum);
                }
                //获取模态框内容
                var compareObj = that.getPrevNextVal(actX, actY);
                if (compareObj == undefined) return;
                that.getModalData(compareObj);
                that.renderOrgChart(); //渲染组织图


            });
            //关闭
            $(document).on('click' + nameSpace, '#closeBtn', function () {
                $('#content').hide();
            });
            $(document).on('click' + nameSpace, '.expand-icon', function (e) {
                e.stopPropagation();
                e.preventDefault();
                var $this = $(this);
                var $thisCol = $this.parent().attr('data-col'),
                    $thisNextAll = $this.parent().nextAll(),
                    $thisExpandIcon = $this.parent().find('.expand-icon'),
                    thisArr = [];
                $thisNextAll.each((i, eles) => {
                    var $eleCol = $(eles).attr('data-col');
                    if ($eleCol === $thisCol) return false;
                    if (Number($thisCol) + 1 === Number($eleCol)) thisArr.push($(eles));
                })
                if ($thisExpandIcon.hasClass('colse-icon')) {
                    $thisExpandIcon.removeClass('colse-icon')
                    var $thisSib = $this.parent().siblings(`li[data-col="${$thisCol}"]`);
                    $thisSib.each((idx, item) => {
                        var $itemExpand = $(item).find('.expand-icon');
                        if (!$itemExpand.hasClass('colse-icon')) {
                            var isAdd = false;
                            $(item).nextAll().each((idx, node) => {
                                var $nodeCol = Number($(node).attr('data-col'));
                                if ($nodeCol > Number($thisCol)) {
                                    isAdd = true;
                                    if ($(node).find('.expand-icon').css('display') === 'inline') {
                                        $(node).hide().find('.expand-icon').addClass(' colse-icon');
                                    } else {
                                        $(node).hide();
                                    }
                                } else {
                                    return false;
                                }

                            })
                            if (isAdd) $itemExpand.addClass(' colse-icon');
                        }
                    });
                    thisArr.forEach(function (ele) {
                        $(ele).show();
                    });
                } else {
                    var isAdd = false;
                    $thisNextAll.each((i, ele) => {
                        if (!(Number($thisCol) < Number($(ele).attr('data-col')))) return false;
                        $(ele).hide().find('.expand-icon').addClass(' colse-icon');
                        isAdd = true;
                    })
                    if (isAdd) $thisExpandIcon.addClass(' colse-icon');
                }
            });
        },
        //表序号多渲染一个编号
        addRenderCode: function () {
            var that = this;
            $('#addCodeLable').text('编号1');
            var addCodeContent = that.renderNum();
            $("#addSelectType").empty().append(addCodeContent);

        },
        //一级渲染列表，二级渲染列表
        levelRenderList: function (col) {
            var treeItem = $(`.tree-item[data-col="${col}"]`);
            var liArr = [], nameArr = [];
            for (var i = 0; i < treeItem.length; i++) {
                var findName = treeItem.eq(i).find('.item-content').text(),
                    defaultName = $('#defaultText').val();
                if (!nameArr.includes(findName) && findName !== "" && findName !== defaultName) {
                    nameArr.push(findName);
                    liArr.push(`<li>${findName}</li>`);
                }
            }
            $('#selectList').empty().append(`<li>${liArr.join('')}</li>`);
        },
        //默认编号和名称
        defaultNumName: function (col, isAdd, row) {
            var defaultArr = ["表属性", "表序号", "布局属性", "渲染到的一级目录", "渲染到的二级目录", "布局渲染区域", "备用1", "综合", "使用布局等级"];
            if (isAdd) {
                $(`li[data-row="${row}"]`).find('.item-content').text(defaultArr[col]);
                Number(col) !== 1 ? $(`li[data-row="${row}"]`).attr('title', '0') : $(`li[data-row="${row}"]`).attr('title', '0,0');
            } else {
                $('#defaultNum').val('0');
                $('#defaultText').val(defaultArr[col]);
            }
        },
        //搜索结果转换
        searchResultSwitch: function (result) {
            var newResultArr = [];
            result.forEach((ele, key) => {
                var keys = Object.keys(ele);
                var values = Object.values(ele);
                var idIdx = keys.findIndex(item => { return item == 'id' });
                var idVal = values.findIndex(item => { return typeof (item) == "number" });
                keys.splice(idIdx, 1);
                values.splice(idVal, 1);
                values.reverse();
                for (var i = 0; i < values.length; i++) {
                    if (values[i] === null) {
                        values.splice(i, 1);
                        i = -1;
                    } else {
                        break;
                    }
                }

                values.reverse();
                var len = 0,
                    newVal = "";
                for (var i = 0, m = 0; i < keys.length; i++) {
                    if (values[i] === null || values[i] === "") {
                        m++;
                        if (m == 1) len = i;
                    }
                }
                if (len == 0) len = values.length - 3;
                key == 0 ? newVal = `;${values[len - 2]};${values[values.length - 1]};${values[values.length - 2]};${values[len - 1]};` : newVal = `${values[values.length - 3]};${values[len - 2]};${values[values.length - 1]};${values[values.length - 2]};${values[len - 1]};`;
                if (len == 1) newVal = `;${values[len - 1]};${values[values.length - 1]};${values[values.length - 2]};${values[len - 1]};`;
                for (var j = 0; j < keys.length; j++) { values[j] = null; }
                var newObj = {},
                    num = Math.floor((len - 1) / 2);
                values[num] = newVal
                keys.forEach((item, m) => {
                    newObj[item] = values[m];
                })
                newResultArr.push(newObj);
            });
            return newResultArr;
        },
        //获取数据
        getTreeData: function (data) {
            var that = this,
                arrs = [],
                i = 0;;
            data.forEach(line => {
                for (var item in line) {
                    if (item.length >= 4 && line[item] != null) {
                        var ind = that.nameToId(item);
                        arrs.push({
                            rowCol: 'x:' + i++ + ',y:' + ind,
                            table: line[item]
                        })
                    }
                }
            })
            return arrs;
        },
        //搜索树结果
        resultTree: function () {
            allDataArr = [];
            var that = this,
                indexListArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
                textNameArr = [],
                userNameArr = [],
                data = that.options.data,
                pathText = that.options.tableName,
                switchData = that.searchResultSwitch(data),
                resultData = that.getTreeData(switchData);
            $('.tree-list').empty().show();
            if (resultData.length == 0) return false;
            resultData.forEach(function (ele) {
                var eleRowCol = ele.rowCol,
                    resultNumArr = eleRowCol.split(','),
                    resultNum = resultNumArr.map(eleRowCol => eleRowCol.substring(2)),
                    onObject = ele.table.trim(),
                    isNum = indexListArr.includes(onObject.substring(0, 1));
                allDataArr.push({ rowCol: eleRowCol, table: onObject, pathText: pathText });
                textNameArr.push(onObject.substring(isNum ? 2 : 1, that.splitPos(onObject, 2)));
                that.splitPos(onObject, 5) !== 0 ? userNameArr.push(onObject.substring(that.splitPos(onObject, 4) + 1, that.splitPos(onObject, 5))) : userNameArr.push('');
                $('.tree-list').append(that.renderTreeNode(Number(resultNum[0]), Number(resultNum[1]), false));
            });
            that.showIcon(textNameArr, userNameArr, true);
            that.renderOrgChart() //渲染组织图
        },
        //渲染组织图
        renderOrgChart: function () {
            var that = this,
                root = { rowCol: 'x:-1,y:-1', name: '布局名称细解', table: '', children: [] };
            // 组织结构图    
            that.dataChange(0, root, allDataArr);
            $('#chart-container').empty();
            $('#chart-container').orgchart({
                'data': root,
                'toggleSiblingsResp': true,
                'exportButton': true,
                'exportFilename': '组织结构图'
            })
        },
        //转流程图结构
        dataChange: function (ypos = 0, pNode = root, _arrs) {
            var that = this,
                childItems = _arrs.filter(m => that.getPos(m.rowCol).y === ypos);
            childItems.forEach(childItem => {
                var tableSplit = childItem.table.split(';');
                childItem.name = `${tableSplit[1]}(${tableSplit[4]})`;
                let obj = { ...childItem, children: [] };
                pNode.children.push(obj);
                let start = _arrs.findIndex(m => m === childItem);
                let end = _arrs.findIndex(
                    _item => that.getPos(_item.rowCol).x > that.getPos(childItem.rowCol).x && that.getPos(_item.rowCol).y <= that.getPos(childItem.rowCol).y
                );
                that.dataChange(ypos + 1, obj, _arrs.slice(start, end === -1 ? _arrs.length : end));
            });
        },
        //icon显示及节点内容
        showIcon: function (textNameArr, userNameArr, isShow) {
            if (textNameArr) {
                for (var i = 0; i < textNameArr.length; i++) {
                    var ele = textNameArr[i];
                    $('.tree-list').find('.item-content').eq(i).text(ele);
                    var attrTitle = userNameArr[i].includes(';') ? userNameArr[i].split(';')[4] : userNameArr[i];
                    $('.tree-list .tree-item').eq(i).attr('title', attrTitle);
                    let itemCol = $('.tree-list .tree-item').eq(i).attr('data-col'),
                        itemACol = $('.tree-list .tree-item').eq(i + 1).attr('data-col');
                    if (Number(itemCol) < Number(itemACol)) $('.tree-list .tree-item').eq(i).find('.expand-icon').show();
                }
            }
            setTimeout(() => {
                var treeItem = $('.tree-item');
                for (var i = 0; i < treeItem.length; i++) {
                    var eleCol = treeItem.eq(i);
                    if (!eleCol.find('.expand-icon').is(':hidden')) eleCol.find('.expand-icon').addClass(' colse-icon');
                    if (eleCol.attr('data-col') !== "0") eleCol.hide();
                }
            }, 200)
        },
        // 渲染树节点
        renderTreeNode: function (row, col, isFlag) {
            return `<li class="tree-item" style='padding-left:${col * 20 + 10}px' data-row="${row}" data-col="${col}" data-isnet ="${isFlag}" data-totalNum="" title="">
                    <span class='expand-icon'></span>
                    <span class="item-content"></span>
                    </li>`;
        },
        //窗口赋值
        setVal: function (parentRows, parentCols) {
            var that = this;
            $('#content').show().find('#text,#totalNum').val('');
            $('#path').val(that.options.tableName);
            $('#path').attr('disabled', true)
            that.getActRowCol(); //获取当前row，col

        },
        // 窗口修改
        reviseTree: function (parentRows, parentCols) {
            var that = this;
            that.getActRowCol(); //获取当前row，col
            $('.file-up').attr('disabled', false);
            var rowCol = $('#rowColNum').text(),
                getTextData = that.getItem(rowCol); //获取描述,选中的序号
            // var actText = $(".active-item").find('.item-content').text();
            $('#text').val('');
            allDataArr.forEach((ele, i) => {
                i == 0 && $('#path').val(ele.pathText);
                if (ele.rowCol == rowCol) {
                    if (!$('.active-item').attr('title').includes('0')) {
                        $('#text').val(getTextData.textName);
                    }
                    // $("#defaultText").val() === getTextData.textName ? $('#text').val('') : $('#text').val(getTextData.textName);
                    $('#totalNum').val(getTextData.totalNum);
                    $(`li[data-row="${parentRows}"][data-col="${parentCols}"]`).attr('data-totalNum', getTextData.totalNum);
                }
            })
            $('#path').attr('disabled', true);

            if (getTextData.selectIdx.length == 1) {
                $(`#selectType input[value="${getTextData.selectIdx}"]`).prop('checked', true);
            } else {
                $(`#selectType input[value="${getTextData.selectIdx[0]}"]`).prop('checked', true);
                $(`#addSelectType input[value="${getTextData.selectIdx[1]}"]`).prop('checked', true);
            }
        },
        //获取同级已用的编号
        useNum: function ($this) {
            var thatCol = $this.attr('data-col'),
                thatRow = $this.attr('data-row'),
                parentCol = Number(thatCol) - 1;
            var prevParent = $this.prevAll(),
                nextParent = $this.nextAll();
            var startIdx = 0, endIdx = 0;
            var eqTypeArr = [];
            if (thatCol !== "0") {
                for (var m = 0; m < prevParent.length; m++) {
                    var prevCol = Number(prevParent.eq(m).attr('data-col'));
                    if (prevCol === parentCol) {
                        startIdx = Number(prevParent.eq(m).attr('data-row'));
                        break;
                    }
                }
                for (var n = 0; n < nextParent.length; n++) {
                    var nextCol = Number(nextParent.eq(n).attr('data-col'));
                    if (nextCol < Number(thatCol)) {
                        endIdx = Number(nextParent.eq(n).attr('data-row'));
                        break;
                    }
                }
                for (var k = startIdx + 1; k < endIdx; k++) {
                    if (k !== Number(thatRow)) {
                        var treeEqCol = $('.tree-item').eq(k).attr('data-col');
                        if (treeEqCol == thatCol) {
                            var treeEqTitle = $('.tree-item').eq(k).attr('title');
                            eqTypeArr.push(treeEqTitle);
                        }
                    }
                }
            } else {
                var treeList = $(`.tree-item[data-col="${thatCol}"]:not('.active-item')`);
                for (var i = 0; i < treeList.length; i++) {
                    var treeEq = treeList.eq(i).attr('title');
                    eqTypeArr.push(treeEq);
                }
            }
            var actTitle = $('.active-item').attr('title');
            var titleSplit = actTitle.split(',');
            $(`#selectType input[value="${titleSplit[0]}"]`).parents('li').css('color', 'blue');
            $(`#addSelectType input[value="${titleSplit[1]}"]`).parents('li').css('color', 'blue');
            $('#selectType li').each((idx, ele) => {
                var eleIpt = $(ele).find('input'),
                    eleIptVal = eleIpt.val();
                if (eqTypeArr.includes(eleIptVal)) {
                    eleIpt.attr('disabled', true).parent().css('color', 'red');
                } else {
                    eqTypeArr.forEach(item => {
                        var itemSplit = item.split(',');
                        $(`#addSelectType input[value="${itemSplit[1]}"]`).attr('disabled', true).parent().css('color', 'red');
                        if ($('#addSelectType').children().length) {
                            if ($("#addSelectType input[disabled]").length == 26) {
                                $(`#selectType input[value="${itemSplit[0]}"]`).attr('disabled', true).parent().css('color', 'red');
                            } else {
                                $(`#selectType input[value="${itemSplit[0]}"]`).parent().css('color', 'red');
                            }
                        }
                    })
                }
            })
        },
        //根节点上下序号  类型渲染
        renderNum: function () {
            let indexListArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
                liList = '';
            for (let i = 0; i < indexListArr.length; i++) {
                liList += `<li class='dis-flex-column'>
                                <label>
                                    <input type="checkbox"  name='index' value="${indexListArr[i]}"/>
                                    ${indexListArr[i]}
                                </label>
                            </li>`
            }
            return liList;
        },
        //获取table内容
        getNum: function (rowCol) {
            var that = this;
            return that.getData(rowCol)
        },
        getItem: function (rowCol) {
            var that = this;
            return that.getData(rowCol);
        },
        getData: function (rowCol) {
            var that = this;
            let indexListArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
            var tableItem = '',
                textName = '',
                selectItem = '',
                totalNum = '',
                pos = [],
                posIndex = [],
                selectIdx = [];
            allDataArr.forEach(ele => {
                if (ele.rowCol == rowCol) {
                    let isNum = indexListArr.includes(ele.table.substring(0, 1)),
                        posNum = that.splitPos(ele.table, 2);
                    textName = ele.table.substring(isNum ? 2 : 1, that.splitPos(ele.table, 2))
                    tableItem = ele.table.substring(posNum + 1, that.splitPos(ele.table, 3));
                    totalNum = ele.table.substring(that.splitPos(ele.table, 3) + 1, that.splitPos(ele.table, 4));
                    selectItem = ele.table.substring(that.splitPos(ele.table, 4) + 1, that.splitPos(ele.table, 5));
                }
            })
            selectIdx = selectItem.split(',');
            return {
                textName: textName,
                posIndex: posIndex,
                selectIdx: selectIdx,
                totalNum: totalNum.split(',').join('')
            }
        },
        //获取当前窗口的值
        getActRowCol: function () {
            var $activeItem = $('.tree-list').find('.active-item'),
                activeCols = $activeItem.attr('data-col'),
                activeRows = $activeItem.attr('data-row'),
                rowCol = `x:${activeRows},y:${activeCols}`;
            $('#rowColNum').text(rowCol);
        },
        //得到模态框中的值
        getModalData: function (compareArr) {
            var that = this;
            for (var m = 0; m < compareArr.length; m++) {
                var compareObj = compareArr[m];
                if (compareObj == undefined) continue;
                var onObject = '',
                    rowCol = compareObj.rowCols,
                    thisRow = $('#rowColNum').text().split(',')[0],
                    posRowCol = $('#rowColNum').text().replace(',', '_');

                onObject = "A" + ';' + compareObj.textVal + ';' + "A" + ';' + compareObj.totalCode + ';' + compareObj.selectTypeArr + ';' + posRowCol + ';';
                if (!allDataArr.length) {
                    allDataArr.push({ rowCol: rowCol, table: onObject, pathText: compareObj.pathText })
                } else {
                    var num = 0,
                        flag = false,
                        isAdd = true
                    for (var i = 0; i < allDataArr.length; i++) {
                        if (allDataArr[i].rowCol.includes(thisRow)) {
                            flag = true
                            num = i;
                            break;
                        }
                    }
                    for (var k = 0; k < allDataArr.length; k++) {
                        if (allDataArr[k].rowCol == rowCol) {
                            var posIdx = that.splitPos(onObject, 5),
                                endIdx = that.splitPos(onObject, 6);
                            // onObject = onObject.substring(0, posIdx) + ';' + rowCol.replace(',', '_') + onObject.substring(endIdx);
                            onObject = onObject.substring(0, posIdx) + ';' + rowCol.replace(',', '_') + ";";
                            allDataArr.splice(k, 1, { rowCol: rowCol, table: onObject, pathText: compareObj.pathText })
                            isAdd = false
                        }
                    }
                    if (isAdd) {
                        var posIdx = that.splitPos(onObject, 5),
                            endIdx = that.splitPos(onObject, 6);
                        onObject = onObject.substring(0, posIdx) + ';' + rowCol.replace(',', '_') + ";";
                        allDataArr.splice(i + m, 0, { rowCol: rowCol, table: onObject, pathText: compareObj.pathText })
                    }

                    if (!flag && isAdd) {
                        if (allDataArr.indexOf(allDataArr[allDataArr.length - 1].rowCol)) return false;
                        var posIdx = that.splitPos(onObject, 5),
                            endIdx = that.splitPos(onObject, 6);
                        onObject = onObject.substring(0, posIdx) + ';' + rowCol.replace(',', '_') + ";";
                        allDataArr.push({ rowCol: rowCol, table: onObject, pathText: compareObj.pathText })
                    } else {
                        if (isAdd) {
                            for (var j = num + m + 1; j < allDataArr.length; j++) {
                                let subX = Number(allDataArr[j].rowCol.substring(2, allDataArr[j].rowCol.indexOf(','))) + 1;
                                let subY = allDataArr[j].rowCol.substring(allDataArr[j].rowCol.indexOf(',') + 1);
                                allDataArr[j].rowCol = `x:${subX},${subY}`;
                                var posIdx = that.splitPos(allDataArr[j].table, 5),
                                    endIdx = that.splitPos(allDataArr[j].table, 6);
                                allDataArr[j].table = allDataArr[j].table.substring(0, posIdx) + ';' + `x:${subX}_${subY}` + ";";
                            }
                        }
                    }
                }
            }
        },
        //获取综合编号
        getTotalCode: function (row, col) {
            if (!row || !col) return false;
            var that = this,
                actItem = $(`li[data-row="${row}"][data-col="${col}"]`),
                actCol = Number(col),
                actRow = Number(row),
                activePrev = actItem.prevAll();
            var actTitle = actItem.attr('title') === '' ? col === "1" ? '0,0' : '0' : actItem.attr('title').split(',').join(''),
                totalCode = [];
            //获取父级的综合编号与自己的编号连接----得到自己的综合编号
            totalCode.push(actTitle);
            for (var m = actCol - 1; m >= 0; m--) {
                for (var n = 0; n < activePrev.length; n++) {
                    var activePrevCol = activePrev.eq(n);
                    if (Number(activePrevCol.attr('data-col')) === m) {
                        totalCode.push(activePrevCol.attr('title').split(',').join(''));
                        break;
                    }
                }
            }
            totalCode.reverse();
            var totalCodeJoin = totalCode.join('');
            actItem.attr('data-totalNum', totalCodeJoin);//设置综合编号属性
            var thisItem = $(".active-item");
            $('#totalNum').val(thisItem.attr('data-totalNum'));//设置综合编号
            //下级节点的综合编号都进行修改
            if (Number(actItem.next().attr('data-col')) == actCol + 1) {
                for (var i = actRow + 1; i < allDataArr.length; i++) {
                    var item = allDataArr[i],
                        itemCol = Number(that.getPos(item.rowCol).y);
                    if (itemCol <= actCol) break;
                    var subText = '',
                        itemSplit = item.table.split(';');
                    if (actCol == 0) {
                        subText = itemSplit[3].substring(0, 1);
                        // } else if (actCol == 1) {
                        //     subText = itemSplit[3].substring(0, actCol + 1);
                    } else {
                        subText = itemSplit[3].substring(0, actCol + 2);
                    }
                    itemSplit[3] = itemSplit[3].replace(subText, totalCodeJoin);
                    item.table = itemSplit.join(';');
                }
            }
        },
        //获取上下节点的val,html
        getPrevNextVal: function (actX, actY) {
            var that = this,
                actItem = $(`li[data-row="${actX}"][data-col="${actY}"]`),
                getCont = [];
            var actNextAll = actItem.nextAll();
            // var actPrevAll = actItem.prevAll();
            // textVal = $("#text").val()
            var actItemVal = that.getActVal(actItem);
            getCont.push(actItemVal);
            for (var m = 0; m < actNextAll.length; m++) {
                var eqActItem = actNextAll.eq(m);
                if (eqActItem.attr('data-col') < actY) break;
                var actNextVal = that.getActVal(eqActItem);
                getCont.push(actNextVal)
            }
            return getCont;
        },
        getActVal: function (eqActItem) {
            var that = this;
            var rowCont = eqActItem.attr('data-row'),
                colCont = eqActItem.attr('data-col');
            that.getTotalCode(rowCont, colCont);//获取综合编号
            if (eqActItem.length) {
                var selectTypeArr = eqActItem.attr('title').split(','),
                    pathText = $('#path').val(),
                    textVal = eqActItem.find('.item-content').text(),
                    rowColCont = `x:${rowCont},y:${colCont}`;
                var totalCode = eqActItem.attr('data-totalNum');
                return {
                    'pathText': pathText,
                    'textVal': textVal,
                    'selectTypeArr': selectTypeArr,
                    "totalCode": totalCode,
                    "rowCols": rowColCont
                }
            }

        },
        //获取pos
        getPos: function (str) {
            let parts = str.split(',');
            return {
                x: Number(parts[0].split(':')[1]),
                y: Number(parts[1].split(':')[1])
            }
        },
        //删除是替换rowcol
        setOrder: function (startIndex = 0) {
            var that = this;
            allDataArr.forEach((item, i) => {
                if (i >= startIndex) {
                    let posY = that.getPos(item.rowCol).y;
                    item.rowCol = `x:${startIndex++},y:${posY}`;
                    var posStartIdx = that.splitPos(item.table, 5),
                        posEndIdx = that.splitPos(item.table, 6);
                    item.table = item.table.substring(0, posStartIdx) + ';' + item.rowCol.replace(',', '_');
                }
            });
        },
        //删除树节点
        removeTree: function () {
            var that = this;
            $('#removeBtn').click(function () {
                if (!$('.tree-item.active-item').length) return alert('未选中删除节点');
                var activeCol = Number($('.active-item').attr('data-col'));
                var colArr = [0, 1, 6, 7];
                if (!colArr.includes(activeCol)) return alert('删除请选中一级,二级,六级,七级节点');
                var removeRow = $('.tree-item.active-item').attr('data-row'),
                    removeCol = $('.tree-item.active-item').attr('data-col'),
                    removeRowCol = `x:${removeRow},y:${removeCol}`;
                $('.tree-list').empty();
                var startIndex = allDataArr.findIndex(m => m.rowCol === removeRowCol);
                if (startIndex < 0) {
                    $('.tree-item.active-item').remove();
                } else {
                    let lastPos = that.getPos(allDataArr[startIndex].rowCol);
                    var endIndex = allDataArr.findIndex((m, index) => {
                        let pos = that.getPos(m.rowCol);
                        return index > startIndex && pos.y <= lastPos.y;
                    });
                    allDataArr.splice(startIndex, endIndex !== -1 ? endIndex - startIndex : allDataArr.length - startIndex);
                    that.setOrder(startIndex);
                }
                var textNameArr = [],
                    userNameArr = [],
                    indexListArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
                allDataArr.forEach(eles => {
                    var renderRowColArr = eles.rowCol.split(','),
                        renderRowCol = renderRowColArr.map(i => i.substring(i.indexOf(':') + 1)),
                        tableText = eles.table,
                        isNum = indexListArr.includes(tableText.substring(0, 1))
                    textNameArr.push(tableText.substring(isNum ? 2 : 1, that.splitPos(tableText, 2)))
                    userNameArr.push(tableText.substring(that.splitPos(tableText, 4) + 1, that.splitPos(tableText, 5)))
                    $('.tree-list').append(that.renderTreeNode(Number(renderRowCol[0]), Number(renderRowCol[1]), true))
                })
                if ($('.tree-list li').length == 0) $('.tree-list').hide();
                $('#content').hide();
                that.showIcon(textNameArr, userNameArr, true);
                // that.showIcon(textNameArr, userNameArr, false);
                that.renderOrgChart(); //渲染组织图
            })
        },
        //逗号位置
        splitPos: function (tabText, loctNum) {
            var splitPosNum = 0;
            for (var i = 0, m = 0; i < tabText.length; i++) {
                if (tabText[i] == ';') m++;
                if (m == loctNum) {
                    splitPosNum = i;
                    break;
                }
            }
            return splitPosNum;
        },
        //指定Key排序
        arraySortByKey: function (arrs, key) {
            arrs.sort((a, b) => {
                let axys = a[key].split(","),
                    bxys = b[key].split(","),
                    ax = parseInt(axys[0].split(":")[1]),
                    ay = parseInt(axys[1].split(":")[1]),
                    bx = parseInt(bxys[0].split(":")[1]),
                    by = parseInt(bxys[1].split(":")[1]);
                if (ax == bx)
                    return ay - by;
                else
                    return ax - bx;
            })
            return arrs;
        },
        //id转Name
        idToName: function (id, len) {
            id = id || 0;
            len = len || 4;
            var name = "",
                b = "A".charCodeAt(0);
            for (var i = 0; i < len; i++) {
                var v = id / Math.floor(Math.pow(26, len - i - 1));
                id = id % Math.pow(26, len - i - 1);
                name += String.fromCharCode(b + v);
            }
            return name;
        },
        //Name转id
        nameToId: function nameToId(name) {
            if (!name) return -1;
            var id = 0,
                len = name.length,
                b = "A".charCodeAt(0);
            for (var i = len - 1; i >= 0; i--) {
                var v = name.charAt(i).charCodeAt(0) - b;
                id += v * Math.pow(26, len - i - 1);
            }
            return id;
        },
        //添加数据到对象数组
        arrayAdd: function (objArrs, value, dataX, dataY) {
            var arrs = [],
                middleobj;
            if (objArrs.length > 0) {
                for (let item of objArrs) {
                    if (item.cols.length === dataY) {
                        middleobj = item;
                    }
                }
                if (middleobj)
                    middleobj.cols.map((item) => arrs.push(item));
            }
            arrs.push(value);
            let findIndex = objArrs.findIndex((item) => item.row == dataX);
            if (findIndex >= 0)
                objArrs.splice(findIndex, 1, { row: dataX, cols: arrs });
            else
                objArrs.push({ row: dataX, cols: arrs });
            return objArrs;
        },
        //将对象数组排序，并补充缺失并返回
        arraySortAndAdd: function (arrs) {
            arrs = arrs.sort((a, b) => { return parseInt(a.row) - parseInt(b.row) });
            for (let row = 0; row < parseInt(arrs[arrs.length - 1]); row++) {
                if (row !== parseInt(arrs[row].row))
                    arrs.splice(row, 0, { row: row.toString(), cols: {} });
            }
            return arrs;
        },
        //保存数据前结构转换
        changeDataStru: function () {
            var that = this;
            allDataArr = that.arraySortByKey(allDataArr, "rowCol");
            let tranObj = [],
                postData = [];
            for (let elem of allDataArr) {
                let rowColSplits = elem.rowCol.split(',');
                let dataX = rowColSplits[0].split(":")[1];
                let dataY = parseInt(rowColSplits[1].split(":")[1]);
                tranObj = that.arrayAdd(tranObj, elem.table, parseInt(dataX), dataY);
            }
            var maxLen = 0
            tranObj.forEach(ele => {
                if (ele.cols.length > maxLen) maxLen = ele.cols.length
            })
            tranObj.forEach(ele => {
                if (ele.cols.length < maxLen) {
                    while (ele.cols.length != maxLen) {
                        ele.cols.push("")
                    }
                }
            })//填充0
            tranObj.forEach(ele => {
                var itemObj = {},
                    parentNum = '',
                    prevNum = "",
                    nextNum = "";
                ele.cols.forEach((item, i) => {
                    if (item.includes(';')) {
                        var itemSplit = item.split(';'),
                            itemName = itemSplit[1],
                            // itemLable = itemSplit[itemSplit.length - 3];
                            itemLable = item.substring(that.splitPos(item, 4) + 1, that.splitPos(item, 5));
                        parentNum = itemSplit[itemSplit.length - 4];
                        prevNum = itemSplit[0];
                        nextNum = itemSplit[2];
                    } else {
                        itemLable = item;
                    }
                    i = i + i;
                    var keyY = that.idToName(i);
                    itemObj[keyY] = itemName;
                    var labelNum = i - 1;
                    labelNum < 0 ? labelNum = 1 : labelNum = i + 1;
                    var labelY = that.idToName(labelNum);
                    itemObj[labelY] = itemLable;
                })
                var keys = Object.keys(itemObj);
                for (var k = 1; k < 5; k++) {
                    var nameToIds = that.nameToId(keys[keys.length - 1]) + k,
                        idToNames = that.idToName(nameToIds);
                    k == 1 ? itemObj[idToNames] = prevNum : k == 2 ? itemObj[idToNames] = parentNum : k == 3 ? itemObj[idToNames] = nextNum : itemObj[idToNames] = parentNum;
                }
                ele.cols = itemObj;
            })
            tranObj = that.arraySortAndAdd(tranObj);
            tranObj.forEach(ele => { postData.push(ele.cols); })
            return postData;
        },
        //保存全部数据
        outputTree: function (root) {
            var that = this;
            $('#outputBtn').click(function () {
                var allData = that.changeDataStru();
                if (!$('.tree-list li').length) allData = [];
                that.callback(allData);
            })
        },
    }
    $.fn.extend({
        buildTree: function (options, callback) {
            return new BuildTree(this, options, callback).init();
        }
    })
})($, window, document, undefined)