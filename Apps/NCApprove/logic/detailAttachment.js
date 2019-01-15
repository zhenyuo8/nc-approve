
define(["../parts/common", "utils", "../../../components/dialog", "../parts/language","../parts/format"], function (c, utils, Dialog, language,format) {
    function pageLogic(config) {
        this.pageview = config.pageview;
        this.parentThis = this.pageview.viewpagerParams.parent;
    }

    pageLogic.prototype = {
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
            if(sender.datasource.aliOSSUrl){
                window.open(sender.datasource.aliOSSUrl);
            }else{
                _this.pageview.showTip({text: '暂不支持附件预览和下载', duration: 1000});
            }
        },
        downloadFile: function (fileName, url) {
            window.open(url);
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
