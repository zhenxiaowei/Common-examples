var Zxw = function () {
    var uploadinit = function (zoneid, successCallback, removefileCallback, errorCallback) {
        Dropzone.autoDiscover = false;
        var addpeopledropzone = new Dropzone("#" + zoneid, {
            url: webroot + '/fileupload/img.do',
            previewTemplate: '<div class="dz-preview dz-file-preview"><img data-dz-thumbnail /></div>',
            addRemoveLinks: true,
            dictRemoveFile: '删除',
            thumbnailWidth: 376,
            thumbnailHeight: 250,
            method: 'post',
            filesizeBase: 1024,
            sending: function (file, xhr, formData) {
                formData.append("filesize", file.size);
            },
            success: function (file, response, e) {
                if (response && response.msg) {
                    if (successCallback) {
                        successCallback(response);
                    }
                }
            },
            addedfile: function (file) {
                this.files = [];
                this.files.push(file);
                $('.dz-preview', $('#' + zoneid)).remove();
                if (this.element === this.previewsContainer) {
                    this.element.classList.add("dz-started");
                }
                if (this.previewsContainer) {
                    file.previewElement = Dropzone.createElement(this.options.previewTemplate.trim());
                    file.previewTemplate = file.previewElement;
                    this.previewsContainer.appendChild(file.previewElement);
                }
            },
            removedfile: function (file) {
                var _ref;
                if (file.previewElement) {
                    if ((_ref = file.previewElement) != null) {
                        _ref.parentNode.removeChild(file.previewElement);
                    }
                }
                if (removefileCallback)
                    removefileCallback(file);
                return this._updateMaxFilesReachedClass();
            },
            error: function (file, message) {
                if (errorCallback)
                    errorCallback(file, message);
                logDebug('err=' + message);
                if (message.error) {
                    showError(message.error);
                }
            }
        });

        $('#' + zoneid).data('dropzone', addpeopledropzone)
        return addpeopledropzone;
    }

    var importinit = function (zoneid, url, successCallback, removefileCallback, errorCallback) {
        Dropzone.autoDiscover = false;
        var addpeopledropzone = new Dropzone("#" + zoneid, {
            url: url,
            previewTemplate: '<div class="dz-preview dz-file-preview"><img data-dz-thumbnail /></div>',
            addRemoveLinks: true,
            dictRemoveFile: '删除',
            thumbnailWidth: 10,
            thumbnailHeight: 10,
            method: 'post',
            maxFilesize: 10,
            dictFileTooBig: "文件最大10M",
            sending: function (file, xhr, formData) {
                formData.append("filesize", file.size);
            },
            success: function (file, response, e) {
                if (response && response.msg) {
                    if (successCallback) {
                        successCallback(response);
                    }
                }
            },
            addedfile: function (file) {
                this.files = [];
                this.files.push(file);
                $('.dz-preview', $('#' + zoneid)).remove();
                if (this.element === this.previewsContainer) {
                    this.element.classList.add("dz-started");
                }
                if (this.previewsContainer) {
                    file.previewElement = Dropzone.createElement(this.options.previewTemplate.trim());
                    file.previewTemplate = file.previewElement;
                    this.previewsContainer.appendChild(file.previewElement);
                }
            },
            removedfile: function (file) {
                var _ref;
                if (file.previewElement) {
                    if ((_ref = file.previewElement) != null) {
                        _ref.parentNode.removeChild(file.previewElement);
                    }
                }
                if (removefileCallback)
                    removefileCallback(file);
                return this._updateMaxFilesReachedClass();
            },
            error: function (file, message) {
                if (errorCallback) {
                    if (message.msg) {
                        errorCallback(file, message);
                    } else {
                        errorCallback(file, {
                            msg: message
                        });
                    }
                } else {
                    logDebug('err=' + message);
                    if (message.error) {
                        showError(message.error);
                    }
                }
            }
        });

        $('#' + zoneid).data('dropzone', addpeopledropzone)
        return addpeopledropzone;
    }

    var formValidateOption = {
        errorElement: 'span',
        errorClass: 'help-block help-block-error',
        focusInvalid: false,
        ignore: "",

        invalidHandler: function (event, validator) {
            var error2 = $('.alert-danger', event.target).show();
            $('span', error2).html("缺少必填项");
            var success2 = $('.alert-success', event.target).hide();
            Metronic.scrollTo(error2, -200);
        },

        errorPlacement: function (error, element) {
            var icon = $(element).parent('.input-icon').children('i');
            icon.removeClass('fa-check').addClass("fa-warning").empty();
            icon.attr("data-original-title", error.text()).tooltip();
        },

        highlight: function (element) {
            $(element).closest('.form-group').removeClass("has-success").addClass('has-error');
        },

        unhighlight: function (element) {

        },

        success: function (label, element) {
            var icon = $(element).parent('.input-icon').children('i');
            $(element).closest('.form-group').removeClass('has-error').addClass('has-success');
            icon.removeClass("fa-warning").addClass("fa-check");
        },

        submitHandler: function (form) {
        }
    }

    var select2format = function (state) {
        if (!state.id)
            return state.text;
        return "&nbsp;&nbsp;" + state.text;
    }


    var showFormErrMsg = function (msg, errorobj, autohide) {
        if (typeof(autohide) == undefined) autohide = true;
        $('span', errorobj).html('');
        if (msg instanceof Array) {
            $(msg).each(function (i, d) {
                $('span', errorobj).append($('<div>').html(d));
            });
        } else {
            $('span', errorobj).html(msg);
        }
        if (autohide) {
            setTimeout(function () {
                errorobj.hide();
            }, "10000");
        }
        errorobj.show();
    }


    var distributeValueToInput = function (data, form) {
        $("input,select,textarea,email,hidden", form).each(function (i) {
            var typeInput = $(this).attr("type");
            var name = $(this).data("name") ? $(this).data("name") : $(this).attr("name");
            if ($.type(typeInput) === 'undefined')
                typeInput = $(this).is("select") ? "select" : $(this).is("textarea") ? "textarea" : "";
            if (typeInput == "radio" || typeInput == "checkbox") {
                if ($(this).val() == (data[name] + "")) {
                    $(this).attr("checked", true).parent().addClass('checked');
                }
            } else if (typeInput == "text" || typeInput == "hidden" || typeInput == "email") {
                $(this).attr("value", data[name]);
            } else if (typeInput == "select") {
                $(this).val(data[name]);
            } else if (typeInput == "textarea") {
                $(this).val(data[name]);
            }
        });
    }
    var distributeValueToShow = function (data, form) {
        $('.data-item', form).text('');
        $('div.clone', form).remove();

        $('.data-item', form).each(function () {
            $(this).text(data[$(this).data("name")]);
        });

        $(data.yuangaos).each(function (i, obj) {
            var modal = $(".yuangaorens", form);
            var yuangaobox = $(".yuangaoren.first", modal);
            if (i > 0) {
                yuangaobox = yuangaobox.clone();
                yuangaobox.removeClass('first').addClass('clone').appendTo(modal);
            }
            $('.data-item', yuangaobox).each(function () {
                $(this).text(obj[$(this).data("name")]);
            });

        })
        $(data.beigaos).each(function (i, obj) {
            var modal = $(".beigaorens", form);
            var beigaobox = $(".beigaoren.first", modal);
            if (i > 0) {
                beigaobox = beigaobox.clone();
                beigaobox.removeClass('first').addClass('clone').appendTo(modal);
            }
            $('.data-item', beigaobox).each(function () {
                $(this).text(obj[$(this).data("name")]);
            });
        })
    }

    return {
        uploadinit: uploadinit,
        importinit: importinit,
        formValidateOption: formValidateOption,
        showFormErrMsg: showFormErrMsg,
        distributeValueToInput: distributeValueToInput,
        distributeValueToShow: distributeValueToShow,

    }
}();
//常用正则验证表达式
var reg = {
    //手机号验证
    validate: function (num) {
        var exp = /^1[3-9]\d{9}$/;
        return exp.test(num);
    },
    //身份证号验证
    idCard: function (num) {
        var exp = /^[1-9]{1}[0-9]{14}$|^[1-9]{1}[0-9]{16}([0-9]|[xX])$/;
        return exp.test(num);
    },
    //邮箱验证
    email: function (name) {
        var exp = /^[a-zA-Z0-9_]+@[a-z0-9]+\.[a-z]+$/;
        return exp.test(name);
    },
    //验证用户名
    userName: function (username) {
        var str = username;
        var regname = /^[a-zA-Z\d]\w{3,20}[a-zA-Z\d]$/;
        // var regname = /^[a-zA-Z]{1}([a-zA-Z0-9]|[._]){4,19}$/;//只能输入5-20个以字母开头、可带数字、“_”、“.”的字串
        var objExp = new RegExp(regname);
        if (objExp.test(str) == true) {
            return true;
        } else {
            return false;
        }
    },

    //验证密码
    passWord: function (PWD) {
        var str = PWD;
        var regpassword = /^[a-zA-Z0-9]{6,20}$/;//只能输入6-20个字母、数字
        // var regpassword = /^(\w){6,20}$/;//只能输入6-20个字母、数字、下划线
        var objExp = new RegExp(regpassword);
        if (objExp.test(str) == true) {
            return true;
        } else {
            return false;

        }
    },
};

