define(["../parts/common", "utils","../parts/language"], function (c, utils,language) {
    function pageLogic(config) {
        this.pageview = config.pageview;
        this.countNum = this.pageview.params.countNum;
        this.loadNum();
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
        segment_item_init: function (sender) {
            sender.config.text=language.formTips.tasksProcessed;
            var title = sender.datasource.title;
            if (title === "待我审批"||title === "Pending") {
                this.waitmeapproveLabel = sender;
                if (this.countNum !== undefined && this.countNum !== null) {
                    sender.config.text = language.formTips.tasksToProcess;
                }
            }
        },
        viewpager_init: function (sender, params) {
            this.viewpager = sender;
        },
        segment_change: function (sender, params) {
            if (!params.nochange) {
                var item = params.item;
                var itemData = item.datasource;
                var itemTitle = itemData.title;
                this.searchview.$el.show();
                    this.searchview.show=true;
                if (itemTitle === "我已审批"||itemTitle === "Approved") {
                    this.viewpager.showItem("commonlist_waitmyapprovedone", {type: "done"});
                } else {
                    
                    this.viewpager.showItem("commonlist_waitmyapprove", {type: "waiting"});
                }
            }
        },
        searchInput_init: function (sender, params) {
            sender.config.cancel=language.formAction.cancel;
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
    };
    return pageLogic;
});
