/**
 * Created by huangzhy on 17/10/26.
 */
define(["utils","base"],function(utils,baseClass){
    function Component(config){
        var _this = this;
        this.isIOS = utils.deviceInfo().isIOS;
        this.hasFixed = false;
        this.isSticky = false;
        var className = "displayflex yy-view";
        var clientWidth=document.documentElement.clientWidth+"";
        var clientHeight=document.documentElement.clientHeight+"";
        clientHeight=clientHeight*0.88;
        var evt="onorientataionchange" in window ?"onorientataionchange":"resize";
       window.addEventListener("evt",function () {
           alert("屏幕旋转了")
       });
        this.LoadMoreWrapper = $("<div style='height:"+utils.getRealHeight(36)+"px' class='yy-loadmore-wrapper displayflex yy-jc-center yy-ai-center flex-h displaynone'></div>");
        if(config.className.indexOf("hor")>-1){
            this.Canvas = $("<canvas class='drawing-board-canvas'  height='"+(clientHeight-30)+"' width='"+(clientWidth-20)+"' style='border: 1px dotted;margin: 10px auto'></canvas>");
        }else{
            this.Canvas = $("<canvas class='drawing-board-canvas'  height='260' width='"+(clientWidth-2)+"' style='border: 1px dotted;margin:20px 0'></canvas>");
        }
        Component.baseConstructor.call(this,config);
        this.stickyHeaderIndices = this.config.stickyHeaderIndices;
        _this.isInLoading=false;
        _this.canRefresh = false;
        this._initTouchEvent();

        this.$el.addClass(className);
        this.$el.append(this.Canvas);
        config.root = config.root || [];
    }
    utils.extends(Component,baseClass);
    Component.prototype._initTouchEvent=function(){
        var _this = this;

        if(this.pluginPullToRefreshMethod){
            var startY = 0,startScrollTop;;
            this.$el.bind("touchstart",function(e){
                if(_this.config.onlyForSticky===true){
                    return;
                }
                if(_this.isInLoading){return;}
                _this.isInLoading = false;
                _this.canRefresh = false;
                var touch = e.touches[0];
                startY = touch.pageY;
                startScrollTop = _this.$el.scrollTop();
            });

            this.$el.bind("touchmove",function(e){
                if(_this.config.onlyForSticky===true){
                    return;
                }
                if(_this.isInLoading){return;}
                var touch = e.touches[0];
                var curY = touch.pageY;
                var diff = curY-startY;

                if(diff>0){
                    if(_this.pluginCanPullToRefreshMethod){
                        var Re = _this.pluginCanPullToRefreshMethod.call(_this.pageview.plugin,_this);
                        if(Re!==true){
                            return;
                        }
                    }
                    var scrollTop = _this.$el.scrollTop();
                    if(scrollTop <=0){
                        _this.$el.css({"overflow":"hidden"});
                        e.preventDefault();
                        e.stopPropagation();
                        var pullOffsetY = diff-startScrollTop;
                        if(pullOffsetY>_this.pullLimitHeight*4){
                            _this.pullMesLabel.html(utils.getLanguageText('releaseToUpdate'));
                            _this.pullToRefreshWrapper[0].className = "yy-pull-wrapper yy-release-refresh";
                            _this.canRefresh = true;
                        }else{
                            _this.pullMesLabel.html(utils.getLanguageText('pullToRefresh'));
                            _this.pullToRefreshWrapper[0].className = "yy-pull-wrapper yy-push-refresh";
                            _this.canRefresh = false;
                        }
                        _this.innerWrapper.css(
                            utils.processTransitionTanformStyle("none","translate3d(0,"+(pullOffsetY/3)+"px,0)")
                        );

                    }
                }

            });

            this.$el.bind("touchend",function(e){
                if(_this.config.onlyForSticky===true){
                    _this.resetPullLoadState();
                    return;
                }
                if(_this.config.noScroll===true){

                }else{
                    _this.$el.css({"overflow-y":"auto"});
                }

                if(_this.isInLoading){return;}
                if(_this.canRefresh){
                    _this.setPullLoadingState();
                    _this.pluginPullToRefreshMethod && _this.pluginPullToRefreshMethod.call(_this.pageview.plugin,_this,{});
                }else{
                    _this.resetPullLoadState();
                }
            });

        }

    }
    return Component;
});

