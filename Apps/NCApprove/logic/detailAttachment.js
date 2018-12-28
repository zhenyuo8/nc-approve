
define(["../parts/common", "utils", "../../../components/dialog", "../parts/language","../parts/format"], function (c, utils, Dialog, language,format) {
    function pageLogic(config) {
        var _this = this;
        this.pageview = config.pageview;
        this._taskId = this.pageview.params.taskId;
        this.parentThis = this.pageview.viewpagerParams.parent;
        this.loadData();
    }

    pageLogic.prototype = {
        onPageResume: function () {
            this._loadData();
        },
        loadData: function () {
            var _this = this;
            this.applyHistory = window._applyHistory;

            this.pageview.showLoading({
                text: language.formTips.onLoading,
                timeout: 8000,
                reLoadCallBack: function () {
                    _this._loadData();
                }
            });
            _this._loadData();
        },
        _loadData: function () {
            var _this = this,
                ajaxConfig = {
                    url: '/process/getTaskAttachments',
                    type: 'GET',
                    data: {
                        taskId: _this.parentThis.pageview.params.taskId,
                        cuserId:_this.parentThis.pageview.params.cuserId,
                        billId:_this.parentThis.pageview.params.billId,
                        billType:_this.parentThis.pageview.params.billType,
                    },
                    success: function (listData) {
                        _this.pageview.hideLoading(true);
                        _this.pageview.delegate('flow_repeat', function (target) {
                            target.bindData(listData.data);
                        });
                    },
                    error: function (err) {
                        _this.pageview.hideLoading(true);
                        var data=[{name: "测试word文档", status: "审批中",time:'2018-12-05 12:55:30',author:'陈展鹏',type:'png',"aliOSSUrl":"https://static.yonyoucloud.com/102136/3160785/201812/7/1544162843134f4e62c39e5228c660471c4397a1cb.jpg"}, {name: "八卦图片", status: "审批中",time:'2018-11-12 12:55:30',author:'周武王',type:'application/pdf',"aliOSSUrl":"https://ncc-ys-prod-oss.oss-cn-beijing.aliyuncs.com/xcnisnhw/52d5f399-47f7-4ce1-b7bf-6a4d9374cdda/1545881640347_3.%20%E5%91%98%E5%B7%A5%E8%BD%AC%E6%AD%A3%E5%AE%A1%E6%89%B9%E8%A1%A8.pdf"}];
                        _this.pageview.delegate('flow_repeat', function (target) {
                            target.bindData(data);
                        });
                    }
                };
            this.pageview.ajax(ajaxConfig);
        },
        list_nodata_text_init:function (sender, params) {
            sender.config.text=language.formTips.noAttachment;
        },
        format_image_init: function (sender, params) {
            var fileType = sender.datasource.type?sender.datasource.type.toLowerCase() : '';
            var subTypeArr=sender.datasource.aliOSSUrl?sender.datasource.aliOSSUrl.split('.'):[];
            var subType=subTypeArr[subTypeArr.length-1];
            var arr=['jpg','jpeg','gif','png','bmp'];
            if(!fileType&&$.inArray(subType,arr)===-1){
                fileType='application/'+subType;
            }else if($.inArray(subType,arr)>-1){
                fileType='image/'+subType;
            }
            if (fileType.indexOf('image') > -1||(format.getFormat(fileType)&&format.getFormat(fileType).ext==='pic.png')) {
                sender.config.src = sender.datasource.aliOSSLimitUrl||(sender.datasource.aliOSSUrl+'?x-oss-process=image/resize,m_fixed,h_60,w_60');
            } else {
                sender.config.src = "./imgs/" + (format.getFormat(fileType) ? format.getFormat(fileType).ext : format.getFormat('unkonw').ext);
            }
        },
        file_size_init: function (sender, params) {
            var text = language.formAction.attaContributor;
            sender.config.text = text + sender.datasource.author;
        },
        atta_contributor_click: function (sender, params) {
            var _this = this;
            _this.deleteDialog = new Dialog({
                mode: 3,
                wrapper: _this.parentThis.pageview.$el,
                contentText: language.formTips.makeSureDeleteFile,
                btnDirection: "row",
                buttons: [{
                    title: language.formAction.cancel,
                    style: {
                        height: 45,
                        fontSize: 16,
                        color: c.titleColor,
                        borderRight: '1px solid #eee'
                    },
                    onClick: function () {
                        _this.deleteDialog.hide();
                    }
                }, {
                    title: language.formAction.confirm,
                    style: {
                        height: 45,
                        fontSize: 16,
                        color: "#37b7fd",
                    },
                    onClick: function () {
                        _this.deleteDialog.hide();

                        _this.pageview.showLoading({text: language.formTips.delete, timeout: 8000});
                        _this.parentThis.fileUploader.deleteServerUploadImage(sender.datasource.id, function (data) {
                            _this.pageview.hideLoading(true);
                            sender.rowInstance.remove();
                            _this.parentThis.fileNum = sender.rowInstance.parent.datasource.length;
                            _this.pageview.showTip({text: language.formTips.deleteSuccess, duration: 1000});
                        }, function () {
                            _this.pageview.hideLoading(true);
                            _this.pageview.showTip({text: language.formTips.deleteFail, duration: 1000});
                        });
                    }
                }]
            });
            _this.deleteDialog.show();
        },
        title_view_init: function (sender, params) {
            sender.config.text = sender.datasource.name;
        },
        flow_repeat_itemclick: function (sender, params) {
            var _this=this;
            var fileType = sender.datasource.type?sender.datasource.type:'';
            window.open(sender.datasource.aliOSSUrl);
        },
        downloadFile: function (fileName, url) {
            window.open(url);
        },
        atta_time_init: function (sender, params) {
            sender.config.text = utils.timestampToTimeStr(sender.datasource.time);
        }
    };
    return pageLogic;
});
