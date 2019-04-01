define(["utils"], function(utils) {
    var p = "local";
    var host="http://114.113.234.244:8095/approve-client-adapter"
    if(p==="正式"){
        host="http://114.113.234.242:9095/approve-client-adapter"
    }else if(p==="pre-rel"){
        host="http://114.113.234.242:9095/approve-client-adapter"
    }  else if (p === "dev") {
        host="http://114.113.234.242:9095/approve-client-adapter"
    } else {
        // host = "http://10.4.111.31:8090/approve-client-adapter";
        // host="http://114.113.234.244:8095/approve-client-adapter"
        host="http://114.113.234.244:8095/approve-client-adapter"
    }

    return {
        init: function(PM) {
            PM.start({
                host: host,
                version:"1.2.0",
                versionkey:"approveversionkey",
                feature:"<div style='text-align:left'>审批</div>",
                customerComponents: {
                    ApproveSearchView:"./components/ApproveSearchView",
                },
                root: "waitmeapprove",
                baseSize: {
                    width: 375,
                    height: 667
                },
                beforeSendAjax: function(config) {
                    var pageInstance = config.pageviewInstance;
                    config.data = config.data || {};
                    config.data.token = pageInstance.params["token"];

                    config.xhrFields = true;
                },
                beforeGo: function(config) {
                    var pageInstance = config.pageviewInstance;
                    config.params.token = pageInstance.params.token||'';
                },
                onAjaxResponse: function(params) {
                    if (params.isSuccess) {
                        if (params.data) {
                            var flag = params.data.success;
                            if(flag === true){
                            	params.data.code = 0;//请求成功
                            }else{
                            	params.data.code = 500;//请求失败
                            }
                            if (params.data.code.toString() === "100010008") {
                                PM.showTip({
                                    text: "操作过期,两秒后会自动退出",
                                    duration: 3500,
                                    clickNoHide: true
                                });
                                try {
                                    window.setTimeout(function() {
                                        window.history.back(-1);
                                    }, 3500);
                                } catch (e) {}
                            }
                        }
                    }
                }
            });

        }
    };
});
