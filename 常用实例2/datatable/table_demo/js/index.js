


        $(function(){
        	
        	//left_nav
        	$("#xuqiu_Submit").click(function(){
        	    window.location.href="index.jsp";
        	})
        	$("#xuQiuZongLan").click(function(){
        	    window.location.href="index1.jsp";
        	})
        	
        	//分页表格
            var table = $('#table').DataTable({
                "ajax": {
                    "url": "object.json",
                    //"dataSrc": "data",//默认为data
                    "type": "post",
                    "error":function(){alert("服务器未正常响应，请重试");}
                },
                "columns": [
                    { "data": "id", "title":"序号","defaultContent":""},
                    { "data": "username", "title":"用户名","defaultContent":""},
                    { "data": "name", "title":"姓名","defaultContent":""},
                    { "data": "phone", "title":"电话","defaultContent":""},
                    { "data": null, "title":"操作","defaultContent": "<button class='edit-btn' type='button'>编辑</button>"}
                ],
                dom: 'Bfrtip',
                buttons: [
                    {
                        extend: 'selectAll',
                        text: '全选',
                        exportOptions: {
                            modifier: {
                                page: 'current'
                            }
                        }
                    },
                    {
                        extend: 'selectNone',
                        text: '全不选',
                        exportOptions: {
                            modifier: {
                                page: 'current'
                            }
                        }
                    },
                    {
                        extend: 'excelHtml5',
                        text: '导出Excel',
                        exportOptions: {
                            modifier: {
                                page: 'current'
                            }
                        }
                    },
                    {
                        extend: 'copyHtml5',
                        text: '复制',
                        exportOptions: {
                            modifier: {
                                page: 'current'
                            }
                        }
                    },

                        'pageLength',
                    {
                        extend: 'print',
                        text: '打印',
                        exportOptions: {
                            modifier: {
                                page: 'current'
                            }
                        }
                    }
                ],
                columnDefs: [ {
                    orderable: false,
                    className: 'select-checkbox',
                    targets:   0
                } ],
                select: {
                    style:    'os',
                    selector: 'td:first-child'
                },
                "language": {
                    "sProcessing": "处理中...",
                    "sLengthMenu": "显示 _MENU_ 项结果",
                    "sZeroRecords": "没有匹配结果",
                    "sInfo": "显示第 _START_ 至 _END_ 项结果，共 _TOTAL_ 项",
                    "sInfoEmpty": "显示第 0 至 0 项结果，共 0 项",
                    "sInfoFiltered": "(由 _MAX_ 项结果过滤)",
                    "sInfoPostFix": "",
                    "sSearch": "搜索:",
                    "sUrl": "",
                    "sEmptyTable": "表中数据为空",
                    "sLoadingRecords": "载入中...",
                    "sInfoThousands": ",",
                    "oPaginate": {
                        "sFirst": "首页",
                        "sPrevious": "上页",
                        "sNext": "下页",
                        "sLast": "末页"
                    },
                    "oAria": {
                        "sSortAscending": ": 以升序排列此列",
                        "sSortDescending": ": 以降序排列此列"
                    }
                }
            });

            $("#table tbody").on("click",".edit-btn",function(){
                var tds=$(this).parents("tr").children();
                $.each(tds, function(i,val){
                    var jqob=$(val);
                    if(i < 1 || jqob.has('button').length ){return true;}//跳过第1项 序号,按钮
                    var txt=jqob.text();
                    var put=$("<input type='text'>");
                    put.val(txt);
                    jqob.html(put);
                });
                $(this).html("保存");
                $(this).toggleClass("edit-btn");
                $(this).toggleClass("save-btn");
            });

            $("#table tbody").on("click",".save-btn",function(){
                var row=table.row($(this).parents("tr"));
                var tds=$(this).parents("tr").children();
                $.each(tds, function(i,val){
                    var jqob=$(val);
                    //把input变为字符串
                    if(!jqob.has('button').length){
                        var txt=jqob.children("input").val();
                        jqob.html(txt);
                        table.cell(jqob).data(txt);//修改DataTables对象的数据
                    }
                });
                var data=row.data();
                $.ajax({
                    "url":"objects.txt",
                    "data":data,
                    "type":"post",
                    "error":function(){
                        alert("服务器未正常响应，请重试");
                    },
                    "success":function(response){
                        alert(response);
                    }
                });
                $(this).html("编辑");
                $(this).toggleClass("edit-btn");
                $(this).toggleClass("save-btn");
            });

            //批量点击编辑按钮
            $("#batch-edit-btn").click(function(){
                $(".edit-btn").click();
            });
            $("#batch-save-btn").click(function(){
                $(".save-btn").click();
            });
        });



   
