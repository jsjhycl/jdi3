let fs = require('fs'),
    path = require('path'),
    co = require('co'),
    mfs = require('mz/fs'),
    unzip = require('unzip'),
    xml2js = require('xml2js'),
    xmlParser = new xml2js.Parser({
        explicitArray: false
    });
// config = require('../config');
let config = {
    dataPath: path.join(__dirname, '../data/temp'),
    paramConfig: path.join(__dirname, '../data/configs/paramConfig.json'),
    defaultStyle: path.join(__dirname, '../data/configs/defaultStyle.json'),
    colorIndex: path.join(__dirname, '../data/configs/color.json'),
    themeColor: path.join(__dirname, '../data/configs/themeColor.json'),
    jsPath: path.join(__dirname, '../data/configs/defaultJS.json'),
    radomStr: randomString(4)
}

function xml2json(content) {
    return new Promise((resolve, reject) => {
        xmlParser.parseString(content, function(err, data) {
            if (err) return reject(err);
            else return resolve(data);
        })
    })
}

//元素对象转换为数组
function obj2Array(obj) {
    if (!obj) return [];
    if (obj instanceof Array) return obj;
    let arrs = [];
    arrs.push(obj);
    return arrs;
}

//生成随机数
function randomString(len) {
    len = len || 32;
    let sources = 'abcdefhijkmnprstwxyz';
    let maxPos = sources.length;
    let pwd = '';
    for (i = 0; i < len; i++) {
        pwd += sources.charAt(Math.floor(Math.random() * maxPos));
    }
    return pwd;
}

function getFiles(dirName, resultName) {
    return co(function*() {
        let dirpath = path.join(dirName, 'xl');
        let sharedString = '';
        if (fs.existsSync(path.join(dirpath, 'sharedStrings.xml')))
            sharedString = (yield mfs.readFile(path.join(dirpath, 'sharedStrings.xml'))).toString();
        let styleContent = (yield mfs.readFile(path.join(dirpath, 'styles.xml'))).toString();
        let themeContent = (yield mfs.readFile(path.join(dirpath, 'theme', 'theme1.xml'))).toString();
        let workContent = (yield mfs.readFile(path.join(dirpath, 'workbook.xml'))).toString();
        let workRelContent = (yield mfs.readFile(path.join(dirpath, '_rels', 'workbook.xml.rels'))).toString();
        if (sharedString)
            sharedString = yield xml2json(sharedString);
        styleContent = yield xml2json(styleContent);
        themeContent = yield xml2json(themeContent);
        workContent = yield xml2json(workContent);
        workRelContent = yield xml2json(workRelContent);

        //获取Excel版本信息
        let appContent = (yield mfs.readFile(path.join(dirName, 'docProps', 'app.xml'))).toString();
        appContent = yield xml2json(appContent);
        let version = appContent.Properties.AppVersion.substr(0, appContent.Properties.AppVersion.indexOf("."));
        let tintColor = getTintColor(version);

        //名称对应
        let sheetShip = getSheetRelation(workContent, workRelContent);
        //全局style,包含className
        let styles = [];
        //配置信息
        let paramConfig = getparamConfig();
        let defaultStyles = getDefaultStyle();
        //获取color index对应
        let colorObj = getIndexColor();
        let themeObj = analyzeTheme(themeContent, tintColor, paramConfig);
        tintColor = themeObj.tintColor;
        let styleObj = analyzeStyle(styleContent, themeObj.styles, tintColor, colorObj, paramConfig);
        styles = styles.concat(defaultStyles, styleObj.styles);
        delete styleObj.styles;
        let htmls = [];
        // let sheets = yield mfs.readdir(path.join(dirpath, 'worksheets'));
        // for (let sheet of sheets) {//多个表处理
        let sheet = 'sheet1.xml';
        if (sheet.indexOf(".xml") > 0) {
            let sheetContent = (yield mfs.readFile(path.join(dirpath, 'worksheets', sheet))).toString();
            sheetContent = yield xml2json(sheetContent);
            let sheetHtml = analyzeSheet(sheetContent, analyzeShareJson(sharedString), styles, styleObj, themeObj.styles, tintColor, colorObj, paramConfig);
            sheetHtml.name = sheetShip.hasOwnProperty(sheet) ? sheetShip[sheet] : sheet.substr(0, sheet.lastIndexOf("."));
            htmls.push(sheetHtml);
        }
        // }
        return json2table(htmls, styles, resultName);
    }).catch(err => {
        console.log(err);
        return err;
    })
}

//获取默认样式
function getDefaultStyle() {
    let content = JSON.parse(fs.readFileSync(config.defaultStyle)),
        defaultStyle = [];
    for (let key in content) {
        if (key == "usually")
            defaultStyle = defaultStyle.concat(content[key]);
        if (key == "only") {
            content[key].forEach((item, index) => {
                if (item.className.indexOf(".") == 0) {
                    item.className = "." + config.radomStr + "_" + item.className.substring(1);
                    defaultStyle.push(item);
                }
            })
        }
    }
    return defaultStyle;
}

//获取color indexed对应的颜色表
function getIndexColor() {
    let colorIndexObj = JSON.parse(fs.readFileSync(config.colorIndex));
    return colorIndexObj;
}

//获取配置
function getparamConfig() {
    return JSON.parse(fs.readFileSync(config.paramConfig))
}

//获取theme颜色的固定配置
function getTintColor(version) {
    let tintColor = JSON.parse(fs.readFileSync(config.themeColor));
    if (tintColor.hasOwnProperty(version))
        return tintColor[version]
    return {};
}

