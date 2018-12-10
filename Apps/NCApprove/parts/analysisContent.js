/**
 * Created by Gin on 17/3/21.
 */
define(["./common", "utils","../parts/language"], function (c, utils,language) {
    var Re = {
        getAnalysisContent: function (sender, _this) {
            var type = sender.datasource.type;
            if(sender.datasource.comHeight){
                sender.config.style.height=sender.datasource.comHeight+'px';
                sender.config.style.isTextarea=true;
            }
            switch (type) {
                case "link":
                case "Hyperlink":
                    sender.config.style.color = "#0093ff";
                    break;
                case "DocumentDepartment":
                    sender.config.text = "";
                    if(!sender.datasource.content) return;
                    _this.pageview.ajax({
                        url: "user/queryOrgNames",
                        type: "POST",
                        data: {
                            orgCodes: sender.datasource.content
                        },
                        success: function (data) {
                            sender.innerText.html(data.data);
                            if (data.data.length === 0) {
                                sender.innerText.html(sender.datasource.content);
                            }
                            // sender.$el.addClass("line_clamp10");
                        },
                        error: function (data) {
                        }
                    });
                    break;
                case "BillMaker":
                    sender.config.text = "";
                    if(!sender.datasource.content) return;
                    _this.pageview.ajax({
                        url: "user/getUserNames",
                        type: "POST",
                        data: {
                            memberIds: sender.datasource.content,
                            partSign:'、'
                        },
                        success: function (data) {
                            if(data.data&&data.data.userName&&data.data.memberIds){
                                sender.innerText.html(data.data.userName);
                            }else{
                                sender.innerText.html(sender.datasource.content);
                            }
                        },
                        error: function (data) {
                        }
                    });
                    break;
                case "BillMakerManager":
                    sender.config.text = "";
                    if(!sender.datasource.content) return;
                    _this.pageview.ajax({
                        url: "user/getUserNames",
                        type: "POST",
                        data: {
                            memberIds: sender.datasource.content,
                        },
                        success: function (data) {
                            if(data.data&&data.data.userName&&data.data.memberIds){
                                sender.innerText.html(data.data.userName);
                            }else{
                                sender.innerText.html(sender.datasource.content);
                            }
                        },
                        error: function (data) {
                        }
                    });
                    break;
                case "BillMakerUpperManager":
                    sender.config.text = "";
                    if(!sender.datasource.content) return;
                    _this.pageview.ajax({
                        url: "user/getUserNames",
                        type: "POST",
                        data: {
                            memberIds: sender.datasource.content,
                        },
                        success: function (data) {
                            if(data.data&&data.data.userName&&data.data.memberIds){
                                sender.innerText.html(data.data.userName);
                            }else{
                                sender.innerText.html(sender.datasource.content);
                            }
                        },
                        error: function (data) {
                        }
                    });
                    break;
                case "BillMakerOrg":
                    sender.config.text = "";
                    if(!sender.datasource.content) return;
                    _this.pageview.ajax({
                        url: "user/queryOrgNames",
                        type: "POST",
                        data: {
                            orgCodes: sender.datasource.content
                        },
                        success: function (data) {
                            sender.innerText.html(data.data);
                            if (data.data.length === 0) {
                                sender.innerText.html(sender.datasource.content);
                            }
                            // sender.$el.addClass("line_clamp10");
                        },
                        error: function (data) {
                        }
                    });
                    break;
                case "BillMakerOrganization":
                    sender.config.text = "";
                    if(!sender.datasource.content) return;
                    _this.pageview.ajax({
                        url: "user/queryOrgNames",
                        type: "POST",
                        data: {
                            orgCodes: sender.datasource.content
                        },
                        success: function (data) {
                            sender.innerText.html(data.data);
                            if (data.data.length === 0) {
                                sender.innerText.html(sender.datasource.content);
                            }
                            // sender.$el.addClass("line_clamp10");
                        },
                        error: function (data) {
                        }
                    });
                    break;
                case "MainDepartment":
                    sender.config.text = "";
                    if(!sender.datasource.content) return;
                    _this.pageview.ajax({
                        url: "user/queryOrgNames",
                        type: "POST",
                        data: {
                            orgCodes: sender.datasource.content,
                            partSign:'、'
                        },
                        success: function (data) {
                            sender.innerText.html(data.data);
                            if (data.data.length === 0) {
                                sender.innerText.html(sender.datasource.content);
                            }
                        },
                        error: function (data) {
                        }
                    });
                    break;
                case "CopyDepartment":
                    sender.config.text = "";
                    if(!sender.datasource.content) return;
                    _this.pageview.ajax({
                        url: "user/queryOrgNames",
                        type: "POST",
                        data: {
                            orgCodes: sender.datasource.content,
                            partSign:'、'
                        },
                        success: function (data) {
                            sender.innerText.html(data.data);
                            if (data.data.length === 0) {
                                sender.innerText.html(sender.datasource.content);
                            }
                        },
                        error: function (data) {
                        }
                    });
                    break;
                case "TaskComment":
                    var reg=/\n/ig;
                    while (reg.test(sender.config.text)){
                        sender.config.text=sender.config.text.replace(reg,"<br />")
                    }
                    break;
                case "date":
                    if (sender.datasource.kind === "datetime") {
                        sender.config.text = sender.config.text ? utils.ConvertDateToStr(sender.config.text, "yyyy-MM-dd hh:mm:ss") : "";

                    } else if (sender.datasource.kind === "time") {
                        sender.config.text = sender.config.text ? utils.ConvertDateToStr(sender.config.text, "hh:mm:ss") : "";

                    } else {
                        sender.config.text = sender.config.text ? utils.ConvertDateToStr(sender.config.text, "yyyy-MM-dd") : "";
                    }
                    break;
                case "user":
                    var _userId = sender.config.text;
                    if(!_userId) return;
                    var userAjaxConfig = {
                        url: '/user/getUserInfo',
                        type: 'POST',
                        data: {
                            userId: _userId || ''
                        },
                        success: function (userData) {
                            if (userData.success) {
                                sender.setText(userData.data.userName);
                                // sender.$el.addClass("line_clamp10");
                            }
                        },
                        error: function (listData) {
                        }
                    };

                    _this.pageview.ajax(userAjaxConfig);
                    break;
                case "BillMakerUpperOrg":
                    sender.config.text = "";
                    if(!sender.datasource.content) return;
                    _this.pageview.ajax({
                        url: "user/queryOrgNames",
                        type: "POST",
                        data: {
                            orgCodes: sender.datasource.content
                        },
                        success: function (data) {
                            sender.innerText.html(data.data);
                            if (data.data.length === 0) {
                                sender.innerText.html(sender.datasource.content);
                            }
                        },
                        error: function (data) {
                        }
                    });
                    break;
                case "money":
                    if ($.isNumeric(sender.config.text));
                    sender.config.text += '';
                    break;
                case "Money":
                    if (sender.config.text !== "") {//by huangzhy 金额为负值，金额大写显示颜色
                        if (sender.config.text !== '0' && sender.config.text !== '零元整') {
                            if(typeof sender.config.text=="number"){
                                sender.config.text=sender.config.text+"";
                            }
                            if(sender.config.text){
                                if(sender.config.text.indexOf("-")>-1&&isNaN(sender.config.text[1])){
                                    sender.config.style.color="#ff0000";
                                    sender.config.text = sender.config.text.slice(1) + " ";
                                }else{
                                    sender.config.text = sender.config.text + " " ;
                                }
                            }

                        } else {
                            sender.config.text = '';
                        }
                    } else {
                        sender.config.text = "";//by liuhca 如果默认金额没有填写，则不显示
                    }
                    if(sender.config.$$datasource.color==="red"){
                        sender.config.style.color="#ff0000";
                    }
                    // sender.$el.addClass("line_clamp10");
                    break;
                case "boolean":
                    var boolean = sender.datasource.content === "1" ? "是" : "否";
                    sender.config.text = boolean;
                    break;
                case "Paragraph":
                    // sender.$el.css(_this.classContent[sender.datasource.style]);
                    sender.config.text = " " + sender.datasource.content;
                    sender.config.style.color="rgb(158, 158, 158)";
                    break;
                case "Picture":
                case "file":
                case "File":
                case "DividingLine":
                case "DataTable":
                    var tempComponentKey=sender.config.datasource
                    if (sender.config.text !== '0' && sender.config.text !== '零元整') {
                        sender.config.text = sender.config.text + " " + sender.datasource.moneyType;
                        if(sender.config.text.indexOf(".")>-1){
                        }
                    } else {
                        sender.config.text = '';
                    }
                    if(sender.config.text.indexOf("-")>-1){
                        sender.config.style.color="#ff0000";
                    }
                    sender.$el.hide();
                    break;
                case "DateCalculate":
                    if (sender.config.text) {
                        sender.config.text += "";
                    } else {
                        sender.config.text = "0 天";
                    }
                    break;
                case "Text":
                    var leftLength = sender.datasource.title.length,
                        rightLength = sender.datasource.content ? sender.datasource.content.length : 0,
                        totalLength = rightLength + leftLength;
                    if (leftLength <= 6) {
                        sender.config.style.width = 'auto';
                        sender.config.style.maxWidth = '76%';
                        sender.config.style.paddingLeft = '10px';
                    } else {
                        sender.config.style.width = 'auto';
                        sender.config.style.maxWidth = '70%';
                        sender.config.style.paddingLeft = '10px';
                    }
                case "TextEditor":
                    // sender.$el.addClass("line_clamp10");
                    sender.config.text = sender.datasource.content && sender.datasource.content.replace(/\n/ig, "<br/>");
                    break;
                case "DateInterval":
                    try {
                        var arrParse;
                        //针对pc填单，移动端
                        if(sender.datasource.content.indexOf("[")>-1){
                            arrParse = JSON.parse(sender.datasource.content)
                        }else if(sender.datasource.content.indexOf(",")>-1){
                            arrParse = sender.datasource.content.split(',');
                        }else{
                            if (sender.datasource.content) {
                                var arrParse12 = sender.datasource.content;
                                var tempVal2=Math.round(arrParse1.length/2);
                                sender.config.text = arrParse12.slice(0,tempVal2-1) + " 至 " + arrParse12.slice(tempVal2+1);
                            }else {
                                sender.config.text = "";
                            }
                            return;
                        }
                        if (arrParse[0] === ''&&arrParse[1]!=="") {
                            return sender.config.text =" 至 " + arrParse[1];
                        }else if(arrParse[0] !== ''&&arrParse[1]===""){
                            return sender.config.text = arrParse[0]+" 至 ";
                        }else if(arrParse[0] == '' && arrParse[1] == ''){
                            return sender.config.text = "";
                        }
                        if (arrParse[0].length > 0 && arrParse[1].length > 0) {
                            sender.config.text = arrParse[0] + " 至 " + arrParse[1];
                        } else {
                            sender.config.text = "";
                        }
                    } catch (e) {
                        if (sender.datasource.content) {
                            sender.datasource.content=sender.datasource.content.trim();
                            if(sender.datasource.content[0]==="-"){
                                sender.config.text=" 至 " +sender.datasource.content.slice(1)
                            }else if(sender.datasource.content[sender.datasource.content.length-1]==="-"){
                                sender.config.text=sender.datasource.content.slice(0,sender.datasource.content.length-1)+" 至 ";
                            }else{
                                var arrParse1 = sender.datasource.content;
                                var tempVal=Math.round(arrParse1.length/2);
                                sender.config.text = arrParse1.slice(0,tempVal-1) + " 至 " + arrParse1.slice(tempVal+1);
                            }
                        }
                    }
                    break;

                case "Raty":
                    if (sender.config.text) {
                        sender.config.text = sender.config.text + language.formTips.stars;
                    } else {
                        sender.config.text = '';
                    }

                    break;
                case "Location":
                    sender.config.style.textDecoration='underline';
                    sender.config.style.color='blue';
                    break;
                case "SendDocumentNo":
                    if(sender.config.text){
                        sender.config.text=sender.config.text.split(";")[0];
                    }
                    break;
                case "Employee":
                    sender.config.text = "";
                    if(!sender.datasource.content) return;
                    _this.pageview.ajax({
                        url: "user/getUserNames",
                        type: "POST",
                        data: {
                            memberIds: sender.datasource.content
                        },
                        success: function (data) {
                            if(data.data){
                                sender.innerText.html(data.data.userName);
                            }
                        },
                        error: function (data) {
                        }
                    });
                    break;
                case "Department":

                    sender.config.text = "";
                    if(!sender.datasource.content) return;
                    _this.pageview.ajax({
                        url: "user/queryOrgNames",
                        type: "POST",
                        data: {
                            orgCodes: sender.datasource.content
                        },
                        success: function (data) {
                            sender.innerText.html(data.data);
                            if (data.data.length === 0) {
                                sender.innerText.html(sender.datasource.content);
                            }
                            // sender.$el.addClass("line_clamp10");
                        },
                        error: function (data) {
                        }
                    });
                    break;
            }
        }
    };
    return Re;
});
