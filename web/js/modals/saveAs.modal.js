/**
 * 另存为
 */
function SaveAsModal($modal) {
    BaseModal.call(this, $modal, null)
    this.$saveAsName = this.$modalBody.find('[data-key="name"]');
    this.$lastName = this.$modalBody.find('[data-key="lastName"]');
    this.$isFinalName = this.$modalBody.find('[data-key="isFinalName"]');
    this.$workspace = $("#workspce");

    this._clearData = function(){
        this.$saveAsName.val();
        this.$lastName.val();
        this.$isFinalName.attr("checked",false);
    }

}
SaveAsModal.prototype = {
    initData:function(){
        console.log(123)
        var that = this;
        that._clearData();
        var $workspace = $("#workspace"),
        id = $workspace.attr("data-id"),//获取工作区data-id
        name = $workspace.attr("data-name"),//获取工作区data-name
        historyList = new CommonService().getFileSync("/lib/ZZZZZZZ/historyList.json") || {},
        lastId = historyList[id],
        saveName ,lastName,isFinalName;
        if(lastId==99){
            saveName = `${name}_${lastId}`;
            lastName = `${name}_${lastId}`;
            that.$isFinalName.attr("checked",true)
        }else{
            that.$isFinalName.attr("checked",false)
            if(lastId){
                saveName = `${name}_${lastId+1}`;
                lastName = `${name}_${lastId}`;
            }else{
                saveName = `${name}_1`
                lastName = "暂无上次另存的数据"
            }
        }
        that.$saveAsName.val(saveName)
        that.$lastName.val(lastName)

        
    },
    saveData: function () {
        console.log("保存")
        var that = this;
        isFinsh = that.$isFinalName.prop("checked");
        if(isFinsh){
            new Workspace().save(true, false, isFinsh)
        }else{
            new Workspace().save(true,true)
        }
    },
   
    execute: function () {
        var that = this;
        that.basicEvents(true, that.initData, that.saveData, null)
    },
    bindEvents: function () {
        var that = this;
        that.$isFinalName.on("click",function(){
            var flag = that.$isFinalName.prop("checked"),
            $workspace = $("#workspace"),
            id = $workspace.attr("data-id"),//获取工作区data-id
            name = $workspace.attr("data-name"),//获取工作区data-name
            historyList = new CommonService().getFileSync("/lib/ZZZZZZZ/historyList.json") || {},
            lastId = historyList[id];
            if(flag){
                that.$saveAsName.val(name+"_"+99)
            }else{
                lastId?name = name+"_"+(lastId+1):name=name+"_"+1
                that.$saveAsName.val(name)
            }
            
        })
    }
}