//解析workbook，生成表和对应关系
function getSheetRelation(workContent, workRelContent) {
    let sheetobj = {};
    workContent.workbook.sheets.sheet = obj2Array(workContent.workbook.sheets.sheet);
    for (let sheet of workContent.workbook.sheets.sheet) {
        for (let relation of workRelContent.Relationships.Relationship) {
            if (sheet.$["r:id"] == relation.$.Id) {
                let key = relation.$.Target.substr(relation.$.Target.lastIndexOf("/") + 1);
                sheetobj[key] = sheet.$["name"];
            }
        }
    }
    return sheetobj;
}

//解析style样式
function analyzeStyle(styleObj, themestyle, tintColor, colorObj, paramConfig) {
    //formats即是style里数据的格式转化
    let styles = [],
        formats = {},
        rotation = {};
    let cellXfs = styleObj.styleSheet.cellXfs;
    let borders = styleObj.styleSheet.borders.border;
    let fonts = styleObj.styleSheet.fonts.font;
    let numFmts = styleObj.styleSheet.numFmts;
    let fills = styleObj.styleSheet.fills.fill;
    let dxfs = styleObj.styleSheet.dxfs;
    cellXfs.xf = obj2Array(cellXfs.xf);
    cellXfs.xf.forEach((cell, index) => {
        singleXf(cell, index, borders, fonts, numFmts, fills, dxfs, tintColor, colorObj, paramConfig, themestyle, styles, formats, rotation);
    })
    return {
        styles: styles,
        formats: formats,
        fonts: fonts,
        rotation: rotation
    }
}

//style中单个的xf表示一个class样式
function singleXf(cell, index, borders, fonts, numFmts, fills, dxfs, tintColor, colorObj, paramConfig, themestyle, styles, formats, rotation) {
    let style = {};
    //字体
    if (cell.$.fontId != '0') {
        let font = fonts[Number(cell.$.fontId)];
        style = param2Style(font, themestyle, tintColor, colorObj, paramConfig);
    }

    //边框的函数提取
    function paramBorder(borderStr, borderObj, themestyle, paramConfig) {
        let border_line = paramExistConfig(borderStr, borderObj.$.style, paramConfig);
        let border_color_value = borderObj.color.$.rgb ? (borderObj.color.$.rgb.length == 6 ? borderObj.color.$.rgb : borderObj.color.$.rgb.substr(2)) : '';
        if (borderObj.color.$.auto || borderObj.color.$.theme) {
            let clrIndex = Number(borderObj.color.$.auto || borderObj.color.$.theme);
            for (let color_item of themestyle) {
                if ('.' + config.radomStr + '_themeclr' + Number(clrIndex + 1) == color_item.className) {
                    for (let key in color_item) {
                        if (key != 'className')
                            border_color_value = color_item[key];
                    }
                }
            }
        }
        let border_color = paramExistConfig(borderStr + '_color', border_color_value, paramConfig);
        return {
            border_line: border_line,
            border_color: border_color
        };
    }

    //边框 border单独出来
    if (cell.$.borderId != "0") {
        let borderStyle = {};
        let border = borders[Number(cell.$.borderId)];
        if (border.left.$ || border.left.color) {
            let border_left = paramBorder("border_left", border.left, themestyle, paramConfig);
            Object.assign(borderStyle, border_left.border_line, border_left.border_color);
        }
        if (border.right.$ || border.right.color) {
            let border_right = paramBorder("border_right", border.right, themestyle, paramConfig);
            Object.assign(borderStyle, border_right.border_line, border_right.border_color);
        }
        if (border.top.$ || border.top.color) {
            let border_top = paramBorder("border_top", border.top, themestyle, paramConfig);
            Object.assign(borderStyle, border_top.border_line, border_top.border_color);
        }
        if (border.bottom.$ || border.bottom.color) {
            let border_bottom = paramBorder("border_bottom", border.bottom, themestyle, paramConfig);
            Object.assign(borderStyle, border_bottom.border_line, border_bottom.border_color);
        }
        //border单独出来
        borderStyle.className = "." + config.radomStr + "_borderStyle" + index;
        if (Object.keys(borderStyle).length >= 2)
            styles.push(borderStyle);
    }
    //fill
    if (cell.$.applyFill) {
        let fillStyle = {};
        if (cell.$.fillId != '0') {
            let fill = fills[Number(cell.$.fillId)];
            if (fill.patternFill) {
                let patternFill;
                if (fill.patternFill.$.patternType)
                    patternFill = paramExistConfig('patternFill', fill.patternFill.$.patternType, paramConfig);
                let fillStyleObj = param2Style(fill.patternFill, themestyle, tintColor, colorObj, paramConfig);
                Object.assign(fillStyle, patternFill, fillStyleObj);
            }
        }
        //fill单独出来
        fillStyle.className = "." + config.radomStr + "_fillStyle" + index;
        if (Object.keys(fillStyle).length >= 2)
            styles.push(fillStyle);
    }
    //对齐方式
    if (cell.alignment) {
        let alignBoolean = true;
        if (cell.alignment.$.hasOwnProperty("textRotation") && cell.alignment.$["textRotation"] == '255')
            alignBoolean = false;
        for (let align in cell.alignment.$) {
            if (align == "textRotation") {
                rotation[index] = cell.alignment.$[align];
            }
            if (align == 'textRotation' || alignBoolean) {
                if (!paramConfig[align]) {
                    paramConfig[align] = '';
                    style[align] = cell.alignment.$[align];
                } else {
                    // style[paramConfig[align].name] = eval(paramConfig[align].format.replace(/~/g, cell.alignment.$[align]));
                    Object.assign(style, paramConfigSplit(paramConfig[align], cell.alignment.$[align]));
                }
            } else {
                if (!paramConfig[align + '-rotation']) {
                    paramConfig[align + '-rotation'] = '';
                    style[align + '-rotation'] = cell.alignment.$[align];
                } else {
                    // style[paramConfig[align].name] = eval(paramConfig[align].format.replace(/~/g, cell.alignment.$[align]));
                    Object.assign(style, paramConfigSplit(paramConfig[align + '-rotation'], cell.alignment.$[align]));
                }
            }
        }
        if (!alignBoolean && cell.alignment.$["textRotation"] == '255' && !cell.alignment.$.hasOwnProperty("vertical"))
            style["justify-content"] = 'flex-end';
        if (!alignBoolean && cell.alignment.$["textRotation"] == '255' && !cell.alignment.$.hasOwnProperty("horizontal"))
            style["align-items"] = 'center';
    }
    style.className = "." + config.radomStr + "_style" + index;
    if (Object.keys(style).length >= 2)
        styles.push(style);
    //考虑numFmt
    if (numFmts) {
        if (numFmts.numFmt && numFmts.numFmt.length > 0) {
            if (cell.$.numFmtId != '0') {
                let numFmt = Number(cell.$.numFmtId);
                for (let fmt of numFmts.numFmt) {
                    if (Number(fmt.$.numFmtId) == numFmt)
                        formats[index] = fmt.$.formatCode;
                }
            }
        }
    }
}

