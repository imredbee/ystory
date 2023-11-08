$(document).ready(function () {
    // 팝업
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
    // 상세페이지 창 스팬
    $(".gray_span_btn").on("click", function (e) {
        e.preventDefault();
        $(".descwrap").toggleClass("spanned");
    });

    // tab_list 동작 및 높이값 조정
    $(".swiperTab .tab_list > li").first().addClass("active");
    $(".tabview_list > ul").first().addClass("active");
    $(".swiperTab .tab_list > li > a").on("click", function (e) {
        e.preventDefault();
        var Idx = $(this).parents("li").index();

        $(".swiperTab .tab_list > li").removeClass("active");
        $(this).parent().addClass("active");
        $(".tabview_list > ul").removeClass("active");
        $(".tabview_list > ul").eq(Idx).addClass("active");
    });

    function hdrRsz() {
        var hdrHeight = $("header").innerHeight();
        $(".swiperTab").css("top", hdrHeight + 9);
    }
    hdrRsz();
    $(window).resize(function () {
        hdrRsz();
    });
});
