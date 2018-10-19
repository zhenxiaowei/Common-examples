(function($){
	//目标产地联想查询
	var bigAutocompleteProductPlace = new function(){
		this.currentInputText = null;//目前获得光标的输入框（解决一个页面多个输入框绑定自动补全功能）
		this.functionalKeyArray = [9,20,13,16,17,18,91,92,93,45,36,33,34,35,37,39,112,113,114,115,116,117,118,119,120,121,122,123,144,19,145,40,38,27];//键盘上功能键键值数组
		this.holdText = null;//输入框中原始输入的内容

		//初始化插入自动补全div，并在document注册mousedown，点击非div区域隐藏div
		this.init = function(){

			$("body").append("<div id='bigAutocompleteContentProductPlace' class='bigautocomplete-layout'></div>");
			$("#bigAutocompleteContentProductPlace").css({"position":"absolute"});
			$(document).bind('mousedown',function(event){
				var $target = $(event.target);
				if((!($target.parents().andSelf().is('#bigAutocompleteContentProductPlace'))) && (!$target.is(bigAutocompleteProductPlace.currentInputText))){
					bigAutocompleteProductPlace.hideAutocomplete();
				}
			})

			//鼠标悬停时选中当前行
			$("#bigAutocompleteContentProductPlace").delegate("tr", "mouseover", function() {
				$("#bigAutocompleteContentProductPlace tr").removeClass("ct");
				$(this).addClass("ct");
			}).delegate("tr", "mouseout", function() {
				$("#bigAutocompleteContentProductPlace tr").removeClass("ct");
			});


			//单击选中行后，选中行内容设置到输入框中，并执行callback函数
			$("#bigAutocompleteContentProductPlace").delegate("tr", "click", function() {
				//mm 判断input框里是否有顿号 ，如果有的话直接把值加到后边，没有的话替换掉
				if(bigAutocompleteProductPlace.currentInputText.val().indexOf("、") != -1){
					//不能直接追加，要把最后一个顿号后边的内容替换掉
					//取input中的值
					var curInputVal = bigAutocompleteProductPlace.currentInputText.val();
					curInputVal = curInputVal.split("、");
					curInputVal.pop();
					curInputVal = curInputVal.join("、")+"、";
					bigAutocompleteProductPlace.currentInputText.val(curInputVal + $(this).find("div:last").html()+"、");
				}else{
					bigAutocompleteProductPlace.currentInputText.val( $(this).find("div:last").html()+"、");
				}

				var callback_ = bigAutocompleteProductPlace.currentInputText.data("config").callback;
				if($("#bigAutocompleteContentProductPlace").css("display") != "none" && callback_ && $.isFunction(callback_)){
					callback_($(this).data("jsonData"));

				}
				//bigAutocompleteProductPlace.hideAutocomplete();
			})

		}

		this.autocomplete = function(param){
			if($("body").length > 0 && $("#bigAutocompleteContentProductPlace").length <= 0){
				bigAutocompleteProductPlace.init();//初始化信息
			}

			var $this = $(this);//为绑定自动补全功能的输入框jquery对象

			var $bigAutocompleteContent = $("#bigAutocompleteContentProductPlace");

			this.config = {
				//width:下拉框的宽度，默认使用输入框宽度
				width:$this.outerWidth() - 2,
				//url：格式url:""用来ajax后台获取数据，返回的数据格式为data参数一样
				url:null,
				/*data：格式{data:[{title:null,result:{}},{title:null,result:{}}]}
				 url和data参数只有一个生效，data优先*/
				data:null,
				//callback：选中行后按回车或单击时回调的函数
				callback:null};
			$.extend(this.config,param);

			$this.data("config",this.config);

			//输入框keydown事件
			$this.off("keydown").on("keydown",function(event) {
				switch (event.keyCode) {
					case 40://向下键

						if($bigAutocompleteContent.css("display") == "none")return;

						var $nextSiblingTr = $bigAutocompleteContent.find(".ct");
						if($nextSiblingTr.length <= 0){//没有选中行时，选中第一行
							$nextSiblingTr = $bigAutocompleteContent.find("tr:first");
						}else{
							$nextSiblingTr = $nextSiblingTr.next();
						}
						$bigAutocompleteContent.find("tr").removeClass("ct");
						//判断input里是否有顿号
						var isFalse = $this.val().indexOf("、") == -1;
						//得出没有最后输入部分
						var curInputVal = $this.val();
						curInputVal = curInputVal.split("、");
						curInputVal.pop();
						curInputVal = curInputVal.join("、")+"、";

						if($nextSiblingTr.length > 0){//有下一行时（不是最后一行）
							$nextSiblingTr.addClass("ct");//选中的行加背景
							//$this.val($nextSiblingTr.find("div:last").html()+"、");//选中行内容设置到输入框中
							//这里要判断下内容是否有顿号
							if(!isFalse){

								$this.val(curInputVal + $nextSiblingTr.find("div:last").html())
							}else{
								$this.val($nextSiblingTr.find("div:last").html());//选中行内容设置到输入框中
							}
							//div滚动到选中的行,jquery-1.6.1 $nextSiblingTr.offset().top 有bug，数值有问题
							$bigAutocompleteContent.scrollTop($nextSiblingTr[0].offsetTop - $bigAutocompleteContent.height() + $nextSiblingTr.height() );

						}else{
							//$this.val(bigAutocompleteProductPlace.holdText);//输入框显示用户原始输入的值
							if(!isFalse){

								$this.val(curInputVal + bigAutocompleteProductPlace.holdText);//输入框显示用户原始输入的值
							}else{
								$this.val(bigAutocompleteProductPlace.holdText);//输入框显示用户原始输入的值
							}
						}


						break;
					case 38://向上键
						if($bigAutocompleteContent.css("display") == "none")return;

						var $previousSiblingTr = $bigAutocompleteContent.find(".ct");
						if($previousSiblingTr.length <= 0){//没有选中行时，选中最后一行行
							$previousSiblingTr = $bigAutocompleteContent.find("tr:last");
						}else{
							$previousSiblingTr = $previousSiblingTr.prev();
						}
						$bigAutocompleteContent.find("tr").removeClass("ct");

						//判断input里是否有顿号
						var isFalse1 = $this.val().indexOf("、") == -1;
						//得出没有最后输入部分
						var curInputVal1 = $this.val();
						curInputVal1 = curInputVal1.split("、");
						curInputVal1.pop();
						curInputVal1 = curInputVal1.join("、")+"、";

						if($previousSiblingTr.length > 0){//有上一行时（不是第一行）
							$previousSiblingTr.addClass("ct");//选中的行加背景
							//$this.val($previousSiblingTr.find("div:last").html());//选中行内容设置到输入框中

							//这里要判断下内容是否有顿号
							if(!isFalse1){

								$this.val(curInputVal1 + $previousSiblingTr.find("div:last").html())
							}else{
								$this.val($previousSiblingTr.find("div:last").html());//选中行内容设置到输入框中
							}

							//div滚动到选中的行,jquery-1.6.1 $$previousSiblingTr.offset().top 有bug，数值有问题
							$bigAutocompleteContent.scrollTop($previousSiblingTr[0].offsetTop - $bigAutocompleteContent.height() + $previousSiblingTr.height());
						}else{
							//$this.val(bigAutocompleteProductPlace.holdText);//输入框显示用户原始输入的值
							if(!isFalse1){

								$this.val(curInputVal1 + bigAutocompleteProductPlace.holdText);//输入框显示用户原始输入的值
							}else{
								$this.val(bigAutocompleteProductPlace.holdText);//输入框显示用户原始输入的值
							}
						}

						break;
					case 27://ESC键隐藏下拉框

						bigAutocompleteProductPlace.hideAutocomplete();
						break;
				}
			});

			//输入框keyup事件
			$this.off("keyup").on("keyup",function(event) {
				var k = event.keyCode;
				var ctrl = event.ctrlKey;
				var isFunctionalKey = false;//按下的键是否是功能键
				for(var i=0;i<bigAutocompleteProductPlace.functionalKeyArray.length;i++){
					if(k == bigAutocompleteProductPlace.functionalKeyArray[i]){
						isFunctionalKey = true;
						break;
					}
				}
				//k键值不是功能键或是ctrl+c、ctrl+x时才触发自动补全功能
				if(!isFunctionalKey && (!ctrl || (ctrl && k == 67) || (ctrl && k == 88)) ){
					var config = $this.data("config");

					var offset = $this.offset();

					//$bigAutocompleteContent.width(config.width);
					var h = $this.outerHeight() - 1;
					$bigAutocompleteContent.css({"top":"34px","left":"0"});

					var data = config.data;
					var url = config.url;
					var keyword_ = $.trim($this.val());
					//mm 按键盘的时候如果是，判断是否有顿号，有的话换成数组，截取最后一个字符串当做搜索条件
					if(keyword_.indexOf("、") != -1){
						var curArr = keyword_.split("、");
						keyword_ = curArr[curArr.length-1]
					}
					if(keyword_ == null || keyword_ == ""){
						bigAutocompleteProductPlace.hideAutocomplete();
						return;
					}
					if(data != null && $.isArray(data) ){
						var data_ = new Array();
						for(var i=0;i<data.length;i++){
							if(data[i].title.indexOf(keyword_) > -1){
								data_.push(data[i]);
							}
						}

						makeContAndShow(data_);
					}else if(url != null && url != ""){//ajax请求数据
						var code;
						if($(".navClick").attr("id")=="45"){
							code=$(".huanjingChildren").attr("code")
						}else{
							code=$(".navClick").attr("code");
						}
						$.ajax({
							type : "post",
							url : url,
							data : JSON.stringify({name:keyword_}),
							dataType : "json",
							headers : {
								"Accept" : "application/json",
								"Content-Type" : "application/json"
							},
							success : function(result) {
								makeContAndShow(result);
							}
						});
					}


					bigAutocompleteProductPlace.holdText = $this.val();
				}
				//回车键
				if(k == 13){
					var callback_ = $this.data("config").callback;
					if($bigAutocompleteContent.css("display") != "none"){
						if(callback_ && $.isFunction(callback_)){
							callback_($bigAutocompleteContent.find(".ct").data("jsonData"));
						}
						$this.val($this.val() + "、")
						//$bigAutocompleteContent.hide();
					}
				}

			});


			//组装下拉框html内容并显示
			function makeContAndShow(data_){
				if(data_.data!=null){
					data_=data_.data;
				}

				if(data_ == null || data_.length <=0 ){
					return;
				}

				var cont = "<table><tbody>";
				for(var i=0;i<data_.length;i++){
					//cont += "<tr><td><div>" + data_[i].title + "</div></td></tr>"
					cont += "<tr><td><div class='cd' code="+data_[i].featureDataCode+">" + data_[i].name + "</div></td></tr>";
				}
				cont += "</tbody></table>";


				$bigAutocompleteContent.html(cont);
				$bigAutocompleteContent.show();

				//每行tr绑定数据，返回给回调函数
				$bigAutocompleteContent.find("tr").each(function(index){
					$(this).data("jsonData",data_[index]);
				})
			}


			//输入框focus事件
			$this.focus(function(){
				bigAutocompleteProductPlace.currentInputText = $this;
			});

		}
		//隐藏下拉框
		this.hideAutocomplete = function(){
			var $bigAutocompleteContent = $("#bigAutocompleteContentProductPlace");
			if($bigAutocompleteContent.css("display") != "none"){
				$bigAutocompleteContent.find("tr").removeClass("ct");
				$bigAutocompleteContent.hide();
			}
		}

	};


	$.fn.bigAutocompleteProductPlace = bigAutocompleteProductPlace.autocomplete;

})(jQuery)