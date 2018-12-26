define(["../logic/deal", "../parts/common", 'utils'], function (pluginClass, c, utils) {
    var Re = {
        pluginClass: pluginClass,
        style: {
            backgroundColor: "#F2F3F4",
        },
        root: ["main_view"],
        components: {
            main_view: {
                type: "view",
                root: ["main_view_content"],
                style: {
                    flexDirection: "column",
                    height: "100%",
                    overflowY: "auto",
                    overflowX: "hidden"
                }
            },
            main_view_content: {
                type: "view",
                root: ["input_textarea_container","bottomToolBar"],
                style: {
                    flexDirection: "column",
                    flex:'1 1 1px',
                    marginTop:5
                }
            },
            input_textarea_container:{
                type: "view",
                root: ["input_textarea"],
                style: {
                    flexDirection: "column",
                    paddingBottom:12,
                    backgroundColor:'#fff',
                    marginBottom:20,
                }
            },
            input_textarea: {
                type: "textarea",
                ref: true,
                max: 2000,
                limitStyle: {
                    right: 10,
                    color: "#aaa",
                    display: "none"
                },
                numStyle: {},
                maxStyle: {},
                placeholder: "",
                style: {
                    height: 150,
                    paddingLeft: 15,
                    paddingRight: 15,
                    fontSize: 15,
                    paddingTop: 15,
                    width: "100%"
                },

            },
            bottomToolBar: {
                type: "view",
                ref: true,
                style: {
                    flexDirection: "row",
                    alignItems: "center"
                },
                    root: ["submitbtn"]
            },
            submitbtn: {
                type: "button",
                title: "提交",
                mode: 2,
                style: {
                    height: 42,
                    fontSize: 16,
                    width:'90%',
                    backgroundColor: "#29b6f6",
                    margin:'auto'
                }
            },
    
        }
    };
    return Re;
})
;
