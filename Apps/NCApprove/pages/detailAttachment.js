/**
 * Created by Gin on 17/2/28.
 */
define(["../logic/detailAttachment", "../parts/common", 'utils'], function (pluginClass, c, utils) {
    var Re = {
        pluginClass: pluginClass,
        style: {
            backgroundColor: "#F7F7F7"
        },
        root: ["flow_repeat"],
        components: {
            flow_repeat: {
                type: "repeat",
                ref: true,
                style: {
                    marginTop: 10,
                    background: "#F7F7F7",
                    flexDirection: "column",
                    paddingBottom: 20

                },
                itemStyle: {
                    flexDirection: "row",
                    background: "#fff",
                    height: 65,
                    borderBottom: "solid 1px #EDEDED"
                },
                nodata: "list_nodata",
                // items: [{name: "陈展鹏", status: "审批中"}, {name: "陈展鹏", status: "审批中"}],
                root: ["flow_view"]
            },
            list_nodata: {
                type: "view",
                root: ["list_nodata_img", "list_nodata_text"],
                style: {
                    justifyContent: "center",
                    alignItems: "center",
                    height: 300
                }
            },
            list_nodata_img: {
                type: "image",
                src: "./imgs/yunshen_nodata.png",
                style: {
                    w: 80,
                    h: 80,
                    background: "#f7f7f7",
                    marginBottom: 14
                }
            },
            list_nodata_text: {
                type: "text",
                text: "暂无内容",
                style: {
                    fontSize: 14,
                    color: "#adadad"
                }
            },
            flow_view: {
                type: "view",
                root: ["flow_left", "flow_middle", "flow_right"],
                style: {
                    flexDirection: "row",
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center"
                }

            },
            flow_left: {
                type: "view",
                style: {
                    width: 40,
                    justifyContent: "center",
                    display: "flex",
                    height: "100%",
                    marginLeft: 12,
                    marginRight: 14
                },
                root: ["format_image"]
            },
            format_image: {
                type: "image",
                src: "./imgs/exc.png",
                ref: true,
                style: {

                    borderRadius: 4
                }
            },
            flow_middle: {
                type: "view",
                style: {
                    flex: 1,
                    justifyContent: "center",
                },
                root: ["title_view", "file_size"]
            },
            title_view: {
                type: "text",
                text_bind: "name",
                numberofline: 1,
                style: {
                    fontSize: 16,
                    color: "#262626",
                    display: "block",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    paddingBottom: 2
                }
            },
            //先存放贡献者
            file_size: {
                type: "text",
                text: "贡献者：",
                style: {
                    fontSize: 13,
                    color: "#9E9E9E"
                }
            },
            flow_right: {
                type: "view",
                style: {
                    // border:"solid 1px #000",
                    width: 120,
                    flexDirection: "column",
                    alignItems: "flex-end",
                    justifyContent: "center",
                    paddingRight: 12
                },
                root: ["atta_time", "atta_contributor"]
            },
            atta_time: {
                type: "text",
                text: "00:00",
                style: {
                    fontSize: 13,
                    paddingBottom: 3
                }
            },
            //先存放删除按钮
            atta_contributor: {
                type: "text",
                text: "删除",
                style: {
                    display: "none",
                    fontSize: 13,
                    color: "#0093ff"
                }
            }
        }
    };
    return Re;
});