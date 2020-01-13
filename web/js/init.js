function Loader() {
    this.LIB_PATH = "../lib";
    this.JS_PATH = "../js";

    this.recurseLoadScript = function (scripts) {
        var that = this,
            item = scripts.shift();
        if (item) {
            var script = document.createElement("script");
            script.src = item;
            script.onload = script.onreadystatechange = function () {
                if (!this.readyState || this.readyState === "loaded" || this.readyState === "complete") {
                    script.onload = script.onreadystatechange = null;
                    that.recurseLoadScript(scripts);
                }
            };
            document.body.appendChild(script);
        }
    };
}


Loader.prototype = {
    loadStyle: function () {
        var styles = [];
        for (var i = 0; i < styles.length; i++) {
            var link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = styles[i];
            document.head.appendChild(link);
        }
    },
    loadScript: function () {
        var that = this,
            scripts = [
                that.JS_PATH + "/utils/extension.js",
                that.JS_PATH + "/utils/dataType.js",
                that.JS_PATH + "/utils/cajax.js",
                that.JS_PATH + "/utils/common.js",
                that.JS_PATH + "/utils/clipboard.js",
                that.JS_PATH + "/utils/observer.js",
                that.JS_PATH + "/utils/buildTableJson.js",
                that.JS_PATH + "/utils/qr.js",
                that.JS_PATH + "/utils/arrayToTree.js",
                that.JS_PATH + "/helpers/numberHelper.js",
                that.JS_PATH + "/helpers/domHelper.js",
                that.JS_PATH + "/helpers/conditionsHelper.js",
                that.JS_PATH + "/helpers/tableHelper.js",
                that.JS_PATH + "/helpers/modalHelper.js",
                that.JS_PATH + "/helpers/PropertyWatch.js",
                that.LIB_PATH + "/jresizable/jresizable.js",
                that.LIB_PATH + "/jcontextmenu/jcontextmenu.js",
                that.LIB_PATH + "/jpagination/jpagination.js",
                that.LIB_PATH + "/lodash/lodash.js",
                that.LIB_PATH + "/orgChart/html2canvas.js", //zww
                that.LIB_PATH + "/orgChart/jquery.orgchart.js", //zww
                that.LIB_PATH + "/buildTree/buildTree.js", //zww
                that.LIB_PATH + "/jdi-exprGenerator/jdi-exprGenerator.js",
                that.LIB_PATH + "/jdi-propModifier/jdi-propModifier.js",
                that.LIB_PATH + "/jdi-propModifier/jdi-propModifier2.js",
                that.LIB_PATH + "/jdi-propModifier/jdi-propModifier3.js",
                that.LIB_PATH + "/jdi-conditions/jdi-conditions.js",
                that.LIB_PATH + "/jdi-dbQuerier/jdi-dbQuerier.js",
                that.LIB_PATH + "/jdi-dbQuerier/jdi-dbQuerier2.js",
                that.LIB_PATH + "/jdi-Db/jdi-Db.js",
                that.LIB_PATH + "/jdi-Db/jdi-Db1.js",
                that.LIB_PATH + "/jdi-guide/jdi-guide.js",
                that.LIB_PATH + "/jdi-guide/jdi-EventAndDesc.js",
                that.LIB_PATH + "/jdi-guide/jdi-EventCondition.js",
                that.LIB_PATH + "/jdi-guide/jdi-eventMethods.js",
                that.LIB_PATH + "/jdi-guide/jdi-MethodsDetail.js",
                that.LIB_PATH + "/jdi-dbDesigner/jdi-dbDesigner.js",
                that.LIB_PATH + "/databaseDesigner/databaseDesigner.js",
                that.LIB_PATH + "/ownSaveDesigner/ownSaveDesigner.js",
                that.LIB_PATH + "/jdi-numViewer/jdi-numViewer.js",
                that.LIB_PATH + "/datetimepicker/jquery.datetimepicker.js",
                that.LIB_PATH + "/chosen/chosen.jquery.min.js",
                that.LIB_PATH + "/colResizable/colResizable-1.6.min.js",
                that.LIB_PATH + "/qrcode/qrcode.min.js",
                that.JS_PATH + "/services/common.service.js",
                that.JS_PATH + "/services/structure.service.js",
                that.JS_PATH + "/services/resource.service.js",
                that.JS_PATH + "/services/product.service.js",
                that.JS_PATH + "/services/newService.js",
                that.JS_PATH + "/services/service.js",
                that.JS_PATH + "/services/fileService.js",
                that.JS_PATH + "/controllers/accessControl.js",
                that.JS_PATH + "/controllers/main.js",
                that.JS_PATH + "/controllers/filter.js",
                that.JS_PATH + "/controllers/workspace.js",
                that.JS_PATH + "/controllers/property.js",
                that.JS_PATH + "/controllers/control.js",
                that.JS_PATH + "/controllers/toolbar.js",
                that.JS_PATH + "/controllers/propertybar.js",
                that.JS_PATH + "/controllers/contextMenu.js",
                that.JS_PATH + "/controllers/shortcut.js",
                that.JS_PATH + "/controllers/ruler.js",
                that.JS_PATH + "/controllers/keyEvent.js",
                that.JS_PATH + "/modals/base.modal.js",
                that.JS_PATH + "/modals/saveAs.modal.js",
                that.JS_PATH + "/modals/product.modal.js",
                that.JS_PATH + "/modals/publish.modal.js",
                that.JS_PATH + "/modals/workspace.modal.js",
                that.JS_PATH + "/modals/page.modal.js",
                that.JS_PATH + "/modals/dbDesigner.modal.js",
                that.JS_PATH + "/modals/submit.modal.js",
                that.JS_PATH + "/modals/dataSource.modal.js",
                that.JS_PATH + "/modals/prompt.modal.js",
                that.JS_PATH + "/modals/query.modal.js",
                that.JS_PATH + "/modals/queryNest.modal.js",
                that.JS_PATH + "/modals/dbApply.modal.js",
                that.JS_PATH + "/modals/archivePath.modal.js",
                that.JS_PATH + "/modals/change.tree.modal.js", //zww
                that.JS_PATH + "/modals/archivePathBatch.modal.js",
                that.JS_PATH + "/modals/changeListen.modal.js",
                that.JS_PATH + "/modals/conditions.modal.js",
                that.JS_PATH + "/modals/setDbDesigner.modal.js",
                that.JS_PATH + "/modals/copyValue.modal.js",
                that.JS_PATH + "/modals/insertFunction.modal.js",
                that.JS_PATH + "/modals/insertFunctionArgs.modal.js",
                that.JS_PATH + "/modals/createResource.modal.js",
                that.JS_PATH + "/modals/createTemplate.modal.js",
                that.JS_PATH + "/modals/openTemplate.modal.js",
                that.JS_PATH + "/modals/openResurce.modal.js",
                that.JS_PATH + "/modals/newEvents.modal.js",
                that.JS_PATH + "/modals/newEventsProperty.js",
                that.JS_PATH + "/modals/eventsGuide.js",
                that.JS_PATH + "/modals/openConfig.modal.js",
                that.JS_PATH + "/modals/changeRouter.modal.js",
                that.JS_PATH + "/modals/changeCategory.modal.js",
                that.JS_PATH + "/modals/changeGlobal.modal.js",
                that.JS_PATH + "/modals/deleteDb.modal.js",
                that.JS_PATH + "/index.js"
            ];
        that.recurseLoadScript(scripts);
    }
};

window.onload = function () {
    var loader = new Loader();
    loader.loadStyle();
    loader.loadScript();
};