//获取UID拼接为对象  var obj = queryURLParmeter(window.location.search);
function queryURLParmeter(url) {
    var reg = /([^?&=]+)=([^?&=]+)/g, obj = {}, res = reg.exec(url);
    while (res) {
        var fir = res[1], tww = res[2];
        obj[fir] = tww;
        res = reg.exec(url);
    }
    return obj;
};

//获取根路径 var webroot=zxw.getContextPath();
function getContextPath1() {
    var curWwwPath = window.document.location.href;
    var pathName = window.document.location.pathname;
    var pos = curWwwPath.indexOf(pathName);
    var localhostPath = curWwwPath.substring(0, pos);
    var projectName = pathName.substring(0, pathName.substr(1).indexOf('/') + 1);
    return (localhostPath + projectName)
};

//获取时间
function getTime() {
    var time = new Date();
    var year = time.getFullYear();//获得年
    var month = time.getMonth() + 1;//0-11代表我们的1-12月
    var day = time.getDate();//日
    var w = time.getDay();//0-6代表周日-周六
    var wStr = "日一二三四五六", week = wStr.charAt(w);
    var hours = time.getHours();//时
    var minutes = time.getMinutes();//分
    var seconds = time.getSeconds();//秒
    var mlSeconds = time.getMilliseconds();//毫秒
    return year + "年" + zero(month) + "月" + zero(day) + "日 星期" + week + " " + zero(hours) + "时" + zero(minutes) + "分" + zero(seconds) + "秒";
};

