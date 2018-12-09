define(["utils",'../parts/language'],function(utils,language){
    function getAbsulotePosition(obj) {
        var obj1 = obj;
        var position = { "left": obj1.offsetLeft, "top": obj1.offsetTop };

        while (obj1.offsetParent) {
            obj1 = obj1.offsetParent;
            position.left += obj1.offsetLeft;
            position.top += obj1.offsetTop;
        }
        while (obj.parentNode != document.body) {
            obj = obj.parentNode;
            position.left -= obj.scrollLeft;
            position.top -= obj.scrollTop;
        }
        return position;
    }

    function getComputedPosition(obj) {
        var matrix = window.getComputedStyle(obj, null),
            x, y;
        var s = true;
        if (s) {
            matrix = matrix["-webkit-transform"].split(')')[0].split(', ');
            x = +(matrix[12] || matrix[4]);
            y = +(matrix[13] || matrix[5]);
        } else {
            x = +matrix.left.replace(/[^-\d.]/g, '');
            y = +matrix.top.replace(/[^-\d.]/g, '');
        }

        return { x: x, y: y };
    }


    var DatePicker = function (config) {
        var me = this;
        config = config||{};
        me.CanTouch = "ontouchend" in document ? true : false;
        var testStyle = document.createElement("DIV").style;
        if ("-webkit-transform" in testStyle) {
            me.transitionend = "webkitTransitionEnd";
            me.transform = "-webkit-transform";
            me.transition = "-webkit-transition";
        }
        else {
            me.transitionend = "transitionend";
            me.transform = "transform";
            me.transition = "transition";
        }
        me.mode = "";
        me.Now = new Date();
        me.RealModeArr = [];
        me.rowsCount = 5;
        me.itemHeight = utils.getRealHeight(40);
        me.ParentContainer = document.body;
        //{"index":0,"key":"3434","data":[{"text":"asd","value":"asdasd"}]}
        me.extendArr = [];
        me.DTP_Obj = [];
        me.mapping = {
            "yyyy": { "label": '', "start": 1950, "end": 2040 },
            "MM": { "label": '', "start": 1, "end": 12 },
            "dd": { "label": '', "start": 1, "end": 31 },
            "dd(c)": { "label": '', "start": 1, "end": 31 },
            "hh": { "label": '', "start": 0, "end": 23 },
            "mm": { "label": '', "start": 0, "end": 59 }
            // "yyyy": { "label": language.datePicker.year, "start": 1950, "end": 2040 },
            // "MM": { "label": language.datePicker.month, "start": 1, "end": 12 },
            // "dd": { "label": language.datePicker.day, "start": 1, "end": 31 },
            // "dd(c)": { "label": language.datePicker.day, "start": 1, "end": 31 },
            // "hh": { "label": language.datePicker.hour, "start": 0, "end": 23 },
            // "mm": { "label": language.datePicker.min, "start": 0, "end": 59 }
        };

        me.DTP_Conatiner = document.createElement("DIV");
        me.DTP_Conatiner.className = "tmpk-wrapper";

        me.DTP_Mid_Area = document.createElement("DIV");
        me.DTP_Mid_Area.className = "tmpk-mid-area";
        me.DTP_Mid_Area.style.height = me.itemHeight+"px";
        me.DTP_Mid_Area.style.top = (me.itemHeight*2)+"px";

        me.GradientLayer = document.createElement("DIV");
        me.GradientLayer.className = "tmpk-gradient-layer";


        var TopBar = document.createElement("DIV");
        TopBar.className = "tmpk-top-area";
        TopBar.style.height = utils.getRealHeight(42)+"px";

        var CancelCol = document.createElement("DIV");
        var cancelBtnClassName = config.cancelBtnClassName||"";
        CancelCol.className = "tmpk-top-col tmpk-cancel "+cancelBtnClassName;
        CancelCol.innerHTML =config.cancelText||language.cancel;
        CancelCol.addEventListener("click", function (e) {
            me.CancelClick(e);
        });

        var AutoCol = document.createElement("DIV");
        AutoCol.className = "tmpk-top-col tmpk-auto-col";
        me.TitleLabel = document.createElement("DIV");

        AutoCol.appendChild(me.TitleLabel);


        var OkCol = document.createElement("DIV");
        var okBtnClassName = config.okBtnClassName||"";
        OkCol.className = "tmpk-top-col "+okBtnClassName;
        OkCol.innerHTML = language.confirm;
        OkCol.addEventListener("click", function (e) {
            me.OkClick(e);
        })

        var ClearCol = document.createElement("DIV");
        ClearCol.className = "tmpk-top-col tmpk-clear";
        ClearCol.innerHTML = language.clear;
        ClearCol.addEventListener("click", function (e) {
            me.ClearClick(e);
        })
        TopBar.appendChild(CancelCol);

        TopBar.appendChild(AutoCol);

        TopBar.appendChild(ClearCol);

        TopBar.appendChild(OkCol);

        me.DTP_Conatiner.appendChild(TopBar);
        me.DateArea_Container = document.createElement("DIV");
        me.DateArea_Container.className = "tmpk-date-area";
        me.DateArea_Container.style.height = me.rowsCount *me.itemHeight+"px";

        me.DateArea_Container.appendChild(me.DTP_Mid_Area);
        me.DateArea_Container.appendChild(me.GradientLayer);
        me.DTP_Conatiner.appendChild(TopBar);
        me.DTP_Conatiner.appendChild(me.DateArea_Container);

        me.isDone = false;


    }
    DatePicker.prototype = {
        "CancelClick": function (e) {
            var me = this;
            if (me.CancelMethod != undefined) {
                me.CancelMethod();
            }
            me.hide();
        },
        "OkClick": function (e) {
            var me = this;
            var val = me.getValue();
            if (me.OkMethod != undefined) {
                if(me.mode.toLocaleLowerCase()==="yyyy-mm-dd(c)"){
                    val=utils.ConvertDateToStr(val,'yyyy年MM月dd日');
                }
                me.OkMethod(val);
            }
            me.hide();
        },
        "setTitle": function (str) {
            var me = this;
            me.TitleLabel.innerHTML = str || "";
            return me;
        },
        "bind": function (event, fun) {
            var me = this;
            if (event == "clear") {
                me.ClearMethod = fun;
            } else if (event == "ok") {
                me.OkMethod = fun;
            } else if (event == "cancel") {
                me.CancelMethod = fun;
            }else if (event == "change") {
                me.ChangeMethod = fun;
            }
            return me;
        },
        "ClearClick": function (e) {
            var me = this;
            if (me.ClearMethod != undefined) {
                me.ClearMethod();
            }
            me.hide();
        },
        "done": function () {
            var me = this;
            if (!me.isDone) {
                me._InitLayout();
                me._InitEvent();
                me._InitLimit();
                me.isDone = true;
            }

            return me;
        },

        "_CompleteDateInfo": function (key_index_Mapping) {
            var me = this;
            var Re = { "Date": null, "DateStr": null };
            if (key_index_Mapping["yyyy"] == undefined || key_index_Mapping["yyyy"].value == undefined) {
                return Re;
            }
            key_index_Mapping["MM"] = key_index_Mapping["MM"] || { "index": 0, "value": 1 };
            key_index_Mapping["MM"].value = key_index_Mapping["MM"].value || 1;
            key_index_Mapping["dd"] = key_index_Mapping["dd"] || { "index": 0, "value": 1 };
            key_index_Mapping["dd"].value = key_index_Mapping["dd"].value || 1;
            key_index_Mapping["hh"] = key_index_Mapping["hh"] || { "index": 0, "value": 0 };
            key_index_Mapping["hh"].value = key_index_Mapping["hh"].value || 0;
            key_index_Mapping["mm"] = key_index_Mapping["mm"] || { "index": 0, "value": 0 };
            key_index_Mapping["mm"].value = key_index_Mapping["mm"].value || 0;
            Re.mapping = key_index_Mapping;
            Re.DateStr = key_index_Mapping["yyyy"].value + "-" + key_index_Mapping["MM"].value + "-" + key_index_Mapping["dd"].value + " " + key_index_Mapping["hh"].value + ":" + key_index_Mapping["mm"].value;
            Re.Date = new Date(Re.DateStr.replace("-", "/").replace("-", "/"));
            return Re;
        },
        "setMaxValue": function (dateStr) {
            var me = this;
            if (!dateStr || !me.isDone) {
                return me;
            }
            me.max_key_index_Mapping = me._getKey_IndexMappingByDateStr(dateStr, false);
            me.max_date_info = me._CompleteDateInfo(me.max_key_index_Mapping);
            if (me.min_date_info != undefined && me.max_date_info.Date < me.min_date_info.Date) {
                me.max_date_info = null;
                return me;
            }
            if (me.mapping["yyyy"].show) {
                var year = me.max_date_info.Date.getFullYear();
                var index = year - me.mapping["yyyy"].start;
                me.mapping["yyyy"].limit.max = me._reviseIndexByKeyByIndex(me.mapping["yyyy"], index);
            }
            return me;
        },
        "setMinValue": function (dateStr) {
            var me = this;
            if (!dateStr || !me.isDone) {
                return me;
            }
            me.min_key_index_Mapping = me._getKey_IndexMappingByDateStr(dateStr, false);
            me.min_date_info = me._CompleteDateInfo(me.min_key_index_Mapping);
            if (me.max_date_info != undefined && me.max_date_info.Date < me.min_date_info.Date) {
                me.min_date_info = null;
                return me;
            }
            if (me.mapping["yyyy"].show) {
                var year = me.min_date_info.Date.getFullYear();
                var index = year - me.mapping["yyyy"].start;
                me.mapping["yyyy"].limit.min = me._reviseIndexByKeyByIndex(me.mapping["yyyy"], index);
            }
            return me;
        },
        "_InitLimit": function () {
            var me = this;
            for (var i = 0, j = me.RealModeArr.length; i < j; i++) {
                var key = me.RealModeArr[i];
                var curMapping = me.mapping[key];
                if (curMapping.start != undefined) {
                    curMapping.limit = { "min": 0, "max": curMapping.end - curMapping.start };
                } else {
                    curMapping.limit = { "min": 0, "max": _curMappingInfo.data.length - 1 };
                }
            }

        },
        "show": function (dateValueStr, extendvalueJsonObj) {
            var me = this;
            window.setTimeout(function(){
                if (dateValueStr == undefined || (/^\s*$/.test(dateValueStr))) {
                    me.setValueByDate(me.Now);
                } else {
                    if(dateValueStr.indexOf('-')===-1){
                        dateValueStr= me.formatDate(dateValueStr)
                    }
                    me.setValueByDateStr(dateValueStr);
                }
                me.DTP_Width = me.GradientLayer.offsetWidth;
                me.DTP_Height = me.GradientLayer.offsetHeight;

                me.POS = { left: 0, top: (window.innerHeight - me.DateArea_Container.offsetHeight) };
            },200);
            me.DTP_Conatiner.className = "tmpk-wrapper tmpk-wrapper-show";
            me.BackCover.style["display"] = "block";

            return me;
        },
        "hide": function () {
            var me = this;
            me.DTP_Conatiner.className = "tmpk-wrapper";
            me.BackCover.style["display"] = "none";
            return me;
        },
        "_getKey_IndexMappingByDateStr": function (dateValueStr, shouldLimit) {
            var me = this;
            var ValueMapping = {};
            var valueArr = [];
            if (dateValueStr != undefined) {
                valueArr = me.getValueArr(dateValueStr);
            }
            for (var i = 0, j = me.TimeArrModeArr.length; i < j; i++) {
                var key = me.TimeArrModeArr[i];
                var value = parseInt(valueArr[i]);
                var index_value = me._getValueIndexByValue(me.mapping[key], value, shouldLimit);
                ValueMapping[key] = index_value;
            }
            return ValueMapping;
        },
        "_getValueIndexByValue": function (listMapping, Value, shouldLimit) {
            var me = this;
            if (listMapping.start != undefined) {
                var min = shouldLimit ? listMapping.limit.min : 0;
                var max = shouldLimit ? listMapping.limit.max : me.getItemCount(listMapping);
                if (isNaN(Value)) {
                    return { "index": min, "value": listMapping.start };
                }
                var Index = Value - listMapping.start;
                Index = Index < min ? min : Index;
                Index = Index > max ? max : Index;
                return { "index": Index, "value": (Index + listMapping.start) };
            }
            else {
                throw new Error("未实现");
            }
        },
        "_reviseIndexByKeyByIndex": function (listMapping, valueIndex) {
            var me = this;
            if (isNaN(valueIndex)) {
                return 0;
            }
            var maxIndex = me.getItemCount(listMapping) - 1;
            if (valueIndex > maxIndex) {
                return maxIndex;
            }
            if (valueIndex < 0) {
                return 0;
            }
            return valueIndex;
        },
        "_reviseValueIndexByKeyByIndex": function (listMapping, valueIndex) {
            if (isNaN(valueIndex)) {
                return listMapping.limit.min;
            }
            if (valueIndex > listMapping.limit.max) {
                return listMapping.limit.max;
            }
            if (valueIndex < listMapping.limit.min) {
                return listMapping.limit.min;
            }
            return valueIndex;

        },
        "setPosByKeyByIndex": function (key, valIndex) {
            var me = this;
            //处理valIndex

            var listMapping = me.mapping[key];
            valIndex = me._reviseValueIndexByKeyByIndex(listMapping, valIndex);
            var listIndex = listMapping.index;
            var ddInfo = me.DTP_Obj[listIndex];
            var List = ddInfo.obj;
            var posY = me.itemHeight * (-valIndex + 2);
            ddInfo.y = posY;
            ddInfo.index = valIndex;
            List.style[me.transition] = "none";
            List.style[me.transform] = "translate(0," + (posY) + "px)";
        },
        "getValue": function () {
            var me = this;
            var key_value = {};
            var mode = me.mode;

            for (var i = 0, j = me.TimeArrModeArr.length; i < j; i++) {
                var key = me.TimeArrModeArr[i];
                mode = mode.replace(key, me.getValueByKey(key));
            }
            return (mode);
        },
        "setValueByDateStr": function (dateValueStr) {
            var me = this;
            var dataIndexMapping = me._getKey_IndexMappingByDateStr(dateValueStr, true);
            for (var key in dataIndexMapping) {
                me.setPosByKeyByIndex(key, dataIndexMapping[key].index);
                dataIndexMapping["MM"] = dataIndexMapping["MM"] || { "index": 0, "value": 1 };
                dataIndexMapping["dd"] = dataIndexMapping["dd"] || { "index": 0, "value": 1 };
                dataIndexMapping["yyyy"] = dataIndexMapping["yyyy"] || { "index": 0, "value": 1 };
                me.ModifyDayCount("MM", dataIndexMapping["yyyy"].value, dataIndexMapping["MM"].value, dataIndexMapping["dd"].value);
            }
        },
        "setValueByDate": function (Date) {
            var year = Date.getFullYear();
            var month = Date.getMonth() + 1;
            var day = Date.getDate();
            var hour = Date.getHours();
            var min = Date.getMinutes();
            var me = this;
            me.setValueByDateStr(year + "-" + month + "-" + day + " " + hour + ":" + min);

        },
        "getValueByKey": function (key) {
            var me = this;
            var curMappingObj = me.mapping[key];
            if (curMappingObj.show != true) {
                return null;
            }
            var CurObj = me.DTP_Obj[curMappingObj.index];
            if (curMappingObj.start != undefined) {
                var val = curMappingObj.start + CurObj.index;
                val = val < 10 ? "0" + val : val;
                return val;
            }
            return curMappingObj.data[CurObj.index].value;
        },
        "setParent": function (parentObj) {
            var me = this;
            me.ParentContainer = parentObj;
            return me;
        },
        "setMode": function (Mode) {
            var me = this;
            me.mode = Mode;
            return me;
        },
        "_InitEvent": function () {
            var me = this;
            me.BackCover.addEventListener("click", function (e) {
                me.hide();
            });

             me.BackCover.addEventListener("touchmove", function (e) {
                e.preventDefault();
                e.stopPropagation();
            });

            var touchstartStr = me.CanTouch ? "touchstart" : "mousedown";
            var touchmoveStr = me.CanTouch ? "touchmove" : "mousemove";
            var touchendStr = me.CanTouch ? "touchend" : "mouseup";
            me.GradientLayer.addEventListener(touchstartStr, function (e) {
                TouchStart(e);
            });
            me.GradientLayer.addEventListener(touchmoveStr, function (e) {
                TouchMove(e);
            });
            me.GradientLayer.addEventListener(touchendStr, function (e) {
                TouchEnd(e);
            });


            me.curListIndex = 0, me.curPosY = 0, me.touchleave = false, canmove = false,
                me.touchStart = { "x": 0, "Y": 0 },
                me.touchEnd = { "x": 0, "y": 0 },
                me.timeMark = { "start": 0, "end": 0 };

            function TouchStart(event) {
                me.e = event;
                event.preventDefault();
                var touches = event.touches ? event.touches[0] : event;
                me.timeMark.start = new Date();
                me.touchStart.x = touches.pageX;
                me.curListIndex = Math.ceil((me.touchStart.x / me.DTP_Width) * me.RealModeArr.length) - 1;
                me.touchEnd.y = me.touchStart.y = touches.pageY;
                var curObjInfo = me.DTP_Obj[me.curListIndex];
                var pos = getComputedPosition(curObjInfo.obj);
                curObjInfo.obj.style[me.transition] = "";
                curObjInfo.obj.style["-webkit-transform"] = "translate(0," + pos.y + "px)";
                me.curPosY = curObjInfo.y = pos.y;
                me.touchleave = false;
                canmove = true;
            }

            function TouchMove(event) {
                if (me.touchleave || !canmove) {
                    return;
                }
                event.preventDefault();
                var touches = event.touches ? event.touches[0] : event;
                var diff = me.touchEnd.y - me.touchStart.y;
                me.touchEnd.y = touches.pageY;
                var touchX = touches.pageX;
                var curObjInfo = me.DTP_Obj[me.curListIndex];
                var obj = curObjInfo.obj;
                curObjInfo.y = me.curPosY + diff;
                obj.style[me.transform] = "translate(0," + curObjInfo.y + "px)";
                if (touchX <= 10 || touchX >= me.DTP_Width - 10 || (me.touchEnd.y - me.POS.top) <= 10 || (me.touchEnd.y - me.POS.top) >= me.DTP_Height - 10) {
                    TouchEnd();
                    me.touchleave = true;
                    return;
                }
                else {
                    me.touchleave = false;
                }
            }
            function TouchEnd(e) {
                canmove = false;
                if (me.touchleave) {
                    return;
                }
                me.timeMark.end = new Date();
                var touchDuring = me.timeMark.end - me.timeMark.start;
                var touchDiff = me.touchEnd.y - me.touchStart.y;
                var delta = 0;

                var curObjInfo = me.DTP_Obj[me.curListIndex];
                var listMappingInfo = me.mapping[me.RealModeArr[me.curListIndex]];
                var duration = 0;
                if (touchDuring < 350 && Math.abs(touchDiff) > 10) {
                    var Re = me.getCanScrollValue(me.getCanScrollMaxHeight(listMappingInfo), touchDiff);
                    delta = Re.value;
                    duration = Re.duration;
                }else{
                    window.setTimeout(function () {
                        me._transitionEnd(null,true,me.curListIndex);
                    },20);
                }
                curObjInfo.y = me.getRealPosY(curObjInfo.y + delta, me.getLimit(listMappingInfo), curObjInfo);
                curObjInfo.obj.style[me.transition] = me.transform + " "+duration+"s cubic-bezier(0.333333, 0.666667, 0.666667, 1)";
                curObjInfo.obj.style[me.transform] = "translate(0," + curObjInfo.y + "px)";
            }


        },
        "_InitLayout": function () {
            var me = this;
            if (me.RealModeArr.length == 0) {
                me.RealModeArr = me.getModeArr();
                me.TimeArrModeArr = me.getModeArr();
            }
            if (me.RealModeArr.length == 0) {
                me.mode = "yyyy-MM-dd";
                me.RealModeArr = ["yyyy", "MM", "dd"];
            }
            me.listwidth = (100 / me.RealModeArr.length) + "%";
            for (var i = 0, j = me.RealModeArr.length; i < j; i++) {
                var mark = me.RealModeArr[i];
                var listInfo = me.mapping[mark];
                listInfo["show"] = true;
                listInfo["index"] = i;
                me._InitLayout_List(mark, listInfo, i);
            }

            me.BackCover = document.createElement("DIV");
            me.BackCover.className = "tmpk-back-cover";
            me.ParentContainer.appendChild(me.BackCover);
            me.ParentContainer.appendChild(me.DTP_Conatiner);


        },
        "extendData": function (extendConfig) {
            //格式可以是:{"label": "分", "start": 0, "end": 59,"index":0,"key":""}
            //{"label":"","data":[{"text":"","value":""}],"index":0,"key":""}
            var me = this;
            if (me.RealModeArr.length == 0) {
                me.RealModeArr = me.getModeArr();
                me.TimeArrModeArr = me.getModeArr();
            }
            var curkey = extendConfig.key;
            if (curkey == undefined || curkey == "") {
                return me;
            }
            if (me.mapping[curkey] != undefined) {
                throw new Error("已存在相应的key");
            }
            me.mapping[curkey] = extendConfig;
            var insertIndex = extendConfig.index || 0;
            insertIndex = isNaN(insertIndex) || insertIndex < 0 ? 0 : insertIndex;
            insertIndex = insertIndex > me.RealModeArr.length - 1 ? me.RealModeArr.length : insertIndex;
            me.RealModeArr.splice(insertIndex, 0, curkey);
            return me;
        },
        "_InitLayout_List": function (key, dataConfig, index) {
            var me = this;
            var DTP_List = document.createElement("UL");
            me.DTP_Obj[index] = { "obj": DTP_List, "y": 0, "index": 0, "key": key };

            if (dataConfig.start != undefined) {
                var start = dataConfig.start;
                var end = dataConfig.end;
                for (var s = start; s <= end; s++) {
                    var item = document.createElement("LI");
                    item.className = "tmpk-item";
                    item.style.height = me.itemHeight+"px";
                    item.style.lineHeight = me.itemHeight+"px";
                    s = s < 10 ? "0" + s : s;
                    var innerHTML = s + dataConfig.label;
                    item.innerHTML = innerHTML;
                    DTP_List.appendChild(item);
                }
            } else {
                for (var i = 0, j = dataConfig.data.length; i < j; i++) {
                    var curData = dataConfig.data[i];
                    var item = document.createElement("LI");
                    item.className = "tmpk-item";
                    item.style.height = me.itemHeight+"px";
                    item.style.lineHeight = me.itemHeight+"px";
                    var innerHTML = curData.text;
                    item.innerHTML = innerHTML;
                    DTP_List.appendChild(item);
                }
            }
            DTP_List.className = "tmpk-list";
            DTP_List.setAttribute("index", index);
            DTP_List.setAttribute("key", key);
            DTP_List.style["width"] = me.listwidth;
            DTP_List.addEventListener(me.transitionend, function (e) {
                me._transitionEnd(e);
            })
            me.DateArea_Container.appendChild(DTP_List);
        },
        "_setMaxLimitByKeyByIndex": function (key, limitIndex) {

        },
        "setLimit": function () {
            //初始化的时候设置大小值的时候
            //TransitionEnd 没有Intransition的时候
        },
        "formatDate":function (date) {
            var reg=/[^0-9]/mg;
            if(date.indexOf('-')===-1){
                date=date.replace(reg,'-').slice(0,date.length-1);
                return date
            }else{
                var dateArr=date.split('-');

                return dateArr[0]+"年"+Number(dateArr[1])+"月"+Number(dateArr[2])+"日";
            }
        },
        _transitionEnd: function (e,noTansitin,lisIndex) {
            var me = this;
            var CurObj;
            if(noTansitin===true){
                CurObj = me.DTP_Obj[lisIndex];
            }else{
                CurObj = me.DTP_Obj[e.target.getAttribute("index")];

            }
            CurObj.isInTransition = false;
            var key = CurObj.key;

            var year = me.getValueByKey("yyyy");
            var month = me.getValueByKey("MM") || 1;
            var day = me.getValueByKey("dd") || 1;
            var hour = me.getValueByKey("hh") || 0;
            var min = me.getValueByKey("mm") || 0;
            if (year != null) {
                me.CurDateStr = year + "-" + month + "-" + day + " " + hour + ":" + min;
                me.CurDate = new Date(year, month - 1, day, hour, min);
            } else {
                me.CurDateStr = "";
                me.CurDate = null;
            }


            me.ModifyDayCount(key, year, month, day);

            //me.max_key_index_Mapping me.min_key_index_Mapping
            if (me.max_date_info != undefined && me.CurDate != null) {
                var maxDate = me.max_date_info.Date;

                if (me.CurDate > maxDate) {
                    me.setValueByDate(maxDate);
                }
            }

            if (me.min_date_info != undefined && me.min_date_info != null) {
                var minDate = me.min_date_info.Date;

                if (me.CurDate < minDate) {
                    me.setValueByDate(minDate);
                }
            }

            if (me.ChangeMethod != undefined) {
                me.ChangeMethod(me.getValue());
            }

        },
        "ModifyDayCount": function (key, year, month, day) {
            var me = this;

            if (me.mapping["dd"].show && me.mapping["yyyy"].show && me.mapping["MM"].show) {
                if ((key == "MM" && me.getIsInTransitionByKey("yyyy") != true) || (key == "yyyy" && me.getIsInTransitionByKey("MM") != true)) {
                    var limitDay = me.DayNumOfMonth(year, month);
                    var ddMapping = me.mapping["dd"];
                    ddMapping.limit.max = limitDay - 1;
                    var ddindex = ddMapping.index;
                    var ddInfo = me.DTP_Obj[ddindex];
                    var DDList = ddInfo.obj;
                    var needHideCount = 31 - limitDay;
                    for (var i = 30; i >= 27; i--) {
                        if (needHideCount > 0) {
                            DDList.childNodes[i].style["display"] = "none";
                            needHideCount -= 1;
                        } else {
                            DDList.childNodes[i].style["display"] = "block";
                        }
                    }
                    if (day > limitDay) {
                        me.setPosByKeyByIndex("dd", ddMapping.limit.max);
                    }
                }

            }
        },
        getIsInTransitionByKey: function (key) {
            var me = this;
            var index = me.mapping[key].index;
            var curObj = me.DTP_Obj[index];
            return curObj.isInTransition;
        },
        getModeArr: function () {
            var me = this;
            var Re = [];
            var preArr = (me.mode || "").split(" ");

            var wrong = false;
            for (var i = 0, j = preArr.length; i < j; i++) {
                var splitChar = "-";
                var curStr = preArr[i];
                if (curStr.indexOf("-") > 0) {

                } else if (curStr.indexOf(":") > 0) {
                    splitChar = ":";
                } else {
                    Re.push(curStr);
                    break;
                }
                var innerArr = curStr.split(splitChar);
                if (wrong) {
                    break;
                }
                for (var m = 0, n = innerArr.length; m < n; m++) {
                    var ele = innerArr[m];
                    if (!me.mapping[ele]) {
                        //如果配置错误 那么就直接跳出
                        wrong = true;
                        break;
                    }
                    Re.push(ele);
                }
            }
            return Re;

        },
        getValueArr: function (timeStr) {
            var me = this;
            var Re = [];
            var preArr = (timeStr || "").split(" ");

            for (var i = 0, j = preArr.length; i < j; i++) {
                var innerArr = i == 0 ? preArr[i].split("-") : preArr[i].split(":");
                for (var m = 0, n = innerArr.length; m < n; m++) {
                    var ele = innerArr[m];
                    Re.push(ele);
                }
            }
            return Re;
        },
        getCanScrollValue: function (canScrollMaxHeight, touchDiff) {
            var me = this;
            var dir = touchDiff < 0 ? -1 : 1;
            touchDiff = Math.abs(touchDiff);
            var duration = 0.5;var value = me.itemHeight * 3 * dir;
            if (touchDiff > me.itemHeight * me.rowsCount * 3 / 5) {
                //console.log("1: " + ( canScrollMaxHeight * dir * 0.6));
                value= canScrollMaxHeight * dir * 0.9;
            }
            else if (touchDiff <= me.itemHeight * me.rowsCount * 3 / 5 && touchDiff > me.itemHeight * me.rowsCount * 2 / 5) {
                //console.log("2: " + (canScrollMaxHeight * dir * 0.2));
                value= canScrollMaxHeight * dir * 0.7;
                duration = 0.4;
            }
            else if (touchDiff <= me.itemHeight * me.rowsCount * 2 / 5 && touchDiff > me.itemHeight * me.rowsCount * 1 / 5) {
                value= canScrollMaxHeight * dir * 0.6;
                duration = 0.3;
            }
            else {
                //console.log("3: " + (itemHeight * 2 * dir));
                value= me.itemHeight * 3 * dir;
                duration = 0.3;
            }
            return {value:value,duration:duration};
        },
        getRealPosY: function (wantToY, limitIndex, _curObjInfo) {
            // limitIndex.min=12;
            //limitIndex.max=21;
            var me = this;
            var upper = me.itemHeight * Math.floor(me.rowsCount / 2) - (limitIndex.min) * me.itemHeight;
            var lower = me.itemHeight * Math.ceil(me.rowsCount / 2) - (limitIndex.max + 1) * me.itemHeight;
            var real = wantToY < upper ? (wantToY > lower ? wantToY : lower) : upper;
            /*获得精确的定位*/

            var AccurateIndex = Math.abs(Math.round(real / me.itemHeight - Math.floor(me.rowsCount / 2)));
            _curObjInfo.index = AccurateIndex;
            return me.itemHeight * Math.floor(me.rowsCount / 2) - AccurateIndex * me.itemHeight;
        },
        getLimit: function (_curMappingInfo) {
            return _curMappingInfo.limit;
        },
        getItemCount: function (_curMappingInfo) {
            var me = this;
            if (_curMappingInfo.start != undefined) {
                var rc = _curMappingInfo.end - _curMappingInfo.start + 1;
                return rc;
            }
            return _curMappingInfo.data.length;
        },
        getCanScrollMaxHeight: function (_curMappingInfo) {
            var me = this;
            var rc = me.getItemCount(_curMappingInfo);
            rc = rc > 20 ? 10 : rc;
            return rc * me.itemHeight;
        },
        DayNumOfMonth: function (Year, Month) {
            var d = new Date(Year, Month, 0);
            return d.getDate();
        }

    }



    return DatePicker;





});