//解析theme主题样式
function analyzeTheme(themeObj, tintColor, paramConfig) {
    let themeName = themeObj["a:theme"]["a:themeElements"]["a:clrScheme"].$.name;
    tintColor = tintColor.hasOwnProperty(themeName) ? tintColor[themeName] : '';
    let styles = [];
    let themeClr = themeObj["a:theme"]["a:themeElements"]["a:clrScheme"];
    let themeFont = themeObj["a:theme"]["a:themeElements"]["a:fontScheme"];
    let themeFmt = themeObj["a:theme"]["a:themeElements"]["a:fmtScheme"]; //themeFmt暂时不明白什么含义
    let index = 0;
    for (let clr in themeClr) {
        if (clr == '$') continue;
        let item = themeClr[clr];
        for (let a in item) {
            let style = {};
            index++;
            if (item[a].$.lastClr) {
                style[item[a].$.val] = item[a].$.lastClr;
                style = paramExistConfig(item[a].$.val.length == 6 ? item[a].$.val : item[a].$.val.substr(2), item[a].$.lastClr, paramConfig);
                style.className = "*";
                styles.push(style);
            }
            let colorval = item[a].$.lastClr ?
                (item[a].$.lastClr.length == 6 ? item[a].$.lastClr : item[a].$.lastClr.substr(2)) :
                (item[a].$.val ? (item[a].$.val.length == 6 ? item[a].$.val : item[a].$.val.substr(2)) : '');
            style = paramExistConfig("color", colorval, paramConfig);
            style.className = "." + config.radomStr + "_themeclr" + (index == 1 ? 2 : (index == 2 ? 1 : (index == 3 ? 4 : (index == 4 ? 3 : index))));
            styles.push(style);
        }
    }
    for (let font in themeFont) {
        if (font == '$') continue;
        let item = themeFont[font];
        let index = 0;
        for (let f of item["a:font"]) {
            index++;
            let style = paramExistConfig("a:font", f.$.typeface, paramConfig);
            style.className = '.' + config.radomStr + '_themefont' + index;
            styles.push(style);
        }
    }
    return {
        styles: styles,
        tintColor: tintColor
    };
}

//解析sharedString文件(字符串样式)
function analyzeShareJson(obj) {
    if (!obj || (obj && !obj.sst.si)) return [];
    let arrs = [];
    obj.sst.si = obj2Array(obj.sst.si);
    for (let item of obj.sst.si) {
        arrs.push(item);
    }
    return arrs;
}

