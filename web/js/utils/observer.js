let Observer = (function() {

    let $element = $("#workspace"),
        _history = [];
        timer = null;
        interval = 1000 * 1;
        NAME_SPACE = '.observer';

    function _reset() {
        _history = [];
        timer = null;
        $(document).off(this.NAME_SPACE);
    }

    function picture(html, globalProperty) {
        html = html || $element.html();
        globalProperty = globalProperty || JSON.stringify(GLOBAL_PROPERTY);

        // 上限 20 个
        _history.length >= 20 && _history.shift();
        _history.push({
            html,
            globalProperty,
            time: new Date().toFormatString()
        })
    }

    function _setInterval() {
        timer = setInterval(function() {
            let _html = $element.html(),
                _globalProperty = JSON.stringify(GLOBAL_PROPERTY),
                { html = '', globalProperty = '' } = _history[_history.length - 1] || {};
            (_html != html || _globalProperty != globalProperty) && picture(_html, _globalProperty)
            // console.log(_history);
        }, interval);
    }

    function bindEvents() {
        $(document).on('keydown' + this.NAME_SPACE, function(event) {
            
            if (event.ctrlKey && event.keyCode === 90) {
                let lastHistory = _history[_history.length - 1] || {};
                (lastHistory.html === $element.html() && lastHistory.globalProperty === JSON.stringify(GLOBAL_PROPERTY) && _history.length > 1) && (lastHistory = _history.pop());
                lastHistory = _history.pop() || {};
                if (!lastHistory.time) return;

                clearInterval(timer);
                let result = confirm(`确定要回退到 ${lastHistory.time} 时的编辑内容？`);
                if (result) {
                    
                    GLOBAL_PROPERTY = JSON.parse(lastHistory.globalProperty);
                    $element.html(lastHistory.html);
                    $("[id^=property_]").val("");
                    new Property().load($(".focus"));
                }
                _setInterval();
            }
        })
    }

    return {
        observe: function() {
            _reset();
            picture();
            _setInterval();
            bindEvents();
        }
    }
})()