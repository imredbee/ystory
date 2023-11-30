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

    // 공통 탭
    $(".tabmenu .tab_list > li").first().addClass("active");
    $(".tabmenu .tabview_list").children().first().addClass("active");
    $(".tabmenu .tab_list > li > a").on("click", function (e) {
        e.preventDefault();
        var Idx = $(this).parents("li").index();

        $(".tabmenu .tab_list > li").removeClass("active");
        $(this).parent().addClass("active");
        $(".tabmenu .tabview_list").children().removeClass("active");
        $(".tabmenu .tabview_list").children().eq(Idx).addClass("active");
    });

    // edu_tabpage tab_list 동작
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

    // .sticky_rsz 항목 높이값
    function hdrRsz() {
        var hdrHeight = $("header").innerHeight();
        $(".sticky_rsz").css("top", hdrHeight);
    }
    hdrRsz();
    $(window).resize(function () {
        hdrRsz();
    });
});
