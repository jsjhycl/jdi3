function DbApplyModal($modal) {
    BaseModal.call(this, $modal, null)
    this.NAME_SPACE = '.dbApply'

    this.$dbApply = this.$modalBody.find("#dbApply")

    this.$IPArea = this.$modalBody.find('[data-type="IPArea"]')
    this.$dbName = this.$modalBody.find('[data-type="dbName"]')
    this.$tableName = this.$modalBody.find('[data-type="tableName"]')
    this.$tableDesc = this.$modalBody.find('[data-type="description"]')
    this.$port = this.$modalBody.find('[data-type="port"]')
    this.$userName = this.$modalBody.find('[data-type="userName"]')
    this.$password = this.$modalBody.find('[data-type="passWord"]')
    this.$dbType = this.$modalBody.find('[data-type="dbType"]')


    this.$queryDb = this.$modalBody.find('.queryDb')
    this.clearData = function () {
        this.$IPArea.val()
        this.$dbName.val()
        this.$tableName.val()
        this.$port.val()
        this.$userName.val()
        this.$password.val()
        this.$dbType.val()
        this.$dbApply.empty()
    }

    this.dataArr = ["id", "type", "maxLength", "cname", "mapId"]

}
DbApplyModal.prototype = {
    initData: function () {
        this.clearData()
    },
    renderTable: function (data) {
        var that = this;
        var $html = ``
        if (!Array.isArray(data)) return alert("查询数据不对")
        data.forEach(dataTr => {
            $html += `${that.renderTr(dataTr)}`
        })
        return `${$html}`;
    },
    renderTr: function (dataTr) {
        $tr = "<tr>"
        Object.keys(dataTr).forEach(key => {
            $tr += `<td><input class="form-control" ${key =="cname"|| key == "id" ? "" : 'disabled="disabled"' } type="text" data-save="${key}" value="${dataTr[key]}"></td>`
        })
        return `${$tr}</tr>`;

    },
    transformData: function (data) {
        if (!Array.isArray(data)) return "";
        console.log(data)
        data.forEach((item, index) => {
            item["cname"] = ""
            item["name"] = NumberHelper.idToName(index, 4)
        })
        return data
    },
    saveData: function () {
        var that = this;
        var arr = [];
        that.$dbApply.find("tr").each(function () {
            var obj = {}
            $(this).find("input").each(function () {
                var type = $(this).attr('data-save')
                obj[type] = $(this).val()
            })
            arr.push(obj)
        })
        var database = that.$dbName.val(),
            table = that.$tableName.val(),
            description = that.$tableDesc.val(),
            ip = that.$IPArea.val(),
            port = that.$port.val(),
            userName = that.$userName.val(),
            password = that.$password.val(),
            dbtype = that.$dbType.val();
        if (!database || !table || !description || !ip || !port || !userName || !password || !dbtype) {
            return alert("请填写完整的数据")
        }

        var postData = {
            database: database,
            table: table,
            description: description,
            onlyRegiste: true,
            dbInfo: {
                ip: ip,
                port: port,
                userName: userName,
                password: password,
                dbtype: dbtype
            },
            columns: arr
        }
        console.log(arr)

        new Service().createTable(postData).then(res => {
            console.log(res)
        })

    },
    execute: function () {
        var that = this;
        that.basicEvents(null, that.initData, that.saveData, null); //绑定基础事件
    },
    bindEvents: function () {
        var that = this;
        that.$queryDb.on("click" + that.NAME_SPACE, function () {
            event.preventDefault()
            var IPArea = that.$IPArea.val(),
                dbName = that.$dbName.val(),
                tableName = that.$tableName.val(),
                port = that.$port.val(),
                userName = that.$userName.val(),
                password = that.$password.val(),
                dbType = that.$dbType.val();
            // 172.18.184.9 KAOQIN CHECKINOUT sa Cepg2016 sqlserver
            if (!IPArea || !dbName || !tableName || !port || !userName || !password || !dbType) return alert("请填写完整的数据");
            let postData = {
                type: dbType,
                option: {
                    user: userName,
                    password: password,
                    server: IPArea,
                    database: dbName,
                    table: tableName,
                    port: Number(port)
                }
            }
            new Service().getRemoteTable(postData).then(res => {
                if (res.status === 0) {

                    var data = that.transformData(res.result),
                        html = that.renderTable(data);
                    that.$dbApply.empty().append(html)
                } else {
                    alert(res.result)
                }
            })
        })
    }
}