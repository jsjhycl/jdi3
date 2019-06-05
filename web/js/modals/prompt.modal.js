function PromptModal(question, callBack) {
    this.question = question || '问题';
    this.callBack = callBack;
    
}

PromptModal.prototype = {

    init: function() {
        this.render();
        this.bindEvents();
    },
    
    remove: function _remove() {
        $('#workspace #prompt').remove();
    },

    render: function _render() {
        var str = '<section id="prompt">'+
        '<div class="noMask-modal">'+
        '<header class="modal-header">'+
        '<button class="close">&times;</button>'+
        '<h4 class="modal-title">请输入</h4>'+
        '</header>'+
        '<section class="modal-body">'+
        '<form class="form-horizontal">'+
        '<div class="form-group">'+
        '<label for="answer" class="col-sm-4 control-label">'+this.question+'</label>'+
        '<div class="col-sm-8">'+
        '<input type="text" class="form-control" id="answer">'+
        '</div>'+
        '</div>'+
        '</form>'+
        '</section>'+
        '<footer class="modal-footer">'+
        '<button class="btn btn-primary save">确定</button>'+
        '<button class="btn btn-danger clear">取消</button>'+
        '</footer>'+
        '</div>'+
        '</section>';
    
        this.remove();
        $('#workspace').append(str);
    },

    bindEvents: function bindEvents() {
        var that = this;
        $("#prompt").on('click', '.save', function() {
            that.callBack && that.callBack($('#prompt #answer').val());
            that.remove();
        });
    
    
        $("#prompt").on('click', '.clear, .close', function() {
            that.remove();
        });
        
    },
}






