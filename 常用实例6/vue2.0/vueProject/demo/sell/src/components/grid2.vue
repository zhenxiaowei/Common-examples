栅格顺序(Flex) #
通过 Flex 布局的order来改变栅格的顺序。
<template>
  <Row type="flex">
    <i-col span="6" order="4">1 | order-4</i-col>
    <i-col span="6" order="3">2 | order-3</i-col>
    <i-col span="6" order="2">3 | order-2</i-col>
    <i-col span="6" order="1">4 | order-1</i-col>
  </Row>
</template>
<script>
  export default {

  }
</script>
