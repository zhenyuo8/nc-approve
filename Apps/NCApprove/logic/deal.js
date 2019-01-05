define(["../parts/language"], function (language) {
    function pageLogic(config) {
        this.pageview = config.pageview;
        this.params = this.pageview.params || {};
        this.comment = '';
        console.log(this)
       
    }

    pageLogic.prototype = {
        // 意见输入框初始化
        input_textarea_init: function (sender, params) {
            if (this.params.action === 'agree') {
                sender.config.placeholder = language.formAction.agree||language.placeholder.agreeComments;
                sender.config.text=language.formAction.agree||language.placeholder.agreeComments;
            } else if (this.params.action === 'disagreee') {
                sender.config.placeholder = language.formAction.reject|| '不同意';
            }else {
                sender.config.placeholder = language.formAction.reject|| language.placeholder.rejectComments;
            }  
        },

        submitbtn_init:function (sender,params) {
            if (this.params.action === 'agree') {
                sender.config.title=language.formAction.agree;
            } else if (this.params.action === "disagree") {
                sender.config.title=language.formAction.disagreee||'不同意';
            }else {
                sender.config.title=language.formAction.reject;
            }
        },

        submitbtn_click:function (sender, params) {
            var para = {};
            try{
                para.approveMessage = sender.parent.parent.components.input_textarea_container.$el.find('textarea').val() || '';
            }catch(e){
                console.log(e);
            }
            para.taskId=this.params.taskId;
            para.action=this.params.action;
            para.userid=this.params.userid;
            para.billId=this.params.billId;
            para.billtype=this.params.billtype;
            para.groupid=this.params.groupid;

            if (this.params.action === 'agree') {
                para.comment = this.beforeSubmit(para.comment)||language.formAction.agree;
                this.doAgree(para);
            } else if (this.params.action === 'disagree') {
                para.comment = this.beforeSubmit(para.comment)||language.formAction.disagreee||'不同意';
                this.doAgree(para);
            }else if(this.params.action==='reject'){
                para.comment = this.beforeSubmit(para.comment)||language.formAction.reject;
                this.doAgree(para);
            }
        },

        // 同意
        doAgree: function (_para) {
            var _this = this,
                para = _para,url='/process/audit';
                if(para.action==='reject'){
                    url='/process/rejectTask';
                }
            this.pageview.showLoading({text: language.formTips.onLoading, timeout: 8000});
            this.pageview.ajax({
                url: url,
                data: para,
                type: 'GET',
                success: function (data) {
                    _this.pageview.hideLoading(true);
                    if (data.code === 0) {
                        _this.pageview.showTip({text: language.formTips.successfullyApproved, duration: 800});
                        setTimeout(function () {
                            _this.pageview.goBack(-1);
                        }, 800);
                    } else {
                        _this.pageview.showTip({text: data.desc, duration: 2000});
                        setTimeout(function () {
                            _this.pageview.goBack(-2);
                        }, 2000);
                    }
                },
                error: function (data) {
                    
                }
            });
        },

        beforeSubmit: function (content) {
            return this.filterEmoji(content);
        },
        filterEmoji: function (content) {
            if (!content) return '';

            var emojireg = content.replace(/\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]|[\uD800-\uDBFF]|[\uDC00-\uDFFF]/g, "");
            return emojireg;
        }

    };

    return pageLogic;
});
