
define(["utils", "../parts/analysis",  "../parts/language","../../../components/dialog"], function (utils, analysis,language,Dialog) {

    function PageLogic(config) {
        var _this = this;
        this.item = [];
        this.pageview = config.pageview;
        this.taskId=this.pageview.params.taskId;
        if (utils.deviceInfo().isAndroid) {
            window.setTimeout(function () {
                _this.loadData();
            }, 300);
        } else {
            _this.loadData();
        }
    }

    PageLogic.prototype = {
        onPageResume: function () {
            this.item = [];
            this.loadData();
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
                listAjaxConfig = {
                    url: '/process/getApply',
                    type: 'GET',
                    data: {
                        taskId: this.pageview.params.taskId || '',
                        billId:this.pageview.params.billId||'',
                        billtype:this.pageview.params.billtype||this.pageview.params.pk_billtype||'',
                        userid:this.pageview.params.userid||'',
                        groupid:this.pageview.params.groupid||'0001V610000000000EEN'
                    },
                    success: function (listData) {
                        var data;
                        if(listData.flag==='1'){
                            _this.pageview.hideLoading(true);
                            _this.pageview.showTip({text: listData.desc, duration: 2000});
                            return;
                        }
                        try{
                            data=JSON.parse(listData.data);
                        }catch(e){
                            data=listData.data;
                        }
                        _this.instName=data.inst.name;
                        jsonList = analysis.getAnalysis_ifroms(data);
                        var subFormsList = [];
                            var subForms = listData.data.inst.bpmForms && listData.data.inst.bpmForms[0].subForms ? listData.data.inst.bpmForms[0].subForms : [];
                            for (var subIdex = 0; subIdex < subForms.length; subIdex++) {
                                //同一个子表多条的情况通过子表数值map来判断 xingjjc
                                var formDataList = listData.data.inst.formDataList && listData.data.inst.formDataList[0][subForms[subIdex].tableName];
                                for (var _subFormIndex = 0; _subFormIndex < formDataList.length; _subFormIndex++) {
                                    var subFormsJson = {};
                                    subFormsJson.title = subForms[subIdex].title;
                                    subFormsJson.item = [];
                                    subFormsJson.num = _subFormIndex + 1;
                                    var _fields = subForms[subIdex] ? subForms[subIdex].fields : [];
                                    for (var s_idex = 0; s_idex < _fields.length; s_idex++) {
                                        var subFormsContent = {};
                                        var s_variableContent = JSON.parse(_fields[s_idex].variableContent);
                                        var s_name = s_variableContent.name ? s_variableContent.name : language.nameIsNull;
                                        var s_type = s_variableContent.type.name;
                                        if (s_variableContent.type.kind) {
                                            subFormsContent.kind = s_variableContent.type.kind;
                                        }
                                        var _formdata = formDataList.length > 0 && formDataList[_subFormIndex][_fields[s_idex].tableFieldName] ? formDataList[_subFormIndex][_fields[s_idex].tableFieldName] : "";
                                        if ('select' === s_type && '[]' === _formdata) {
                                            _formdata = '';
                                        }
                                        subFormsContent.name = s_name;
                                        subFormsContent.type = s_type;
                                        subFormsContent.content = _formdata;
                                        subFormsJson.item.push(subFormsContent);
                                    }
                                    subFormsList.push(subFormsJson);
                                }
                            }
                        setTimeout(function(){
                            _this.pageview.refs.result_text.$el.show();
                            var viewpager = _this.pageview.refs.top_view.components.viewpager;
                            if (viewpager.curPageViewItem.contentInstance.refs.detail_repeat) {
                                viewpager.curPageViewItem.contentInstance.refs.detail_repeat.bindData(jsonList); 
                            }
                            if (viewpager.curPageViewItem.contentInstance.refs.subform_repeat) {
                                viewpager.curPageViewItem.contentInstance.refs.subform_repeat.bindData(subFormsList);
                            }
                            // 处理流程
                            var historicTasks=data.inst.historicTasks;
                            _this.processInstances=[];
                            _this.startParticipant={};
                            data.inst.historicActivityInstances.forEach(function(item){
                                if(item.activityType==='startEvent'){
                                    _this.startParticipant=item;
                                }
                            });
                            
                            for(var i=0;i<historicTasks.length;i++){
                                var itemData=historicTasks[i];
                                var activityType='handling';
                                if(itemData.endTime||data.inst.deleteReason){
                                    activityType="solved";
                                    _this.processInstances.unshift({
                                        activityType:activityType,
                                        taskId:itemData.taskComments&&itemData.taskComments[0]?itemData.taskComments[0].taskId:itemData.taskId,
                                        assignee:itemData.assignee,
                                        currentUserId:'',
                                        deleteReason:itemData.deleteReason,
                                        endTime:itemData.endTime,
                                        taskAuditDesc:itemData.deleteReason,
                                        taskComments:itemData.taskComments&&itemData.taskComments[0]?decodeURIComponent(itemData.taskComments[0].message):'',
                                        userName:itemData.userName,
                                    });
                                }else{
                                    if(_this.taskId===itemData.id){
                                        _this.currentToDoTask={
                                            activityType:activityType,
                                            taskId:itemData.id,
                                            assignee:itemData.assignee,
                                            currentUserId:'',
                                            deleteReason:itemData.deleteReason,
                                            endTime:itemData.endTime,
                                            taskAuditDesc:itemData.deleteReason,
                                            taskComments:itemData.taskComments,
                                            userName:itemData.userName,
                                        }; 
                                    }else{
                                        var currentToDoTaskSibling={
                                            activityType:activityType,
                                            taskId:itemData.id,
                                            assignee:itemData.assignee,
                                            currentUserId:'',
                                            deleteReason:itemData.deleteReason,
                                            endTime:itemData.endTime,
                                            taskAuditDesc:itemData.deleteReason,
                                            taskComments:itemData.taskComments,
                                            userName:itemData.userName,
                                        };
                                        _this.processInstances.unshift(currentToDoTaskSibling);
                                    }
                                       
                                }     
                            }
                            _this.processInstances.sort(function(a,b){
                                var aValue=utils.convertStrToDate(a.endTime).getTime();
                                var bValue=utils.convertStrToDate(b.endTime).getTime();
                                return -(aValue-bValue);
                            });
                            _this.processInstances.push({
                                activityType:_this.startParticipant.activityType,
                                taskId:_this.startParticipant.taskId,
                                assignee:_this.startParticipant.assignee,
                                currentUserId:'',
                                deleteReason:_this.startParticipant.deleteReason,
                                endTime:_this.startParticipant.endTime,
                                taskAuditDesc:_this.startParticipant.deleteReason,
                                taskComments:_this.startParticipant.taskComments,
                                userName:_this.startParticipant.userName,
                            });
                            _this.processInstances.unshift(_this.currentToDoTask);
                            var userName=this.startParticipant.userName||'';
                            _this.pageview.delegate('userinfo_name', function (target) {
                                var name=_userName+'的'+_this.instName;           
                                target.setText(name);
                            });
                            if(_this.currentToDoTask&&_this.taskId===_this.currentToDoTask.taskId&&(!data.inst.endTime&&!data.inst.deleteReason)){
                                _this.item.push({label:'批准',id:'',type:'agree'});
                                _this.item.push({label:'驳回',id:'',type:'reject'});
                                _this.pageview.refs.bottomToolBar.$el.show();
                                _this.initBtn();
                            }else{
                                _this.item.push({label:'收回',id:'',type:'back'});
                                _this.pageview.refs.bottomToolBar.$el.show();
                                _this.initBtn();
                            }
                           

                            if(data.inst.endTime||data.inst.deleteReason){
                                _this.pageview.refs.result_text.innerText.html('已完成');
                                _this.pageview.refs.result_text.innerText.css('color','blue');
                            }else{
                                _this.pageview.refs.result_text.innerText.css('color','#e7a757');
                                _this.pageview.refs.result_text.innerText.html('审批中');
                            }
                            _this.pageview.hideLoading(true);
                        },200);
                    },
                    error: function (listData) {
                        _this.pageview.showTip({text: listData.msg, duration: 2000});
                    }
                };

            this.pageview.ajax(listAjaxConfig);
        },
        //显示按钮
        initBtn: function () {
            if (this.item.length > 4) {
                var btnItem = [];
                var moreItem = [];
                for (var itemIdx = 0; itemIdx < this.item.length; itemIdx++) {
                    if (itemIdx >= 3) {
                        moreItem.push(this.item[itemIdx]);
                    } else {
                        btnItem.push(this.item[itemIdx]);
                    }
                }
                if (btnItem.length === 0) {
                    this.pageview.refs.buttonGroup.$el.hide();
                    this.pageview.refs.buttonGroup.$el.css({"background-color": "rgb(247, 247, 247)"});
                    this.pageview.refs.buttonGroup.$el.css({"border-top": "1px solid #eee"});
                } else {
                    this.pageview.refs.buttonGroup.$el.show();
                    this.pageview.refs.buttonGroup.$el.css({"border-top": "1px solid #eee"});
                    this.pageview.refs.bottomToolBar.$el.css({"background-color": "rgb(255, 255, 255)"});
                    this.pageview.refs.buttonGroup.$el.css({"background-color": "rgb(255, 255, 255)"});
                }
                this.pageview.refs.moreRepeat.bindData(moreItem);
                this.pageview.refs.buttonGroup.bindData(btnItem);

                this.pageview.refs.bottomToolBar.$el.show();
                this.pageview.refs.splitline.$el.show();
                this.pageview.refs.moreBtn.$el.show();
            } else {
                if (this.item.length === 0) {
                    this.pageview.refs.bottomToolBar.$el.hide();
                    this.pageview.refs.buttonGroup.$el.css({"background-color": "rgb(247, 247, 247)"});
                    this.pageview.refs.buttonGroup.$el.css({"border-top": "rgb(247, 247, 247)"});

                } else {
                    this.pageview.refs.bottomToolBar.$el.show();
                    this.pageview.refs.buttonGroup.$el.css({"background-color": "rgb(255, 255, 255)"});
                    this.pageview.refs.bottomToolBar.$el.css({"background-color": "rgb(255, 255, 255)"});
                }
                this.pageview.refs.buttonGroup.bindData(this.item);
                this.pageview.refs.splitline.$el.hide();
                this.pageview.refs.moreBtn.$el.hide();
            }
        },
        viewpager_init: function (sender, params) {
            this.viewpager = sender;
        },
        result_logo_init:function (sender,params) {
            sender.config.defaultSrc=language.iconUrl.agreee;
        },
        userinfo_name_init: function (sender, params) {
            sender.config.text=language.formTips.onLoading;
        },

        segment_init:function (sender,params) {
            sender.config.items=[{'title':language.formTips.formDetail},{'title':language.formTips.processDetail},{'title':language.formTips.attachment}];
        },
        
        segment_change: function (sender, params) {
            var _this = this;
            if (!params.nochange) {
                var item = params.item;
                var itemData = item.datasource;
                var itemTitle = $.trim(itemData.title);
                if (itemTitle === "详情"||itemTitle === "Form") {
                    this.viewpager.showItem("detailContent_detail", {type: "content"});
                } else if (itemTitle === "流程"||itemTitle === "Process") {
                    this.viewpager.showItem("detailProcess_detail", {type: "process", parentThis: this});
                    if(_this.processInstances){   
                        window.setTimeout(function () {
                            _this.viewpager.curPageViewItem.contentInstance.refs.middle_flow_repeat.bindData(_this.processInstances);   
                        }, 200);
                    }                
                } else{
                    this.viewpager.showItem("detailAttachment_detail", {type: "attachment", parent: this});
                }
            }
        },
  
        morePopover_init: function (sender, params) {
            this.morePopver = sender;
        },
        moreBtn_click: function (sender, params) {
            this.morePopver.show(sender);
        },
        moreRepeat_itemclick: function (sender, params) {
            this.buttonGroupClick(sender);
            this.morePopver.hide();
        },
        buttonGroup_itemclick: function (sender, params) {
            this.buttonGroupClick(sender);
        },
        // 显示出来的和pop隐藏的按钮公用点击
        buttonGroupClick: function (sender) {
            var paras={
                action:sender.datasource.type,
                taskId: this.pageview.params.taskId || '',
                billId:this.pageview.params.billId||'',
                billtype:this.pageview.params.billtype||this.pageview.params.pk_billtype||'',
                userid:this.pageview.params.userid||'',
                groupid:this.pageview.params.groupid||'0001V610000000000EEN'
            };
            // 指派检查
            if(sender.datasource.type==='reject'){
                this.pageview.go("deal", paras);
            }else if(sender.datasource.type==='back'){
                this.goWithDrawApprove(paras);
            }else if(sender.datasource.type==='agree'){
                this.AgreeAndAssign(paras);
            }
           
        },
        goWithDrawApprove: function(para){
            var _this=this;
            this.delegateDialog = new Dialog({
                mode: 3,
                wrapper: this.pageview.$el,
                contentText: language.formTips.confirmBack,
                btnDirection: "row",
                buttons: [{
                    title: language.formAction.cancel,
                    style: {
                        height: 45,
                        fontSize: 16,
                        color: '#111',
                        borderRight: '1px solid #eee'
                    },
                    onClick: function () {
                        _this.delegateDialog.hide();
                    }
                }, {
                    title:  language.formAction.confirm,
                    style: {
                        height: 45,
                        fontSize: 16,
                        color: "#37b7fd",
                    },
                    onClick: function () {
                        _this.delegateDialog.hide();
                        _this.pageview.showLoading({text: language.formTips.onLoading, timeout: 8000});
                        _this.pageview.ajax({
                            url: '/process/audit',
                            data: para,
                            type: 'GET',
                            success: function (data) {
                                _this.pageview.hideLoading(true);
                                if (data.flag === '0') {
                                    _this.pageview.showTip({text: '收回成功！', duration: 2000});
                                    setTimeout(function () {
                                        _this.pageview.goBack(-1);
                                    }, 2000);
                                } else {
                                    _this.pageview.showTip({text: '收回失败', duration: 2000});
                                }
                            },
                            error: function (data) {
                                
                            }
                        });
                    }
                }]
            });
            this.delegateDialog.show();
            
        },
        AgreeAndAssign: function (_para) {
            var _this = this,
                para = _para,url='/process/assignCheck';

            this.pageview.showLoading({text: language.formTips.onLoading, timeout: 8000});
            this.pageview.ajax({
                url: url,
                data: para,
                type: 'GET',
                success: function (data) {
                    _this.pageview.hideLoading(true);
                    if (data.flag === '0') {
                        if(JSON.parse(data.data).psnstructlist&&JSON.parse(data.data).psnstructlist.length!=0){
                            _this.pageview.showTip({text: '下一步为指派环节', duration: 2000});
                        }else{
                            _this.pageview.go("deal", para);
                        }
                    } else {
                        // _this.pageview.go("deal", para);
                        _this.pageview.showTip({text: data.desc, duration: 2000});   
                    }
                },
                error: function (data) {
                    
                }
            });
        },
    };
    return PageLogic;
});
