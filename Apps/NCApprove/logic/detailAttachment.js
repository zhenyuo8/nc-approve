
define(["utils",  "../parts/language","../parts/format","../../../components/dialog"], function ( utils, language,format,Dialog) {
    function pageLogic(config) {
        this.pageview = config.pageview;
        this.parentThis = this.pageview.viewpagerParams.parent;
        this.loadData();
    }

    pageLogic.prototype = {
        onPageResume: function () {
            this._loadData();
        },
        loadData: function () {
            var _this = this;
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
                        billId:_this.parentThis.pageview.params.billId,
                        billtype:_this.parentThis.pageview.params.billtype||this.pageview.params.pk_billtype||'',
                        userid:_this.parentThis.pageview.params.userid||'',
                        groupid:_this.parentThis.pageview.params.groupid||'0001V610000000000EEN'
                    },
                    success: function (listData) {
                        if(listData.flag==='1'){
                            _this.pageview.hideLoading(true);
                            _this.pageview.showTip({text: listData.desc, duration: 2000});
                            return;
                        }
                        _this.pageview.hideLoading(true);
                        if(listData.data&&listData.data instanceof Array){
                             var temp=[];
                             listData.data.forEach(function(item){
                                 temp.push({
                                    name:item.name||item.filename,
                                    filesize:item.filesize,
                                    fileid:item.id,
                                    aliOSSUrl:'',
                                    type:item.type,
                                    author:item.author
                                 });
                             });
                            _this.pageview.delegate('flow_repeat', function (target) {
                                target.bindData(temp);
                            });
                        }
                    },
                    error: function (err) {
                        _this.pageview.hideLoading(true);
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
                sender.config.src = "./imgs/" + (format.getFormat(fileType) ? format.getFormat(fileType).ext : format.getFormat('unkonw').ext);
            } else {
                sender.config.src = "./imgs/" + (format.getFormat(fileType) ? format.getFormat(fileType).ext : format.getFormat('unkonw').ext);
            }
        },
        file_size_init: function (sender, params) {
            var text = language.formAction.attaContributor;
            sender.config.text = text + sender.datasource.author;
        },
       
        title_view_init: function (sender, params) {
            sender.config.text = sender.datasource.name;
        },
        flow_repeat_itemclick: function (sender, params) {
            var _this=this;
            if(sender.datasource.fileid){
                var url=window.location.origin+'/approve-client-adapter/process/download?fileId='+sender.datasource.fileid+'&filename='+encodeURI(sender.datasource.name)+'&userid='+this.parentThis.pageview.params.userid+'&groupid=0001V610000000000EEN';
                this.delegateDialog = new Dialog({
                    mode: 3,
                    wrapper: this.pageview.$el,
                    contentText: language.formTips.previewChoose,
                    btnDirection: "row",
                    buttons: [{
                        title: language.formAction.preview,
                        style: {
                            height: 45,
                            fontSize: 16,
                            color: '#111',
                            borderRight: '1px solid #eee'
                        },
                        onClick: function () {
                            _this.delegateDialog.hide();
                            _this.previewAttachment(sender,url);
                        }
                    }, {
                        title:  language.formAction.downLoad,
                        style: {
                            height: 45,
                            fontSize: 16,
                            color: "#37b7fd",
                        },
                        onClick: function () {
                            _this.delegateDialog.hide();
                            _this.downloadAttachment(sender,url);
                        }
                    }]
                });
                this.delegateDialog.show();
            }
        },
        previewAttachment:function(sender,url) {
            var type=sender.datasource.type.toLowerCase();
            if((type==='doc'||type==='docx')&&utils.deviceInfo().isIOS){
                var iosUrl='/approve-client-adapter/process/download?fileId='+sender.datasource.fileid+'&filename='+encodeURI(sender.datasource.name)+'&userid='+this.parentThis.pageview.params.userid+'&groupid=0001V610000000000EEN';
                window.open(iosUrl);
            }else{
                cmp.att.read({
                    filename:sender.datasource.name,
                    path: url, // 文件路径
                    header:{},//文件下载头
                    type:sender.datasource.type||'',//文件类型
                    size:sender.datasource.filesize||1024,//文件大小
                    success:function(res){},
                    error:function(res){}
                });
            }

        },
        downloadAttachment:function(sender,url){
            var _this=this;
            cmp.att.download({
                title:sender.datasource.name,
                url: url, // 文件路径
                extData: {//避免重复下载的额外参数
                    lastModified:sender.datasource.time||new Date().getTime(),//文件修改值
                    fileId:sender.datasource.fileid,//文件唯一id
                    origin:window.location.origin//服务器ip
                },
                success:function(res){
                    _this.pageview.showTip({text: '下载成功', duration: 2000}); 
                },
                error:function(error){
                    _this.pageview.showTip({text: JSON.stringify(error), duration: 2000}); 
                }
            });
        },
        atta_time_init: function (sender, params) {   
            if(sender.datasource.time&&!isNaN(new Date(sender.datasource.time).getTime())){
                sender.config.text = utils.timestampToTimeStr(sender.datasource.time);
            } else{
                sender.config.text='';
            }   
        }
    };
    return pageLogic;
});
