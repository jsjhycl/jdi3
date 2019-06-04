function Ruler() {
    var $ruler = $("#ruler");
    $('<div class="rulerbox" id="rulerbox" ><div id="ruler_horizontal" class="ruler_horizontal"></div><div id="ruler_vertical" class="ruler_vertical"></div>').appendTo($ruler)
}
Ruler.prototype = {
    drawCoordinates: function () {
        var $ruler = $("#ruler"),
            $ruler_width = $ruler.children("#workspace").width(),
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
    }
}