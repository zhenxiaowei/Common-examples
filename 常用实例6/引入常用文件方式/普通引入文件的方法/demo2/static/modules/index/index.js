$(".right .menu .title i.iconHide").off("click").on("click", function () {
    $(".right .menu").css("width", "0%");
    $(".right .work").css("width", "100%");
    $(".leftsidebar_box dt").css("position", "inherit")
});
$(".content .left li").off("click").on("click", function () {
    $(".right .menu").css("width", "15%");
    $(".right .work").css("width", "85%");
    $(".leftsidebar_box dt").css("position", "relative")
});


$(".leftsidebar_box dt").click(function () {
    $(".leftsidebar_box dt").css({"background-color": "#3992d0"});
    $(this).css({"background-color": "#317eb4"});
    $(this).parent().find('dd').removeClass("menu_chioce");
    $(".leftsidebar_box dt img").attr("src", "static/modules/index/images/off.png");
    $(this).parent().find('img').attr("src", "static/modules/index/images/on.png");
    $(".menu_chioce").slideUp();
    $(this).parent().find('dd').slideToggle();
    $(this).parent().find('dd').addClass("menu_chioce");
});
$(".leftsidebar_box dd").click(function () {
    alert(1)
})