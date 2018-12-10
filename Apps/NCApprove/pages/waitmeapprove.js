/**
 * 首页的上下分类
 **/
define(["../logic/waitmeapprove", "../parts/common", 'utils'], function (pluginClass, c, utils) {
    var Re = {
        pluginClass: pluginClass,
        style: {
            backgroundColor: c.backColor
        },
        root: ["segment","searchview","searchview1", "viewpager"],
        components: {
            segment: {
                type: "segment_android",
                ref:true,
                items: [{title: "待我审批"}, {title: "我已审批"}],
                root: ["segment_item"],
                className: "bottom-half-line",
                indicatorStyle: {
                    backgroundColor: "#29B6F6"
                },
                style: {
                    height: 40,
                    backgroundColor: "#fff",
                    // borderBottom:"solid 1px #EDEDED"
                }
            },
            segment_item: {
                type: "text",
                text:"加载中...",
                ref:true,
                text_bind: "title",
                selectedClassName: "ar-sgm-item-selected-android",
                className:"right-half-line",
                style: {
                    color: "#262626",
                    fontSize: 13,
                    textAlign: "center",
                    justifyContent: "center",
                    width: '100%',
                    // borderRight: "1px solid #eee"
                }
            },
            viewpager: {
                type: "viewpager",
                defaultKey: "commonlist_waitmyapprove",
                style: {
                    flex: 1
                }
            },
            searchview: {
                type: "view",
                root: ["leftview", "searchInput"],
                style: {
                    width: "100%"
                }
            },
            searchview1: {
                type: "view",
                root: ["leftview1", "searchInput1"],
                style: {
                    width: "100%"
                }
            },
            leftview: {
                type: "view",
                ref: true,
                root: ["selectItem", "searchBtn"]
            },
            leftview1: {
                type: "view",
                ref: true,
                root: ["selectItem1", "searchBtn1"]
            },
            selectItem: {
                type: "view",
                ref: true,
                root: ["approveSelector"],
                style: {
                    background: "#fff",
                    width: 331
                }
            },
            approveSelector: {
                type: "conditionselector",
                mode: 1,
                ref: true,
                menu1ClassName: "approveSelector bottom-half-line",
                style: {
                    backgroundColor: "#fff",
                    borderBottom:"solid 1px #F7F7F7"
                },
                items: ["全部状态", "接收时间", "提交时间", "全部类型"],
                menu0LabelKey: "name",
                menu1LabelKey: "name",
                menu2LabelKey: "name",
                menu3LabelKey: "name",
                menu0selectedKey: 0,
                menu1selectedKey: 0,
                menu2selectedKey: 0,
                menu3selectedKey: 0,

                menu2LeftStyle: {
                    width: 90,
                },
                menu1Style: {
                    minHeight: 40
                },
                menu2Style: {
                    minHeight: 40
                },
                menu3Style: {
                    minHeight: 40
                },
                menu0Style: {
                    minHeight: 40
                },
                menu0Col: 2
            },
            selectItem1: {
                type: "view",
                ref: true,
                root: ["approveSelector1"],
                style: {
                    background: "#fff",
                    width: 331
                }
            },
            approveSelector1: {
                type: "conditionselector",
                mode: 1,
                ref: true,
                menu1ClassName: "approveSelector bottom-half-line",
                style: {
                    backgroundColor: "#fff",
                    borderBottom:"solid 1px #F7F7F7"
                },
                items: ["全部状态", "完成时间", "提交时间", "全部类型"],
                menu0LabelKey: "name",
                menu1LabelKey: "name",
                menu2LabelKey: "name",
                menu3LabelKey: "name",
                menu0selectedKey: 0,
                menu1selectedKey: 0,
                menu2selectedKey: 0,
                menu3selectedKey: 0,

                menu2LeftStyle: {
                    width: 90,
                },
                menu1Style: {
                    minHeight: 40
                },
                menu2Style: {
                    minHeight: 40
                },
                menu3Style: {
                    minHeight: 40
                },
                menu0Style: {
                    minHeight: 40
                },
                menu0Col: 2
            },

            searchBtn: {
                type: "icon",
                ref: true,
                font: "cap_e90c",
                iconStyle: {
                    fontSize: 20
                },
                style: {
                    borderBottom:"solid 1px #F7F7F7",
                    backgroundColor: "#fff",
                    color: "#ccc",
                    width: 45,
                    position: "absolute",
                    right: 0,
                    top: 0,
                    bottom: 0
                }

            },
            searchBtn1: {
                type: "icon",
                ref: true,
                font: "cap_e90c",
                iconStyle: {
                    fontSize: 20
                },
                style: {
                    borderBottom:"solid 1px #F7F7F7",
                    backgroundColor: "#fff",
                    color: "#ccc",
                    width: 45,
                    position: "absolute",
                    right: 0,
                    top: 0,
                    bottom: 0
                }

            },
            searchInput: {
                cancelBtnStyle: {
                    color: "#37B7FD",
                    fontSize: 15
                },
                style: {
                    backgroundColor: "#fff",
                    display: "none"
                },
                iconStyle: {},
                placeholder: "搜索标题",
                font: "ap_e903",
                ref: true,
                type: "simplesearchview"
            },
            searchInput1: {
                cancelBtnStyle: {
                    color: "#37B7FD",
                    fontSize: 15
                },
                style: {
                    backgroundColor: "#fff",
                    display: "none"
                },
                iconStyle: {},
                placeholder: "搜索标题",
                font: "ap_e903",
                ref: true,
                type: "simplesearchview"
            }
        },

    };
    return Re;
});
