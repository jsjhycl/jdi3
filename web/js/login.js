function init() {
    $("#userName").focus();
    $(".alert").delay(2666).slideUp();
}

function login() {
    $(document).keydown(function (event) {
        if (event.keyCode === 13) {
            $("#loginForm").submit();
        }
    });
}

$(function () {
    init();
    login();
});