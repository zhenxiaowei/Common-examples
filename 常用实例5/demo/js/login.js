/**
 * Created by zhenxiaowei on 2017/8/12.
 */

	//验证用户名
	function checkeusername(username){
		var str=username;
		var regname=/^[a-zA-Z\d]\w{3,20}[a-zA-Z\d]$/;
		var objExp=new RegExp(regname);
		if(objExp.test(str)==true){
			return true;
		}else{
			return false;
		}
	}
	
	//验证密码
	function checkePWD(PWD){
		var str=PWD;
		var regpassword=/^[a-zA-Z0-9]{6,20}$/;
		var objExp=new RegExp(regpassword);
		if(objExp.test(str)==true){
			return true;
		}else{
			return false;
		}
	}
	
	//调用两个方法验证用户名和密码是否合法，给出提示
	function check(myform){
		if(myform.username.value==""){
			//alert("请输入用户名！");
			alert("请输入用户名")
			myform.username.focus();
			return;
		}
		if(!checkeusername(myform.username.value)){
			//alert("你输入的用户名不合法");
			alert("您输入的用户名不存在")
			myform.username.focus();
			return;
		}
		if(myform.password.value==""){
			//alert("请输入密码！");
			alert("请输入密码")
			myform.password.focus();
			return;
		}
		if(!checkePWD(myform.password.value)){
			//alert("你输入的密码不合法");
			alert("您输入的密码错误")
			myform.password.focus();
			return;
		}
		var username=myform.username.value;
		var password=myform.password.value;
		submit(username,password)
	}
	
	function submit(username,password){
        console.log(username,password);
		window.location.href='index.html';
	}
	//enter按下的登录
    document.onkeydown=function(event){
        var e = event || window.event || arguments.callee.caller.arguments[0];
        if(e && e.keyCode==13){ 
        	$(".submit").trigger("click");
        	//trigger()方法出发被选元素的指定事件类型
        }
    };
	

