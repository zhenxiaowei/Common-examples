$(document).ready(function(){
	$('#testtable1').yhhDataTable();
	
	var testdata1 = [['001','002','003','004','005'],['011','012','013','014','015'],['021','022','023','024','025'],
		['031','032','033','034','035'],['041','042','043','044','045'],['051','052','053','054','055'],
		['061','062','063','064','065'],['071','072','073','074','075'],['081','082','083','084','085'],
		['091','092','093','094','095'],['101','102','103','104','105'],['111','112','113','114','115'],
		['121','122','123','124','125'],['131','132','133','134','135'],['141','142','143','144','145'],
		['151','152','153','154','155'],['161','162','163','164','165'],['171','172','173','174','175'],
		['181','182','183','184','185'],['191','192','193','194','195'],['201','202','203','204','205'],
		['211','212','213','214','215'],['221','222','223','224','225'],['231','232','233','234','235']];
	$('#testtable2').yhhDataTable({
		'paginate':{
			'changeDisplayLen':true,
			'type':'updown',
			'visibleGo': true
		},
		'tbodyRow':{
			'zebra':true
		},
		'tbodyData':{
			'enabled':true,  /*是否传入表格数据*/
			'source':testdata1 /*传入的表格数据*/
		}
	});
	
	

	
	//$('#testtable5').yhhDataTable({
	//	'tbodyRow':{
	//		'write':function(d){ /*表格生成每行数据的方法*/
	//			return that.drawRow(d);
	//		}
	//	},
    //	'paginate':{
    //		'visibleGo': true, /*是否开启直接翻至某页功能*/
    //		'type':'full', /*默认按钮样式递增（numbers只有数字按钮，updown增加上下页按钮，full增加首尾页按钮）*/
    //		'displayLen':10,  /*每页显示条数*/
    //		'currentPage':1 /*当前页码（初始页码）*/ 
   // 	},
    //	'serverSide': true, /*是否从服务器获取数据*/  
    	/*ajax参数*/ 
    //	'ajaxParam': {
	//		'url':projectHttpAjax.baseUrl + listActionName, /*url地址*/
	//		'type':'GET', /*ajax传输方式*/
	//		'dataType':'jsonp', /*ajax传送数据格式*/
	//		'jsonp':'callback', /*dataType是jsonp的时候，传递给请求处理程序或页面的，用以获得jsonp回调函数名的参数名*/
	//		'jsonpCallback':'jsonpCallBack', /*dataType是jsonp的时候，自定义的jsonp回调函数名称*/
	//		'data':data /*传到服务器的数据*/
	//	},
	//	'sendDataHandle':function(d){
	//		d.pageNumber = d.currentPage;
	//		delete d.currentPage;
	//		d.pageCount = d.displayDataLen;
	//		delete d.displayDataLen;
	//		console.log('检索结果入参：' + JSON.stringify(d));
	//		return d;
	//	},  /*传递到服务器的数据预处理方法*/
	//	'backDataHandle':function(d){
	//		console.log('检索结果出参：' + JSON.stringify(d));
	//		var r = {'errFlag':false,'errMsg':'','dataLen':0,'data':[],'origData':null};
	//		if (d == null) {
	//			r.errFlag=true,r.errMsg=_ERR_MSG;
	//		} else if (d.flag != '0') {
	//			r.errFlag=true,r.errMsg=d.message;
	//		} else {
	//			r.errMsg=d.message,r.dataLen=d.data.totalCount,r.data=d.data.list;
	//			r.origData=d.data;
	//		}
	//		return r;
	//	},  /*预处理从服务器的接收数据或者js传入的数据*/
    //	'beforeShow':function(){loadingDialog.show();},  /*显示之前的额外处理事件*/
    //	'afterShow':function(errFlag,errMsg,dataLen,listData){
    //		loadingDialog.hide();
    //		if (errFlag) {
    //			$page.find('.recorder-counts').text(0);
    //			msgDialog.show(errMsg);
    //		} else {
    //			$page.find('.recorder-counts').text(listData.totalCount);
    //			$table.find('.operation-btn').button();
    //			$table.find('.disable-operation-btn').button().button('disable');
    //		}
    //		$table.find('.results-checkbox-all').removeClass('fa-check-square-o').addClass('fa-square-o');
    //	}  /*显示之后的额外处理事件*/
	//});*/
	
	/*更新表格*/ 
	var refreshTable = function(data,page){
			if ($.isEmptyObject(data)) data = {};
			var toData = {
				'ajaxParam':{'data':data}
			}
			if (!$.isEmptyObject(page)){
				toData.paginate = {};
				toData.paginate.currentPage = page;
			}
			var $table = $page.find('.result-list');
			$table.yhhDataTable('refresh',toData);
		}
});