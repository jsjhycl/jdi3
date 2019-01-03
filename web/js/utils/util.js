var Util = (function () {
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

    return {
        nameToId: nameToId,
        idToName: idToName,
        getMaxId: getMaxId,
    };
})();