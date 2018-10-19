/*$(function () {
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
});*/

$(function () {
    function hover(ele,ele1,ele2){
        $(".swiper-slide").hover(function () {
            $(this).find(ele).addClass(ele1).removeClass(ele2);
            $(this).find(".initial img").attr("src", "2.png");
        },function () {
            $(this).find(ele).removeClass(ele1).addClass(ele2);
            $(this).find(".initial img").attr("src", "1.png");
        });
    };
    hover(".swiper-slide .initial","move","donw");
    hover(".p","p1_up","p1_down");
    hover(".p1","p2_up","p2_down");
    hover(".hover","hover_up","hover_down");
});