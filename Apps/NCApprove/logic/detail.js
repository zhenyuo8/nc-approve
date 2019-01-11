
define(["../parts/common", "utils", "../libs/plupload/form-file-uploader", "../parts/analysis",  "../parts/language"], function (c, utils, FileUploader, analysis,language) {

    function PageLogic(config) {
        var _this = this;
        this.item = [];
        this.pageview = config.pageview;
        this.state=this.pageview.params.state;
        this.fileMaxNum = 50; // 附件默认最大数量
        this.fileNum = 0; // 附件现有数量
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
                        try{
                            data=JSON.parse(listData.data);
                        }catch(e){
                            data=listData.data;
                        }
                        setTimeout(function(){
                            _this.instName = data[0].billtypename;                      
                            _this.pageview.refs.result_text.$el.show();
                            
                            var viewpager = _this.pageview.refs.top_view.components.viewpager;
                            jsonList = analysis.getAnalysis_ifroms(data);
                            viewpager.curPageViewItem.contentInstance.refs.detail_repeat.bindData(jsonList);
                            
                            _this.loadProcessData();
                            _this.pageview.hideLoading(true);
                        },500);
                    },
                    error: function (listData) {
                        _this.pageview.showTip({text: listData.msg, duration: 2000});
                    }
                };

            this.pageview.ajax(listAjaxConfig);
        },
        loadProcessData: function () {
            var _this=this;
            var listAjaxConfig = {
                    url: '/process/getApprove',
                    type: 'GET',
                    data: {
                        taskId: this.pageview.params.taskId || '',
                        billId:this.pageview.params.billId||'',
                        billtype:this.pageview.params.billtype||this.pageview.params.pk_billtype||'',
                        userid:this.pageview.params.userid||'',
                        groupid:this.pageview.params.groupid||'0001V610000000000EEN'
                    },
                    success: function (listData) {
                        try{
                            _this.processInstances=_this.processInstancesHistory(JSON.parse(listData.data));    
                        }catch(e){
                            _this.processInstances=_this.processInstancesHistory(listData.data);
                        }
                    },
                    error: function (listData) {
                        _this.pageview.showTip({text: listData, duration: 2000});
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
                    window.setTimeout(function () {
                        _this.viewpager.curPageViewItem.contentInstance.refs.flow_repeat.bindData(_this.attachemntList);   
                    }, 200);
                }
            }
        },
        processInstancesHistory:function (processInstances){
            var arr=[];
            var _this=this;
             if(processInstances&&processInstances instanceof Array&&processInstances[0]){
                var list=processInstances[0].approvehistorylinelist[0].flowhistory;
                var startUser=processInstances[0].approvehistorylinelist[0].flowhistory;
                var timeList=processInstances[0].approvehistorylinelist[0].approvehistorylinelist;

                for(var i=0;i<list.length;i++){
                    if(list[i].unittype!=='submit'){
                        if(list[i].unittype==="solved"){
                            arr.push({
                                activityType:list[i].unittype,
                                assignee:'',
                                deleteReason:'',
                                dueDate:'',
                                endTime:list[i].handledate||'',
                                memberId:list[i].personlist[0].id,
                                name:'',
                                processDefinitionId:'',
                                taskAuditDesc:list[i].actionname||'同意',
                                taskComments:list[i].advice||'批准',
                                taskId:'',
                                userName:list[i].personlist[0].name||'',
                                currentUserId:'',
                            });
                        }else{
                            this.currentTodoTask=list[i];
                            arr.unshift({
                                activityType:list[i].unittype,
                                assignee:'',
                                deleteReason:'',
                                dueDate:'',
                                endTime:list[i].handledate||'',
                                memberId:list[i].personlist[0].id,
                                name:'',
                                processDefinitionId:'',
                                taskAuditDesc:list[i].actionname||'',
                                taskComments:list[i].advice||'',
                                taskId:'',
                                userName:list[i].personlist[0].name||'',
                                currentUserId:'',
                            });
                            
                        }
                    }else{
                        this.billMaker=list[i];
                    } 
                }
                // 处理handledate
                if(!this.attachemntList){
                    this.attachemntList=[];
                }
                
                if(timeList&&timeList instanceof Array){
                    timeList.forEach(function(item,index){       
                        if(item.attachstructlist&&item.attachstructlist.length!==0){
                            item.attachstructlist.forEach(function(i,j){
                                var typeArr=i.filename.split('.');

                                _this.attachemntList.push({
                                    name:i.filename,
                                    filesize:i.filesize,
                                    fileid:i.fileid,
                                    aliOSSUrl:'',
                                    type:typeArr[typeArr.length-1],
                                    time:'',
                                    author:''
                                });
                            });     
                        }
                        arr.forEach(function(its,ind){
                            if(item.handlername==its.userName){
                                its.endTime=item.handledate;
                            }
                        });
                    });
                }
                arr.sort(function(a,b){
                    return new Date(b.endTime).getTime()-new Date(a.endTime).getTime();
                });
                if(startUser){
                    startUser.forEach(function(item,index){
                        if(item.unittype==="submit"){
                            arr.push({
                                activityType:'startEvent',
                                assignee:'',
                                deleteReason:'',
                                dueDate:'',
                                endTime:item.time,
                                startTime:item.time,
                                memberId:'',
                                name:'',
                                processDefinitionId:'',
                                taskAuditDesc:'',
                                taskComments:item.action,
                                taskId:'',
                                userName:item.personlist[0].name,
                                currentUserId:''
                            });
                        }
                    });
                }
                
                if(this.billMaker){
                    _this.pageview.delegate('userinfo_name', function (target) {
                        var name=_this.billMaker.personlist[0].name+'的' +_this.instName;           
                        target.setText(name);
                    }); 
                }
                _this.item.push({label:'同意',id:'',type:'agree'});
                _this.item.push({label:'驳回',id:'',type:'reject'});
                if(_this.state!==1&&_this.state!=='1'){
                    _this.initBtn();
                }    
            }

            // 表单状态是否审批完成
            var isFinished=arr.some(function(itee,innd){
                return itee.activityType==='final';
            });
            if(isFinished){
                this.pageview.refs.result_text.innerText.html('已完成');
                _this.pageview.refs.result_text.innerText.css('color','blue');
            }else{
                _this.pageview.refs.result_text.innerText.css('color','#e7a757');
                this.pageview.refs.result_text.innerText.html('审批中');
            }
            
            
            return arr;
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
            }else{
                this.AgreeAndAssign(paras);
            }
           
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
                        _this.pageview.go("deal", para);
                        // _this.pageview.showTip({text: data.desc, duration: 2000});   
                    }
                },
                error: function (data) {
                    
                }
            });
        },
        
        //文件上传控件
        initUploader: function (sender) {
            var _this = this;
            this.loadToken(function (token) {
                _this.token = token;
            });

            var picker = sender.$el;
            var container = $('.flow_repeat');
            var fileLimit = this.fileMaxNum;
            if (!this.fileUploader) {
                this.fileUploader = new FileUploader(this.pageview, this);
                this.uploaderId = this.fileUploader.initUploader(picker, container, this.pageview.params.taskId, fileLimit);
                setTimeout(function () {
                    _this.fileUploader.updateUploaderSize();
                }, 100);
            }
        },
        loadFilesData: function () {
            this.viewpager.curPageViewItem.contentInstance.pageview.plugin._loadData();
        },
        loadToken: function (callbackFunc) {
            this.pageview.ajax({
                url: "user/getToken",
                success: function (token) {
                    callbackFunc(token);
                },
                error: function (token) {
                    console.error(token);
                }
            });
        },
    };
    return PageLogic;
});
