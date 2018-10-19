
<template>
<!-- 主要内容 -->
<div class="container summary">

    <!-- 简介 -->
    <div class="row" id="summary-container">
        <div class="col-md-4">
            <img class="img-circle" src="../assets/images/chrome-logo-small.jpg" alt="chrome">

            <h2>Chrome</h2>

            <p>Google Chrome，又称Google浏览器，是一个由Google（谷歌）公司开发的网页浏览器。</p>

            <p><a class="btn btn-default" href="#" role="button">点我下载</a></p>
        </div>
        <div class="col-md-4">
            <img class="img-circle" src="../assets/images/firefox-logo-small.jpg" alt="firefox">

            <h2>Firefox</h2>

            <p>Mozilla Firefox，中文名通常称为“火狐”或“火狐浏览器”，是一个开源网页浏览器。</p>

            <p><a class="btn btn-default" href="#" role="button">点我下载</a></p>
        </div>
        <div class="col-md-4">
            <img class="img-circle" src="../assets/images/safari-logo-small.jpg" alt="safari">

            <h2>Safari</h2>

            <p>Safari，是苹果计算机的最新操作系统Mac OS X中的浏览器。</p>

            <p><a class="btn btn-default" href="#" role="button">点我下载</a></p>
        </div>
    </div>

    <!-- 特性 -->

    <hr class="feature-divider">



    <!-- 关于 -->
    <div class="modal fade" id="about-modal" tabindex="-1" role="dialog" aria-labelledby="modal-label"
         aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal"><span
                            aria-hidden="true">&times;</span><span class="sr-only">关闭</span></button>
                    <h4 class="modal-title" id="modal-label">关于</h4>
                </div>
                <div class="modal-body">
                    <p>慕课网隶属于北京慕课科技中心(有限合伙)，是一家从事互联网免费教学的网络教育公司。秉承“开拓、创新、公平、分享”的精神，
                        将互联网特性全面的应用在教育领域，致力于为教育机构及求学者打造一站式互动在线教育品牌。</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-default" data-dismiss="modal">了解了</button>
                </div>
            </div>
        </div>
    </div>




</div>
</template>

<script>
export default {
  name: 'HelloWorld',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App'
    }
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