//转换时间戳
function getDates(nS) {
    //new Date(parseInt(nS) * 1000).toLocaleString().replace(/年|月/g, "-").replace(/日/g, " ").getDay();
    var time = new Date(parseInt(nS) * 1000);
    var year = time.getFullYear();//获得年
    var month = time.getMonth() + 1;//0-11代表我们的1-12月
    var day = time.getDate();//日
    var w = time.getDay();//0-6代表周日-周六
    var week = Arabia_To_SimplifiedChinese(w);
    var hours = time.getHours();//时
    var minutes = time.getMinutes();//分
    var seconds = time.getSeconds();//秒
    var mlSeconds = time.getMilliseconds();//毫秒
    return year + "年" + zero(month) + "月" + zero(day) + "日 星期" + week + " " + zero(hours) + "时" + zero(minutes) + "分" + zero(seconds) + "秒";
};

//倒计时
function getSpanTime(string) {
    var tarTime = new Date(string);
    var nowTime = new Date();
    var tarSpan = tarTime.getTime();
    var nowSpan = nowTime.getTime();
    var diffTime = tarSpan - nowSpan;//当前时间距离目标时间的毫秒差
    //接下来我们用毫秒差算出包含多少个小时、分钟、秒

    //1 算出总毫秒差中包含的小时有几个
    var hour = Math.floor(diffTime / (1000 * 60 * 60));
    //2 算出当前这几个小时占了多少毫秒
    var hourMs = hour * 60 * 60 * 1000;
    //3 接下来算分钟的时候，需要把小时占用的减去
    var spanMs = diffTime - hourMs;
    //4 开始算spanMs中包含多少分钟
    var minute = Math.floor(spanMs / (1000 * 60));
    //5 算这么多分钟占多少毫秒
    var minuteMs = minute * 60 * 1000;
    //6 算秒的时候把分钟占用的减去
    spanMs = spanMs - minuteMs;
    //7 算剩下的包含多少秒
    var second = Math.floor(spanMs / 1000);
    return zero(hour) + ":" + zero(minute) + ":" + zero(second);
};

