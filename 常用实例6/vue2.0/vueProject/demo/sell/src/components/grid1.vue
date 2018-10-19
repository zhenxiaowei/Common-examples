区块间隔 #
通过给 row 添加 gutter 属性，可以给下属的 col 添加间距，推荐使用 (16+8n)px 作为栅格间隔。
<template>
  <Row :gutter="16">
        <i-col span="6">
            <div>col-6</div>
        </i-col>
        <i-col span="6">
            <div>col-6</div>
        </i-col>
        <i-col span="6">
            <div>col-6</div>
        </i-col>
        <i-col span="6">
            <div>col-6</div>
        </i-col>
    </Row>
</template>
<script>
    export default {

    }
</script>


<script>
  export default {

  }

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
