define(["utils","base"],function(utils,baseClass){
    var Component = function(config){
        var _this = this;

        Component.baseConstructor.call(this,config);

        var placeholder = config.placeholder||"";
        this.input = $("<textarea placeholder='"+placeholder+"'></textarea>");

        this.max = this.config.max;

        if(this.config.value||this.config.value===0){
          this.input.val(this.config.value);
        }

        if(isNaN(this.max)){
          this.max = null;
        }else{
          this.max = parseInt(this.max);
        }
        this.$el.addClass("yy-textarea");
        var style = {
          fontSize:this.config.style["fontSize"]||this.config.style["font-size"]||"15px",
          color:this.config.style["color"]||this.config.style["color"]||"#262626",
          backgroundColor:this.config.style["backgroundColor"]||this.config.style["background-color"]||"white",
        };
        this.input.css(style);
        this.input.bind("input",function(e){
          if(_this.max){
            var val = _this.input.val();
            var length =val.length;
            if(length>_this.max){
              val = val.substring(0,_this.max);
              length = _this.max;
              _this.input.val(val);
            }
            _this.numDom.html(length);
          }
        });
        if(this.max){
          this.limitDom = $("<span class='yy-textarea-limit'></span>");
          this.numDom = $("<span>0</span>");
          if(this.config.numStyle){
            utils.css(this.numDom,this.config.numStyle);
          }
          var splitline = $("<span>/</span>");
          var maxDom = $("<span>"+this.max+"</span>");
          if(this.config.maxStyle){
            utils.css(maxDom,this.config.maxStyle);
          }
          if(this.config.limitStyle){
            utils.css(this.limitDom,this.config.limitStyle);
          }
          this.limitDom.append(this.numDom).append(splitline).append(maxDom);
          this.$el.append(this.limitDom);
        }
        this.$el.append(this.input);

        var method_compositionendname = config.comKey+"_compositionend";
        var method_compositionend = _this.pageview.plugin[method_compositionendname];
        if(method_compositionend) {
            this.$el.on('input', function (e) {
                if (_this.$el.prop('comStart')) return;    // 中文输入过程中不截断
                !_this.disabled && method_compositionend && method_compositionend.call(_this.pageview.plugin, _this, {e: e});
            }).on('compositionstart', function () {
                _this.$el.prop('comStart', true);
            }).on('compositionend', function (e) {
                _this.$el.prop('comStart', false);
                !_this.disabled && method_compositionend && method_compositionend.call(_this.pageview.plugin, _this, {e: e});
            });
        }

        var input_name = config.comKey + "_input";
        var input_nameMethod = _this.pageview.plugin[input_name];
        if (input_nameMethod) {
            this.input.bind("input", function (e) {
                !_this.disabled && input_nameMethod && input_nameMethod.call(_this.pageview.plugin, _this, {e: e});
            });
        }

        //fix Bug_14420 回车不能换行问题 start
        $(this.input).bind('keydown',function (e) {
            if(e.keyCode!=13) return;
            e.preventDefault();
            this.value+='\n';
            this.scrollTop=this.scrollHeight;
        });
        //fix Bug_14420 回车不能换行问题 end
    }
    utils.extends(Component,baseClass);

    Component.prototype.getValue = function(){
        var value =  this.input.val().replace(/\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]|[\uD800-\uDBFF]|[\uDC00-\uDFFF]/g, ""); //文本不需要将空格字符清除
        // var value =  $.trim(this.input.val().replace(/\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]|[\uD800-\uDBFF]|[\uDC00-\uDFFF]/g, ""));
        this.setValue(value);
      return value;
      // return $.trim(value);
    };

    Component.prototype.setDisabled = function(disabled){
      this.disabled = disabled;
      if(this.disabled){
        this.input.attr("disabled","disabled");
        this.$el.addClass(this.disabledClassName);
      }else{
        this.input.removeAttr("disabled");
        this.$el.remove(this.disabledClassName);
      }
    };
    Component.prototype.setValue = function(str){
      if(this.max){
        var length  =str.length;
        if(length>this.max){
          str = str.substring(this.max);
          length = this.max;
        }
        this.numDom.html(length);
      }
      this.input.val(str);
    };
    Component.prototype.blur = function(){
      this.input.blur();
    };
    Component.prototype.focus = function(str){
      var _this = this;
      _this.input&&_this.input.focus();
    };
    return Component;
});
