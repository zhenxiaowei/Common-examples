左右偏移 #
通过设置offset属性，将列进行左右偏移，偏移栅格数为offset的值。
<template>
<div>

  <Row>
    <i-col span="8">col-8</i-col>
    <i-col span="8" offset="8">col-8 | offset-8</i-col>
  </Row>
  <br>
  <Row>
    <i-col span="6" offset="8">col-6 | offset-8</i-col>
    <i-col span="6" offset="4">col-6 | offset-4</i-col>
  </Row>
  <br>
  <Row>
    <i-col span="12" offset="8">col-12 | offset-8</i-col>
  </Row>
</div>
</template>
<script>
  export default {

  }
</script>


