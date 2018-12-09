/**
 * Created by Administrator on 2017/10/26.
 */
define(["utils","base"],function(utils,baseClass){
    var Component = function(config){
        var _this = this;
        var wrapper = config.wrapper || $(document.body);
        var mode = config.mode || 1;
        var className = config.className;
        this.dialogBackCover = $("<div style='visibility: hidden;' class='yy-dialog-bk'></div>");
        this.dialogWrapper = $("<div class='yy-allcomments-wrapper yy-dialog-effect-"+mode+" yy-dialog-hide " +
            "+ "+className+"'></div>");
        var dialogInner = $("<div class='yy-allcomments-inner'></div>");
        var dialogBody = $("<div class='yy-allcomments-body'></div>");
        var btnDirection = config.btnDirection === "row"? "yy-fd-row":"yy-fd-column";
        var dialogBtnWrapper = $("<div class='yy-dialog-btn-wrapper displayflex "+btnDirection+"'></div>");
        this.dialogBackCover.bind("click",function(){
            _this.hide();
        });
        this.bodyContentDom = $("<div class='yy-dialog-content'></div>");

        var createContentCallBack = config.createContent;
        if(createContentCallBack){
            createContentCallBack(this.bodyContentDom);
        }else{
            var contentText = config.contentText;
            this.contentTextDom = $("<div class='yy-allcomments-content-text'>"+contentText+"</div>");
            this.bodyContentDom.append(this.contentTextDom);
        }
        dialogBody.append(this.bodyContentDom);


        dialogInner.append(dialogBody).append(dialogBtnWrapper);
        this.dialogWrapper.append(dialogInner);
        wrapper.append(this.dialogWrapper).append(this.dialogBackCover);
        this.dialogWrapper.on("click",function (e) {
            _this.dialogWrapper.hide();
            _this.dialogBackCover.hide()
        })

    }



    Component.prototype.show =function(){
        var _this = this;
        this.dialogWrapper.css({"visibility":"visible"});
        this.dialogBackCover.css({"visibility":"visible"});
        window.setTimeout(function(){
            _this.dialogWrapper.removeClass("yy-dialog-hide").addClass("yy-dialog-show");
        },1);
    };

    Component.prototype.hide = function(){
        var _this = this;
        this.dialogWrapper.removeClass("yy-dialog-show").addClass("yy-dialog-hide");
        window.setTimeout(function(){
            _this.dialogWrapper.css({"visibility":"hidden"});
            _this.dialogBackCover.css({"visibility":"hidden"});
        },200);
    }


    return Component;
});