/**
 *"待审批"
 */
define(["../parts/common", "utils", '../parts/language',"../../../components/dialog",], function (c, utils, language,Dialog) {
    function pageLogic(config) {
        this.pageview = config.pageview;
        this.fullPageKey = this.pageview.config.fullPageKey;
        this.listDataSource = [];
        this.searchValue = false;
        this.searchKey = true;
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

        searchview_init: function (sender, params) {
            sender.config.style.display = "none";
        },
        nodata_init:function (sender,params) {
            sender.config.text=language.formTips.noContent;
        },
        searchInput_cancel: function (sender, params) {
            var value = params.value;
            if (value || this.searchValue) {
                this.searchValue = false;
                sender.input.val('');

                this.listviewSender.config.ajaxConfig.data.keyword = '';
                this.pageview.refs.listview.loadFirstPageData({parentAnimate: true});
            }
            this.pageview.refs.searchInput.$el.hide();
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
            
            if (data.code !==500) {
                return false;
            }
            if (!data.data) {
                data.data = [];
            }
            
            var listData=data.data;
            return listData;
        },
        listview_init: function (sender) {
            var url = '';
            sender.config.style.marginTop = 5;
            url = '/process/listTodo';
            this.listviewSender = sender;
            sender.config.ajaxConfig = {
                url: url,
                type: "GET",
                pageSize: 10,
                pageNumKey: "pageNum",
                data: {
                    pageNum: 1,
                    start: 0,
                    size: 10,
                }
            };
            sender.config.autoLoadData = true;
        },
        row_status_init: function (sender, params) {//判断审批阶段状态
            sender.config.text = language.formTips.going;
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
                userid:sender.datasource.cuserId,
                billId:sender.datasource.billId,
                billtype:sender.datasource.billType,
                // state:1
            });
        },
    };
    return pageLogic;
});