//解析sheet
function analyzeSheet(sheetobj, shareObj, styles, styleObj, themestyle, tintColor, colorObj, paramConfig) {
    //主体结构
    let sheetData = sheetobj.worksheet.sheetData;
    //htmls:{{content:[{val:,style:}],class:[],location:},heightwidth:{},mergeCells:[],area}
    let htmls = {
        data: {}
    };
    //HTML的区域大小
    let locationArea = sheetobj.worksheet.dimension.$.ref;
    let locationAreas = locationArea.split(":");
    htmls.area = letter2Number(locationAreas[0]) + ':' + letter2Number(locationAreas[1]);
    //默认高度(暂时处理不好)
    /*let defaultHeight = paramExistConfig("defaultRowHeight", sheetobj.worksheet.sheetFormatPr.$.defaultRowHeight, paramConfig);
    defaultHeight.className = 'item';
    styles.push(defaultHeight);*/
    // styles.push({className: 'item', height: Number(sheetobj.worksheet.sheetFormatPr.$.defaultRowHeight)})//需要配置解析
    //合并单元格，区域
    if (sheetobj.worksheet.mergeCells) {
        let mergeCells = [];
        sheetobj.worksheet.mergeCells.mergeCell = obj2Array(sheetobj.worksheet.mergeCells.mergeCell);
        for (let merge of sheetobj.worksheet.mergeCells.mergeCell) {
            let refs = merge.$.ref.split(":");
            mergeCells.push(letter2Number(refs[0]) + ':' + letter2Number(refs[1]));
        }
        htmls.mergeCells = mergeCells;
    }
    //获取列宽和行高
    let heightWidth = {};
    if (sheetobj.worksheet.cols) {
        let width = [];
        sheetobj.worksheet.cols.col = obj2Array(sheetobj.worksheet.cols.col);
        for (let col of sheetobj.worksheet.cols.col) {
            let min = Number(col.$.min),
                max = Number(col.$.max);
            for (let i = min; i <= max; i++) {
                let widthObj = paramExistConfig("width", col.$.hidden ? 0 : col.$.width, paramConfig);
                widthObj.col = i;
                width.push(widthObj)
            }
        }
        if (width.length > 0)
            heightWidth.width = width;
    }
    let height = [];
    if (sheetData.row) {
        sheetData.row = obj2Array(sheetData.row);
        let rowIndex = Number(sheetData.row[0].$.r);
        for (let row of sheetData.row) {
            htmls.data[row.$.r] = [];
            if (rowIndex != Number(row.$.r)) {
                for (let r = rowIndex; r < Number(row.$.r); r++)
                    htmls.data[r] = [];
            }
            rowIndex = Number(row.$.r) + 1;
            if (row.$.ht) {
                let heightObj = paramExistConfig("height", row.$.ht, paramConfig);
                heightObj.row = Number(row.$.r);
                height.push(heightObj);
            }
            if (row.c) {
                row.c = obj2Array(row.c);
                for (let c of row.c) {
                    let result = singleCell(c, htmls, shareObj, styleObj, themestyle, tintColor, colorObj, paramConfig);
                    if (result) htmls.data[row.$.r].push(result);
                }
            }
        }
    }
    if (height.length > 0)
        heightWidth.height = height;
    if (heightWidth.width || heightWidth.height)
        htmls.heightwidth = heightWidth;
    fs.writeFileSync(config.paramConfig, JSON.stringify(paramConfig));
    return htmls;
}

//单个单元格的处理
function singleCell(c, htmls, shareObj, styleObj, themestyle, tintColor, colorObj, paramConfig) {
    let contents = [],
        classes = [],
        fun = '',
        format = '',
        rotation = 0,
        isStr = false,
        textAlign = false; //textAlign是分配数字和汉字的左右对齐
    //考虑函数
    if (c.f) fun = c.f.$ ? c.f._ : c.f;
    //考虑到字符串的情况
    if (c.$.t == 's') {
        isStr = true;
        textAlign = true;
        let index = Number(c.v);
        let si = shareObj[index]; //一个si是一个单元格
        if (si.t) {
            let cellobj = {
                val: ''
            };
            if (si.t.$) {
                if (si.t.$["xml:space"] == "preserve" && !si.t._)
                    cellobj.val = ' ';
                else
                    cellobj.val = si.t._ || '';
            } else
                cellobj.val = si.t || '';
            contents.push(cellobj);
        } else if (si.t == '') contents.push({
            val: ''
        });
        else {
            si.r = obj2Array(si.r);
            for (let r of si.r) {
                let cellobj = {
                    val: ''
                };
                if (r.t) {
                    if (r.t.$) {
                        if (r.t.$["xml:space"] == "preserve" && !r.t._)
                            cellobj.val = ' ';
                        else
                            cellobj.val = r.t._ || '';
                    } else
                        cellobj.val = r.t || '';
                }
                if (r.rPr) {
                    cellobj.style = param2Style(r.rPr, themestyle, tintColor, colorObj, paramConfig);
                    if (!r.rPr.hasOwnProperty("b"))
                        cellobj.style["font-weight"] = 'normal';
                }
                contents.push(cellobj);
            }
            if (si.rPh) {
                let cellobj = {
                    val: ""
                };
                if (si.rPh.t.$) {
                    if (si.rPh.t.$["xml:space"] == "preserve" && !si.rPh.t._)
                        cellobj.val = ' ';
                    else
                        cellobj.val = si.rPh.t._ || '';
                } else
                    cellobj.val = si.rPh.t || '';
                if (si.phoneticPr.$.fontId >= 1) {
                    cellobj.style = param2Style(styleObj.fonts[Number(si.phoneticPr.$.fontId)], themestyle, tintColor, colorObj, paramConfig);
                    cellobj.style["className"] = "pinyin";
                }
                contents.unshift(cellobj);
            }
        }
    } else if (c.v)
        contents.push({
            val: Number(c.v)
        });
    if (!textAlign) classes.push(config.radomStr + "_text_align_right");
    if (c.$.s) { //要考虑数据的格式化的问题
        if (styleObj.formats[c.$.s])
            format = styleObj.formats[c.$.s];
        if (styleObj.rotation[c.$.s]) {
            rotation = styleObj.rotation[c.$.s];
            classes.push("rotation");
        }
        classes.push(config.radomStr + "_style" + c.$.s);
        classes.push(config.radomStr + "_borderStyle" + c.$.s);
        classes.push(config.radomStr + "_fillStyle" + c.$.s);
    }
    let boolen = true,
        location = letter2Number(c.$.r);
    if (htmls.mergeCells) {
        for (let merge of htmls.mergeCells) {
            let mergeResult = judgeCellIn(letter2Number(c.$.r), merge);
            if (!isNaN(mergeResult) && mergeResult != -1) {
                if ([2, 3, 4].indexOf(mergeResult) >= 0) {
                    for (var ro in htmls.data) {
                        for (var co of htmls.data[ro]) {
                            if (co.location == merge) {
                                co.class.push(config.radomStr + "_style" + c.$.s)
                                co.class.push(config.radomStr + "_borderStyle" + c.$.s)
                                co.class.push(config.radomStr + "_fillStyle" + c.$.s)
                            }
                        }
                    }
                }
                boolen = false;
                break;
            } else if (mergeResult != -1) {
                location = mergeResult;
                break;
            }
        }
    }
    if (boolen)
        return {
            content: contents,
            class: classes,
            isStr: isStr,
            fun: fun,
            format: format,
            rotation: rotation,
            location: location,
            realLocation: c.$.r
        }
    else
        return false;
}

