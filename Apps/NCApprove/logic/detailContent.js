/**
 * Created by Gin on 17/2/25.
 */
define(["../parts/currency", "utils", "../parts/format", "../parts/analysisContent","../../../components/dialog","../../../components/mapdialog","../parts/language"], function (c, utils, format, ac,Dialog,Mapdialog,language) {
    function PageLogic(config) {
        var _this = this;
        this.pageview = config.pageview;
        this.itemNum = 1;
        var mapKey = '608d75903d29ad471362f8c58c550daf';
        this.center = '';
        this.locationObj='';

        this.classContent = {
            "alert-none": {
                "padding-left": "10px",
                "color": "rgb(85, 85, 85)",
                "border-color": "rgb(204, 204, 204)"
            },
            "alert-success": {
                "padding-left": "10px",
                "color": "rgb(60, 118, 61)",
                "background-color": "rgb(223, 240, 216)"
            },
            "alert-info": {
                "padding-left": "10px",
                "color": "rgb(49, 112, 143)",
                "background-color": "rgb(217, 237, 247)"
            },
            "alert-warning": {
                "padding-left": "10px",
                "color": "rgb(138, 109, 59)",
                "background-color": "rgb(252, 248, 227)"
            },
            "alert-danger": {
                "padding-left": "10px",
                "color": "rgb(169, 68, 66)",
                "background-color": "rgb(242, 222, 222)"
            }
        };
    }

    PageLogic.prototype = {
        detail_repeat_iteminit: function (sender, params) {
            if (sender.datasource.type === "Paragraph") {
                sender.$el.css(this.classContent[sender.datasource.style]);
            } else if (sender.datasource.type === "DataTable") {
                window.setTimeout(function () {
                    sender.refs.datatable_repeat.bindData(sender.datasource.items);

                    sender.refs.datatable_repeat.$el.show();
                }, 100);
            }
        },

        assignbehind_title_init:function (sender,prams) {
            sender.config.text=language.dealPage.assignParticipants;
        },
        copyuser_title_init:function (sender,prams) {
            sender.config.text=language.componentTitle.copyuser;
        },
        detail_item_content_init: function (sender, params) {
            ac.getAnalysisContent(sender, this);
        },
        detail_item_content_click: function (sender, params) {
            var _this=this;
            if(sender.datasource.type==="Paragraph"){
                if(params.e.target.tagName.toLowerCase()==="a"&&params.e.target.href){
                    window.yyesn.client.openWindow(function () {},{
                        orientation:'1',
                        url:params.e.target.href,
                    },function (b) {
                        console.log(b);
                    });
                }
            }
            if(sender.datasource.detailUrl){
                window.yyesn.client.openWindow(function () {},{
                    orientation:'1',
                    url:sender.datasource.detailUrl ,
                },function (b) {
                    console.log(b);
                });
            }else if(sender.datasource.refUrl){
                this.pageview.ajax({
                    url: "/process/getProcInsByFormId",
                    timeout: 15000,
                    type: "POST",
                    data: {
                        pk_bo:sender.datasource.refUrl.instId,
                        pk_boins:sender.datasource.refUrl.taskId
                    },
                    success: function (data) {
                        if (data.success) {
                            _this.pageview.go('detail',{
                                taskId: data.data.procDefId,
                                instId: data.data.procInsId,
                            });
                        } else {
                            _this.pageview.showTip({text: data.msg, duration: 1000});
                        }
                    },
                    error: function (data) {
                        _this.pageview.showTip({text: data.msg, duration: 1000});
                    }
                });
            }

            if(sender.datasource.type==='Location'){
                params.e.preventDefault();
                params.e.stopPropagation();
                //如果已存地址，则展示改地址；如果开启自动定位则获取当前经纬度
                if(sender.datasource.trueValue){
                    _this.pageview.showLoading();
                    try{
                        _this.locationObj = JSON.parse(sender.datasource.trueValue);
                        _this.center +=_this.locationObj.location;
                    }catch(e){

                    }
                    setTimeout(function () {
                        _this.renderMap();
                    },100);

                }
            }
            if(sender.datasource.type==="Hyperlink"&&sender.datasource.trueValue){
                window.open(sender.datasource.trueValue,'_self');
            }
        },
        detail_item_title_init: function (sender, params) {
            switch (sender.datasource.type) {
                case "file":
                case "File":
                    sender.config.style.minHeight = 30;
                    break;
                case "Paragraph":
                case "Picture":
                case "DividingLine":
                case "DataTable":
                    sender.$el.hide();
                    break;
                default:

                    var leftLength = sender.datasource.title.length,
                        rightLength = sender.datasource.content ? sender.datasource.content.length : 0,
                        totalLength = rightLength + leftLength;

                    if (totalLength <= 24) {
                        sender.config.style.width = 'auto';
                        sender.config.style.paddingRight = '10';
                    } else {
                        sender.config.style.width = 'auto';
                        sender.config.style.maxWidth = '40%';
                        sender.config.style.paddingRight = '10';
                    }
                    if(sender.datasource.type==='Text'){
                        sender.config.style.marginTop = '10';
                    }
                    break;
            }
        },
        detail_iamge_init: function (sender, params) {
            if (sender.datasource.type === "Picture") {
                sender.config.src = sender.datasource.url;
            } else {
                sender.$el.hide();
            }
        },
        detail_DividingLine_init: function (sender, params) {
            if (sender.datasource.type !== "DividingLine") {
                sender.$el.hide();
            } else {
                sender.rowInstance.$el.css({
                    "min-height": "0px",
                    "border-bottom": "1px solid rgb(237, 237, 237)"
                });
            }
        },
        detail_view_init: function (sender, params) {
            if (sender.datasource.type === "file" || sender.datasource.type === "File") {
                sender.$el.css({
                    "flex-direction": "column",
                    "width": "100%"
                });
            }
        },
        detail_item_files_init: function (sender, params) {
            var _sender = sender;
            if (sender.rowInstance.datasource.type === "file") {
                var attaAjaxConfig = {
                    url: '/process/getInstanceAttachments',
                    type: 'POST',
                    data: {
                        fileIds: sender.rowInstance.datasource.content || ''
                    },
                    success: function (attaData) {
                        if (attaData.code === 0) {
                            _sender.bindData(attaData.data);
                        }
                    },
                    error: function (listData) {
                    }
                };

                this.pageview.ajax(attaAjaxConfig);
            } else if (sender.rowInstance.datasource.type === "File") {
                if (sender.rowInstance.datasource.content) {
                    _sender.bindData(JSON.parse(sender.rowInstance.datasource.content));
                }
            } else {
                sender.config.style.display = "none";
            }
        },

        btnAddDoc_click: function (sender, params) {
            var instId = this.pageview.params.instId,
                title = window._applyHistory.instData.name,
                formType = 'addFormMore',
                mainForm = window._applyHistory.mainForm,
                source = mainForm ? mainForm.source : '';

            this.pageview.go("form", {
                id: instId,
                title: encodeURIComponent(title),
                source: source,
                formType: formType
            });
        },
        detail_item_files_itemclick: function (sender, params) {
            var fileType = sender.datasource.type;
            var previewFileName="";
            if(!sender.datasource.url){
                sender.datasource.url=sender.datasource.src||sender.datasource.aliOSSUrl;
            }
            var previewUrl=sender.datasource.url;
            if(!sender.datasource.filename){
                sender.datasource.filename=sender.datasource.name;
            }
            previewUrl=previewUrl?previewUrl:sender.datasource.aliOSSUrl;
            if(previewUrl.indexOf('+')>-1&&decodeURIComponent(previewUrl).indexOf(sender.datasource.filename)===-1){
                previewUrl=decodeURIComponent(previewUrl).replace(/\+/g,' ');
            }
            if(previewUrl.indexOf('https:')===-1&&previewUrl.indexOf('http:')===-1){
                previewUrl=window.location.protocol+'//'+previewUrl;
            }

            if (!fileType && sender.datasource.filename) {
                var filename = sender.datasource.filename;

                if (filename.indexOf('jpeg') > -1 || filename.indexOf('bmp') > -1|| filename.indexOf('JPG') > -1 || filename.indexOf('gif') > -1 || filename.indexOf('png') > -1|| filename.indexOf('PNG') > -1|| filename.indexOf('JPEG') > -1|| filename.indexOf('GIF') > -1|| filename.indexOf('BMP') > -1) {
                    fileType = 'image';
                } else {
                    fileType = '';
                }
            }

            var cur=sender.datasource.url.split(".");
            var curLast=cur[[cur.length-1]].toLocaleLowerCase();
            previewFileName=language.previewExtra.name+curLast;
            var _this=this;
        },
        detail_files_view_left_init: function (sender, params) {
            if(!sender.datasource.url){
                sender.datasource.url=sender.datasource.src||sender.datasource.url.aliOSSUrl;
            }
            var cur=sender.datasource.url?sender.datasource.url.split("."):[];
            var fileType;
            if(!sender.datasource.type){
                if(cur.length>0){
                    fileType=cur[[cur.length-1]].toLocaleLowerCase();
                }else{
                    fileType='unknow';
                }
            }else{
                fileType=sender.datasource.type;
            }

            if(sender.datasource.picOnly){
                sender.config.src = sender.datasource.src||"./imgs/" + format.getFormat(fileType).ext;
            }else{
                sender.config.src = "./imgs/" + format.getFormat(fileType).ext||sender.datasource.src;
            }
        },
        detail_files_view_right_init:function (sender,params) {
            if(sender.datasource.picOnly){
                sender.$el.hide();
            }
        },
        detail_repeat_itemclick: function (sender, params) {
            if (sender.datasource.type === "link" || sender.datasource.type === "Hyperlink") {
                if (sender.datasource.content.indexOf("http://") === -1 && sender.datasource.content.indexOf("https://") === -1) {
                    sender.datasource.content = window.location.protocol+"//" + sender.datasource.content;
                }
                window.open(sender.datasource.content, '_self');
            }
        },
        moreBill_click: function (sender, params) {
            var bpmActivityForms = window._applyHistory.bpmActivityForms;

            localStorage.setItem("_applyHistory", JSON.stringify(window._applyHistory));
            if (bpmActivityForms.length === 1) {
                this.pageview.go("subformDetail", {id: bpmActivityForms[0].id});
            } else {
                this.pageview.go("subformList");
            }
        },
        subform_view_title_init: function (sender, params) {
            sender.config.preText = this.itemNum;
            this.itemNum++;
        },
        subform_view_item_init: function (sender, params) {
            sender.bindData(sender.rowInstance.datasource.item);
        },
        subform_view_item_content_init: function (sender, params) {
            ac.getAnalysisContent(sender, this);
        },
        subform_view_item_title: function (sender, params) {
            switch (sender.datasource.type) {
                case "file":
                case "File":
                    sender.config.style.minHeight = 30;
                    break;
                case "Paragraph":
                case "Picture":
                case "DividingLine":
                case "DataTable":
                    sender.$el.hide();
                    break;
                default:
                    var leftLength = sender.datasource.title.length,
                        rightLength = sender.datasource.content ? sender.datasource.content.length : 0,
                        totalLength = rightLength + leftLength;

                    if (totalLength <= 24) {
                        sender.config.style.width = 'auto';
                        sender.config.style.paddingRight = '10';
                    } else {
                        sender.config.style.width = 'auto';
                        sender.config.style.maxWidth = '110px';
                        sender.config.style.paddingRight = '10';
                    }

                    break;
            }
        },

        datatable_view_item_content_click: function (sender, params) {
            var _this=this;
            if (sender.datasource.type === "link" || sender.datasource.type === "Hyperlink") {
                if(sender.datasource.type==="Hyperlink"&&sender.datasource.trueValue){
                    window.open(sender.datasource.trueValue,'_self');
                }else{
                    if (sender.datasource.content.indexOf("http://") === -1 && sender.datasource.content.indexOf("https://") === -1) {
                        sender.datasource.content = window.location.protocol+"//" + sender.datasource.content;
                    }
                    window.open(sender.datasource.content,'_self');
                }
            }
            if(sender.datasource.detailUrl){
                window.yyesn.client.openWindow(function () {},{
                    orientation:'1',
                    url: sender.datasource.detailUrl,
                },function (b) {
                    console.log(b);
                });
            }else if(sender.datasource.refUrl){
                this.pageview.ajax({
                    url: "/process/getProcInsByFormId",
                    timeout: 15000,
                    type: "POST",
                    data: {
                        pk_bo:sender.datasource.refUrl.instId,
                        pk_boins:sender.datasource.refUrl.taskId
                    },
                    success: function (data) {
                        if (data.success) {
                            _this.pageview.go('detail',{
                                taskId: data.data.procDefId,
                                instId: data.data.procInsId,
                            });
                        } else {
                            _this.pageview.showTip({text: data.msg, duration: 1000});
                        }
                    },
                    error: function (data) {
                        _this.pageview.showTip({text: data.msg, duration: 1000});
                    }
                });
            }
        },
        datatable_view_item_content_init: function (sender, params) {
            ac.getAnalysisContent(sender, this);
        },
        datatable_view_title_init: function (sender, params) {
            sender.config.preText = sender.datasource.num;
        },
        datatable_view_item_title_init: function (sender, params) {
            switch (sender.datasource.type) {
                case "file":
                case "File":
                    sender.config.style.minHeight = 30;
                    // sender.config.style.backgroundColor = "rgb(251,251,251)";
                    break;
                case "Paragraph":
                case "Picture":
                case "DividingLine":
                case "DataTable":
                    sender.$el.hide();
                    break;
                default:
                    var leftLength = sender.datasource.title.length,
                        rightLength = sender.datasource.content ? sender.datasource.content.length : 0,
                        totalLength = rightLength + leftLength;

                    if (totalLength <= 24) {
                        sender.config.style.width = 'auto';
                        sender.config.style.paddingRight = '10';
                    } else {
                        sender.config.style.width = 'auto';
                        sender.config.style.maxWidth = '50%';
                        sender.config.style.paddingRight = '10';
                    }

                    break;
            }
        },

        datatable_view_item_init: function (sender, params) {
            sender.bindData(sender.rowInstance.datasource.items);
        },
        copyuser_img_init: function (sender, params) {
            if (!sender.datasource.pic) {
                sender.config.src = "none.png";
            }
        },
    };
    return PageLogic;
});
