
<template>
  <div>
    <div class="page"  v-show="show">
      <div class="pagelist">
        <span class="jump" :class="{disabled:pstart}" @click="current_pageAddFn">上一页</span>
        <span v-show="current_page>5" class="jump" @click="jumpPage(1)">1</span>
        <span class="ellipsis"  v-show="efont">...</span>
        <span class="jump" v-for="num in indexs" :class="{bgprimary:current_page==num}" @click="jumpPage(num)">{{num}}</span>
        <span class="ellipsis"  v-show="ebehind">...</span>

        <span :class="{disabled:pend}" class="jump" @click="current_pageReduceFn">下一页</span>
        <span v-show="current_page<pages-4" class="jump" @click="jumpPage(pages)">{{pages}}</span>

        <span class="jumppoint">跳转到：</span>
        <span class="jumpinp"><input type="text" v-model="changePage"></span>
        <span class="jump gobtn" @click="jumpPage(changePage)">GO</span>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
   data(){
          return {
            current_page: 1, //当前页
            pages: 50, //总页数
            changePage:'',//跳转页
            nowIndex:0
          }
       },
    computed:{
      show(){
        return this.pages && this.pages !=1
      },
      pstart() {
        return this.current_page == 1;
      },
      pend() {
        console.log(this.current_page);
        return this.current_page == this.pages;
      },
      efont() {
        if (this.pages <= 7) return false;
        return this.current_page > 5
      },
      ebehind() {
        if (this.pages <= 7) return false;
        var nowAy = this.indexs;
        return nowAy[nowAy.length - 1] != this.pages;
      },
      indexs() {
        var left = 1,
                right = this.pages,
                ar = [];
        if (this.pages >= 7) {
          if (this.current_page > 5 && this.current_page < this.pages - 4) {
            left = Number(this.current_page) - 3;
            right = Number(this.current_page) + 3;
          } else {
            if (this.current_page <= 5) {
              left = 1;
              right = 7;
            } else {
              right = this.pages;

              left = this.pages - 6;
            }
          }
        }
        while (left <= right) {
          ar.push(left);
          left++;
        }
        return ar;
      },
    },
    methods: {
      jumpPage(id) {
        this.current_page = id;
        alert(id)
      },
      current_pageAddFn(){
         this.current_page--;
         alert(this.current_page)
      },
      current_pageReduceFn(){
         this.current_page++;
          alert(this.current_page)
      }
    }
  }

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    .page {
      font-weight: 900;
      height: 40px;
      text-align: center;
      color: #888;
      margin: 20px auto 0;
      background: #f2f2f2;
    }

    .pagelist {
      font-size: 0;
      background: #fff;
      height: 50px;
      line-height: 50px;
    }

    .pagelist span {
      font-size: 14px;
    }

    .pagelist .jump {
      border: 1px solid #ccc;
      padding: 5px 8px;
      -webkit-border-radius: 4px;
      -moz-border-radius: 4px;
      border-radius: 4px;
      cursor: pointer;
      margin-left: 5px;
    }

    .pagelist .bgprimary {
      cursor: default;
      color: #fff;
      background: #337ab7;
      border-color: #337ab7;
    }

    .jumpinp input {
      width: 55px;
      height: 26px;
      font-size: 13px;
      border: 1px solid #ccc;
      -webkit-border-radius: 4px;
      -moz-border-radius: 4px;
      border-radius: 4px;
      text-align: center;
    }

    .ellipsis {
      padding: 0px 8px;
    }

    .jumppoint {
      margin-left: 30px;
    }

    .pagelist .gobtn {
      font-size: 12px;
    }

    .bgprimary {
      cursor: default;
      color: #fff;
      background: #337ab7;
      border-color: #337ab7;
    }
    .pagelist .jump.disabled{
      pointer-events: none;
      background: #ddd;
    }
</style>
