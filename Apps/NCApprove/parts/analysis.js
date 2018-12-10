/**
 * Created by Gin on 17/3/9.
 */
define(["./common"], function (c) {
    var jsonList = [],regMoney = /(-?\d+)(\d{3})/;
    var Re = {
        getAnalysis_ifroms: function (ifroms, formDataList, currentActivityId,formDataExtraInfo) {
            window._formData = [];
            var jsontemp = JSON.parse(ifroms[0].jsontemp);
            jsonList = [];
            try{
                if(jsontemp.form&&jsontemp.form.processAuthinfo&&jsontemp.form.processAuthinfo[currentActivityId]){
                    var processAuthinfo = jsontemp.form.processAuthinfo[currentActivityId];
                    if (!processAuthinfo) {
                        processAuthinfo = jsontemp.form.processAuthinfo.fillIn;
                    }
                }
                if(jsontemp.form&&jsontemp.form.processAuthinfo&&!currentActivityId){
                    processAuthinfo = jsontemp.form.processAuthinfo.fillIn;
                }
            }catch (e){

            }

            for (var key in jsontemp) {
                if (key !== "enable" && key !== "pk_bo" && key !== "form") {
                    switch (key) {
                        case "formLayout":
                            var formLayout;
                            if (typeof jsontemp[key].layoutDetail === "object") {
                                formLayout = jsontemp[key].layoutDetail;
                            } else {
                                formLayout = JSON.parse(jsontemp[key].layoutDetail);
                            }
                            formLayout=this.selectSetHide(formLayout,formDataList[0])
                            for (var i = 0; i < formLayout.layoutDetail.length; i++) {
                                if (formLayout.layoutDetail[i].componentKey === "DataTable"&&this.isHide(formLayout.layoutDetail[i].fieldId, processAuthinfo)) {
                                    for (var x = 0; x < formLayout.layoutDetail[i].layoutDetail.length; x++) {
                                        var layoutDetail_x = formLayout.layoutDetail[i].layoutDetail[x];
                                        if (layoutDetail_x.isOperationRule && layoutDetail_x.showOperValueInGird) {
                                            var table = formDataList[0][formLayout.layoutDetail[i].tableName];
                                            var nums = [];
                                            var jsonContent = {};
                                            var decimalPlace = layoutDetail_x.decimalPlace;
                                            if (table) {
                                                for (var t = 0; t < table.length; t++) {
                                                    nums.push(table[t][layoutDetail_x.columncode]);
                                                }
                                            }

                                            if (layoutDetail_x.componentKey === "Number") {
                                                //如果运算对象nums可操作的对象 返回 空串
                                                if (layoutDetail_x.isTotal) {
                                                    jsonContent.title = layoutDetail_x.title + "合计：";
                                                    jsonContent.content = nums.length === 0 ? "" : c.sumVal(nums, decimalPlace);
                                                } else if (layoutDetail_x.average) {
                                                    jsonContent.title = layoutDetail_x.title + "平均：";
                                                    jsonContent.content = nums.length === 0 ? "" : c.avgVal(nums, decimalPlace);
                                                } else if (layoutDetail_x.maxInGird) {
                                                    jsonContent.title = layoutDetail_x.title + "最大值：";
                                                    jsonContent.content = nums.length === 0 ? "" : c.maxVal(nums);
                                                } else if (layoutDetail_x.minInGird) {
                                                    jsonContent.title = layoutDetail_x.title + "最小值：";
                                                    jsonContent.content = nums.length === 0 ? "" : c.minVal(nums);
                                                }
                                                if((jsonContent.content+"").indexOf('.')>-1){
                                                    var frontvalue=(jsonContent.content+'').split('.')[0];
                                                    while (regMoney.test(frontvalue)) {
                                                        frontvalue+="";
                                                        frontvalue = frontvalue.replace(regMoney, "$1,$2")
                                                    }
                                                    jsonContent.content=frontvalue+'.'+(jsonContent.content+'').split('.')[1]
                                                }else{
                                                    while (regMoney.test(jsonContent.content)) {
                                                        jsonContent.content+="";
                                                        jsonContent.content = jsonContent.content.replace(regMoney, "$1,$2")
                                                    }
                                                }
                                                jsonContent.type = "Number";
                                                jsonList.push(jsonContent);
                                            } else if (layoutDetail_x.componentKey === "Money") {
                                                if (layoutDetail_x.isTotal) {
                                                    jsonContent.title = layoutDetail_x.title + "合计：";
                                                    jsonContent.content = nums.length === 0 || (nums.length === 1 && !nums[0]) ? "" : c.sumVal(nums, decimalPlace);
                                                    while (regMoney.test(jsonContent.content)) {
                                                        jsonContent.content+="";
                                                        jsonContent.content = jsonContent.content.replace(regMoney, "$1,$2")
                                                    }
                                                } else if (layoutDetail_x.average) {
                                                    jsonContent.title = layoutDetail_x.title + "平均：";
                                                    jsonContent.content = nums.length === 0 || (nums.length === 1 && !nums[0]) ? "" : c.avgVal(nums, decimalPlace);
                                                    while (regMoney.test(jsonContent.content)) {
                                                        jsonContent.content+="";
                                                        jsonContent.content = jsonContent.content.replace(regMoney, "$1,$2")
                                                    }
                                                } else if (layoutDetail_x.maxInGird) {
                                                    jsonContent.title = layoutDetail_x.title + "最大值：";
                                                    jsonContent.content = nums.length === 0 || (nums.length === 1 && !nums[0]) ? "" : c.maxVal(nums);
                                                    while (regMoney.test(jsonContent.content)) {
                                                        jsonContent.content+="";
                                                        jsonContent.content = jsonContent.content.replace(regMoney, "$1,$2")
                                                    }
                                                } else if (layoutDetail_x.minInGird) {
                                                    jsonContent.title = layoutDetail_x.title + "最小值：";
                                                    jsonContent.content = nums.length === 0 || (nums.length === 1 && !nums[0]) ? "" : c.minVal(nums);
                                                    while (regMoney.test(jsonContent.content)) {
                                                        jsonContent.content+="";
                                                        jsonContent.content = jsonContent.content.replace(regMoney, "$1,$2")
                                                    }
                                                }
                                                jsonContent.type = "Money";
                                                jsonContent.moneyType = nums.length === 0 || (nums.length === 1 && !nums[0]) ? "" : layoutDetail_x.moneyType;
                                                jsonList.push(jsonContent);
                                            }
                                        }
                                        // this.getComponentData(layoutDetail_x, formDataList[0], processAuthinfo, currentActivityId)
                                    }
                                }
                                // else{
                                this.getComponentData(formLayout.layoutDetail[i], formDataList[0], processAuthinfo, currentActivityId,formDataExtraInfo);
                                // }
                            }
                            break;
                        default:

                            break;
                    }
                }
            }
            return jsonList;
        },
        getComponentData: function (layoutDetail, formData, processAuthinfo, currentActivityId,formDataExtraInfo) {
            var _this = this;
            if (!formData) {
                formData = [];
            }
            this.dr=1;
            this.columncode='';
            var jsonContent = {},available=layoutDetail.available+'';
            switch (layoutDetail.componentKey) {

                case "ColumnPanel":
                case "TableLayout":
                    if (!layoutDetail.unSeeable&&layoutDetail.layoutDetail && layoutDetail.layoutDetail.length != 0&&(available!=='false')) {
                        layoutDetail.layoutDetail.forEach(function (item, index) {
                            item.layoutDetail.forEach(function (itemData, idx) {
                                if (!itemData.unSeeable&&_this.isHide(itemData.fieldId, processAuthinfo)) {
                                    if (itemData.componentKey !== "Score") {
                                        jsonContent = {};
                                        if(itemData.title[itemData.title.length-1]==="："||itemData.title[itemData.title.length-1]===":"){
                                            jsonContent.title = itemData.title;
                                        }else{
                                            jsonContent.title = itemData.title + "：";
                                        }
                                        if(itemData.hideTitle){
                                            jsonContent.title=''
                                        }
                                        jsonContent.type = itemData.componentKey;
                                        jsonContent.content = formData[itemData.columncode];
                                        //by liuhca 表格里放描述 content获取内容
                                        jsonContent.content = !jsonContent.content ? itemData.content : jsonContent.content;
                                        if (itemData.componentKey === "Paragraph") {
                                            jsonContent.style = itemData.style;
                                            if(itemData.hideTitle){
                                                jsonContent.title=''
                                            }
                                            if (layoutDetail.content) {
                                                jsonContent.content = layoutDetail.content;
                                            }
                                        } else if (itemData.componentKey === "Select") {
                                            var arrNew = [];
                                            jsonContent.content = "";
                                            if(itemData.hideTitle){
                                                jsonContent.title=''
                                            }
                                            var selectionId = formData[itemData.columncode];
                                            if (itemData.multiselect) {
                                                if (selectionId && selectionId !== "") {
                                                    if(selectionId.indexOf(',')>-1){
                                                        var middleSelectionId = selectionId.split(',');
                                                        if (middleSelectionId.length >= 1) {
                                                            middleSelectionId.forEach(function (item, index) {
                                                                var curItem = item;
                                                                if (curItem.indexOf("$$hasOther$$") === 0) {
                                                                    arrNew.push(curItem.substring(12, curItem.length))
                                                                }else{
                                                                    itemData.options.forEach(function (items, indexs) {
                                                                        if (items.selectionId == curItem) {
                                                                            arrNew.push(items.name);
                                                                        }
                                                                    });
                                                                }

                                                                var selectREP=/^\d[0-9a-zA-Z]\w$/ig;
                                                                if(!selectREP.test(curItem)&&curItem.length!==24&&curItem!=="其他"&&curItem.indexOf("$$hasOther$$")===-1){
                                                                    arrNew.push(curItem)
                                                                }
                                                            });
                                                            jsonContent.content = arrNew.join(',')
                                                        }
                                                    }else{
                                                        if(selectionId.indexOf("$$hasOther$$")>-1){
                                                            jsonContent.content=selectionId.slice(12)
                                                        }else{
                                                            itemData.options.forEach(function (items, indexs) {
                                                                if (items.selectionId == selectionId) {
                                                                    jsonContent.content=items.name;
                                                                }
                                                            });
                                                        }
                                                    }

                                                } else {
                                                    jsonContent.content = "";
                                                }
                                            } else {
                                                if (selectionId && selectionId !== "[]") {
                                                    itemData.options.forEach(function (opt, oidx) {
                                                        if (selectionId.indexOf(opt.selectionId) > -1) {
                                                            jsonContent.content += opt.name + ",";
                                                        }
                                                    });
                                                    var selectionIdArr = selectionId.split(",");
                                                    var lastSelection = selectionIdArr[selectionIdArr.length - 1];
                                                    if (lastSelection.indexOf("$$hasOther$$") === 0) {
                                                        jsonContent.content += lastSelection.substring(12, lastSelection.length) + ",";
                                                    } else {
                                                        arrNew = [];
                                                        if (itemData.options) {//针对pc提单，选项选择其他时，contents中没有$$hasOther$$字段导致移动端选项内容为空的情况
                                                            itemData.options.forEach(function (items, indexs) {
                                                                if (items.selectionId == selectionId) {
                                                                    arrNew.push(items);
                                                                }
                                                            });
                                                            if (arrNew.length !== 0) {
                                                                jsonContent.content = arrNew[0].name;
                                                            } else {
                                                                jsonContent.content = selectionId;
                                                            }
                                                        }
                                                    }
                                                    jsonContent.content = (jsonContent.content.substring(jsonContent.content.length - 1) === ',') ? jsonContent.content.substring(0, jsonContent.content.length - 1) : jsonContent.content;
                                                } else {
                                                    jsonContent.content = "";
                                                }
                                            }

                                        } else if (itemData.componentKey === "Picture") {
                                            jsonContent.url = itemData.url;
                                            if(itemData.hideTitle){
                                                jsonContent.title=''
                                            }
                                        }else if (itemData.componentKey === "Location") {
                                            if(itemData.title[itemData.title.length-1]==="："||itemData.title[itemData.title.length-1]===":"){
                                                jsonContent.title = itemData.title;
                                            }else{
                                                jsonContent.title = itemData.title + "：";
                                            }
                                            if(itemData.hideTitle){
                                                jsonContent.title=''
                                            }
                                            jsonContent.type = itemData.componentKey;
                                            jsonContent.content = formData[itemData.columncode]?JSON.parse(formData[itemData.columncode]).name:"";
                                            jsonContent.trueValue = formData[itemData.columncode];
                                        } else if (itemData.componentKey === "Reference") {
                                            if(formDataExtraInfo[itemData.columncode]){
                                                if(formDataExtraInfo[itemData.columncode].detailUrl){
                                                    jsonContent.detailUrl=formDataExtraInfo[itemData.columncode].detailUrl
                                                }else {
                                                    jsonContent.refUrl={'taskId':formDataExtraInfo[itemData.columncode].trueValue,'instId':formDataExtraInfo[itemData.columncode].procInsId||formDataExtraInfo[itemData.columncode].refPkBo}
                                                }
                                            }
                                            if(itemData.title[itemData.title.length-1]==="："||itemData.title[itemData.title.length-1]===":"){
                                                jsonContent.title = itemData.title;
                                            }else{
                                                jsonContent.title = itemData.title + "：";
                                            }
                                            if(itemData.hideTitle){
                                                jsonContent.title=''
                                            }
                                            jsonContent.type = itemData.componentKey;
                                            jsonContent.content = formData[itemData.columncode];
                                        }else if (itemData.componentKey === "Money") {
                                            if(itemData.hideTitle){
                                                jsonContent.title=''
                                            }
                                            if (jsonContent.content === "" || !jsonContent.content) {
                                                jsonContent.content = "";
                                            }else{
                                                if(!isNaN(new Number(jsonContent.content))){
                                                    jsonContent.content += "";
                                                    if (jsonContent.content[jsonContent.content.length - 2] == "E"||jsonContent.content[jsonContent.content.length - 2] == "e") {
                                                        jsonContent.content = new Number(jsonContent.content)+"";
                                                    }
                                                    if (itemData.decimalPlace !== 0) {
                                                        if (jsonContent.content.indexOf('.') > -1) {
                                                            var sliceNum = jsonContent.content.indexOf('.');
                                                            var decimalNum = jsonContent.content.slice(sliceNum + 1).length;
                                                            var zeroAdd = itemData.decimalPlace - decimalNum;
                                                            if (zeroAdd > 0) {
                                                                for (var i = 0; i < zeroAdd; i++) {
                                                                    jsonContent.content += "0"
                                                                }
                                                            }

                                                        } else {
                                                            if (itemData.decimalPlace === 1) {
                                                                jsonContent.content += ".0"
                                                            }
                                                            if (itemData.decimalPlace === 2) {
                                                                jsonContent.content += ".00"
                                                            }
                                                        }
                                                    }
                                                    while (regMoney.test(jsonContent.content) && !itemData.numberToChinese) {
                                                        jsonContent.content = jsonContent.content.replace(regMoney, "$1,$2")
                                                    }
                                                }
                                            }

                                            if (itemData.numberToChinese) {
                                                if(typeof jsonContent.content==="number"){
                                                    jsonContent.content+="";
                                                }
                                                if(jsonContent.content.indexOf(",")>-1){
                                                    var moneyArr=jsonContent.content.split(",");
                                                    jsonContent.content=parseFloat(moneyArr.join(""));
                                                }
                                                if(jsonContent.content.indexOf("-")>-1){
                                                    jsonContent.content=jsonContent.content.slice(1);
                                                    jsonContent.color="red";
                                                }
                                                if(!isNaN(new Number(jsonContent.content))){
                                                    jsonContent.content = c.MoneyDX(jsonContent.content);
                                                }
                                            }
                                            jsonContent.moneyType = itemData.moneyType;
                                        } else if (itemData.componentKey === "Password") {
                                            jsonContent.content = "";
                                            if(itemData.hideTitle){
                                                jsonContent.title=''
                                            }
                                            try {
                                                if(formData[itemData.columncode]){
                                                    var password = formData[itemData.columncode];
                                                    for (var p = 0; p < password.length; p++) {
                                                        jsonContent.content += "＊";
                                                    }
                                                }

                                            } catch (e) {
                                                console.error(e.message);
                                            }
                                        } else if (itemData.componentKey === "TaskComment") {
                                            if(itemData.hideTitle){
                                                jsonContent.title=''
                                            }
                                            if (itemData.processActivity) {
                                                var component;
                                                if(itemData.processActivity instanceof Array&&$.inArray(currentActivityId,itemData.processActivity)>-1){
                                                    component = {
                                                        name: itemData.columncode,
                                                        type: "TaskComment",
                                                        value: itemData.showStyle.toString()
                                                    };
                                                    window._formData.push(component);
                                                }else if(itemData.processActivity === currentActivityId){
                                                    component = {
                                                        name: itemData.columncode,
                                                        type: "TaskComment",
                                                        value: itemData.showStyle.toString()
                                                    };
                                                    window._formData.push(component);
                                                }
                                            }
                                        }else if (itemData.componentKey === "ReferField") {
                                            if (_this.isHide(itemData.fieldId, processAuthinfo)) {
                                                if(itemData.hideTitle){
                                                    jsonContent.title=''
                                                }
                                                if (itemData.ralateFieldId) {
                                                    var layoutDetailC = itemData.columncode;
                                                    if (formData[layoutDetailC]) {
                                                        jsonContent.content = formData[layoutDetailC];
                                                    }
                                                    if(formDataExtraInfo&&formDataExtraInfo[layoutDetailC]){
                                                        jsonContent.content= formDataExtraInfo[layoutDetailC].showValue? formDataExtraInfo[layoutDetailC].showValue:jsonContent.content;
                                                        if(formDataExtraInfo[layoutDetailC].componentKey==="Money"&&formDataExtraInfo[layoutDetailC].numberToChinese){
                                                            if(!isNaN(new Number(jsonContent.content))){
                                                                jsonContent.content = c.MoneyDX(jsonContent.content);
                                                            }
                                                        }
                                                        if(formDataExtraInfo[layoutDetailC].componentKey==="BillMakerUpperOrg"){
                                                            jsonContent.contentTemp= formDataExtraInfo[layoutDetailC].showValue? formDataExtraInfo[layoutDetailC].showValue:jsonContent.content;
                                                        }
                                                        if(formDataExtraInfo[layoutDetailC].componentKey==="DateInterval"){
                                                            if(jsonContent.content&&jsonContent.content.indexOf('[')>-1&&jsonContent.content.indexOf(',')>-1&&jsonContent.content.indexOf(']')>-1){
                                                                jsonContent.content=JSON.parse(jsonContent.content).join(' 至 ');
                                                            }
                                                        }
                                                    }
                                                    jsonContent.title = itemData.title + "：";
                                                    jsonContent.type = itemData.componentKey;
                                                }
                                            }
                                        }else if (itemData.componentKey === "Number") {//@布局中数值小数位数问题 @huangzhy 0712
                                            if(itemData.hideTitle){
                                                jsonContent.title=''
                                            }
                                            if (jsonContent.content === "" || !jsonContent.content) {
                                                jsonContent.content = "";//干掉 去掉子表默认金额 数值 by liuhca
                                            } else {
                                                if(!itemData.percent){
                                                    if (itemData.decimalPlace === 0) {
                                                        jsonContent.content = jsonContent.content + "";
                                                    } else {
                                                        if (jsonContent.content.indexOf(".") === -1) {
                                                            jsonContent.content += ".";
                                                            for (var i = 0, j = itemData.decimalPlace; i < j; i++) {
                                                                jsonContent.content += '0';
                                                            }
                                                        } else {
                                                            var sliceIndex1 = jsonContent.content.indexOf('.');
                                                            var aoe1 = jsonContent.content.slice(sliceIndex1 + 1);
                                                            var decimalQulity = Math.abs(itemData.decimalPlace - aoe1.length);
                                                            for (var i = 0, j = decimalQulity.decimalPlace; i < j; i++) {
                                                                jsonContent.content += '0';
                                                            }
                                                        }
                                                    }
                                                }else{
                                                    jsonContent.content=(jsonContent.content*100).toFixed(itemData.decimalPlace)+"%";
                                                }
                                                if(itemData.thousandth){
                                                    if((jsonContent.content+"").indexOf('.')>-1){
                                                        var frontvalue=jsonContent.content.split('.')[0];
                                                        while (regMoney.test(frontvalue)) {
                                                            frontvalue+="";
                                                            frontvalue = frontvalue.replace(regMoney, "$1,$2")
                                                        }
                                                        jsonContent.content=frontvalue+'.'+jsonContent.content.split('.')[1]
                                                    }else{
                                                        while (regMoney.test(jsonContent.content)) {
                                                            jsonContent.content+="";
                                                            jsonContent.content = jsonContent.content.replace(regMoney, "$1,$2")
                                                        }
                                                    }
                                                }
                                            }
                                        }else if(itemData.componentKey==="File"){
                                            if(itemData.hideTitle){
                                                jsonContent.title=''
                                            }
                                            if(formData[itemData.columncode]){
                                                try{
                                                    var val=JSON.parse(formData[itemData.columncode])||"";

                                                    if(val.length!==0){
                                                        val.forEach(function (itee,inn) {
                                                            itee.url=itee.url.replace(itee.filename,encodeURIComponent(itee.filename))
                                                        });
                                                        var imgExp=/.+(.JPEG|.jpeg|.JPG|.jpg|.GIF|.gif|.BMP|.bmp|.PNG|.png)$/g;

                                                        val.forEach(function (item,index) {
                                                            if(!item.type){
                                                                item.filename=item.name;
                                                                var typeIndex=item.filename.lastIndexOf(".");
                                                                var type=item.filename.slice(typeIndex+1);
                                                                if(imgExp.test(item.filename)){
                                                                    item.type="image/"+type;
                                                                }
                                                            }
                                                            if(item.url.indexOf("https://")>-1||item.url.indexOf("http://")>-1){
                                                                item.src=item.url;
                                                                item.aliOSSUrl=item.url;
                                                            }else{
                                                                item.src="https://"+item.url;
                                                                item.aliOSSUrl="https://"+item.url;
                                                            }
                                                            if(item.filename&&!item.name){
                                                                item.name=item.filename;
                                                            }
                                                            if(!item.filename&&item.name){
                                                                item.filename=item.name;
                                                            }
                                                        });
                                                        var aoewe=val.find(function (ins,its) {
                                                            return ins.type
                                                        });
                                                        if(aoewe){
                                                            val.forEach(function (item,index) {
                                                                if(!item.type){
                                                                    item.filename=item.name;
                                                                    var typeIndex=item.filename.lastIndexOf(".");
                                                                    var type=item.filename.slice(typeIndex+1);
                                                                    if(imgExp.test(item.filename)){
                                                                        item.type="image/"+type;
                                                                    }
                                                                }
                                                                if(item.url.indexOf("https://")>-1||item.url.indexOf("http://")>-1){
                                                                    item.src=item.url;
                                                                    item.aliOSSUrl=item.url;
                                                                }else{
                                                                    item.src="https://"+item.url;
                                                                    item.aliOSSUrl="https://"+item.url;
                                                                }
                                                                if(item.filename&&!item.name){
                                                                    item.name=item.filename;
                                                                }
                                                                if(!item.filename&&item.name){
                                                                    item.filename=item.name;
                                                                }
                                                                if(itemData.picOnly){
                                                                    item['picOnly']=itemData.picOnly;
                                                                }
                                                            });
                                                        }
                                                    }
                                                    jsonContent.content = JSON.stringify(val)|| "";
                                                }catch (e){
                                                    var temval=JSON.parse(formData[itemData.columncode]);
                                                    if(temval&&temval.length.length!==0){
                                                        temval.forEach(function (itee,inn) {
                                                            itee.url=itee.url.replace(itee.filename,encodeURIComponent(itee.filename))
                                                        });
                                                    }

                                                    // jsonContent.content = formData[itemData.columncode]|| "";
                                                    jsonContent.content =JSON.stringify(temval)|| "";
                                                }

                                            }else{
                                                jsonContent.content="";
                                            }
                                        }
                                        if(formDataExtraInfo&&formDataExtraInfo[itemData.componentKey]){
                                            if( formDataExtraInfo[itemData.componentKey].showValue){
                                                jsonContent.content = formDataExtraInfo[itemData.componentKey].showValue|| "";
                                            }
                                        }
                                        if(jsonContent.content&&jsonContent.content.indexOf("$PRINTASHTML$")>-1){
                                            jsonContent.content=jsonContent.content.replace(/\$PRINTASHTML\$/ig,"");
                                        }
                                        if(itemData.componentKey==='Hyperlink'){
                                            if(itemData.hideTitle){
                                                jsonContent.title=''
                                            }
                                            if(formDataExtraInfo[itemData.columncode]){
                                                jsonContent.content=formDataExtraInfo[itemData.columncode].showValue;
                                            }
                                            if(formData[itemData.columncode]){
                                                jsonContent.trueValue=formData[itemData.columncode];
                                            }else{
                                                jsonContent.trueValue=jsonContent.content;
                                            }

                                        }

                                        jsonList.push(jsonContent);
                                    }
                                }
                            });
                        });
                    }
                    break;
                case "DateInterval":
                    if (!layoutDetail.unSeeable&&_this.isHide(layoutDetail.fieldId, processAuthinfo)) {
                        if(layoutDetail.title[layoutDetail.title.length-1]==="："||layoutDetail.title[layoutDetail.title.length-1]===":"){
                            jsonContent.title = layoutDetail.title;
                        }else{
                            jsonContent.title = layoutDetail.title + "：";
                        }
                        if(layoutDetail.hideTitle){
                            jsonContent.title=''
                        }
                        jsonContent.type = layoutDetail.componentKey;
                        jsonContent.content = formData[layoutDetail.columncode];
                        jsonList.push(jsonContent);
                    }
                    break;
                case "Location":
                    if (!layoutDetail.unSeeable&&_this.isHide(layoutDetail.fieldId, processAuthinfo)) {
                        jsonContent.title = layoutDetail.title + "：";
                        if(layoutDetail.hideTitle){
                            jsonContent.title=''
                        }
                        jsonContent.type = layoutDetail.componentKey;
                        jsonContent.content = formData[layoutDetail.columncode]?JSON.parse(formData[layoutDetail.columncode]).name:"";
                        jsonContent.trueValue = formData[layoutDetail.columncode];
                        jsonList.push(jsonContent);
                    }
                    break;
                case "Hyperlink":
                    if (!layoutDetail.unSeeable&&_this.isHide(layoutDetail.fieldId, processAuthinfo)) {
                        if(layoutDetail.title[layoutDetail.title.length-1]==="："||layoutDetail.title[layoutDetail.title.length-1]===":"){
                            jsonContent.title = layoutDetail.title;
                        }else{
                            jsonContent.title = layoutDetail.title + "：";
                        }
                        if(layoutDetail.hideTitle){
                            jsonContent.title=''
                        }
                        jsonContent.type = layoutDetail.componentKey;
                        if(formDataExtraInfo[layoutDetail.columncode]){
                            jsonContent.content=formDataExtraInfo[layoutDetail.columncode].showValue;
                        }else{
                            jsonContent.content = formData[layoutDetail.columncode];
                        }
                        jsonContent.trueValue=formData[layoutDetail.columncode];
                        jsonList.push(jsonContent);
                    }
                    break;
                case "Select":
                    if (!layoutDetail.unSeeable&&_this.isHide(layoutDetail.fieldId, processAuthinfo)) {
                        var arrNew = [];
                        if(layoutDetail.title[layoutDetail.title.length-1]==="："||layoutDetail.title[layoutDetail.title.length-1]===":"){
                            jsonContent.title = layoutDetail.title;
                        }else{
                            jsonContent.title = layoutDetail.title + "：";
                        }
                        if(layoutDetail.hideTitle){
                            jsonContent.title=''
                        }
                        jsonContent.type = layoutDetail.componentKey;
                        var selectionId = formData[layoutDetail.columncode];
                        var selectREP=/^\d[0-9a-zA-Z]\w$/ig;;
                        if (layoutDetail.multiselect) {
                            if (selectionId && selectionId !== "") {
                                if(selectionId.indexOf(',')>-1){
                                    var middleSelectionId = selectionId.split(',');
                                    if (middleSelectionId.length >= 1) {
                                        middleSelectionId.forEach(function (item, index) {
                                            var curItem = item,curIndex=index;
                                            if (curItem.indexOf("$$hasOther$$") === 0) {
                                                arrNew.push(curItem.substring(12, curItem.length))
                                            }else{
                                                layoutDetail.options.forEach(function (items, indexs) {
                                                    if (items.selectionId == curItem) {
                                                        arrNew.push(items.name);
                                                    }
                                                });
                                            }
                                            /**
                                             * 针对PC端提单，选项多选其他，getApply获取的值为“其他，xxxx",进行处理
                                             */
                                            var selectREP=/^\d[0-9a-zA-Z]\w$/ig;
                                            if(!selectREP.test(curItem)&&curItem.length!==24&&curItem!=="其他"&&curItem.indexOf("$$hasOther$$")===-1){
                                                arrNew.push(curItem)
                                            }
                                        });
                                        jsonContent.content = arrNew.join(',')
                                    }
                                }else{
                                    if (selectionId.indexOf("$$hasOther$$") === 0) {
                                        jsonContent.content=selectionId.substring(12, selectionId.length)
                                    }else{
                                        layoutDetail.options.forEach(function (items, indexs) {
                                            if (items.selectionId == selectionId) {
                                                jsonContent.content = items.name;
                                            }
                                        });
                                    }

                                }

                            } else {
                                jsonContent.content = "";
                            }

                        } else {
                            if (selectionId && selectionId !== "[]") {
                                jsonContent.content = "";
                                layoutDetail.options.forEach(function (opt, oidx) {
                                    if (selectionId.indexOf(opt.selectionId) > -1) {
                                        jsonContent.content += opt.name + ",";
                                    }
                                });
                                var selectionIdArr = selectionId.split(",");
                                var lastSelection = selectionIdArr[selectionIdArr.length - 1];
                                var pos = lastSelection.indexOf("$$hasOther$$");
                                if (lastSelection.indexOf("$$hasOther$$") === 0) {
                                    jsonContent.content += lastSelection.substring(12, lastSelection.length) + ",";
                                    jsonContent.content = (jsonContent.content.substring(jsonContent.content.length - 1) === ',') ? jsonContent.content.substring(0, jsonContent.content.length - 1) : jsonContent.content;
                                } else {
                                    arrNew = [];
                                    if (layoutDetail.options) {//针对pc提单，选项选择其他时，contents中没有$$hasOther$$字段导致移动端选项内容为空的情况
                                        layoutDetail.options.forEach(function (items, indexs) {
                                            if (items.selectionId == selectionId) {
                                                arrNew.push(items)
                                            }
                                            if (arrNew.length !== 0) {
                                                jsonContent.content = arrNew[0].name;
                                            } else {
                                                jsonContent.content = selectionId;
                                            }
                                        })
                                    }
                                }
                            } else {
                                jsonContent.content = "";
                            }
                        }
                        jsonList.push(jsonContent);
                    }
                    break;
                case "Picture":
                    if (!layoutDetail.unSeeable&&_this.isHide(layoutDetail.fieldId, processAuthinfo)) {
                        if(layoutDetail.title[layoutDetail.title.length-1]==="："||layoutDetail.title[layoutDetail.title.length-1]===":"){
                            jsonContent.title = layoutDetail.title;
                        }else{
                            jsonContent.title = layoutDetail.title + "：";
                        }
                        if(layoutDetail.hideTitle){
                            jsonContent.title=''
                        }
                        jsonContent.type = layoutDetail.componentKey;
                        jsonContent.url = layoutDetail.url;
                        jsonList.push(jsonContent);
                    }
                    break;
                case "Reference":
                    if (!layoutDetail.unSeeable&&_this.isHide(layoutDetail.fieldId, processAuthinfo)) {
                        if(formDataExtraInfo[layoutDetail.columncode]){
                            jsonContent.refUrl={'taskId':formDataExtraInfo[layoutDetail.columncode].trueValue,'instId':formDataExtraInfo[layoutDetail.columncode].procInsId||formDataExtraInfo[layoutDetail.columncode].refPkBo};
                            if(formDataExtraInfo[layoutDetail.columncode].detailUrl){
                                jsonContent.detailUrl=formDataExtraInfo[layoutDetail.columncode].detailUrl;
                            }
                        }
                        if(layoutDetail.title[layoutDetail.title.length-1]==="："||layoutDetail.title[layoutDetail.title.length-1]===":"){
                            jsonContent.title = layoutDetail.title;
                        }else{
                            jsonContent.title = layoutDetail.title + "：";
                        }
                        if(layoutDetail.hideTitle){
                            jsonContent.title=''
                        }
                        jsonContent.type = layoutDetail.componentKey;
                        jsonContent.content = formData[layoutDetail.columncode];
                        jsonList.push(jsonContent);
                    }
                    break;
                case "Money":
                    if (!layoutDetail.unSeeable&&_this.isHide(layoutDetail.fieldId, processAuthinfo)) {
                        if(layoutDetail.title[layoutDetail.title.length-1]==="："||layoutDetail.title[layoutDetail.title.length-1]===":"){
                            jsonContent.title = layoutDetail.title;
                        }else{
                            jsonContent.title = layoutDetail.title + "：";
                        }
                        if(layoutDetail.hideTitle){
                            jsonContent.title=''
                        }
                        jsonContent.type = layoutDetail.componentKey;
                        jsonContent.content = formData[layoutDetail.columncode] || '';// by liuhca 没有填写值得话不显示,不要默认赋值 0
                        if (jsonContent.content === "" || !jsonContent.content) {
                            jsonContent.content = "";
                        } else {
                            if(!isNaN(new Number(jsonContent.content))){
                                if (jsonContent.content[jsonContent.content.length - 2] === "E"||jsonContent.content[jsonContent.content.length - 2] === "e") {
                                    jsonContent.content = new Number(jsonContent.content)+"";
                                }
                                var sliceIndex = jsonContent.content.indexOf('.');
                                var aoe = jsonContent.content.slice(sliceIndex + 1);
                                var decimalQulity1 = Math.abs(layoutDetail.decimalPlace - aoe.length);
                                if (aoe.length === jsonContent.content.length) {
                                    decimalQulity1 = layoutDetail.decimalPlace;
                                    if(decimalQulity1!==0){
                                        jsonContent.content += "."
                                    }
                                }
                                if (layoutDetail.decimalPlace === 0) {
                                    jsonContent.content = jsonContent.content + ''
                                } else {
                                    if(!layoutDetail.numberToChinese){
                                        for (var i = 0, j = decimalQulity1; i < j; i++) {
                                            jsonContent.content += '0';
                                        }
                                    }
                                }
                            }
                        }

                        jsonContent.moneyType = layoutDetail.moneyType;
                        if (jsonContent.content === 0 || jsonContent.content === "") {
                            jsonContent.content = "0";
                        }
                        while (regMoney.test(jsonContent.content) && !layoutDetail.numberToChinese) {
                            jsonContent.content = jsonContent.content.replace(regMoney, "$1,$2")
                        }

                        if (layoutDetail.numberToChinese) {
                            if (typeof jsonContent.content === "number") {
                                jsonContent.content += "";
                            }
                            if(jsonContent.content.indexOf(",")>-1){
                                var moneyArr=jsonContent.content.split(",");
                                jsonContent.content=parseFloat(moneyArr.join(""));
                            }
                            if (jsonContent.content.indexOf('-') > -1) {//by huangzhy 当合计金额为负值的时候，content的索引为1开始
                                jsonContent.color="red";
                                jsonContent.content = jsonContent.content.slice(1);
                            }
                            if(!isNaN(new Number(jsonContent.content))){
                                jsonContent.content = c.MoneyDX(jsonContent.content);
                            }
                        }
                        jsonList.push(jsonContent);
                    }
                    break;
                case "DataTable":
                    var isHideCon=this.processSubComponents(layoutDetail.layoutDetail,processAuthinfo);
                    if ((available!=='false')&&!layoutDetail.unSeeable&&_this.isHide(layoutDetail.subFormId, processAuthinfo)||isHideCon) {
                        var formdataList = formData[layoutDetail.tableName];
                        jsonContent = {};
                        jsonContent.title = "明细子表";
                        jsonContent.type = layoutDetail.componentKey;
                        jsonContent.items = [];
                        if (!!formdataList && !!formdataList.length) {//by liuhca
                            formdataList.forEach(function (formItem, index) {
                                var jsonTable = {};
                                jsonTable.title = "明细子表";
                                jsonTable.num = index + 1;
                                jsonTable.type = layoutDetail.componentKey;
                                jsonTable.items = [];
                                // 循环组件
                                layoutDetail.layoutDetail.forEach(function (itemData, idx) {
                                    if (itemData.componentKey !== "Score"&&!itemData.invisible) {
                                        var jsonComponent = {};
                                        if(itemData.title[itemData.title.length-1]==="："||itemData.title[itemData.title.length-1]===":"){
                                            jsonComponent.title = itemData.title;
                                        }else{
                                            jsonComponent.title = itemData.title + "：";
                                        }

                                        jsonComponent.type = itemData.componentKey;
                                        jsonComponent.content = formItem[itemData.columncode];
                                        if (itemData.componentKey === "Paragraph") {
                                            jsonComponent.style = itemData.style;
                                            if(itemData.hideTitle){
                                                jsonComponent.title=''
                                            }
                                        } else if (itemData.componentKey === "Select") {
                                            if (!_this.isHide(itemData.fieldId, processAuthinfo)) return;
                                            var arrNew = [];
                                            jsonComponent.content = "";
                                            if(itemData.hideTitle){
                                                jsonComponent.title=''
                                            }
                                            var selectionId = formItem[itemData.columncode];
                                            if (itemData.multiselect) {
                                                if (selectionId && selectionId !== "") {
                                                    if(selectionId.indexOf(',')>-1){
                                                        var middleSelectionId = selectionId.split(',');
                                                        if (middleSelectionId.length >= 1) {
                                                            middleSelectionId.forEach(function (item, index) {
                                                                var curItem = item;

                                                                if (curItem.indexOf("$$hasOther$$") === 0) {
                                                                    arrNew.push(curItem.substring(12, curItem.length))
                                                                }else{
                                                                    itemData.options.forEach(function (items, indexs) {
                                                                        if (items.selectionId == curItem) {
                                                                            arrNew.push(items.name);
                                                                        }
                                                                    });
                                                                }
                                                                /**
                                                                 * 针对PC端提单，选项多选其他，getApply获取的值为“其他，xxxx",进行处理
                                                                 */
                                                                var selectREP=/^\d[0-9a-zA-Z]\w$/ig;
                                                                if(!selectREP.test(curItem)&&curItem.length!==24&&curItem!=="其他"&&curItem.indexOf("$$hasOther$$")===-1){
                                                                    arrNew.push(curItem)
                                                                }
                                                            });
                                                            jsonComponent.content = arrNew.join(',')
                                                        }
                                                    }else{
                                                        itemData.options.forEach(function (items, indexs) {
                                                            if (items.selectionId == selectionId) {
                                                                jsonComponent.content=items.name;
                                                            }
                                                        });
                                                    }

                                                } else {
                                                    jsonComponent.content = "";
                                                }
                                            } else {
                                                if (selectionId && selectionId !== "[]") {
                                                    itemData.options.forEach(function (opt, oidx) {
                                                        if (selectionId.indexOf(opt.selectionId) > -1) {
                                                            jsonComponent.content += opt.name + ",";
                                                        }
                                                    });
                                                    var selectionIdArr = selectionId.split(",");
                                                    var lastSelection = selectionIdArr[selectionIdArr.length - 1];
                                                    if (lastSelection.indexOf("$$hasOther$$") === 0) {
                                                        jsonComponent.content += lastSelection.substring(12, lastSelection.length) + ",";
                                                    } else {
                                                        arrNew = [];
                                                        if (itemData.options) {//针对pc提单，选项选择其他时，contents中没有$$hasOther$$字段导致移动端选项内容为空的情况
                                                            itemData.options.forEach(function (items, indexs) {
                                                                if (items.selectionId == selectionId) {
                                                                    arrNew.push(items);
                                                                }
                                                            })
                                                            if (arrNew.length !== 0) {
                                                                jsonComponent.content = arrNew[0].name;
                                                            } else {
                                                                jsonComponent.content = selectionId;
                                                            }
                                                        }
                                                    }
                                                    jsonComponent.content = (jsonComponent.content.substring(jsonComponent.content.length - 1) === ',') ? jsonComponent.content.substring(0, jsonComponent.content.length - 1) : jsonComponent.content;
                                                } else {
                                                    jsonComponent.content = "";
                                                }
                                            }


                                        } else if (itemData.componentKey === "Picture") {
                                            if (!_this.isHide(itemData.fieldId, processAuthinfo)) return;
                                            jsonComponent.url = itemData.url;
                                            if(itemData.hideTitle){
                                                jsonComponent.title=''
                                            }
                                        }else if (itemData.componentKey === "Reference") {
                                            if (!_this.isHide(itemData.fieldId, processAuthinfo)) return;
                                            if(itemData.hideTitle){
                                                jsonComponent.title=''
                                            }
                                            jsonComponent.dr=itemData.columncode+"_"+formItem.dr;
                                            if(formDataExtraInfo[jsonComponent.dr]){
                                                jsonComponent.refUrl={'taskId':formDataExtraInfo[jsonComponent.dr].trueValue,'instId':formDataExtraInfo[jsonComponent.dr].procInsId||formDataExtraInfo[jsonComponent.dr].refPkBo}
                                            }
                                            if(formDataExtraInfo[ jsonComponent.dr]){
                                                if(formDataExtraInfo[ jsonComponent.dr].detailUrl){
                                                    jsonComponent.detailUrl=formDataExtraInfo[ jsonComponent.dr].detailUrl;
                                                }
                                            }
                                            if(jsonComponent.content&&jsonComponent.content.indexOf('["[')>-1&&JSON.parse(jsonComponent.content)[0]==='[""]'){
                                                jsonComponent.content='';
                                            }
                                            if(itemData.title[itemData.title.length-1]==="："||itemData.title[itemData.title.length-1]===":"){
                                                jsonComponent.title = itemData.title;
                                            }else{
                                                jsonComponent.title = itemData.title + "：";
                                            }
                                            if(itemData.hideTitle){
                                                jsonContent.title=''
                                            }
                                            jsonComponent.type = itemData.componentKey;
                                        }else if (itemData.componentKey === "Hyperlink") {
                                            if (!_this.isHide(itemData.fieldId, processAuthinfo)) return;
                                            if(itemData.title[itemData.title.length-1]==="："||itemData.title[itemData.title.length-1]===":"){
                                                jsonComponent.title = itemData.title;
                                            }else{
                                                jsonComponent.title = itemData.title + "：";
                                            }
                                            if(itemData.hideTitle){
                                                jsonComponent.title=''
                                            }
                                            jsonComponent.type = itemData.componentKey;
                                            jsonComponent.dr=itemData.columncode+"_"+formItem.dr;
                                            if(formDataExtraInfo[jsonComponent.dr]){
                                                jsonComponent.content = formDataExtraInfo[jsonComponent.dr].showValue;
                                            }
                                            jsonComponent.trueValue = formItem[itemData.columncode];
                                        } else if (itemData.componentKey === "Money") {
                                            if (!_this.isHide(itemData.fieldId, processAuthinfo)) return;
                                            if(itemData.hideTitle){
                                                jsonComponent.title=''
                                            }
                                            if (jsonComponent.content === "" || !jsonComponent.content) {
                                                jsonComponent.content = "";//干掉 去掉子表默认金额 数值 by liuhca
                                            } else {
                                                if(!isNaN(new Number(jsonComponent.content))){
                                                    if (jsonComponent.content[jsonComponent.content.length - 2] === "E"||jsonComponent.content[jsonComponent.content.length - 2] === "e") {
                                                        jsonComponent.content = new Number(jsonComponent.content)+"";
                                                    }
                                                    var sliceIndex = jsonComponent.content.indexOf('.');
                                                    var aoe = jsonComponent.content.slice(sliceIndex + 1);
                                                    var decimalQulity1 = Math.abs(itemData.decimalPlace - aoe.length);
                                                    if (aoe.length == jsonComponent.content.length) {
                                                        if(itemData.decimalPlace!==0){
                                                            jsonComponent.content+=".";
                                                            if(!itemData.numberToChinese){
                                                                for (var ii = 0, jj = itemData.decimalPlace; ii < jj; ii++) {
                                                                    jsonComponent.content += '0';
                                                                }
                                                            }
                                                        }

                                                    } else {
                                                        if (decimalQulity1 == itemData.decimalPlace) {
                                                            decimalQulity1 = itemData.decimalPlace;
                                                            jsonComponent.content += ".";
                                                        }
                                                        if (itemData.decimalPlace === 0) {
                                                            jsonComponent.content = jsonComponent.content + ''
                                                        } else {
                                                            if(!itemData.numberToChinese){
                                                                for (var i = 0, j = decimalQulity1; i < j; i++) {
                                                                    jsonComponent.content += '0';
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                            //金额千分位
                                            while (regMoney.test(jsonComponent.content) && !itemData.numberToChinese) {
                                                jsonComponent.content = jsonComponent.content.replace(regMoney, "$1,$2")
                                            }

                                            if (itemData.numberToChinese) {
                                                if (typeof jsonComponent.content === 'number') {
                                                    jsonComponent.content += "";
                                                }
                                                if(jsonComponent.content.indexOf(",")>-1){
                                                    var moneyArr=jsonComponent.content.split(",");
                                                    jsonComponent.content=parseFloat(moneyArr.join(""));
                                                }
                                                if (jsonComponent.content[jsonComponent.content.length - 2] == "E"||jsonComponent.content[jsonComponent.content.length - 2] == "e") {
                                                    jsonComponent.content = new Number(jsonComponent.content)+"";
                                                }

                                                if (jsonComponent.content.indexOf('-') > -1) {//by huangzhy 当合计金额为负值的时候，content的索引为1开始
                                                    jsonComponent.color="red";
                                                    jsonComponent.content =jsonComponent.content.slice(1);
                                                }
                                                if(!isNaN(new Number(jsonComponent.content))){
                                                    jsonComponent.content = c.MoneyDX(jsonComponent.content);
                                                }
                                            }

                                            jsonComponent.moneyType = itemData.moneyType;
                                        } else if (itemData.componentKey === "Password") {
                                            if (!_this.isHide(itemData.fieldId, processAuthinfo)) return;
                                            if(itemData.hideTitle){
                                                jsonComponent.title=''
                                            }
                                            jsonComponent.content = "";
                                            var passwordCode = layoutDetail.tableName;

                                            var passwords = formData[passwordCode][jsonTable.num-1][itemData.columncode] || "";

                                            for (var p = 0; p < passwords.length; p++) {
                                                jsonComponent.content += "＊";
                                            }
                                        } else if (itemData.componentKey === "DateInterval") {
                                            if (!_this.isHide(itemData.fieldId, processAuthinfo)) return;

                                            jsonComponent.content = "";
                                            var dateRange;
                                            if (formData[layoutDetail.tableName][jsonTable.num-1][itemData.columncode]) {
                                                dateRange = formData[layoutDetail.tableName][jsonTable.num-1][itemData.columncode];

                                            }
                                            jsonComponent.content = dateRange;

                                        } else if (itemData.componentKey === "File") {
                                            if (!_this.isHide(itemData.fieldId, processAuthinfo)) return;
                                            if(itemData.hideTitle){
                                                jsonComponent.title=''
                                            }
                                            var fj_cloumCode = layoutDetail.tableName;
                                            for (var i = 0, j = formData[fj_cloumCode].length; i < j; i++) {
                                                if (formData[fj_cloumCode][i][itemData.columncode]) {
                                                    try{
                                                        var val=JSON.parse(formData[fj_cloumCode][i][itemData.columncode]) || "";
                                                        if(val.length!==0){
                                                            val.forEach(function (itee,inn) {
                                                                itee.url=itee.url.replace(itee.filename,encodeURIComponent(itee.filename))
                                                            });
                                                            var imgExp=/.+(.JPEG|.jpeg|.JPG|.jpg|.GIF|.gif|.BMP|.bmp|.PNG|.png)$/g;

                                                            val.forEach(function (item,index) {
                                                                if(!item.type){
                                                                    // item.filename=item.name;
                                                                    var typeIndex=item.filename.lastIndexOf(".");
                                                                    var type=item.filename.slice(typeIndex+1);
                                                                    if(imgExp.test(item.filename)){
                                                                        item.type="image/"+type;
                                                                    }
                                                                }
                                                                if(item.url.indexOf("https://"||item.url.indexOf("http://")>-1)>-1){
                                                                    item.src=item.url;
                                                                    item.aliOSSUrl=item.url;
                                                                }else{
                                                                    item.src="https://"+item.url;
                                                                    item.aliOSSUrl="https://"+item.url;
                                                                }
                                                                if(item.filename&&!item.name){
                                                                    item.name=item.filename;
                                                                }
                                                                if(!item.filename&&item.name){
                                                                    item.filename=item.name;
                                                                }
                                                            });
                                                            var aoewe=val.find(function (ins,its) {
                                                                return ins.type
                                                            });
                                                            if(aoewe){
                                                                val.forEach(function (item,index) {
                                                                    if(!item.type){
                                                                        item.filename=item.name;
                                                                        var typeIndex=item.filename.lastIndexOf(".");
                                                                        var type=item.filename.slice(typeIndex+1);
                                                                        if(imgExp.test(item.filename)){
                                                                            item.type="image/"+type;
                                                                        }
                                                                    }
                                                                    if(item.url.indexOf("https://")>-1||item.url.indexOf("http://")>-1){
                                                                        item.src=item.url;
                                                                        item.aliOSSUrl=item.url;
                                                                    }else{
                                                                        item.src="https://"+item.url;
                                                                        item.aliOSSUrl="https://"+item.url;
                                                                    }
                                                                    if(item.filename&&!item.name){
                                                                        item.name=item.filename;
                                                                    }
                                                                    if(!item.filename&&item.name){
                                                                        item.filename=item.name;
                                                                    }
                                                                    if(itemData.picOnly){
                                                                        item['picOnly']=itemData.picOnly;
                                                                    }
                                                                });
                                                            }
                                                        }

                                                        jsonContent.content = JSON.stringify(val)|| "";
                                                    }catch (e){
                                                        jsonContent.content='附件名异常';
                                                    }
                                                }else {
                                                    jsonComponent.content="";
                                                }
                                            }
                                        } else if (itemData.componentKey === "Number") {
                                            if (!_this.isHide(itemData.fieldId, processAuthinfo)) return;
                                            if(itemData.hideTitle){
                                                jsonComponent.title=''
                                            }
                                            if (jsonComponent.content === "" || !jsonComponent.content) {
                                                jsonComponent.content = "";//干掉 去掉子表默认金额 数值 by liuhca
                                            } else {
                                                if(!itemData.percent){
                                                    if (itemData.decimalPlace === 0) {
                                                        jsonComponent.content = jsonComponent.content + "";
                                                    } else {
                                                        if(jsonComponent.content.lastIndexOf('E')===jsonComponent.content.length-2||jsonComponent.content.lastIndexOf('e')===jsonComponent.content.length-2){
                                                            jsonComponent.content=new Number(jsonComponent.content)+"";
                                                        }

                                                        if (jsonComponent.content.indexOf(".") === -1) {
                                                            jsonComponent.content += ".";
                                                            if(!itemData.numberToChinese){
                                                                for (var i = 0, j = itemData.decimalPlace; i < j; i++) {
                                                                    jsonComponent.content += '0';
                                                                }
                                                            }
                                                        } else {
                                                            var sliceIndex1 = jsonComponent.content.indexOf('.');
                                                            var aoe1 = jsonComponent.content.slice(sliceIndex1 + 1);
                                                            var decimalQulity = Math.abs(itemData.decimalPlace - aoe1.length);
                                                            if(!itemData.numberToChinese){
                                                                for (var i = 0, j = decimalQulity.decimalPlace; i < j; i++) {
                                                                    jsonComponent.content += '0';
                                                                }
                                                            }
                                                        }
                                                    }
                                                }else{
                                                    jsonComponent.content=(jsonComponent.content*10000/100).toFixed(itemData.decimalPlace)+"%";
                                                }
                                                if(itemData.thousandth){
                                                    if(jsonComponent.content.indexOf('.')>-1){
                                                        var frontvalue=jsonComponent.content.split('.')[0];
                                                        while (regMoney.test(frontvalue)) {
                                                            frontvalue+="";
                                                            frontvalue = frontvalue.replace(regMoney, "$1,$2")
                                                        }
                                                        jsonComponent.content=frontvalue+'.'+jsonComponent.content.split('.')[1]
                                                    }else{
                                                        while (regMoney.test(jsonComponent.content)) {
                                                            jsonComponent.content+="";
                                                            jsonComponent.content = jsonComponent.content.replace(regMoney, "$1,$2")
                                                        }
                                                    }
                                                }
                                            }

                                        }else if (itemData.componentKey === "ReferField") {
                                            jsonComponent.dr=itemData.columncode+"_"+formItem.dr;
                                            if(itemData.hideTitle){
                                                jsonComponent.title=''
                                            }
                                            if (!_this.isHide(itemData.fieldId, processAuthinfo)) return;
                                            if(formDataExtraInfo&&formDataExtraInfo[jsonComponent.dr]&&formDataExtraInfo[jsonComponent.dr].showValue){
                                                jsonComponent.content= formDataExtraInfo[jsonComponent.dr].showValue? formDataExtraInfo[jsonComponent.dr].showValue:jsonComponent.content;
                                                if(formDataExtraInfo[jsonComponent.dr].componentKey==="Money"&&formDataExtraInfo[jsonComponent.dr].numberToChinese){
                                                    if(!isNaN(new Number(jsonComponent.content))){
                                                        jsonComponent.content = c.MoneyDX(jsonComponent.content);
                                                    }
                                                }
                                                if(formDataExtraInfo[jsonComponent.dr].componentKey==="BillMakerUpperOrg"){
                                                    jsonComponent.contentTemp= formDataExtraInfo[jsonComponent.dr].showValue? formDataExtraInfo[jsonComponent.dr].showValue:jsonComponent.content;
                                                }
                                                if(formDataExtraInfo[jsonComponent.dr].componentKey==="DateInterval"){
                                                    if(jsonComponent.content&&jsonComponent.content.indexOf('[')>-1&&jsonComponent.content.indexOf(',')>-1&&jsonComponent.content.indexOf(']')>-1){
                                                        jsonComponent.content=JSON.parse(jsonComponent.content).join(' 至 ');
                                                    }
                                                }
                                            }
                                        }else{
                                            if (!_this.isHide(itemData.fieldId, processAuthinfo)) return;
                                            if(itemData.hideTitle){
                                                jsonComponent.title=''
                                            }
                                        }
                                        jsonTable.items.push(jsonComponent);
                                    }
                                });
                                jsonContent.items.push(jsonTable);
                            });
                        } else {
                            var jsonTable1 = {};

                            jsonTable1.title = "明细子表";
                            jsonTable1.num = "1";
                            jsonTable1.type = layoutDetail.componentKey;
                            jsonTable1.items = [];
                            // 循环组件
                            layoutDetail.layoutDetail.forEach(function (itemData, idx) {
                                if (itemData.componentKey !== "Score") {
                                    if (!_this.isHide(itemData.fieldId, processAuthinfo)) return;
                                    var jsonComponent1 = {};
                                    if(itemData.title[itemData.title.length-1]==="："||itemData.title[itemData.title.length-1]===":"){
                                        jsonComponent1.title = itemData.title;
                                    }else{
                                        jsonComponent1.title = itemData.title + "：";
                                    }
                                    if(itemData.hideTitle){
                                        jsonComponent1.title=''
                                    }
                                    jsonComponent1.type = itemData.componentKey;
                                    jsonComponent1.content = formData[itemData.columncode];
                                    if (itemData.componentKey === "Paragraph") {
                                        if (!_this.isHide(itemData.fieldId, processAuthinfo)) return;
                                        if(itemData.hideTitle){
                                            jsonComponent1.title=''
                                        }
                                        jsonComponent1.style = itemData.style;
                                    } else if (itemData.componentKey === "Select") {
                                        if (!_this.isHide(itemData.fieldId, processAuthinfo)) return;
                                        if(itemData.hideTitle){
                                            jsonComponent1.title=''
                                        }
                                        var selectionId = formData[itemData.columncode];
                                        jsonComponent1.content = "";
                                        var arrNew = [];
                                        if (itemData.multiselect) {
                                            if (selectionId && selectionId !== "") {
                                                if(selectionId.indexOf(',')>-1){
                                                    var middleSelectionId = selectionId.split(',');
                                                    if (middleSelectionId.length >= 1) {
                                                        middleSelectionId.forEach(function (item, index) {
                                                            var curItem = item;

                                                            if (curItem.indexOf("$$hasOther$$") === 0) {
                                                                arrNew.push(curItem.substring(12, curItem.length))
                                                            }else{
                                                                itemData.options.forEach(function (items, indexs) {
                                                                    if (items.selectionId == curItem) {
                                                                        arrNew.push(items.name);
                                                                    }
                                                                });
                                                            }
                                                            var selectREP=/^\d[0-9a-zA-Z]\w$/ig;
                                                            if(!selectREP.test(curItem)&&curItem.length!==24&&curItem!=="其他"&&curItem.indexOf("$$hasOther$$")===-1){
                                                                arrNew.push(curItem)
                                                            }
                                                        });
                                                        jsonComponent1.content = arrNew.join(',')
                                                    }
                                                }else{
                                                    itemData.options.forEach(function (items, indexs) {
                                                        if (items.selectionId == selectionId) {
                                                            jsonComponent1.content=items.name;
                                                        }
                                                    });
                                                }

                                            } else {
                                                jsonComponent1.content = "";
                                            }
                                        } else {
                                            if (selectionId && selectionId !== "[]") {
                                                itemData.options.forEach(function (opt, oidx) {
                                                    if (selectionId.indexOf(opt.selectionId) > -1) {
                                                        jsonComponent1.content += opt.name + ",";
                                                    }
                                                });
                                                var selectionIdArr = selectionId.split(",");
                                                var lastSelection = selectionIdArr[selectionIdArr.length - 1];
                                                if (lastSelection.indexOf("$$hasOther$$") === 0) {
                                                    jsonComponent1.content += lastSelection.substring(12, lastSelection.length) + ",";
                                                } else {
                                                    arrNew = [];
                                                    if (itemData.options) {//针对pc提单，选项选择其他时，contents中没有$$hasOther$$字段导致移动端选项内容为空的情况
                                                        itemData.options.forEach(function (items, indexs) {
                                                            if (items.selectionId == selectionId) {
                                                                arrNew.push(items);
                                                            }
                                                        })
                                                        if (arrNew.length !== 0) {
                                                            jsonComponent1.content = arrNew[0].name;
                                                        } else {
                                                            jsonComponent1.content = selectionId;
                                                        }
                                                    }
                                                }

                                                jsonComponent1.content = (jsonComponent1.content.substring(jsonComponent1.content.length - 1) === ',') ? jsonComponent1.content.substring(0, jsonComponent1.content.length - 1) : jsonComponent1.content;
                                            } else {
                                                jsonComponent1.content = "";
                                            }
                                        }

                                    } else if (itemData.componentKey === "Picture") {
                                        if (!_this.isHide(itemData.fieldId, processAuthinfo)) return;
                                        if(itemData.hideTitle){
                                            jsonComponent1.title=''
                                        }
                                        jsonComponent1.url = itemData.url;
                                    } else if (itemData.componentKey === "Reference") {
                                        jsonComponent1.dr=itemData.columncode+"_"+itemData.dr;
                                        if(itemData.hideTitle){
                                            jsonComponent1.title=''
                                        }
                                        if(formDataExtraInfo[jsonComponent1.dr]){
                                            jsonComponent1.refUrl={'taskId':formDataExtraInfo[jsonComponent1.dr].trueValue,'instId':formDataExtraInfo[jsonComponent1.dr].procInsId||formDataExtraInfo[jsonComponent1.dr].refPkBo}
                                        }
                                        if(formDataExtraInfo[ jsonComponent1.dr]){
                                            if(formDataExtraInfo[ jsonComponent1.dr].detailUrl){
                                                jsonComponent1.detailUrl=formDataExtraInfo[ jsonComponent1.dr].detailUrl;
                                            }
                                        }
                                        if(jsonComponent1.content&&jsonComponent1.content.indexOf('["[')>-1&&JSON.parse(jsonComponent1.content)[0]==='[""]'){
                                            jsonComponent1.content='';
                                        }
                                        if(itemData.title[itemData.title.length-1]==="："||itemData.title[itemData.title.length-1]===":"){
                                            jsonComponent1.title = itemData.title;
                                        }else{
                                            jsonComponent1.title = itemData.title + "：";
                                        }
                                        jsonComponent1.title = itemData.title + "：";
                                        if(itemData.hideTitle){
                                            jsonComponent1.title=''
                                        }
                                        jsonComponent1.type = itemData.componentKey;
                                    }else if (itemData.componentKey === "Money") {
                                        if (!_this.isHide(itemData.fieldId, processAuthinfo)) return;
                                        if(itemData.hideTitle){
                                            jsonComponent1.title=''
                                        }
                                        if (jsonComponent1.content === "" || !jsonComponent1.content) {
                                            jsonComponent1.content = "";//干掉 去掉子表默认金额 数值 by liuhca
                                        } else {
                                            if(!isNaN(new Number(jsonComponent1.content))){
                                                if (jsonComponent1.content[jsonComponent1.content.length - 2] == "E"||jsonComponent1.content[jsonComponent1.content.length - 2] == "e") {
                                                    jsonComponent1.content = new Number(jsonComponent1.content)+"";
                                                }
                                                var sliceIndex = jsonComponent1.content.indexOf('.');
                                                var aoe = jsonComponent1.content.slice(sliceIndex + 1);
                                                var decimalQulity1 = Math.abs(itemData.decimalPlace - aoe.length);
                                                if (aoe.length == jsonComponent1.content.length) {
                                                    if(itemData.decimalPlace!==0){
                                                        jsonComponent1.content+=".";
                                                        if(!itemData.numberToChinese){
                                                            for (var ii = 0, jj = itemData.decimalPlace; ii < jj; ii++) {
                                                                jsonComponent1.content += '0';
                                                            }
                                                        }
                                                    }

                                                } else {
                                                    if (decimalQulity1 == itemData.decimalPlace) {
                                                        decimalQulity1 = itemData.decimalPlace;
                                                        jsonComponent1.content += ".";
                                                    }
                                                    if (itemData.decimalPlace === 0) {
                                                        jsonComponent1.content = jsonComponent1.content + ''
                                                    } else {
                                                        if(!itemData.numberToChinese){
                                                            for (var i = 0, j = decimalQulity1; i < j; i++) {
                                                                jsonComponent1.content += '0';
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                        //金额千分位
                                        while (regMoney.test(jsonComponent1.content) && !itemData.numberToChinese) {
                                            jsonComponent1.content = jsonComponent1.content.replace(regMoney, "$1,$2")
                                        }
                                        if (itemData.numberToChinese) {
                                            if (typeof jsonComponent1.content === 'number') {
                                                jsonComponent1.content += "";
                                            }
                                            if(jsonComponent1.content.indexOf(',') > -1){
                                                var moneyArr=jsonComponent1.content.split(",");
                                                jsonComponent1.content=parseFloat(moneyArr.join(""));
                                            }
                                            if (jsonComponent1.content.indexOf('-') > -1) {//by huangzhy 当合计金额为负值的时候，content的索引为1开始
                                                jsonContent.color="red";
                                                jsonComponent1.content =jsonComponent1.content.slice(1);
                                            }
                                            if(!isNaN(new Number(jsonComponent1.content))){
                                                jsonComponent1.content = c.MoneyDX(jsonComponent1.content);
                                            }
                                        }
                                        jsonComponent1.moneyType = itemData.moneyType;
                                    } else if (itemData.componentKey === "Password") {
                                        if (!_this.isHide(itemData.fieldId, processAuthinfo)) return;
                                        if(itemData.hideTitle){
                                            jsonComponent1.title=''
                                        }
                                        jsonComponent1.content = "";
                                        var password1 = formData[itemData.columncode] || "";
                                        for (var p = 0; p < password1.length; p++) {
                                            jsonComponent1.content += "＊";
                                        }
                                    } else if (itemData.componentKey === "Precent") {
                                        if (!_this.isHide(itemData.fieldId, processAuthinfo)) return;
                                        if(itemData.hideTitle){
                                            jsonComponent1.title=''
                                        }
//                                      jsonComponent1.content += "%";
                                        if (!!jsonComponent1.content) {
                                            //处理4位小数 by liuhca 如果是整数补齐两位小数
                                            jsonComponent1.content = parseFloat(jsonComponent1.content)+"";;
                                            (typeof jsonComponent1.content === "number" && jsonComponent1.content % 1 === 0) ? jsonComponent1.content = jsonComponent1.content + ".00" : jsonComponent1.content = jsonComponent1.content;
                                            jsonComponent1.content += "%";
                                        } else {
                                            jsonComponent1.content = "";
                                        }
                                    } else if (itemData.componentKey === "DateInterval") {
                                        if (!_this.isHide(itemData.fieldId, processAuthinfo)) return;
                                        if(itemData.hideTitle){
                                            jsonComponent1.title=''
                                        }
                                        jsonComponent1.content = "";
                                        var dateRange = '';
                                        jsonComponent1.content = dateRange;
                                    }else if (itemData.componentKey === "ReferField") {
                                        var fj_cloumCode = itemData.columncode+"_"+formData.dr;
                                        if (!_this.isHide(itemData.fieldId, processAuthinfo)) return;
                                        if(itemData.hideTitle){
                                            jsonComponent1.title=''
                                        }
                                        if(formDataExtraInfo&&formDataExtraInfo[fj_cloumCode]){
                                            jsonComponent1.content= formDataExtraInfo[fj_cloumCode].showValue? formDataExtraInfo[fj_cloumCode].showValue:jsonComponent1.content;
                                            if(formDataExtraInfo[fj_cloumCode].componentKey==="Money"&&formDataExtraInfo[fj_cloumCode].numberToChinese){
                                                if(!isNaN(new Number(jsonComponent1.content))){
                                                    jsonComponent1.content = c.MoneyDX(jsonComponent1.content);
                                                }
                                            }
                                            if(formDataExtraInfo[fj_cloumCode].componentKey==="BillMakerUpperOrg"){
                                                jsonComponent1.contentTemp= formDataExtraInfo[fj_cloumCode].showValue? formDataExtraInfo[fj_cloumCode].showValue:jsonComponent1.content;
                                            }
                                            if(formDataExtraInfo[fj_cloumCode].componentKey==="DateInterval"){
                                                if(jsonComponent1.content&&jsonComponent1.content.indexOf('[')>-1&&jsonComponent1.content.indexOf(',')>-1&&jsonComponent1.content.indexOf(']')>-1){
                                                    jsonComponent1.content=JSON.parse(jsonComponent1.content).join(' 至 ');
                                                }
                                            }
                                        }

                                    }else{
                                        if (!_this.isHide(itemData.fieldId, processAuthinfo)) return;
                                        if(itemData.hideTitle){
                                            jsonComponent1.title=''
                                        }
                                    }
                                    jsonTable1.items.push(jsonComponent1);
                                }
                            });

                            jsonContent.items.push(jsonTable1);
                        }
                        jsonList.push(jsonContent);
                    }
                    break;

                case "File":
                    if (!layoutDetail.unSeeable&&_this.isHide(layoutDetail.fieldId, processAuthinfo)) {
                        if(layoutDetail.title[layoutDetail.title.length-1]==="："||layoutDetail.title[layoutDetail.title.length-1]===":"){
                            jsonContent.title = layoutDetail.title;
                        }else{
                            jsonContent.title = layoutDetail.title + "：";
                        }
                        if(layoutDetail.hideTitle){
                            jsonContent.title=''
                        }

                        jsonContent.type = layoutDetail.componentKey;
                        if(formData[layoutDetail.columncode]){
                            try{
                                var val=JSON.parse(formData[layoutDetail.columncode]);
                                val.forEach(function (ite,ni) {
                                    ite.url=ite.url.replace(ite.filename,encodeURIComponent(ite.filename))
                                });
                                if(val.length!==0){
                                    var imgExp=/.+(.JPEG|.jpeg|.JPG|.jpg|.GIF|.gif|.BMP|.bmp|.PNG|.png)$/g;

                                    val.forEach(function (item,index) {
                                        if(!item.type){
                                            item.filename=item.name;
                                            var typeIndex=item.filename.lastIndexOf(".");
                                            var type=item.filename.slice(typeIndex+1);
                                            if(imgExp.test(item.filename)){
                                                item.type="image/"+type;
                                            }
                                        }
                                        if(item.url.indexOf("https://")>-1||item.url.indexOf("http://")>-1){
                                            item.src=item.url;
                                            item.aliOSSUrl=item.url;
                                        }else{
                                            item.src="https://"+item.url;
                                            item.aliOSSUrl="https://"+item.url;
                                        }
                                        if(item.filename){
                                            item.name=item.filename;
                                        }
                                        if(!item.filename){
                                            item.filename=item.name;
                                        }
                                    });
                                    var aoewe=val.find(function (ins,its) {
                                        return ins.type
                                    });
                                    if(aoewe){
                                        val.forEach(function (item,index) {
                                            if(!item.type){
                                                item.filename=item.name;
                                                var typeIndex=item.filename.lastIndexOf(".");
                                                var type=item.filename.slice(typeIndex+1);
                                                if(imgExp.test(item.filename)){
                                                    item.type="image/"+type;
                                                }
                                            }
                                            if(item.url.indexOf("https://")>-1||item.url.indexOf("http://")>-1){
                                                item.src=item.url;
                                                item.aliOSSUrl=item.url;
                                            }else{
                                                item.src="https://"+item.url;
                                                item.aliOSSUrl="https://"+item.url;
                                            }
                                            if(item.filename&&!item.name){
                                                item.name=item.filename;
                                            }
                                            if(!item.filename&&item.name){
                                                item.filename=item.name;
                                            }
                                            if(layoutDetail.picOnly){
                                                item['picOnly']=layoutDetail.picOnly;
                                            }
                                        });
                                    }
                                }
                                jsonContent.content = JSON.stringify(val);
                            }catch (e){
                                var temval=JSON.parse(formData[layoutDetail.columncode]);
                                temval.forEach(function (itee,inn) {
                                    try {
                                        itee.url=itee.url.replace(itee.filename,encodeURIComponent(itee.filename));
                                    }catch(e){
                                        itee.url=itee.src.replace(itee.name,encodeURIComponent(itee.name));
                                        itee.filename=itee.name;
                                    }
                                });
                                jsonContent.content = JSON.stringify(temval)||"";
                            }
                        }else{
                            jsonContent.content="";
                        }
                        jsonList.push(jsonContent);
                    }

                    break;

                case "Password":
                    if (!layoutDetail.unSeeable&&_this.isHide(layoutDetail.fieldId, processAuthinfo)) {
                        if(layoutDetail.title[layoutDetail.title.length-1]==="："||layoutDetail.title[layoutDetail.title.length-1]===":"){
                            jsonContent.title = layoutDetail.title;
                        }else{
                            jsonContent.title = layoutDetail.title + "：";
                        }
                        if(layoutDetail.hideTitle){
                            jsonContent.title=''
                        }
                        jsonContent.type = layoutDetail.componentKey;
                        var password = formData[layoutDetail.columncode] || "";
                        jsonContent.content = "";
                        for (var p = 0; p < password.length; p++) {
                            jsonContent.content += "＊";
                        }
                        jsonList.push(jsonContent);
                    }
                    break;
                case "Score":
                    if(layoutDetail.hideTitle){
                        jsonContent.title=''
                    }
                    break;
                case "TaskComment":
                    if (!layoutDetail.unSeeable&&_this.isHide(layoutDetail.fieldId, processAuthinfo)) {
                        if (layoutDetail.processActivity) {
                            var component;
                            if(layoutDetail.processActivity instanceof Array&&$.inArray(currentActivityId,layoutDetail.processActivity)>-1){
                                component = {
                                    name: layoutDetail.columncode,
                                    type: "TaskComment",
                                    value: layoutDetail.showStyle.toString()
                                };
                                window._formData.push(component);
                            }else if(layoutDetail.processActivity === currentActivityId){
                                component = {
                                    name: layoutDetail.columncode,
                                    type: "TaskComment",
                                    value: layoutDetail.showStyle.toString()
                                };
                                window._formData.push(component);
                            }
                        }
                        if(layoutDetail.title[layoutDetail.title.length-1]==="："||layoutDetail.title[layoutDetail.title.length-1]===":"){
                            jsonContent.title = layoutDetail.title;
                        }else{
                            jsonContent.title = layoutDetail.title + "：";
                        }
                        if(layoutDetail.hideTitle){
                            jsonContent.title=''
                        }
                        jsonContent.type = layoutDetail.componentKey;
                        jsonContent.content = formData[layoutDetail.columncode];
                        if(jsonContent.content&&jsonContent.content.indexOf("$PRINTASHTML$")>-1){
                            jsonContent.content=jsonContent.content.replace(/\$PRINTASHTML\$/ig,"");
                        }
                        jsonList.push(jsonContent);
                    }
                    break;
                // 详情页不显示验证码组件  3fuyu
                case "IdentifyCode":
                    break;
                case "CodeRule":
                    if (!layoutDetail.unSeeable&&_this.isHide(layoutDetail.fieldId, processAuthinfo)) {
                        if(layoutDetail.title[layoutDetail.title.length-1]==="："||layoutDetail.title[layoutDetail.title.length-1]===":"){
                            jsonContent.title = layoutDetail.title;
                        }else{
                            jsonContent.title = layoutDetail.title + "：";
                        }
                        if(layoutDetail.hideTitle){
                            jsonContent.title=''
                        }
                        jsonContent.type = layoutDetail.componentKey;
                        jsonContent.content = formData[layoutDetail.columncode];
                        jsonList.push(jsonContent);
                    }
                    break;
                case "Precent":
                    if (!layoutDetail.unSeeable&&_this.isHide(layoutDetail.fieldId, processAuthinfo)) {
                        if(layoutDetail.title[layoutDetail.title.length-1]==="："||layoutDetail.title[layoutDetail.title.length-1]===":"){
                            jsonContent.title = layoutDetail.title;
                        }else{
                            jsonContent.title = layoutDetail.title + "：";
                        }
                        if(layoutDetail.hideTitle){
                            jsonContent.title=''
                        }
                        jsonContent.type = layoutDetail.componentKey;
                        jsonContent.content = formData[layoutDetail.columncode];
                        jsonList.push(jsonContent);
                    }
                    break;
                case "ReferField":
                    if (!layoutDetail.unSeeable&&_this.isHide(layoutDetail.fieldId, processAuthinfo)) {
                        if (layoutDetail.ralateFieldId) {

                            var layoutDetailC = layoutDetail.columncode;
                            if (formData[layoutDetailC]) {
                                jsonContent.content = formData[layoutDetailC];
                            }

                            if(formDataExtraInfo&&formDataExtraInfo[layoutDetailC]){
                                jsonContent.content= formDataExtraInfo[layoutDetailC].showValue?formDataExtraInfo[layoutDetailC].showValue:jsonContent.content;
                                if(formDataExtraInfo[layoutDetailC].componentKey==="Money"&&formDataExtraInfo[layoutDetailC].numberToChinese){
                                    if(!isNaN(new Number(jsonContent.content))){
                                        jsonContent.content = c.MoneyDX(jsonContent.content);
                                    }
                                }
                                if(formDataExtraInfo[layoutDetailC].componentKey==="BillMakerUpperOrg"){
                                    jsonContent.contentTemp= formDataExtraInfo[layoutDetailC].showValue?formDataExtraInfo[layoutDetailC].showValue:jsonContent.content;
                                }
                                if(formDataExtraInfo[layoutDetailC].componentKey==="DateInterval"){
                                    if(jsonContent.content&&jsonContent.content.indexOf('[')>-1&&jsonContent.content.indexOf(',')>-1&&jsonContent.content.indexOf(']')>-1){
                                        jsonContent.content=JSON.parse(jsonContent.content).join(' 至 ');
                                    }
                                }
                            }
                            if(layoutDetail.title[layoutDetail.title.length-1]==="："||layoutDetail.title[layoutDetail.title.length-1]===":"){
                                jsonContent.title = layoutDetail.title;
                            }else{
                                jsonContent.title = layoutDetail.title + "：";
                            }
                            if(layoutDetail.hideTitle){
                                jsonContent.title=''
                            }
                            jsonContent.type = layoutDetail.componentKey;
                            jsonList.push(jsonContent);
                        }
                    }
                    break;
                case "Number":
                    if (!layoutDetail.unSeeable&&_this.isHide(layoutDetail.fieldId, processAuthinfo)) {
                        if(layoutDetail.title[layoutDetail.title.length-1]==="："||layoutDetail.title[layoutDetail.title.length-1]===":"){
                            jsonContent.title = layoutDetail.title;
                        }else{
                            jsonContent.title = layoutDetail.title + "：";
                        }
                        if(layoutDetail.hideTitle){
                            jsonContent.title=''
                        }
                        jsonContent.content = formData[layoutDetail.columncode];
                        jsonContent.type = layoutDetail.componentKey;
                        if (jsonContent.content === "" || !jsonContent.content) {
                            jsonContent.content = "";//干掉 去掉子表默认金额 数值 by liuhca
                        } else {
                            if(jsonContent.content.lastIndexOf('E')===jsonContent.content.length-2||jsonContent.content.lastIndexOf('e')===jsonContent.content.length-2){
                                jsonContent.content=jsonContent.content=new Number(jsonContent.content)+"";
                            }
                            if(!layoutDetail.percent){
                                if (layoutDetail.decimalPlace === 0) {
                                    jsonContent.content = jsonContent.content + "";
                                } else {
                                    if (jsonContent.content.indexOf(".") === -1) {
                                        jsonContent.content += ".";
                                        for (var i = 0, j = layoutDetail.decimalPlace; i < j; i++) {
                                            jsonContent.content += '0';
                                        }
                                    } else {
                                        var sliceIndex1 = jsonContent.content.indexOf('.');
                                        var aoe1 = jsonContent.content.slice(sliceIndex1 + 1);
                                        var decimalQulity = Math.abs(layoutDetail.decimalPlace - aoe1.length);
                                        for (var i = 0, j = decimalQulity.decimalPlace; i < j; i++) {
                                            jsonContent.content += '0';
                                        }
                                    }
                                }
                            }else{
                                jsonContent.content=(jsonContent.content*100).toFixed(layoutDetail.decimalPlace)+"%";
                            }
                        }
                        jsonContent.content+="";
                        if(layoutDetail.thousandth){
                            if(jsonContent.content.indexOf('.')>-1){
                                var frontvalue=jsonContent.content.split('.')[0];
                                while (regMoney.test(frontvalue)) {
                                    frontvalue+="";
                                    frontvalue = frontvalue.replace(regMoney, "$1,$2")
                                }
                                jsonContent.content=frontvalue+'.'+jsonContent.content.split('.')[1]
                            }else{
                                while (regMoney.test(jsonContent.content)) {
                                    jsonContent.content+="";
                                    jsonContent.content = jsonContent.content.replace(regMoney, "$1,$2")
                                }
                            }
                        }
                        jsonList.push(jsonContent);
                    }
                    break;
                default:
                    if (!layoutDetail.unSeeable&&_this.isHide(layoutDetail.fieldId, processAuthinfo)) {
                        if(layoutDetail.componentKey === "UrgentScore"||layoutDetail.componentKey === "UrgentScore"||layoutDetail.componentKey === "DocumentTitle"||layoutDetail.componentKey === "SecretScore"||layoutDetail.componentKey === "SendDocumentNo"||layoutDetail.componentKey === "MainDepartment"||layoutDetail.componentKey === "CopyDepartment"||layoutDetail.componentKey === "MainSender"||layoutDetail.componentKey === "CopySender"||layoutDetail.componentKey === "SecretDate"||layoutDetail.componentKey === "SourceDocumentNo"){
                            layoutDetail.columncode=layoutDetail.componentKey;
                        }
                        if(layoutDetail.title[layoutDetail.title.length-1]==="："||layoutDetail.title[layoutDetail.title.length-1]===":"){
                            jsonContent.title = layoutDetail.title;
                        }else{
                            jsonContent.title = layoutDetail.title + "：";
                        }
                        if(layoutDetail.hideTitle){
                            jsonContent.title=''
                        }

                        jsonContent.type = layoutDetail.componentKey;
                        jsonContent.content = formData[layoutDetail.columncode];

                        if(formDataExtraInfo&&formDataExtraInfo[layoutDetail.columncode]){
                            jsonContent.content= formDataExtraInfo[layoutDetail.columncode].showValue?formDataExtraInfo[layoutDetail.columncode].showValue:jsonContent.content;
                        }

                        if (layoutDetail.componentKey === "Paragraph") {
                            jsonContent.style = layoutDetail.style;
                            if (!jsonContent.content && !layoutDetail.content) {
                                jsonContent.content = "";
                            } else {
                                jsonContent.content = layoutDetail.content;
                            }
                        } else if (layoutDetail.componentKey === "DateInterval") {//by liuhca 针对web端提单时间区间未指定的问题，默认值。移动端默认值处理的问题
                            if (!jsonContent.content) {//如果未设定区间时间，均使用默认创建表单时间
                                var arr = [];
                                arr.push(layoutDetail.tips);//暂用tips当做制单日期
                                arr.push(layoutDetail.tips);
                                jsonContent.content = arr[0] + "," + arr[1];
                            } else {
                                if (jsonContent.content.indexOf(",") > -1) {
                                    var arr = jsonContent.content.split(",");
                                    var targetArr = [];
                                    //起始时间
                                    !!arr[0] ? targetArr.push(arr[0]) : targetArr.push(layoutDetail.tips);
                                    //结束时间
                                    !!arr[1] ? targetArr.push(arr[1]) : targetArr.push(layoutDetail.tips);
                                    jsonContent.content = targetArr[0] + "," + targetArr[1];
                                }
                            }
                        }
                        else if (layoutDetail.componentKey === "Employee" && layoutDetail.isCurrentEmployee) {
                            if(layoutDetail.isReadOnly){//TODO huangzhy 当前用户不可编辑
                                jsonContent.content = formData.createuser;//TODO web 提单的时候用户组件 是当前用户的id
                            }else{
                                jsonContent.content = formData[layoutDetail.columncode];
                            }
                        }
                        if(layoutDetail.componentKey==="Text"&&layoutDetail.isTextArea){
                            jsonContent.comHeight=layoutDetail.comHeight;
                            jsonContent.isTextArea=layoutDetail.isTextArea;
                        }
                        if(layoutDetail.hideTitle){
                            jsonContent.title=''
                        }
                        jsonList.push(jsonContent);
                    }
                    break;
            }
        },
        isHide: function (fieldId, processAuthinfo) {
            if(!processAuthinfo){
                return true
            }
            if (processAuthinfo) {
                for (var i = 0; i < processAuthinfo.length; i++) {
                    if (processAuthinfo[i].fieldid === fieldId) {
                        processAuthinfo[i].auth+="";
                        if (processAuthinfo[i].auth === "0") {
                            return false;
                        }
                    }
                }
            }
            return true;
        },
        processSubComponents:function (layoutDetail,processAuthinfo) {
            if(processAuthinfo){
                for(var i=0,j=layoutDetail.length;i<j;i++){
                    var curLayoutDetail=layoutDetail[i];
                    // if(!processAuthinfo) return false;
                    for(var ii=0,jj=processAuthinfo.length;ii<jj;ii++){
                        processAuthinfo[ii].auth+="";
                        if(curLayoutDetail.fieldId===processAuthinfo[ii].fieldid&&(processAuthinfo[ii].auth==="1"||processAuthinfo[ii].auth==="2")){
                            return true;
                        }
                    }
                }
            }else{
                return false;
            }
        },
        selectSetHide:function (formLayout,formData) {
            var layoutDetail=formLayout.layoutDetail,allrules=[];
            for(var i=0;i<layoutDetail.length;i++){
                if(layoutDetail[i].componentKey==='ColumnPanel'||layoutDetail[i].componentKey==='TableLayout'){
                    var temp=layoutDetail[i].layoutDetail;
                    for(var m=0;m<temp.length;m++){
                        if(temp[m].layoutDetail.length>0&&temp[m].layoutDetail[0].componentKey==='Select'&&temp[m].layoutDetail[0].rightsOptions&&temp[m].layoutDetail[0].rightsOptions.rules.length>0){
                            allrules.push(temp[m].layoutDetail[0]);
                        }
                    }
                }
                if(layoutDetail[i].componentKey==='Select'&&layoutDetail[i].rightsOptions&&layoutDetail[i].rightsOptions.rules.length>0){
                    allrules.push(layoutDetail[i]);
                }
                if(layoutDetail[i].componentKey==='DataTable'){
                    var tabletemp=layoutDetail[i].layoutDetail;
                    for(var y=0;y<tabletemp.length;y++){
                        if(tabletemp[y].componentKey==='Select'&&tabletemp[y].rightsOptions&&tabletemp[y].rightsOptions.rules.length>0){
                            allrules.push(temp[m]);
                        }
                    }
                }
            }

            for(var ii=0;ii<allrules.length;ii++){
                var rules=allrules[ii].rightsOptions.rules;
                var curii=ii;
                for(var jj=0;jj<rules.length;jj++){
                    var rule=rules[jj].fields;
                    try {
                        if(rules[jj].symbol==="equal"&&(formData[allrules[curii].columncode]===rules[jj].val||(rules[jj].val==='other'&&formData[allrules[curii].columncode].indexOf('$$hasOther$$')>-1))){
                            for(var n=0;n<rule.length;n++){
                                var controlFieldId=rule[n];
                                if(!controlFieldId.seeable){
                                    layoutDetail.forEach(function (item,index) {
                                        if(item.componentKey==="ColumnPanel"||item.componentKey==="TableLayout"){
                                            if(item.fieldId===controlFieldId.fieldId){
                                                item.unSeeable=true;
                                            }else{
                                                try{
                                                    item.layoutDetail.forEach(function (iitem,iindex) {
                                                        iitem.layoutDetail.forEach(function (iiitem,iiindex) {
                                                            if(iiitem.fieldId===controlFieldId.fieldId){
                                                                iiitem.unSeeable=true;
                                                            }
                                                        })
                                                    });
                                                }catch (e){
                                                    console.log(e);
                                                }
                                            }
                                        }else{
                                            if(item.fieldId===controlFieldId.fieldId){
                                                item.unSeeable=true;
                                            }
                                            if(item.componentKey==="DataTable"&&item.subFormId===controlFieldId.fieldId){
                                                item.unSeeable=true;
                                            }
                                        }
                                    });
                                }else{
                                    layoutDetail.forEach(function (item,index) {
                                        if(item.componentKey==="ColumnPanel"||item.componentKey==="TableLayout"){
                                            if(item.fieldId===controlFieldId.fieldId){
                                                item.unSeeable=false;
                                            }else{
                                                try{
                                                    item.layoutDetail.forEach(function (iitem,iindex) {
                                                        iitem.layoutDetail.forEach(function (iiitem,iiindex) {
                                                            if(iiitem.fieldId===controlFieldId.fieldId){
                                                                iiitem.unSeeable=false;
                                                            }
                                                        })
                                                    });
                                                }catch (e){
                                                    console.log(e);
                                                }
                                            }

                                        }else{
                                            if(item.fieldId===controlFieldId.fieldId){
                                                item.unSeeable=false;
                                            }
                                            if(item.componentKey==="DataTable"&&item.subFormId===controlFieldId.fieldId){
                                                item.unSeeable=false;
                                            }
                                        }
                                    });
                                }
                            }
                        }else if(rules[jj].symbol==="notEqual"&&formData[allrules[curii].columncode]&&formData[allrules[curii].columncode]!==rules[jj].val){
                            for(var m=0;m<rule.length;m++){
                                var notEqualcontrolFieldId=rule[m];
                                if(!notEqualcontrolFieldId.seeable){
                                    layoutDetail.forEach(function (item,index) {
                                        if(item.componentKey==="ColumnPanel"||item.componentKey==="TableLayout"){
                                            if(item.fieldId===notEqualcontrolFieldId.fieldId){
                                                item.unSeeable=true;
                                            }else{
                                                try{
                                                    item.layoutDetail.forEach(function (iitem,iindex) {
                                                        iitem.layoutDetail.forEach(function (iiitem,iiindex) {
                                                            if(iiitem.fieldId===notEqualcontrolFieldId.fieldId){
                                                                iiitem.unSeeable=true;
                                                            }
                                                        })
                                                    });
                                                }catch (e){
                                                    console.log(e);
                                                }
                                            }

                                        }else{
                                            if(item.fieldId===notEqualcontrolFieldId.fieldId){
                                                item.unSeeable=true;
                                            }
                                            if(item.componentKey==="DataTable"&&item.subFormId===notEqualcontrolFieldId.fieldId){
                                                item.unSeeable=true;
                                            }
                                        }
                                    });
                                }else{
                                    layoutDetail.forEach(function (item,index) {
                                        if(item.componentKey==="ColumnPanel"||item.componentKey==="TableLayout"){
                                            if(item.fieldId===notEqualcontrolFieldId.fieldId){
                                                item.unSeeable=false;
                                            }else{
                                                try{
                                                    item.layoutDetail.forEach(function (iitem,iindex) {
                                                        iitem.layoutDetail.forEach(function (iiitem,iiindex) {
                                                            if(iiitem.fieldId===notEqualcontrolFieldId.fieldId){
                                                                iiitem.unSeeable=false;
                                                            }
                                                        })
                                                    });
                                                }catch (e){
                                                    console.log(e);
                                                }
                                            }

                                        }else{
                                            if(item.fieldId===notEqualcontrolFieldId.fieldId){
                                                item.unSeeable=false;
                                            }
                                            if(item.componentKey==="DataTable"&&item.subFormId===notEqualcontrolFieldId.fieldId){
                                                item.unSeeable=false;
                                            }
                                        }
                                    });
                                }
                            }
                        }
                    }catch (e){
                        console.log(e);
                    }
                }
            }
            formLayout.layoutDetail=layoutDetail;
            return formLayout
        }
    };
    return Re;
});
