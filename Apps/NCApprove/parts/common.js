define(["utils", "md5"], function (utils, md5) {
    var mainColor = "#29B6F6";
    var titleColor = "#333333";
    var seTitleColor = "#999999";
    var descColor = "#666666";
    var backColor = "#f7f7f7";
    var HeadColor = "#37B7FD";

    // 追加的单据数据(localStorage)
    var ADDITIONAL_FORM_DATA = "ADDITIONAL_FORM_DATA";
    var imgExtReg = /(\.thumb\.jpg|\.middle\.jpg|\.big\.jpg)$/;
    var Re = {
        thumbImg: function (src) {
            return src && src.replace(imgExtReg, '.thumb.jpg') || '#';
        },

        descColor: descColor,
        backColor: backColor,
        mainColor: mainColor,
        seTitleColor: seTitleColor,
        labelColor: "#666666",
        titleColor: titleColor,
        HeadColor: HeadColor,

        ADDITIONAL_FORM_DATA: ADDITIONAL_FORM_DATA,
        replaceUrl: function (oldid, newid, pageviewInstance) {
            var urlArr = window.location.href.split("taskId=" + oldid);
            var url;
            if (urlArr.length === 1) {
                url = window.location.href + "&taskId=" + newid;
            } else {
                url = window.location.href.split("taskId=" + oldid).join("taskId=" + newid);
            }
            pageviewInstance.pageManager.preventHasChange();
            window.location.replace(url);
        },
        gotoDetail: function (sender, pageviewInstance) {
            var token = pageviewInstance.params.token;
            var url = pageviewInstance.pageManager.appConfig.taskhost + '/dist/index.html#TaskDetailView?token=' + token + '&taskId=' + (sender.datasource.mirrorId || sender.datasource.id);
            window.location.href = url;
        },
        MoneyDX: function (num) {
            var strOutput = "";
            var strUnit = '仟佰拾万仟佰拾亿仟佰拾万仟佰拾元角分';
            var DX = "";
            if(!num||num==0) return "";
            if((num+'').indexOf('-')===0){
                num=num.slice(1);
            }
            if((num+'').indexOf(',')>0){
                num=num.replace(',','');
            }
            num += "00";
            var intPos = num.indexOf('.');
            if (intPos >= 0)
                num = num.substring(0, intPos) + num.substr(intPos + 1, 2);
            strUnit = strUnit.substr(strUnit.length - num.length);
            for (var i = 0; i < num.length; i++)
                strOutput += '零壹贰叁肆伍陆柒捌玖'.substr(num.substr(i, 1), 1) + strUnit.substr(i, 1);
            DX = strOutput.replace(/零角零分$/, '整').replace(/零[仟佰拾]/g, '零').replace(/零{2,}/g, '零')
                .replace(/零([亿|万])/g, '$1').replace(/零+元/, '元').replace(/亿零{0,3}万/, '亿').replace(/^元/, "零元");

            DX = DX.replace(/零分/, '');
            return DX.replace(/零角/, '零');
        },
        //自定义格式的 日期格式 （优先处理showToday字段）
        // 例子：
        // customTimestamp(14444444444,"yyyy-MM-dd   .S",true) ==> 今天 08:09:04.423
        // customTimestamp(14444444444,"yyyy-M-d h:m:s.S",false)      ==> 2006-7-2 8:9:4.18
        customTimestamp: function (timestamp, fmt, showToday) {
            var timeStr = "";
            try {
                timestamp = parseFloat(timestamp);
                var date = new Date(timestamp),
                    now = new Date(),
                    time = now.getTime(),
                    dateInfo = utils.getDateInfo(date),
                    nowDateInfo = utils.getDateInfo(now);
                time = parseInt((time - timestamp) / 1000);

                //如果是今天
                if (nowDateInfo.year === dateInfo.year && nowDateInfo.day === dateInfo.day && nowDateInfo.month === dateInfo.month && showToday) {
                    //如果要显示文字今天
                    timeStr = "今天 " + this.formatTime(date, "hh:mm");
                } else {
                    //如果不是今天，判断fmt是否存在，
                    if (fmt) {
                        timeStr = this.formatTime(date, fmt);
                    } else {
                        timeStr = this.formatTime(date, "yyyy-MM-dd hh:mm");
                    }

                }
            } catch (e) {}
            return timeStr;
        },
        //格式化日期
        // 例子：
        // (new Date()).Format("yyyy-MM-dd   .S") ==> 2006-07-02 08:09:04.423
        // (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
        formatTime: function (date, fmt) {
            var o = {
                "M+": date.getMonth() + 1, //月份
                "d+": date.getDate(), //日
                "h+": date.getHours(), //小时
                "m+": date.getMinutes(), //分
                "s+": date.getSeconds(), //秒
                "q+": Math.floor((date.getMonth() + 3) / 3), //季度
                "S": date.getMilliseconds() //毫秒
            };
            if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
            for (var k in o)
                if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            return fmt;
        },

        /**
         *  计算表单明细中需要计算的总和
         *  valueArr: Array
         * */
        sumVal: function (valueArr,nowN) {
            var Re = [];
            var sum = 0;
            var digit = 0;
            var maxDigit = 0;
            for (var i = 0, j = valueArr.length; i < j; i++) {
                if(typeof valueArr[i]!=="undefined"){
                    var val = valueArr[i].toString();
                    var var_arr = val.split(".");
                    if (var_arr.length === 2) {
                        digit = var_arr[1].length;
                        if (digit > maxDigit) {
                            maxDigit = digit;
                        }
                    }
                    try {
                        val = parseFloat(val);
                        if (!isNaN(val)) {
                            Re.push(val);
                        }
                    } catch (e) {

                    }
                }

            }

            //精度丢失
            if (maxDigit > 0) {
                var m = Math.pow(10, maxDigit);
                for (var ii = 0, jj = Re.length; ii < jj; ii++) {
                    sum += Math.round((Re[ii] * m) * 1000) / 1000;
                }
                sum = sum / m;
            } else {
                for (var iii = 0, jjj = Re.length; iii < jjj; iii++) {
                    sum += Re[iii];
                }
            }
            //    if(maxDigit>0){
            //          var m = Math.pow(10, maxDigit);
            //          Re = parseInt(Re * m, 10) / m;
            //    }
            //@huangzhy 对合计后保留几位小数处理 20170620
            return nowN>=1?sum.toFixed(nowN):parseInt(sum);
            // return parseInt(sum);
        },
        /**
         *  计算表单明细中需要计算的平均值
         *  valueArr: Array
         * */
        avgVal: function (valueArr,nowN) {
            var sum = this.sumVal(valueArr),
                avg = 0;
            if (valueArr.length) {
                avg = sum / valueArr.length;
            }
            return nowN>=1?avg.toFixed(nowN):parseInt(avg);;
            // return parseInt(avg);
        },
        /**
         *  计算表单明细中需要计算的最大值
         *  valueArr: Array
         * */
        maxVal: function (valueArr) {
            var newArr = [];
            valueArr.forEach(function (item) {
                newArr.push(item);
            });
            return Math.max.apply(Math, newArr);
        },
        /**
         *  计算表单明细中需要计算的最小值
         *  valueArr: Array
         * */
        minVal: function (valueArr) {
            var newArr = [];
            valueArr.forEach(function (item) {
                newArr.push(item);
            });
            return Math.min.apply(Math, newArr);
        },
        /**
         * 金额千分位转换
         * @param {*} value 
         */
        thousandthValue:function(value){
            var regMoney=/(-?\d)(\d{3})/;
            if(!value) return;
            value=value+"";
            while(regMoney.test(value)){
                value=value.replace(regMoney,"$1,$2");
            }
            return value;
        }
    };
    return Re;
});
