/**
 *
 *  修改说明：
 *      该js文件主要移植于云审的上传，另外云审中对于app的依赖也都相应引入了，主要用到了上传， 删除功能（界面也已不在使用该js中操作dom的方法），预览以及显示功能暂未使用，因整体逻辑复杂，故没有删除未用功能代码。
 *  reviser: 3fuyu
 *  date: 2017/3/7
 *
 */
define(["../../parts/common", "utils", "./plupload.full.min","../../parts/language"], function (c, utils, plupload,language) {

    function formUploader(parentPageview, parent) {
        // "use strict";

        this.uniqueNumber = ((function () {
            var value = 0;
            return function () {
                return ++value;
            };
        })());
        this.uploadedImages = {};//上传文件记录
        this.uploaderRefs = {};//记录uploader的引用
        this.uploaderFileRefs = {};//服务器端文件和uploader的文件的关联引用
        this.formFileDelToken = null;
        this.plupload = window.plupload;
        this.parent = parent;
        this.parentPageview = parentPageview;
    }

    formUploader.prototype = {
        /**
         * 初始化uploader
         * @param pickerSelector
         */
        initUploader: function (pickerDiv, containerDiv, taskId, fileNumLimit, isShare,picOnly) {//div.choose-file-btn
            //debugger;
            var _this = this;
            console.debug('init Uploader start.taskId=' + taskId);
            var MAX_FILE_SIZE = 100 * 1000 * 1000;//附件大小限制100M内
            // 先请求授权，然后回调
            var ossMap = {};
            this.isShare = isShare;
            this.parentPageview.ajax({
                url: "/oss/policy",
                type: "GET",
                success: function (data) {
                    // 添加配置参数
                    ossMap.accessid = data.data.accessid;
                    ossMap.policy = data.data.policy;
                    ossMap.signature = data.data.signature;
                    ossMap.key = data.data.dir;
                    ossMap.success_action_status = 201; // 指定返回的状态码
                    ossMap.host = data.data.host;
                    window.ossMapdir=data.data.dir;
                }
            });

            var picker = $(pickerDiv);
            var container = $(containerDiv);
            var uploaderId = '';

            var pickerLen = picker.length;
            var containerLen = container.length;
            if (pickerLen !== 1) {
                console.error('init Uploader found picker size!=1 but:' + pickerLen);
            }
            if (containerLen !== 1) {
                console.error('init Uploader found container size!=1 but:' + containerLen);
            }

            var inited = picker.attr('uploader-init');
            if (inited) {
                uploaderId = picker.attr('data-uploader-id');
                console.info('uploader inited before.uploaderId=' + uploaderId);
                return uploaderId;
            }

            uploaderId = "id_" + this.uniqueNumber();
            picker.attr('uploader-init', 'true').attr('data-uploader-id', uploaderId);
            container.attr('data-uploader-id', uploaderId);

            this.uploadedImages[uploaderId] = [];

            //puploader
            if (!pickerDiv.nodeType) {
                pickerDiv = pickerDiv[0];
            }
            var that = this;

            uploaderId = picker.attr('data-uploader-id');
            var uploader = new this.plupload.Uploader({
                runtimes: 'html5,flash,silverlight,html4',
                browse_button: pickerDiv.children[0],//
                multi_selection: true,
                //container: containerDiv,
                flash_swf_url: './Moxie.swf',
                silverlight_xap_url: './Moxie.xap',
                url: 'https://oss.aliyuncs.com',
                filters: {
                    //mime_types : [ //
                    //    { title : "Image files", extensions : "png,bmp,tiff,svg" },
                    //    { title : "Zip Files", extensions : "txt,doc,docx,xls,xlsx,pot,pps,ppt,pptx,pdf,vsd,rtf,wps,wpt" }
                    //],

                    // max_file_size: MAX_FILE_SIZE, //最大只能上传20Mb的文件 在此加过滤项不会走BeforeUpload，故屏蔽
                    //prevent_duplicates : true //不允许选取重复文件
                },
                init: {
                    PostInit: function () {

                    },

                    FilesAdded: function (up, files) {
                        var num = _this.parent.fileMaxNum - _this.parent.fileNum;
                        if ((up.files.length) > num) {
                            console.debug("length1:" + up.files.length);
                            // up.splice((num), 999);
                            // _this.parentPageview.showTip({text: "文件个数超出限制", duration: 1000});
                            ////approveApp.showAlert("文件个数超限!");
                            // up.refresh();
                            // return false;
                        }
                        up.refresh();//流程附件放开文件个数限制
                        //approveApp.showCover(true);
                        //approveApp.showCoverText("上传");
                        up.settings.browse_button[0].disabled = true;
                        up.start();
                    },

                    BeforeUpload: function (up, file) {
                        var times = new Date().getTime();
                        file.name = times + "_" + file.name;
                        console.debug('当前时间:' + times);

                        if(picOnly&&file.type.toLowerCase().indexOf('image')===-1){
                            up.state = _this.plupload.FAILED;
                            up.removeFile(file.id);
                            _this.parentPageview.showTip({text: "请上传图片类型文件！", duration: 1000});
                            return false;
                        }

                        if (file.size && file.size > MAX_FILE_SIZE) {
                            up.state = _this.plupload.FAILED;
                            up.removeFile(file.id);
                            // up.fail(i18n("The maximum file size is __size__MB", {
                            //     size: MAX_FILE_SIZE / 1000 / 1000
                            // }));
                            _this.parentPageview.showTip({text: "文件大小超出限制！", duration: 1000});
                            return false;
                        }
                        // if(file.type&&file.type.indexOf("video")>-1){
                        //     _this.parentPageview.showTip({text: "暂不支持视频文件上传！", duration: 1000});
                        //     return false;
                        // }

                        var new_multipart_params = {
                            'key': ossMap.key + '_' + file.name,
                            'policy': ossMap.policy,
                            'OSSAccessKeyId': ossMap.accessid,
                            'success_action_status': '200', //让服务端返回200,不然，默认会返回204
                            'signature': ossMap.signature,
                        };

                        up.setOption({
                            'url': ossMap.host,
                            'multipart_params': new_multipart_params,
                            'fileNumLimit': fileNumLimit
                        });
                    },

                    UploadProgress: function (up, file) {
                        _this.parentPageview.showLoading({text: "上传中 " + file.percent + "%"});
                        console.log(file.id + ":" + file.name + " 上传%:" + file.percent);
                    },

                    FileUploaded: function (up, file, info) {
                        up.settings.browse_button[0].disabled = false;
                        console.log(info);
                        if (info.status === 200) {
                            var fileData = {},fileList=[],temp={};
                            // 分享字段
                            temp.id = file.id;
                            temp.name = file.name;
                            temp.url = file.path;
                            temp.type = file.type;
                            temp.dir = ossMap.key;
                            fileList.push(temp);
                            fileData.share = _this.isShare || '';
                            // fileData.id = file.id;
                            // fileData.name = file.name;
                            // fileData.type = file.type;
                            // fileData.dir = ossMap.key;
                            fileData.taskId = taskId <= -1 ? "" : taskId;
                            fileData.fileList = fileList;
                            fileData.processInstanceId = '';
                            if(_this.parentPageview.pageview.params.curPage==="myapprove"){
                                fileData.taskId ='';
                                fileData.processInstanceId = _this.parent.applyHistory.instData.historicActivityInstances[0].processInstanceId;
                            }
                            // utils.ajax();
                            _this.parentPageview.ajax({
                                url: _this.getAppServerUrl() + "/file/saveFileModel",
                                data: JSON.stringify(fileData),
                                type: 'POST',
                                dataType: "json",
                                contentType: "application/json",
                                success: function (data) {
                                    _this.parentPageview.hideLoading(true);

                                    console.log(file.id + ":" + file.name + " 上传完毕");
                                    if (data.success) {
                                        _this.parentPageview.showTip({text: language.formTips.uploadedSuccess, duration: 1000});
                                        var atta = data.data;
                                        _this.uploaderFileRefs[atta.id] = file;

                                        _this.parent.loadFilesData(data.data[0]);

                                        _this.recordFileUploaded(uploaderId, atta);
                                    } else {
                                        _this.parentPageview.showTip({text: language.formTips.uploadedFailed+"：" + data.msg, duration: 2000});
                                        uploader.removeFile(file);//移除
                                        console.log(file.name + "上传失败:" + data.msg);
                                    }
                                    up.removeFile(file.id);
                                    up.refresh();
                                }
                            });
                        } else {
                            up.fail(info.response);
                            console.error(info.response);
                        }
                    },

                    Error: function (up, err) {
                        if (err.code === -601) {
                            _this.parentPageview.showTip({text: language.formTips.uploadedFailed+"：", duration: 2000});
                            up.settings.browse_button[0].disabled = false;
                            //  approveApp.showAlert("文件格式错误!");
                        }
                        //up.fail(err.response);
                        //console.error(err.response);
                    }
                }
            });
            uploader.setOption("fileNumLimit", 12);
            this.uploaderRefs[uploaderId] = uploader;
            uploader.me = this;
            uploader.init();


            return uploaderId;
        },

        /**
         * 文件上传成功后续记录和事件的处理
         * @param uploaderId
         * @param serverId
         */
        recordFileUploaded: function (uploaderId, atta) {
            console.debug('recordFileUploaded:' + uploaderId + "-->" + atta.id + ",type=" + atta.type);
            var container = $("div.uploadimg-container[data-uploader-id='" + uploaderId + "']");
            this.showFileInContainer(container, atta, uploaderId, true, true);
        },

        showFileInContainer: function (container, att, uploaderId, canDelPageFile, canDelServerFile) {
            var _this = this;

            var imgLen = container.children(".upload-file-preview").length;//container.children().length-2;
            if (imgLen >= 12) {
                console.error('文件数量已经超过12个,则不再显示');
                //return;
                $("div.choose-file-btn[data-uploader-id='" + uploaderId + "']").css("display", "none");//上传按钮可以看到
                //$("div.uploadimg-container[data-uploader-id='"+uploaderId+"']").children(":eq(1)").css("display","none");
            }

            var serverId = att.id;
            this.uploadedImages[uploaderId].push(serverId);

            var fileDiv = this.createFileShowDiv(att);
            //container.prepend(fileDiv);
            container.find(".choose-file-btn").before(fileDiv);
            imgLen++;

            this.updateFileContainerSize(container);
            this.updateUploaderLimit(uploaderId, container.children(".upload-file-preview").length);
            ////debugger;
            console.debug("imgLen:" + imgLen);
            if (imgLen >= 12) {
                ////debugger;
                console.debug('隐藏文件上传按钮');
                $("div.choose-file-btn[data-uploader-id='" + uploaderId + "']").css("display", "none");//没有位置了则不可再上传
            }

            if (canDelPageFile) {
                _this.createFileDelIcon(fileDiv, function () {
                    if (canDelServerFile) {
                        _this.deleteServerUploadImage(serverId, function () {
                            _this.removeUploadFileInPage(fileDiv, uploaderId, serverId, container);
                        });
                    } else {
                        _this.removeUploadFileInPage(fileDiv, uploaderId, serverId, container);
                    }
                });
            }
        },

        updateUploaderLimit: function (uploaderId, imgLen) {
            //debugger;
            //上传文件数限制
            var uploader = this.uploaderRefs[uploaderId];
            var oldLimit = uploader.getOption("fileNumLimit");//uploader.settings.multipart_params.fileNumLimit;
            var newLimit = 12 - imgLen;
            //uploader.setOption("fileNumLimit",newLimit<0?0:newLimit);//更新为newLimit个
            //uploader.settings.multipart_params.fileNumLimit=newLimit<0?0:newLimit;
            //uploader.setOption("fileNumLimit",newLimit<0?0:newLimit);
            console.info('更新uploader的文件数限制:' + oldLimit + "-->" + newLimit + "-->" + uploader.getOption("fileNumLimit"));
            //var viewLength=$(".upload-file-preview").length;
            if (newLimit > 0 && newLimit <= 12) {
                $("div.choose-file-btn[data-uploader-id='" + uploaderId + "']").css("display", "");//上传按钮可以看到
                $("div.uploadimg-container[data-uploader-id='" + uploaderId + "']").children(":eq(1)")
                    .css("display", "");
                $(".moxie-shim").each(function () {
                    $(this).height(48);
                    $(this).width(48);
                });
            } else {
                $("div.choose-file-btn[data-uploader-id='" + uploaderId + "']").css("display", "none");//
                //$("div.uploadimg-container[data-uploader-id='"+uploaderId+"']").children(":eq(1)").css("display","none");
            }
        },

        removeUploadFileInPage: function (fileDiv, uploaderId, delFileId, container) {
            //debugger;
            console.debug('移除页面上的文件:delFileId=' + delFileId + ",uploaderId=" + uploaderId);
            fileDiv.remove();
            var uploader = this.uploaderRefs[uploaderId];
            if ((container.children(".upload-file-preview").length) < uploader.getOption("fileNumLimit")) {
                $("div.choose-file-btn[data-uploader-id='" + uploaderId + "']").css("display", "");//上传按钮可以看到
                $("div.uploadimg-container[data-uploader-id='" + uploaderId + "']").children(":eq(1)")
                    .css("display", "");
            }
            var thisUploaderFiles = this.uploadedImages[uploaderId];
            console.debug('thisUploaderFiles=' + thisUploaderFiles.length);
            $.each(thisUploaderFiles, function (idx, fileId) {
                console.debug('loop:' + idx + ",fileId=" + fileId);
                if (delFileId === fileId) {
                    console.debug('删除的文件的idx=' + idx);
                    console.debug('删除前文件数组=' + thisUploaderFiles);
                    thisUploaderFiles.splice(idx, 1);
                    console.debug('删除后文件数组=' + thisUploaderFiles);

                    var uploader = this.uploaderRefs[uploaderId];
                    var file = this.uploaderFileRefs[delFileId];
                    if (file) {//apply-history里之前上传的文件没有该信息
                        console.debug('清除uploader里记录的文件.uploaderId=' + uploaderId + ",file=" + file);
                        //uploader.removeFile(file);
                    }
                    return false;//break
                }
            });
            this.updateFileContainerSize(container);
            this.updateUploaderLimit(uploaderId, container.children(".upload-file-preview").length);
        },

//将上传成功文件的记录信息set到form里
        uploadedFileCacheToForm: function () {
            console.debug('uploadedFileCacheToForm...');
            $.each(this.uploadedImages, function (uploaderId, serverFileIdArray) {
                console.debug("附件toForm :" + uploaderId + "," + serverFileIdArray);
                var serverIds = serverFileIdArray.join(",");
                $("div.choose-file-btn[data-uploader-id='" + uploaderId + "']").find("input.upload-file-store")
                    .val(serverIds);
            });
        },

//删除本次上传的所有文件
        deleteAllServerUploadImage: function (ignoreFileIdArray, callback, failCallback) {
            var _this = this;
            //如果是重新编辑，则原本的附件不能删除，重新编辑后新上传的附件需要删除
            var allServerFiles = [];
            $.each(this.uploadedImages, function (uploaderId, serverFileIdArray) {
                console.debug("删除附件 :" + uploaderId + "," + serverFileIdArray);
                allServerFiles = allServerFiles.concat(serverFileIdArray);
            });

            if (ignoreFileIdArray.length > 0) {
                console.info("所有附件id:" + allServerFiles.join(","));
                console.info("过滤掉不能删除的附件id:" + ignoreFileIdArray.join(","));

                var needDelFiles = allServerFiles.filter(function (fileId) {
                    var idx = ignoreFileIdArray.indexOf(fileId);
                    //不在ignoreFileIdArray里的都要删除
                    if (idx === -1) {
                        return true;
                    }
                    return false;
                });

                console.info("剩下需要删除的附件id:" + needDelFiles.join(","));

                allServerFiles = needDelFiles;
            }

            if (allServerFiles.length > 0) {
                //approveApp.showCover(true);
                //approveApp.showCoverText("删除已上传的附件");
                var fileIds = allServerFiles.join(",");
                _this.deleteServerAttas(fileIds, callback, failCallback);
            } else {
                console.debug('没有附件需要删除');
                callback && callback();
                // jsLoader.doCallback(callback, []);
            }
        },

//删除某个子表的某个记录里上传的文件
        deleteSubFormServerUploadImages: function (subFormId, subFormIdx, subItemCodes, delServerFile) {
            var _this = this;
            console.debug('删除子表' + subFormId + "的第" + subFormIdx + "条记录里的文件.字段名:" + subItemCodes);
            //先将数据set到表单hidden域
            _this.uploadedFileCacheToForm();
            //再从hidden域中取出来
            $.each(subItemCodes, function (itemIdx, itemCode) {
                var hideInput = $("input.upload-file-store[name='" + subFormId + "." + itemCode + "']").eq(subFormIdx);
                var val = hideInput.val();
                console.debug('删除表单域 ' + itemCode + "对应的文件=" + val);
                if (val !== null && val.length > 0) {
                    if (delServerFile) {
                        console.debug("删除服务器里的文件");
                        var imgs = val.split(",");
                        $.each(imgs, function (imgIdx, imgId) {
                            _this.deleteServerUploadImage(imgId);
                        });
                    } else {
                        console.debug("不删除服务器里的文件");
                    }

                    var chooseBtnDiv = hideInput.parents("div.choose-file-btn");
                    var uploaderId = chooseBtnDiv.attr("data-uploader-id");
                    console.debug('删除表单域 ' + itemCode + "对应的缓存id=" + uploaderId + ",清空...");
                    this.uploadedImages[uploaderId] = [];
                }
            });
        },

//删除某个文件
        deleteServerUploadImage: function (imgId, callback, failCallback) {
            console.debug("delete attach.imgId=" + imgId);

            //approveApp.showCover(true);
            //approveApp.showCoverText('删除文件');
            this.deleteServerAttas(imgId, callback, failCallback);
        },

        deleteServerAttas: function (fileIds, callback, failCallback) {
            this.parentPageview.ajax({
                url: "file/deleteAttachment",
                data: {
                    "fileIds": fileIds,
                    "token": this.formFileDelToken,
                },
                success: function () {
                    console.debug("删除已上传到服务器的临时附件成功");
                    callback && callback();
                },
                error: function () {
                    failCallback && failCallback();
                }
            });
        },


//更新uploader的ui
        updateUploaderSize: function () {
            console.debug("更新uploader上传插件的大小");

            $("div.webuploader-container").css("position", "absolute");//必须有否则图标位置就坏了
            $("div.webuploader-pick").removeClass("webuploader-pick").removeClass("webuploader-pick-hover");
            $("div[id^='rt_rt_']").css({"left": "0px", "top": "0px", "width": "100%", "height": "100%", "z-index": 10});//否则会在原本图标的右侧
        },

//创建文件的显示和事件对象
//         createFileShowDiv: function (error, src) {
//             var img = '';
// //	console.debug('image file.'+att.id+".type="+type);
//             if (!error) {// && type!="image/tif" && type!="image/tiff"
//                 img = $("<img src='" + src + "' class='tab3-img' />");
//             } else {
//                 img = $("<img src='" + this.getAppServerUrl() + "/static/image/fail.jpg" + "' class='tab3-img' />");
//             }
//             var fileDiv = $('<div class="tab3-img-div upload-file-preview"></div>');
//             fileDiv.append(img);
//             return fileDiv;
//         },
        getAppServerUrl: function () {

            // TODO 找到这个方法
            // var appUrl = this.getAppUrl();
            // 暂时写死
            var appUrl = '';
            if (appUrl.toLowerCase().indexOf("file://") === 0) {
                //如果当前页面是本地资源则serverUrl需要替换成服务器端的
                return "//ys.yyuap.com/weixin-mp-prod";//先写死成这个
            }
            return appUrl;
        },
        //创建文件的显示和事件对象
        createFileShowDiv: function (att) {
            var _this = this;

            var appUrl = this.getAppServerUrl();
            var type = att.type ? att.type.toLowerCase() : "";
            var img = null;
            if (type.length > 6 && type.substring(0, 6) == "image/") {// && type!="image/tif" && type!="image/tiff"
                console.debug('image file.' + att.id + ".type=" + type);
                var imgSrc = att.aliOSSLimitUrl;
                var loadingImgSrc = appUrl + "/static/image/loading.gif";
                var clientW = document.documentElement.clientWidth;
                var littleWidth = parseInt(clientW / 4);
                var imgSrc2 = imgSrc;//+'?w='+littleWidth;
                console.info(imgSrc2);
                this.createPrefetch(imgSrc);

                img = $("<img src='" + loadingImgSrc + "' class='tab3-img'></img>");
                var litterImg = new Image();
                litterImg.src = imgSrc2;
                litterImg.onload = function () {
                    console.debug('litterImg load over. ' + this.src);
                    img.attr("src", this.src);
                };
                litterImg.onerror = function () {
                    //载入失败
                    img.attr("src", appUrl + "/static/image/fail.jpg");
                };
                this.bindClickEvent(img, function () {
                    $.post(appUrl + "/oss/file?filename=" + att.externalUrl, function (data) {
                        var data = $.parseJSON(data);
                        _this.showImg(data.url);
                    })

                });
            } else {
                var name = att.name;
                img = $('<a href="' + appUrl + '/file/downloadattachment/' + att.id + '" target="_blank" class="tab3-img font-size-3 tab3-notimg-file"><i class="icon iconfont icon-enclosure"></i><br>' + name + '</a>');
//    		approveApp.bindClickEvent(img,function(){
//    			approveApp.ddut('pageclick');
//    		});
            }
            var fileDiv = $('<div class="tab3-img-div upload-file-preview"></div>');
            fileDiv.append(img);
            return fileDiv;

        },
        createPrefetch: function (url) {//文件预加载,h5新特性
            var htm = '<link rel="prefetch prerender" href="' + url + '">';
            $("body").append(htm);
        },
        bindClickEvent: function (selector, callbackFunc) {
            $(selector).on('click', function () {
                callbackFunc && callbackFunc();
                callbackFunc && callbackFunc();
                // jsLoader.doCallback(callbackFunc, [$(this), event]);
            });
        },
        updateFileContainerSize: function (container) {
            //debugger;
            console.debug('设置文件显示区域大小');
            var imgLen = container.children(".upload-file-preview").length;
            if (imgLen > 0) {
                container.css("height", "auto");//有图片后撑开div
            } else {
                container.css("min-height", "0");
            }
            var w = 10;
            if (imgLen === 1) {
                w = 10;
            } else if (imgLen >= 3) {
                w = 14;
            } else {
                w = imgLen * 7;
            }
            container.css("width", w + "rem");
            console.debug('更新文件container的width=' + w + '实际结果=' + container.css("width"));
        },
        createFileDelIcon: function (fileDiv, delFunc) {
            var _this = this;

            var delicon = $("<i class=\"upload-icon iconfont icon-delete\"></i>");
            fileDiv.append(delicon);
            this.bindClickEvent(delicon, function () {
                var _msg = "确定要删除这个文件吗？";
                delFunc && delFunc();
//                 if (approveApp.isDingTalkClient()) {
//                     approveApp.getDingTalkVar().device.notification.confirm({
//                         message: _msg,
//                         title: '文件删除确认',
//                         buttonLabels: ['取消', '确定'],
//                         onSuccess: function (result) {
//                             if (result.buttonIndex == 1) jsLoader.doCallback(delFunc, []);
//                         },
//                         onFail: function (err) {
//                             console.debug("dd.confirm error==>" + JSON.stringify(err));
//                         }
//                     });
// //			}else if(confirm(_msg,'yes','no')) jsLoader.doCallback(delFunc,[]);
//                     //微信多次confirm()时，取消按钮变成关闭网页，所以取消提示弹窗，直接删除图片 2016-09-18 xingjjc
//                 } else jsLoader.doCallback(delFunc, []);
            });
        },
        getAppUrl: function () {
            var hrf = location.href;
            var idx = hrf.indexOf("/static/");
            if (idx === -1) {
                idx = hrf.indexOf("/form/");
            }
            var appUrl = hrf.substring(0, idx);
//    	console.debug("appUrl="+appUrl);
            return appUrl;
        },
        //大图显示图片
        showImg: function (url) {
            var _this = this;

            var w = document.documentElement.clientWidth;
            var loadingImg = this.getAppServerUrl() + "/static/image/loading.gif";
            //判断是否是表单附件上传界面
            var idx = location.href.indexOf("/form/");
            var html = null;
            if (idx === -1) {
                console.debug("---------其他界面显示大图");
                html = '<div class="img-view-bg z-index-newPage-bg bg-opactity"></div>';
                html += '<div class="img-view-bg z-index-newPage">';
                html += '	<div class="img-whole">';
                html += '		<img src="' + loadingImg + '" class="img-view img-filter" title="图片" id="bigImg">';//
                html += ' 	</div>';
                html += '</div>';
            } else {
                console.debug("--------->>表单附件上传界面显示缩略图图");
                html = '<div class="img-view-bg-sl z-index-newPage-bg-sl bg-opactity"></div>';
                html += '<div class="img-view-bg-sl z-index-newPage">';
                html += '	<div class="img-whole-sl">';
                html += '		<img src="' + loadingImg + '" class="img-view-sl img-filter" title="图片" id="bigImg">';//
                html += ' 	</div>';
                html += '</div>';
            }
            $("body").append(html);
            $("#bigImg").animate({"opacity": "1"}, 500, function () {
                $(this).on("error", function () {
                    var appUrl = _this.getAppServerUrl();
                    $("#bigImg").attr("src", appUrl + "/static/image/fail.jpg");
                });
                $(this).attr("src", url);
            });

            this.bindClickEvent('.img-view-bg', function () {$(".img-view-bg").remove();});
            this.bindClickEvent('.img-view-bg-sl', function () {$(".img-view-bg-sl").remove();});
        },
    };

    return formUploader;
});