//补"0"函数
function zero(value) {
    return value < 10 ? "0" + value : value;
};

//阿拉伯数字转换为简写汉字
function Arabia_To_SimplifiedChinese(Num) {
    for (i = Num.length - 1; i >= 0; i--) {
        Num = Num.replace(",", "")//替换Num中的“,”
        Num = Num.replace(" ", "")//替换Num中的空格
    }
    if (isNaN(Num)) { //验证输入的字符是否为数字
        //alert("请检查小写金额是否正确");
        return;
    }
    //字符处理完毕后开始转换，采用前后两部分分别转换
    part = String(Num).split(".");
    newchar = "";
    //小数点前进行转化
    for (i = part[0].length - 1; i >= 0; i--) {
        if (part[0].length > 10) {
            //alert("位数过大，无法计算");
            return "";
        }//若数量超过拾亿单位，提示
        tmpnewchar = ""
        perchar = part[0].charAt(i);
        switch (perchar) {
            case "0":
                tmpnewchar = "零" + tmpnewchar;
                break;
            case "1":
                tmpnewchar = "一" + tmpnewchar;
                break;
            case "2":
                tmpnewchar = "二" + tmpnewchar;
                break;
            case "3":
                tmpnewchar = "三" + tmpnewchar;
                break;
            case "4":
                tmpnewchar = "四" + tmpnewchar;
                break;
            case "5":
                tmpnewchar = "五" + tmpnewchar;
                break;
            case "6":
                tmpnewchar = "六" + tmpnewchar;
                break;
            case "7":
                tmpnewchar = "七" + tmpnewchar;
                break;
            case "8":
                tmpnewchar = "八" + tmpnewchar;
                break;
            case "9":
                tmpnewchar = "九" + tmpnewchar;
                break;
        }
        switch (part[0].length - i - 1) {
            case 0:
                tmpnewchar = tmpnewchar;
                break;
            case 1:
                if (perchar != 0) tmpnewchar = tmpnewchar + "十";
                break;
            case 2:
                if (perchar != 0) tmpnewchar = tmpnewchar + "百";
                break;
            case 3:
                if (perchar != 0) tmpnewchar = tmpnewchar + "千";
                break;
            case 4:
                tmpnewchar = tmpnewchar + "万";
                break;
            case 5:
                if (perchar != 0) tmpnewchar = tmpnewchar + "十";
                break;
            case 6:
                if (perchar != 0) tmpnewchar = tmpnewchar + "百";
                break;
            case 7:
                if (perchar != 0) tmpnewchar = tmpnewchar + "千";
                break;
            case 8:
                tmpnewchar = tmpnewchar + "亿";
                break;
            case 9:
                tmpnewchar = tmpnewchar + "十";
                break;
        }
        newchar = tmpnewchar + newchar;
    }
    //替换所有无用汉字，直到没有此类无用的数字为止
    while (newchar.search("零零") != -1 || newchar.search("零亿") != -1 || newchar.search("亿万") != -1 || newchar.search("零万") != -1) {
        newchar = newchar.replace("零亿", "亿");
        newchar = newchar.replace("亿万", "亿");
        newchar = newchar.replace("零万", "万");
        newchar = newchar.replace("零零", "零");
    }
    //替换以“一十”开头的，为“十”
    if (newchar.indexOf("一十") == 0) {
        newchar = newchar.substr(1);
    }
    //替换以“零”结尾的，为“”
    if (newchar.lastIndexOf("零") == newchar.length - 1) {
        newchar = newchar.substr(0, newchar.length - 1);
    }
    return newchar;
};

