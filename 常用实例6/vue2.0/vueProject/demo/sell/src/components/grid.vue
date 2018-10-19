
基础用法 #
水平排列的布局。

col必须放在row里面，在使用col组件时，必须加前缀，如<i-col></i-col>。

<template>
<div>
    <Row>
        <i-col span="12">col-12</i-col>
        <i-col span="12">col-12</i-col>
    </Row>
    <br>
    <Row>
        <i-col span="8">col-8</i-col>
        <i-col span="8">col-8</i-col>
        <i-col span="8">col-8</i-col>
    </Row>
    <br>
    <Row>
        <i-col span="6">col-6</i-col>
        <i-col span="6">col-6</i-col>
        <i-col span="6">col-6</i-col>
        <i-col span="6">col-6</i-col>
    </Row>
</div>
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
