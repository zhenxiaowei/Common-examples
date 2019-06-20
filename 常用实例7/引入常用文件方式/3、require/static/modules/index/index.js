define(['common','vue','vueRouter','VueDatepickerLocal','echarts'], function (cm,Vue,VueRouter,VueDatepickerLocal,echarts) {
    Vue.use(VueRouter);
    let home={//组件
        template:'<div>首页</div>'
    };
    let list={
        template:'<div>列表页</div>'
    };
    let routes=[//路由的映射表   配置路由和组件的关系
        {path:'/home',component:home},//配置的是页面级组件     一个页面一个组件
        {path:'/list',component:list}//路径必须加斜线/
    ];
    let router=new VueRouter({//引入vue-router自带VueRouter类
        //mode:'history',//h5模式    默认是hash模式
        //routes:routes
        routes,
        linkActiveClass:'active'//更改默认样式的类名    默认叫router-link-active   改为active
    });
    let vm = new Vue({
        el: '#app',
        // router:router
        router,
        data:{
            time:new Date()
        }
    });
});