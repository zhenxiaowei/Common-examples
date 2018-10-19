    <template>
        <li v-on:click="thisdelete">{{content}}</li>
    </template>
<script>
 export default{
    data:function(){
       return{
             content:'aaa'
       }
    },
    methods:{
      thisdelete:function(){
      alert(1)
      }
    }
 }
</script>
<style scoped>

</style>

