/**
 * Created by zhenxiaowei on 2017/5/6.
 */
(function () {
    window.H5ProgressBar = function (obj) {
        this.height = obj.height;
        this.width = obj.width;
        this.speed = obj.speed;

    };

    //在界面上布局元素
    H5ProgressBar.prototype.drawLayout = function () {
        document.write("<p id=\"loadTip\">开始下载</p>")
        document.write("<progress value=\"0\" max=\"100\" id=\"proDownFile\"></progress> ")
        document.write("<button id=\"load\">下载</button> <br> ")
        document.write("<br> ")
        document.write("设置宽度：<input  id=\"width\" placeholder=\"number类型\"><button id=\"setWidthBtn\">确定</button> <br> ")
        document.write("设置高度：<input  id=\"height\" placeholder=\"number类型\"><button id=\"setHeightBtn\">确定</button> <br> ")
        document.write("设置速度：<input  id=\"speed\" placeholder=\"number类型(1-100%)\"><button id=\"setSpeedBtn\" >确定</button> <br> ")
    };
    //初始化方法，即程序入口，一开始从这里执行F
    H5ProgressBar.prototype.init = function () {
        this.drawLayout();
        var objPro = document.getElementById('proDownFile');
        var width = this.width + "px"
        var height = this.height + "px"


        objPro.style.width = width;
        objPro.style.height = height;

        this.setProgressWidth();
        this.setProgressHeight();
        this.load();
        this.setLoadSpeed();

    }
    //设置进度条的宽度
    H5ProgressBar.prototype.setProgressWidth = function () {
        var setWidthBtn = document.getElementById('setWidthBtn');
        setWidthBtn.addEventListener('click', function () {
            var progress = document.getElementById('proDownFile');
            var width = document.getElementById('width');
            var newWidth = width.value
            if (newWidth.length == 0) {
                alert("不能为空");
            } else {
                if (!isNaN(newWidth)) {
                    progress.style.width = newWidth + "px"
                }
                else {
                    alert("请输入数字类型")
                }

            }
        });
    }
    //设置进度条的高度
    H5ProgressBar.prototype.setProgressHeight = function () {
        var setHeightBtn = document.getElementById('setHeightBtn');
        setHeightBtn.addEventListener('click', function () {
            var progress = document.getElementById('proDownFile');
            var height = document.getElementById('height');
            var newHeight = height.value

            if (newHeight.length == 0) {
                alert("不能为空");
            } else {
                if (!isNaN(newHeight)) {
                    progress.style.height = newHeight + "px"
                }
                else {
                    alert("请输入数字类型")
                }

            }
        });
    }
    var intValue = 0;
    var intTimer;
    var objTip;
    //下载
    H5ProgressBar.prototype.load = function () {
        var load = document.getElementById('load');
        var time = 1000 - this.speed * 10;

        load.addEventListener('click', function () {

            Btn_Click(time);

        });

    }
    //设置下载速度
    H5ProgressBar.prototype.setLoadSpeed = function () {
        var speed = document.getElementById('setSpeedBtn');
        speed.addEventListener('click', function () {
            var speed = document.getElementById('speed');
            var newSpeed = speed.value

            if (newSpeed.length == 0) {
                alert("不能为空");
            }
            else {
                if (!isNaN(newSpeed)) {
                    if (newSpeed <= 0 || newSpeed > 100) {
                        alert("请设置1-100%之内的数")

                    } else {
                        Btn_Click(1000 - newSpeed * 10);
                    }
                }
                else {
                    alert("请输入数字类型")
                }
            }
        })
    }
    //设置时间
    function Btn_Click(time) {
        var progress = document.getElementById('proDownFile');
        intValue = progress.value

        if (intValue == progress.max) {
            reset()
        }
        else {
            intTimer = setInterval(Interval_handler, time);
        }

    }

    //重新下载
    function reset() {
        intValue = 0;
        var progress = document.getElementById('proDownFile');
        intTimer = setInterval(Interval_handler, 1000);
    }

    //定时事件
    function Interval_handler() {
        intValue++;
        var objPro = document.getElementById('proDownFile');
        objTip = document.getElementById('loadTip');
        objPro.value = intValue;
        if (intValue >= objPro.max) {
            clearInterval(intTimer);
            objTip.innerHTML = "下载完成";
        } else {
            intValue += Math.random() * 1.8;
            intValue = parseFloat(intValue.toFixed(1));
            objTip.innerHTML = "正在下载" + intValue + "%";

        }
    }

})();