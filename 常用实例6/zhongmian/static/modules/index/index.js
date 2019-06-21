define(['common', 'vue', 'vueRouter','swiper','VueDatepickerLocal'], function (cm, Vue, VueRouter,Swiper) {

    Vue.use(VueRouter);
    $("#header").load('static/modules/header/header.html');
    var banner = new Swiper('.banner', {
        paginationClickable: true,
        centeredSlides: true,
        direction: 'horizontal',//->vertical垂直方向滑动  horizontal水平方向(默认值)

        speed: 300,//->从第一张切换到第二张的运动时间(动画速度) 默认300ms

        loop: true,//->无缝轮播 默认是false

        autoplay: 3000,//->开启自动轮播 3000是设定的轮播时间(隔多久轮播一次)
        autoplayDisableOnInteraction: true,//->默认值是true,在我们手动切换完成后是否禁止自动轮播,默认是禁止的,写成false后手动切换完成后在开始自动轮播

        effect: "slide",//->切换效果 默认值是slide(位移切换) "fade"（淡入）"cube"（方块） "coverflow"（3d流） "flip"（3d翻转）

        lazyLoading: true,//->开启图片的延迟加载
        lazyLoadingInPrevNext: true,//->会把当前运动到的这张图片的前一张和后一张同时加载了(延迟加载做了,但是用户大部分不需要等待图片加载)
        onLazyImageReady: function (swipe) {
            //->当延迟加载结束的时候需要做的事情
            //->swipe参数存储的值是当前Swiper的一个实例,和外面定义的那个swipe1是一个
            //console.log(swipe === swipe1);
        },

        pagination: ".swiper-pagination",
    });
    var newsHotspotBanner = new Swiper('.newsHotspot .newsHotspotBanner', {
        pagination: '.newsHotspot .swiper-pagination',
        nextButton: '.newsHotspot .swiper-button-next',
        prevButton: '.newsHotspot .swiper-button-prev',
        paginationClickable: true,
        slidesPerView: 3,
        spaceBetween: 24,
        breakpoints: {
            1024: {
                slidesPerView:2,
                spaceBetween: 40
            },
            768: {
                slidesPerView: 2,
                spaceBetween: 30
            },
            640: {
                slidesPerView: 1,

                spaceBetween: 20
            },
            320: {
                slidesPerView: 1,
                spaceBetween: 10
            }
        }
    });
    /*免税店*/
    var taxExemptionBanner = new Swiper('.taxExemption .taxExemptionBanner', {
        pagination: '.taxExemption .swiper-pagination',
        nextButton: '.taxExemption .swiper-button-next',
        prevButton: '.taxExemption .swiper-button-prev',
        paginationClickable: true,
        slidesPerView: 3,
        spaceBetween: 24,
        breakpoints: {
            1200: {
                slidesPerView:2,
                spaceBetween: 40
            },
            900: {
                slidesPerView: 2,
                spaceBetween: 30
            },
            640: {
                slidesPerView: 1,

                spaceBetween: 20
            },
            320: {
                slidesPerView: 1,
                spaceBetween: 10
            }
        }
    });
});