
define(["utils","base"],function(utils,baseClass){
    var Component = function(config){
        var _this = this;
        // config.tagName = "SPAN";
        config.style = config.style||{};
        if(config.numberofline){


          numberofline = config.numberofline || 1;
        }
        Component.baseConstructor.call(this,config);
        var numberofline ;


        var classStr= this.$el[0].className;
        if(classStr.indexOf("yy-ai")>=0){
            this.$el.addClass ("yy-text displayflex ");
        }else{
            if(this.datasource.comHeight){
                this.$el.addClass ("yy-text displayflex");
            }else {
                this.$el.addClass ("yy-text displayflex yy-ai-center");
            }
        }

        if(this.config&&this.config.text_bind==="title"&&this.datasource.isTextArea){
            this.$el.css('marginTop',10)
        }


        this.preText = this.config.preText||"";
        this.preTextDom = $("<span class='yy-pretext'>"+this.preText+"</span>");
        if(this.config.preTextStyle){
          utils.css(this.preTextDom,this.config.preTextStyle);
        }

        this.nextText = this.config.nextText ||"";
        this.nextTextDom = $("<span class='yy-nexttext'>"+this.nextText+"</span>");
        if(this.config.nextTextStyle){
          utils.css(this.nextTextDom,this.config.nextTextStyle);
        }
        config.text = config.text === 0?"0":config.text;
        this.innerText = $("<span class='yy-inner-text yy-text-box'>"+(config.text||"")+"</span>");
        if(numberofline){
            if(config.text&&config.text.length>200&&config.comKey!=="row_title"){
                this.innerText = $("<span class='yy-inner-text yy-text-box yy-inner-text_limit'>"+(config.text||"")+"</span>");
            }
          this.innerText[0].style["-webkit-line-clamp"]=numberofline;
          this.innerText[0].style["word-break"]="break-word";

        }
        if(config.$$datasource&&config.$$datasource.taskAuditDesc){
            if(config.text&&config.text.length>200){
                this.innerText = $("<span class='yy-inner-text yy-text-box yy-inner-text_limit' style='overflow: hidden'>"+(config.text||"")+"</span>");
            }
            this.innerText[0].style["word-break"]="break-word";
        }
        if(config.textStyle){
            this.innerText.css(config.textStyle);
        }

        this.$el.append(this.preTextDom).append(this.innerText).append(this.nextTextDom);

    }
    utils.extends(Component,baseClass);
    Component.prototype.setText= function(text){
        this.innerText.html(text);
    };
    Component.prototype.getText= function(){
        return this.innerText.html();
    };
    Component.prototype.setPreText= function(text){
        this.preTextDom.html(text);
    };
    Component.prototype.setNextText= function(text){
        this.nextTextDom.html(text);
    };
    Component.prototype.hideLoading = function(){
      this.loadingDom&&this.loadingDom.addClass("displaynone");
    }
    Component.prototype.showLoading = function(){
      if(!this.loadingDom){
        this.loadingDom = $("<div class='preloader yy-text-loading displaynone'></div>");
        this.loadingDom.insertBefore(this.preTextDom);
      }
      this.loadingDom.removeClass("displaynone");
    }
    return Component;
});
