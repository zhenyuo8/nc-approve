define(["../logic/commonlist", "../parts/common", 'utils'], function (pluginClass, c, utils) {
    var Re = {
        pluginClass: pluginClass,
        style: {
            backgroundColor: c.backColor
        },
        root: ["body"],
        components: {
            body: {
                type: "view",
                style: {
                    flex: 1,
                    overflowY: "auto",
                    overflowX: "hidden"
                },
                root: ["listview"]
            },
            icons: {
                type: "icon",
                font: "ap_e903"
            },
            searchview: {
                type: "view",
                root: ["leftview", "searchInput"],
                style: {
                    width: "100%"
                }
            },
            leftview: {
                type: "view",
                ref: true,
                root: ["selectItem", "searchBtn"]
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
                menu1ClassName: "approveSelector",
                style: {
                    backgroundColor: "#fff",
                    borderBottom: "1px solid #e2e8ed",

                },
                items: ["全部状态", "全部时间", "全部类型"],
                menu0LabelKey: "name",
                menu1LabelKey: "name",
                menu2LabelKey: "name",
                menu0selectedKey: 0,
                menu1selectedKey: 0,
                menu2selectedKey: 0,

                menu2LeftStyle: {
                    width: 90,
                },
                menu1Style: {
                    minHeight: 40
                },
                menu2Style: {
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
                style: {
                    borderBottom: "solid 1px #e2e8ed",
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
                    display: "none",
                },
                iconStyle: {},
                placeholder: "搜索标题",
                font: "ap_e903",
                ref: true,
                type: "simplesearchview"
            },
            nodata: {
                ref: "true",
                type: "icon",
                text: "暂无内容",
                textPos: "bottom",
                src: "./imgs/yunshen_nodata.png?v=1",
                textStyle: {
                    fontSize: "15px",
                    color: "#ADADAD",
                    paddingLeft: 11,
                    paddingTop: 10
                },
                style: {
                    width: "100%",
                    alineItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#F7F7F7",
                    paddingTop: 180
                },
                iconStyle: {
                    w: 80,
                    h: 80
                }
            },
            listview: {
                ref: true,
                type: "listview",
                nodata: "nodata",
                itemClassName: "bottom-half-line",
                rowStyle: {
                    flexDirection: "row",
                    paddingTop: 12,
                    paddingBottom: 12,
                },
                style: {
                    flexDirection: "column",

                },
                root: ["row_mide", "row_right"]
            },
            row_mide: {
                type: "view",
                ref: true,
                style: {
                    flex: 1,
                    flexDirection: "column",
                    justifyContent: "center",
                    paddingLeft: 15
                },
                root: ["row_title", "row_feature_repeat"]
            },
            row_right: {
                type: "view",
                style: {
                    width: 100,
                    alignItems: "flex-end",
                    paddingRight: 15
                },
                root: ["row_time", "row_view"]
            },
            row_view: {
                type: "view",
                root: ["row_state", "row_status"],
                style: {
                    marginTop: 6,
                    flexDirection: "row"
                }
            },
            row_state: {
                type: "text",
                text: "逾期",
                ref: true,
                style: {
                    display: "none",
                    fontSize: 10,
                    borderRadius: 4,
                    backgroundColor: "#FDE6E7",
                    color: "#FA4F52",
                    justifyContent: "center",
                    verticalAlign: "middle",
                    textAlign:"center",
                    width: 36,
                    marginTop:-2
                }
            },
            row_status: {
                type: "text",
                style: {
                    fontSize: 12,
                    color: "#8C8D8E",
                    width:'100%',
                },
                textStyle:{
                    wordBreak:'break-word',
                    width:'100%',
                    textAlign:'right'
                }
            },
            row_title: {
                type: "text",
                numberofline: 2,
                style: {
                    color: "#292F33",
                    fontSize: 14,
                    lineHeight: "18px",
                    maxWidth:"100%"
                },
                text_bind: "processInstance.name"
            },
            row_feature_repeat: {
                type: "repeat",
                root: ["rep_view"],
                ref: true,
                style: {
                    display: "inline",
                    paddingTop: 6
                },
                itemStyle: {
                }
            },
            rep_view: {
                type: "view",
                style: {width: "100%"},
                root: ["row_feature_text"]
            },
            row_feature_text: {
                type: "text",
                numberofline: 1,
                style: {
                    color: "#ADADAD",
                    fontSize: 12,
                    lineHeight: 16
                },
                text_bind: "text"
            },
            row_time: {
                type: "text",
                style: {
                    top: 2,
                    color: "#999999",
                    fontSize: 12
                },
                text_bind: "createTime"
            }
        },

    };
    return Re;
});
