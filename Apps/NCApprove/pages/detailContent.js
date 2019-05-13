
define(["../logic/detailContent", "../parts/common", 'utils'], function (pluginClass, c, utils) {
    var Re = {
        pluginClass: pluginClass,
        style: {
            backgroundColor: "#F7F7F7"
        },
        root: ["detail_repeat","subform_repeat"],
        components: { 
            subform_repeat: {
                type: "repeat",
                ref: true,
                root: ["subform_view"],
                style: {
                    display: "inline",
                    width: "100%",
                    backgroundColor: "#fff",
                    overflow:'hidden'
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
                    backgroundColor: "#fff",
                },
                itemClassName:'bottom-half-line',
                itemStyle: {
                    minHeight: 30,
                    flexDirection: "row",
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
                    fontSize: 13,
                    flex:1,
                    padding:12

                },
                textStyle:{
                    textAlign:'right',
                }
            },
            detail_item_files: {
                type: "repeat",
                ref: true,
                root: ["detail_files_view"],
                style: {
                    display: "block",
                    backgroundColor: "#fff"
                },
                itemStyle: {
                    height: 40,
                    flexDirection: "row"
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
                root: ["datatable_view_item_title", "datatable_view_item_content"],
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
                root: ["detail_item_title", "detail_item_content", "detail_iamge", "detail_DividingLine", "datatable_repeat"],
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
        }
    };
    return Re;
});
