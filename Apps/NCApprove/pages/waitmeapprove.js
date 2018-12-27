/**
 * 首页的上下分类
 **/
define(["../logic/waitmeapprove", "../parts/common", 'utils'], function (pluginClass, c, utils) {
    var Re = {
        pluginClass: pluginClass,
        style: {
            backgroundColor: c.backColor
        },
        root: ["segment","searchview", "viewpager"],
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
                root: ["searchInput"],
                style: {
                    width: "100%"
                }
            },
            searchInput: {
                cancelBtnStyle: {
                    color: "#37B7FD",
                    fontSize: 15
                },
                style: {
                    backgroundColor: "#fff",
                },
                iconStyle: {},
                placeholder: "搜索标题",
                font: "ap_e903",
                ref: true,
                type: "simplesearchview"
            },
        },

    };
    return Re;
});
