/**
 * Created by Administrator on 2018/6/19.
 */

define(["utils","base"],function(utils,baseClass){
    var Component = function(config){
        var _this = this;
        var wrapper = config.wrapper || $(document.body);
        var mode = config.mode || 1;
        var className = config.className;
        this.dialogBackCover = $("<div style='visibility: hidden;' class='yy-dialog-bk'></div>");
        this.dialogWrapper = $("<div class='yy-dialog-wrapper yy-dialog-effect-"+mode+" yy-dialog-hide " +
            "+ "+className+"'></div>");
        var dialogInner = $("<div class='yy-dialog-inner'></div>");
        var dialogBody = $("<div class='yy-dialog-body'></div>");
        this.dialogBackCover.bind("click",function(){
            _this.hide();
        });
        this.bodyContentDom = $("<div class=''></div>");
        var createContentCallBack = config.createContent;
        if(createContentCallBack){
            createContentCallBack(this.bodyContentDom);
        }else{
            var contentText = config.contentText;
            contentText.forEach(function (item,index) {
                if(item.type==='files'){
                    _this.filesTpye=$("<div class='yy-select-file-type-content-text'>"+item.text+"</div>");
                    if(item.onClick){
                        _this.filesTpye.bind("click",function(e){
                            item.onClick(item);
                            _this.hide();
                        });
                    }
                    _this.bodyContentDom.append(_this.filesTpye);
                }
                if(item.type==='photo'){
                    _this.photoTpye=$("<div class='yy-select-file-type-content-text'>"+item.text+"</div>");
                    if(item.onClick){
                        _this.photoTpye.bind("click",function(e){
                            item.onClick(item);
                            _this.hide();
                        });
                    }
                    _this.bodyContentDom.append(_this.photoTpye);
                }

                if(item.type==='video'){
                    _this.videoTpye=$("<div class='yy-select-file-type-content-text'>"+item.text+"</div>");
                    if(item.onClick){
                        _this.videoTpye.bind("click",function(e){
                            item.onClick(item);
                            _this.hide();
                        });
                    }
                    _this.bodyContentDom.append(_this.videoTpye);
                }
                if(item.type==='pic'){
                    _this.picTpye=$("<div class='yy-select-file-type-content-text'>"+item.text+"</div>");
                    if(item.onClick){
                        _this.picTpye.bind("click",function(e){
                            item.onClick(item);
                            _this.hide();
                        });
                    }
                    _this.bodyContentDom.append(_this.picTpye);
                }
            });
        }
        dialogBody.append(this.bodyContentDom);
        dialogInner.append(dialogBody);
        this.dialogWrapper.append(dialogInner);
        wrapper.append(this.dialogWrapper).append(this.dialogBackCover);
    };



    Component.prototype.show =function(){
        var _this = this;
        this.dialogWrapper.css({"visibility":"visible"});
        this.dialogBackCover.css({"visibility":"visible"});
        this.dialogBackCover.addClass("yy-dialog-bk-show");
        window.setTimeout(function(){
            _this.dialogWrapper.removeClass("yy-dialog-hide").addClass("yy-dialog-show");
        },1);
    };

    Component.prototype.hide = function(){
        var _this = this;
        this.dialogWrapper.removeClass("yy-dialog-show").addClass("yy-dialog-hide");
        this.dialogBackCover.removeClass("yy-dialog-bk-show");
        window.setTimeout(function(){
            _this.dialogWrapper.css({"visibility":"hidden"});
            _this.dialogBackCover.css({"visibility":"hidden"});
        },200);
    }


    return Component;
});