// 下载图片
function downloadpic(reg) {
    var alink = $("#download");
    alink.attr({download:  '组织架构图'+'.'+'png', href: reg});
    if (document.all) {
        document.getElementById("download").click();
    } else {
        var e = document.createEvent("MouseEvents");
        e.initEvent("click", false, true);
        document.getElementById("download").dispatchEvent(e);
    }
}
// 导入
window.onload = function() {
    //导出图片
    $("#fileoutput").click(function () {
        editor.minder.exportData('png').then(function(content){
            downloadpic(content);
        });
    });
    //保存到数据库Json
    $("#fileupload").click(function () {
        var json=editor.minder.exportData('text');
        minder.execCommand('Template', "structure");
        // alert(json.fulfillValue);
        //加载默认Json数据
        // var value = minder.queryCommandValue('Template');
        // var status=minder.queryCommandState('Template');
        // alert(JSON.stringify(value));
        // alert(status);
        // var content=json.fulfillValue;
        // editor.minder.importData('text', content);
        // minder.execCommand('Template', "structure");

    });

    // $.ajax({
    //     type:"post",
    //     url:"/webfx/picture/nextpicture",
    //     data:JSON.stringify(picturearr),
    //     dataType:"json",
    //     success:function(result,status){
    //
    //     },
    //     complete:function(result,status){
    //
    //     },
    // });


	// BufferedReader br=new BufferedReader(new InputStreamReader(request.getInputStream()));
		// String line=null;
		// StringBuilder sb=new StringBuilder();
		// while((line=br.readLine())!=null) {
			// System.out.println(line);
			// sb.append(line);
			// };
		
		// System.out.println(sb.toString());
	
	

    // fileOutput.addEventListener('onclick', function(e) {
    //     alert("111");
    //     var file = fileOutput.files[0],
    //         // textType = /(md|km)/,
    //         fileType = file.name.substr(file.name.lastIndexOf('.')+1);
    //     switch(fileType){
    //         case 'md':
    //             fileType = 'markdown';
    //             break;
    //         case 'km':
    //         case 'json':
    //             fileType = 'json';
    //             break;
    //         default:
    //             console.log("File not supported!");
    //             alert('只支持.km、.md、.json文件');
    //             return;
    //     }
    //     var reader = new FileReader();
    //     reader.onload = function(e) {
    //         var content = reader.result;
    //         editor.minder.importData(fileType, content).then(function(data){
    //             $(fileOutput).val('');
    //         });
    //     }
    //     reader.readAsText(file);
    // });
}
// 导出
// $(document).on('click', '.export', function(event) {
//     event.preventDefault();
//     var type = $(this).data('type'),
//         exportType;
//     switch(type){
//         case 'km':
//             exportType = 'json';
//             break;
//         case 'md':
//             exportType = 'markdown';
//             break;
//         default:
//             exportType = type;
//             break;
//     }
//     editor.minder.exportData(exportType).then(function(content){
//         switch(exportType){
//             case 'json':
//                 console.log($.parseJSON(content));
//                 break;
//             default:
//                 console.log(content);
//                 break;
//         }
//         var aLink = document.createElement('a'),
//             evt = document.createEvent("HTMLEvents"),
//             blob = new Blob([content]);
//
//         evt.initEvent("click", false, false);
//         aLink.download = $('#node_text1').text()+'.'+type;
//         aLink.href = URL.createObjectURL(blob);
//         aLink.dispatchEvent(evt);
//     });
// });