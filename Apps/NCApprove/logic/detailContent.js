
define(["utils", "../parts/format", "../parts/analysisContent","../../../components/dialog","../parts/language"], function (utils, format, ac,Dialog,language) {
    function PageLogic(config) {
        var _this = this;
        this.pageview = config.pageview;
        this.itemNum = 1;

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

        detail_item_content_init: function (sender, params) {
            if(sender.datasource.type==="DataTable"){
                sender.$el.hide();
            }
            ac.getAnalysisContent(sender, this);
        },
        detail_item_content_click: function (sender, params) {
            
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
            
        },

        datatable_view_item_content_click: function (sender, params) {
            
        },
        datatable_view_item_content_init: function (sender, params) {
            ac.getAnalysisContent(sender, this);
        },
        datatable_view_title_init: function (sender, params) {
            sender.config.preText = sender.datasource.num;
        },
        datatable_view_item_title_init: function (sender, params) {
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
        },

        datatable_view_item_init: function (sender, params) {
            sender.bindData(sender.rowInstance.datasource.items);
        },
    };
    return PageLogic;
});
