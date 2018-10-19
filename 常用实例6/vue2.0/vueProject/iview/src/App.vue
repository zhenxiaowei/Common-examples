<template>
  <div id="app">
    <router-view/>
    <echarts-yg></echarts-yg>
    <Grid-yg></Grid-yg>
    <layout-yg></layout-yg>
    <layout1-yg></layout1-yg>
    <page-yg></page-yg>
  </div>
</template>

<script>
    import Echarts from './components/echarts'
    import Grid from './components/Grid'
    import Layout from './components/layout.vue'
     import Layout1 from './components/layout1.vue'
     import Page from './components/page.vue'
export default {
  name: 'App',
  components:{
    'echarts-yg':Echarts,
    'Grid-yg':Grid,
    'layout-yg':Layout,
    'layout1-yg':Layout1,
    'page-yg':Page
  }
}
console.log($("#app"))
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