// 取数组最小值、最大值、对象合并、数组求和、数组排序从小到大、数组排序从大到小、数组去重
var Arrays = {
    // 取数组最小值
    getMin: function (array) {
        return Math.min.apply(null, array);
    },

    // 取数组最大值
    getMax: function (array) {
        return Math.max.apply(null, array);
    },

    // 数组中对象合并
    combine: function (array) {
        console.log(array);
        return $.extend.apply(null, array);
    },
    //数组求和
    arySum: function (ary) {
        //常规循环
        /*        var s=0;
         for(var i=ary.length-1;i>=0;i--){
         s+=ary[i];
         }
         return s;*/

        //forEach遍历
        /*        var s=0;
         ary.forEach(function (val, idx, ary) {
         s+=val;
         });
         return s;*/

        //eval方法
        return eval(ary.join("+"));
    },

    //数组排序从小到大
    arySortMax: function (ary) {
        //内置方法排序
        ary.sort(function (a, b) {
            return a - b;//从小到大排序
        });
        return ary;

        //数组冒泡排序
        /*        for (var i = 0; i < ary.length; i++) {
         for (var j = 0; j < ary.length - 1 - i; j++) {
         if (ary[j] > ary[j + 1]) {
         var b = ary[j + 1];
         ary[j + 1] = ary[j];
         ary[j] = b;
         }
         }
         }
         return ary;*/

        //数组快速排序
        /*        if (ary.length <= 1) {
         return ary;
         }
         var pointIndex = Math.floor(ary.length / 2);
         var zjx = ary.splice(pointIndex, 1)[0];
         var left = [];
         var right = [];
         for (var i = 0; i < ary.length; i++) {
         var cur = ary[i];
         cur < zjx ? left.push(cur) : right.push(cur);
         }
         return (arySortMax(left)).concat([zjx], arySortMax(right));*/

        //数组插入排序
        /*        var newAry = [];
         newAry.push(ary[0]);
         for (var i = 1; i < ary.length; i++) {
         var cur = ary[i];
         for (var j = newAry.length - 1; j >= 0;) {
         if (cur < newAry[j]) {
         j--;
         if (j === -1) {
         newAry.unshift(cur);
         }
         } else {
         newAry.splice(j + 1, 0, cur);
         j = -1;
         }
         }

         }
         return newAry;*/
    },

    //数组排序从大到小
    arySortMin: function (ary) {
        ary.sort(function (a, b) {
            return b - a;//从大到小排序
        });
        return ary;
    },

    //数组去重
    aryToHeavy: function (a) {
        for (var i = 0; i < a.length; i++) {
            for (var j = i + 1; j < a.length; j++) {
                if (a[i] == a[j]) {
                    a.splice(j, 1);
                    j--;
                }
            }
        }
        return a;
    },

    //数组的随机项
    aryRandom: function (ary) {
        return ary[Math.floor(Math.random() * ary.length)];
    }
};

//任意数求和
function sum() {
    var total = null;
    for (var i = 0; i < arguments.length; i++) {
        var cur = Number(arguments[i]);
        if (!isNaN(cur)) {
            total += cur;
        }
    }
    return total;
};

//随机验证码
function getCode() {
    var strRange = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var baseStr = '';
    for (var i = 0; i < 4; i++) {
        var ran = Math.round(Math.random() * (61));
        var ranChar = strRange.charAt(ran);
        baseStr += ranChar;
    }
    return baseStr;
};

//rnd:兼容版的求一定范围的随机数
function rnd(n, m) {
    n = Number(n);
    m = Number(m);
    if (isNaN(n) || isNaN(m)) {
        return Math.round();
    }
    if (n > m) {
        var tmp = n;
        n = m;
        m = tmp;
    }
    return Math.round(Math.random() * (m - n) + n);
};


