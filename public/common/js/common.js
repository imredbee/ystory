$(document).ready(function () {
    $(".popup_list > li > a ").on("click", function (e) {
        e.preventDefault();
        var curIdx = $(this).parent().index();

        if ($(this).hasClass("popped")) {
            $(".dimm").removeClass("dimmed");
            $(".popuplayer_list > div").removeClass("popped");
        } else {
            $(".dimm").addClass("dimmed");
            $(".popuplayer_list > div").eq(curIdx).addClass("popped");
        }
    });

    $(".gray_span_btn").on("click", function (e) {
        e.preventDefault();
        $(".descwrap").toggleClass("spanned");
    });
});
