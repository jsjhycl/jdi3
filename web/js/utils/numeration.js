var Numeration = (function () {
    function nameToId(name) {
        if (!name) {
            return -1;
        }
        var id = 0,
            len = name.length,
            b = "A".charCodeAt(0);
        for (var i = len - 1; i >= 0; i--) {
            var v = name.charAt(i).charCodeAt(0) - b;
            id += v * Math.pow(26, len - i - 1);
        }
        return id;
    }

    function idToName(id, len) {
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
    }

    function getMaxId() {
        var arrs = [],
            $nodes = $("#workspace .workspace-node,#workspace .workspace-node :input");
        $nodes.each(function () {
            var id = this.id;
            if (id.length !== 4) {
                return true;
            }
            arrs.push(nameToId(id));
        });
        return maxId = arrs.max() || 0;
    }

    
    /**
     * 
     * @param {String} type 
     * 控件类型：img，div，input(默认)
     */
    function getNewId(type) {
        var maxId = "",
            preFix = "",
            search = ""

        switch(type) {
            case 'img':
                preFix = 'IMG_'
                search = '#workspace [data-type="img"]';
                break;
            case 'div':
                preFix = 'DIV_'
                search = '#workspace [data-type="div"]';
                break;
            default:
                search = '#workspace :input'
        }
        $(search).each(function() {
            maxId = $(this).attr('id') > maxId ? $(this).attr('id') : maxId;
        })
        if (!maxId) return preFix + 'AAAA';
        else {
            maxId = maxId.replace(preFix, "");
            var b = "A".charCodeAt(0),
                id = 0,
                name = "",
                len = 4;
            for (var i = len - 1; i >= 0; i--) {
                var v1 = maxId.charAt(i).charCodeAt(0) - b;
                id += v1 * Math.pow(26, len - i - 1);
            }
            id += 1;
            len = 4;
            for (var j = 0; j < len; j++) {
                var v2 = id / Math.floor(Math.pow(26, len - j - 1));
                id = id % Math.pow(26, len - j - 1);
                name += String.fromCharCode(b + v2);
            }
            return preFix + name;
        }
    }

    return {
        nameToId: nameToId,
        idToName: idToName,
        getMaxId: getMaxId,
        getNewId: getNewId,
        getId: getId
    };
})();