//调用两个方法验证用户名和密码是否合法，给出提示
//<input type="button" value="登录" class="submit" onclick="formPrompt(myform) "/>
//myform为form的id
function formPrompt(myform) {
    if (myform.username.value == "") {
        alert("请输入用户名");
        myform.username.focus();
        return;
    }
    if (!reg.userName(myform.username.value)) {
        alert("您输入的用户名不存在");
        myform.username.focus();
        return;
    }
    if (myform.password.value == "") {
        alert("请输入密码");
        myform.password.focus();
        return;
    }
    if (!reg.passWord(myform.password.value)) {
        alert("您输入的密码错误");
        myform.password.focus();
        return;
    }
    var username = myform.username.value;
    var password = myform.password.value;
    //submit(username,password)
};

//字符串方法 字符串分割为数组、字符串长度截取(从某一个字符向前截取)、字符串全部替换、两个字符串拼接（合并）
var string = {
    //字符串分割为数组
    toArray: function (string) {
        return string.split(",");
    },
    //字符串长度截取(从某一个字符向前截取)
    cutStr: function (str, len) {
        var temp, icount = 0, patrn = /[^\x00-\xff]/, strre = "";
        for (var i = 0; i < str.length; i++) {
            if (icount < len - 1) {
                temp = str.substr(i, 1);
                if (patrn.exec(temp) == null) {
                    icount = icount + 1;
                } else {
                    icount = icount + 2;
                }
                strre += temp;
            } else {
                break;
            }
        }
        return strre + " ";
    },
    //字符串全部替换
    replaceAll: function (bigStr, str1, str2) {//把bigStr中所有str1替换为str2
        var reg = new RegExp(str1, 'gm');
        return bigStr.replace(reg, str2);
    },
    //两个字符串拼接（合并）
    concat: function (str1, str2) {
        var str;
        str = str1.concat(str2);
        return str;
    }
};

//是否是字符串、数字、对象、数组、时间、boolean、函数、null、undefined
var isElement = {
    //是否字符串
    isString: function (o) {
        return Object.prototype.toString.call(o).slice(8, -1) === 'String';
    },

    //是否数字
    isNumber: function (o) {
        return Object.prototype.toString.call(o).slice(8, -1) === 'Number';
    },

    //是否对象
    isObj: function (o) {
        return Object.prototype.toString.call(o).slice(8, -1) === 'Object';
    },

    //是否数组
    isArray: function (o) {
        return Object.prototype.toString.call(o).slice(8, -1) === 'Array';
    },

    //是否时间
    isDate: function (o) {
        return Object.prototype.toString.call(o).slice(8, -1) === 'Date';
    },

    //是否Boolean
    isBoolean: function (o) {
        return Object.prototype.toString.call(o).slice(8, -1) === 'Boolean';
    },

    //是否函数
    isFunction: function (o) {
        return Object.prototype.toString.call(o).slice(8, -1) === 'Function';
    },

    //是否为null
    isNull: function (o) {
        return Object.prototype.toString.call(o).slice(8, -1) === 'Null';
    },

    //是否为undefined
    isUndefined: function (o) {
        return Object.prototype.toString.call(o).slice(8, -1) === 'Undefined';
    },
};

//判断是否为空
function emptyFun(obj) {
    var obj = obj;
    if (obj == "" || obj == null || obj == "null" || obj == "undefined") {
        return true;
    } else {
        return false;
    }

};

//是否为PC端
function isPC() {
    var userAgentInfo = navigator.userAgent;
    var Agents = ["Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod"];
    var flag = true;
    for (var i = 0; i < Agents.length; i++) {
        if (userAgentInfo.indexOf(Agents[i]) > 0) {
            flag = false;
            break;
        }
    }
    return flag;
};

//自定义notetitle方法   (需要增加jQuery文件)
function noteTitle(id) {
    var node = $(id).find("[note]")
    node.each(function () {
        var a = $(this);//当前元素
        var note = a.attr('note');//获取到当前元素的note值
        if (note == undefined || note == "") return;
        a.data('note', note).removeAttr('note').off("mouseover mouseout").on('mouseover mouseout', function (e) {//从当前元素移除note属性
            if (e.type == 'mouseover') {
                var offset = a.offset();
                $("<div id=\"titleRewrite\" style='	max-width: 200px;position: absolute;z-index: 15999;padding: 2px 10px;border-radius: 3px;color: #797979;background: #f9f9f9;word-wrap: break-word;border: 1px solid #797979;'></div>").appendTo($("body")).html(note).css({
                    top: offset.top + a.outerHeight(),
                    left: offset.left + a.outerWidth() / 2 + 10
                }).fadeIn(function () {
                    setTimeout(function () {
                        $(this).remove();
                    }, $(this).text().length * 800);
                });
            } else {
                setTimeout(function () {
                    $("#titleRewrite").remove();
                }, 0);
            }
        });
        $("#titleRewrite").remove();
    });
};

