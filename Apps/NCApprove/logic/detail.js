
define(["../parts/common", "utils", "../libs/plupload/form-file-uploader", "../parts/analysis",  "../parts/language"], function (c, utils, FileUploader, analysis,language) {

    function PageLogic(config) {
        var _this = this;
        this.item = [];
        this.pageview = config.pageview;
        this.currentTodoTaskInitAttCnt = 0;//当前待办任务初始时已上传附件数
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
                    type: 'POST',
                    data: {
                        instId: this.pageview.params.instId || '',
                        taskId: this.pageview.params.taskId || '',
                        copyToId: this.pageview.params.copyToId || '',
                        category: this.pageview.params.category || ''
                    },
                    success: function (listData) {
                        setTimeout(function () {
                            _this.pageview.hideLoading(true);
                        },2000);
                        if (listData.code === 0) {
                            _this.pageview.refs.segment.$el.show();
                            
                        } else {
                            // _this.pageview.showTip({text: listData.msg, duration: 2000});
                            setTimeout(function(){
                                var data=[
                                    {
                                        "billtypename":"通讯费报销单",
                                        "des":"获取单据明细成功",
                                        "flag":"0",
                                        "taskbill":{
                                            "head":[
                                                {
                                                    "tabCode":"djbh",
                                                    "tabName":"单据编号",
                                                    "tabContent":{
                                                        "billItemData":[
                                                            {
                                                                "djbhitemShowName":"单据编号",
                                                                "djbh":"264X201812250050",
                                                                "digest":false
                                                            },
                                                            {
                                                                "djrqitemShowName":"单据日期",
                                                                "djrq":{
                                                                    "day":25,
                                                                    "daysMonth":31,
                                                                    "enMonth":"Dec",
                                                                    "enWeek":"Tue",
                                                                    "leapYear":false,
                                                                    "localDay":25,
                                                                    "localMonth":12,
                                                                    "localYear":2018,
                                                                    "millis":1545729208000,
                                                                    "month":12,
                                                                    "strDay":"25",
                                                                    "strMonth":"12",
                                                                    "week":2,
                                                                    "weekOfYear":52,
                                                                    "year":2018
                                                                },
                                                                "digest":false
                                                            },
                                                            {
                                                                "ybjeitemShowName":"报销原币金额",
                                                                "ybje":{
                                                                    "dV":[
                                                                        0,
                                                                        1,
                                                                        0,
                                                                        0,
                                                                        0
                                                                    ],
                                                                    "double":1,
                                                                    "power":-2,
                                                                    "sIValue":1,
                                                                    "trimZero":false
                                                                },
                                                                "digest":false
                                                            },
                                                            {
                                                                "bzbmitemShowName":"币种",
                                                                "bzbm":"人民币",
                                                                "bzbm_ID":"1002Z0100000000001K1",
                                                                "digest":false
                                                            },
                                                            {
                                                                "zy2itemShowName":"事由",
                                                                "zy2":"",
                                                                "digest":false
                                                            },
                                                            {
                                                                "jkbxritemShowName":"报销人",
                                                                "jkbxr":"张大明",
                                                                "jkbxr_ID":"0001A910000000005T8A",
                                                                "digest":false
                                                            },
                                                            {
                                                                "deptiditemShowName":"报销人部门",
                                                                "deptid":"质检部",
                                                                "deptid_ID":"1002A91000000000030X",
                                                                "digest":false
                                                            },
                                                            {
                                                                "pk_orgitemShowName":"报销单位",
                                                                "pk_org":"新世纪纸业集团总公司",
                                                                "pk_org_ID":"0001A910000000005R3C",
                                                                "digest":false
                                                            }
                                                        ]
                                                    }
                                                }
                                            ],
                                            "tail":[
                                                {
                                                    "tabCode":"tail",
                                                    "tabName":"表尾信息",
                                                    "tabContent":{
                                                        "billItemData":[
                                
                                                        ],
                                                        "group":[
                                                            {
                                                                "tabCode":"audit",
                                                                "tabName":"审计信息",
                                                                "tabContent":{
                                                                    "billItemData":[
                                
                                                                    ]
                                                                }
                                                            }
                                                        ]
                                                    }
                                                }
                                            ],
                                            "body":[
                                                {
                                                    "tabCode":"er_busitem",
                                                    "tabName":"报销单业务行",
                                                    "tabContent":[
                                                        {
                                                            "billItemData":[
                                                                {
                                                                    "szxmiditemShowName":"收支项目",
                                                                    "szxmid":"购买辅助材料",
                                                                    "szxmid_ID":"1002A810000000001KE8",
                                                                    "digest":true
                                                                },
                                                                {
                                                                    "amountitemShowName":"金额",
                                                                    "amount":{
                                                                        "dV":[
                                                                            0,
                                                                            1,
                                                                            0,
                                                                            0,
                                                                            0
                                                                        ],
                                                                        "double":1,
                                                                        "power":-2,
                                                                        "sIValue":1,
                                                                        "trimZero":false
                                                                    },
                                                                    "digest":true
                                                                },
                                                                {
                                                                    "szxm1itemShowName":"收支项目",
                                                                    "szxm1":"购买辅助材料",
                                                                    "digest":false
                                                                },
                                                                {
                                                                    "jeitemShowName":"金额",
                                                                    "je":"1.00",
                                                                    "digest":false
                                                                }
                                                            ]
                                                        }
                                                    ],
                                                    "rowcnt":"1"
                                                }
                                            ]
                                        }
                                    }
                                ];                          
                                
                                _this.pageview.delegate('userinfo_name', function (target) {
                                    _this.instName = data[0].billtypename;
                                    target.setText(_this.instName);
                                });
                                _this.pageview.refs.result_text.innerText.html('审批中');
                                _this.pageview.refs.result_text.innerText.css('color','#e7a757');
                                _this.pageview.refs.result_text.$el.show();
                                
                                var viewpager = _this.pageview.refs.top_view.components.viewpager;
                                jsonList = analysis.getAnalysis_ifroms(data);
                                viewpager.curPageViewItem.contentInstance.refs.detail_repeat.bindData(jsonList);
                                _this.item.push({label:'同意',id:'',type:'agree'});
                                _this.item.push({label:'不同意',id:'',type:'disagree'});
                                _this.item.push({label:'驳回',id:'',type:'reject'});
                                _this.initBtn();
                            },500);
                        }
                    },
                    error: function (listData) {
                        setTimeout(function(){
                            var data=[
                                {
                                    "billtypename":"通讯费报销单",
                                    "des":"获取单据明细成功",
                                    "flag":"0",
                                    "taskbill":{
                                        "head":[
                                            {
                                                "tabCode":"djbh",
                                                "tabName":"单据编号",
                                                "tabContent":{
                                                    "billItemData":[
                                                        {
                                                            "djbhitemShowName":"单据编号",
                                                            "djbh":"264X201812250050",
                                                            "digest":false
                                                        },
                                                        {
                                                            "djrqitemShowName":"单据日期",
                                                            "djrq":{
                                                                "day":25,
                                                                "daysMonth":31,
                                                                "enMonth":"Dec",
                                                                "enWeek":"Tue",
                                                                "leapYear":false,
                                                                "localDay":25,
                                                                "localMonth":12,
                                                                "localYear":2018,
                                                                "millis":1545729208000,
                                                                "month":12,
                                                                "strDay":"25",
                                                                "strMonth":"12",
                                                                "week":2,
                                                                "weekOfYear":52,
                                                                "year":2018
                                                            },
                                                            "digest":false
                                                        },
                                                        {
                                                            "ybjeitemShowName":"报销原币金额",
                                                            "ybje":{
                                                                "dV":[
                                                                    0,
                                                                    1,
                                                                    0,
                                                                    0,
                                                                    0
                                                                ],
                                                                "double":1,
                                                                "power":-2,
                                                                "sIValue":1,
                                                                "trimZero":false
                                                            },
                                                            "digest":false
                                                        },
                                                        {
                                                            "bzbmitemShowName":"币种",
                                                            "bzbm":"人民币",
                                                            "bzbm_ID":"1002Z0100000000001K1",
                                                            "digest":false
                                                        },
                                                        {
                                                            "zy2itemShowName":"事由",
                                                            "zy2":"",
                                                            "digest":false
                                                        },
                                                        {
                                                            "jkbxritemShowName":"报销人",
                                                            "jkbxr":"张大明",
                                                            "jkbxr_ID":"0001A910000000005T8A",
                                                            "digest":false
                                                        },
                                                        {
                                                            "deptiditemShowName":"报销人部门",
                                                            "deptid":"质检部",
                                                            "deptid_ID":"1002A91000000000030X",
                                                            "digest":false
                                                        },
                                                        {
                                                            "pk_orgitemShowName":"报销单位",
                                                            "pk_org":"新世纪纸业集团总公司",
                                                            "pk_org_ID":"0001A910000000005R3C",
                                                            "digest":false
                                                        }
                                                    ]
                                                }
                                            }
                                        ],
                                        "tail":[
                                            {
                                                "tabCode":"tail",
                                                "tabName":"表尾信息",
                                                "tabContent":{
                                                    "billItemData":[
                            
                                                    ],
                                                    "group":[
                                                        {
                                                            "tabCode":"audit",
                                                            "tabName":"审计信息",
                                                            "tabContent":{
                                                                "billItemData":[
                            
                                                                ]
                                                            }
                                                        }
                                                    ]
                                                }
                                            }
                                        ],
                                        "body":[
                                            {
                                                "tabCode":"er_busitem",
                                                "tabName":"报销单业务行",
                                                "tabContent":[
                                                    {
                                                        "billItemData":[
                                                            {
                                                                "szxmiditemShowName":"收支项目",
                                                                "szxmid":"购买辅助材料",
                                                                "szxmid_ID":"1002A810000000001KE8",
                                                                "digest":true
                                                            },
                                                            {
                                                                "amountitemShowName":"金额",
                                                                "amount":{
                                                                    "dV":[
                                                                        0,
                                                                        1,
                                                                        0,
                                                                        0,
                                                                        0
                                                                    ],
                                                                    "double":1,
                                                                    "power":-2,
                                                                    "sIValue":1,
                                                                    "trimZero":false
                                                                },
                                                                "digest":true
                                                            },
                                                            {
                                                                "szxm1itemShowName":"收支项目",
                                                                "szxm1":"购买辅助材料",
                                                                "digest":false
                                                            },
                                                            {
                                                                "jeitemShowName":"金额",
                                                                "je":"1.00",
                                                                "digest":false
                                                            }
                                                        ]
                                                    }
                                                ],
                                                "rowcnt":"1"
                                            }
                                        ]
                                    }
                                }
                            ];                          
                            
                            _this.pageview.delegate('userinfo_name', function (target) {
                                _this.instName = data[0].billtypename;
                                target.setText(_this.instName);
                            });
                            _this.pageview.refs.result_text.innerText.html('审批中');
                            _this.pageview.refs.result_text.innerText.css('color','#e7a757');
                            _this.pageview.refs.result_text.$el.show();
                            
                            var viewpager = _this.pageview.refs.top_view.components.viewpager;
                            jsonList = analysis.getAnalysis_ifroms(data);
                            viewpager.curPageViewItem.contentInstance.refs.detail_repeat.bindData(jsonList);
                            _this.item.push({label:'同意',id:'',type:'agree'});
                            _this.item.push({label:'不同意',id:'',type:'disagree'});
                            _this.item.push({label:'驳回',id:'',type:'reject'});
                            _this.initBtn();
                        },500);
                    }
                };

            this.pageview.ajax(listAjaxConfig);
        },
        //显示按钮
        initBtn: function () {
            for (var idx = 0; idx < this.item.length; idx++) {
                if (this.item[idx].label.indexOf("撤回申请") > -1) {
                    this.item.splice(idx, 1);
                    break;
                }
            }
            if (this.item.length > 4) {
                var btnItem = [];
                var moreItem = [];
                for (var itemIdx = 0; itemIdx < this.item.length; itemIdx++) {
                    if (itemIdx >= 3) {
                        moreItem.push(this.item[itemIdx]);
                        // item.remove(itemIdx);
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
                    this.initBtn();
                    this.viewpager.showItem("detailContent_detail", {type: "content"});
                } else if (itemTitle === "流程"||itemTitle === "Process") {
                    this.initBtn();
                    this.processInstances=[
                        {
                            "approvehistorylinelist":[
                                {
                                    "action":"",
                                    "approvedid":"0001AA1000000003TBSP",
                                    "attachstructlist":[
                    
                                    ],
                                    "count":"0",
                                    "handledate":"",
                                    "handlername":"杨堃",
                                    "psnid":"1002AA1000000000BLFW"
                                },
                                {
                                    "action":"批准",
                                    "approvedid":"1002ZZ1000000000C5WB",
                                    "attachstructlist":[
                    
                                    ],
                                    "count":"0",
                                    "handledate":"2018-12-25 20:46:30",
                                    "handlername":"王晓米",
                                    "note":"tesgt",
                                    "psnid":"10029910000000005BFS"
                                }
                            ],
                            "des":"获取审批明细成功",
                            "flag":"0",
                            "flowhistory":[
                                {
                                    "personlist":[
                                        {
                                            "id":"100299100000000045FQ",
                                            "isPerson":[
                                                "contact"
                                            ],
                                            "name":"张大明"
                                        }
                                    ],
                                    "time":"2018-12-25 17:14:56",
                                    "unittype":"submit"
                                },
                                {
                                    "actionname":"",
                                    "handwriteflag":"N",
                                    "itemlist":[
                                        {
                                            "key":"key",
                                            "value":"value"
                                        }
                                    ],
                                    "personlist":[
                                        {
                                            "id":"100299100000000045FQ",
                                            "isPerson":[
                                                "contact"
                                            ],
                                            "name":"杨堃"
                                        }
                                    ],
                                    "remindflag":"N",
                                    "unittype":"solved"
                                },
                                {
                                    "itemlist":[
                                        {
                                            "key":"key",
                                            "value":"value"
                                        }
                                    ],
                                    "personlist":[
                                        {
                                            "id":"100299100000000045FQ",
                                            "isPerson":[
                                                "contact"
                                            ],
                                            "name":"王晓米"
                                        }
                                    ],
                                    "remindflag":"N",
                                    "unittype":"handling"
                                }
                            ]
                        }
                    ];
                    
                    this.viewpager.showItem("detailProcess_detail", {type: "process", parentThis: this});
                    window.setTimeout(function () {
                        _this.viewpager.curPageViewItem.contentInstance.refs.middle_flow_repeat.bindData(_this.processInstancesHistory(_this.processInstances));
                        
                    }, 200);
                } else{
                    this.viewpager.showItem("detailAttachment_detail", {type: "attachment", parent: this});
                }
            }
        },
        processInstancesHistory:function (processInstances){
            var list=processInstances[0].approvehistorylinelist,arr=[];
            var startUser=processInstances[0].flowhistory;
            var obj={};
            for(var i=0;i<list.length;i++){
                arr.push({
                    activityType:'approveStartEvent',
                    assignee:'',
                    deleteReason:'',
                    dueDate:'',
                    endTime:list[i].handledate||'',
                    memberId:'',
                    name:'',
                    processDefinitionId:'',
                    taskAuditDesc:list[i].action||'',
                    taskComments:list[i].note||'',
                    taskId:'',
                    userName:list[i].handlername||'',
                    currentUserId:'',
                });
            }
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
                taskId:this.pageview.params.taskId,
                action:sender.datasource.type,
                userid:'',
                groupid:'',
            };
            this.pageview.go("deal", paras);
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
