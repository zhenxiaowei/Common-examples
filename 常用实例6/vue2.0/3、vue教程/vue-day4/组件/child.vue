<template>
<div class="child" @click="notifyParent">
  <h1>子组件</h1>
  {{msg}}
 </div>
</template>
<script>
export default{
   props:{
       msg:{
         type:String,
         default:''
       }
   },
   data(){
      return {}
   },
   created(){},
   methods:{
     notifyParent(){
        var params={
        a:1,
        b:2
        },
        this.$emit("childNofity",params)
     }
   }
}
</script>
<style scoped>

</style>





