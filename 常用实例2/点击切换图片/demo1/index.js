$(function () {
    $(".swiper-slide,p,img,.hover").mouseover(function(e){
        e.preventDefault();
    });

    $(".swiper-slide").mouseover(function () {
        $(this).find(".swiper-slide .initial").addClass("move").removeClass("donw");
        $(this).find(".initial img").attr("src", "2.png");
    }).mouseout(function () {
        $(this).find(".swiper-slide .initial").removeClass("move").addClass("donw");
        $(this).find(".initial img").attr("src", "1.png");
    });

    $(".swiper-slide").mouseover(function () {
        $(this).find(".p").addClass("p1_up").removeClass("p1_down");
    }).mouseout(function () {
        $(this).find(".p").removeClass("p1_up").addClass("p1_down");
    });
    $(".swiper-slide").mouseover(function () {
        $(this).find(".p1").addClass("p2_up").removeClass("p2_down");
    }).mouseout(function () {
        $(this).find(".p1").removeClass("p2_up").addClass("p2_down");
    });
    $(".swiper-slide").mouseover(function () {
        $(this).find(".hover").addClass("hover_up").removeClass("hover_down");
    }).mouseout(function () {
        $(this).find(".hover").removeClass("hover_up").addClass("hover_down");
    })
});