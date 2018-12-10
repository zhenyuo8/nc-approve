/**
 * Created by Gin on 17/2/24.
 */
define(["../parts/common", "utils", "../../../components/dialog", "../libs/plupload/form-file-uploader", "../parts/analysis",  "../parts/analysisContent", "../../../components/filetypeselect", "../parts/language"], function (c, utils, Dialog, FileUploader, analysis, analysisContent,Filetypeselect,language) {

    function PageLogic(config) {
        var _this = this;
        this.applyHistory = {};
        this.item = [];
        this.pageview = config.pageview;
        this.formName = this.pageview.params.formDataName || language.ApprovalHeader;
        this.formName = decodeURI(this.formName) || language.ApprovalHeader;
        window.localStorage.removeItem('SETBTNVAL');
        try{
            if(this.formName===''&&this.instName!==''){
                var instArr=this.instName.split('的');
                this.formName=instArr.slice(1).join('');
            }
        }catch (e){

        }
        this.hideProcessAnnex=0;
        this.currentTodoTaskInitAttCnt = 0;//当前待办任务初始时已上传附件数
        this.fileMaxNum = 50; // 附件默认最大数量
        this.fileNum = 0; // 附件现有数量
        this.setHeader();
        this.processDefInsIdTempSave = '';
        this.add_sign_select_list = [];
        //动画在请求一起的时候 安卓会卡顿  动画完后请求

        if (utils.deviceInfo().isAndroid) {
            window.setTimeout(function () {
                _this.loadData();
            }, 300);
        } else {
            _this.loadData();
        }
        var urlReg=/(isFromEsnDocument=(true))/ig;
        if(urlReg.test(window.location.href.split('?')[1])){
            _this.pageview.params.isFromEsnDocument="true";
            _this.formName=language.ApprovalHeader;
            _this.setHeader();
        }
        if(window.location.href.indexOf('isDocumentQuery=true')>-1){
            _this.formName=language.ApprovalHeader;
            _this.documentMobile=true;
            _this.setHeader();
        }
        if(window.location.href.indexOf('isFromBusiness=true')>-1){
            _this.isFromBusiness=true;

        }
        this.assigneee=JSON.parse(window.localStorage.getItem("ADD_SIGN_BEHIND"));
        this.circulator=JSON.parse(window.localStorage.getItem("CIRCULATE"));
        window.localStorage.removeItem("CIRCULATE");
        window.localStorage.removeItem("ADD_SIGN_BEHIND");
        window.localStorage.removeItem("ADD_SIGN_BEHIND_STYLE");
        window.localStorage.removeItem("freeFlowActivityInfos");
        window.localStorage.removeItem("SETBTNVAL");
        window.localStorage.removeItem('ANNOUCE_URL');
    }

    PageLogic.prototype = {
        onPageResume: function () {
            this.applyHistory = {};
            this.item = [];
            this.loadData();
        },
        setHeader: function (processMapIdUrl,iformBrowserUrl) {
            
        },
        loadData: function () {
            var _this = this;
            this.pageview.showLoading({
                text: language.formTips.onLoading,
                timeout: 8000,
                reLoadCallBack: function () {
                    _this._loadData();
                }
            });
            _this._loadData();
        },
        _loadData: function () {
            var _this = this,
                listAjaxConfig = {
                    url: '/process/getApply',
                    type: 'POST',
                    data: {
                        instId: this.pageview.params.instId || '',
                        taskId: this.pageview.params.taskId || '',
                        copyToId: this.pageview.params.copyToId || '',
                        category: this.pageview.params.category || ''
                    },
                    success: function (listData) {
                        _this.applyHistory = {};
                        _this.detailData = listData.data;
                        _this.pageview.hideLoading(true);
                        _this.item=[];
                        _this.sourceInfoFlag=true;

                        if(listData.data&&listData.data.inst){
                            _this.processMapId=listData.data&&listData.data.inst&&listData.data.inst.id;
                            _this.processMapDefId=listData.data&&listData.data.inst&&listData.data.inst.processDefinitionId;
                            var processMapIdUrl=location.origin+'/approve-app/sso/webDiagram/'+_this.processMapDefId+'/'+_this.processMapId;
                            var iformBrowserUrl='';
                            if(listData.data.inst.iforms&&listData.data.inst.iforms[0]){
                                iformBrowserUrl=location.origin+'/approve-app/sso/webFormPage/iformBrowse?pkBo='+listData.data.inst.iforms[0].pk_bo+'&pkBoins='+listData.data.inst.formDataList[0].pk_boins;
                            }
                            if(_this.processMapDefId.indexOf('processKey')===-1&&_this.processMapDefId.indexOf('tempSave')===-1){
                                _this.setHeader(processMapIdUrl,iformBrowserUrl);
                            } else if(_this.processMapDefId.indexOf('processKey')>0||_this.processMapDefId.indexOf('tempSave')===-1){
                                _this.setHeader('',iformBrowserUrl);
                            }
                        }


                        if (listData.data) {
                            _this.processDefInsIdTempSave = listData.data.inst.id;
                            window.gonggaoUrl = listData.data.inst.variables;
                        }
                        /**
                         * 会议公文详情展示
                         */
                        if (listData.data&&listData.data.inst&&listData.data.inst.variables) {
                            var tempVariables = listData.data.inst.variables;
                            for(var ii=0;ii<tempVariables.length;ii++){
                                if(tempVariables[ii].name==="sourceInfo"){
                                    _this.sourceInfoFlag=false;
                                    _this.pageview.showLoading({
                                        text: language.formTips.onLoading,
                                        timeout: 1000,
                                    });
                                    $('.iframe_pub').show();
                                    $('.detail_repeat').hide();
                                    var value=JSON.parse(tempVariables[ii].value);
                                    var url=value.url;
                                    if(value.meetingId&&value.source==='meeting'){
                                        url=url+'?qzId='+value.qzId+'&meetingId='+value.meetingId+'&memberId='+value.memberId;
                                    }
                                    var iframe="<iframe src="+url+" style='width: 100%;border:none;'></iframe>";
                                    $('.iframe_pub').append(iframe);
                                }
                            }
                        }
                        if(listData.data&&listData.data.inst&&listData.data.inst.iforms&&listData.data.inst.iforms[0]&&listData.data.inst.iforms[0].jsontemp){
                            _this.hideProcessAnnex=JSON.parse(listData.data.inst.iforms[0].jsontemp).form.hideProcessAnnex;
                        }
                        setTimeout(function () {
                            _this.pageview.hideLoading(true);
                        },4000);
                        if (listData.code === 0) {
                            if (_this.detailData.dataCollection) {
                                _this.pageview.refs.segment.$el.hide();
                            } else {
                                _this.pageview.refs.segment.$el.show();
                            }

                            var EsnDocumentUrl=listData.data.inst.variables.some(function (item,index) {
                                return item.name==="EsnDocumentUrl";
                            });
                            if(EsnDocumentUrl){
                                _this.pageview.refs.segment.$el.hide();
                                _this.pageview.refs.segmentdocument.$el.show();
                            }

                            if(_this.documentMobile){
                                _this.pageview.refs.segment.$el.hide();
                                _this.pageview.refs.segmentdocument.$el.hide();
                                _this.pageview.refs.segmentdocumentmobile.$el.show();
                            }

                            window.needRefresCopyApproveListData = true;
                            var viewpager = _this.pageview.refs.top_view.components.viewpager;
                            _this.pageview.delegate('userinfo_name', function (target) {
                                _this.instName = listData.data.inst.name;
                                target.setText(listData.data.inst.name);
                            });
                            var jsonList = [];
                            var keyFeaturesList = [];
                            var jsonContent = {};
                            var fields = listData.data.inst.bpmForms ? listData.data.inst.bpmForms[0].fields : [];
                            for (var j = 0; j < fields.length; j++) {
                                var keyFeatures = {};
                                jsonContent = {};
                                var fieldContent = JSON.parse(fields[j].fieldContent);
                                var variableContent = JSON.parse(fields[j].variableContent);
                                var name = variableContent.name ? variableContent.name : language.nameIsNull;
                                jsonContent.title = name + ": ";
                                jsonContent.type = variableContent.type.name;
                                if (variableContent.type.kind) {
                                    jsonContent.kind = variableContent.type.kind;
                                }
                                if (listData.data.inst.formDataList && listData.data.inst.formDataList.length > 0) {
                                    jsonContent.content = listData.data.inst.formDataList[0][fields[j].tableFieldName];

                                    //多选是未选择时显示为空  xingjc增加 2017-4-26
                                    if ('select' === jsonContent.type && '[]' === jsonContent.content) {
                                        jsonContent.content = '';
                                    }

                                }
                                if (fieldContent.keyFeatures) {
                                    var content = jsonContent.content;
                                    if (jsonContent.type === "boolean") {
                                        content = jsonContent.content === "1" ? "是" : "否";
                                    }
                                    keyFeatures.text = jsonContent.title + content;
                                }
                                if (!$.isEmptyObject(keyFeatures)) {
                                    keyFeaturesList.push(keyFeatures);
                                }
                                jsonList.push(jsonContent);
                            }
                            if (fields.length === 0 && listData.data.inst.iforms) {

                                jsonList = analysis.getAnalysis_ifroms(listData.data.inst.iforms, listData.data.inst.formDataList, listData.data.inst.currentActivityId,listData.data.inst.formDataExtraInfo);
                            }


                            var subFormsList = [];
                            var subForms = listData.data.inst.bpmForms && listData.data.inst.bpmForms[0].subForms ? listData.data.inst.bpmForms[0].subForms : [];
                            for (var subIdex = 0; subIdex < subForms.length; subIdex++) {
                                //同一个子表多条的情况通过子表数值map来判断 xingjjc
                                var formDataList = listData.data.inst.formDataList && listData.data.inst.formDataList[0][subForms[subIdex].tableName];
                                for (var _subFormIndex = 0; _subFormIndex < formDataList.length; _subFormIndex++) {
                                    var subFormsJson = {};
                                    subFormsJson.title = subForms[subIdex].title;
                                    subFormsJson.item = [];
                                    subFormsJson.num = _subFormIndex + 1;
                                    var _fields = subForms[subIdex] ? subForms[subIdex].fields : [];
                                    for (var s_idex = 0; s_idex < _fields.length; s_idex++) {
                                        var subFormsContent = {};
                                        var s_variableContent = JSON.parse(_fields[s_idex].variableContent);
                                        var s_name = s_variableContent.name ? s_variableContent.name : language.nameIsNull;
                                        var s_type = s_variableContent.type.name;
                                        if (s_variableContent.type.kind) {
                                            subFormsContent.kind = s_variableContent.type.kind;
                                        }
                                        var _formdata = formDataList.length > 0 && formDataList[_subFormIndex][_fields[s_idex].tableFieldName] ? formDataList[_subFormIndex][_fields[s_idex].tableFieldName] : "";
                                        //多选是未选择时显示为空  xingjc增加 2017-4-26
                                        if ('select' === s_type && '[]' === _formdata) {
                                            _formdata = '';
                                        }
                                        subFormsContent.name = s_name + "：";
                                        subFormsContent.type = s_type;
                                        subFormsContent.content = _formdata;
                                        subFormsJson.item.push(subFormsContent);
                                    }
                                    subFormsList.push(subFormsJson);
                                }
                            }

                            if (listData.data.inst.keyFeature) {
                                var json = [];
                                var keyFeature = listData.data.inst.keyFeature;

                                //todo zhenyu 将列表页和详情页关键属性处理代码合成一个放在common.js中减少重复代码
                                c.processKeyFeature(json,keyFeature,keyFeaturesList);

                                _this.pageview.delegate('userinfo_repeat', function (target) {
                                    if (json && json.length > 0) {
                                        target.bindData(json);
                                    } else {
                                        target.$el.css({display: 'none'});
                                    }
                                });
                            }

                            //创建按钮
                            _this.applyHistory.taskId = _this.pageview.params.taskId;
                            _this.applyHistory.nodeFormID = listData.data.nodeFormID;
                            _this.applyHistory.currentUserId = listData.data.currentUserId;
                            _this.applyHistory.creator = listData.data.creator;
                            _this.applyHistory.currentMemberId = listData.data.currentMemberId;
                            _this.applyHistory.currentUserName = listData.data.currentUserName;
                            _this.applyHistory.copyToEndTime = listData.data.copyToEndTime;
                            _this.applyHistory.instData = listData.data.inst;
                            _this.applyHistory.formDataList = listData.data.inst.formDataList || [];//表单数据
                            _this.applyHistory.variableData = listData.data.inst.variables;
                            _this.applyHistory.taskList = listData.data.inst.historicTasks || [];
                            _this.applyHistory.instanceTodoTasks = [];
                            _this.applyHistory.instanceDoneTasks = [];
                            _this.applyHistory.subFormDatas = [];
                            _this.applyHistory.bpmActivityForms = listData.data.inst.bpmActivityForms || []; //追加单据
                            _this.applyHistory.formDataMap = listData.data.inst.formDataMap || []; //追加单据数据
                            _this.applyHistory.formKey = _this.applyHistory.taskList.formKey;
                            _this.applyHistory.editFlag = listData.data.editFlag;
                            var historicActivityInstances = listData.data.inst.historicActivityInstances;
                            _this.isFromIM=window.location.href.indexOf('curPage');
                            for (var h_idex = 0; h_idex < historicActivityInstances.length; h_idex++) {
                                if (historicActivityInstances[h_idex].activityType === "startEvent") {
                                    _this.applyHistory.photo = historicActivityInstances[h_idex].pic;
                                    _this.applyHistory.name = historicActivityInstances[h_idex].userName;
                                    _this.jumpToRejectActivity= historicActivityInstances[h_idex].activity.properties.documentation;
                                    break;
                                }
                            }
                            _this.pageview.delegate('user_icon', function (target) {
                                if (_this.applyHistory.photo && _this.applyHistory.photo.length > 4) {
                                    target.setSrc(_this.applyHistory.photo);
                                } else {
                                    target.setTitle(_this.applyHistory.name);
                                }
                            });
                            if (listData.data.inst.bpmForms && listData.data.inst.bpmForms.length > 0) {
                                _this.applyHistory.mainForm = listData.data.inst.bpmForms[0];
                                _this.applyHistory.formId = listData.data.inst.bpmForms[0].id;
                            } else if (listData.data.inst.iforms) {
                                _this.applyHistory.iForms = listData.data.inst.iforms[0];
                                _this.applyHistory.formId = listData.data.inst.iforms[0].pk_bo;
                            }
                            _this.initFormData();

                            if (_this.applyHistory.mainForm) {
                                //主表单上可能有分支buttons属性
                                var btns = _this.applyHistory.mainForm.buttons;
                                if (btns) {
                                    // console.debug("当前任务包含了分支=" + btns);
                                    _this.applyHistory.taskBtnVars = JSON.parse(btns);
                                }
                            }
                            if (_this.applyHistory.currentUserId) {
                                // console.log("当前人是:" + _this.applyHistory.currentUserId + ",当前参数任务是:" + _this.applyHistory.taskId);
                                $.each(_this.applyHistory.taskList, function (idx, task) {
                                    // console.debug("查找当前任务:taskId:" + task.id + ",assignee=" + task.assignee + ",endtime=" + task.endTime + ",deleteReason=" + task.deleteReason + "currentUserId:" + _this.applyHistory.currentUserId);

                                    if (task.deleteReason !== "deleted") {
                                        if (task.endTime === null || task.endTime.indexOf('9999') > -1) {
                                            _this.applyHistory.instanceTodoTasks.push(task);
                                            if (task.id === _this.applyHistory.taskId && task.assignee === _this.applyHistory.currentUserId) {
                                                // console.debug("找到当前用户" + _this.applyHistory.currentUserId + "的当前任务" + task.id + ",是1个审批任务");
                                                _this.applyHistory.currentTodoTask = task;
                                                _this.applyHistory.currentUserName = task.userName;
                                            } else if (task.processInstanceId === _this.applyHistory.taskId && task.assignee === _this.applyHistory.currentUserId) {
                                                _this.applyHistory.currentTodoTask = task;
                                                _this.applyHistory.currentUserName = task.userName;
                                            }
                                        } else {

                                            _this.applyHistory.instanceDoneTasks.push(task);
                                            if (task.id === _this.applyHistory.taskId && task.assignee === _this.applyHistory.currentUserId) {
                                                // console.debug("找到当前用户" + _this.applyHistory.currentUserId + "的当前任务" + task.id + ",是1个已办任务");
                                                _this.applyHistory.currentDoneTask = task;
                                                _this.applyHistory.currentUserName = task.userName;
                                            }
                                        }
                                    }
                                });
                            }
                            // fixme 这个是追加单据，需要加判断
                            window.setTimeout(function () {
                                if (viewpager.curPageViewItem.contentInstance.refs.moreBill) {
                                    if (_this.applyHistory.bpmActivityForms.length === 0) {
                                        viewpager.curPageViewItem.contentInstance.refs.moreBill.$el.hide();
                                    } else {
                                        viewpager.curPageViewItem.contentInstance.refs.moreBill.$el.show();
                                    }
                                }
                            }, 100);
                            _this.getSort();

                            if(!_this.pageview.params.fromReference){
                                window._applyHistory = _this.applyHistory;
                            }
                            window.setTimeout(function () {
                                if (viewpager.curPageViewItem.contentInstance.refs.subform_repeat) {
                                    viewpager.curPageViewItem.contentInstance.refs.subform_repeat.bindData(subFormsList);
                                }
                                if (viewpager.curPageViewItem.contentInstance.refs.detail_repeat) {
                                    viewpager.curPageViewItem.contentInstance.refs.detail_repeat.bindData(jsonList);
                                } else if (viewpager.curPageViewItem.contentInstance.refs.middle_flow_repeat) {
                                    viewpager.curPageViewItem.contentInstance.refs.middle_flow_repeat.bindData(_this.applyHistory.processInstances);
                                }

                                if (viewpager.curPageViewItem.contentInstance.refs.copyuser_repeat&&_this.sourceInfoFlag) {
                                    var copyUserParticipants=JSON.parse(window.localStorage.getItem("copyUserParticipants"));
                                    if(copyUserParticipants){

                                        if(!_this.applyHistory.instData.copyUserParticipants){
                                            _this.applyHistory.instData.copyUserParticipants=copyUserParticipants;
                                        }else{
                                            _this.applyHistory.instData.copyUserParticipants=_this.applyHistory.instData.copyUserParticipants.concat(copyUserParticipants);
                                        }
                                        viewpager.curPageViewItem.contentInstance.refs.copyuser_item.$el.show();
                                        viewpager.curPageViewItem.contentInstance.refs.copyuser_repeat.bindData(_this.applyHistory.instData.copyUserParticipants);
                                    }
                                    if (_this.applyHistory.instData.copyUserParticipants) {
                                        viewpager.curPageViewItem.contentInstance.refs.copyuser_item.$el.show();
                                        viewpager.curPageViewItem.contentInstance.refs.copyuser_repeat.bindData(_this.applyHistory.instData.copyUserParticipants);
                                    }
                                    if (_this.detailData.inst.processDefinitionId.indexOf('tempSave') > -1 && !_this.detailData.dataCollection) {
                                        viewpager.curPageViewItem.contentInstance.refs.copyuser_item.$el.show();
                                        viewpager.curPageViewItem.contentInstance.refs.copyuser_repeat.bindData(_this.applyHistory.instData.copyUserParticipants);
                                    }
                                }
                            }, 100);
                            _this.assigneee=JSON.parse(window.localStorage.getItem("ADD_SIGN_BEHIND"));
                            _this.circulator=JSON.parse(window.localStorage.getItem("CIRCULATE"));
                            if(_this.assigneee){
                                viewpager.curPageViewItem.contentInstance.refs.assignbehind_item.$el.show();
                                viewpager.curPageViewItem.contentInstance.refs.assignbehind_repeat.bindData(_this.assigneee);
                            }
                            if(_this.circulator){
                                viewpager.curPageViewItem.contentInstance.refs.circulate_item.$el.show();
                                viewpager.curPageViewItem.contentInstance.refs.circulate_repeat.bindData(_this.circulator);
                            }
                            if (_this.applyHistory.instData.deleteReason !== "WITHDRAW_SUBMIT") {
                                _this.pageview.delegate('result_logo', function (target) {
                                    if (!_this.detailData.dataCollection) {
                                        _this.pageview.refs.result_text.$el.hide();
                                        //判断单据状态
                                        if (_this.applyHistory.instData.endTime && _this.applyHistory.instData.endTime.indexOf("9999") === -1) {
                                            //taskKey="结束";
                                            if (_this.applyHistory.instData.deleteReason) {
                                                if(_this.applyHistory.instData.deleteReason==="jumpEnd"){
                                                    target.$el.find('img').attr('src', language.iconUrl.agreee);
                                                }else{
                                                    target.$el.find('img').attr('src', language.iconUrl.refuse);
                                                }
                                                // console.log("驳回");

                                                setTimeout(function () {
                                                    target.$el.show();
                                                }, 300);
                                                //动画效果
                                                setTimeout(function () {
                                                    target.$el.css({'-webkit-transform': 'scale(.5)', opacity: '1'});
                                                }, 450);
                                            } else {
                                                // console.log("完成");
                                                setTimeout(function () {
                                                    target.$el.show();
                                                }, 300);
                                                //动画效果
                                                setTimeout(function () {
                                                    target.$el.css({'-webkit-transform': 'scale(.5)', opacity: '1'});
                                                }, 450);
                                            }
                                        } else if(_this.applyHistory.instData.deleteReason==="REJECTTOSTART"){
                                            _this.pageview.refs.result_text.innerText.css("color", "#E7A757");
                                            _this.pageview.refs.result_text.innerText.html(language.status.inApproval);
                                            _this.pageview.refs.result_text.$el.show();
                                            // target.$el.find('img').attr('src', language.iconUrl.refuse);
                                            // setTimeout(function () {
                                            //     target.$el.show();
                                            // }, 300);
                                            //动画效果
                                            // setTimeout(function () {
                                            //     target.$el.css({'-webkit-transform': 'scale(.5)', opacity: '1'});
                                            // }, 450);
                                        }else {
                                            _this.pageview.refs.result_text.innerText.css("color", "#E7A757");
                                            _this.pageview.refs.result_text.innerText.html(language.status.inApproval);
                                            _this.pageview.refs.result_text.$el.show();
                                            if (_this.applyHistory.currentTodoTask) {
                                                console.log("待办");
                                                // _this.pageview.refs.result_text.innerText.html("审批中");
                                                // console.log();
                                            } else {
                                                if (_this.applyHistory.currentUserType === "auditor") {
                                                    console.log("已流转");
                                                    // _this.pageview.refs.result_text.innerText.html("审批中");
                                                } else {
                                                    console.debug("进行中");
                                                    // _this.pageview.refs.result_text.innerText.html("审批中");
                                                }
                                            }
                                        }
                                    }
                                });
                            } else {
                                _this.pageview.refs.result_text.$el.hide();
                            }

                            //如果是加签任务则也不能创建菜单因为已经加签给别人了，当前人虽然还有任务但是不能再审批
                            var taskAuditDesc = _this.applyHistory.currentTodoTask && _this.applyHistory.currentTodoTask.taskAuditDesc;
                            var setBtnVal={},defaultComments={};
                            var currentTodoTask=_this.applyHistory.currentTodoTask;
                            var currentDoneTask=_this.applyHistory.currentDoneTask;

                            var jsontemp=_this.applyHistory.iForms?JSON.parse(_this.applyHistory.iForms.jsontemp):{};
                            if(currentTodoTask&&currentTodoTask.activity&&jsontemp.form&&jsontemp.form.formBtnVal&&jsontemp.form.formBtnVal[currentTodoTask.activity.id]){
                                setBtnVal=jsontemp.form.formBtnVal[currentTodoTask.activity.id]||{};
                            }else if(currentDoneTask&&currentDoneTask.activity&&jsontemp.form&&jsontemp.form.formBtnVal&&jsontemp.form.formBtnVal[currentDoneTask.activity.id]) {
                                setBtnVal=jsontemp.form.formBtnVal[currentDoneTask.activity.id]||{};
                            }

                            if(_this.applyHistory.currentUserId === _this.applyHistory.creator&&jsontemp.form&&jsontemp.form.formBtnVal){
                                if (this.pageviewInstance.config.$$params.curPage === "myapprove"||this.pageviewInstance.config.$$params.curPage==='form'){
                                    setBtnVal=jsontemp.form.formBtnVal.fillIn||{};
                                }
                            }

                            if(currentTodoTask&&currentTodoTask.activity&&jsontemp.form&&jsontemp.form.defaultComment&&jsontemp.form.defaultComment[currentTodoTask.activity.id]){
                                defaultComments=jsontemp.form.defaultComment[currentTodoTask.activity.id]||{};
                            }else if(currentDoneTask&&currentDoneTask.activity&&jsontemp.form&&jsontemp.form.formBtnVal&&jsontemp.form.formBtnVal[currentDoneTask.activity.id]) {
                                defaultComments=jsontemp.form.defaultComment[currentDoneTask.activity.id]||{};
                            }
                            window.localStorage.setItem('DEFAULTCOMMENTS',JSON.stringify(defaultComments));

                            _this.setBtnVal=setBtnVal;
                            var counterSigning=false;
                            try{
                                if(_this.applyHistory.currentTodoTask){
                                    var counterSigningVariables=_this.applyHistory.currentTodoTask.variables;
                                    if (counterSigningVariables.length !== 0) {
                                        counterSigningVariables.forEach(function (item, index) {
                                            if (item.name == "counterSigning" && item.value) {
                                                counterSigning=true;
                                            }
                                        });
                                    }
                                }
                            }catch(e){
                                console.log(e);
                            }

                            if (counterSigning) {
                                console.warn("当前任务是加签任务则不能再做审批");
                                // _this.item.push({label: "任务加签中，请等待加签审批结果"});
                                _this.item.push({label: setBtnVal.recallAddApprove||language.formAction.withdrawApproval,type:'recall'});
                                // $("#auditMenu").html("<div class='font-size-3 tab1-rigth-22'>任务加签中，请等待加签审批结果</div>");
                            } else {
                                /**
                                 * 每个任务是否支持 驳回、改派、加签、指派
                                 * 任务的审批有同意或者分支两种方式。
                                 * 如果没有分支，则显示同意(如果支持指派则显示指派 )按钮，
                                 *    然后根据 是否支持 驳回、改派、加签 生成其他按钮。
                                 * 如果有分支，则显示分支项目按钮，
                                 *    然后根据 是否支持 驳回、改派、加签 生成其他按钮。
                                 */
                                if (_this.applyHistory.currentTodoTask) {
                                    var activity = _this.applyHistory.currentTodoTask.activity;
                                    var variables = _this.applyHistory.currentTodoTask.variables;
                                    var rejectable = false, delegateable = false, addsignable = false,addsignBehindAble=false,jumpAble=false,circulateAble;//assignable=false,
                                    _this.rejectToEnd=true;
                                    if (activity !== null && activity.properties !== null) {
                                        //  assignable = activity.properties.assignAble;
                                        rejectable = activity.properties.rejectAble;
                                        delegateable = activity.properties.delegateAble;
                                        addsignable = activity.properties.addsignAble;
                                        addsignBehindAble = activity.properties.addsignBehindAble;
                                        jumpAble = activity.properties.jumpAble;
                                        circulateAble = activity.properties.circulate;
                                        _this.rejectToEnd=activity.properties.rejectToEnd==="false"?false:true;
                                    }
                                    //判断当前审批人是不是被加签的user,如果是，则他不能进行加签操作，判断是不是被加签的属性name:createType value:countSignParrallel @huangzhy 20170612
                                    var jumpSignAble=true;

                                    if (variables.length !== 0) {
                                        variables.forEach(function (item, index) {
                                            if (item.name == "createType" && item.value == "countSignParrallel") {
                                                // addsignable = false;
                                                // rejectable = false;
                                                jumpSignAble=false;
                                                delegateable = false;
                                            }
                                        });
                                    }

                                    if (this.pageviewInstance.config.$$params.curPage === "waitmeapprove" || !this.pageviewInstance.config.$$params.curPage) {
                                        if(_this.applyHistory.currentTodoTask.activity.properties.approveType&&_this.applyHistory.currentTodoTask.activity.properties.approveType==="circulate"){
                                            _this.item.push({label: setBtnVal.agree||language.formAction.read,type:'agree'});
                                        }else{
                                            if(!jumpSignAble){
                                                _this.item.push({label: setBtnVal.agreeAddApprove||language.formAction.agree,type:'agree'});
                                            }else {
                                                _this.item.push({label: setBtnVal.agree||language.formAction.agree,type:'agree'});
                                            }
                                        }

                                        if (_this.applyHistory.editFlag) {//TODO huangzhy 编辑按钮位置放在同意后面
                                            if (!_this.applyHistory.instData.endTime) {
                                                //撤回审批和编辑不共存
                                                var showEdit = false;
                                                for (var i = 0; i < _this.item.length; i++) {
                                                    // showEdit = _this.item[i].label === "撤回审批" ? false : true;
                                                    showEdit = (_this.item[i].label === "撤回"||_this.item[i].label === "Withdraw Approval") ? false : true;
                                                }
                                                if (showEdit) {
                                                    _this.item.push({label: setBtnVal.edit||language.formAction.edit, id: _this.applyHistory.instData.id,type:'edit'});
                                                }
                                            }
                                        }

                                        //if ('nc' != this.data.category)// TODO xingjjc 临时增加 modify 20171130 控制可否抄送
                                        if(_this.applyHistory.currentTodoTask.activity.properties.approveType&&_this.applyHistory.currentTodoTask.activity.properties.approveType==="circulate"&&_this.applyHistory.currentTodoTask.activity.properties.circulateCopyTo&&_this.applyHistory.currentTodoTask.activity.properties.circulateCopyTo==='true'){
                                            _this.item.push({label: setBtnVal.copyto||language.formAction.copy,type:'copyto'});
                                        }else{
                                            if(_this.applyHistory.currentTodoTask.activity.properties.copyToAble!=="false"){
                                                if(!jumpSignAble){
                                                    _this.item.push({label: setBtnVal.copytoAddApprove||language.formAction.copy,type:'copyto'});
                                                }else{
                                                    _this.item.push({label: setBtnVal.copyto||language.formAction.copy,type:'copyto'});
                                                }
                                            }
                                        }

                                        if (circulateAble) {
                                            _this.item.push({label: language.formAction.circulate,type:'circulate'});
                                        }
                                        // if (rejectable) {  // TODO xingjjc 临时改

                                        if (rejectable || 'nc' == this.data.category) {
                                            if(!jumpSignAble){
                                                _this.item.push({label: setBtnVal.rejectAddApprove||language.formAction.reject,type:'reject'});
                                            }else {
                                                _this.item.push({label: setBtnVal.reject||language.formAction.reject,type:'reject'});
                                            }

                                        }
                                        if (jumpAble || 'nc' == this.data.category) {
                                            if(jumpSignAble){
                                                _this.item.push({label: setBtnVal.jump||language.formAction.jumpTo,type:'jump'});
                                            }
                                        }
                                        if (delegateable) {
                                            _this.item.push({label: setBtnVal.reassign||language.formAction.reassign,type:'reassign'});
                                        }
                                        if (addsignable) {
                                            if(!jumpSignAble){
                                                _this.item.push({label: setBtnVal.addApproveAddApprove||language.formAction.assignBefore,type:'addApprove'});
                                            }else{
                                                _this.item.push({label: setBtnVal.addApprove||language.formAction.assignBefore,type:'addApprove'});
                                            }
                                        }

                                        if (addsignBehindAble&&((_this.applyHistory.currentTodoTask.taskAuditDesc.indexOf("被加签")===-1&&_this.applyHistory.currentTodoTask.taskAuditDesc.indexOf("Added By")===-1)||!_this.applyHistory.currentTodoTask.taskAuditDesc)) {
                                            _this.item.push({label: setBtnVal.addBehindApprove||language.formAction.assignAfter,type:'addBehindApprove'});
                                        }
                                        // 审批转任务按钮 @huangzhy 2017/10/31
                                        if(_this.applyHistory.currentTodoTask.activity.properties.rotatabletask){
                                            _this.item.push({label: language.formAction.convertToEsnTask,type:'toTask'});
                                        }
                                    }

                                } else {
                                    // if (_this.applyHistory.currentDoneTask !== null && _this.applyHistory.instanceTodoTasks.length > 0) {
                                    var lastDoneTask = _this.applyHistory.instanceDoneTasks[_this.applyHistory.instanceDoneTasks.length - 1];
                                    if(_this.applyHistory.currentDoneTask&&_this.applyHistory.currentDoneTask.activity.properties.rotatabletask){
                                        _this.item.push({label: language.formAction.convertToEsnTask,type:'toTask'});
                                    }
                                    if (lastDoneTask && _this.applyHistory.currentDoneTask && _this.applyHistory.currentDoneTask.id === lastDoneTask.id && lastDoneTask.deleteReason === "completed") {
                                        var lableTxt = _this.applyHistory.currentDoneTask.taskAuditDesc ? language.formAction.withdrawApproval : language.formAction.agree;
                                        var type = _this.applyHistory.currentDoneTask.taskAuditDesc ? "recall" : 'agree';
                                        _this.item.push({label: setBtnVal.recall||lableTxt,type:type});
                                        // if(_this.applyHistory.iForms&&_this.applyHistory.iForms.processKey!=="freeflow"){
                                        //     _this.item.push({label: lableTxt});
                                        // }

                                    }

                                }
                                // 改派后可撤回控制
                                if(_this.applyHistory.currentDoneTask&&_this.applyHistory.currentDoneTask.taskAuditDesc==='改派'){
                                    _this.item.push({label: setBtnVal.recall||language.formAction.withdrawApproval,type:'recall'});
                                }
                                if (_this.applyHistory.taskBtnVars && _this.applyHistory.taskBtnVars.length > 0) {
                                    //因为指派属于同意类型,所以对指派的判断放在分支前面
                                    $.each(_this.applyHistory.taskBtnVars, function (idx, fenzhiBtn) {
                                        _this.item.push({label: fenzhiBtn});
                                    });
                                }
                                if (!_this.applyHistory.copyToEndTime) {
                                    if (_this.applyHistory.nodeFormID) {
                                        if (!_this.applyHistory.copyToEndTime) {
                                            _this.item.push({label: setBtnVal.edit||language.formAction.edit, id: _this.applyHistory.nodeFormID,type:'edit'});
                                        }
                                        if (!_this.applyHistory.formKey) {
                                            window.setTimeout(function () {
                                                if (viewpager.curPageViewItem.contentInstance.refs.btnAddDoc) {
                                                    viewpager.curPageViewItem.contentInstance.refs.btnAddDoc.$el.show();
                                                }
                                            }, 100);
                                        }
                                    } else {
                                        window.setTimeout(function () {
                                            if (viewpager.curPageViewItem.contentInstance.refs.btnAddDoc) {
                                                viewpager.curPageViewItem.contentInstance.refs.btnAddDoc.$el.hide();
                                            }
                                        }, 100);
                                    }
                                    //huangzhy @20170704 当该表单为我发起中的暂存态或者驳回到草稿态的时候，显示可编辑按钮
                                    if (_this.detailData.inst.processDefinitionId.indexOf('tempSave') > -1) {
                                        if(_this.isFromIM>-1){
                                            _this.item.push({label: setBtnVal.edit||language.formAction.edit, id: _this.applyHistory.instData.id,type:'edit'});
                                            _this.item.push({label: setBtnVal.delProcess||language.formAction.deleteForm, id: _this.applyHistory.instData.id,type:'delProcess'});
                                        }
                                    }
                                }
                                //发起人撤回提交按钮 @20170717 0720增加对数据收集不显示撤回按钮
                                if (_this.applyHistory.instData.withdrawAll) {
                                    if (_this.applyHistory.currentUserId === _this.applyHistory.creator && _this.detailData.inst.processDefinitionId.indexOf('tempSave') === -1 && _this.detailData.inst.iforms&&_this.detailData.inst.iforms[0].processKey !== "processKey" && _this.applyHistory.instData.deleteReason !== "WITHDRAW_SUBMIT" && _this.applyHistory.instanceTodoTasks.length !== 0) {
                                        if ((!this.pageviewInstance.config.$$params.curPage) || (this.pageviewInstance.config.$$params.curPage !== "copyapprove" && this.pageviewInstance.config.$$params.curPage !== "waitmeapprove")) {
                                            if(_this.isFromIM>-1){
                                                if(_this.applyHistory.instData.deleteReason!=='jumpEnd'){
                                                    _this.item.push({label: setBtnVal.withdraw||language.formAction.withdrawSubmission,type:'withdraw'});
                                                }
                                            }
                                        }
                                    }
                                } else {
                                    if (_this.applyHistory.currentUserId === _this.applyHistory.creator && _this.detailData.inst.processDefinitionId.indexOf('tempSave') === -1 && _this.applyHistory.instData.deleteReason !== "WITHDRAW_SUBMIT" && _this.detailData.inst.iforms && _this.detailData.inst.iforms[0].processKey !== "processKey"&&_this.applyHistory.instData.deleteReason !== "REJECTTOSTART"&&_this.applyHistory.instData.deleteReason !== "ACTIVITI_DELETED" ) {
                                        if ((!this.pageviewInstance.config.$$params.curPage) || (this.pageviewInstance.config.$$params.curPage !== "copyapprove" && this.pageviewInstance.config.$$params.curPage !== "waitmeapprove")) {
                                            if(!_this.detailData.inst.hasTaskFinished){
                                                if(_this.isFromIM>-1){
                                                    if(_this.applyHistory.instData.deleteReason!=='jumpEnd'){
                                                        _this.item.push({label: setBtnVal.withdraw||language.formAction.withdrawSubmission,type:'withdraw'});
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                                // _this.applyHistory.instData.withdrawAll
                                if (_this.applyHistory.currentUserId === _this.applyHistory.instData.startUserId && _this.applyHistory.instData.deleteReason && this.pageviewInstance.config.$$params.curPage === "myapprove") {
                                    if (_this.applyHistory.instData.deleteReason === "REJECTTOSTART_DELETED"||_this.applyHistory.instData.deleteReason==="REJECTTOSTART") {
                                        // _this.item.push({label: "编辑"});
                                    } else {
                                        if(_this.applyHistory.instData.deleteReason!=='jumpEnd'){
                                            _this.item.push({label: setBtnVal.reSubmit||language.formAction.resubmit,type:'reSubmit'});
                                            _this.item.push({label: setBtnVal.delProcess||language.formAction.deleteForm,type:'delProcess'});
                                        }
                                    }

                                }
                                if (_this.applyHistory.currentUserId === _this.applyHistory.instData.startUserId && _this.applyHistory.instData.deleteReason&&this.pageviewInstance.config.$$params.curPage!=="waitmeapprove") {
                                    if (_this.applyHistory.instData.deleteReason === "REJECTTOSTART_DELETED"||_this.applyHistory.instData.deleteReason==="REJECTTOSTART") {
                                        if(_this.isFromIM>-1){
                                            _this.item.push({label: setBtnVal.edit||language.formAction.edit,type:'edit'});
                                            _this.item.push({label: setBtnVal.delProcess||language.formAction.deleteForm,type:'delProcess'});
                                        }
                                    } else {
                                        // _this.item.push({label: "重新提交"});
                                    }
                                }
                                if(this.pageviewInstance.config.$$params.curPage === "myapprove"){
                                    _this.item.push({label: setBtnVal.duplicateForm||language.formAction.copyForm,type:'duplicateForm'});
                                }
                                //FIXME:xiba测试
                                // _this.item.push({label: "编辑", id: _this.applyHistory.nodeFormID});
                            }
                            if(!_this.documentMobile){
                                _this.initBtn();
                            }
                        } else {
                            _this.pageview.showTip({text: listData.msg, duration: 2000});
                        }
                    },
                    error: function (listData) {
                    }
                };

            this.pageview.ajax(listAjaxConfig);
        },
        //显示按钮
        initBtn: function () {
            for (var idx = 0; idx < this.item.length; idx++) {
                if (this.item[idx].label.indexOf("撤回申请") > -1) {
                    this.item.splice(idx, 1);
                    break;
                }
            }
            if (this.item.length > 4) {
                var btnItem = [];
                var moreItem = [];
                for (var itemIdx = 0; itemIdx < this.item.length; itemIdx++) {
                    if (itemIdx >= 3) {
                        moreItem.push(this.item[itemIdx]);
                        // item.remove(itemIdx);
                    } else {
                        btnItem.push(this.item[itemIdx]);
                    }
                }
                if (btnItem.length === 0) {
                    this.pageview.refs.buttonGroup.$el.hide();
                    this.pageview.refs.buttonGroup.$el.css({"background-color": "rgb(247, 247, 247)"});
                    this.pageview.refs.buttonGroup.$el.css({"border-top": "1px solid #eee"});
                } else {
                    this.pageview.refs.buttonGroup.$el.show();
                    this.pageview.refs.buttonGroup.$el.css({"border-top": "1px solid #eee"});
                    this.pageview.refs.bottomToolBar.$el.css({"background-color": "rgb(255, 255, 255)"});
                    this.pageview.refs.buttonGroup.$el.css({"background-color": "rgb(255, 255, 255)"});
                }
                this.pageview.refs.moreRepeat.bindData(moreItem);
                this.pageview.refs.buttonGroup.bindData(btnItem);

                this.pageview.refs.bottomToolBar.$el.show();
                this.pageview.refs.splitline.$el.show();
                this.pageview.refs.moreBtn.$el.show();
            } else {
                if (this.item.length === 0) {
                    this.pageview.refs.bottomToolBar.$el.hide();
                    this.pageview.refs.buttonGroup.$el.css({"background-color": "rgb(247, 247, 247)"});
                    this.pageview.refs.buttonGroup.$el.css({"border-top": "rgb(247, 247, 247)"});

                } else {
                    this.pageview.refs.bottomToolBar.$el.show();
                    this.pageview.refs.buttonGroup.$el.css({"background-color": "rgb(255, 255, 255)"});
                    this.pageview.refs.bottomToolBar.$el.css({"background-color": "rgb(255, 255, 255)"});
                }
                this.pageview.refs.buttonGroup.bindData(this.item);
                this.pageview.refs.splitline.$el.hide();
                this.pageview.refs.moreBtn.$el.hide();
            }
            if(this.isFromBusiness){
                this.pageview.refs.bottomToolBar.$el.hide();
            }
        },
        //将表单数据进行初步解析
        initFormData: function () {
            var _this = this;
            var dataList = _this.applyHistory.formDataList;
            if (dataList.length === 0) {
                console.debug("表单数据不存在");
                return;
            }
            _this.applyHistory.mainFormData = dataList[0];
            //debugger;
            // console.debug("dataList==" + JSON.stringify(dataList[0]));
            var sfCnt = 0;
            $.each(dataList[0], function (k, v) {
                // console.debug("遍历表单数据:" + k + "=" + v);
                if ($.isArray(v)) {
                    // console.debug("发现子表单.tab=" + k);
                    sfCnt++;
                    //只考虑最多二级的表单
                    _this.applyHistory.subFormDatas[k] = v;//v是List<Map>结构
                } else {
                    _this.applyHistory.mainFormData[k] = v;
                }
            });
        },
        viewpager_init: function (sender, params) {
            this.viewpager = sender;
        },
        result_logo_init:function (sender,params) {
            sender.config.defaultSrc=language.iconUrl.agreee;
        },
        userinfo_name_init: function (sender, params) {
            sender.config.text=language.formTips.onLoading;
        },

        getSort: function () {
            var _this = this;
            var startTaskInstances = {};
            this.applyHistory.processInstances = [];
            this.applyHistory.instData.historicActivityInstances.forEach(function (item, index) {
                if (item.activityType === "startEvent"&&item.userName) {
                    startTaskInstances.userName = item.userName;
                    startTaskInstances.activityType = item.activityType;
                    startTaskInstances.startTime = item.startTime;
                    startTaskInstances.endTime = item.endTime;
                    startTaskInstances.pic = item.pic;
                    startTaskInstances.assignee = _this.applyHistory.instData.startUserId;
                    startTaskInstances.memberId = item.memberId;
                }
            });
            // for (var i = 0; i < this.applyHistory.instData.historicTasks.length; i++) {
            // }
            var item = this.applyHistory.instData.historicTasks;
            // this.applyHistory.instData.historicTasks.forEach(function (item, idx) {
            if (item) {
                for (var x = item.length - 1; x >= 0; x--) {
                    var historicActivityInstances = _this.applyHistory.instData.historicActivityInstances;
                    var taskInstances = {};
                    // for (var i = 0; i < historicActivityInstances.length; i++) {
                    // if (item[x].taskDefinitionKey === historicActivityInstances[i].activityId) {
                    taskInstances.userName = item[x].userName;
                    taskInstances.activityType = "userTask";
                    taskInstances.startTime = item[x].startTime;
                    taskInstances.endTime = item[x].endTime;
                    taskInstances.pic = item[x].pic;
                    taskInstances.assignee = item[x].assignee;
                    taskInstances.taskId = item[x].id;
                    taskInstances.taskComments = item[x].taskComments;
                    taskInstances.dueDate = item[x].dueDate;
                    taskInstances.deleteReason = item[x].deleteReason;
                    taskInstances.taskAuditDesc = item[x].taskAuditDesc;
                    taskInstances.processDefinitionId = item[x].processDefinitionId;
                    taskInstances.memberId = item[x].memberId;
                    taskInstances.name = item[x].name;
                    // }
                    // }
                    _this.applyHistory.processInstances.push(taskInstances);
                }
            }
            // });
            this.applyHistory.processInstances.push(startTaskInstances);
        },
        segment_init:function (sender,params) {
            sender.config.items=[{'title':language.formTips.formDetail},{'title':language.formTips.processDetail},{'title':language.formTips.attachment}];
        },
        segmentdocument_init:function (sender,params) {
            sender.config.items=[{'title':language.formTips.formDetail},{'title':language.formTips.documentDetail},{'title':language.formTips.processDetail},{'title':language.formTips.attachment}];
        },
        segmentdocumentmobile_init:function (sender,params) {
            sender.config.items=[{'title':language.formTips.formDetail},{'title':language.formTips.documentDetail},{'title':language.formTips.attachment}];
        },
        segment_change: function (sender, params) {
            var _this = this;
            if (!params.nochange) {
                var item = params.item;
                var itemData = item.datasource;
                var itemTitle = $.trim(itemData.title);
                _this.getSort();
                if (itemTitle === "详情"||itemTitle === "Form") {
                    this.initBtn();
                    this.viewpager.showItem("detailContent_detail", {type: "content"});
                } else if (itemTitle === "流程"||itemTitle === "Process") {
                    this.initBtn();
                    this.viewpager.showItem("detailProcess_detail", {type: "process", parentThis: this});
                    window.setTimeout(function () {
                        _this.viewpager.curPageViewItem.contentInstance.refs.middle_flow_repeat.bindData(_this.applyHistory.processInstances);
                        if(_this.detailData.inst.freeFlowActivityInfos){
                            _this.viewpager.curPageViewItem.contentInstance.refs.all_flow_repeat.bindData(_this.detailData.inst.freeFlowActivityInfos);
                        }
                    }, 200);
                } else if (itemTitle === "附件"||itemTitle === "Attachment") {
                    if (!this.applyHistory.instData.endTime) {
                        if (!this.applyHistory.instData.deleteReason) {
                            if(_this.pageview.params.curPage==="myapprove"&&_this.hideProcessAnnex===0){
                                _this.pageview.refs.buttonGroup.bindData([{label: language.formTips.uploadFile,type:'processFile'}]);
                                // _this.pageview.refs.bottomToolBar.$el.hide();
                            }else{
                                var userInAssignees = false; //added by liuhca 如果当前用户在待审人列表
                                for (var i = 0; i < _this.applyHistory.processInstances.length; i++) {
                                    if (_this.applyHistory.currentUserId === _this.applyHistory.processInstances[i].assignee) {
//	                        		console.log(i);
                                        userInAssignees = true;
                                        break;
                                    }
                                }
                                var curTaskIdInTaskIds = false; //added by liuhca 当前人的任务id在任务列表里
                                for (var j = 0; j < _this.applyHistory.processInstances.length; j++) {
                                    if (_this.applyHistory.taskId === _this.applyHistory.processInstances[j].taskId) {
//	                        		console.log(i);
                                        curTaskIdInTaskIds = true;
                                        break;
                                    }
                                }
//                          if (_this.applyHistory.currentUserId === _this.applyHistory.processInstances[0].assignee && _this.applyHistory.taskId === _this.applyHistory.processInstances[0].taskId) {
                                _this.detailData.inst.historicTasks.forEach(function (items, indexs) {
                                    if (items.assignee === _this.detailData.currentUserId) {
                                        if (items.deleteReason === "withdraw") {
                                            _this.detailData.inst.hasTaskFinished = false;
                                        }
                                        if (items.deleteReason === "completed") {
                                            _this.detailData.inst.hasTaskFinished = true;
                                        }
                                    }
                                });
                                if (userInAssignees && curTaskIdInTaskIds) {
                                    _this.pageview.refs.buttonGroup.bindData([{label: language.formTips.uploadFile,type:'processFile'}]);

                                } else {
                                    _this.pageview.refs.bottomToolBar.$el.hide();
                                }
                                if (_this.detailData.inst.historicActivityInstances) {
                                    var hasCurrentActivityId;
                                    _this.detailData.inst.historicActivityInstances.forEach(function (item, index) {
                                        if (_this.detailData.inst.currentActivityId === item.activityId && !_this.detailData.inst.endTime) {
                                            hasCurrentActivityId=item;
                                            // _this.pageview.refs.bottomToolBar.$el.show();
                                        } else {
                                            // _this.pageview.refs.bottomToolBar.$el.hide();
                                        }
                                    });
                                    if(hasCurrentActivityId&& !_this.detailData.inst.endTime){
                                        _this.pageview.refs.bottomToolBar.$el.show();
                                    }else {
                                        _this.pageview.refs.bottomToolBar.$el.hide();
                                    }
                                }
                            }

                            //@add huangzhenyu 被加签出来的人审批同意后隐藏上传附件按钮
                            // if(_this.applyHistory.currentDoneTask&&_this.applyHistory.currentDoneTask.taskAuditDesc.indexOf("被加签")>-1&&_this.applyHistory.currentDoneTask.finished){
                            //     _this.pageview.refs.bottomToolBar.$el.hide();
                            // }

                        } else {
                            _this.pageview.refs.bottomToolBar.$el.hide();
                        }
                    }
                    this.pageview.refs.splitline.$el.hide();
                    this.pageview.refs.moreBtn.$el.hide();
                    this.viewpager.showItem("detailAttachment_detail", {type: "attachment", parent: this});

                    // 给上传组件传入dom
                    setTimeout(function () {
                        // 异步因为需要新的dom渲染完
                        _this.initUploader(_this.pageview.refs.buttonGroup);
                    }, 500);
                }else if (itemTitle === "公文正文"||itemTitle === "Document") {
                    this.pageview.refs.splitline.$el.hide();
                    this.pageview.refs.moreBtn.$el.hide();
                    _this.pageview.refs.buttonGroup.$el.hide();
                    this.viewpager.showItem("detailDocument_detail", {type: "document", parent: this});
                }
            }
        },
        segmentdocument_change: function (sender, params) {
            var _this = this;
            if (!params.nochange) {
                var item = params.item;
                var itemData = item.datasource;
                var itemTitle = $.trim(itemData.title);
                _this.getSort();
                if (itemTitle === "详情"||itemTitle === "Form") {
                    this.initBtn();
                    this.viewpager.showItem("detailContent_detail", {type: "content"});
                } else if (itemTitle === "流程"||itemTitle === "Process") {
                    this.initBtn();
                    this.viewpager.showItem("detailProcess_detail", {type: "process", parentThis: this});
                    window.setTimeout(function () {
                        _this.viewpager.curPageViewItem.contentInstance.refs.middle_flow_repeat.bindData(_this.applyHistory.processInstances);
                        if(_this.detailData.inst.freeFlowActivityInfos){
                            _this.viewpager.curPageViewItem.contentInstance.refs.all_flow_repeat.bindData(_this.detailData.inst.freeFlowActivityInfos);
                        }
                    }, 200);
                } else if (itemTitle === "附件"||itemTitle === "Attachment") {
                    if (!this.applyHistory.instData.endTime) {
                        if (!this.applyHistory.instData.deleteReason) {
                            var userInAssignees = false; //added by liuhca 如果当前用户在待审人列表
                            for (var i = 0; i < _this.applyHistory.processInstances.length; i++) {
                                if (_this.applyHistory.currentUserId === _this.applyHistory.processInstances[i].assignee) {
//	                        		console.log(i);
                                    userInAssignees = true;
                                    break;
                                }
                            }
                            var curTaskIdInTaskIds = false; //added by liuhca 当前人的任务id在任务列表里
                            for (var j = 0; j < _this.applyHistory.processInstances.length; j++) {
                                if (_this.applyHistory.taskId === _this.applyHistory.processInstances[j].taskId) {
//	                        		console.log(i);
                                    curTaskIdInTaskIds = true;
                                    break;
                                }
                            }
//                          if (_this.applyHistory.currentUserId === _this.applyHistory.processInstances[0].assignee && _this.applyHistory.taskId === _this.applyHistory.processInstances[0].taskId) {
                            _this.detailData.inst.historicTasks.forEach(function (items, indexs) {
                                if (items.assignee === _this.detailData.currentUserId) {
                                    if (items.deleteReason === "withdraw") {
                                        _this.detailData.inst.hasTaskFinished = false;
                                    }
                                    if (items.deleteReason === "completed") {
                                        _this.detailData.inst.hasTaskFinished = true;
                                    }
                                }
                            });
                            if (userInAssignees && curTaskIdInTaskIds) {
                                _this.pageview.refs.buttonGroup.bindData([{label: language.formTips.uploadFile}]);
                            } else {
                                _this.pageview.refs.bottomToolBar.$el.hide();
                            }
                            if (_this.detailData.inst.historicActivityInstances) {
                                _this.detailData.inst.historicActivityInstances.forEach(function (item, index) {
                                    if (_this.detailData.inst.currentActivityId === item.activityId && !_this.detailData.inst.endTime) {
                                        _this.pageview.refs.bottomToolBar.$el.show();
                                    } else {
                                        _this.pageview.refs.bottomToolBar.$el.hide();
                                    }
                                });
                            }
                            //@add huangzhenyu 被加签出来的人审批同意后隐藏上传附件按钮
                            // if(_this.applyHistory.currentDoneTask&&_this.applyHistory.currentDoneTask.taskAuditDesc.indexOf("被加签")>-1&&_this.applyHistory.currentDoneTask.finished){
                            //     _this.pageview.refs.bottomToolBar.$el.hide();
                            // }

                            if(_this.detailData.inst.hasTaskFinished){
                                _this.pageview.refs.bottomToolBar.$el.hide();
                            }else{
                                _this.pageview.refs.bottomToolBar.$el.show();
                            }
                        } else {
                            _this.pageview.refs.bottomToolBar.$el.hide();
                        }
                    }
                    this.pageview.refs.splitline.$el.hide();
                    this.pageview.refs.moreBtn.$el.hide();
                    this.viewpager.showItem("detailAttachment_detail", {type: "attachment", parent: this});

                    // 给上传组件传入dom
                    setTimeout(function () {
                        // 异步因为需要新的dom渲染完
                        _this.initUploader(_this.pageview.refs.buttonGroup);
                    }, 500);
                }else if (itemTitle === "公文正文"||itemTitle === "Document") {
                    this.initBtn();
                    this.pageview.refs.splitline.$el.hide();
                    this.pageview.refs.moreBtn.$el.hide();
                    this.viewpager.showItem("detailDocument_detail", {type: "document", parent: this});
                }
            }
        },
        segmentdocumentmobile_change: function (sender, params) {
            var _this = this;
            if (!params.nochange) {
                var item = params.item;
                var itemData = item.datasource;
                var itemTitle = $.trim(itemData.title);
                _this.getSort();
                if (itemTitle === "详情"||itemTitle === "Form") {
                    this.viewpager.showItem("detailContent_detail", {type: "content"});
                }else if (itemTitle === "附件"||itemTitle === "Attachment") {
                    this.pageview.refs.splitline.$el.hide();
                    this.pageview.refs.moreBtn.$el.hide();
                    this.viewpager.showItem("detailAttachment_detail", {type: "attachment", parent: this});
                }else if (itemTitle === "公文正文"||itemTitle === "Document") {
                    this.pageview.refs.splitline.$el.hide();
                    this.pageview.refs.moreBtn.$el.hide();
                    this.viewpager.showItem("detailDocument_detail", {type: "document", parent: this});
                }
            }
        },
        morePopover_init: function (sender, params) {
            this.morePopver = sender;
        },
        moreBtn_click: function (sender, params) {
            this.morePopver.show(sender);
        },
        moreRepeat_itemclick: function (sender, params) {
            this.buttonGroupClick(sender);
            this.morePopver.hide();
        },
        buttonGroup_itemclick: function (sender, params) {
            window.localStorage.setItem('SETBTNVAL',JSON.stringify(this.setBtnVal));
            this.buttonGroupClick(sender);
        },
        // 显示出来的和pop隐藏的按钮公用点击
        buttonGroupClick: function (sender) {
            var _this = this,
                key = sender.datasource.label.replace(/ /g, ''),
                setType = sender.datasource.type.replace(/ /g, ''),
                taskId = this.applyHistory.taskId,
                iforms = this.applyHistory.iForms,
                source = iforms ? iforms.source : '',
                taskDefinitionKey = this.applyHistory.instData.currentActivityId;
            window.localStorage.removeItem("copyUserParticipants");
            window.localStorage.setItem('SETBTNVAL',JSON.stringify(this.setBtnVal));
            var copyToUsers="";
            if(_this.copy_to_list&&_this.copy_to_list.length>0){
                _this.copy_to_list.forEach(function (item,index) {
                    copyToUsers+=item.member_id+",";
                });
            }

            var para = {
                instanceId: this.detailData.inst.id,
                processId: this.detailData.inst.processDefinitionId,
                taskId: taskId,
                starter: this.detailData.inst.startUserId,
                currentActivityId: this.applyHistory.instData.currentActivityId,
                pk_bo: this.applyHistory.formId,
                copyToUsers:copyToUsers
            };

            if(this.applyHistory.currentTodoTask&&this.applyHistory.currentTodoTask.activity.properties.cloudsignature==="true"){
                para.cloudsignature=true;
            }
            if(_this.detailData.lastSignUrl){
                para.lastSignUrl=_this.detailData.lastSignUrl;
            }
            if(this.applyHistory.currentTodoTask&&this.applyHistory.currentTodoTask.activity.properties.useCloudsignature&&this.applyHistory.currentTodoTask.activity.properties.useCloudsignature==='true'){
                para.useCloudsignature=true;
            }
            if(this.applyHistory.currentTodoTask&&this.applyHistory.currentTodoTask.activity.properties.cloudsignature&&this.applyHistory.currentTodoTask.activity.properties.cloudsignature==='true'){
                para.cloudsignature=true;
            }
            if(this.applyHistory.currentTodoTask&&this.applyHistory.currentTodoTask.taskComments&&this.applyHistory.currentTodoTask.taskComments.length!==0&&this.applyHistory.currentTodoTask.taskComments[0].message&&this.applyHistory.currentTodoTask.taskComments[0].message.indexOf('(代')===0){
                para.substitutionComments=this.applyHistory.currentTodoTask.taskComments[0].message||'';
            }
            var editPara = {
                id: this.pageview.params.instId,
                title: encodeURI(this.instName),
                procInstName: encodeURI(window._applyHistory.instData.name),
                formType: null,
                source: source,
                taskDefinitionKey: taskDefinitionKey
            };

            var tempSavePara = {
                userId: _this.detailData.currentUserId,
                procInstName: _this.detailData.inst.name,
                keyFeature: _this.detailData.inst.keyFeature,
                businessKey: _this.detailData.inst.businessKey,
                // tableName:_this.detailData.inst.iforms[0].pk_form
                tableName: _this.detailData.inst.iforms ? _this.detailData.inst.iforms[0].pk_form : _this.detailData.inst.bpmForms ? _this.detailData.inst.bpmForms[0].tableName : null
            };

            editPara.currentProcDefId = _this.detailData.inst.processDefinitionId;// 参数中保存流程定义Id  --yanx于2018.05.02注释
            if (_this.detailData.inst.processDefinitionId.indexOf("tempSave") > -1) {
                editPara.processDefId = _this.detailData.inst.processDefinitionId;
                editPara.isTempSave = true;
            }
            key=$.trim(key);
            if((key!=='同意'&&key!=='Consent')&&(key!=='撤回提交'||key!=='Withdraw Submission')&&(key!=='抄送'||key!=='Add CC')&&_this.applyHistory.currentTodoTask&&_this.applyHistory.currentTodoTask.deleteReason==="REJECTTOACTIVITYCREATE"){
                _this.pageview.showTip({text:language.formTips.rejectTaskOnlyCompleted,duration:2000});
                return;
            }
            switch (setType) {
                case 'edit'://编辑
                    if (_this.applyHistory.instData.deleteReason === "REJECTTOSTART_DELETED"||_this.applyHistory.instData.deleteReason === "REJECTTOSTART") {
                        editPara.formType = 'reAdd';
                        editPara.deleteReason = _this.applyHistory.instData.deleteReason;
                        editPara.origProcDefIns = _this.applyHistory.taskId;
                        editPara.businessKey = _this.applyHistory.instData.businessKey;
                        if(_this.detailData.inst.freeFlowActivityInfos&&_this.detailData.inst.freeFlowActivityInfos.length!==0){
                            window.localStorage.setItem("freeFlowActivityInfos",JSON.stringify(_this.detailData.inst.freeFlowActivityInfos));
                        }
                    } else {
                        editPara.formType = 'MODIFY';
                        editPara.processDefIdForm = _this.processDefInsIdTempSave;
                        if (_this.applyHistory.taskId) {
                            editPara.taskId = _this.applyHistory.taskId;
                        }
                    }
                    if(this.applyHistory.instData.variables){
                        var variables=this.applyHistory.instData.variables;
                        for(var i=0;i<variables.length;i++){
                            if(variables[i].name==='tempSaveReason'){
                                editPara.tempSaveReason=variables[i].value;
                            }
                        }
                        // tempSaveReason=this.applyHistory.instData.variables.find(function (item,index) {
                        //     return item.name==="tempSaveReason";
                        // });
                        // if(tempSaveReason){
                        //     editPara.tempSaveReason=tempSaveReason.value;
                        // }
                    }
                    if(_this.jumpToRejectActivity&&_this.jumpToRejectActivity==='jumpToRejectActivity'){
                        editPara.jumpToRejectActivity=_this.jumpToRejectActivity;
                    }
                    this.pageview.replaceGo("form", editPara);
                    break;
                case '草稿':
                    editPara.formType = 'MODIFY';
                    this.pageview.replaceGo("form", editPara);
                    break;
                case 'agree'://同意
                    if (this.applyHistory.currentTodoTask.taskAuditDesc.indexOf("(被加签")===-1) {
                        try {
                            var flag = this.approveAgree();
                            if (!flag) return;
                        } catch (e) {
                            console.log(e);
                        }
                    }else{
                        para.isBefore='assignBefore';
                    }
                    if(this.assigneee){
                        para.isBehind="1";
                    }
                    if(this.circulator){
                        para.isCirculate=true;
                    }
                    if(this.applyHistory.currentTodoTask.activity.properties.approveType&&this.applyHistory.currentTodoTask.activity.properties.approveType==="circulate"){
                        para.actionCode='read';
                    }
                    this.goAgreeAndAssign(para);
                    break;
                case 'reject'://驳回
                    try{
                        if(this.applyHistory.currentTodoTask.activity.properties.approveType&&this.applyHistory.currentTodoTask.activity.properties.approveType==="addsignBehind"){
                            para.approveType="addsignBehind";
                        }
                    }catch(e){

                    }
                    this.goReject(para);
                    break;
                case 'jump'://跳转
                    this.goJump(para);
                    break;
                case 'copyto'://抄送
                    var copyUserParticipants=JSON.parse(window.localStorage.getItem("copyUserParticipants"));
                    if(copyUserParticipants){
                        para.copy_to_list=JSON.stringify(copyUserParticipants);
                    }
                    this.goCopyTo(para);
                    break;
                case 'addBehindApprove'://后加签
                    para.addsignBehindAble=true;
                    this.goAddSign(para);
                    break;
                case 'circulate'://传阅
                    para.circulate=true;
                    this.goCirculate(para);
                    break;
                case 'addApprove'://前加签
                    this.goAddSign(para);
                    break;
                case 'reassign'://改派
                    this.goDelegate(para);
                    break;
                case 'delProcess'://删除
                    _this.delegateDialog = new Dialog({
                        mode: 3,
                        wrapper: _this.pageview.$el,
                        contentText: language.formTips.confirmDeleteForm,
                        btnDirection: "row",
                        buttons: [{
                            title: language.cancel,
                            style: {
                                height: 45,
                                fontSize: 16,
                                color: c.titleColor,
                                borderRight: '1px solid #eee'
                            },
                            onClick: function () {
                                _this.delegateDialog.hide();
                            }
                        }, {
                            title: language.confirm,
                            style: {
                                height: 45,
                                fontSize: 16,
                                color: "#37b7fd",
                            },
                            onClick: function () {
                                _this.delegateDialog.hide();
                                para.processDefInsId = _this.applyHistory.instData.id;
                                _this.pageview.showLoading({text: language.formTips.delete, timeout: 3000});
                                _this.doRemoveForm();
                            }
                        }]
                    });
                    _this.delegateDialog.show();
                    break;
                case 'withdraw':
                    _this.delegateDialog = new Dialog({
                        mode: 3,
                        wrapper: _this.pageview.$el,
                        contentText: language.formTips.confirmWithdraw,
                        btnDirection: "row",
                        buttons: [{
                            title: language.cancel,
                            style: {
                                height: 45,
                                fontSize: 16,
                                color: c.titleColor,
                                borderRight: '1px solid #eee'
                            },
                            onClick: function () {
                                _this.delegateDialog.hide();
                            }
                        }, {
                            title: language.confirm,
                            style: {
                                height: 45,
                                fontSize: 16,
                                color: "#37b7fd",
                            },
                            onClick: function () {
                                _this.delegateDialog.hide();
                                para.processDefInsId = _this.applyHistory.instData.id;
                                para.shareUserId = _this.applyHistory.instData.startUserId;
                                para.isWithdrawSubmit = true;
                                _this.pageview.showLoading({text: language.formTips.approvalWithDrawing, timeout: 3000});
                                _this.goTempSave(tempSavePara);
                            }
                        }]
                    });
                    _this.delegateDialog.show();
                    break;
                case 'recall'://撤回审批
                    this.goResetApprove(para);
                    break;
                case '撤回申请':
                    this.goResetApply(para);
                    break;
                case 'processFile'://上传流程附件
                    // 模拟点击
                    if(false){
                        this.uploaderFileByBridge();
                    }else{
                        if(this.fileNum<this.fileMaxNum){
                            $('.moxie-shim.moxie-shim-html5 input').click();
                        }
                    }
                    break;
                case 'reSubmit'://重新提交
                    editPara.formType = 'reAdd';
                    this.pageview.replaceGo("form", editPara);
                    break;
                case "toTask"://转任务
                    this._doRotateTask(para);
                    break;
                case "duplicateForm"://表单赋值
                    para.pk_boins=_this.applyHistory.formDataList[0].pk_boins;
                    this.doCopyForm(para);
                    break;
                default:
                    console.error('未指定的按钮类型');
                    break;
            }
            if(key!=='抄送'&&key!=='Add CC'){
                window.localStorage.removeItem("copyUserParticipants");
            }
        },
        /**
         * @huangzhenyu
         * 审批人点同意时，控件在当前环节是可编辑的，且该控件为必填，需要校验提示审批人输入
         *
         * */

        approveAgree: function () {
            var _this = this, curFlag = true, tips = "";
            var formDataList = this.detailData.inst.formDataList[0];

            var layoutData, processAuthinfo;
            if (typeof JSON.parse(this.detailData.inst.iforms[0].jsontemp).formLayout.layoutDetail === "object") {
                layoutData=this.selectSetHide(JSON.parse(this.detailData.inst.iforms[0].jsontemp).formLayout.layoutDetail,this.detailData.inst.formDataList[0]).layoutDetail;
            } else {
                layoutData=this.selectSetHide(JSON.parse(JSON.parse(this.detailData.inst.iforms[0].jsontemp).formLayout.layoutDetail),this.detailData.inst.formDataList[0]).layoutDetail;
            }
            processAuthinfo = JSON.parse(this.detailData.inst.iforms[0].jsontemp).form.processAuthinfo;

            layoutData.forEach(function (item, index) {
                var columncode = item.columncode||item.componentKey;
                if (item.componentKey !== "DataTable") {
                    var isHide = _this.isHide(item, processAuthinfo);
                    if(!item.unSeeable){
                        if (item.componentKey === "DateInterval") {
                            var DateIntervalVal;
                            if (typeof formDataList[columncode] === "string") {
                                //DateIntervalVal=JSON.parse(formDataList[columncode]);
                                if (formDataList[columncode].indexOf("[") > -1) {
                                    DateIntervalVal = JSON.parse(formDataList[columncode]);
                                } else {
                                    DateIntervalVal = formDataList[columncode].split(",");
                                }

                            } else {
                                DateIntervalVal = formDataList[columncode];
                            }
                            if ((!DateIntervalVal || DateIntervalVal[0] === "" || DateIntervalVal[1] === "") && item.required && isHide) {
                                tips = language.formAction.pleaseSelect + item.title;
                                curFlag = false;
                            }
                            return;
                        } else {
                            if ((formDataList[columncode] === "" || formDataList[columncode] === "[]" || !formDataList[columncode]) && item.required && isHide) {
                                if (item.componentKey === "File") {
                                    if (curFlag) {
                                        tips = language.formTips.PleaseUploadFile;
                                        curFlag = false;
                                    } else {
                                        curFlag = false;
                                    }
                                    return;
                                } else if (item.componentKey === "Raty") {
                                    if (curFlag) {
                                        tips = language.formTips.pleaseEnter + item.title;
                                        curFlag = false;
                                    } else {
                                        curFlag = false;
                                    }
                                    return;
                                } else if (item.componentKey === "Select") {
                                    if (curFlag) {
                                        tips = language.formTips.pleaseEnter + item.title;
                                        curFlag = false;
                                    } else {
                                        curFlag = false;
                                    }
                                    return;
                                } else {
                                    if (curFlag) {
                                        tips = language.formTips.pleaseEnter+item.title;
                                        curFlag = false;
                                    } else {
                                        curFlag = false;
                                    }
                                    return;
                                }
                            }
                        }
                    }

                }
                if (!curFlag) return;
                if (item.componentKey === "DataTable") {
                    if(!item.unSeeable) {
                        var tableName = item.tableName;
                        var layoutDetail = item.layoutDetail;
                        var tableData = formDataList[tableName][0];
                        for (var i = 0, j = layoutDetail.length; i < j; i++) {
                            var isHide2 = _this.isHide(layoutDetail[i], processAuthinfo);
                            var cur = layoutDetail[i];
                            if(!cur.invisible){
                                if (cur.componentKey === "DateInterval") {
                                    var DateIntervalValTable, DateIntervalValTable1;
                                    if (typeof tableData[cur.columncode] === "string") {
                                        //DateIntervalValTable=JSON.parse(tableData[items.columncode]);
                                        if (tableData[cur.columncode]) {
                                            if (tableData[cur.columncode].indexOf('[') > -1) {
                                                tableData[cur.columncode] = JSON.parse(tableData[cur.columncode]);
                                                DateIntervalValTable = tableData[cur.columncode][0];
                                                DateIntervalValTable1 = tableData[cur.columncode][1];
                                            } else {
                                                var midIndex = Math.round(tableData[cur.columncode].length / 2);
                                                DateIntervalValTable = tableData[cur.columncode].slice(0, midIndex);
                                                DateIntervalValTable1 = tableData[cur.columncode].slice(midIndex + 1);
                                            }
                                        } else {
                                            DateIntervalValTable1 = "";
                                        }

                                    } else {
                                        DateIntervalValTable = tableData[cur.columncode];
                                    }
                                    if ((!DateIntervalValTable || DateIntervalValTable === "" || DateIntervalValTable1 === "") && cur.required && isHide2) {
                                        tips = language.formAction.pleaseSelect + cur.title;
                                        curFlag = false;
                                    }
                                    return;
                                } else {
                                    if (isHide2 && cur.required && (tableData[cur.columncode] === "" || tableData[cur.columncode] === "[]" || !tableData[cur.columncode])) {
                                        if (cur.componentKey === "File") {
                                            if (curFlag) {
                                                tips = language.formTips.PleaseUploadFile;
                                                curFlag = false;
                                            } else {
                                                curFlag = false;
                                            }
                                            return;
                                        } else if (cur.componentKey === "Raty") {
                                            if (curFlag) {
                                                tips = language.formTips.pleaseEnter + cur.title;
                                                curFlag = false;
                                            } else {
                                                curFlag = false;
                                            }
                                            return;
                                        } else if (cur.componentKey === "Select") {
                                            if (curFlag) {
                                                tips = language.formTips.pleaseEnter + cur.title;
                                                curFlag = false;
                                            } else {
                                                curFlag = false;
                                            }
                                            return;
                                        } else {
                                            if (curFlag) {
                                                tips = cur.tips||cur.title+language.formTips.required;
                                                curFlag = false;
                                            } else {
                                                curFlag = false;
                                            }
                                            return;
                                        }
                                    }
                                }
                            }
                        }
                    }

                }
                if (item.componentKey === "TableLayout") {
                    if(!item.unSeeable) {
                        var layoutDetail1 = item.layoutDetail;
                        layoutDetail1.forEach(function (its, indexs) {
                            if (its.layoutDetail.length === 0) return;
                            var columncode = its.layoutDetail[0].columncode;
                            var isHide1 = _this.isHide(its.layoutDetail[0], processAuthinfo);
                            if (its.layoutDetail[0].componentKey === "DateInterval") {
                                var DateIntervalValTable;
                                if (typeof formDataList[columncode] === "string") {
                                    //DateIntervalValTable=JSON.parse(formDataList[columncode]);
                                    if (formDataList[columncode].indexOf("[") > -1) {
                                        DateIntervalValTable = JSON.parse(formDataList[columncode]);
                                    } else {
                                        DateIntervalValTable = formDataList[columncode].split(",");
                                    }
                                } else {
                                    DateIntervalValTable = formDataList[columncode];
                                }
                                if ((!DateIntervalValTable || DateIntervalValTable[0] === "" || DateIntervalValTable[1] === "") && its.layoutDetail[0].required && isHide1) {
                                    tips = language.formAction.pleaseSelect + its.layoutDetail[0].title;
                                    curFlag = false;
                                }
                            } else {
                                if ((formDataList[columncode] === "" || formDataList[columncode] === "[]" || !formDataList[columncode]) && its.layoutDetail[0].required && isHide1) {
                                    if (its.layoutDetail[0].componentKey === "File") {
                                        if (curFlag) {
                                            tips = language.formTips.PleaseUploadFile;
                                            curFlag = false;
                                        } else {
                                            curFlag = false;
                                        }
                                        return;
                                    } else if (its.layoutDetail[0].componentKey === "Raty") {
                                        if (curFlag) {
                                            tips =  + its.layoutDetail[0].title;
                                            curFlag = false;
                                        } else {
                                            curFlag = false;
                                        }
                                        return;
                                    } else if (its.layoutDetail[0].componentKey === "Select") {
                                        if (curFlag) {
                                            tips = language.formTips.pleaseEnter + its.layoutDetail[0].title;
                                            curFlag = false;
                                        } else {
                                            curFlag = false;
                                        }
                                        return;
                                    } else {
                                        if (curFlag) {
                                            tips = language.formTips.pleaseEnter+its.layoutDetail[0].title;
                                            curFlag = false;
                                        } else {
                                            curFlag = false;
                                        }
                                        return;
                                    }
                                }
                            }
                        });
                    }

                }
                if (item.componentKey === "ColumnPanel") {
                    if(!item.unSeeable){
                        var layoutDetail2 = item.layoutDetail;
                        layoutDetail2.forEach(function (itss, indexs) {
                            if (itss.layoutDetail.length === 0) return;
                            var columncode = itss.layoutDetail[0].columncode;
                            var isHide2 = _this.isHide(itss.layoutDetail[0], processAuthinfo);
                            if (itss.layoutDetail[0].componentKey === "DateInterval") {
                                var DateIntervalValTable;
                                if (typeof formDataList[columncode] === "string") {
                                    //DateIntervalValTable=JSON.parse(formDataList[columncode]);
                                    if (formDataList[columncode].indexOf("[") > -1) {
                                        DateIntervalValTable = JSON.parse(formDataList[columncode]);
                                    } else {
                                        DateIntervalValTable = formDataList[columncode].split(",");
                                    }
                                } else {
                                    DateIntervalValTable = formDataList[columncode];
                                }
                                if ((!DateIntervalValTable || DateIntervalValTable[0] === "" || DateIntervalValTable[1] === "") && itss.layoutDetail[0].required && isHide2) {
                                    tips = language.formAction.pleaseSelect + itss.layoutDetail[0].title;
                                    curFlag = false;
                                }
                            } else {
                                if ((formDataList[columncode] === "" || formDataList[columncode] === "[]" || !formDataList[columncode]) && itss.layoutDetail[0].required && isHide2) {
                                    if (itss.layoutDetail[0].componentKey === "File") {
                                        if (curFlag) {
                                            tips = language.formTips.PleaseUploadFile;
                                            curFlag = false;
                                        } else {
                                            curFlag = false;
                                        }
                                        return;
                                    } else if (itss.layoutDetail[0].componentKey === "Raty") {
                                        if (curFlag) {
                                            tips = language.formTips.pleaseEnter + itss.layoutDetail[0].title;
                                            curFlag = false;
                                        } else {
                                            curFlag = false;
                                        }
                                        return;
                                    } else if (itss.layoutDetail[0].componentKey === "Select") {
                                        if (curFlag) {
                                            tips = language.formTips.pleaseEnter + itss.layoutDetail[0].title;
                                            curFlag = false;
                                        } else {
                                            curFlag = false;
                                        }
                                        return;
                                    } else {
                                        if (curFlag) {
                                            tips = language.formTips.pleaseEnter+itss.layoutDetail[0].title;
                                            curFlag = false;
                                        } else {
                                            curFlag = false;
                                        }
                                        return;
                                    }
                                }
                            }
                        });
                    }

                }
            });
            if(tips){
                _this.pageview.showTip({
                    text: tips,
                    duration: 1200
                });
            }
            return curFlag;
        },

        selectSetHide:function (formLayout,formData) {
            var layoutDetail=formLayout.layoutDetail,allrules=[];
            for(var i=0;i<layoutDetail.length;i++){
                if(layoutDetail[i].componentKey==='ColumnPanel'||layoutDetail[i].componentKey==='TableLayout'){
                    var temp=layoutDetail[i].layoutDetail;
                    for(var m=0;m<temp.length;m++){
                        if(temp[m].layoutDetail.length>0&&temp[m].layoutDetail[0].componentKey==='Select'&&temp[m].layoutDetail[0].rightsOptions&&temp[m].layoutDetail[0].rightsOptions.rules.length>0){
                            allrules.push(temp[m].layoutDetail[0]);
                        }
                    }
                }
                if(layoutDetail[i].componentKey==='Select'&&layoutDetail[i].rightsOptions&&layoutDetail[i].rightsOptions.rules.length>0){
                    allrules.push(layoutDetail[i]);
                }
                if(layoutDetail[i].componentKey==='DataTable'){
                    var tabletemp=layoutDetail[i].layoutDetail;
                    for(var y=0;y<tabletemp.length;y++){
                        if(tabletemp[y].componentKey==='Select'&&tabletemp[y].rightsOptions&&tabletemp[y].rightsOptions.rules.length>0){
                            allrules.push(tabletemp[y]);
                        }
                    }
                }
            }

            for(var ii=0;ii<allrules.length;ii++){
                var rules=allrules[ii].rightsOptions.rules;
                var curii=ii;
                for(var jj=0;jj<rules.length;jj++){
                    var rule=rules[jj].fields;
                    try {
                        if(rules[jj].symbol==="equal"&&(formData[allrules[curii].columncode]===rules[jj].val||(rules[jj].val==='other'&&formData[allrules[curii].columncode].indexOf('$$hasOther$$')>-1))){
                            for(var n=0;n<rule.length;n++){
                                var controlFieldId=rule[n];
                                if(!controlFieldId.seeable){
                                    for(var t=0;t<layoutDetail.length;t++){
                                        if(layoutDetail[t].componentKey==="ColumnPanel"||layoutDetail[t].componentKey==="TableLayout"){
                                            if(layoutDetail[t].fieldId===controlFieldId.fieldId){
                                                layoutDetail[t].unSeeable=true;
                                            }

                                        }else{
                                            if(layoutDetail[t].fieldId===controlFieldId.fieldId){
                                                layoutDetail[t].unSeeable=true;
                                            }
                                            if(layoutDetail[t].componentKey==="DataTable"&&layoutDetail[t].subFormId===controlFieldId.fieldId){
                                                layoutDetail[t].unSeeable=true;
                                            }
                                        }
                                    }
                                }else{
                                    for(var f=0;f<layoutDetail.length;f++){
                                        if(layoutDetail[f].componentKey==="ColumnPanel"||layoutDetail[f].componentKey==="TableLayout"){
                                            if(layoutDetail[f].fieldId===controlFieldId.fieldId){
                                                layoutDetail[f].unSeeable=false;
                                            }

                                        }else{
                                            if(layoutDetail[f].fieldId===controlFieldId.fieldId){
                                                layoutDetail[f].unSeeable=false;
                                            }
                                            if(layoutDetail[f].componentKey==="DataTable"&&layoutDetail[f].subFormId===controlFieldId.fieldId){
                                                layoutDetail[f].unSeeable=false;
                                            }
                                        }
                                    }
                                }
                            }
                        }else if(rules[jj].symbol==="notEqual"&&formData[allrules[curii].columncode]!==rules[jj].val){
                            for(var h=0;h<rule.length;h++){
                                var notEqualcontrolFieldId=rule[h];
                                if(!notEqualcontrolFieldId.seeable){
                                    for(var r=0;r<layoutDetail.length;r++){
                                        if(layoutDetail[r].componentKey==="ColumnPanel"||layoutDetail[r].componentKey==="TableLayout"){
                                            if(layoutDetail[r].fieldId===notEqualcontrolFieldId.fieldId){
                                                layoutDetail[r].unSeeable=true;
                                            }

                                        }else{
                                            if(layoutDetail[r].fieldId===notEqualcontrolFieldId.fieldId){
                                                layoutDetail[r].unSeeable=true;
                                            }
                                            if(layoutDetail[r].componentKey==="DataTable"&&layoutDetail[r].subFormId===notEqualcontrolFieldId.fieldId){
                                                layoutDetail[r].unSeeable=true;
                                            }
                                        }
                                    }
                                }else{
                                    for(var b=0;b<layoutDetail.length;b++){
                                        if(layoutDetail[b].componentKey==="ColumnPanel"||layoutDetail[b].componentKey==="TableLayout"){
                                            if(layoutDetail[b].fieldId===notEqualcontrolFieldId.fieldId){
                                                layoutDetail[b].unSeeable=false;
                                            }

                                        }else{
                                            if(layoutDetail[b].fieldId===notEqualcontrolFieldId.fieldId){
                                                layoutDetail[b].unSeeable=false;
                                            }
                                            if(layoutDetail[b].componentKey==="DataTable"&&layoutDetail[b].subFormId===notEqualcontrolFieldId.fieldId){
                                                layoutDetail[b].unSeeable=false;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }catch (e){
                        console.log(e);
                    }
                }
            }

            formLayout.layoutDetail=layoutDetail;
            return formLayout;
        },

        isHide: function (item, processAuthinfo) {
            var taskDefinitionKey = this.applyHistory.currentTodoTask.taskDefinitionKey;
            if (processAuthinfo[taskDefinitionKey]) {
                for (var i = 0; i < processAuthinfo[taskDefinitionKey].length; i++) {
                    if (processAuthinfo[taskDefinitionKey][i].fieldid === item.fieldId) {
                        processAuthinfo[taskDefinitionKey][i].auth += "";
                        if (processAuthinfo[taskDefinitionKey][i].auth === "0" || processAuthinfo[taskDefinitionKey][i].auth === "1") {
                            return false;
                        }else {
                            return true;
                        }
                    }
                }
            }else{
                return false;
            }
        },
        /**
         * 转任务调用接口，获取任务URL并实现页面跳转
         * @huangzhy 2017/10/31
         * */
        _doRotateTask:function (para) {
            var _this=this,_esnTaskId;
            var variables=this.detailData.inst.variables;
            var tempEsnTaskName,processInstanceId,activityId;
            try {
                tempEsnTaskName="ESNTASK_"+_this.applyHistory.currentTodoTask.activity.id;
                processInstanceId=_this.applyHistory.currentTodoTask.processInstanceId;
                activityId=_this.applyHistory.currentTodoTask.activity.id;
            }catch(e){
                tempEsnTaskName="ESNTASK_"+_this.applyHistory.currentDoneTask.activity.id;
                processInstanceId=_this.applyHistory.currentDoneTask.processInstanceId;
                activityId=_this.applyHistory.currentDoneTask.activity.id;
            }
            for(var iy=0;iy<variables.length;iy++){
                if(variables[iy].name==tempEsnTaskName){
                    _esnTaskId=variables[iy].value;
                    break;
                }
            }
            _this.pageview.ajax({
                url: "/process/showEsnTask",
                type: "POST",
                data: {
                    esnTaskId: _esnTaskId||"",
                    processInstanceId:processInstanceId,
                    taskTitle:_this.instName,
                    activityId:activityId
                },
                success: function (data) {
                    _this.pageview.hideLoading(true);
                    if (data.code === 0) {
                        _this.pageview.showLoading({text:"",duration:1000});
                        window.setTimeout(function () {
                            _this.pageview.hideLoading(true);
                            window.location.href=data.data;
                        },1000);
                    } else {
                        _this.pageview.showTip({text: data.msg, duration: 1000});
                    }
                }
            });
        },

        /**
         * @20170718 by huangzhenyu
         * 发起人在审批未结束之前可进行撤回审批操作，具体步骤：首先删除流程实例，同时创建一个暂存任务
         *
         * */
        doRemoveProcess: function (tempSavePara) {
            var _this = this;
            _this.pageview.ajax({
                url: "/process/removeProcessInstance?processDefInsId=" + _this.applyHistory.instData.id,
                type: "POST",
                data: {
                    shareUserId: _this.applyHistory.instData.startUserId,
                },
                success: function (data) {
                    _this.pageview.hideLoading(true);
                    if (data.code === 0) {
                        // _this.pageview.showTip({text: data.data, duration: 800});
                        // window.changeFormStatus = true;
                    } else {
                        _this.pageview.showTip({text: data.msg, duration: 1000});
                    }
                }
            });
        },
        //删除草稿态表单
        doRemoveForm: function () {
            var _this = this;
            _this.pageview.ajax({
                url: "/process/removeIFormIns?processDefInsId=" + _this.applyHistory.instData.id + "&formInsId=" + _this.applyHistory.formId + '&businessKey=' + _this.applyHistory.instData.businessKey,
                type: "POST",
                data: {},
                success: function (data) {
                    _this.pageview.hideLoading();
                    if (data.code === 0) {
                        _this.pageview.goBack(-1);
                        setTimeout(function () {
                            window.location.reload();
                        },300);
                    } else {
                        _this.pageview.showTip({text: data.msg, duration: 1000});
                    }
                }
            });
        },

        goTempSave: function (postData) {
            var _this = this,
                url = "/process/tempSaveSubmit";
            if (_this.processDefId) {
                postData.processDefId = _this.processDefId;
            }
            postData.source = (_this.applyHistory.iForms && _this.applyHistory.iForms.source) ?
                _this.applyHistory.iForms.source : '';
            postData.processDefInsId= _this.applyHistory.instData.id;
            _this.pageview.showLoading({text: language.formTips.onLoading, timeout: 8000});
            this.pageview.ajax({
                type: "POST",
                url: url,
                data: postData,
                success: function (data) {
                    _this.pageview.hideLoading(data.code === 0);
                    if (data.code === 0) {
                        window.needRefresMyApproveListData = true;
                        window.needRefresCopyApproveListData = true;
                        // _this.pageview.showLoading({text: "审批撤回中...", timeout: 1000});

                        if (_this.isTempSave) {
                            _this.pageview.showTip({text: language.formTips.tempsaveSuccess, duration: 1000});
                        } else {
                            _this.pageview.showTip({text: language.formTips.withdrawnSuccess, duration: 1000});
                        }
                        if (_this.share) {
                            _this.pageview.replaceGo('thanks');
                            return;
                        }
                        window.setTimeout(function () {
                            //特殊处理,详情需要,如果是新增的时候,让formID和instID相同
                            _this.pageview.replaceGo("detail", {
                                formId: data.data[0] || _this.applyHistory.formId,
                                instId: data.data[2],
                                formDataName: encodeURI(_this.applyHistory.instData.name),
                                curPage:"myapprove"
                            });
                        }, 1000);
                        // _this.doRemoveProcess();
                    } else {
                        _this.pageview.showTip({text: data.msg || language.formTips.operationFailure, duration: 1000});
                    }
                },
                error: function (error) {
                    _this.pageview.hideLoading(false);
                    _this.pageview.showTip({text: language.formTips.operationFailure, duration: 1000});
                }
            });
        },

        goAgreeAndAssign: function (para) {
            var _this = this,lastSignUrl="";
            this.pageview.showLoading({text: language.formTips.onLoading, timeout: 8000});
            if(para.lastSignUrl){
                lastSignUrl=para.lastSignUrl||"";
            }
            var _category = this.pageview.params.category || '';//加入分类 xingjjc 2017-3-31
            if (_this.applyHistory.currentTodoTask.taskAuditDesc === "(被加签)") {//加签的审批人不能再指派
                this.pageview.go('deal', {
                    businessKey:_this.applyHistory.instData.businessKey,
                    type: 1,
                    instanceId: para.instanceId,
                    processId: para.processId,
                    taskId: para.taskId,
                    starter: para.starter,
                    currentActivityId: para.currentActivityId,
                    formName: this.formName,
                    pk_bo: para.pk_bo,
                    copyToUsers:para.copyToUsers,
                    cloudsignature:para.cloudsignature,
                    useCloudsignature:para.useCloudsignature,
                    lastSignUrl:lastSignUrl,
                    substitutionComments:para.substitutionComments||'',
                    setBtnVal:JSON.stringify(_this.setBtnVal)||{},
                });
            } else {
                // 指派检查
                this.pageview.ajax({
                    url: "process/assignCheck",
                    type: "GET",
                    data: {
                        "taskId": para.taskId,
                        "executionId":_this.applyHistory.currentTodoTask.executionId||'',
                        category: _category
                    },
                    success: function (data) {
                        _this.pageview.hideLoading(true);

                        if (data.success) {
                            if(data.data.document&&data.data.description){
                                _this.documentDialog = new Dialog({
                                    mode: 3,
                                    wrapper: _this.pageview.$el,
                                    contentText: '你还未进行套红/盖章操作,是否继续提交流程？',
                                    btnDirection: "row",
                                    buttons: [{
                                        title: language.cancel,
                                        style: {
                                            height: 45,
                                            fontSize: 16,
                                            color: c.titleColor,
                                            borderRight: '1px solid #eee'
                                        },
                                        onClick: function () {
                                            _this.documentDialog.hide();
                                        }
                                    }, {
                                        title: language.formAction.continueSubmission,
                                        style: {
                                            height: 45,
                                            fontSize: 16,
                                            color: "#37b7fd",
                                        },
                                        onClick: function () {
                                            _this.documentDialog.hide();
                                            if (!data.data.assignAble) {
                                                if(window.localStorage.getItem("CIRCULATE")){
                                                    _this.pageview.go('deal', {
                                                        type: 1, // 同意
                                                        businessKey:_this.applyHistory.instData.businessKey,
                                                        instanceId: para.instanceId,
                                                        processId: para.processId,
                                                        taskId: para.taskId,
                                                        formName: this.formName,
                                                        category: _category,
                                                        currentActivityId: para.currentActivityId,
                                                        pk_bo: para.pk_bo,
                                                        isCirculate:para.isCirculate||"",
                                                        copyToUsers:para.copyToUsers,
                                                        cloudsignature:para.cloudsignature,
                                                        useCloudsignature:para.useCloudsignature,
                                                        lastSignUrl:lastSignUrl,
                                                        substitutionComments:para.substitutionComments||'',
                                                        setBtnVal:JSON.stringify(_this.setBtnVal)||{},
                                                        actionCode:para.actionCode||''
                                                    });
                                                }else{
                                                    _this.pageview.go('deal', {
                                                        type: 1, // 同意
                                                        businessKey:_this.applyHistory.instData.businessKey,
                                                        instanceId: para.instanceId,
                                                        processId: para.processId,
                                                        taskId: para.taskId,
                                                        formName: this.formName,
                                                        category: _category,
                                                        currentActivityId: para.currentActivityId,
                                                        pk_bo: para.pk_bo,
                                                        isBehind:para.isBehind||"",
                                                        isBefore:para.isBefore||"",
                                                        copyToUsers:para.copyToUsers,
                                                        cloudsignature:para.cloudsignature,
                                                        useCloudsignature:para.useCloudsignature,
                                                        lastSignUrl:lastSignUrl,
                                                        substitutionComments:para.substitutionComments||'',
                                                        setBtnVal:JSON.stringify(_this.setBtnVal)||{},
                                                    });
                                                }

                                            } else {
                                                if(window.localStorage.getItem("ADD_SIGN_BEHIND")){//后加签选人后，审批指派动作传递给后加签出来的审批人，
                                                    _this.pageview.go('deal', {
                                                        type: 1, // 同意
                                                        businessKey:_this.applyHistory.instData.businessKey,
                                                        instanceId: para.instanceId,
                                                        processId: para.processId,
                                                        taskId: para.taskId,
                                                        formName: _this.formName,
                                                        category: _category,
                                                        currentActivityId: para.currentActivityId,
                                                        pk_bo: para.pk_bo,
                                                        isBehind:para.isBehind||"",
                                                        isBefore:para.isBefore||"",
                                                        copyToUsers:para.copyToUsers,
                                                        cloudsignature:para.cloudsignature,
                                                        useCloudsignature:para.useCloudsignature,
                                                        lastSignUrl:lastSignUrl,
                                                        substitutionComments:para.substitutionComments||'',
                                                        setBtnVal:JSON.stringify(_this.setBtnVal)||{},
                                                    });
                                                }else if(window.localStorage.getItem("CIRCULATE")){
                                                    _this.pageview.go('deal', {
                                                        type: 1, // 同意
                                                        businessKey:_this.applyHistory.instData.businessKey,
                                                        instanceId: para.instanceId,
                                                        processId: para.processId,
                                                        taskId: para.taskId,
                                                        formName: _this.formName,
                                                        category: _category,
                                                        currentActivityId: para.currentActivityId,
                                                        pk_bo: para.pk_bo,
                                                        isCirculate:para.isCirculate||"",
                                                        copyToUsers:para.copyToUsers,
                                                        cloudsignature:para.cloudsignature,
                                                        useCloudsignature:para.useCloudsignature,
                                                        lastSignUrl:lastSignUrl,
                                                        substitutionComments:para.substitutionComments||'',
                                                        setBtnVal:JSON.stringify(_this.setBtnVal)||{},
                                                    });
                                                }else{
                                                    window.localStorage.setItem('ASSIGN_CHECK_DATA', JSON.stringify(data));
                                                    _this.pageview.go('deal', {
                                                        type: 3, // 指派
                                                        businessKey:_this.applyHistory.instData.businessKey,
                                                        instanceId: para.instanceId,
                                                        processId: para.processId,
                                                        taskId: para.taskId,
                                                        currentActivityId: para.currentActivityId,
                                                        formName: _this.formName,
                                                        pk_bo: para.pk_bo,
                                                        copyToUsers:para.copyToUsers,
                                                        cloudsignature:para.cloudsignature,
                                                        useCloudsignature:para.useCloudsignature,
                                                        lastSignUrl:lastSignUrl,
                                                        substitutionComments:para.substitutionComments||'',
                                                        setBtnVal:JSON.stringify(_this.setBtnVal)||{},
                                                        actionCode:para.actionCode||''
                                                    });
                                                }
                                            }
                                        }
                                    }]
                                });
                                _this.documentDialog.show();
                            }else{
                                if (!data.data.assignAble) {
                                    if(window.localStorage.getItem("CIRCULATE")){
                                        _this.pageview.go('deal', {
                                            type: 1, // 同意
                                            businessKey:_this.applyHistory.instData.businessKey,
                                            instanceId: para.instanceId,
                                            processId: para.processId,
                                            taskId: para.taskId,
                                            formName: _this.formName,
                                            category: _category,
                                            currentActivityId: para.currentActivityId,
                                            pk_bo: para.pk_bo,
                                            isCirculate:para.isCirculate||"",
                                            copyToUsers:para.copyToUsers,
                                            cloudsignature:para.cloudsignature,
                                            useCloudsignature:para.useCloudsignature,
                                            lastSignUrl:lastSignUrl,
                                            substitutionComments:para.substitutionComments||'',
                                            setBtnVal:JSON.stringify(_this.setBtnVal)||{},
                                        });
                                    }else {
                                        _this.pageview.go('deal', {
                                            type: 1, // 同意
                                            businessKey:_this.applyHistory.instData.businessKey,
                                            instanceId: para.instanceId,
                                            processId: para.processId,
                                            taskId: para.taskId,
                                            formName: _this.formName,
                                            category: _category,
                                            currentActivityId: para.currentActivityId,
                                            pk_bo: para.pk_bo,
                                            isBehind:para.isBehind||"",
                                            isBefore:para.isBefore||"",
                                            copyToUsers:para.copyToUsers,
                                            cloudsignature:para.cloudsignature,
                                            useCloudsignature:para.useCloudsignature,
                                            lastSignUrl:lastSignUrl,
                                            substitutionComments:para.substitutionComments||'',
                                            setBtnVal:JSON.stringify(_this.setBtnVal)||{},
                                            actionCode:para.actionCode||''
                                        });
                                    }

                                } else {
                                    if(window.localStorage.getItem("ADD_SIGN_BEHIND")){//后加签选人后，审批指派动作传递给后加签出来的审批人，
                                        _this.pageview.go('deal', {
                                            type: 1, // 同意
                                            businessKey:_this.applyHistory.instData.businessKey,
                                            instanceId: para.instanceId,
                                            processId: para.processId,
                                            taskId: para.taskId,
                                            formName: _this.formName,
                                            category: _category,
                                            currentActivityId: para.currentActivityId,
                                            pk_bo: para.pk_bo,
                                            isBehind:para.isBehind||"",
                                            isBefore:para.isBefore||"",
                                            copyToUsers:para.copyToUsers,
                                            cloudsignature:para.cloudsignature,
                                            useCloudsignature:para.useCloudsignature,
                                            lastSignUrl:lastSignUrl,
                                            substitutionComments:para.substitutionComments||'',
                                            setBtnVal:JSON.stringify(_this.setBtnVal)||{},
                                        });
                                    }else{
                                        window.localStorage.setItem('ASSIGN_CHECK_DATA', JSON.stringify(data));
                                        _this.pageview.go('deal', {
                                            type: 3, // 指派
                                            businessKey:_this.applyHistory.instData.businessKey,
                                            instanceId: para.instanceId,
                                            processId: para.processId,
                                            taskId: para.taskId,
                                            currentActivityId: para.currentActivityId,
                                            formName: _this.formName,
                                            pk_bo: para.pk_bo,
                                            copyToUsers:para.copyToUsers,
                                            cloudsignature:para.cloudsignature,
                                            useCloudsignature:para.useCloudsignature,
                                            lastSignUrl:lastSignUrl,
                                            substitutionComments:para.substitutionComments||'',
                                            setBtnVal:JSON.stringify(_this.setBtnVal)||{},
                                            actionCode:para.actionCode||''
                                        });
                                    }
                                }
                            }

                        } else {
                            if (data.msg.indexOf("当前环节任务已完成") > -1) {
                                _this.pageview.showTip({text: '此任务已被修改或完成，请刷新或重新进入', duration: 800});
                                _this.applyHistory = {};
                                _this.item = [];
                                _this.loadData();
                            }
                            _this.pageview.showTip({text: data.msg, duration: 2000});
                            // console.error(data.msg);
                        }
                    },
                    error: function (err) {
                        console.error('指派检查失败');
                    }
                });
            }


        },
        goReject: function (para) {
            var _this = this,_approveType;
            var _category = this.pageview.params.category || '';//加入分类 xingjjc 2017-3-31
            if(para.approveType){
                _approveType=para.approveType;
            }
            if (this.applyHistory.currentTodoTask.taskAuditDesc.indexOf("(被加签")>-1){
                para.isBefore='assignBefore';
            }
            this.pageview.go('deal', {
                type: 2,
                instanceId: para.instanceId,
                processId: para.processId,
                taskId: para.taskId,
                starter: para.starter,
                category: _category,
                isWithdrawSubmit: para.isWithdrawSubmit,
                currentActivityId: para.currentActivityId,
                pk_bo: para.pk_bo,
                approveType:_approveType,
                copyToUsers:para.copyToUsers,
                isBefore:para.isBefore,
                cloudsignature:para.cloudsignature,
                useCloudsignature:para.useCloudsignature,
                lastSignUrl:para.lastSignUrl||"",
                substitutionComments:para.substitutionComments||'',
                rejectToEnd:this.rejectToEnd?'1':''
            });
        },
        goJump:function (para) {
            var _this = this,_approveType;
            var _category = this.pageview.params.category || '';//加入分类 xingjjc 2017-3-31
            if(para.approveType){
                _approveType=para.approveType;
            }

            this.pageview.go('deal', {
                type: 10,
                instanceId: para.instanceId,
                processId: para.processId,
                taskId: para.taskId,
                starter: para.starter,
                category: _category,
                isWithdrawSubmit: para.isWithdrawSubmit,
                currentActivityId: para.currentActivityId,
                pk_bo: para.pk_bo,
                approveType:_approveType,
                copyToUsers:para.copyToUsers,
                substitutionComments:para.substitutionComments||'',
            });
        },
        goAddSign: function (para) {
            if (this.applyHistory.currentTodoTask.taskAuditDesc.indexOf("(被加签")>-1){
                para.isBefore='assignBefore';
            }
            this.pageview.go('deal', {
                type: 4,
                instanceId: para.instanceId,
                processId: para.processId,
                taskId: para.taskId,
                currentActivityId: para.currentActivityId,
                pk_bo: para.pk_bo,
                starter: para.starter,
                addsignBehindAble:para.addsignBehindAble||"",
                isBefore:para.isBefore||"",
                copyToUsers:para.copyToUsers,
                substitutionComments:para.substitutionComments||'',
                setBtnVal:JSON.stringify(this.setBtnVal)||{},
            });
        },
        goCirculate: function (para) {
            this.pageview.go('deal', {
                type: 11,
                instanceId: para.instanceId,
                processId: para.processId,
                taskId: para.taskId,
                currentActivityId: para.currentActivityId,
                pk_bo: para.pk_bo,
                starter: para.starter,
                circulate:para.circulate||"",
                copyToUsers:para.copyToUsers,
                substitutionComments:para.substitutionComments||'',
                setBtnVal:JSON.stringify(this.setBtnVal)||{},
            });
        },
        goDelegate: function (para) {
            
        },
        doDelegate: function (para) {
            var _this = this;
            this.pageview.showLoading({text: language.formTips.onLoading, timeout: 8000});
            var formDataList = window._formData,
                applyHistory = window._applyHistory,
                formData = {};
            if ($.isArray(formDataList) && formDataList.length > 0 && formDataList[0]) {
                formData = {
                    formData: formDataList,
                    pkValue: applyHistory.formDataList[0].pk_boins,
                    version: applyHistory.formDataList[0].version,
                    pk_temp: applyHistory.formDataList[0].pk_temp,
                    tableName: applyHistory.iForms.bo_tablename
                };
                formData = JSON.stringify(formData);
            } else {
                formData = '';
            }
            this.defaultComments=JSON.parse(window.localStorage.getItem('DEFAULTCOMMENTS'))||{};
            this.pageview.ajax({
                url: "process/delegateTask",
                type: "POST",
                data: {
                    instanceId: para.instanceId,
                    processId: para.processId,
                    taskId: para.taskId,
                    formData: formData,
                    pk_bo: para.pk_bo,
                    comment:this.defaultComments.reassign||this.setBtnVal.reassign||language.formAction.reassign,//language.formAction.reassign
                    currentActivityId: para.currentActivityId,
                    toAssignee: this.delegatePerson.memberId,
                    copyToUsers:para.copyToUsers,
                    substitutionComments:para.substitutionComments||''
                },
                success: function (data) {
                    _this.pageview.hideLoading(true);
                    window.localStorage.removeItem("copyUserParticipants");
                    if (data.success) {
                        _this.pageview.showTip({text: language.formTips.reassignSuccess, duration: 1000});
                        _this.applyHistory = {};
                        _this.item = [];
                        _this.loadData();
                    } else {
                        _this.pageview.showTip({text: data.msg, duration: 1000});
                    }
                },
                error: function (data) {
                    _this.pageview.showTip({text: data.msg, duration: 1000});
                }
            });
        },
        goCopyTo: function (para) {
            
        },
        doCopyTo: function (para) {
            var _this = this,
                assignees = '';
            this.copy_to_list.forEach(function (value, key) {
                assignees += value.member_id + ',';
            });
            assignees = assignees.substring(0, assignees.length - 1);
            this.pageview.showLoading({text: language.formTips.onLoading, timeout: 8000});
            this.pageview.ajax({
                url: "process/copyToTask",
                type: "POST",
                data: {
                    instanceId: para.instanceId,
                    processId: para.processId,
                    taskId: para.taskId,
                    assignees: assignees
                },
                success: function (data) {
                    _this.pageview.hideLoading(true);

                    if (data.success) {
                        _this.pageview.showTip({text: language.formTips.copyToSuccess, duration: 1000});
                        _this.applyHistory = {};
                        _this.item = [];
                        _this.loadData();
                    } else {
                        _this.pageview.showTip({text: data.msg, duration: 1000});
                    }
                },
                error: function (data) {
                    _this.pageview.showTip({text: data.msg, duration: 1000});
                }
            });
        },
        doCopyForm:function (para) {
            para.processDefinitionId=this.detailData.inst.processDefinitionId||'';
            var _this=this;
            this.pageview.ajax({
                url: "/form/copySaveData",
                type: "POST",
                data: {
                    pk_bo: para.pk_bo,
                    pk_boins: para.pk_boins,
                    processDefinitionId: para.processDefinitionId,
                },
                success: function (data) {
                    _this.pageview.hideLoading(true);
                    if (data.success) {
                        _this.pageview.showTip({text: language.formTips.copyFormSuccess, duration: 1000});
                        setTimeout(function () {
                            _this.pageview.replaceGo("detail", {
                                formId: data.data.pk_boins,
                                instId: data.data.pk_procdefins,
                                taskId:data.data.pk_procdefins,
                                formDataName: encodeURI(_this.formName),
                                curPage:"myapprove",
                                category:'bpm'
                            });
                        },1000);


                    } else {
                        _this.pageview.showTip({text: data.msg, duration: 1000});
                    }
                },
                error: function (data) {
                    _this.pageview.showTip({text: data.msg||language.formTips.serverRequestError, duration: 1000});
                }
            });
        },
        goResetApply: function (para) {
            var _this = this;

            if (!_this.delegateDialog) {
                _this.delegateDialog = new Dialog({
                    mode: 3,
                    wrapper: _this.pageview.$el,
                    contentText: language.formTips.confirmWithdrawApplication,
                    btnDirection: "row",
                    buttons: [{
                        title: language.cancel,
                        style: {
                            height: 45,
                            fontSize: 16,
                            color: c.titleColor,
                            borderRight: '1px solid #eee'
                        },
                        onClick: function () {
                            _this.delegateDialog.hide();
                        }
                    }, {
                        title: language.confirm,
                        style: {
                            height: 45,
                            fontSize: 16,
                            color: "#37b7fd",
                        },
                        onClick: function () {
                            _this.delegateDialog.hide();
                            _this.pageview.showLoading({text: language.formTips.onLoading, timeout: 8000});
                            _this.pageview.ajax({
                                url: "process/withdrawTask",
                                type: "POST",
                                data: {
                                    taskId: para.taskId
                                },
                                success: function (data) {
                                    _this.pageview.hideLoading(true);

                                    if (data.success) {
                                        _this.pageview.showTip({text: language.formTips.withdrawnSuccess, duration: 1000});

                                    } else {
                                        _this.pageview.showTip({text: data.msg, duration: 1000});
                                    }
                                },
                                error: function (data) {
                                    _this.pageview.showTip({text: data.msg, duration: 1000});
                                }
                            });
                        }
                    }]
                });
            }
            _this.delegateDialog.show();
        },
        goResetApprove: function (para) {
            var _this = this;
            var formDataList = window._formData,
                applyHistory = window._applyHistory,
                formData = {};
            if ($.isArray(formDataList) && formDataList.length > 0 && formDataList[0]) {
                formData = {
                    formData: formDataList,
                    pkValue: applyHistory.formDataList[0].pk_boins,
                    version: applyHistory.formDataList[0].version,
                    pk_temp: applyHistory.formDataList[0].pk_temp,
                    tableName: applyHistory.iForms.bo_tablename
                };
                formData = JSON.stringify(formData);
            } else {
                formData = '';
            }
            _this.delegateDialog = new Dialog({
                mode: 3,
                wrapper: _this.pageview.$el,
                contentText: language.formTips.confirmWithdrawApproval,
                btnDirection: "row",
                buttons: [{
                    title: language.cancel,
                    style: {
                        height: 45,
                        fontSize: 16,
                        color: c.titleColor,
                        borderRight: '1px solid #eee'
                    },
                    onClick: function () {
                        _this.delegateDialog.hide();
                    }
                }, {
                    title: language.confirm,
                    style: {
                        height: 45,
                        fontSize: 16,
                        color: "#37b7fd"
                    },
                    onClick: function () {
                        _this.delegateDialog.hide();

                        _this.pageview.showLoading({text: language.formTips.onLoading, timeout: 8000});
                        _this.pageview.ajax({
                            url: "process/withdrawTask",
                            type: "POST",
                            data: {
                                taskId: para.taskId,
                                instanceId:para.instanceId,
                                processId:para.processId,
                                pk_bo: para.pk_bo,
                                currentActivityId: para.currentActivityId,
                                formData: formData
                            },
                            success: function (data) {
                                _this.pageview.hideLoading(true);
                                if (data.success) {
                                    c.replaceUrl(_this.pageview.params.taskId, data.data, _this.pageview);
                                    _this.pageview.params.taskId = data.data;
                                    _this.pageview.replaceGo("detail", {
                                        formId: _this.applyHistory.formId,
                                        instId: _this.detailData.inst.id,
                                        taskId: data.data,
                                        formDataName: encodeURI(_this.formName)
                                    });

                                    _this.pageview.showTip({text: language.formTips.withdrawnSuccess, duration: 1000});
                                    // _this.applyHistory = {};
                                    // _this.item = [];
                                    _this.loadData();
                                } else {
                                    _this.pageview.showTip({text: data.msg, duration: 1000});
                                }
                            },
                            error: function (data) {
                                _this.pageview.showTip({text: data.msg, duration: 1000});
                            }
                        });
                    }
                }]
            });
            _this.delegateDialog.show();
        },
        //文件上传控件
        initUploader: function (sender) {
            var _this = this;
            this.loadToken(function (token) {
                _this.token = token;
            });

            var picker = sender.$el;
            var container = $('.flow_repeat');
            var fileLimit = this.fileMaxNum;
            if (!this.fileUploader) {
                this.fileUploader = new FileUploader(this.pageview, this);
                this.uploaderId = this.fileUploader.initUploader(picker, container, this.pageview.params.taskId, fileLimit);
                setTimeout(function () {
                    _this.fileUploader.updateUploaderSize();
                }, 100);
            }
        },
        loadFilesData: function () {
            this.viewpager.curPageViewItem.contentInstance.pageview.plugin._loadData();
        },
        loadToken: function (callbackFunc) {
            this.pageview.ajax({
                url: "user/getToken",
                success: function (token) {
                    callbackFunc(token);
                },
                error: function (token) {
                    console.error(token);
                }
            });
        },
        uploaderFileByBridge:function () {
            var contentText=[],_this=this;
            var typeFunction=function (type) {
                switch (type.type){
                    case 'photo':
                        _this.selectType=4;
                        break;
                    case 'files':
                        _this.selectType=3;
                        break;
                    case 'pic':
                        _this.selectType=1;
                        break;
                    case 'video':
                        _this.selectType=2;
                        break;
                }

                window.yyesn.client.selectAttachment(function (res) {
                    // 先请求授权，然后回调
                    var data=res.data;
                    var fileData = {},fileList=[];
                    try{
                        data.forEach(function (item,index) {
                            var temp={};
                            temp.id = item.fid;
                            temp.name = item.fname;
                            temp.url = item.path;
                            temp.type = item.type;
                            temp.dir = window.ossMapdir;
                            fileList.push(temp);
                        });

                        // fileData.id = data.id;
                        // fileData.name = data.name;
                        // fileData.type = data.type;
                        // fileData.dir = window.ossMap.key;
                        fileData.fileList=fileList;
                        fileData.taskId = _this.pageview.params.taskId <= -1 ? "" : _this.pageview.params.taskId;
                        fileData.processInstanceId = '';
                        if(_this.pageview.params.curPage==='myapprove'){
                            fileData.taskId=null;
                            fileData.processInstanceId =_this.applyHistory.instData.historicActivityInstances[0].processInstanceId;
                        }

                        _this.pageview.ajax({
                            url:  "/file/saveFileModel",
                            data: JSON.stringify(fileData),
                            type: 'POST',
                            dataType: "json",
                            contentType: "application/json",
                            success: function (data) {
                                _this.pageview.hideLoading(true);
                                if (data.success) {
                                    _this.pageview.showTip({text: language.formTips.uploadedSuccess, duration: 1000});
                                    _this.loadFilesData(data.data);
                                } else {
                                    _this.pageview.showTip({text:  language.formTips.uploadedSuccess + data.msg, duration: 2000});
                                }
                            }
                        });
                    }catch (e){
                        console.log(e);
                    }
                },{
                    type:_this.selectType,
                    maxselectnum:_this.fileMaxNum,
                },function (b) {
                });
            };

            if(utils.deviceInfo().isIOS){
                contentText=[{type:'photo',text:language.selectAttachment.photo,onClick: typeFunction},{type:'video',text:language.selectAttachment.video,onClick: typeFunction},{type:'pic',text:language.selectAttachment.pic,onClick: typeFunction}];
            }else{
                contentText=[{type:'photo',text:language.selectAttachment.photo,onClick: typeFunction},{type:'video',text:language.selectAttachment.video,onClick: typeFunction},{type:'pic',text:language.selectAttachment.pic,onClick: typeFunction},{type:'files',text:language.selectAttachment.files,onClick: typeFunction}];
            }
            this.FileTypeSelect = new Filetypeselect({
                mode: 3,
                wrapper: _this.pageview.$el,
                contentText: contentText,
                btnDirection: "row",
                className: "dialog-custom-className",
            });
            this.FileTypeSelect.show();
        },
        saveFileModel:function (ossMap,data) {

        },

        /**
         * 加载nc动作按钮 xingjjc 2017-4-17
         * @param para
         */
        getNCButtons: function (para) {
            var _this = this;
            this.pageview.showLoading({text: language.formTips.onLoading, timeout: 8000});

            var _category = this.pageview.params.category || '';//加入分类 xingjjc 2017-3-31

            // 指派检查
            this.pageview.ajax({
                url: "process/assignCheck",
                type: "GET",
                data: {
                    "taskId": para.taskId,
                    "executionId":_this.applyHistory.currentTodoTask.executionId||'',
                    category: _category
                },
                success: function (data) {
                    _this.pageview.hideLoading(true);

                    if (data.success) {
                    } else {
                    }
                },
                error: function (err) {
                    console.error('获取nc动作按钮失败' + JSON.stringify(err));
                }
            });
        },


    };
    return PageLogic;
});
