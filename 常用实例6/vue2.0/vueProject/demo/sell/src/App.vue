<template>
  <div id="app">
    <router-view/>
    <echarts-yg></echarts-yg>
    <grid-yg></grid-yg>
    <grid1-yg></grid1-yg>
    <grid2-yg></grid2-yg>
    <grid3-yg></grid3-yg>
    <grid4-yg></grid4-yg>
  </div>
</template>

<script>
  import Echarts from './components/echarts'
  import Grid from './components/grid'
  import Grid1 from './components/grid1'
  import Grid2 from './components/grid2'
  import Grid3 from './components/grid3'
  import Grid4 from './components/grid4'

  export default {
    name: 'App',
    components: {
      'echarts-yg': Echarts,
      'grid-yg': Grid,
      'grid1-yg': Grid1,
      'grid2-yg': Grid2,
      'grid3-yg': Grid3,
      'grid4-yg': Grid4,
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
