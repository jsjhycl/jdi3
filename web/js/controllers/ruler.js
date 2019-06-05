function Ruler() {
    this.$ruler = $("#ruler");
}
Ruler.prototype = {
    //绘制坐标r
    drawCoordinates: function () {
        var $ruler = $("#ruler"),
            $rulerbox = $("#rulerbox");
            if (!$rulerbox.length) {
                $('<div class="rulerbox" id="rulerbox" style="display:none"><div id="ruler_horizontal" class="ruler_horizontal"></div><div id="ruler_vertical" class="ruler_vertical"></div>').appendTo($ruler)
            }
        var $ruler_width = $ruler.children("#workspace").width(),
            $ruler_height = $ruler.children("#workspace").height(),
            rh = $('#ruler_horizontal'),
            rv = $("#ruler_vertical");
        rh.html("");
        rv.html("");
        $ruler.css('width', $ruler_width)
        $ruler.css('height', $ruler_height)
        for (var i = 0; i < $ruler_width; i += 1) {
            if (i % 50 === 0) {
                $('<span class="n">' + i + '</span>').css("left", i + 2).appendTo(rh)
            }
        }
        for (var i = 0; i < $ruler_height; i += 1) {
            if (i % 50 === 0) {
                $('<span class="n">' + i + '</span>').css("top", i + 2).appendTo(rv)
            }
        }
    },
    //显示隐藏坐标
    controlCoordinates: function (params) {
        var $rulerbox = $("#rulerbox")
        if (params) {
            $rulerbox.css('display', 'none')
        } else {
            $rulerbox.css('display', 'block')
        }
    }
}