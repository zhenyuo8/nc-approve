define(["../parts/common", "utils", "../../../components/dialog",'../parts/language'], function (c, utils, Dialog, language) {
    function pageLogic(config) {
        this.countNum = 0;
        this.toBeApproveNum = 0;//待审批的数量
        this.myApproveNum = 0;//我发起的
        this.copy2MeNum = 0;//抄送我的
        this.pageview = config.pageview;
        this.init();
    }

    pageLogic.prototype = {
        init: function () {
            var _this = this;
            _this.loadNum();
            _this.loadData();
            _this.setHeader();
            _this.getUserInfo();
        },
        waitme_approve_icon_init:function (sender,params) {
            sender.config.text=language.tasksToProcess;
        },
        my_approve_icon_init:function (sender,params) {
            sender.config.text=language.tasksCreatedMyself;
        },
        copy_approve_icon_init:function (sender,params) {
            sender.config.text=language.tasksCopiedToMe;
        },
        searchInput_init:function (sender,params) {
            sender.config.placeholder=language.searchTitle;
            sender.config.cancel=language.cancel;
        },
        nodata_init:function (sender,params) {
            sender.config.text=language.noContent;
        },
        app_repeat_nodata:function (sender,params) {
            sender.config.text=language.noContent;
        },
        onPageResume: function () {//第二次打开页面的时候触发该事件
            this.loadNum();
            if (this.goWhere === "adminMoreTemplate") {
                this.inAdmin = false;
                this.bottomview_pulltorefresh();//不用每次返回都刷新数据
            }
            this.setHeader();
        },
        getUserInfo: function () {
            this.pageview.ajax({
                url: '/user/getMeInfo',
                type: "GET",
                success: function (data) {
                    if (data.success) {
                        window.currentUserInfo = data.data;
                    }
                }
            });
        },
        setHeader: function (entrance) {
            var _this = this,
                rightTitle = '';
            if (this.isAdmin && !this.inAdmin) {
                rightTitle = language.Manage;
            } else if (this.isAdmin && this.inAdmin) {
                rightTitle = language.done;
            }

            try {
                if(rightTitle){
                    compatible.setPageTitleNew(function () {
                    }, {
                        centerItems:[{title:language.ApprovalHeader,titleColor:"#333333"}],
                        rightItems:[{title:rightTitle,fontSize:2,callback:'submit'}]
                    }, function (b) {
                        b.registerHandler("submit", function (data, responseCallback) {

                            if (_this.inAdmin) {
                                _this.inAdmin = !_this.inAdmin;
                                _this.pageview.goBack();
                            } else {
                                _this.goWhere = "adminMoreTemplate";
                                _this.inAdmin = !_this.inAdmin;
                                _this.pageview.go("moreTemplate", {inAdmin: _this.inAdmin, isAdmin: _this.isAdmin});
                            }
                        });
                    });
                }else{
                    compatible.setPageTitleNew(function () {
                    }, {
                        centerItems:[{title:language.ApprovalHeader,titleColor:"#333333"}],
                        rightItems:[]
                    }, function (b) {

                    });
                }

            } catch (e) {

            }
        },

        /**
         * 获取顶部未处理的数据
         */
        loadNum: function () {
            var _this = this;
            this.pageview.ajax({
                type: "POST",
                url: "/process/myDataCount",
                data: {},
                success: function (data) {
                    if (data.success === true) {
                        var dataObj = data.data;
                        _this.toBeApproveNum = parseInt(dataObj.todo);
                        _this.myApproveNum = parseInt(dataObj.running);
                        _this.copy2MeNum = parseInt(dataObj.copyTo);
                        //显示待审批数量
                        _this.pageview.delegate("waitme_approve_icon", function (target) {
                            var num = _this.toBeApproveNum > 99 ? "99+" :_this.toBeApproveNum;
                            target.setBadge(num, {
                                backgroundColor: "#F66C6C",
                                right: "-15px",
                                top: "-10px"
                            });
                        });
                        //初始化我发起的图标
                        _this.pageview.delegate("my_approve_icon", function (target) {
                            if (_this.myApproveNum === 0) {
                                target.$el.find('.yy-icon-img img')
                                    .attr("src", "./imgs/yunshen_applied_finish.png?v=1");
                            }
                        });
                        //显示抄送我的数量
                        _this.pageview.delegate("copy_approve_icon", function (target) {
                            var num = _this.copy2MeNum > 99 ? "99+" :_this.copy2MeNum;
                            target.setBadge(num, {
                                backgroundColor: "#F66C6C",
                                right: "-8px",
                                top: "-10px"
                            });
                        });

                    }
                },
                error: function (e) {
                }
            });
        },

        loadData: function () {
            var _this = this;
            // this.pageview.showLoading({
            //     text: "努力加载中...",
            //     timeout: 9000,
            //     reLoadCallBack: function () {
            //         _this.pageview.hideLoading(true);
            //         // _this._loadData();
            //     }
            // });

            // _this._loadData();

        },
        _loadData: function () {
            var _this = this;
            this.pageview.ajax({
                url: '/form/listForm',
                type: 'POST',
                data: {//默认显示20个常用模板
                    size: "20",
                    start: "0"
                },

                success: function (data) {
                    _this._loadSuccess(data.data);
                },
                error: function (data) {
                    _this.pageview.showTip({text: data.msg, duration: 1000});
                }
            });
        },
        _loadSuccess: function (data) {
            this.pageview.hideLoading(true);
            if (!data || data.list.length === 0) {//没有数据的时候特殊处理
                data = {
                    list: []
                };
            } else {
                this.pageview.delegate("more_template_end", function (target) {
                    target.$el.css({display: ""});
                });
            }
            var dataList = data.list;
            this.pageview.delegate("app_repeat", function (target) {
                target.bindData(dataList);
            });

        },
        app_repeat_itemclick: function (sender, params) {
            var title = sender.datasource.title,
                formId = sender.datasource.formId,
                source = sender.datasource.source,
                formType = 'NEW';
            if (title !== null && title !== undefined) {
                this.pageview.go("form", {templateid: formId, title: encodeURI(title), source: source, formType: formType});
            } else {
                sender.$el.addClass('no-result');
            }
        },
        app_repeat_iteminit: function (sender, params) {
            var name = sender.datasource.name;

            // 没有模板内容增加类来区分点击态
            if (name === null || name === undefined) {
                sender.$el.addClass('no-result');
            }
        },
        onPageBeforeLeave: function (sender, params) {
            if (params.isForward !== true && wxapp.isQYZone()) {
                window.yyesn.client.closePage();
                return false;
            } else if (params.isForward !== true && wxapp.isDingTalkApp()) {
                dd.biz.navigation.close({
                    onSuccess : function(result) {},
                    onFail : function(err) {}
                });
                return false;
            }
        },
        topview_left_click: function () {
            window.pageViewTitle = null;
            this.pageview.go("waitmeapprove", {type: "waitmeapprove", countNum: this.toBeApproveNum});
        },
        topview_middle_click: function () {
            this.pageview.go("myapprove", {type: "myapprove", countNum: this.myApproveNum});
        },
        topview_right_click: function () {
            this.pageview.go("copyapprove", {type: "copyapprove", countNum: this.copy2MeNum});
        },

        bottomview_init: function (sender) {
            this.bottomview = sender;
        },
        main_view_init: function (sender) {
            var _this = this;

            _this.listviewSender = sender;
            this.start = new Date();
            this.pageview.showLoading({
                text: language.formTips.onLoading,
                timeout: 1000,
            });
            sender.config.ajaxConfig = {
                url: '/form/moreListForm',
                type: "POST",
                pageSize: 1,//每篇加载多少数目
                pageNumKey: "pageNum",
                timeout: 10000,
                data: {
                    pageNum: 1,
                    start: 0,
                    size: 1000,
                    isManager: _this.inAdmin ? 'true' : 'false'
                }
            };
            sender.config.autoLoadData = true;
        },
        //上拉加载更多
        bottomview_loadmore: function (sender, params) {
            this.pageview.refs.searchInput.$el.hide();
            var size = this.pageview.refs.main_view.ajaxConfig.data.size;
            var start = this.pageview.refs.main_view.ajaxConfig.data.start;
            var count = size + start;
            this.pageview.refs.main_view.ajaxConfig.data.start = count;
            this.pageview.refs.main_view.ajaxConfig.data.pageNum++;
            this.pageview.refs.main_view.setAjaxConfigParams();
            this.pageview.refs.main_view.loadNextPageData();
        },

        //下拉加载第一页
        bottomview_pulltorefresh: function (sender, params) {
            var _this=this;
            // if(_this.pageview.refs.searchInput.$el.hasClass("yy-sv-input-hide")){
            //     _this.pageview.refs.searchInput.$el.removeClass("yy-sv-input-hide");
            // }else{
            //     _this.pageview.refs.searchInput.$el.show();
            // }
            this.pageview.refs.main_view.ajaxConfig.data.start = 0;
            this.pageview.refs.main_view.ajaxConfig.data.pageNum = 1;
            this.pageview.refs.main_view.setAjaxConfigParams();
            this.pageview.refs.main_view.loadFirstPageData();
        },

        bottomview_reload: function (sender) {
            this.pageview.refs.main_view.reload();
        },
        //处理数据(下拉加载的数据)
        main_view_parsedata: function (sender, params) {
            var ajaxData = params.data,//ajax返回的数据
                _this = this;
            if (ajaxData.success !== true) {
                return false;
            }
            if (!ajaxData.data) {
                ajaxData.data = {
                    list: []
                };
            }
            if (ajaxData.data.list.length === 0) {
                //返回数据为空 默认赋值造假数据
            }else{
                ajaxData.data.list.forEach(function (item,index) {
                    if(item.formList.length>0){
                        item.formList.forEach(function (ite,inx) {
                            ite.title = $('<div/>').text(ite.title).html();
                        });
                    }
                });
            }
            ajaxData.data.list=ajaxData.data.list.filter(function (item,index) {
                return item.formList.length>0;
            });
            return ajaxData.data.list;
        },

        main_view_afterload: function (sender, params) {
            var length = sender.rows.length; //获得上一页最后一个分组的下标

            if (params.isFirstLoad === false && params.data.length > 0) {//第二次加载数据,并且有数据返回

                if (sender.rows[length - 1].datasource.formList[0].categoryId === params.data[0].formList[0].categoryId) {
                    sender.$el.find(".template_item_title").last().css("display", "none");
                }
            }

            // 第一次加载时，如果数量较少时会显示loading
            if (params.isFirstLoad) {
                var size = 100,
                    listLength = 0;

                sender.rows.forEach(function (value, key) {
                    listLength += value.datasource.formList.length;
                });

                if (listLength < size&&listLength!==0) {
                    setTimeout(function () {
                        sender.parent.setHasLoadDone();
                    }, 100);
                }
            }
        },
        right_btn_click: function (sender, params) {
            var _this = this;
            if (sender.datasource.phoneEnabled === "true") {
                _this.phoneEnabledDialog = new Dialog({
                    mode: 3,
                    wrapper: _this.pageview.$el,
                    contentText: language.formTips.sureToDisabledForm,
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
                            _this.phoneEnabledDialog.hide();
                        }
                    }, {
                        title: language.confirm,
                        style: {
                            height: 45,
                            fontSize: 16,
                            color: "#37b7fd",
                        },
                        onClick: function () {
                            _this.phoneEnabledDialog.hide();
                            _this.change_state(sender, params);
                        }
                    }]
                });
                _this.phoneEnabledDialog.show();
            } else {
                _this.change_state(sender, params);
            }
        },
        change_state: function (sender, params) {
            var _this = this,
                token = "",
                _sender = sender,
                formId = sender.datasource.formId,
                formCode = sender.datasource.code,
                formName = sender.datasource.title,
                phoneEnabled = sender.datasource.phoneEnabled,
                newState = "";

            if (phoneEnabled === "true") {
                newState = "false";//状态变为停用
            } else {
                newState = "true";//状态变为启用
            }

            var title = newState === 'true' ? language.formTips.formEnable : language.formTips.formUnEnable;

            this.pageview.showLoading({text: title});

            _this.pageview.ajax({//获取token
                url: '/user/getToken',
                type: 'POST',
                data: {},
                success: function (data) {
                    if (data.success === true) {
                        var myToken = data.data.token;
                        this.pageviewInstance.params.token = myToken;
                        _this.pageview.ajax({
                            url: '/form/updateTemplate',
                            type: 'POST',
                            data: {
                                "formId": formId,
                                "formCode": formCode,
                                "formName": formName,
                                "newState": newState,
                                "token": myToken
                            },
                            success: function (_data) {
                                _this.pageview.hideLoading();
                                if (_data.success === true) {
                                    if (newState === "true") {//已经渲染好了，只能改变DOM,不能改变config了
                                        _sender.$el.css({
                                            transform: "rotateY(0deg) translateZ(0)",
                                            "-webkit-transform": "rotateY(0deg) translateZ(0)"
                                        });

                                        _sender.datasource.phoneEnabled = "true";
                                    } else {
                                        _sender.$el.css({
                                            transform: "rotateY(180deg) translateZ(0)",
                                            "-webkit-transform": "rotateY(180deg) translateZ(0)"
                                        });
                                        _sender.datasource.phoneEnabled = "false";
                                    }
                                }
                            },
                            error: function (_data) {
                                _this.pageview.showTip({text: _data.msg, duration: 1000});
                            }
                        });
                    } else if (data.success === false) {
                        _this.pageview.showTip({text: data.msg, duration: 1000});
                    }
                },
                error: function (data) {
                    _this.pageview.showTip({text: data.msg, duration: 1000});
                }
            });
        },
        
        template_item_click: function (sender, params) {
            var _this = this;
            // 管理员模式不可以看详情
            window.calculationMeta=null;
            window.localStorage.removeItem("copyUserParticipants");
            if (_this.inAdmin) {
                return false;
            }
            var title = sender.datasource.title,
                formId = sender.datasource.formId,
                source = sender.datasource.source,
                type = sender.datasource.type,
                formType = 'NEW';

            if (title !== null && title !== undefined) {
                this.goWhere = "form";
                this.pageview.go("form", {
                    templateid: formId,
                    title: encodeURIComponent(title),
                    formType: formType,
                    source: source,
                });
            } else {
                sender.$el.addClass('no-result');
            }
        },
        template_item_icon_init: function (sender, params) {
            var processKey=sender.datasource.processId||'';
            var middle_type='';
            if(processKey.indexOf('processKey')>-1){
                //数据收集
                middle_type='-datacollection.png';
            }else if(processKey.indexOf('freeflow')>-1){
                //自由流
                middle_type='-freeflow.png';
            }else{
                //固定流
                middle_type='-fixedflow.png';
            }
            if(sender.datasource.icon){
                sender.datasource.icon=sender.datasource.icon.replace(/(\d{2})/,function(v){return (v-0)%13||13;});
                sender.config.src = './imgs/' +  sender.datasource.icon + middle_type;
            }else{
                sender.config.src = './imgs/icon-1'+middle_type;
            }
        },
        searchBtn_click: function (sender, params) {
            this.pageview.refs.main_view.$el.hide();
            this.pageview.refs.searchInput.$el.show();
            this.pageview.refs.searchInput._focus();
            this.pageview.refs.approveSelector.hideDropDown();
        },
        searchInput_cancel: function (sender, params) {
            var value = params.value;

            if (value) {
                sender.input.val('');

                this.listviewSender.config.ajaxConfig.data.keyword = '';
                this.pageview.refs.main_view.loadFirstPageData({parentAnimate: true});
            }

            this.pageview.refs.main_view.$el.show();
        },
        searchInput_search: function (sender, params) {
            this.listviewSender.config.ajaxConfig.data.keyword = params.value;
            this.pageview.refs.main_view.loadFirstPageData({parentAnimate: true});
        },
        template_item_repeat_init: function (sender, params) {
            if (sender.datasource && sender.datasource.formList) {
                var length = sender.datasource && sender.datasource.formList.length;

                if (length % 3 !== 0) {
                    var num = 3 - length % 3;
                    for (var i = 0; i < num; i++) {
                        sender.datasource.formList.push({
                            type: "forEmptyCss"
                        });
                    }
                }
            }
        },
        template_item_init: function (sender, params) {
            // 为了样式更好看，正好凑整
            if (sender.datasource.type && sender.datasource.type === 'forEmptyCss') {
                sender.config.style.display = "none";
            }
        },
        right_btn_container_init: function (sender, params) {
            if (this.inAdmin) {
                sender.config.style.display = '';
            }
        },
        right_btn_init: function (sender, params) {
            var phoneEnabled = sender.datasource.phoneEnabled === "false" ? false : true;

            if (this.inAdmin) {
                sender.config.style.transition = "0.6s";
                sender.config.style.transformStyle = "preserve-3d";
                sender.config.style["-webkit-transform-style"] = "preserve-3d";

                if (!phoneEnabled) {
                    sender.config.style.transform = "rotateY(180deg) translateZ(0)";
                    sender.config.style["-webkit-transform"] = "rotateY(180deg) translateZ(0)";
                }
            }
        },
        right_btn_front_init: function (sender, params) {
            var phoneEnabled = sender.datasource.phoneEnabled === "false" ? false : true;

            if (this.inAdmin) {
                sender.config.style.backfaceVisibility = "hidden";
                sender.config.style["-webkit-backface-visibility"] = "hidden";
            }
        },
        right_btn_back_init: function (sender, params) {
            var phoneEnabled = sender.datasource.phoneEnabled === "false" ? false : true;

            if (this.inAdmin) {
                sender.config.style.backfaceVisibility = "hidden";
                sender.config.style["-webkit-backface-visibility"] = "hidden";
                sender.config.style.transform = "rotateY(180deg) translateZ(0)";
                sender.config.style["-webkit-transform"] = "rotateY(180deg) translateZ(0)";
            }
        },

        /**
         * 初始化icon
         * @param {Object} sender
         * @param {Object} params
         */
        app_repeat_icon_init: function (sender, params) {
            sender.datasource.c = sender.datasource.icon || 'icon-1';

            sender.config.src = './imgs/' + sender.datasource.c + '.png';
        },
        app_repeat_introduce_init: function (sender, params) {
            if (!sender.datasource.desc) {
                sender.config.style.display = 'none';
            }
        }
    };
    return pageLogic;
});
