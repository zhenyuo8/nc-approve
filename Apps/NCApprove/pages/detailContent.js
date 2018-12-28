
define(["../logic/detailContent", "../parts/common", 'utils'], function (pluginClass, c, utils) {
    var Re = {
        pluginClass: pluginClass,
        style: {
            backgroundColor: "#F7F7F7"
        },
        root: ["addDoc_view", "detail_repeat", "subform_repeat","moreBill"],
        components: {
            addDoc_view: {
                type: "view",
                root: ["btnAddDoc"]
            },
            btnAddDoc: {
                type: "button",
                text: "+ 追加单据",
                ref: true,
                style: {
                    display: "none",
                    borderRadius: 0,
                    borderColor: "#F7F7F7",
                    borderLeftWidth: 0,
                    fontSize: 15,
                    borderRightWidth: 0,
                    height: 43,
                    marginTop: "10px",
                    color: "#29B6F6",
                    width: "100%"
                }
            },
            moreBill: {
                type: "icon",
                text: "更多单据",
                font: "cap_e901",
                textPos: "left",
                ref: true,
                iconStyle: {
                    fontSize: 10,
                    padding: "0 5px"
                },
                style: {
                    display: "none",
                    borderRadius: 0,
                    borderLeftWidth: 0,
                    borderColor: "rgba(0,0,0,0)",
                    fontSize: 13,
                    borderRightWidth: 0,
                    height: 40,
                    width: "100%",
                    marginBottom: 20,
                    verticalAlign: "middle",
                    color: "#adadad",
                    backgroundColor: "#fff"
                }
            },
            
            datatable_repeat: {
                type: "repeat",
                ref: true,
                root: ["datatable_view"],
                style: {
                    display: "none",
                    width: "100%",
                    backgroundColor: "#fff",
                    flexDirection: "column",
                },
                itemStyle: {
                    minHeight: 40,
                    flexDirection: "row"
                },
                itemClassName:"bottom-half-line"
            },
            datatable_view: {
                type: "view",
                root: ["datatable_view_title", "datatable_view_item"],
                style: {
                    flexDirection: "column",
                    width: "100%"
                }
            },
            datatable_view_title: {
                type: "text",
                text_bind: "title",
                preText: "1",
                preTextStyle: {
                    backgroundColor: "#F39801",
                    color: "rgb(255, 255, 255)",
                    borderRadius: "50%",
                    fontSize: 12,
                    w: 15,
                    lineHeight: 14,
                    marginRight: 4,
                    textAlign: "center"
                },
                style: {
                    backgroundColor: "rgb(251,251,251)",
                    color: "#9E9E9E",
                    fontSize: 13,
                    paddingLeft: 14,
                    height: 40
                }
            },
            datatable_view_item: {
                type: "repeat",
                root: ["datatable_view_item_title", "datatable_view_item_content","detail_item_files"],
                style: {
                    display: "inline",
                    width: "100%",
                    backgroundColor: "#fff"
                },
                itemStyle: {
                    minHeight: 30,
                    flexDirection: "row",
                },
            },
            datatable_view_item_title: {
                type: "text",
                text_bind: "title",
                style: {
                    color: "#9E9E9E",
                    fontSize: 13,
                    paddingLeft: 14
                }
            },
            datatable_view_item_content: {
                type: "text",
                text_bind: "content",
                style: {
                    color: "#262626",
                    fontSize: 13,
                    textAlign:'right',
                    flex:1,
                    paddingRight:12,
                }
            },


            subform_repeat: {
                type: "repeat",
                ref: true,
                root: ["subform_view"],
                style: {
                    display: "inline",
                    width: "100%",
                    backgroundColor: "#fff",
                },
                itemStyle: {
                    borderBottom: "solid 1px #EDEDED",
                    minHeight: 40,
                    flexDirection: "row"
                }
            },
            subform_view: {
                type: "view",
                root: ["subform_view_title", "subform_view_item"],
                style: {
                    flexDirection: "column",
                    width: "100%"
                }
            },
            subform_view_title: {
                type: "text",
                text_bind: "title",
                preText: "1",
                preTextStyle: {
                    backgroundColor: "#F39801",
                    color: "rgb(255, 255, 255)",
                    borderRadius: "50%",
                    fontSize: 12,
                    w: 15,
                    lineHeight: 14,
                    marginRight: 4,
                    textAlign: "center"
                },
                style: {
                    backgroundColor: "rgb(251,251,251)",
                    color: "#9E9E9E",
                    fontSize: 13,
                    paddingLeft: 14,
                    height: 40
                }
            },
            subform_view_item: {
                type: "repeat",
                root: ["subform_view_item_title", "subform_view_item_content","detail_item_files"],
                style: {
                    display: "inline",
                    width: "100%",
                    backgroundColor: "#fff"
                },
                itemStyle: {
                    minHeight: 30,
                    flexDirection: "row"
                }
            },
            subform_view_item_title: {
                type: "text",
                text_bind: "name",
                style: {
                    color: "#9E9E9E",
                    fontSize: 13,
                    paddingLeft: 14
                }
            },
            subform_view_item_content: {
                type: "text",
                text_bind: "content",
                style: {
                    color: "#262626",
                    fontSize: 13
                }
            },
            detail_repeat: {
                type: "repeat",
                ref: true,
                root: ["detail_view"],
                style: {
                    display: "inline",
                    width: "100%",
                    backgroundColor: "#fff",
                    marginTop: 10
                },
                itemStyle: {
                    minHeight: 40,
                    flexDirection: "row",
                    widht: "100%"
                },
                itemClassName:"bottom-half-line",
                // items: [{title: "标题1", content: "内容11"}, {title: "标题2", content: "内容2"}, {title: "标题3", content: "内容3"}]
            },
            detail_view: {
                type: "view",
                root: ["detail_item_title", "detail_item_content", "detail_item_files", "detail_iamge", "detail_DividingLine", "datatable_repeat"],
                style: {
                    flexDirection: "row",
                    width: "100%"
                }
            },
            detail_DividingLine: {
                type: "text",
                style: {
                    height: 1,
                    borderBottom: "1px solid rgb(237, 237, 237)",
                    borderTopColor: "rgb(237, 237, 237)",
                    borderRightColor: "rgb(237, 237, 237)",
                    borderLeftColor: "rgb(237, 237, 237)",
                    marginBottom: 10,
                    paddingBottom: 10,
                    width: "100%"
                }
            },
            detail_item_title: {
                type: "text",
                text: "title:",
                text_bind: "title",
                ref:true,
                style: {
                    color: "#9E9E9E",
                    fontSize: 13,
                    paddingLeft: 13,
                    // paddingRight: 20,
                    width: 80,
                }
            },
            detail_item_content: {
                type: "text",
                text: "content",
                text_bind: "content",
                numberofline: 2000,
                style: {
                    flex: 1,
                    color: "#262626",
                    fontSize: 13,
                    // paddingRight: 8,
                    padding:12,
                    textAlign:'right'
                }
            },
            detail_iamge: {
                type: "image",
                style: {
                    width: "100%"
                }

            },
            detail_item_files: {
                type: "repeat",
                ref: true,
                root: ["detail_files_view"],
                style: {
                    display: "inline",
                    flex:1,
                    backgroundColor: "#fff"
                },
                itemStyle: {
                    height: 40,
                    flexDirection: "row"
                }
            },
            detail_files_view: {
                type: "view",
                style: {
                    flexDirection: "row",
                    flex:1
                },
                root: ["detail_files_view_left", "detail_files_view_right"]
            },
            detail_files_view_left: {
                type: "image",
                style: {
                    w: 34,
                    margin: "4px 8px 0 10px",
                    backgroundColor: "#fff"
                },
                src: "./imgs/link.png"
            },
            detail_files_view_right: {
                type: "text",
                text_bind: "filename",
                numberofline: 1,
                style: {
                    flex: 1,
                    color: "#262626",
                    fontSize: 13,
                    paddingRight: 10
                }
            }
        }
    };
    return Re;
});
