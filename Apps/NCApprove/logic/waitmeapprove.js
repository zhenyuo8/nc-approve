define(["../parts/common", "utils","../../../components/calendarbetween","../parts/language"], function (c, utils, calendarbetween,language) {

    function pageLogic(config) {
        this.pageview = config.pageview;
        this.countNum = this.pageview.params.countNum;
        this.loadNum();
        window.localStorage.removeItem("RECEIVE_TIME");
        window.localStorage.removeItem("SUBMIT_TIME");
        window.localStorage.removeItem("DONE_TIME");
    }

    pageLogic.prototype = {
        onPageResume: function () {
            // 调用子页面刷新方法
            if (window.changeFormStatus) {
                this.viewpager.curPageViewItem.contentInstance.refs.listview.loadFirstPageData({parentAnimate: true});
            }
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
                            if(_this.waitmeapproveLabel){
                                _this.waitmeapproveLabel.setText(language.tasksToProcess+"(" + data.data.todo + ")");
                            }
                            // _this.waitmeapproveLabel.setText("待我审批");
                        }
                    }
                },
                error: function (e) {

                }
            });
        },
        searchview_init: function (sender, params) {
            this.searchview = sender;
            this.searchview.show=true;
            if (window.pageViewTitle) {
                sender.config.style.display = "none";
                if (window.pageViewTitle === "commonlist_waitmyapprove") {
                    sender.config.style.display = "block";
                }
            } else {
                sender.config.style.display = "block";
            }
        },
        searchview1_init: function (sender, params) {//设置我已审批筛选
            this.searchview1 = sender;
            this.searchview1.show=false;
            if (window.pageViewTitle) {
                sender.config.style.display = "none";
                if (window.pageViewTitle === "commonlist_waitmyapprovedone") {
                    sender.config.style.display = "block";
                }
            } else {
                sender.config.style.display = "none";
            }
        },
        segment_item_init: function (sender) {
            sender.config.text=language.tasksProcessed;
            var title = sender.datasource.title;
            if (title === "待我审批"||title === "Pending") {
                this.waitmeapproveLabel = sender;
                if (this.countNum !== undefined && this.countNum !== null) {
                    sender.config.text = language.tasksToProcess;
                }
            }
        },
        viewpager_init: function (sender, params) {
            this.viewpager = sender;
        },
        segment_change: function (sender, params) {
            if(this.viewpager.curPageViewItem.contentInstance.pageview.plugin.fullPageKey==="commonlist_waitmyapprove"&&this.viewpager.curPageViewItem.contentInstance.pageview.plugin.approveBatch){
                this.viewpager.curPageViewItem.contentInstance.refs.cancel.$el.hide();
                this.viewpager.curPageViewItem.contentInstance.refs.confirm.$el.hide();
                this.viewpager.curPageViewItem.contentInstance.refs.selectAll.$el.hide();
                this.viewpager.curPageViewItem.contentInstance.refs.approveMore.$el.show();
                this.viewpager.curPageViewItem.contentInstance.pageview.plugin.approveBatch=false;
                window.localStorage.removeItem('BATCHFAILURENUM');
                this.pageview.$el.find('.yy-checkbox-list').forEach(function (item,index) {
                    $(item).hide();
                    $(item).removeClass('yy-checkbox-list-selected');
                });
            }
            this.pageview.refs.approveSelector1.hideDropDown();
            this.pageview.refs.approveSelector.hideDropDown();
            window.localStorage.removeItem("RECEIVE_TIME");
            window.localStorage.removeItem("SUBMIT_TIME");
            window.localStorage.removeItem("DONE_TIME");
            if (!params.nochange) {
                var item = params.item;
                var itemData = item.datasource;
                var itemTitle = itemData.title;

                if (itemTitle === "我已审批"||itemTitle === "Approved") {
                    this.searchview1.$el.show();
                    this.searchview.$el.hide();
                    this.searchview1.show=true;
                    this.searchview.show=false;
                    this.viewpager.showItem("commonlist_waitmyapprovedone", {type: "done"});
                } else {
                    this.searchview.$el.show();
                    this.searchview1.$el.hide();
                    this.searchview.show=true;
                    this.searchview1.show=false;
                    this.viewpager.showItem("commonlist_waitmyapprove", {type: "waiting"});
                }
            }
        },
        searchBtn_click: function (sender, params) {
            this.pageview.refs.leftview.$el.hide();
            this.pageview.refs.searchInput.$el.show();
            this.pageview.refs.searchInput._focus();
            this.pageview.refs.approveSelector.hideDropDown();
        },
        searchBtn1_click: function (sender, params) {
            this.pageview.refs.leftview1.$el.hide();
            this.pageview.refs.searchInput1.$el.show();
            this.pageview.refs.searchInput1._focus();
            this.pageview.refs.approveSelector1.hideDropDown();
        },
        searchInput_init: function (sender, params) {
            sender.config.cancel=language.cancel;
        },
        searchInput1_init: function (sender, params) {
            sender.config.cancel=language.cancel;
        },
        searchInput_cancel: function (sender, params) {
            var value = params.value;
            if (value || this.searchValue) {
                this.searchValue = false;
                sender.input.val('');
                this.viewpager.curPageViewItem.contentInstance.refs.listview.ajaxConfig.data.start = 0;
                this.viewpager.curPageViewItem.contentInstance.refs.listview.ajaxConfig.data.pageNum = 1;
                this.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data.keyword = '';
                this.viewpager.curPageViewItem.contentInstance.refs.listview.loadFirstPageData({parentAnimate: true});
            }

            this.pageview.refs.leftview.$el.show();
            this.pageview.refs.searchInput.$el.hide();
        },
        searchInput_search: function (sender, params) {
            if (params.value) {
                this.searchValue = true;
            }
            this.viewpager.curPageViewItem.contentInstance.refs.listview.ajaxConfig.data.start = 0;
            this.viewpager.curPageViewItem.contentInstance.refs.listview.ajaxConfig.data.pageNum = 1;
            this.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data.categoryIds = null;
            this.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data.keyword = params.value;
            this.viewpager.curPageViewItem.contentInstance.refs.listview.loadFirstPageData({parentAnimate: true});
        },
        searchInput1_cancel: function (sender, params) {
            var value = params.value;
            if (value || this.searchValue) {
                this.searchValue = false;
                sender.input.val('');
                this.viewpager.curPageViewItem.contentInstance.refs.listview.ajaxConfig.data.start = 0;
                this.viewpager.curPageViewItem.contentInstance.refs.listview.ajaxConfig.data.pageNum = 1;
                this.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data.keyword = '';
                this.viewpager.curPageViewItem.contentInstance.refs.listview.loadFirstPageData({parentAnimate: true});
            }

            this.pageview.refs.leftview1.$el.show();
            this.pageview.refs.searchInput1.$el.hide();
        },
        searchInput1_search: function (sender, params) {
            if (params.value) {
                this.searchValue = true;
            }
            this.viewpager.curPageViewItem.contentInstance.refs.listview.ajaxConfig.data.start = 0;
            this.viewpager.curPageViewItem.contentInstance.refs.listview.ajaxConfig.data.pageNum = 1;
            this.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data.categoryIds = null;
            this.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data.keyword = params.value;
            this.viewpager.curPageViewItem.contentInstance.refs.listview.loadFirstPageData({parentAnimate: true});
        },
        approveSelector_init:function (sender,params) {
            sender.config.items=[language.status.all,language.time.receiveDate,language.time.sendDate,language.formTypes.all];
        },
        approveSelector1_init:function (sender,params) {
            sender.config.items=[language.status.all,language.time.finishDate,language.time.sendDate,language.formTypes.all];
        },
        approveSelector_menu1_loaddata: function (sender, params) {
            var successCallback = params.success;
            var errorCallback = params.error;
            var _this = this;
            var data = [
                {"name": language.time.receiveDate, "id": "taskTime_all", "group": "taskTime"},
                {"name": language.time.today, "id": "taskTime_today", "group": "taskTime"},
                {"name": language.time.yesterday, "id": "taskTime_yesterday", "group": "taskTime"},
                {"name": language.time.thisWeek, "id": "taskTime_thisWeek", "group": "taskTime"},
                {"name": language.time.lastWeek, "id": "taskTime_lastWeek", "group": "taskTime"},
                {"name": language.time.thisMonth, "id": "taskTime_thisMonth", "group": "taskTime"},
                {"name": language.time.more, "id": "taskTime_more", "group": "taskTime"}
            ];
            successCallback(data);
        },
        approveSelector_menu2_loaddata: function (sender, params) {
            var successCallback = params.success;
            var errorCallback = params.error;
            var _this = this;
            var data = [
                {"name": language.time.sendDate, "id": "taskTime_all", "group": "taskTime"},
                {"name": language.time.today, "id": "taskTime_today", "group": "taskTime"},
                {"name": language.time.yesterday, "id": "taskTime_yesterday", "group": "taskTime"},
                {"name": language.time.thisWeek, "id": "taskTime_thisWeek", "group": "taskTime"},
                {"name": language.time.lastWeek, "id": "taskTime_lastWeek", "group": "taskTime"},
                {"name": language.time.thisMonth, "id": "taskTime_thisMonth", "group": "taskTime"},
                {"name": language.time.more, "id": "taskTime_more", "group": "taskTime"}
            ];
            successCallback(data);
        },
        approveSelector_menu0_loaddata: function (sender, params) {
            var successCallback = params.success;
            var errorCallback = params.error;
            var _this = this;
            var data;
            if(this.searchview.show){
                data = [
                    {"name": language.status.all, "id": "dueDate_all", "group": "dueDate"},
                    {"name": language.status.normal, "id": "dueDate_normal", "group": "dueDate"},
                    {"name": language.status.over, "id": "dueDate_overdue", "group": "dueDate"}
                ];
            }
            if(this.searchview1.show){
                data = [
                    {"name": language.status.all, "id": "", "group": "dueDate"},
                    {"name": language.status.finish, "id": "true", "group": "dueDate"},
                    {"name": language.status.going, "id": "false", "group": "dueDate"}
                ];
            }

            successCallback(data);
        },


        approveSelector_menu3_loaddata: function (sender, params) {
            var successCallback = params.success;
            var errorCallback = params.error;
            var _this = this;
            var list;
            window.setTimeout(function () {
                //process/category
                var ajaxConfig = {
                    url: '/form/queryFormsByCategory',
                    type: 'POST',
                    data: {},
                    success: function (listData) {
                        var list=listData.data.list;
                        var _listdata = [{"name": language.formTypes.all, "id": "", "group": "type"}];
                        for (var idx = 0; idx < list.length; idx++) {
                            var data={};
                            if(list[idx].category==="默认"&&list[idx].formList[0].categoryId=="other"){
                                data = {"name": "其他", "id": list[idx].formList[0].categoryId, "group": "type","list":list[idx].formList};
                            }else{
                                data = {"name": list[idx].category, "id": list[idx].formList[0].categoryId, "group": "type","list":list[idx].formList};
                            }

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
            if(this.searchview.show){
                this.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data.taskDue = sender.curSelectedItem.data.id;
                this.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data.pageNum =1;
                this.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data.start =0;
            }else{
                this.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data.isInsFinished = sender.curSelectedItem.data.id;
                this.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data.pageNum =1;
                this.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data.start =0;
            }
            this.viewpager.curPageViewItem.contentInstance.refs.listview.loadFirstPageData({parentAnimate: true});
        },
        approveSelector_menu1_itemClick: function (sender, params) {

            if(sender.curSelectedItem.data.id==="taskTime_more"){
                this.datepick=new calendarbetween({
                    wrapper: this.pageview.$el,
                    btnDirection: "row",
                    pageview:this,
                    timeType:sender.curSelectedItem.barItemInstance.item,
                    sender:sender,
                    hasSelectCTime:window.localStorage.getItem("RECEIVE_TIME")
            });
                this.datepick.show();
            }else{
                sender.rootInstance.hideDropDown();
                this.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data.rcvOrCompDate = sender.curSelectedItem.data.id;
                this.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data.rcvOrCompBeginDate = null ;
                this.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data.rcvOrCompEndDate =null ;
                this.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data.taskBeginDate = null ;
                this.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data.taskEndDate =null ;
                this.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data.pageNum =1;
                this.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data.start =0;
                this.viewpager.curPageViewItem.contentInstance.refs.listview.loadFirstPageData({parentAnimate: true});
            }
        },
        approveSelector_menu2_itemClick: function (sender, params) {
            // sender.rootInstance.hideDropDown();
            if(sender.curSelectedItem.data.id==="taskTime_more"){
                this.datepick=new calendarbetween({
                    wrapper: this.pageview.$el,
                    btnDirection: "row",
                    pageview:this,
                    timeType:sender.curSelectedItem.barItemInstance.item,
                    sender:sender,
                    hasSelectSTime:window.localStorage.getItem("SUBMIT_TIME")
                });
                this.datepick.show();
            }else{
                sender.rootInstance.hideDropDown();
                this.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data.taskDate = sender.curSelectedItem.data.id;
                this.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data.rcvOrCompBeginDate = null ;
                this.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data.rcvOrCompEndDate =null ;
                this.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data.taskBeginDate = null ;
                this.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data.taskEndDate =null ;
                this.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data.pageNum =1;
                this.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data.start =0;
                this.viewpager.curPageViewItem.contentInstance.refs.listview.loadFirstPageData({parentAnimate: true});
            }
        },
        approveSelector_menu3_itemClick: function (sender, params) {
            sender.rootInstance.hideDropDown();
            if(sender.curSelectedItem.length!==0){
                if(sender.curSelectedItem instanceof Array){
                    var id='',formNames=[];
                    sender.curSelectedItem.forEach(function (items,indexs) {
                        if(items.data.name){
                            id=items.data.id;
                        }else{
                            formNames.push("%"+items.data.title+"%");
                            id=items.data.id;
                        }
                    });
                    if(sender.curSelectedItem[0].data.name){
                        this.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data.categoryIds = sender.curSelectedItem[0].data.id;
                        this.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data.processInstanceNames = "";
                        this.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data.pageNum =1;
                        this.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data.start =0;
                    }else{
                        this.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data.processInstanceNames = formNames.join(",");
                        this.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data.categoryIds ="";
                        this.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data.pageNum =1;
                        this.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data.start =0;
                    }
                }else{
                    this.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data.categoryIds = sender.curSelectedItem.data.id;
                    this.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data.pageNum =1;
                    this.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data.start =0;
                }
                this.viewpager.curPageViewItem.contentInstance.refs.listview.loadFirstPageData({parentAnimate: true});
            }



        },

        approveSelector1_menu1_loaddata: function (sender, params) {
            var successCallback = params.success;
            var errorCallback = params.error;
            var _this = this;
            var data = [
                {"name": language.time.finishDate, "id": "taskTime_all", "group": "taskTime"},
                {"name": language.time.today, "id": "taskTime_today", "group": "taskTime"},
                {"name": language.time.yesterday, "id": "taskTime_yesterday", "group": "taskTime"},
                {"name": language.time.thisWeek, "id": "taskTime_thisWeek", "group": "taskTime"},
                {"name": language.time.lastWeek, "id": "taskTime_lastWeek", "group": "taskTime"},
                {"name": language.time.thisMonth, "id": "taskTime_thisMonth", "group": "taskTime"},
                {"name": language.time.more, "id": "taskTime_more", "group": "taskTime"}
            ];
            successCallback(data);
        },
        approveSelector1_menu2_loaddata: function (sender, params) {
            var successCallback = params.success;
            var errorCallback = params.error;
            var _this = this;
            var data = [
                {"name": language.time.receiveDate, "id": "taskTime_all", "group": "taskTime"},
                {"name": language.time.today, "id": "taskTime_today", "group": "taskTime"},
                {"name": language.time.yesterday, "id": "taskTime_yesterday", "group": "taskTime"},
                {"name": language.time.thisWeek, "id": "taskTime_thisWeek", "group": "taskTime"},
                {"name": language.time.lastWeek, "id": "taskTime_lastWeek", "group": "taskTime"},
                {"name": language.time.thisMonth, "id": "taskTime_thisMonth", "group": "taskTime"},
                {"name": language.time.more, "id": "taskTime_more", "group": "taskTime"}
            ];
            successCallback(data);
        },
        approveSelector1_menu0_loaddata: function (sender, params) {
            var successCallback = params.success;
            var errorCallback = params.error;
            var _this = this;
            var data;
            if(this.searchview.show){
                data = [
                    {"name": language.status.all, "id": "dueDate_all", "group": "dueDate"},
                    {"name": language.status.normal, "id": "dueDate_normal", "group": "dueDate"},
                    {"name": language.status.over, "id": "dueDate_overdue", "group": "dueDate"}
                ];
            }
            if(this.searchview1.show){
                data = [
                    {"name": language.status.all, "id": "", "group": "dueDate"},
                    {"name": language.status.finish, "id": "true", "group": "dueDate"},
                    {"name": language.status.going, "id": "false", "group": "dueDate"},
                    {"name": language.status.stop, "id": "stop", "group": "dueDate"}
                ];
            }

            successCallback(data);
        },


        approveSelector1_menu3_loaddata: function (sender, params) {
            var successCallback = params.success;
            var errorCallback = params.error;
            var _this = this;
            var list;
            window.setTimeout(function () {
                //process/category
                var ajaxConfig = {
                    url: '/form/queryFormsByCategory',
                    type: 'POST',
                    data: {},
                    success: function (listData) {
                        var list=listData.data.list;
                        var _listdata = [{"name": language.formTypes.all, "id": "", "group": "type"}];
                        for (var idx = 0; idx < list.length; idx++) {
                            var data={};
                            if(list[idx].category==="默认"&&list[idx].formList[0].categoryId=="other"){
                                data = {"name": "其他", "id": list[idx].formList[0].categoryId, "group": "type","list":list[idx].formList};
                            }else{
                                data = {"name": list[idx].category, "id": list[idx].formList[0].categoryId, "group": "type","list":list[idx].formList};
                            }

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
        approveSelector1_menu0_itemClick: function (sender, params) {
            sender.rootInstance.hideDropDown();
            if(this.searchview.show){
                this.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data.taskDue = sender.curSelectedItem.data.id;
                this.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data.pageNum =1;
                this.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data.start =0;
            }else{
                this.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data.isInsFinished = sender.curSelectedItem.data.id;
                this.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data.pageNum =1;
                this.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data.start =0;
            }
            this.viewpager.curPageViewItem.contentInstance.refs.listview.loadFirstPageData({parentAnimate: true});
        },
        approveSelector1_menu2_itemClick: function (sender, params) {
            if(sender.curSelectedItem.data.id==="taskTime_more"){
                this.datepick=new calendarbetween({
                    wrapper: this.pageview.$el,
                    btnDirection: "row",
                    pageview:this,
                    timeType:sender.curSelectedItem.barItemInstance.item,
                    sender:sender,
                    hasSelectSTime:window.localStorage.getItem("SUBMIT_TIME")
                });
                this.datepick.show();
            }else{
                sender.rootInstance.hideDropDown();
                this.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data.taskDate = sender.curSelectedItem.data.id;
                this.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data.rcvOrCompBeginDate = null ;
                this.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data.rcvOrCompEndDate =null ;
                this.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data.taskBeginDate = null ;
                this.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data.taskEndDate =null ;
                this.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data.pageNum =1;
                this.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data.start =0;
                this.viewpager.curPageViewItem.contentInstance.refs.listview.loadFirstPageData({parentAnimate: true});
            }
        },
        approveSelector1_menu1_itemClick: function (sender, params) {
            if(sender.curSelectedItem.data.id==="taskTime_more"){
                this.datepick=new calendarbetween({
                    wrapper: this.pageview.$el,
                    btnDirection: "row",
                    pageview:this,
                    timeType:sender.curSelectedItem.barItemInstance.item,
                    sender:sender,
                    hasSelectDTime:window.localStorage.getItem("DONE_TIME")
                });
                this.datepick.show();
            }else{
                sender.rootInstance.hideDropDown();
                this.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data.rcvOrCompDate = sender.curSelectedItem.data.id;
                this.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data.rcvOrCompBeginDate = null ;
                this.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data.rcvOrCompEndDate =null ;
                this.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data.taskBeginDate = null ;
                this.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data.taskEndDate =null ;
                this.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data.pageNum =1;
                this.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data.start =0;
                this.viewpager.curPageViewItem.contentInstance.refs.listview.loadFirstPageData({parentAnimate: true});
            }
        },
        approveSelector1_menu3_itemClick: function (sender, params) {
            sender.rootInstance.hideDropDown();
            if(sender.curSelectedItem.length!==0){
                if(sender.curSelectedItem instanceof Array){
                    var id='',formNames=[];
                    sender.curSelectedItem.forEach(function (items,indexs) {
                        if(items.data.name){
                            id=items.data.id;
                        }else{
                            formNames.push("%"+items.data.title+"%");
                            id=items.data.id;
                        }
                    });
                    if(sender.curSelectedItem[0].data.name){
                        this.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data.categoryIds = sender.curSelectedItem[0].data.id;
                        this.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data.processInstanceNames = "";
                        this.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data.pageNum =1;
                        this.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data.start =0;
                    }else{
                        this.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data.processInstanceNames = formNames.join(",");
                        this.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data.categoryIds ="";
                        this.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data.pageNum =1;
                        this.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data.start =0;
                    }
                }else{
                    this.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data.categoryIds = sender.curSelectedItem.data.id;
                    this.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data.pageNum =1;
                    this.viewpager.curPageViewItem.contentInstance.refs.listview.config.ajaxConfig.data.start =0;
                }
                this.viewpager.curPageViewItem.contentInstance.refs.listview.loadFirstPageData({parentAnimate: true});
            }
        },
    };
    return pageLogic;
});
