/**
 * 标尺模块
 */
function Ruler() {
    this.$ruler = $("#ruler");//获取ruler元素并赋值 
}
Ruler.prototype = {
    //绘制坐标r
    drawCoordinates: function () {
        var $ruler = $("#ruler"),//获取标尺元素
            $rulerbox = $("#rulerbox");//获取标尺的盒子元素
            if (!$rulerbox.length) {//没有获取到元素生成html
                $('<div class="rulerbox" id="rulerbox" style="display:none"><div id="ruler_horizontal" class="ruler_horizontal"></div><div id="ruler_vertical" class="ruler_vertical"></div>').appendTo($ruler)
            }
        var $ruler_width = $ruler.children("#workspace").width(),//获取工作区的宽度赋值
            $ruler_height = $ruler.children("#workspace").height(),//获取工作区的高度赋值
            rh = $('#ruler_horizontal'),//获取水平标尺
            rv = $("#ruler_vertical");//获取垂直标尺
        rh.html("");//给水平标尺中的html元素设置为空
        rv.html("");//给垂直水平标尺中的元素设置为空
        $ruler.css('width', $ruler_width)//给标尺设置宽度
        $ruler.css('height', $ruler_height)//给表次设置高度
        for (var i = 0; i < $ruler_width; i += 1) {//遍历小于标尺宽度的所有元素
            if (i % 50 === 0) {//如果这个数能被五十整除
                $('<span class="n">' + i + '</span>').css("left", i + 2).appendTo(rh)//把生成的html添加到水平标尺中
            }
        }
        for (var i = 0; i < $ruler_height; i += 1) {//遍历小于标尺高度的所欲数
            if (i % 50 === 0) {//如果这个数能被五十整除
                $('<span class="n">' + i + '</span>').css("top", i + 2).appendTo(rv)//把生成的html添加到水平标尺中
            }
        }
    },
    //显示隐藏坐标
    controlCoordinates: function (params) {
        var $rulerbox = $("#rulerbox")//获取标尺元素
        if (params) {//如果params为真设置标尺隐藏
            $rulerbox.css('display', 'none')
        } else {//否则标尺显示
            $rulerbox.css('display', 'block')
        }
    }
}