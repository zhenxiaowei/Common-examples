html5部分
第一部分 html5标签
   增加了一些语义化标签
   header footer main(主要/重要) aside(附注/标注) figure(插画) figcaption(图题/描述插画) section(独立的一块内容) article(文章/完整的一部分) nav(导航) hgroup(副标题),address....

   增加了很多表单属性
    推荐入门书 html5秘籍 第2版本
第二部分 html5应用部分
    对音频视频的操作
    图形界面操作 canvas svg
    数据存储部分 本地存储 离线存储...

css3部分
    PC端
        渐进增强  先完成网站一部分,慢慢的增加高版本浏览器支持的效果
        优雅降级  完成网站所有部分,后期通过调试或者测试把一些不兼容的部分去除

   css3选择器

       层次选择器
       E F 后代选择器
       E>F 子选择器
       E+F 相邻兄弟选择器 (弟弟元素)
       E~F 通用兄弟选择器 (所有的弟弟元素)
       结构选择器
       :nth-child
       :nth-of-type
       :first-child
       :last-child
       :only-child
       :only-of-type
       :empty 没有任何内容
       :not() 否定选择器
       属性选择器
       E[attr=val]
       E[attr|=val] val结尾属性值只能是val或者val-开头
       E[attr*=val] 属性值中包含val字符串就匹配
       E[attr~=val] 属性值有多个,其中一个是val
       E[attr^=val] 属性值只能是以val开头
       E[attr$=val] 属性值只能是以val结尾

   渐变操作
    线性渐变 按照直线的方向渐变
        第一个参数
         left|top|right|bottom
         to left top |to right bottom 向..方向渐变
         45deg|90deg  角度 正(顺) 负(逆)
        从第二个参数开始是设置渐变的颜色
         可以自定义渐变色占的位置 (orange 25%,green 50%, orange 75% ,green 100%)
    重复线性渐变 repeating-linear-gradient

    径向渐变(放射性渐变) 由一个点(默认在元素的中心)向多方向渐变
        第一个参数
        circle 圆
        ellipse 椭圆
        circle at top 改变默认的渐变的基准点
        circle at 20px 20px 自定义基准点位置
        从第二个参数开始设置渐变色
        可以自定义每个渐变色所占的位置(orange 20%,blue 30%,green 50%)
    重复径向渐变repeating-radial-gradient

   圆角 border-radius
   半圆
   水平椭圆
   垂直椭圆

   盒子阴影 box-shadow
   第一个参数 水平方向偏移  正:右 负:左
   第二个参数 垂直方向偏移  正:下 负:上
   第三个参数 模糊半径 (设置模糊度,值越大阴影越模糊)
   第四个参数 扩展半径 (正:往外扩展 负:往内收缩)
   第五个参数 inset 内阴影 默认是外阴影  (可以放在第一个或者最后一个位置),第一个参数和第二个参数的方向与外阴影的一个参数和第二个参数的偏移方向相反

   css3 2D动画 过渡动画和关键帧动画
   过渡动画 transition 设置起始值和结束值之前实现平滑过渡的效果
   -webkit-transition: 1s;
   -moz-transition: 1s;
   -ms-transition: 1s;
   -o-transition: 1s;
   transition: 1s;
   细分属性
   transition-property:height  属性
   transition-duration 时间
   transition-timing-function :ease-in 动画类型
   transition-delay:1s 延迟时间
   复合属性
   transition:[all] 1s ease-in-out 1s

   css3变形
   transform:rotate() 旋转
   transform:scale()缩放 默认值1 ,<1缩小 >1放大
   transform: skew()倾斜
   transform:translate() 平移
   关键帧动画
   1.声明关键帧 @keyframes 动画名
   2.animate属性调用声明关键帧




