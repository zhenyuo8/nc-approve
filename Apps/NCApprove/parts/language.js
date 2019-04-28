/**
 * Created by zhenyu 2018/06/25.
 */
define([], function () {
    var defaultLang = 'zh-CN';
    var lang = navigator.language || defaultLang;
    if(lang.toLowerCase()=='tw'){
        lang='zh-CN';
    }
    lang = /^zh/.test(lang) ? 'zh-CN' : /^en/.test(lang) ? 'en' : /^es/.test(lang) ? 'es' : lang;
    var languageJson;
    if(lang==='zh-CN'){
        languageJson={
            'iconUrl':{
                'refuse':'./imgs/refuse.png',
                'agreee':'./imgs/agree.png',
            },
            'formTips':{
                'tasksToProcess':' 待审批 ',
                'tasksProcessed':' 已审批 ',
                'onLoading':' 加载中... ',
                "formDetail":' 详情 ',
                "processDetail":' 流程 ',
                'attachment':' 附件 ',
                'noAttachment':' 暂无附件 ',
                'noContent':' 暂无内容 ',
                'SubmitApplication':' 提交申请 ',
                'delete':' 删除中... ',
                'going':' 审批中 ',
                'deleteSuccess':' 删除成功！ ',
                'deleteFail':' 删除失败，稍后再试 ',
                'makeSureDeleteFile':'确定要删除该附件吗? ',
                'approvalSucess':'审批成功',
                'rejectSucess':'驳回成功',
                'previewChoose':'附件操作选择',
            },
            'formAction':{
                'agree':' 批准 ',
                'attaContributor':' 贡献者：',
                'reject':' 驳回 ',
                'cancel':' 取消 ',
                'confirm':' 确认 ',
                'clear':' 清除 ',
                'downLoad':' 下载 ',
                'preview':' 预览 ',
            }
        };
    }else{
        languageJson={
            'iconUrl':{
                'refuse':'./imgs/refuse_e.png',
                'agreee':'./imgs/agree_e.png',
            },
            'formTips':{
                'tasksToProcess':' Pending ',
                'tasksProcessed':' Approved ',
                'onLoading':' Loading... ',
                "formDetail":' Form ',
                "processDetail":' Process ',
                'attachment':' Attachment ',
                'noAttachment':' No Attachment ',
                'noContent':' No Content ',
                'SubmitApplication':' Submitted an application ',
                'delete':' Deleting... ',
                'going':' In Approval Process ',
                'deleteSuccess':' Delete Success ',
                'deleteFail':' Delete Fail, Please try again later ',
                'makeSureDeleteFile':'Are you sure you wish to delete this attachment? ',
                'approvalSucess':'Approval Success',
                'rejectSucess':' Reject Success',
                'previewChoose':' Attachment operation selection ',
            },
            'formAction':{
                'agree':' Consent ',
                'attaContributor':' Contributor：',
                'reject':' Reject ',
                'cancel':' Cancel ',
                'confirm':' Confirm ',
                'clear':' Clear ',
                'downLoad':' DownLoad ',
                'preview':' Preview ',
            }
        };
    }
    return languageJson;
});