//jsonp方法
//zxw.jsonp({使用方法
//    url:"/b.com/b.json",
//    success: function (d) {
//        //数据处理
//    },
//    time:5000,
//    fail: function () {
//        //错误处理
//    }
//});
function jsonp(config) {
    var options = config || {};//需要配置url success time fail四个属性
    var callbackName = ("jsonp_" + Math.random()).replace(".", "");
    var oHead = document.getElementsByTagName('head')[0];
    var oScript = document.createElement('script');
    oHead.appendChild(oScript);
    window[callbackName] = function (json) {//创建jsonp回调函数
        oHead.removeChild(oScript);
        clearTimeout(oScript.timer);
        window[callbackName] = null;
        options.success && options.success(json);//先删除script标签，实际上执行的是success函数
    };
    oScript.src = options.url + '?' + callbackName;//发送请求
    if (options.time) {//设置超时处理
        oScript.timer = setTimeout(function () {
            window[callbackName] = null;
            oHead.removeChild(oScript);
            options.fail({message: "超时"});

        }, options.time);

    }
}

//返回顶部
/*    $(点击的元素).click(function () {
    goTop($(this));
    $("html body").animate({
       scrollTop:"0px"
   },"600")
});*/
function goTop(num) {
    $(window).scroll(function () {
        var a = $(window).scrollTop();
        if (a > 100) {
            $(num).fadeIn();
        } else {
            $(num).fadeOut();
        }
    });

};

//阻止冒泡（兼容IE）
function stopBubble(e) {
    e = e || window.event;
    if (e.stopPropagation) {
        e.stopPropagation();//W3C阻止冒泡方法
    } else {
        e.cancelBubble = true;//IE阻止冒泡方法
    }
};

//深度拷贝数组或对象
function clone(obj) {
    var o = obj.constructor == Object ? new obj.constructor() : new obj.constructor(obj.valueOf());
    for (var key in obj) {
        if (o[key] != obj[key]) {
            if (typeof (obj[key]) == 'object') {
                o[key] = mods.cloneObj(obj[key]);
            } else {
                o[key] = obj[key];
            }
        }
    }
    return o;
};

var webroot = getContextPath1();


