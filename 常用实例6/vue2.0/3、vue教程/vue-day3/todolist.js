/**
 * Created by Administrator on 2018/6/4.
 */
let vm = new Vue({
    el: "#app",
    directives: {//自定义获取焦点指令
        focus(el, bindings){
            //当cur==todo的时候
            if (bindings.value) {
                el.focus();//获取焦点
            }
        }
    },
    data: {
        todos: [
            {isSelected: false, title: "睡觉"},
            {isSelected: false, title: "吃饭"}
        ],
        title: '',
        cur: '',
        hash:''
    },
    created(){//ajax获取   初始化数据
        //如果localStorage中有数据就用有的    没有数据就用默认的
        this.todos=JSON.parse(localStorage.getItem('data'))||this.todos;

        //监控hash值的变化    如果页面已经有了hash了   重新刷新页面也要获取hash值
        this.hash=window.location.hash.slice(2)|| 'all';
        window.addEventListener('hashchange',()=>{
            //当hash值变化   重新操作记录的数据
            this.hash=window.location.hash.slice(2);
        },false);
    },
    watch:{
        todos:{//watch默认只监控一层的数据变化，需要深度监控
            handler(){//默认写成函数 就相当于默认写了个handler
                //localstorage默认存储的是字符串
                localStorage.setItem('data',JSON.stringify(this.todos));
            },deep:true//是否深度
        }
    },
    methods: {
        add(){//keydown/keyup差一个单词，keydown的时候内容没有进入到输入框中
            this.todos.push({
                isSelected: false,
                title: this.title
            })
            this.title = '';
        },
        remove(todo){//拿到当前点击的和数组里的每一项比对，相等就返回false即可
            this.todos = this.todos.filter(item=> item !== todo)
        },
        rember(todo){//当前传递的是todo  就是当前点击的这一项
            this.cur = todo;
        },
        concel(){
            this.cur = '';
        }
    },
    computed: {
        filterTodos(){
          if(this.hash=='all'){
              return this.todos;
          }
            if(this.hash=='finish'){
                return this.todos.filter(item=>item.isSelected);
            }
            if(this.hash=='unfinish'){
                return this.todos.filter(item=>!item.isSelected);
            }
            return this.todos;
        },
        count(){
            return this.todos.filter(item=>!item.isSelected).length;
        }
    }
});
//1.将数据循环到页面上
//2.敲回车时添加新数据（需要加入isSelected属性)
//3.删除功能
//4.计算下当前没有被选中的个数