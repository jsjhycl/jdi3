function ArrayToTree() {
    this._buildData = function (datas) {
        if (!Array.isArray(datas)) return;
        let result = [];
        datas.forEach((data, index) => {
            let values = Object.values(data).slice(0, -4);
            values = _.chunk(values, 2)
            let arr = [];
            values.forEach((item, cindex) => {
                if (item.every(function (citem) {
                        return !!citem
                    })) {
                    arr.push({
                        name: item[0],
                        value: item[1]
                    })
                }

            })
            result.push(arr)
        })
        return result;
    }
    this._arrayToTree = function (arrs) {
        var result = [],
            currentObj = null;;
        for (var item of arrs) {
            // console.log(item)
            for (var i = 0; i < item.length; i++) {
                if (!item[i]) continue;
                if (i == 0) {
                    currentObj = result.find(m => JSON.stringify(m.text) == JSON.stringify(item[i]))
                    // console.log("currentObj", currentObj, item[i])
                    if (!currentObj) {
                        currentObj = {
                            text: item[i],
                            nodes: []
                        };
                        result.push(currentObj);
                    }
                } else {
                    var currentChild = currentObj.nodes.find(m => JSON.stringify(m.text) == JSON.stringify(item[i]));
                    // console.log("大于1", i, currentObj, currentChild, item[i])
                    if (!currentChild) {
                        currentChild = {
                            text: item[i],
                            nodes: []
                        }
                        currentObj.nodes.push(currentChild);
                    }
                    currentObj = currentChild;
                }
            }
        }
        return result;
    }
}
ArrayToTree.prototype = {
    getTreeData: async function () {
        var datas = await new FileService().readFile("./profiles/category1.json"),
            buildData = this._buildData(datas),
            treeData = this._arrayToTree(buildData);
        // console.log("原始数据", datas)
        // console.log("一级处理数据", buildData)
        // console.log("树形结构数据", treeData)
        return treeData;
    },
    getFirstData: function (treeData) {
        if (!Array.isArray(treeData)) return [];
        var result = [];
        treeData.forEach(item => {
            result.push({
                name: item.text.name,
                value: item.text.value
            })
        })
        return result;
    },
    getSearchData: function (searchValues, treeData) {
        if (!Array.isArray(treeData) && !Array.isArray(searchValues)) return [];
        let result = [],
            searchLength = searchValues.length,
            tempData = $.extend([], treeData);
        for (var i = 0; i < searchLength; i++) {
            for (var j = 0; j < tempData.length; j++) {
                if (tempData[j].text.value == searchValues[i]) {
                    result = tempData[j].nodes;
                    tempData = tempData[j].nodes;
                    break;
                }
            }
        }
        return this.getFirstData(result);
    }


}