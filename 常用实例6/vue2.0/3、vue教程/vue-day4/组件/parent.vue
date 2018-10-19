<template>
<div class="parent">
  <h1>父组件</h1>
  <v-ChildComp :msg="msg" @childNofity="dochildNofity"></v-ChildComp>
 </div>
</template>
<script>
import ChildComp form "./child.vue"
export default{
   components:{
       "v-ChildComp":ChildComp
   },
   data(){
      return {
      msg:"来自父组件的消息"
      }
   },
   created(){},
   methods:{
     dochildNofity(params){
     console.log(params)
     }
   }
}
</script>
<style scoped>

</style>