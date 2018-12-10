/**
 *"待审批","我发起的"和"抄送给我的"通用页面 (type分别为"waitmeapprove","myapprove"和"copyapprove")
 */
define(["../parts/common", "utils", '../parts/language',"../../../components/dialog",], function (c, utils, language,Dialog) {


    function pageLogic(config) {
        this.pageview = config.pageview;
        var type = this.pageview.params.type;
        this.fullPageKey = this.pageview.config.fullPageKey;
        this.listDataSource = [];
        this.searchValue = false;
        this.searchValue1 = false;
        this.searchKey = true;
        this.batchPostData=[];
        if (this.fullPageKey === "commonlist_waitmyapprove") {
            this.searchKey = false;
        } else if (this.fullPageKey === 'commonlist_waitmyapprovedone') {
            this.searchKey = true;
        }
        if (type === "myapprove") {
            window.needRefresMyApproveListData = false;
            // this.fullPageKey = "commonlist_myapprove";// or commonlist_waitmyapprovedone commonlist_waitmyapprove
        } else if (type === 'copyapprove') {
            window.needRefresCopyApproveListData = false;
            this.fullPageKey = "commonlist_copyapprove";
            // this.fullPageKey = "commonlist_copyapprove";// or commonlist_waitmyapprovedone commonlist_waitmyapprove
        }
        window.localStorage.removeItem("ADD_SIGN_BEHIND");
        window.localStorage.removeItem("copyUserParticipants");
        window.localStorage.removeItem("freeFlowActivityInfos");
        this.setHeader();
    }

    pageLogic.prototype = {
        body_init: function (sender) {
            this.body = sender;
        },
        setHeader: function () {
           
        },
        searchBtn_click: function (sender, params) {
            this.pageview.refs.leftview.$el.hide();
            this.pageview.refs.searchInput.$el.show();
            this.pageview.refs.searchInput._focus();
            this.pageview.refs.approveSelector.hideDropDown();
        },
        buttonGroup_init:function (sender, params) {
            if(this.fullPageKey==="commonlist_waitmyapprove"){
                sender.config.style.display = "inherit";
            }
        },
        confirm_init:function (sender, params) {
            sender.config.text=language.formAction.batchConsent;
        },
        row_check_init:function (sender,params) {
            window.localStorage.removeItem('BATCHFAILURENUM');
            if(this.approveBatch){
                sender.config.style.display='inherit';
                sender.$el.show();
            }
        },
        approveMore_init:function (sender,params) {
            sender.config.text=language.formAction.batchOperation;
        },
        selectAllText_init:function (sender,params) {
            sender.config.text=language.formAction.selectAll;
        },
        cancel_init:function (sender,params) {
            sender.config.text=language.cancel;
        },
        approveMore_click:function (sender, params) {
            window.localStorage.removeItem('BATCHFAILURENUM');
            sender.$el.hide();
            this.approveBatch=true;
            this.pageview.refs.cancel.$el.show();
            this.pageview.refs.selectAll.$el.show();
            this.pageview.refs.confirm.$el.show();
            this.pageview.$el.find('.yy-checkbox-list').forEach(function (item,index) {
                $(item).show();
            });
        },
        selectAll_click:function (sender, params) {
            this.batchPostData=[];
            window.localStorage.removeItem('BATCHFAILURENUM');
            var _this=this;
            if(this.pageview.refs.selectAllIcon.$el.hasClass('yy-checkbox-all-selected')){
                this.pageview.$el.find('.yy-checkbox-list').forEach(function (item,index) {
                    $(item).removeClass('yy-checkbox-list-selected');
                });
                _this.batchPostData=[];
                this.pageview.refs.selectAllIcon.$el.removeClass('yy-checkbox-all-selected');
            }else{
                this.pageview.$el.find('.yy-checkbox-list').forEach(function (item,index) {
                    $(item).addClass('yy-checkbox-list-selected');
                });
                var rows=this.listviewSender.rows;
                rows.forEach(function (item,index) {
                    var batchObject={};
                    batchObject.instId=item.datasource.processInstance.id;
                    batchObject.taskId=item.datasource.id;
                    batchObject.businessKey=item.datasource.processInstance.businessKey;
                    _this.batchPostData.push(batchObject);
                });
                this.pageview.refs.selectAllIcon.$el.addClass('yy-checkbox-all-selected');
            }
        },
        cancel_click:function (sender, params) {
            sender.$el.hide();
            this.approveBatch=false;
            this.pageview.refs.confirm.$el.hide();
            this.pageview.refs.selectAll.$el.hide();
            this.pageview.refs.approveMore.$el.show();
            window.localStorage.removeItem('BATCHFAILURENUM');
            this.batchPostData=[];
            this.pageview.refs.selectAllIcon.$el.removeClass('yy-checkbox-all-selected');
            this.pageview.$el.find('.yy-checkbox-list').forEach(function (item,index) {
                $(item).hide();
                $(item).removeClass('yy-checkbox-list-selected');
            });
        },
        loadNum: function () {
            var _this = this;
            this.pageview.ajax({
                type: "GET",
                url: "/process/myDataCount",
                data: {},
                success: function (data) {
                    if (data.code === 0) {
                        if (data.data.todo !== undefined && data.data.todo !== null) {
                            if(_this.pageview.pageManager.pages.waitmeapprove.plugin.waitmeapproveLabel){
                                _this.pageview.pageManager.pages.waitmeapprove.plugin.waitmeapproveLabel.setText(language.tasksToProcess+"(" +  data.data.todo + ")");
                            }
                        }
                    }
                },
                error: function (e) {

                }
            });
        },
        confirm_click:function (sender, params) {
            var _this=this,batchPostDataLength;
            if(this.batchPostData.length===0){
                _this.pageview.showTip({text: language.formTips.selectApproveItem, duration: 2000});
                return;
            }
            batchPostDataLength=_this.batchPostData.length;
            var contentText=language.componentTitle.selected+batchPostDataLength+language.formTips.makesureToBatchApproval;
            if(batchPostDataLength>20){
                contentText=language.formTips.batchApprovalMore;
            }

            _this.batchApproveDialog = new Dialog({
                mode: 3,
                wrapper: _this.pageview.$el,
                contentText: contentText,
                btnDirection: "row",
                buttons: [{
                    title: language.cancel,
                    style: {
                        height: 45,
                        fontSize: 16,
                        color: c.titleColor,
                        borderRight: '1px solid #eee'
                    },
                    onClick: function () {
                        _this.batchApproveDialog.hide();
                    }
                }, {
                    title: language.confirm,
                    style: {
                        height: 45,
                        fontSize: 16,
                        color: "#37b7fd",
                    },
                    onClick: function () {
                        _this.batchApproveDialog.hide();
                        _this.pageview.showLoading({text: language.formTips.delete, timeout: 3000});
                        _this.doBatchApprove();
                    }
                }]
            });
            _this.batchApproveDialog.show();

        },
        doBatchApprove:function () {
            var _this=this;
            var batchPostData=_this.batchPostData;
            if(batchPostData.length>20){
                batchPostData=batchPostData.splice(0,20);
            }
            this.pageview.showLoading({text: language.formTips.onLoading, timeout: 8000});
            this.pageview.ajax({
                url: "/process/batchAudit",
                type: "POST",
                timeout:20000,
                data: {
                    tasksInfo:JSON.stringify(batchPostData),
                    comment:''
                },
                success: function (data) {
                    _this.pageview.hideLoading(true);
                    if (data.success) {
                        var dataList=data.data;
                        var successNum=[],failureNum=[];
                        dataList.forEach(function (item,index) {
                            if(!item.exceptionReason){
                                successNum.push(item.taskId);
                            }else{
                                failureNum.push(item);
                            }
                        });
                        if(failureNum.length!==0){
                            window.localStorage.setItem('BATCHFAILURENUM',JSON.stringify(failureNum));
                        }
                        _this.batchPostData=[];
                        _this.pageview.refs.selectAllIcon.$el.removeClass('yy-checkbox-all-selected');
                        _this.pageview.refs.listview.ajaxConfig.data.start = 0;
                        _this.pageview.refs.listview.ajaxConfig.data.pageNum = 1;
                        _this.pageview.refs.listview.setAjaxConfigParams();
                        _this.pageview.refs.listview.loadFirstPageData();
                        _this.pageview.showTip({text: language.formTips.batchSuccess+successNum.length+language.formTips.batchFail+failureNum.length, duration: 3000});
                        _this.loadNum();
                    } else {
                        _this.batchPostData=[];
                        _this.pageview.refs.selectAllIcon.$el.removeClass('yy-checkbox-all-selected');
                        _this.pageview.showTip({text: data.msg, duration: 2000});
                    }

                },
                error: function () {
                    _this.batchPostData=[];
                    _this.pageview.refs.selectAllIcon.$el.removeClass('yy-checkbox-all-selected');
                    _this.pageview.refs.listview.ajaxConfig.data.start = 0;
                    _this.pageview.refs.listview.ajaxConfig.data.pageNum = 1;
                    _this.pageview.refs.listview.setAjaxConfigParams();
                    _this.pageview.refs.listview.loadFirstPageData();
                    _this.loadNum();
                    _this.pageview.showTip({text: language.formTips.serverRequestError, duration: 1000});
                }
            });
        },
        searchview_init: function (sender, params) {
            sender.config.style.display = "none";
        },
        nodata_init:function (sender,params) {
            sender.config.text=language.noContent;
        },
        searchInput1_init: function (sender, params) {
            if (!this.searchKey) {
                sender.config.style.display = "none";
            } else {
                sender.config.style.display = "show";
            }
        },
        searchInput1_cancel: function (sender, params) {
            var value = params.value;

            if (value || this.searchValue1) {
                this.searchValue1 = false;
                sender.input.val('');

                this.listviewSender.config.ajaxConfig.data.keyword = '';
                this.pageview.refs.listview.loadFirstPageData({parentAnimate: true});
            }
        },
        searchInput_cancel: function (sender, params) {
            var value = params.value;
            if (value || this.searchValue) {
                this.searchValue = false;
                sender.input.val('');

                this.listviewSender.config.ajaxConfig.data.keyword = '';
                this.pageview.refs.listview.loadFirstPageData({parentAnimate: true});
            }
            this.pageview.refs.leftview.$el.show();
            this.pageview.refs.searchInput.$el.hide();
        },
        approveSelector_menu1_loaddata: function (sender, params) {
            var successCallback = params.success;
            var errorCallback = params.error;
            var _this = this;
            var data = [
                {"name": "全部时间", "id": "taskTime_all", "group": "taskTime"},
                {"name": "今天", "id": "taskTime_today", "group": "taskTime"},
                {"name": "昨天", "id": "taskTime_yesterday", "group": "taskTime"},
                {"name": "两天前", "id": "taskTime_2more", "group": "taskTime"}
            ];
            successCallback(data);
        },

        approveSelector_menu0_loaddata: function (sender, params) {
            var successCallback = params.success;
            var errorCallback = params.error;
            var _this = this;
            var data = [
                {"name": "全部状态", "id": "dueDate_all", "group": "dueDate"},
                {"name": "正常", "id": "dueDate_normal", "group": "dueDate"},
                {"name": "逾期", "id": "dueDate_overdue", "group": "dueDate"}
            ];
            successCallback(data);
        },


        approveSelector_menu2_loaddata: function (sender, params) {
            var successCallback = params.success;
            var errorCallback = params.error;
            var _this = this;
            window.setTimeout(function () {
                //process/category
                var ajaxConfig = {
                    url: '/process/category',
                    type: 'POST',
                    data: {},
                    success: function (listData) {
                        var _listdata = [{"name": "全部类型", "id": "", "group": "type"}];
                        for (var idx = 0; idx < listData.data.length; idx++) {
                            var data = {"name": listData.data[idx].name, "id": listData.data[idx].id, "group": "type"};
                            _listdata.push(data);
                        }
                        successCallback(_listdata);
                    },
                    error: function (err) {

                    }
                };
                _this.pageview.ajax(ajaxConfig);
            });
        },
        approveSelector_menu0_itemClick: function (sender, params) {
            sender.rootInstance.hideDropDown();
            this.listviewSender.config.ajaxConfig.data.taskDue = sender.curSelectedItem.data.id;
            this.pageview.refs.listview.loadFirstPageData({parentAnimate: true});
        },
        approveSelector_menu1_itemClick: function (sender, params) {
            sender.rootInstance.hideDropDown();
            this.listviewSender.config.ajaxConfig.data.taskDate = sender.curSelectedItem.data.id;
            this.pageview.refs.listview.loadFirstPageData({parentAnimate: true});
        },
        approveSelector_menu2_itemClick: function (sender, params) {
            sender.rootInstance.hideDropDown();
            this.listviewSender.config.ajaxConfig.data.categoryIds = sender.curSelectedItem.data.id;
            this.pageview.refs.listview.loadFirstPageData({parentAnimate: true});
        },

        searchInput_search: function (sender, params) {
            if (params.value) {
                this.searchValue = true;
            }

            this.pageview.refs.listview.ajaxConfig.data.start = 0;
            this.pageview.refs.listview.ajaxConfig.data.pageNum = 1;
            this.listviewSender.config.ajaxConfig.data.categoryIds = null;
            this.listviewSender.config.ajaxConfig.data.keyword = params.value;
            this.pageview.refs.listview.loadFirstPageData({parentAnimate: true});
        },
        searchInput1_search: function (sender, params) {
            if (params.value) {
                this.searchValue1 = true;
            }
            this.pageview.refs.listview.ajaxConfig.data.start = 0;
            this.pageview.refs.listview.ajaxConfig.data.pageNum = 1;
            this.listviewSender.config.ajaxConfig.data.categoryIds = null;
            this.listviewSender.config.ajaxConfig.data.keyword = params.value;
            this.pageview.refs.listview.loadFirstPageData({parentAnimate: true});
        },
        onPageResume: function () {

            this.pageview.refs.listview.ajaxConfig.data.start = 0;
            this.pageview.refs.listview.ajaxConfig.data.pageNum = 1;
            if (this.fullPageKey === "commonlist_myapproverunning") {
                if (window.needRefresMyApproveListData === true) {
                    window.needRefresMyApproveListData = false;
                    this.pageview.refs.listview.loadFirstPageData({parentAnimate: true});
                }
            }

            if (this.fullPageKey === "commonlist_copyapprove") {
                if (window.needRefresCopyApproveListData === true) {
                    window.needRefresCopyApproveListData = false;
                    this.pageview.refs.listview.loadFirstPageData({parentAnimate: true});
                }
            }
            this.setHeader();
        },

        body_pulltorefresh: function (sender, params) {
            window.localStorage.removeItem('BATCHFAILURENUM');
            this.pageview.refs.listview.ajaxConfig.data.start = 0;
            this.pageview.refs.listview.ajaxConfig.data.pageNum = 1;

            this.pageview.refs.listview.setAjaxConfigParams();
            this.pageview.refs.listview.loadFirstPageData();
        },
        body_reload: function (sender) {
            this.pageview.refs.listview.reload();
        },
        body_loadmore: function (sender, params) {
            var size = this.pageview.refs.listview.ajaxConfig.data.size;
            var start = this.pageview.refs.listview.ajaxConfig.data.start;
            var count = size + start;
            this.pageview.refs.listview.ajaxConfig.data.start = count;
            this.pageview.refs.listview.ajaxConfig.data.pageNum++;

            this.pageview.refs.listview.setAjaxConfigParams();
            this.pageview.refs.listview.loadNextPageData();
        },
        listview_rowclick: function (sender, params) {
            var _this = this, id, regUrl = /\#(\w+)?/ig;
            var instId, formDataName, taskId, copyToId = "";
            var batchObject={};
            if(this.approveBatch){
                if(sender.$el.find('.yy-checkbox-list').hasClass('yy-checkbox-list-selected')){
                    sender.$el.find('.yy-checkbox-list').removeClass('yy-checkbox-list-selected');
                    this.batchPostData=this.batchPostData.filter(function (item,index) {
                        return item.businessKey!==sender.datasource.processInstance.businessKey;
                    });
                }else {
                    sender.$el.find('.yy-checkbox-list').addClass('yy-checkbox-list-selected');
                    batchObject.instId=sender.datasource.processInstance.id;
                    batchObject.taskId=sender.datasource.id;
                    batchObject.businessKey=sender.datasource.processInstance.businessKey;
                    this.batchPostData.push(batchObject);
                }
            }else{
                var _category = sender.datasource.category;// 加入分类 xingjjc 2017-3-31
                var url = window.location.href.split('/index.html')[1], curUrl;//判断是从代办还是我发起进入详情页的来控制“同意”“抄送”等操作按钮
                url.replace(regUrl, function ($1, $2) {
                    curUrl = $1;
                });
                window.localStorage.removeItem("copyUserParticipants");
                // 缓存数据
                window.nowFormData = sender.datasource;

                if (this.fullPageKey === "commonlist_myapproverunning" || this.fullPageKey === "commonlist_myapprovedone") {
                    instId = sender.datasource.inst.id;
                    formDataName = sender.datasource.inst.name;

                    taskId = sender.datasource.inst.id;
                } else if (this.fullPageKey === "commonlist_copyapprove") {
                    instId = sender.datasource.procssInstId;
                    formDataName = sender.datasource.title;
                    taskId = sender.datasource.taskId;
                    copyToId = sender.datasource.id;

                } else {

                    if (sender.datasource.processInstance === undefined) {
                        instId = sender.datasource.historicProcessInstance.id;
                        formDataName = sender.datasource.historicProcessInstance.name;
                        taskId = sender.datasource.id;
                    } else {
                        instId = sender.datasource.processInstance.id;
                        formDataName = sender.datasource.processInstance.name;
                        taskId = sender.datasource.id;

                    }
                }
                if (formDataName.indexOf("的") > -1 && formDataName.indexOf("的") < formDataName.length) {
                    formDataName = formDataName.substring((formDataName.indexOf("的") + 1), formDataName.length);
                }

                if(sender.datasource&&sender.datasource.isFromEsnDocument){
                    this.pageview.go("detail", {
                        taskId: taskId,
                        instId: instId,
                        copyToId: copyToId,
                        curPage: curUrl.slice(1),
                        // tempSaveId:
                        formDataName: encodeURI(formDataName),
                        isFromEsnDocument:true,

                        category: _category === 'nc' ? 'nc' : 'bpm'
                    });
                }else{
                    this.pageview.go("detail", {
                        taskId: taskId,
                        instId: instId,
                        copyToId: copyToId,
                        curPage: curUrl.slice(1),
                        // tempSaveId:
                        formDataName: encodeURI(formDataName),

                        category: _category === 'nc' ? 'nc' : 'bpm'
                    });
                }
            }


        },
        listview_parsedata: function (sender, params) {
            var data = params.data;
            if (data.code !== 0) {
                return false;
            }
            if (!data.data) {
                data.data = {
                    list: []
                };
            }
            if(window.localStorage.getItem('BATCHFAILURENUM')){
                var batchFail=JSON.parse(window.localStorage.getItem('BATCHFAILURENUM'));
                for(var i=0;i<data.data.list.length;i++){
                    var listIndex=i;
                    for(var j=0;j<batchFail.length;j++){
                        if(batchFail[j].taskId===data.data.list[listIndex].id){
                            data.data.list[listIndex].isBatchApprove=batchFail[j].exceptionReason;
                        }
                    }
                }
            }
            return data.data.list;
        },
        listview_init: function (sender) {
            var url = '';
            sender.config.style.marginTop = 0;
            switch (this.fullPageKey) {
                case 'commonlist_waitmyapprove':
                    url += '/process/listTodo';
                    //process/listTodo
                    sender.config.style.marginTop = 5;
                    break;
                case 'commonlist_waitmyapprovedone':
                    url += '/process/listDone';
                    sender.config.style.marginTop = 5;
                    break;
                case 'commonlist_myapproverunning'://我发起的进行中?withState=true&finished=false
                    url = '/process/listHistory';
                    break;
                case 'commonlist_myapprovedone'://我发起的已完成
                    url = '/process/listHistory?withState=true&finished=true';
                    break;
                case 'commonlist_copyapprove':
                    url = '/process/listCopy';
                    break;
                default:
                    url = '/process/listTodo';
                    console.error('status未定义');
                    sender.config.style.marginTop = 5;
                    break;
            }
            this.listviewSender = sender;

            //加入分类参数，云审为‘bpm’，NC为‘nc' xingjjc 2017-4-18
            var _category = 'bpm';
            sender.config.ajaxConfig = {
                url: url,
                type: "POST",
                pageSize: 10,
                pageNumKey: "pageNum",
                data: {
                    pageNum: 1,
                    start: 0,
                    size: 10,

                    category: _category
                }
            };
            sender.config.autoLoadData = true;
        },

        row_feature_repeat_init: function (sender, params) {
            // if (this.fullPageKey !== "commonlist_copyapprove") {
            var keyFeature;
            if (sender.parent.datasource.keyFeature) {
                keyFeature = sender.parent.datasource.keyFeature;
            } else if (sender.parent.datasource.processInstance) {
                keyFeature = sender.parent.datasource.processInstance.keyFeature;
            }
            else if (sender.parent.datasource.inst) {
                keyFeature = sender.parent.datasource.inst.keyFeature;
            } else if (sender.parent.datasource.historicProcessInstance) {
                keyFeature = sender.parent.datasource.historicProcessInstance.keyFeature;
            } else if (sender.parent.datasource.historicProcessInstanceResponse) {
                keyFeature = sender.parent.datasource.historicProcessInstanceResponse.keyFeature;
            }

            var json = [];
            //todo zhenyu 将列表页和详情页关键属性处理代码合成一个放在common.js中减少重复代码
            c.processKeyFeature(json,keyFeature,[]);

            if (json.length === 0) {
                sender.config.style.display = 'none';
            }
            sender.bindData(json);
            // }
        },
        row_time_init: function (sender, params) {
            if (sender.config.text === null) {
                if (sender.datasource.startTime !== null && sender.datasource.startTime !== undefined) {
                    if (this.fullPageKey === "commonlist_waitmyapprovedone") {
                        var endTime = 0;

                        if (sender.datasource.endTime !== null) {
                            endTime = sender.datasource.endTime;
                        }
                        sender.config.text = utils.timestampToTimeStr(endTime, true);
                    } else {
                        sender.config.text = utils.timestampToTimeStr(sender.datasource.startTime, true);
                    }
                } else if (sender.datasource.inst) {
                    sender.config.text = utils.timestampToTimeStr(sender.datasource.inst.startTime, true);
                }

            } else {

                sender.config.text = utils.timestampToTimeStr(sender.config.text, true);

            }
        },
        row_state_init: function (sender, params) {//判断是否逾期(待审批的当前环节)
            // modifyTime
            // createTime
            if (this.fullPageKey !== 'commonlist_copyapprove') {
                var dueDate = sender.parent.datasource.dueDate;
                if ((dueDate && dueDate < new Date()) && this.fullPageKey === "commonlist_waitmyapprove") {
                    // sender.config.style.display = "block";
                }
            }
        },
        row_status_init: function (sender, params) {//判断审批阶段状态
            var fullpagekey = this.fullPageKey;//根据fullpagekey来区分不同页面的不同tab
            if (fullpagekey === "commonlist_myapproverunning" || fullpagekey === "commonlist_myapprovedone") {
                //我发起的三种状态:审批中、已完成、已终止
                var state = sender.datasource.inst.state;
                var tempSave = sender.datasource.inst.processDefinitionId;//added by huangzhy 暂存功能
                var deleteReason_me = sender.datasource.inst.deleteReason;//added by liuhca
                if (tempSave.indexOf("tempSave") === 0) {
                    sender.config.text = language.status.draft;
                    sender.config.style.color = '#F17868';
                } else {
                    if (sender.datasource.inst.processDefinitionId.indexOf("processKey") > -1) {
                        sender.config.text = language.status.submitted;
                        sender.config.style.color = '#ADADAD';
                    }
                    else {
                        if (state === 'run'&&deleteReason_me!=="REJECTTOSTART_DELETED"&&deleteReason_me!=="REJECTTOSTART") {
                            sender.config.text = language.status.inApproval;
                            sender.config.style.color = '#F39801';
                        } else if (state === "end" && !deleteReason_me) {
                            sender.config.text = language.status.finish;
                            sender.config.style.color = '#ADADAD';
                        } else if (state === "delete" || (state === "end" && deleteReason_me === "ACTIVITI_DELETED")) {
                            sender.config.text = language.status.stop;
                            sender.config.style.color = '#F17868';
                        } else if (deleteReason_me === "WITHDRAW_SUBMIT") {//审批人撤回提交后单据为草稿态
                            sender.config.text = language.status.draft;
                            sender.config.style.color = '#F17868';
                        }else if(deleteReason_me==="OUTTIMEDELETED"){
                            sender.config.text = language.status.overdueTerminated;
                            sender.config.style.color = '#F17868';
                        }else if(deleteReason_me==="REJECTTOSTART_DELETED"||deleteReason_me==="REJECTTOSTART"){
                            sender.config.text = language.status.rejectDraft;
                            sender.config.style.color = '#F17868';
                        }else if(deleteReason_me==='jumpEnd'){
                            sender.config.text = language.status.finish;
                            sender.config.style.color = '#ADADAD';
                        }
                    }
                }
            } else if (fullpagekey === "commonlist_waitmyapprovedone" || fullpagekey === "commonlist_waitmyapprove") {
                //待审批的三种状态:审批中(是否有逾期)、已完成、已终止
                if (fullpagekey === "commonlist_waitmyapprove") {

                    // if(!sender.datasource.processInstance) {
                    //     console.log(sender.datasource);
                    // }
                    var completed = sender.datasource.processInstance && sender.datasource.processInstance.completed;//sender.datasource.completed;
                    var ended = sender.datasource.processInstance.ended;//sender.datasource.ended;
                    if (completed) {
                        sender.config.text = language.status.finish;
                        sender.config.style.color = '#ADADAD';
                    } else if (ended) {
                        sender.config.text = language.status.stop;
                        sender.config.style.color = '#F17868';
                    }
                    else {
                        var variables = sender.datasource.variables;
                        if (variables) {
                            for(var i=0;i<variables.length;i++){
                                if(variables[i].name==="counterSigning"&&variables[i].value===true){
                                    sender.config.text = language.addApproving;
                                    sender.config.style.color = '#ff4000';
                                }
                            }
                        }
                    }
                } else {
                    var taskInst = sender.datasource.historicProcessInstance;
                    var taskInstEnd = (taskInst ? taskInst.endTime !== null : false);//是否截止
                    var deleteReason = taskInst ? taskInst.deleteReason : null;//驳回原因
                    if (taskInstEnd) {//截止了
                        if (deleteReason === "stop") {
                            sender.config.text = language.status.stop;
                            sender.config.style.color = '#F17868';
                        } else if (deleteReason) {
                            if(deleteReason==="OUTTIMEDELETED"){
                                sender.config.text = language.status.overdueTerminated;
                                sender.config.style.color = '#F17868';
                            }else{
                                if(deleteReason==='jumpEnd'){
                                    sender.config.text = language.status.finish;
                                    sender.config.style.color = '#ADADAD';
                                }else{
                                    sender.config.text = language.status.stop;
                                    sender.config.style.color = '#F17868';
                                }
                            }

                        } else {
                            sender.config.text = language.status.finish;
                            sender.config.style.color = '#ADADAD';
                        }
                    } else {//没有截止
                        sender.config.text = language.status.inApproval;
                        sender.config.style.color = '#F39801';
                    }
                    if(deleteReason==="REJECTTOSTART"){
                        sender.config.text = language.status.rejectDraft;
                        sender.config.style.color = '#F17868';
                    }
                }

            }
        },
        row_image_init: function (sender, params) {

            if (this.fullPageKey === 'commonlist_myapproverunning' || this.fullPageKey === "commonlist_myapprovedone") {
                sender.config.style.backgroundColor = "#fff";
                sender.config.style.borderRadius = "";
                // sender.config.style.height = 40;
                // sender.config.style.width = 40;
                var middle_type='';
                var processDefinitionId=sender.datasource.inst.processDefinitionId;
                if(processDefinitionId.indexOf('processKey')>-1){
                    //数据收集
                    middle_type='-datacollection.png';
                }else if(processDefinitionId.indexOf('freeflow')>-1){
                    //自由流
                    middle_type='-freeflow.png';
                }else{
                    //固定流
                    middle_type='-fixedflow.png';
                }
                if (sender.datasource.inst.icon) {
                    sender.datasource.inst.icon=sender.datasource.inst.icon.replace(/(\d{2})/,function(v){return (v-0)%13||13;});
                    sender.config.src = "./imgs/" + sender.datasource.inst.icon + middle_type;
                } else {
                    sender.config.src = "./imgs/icon-1"+middle_type;
                }
            } else {
                //historicProcessInstance
                if (this.fullPageKey !== 'commonlist_copyapprove' && this.fullPageKey !== 'commonlist_waitmyapprove') {
                    if (sender.config.title === null) {
                        if (sender.datasource.historicProcessInstance.startParticipant) {
                            sender.config.title = sender.datasource.historicProcessInstance.startParticipant.name;
                        } else {
                            sender.config.title = language.formTips.iconMissing;
                            sender.config.src = language.formTips.iconMissing;
                        }
                    }
                    if (sender.datasource.historicProcessInstance && sender.datasource.historicProcessInstance.startParticipant) {
                        sender.config.src = sender.datasource.historicProcessInstance.startParticipant.pic ? sender.datasource.historicProcessInstance.startParticipant.pic : "none.jpg";

                    }
                    if (sender.datasource.historicProcessInstance && sender.datasource.historicProcessInstance.startParticipant) {
                        // console.log(sender.datasource.historicProcessInstance.startParticipant.name);
                        sender.config.title = sender.datasource.historicProcessInstance.startParticipant.name;
                    }

                    if (this.fullPageKey === 'commonlist_waitmyapprovedone' && sender.datasource.category === 'nc') {
                        sender.config.title = sender.datasource.historicProcessInstance.startParticipant.name;
                        sender.config.src = sender.datasource.historicProcessInstance.startParticipant.pic ? sender.datasource.historicProcessInstance.startParticipant.pic : "null.thumb.jpg";
                    }

                } else if (this.fullPageKey !== 'commonlist_waitmyapprove' && this.fullPageKey !== 'commonlist_copyapprove') {
                    sender.config.title = sender.datasource.title;
                } else if (this.fullPageKey === 'commonlist_copyapprove') {
                    //historicProcessInstanceResponse 更换为historicProcessInstance 2018.1.2 by zhenyu
                    if (!sender.datasource.historicProcessInstance) {
                        sender.config.title = language.formTips.iconMissing;
                        sender.config.src = language.formTips.iconMissing;

                    } else {
                        sender.config.title = sender.datasource.historicProcessInstance.startParticipant.name;
                        sender.config.src = sender.datasource.historicProcessInstance.startParticipant.pic ? sender.datasource.historicProcessInstance.startParticipant.pic : "null.thumb.jpg";
                    }
                } else {
                    if (!sender.datasource.processInstance.startParticipant) {
                        sender.config.title = language.formTips.iconMissing;
                        sender.config.src = language.formTips.iconMissing;
                    } else {
                        // title_bind: "processInstance.startParticipant.name",
                        // src_bind: "processInstance.startParticipant.pic"
                        sender.config.title = sender.datasource.processInstance.startParticipant.name;
                        sender.config.src = sender.datasource.processInstance.startParticipant.pic ? sender.datasource.processInstance.startParticipant.pic : "null.thumb.jpg";
                    }
                }
            }
        },
        row_left_init: function (sender, params) {
            if (this.fullPageKey === 'commonlist_copyapprove' && sender.datasource.taskStatus.toString() === '0') {
                sender.setBadge(1, {
                    backgroundColor: "#F66C6C",
                    position: "relative",
                    right: "15px",//TODO huangzhy right:50px top:3px;
                    fontSize: "0",
                    top: "5px",
                    height: "6px",
                    width: "6px",
                    padding: "0",
                    borderRadius: "30px",
                    boxShadow: "0px 0px 0px 1px #fff"
                });
            }
        },
        row_title_init: function (sender, params) {
            if (sender.config.text === null) {
                if (sender.datasource.historicProcessInstance !== undefined) {
                    sender.config.text = sender.datasource.historicProcessInstance.name;
                } else if (sender.datasource.inst !== undefined) {
                    sender.config.text = sender.datasource.inst.name;
                } else if (this.fullPageKey === 'commonlist_copyapprove') {
                    sender.config.text = sender.datasource.title;
                }

            }
            if(sender.datasource.outtime){
                var htmlCur1=$("<span class='yy-inner-text yy-text-box' style='-webkit-line-clamp: 1; word-break: break-all;background: #BA0808;color: #fff;margin-left: 2px;font-size: 12px;padding: 0px 4px;border-radius: 4px;width: auto;'>"+language.status.overTime+"</span>");
                setTimeout(function () {
                    sender.$el.append(htmlCur1);
                },100);
            }else if(sender.datasource.warning){
                var htmlCur=$("<span class='yy-inner-text yy-text-box' style='-webkit-line-clamp: 1; word-break: break-all;background: #FFBA05;color: #fff;margin-left: 2px;font-size: 12px;padding: 0px 4px;border-radius: 4px;width: auto;'>"+language.status.warning+"</span>");
                setTimeout(function () {
                    sender.$el.append(htmlCur);
                },100);
            }
        },
        row_batch_init:function (sender,params) {
            if(sender.datasource.isBatchApprove){
                sender.config.text =sender.datasource.isBatchApprove;
                sender.config.style.display = "block";
            }
        }
    };
    return pageLogic;
});