//元素的转换，加入style
function param2Style(paramobj, themestyle, tintColor, colorObj, paramConfig) {
    let style = {};
    for (let param in paramobj) {
        let stylevalue = '';
        //需要判断是val，rgb，theme,indexed;
        if (!paramobj[param].$) stylevalue = true;
        else if (paramobj[param].$.val) stylevalue = paramobj[param].$.val;
        else if (paramobj[param].$.rgb) stylevalue = '#' + (paramobj[param].$.rgb.length == 6 ? paramobj[param].$.rgb : paramobj[param].$.rgb.substr(2));
        else if (paramobj[param].$.indexed) {
            if (Number(paramobj[param].$.indexed) <= 63 && Number(paramobj[param].$.indexed) >= 0)
                stylevalue = colorObj[paramobj[param].$.indexed];
        } else if (paramobj[param].$.theme) {
            if (param.toLowerCase().indexOf('color') >= 0) {
                if (tintColor) {
                    for (let item of tintColor) {
                        if (item.theme == paramobj[param].$.theme && (paramobj[param].$.tint || "") == item.tint)
                            stylevalue = item.color;
                    }
                } else {
                    let colorstr = '',
                        tint = paramobj[param].$.tint;
                    for (let clr of themestyle) {
                        if ("." + config.radomStr + "_themeclr" + Number(Number(paramobj[param].$.theme) + 1) == clr.className) {
                            for (let key in clr) {
                                if (key != 'className')
                                    colorstr = clr[key];
                            }
                        }
                    }
                    if (!tint)
                        stylevalue = colorstr;
                    else {
                        if (colorstr.indexOf("#") == 0) colorstr = colorstr.substr(1);
                        let firrgb = parseInt(colorstr.substring(0, 2), 16),
                            secrgb = parseInt(colorstr.substring(2, 4), 16),
                            lastrgb = parseInt(colorstr.substring(4, 6), 16);
                        tint = Number(tint);
                        if (tint < 0) {
                            firrgb = firrgb * (1 + tint);
                            secrgb = secrgb * (1 + tint);
                            lastrgb = lastrgb * (1 + tint);
                        } else {
                            firrgb = firrgb * (1 - tint) + 255 * tint;
                            secrgb = secrgb * (1 - tint) + 255 * tint;
                            lastrgb = lastrgb * (1 - tint) + 255 * tint;
                        }
                        firrgb = Math.round(firrgb).toString(16);
                        secrgb = Math.round(secrgb).toString(16);
                        lastrgb = Math.round(lastrgb).toString(16);
                        firrgb = firrgb.length == 2 ? firrgb : '0' + firrgb;
                        secrgb = secrgb.length == 2 ? secrgb : '0' + secrgb;
                        lastrgb = lastrgb.length == 2 ? lastrgb : '0' + lastrgb;
                        stylevalue = '#' + firrgb + secrgb + lastrgb;
                    }
                }
            }
        }
        if (!paramConfig[param]) {
            paramConfig[param] = '';
            style[param] = stylevalue;
        } else {
            Object.assign(style, paramConfigSplit(paramConfig[param], stylevalue));
            // style[paramConfig[param].name] = eval(paramConfig[param].format.replace(/~/g, stylevalue)); //需要配置和公式等
        }
    }
    delete style.$;
    return style;
}

//判断元素是否存在于paramConfig，没有添加
function paramExistConfig(param, value, paramConfig) {
    let obj = {};
    if (!paramConfig[param]) {
        paramConfig[param] = '';
        obj[param] = value;
    } else {
        // obj[paramConfig[param].name] = eval(paramConfig[param].format.replace(/~/g, value))
        obj = paramConfigSplit(paramConfig[param], value);
    }
    return obj;
}

function paramConfigSplit(paramObj, value) {
    let obj = {};
    if (paramObj.name.indexOf(",") > 0) {
        let names = paramObj.name.split('|,|'),
            formats = paramObj.format.split('|,|');
        obj[names[0]] = eval(formats[0].replace(/~/g, value));
        obj[names[1]] = eval(formats[1].replace(/~/g, value));
    } else
        obj[paramObj.name] = eval(paramObj.format.replace(/~/g, value))
    return obj;
}

//将单元格所属行列转为纯数字，如A1->1-1
function letter2Number(cellLetter) { //单元格所属行列名称
    if (!cellLetter) return 0;
    let firstNum = 0,
        lastNum = 0;
    let splitIndex = 0;
    for (let i = 0; i < cellLetter.length; i++) {
        if (!isNaN(cellLetter[i])) {
            splitIndex = i;
            break;
        }
    }
    let firstLetter = cellLetter.substring(0, splitIndex); //字母
    lastNum = Number(cellLetter.substr(splitIndex)); //数字
    let firstLength = firstLetter.length - 1;
    for (let item of firstLetter) {
        firstNum += (item.charCodeAt() - 64) * (firstLength <= 0 ? 1 : (26 * firstLength));
        firstLength--;
    }
    return firstNum + '-' + lastNum;
}

