define(["../parts/common", "utils", "../parts/language"], function (c, utils,language) {
    function pageLogic(config) {
        this.pageview = config.pageview;
        this.params = this.pageview.params || {};
        this.comment = '';
        this.selectAssignList = []; // 总的选择流程中人的数组
        this.add_sign_select_list = []; // 加签选中人的数组
        this.circulate_list = []; // 传阅选中人的数组
        this.hasSelectIndex = 0;
        this.reminderLock = false; // 催办锁
        this.flag=false;
        this.assignEnd=false;
        this.preSelectIndex=null;
        this.add_sign_select_list=JSON.parse(window.localStorage.getItem("ADD_SIGN_BEHIND"))||[];
        this.circulate_list=JSON.parse(window.localStorage.getItem("CIRCULATE"))||[];
        this.approveType=this.params.approveType;
        if(this.params.substitutionComments&&this.params.substitutionComments!=='undefined'){
            this.params.substitutionComments=decodeURIComponent(this.params.substitutionComments);
        }
        this.setBtnVal=JSON.parse(window.localStorage.getItem('SETBTNVAL'))||{};
        this.defaultComments=JSON.parse(window.localStorage.getItem('DEFAULTCOMMENTS'))||{};
        window.localStorage.removeItem("SETBTNVAL");
        window.localStorage.removeItem("DEFAULTCOMMENTS");
    }

    pageLogic.prototype = {
        onPageResume: function () {
            this.processSelectAssignList();
            this.reRenderAssignList();
            var url=window.localStorage.getItem("CLOUD_SIGN");
            if(url){
                this.reRenderCloudSignImage(url);
            }
            if(this.commonComments){
                this.reRenderComments(this.commonComments.value);
            }
        },
        reRenderCloudSignImage:function (url) {
            var temp=new Image();
            if(this.params.type==="1"||this.params.type==="3"){
                $('.cloud_sign_image').show();
                temp.src=url;
                temp.onload=function () {
                    $(".cloud_sign_image").empty();
                    if(temp.height>temp.width){
                        $(temp).css({transform:"rotate(-90deg)",width:130,position:"absolute",left:"35%",height:180,top:-25});
                    }else{
                        // $(temp).css({width:180,position:"absolute",left:"27%",height:130,top:-5});
                        $(temp).css({width:180,height:115,margin:'0 auto'});
                    }
                    $(".cloud_sign_image").append(temp);
                };
            }
        },
        processSelectAssignList: function () {
            var _this = this,
                alreadyExist = false;
            if(!this.flag){
                if (!alreadyExist &&_this.hasSelectData&& _this.hasSelectData.length>0) {
                    if(_this.currentTaskAsign.assignSingle&&!this.assignEnd){
                        this.selectAssignList=[];
                    }
                    if(!_this.currentTaskAsign.assignSingle&&_this.preSelectIndex==_this.hasSelectIndex&&!this.assignEnd){
                        this.selectAssignList=[];
                    }
                    this.selectAssignList.push(_this.hasSelectData);
                    _this.preSelectIndex=_this.hasSelectIndex;
                }
                this.flag=true;
            }
            if(this.currentTaskAsign&&this.currentTaskAsign.assignSingle){
                if(this.selectAssignList&&_this.hasSelectData&&_this.hasSelectData.length!==0){
                    for (var k = 0; k < this.selectAssignList.length; k++) {
                        var selectAssignList=this.selectAssignList[k];
                        var index=k;
                        for(var m=0;m<_this.hasSelectData.length;m++){
                            if (selectAssignList.id === _this.hasSelectData[m].id) {
                                alreadyExist = true;
                                // this.selectAssignList.push(_this.hasSelectData);
                                this.selectAssignList[index] = _this.hasSelectData[m];
                            }
                        }
                    }
                }
            }else{
                if(this.selectAssignList&&_this.hasSelectData&&_this.hasSelectData.length!==0){
                    for (var f = 0; f < this.selectAssignList[0].length; f++) {
                        var selectAssignList1=this.selectAssignList[0][f];
                        var index1=f;
                        for(var l=0;l<_this.hasSelectData.length;l++){
                            if (selectAssignList1.id === _this.hasSelectData[l].id) {
                                alreadyExist = true;
                                this.selectAssignList[0][index1] = _this.hasSelectData[l];
                            }
                        }
                    }
                }
            }
        },
        reRenderAssignList: function () {

            var names = '';

            if (this.agreeAssignList) {
                var needChangeItem = this.agreeAssignList[this.hasSelectIndex].components.agree_assign_list_repeat_item.components.agree_assign_list_repeat_content;
                if (this.hasSelectData && this.hasSelectData.length !== 0) {
                    // 需要更改名称的item

                    this.hasSelectData.forEach(function (value, key) {
                        names += value.name + ';';
                    });
                } else {
                    names = language.dealPage.selectProcessor;
                }
                needChangeItem.setText(names);
                if(this.currentTaskAsign.assignSingle){
                    if(names === '请选择处理人'||names === 'Please select processor'){
                        $(needChangeItem.parent.$el).parent().siblings().find(".yy-text-box").css({"color":"#262626"});
                    }else{
                        $(needChangeItem.parent.$el).parent().siblings().find(".yy-text-box").css({"color":"#999"});
                    }
                }
            }


        },
        reRenderComments:function (str) {
            this.setHeader();
            this.pageview.delegate('input_textarea', function (target) {
                target.$el.find('textarea').val(str);
            });
        },
        setHeader: function () {
            
        },
        main_view_init: function (sender, params) {
            // 1 通过 2 驳回 3 指派 4 加签 5 催办
            var components = this.pageview.config.components;
            if(this.params.addsignBehindAble||this.params.circulate){
                components.submit.style.display="none";
                components.bottomToolBar.style.display="none";
                components.input_textarea_container.style.display="none";
            }else{
                components.confirm.style.display="none";
            }
            if(this.params.isBehind){
                components.confirm.style.display="none";
            }
            if (this.params.type === '2') {
                this.beforeReject();
            } else if (this.params.type === '3') {
                this.beforeAssign();
            } else if (this.params.type === '4') {
                this.beforeAddSign();
            }else if(this.params.type==='10'){
                this.beforeJump();
            }else if(this.params.type==='11'){
                this.beforeCirculate();
            }
        },
        beforeReject: function (sender, params) {
            var _this = this;
            this.pageview.showLoading({text: language.formTips.onLoading, timeout: 8000});

            this.pageview.ajax({
                url: '/process/rejectCheck',
                type: 'POST',
                data: {
                    taskId: this.params.taskId,
                    category: this.params.category
                },
                success: function (data) {
                    _this.pageview.hideLoading(true);
                    _this.rejectList=[];
                    _this.pageview.delegate('reject_process_repeat', function (target) {
                        _this.rejectList = data.data;
                        if (data.msg && data.msg.indexOf("BPM数据不存在") > -1) {
                            _this.pageview.showTip({text: '此单据已被修改，请刷新或重新进入！', duration: 1000});

                            window.changeFormStatus = true;

                            setTimeout(function () {
                                _this.pageview.goBack();
                            }, 1000);
                        } else {
                            _this.rejectList.forEach(function (value, key) {
                                if (!value.activityName) {
                                    value.activityName = language.dealPage.stepUnDefine;
                                    if (value.participants && value.participants.length > 0) {
                                        value.activityName += (value.participants[0].name || language.dealPage.unspecified) + '）';
                                    }
                                }
                            });

                            if(_this.params.rejectToEnd){
                                _this.rejectList.push({
                                    activityName: language.dealPage.rejectToTerminal,
                                    placeholder: language.dealPage.informInitiator,
                                    activityId: '-2'
                                });
                            }
                            if(_this.params.processId.indexOf('meeting_')===-1){
                                _this.rejectList.push({
                                    activityName: language.dealPage.rejectToMaker,
                                    placeholder: language.dealPage.informInitiator,
                                    activityId: '-1'
                                });
                            }
                        }
                        target.bindData(_this.rejectList);
                    });
                }
            });
        },
        beforeJump:function (sender,params) {
            var _this = this;
            this.pageview.showLoading({text: language.formTips.onLoading, timeout: 8000});

            this.pageview.ajax({
                url: '/process/jumpCheck',
                type: 'POST',
                data: {
                    taskId: this.params.taskId,
                    category: this.params.category
                },
                success: function (data) {
                    _this.pageview.hideLoading(true);
                    _this.jumpList=[];
                    if(data.success){
                        if(data.data&&data.data.length!==0){
                            _this.pageview.delegate('jump_process_repeat', function (target) {
                                _this.jumpList = data.data;
                                if (data.msg && data.msg.indexOf("BPM数据不存在") > -1) {
                                    _this.pageview.showTip({text: '此单据已被修改，请刷新或重新进入！', duration: 1000});
                                    window.changeFormStatus = true;
                                    setTimeout(function () {
                                        _this.pageview.goBack();
                                    }, 1000);
                                } else {
                                    _this.jumpList.forEach(function (value, key) {
                                        if (value.activityId.indexOf('endEvent')!==-1) {
                                            value.activityName = language.dealPage.end;
                                        }
                                        if (value.activityId.indexOf('inclusiveGateway')===0) {
                                            if(!value.activityName){
                                                value.activityName = language.dealPage.gateway;
                                            }
                                        }
                                    });
                                }
                                target.bindData(_this.jumpList);
                            });
                        }else{
                            _this.pageview.showTip({text: language.formTips.noJumpStep, duration: 2000});
                           setTimeout(function () {
                               window.history.back();
                           },1500);
                        }
                    }
                }
            });
        },
        beforeAssign: function (sender, params) {
            var _this = this;
            this.currentTaskAsign = JSON.parse(window.localStorage.getItem('ASSIGN_CHECK_DATA')).data;
            _this.pageview.delegate('agree_assign', function (target) {
                target.$el.show();
            });

            if (_this.currentTaskAsign.assignAble) {
                _this.initAssignList(_this.currentTaskAsign.assignInfo);
            } else {
                var desc = _this.currentTaskAsign.description;
                _this.pageview.showTip({text: language.formTips.canNotAssign + (desc ? desc : "")});
            }
        },
        beforeAddSign: function (sender, params) {
            var _this = this;

            this.pageview.delegate('add_sign', function (target) {
                target.$el.show();
            });
        },
        beforeCirculate: function (sender, params) {
            var _this = this;
            this.pageview.delegate('add_sign', function (target) {
                target.$el.show();
            });
            this.pageview.delegate('add_sign_way', function (target) {
                target.$el.hide();
            });
        },
        beforeReminder: function () {

        },
        initAssignList: function (assignInfo) {
            var _this=this;
            if (assignInfo === null) {
                return;
            }
            var assignInfoItems = assignInfo.assignInfoItems || [],
                length = assignInfoItems.length;

            console.info("可选指派环节数量:" + length);
            if (length === 0) {
                return;
            }
            this.hasSelectData=[];
            if(this.currentTaskAsign.assignAll){
                this.selectId=true;
                this.assignAllDefault=[];
                this.pageview.delegate('agree_assign_list_repeat', function (target) {
                    target.bindData(assignInfoItems);
                });
                for(var i=0;i<assignInfoItems.length;i++){
                    this.assignAllDefaultObj={};
                    if(assignInfoItems[i].participants&&assignInfoItems[i].participants.length===1){
                        assignInfoItems[i].participants[0].selectId = true;
                        assignInfoItems[i].participants[0].activityId = assignInfoItems[i].activityId;
                        this.hasSelectData.push(assignInfoItems[i].participants[0]);
                        this.selectAssignList.push(assignInfoItems[i].participants);
                        this.index=i;
                        this.hasSelectIndex = i;
                        this.assignAllDefaultObj[i]=assignInfoItems[i].participants[0].name;
                        this.assignAllDefault.push(this.assignAllDefaultObj);
                    }
                    if(assignInfoItems[i].participants.length!==1){
                        this.selectId = false;
                    }
                }
                setTimeout(function () {
                    _this.assignAllDefault.forEach(function (item,index) {
                        for(var key in item){
                            $($('.agree_assign_list_repeat_content')[key]).find(".yy-text-box").text(item[key]);
                        }
                    });
                },100);
            }else{
                if(length===1&&assignInfoItems[0].participants&&assignInfoItems[0].participants.length===1){
                    assignInfoItems[0].participants[0].selectId=true;
                    assignInfoItems[0].participants[0].activityId=assignInfoItems[0].activityId;
                    this.hasSelectData = assignInfoItems[0].participants;
                    this.activityId=assignInfoItems[0].activityId;
                    this.hasSelectIndex = 0;
                    this.selectAssignList.push(assignInfoItems[0].participants);
                    this.selectId=true;
                    this.pageview.delegate("agree_assign_list_repeat_content",function (target) {
                        $(target.$el).find(".yy-text-box").text(assignInfoItems[0].participants[0].name+";");
                    });
                }
            }
            _this.currentTaskAsign.assignInfo.assignInfoItems = JSON.stringify(assignInfoItems);
            this.pageview.delegate('agree_assign_list_repeat', function (target) {
                target.bindData(assignInfoItems);
            });
        },
        agree_assign_list_repeat_icon_init: function (sender, params) {
            if(sender.datasource.activityId.indexOf('endEvent_')===0){
                sender.$el.hide();
            }
        },
        reject_process_init: function (sender, params) {
            if (this.params.type === '2') {
                sender.config.style.display = 'flex';
            }
        },
        jump_process_init: function (sender, params) {
            if (this.params.type === '10') {
                sender.config.style.display = 'flex';
            }
        },
        reject_process_repeat_item_init: function (sender, params) {
            // 只有一个选项时默认选中
            if (this.rejectList.length === 1) {
                sender.parent.select();
                this.activityId = sender.datasource.activityId; // 终止
            }
        },
        jump_process_repeat_item_init: function (sender, params) {
            // 只有一个选项时默认选中
            if (this.jumpList.length === 1) {
                sender.parent.select();
                this.activityId = this.jumpList[0].activityId; // 终止
            }
        },
        // 拒绝列表
        reject_process_repeat_itemclick: function (sender, params) {
            sender.select();
            if (sender.datasource.activityId === '-2') {
                this.activityId = -2; // 终止
            } else {
                this.activityId = sender.datasource.activityId;
            }
        },
        jump_process_repeat_itemclick: function (sender, params) {
            sender.select();
            this.activityId = sender.datasource.activityId;
        },
        set_common_comments_right_init:function (sender,params) {
            sender.config.text=language.dealPage.commonPhrase;
        },
        jump_process_title_init:function (sender,params) {
            sender.config.text=language.formTips.selectJumpStep;
        },
        add_sign_person_title_init:function (sender,params) {
            if(this.params.type === '11'){
                sender.config.text=language.dealPage.circulatePerson;
            }else{
                sender.config.text=language.dealPage.assignParticipants;
            }
        },
        add_sign_way_left_init:function (sender,params) {
            sender.config.text=language.dealPage.assignStyle;
        },
        reject_process_title_init:function (sender,params) {
            sender.config.text=language.formTips.selectRejectStep;
        },
        add_sign_way_middle_init:function (sender,params) {
            sender.config.text=language.formTips.assignTypes;
        },
        add_sign_bottom_poplayer_title_init:function (sender,params) {
            sender.config.text=language.formAction.pleaseSelect;
        },
        agree_assign_title_init:function (sender,params) {
            sender.config.text=language.dealPage.selectStepProcessor;
        },
        agree_assign_list_repeat_content_init:function (sender,params) {
            sender.config.text=language.dealPage.selectProcessor;
            if(sender.datasource.activityId.indexOf('endEvent_')===0){
                sender.$el.hide();
            }
        },
        add_sign_bottom_poplayer_repeat_init:function (sender,params) {
            sender.config.items=[{id: '1', title: language.dealPage.togetherApproval, placeholder: "所有加签人并行处理才完成"},{id: '2', title: language.dealPage.raceToApproval, placeholder: "只有一个加签人处理完即完成"}];
        },
        input_textarea_init: function (sender, params) {
            var _this=this,defaultComments='';
            if (this.params.type === '1') {
                if(this.params.isBefore==='assignBefore'){
                    if(this.defaultComments&&this.defaultComments.agreeAddApprove){
                        defaultComments=this.defaultComments.agreeAddApprove;
                        sender.config.placeholder = defaultComments;
                        setTimeout(function () {
                            _this.pageview.delegate('input_textarea', function (target) {
                                target.$el.find('textarea').val(defaultComments);
                            });
                        },100);
                    }else if(this.setBtnVal&&this.setBtnVal.agreeAddApprove){
                        defaultComments=this.setBtnVal.agreeAddApprove;
                        sender.config.placeholder = defaultComments;
                        setTimeout(function () {
                            _this.pageview.delegate('input_textarea', function (target) {
                                target.$el.find('textarea').val(defaultComments);
                            });
                        },100);
                    }else{
                        sender.config.placeholder = language.placeholder.agreeComments;
                    }
                }else if(this.params.isBehind === '1'){
                    if(this.defaultComments&&this.defaultComments.addBehindApprove){
                        defaultComments=this.defaultComments.addBehindApprove;
                        sender.config.placeholder = defaultComments;
                        setTimeout(function () {
                            _this.pageview.delegate('input_textarea', function (target) {
                                target.$el.find('textarea').val(defaultComments);
                            });
                        },100);
                    }else if(this.setBtnVal&&this.setBtnVal.addBehindApprove){
                        defaultComments=this.setBtnVal.addBehindApprove;
                        sender.config.placeholder = defaultComments;
                        setTimeout(function () {
                            _this.pageview.delegate('input_textarea', function (target) {
                                target.$el.find('textarea').val(defaultComments);
                            });
                        },100);
                    }else{
                        sender.config.placeholder = language.placeholder.addBehindApprove;
                    }
                }else{
                    if(this.defaultComments&&this.defaultComments.agree){
                        defaultComments=this.defaultComments.agree;
                        sender.config.placeholder = defaultComments;
                        setTimeout(function () {
                            _this.pageview.delegate('input_textarea', function (target) {
                                target.$el.find('textarea').val(defaultComments);
                            });
                        },100);
                    }else if(this.setBtnVal&&this.setBtnVal.agree){
                        defaultComments=this.setBtnVal.agree;
                        sender.config.placeholder = defaultComments;
                        setTimeout(function () {
                            _this.pageview.delegate('input_textarea', function (target) {
                                target.$el.find('textarea').val(defaultComments);
                            });
                        },100);
                    }else{
                        sender.config.placeholder = language.placeholder.agreeComments;
                    }
                }

            } else if (this.params.type === '2') {
                if(this.params.isBefore==='assignBefore'){
                    if(this.defaultComments&&this.defaultComments.rejectAddApprove){
                        defaultComments=this.defaultComments.rejectAddApprove;
                        sender.config.placeholder = defaultComments;
                        setTimeout(function () {
                            _this.pageview.delegate('input_textarea', function (target) {
                                target.$el.find('textarea').val(defaultComments);
                            });
                        },100);
                    }else if(this.setBtnVal&&this.setBtnVal.rejectAddApprove){
                        defaultComments=this.setBtnVal.rejectAddApprove;
                        sender.config.placeholder = defaultComments;
                        setTimeout(function () {
                            _this.pageview.delegate('input_textarea', function (target) {
                                target.$el.find('textarea').val(defaultComments);
                            });
                        },100);
                    }else{
                        sender.config.placeholder = language.placeholder.rejectComments;
                    }
                }else{
                    if(this.defaultComments&&this.defaultComments.reject){
                        defaultComments=this.defaultComments.reject;
                        sender.config.placeholder = defaultComments;
                        setTimeout(function () {
                            _this.pageview.delegate('input_textarea', function (target) {
                                target.$el.find('textarea').val(defaultComments);
                            });
                        },100);
                    }else if(this.setBtnVal&&this.setBtnVal.reject){
                        defaultComments=this.setBtnVal.reject;
                        sender.config.placeholder = defaultComments;
                        setTimeout(function () {
                            _this.pageview.delegate('input_textarea', function (target) {
                                target.$el.find('textarea').val(defaultComments);
                            });
                        },100);
                    }else{
                        sender.config.placeholder = language.placeholder.rejectComments;
                    }
                }
            } else if (this.params.type === '3') {
                if(this.defaultComments&&this.defaultComments.agree){
                    defaultComments=this.defaultComments.agree;
                    sender.config.placeholder = defaultComments;
                    setTimeout(function () {
                        _this.pageview.delegate('input_textarea', function (target) {
                            target.$el.find('textarea').val(defaultComments);
                        });
                    },100);
                }else if(this.setBtnVal&&this.setBtnVal.agree){
                    defaultComments=this.setBtnVal.agree;
                    sender.config.placeholder = defaultComments;
                    setTimeout(function () {
                        _this.pageview.delegate('input_textarea', function (target) {
                            target.$el.find('textarea').val(defaultComments);
                        });
                    },100);
                }else{
                    sender.config.placeholder = language.placeholder.agreeComments;
                }
            } else if (this.params.type === '5') {
                sender.config.placeholder = language.placeholder.remindComments;
            }else if(this.params.type === '4'){
                if(this.params.isBefore==='assignBefore'){
                    if(this.defaultComments&&this.defaultComments.addApproveAddApprove){
                        defaultComments=this.defaultComments.addApproveAddApprove;
                        sender.config.placeholder = defaultComments;
                        setTimeout(function () {
                            _this.pageview.delegate('input_textarea', function (target) {
                                target.$el.find('textarea').val(defaultComments);
                            });
                        },100);
                    }else if(this.setBtnVal&&this.setBtnVal.addApproveAddApprove){
                        defaultComments=this.setBtnVal.addApproveAddApprove;
                        sender.config.placeholder = defaultComments;
                        setTimeout(function () {
                            _this.pageview.delegate('input_textarea', function (target) {
                                target.$el.find('textarea').val(defaultComments);
                            });
                        },100);
                    }else{
                        sender.config.placeholder = language.placeholder.agreeComments;
                    }
                }else{
                    if(this.defaultComments&&this.defaultComments.addApprove){
                        defaultComments=this.defaultComments.addApprove;
                        sender.config.placeholder = defaultComments;
                        setTimeout(function () {
                            _this.pageview.delegate('input_textarea', function (target) {
                                target.$el.find('textarea').val(defaultComments);
                            });
                        },100);
                    }else if(this.setBtnVal&&this.setBtnVal.addApprove){
                        defaultComments=this.setBtnVal.addApprove;
                        sender.config.placeholder = defaultComments;
                        setTimeout(function () {
                            _this.pageview.delegate('input_textarea', function (target) {
                                target.$el.find('textarea').val(defaultComments);
                            });
                        },100);
                    }else{
                        sender.config.placeholder = language.placeholder.agreeComments;
                    }
                }

            }else {
                // sender.config.placeholder = language.placeholder.agreeComments;
            }
        },
        input_textarea_didmount: function (sender, params) {
            if (this.params.type === '5') {
                var text = decodeURI(this.params.currentUserName) + language.placeholder.remindApproval + decodeURI(this.params.instName) + language.placeholder.approvalImmediately;
                sender.setValue(text);
            }
        },
        // 指派列表
        agree_assign_list_repeat_itemclick: function (sender, params) {
            if(this.currentTaskAsign&&this.currentTaskAsign.assignInfo&&this.currentTaskAsign.assignInfo.assignInfoItems&&this.currentTaskAsign.assignInfo.assignInfoItems.length===1&&this.currentTaskAsign.assignInfo.assignInfoItems[0].participants&&this.currentTaskAsign.assignInfo.assignInfoItems[0].participants.length===1){
                return;
            }
            if(this.currentTaskAsign&&this.currentTaskAsign.assignInfo&&this.currentTaskAsign.assignInfo.assignInfoItems){
                try{
                    this.currentTaskAsign.assignInfo.assignInfoItems=JSON.parse(this.currentTaskAsign.assignInfo.assignInfoItems);
                }catch (e){
                    console.log(e);
                }
                if(this.currentTaskAsign.assignInfo.assignInfoItems.length===1&&this.currentTaskAsign.assignInfo.assignInfoItems[0].participants&&this.currentTaskAsign.assignInfo.assignInfoItems[0].participants.length===1){
                    return;
                }
            }
            if(sender.datasource.activityId.indexOf('endEvent_')===0){
                if(sender.$el.find('.add_sign_bottom_poplayer_repeat_item_right').hasClass('displayshow')){
                    sender.$el.find('.add_sign_bottom_poplayer_repeat_item_right').removeClass('displayshow');
                    sender.$el.find('.add_sign_bottom_poplayer_repeat_item_right').hide();
                    for(var i=0;i< this.selectAssignList.length;i++){
                        if(this.selectAssignList[i].length===1&&this.selectAssignList[i][0].activityId.indexOf('endEvent_')===0){
                            this.selectAssignList.splice(i,1);
                            i--;
                            break;
                        }
                    }
                    this.assignEnd=false;
                }else{
                    sender.$el.find('.add_sign_bottom_poplayer_repeat_item_right').addClass('displayshow');
                    sender.$el.find('.add_sign_bottom_poplayer_repeat_item_right').show();
                    this.selectAssignList.push([sender.datasource]);
                    this.assignEnd=true;
                }
            }else{
                if(this.hasSelectData&&this.hasSelectData.length!==0&&this.currentTaskAsign.assignSingle&&sender.datasource.activityId!==this.activityId){
                    return;
                }else{
                    var _this = this;
                    this.flag=false;
                    if (sender.datasource.participants.length == 1&&_this.currentTaskAsign.assignAll) return;
                    if (sender.datasource.participants.length == 1&&_this.currentTaskAsign.assignSingle&&_this.currentTaskAsign.assignInfo.assignInfoItems.length===1) return;

                    this.pageview.delegate('agree_assign_list_repeat', function (target) {
                        // 同意时流程列表数据
                        _this.agreeAssignList = target.components || [];
                    });
                    if(_this.currentTaskAsign.assignSingle&&!this.assignEnd){
                        _this.selectAssignList=[];
                        if(!_this.hasSelectData||_this.hasSelectData.length===0){
                            this.pageview.showPage({
                                pageKey: 'selectApprovers',
                                mode: 'fromRight2',
                                nocache: true,
                                params: {
                                    taskId: _this.params.taskId,
                                    dealLogic: _this,
                                    approverList: sender.datasource,
                                    index: params.index
                                }
                            });
                            _this.hasSelectIndex=params.index;
                        }else{
                            if(_this.hasSelectIndex==params.index){
                                this.pageview.showPage({
                                    pageKey: 'selectApprovers',
                                    mode: 'fromRight2',
                                    nocache: true,
                                    params: {
                                        taskId: _this.params.taskId,
                                        dealLogic: _this,
                                        approverList: sender.datasource,
                                        index: params.index
                                    }
                                });
                            }
                        }
                    }else {
                        this.pageview.showPage({
                            pageKey: 'selectApprovers',
                            mode: 'fromRight2',
                            nocache: true,
                            params: {
                                taskId: _this.params.taskId,
                                dealLogic: _this,
                                approverList: sender.datasource,
                                index: params.index
                            }
                        });
                    }
                }
            }
        },
        agree_assign_list_repeat_item_init: function (sender, params) {
            if(sender.datasource.activityId.indexOf('endEvent_')===0){
                sender.config.root.push('add_sign_bottom_poplayer_repeat_item_right');
            }
        },
        add_sign_person_right_repeat_init: function (sender, params) {
            if(this.params.type==='11'){
                sender.bindData(this.circulate_list);
            }else{
                sender.bindData(this.add_sign_select_list);
            }

        },
        add_sign_person_repeat_init:function (sender,params) {
            if(this.add_sign_select_list){
                for(var i=0;i<this.add_sign_select_list.length;i++){
                    var itemData=this.add_sign_select_list[i];
                    this.pageview.refs.add_sign_person_repeat.addItem({
                        userName: itemData.name,
                        headImgUrl: itemData.avatar,
                        memberId: itemData.member_id
                    });
                }
            }
        },
        add_sign_person_repeat_itemclick: function (sender, params) {
            var itemMemberID = sender.datasource.memberId.toString();
            if(this.params.type==='11'){
                if (this.circulate_list) {
                    for (var i = this.circulate_list.length - 1; i >= 0; i--) {
                        if (this.circulate_list[i].member_id.toString() === itemMemberID) {
                            this.circulate_list.splice(i, 1);
                        }
                    }
                }
            }else{
                if (this.add_sign_select_list) {
                    for (var j = this.add_sign_select_list.length - 1; j >= 0; j--) {
                        if (this.add_sign_select_list[j].member_id.toString() === itemMemberID) {
                            this.add_sign_select_list.splice(j, 1);
                        }
                    }
                }
            }

            sender.remove();
        },
        add_sign_person_btn_click: function (sender, params) {
            
        },
        add_sign_bottom_poplayer_init: function (sender, params) {
            this.poplayer = sender;
        },
        add_sign_way_click: function (sender, params) {
            this.poplayer.show();
        },
        add_sign_bottom_poplayer_repeat_itemclick: function (sender, params) {
            var _this = this;
            this.pageview.delegate('add_sign_way_middle', function (target) {
                target.setText(sender.datasource.title);
                _this.selectAssignWay = sender.datasource.title;
                _this.selectAssignWayKey = sender.datasource.title === '会签' ? '1' : '0';
            });

            sender.select();
            this.poplayer.hide();
        },
        agree_assign_list_repeat_title_init: function (sender, params) {
            sender.config.text = sender.config.text || language.dealPage.stepUnnamed;
        },
        /*
         * 云签名按钮控制和普通指派加签等提交按钮区分；点击同意根据按钮type来控制显示问题
         * */
        submit_init:function (sender,params) {
            sender.config.title=language.formAction.submit;
            if(this.params.type==="1"||this.params.type==="3"){
                if(this.params.cloudsignature!==""||this.params.useCloudsignature!==""||this.params.useCloudsignature!=="undefined"||this.params.cloudsignature!=="undefined"){
                    sender.config.style.display="none";
                }
            }

        },
        bottomToolBar_init:function (sender,params) {

        },

        cloudsign_init:function (sender,params) {
            sender.config.title=language.formAction.cloudSign;
            if(this.setBtnVal.cloudSign){
                sender.config.title=this.setBtnVal.cloudSign;
            }
            if(!this.params.cloudsignature||(this.params.useCloudsignature&&this.params.useCloudsignature==="undefined")){
                sender.config.style.display="none";
            }else{
                if(this.params.type==="2"||this.params.type==="5"||this.params.type==="4"){
                    sender.config.style.display="none";
                }
            }
        },
        submitbtn_init:function (sender,params) {
            sender.config.title=language.formAction.submit;
            if (this.params.type === '1'){
                if(this.params.isBefore==='assignBefore'){
                    if(this.setBtnVal&&this.setBtnVal.agreeAddApprove){
                        sender.config.title=this.setBtnVal.agreeAddApprove;
                    }
                }else{
                    if(this.setBtnVal&&this.setBtnVal.agree){
                        sender.config.title=this.setBtnVal.agree;
                    }else{
                        sender.config.title=language.formAction.agree;
                    }
                }
            }else if (this.params.type === '2'){
                if(this.params.isBefore==='assignBefore'){
                    if(this.setBtnVal&&this.setBtnVal.rejectAddApprove){
                        sender.config.title=this.setBtnVal.rejectAddApprove;
                    }
                }else{
                    if(this.setBtnVal&&this.setBtnVal.reject){
                        sender.config.title=this.setBtnVal.reject;
                    }else{
                        sender.config.title=language.formAction.reject;
                    }
                }
            }else if (this.params.type === '3'){
                if(this.setBtnVal.agree){
                    sender.config.title=this.setBtnVal.agree;
                }
            }else if (this.params.type === '4'){
                if(this.params.isBefore==='assignBefore'){
                    if(this.setBtnVal&&this.setBtnVal.addApproveAddApprove){
                        sender.config.title=this.setBtnVal.addApproveAddApprove;
                    }
                }else{
                    if(this.setBtnVal&&this.setBtnVal.addApprove){
                        sender.config.title=this.setBtnVal.addApprove;
                    }else{
                        sender.config.title=language.formAction.assignBefore;
                    }
                }
            }else{
                if(this.setBtnVal.agree){
                    sender.config.title=this.setBtnVal.agree;
                }
            }
        },
        uselastsign_init:function (sender,params) {
            sender.config.title=language.formAction.historySign;
            if(!this.params.cloudsignature||(this.params.useCloudsignature&&this.params.useCloudsignature==="undefined")){
                sender.config.style.display="none";
            }else{
                if(this.params.type==="2"||this.params.type==="5"){
                    sender.config.style.display="none";
                }
                if(this.params.type!=="2"&&this.params.lastSignUrl){
                    sender.config.style.display="flex";
                }
            }
        },
        usercomments_init:function (sender,params) {
            sender.config.title=language.formAction.commonPhrase;
        },
        uselastsign_click:function (sender,params) {
            var _this=this;
            if(this.params.lastSignUrl&&this.params.lastSignUrl!=='undefined'){
                this.pageview.refs.cloud_sign_image.$el.show();
                var temp=new Image();
                temp.src=this.params.lastSignUrl;
                temp.onload=function () {
                    _this.pageview.refs.cloud_sign_image.$el.empty();
                    if(temp.height>temp.width){
                        $(temp).css({transform:"rotate(-90deg)",width:130,position:"absolute",left:"35%",height:180,top:-25});
                    }else{
                        $(temp).css({width:180,height:115,margin:"0 auto"});
                    }
                    _this.pageview.refs.cloud_sign_image.$el.append(temp);
                };
            }
        },
        usercomments_click:function (sender, params) {
            var _this=this;
            this.pageview.showPage({
                pageKey: 'commonComment',
                mode: 'fromRight2',
                nocache: true,
                params: {
                    taskId: _this.params.taskId,
                    dealLogic: _this,
                }
            });
        },
        set_common_comments_click:function (sender,params) {
            if(this.commentSelect){
                this.pageview.delegate("set_common_comments_left", function (target) {
                    target.unSelected();
                });
                this.commentSelect=false;
            }else{
                this.pageview.delegate("set_common_comments_left", function (target) {
                    target.selected();
                });
                this.commentSelect=true;
            }
        },

        doAddComments:function (value) {
            var _this=this,
                listAjaxConfig = {
                    url: '/process/saveCommons',
                    type: 'POST',
                    data: {
                        value:value
                    },
                    success: function (listData) {

                    },
                    error: function (listData) {
                    }
                };
            this.pageview.ajax(listAjaxConfig);
        },
        submitbtn_click:function (sender, params) {
            var para = {},
                _this = this;
            para.instanceId = this.params.instanceId; // 1 同意 2 不同意 3 指派 4 加签
            para.taskId = this.params.taskId;
            var cloudSignData=$(".cloud_sign_image").find("img").attr('src');
            try{
                para.comment = sender.parent.parent.components.main_view_content.components.input_textarea_container.$el.find('textarea').val() || '';

            }catch(e){
                console.log(e);
            }
            if(this.commentSelect&&para.comment){
                this.doAddComments(para.comment);
            }
            para.copyToUsers=this.params.copyToUsers;
            para.processId = this.params.processId;
            para.currentActivityId=this.params.currentActivityId;
            if(this.params.pk_bo){
                para.pk_bo=this.params.pk_bo;
            }
            if(this.params.currentActivityId){
                para.currentActivityId=this.params.currentActivityId;
            }
            if(this.params.actionCode){
                para.actionCode=this.params.actionCode;
            }

            para.category = this.params.category;//加入分类 xingjjc
            if (this.params.type === '1') {
                // 同意
                if(this.params.isBehind){
                    para.comment = this.beforeSubmit(para.comment)||this.setBtnVal.addBehindApprove||this.setBtnVal.agree;
                // ||language.dealPage.assign
                }else if(this.setBtnVal&&this.setBtnVal.agreeAddApprove){
                    para.comment = this.beforeSubmit(para.comment)||this.setBtnVal.agreeAddApprove||language.agree;
                // ||language.agree
                }else{
                    para.comment = this.beforeSubmit(para.comment)||this.setBtnVal.agree||language.agree;
                // ||language.agree
                }

                if(cloudSignData) {
                    para.cloudSignData = decodeURIComponent(cloudSignData);
                }
                if(this.params.substitutionComments){
                    para.comment+=(" "+this.params.substitutionComments);
                }
                if(this.params.cloudsignature&&this.params.cloudsignature==="true"&&!cloudSignData){
                    if(!cloudSignData){
                        this.pageview.showTip({text: language.dealPage.unSignBeforeApproval, duration: 2000});
                        return;
                    }else{
                        this.doAgree(para);
                    }
                }else{
                    this.doAgree(para);
                }

            } else if (this.params.type === '2') {
                // 驳回
                para.comment = this.beforeSubmit(para.comment)||this.setBtnVal.reject||language.dealPage.rejectComments;
            // ||language.dealPage.rejectComments
                if(this.params.substitutionComments){
                    para.comment+=(" "+this.params.substitutionComments);
                }
                this.doReject(para);
            } else if (this.params.type === '3') {
                // 指派
                para.comment = this.beforeSubmit(para.comment)||this.setBtnVal.agree||language.agree;
            // ||language.agree
                if(this.params.substitutionComments){
                    para.comment+=(" "+this.params.substitutionComments);
                }
                //同意指派&云签名
                if(cloudSignData) {
                    para.cloudSignData = decodeURIComponent(cloudSignData);
                }
                if(this.params.cloudsignature&&this.params.cloudsignature==="true"&&!cloudSignData){
                    if(!cloudSignData){
                        this.pageview.showTip({text: language.dealPage.unSignBeforeApproval, duration: 2000});
                        return;
                    }else{
                        this.doAssign(para);
                    }
                }else{
                    this.doAssign(para);
                }

            } else if (this.params.type === '4') {
                // 加签
                if(this.params.addsignBehindAble){
                    para.addsignBehindAble=true;
                    para.comment = this.beforeSubmit(para.comment)||this.setBtnVal.agree||this.setBtnVal.addBehindApprove||language.dealPage.assign;
                // ||language.dealPage.assign
                }else{
                    para.comment = this.beforeSubmit(para.comment)||this.setBtnVal.addApprove||this.setBtnVal.agree||language.dealPage.assign;
                // ||language.dealPage.assign
                }
                if(this.params.substitutionComments){
                    para.comment+=(" "+this.params.substitutionComments);
                }
                this.doAddSign(para);
            } else if (this.params.type === '5') {
                // 催办
                this.doReminder(para);
            }else if(this.params.type==='10'){
                para.comment = this.beforeSubmit(para.comment)||this.setBtnVal.jump||language.formTips.finishApprove;
            // ||language.formTips.finishApprove
                this.doJump(para);
            }
        },

        cloudsign_click:function (sender, params) {
            this.pageview.go('cloudSign');
        },

        submit_click: function (sender, params) {
            var para = {},
                _this = this;
            para.instanceId = this.params.instanceId; // 1 同意 2 不同意 3 指派 4 加签
            para.taskId = this.params.taskId;
            para.comment = sender.parent.components.main_view_content.components.input_textarea_container.$el.find('textarea')
                    .val() || '';
            para.processId = this.params.processId;
            para.currentActivityId=this.params.currentActivityId;
            para.copyToUsers=this.params.copyToUsers;
            if(this.params.pk_bo){
                para.pk_bo=this.params.pk_bo;
            }
            if(this.params.currentActivityId){
                para.currentActivityId=this.params.currentActivityId;
            }

            para.category = this.params.category;//加入分类 xingjjc

            if (this.params.type === '1') {
                // 同意
                if(this.params.actionCode){
                    para.actionCode='read';
                }
                if(this.params.isBehind){
                    para.comment = this.beforeSubmit(para.comment)||this.setBtnVal.addBehindApprove||this.setBtnVal.agree;
                // ||language.dealPage.assign
                }else{
                    para.comment = this.beforeSubmit(para.comment)||this.setBtnVal.agree||language.agree;
                // ||language.agree
                }
            } else if (this.params.type === '2') {
                // 驳回
                para.comment = this.beforeSubmit(para.comment)||this.setBtnVal.reject||language.dealPage.rejectComments;
            // ||language.dealPage.rejectComments
                this.doReject(para);
            } else if (this.params.type === '3') {
                // 指派
                para.comment = this.beforeSubmit(para.comment)||this.setBtnVal.agree||language.agree;
            // ||language.agree
                this.doAssign(para);
            } else if (this.params.type === '4') {
                // 加签
                para.comment = this.beforeSubmit(para.comment)||this.setBtnVal.addApprove||this.setBtnVal.agree||language.dealPage.assign;
            // ||language.dealPage.assign
                if(this.params.addsignBehindAble){
                    para.addsignBehindAble=true;
                    para.comment = this.beforeSubmit(para.comment)||this.setBtnVal.agree||this.setBtnVal.addBehindApprove||language.dealPage.assign;
                // ||language.dealPage.assign
                }else{
                    para.comment = this.beforeSubmit(para.comment)||this.setBtnVal.addApprove||this.setBtnVal.agree||language.dealPage.assign;
                // ||language.dealPage.assign
                }
                this.doAddSign(para);
            } else if (this.params.type === '5') {
                // 催办
                this.doReminder(para);
            }else if(this.params.type==='10'){
                para.comment = this.beforeSubmit(para.comment)||this.setBtnVal.jump||language.formTips.finishApprove;
            // ||language.formTips.finishApprove
                this.doJump(para);
            }
        },
        //后加签
        confirm_click:function (sender,params) {
            if(this.params.type==='11'){
                window.localStorage.setItem("CIRCULATE",JSON.stringify(this.circulate_list));
            }else{
                window.localStorage.setItem("ADD_SIGN_BEHIND",JSON.stringify(this.add_sign_select_list));
                window.localStorage.setItem("ADD_SIGN_BEHIND_STYLE",this.selectAssignWayKey);
            }
            window.localStorage.removeItem("CLOUD_SIGN");
            this.pageview.goBack();
        },
        // 同意
        doAgree: function (_para) {
            var _this = this,
                para = _para,
                url = '';
            this.pageview.showLoading({text: language.formTips.onLoading, timeout: 8000});
            var formData = this.addTaskCommentPara();
            if(this.params.isBehind==="1"&&this.add_sign_select_list.length!==0){
                var assignees = this.add_sign_select_list,
                    assigneeIds = '';
                this.selectAssignWayKey=window.localStorage.getItem("ADD_SIGN_BEHIND_STYLE");
                if (assignees.length === 0) {
                    this.pageview.showTip({text: language.formTips.assignParticipants, duration: 1000});
                    return;
                }
                if (!this.selectAssignWayKey) {
                    this.pageview.showTip({text: language.formTips.assignTypes, duration: 1000});
                    return;
                }

                assignees.forEach(function (value, key) {
                    if (key !== (assignees.length - 1)) {
                        assigneeIds += value.member_id + ',';
                    } else {
                        assigneeIds += value.member_id;
                    }
                });
                this.pageview.ajax({
                    url: "process/counterSignAddTask",
                    type: "POST",
                    data: {
                        instanceId: para.instanceId,
                        processId: para.processId,
                        taskId: para.taskId,
                        comment:para.comment,
                        assignees: assigneeIds,
                        formData:formData,
                        currentActivityId:para.currentActivityId,
                        pk_bo:para.pk_bo,
                        counterSignType: this.selectAssignWayKey,
                        isBehind:"1"
                    },
                    success: function (data) {
                        _this.pageview.hideLoading(true);
                        if (data.success) {
                            // _this.doComment(para);
                            // _this.pageview.showTip({text: "加签成功", duration: 1000});
                            window.localStorage.removeItem("ADD_SIGN_BEHIND_STYLE");
                            _this.pageview.showLoading({text: language.formTips.onLoading, timeout: 8000});
                            setTimeout(function () {
                                if (_this.params.isAdd) {
                                    var addData = window.localStorage.getItem('ADDITIONAL_FORM_DATA');

                                    url = '/process/saveActivityFormAndAudit';
                                    para = $.extend(para, {formData: addData, businessKey: _this.params.businessKey});
                                } else {
                                    url = '/process/audit';
                                    para.actionCode='addBehindApprove';

                                    // 审批意见回写
                                    // var cloudSignData=window.localStorage.getItem("CLOUD_SIGN");
                                    var cloudSignData=$(".cloud_sign_image").find("img").attr('src');
                                    para.formData = _this.addTaskCommentPara();
                                    if(cloudSignData) {
                                        para.cloudSignData = decodeURIComponent(cloudSignData);
                                        window.localStorage.removeItem("CLOUD_SIGN");
                                    }
                                }

                                _this.pageview.ajax({
                                    url: url,
                                    data: para,
                                    type: 'POST',
                                    success: function (data) {
                                        _this.pageview.hideLoading(true);
                                        if (data.code === 0) {
                                            _this.pageview.showTip({text: language.formTips.successfullyApproved, duration: 800});

                                            window.changeFormStatus = true;
                                            window.localStorage.removeItem('ADDITIONAL_FORM_DATA');
                                            window.localStorage.removeItem("copyUserParticipants");
                                            setTimeout(function () {
                                                // 追加退两格
                                                if (_this.params.isAdd) {
                                                    _this.pageview.goBack(-2);
                                                } else {
                                                    _this.pageview.goBack(-1);
                                                }
                                            }, 800);
                                        } else {
                                            if(data.msg==="表单变量不存在"){
                                                data.msg="无法产生下一步任务，流程无法继续进行！";
                                            }
                                            _this.pageview.showTip({text: data.msg, duration: 2000});
                                        }
                                    },
                                    error: function (data) {
                                        console.log(data);
                                    }
                                });
                            }, 1100);
                        } else {
                            _this.pageview.showTip({text: data.msg, duration: 2000});
                        }
                    },
                    error: function () {
                        _this.pageview.showTip({text: language.formTips.assignFail, duration: 1000});
                    }
                });
            }else if(this.params.isCirculate&&this.circulate_list.length!==0){
                var circulator = this.circulate_list,
                    circulatorIds = '';
                if (circulator.length === 0) {
                    this.pageview.showTip({text: language.formTips.circulatePerson, duration: 1000});
                    return;
                }

                circulator.forEach(function (value, key) {
                    if (key !== (circulator.length - 1)) {
                        circulatorIds += value.member_id + ',';
                    } else {
                        circulatorIds += value.member_id;
                    }
                });

                this.pageview.ajax({
                    url: "process/circulateTask",
                    type: "POST",
                    data: {
                        instanceId: para.instanceId,
                        processId: para.processId,
                        comment: para.comment,
                        taskId: para.taskId,
                        assignees: circulatorIds,
                        formData:formData,
                        currentActivityId:para.currentActivityId,
                        pk_bo:para.pk_bo,
                        counterSignType: this.selectAssignWayKey,
                    },
                    success: function (data) {
                        _this.pageview.hideLoading(true);
                        if (data.success) {
                            _this.pageview.showLoading({text: language.formTips.onLoading, timeout: 8000});
                            setTimeout(function () {
                                _this.pageview.goBack(-1);
                            }, 1100);
                        } else {
                            _this.pageview.showTip({text: data.msg, duration: 2000});
                        }
                    },
                    error: function () {
                        _this.pageview.showTip({text: language.formTips.assignFail, duration: 1000});
                    }
                });
            }else{
                // 追加单据
                if (this.params.isAdd) {
                    var addData = window.localStorage.getItem('ADDITIONAL_FORM_DATA');

                    url = '/process/saveActivityFormAndAudit';
                    para = $.extend(para, {formData: addData, businessKey: this.params.businessKey});
                } else {
                    url = '/process/audit';

                    // 审批意见回写
                    // var cloudSignData=window.localStorage.getItem("CLOUD_SIGN");
                    var cloudSignData=$(".cloud_sign_image").find("img").attr('src');
                    para.formData = _this.addTaskCommentPara();
                    if(cloudSignData) {
                        para.cloudSignData = decodeURIComponent(cloudSignData);
                        window.localStorage.removeItem("CLOUD_SIGN");
                    }
                }
                this.pageview.ajax({
                    url: url,
                    data: para,
                    type: 'POST',
                    success: function (data) {
                        _this.pageview.hideLoading(true);
                        if (data.code === 0) {
                            _this.pageview.showTip({text: language.formTips.successfullyApproved, duration: 800});
                            window.localStorage.removeItem("copyUserParticipants");
                            window.changeFormStatus = true;

                            setTimeout(function () {
                                // 追加退两格
                                if (_this.params.isAdd) {
                                    _this.pageview.goBack(-2);
                                } else {
                                    _this.pageview.goBack(-1);
                                }
                                // _this.pageview.replaceGo('detail', {
                                //     instId: _this.params.instanceId || '',
                                //     formId: _this.params.taskId || '',
                                //     formName: _this.params.formName
                                // });
                            }, 800);
                        } else {
                            if(data.msg==="表单变量不存在"){
                                data.msg="无法产生下一步任务，流程无法继续进行！";
                            }
                            _this.pageview.showTip({text: data.msg, duration: 2000});
                        }
                    },
                    error: function (data) {
                        console.log(data);
                    }
                });
            }


        },
        // 驳回
        doReject: function (para) {
            var _this = this;

            para.activityId = this.activityId;
            para.starter = this.params.starter;

            this.pageview.showLoading({text: language.formTips.onLoading, timeout: 8000});
            para.formData = this.addTaskCommentPara();
            this.pageview.ajax({
                url: '/process/rejectTask',
                data: para,
                type: 'POST',
                success: function (data) {
                    _this.pageview.hideLoading(true);
                    window.localStorage.removeItem("copyUserParticipants");
                    if (data.code === 0) {
                        _this.pageview.showTip({text: language.formTips.successfullyReject, duration: 800});
                        window.changeFormStatus = true;

                        setTimeout(function () {
                            _this.pageview.goBack();
                        }, 800);
                    } else {
                        _this.pageview.showTip({text: language.formTips.selectRejectStep, duration: 1000});
                    }
                },
                error: function (data) {
                    console.log(data);
                }
            });
        },
        // 指派
        doAssign: function (para) {
            this.currentTaskAsign = JSON.parse(window.localStorage.getItem('ASSIGN_CHECK_DATA')).data;
            var alreadySelect = false,
                _this = this,
                middleObj = {},assignInfoItemsCopyMiddle=[],
                assignInfoItemsCopy = utils.copy(_this.currentTaskAsign.assignInfo.assignInfoItems);

            _this.selectAssignList.forEach(function (nItem, nIndex) {
                nItem.forEach(function (mItem, mIndex) {
                    middleObj[mItem.activityId] = nItem;
                });
            });
            if(typeof assignInfoItemsCopy==="string"){
                assignInfoItemsCopy=JSON.parse(assignInfoItemsCopy);
            }
            assignInfoItemsCopy.forEach(function (value, key) {
                value.participants = [];
                var curValue=value.activityId;
                // value.participants = _this.selectAssignList[key];
                _this.selectAssignList.forEach(function (iten,imdex) {
                    var curImdex=imdex;
                    iten.forEach(function (iox,iov) {
                        if(iox.activityId===curValue){
                            value.participants = _this.selectAssignList[curImdex];
                            return;
                        }
                    });
                });
                // if (middleObj[value.activityId]) {
                //     value.participants = middleObj[value.activityId];
                //     alreadySelect = true;
                // }
            });

            assignInfoItemsCopy.forEach(function (item,index){
                if(item.participants&&item.participants.length!==0){
                    assignInfoItemsCopyMiddle.push(item);
                    if(assignInfoItemsCopyMiddle.length!==0){
                        alreadySelect = true;
                    }

                }
            });
            this.currentTaskAsign = JSON.parse(window.localStorage.getItem('ASSIGN_CHECK_DATA')).data;
            // 追加单据指派时增加的数据
            if (this.params.isAdd) {
                var addData = window.localStorage.getItem('ADDITIONAL_FORM_DATA');

                _this.currentTaskAsign.assignInfo.formData = addData;
            }
            _this.currentTaskAsign.assignInfo.assignInfoItems = JSON.stringify(assignInfoItemsCopyMiddle);
            if(_this.currentTaskAsign.assignAll){//指派所有分支 @huangzhy 20170907
                if(assignInfoItemsCopyMiddle.length===0){
                    this.pageview.showTip({
                        text: language.formTips.assignInformationEmpty,
                        duration: 1200
                    });
                    return;
                }else{
                    if(assignInfoItemsCopyMiddle.length!==assignInfoItemsCopy.length){
                        alreadySelect=false;
                        var tempAssignCopy=[],tempAssignMiddle=[];
                        assignInfoItemsCopyMiddle.forEach(function (item,index) {
                            tempAssignMiddle.push(item.activityName);
                        });
                        assignInfoItemsCopy.forEach(function (ite,inde) {
                            tempAssignCopy.push(ite.activityName);
                        });
                        for(var ih=0,jh=tempAssignMiddle.length;ih<jh;ih++){
                            var im=tempAssignMiddle[ih];
                            for(var io=0,ip=tempAssignCopy.length;io<ip;io++){
                                if(tempAssignCopy[io]===im){
                                    tempAssignCopy.splice(io,1);
                                }
                            }
                        }
                        this.pageview.showTip({
                            text: tempAssignCopy.join(",")+language.formTips.branchNoProcessor,
                            duration: 1200
                        });
                        return;
                    }
                }
            }
            if (!alreadySelect) {
                //this.pageview.showTip({text: '请选择1个或多个指派环节中的1个或多个用户！', duration: 4000});
                this.pageview.showTip({text: language.formTips.assignInformationEmpty, duration: 4000});
                return false;
            } else {
                this.pageview.showLoading({text: language.formTips.onLoading, timeout: 8000});
                // 审批意见会写多传的参数
                var formData = this.addTaskCommentPara();
                this.pageview.ajax({
                    url: "process/actionTask",
                    type: "POST",
                    data: $.extend({
                        instanceId: para.instanceId,
                        processId: para.processId,
                        formData: formData,
                        comment: para.comment,
                        taskId:para.taskId,
                        currentActivityId:para.currentActivityId,
                        pk_bo:para.pk_bo,
                        cloudSignData:para.cloudSignData,
                        copyToUsers:para.copyToUsers||"",

                    }, _this.currentTaskAsign.assignInfo),
                    success: function (data) {
                        _this.pageview.hideLoading(true);

                        if (data.success) {
                            // _this.doComment(para);
                            _this.pageview.showTip({text: language.formTips.successfullyApproved, duration: 1000});
                            setTimeout(function () {
                                // 追加退两格
                                if (_this.params.isAdd) {
                                    _this.pageview.goBack(-2);
                                } else {
                                    _this.pageview.goBack(-1);
                                }
                                // _this.pageview.replaceGo('detail', {
                                //     instId: _this.params.instanceId || '',
                                //     formId: _this.params.taskId || '',
                                //     formName: _this.params.formName
                                // });
                            }, 1100);
                        } else {
                            _this.pageview.showTip({text: data.msg, duration: 2000});
                        }
                    },
                    error: function () {
                        _this.pageview.showTip({text: language.formTips.designateFail, duration: 1000});
                    }
                });
            }
        },
        // 评论
        doComment: function (para) {
            var _this = this;

            if (para.comment) {
                this.pageview.ajax({
                    url: "process/addComment",
                    type: "POST",
                    data: {
                        instanceId: para.instanceId,
                        comment: para.comment,
                        taskId: para.taskId
                    },
                    success: function () {
                    },
                    error: function () {
                        _this.pageview.showTip({text: language.formTips.failToComment, duration: 1000});
                    }
                });
            }
        },
        // 加签
        doAddSign: function (para) {
            var _this = this,
                assignees = this.add_sign_select_list,
                assigneeIds = '';

            if (assignees.length === 0) {
                this.pageview.showTip({text: language.formTips.assignParticipants, duration: 1000});
                return;
            }

            if (!this.selectAssignWayKey) {
                this.pageview.showTip({text: language.formTips.assignTypes, duration: 1000});
                return;
            }

            assignees.forEach(function (value, key) {
                if (key !== (assignees.length - 1)) {
                    assigneeIds += value.member_id + ',';
                } else {
                    assigneeIds += value.member_id;
                }
            });
            var formData = this.addTaskCommentPara();
            this.pageview.showLoading({text: language.formTips.onLoading, timeout: 8000});
            if(para.addsignBehindAble){
                // _this.pageview.goBack(-1)
                window.history.back();
            }else{
                this.pageview.ajax({
                    url: "process/counterSignAddTask",
                    type: "POST",
                    data: {
                        instanceId: para.instanceId,
                        processId: para.processId,
                        taskId: para.taskId,
                        assignees: assigneeIds,
                        formData:formData,
                        currentActivityId:para.currentActivityId,
                        pk_bo:para.pk_bo,
                        counterSignType: this.selectAssignWayKey,
                        comment:para.comment
                    },
                    success: function (data) {
                        _this.pageview.hideLoading(true);
                        window.localStorage.removeItem("copyUserParticipants");
                        if (data.success) {
                            // _this.doComment(para);
                            _this.pageview.showTip({text: language.formTips.assignSuccess, duration: 1000});
                            setTimeout(function () {
                                _this.pageview.goBack();
                            }, 1100);
                        } else {
                            _this.pageview.showTip({text: data.msg, duration: 2000});
                        }
                    },
                    error: function () {
                        _this.pageview.showTip({text: language.formTips.assignFail, duration: 1000});
                    }
                });
            }

        },
        // 跳转
        doJump:function (para) {
            var _this = this;
            para.activityId = this.activityId;
            para.starter = this.params.starter;
            this.pageview.showLoading({text: language.formTips.onLoading, timeout: 8000});
            para.formData = this.addTaskCommentPara();

            if(!para.comment){
                if(para.activityId&&para.activityId.indexOf('endEvent_')>-1){
                    para.comment=language.formTips.finishJumpTo;
                }else{
                    para.comment=language.formTips.finishApprove;
                }
            }

            if(!para.activityId){
                _this.pageview.hideLoading(true);
                _this.pageview.showTip({text: language.formTips.selectJumpStep, duration: 1000});
                return;
            }
            this.pageview.ajax({
                url: '/process/jumpTask',
                data: para,
                type: 'POST',
                success: function (data) {
                    _this.pageview.hideLoading(true);
                    if (data.code === 0) {
                        _this.pageview.showTip({text: language.formTips.finishSuccess, duration: 800});
                        window.changeFormStatus = true;
                        setTimeout(function () {
                            _this.pageview.goBack();
                        }, 800);
                    } else {
                        _this.pageview.showTip({text: language.formTips.selectJumpStep, duration: 1000});
                    }
                },
                error: function (data) {
                    console.log(data);
                }
            });
        },
        add_sign_bottom_poplayer_repeat_iteminit: function (sender, params) {
            var _this = this;

            if (sender.datasource.title === "抢占"||sender.datasource.title.indexOf('Seize')>-1) {
                sender.select();

                this.pageview.delegate('add_sign_way_middle', function (target) {
                    target.setText(language.dealPage.raceToApproval);
                    _this.selectAssignWay = language.dealPage.raceToApproval;
                    _this.selectAssignWayKey = '0';
                });
            }
        },
        doReminder: function (para) {
            var _this = this;

            if (!para.comment) {
                this.pageview.showTip({text: language.formTips.enterRemindingContent, duration: 1000});
                return false;
            }

            // 如果没锁
            if (!this.reminderLock) {
                this.pageview.showLoading({text: language.formTips.Processing});
                this.reminderLock = true; // 加锁

                this.pageview.ajax({
                    url: "esn/sendTaskMessage",
                    timeout: 15000,
                    type: "POST",
                    data: {
                        processInstanceId: this.params.instId,
                        fromUserId: this.params.currentUserId,
                        toUserId: this.params.assignee,
                        message: para.comment,
                        taskId: this.params.taskId,
                        formInstanceId: this.params.formInstanceId,
                        processDefinitionId: this.params.processDefinitionId
                    },
                    success: function (data) {
                        _this.pageview.hideLoading(true);
                        if (data.success) {
                            _this.pageview.showTip({text: language.formTips.remindSuccess, duration: 1000});
                            setTimeout(function () {
                                _this.reminderLock = false; // 解锁
                                _this.pageview.goBack();
                            }, 1000);
                        } else {
                            _this.pageview.showTip({text: data.msg, duration: 1000});
                            _this.reminderLock = false; // 解锁
                        }
                    },
                    error: function (data) {
                        _this.pageview.hideLoading(true);
                        _this.pageview.showTip({text: data.msg, duration: 1000});
                        _this.reminderLock = false; // 解锁
                    }
                });
            }
        },
        // 审批意见回写增加的参数
        addTaskCommentPara: function () {
            var formDataList = window._formData,
                applyHistory = window._applyHistory,
                formData = {};

            if ($.isArray(formDataList) && formDataList.length > 0 && formDataList[0]) {
                formData = {
                    formData: formDataList,
                    pkValue: applyHistory.formDataList[0].pk_boins,
                    version: applyHistory.formDataList[0].version,
                    pk_temp: applyHistory.formDataList[0].pk_temp,
                    tableName: applyHistory.iForms.bo_tablename
                };
                formData = JSON.stringify(formData);
            } else {
                formData = '';
            }
            return formData;
        },
        beforeSubmit: function (content) {
            return this.filterEmoji(content);
        },
        filterEmoji: function (content) {
            if (!content) return '';

            var emojireg = content.replace(/\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]|[\uD800-\uDBFF]|[\uDC00-\uDFFF]/g, "");
            return emojireg;
        }

    };

    return pageLogic;
});
