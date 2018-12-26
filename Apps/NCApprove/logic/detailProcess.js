/**
 * Created by Gin on 17/2/27.
 */
define(["../parts/common", "utils", "../../../components/dialog","../../../components/allcomments","../parts/language"], function (c, utils, Dialog, Allcomments,language) {
    function PageLogic(config) {
        var _this = this;
        this.pageview = config.pageview;
        this.parentThis = this.pageview.viewpagerParams.parentThis;
    }

    PageLogic.prototype = {
        flow_right_content_right_init: function (sender, params) {
            if (sender.datasource.activityType === "startEvent") {
                var operateTime = (sender.datasource.endTime === null ? sender.datasource.startTime : sender.datasource.endTime);
                if(!operateTime) return
                sender.config.text = utils.timestampToTimeStr(new Date(operateTime).getTime(), true);
            } else if (sender.datasource.activityType) {
                this.setAnalysis(sender, "time");
            } else {
                sender.rowInstance.$el.hide();
            }
        },
        flow_right_content_middle_bottom_title_init: function (sender, params) {
            if (sender.datasource.activityType === "startEvent") {
                sender.config.text = language.status.SubmitApplication;
            } else {
                this.setAnalysis(sender, "status");
            }
        },
        left_round_init: function (sender, params) {
            this.setAnalysis(sender, "icon");
        },
        flow_right_content_left_init: function (sender, params) {
            if (!sender.datasource.pic) {
                var _title = utils.getImgTitle(sender.datasource.userName);
                sender.setTitle(_title);
                sender.config.style.backgroundColor = utils.getImgBg(_title);
            }
        },
        setAnalysis: function (sender, type) {
            if (type === "time") {
                if (sender.datasource.endTime && sender.datasource.endTime.indexOf("9999") === -1) {
                    sender.config.text = utils.timestampToTimeStr(new Date(sender.datasource.endTime).getTime(), true);
                } else {
                    sender.config.text = "";
                }
            } else if (type === "status") {
                var msg = sender.datasource.taskComments?sender.datasource.taskComments:'';
                
                var taskAuditDesc = sender.datasource.taskAuditDesc || (sender.datasource.endTime && sender.datasource.endTime.indexOf("9999") === -1 ? language.formAction.agree : language.tasksToProcess);
                sender.config.text = taskAuditDesc + " " + msg;
            } else if (type === "icon") {
                if(!sender.datasource.endTime&&!sender.datasource.taskAuditDesc){
                    sender.config.font = "cap_e90b";
                    sender.config.iconStyle.color = "#F39801";
                }else{
                    sender.config.iconStyle.color = "#56CFAE";
                    sender.config.font = "cap_e90a";
                } 
            }
        },
    };
    return PageLogic;
});
