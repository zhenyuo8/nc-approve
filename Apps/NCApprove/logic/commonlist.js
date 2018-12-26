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
        window.localStorage.removeItem("ADD_SIGN_BEHIND");
        window.localStorage.removeItem("copyUserParticipants");
        window.localStorage.removeItem("freeFlowActivityInfos");
    }

    pageLogic.prototype = {
        body_init: function (sender) {
            this.body = sender;
        },
    
        searchBtn_click: function (sender, params) {
            this.pageview.refs.leftview.$el.hide();
            this.pageview.refs.searchInput.$el.show();
            this.pageview.refs.searchInput._focus();
            this.pageview.refs.approveSelector.hideDropDown();
        },
        row_check_init:function (sender,params) {
            window.localStorage.removeItem('BATCHFAILURENUM');
            if(this.approveBatch){
                sender.config.style.display='inherit';
                sender.$el.show();
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
        },

        body_pulltorefresh: function (sender, params) {
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
            data.data.list=[
                {
                    "date":"2018-12-25 20:46:34",
                    "taskid":"0001AA1000000003TBSP",
                    "title":"王晓米 审批通过, 单据号: 264X201812250050, 请审批单据"
                },
                {
                    "date":"2018-12-26 11:08:37",
                    "taskid":"1002ZZ1000000000C5V2",
                    "title":"张大明 提交单据, 单据号: 0001, 请审批单据"
                }
            ];
            return data.data.list;
        },
        listview_init: function (sender) {
            var url = '';
            sender.config.style.marginTop = 5;
            switch (this.fullPageKey) {
                case 'commonlist_waitmyapprove':
                    url += '/process/listTodo';
                    
                    break;
                case 'commonlist_waitmyapprovedone':
                    url += '/process/listDone';
                    break;
                default:
                    url = '/process/listTodo';
                    console.error('status未定义');
                    break;
            }
            this.listviewSender = sender;
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
        row_status_init: function (sender, params) {//判断审批阶段状态
            sender.config.text = language.status.going;
            sender.config.style.color = 'rgb(231, 167, 87)';
        },
        row_title_init: function (sender, params) {
            sender.config.text = sender.datasource.title;
        },
        row_time_init:function(sender,params){
            if(sender.datasource.date){
                sender.config.text = utils.timestampToTimeStr(sender.datasource.date, true);
            }   
        },
        listview_rowclick: function (sender, params) {
            this.pageview.go("detail", {
                taskId: sender.datasource.taskid,
            });
        },
    };
    return pageLogic;
});
