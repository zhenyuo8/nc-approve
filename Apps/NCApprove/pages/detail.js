/**
 * Created by Gin on 17/2/24.
 */
define(["../logic/detail", "../parts/common", 'utils'], function (pluginClass, c, utils) {
    var Re = {
        pluginClass: pluginClass,
        style: {
            backgroundColor: "#F7F7F7"
        },
        root: ["top_view", "bottomToolBar", "morePopover"],
        components: {
            top_view: {
                type: "view",
                ref: true,
                style: {
                    flex: 1,
                    background: "#f2f3f4"
                },
                root: ["userinfo_warp", "segment","segmentdocument","segmentdocumentmobile", "viewpager"]
            },
            userinfo_warp: {
                type: "view",
                ref: true,
                className:"bottom-half-line",
                style: {
                    flexDirection: "row",
                    alignItems: "flex-start",
                    background: "#fff",
                    // borderBottom: "solid 1px #EDEDED",
                    padding: "20px 0 24px 0",
                    zIndex: 11
                },
                root: ["user_icon", "userinfo_rightwarp", "result_logo", "result_text"]
            },
            user_icon: {
                type: "image",
                // title:"name",
                ref: true,
                src: "./imgs/unknow_person.png",
                title: "",
                style: {
                    width: 55,
                    height: 55,
                    fontSize: 18,
                    backgroundColor: "rgba(255, 255, 255,0)",
                    marginLeft: 13,
                    marginRight: 13,
                    borderRadius: "100%"
                }
            },
            userinfo_rightwarp: {
                type: "view",
                style: {
                    flex: 1,
                    justifyContent: "center",
                    minHeight: 55
                },
                root: ["userinfo_name", "userinfo_repeat"]
            },
            result_text: {
                type: "text",
                text: "进行中",
                ref: true,
                style: {
                    display: "none",
                    position: "absolute",
                    fontSize: 14,
                    right: 16,
                    top: 17,
                    pointerEvents: "none",
                    maxWidth:68,
                    textAlign:'center'
                }
            },
            result_logo: {
                type: "image",
                defaultSrc: "./imgs/agree.png",
                ref: true,
                style: {
                    display: "none",
                    position: "absolute",
                    top: -25,
                    width: 160,
                    right: -30,
                    opacity: "1",
                    background: "rgba(255,255,255,0)",
                    transition: "all 150ms ease",
                    "-webkit-backface-visibility": "hidden", //隐藏转换的元素的背面
                    "-webkit-transform-style": "preserve-3d", //使被转换的元素的子元素保留其 3D 转换
                    "-webkit-transform": "translate3d(0,0,0)",
                    pointerEvents: "none"
                }
            },
            userinfo_name: {
                type: "text",
                ref: true,
                text: "加载中...",
                className:"title-line-clamp",
                style: {
                    color: "#262626",
                    fontSize: 16,
                    // lineHeight: 16,
                    paddingRight: 80,
                }
            },
            userinfo_repeat: {
                type: "repeat",
                ref: true,
                style: {
                    display: "inline",
                    paddingTop: 8
                },
                root: ["userinfo_view"]
            },
            userinfo_view: {
                type: "view",
                root: ["userinfo_status"],
                style:{
                    flex:1,
                    paddingRight:12
                }
            },
            userinfo_status: {
                type: "text",
                text: "加载中...",
                text_bind: "text",
                ref: true,
                numberofline: 1,
                style: {
                    fontSize: 13,
                    lineHeight: 18,
                    height: 18,
                    color: "#ADADAD"
                }
            },
            segment: {
                type: "segment_android",
                ref: true,
                items: [{title: "详情"}, {title: "流程"}, {title: "附件"}],
                root: ["segment_item"],
                className:"bottom-half-line",
                style: {
                    display: "none",
                    height: 38,
                    color: "#262626",
                    backgroundColor: "#fff",
                    // borderBottom: "solid 1px #EDEDED"
                },
                itemStyle: {
                    paddingBottom: 2
                }
            },
            
            segment_item: {
                type: "text",
                text: "加载中...",
                text_bind: "title",
                selectedClassName: "yy-sgm-item-selected-android",
                style: {
                    color: "#262626",
                    fontSize: 15,
                }
            },

            viewpager: {
                type: "viewpager",
                className: "detail_viewpager",
                defaultKey: "detailContent_detail",
                style: {
                    flex: 1
                }
            },

            bottomToolBar: {
                type: "view",
                ref: true,
                style: {
                    height: 46,
                    flexDirection: "row",
                    backgroundColor: "#fff",
                    alignItems: "center"
                },
                root: ["buttonGroup", "splitline", "moreBtn"]
            },
            splitline: {
                type: "view",
                ref: true,
                style: {
                    borderLeft: "1px solid rgb(220, 220, 220)",
                    height: 14
                }
            },
            buttonGroup: {
                type: "repeat",
                ref: true,
                root: ["toolbarIcon"],
                className:"top-half-line",
                style: {
                    flex: 1,
                    alignItems: "center",
                    backgroundColor: "rgb(247, 247, 247)",
                    height: 46,
                    // borderTop: "1px solid #eee"
                },
                itemStyle: {
                    flex: 1,
                    zIndex: 11,
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                    width: "100%",
                },
                splitStyle: {
                    borderLeft: "1px solid #ededed",
                    height: 16
                }
            },
            toolbarIcon: {
                type: "icon",
                text_bind: "label",
                style: {
                    flex: 1,
                    width: "100%",
                },
                iconStyle: {
                    color: "#262626",
                    fontSize: 14
                },
                textStyle: {
                    color: "#262626",
                    marginLeft: 5,
                    width:'100%',
                    textAlign:'center',
                    fontSize: 16 //14 huangzhy 0704
                }
            },
            moreBtn: {
                type: "icon",
                font: "cap_e90d",
                ref: true,
                className:"top-half-line",
                iconStyle: {
                    color: "#262626",
                    fontSize: 16
                },
                style: {
                    display: "none",
                    height: 46,
                    width: 30,
                    padding: "0 42px",
                    borderTop: "1px solid #eee"
                }
            },
            morePopover: {
                type: "popover",
                root: ["moreRepeat"],
                animate: {mode: "2"},
                bkCoverStyle: {
                    backgroundColor: "rgba(230, 230, 230, 0.2)"
                },
                arrowStyle: {
                    backgroundColor: "#fff",
                    zIndex: 2,
                    "-webkit-box-shadow": "9px 8px 13px #9C9C9C",
                    "box-shadow": "9px 8px 13px #9C9C9C",
                },
                style: {
                    "-webkit-box-shadow": "0px 8px 13px #9C9C9C",
                    "box-shadow": "0px 8px 13px #9C9C9C",
                    minWidth:88,
                    backgroundColor: "#fff",
                    minHeight: 50,
                    height: "auto",
                    borderRadius: "7px"
                }
            },
            moreRepeat: {
                type: "repeat",
                ref: true,
                // items: [{label: "重新提交"}, {label: "撤回"}],
                root: ["moreRepeat_icon"],
                style: {
                    flexDirection: "column",
                    flex: 1
                },
                itemStyle: {
                    // flex: 1,
                    justifyContent: "center",
                    alignItems: "stretch",
                    height: 40,
                    padding: "0 5px"
                }
            },
            moreRepeat_icon: {
                type: "icon",
                text: "按钮",
                text_bind: "label",
                style: {
                    // flex: 1
                },
                textStyle: {
                    fontSize: 14,
                    color: "#292f33"
                }
            }
        }
    };
    return Re;
});
