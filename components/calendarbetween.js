/**
 * Created by Administrator on 2017/10/31.
 */
define(["utils","base","calendar"],function(utils,baseClass,calendar){
    var Component = function(config){
        this.pageview=config.pageview;
        var _this = this;
        var wrapper = config.wrapper || $(document.body);
        var mode = config.mode || 1;
        var className = config.className;
        this.localS={"start":"","end":""};
        var curDate=utils.ConvertDateToStr(new Date());
        var preDate=utils.ConvertDateToStr(new Date().getTime()-60*60*24*1000);
        this.$input_value={"start":preDate,"end":curDate};
        this.hasSelectCTime=config.hasSelectCTime?JSON.parse(config.hasSelectCTime):"";
        this.hasSelectSTime=config.hasSelectSTime?JSON.parse(config.hasSelectSTime):"";
        this.hasSelectDTime=config.hasSelectDTime?JSON.parse(config.hasSelectDTime):"";
        this.dateWrapper = $("<div class='yy-date-wrapper yy-dialog-effect-"+mode+" yy-dialog-hide " +
            "'></div>");
        this.dateBackCover = $("<div style='visibility: hidden;' class='yy-dialog-bk'></div>");

        // 日期选择输入框
        this.$inputWrap=$("<div class='yy-input-wrap yy-fd-row displayflex '></div>");

        // this.$input=$("<div class='yy-input-inner yy-icon yy-input-id yy-flex-1 displayflex yy-jc-center yy-ai-center'><span style='color: #333;margin-right: 4px'>请选择起始日期</span><i class='yy-icon-code' data-code='e913' data-icon='>' style='font-size: 14px;color: #999'></i></div>&nbsp&nbsp--&nbsp&nbsp");
        this.$input=$("<div class='yy-input-inner yy-icon yy-input-id yy-flex-1 displayflex yy-jc-center yy-ai-center'>"+preDate+"</div>");
        this.$span="<div>&nbsp&nbsp--&nbsp&nbsp</div>"
        // this.$input1=$("<div class='yy-input-inner yy-icon yy-input-id1 yy-flex-1 displayflex yy-jc-center yy-ai-center'><span style='color: #333;margin-right: 4px'>请选择截止日期</span><i class='yy-icon-code' data-code='e913' data-icon='>' style='font-size: 14px;color: #999'></i></div>");
        this.$input1=$("<div class='yy-input-inner yy-icon yy-input-id1 yy-flex-1 displayflex yy-jc-center yy-ai-center'>"+curDate+"</div>");
        if(this.hasSelectCTime.start){
            this.localS.start=this.hasSelectCTime.start;
            this.$input=$("<div class='yy-input-inner yy-icon yy-input-id yy-flex-1 displayflex yy-jc-center yy-ai-center'>"+this.hasSelectCTime.start+"</div>");
        }
        if(this.hasSelectCTime.end){
            this.localS.end=this.hasSelectCTime.end;
            this.$input1=$("<div class='yy-input-inner yy-icon yy-input-id1 yy-flex-1 displayflex yy-jc-center yy-ai-center'>"+this.hasSelectCTime.end+"</div>");
        }

        if(this.hasSelectSTime.start){
            this.localS.start=this.hasSelectSTime.start;
            this.$input=$("<div class='yy-input-inner yy-icon yy-input-id yy-flex-1 displayflex yy-jc-center yy-ai-center'>"+this.hasSelectSTime.start+"</div>");
        }

        if(this.hasSelectSTime.end){
            this.localS.end=this.hasSelectSTime.end;
            this.$input1=$("<div class='yy-input-inner yy-icon yy-input-id1 yy-flex-1 displayflex yy-jc-center yy-ai-center'>"+this.hasSelectSTime.end+"</div>");
        }

        if(this.hasSelectDTime.start){
            this.localS.start=this.hasSelectDTime.start;
            this.$input=$("<div class='yy-input-inner yy-icon yy-input-id yy-flex-1 displayflex yy-jc-center yy-ai-center'>"+this.hasSelectDTime.start+"</div>");
        }
        if(this.hasSelectDTime.end){
            this.localS.end=this.hasSelectDTime.end;
            this.$input1=$("<div class='yy-input-inner yy-icon yy-input-id1 yy-flex-1 displayflex yy-jc-center yy-ai-center'>"+this.hasSelectDTime.end+"</div>");
        }

        this.$inputWrap.append(this.$input).append(this.$span).append(this.$input1);
        //取消确定按钮
        var dateBtnWrapper = $("<div class='yy-dialog-btn-wrapper displayflex yy-fd-row'></div>");

        var btn = $("<div class='yy-dialog-btn yy-date-btn yy-flex-1 displayflex yy-jc-center yy-ai-center'>"+utils.getLanguageText('cancel')+"</div>");
        var btn1 = $("<div class='yy-dialog-btn yy-date-btn1 yy-flex-1 displayflex yy-jc-center yy-ai-center'>"+utils.getLanguageText('confirm')+"</div>");
        dateBtnWrapper.append(btn).append(btn1);
        this.dateWrapper.append(this.$inputWrap).append(dateBtnWrapper);
        wrapper.append(this.dateWrapper).append(this.dateBackCover);

        //取消确定按钮事件
        this.dateBackCover.on('click',function () {
            _this.hide();
        });
        this.flag=false;
        btn.on("click",function (e) {
            _this.hide();
        });

        btn1.on("click",function (e) {
            _this.$input_value.start=_this.$input.text();
            _this.$input_value.end=_this.$input1.text();
            if(_this.localS.start&&!_this.$input_value.start){
                _this.$input_value.start=_this.localS.start;
            }
            if(_this.localS.end&&!_this.$input_value.end){
                _this.$input_value.end=_this.localS.end;
            }
            if(_this.$input_value.start!==""&&_this.$input_value.start!==""){
                    var timeA=_this.$input_value.start.replace(/-/g,"/");
                    var timeB=_this.$input_value.end.replace(/-/g,"/");
                    var timeAsec=new Date(timeA).getTime();
                    var timeBsec=new Date(timeB).getTime();
                    if(timeAsec>timeBsec){
                        var temp=_this.$input_value.start;
                        _this.$input_value.start=_this.$input_value.end;
                        _this.$input_value.end=temp;
                    }
            }

           if(config.timeType==="提交时间"||config.timeType==="Send Date"){

               window.localStorage.setItem("SUBMIT_TIME",JSON.stringify(_this.$input_value));
               _this.pageview.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data.taskBeginDate = _this.$input_value.start ;
               _this.pageview.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data.taskEndDate =_this.$input_value.end ;
               _this.pageview.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data.taskDate="taskTime_more";
               _this.pageview.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data. rcvOrCompDate=null;
           }else if (config.timeType==="接收时间"||config.timeType==="Receive Date"){

               window.localStorage.setItem("RECEIVE_TIME",JSON.stringify(_this.$input_value));
               _this.pageview.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data.		rcvOrCompBeginDate = _this.$input_value.start ;
               _this.pageview.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data.		rcvOrCompEndDate =_this.$input_value.end ;
               _this.pageview.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data. rcvOrCompDate="taskTime_more";
               _this.pageview.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data.taskDate=null;
           }else if (config.timeType==="完成时间"||config.timeType==="Finish Date"){

               window.localStorage.setItem("DONE_TIME",JSON.stringify(_this.$input_value));
               _this.pageview.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data.		rcvOrCompBeginDate = _this.$input_value.start ;
               _this.pageview.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data.		rcvOrCompEndDate =_this.$input_value.end ;
               _this.pageview.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data. rcvOrCompDate="taskTime_more";
               _this.pageview.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data.taskDate=null;
           }
            config.sender.rootInstance.hideDropDown();
            _this.pageview.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data.pageNum =1;
            _this.pageview.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data.start =0;
            _this.pageview.viewpager.curPageViewItem.contentInstance.refs.listview.loadFirstPageData({parentAnimate: true});
            _this.hide();
        });

    //    日期选择
        this.$input.on("click",function (e) {
            chooseDate(e,wrapper,this,_this.$input_value);
        });
        this.$input1.on("click",function (e) {
            chooseDate(e,wrapper,this,_this.$input_value);
        });
    };

    function chooseDate(e,wrapper,target,that) {
        e.stopPropagation();
        e.preventDefault();
        $(target).css({borderColor:"#29b6f6"});
        $(target).siblings().css({borderColor:"#eee"});
        if(this.flag){
            this.$el.removeClass("yy-calendar-picker-show");
            this.backCover.addClass("displaynone");
            this.flag=false;
            return;
        }

        this.$el = $("<div class='yy-calendar-picker' style='z-index: 4100'></div>");
        this.calendar = new calendar({
            itemHeight:30
        });
        this.backCover = $("<div class='yy-calendar-picker-bk displaynone' style='z-index: 1111'></div>");

        var btnH = utils.getRealHeight("28");

        var btnWrapper = $("<div style='height:"+btnH+"px' class='yy-calendar-picker-btns'></div>");
        var cancelBtn = $("<div style='font-size:"+utils.fontSize15()+"px;line-height:"+btnH+"px' class='yy-calendar-picker-cancelbtn'>"+utils.getLanguageText('cancel')+"</div>");
        var okbtn = $("<div style='font-size:"+utils.fontSize15()+"px;line-height:"+btnH+"px' class='yy-calendar-picker-okbtn'>"+utils.getLanguageText('confirm')+"</div>");

        okbtn.bind("click",function(){
            $(target).text(utils.ConvertDateToStr(_this.calendar.selectedTime));
            if($(target).hasClass("yy-input-id")){
                that.start=utils.ConvertDateToStr(_this.calendar.selectedTime)
            }else{
                that.end=utils.ConvertDateToStr(_this.calendar.selectedTime)
            }
            _this.$el.removeClass("yy-calendar-picker-show");
            _this.backCover.addClass("displaynone");
            _this.flag=false;
        });

        cancelBtn.bind("click",function(){
            _this.$el.removeClass("yy-calendar-picker-show");
            _this.backCover.addClass("displaynone");
            _this.flag=false;
        });

        this.backCover.bind("click",function(){
            _this.$el.removeClass("yy-calendar-picker-show");
            _this.backCover.addClass("displaynone");
            _this.flag=false;
        });
        btnWrapper.append(cancelBtn).append(okbtn);
        this.$el.append(btnWrapper).append(this.calendar.$el);
        $(wrapper).append(this.backCover[0]).append(this.$el);
        var _this=this;
        window.setTimeout(function(){
            if(!_this.flag){
                _this.$el.addClass("yy-calendar-picker-show");
                _this.backCover.removeClass("displaynone");
                _this.flag=true;
            }
        },0);
    }

    Component.prototype.show =function(){
        var _this = this;
        this.dateWrapper.css({"visibility":"visible"});
        this.dateBackCover.css({"visibility":"visible"});
        this.dateBackCover.addClass("yy-dialog-bk-show");
        window.setTimeout(function(){
            _this.dateWrapper.removeClass("yy-dialog-hide").addClass("yy-dialog-show");
        },1);
    };

    Component.prototype.hide = function(){
        var _this = this;
        this.dateWrapper.removeClass("yy-dialog-show").addClass("yy-dialog-hide");
        this.dateBackCover.removeClass("yy-dialog-bk-show");
        window.setTimeout(function(){
            _this.dateWrapper.css({"visibility":"hidden"});
            _this.dateBackCover.css({"visibility":"hidden"});
        },200);
    };
    Component.prototype.bindValue = function(){
        var _this = this;
        $('.yy-input-id').val(new Date(this.calendar.selectedTime))

    };


    return Component;
});