//判断单元格是否在某一区域
function judgeCellIn(cell, area) {
    if (!cell || !area) return '';
    let cells = cell.split('-');
    let col = Number(cells[0]),
        row = Number(cells[1]);
    let areas = area.split(':');
    let firstAreas = areas[0].split('-');
    let lastAreas = areas[1].split('-');
    let left = Number(firstAreas[0]),
        top = Number(firstAreas[1]),
        right = Number(lastAreas[0]),
        bottom = Number(lastAreas[1]);
    if (col == left && row == top) //判断第一个
        return area;
    else if (col == right && row == top)
        return 2
    else if (col == left && row == bottom)
        return 3
    else if (col == right && row == bottom)
        return 4
    else if (col >= left && col <= right && row >= top && row <= bottom)
        return 5;
    else
        return -1;
}

//解析成tableHTML
function json2table(htmls, styles, resultName) {
    let htmlstrs = [];
    for (let htmlElement of htmls) {
        let html = '<div class="' + config.radomStr + '_sheet_contain"><table style="border-collapse: collapse;table-layout: fixed;width: 1px;">';
        let tdwidth = '70px';
        let areaObj = locationIndex(htmlElement.area);
        let widthLength = areaObj.cols + areaObj.col,
            firstCol = areaObj.col;
        //添加td宽度
        html += '<colgroup>'
        let hwexist = false;
        if (htmlElement.heightwidth) {
            if (htmlElement.heightwidth.width)
                hwexist = true;
        }
        for (let i = firstCol; i < widthLength; i++) {
            let boolen = false;
            if (hwexist) {
                for (let wh of htmlElement.heightwidth.width) {
                    if (wh.col == i) {
                        html += '<col width="' + wh.width + '" style="width: ' + wh.width + '">';
                        boolen = true;
                    }
                }
            }
            if (!boolen)
                html += '<col width="' + tdwidth + '" style="width: ' + tdwidth + '">';
        }
        html += '</colgroup><tbody>';
        for (let rowIndex in htmlElement.data) {
            let trheight = '18px';
            if (htmlElement.heightwidth) {
                if (htmlElement.heightwidth.height) {
                    for (let ht of htmlElement.heightwidth.height) {
                        if (ht.row.toString() == rowIndex.toString())
                            trheight = ht.height;
                    }
                }
            }
            html += '<tr style="height:' + trheight + ';">';
            //判断是否要添加空td和div高度问题
            let tdIndex = firstCol;
            for (let item of htmlElement.data[rowIndex]) {
                let defaultdivhgt = ''; //td中div的高度
                let spanobj = locationIndex(item.location);
                if (tdIndex != spanobj.col) {
                    let colspan = spanobj.col - tdIndex;
                    if (colspan >= 1) {
                        let otherColspan = colspan;
                        if (htmlElement.mergeCells) {
                            for (let mergeCell of htmlElement.mergeCells) {
                                for (let i = 0; i < otherColspan; i++) {
                                    if (judgeCellIn(Number(tdIndex + i) + '-' + rowIndex, mergeCell) !== -1)
                                        colspan--;
                                }
                            }
                        }
                    }
                    if (colspan > 0)
                        html += '<td colspan="' + colspan + '"></td>';
                }
                if (spanobj.rows.length > 1) {
                    for (let rindex of spanobj.rows) {
                        let judgerow = false;
                        if (htmlElement.heightwidth) {
                            if (htmlElement.heightwidth.height) {
                                for (let ht of htmlElement.heightwidth.height) {
                                    if (rindex == ht.row) {
                                        defaultdivhgt += ht.height + ';';
                                        judgerow = true;
                                    }
                                }
                            }
                        }
                        if (!judgerow)
                            defaultdivhgt += '18px;';
                    }
                }
                defaultdivhgt = !!defaultdivhgt ? defaultdivhgt : trheight;
                defaultdivhgt = sumpx(defaultdivhgt, ';');
                tdIndex = (spanobj.cols == 0 ? 1 : spanobj.cols) + spanobj.col;
                //区分border,fill和其他样式
                let eleClass = [],
                    tdClass = [];
                if (item.class.length > 0) {
                    item.class = item.class.filter((element, index, self) => {
                        return self.indexOf(element) === index
                    }); //需要修改
                    for (let ecls of item.class) {
                        if (ecls.indexOf('border') >= 0 || ecls.indexOf('fill') >= 0)
                            tdClass.push(ecls);
                        else
                            eleClass.push(ecls);
                    }
                }
                html += '<td';
                if (tdClass.length > 0) {
                    tdClass = tdClass.filter((element, index, self) => {
                        return self.indexOf(element) === index
                    }); //需要修改
                    html += ' class="' + tdClass.join(" ") + '"';
                }
                html += ' name="' + item.realLocation + '" location="' + item.location + '"';
                if (spanobj.span)
                    html += ' ' + spanobj.span;
                if (item.isStr)
                    html += ' isstr="true"';
                if (item.fun)
                    html += ' fun="' + item.fun + '"';
                if (item.format)
                    html += ' format="' + item.format.replace(/"/g, '`') + '"';
                if (item.rotation)
                    html += ' rotation="' + item.rotation + '"';
                html += '><div class="' + config.radomStr + '_td_item_all';
                if (eleClass.length >= 0) {
                    tdClass = eleClass.filter((element, index, self) => {
                        return self.indexOf(element) === index
                    }); //需要修改
                    html += ' ' + eleClass.join(" ");
                }
                html += '" style="height:' + defaultdivhgt + ';"><div class="item_contain">';
                if (item.content.length > 1) {
                    for (let con of item.content) {
                        let htmlLabel = 'span';
                        html += '<' + htmlLabel;
                        if (con.style) {
                            let className = '';
                            html += ' style="'
                            for (let st in con.style) {
                                if (st == 'className') className = con.style[st];
                                else html += st + ': ' + con.style[st] + ';'
                            }
                            html += '"';
                            if (className)
                                html += ' class="' + className + '"';
                        }
                        html += '>' + formatStr(con.val) + '</' + htmlLabel + '>';
                    }
                } else if (item.content.length > 0)
                    html += formatStr(item.content[0].val);
                html += '</div></div></td>';
            }
            html += '</tr>';
        }
        html += '</tbody></table></div>';
        htmlstrs.push({
            data: html,
            name: htmlElement.name + '.html'
        });
    }
    let style = '<style>';
    for (let sty of styles) {
        style += sty["className"] + '{';
        delete sty.className;
        for (let key in sty)
            style += key + ':' + sty[key] + ';'
        style += '}\n';
    }
    style += '</style>';
    return style + htmlstrs[0].data;
    // return writeHtml(htmlstrs, style, resultName);
}

function writeHtml(htmlstrs, style, resultName) {
    let realName = resultName.substring(0, resultName.indexOf("."));
    //创建目录
    let dirpath = path.join(config.dataPath, realName);
    if (!fs.existsSync(dirpath))
        fs.mkdirSync(dirpath);
    //写入文件
    // let JSObj = getJS();
    // let js = `<script data-main="` + JSObj.data_main + `" src="` + JSObj.src + `"></script>`;
    let resultHtml = '';
    for (let htmlstr of htmlstrs) {
        fs.writeFileSync(path.join(dirpath, htmlstr.name), style + htmlstr.data);
        resultHtml += style + htmlstr.data;
    }
    // //拷贝JS
    // let jspath = path.join(dirpath, 'js');
    // if (!fs.existsSync(jspath))
    // 	fs.mkdirSync(jspath);
    // for (let jo of JSObj.copyJS) {
    // 	fs.createReadStream(path.join(config.publicPath, jo)).pipe(fs.createWriteStream(path.join(dirpath, jo)))
    // }
    return resultHtml;
}

//获取js路径
function getJS() {
    return JSON.parse(fs.readFileSync(config.jsPath));
}

//转换特定字符串(去除空格换行大小于号)
function formatStr(str) {
    return str ? str.toString().replace(/<(?!%)/g, "&lt;").replace(/(?<!%)>/g, "&gt;").replace(/\r\n/g, "<br>").replace(/\s/g, "<span class='space'>&nbsp;</span>") : '';
}

//对单元格位置的一些解析
function locationIndex(location) {
    //span->span字符串,col->列起,cols->跨列多少,rows->所跨行
    let span = '',
        cols = 0,
        col = 0,
        rowss = [];
    if (location.indexOf(":") >= 0) {
        let locations = location.split(':');
        let rows = locations[0].split('-');
        let columns = locations[1].split('-');
        col = Number(rows[0]);
        if (rows[0] != columns[0]) {
            span += ' colspan="' + (Number(columns[0]) - Number(rows[0]) + 1) + '"';
            cols = Number(columns[0]) - Number(rows[0]) + 1;
        }
        if (rows[1] != columns[1]) {
            span += ' rowspan="' + (Number(columns[1]) - Number(rows[1]) + 1) + '"';
            for (let r = Number(rows[1]); r <= Number(columns[1]); r++)
                rowss.push(r);
        } else
            rowss.push(Number(rows[1]))
    } else {
        let locations = location.split('-');
        cols = 0;
        col = Number(locations[0]);
        rowss.push(Number(locations[1]));
    }
    return {
        span: span,
        rows: rowss,
        cols: cols,
        col: col
    };
}

//字符串里的高度相加
function sumpx(lengthstr, splitstr) {
    if (!lengthstr) return 0;
    if (lengthstr.indexOf(splitstr) >= 0) {
        let splits = lengthstr.split(splitstr);
        let sum = 0;
        for (let sp of splits) {
            if (sp) {
                sp = sp.replace('px', '');
                sum += Number(sp);
            }
        }
        return sum + 'px';
    } else
        return lengthstr;
}

//将解析的配置转为HTML
function json2html(htmls, styles, resultName) {
    let areas = htmls.area.split(":");
    let tems = areas[0].split("-");
    let tem1s = areas[1].split("-");
    let colgrid = Number(tem1s[0]) - Number(tems[0]) + 1;
    let rowgrid = Number(tem1s[1]) - Number(tems[1]) + 1;
    let defaultHeight = '18px',
        defaultWidth = '70px';
    let html = '<div class="container" style="display: grid;';
    let gridColumn = 'repeat(' + colgrid + ',' + defaultWidth + ');';
    let gridRow = 'repeat(' + rowgrid + ',' + defaultHeight + ');';
    if (htmls.heightwidth) {
        if (htmls.heightwidth.width) {
            gridColumn = '';
            for (var i = 1; i <= colgrid; i++) {
                let colboolen = false;
                for (var wid of htmls.heightwidth.width) {
                    if (i == wid.col - Number(tems[0]) + 1) {
                        gridColumn += wid.width + ' ';
                        colboolen = true;
                        break;
                    }
                }
                if (!colboolen)
                    gridColumn += defaultWidth + ' ';
            }
        }
        if (htmls.heightwidth.height) {
            gridRow = '';
            for (var i = 1; i <= rowgrid; i++) {
                let rowboolen = false;
                for (var hei of htmls.heightwidth.height) {
                    if (i == hei.row - Number(tems[1]) + 1) {
                        gridRow += hei.height + ' ';
                        rowboolen = true;
                        break;
                    }
                }
                if (!rowboolen)
                    gridRow += defaultHeight + ' ';
            }
        }
    }
    html += 'grid-template-columns:' + gridColumn + ';grid-template-rows:' + gridRow + '">';
    for (let item of htmls.data) {
        html += '<div name="' + item.realLocation + '" location="' + item.location + '" class="item';
        if (item.class.length > 0) {
            html += ' ' + item.class.join(' ') + '"'
        } else
            html += '"';
        /*let whauto = '';
        if (item.location.indexOf(":") >= 0)
        	whauto = 'width:auto;height:auto;';*/
        let area = location2grid(item.location, Number(tems[0]), Number(tems[1])); //要考虑初始点(列行)
        if (area)
            html += ' style="' + area + '"';
        if (item.fun)
            html += ' fun="' + item.fun + '"';
        if (item.format)
            html += ' format="' + item.format + '"';
        html += '>';
        if (item.content.length > 1) {
            for (let con of item.content) {
                html += '<span';
                if (con.style) {
                    html += ' style="'
                    for (let st in con.style)
                        html += st + ': ' + con.style[st] + ';'
                    html += '"';
                }
                html += '>' + con.val + '</span>';
            }
        } else if (item.content.length > 0)
            html += item.content[0].val;
        html += '</div>';
    }
    html += '</div>';
    let style = '<style>';
    for (let sty of styles) {
        style += sty["className"] == '*' ? ('*' + '{') : ('.' + sty["className"] + '{');
        delete sty.className;
        for (let key in sty)
            style += key + ':' + sty[key] + ';'
        style += '}\n';
    }
    style += '</style>';
    fs.writeFileSync(resultName, style + html);
    console.log(true);
}

//区域转grid位置(合并单元格区域)
function location2grid(location, column, row) {
    if (location.indexOf(":") >= 0) {
        let locations = location.split(":");
        let rows = locations[1].split('-');
        let cols = locations[0].split('-');
        let column1 = Number(cols[0]) - column + 1,
            column2 = Number(rows[0]) + 1 - column + 1;
        let row1 = Number(cols[1]) - row + 1,
            row2 = Number(rows[1]) + 1 - row + 1;
        let str = "grid-column:" + column1 + ' / ' + column2 + ';' + "grid-row:" + row1 + ' / ' + row2 + ';';
        return str;
    } else {
        let locations = location.split('-');
        let column1 = Number(locations[0]) - column + 1,
            column2 = Number(locations[0]) + 1 - column + 1;
        let row1 = Number(locations[1]) - row + 1,
            row2 = Number(locations[1]) + 1 - row + 1;
        let str = "grid-column:" + column1 + ' / ' + column2 + ';' + "grid-row:" + row1 + ' / ' + row2 + ';';
        return str;
    }
}

//删除路径(文件夹或者文件)
function deletePath(dirpath, isdir) {
    if (fs.existsSync(dirpath)) {
        if (isdir || fs.statSync(dirpath).isDirectory()) {
            let files = fs.readdirSync(dirpath);
            files.forEach(file => {
                let curPath = path.join(dirpath, file);
                if (fs.statSync(curPath).isDirectory())
                    deletePath(curPath, true);
                else
                    fs.unlinkSync(curPath);
            })
        } else
            fs.unlinkSync(dirpath);
        fs.rmdirSync(dirpath);
    }
}

function excel2html() {
    let files = fs.readdirSync(config.excelPath);
    let fileName = '';
    for (let file of files) {
        if (file.indexOf(".xlsx") >= 0)
            fileName = file;
    }
    if (!fileName) return console.log("没有文件");
    let resStream = unzip.Extract({
        path: config.dataPath + fileName
    });
    fs.createReadStream(config.excelPath + fileName).pipe(resStream);
    resStream.on('close', (chunk) => {
        getFiles(config.dataPath + fileName, fileName)
            .then(o => {
                deletePath(config.dataPath + fileName);
                console.log(true);
            }).catch(err => console.log(err))
    })
}

function reviseByPath(filePath) {
    let fileName = path.basename(filePath);
    if (!fileName.match(/.*xlsx$/i)) return Promise.reject("文件格式不正确");
    return new Promise((resolve, reject) => {
        let resStream = unzip.Extract({
            path: config.dataPath + fileName
        });
        fs.createReadStream(filePath).pipe(resStream);
        resStream.on('close', (chunk) => {
            return getFiles(config.dataPath + fileName, fileName)
                .then(o => {
                    deletePath(config.dataPath + fileName);
                    return resolve(o);
                    // console.log(true);
                }).catch(err => {
                    return reject(err)
                })
        })
    })
}

function excute(fileName) {
    if (fileName) return reviseByPath(fileName);
    else {
        let files = require("../render/utils").openFileDialog(["xlsx"]);
        return reviseByPath(files[0])
    }
}

// module.exports = {
// 	getFiles: getFiles,
// 	deletePath: deletePath,
// 	excel2html: excel2html,
// 	reviseByPath: reviseByPath
// }

//jdi.importExcel().then(o=>console.log(o)).catch(err=>console.log(err))
module.exports = excute;