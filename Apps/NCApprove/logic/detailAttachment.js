
define(["utils",  "../parts/language","../parts/format"], function ( utils, language,format) {
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
            if(sender.datasource.fileid){
                var host=location.host;
                host=host=='localhost:3333'?'http://114.113.234.244:8095':host;
                var url=host+'/approve-client-adapter/process/download?fileId='+sender.datasource.fileid+'&filename='+encodeURI(sender.datasource.name)+'&userid='+this.parentThis.pageview.params.userid+'&groupid='+this.parentThis.pageview.params.groupid;
                window.open(url);
            }
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
