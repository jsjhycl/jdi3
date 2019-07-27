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
                that.JS_PATH + "/helpers/numberHelper.js",
                that.JS_PATH + "/helpers/domHelper.js",
                that.JS_PATH + "/helpers/conditionsHelper.js",
                that.JS_PATH + "/helpers/tableHelper.js",
                that.JS_PATH + "/helpers/modalHelper.js",
                that.LIB_PATH + "/jresizable/jresizable.js",
                that.LIB_PATH + "/jcontextmenu/jcontextmenu.js",
                that.LIB_PATH + "/jpagination/jpagination.js",
                that.LIB_PATH + "/jdi-exprGenerator/jdi-exprGenerator.js",
                that.LIB_PATH + "/jdi-propModifier/jdi-propModifier.js",
                that.LIB_PATH + "/jdi-propModifier/jdi-propModifier2.js",
                that.LIB_PATH + "/jdi-propModifier/jdi-propModifier3.js",
                that.LIB_PATH + "/jdi-conditions/jdi-conditions.js",
                that.LIB_PATH + "/jdi-dbQuerier/jdi-dbQuerier.js",
                that.LIB_PATH + "/jdi-dbDesigner/jdi-dbDesigner.js",
                that.LIB_PATH + "/jdi-numViewer/jdi-numViewer.js",
                that.LIB_PATH + "/datetimepicker/jquery.datetimepicker.js",
                that.JS_PATH + "/services/common.service.js",
                that.JS_PATH + "/services/structure.service.js",
                that.JS_PATH + "/services/resource.service.js",
                that.JS_PATH + "/services/product.service.js",
                that.JS_PATH + "/controllers/accessControl.js",
                that.JS_PATH + "/controllers/db.js",
                that.JS_PATH + "/controllers/main.js",
                that.JS_PATH + "/controllers/filter.js",
                that.JS_PATH + "/controllers/workspace.js",
                that.JS_PATH + "/controllers/property.js",
                that.JS_PATH + "/controllers/control.js",
                that.JS_PATH + "/controllers/toolbar.js",
                that.JS_PATH + "/controllers/propertybar.js",
                that.JS_PATH + "/controllers/contextMenu.js",
                that.JS_PATH + "/controllers/shortcut.js",
                that.JS_PATH + "/controllers/ruler.js",//标尺
                that.JS_PATH + "/controllers/keyEvent.js",//标尺
                that.JS_PATH + "/modals/base.modal.js",
                that.JS_PATH + "/modals/resource.modal.js",
                that.JS_PATH + "/modals/saveAs.modal.js",//
                that.JS_PATH + "/modals/product.modal.js",
                that.JS_PATH + "/modals/dbDefine.modal.js",
                that.JS_PATH + "/modals/publish.modal.js",
                that.JS_PATH + "/modals/workspace.modal.js",
                that.JS_PATH + "/modals/page.modal.js",
                that.JS_PATH + "/modals/dbDesigner.modal.js",
                that.JS_PATH + "/modals/record.modal.js",
                that.JS_PATH + "/modals/submit.modal.js",
                that.JS_PATH + "/modals/dataSource.modal.js",
                that.JS_PATH + "/modals/prompt.modal.js",
                that.JS_PATH + "/modals/events.modal.js",
                that.JS_PATH + "/modals/query.modal.js",
                that.JS_PATH + "/modals/archivePath.modal.js",
                that.JS_PATH + "/modals/conditions.modal.js",
                that.JS_PATH + "/modals/setDbDesigner.modal.js",
                that.JS_PATH + "/modals/copyValue.modal.js",
                that.JS_PATH + "/modals/copySend.modal.js",
                that.JS_PATH + "/modals/insertFunction.modal.js",
                that.JS_PATH + "/modals/insertFunctionArgs.modal.js",
                that.JS_PATH + "/modals/createResource.modal.js",
                that.JS_PATH + "/modals/createTemplate.modal.js",
                that.JS_PATH + "/modals/openTemplate.modal.js",
                that.JS_PATH + "/modals/openResurce.modal.js",
                that.JS_PATH + "/modals/newEvents.modal.js", 
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