if (toastr) {
    toastr.options = {
        "closeButton": true,
        "debug": false,
        "positionClass": "toast-top-right",
        "onclick": null,
        "showDuration": "1000",
        "hideDuration": "1000",
        "timeOut": "5000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    };
}

function showError(value) {
    if (toastr) {
        toastr['error'](value);
    } else {
        console.error(value);
    }
}

function showWarning(value) {
    if (toastr) {
        toastr['warning'](value);
    } else {
        console.warning(value);
    }
}

function showInfo(value) {
    if (toastr) {
        toastr['info'](value);
    } else {
        console.info(value);
    }
}

function showSuccess(value) {
    if (toastr) {
        toastr['success'](value);
    } else {
        console.success(value);
    }
}

// post(url,data,function(msg){},function(msg){showError(msg.msg);})
function post(url, data, succCallback, failcallback) {
    var load = new loadingmodal();
    load.start();
    $.ajax({
        type: "post",
        url: url,
        data: data,
        dataType: "json",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        success: function (msg) {
            load.stop();
            succCallback(msg);
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            load.stop();
            try {
                if (XMLHttpRequest.responseJSON) {
                    var data = XMLHttpRequest.responseJSON || "";
                    if (data.msg == "no login") {
                        window.location.href = webroot + "/";
                    } else {
                        failcallback(data);
                    }
                } else {
                    failcallback({'msg': "通讯异常"});
                }
            } catch (e) {
                logError(e);
                failcallback(e.message);
            }
        }
    });
};

// put(url,data,function(msg){},function(msg){showError(msg.msg);})
function put(url, data, succCallback, failcallback) {
    var load = new loadingmodal();
    load.start();
    $.ajax({
        type: "put",
        url: url,
        data: data,
        dataType: "json",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        success: function (msg) {
            load.stop();
            succCallback(msg);
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            load.stop();
            try {
                if (XMLHttpRequest.responseJSON) {
                    var data = XMLHttpRequest.responseJSON || "";
                    if (data.msg == "no login") {
                        window.location.href = webroot + "/";
                    } else {
                        failcallback(data);
                    }
                } else {
                    failcallback({'msg': "通讯异常"});
                }

            } catch (e) {
                logError(e);
                failcallback(e.message);
            }
        }
    });
};

// get(url,function(msg){},function(msg){showError(msg.msg);})
function get(url, succcallback, failcallback, data) {
    var load = new loadingmodal();
    load.start();
    $.ajax({
        type: "get",
        url: url,
        data: data || "",
        dataType: "json",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        success: function (msg) {
            load.stop();
            succcallback(msg);
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            load.stop();
            try {
                if (XMLHttpRequest.responseJSON) {
                    var data = XMLHttpRequest.responseJSON || "";
                    if (data.msg == "no login") {
                        window.location.href = webroot + "/";
                    } else {
                        failcallback(data);
                    }
                } else {
                    failcallback({'msg': "通讯异常"});
                }

            } catch (e) {
                logError(e);
                failcallback(e.message);
            }
        }
    });
}

// dele(url,function(msg){},function(msg){showError(msg.msg);})
function dele(url, succcallback, failcallback, data) {
    var load = new loadingmodal();
    load.start();
    $.ajax({
        type: "delete",
        url: url,
        data: data || "",
        dataType: "json",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        success: function (msg) {
            load.stop();
            succcallback(msg);
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            load.stop();
            try {
                if (XMLHttpRequest.responseJSON) {
                    var data = XMLHttpRequest.responseJSON || "";
                    if (data.msg == "no login") {
                        window.location.href = webroot + "/";
                    } else {
                        failcallback(data);
                    }
                } else {
                    failcallback({'msg': "通讯异常"});
                }
            } catch (e) {
                logError(e);
                failcallback(e.message);
            }
        }
    });
};

function alert(e) {
    $("body").find("div#alert_modal,div.modal-backdrop").remove();
    var div = document.createElement("div");
    div.id = 'alert_modal';
    $("body").append(div);
    $("#alert_modal").html('<div class="modal fade" id="alertModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">' +
        '<div class="modal-dialog"><div class="modal-content">' +
        '<div class="modal-header">' +
        '<button type="button" class="close" data-dismiss="modal" aria-hidden="true"> &times; </button><h4 class="modal-title" id="myModalLabel">信息</h4></div> ' +
        '<div class="modal-body">' +
        '' + e + '</div>' +
        ' <div class="modal-footer"><button type="button" class="btn btn-primary" data-dismiss="modal">确定</button></div>' +
        '</div></div></div>');
    $("#alertModal").modal("show");
}

function confirmBox(e) {
    $("body").find("div#alertModalBox,div.modal-backdrop").remove();
    var div = document.createElement("div");
    div.id = 'alertModalBox';
    $("body").append(div);
    $("#alertModalBox").html('<div class="modal fade" id="confirmModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">' +
        '<div class="modal-dialog"><div class="modal-content">' +
        '<div class="modal-header">' +
        '<button type="button" class="close" data-dismiss="modal" aria-hidden="true"> &times; </button><h4 class="modal-title" id="myModalLabel">信息</h4></div> ' +
        '<div class="modal-body">' +
        '' + e + '</div>' +
        ' <div class="modal-footer"><button type="button" class="btn btn-default" data-dismiss="modal">取消</button>' +
        '<button type="button" class="btn btn-primary">确定</button></div>' +
        '</div></div></div>');
    $("#confirmModal").modal("show");
}