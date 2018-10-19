<%@ page language="java" import="java.util.*" pageEncoding="utf-8"%>
<%
String path = request.getContextPath();
String loginPath = "../user/UserLogin!init.action";


%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="ja" lang="ja">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta http-equiv="Content-Language" content="ja" />
<meta http-equiv="Content-Script-Type" content="text/javascript" />
<meta http-equiv="Content-Style-Type" content="text/css" />
<title>エラー</title>
<link href="../main/css/font-awesome.min.css" rel="stylesheet" media="screen" />
<link href="../main/css/bootstrap.min.css" rel="stylesheet" media="screen" />
<link href="../main/css/_base.css" rel="stylesheet" type="text/css" />
<link href="../main/css/_style.css" rel="stylesheet" type="text/css" />
</head>
    <body>

        <div id="contents">
            <div align="center" style="margin-top : 100px" name="errorMessageDiv">
				<span style="font-size:25px;">
					<%=request.getAttribute("sysErrorMessage")%>
				</span>
				<br/><br/><br/><br/><br/><br/>
				<span style="font-size:25px;">				 
						<input type="button" value="OK" class="green_button" onclick="javascript:window.opener=null;window.open('','_self');window.close();"/>

				</span>
            </div>
        </div>
    </body>
</html>
