<template>
  <div id="app">
    <header-yg></header-yg>
    <lunbo-yg></lunbo-yg>
    <content-yg></content-yg>
    <tab-yg></tab-yg>
    <router-view/>
  </div>
</template>

<script>
import Header from './components/header'
import Lunbo from './components/lunbo'
import Content from './components/content'
import Tab from './components/tab'
export default {
  name: 'App',
      components:{
        'header-yg':Header,
        'lunbo-yg':Lunbo,
        'content-yg':Content,
        'tab-yg':Tab,
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
