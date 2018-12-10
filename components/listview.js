/*
 {
 type:"listview",
 style:{},
 root:[""],
 itemStyle:{},
 noData:"",
 loading:"",
 },
 components:{

 }
 */
define(["utils", "base"], function (utils, baseClass) {
    var ListRow = function (config) {
        var _this = this;
        if (config.style) {
            if (!config.style["flexDirection"] && !config.style["flex-direction"]) {
                config.style.flexDirection = "column";
                config.style.webkitFlexDirection = "column";
            }
        }
        config.noNeedSetStyle = true;

        ListRow.baseConstructor.call(this, config);
        if (!this.parent.rowMarkSeed) {
            this.parent.rowMarkSeed = 0;
        }
        this.listview = config.listview;
        this.parent.rowMarkSeed += 1;
        this.rowindex = this.parent.rowMarkSeed;
        this.rowMark = "row" + this.rowindex;
        this.contentWrapper = $("<div class='displayflex yy-row-content'></div>");

        utils.css(this.contentWrapper, config.style);
        this.SwipeDomWrapper = null;
        this.$$childrenWrapper = this.contentWrapper;
        this.$el.addClass("yy-listrow");
        if (config.itemClassName) {
            this.$el.addClass(config.itemClassName);
        }

        this.defaultSwipIconWidth = utils.getRealWidth(70);
        this.$el.attr("row-mark", this.rowMark);
        this.selectedMode = config.listview.selectedMode || "m";
        this.contentWrapper.appendTo(this.$el);
        this.initLayout(config.$$datasource, null, this);
        this.$el.bind("click", function (e) {
            if (_this.config.listview.status === "edit") {
                _this.select();
                return;
            }
            if (_this.pageview.plugin) {
                var method_name = _this.config.listview.config.comKey + "_rowclick";
                var method = _this.pageview.plugin[method_name];
                method && method.call(_this.pageview.plugin, _this, {e: e});
            }
        });

        var pliginInitSwipeIconMethodName = _this.config.listview.config.comKey + "_getrowswipeicons";
        this.pliginInitSwipeIconMethod = _this.pageview.plugin[pliginInitSwipeIconMethodName];


        var selectChangeMethodName = this.config.listview.config.comKey + "_selectChange";
        this.selectChangeMethod = this.pageview.plugin[selectChangeMethodName];
    }

    utils.extends(ListRow, baseClass);
    ListRow.prototype.select = function () {


        if (this.selectedMode === "m") {
            var index = this.config.listview.selectedRows.indexOf(this);
            if (index >= 0) {
                this.config.listview.selectedRows.splice(index, 1);
                this.unSelected();
            } else {
                this.config.listview.selectedRows.push(this);
                this.selected();
            }
        } else {
            var beforeSelectedRow = this.config.listview.selectedRows[0];
            beforeSelectedRow && beforeSelectedRow.unSelected();
            this.config.listview.selectedRows[0] = this;
            this.selected();
        }


        this.selectChangeMethod && this.selectChangeMethod.call(this.pageview.plugin, this.config.listview, {});

    };

    ListRow.prototype.rebind = function (data) {
        this.contentWrapper.empty();
        this.datasource = data;
        this.initLayout(data, null, this);
    };
    ListRow.prototype.render = function () {

    }

    ListRow.prototype.initSwipeDom = function () {
        var _this = this;
        var SwipeIcons = this.parent.config.rowSwipeIcons;
        if (this.pliginInitSwipeIconMethod) {
            SwipeIcons = this.pliginInitSwipeIconMethod.call(_this.pageview.plugin, _this, {});
        }

        if (this.SwipeDomWrapper) {return;}
        this.SwipeDomWrapper = $("<div class='yy-row-swipwrapper displayflex flex-h'></div>");
        this.SwipeDomWrapper.appendTo(this.$el);

        this.recreateSwipe(SwipeIcons);


    }


    ListRow.prototype.recreateSwipe = function (SwipeIcons) {
        var _this = this;
        this.SwipeDomWrapper.empty();
        if (!SwipeIcons || SwipeIcons.length == 0) {
            this.SwipeIconsSumWidth = 0;
            return;
        }
        this.SwipeIconsSumWidth = 0;
        for (var i = 0, j = SwipeIcons.length; i < j; i++) {
            var iconKey = SwipeIcons[i];
            var iconConfig = this.pageview.config.components[iconKey];

            iconConfig.style = iconConfig.style || {};
            var iconWidth = iconConfig.style["width"] || this.defaultSwipIconWidth;

            iconWidth = parseInt(iconWidth);

            this.SwipeIconsSumWidth += iconWidth;
            iconConfig.style.width = iconWidth + "px";
            iconConfig.style.height = "100%";
            this.getComponentInstanceByComKey(iconKey, this.datasource, this, function (comInstance) {
                    comInstance.setAttribute && comInstance.setAttribute("data-swipeicon", "1");
                    _this.SwipeDomWrapper.append(comInstance.$el);
                },
                function () {});
        }
    }

    ListRow.prototype.remove = function () {
        this.delete(true);
    };
    ListRow.prototype.delete = function (isNoAnimate) {
        var _this = this;

        var index = this.parent.rows.indexOf(this);
        if (index >= 0) {
            this.parent.rows.splice(index, 1);
        }

        var indexInSelectedRows = this.listview.selectedRows.indexOf(this);
        if (indexInSelectedRows >= 0) {
            this.listview.selectedRows.splice(indexInSelectedRows, 1);
        }
        if (isNoAnimate) {
            _this.$el.remove();
            if (_this.config.listview.isGroupList) {
                if (_this.parent.rows.length == 0) {
                    _this.parent.remove();
                }
            }
            return;
        }
        this.$el.css({height: (this.$el.height() + 1) + "px"});
        window.setTimeout(function () {
            _this.$el.css({
                transition: "height .12s linear",
                "-webkit-transition": "height .12s linear",
                "height": "0px"
            });
        }, 40);
        window.setTimeout(function () {
            _this.$el.remove();

            if (_this.config.listview.isGroupList) {
                if (_this.parent.rows.length == 0) {
                    _this.parent.remove();
                }
            }

        }, 345);

    }

    ListRow.prototype.swipeToLeft = function (diff) {
        this.contentWrapper.css(
            utils.processTransitionTanformStyle("none", "translate3d(" + diff + "px,0,0)")
        )
    }

    ListRow.prototype.closeSwipe = function () {
        this.contentWrapper.css(
            utils.processTransitionTanformStyle("transform .2s ease", "translate3d(0,0,0)")
        )
    }
    ListRow.prototype.setSwipeOpenPos = function () {
        this.contentWrapper.css(
            utils.processTransitionTanformStyle("transform .2s ease", "translate3d(-" + this.SwipeIconsSumWidth + "px,0,0)")
        );
    }


    var ListGroupHeader = function (config) {
        var _this = this;
        ListGroupHeader.baseConstructor.call(this, config);
        var isCanCollapse = config.isCanCollapse;
        var className = "yy-sticky displayflex";
        if (isCanCollapse === true) {
            this.isCollapse = false;
            className += " yy-icommon yy-listgroup-colheader";

            this.$el.bind("click", function () {
                if (_this.isCollapse) {
                    _this.parent.expand();
                    _this.isCollapse = false;
                    _this.$el.removeClass("yy-listgroup-header-collapse");
                } else {
                    _this.isCollapse = true;
                    _this.parent.collapse();
                    _this.$el.addClass("yy-listgroup-header-collapse");
                }
            })
        }
        this.$el.addClass(className);
        //
        this.initLayout(config.$$datasource, null, this);
    }

    utils.extends(ListGroupHeader, baseClass);

    var ListGroup = function (config) {
        ListGroup.baseConstructor.call(this, config);
        var isCanCollapse = this.parent.config.isCanCollapse;
        this.$el.attr("data-gval", config.groupValue);
        var groupBody = $("<div class='yy-listgroup-body'></div>");
        this.groupBodyInner = $("<div class='yy-listgroup-body-inner'></div>");
        groupBody.append(this.groupBodyInner);
        this.groupHeader = new ListGroupHeader({
            $$datasource: config.groupHeaderData,
            type: "listgroupheader",
            isCanCollapse: isCanCollapse,
            root: this.config.rootConfig.groupHeader,
            style: this.config.rootConfig.groupHeaderStyle,
            $$pageview: this.pageview,
            groupValue: config.groupValue,
            $$parent: this,
        });
        this.display = "block";
        this.groupValue = config.groupValue;
        this.$el.append(this.groupHeader.$el).append(groupBody);
        this.rows = [];
    }

    utils.extends(ListGroup, baseClass);

    ListGroup.prototype.expand = function () {
        this.groupBodyInner.removeClass("displaynone");
    };
    ListGroup.prototype.collapse = function () {
        this.groupBodyInner.addClass("displaynone");
    };

    ListGroup.prototype.insertRow = function (newRow, index) {
        this.show();
        var row = this.rows[index];

        if (row) {
            newRow.$el.insertBefore(row.$el);
            this.rows.splice(index, 0, newRow);
        } else {
            this.rows.push(newRow);
            this.groupBodyInner.append(newRow.$el);
        }
        return newRow;
    };
    ListGroup.prototype.append = function (row) {
        this.show();
        this.groupBodyInner.append(row);
    };
    ListGroup.prototype.show = function () {
        if (this.display == "block") {
            return;
        }
        if (this.display == "none") {
            this.$el.removeClass("displaynone");
            this.display = "block";
        }

    };
    ListGroup.prototype.remove = function (needRemove) {
        if (this.parent.groups[this.groupValue]) {
            delete this.parent.groups[this.groupValue];
        }
        if (needRemove) {
            this.$el.remove();
        }
        //隐藏不删除
        this.display = "none";
        this.$el.addClass("displaynone");
    }


    var Component = function (config) {
        var _this = this;
        if (!config.style) {
            config.style = {};

        }
        if (!config.style["flexDirection"] && !config.style["flex-direction"]) {
            config.style.flexDirection = "column";
        }
        this.config = config;
        this.ajaxConfig = config.ajaxConfig;

        Component.baseConstructor.call(this, config);

        this.ajaxConfig = this.ajaxConfig || config.ajaxConfig;
        this.initAjaxConfig(this.ajaxConfig);


        this.groupKey = this.config.groupKey;
        this.isGroupList = this.groupKey != null;
        this.groups = {};

        this.autoLoadData = config.autoLoadData || false;
        this.$el.addClass("displayflex yy-listview");
        this.selectedMode = config.selectedMode;
        this.swipeOffsetX = utils.getRealWidth(25);
        this.selectedRows = [];
        this.rows = [];

        this.canOpenOffsetRight = utils.getRealWidth(70);

        this.splitStyle = config.splitStyle;
        this.showBlockClassNameDict = {};

        var pluginParseDataMethodName = this.config.comKey + "_parsedata";
        this.pluginParseDataMethod = this.pageview.plugin[pluginParseDataMethodName];

        var pluginBeforeLoadDataMethodName = this.config.comKey + "_beforeload";
        this.pluginBeforeLoadDataMethod = this.pageview.plugin[pluginBeforeLoadDataMethodName];
        var pluginAfterLoadDataMethodName = this.config.comKey + "_afterload";
        this.pluginAfterLoadDataMethod = this.pageview.plugin[pluginAfterLoadDataMethodName];


        var DemoMethodName = this.config.comKey + "_demo演示";
        this.DemoMethod = this.pageview.plugin[DemoMethodName];


        this.init();

    }
    utils.extends(Component, baseClass);


    Component.prototype.setLeftOpen = function () {
        if (this.status === "edit") {
            this.setLeftClose();
            return;
        }
        this.status = "edit";
        this.$el.addClass(this.showBlockClassNameDict["left"]);

    };

    Component.prototype.setLeftRightOpen = function () {
        if (this.status === "edit") {
            this.setLeftRightClose();
            return;
        }
        this.status = "edit";

        this.$el.addClass((this.showBlockClassNameDict["left"] || "") + " " + (this.showBlockClassNameDict["right"] || ""));
    };

    Component.prototype.setLeftRightClose = function () {
        this.status = "";
        this.$el.removeClass((this.showBlockClassNameDict["left"] || "") + " " + (this.showBlockClassNameDict["right"] || ""));
    };
    Component.prototype.setLeftClose = function () {
        this.status = "";
        this.$el.removeClass(this.showBlockClassNameDict["left"]);
    };

    Component.prototype.setRightOpen = function () {
        if (this.status === "edit") {
            this.setRightClose();
            return;
        }
        this.status = "edit";

        this.$el.addClass(this.showBlockClassNameDict["right"]);

    };
    Component.prototype.setRightClose = function () {
        this.status = "";
        this.$el.removeClass(this.showBlockClassNameDict["right"]);
    };

    Component.prototype.initLeftRightBlock = function () {
        this.initBlock(this.config.leftBlock, "left");
        this.initBlock(this.config.rightBlock, "right");
    };

    Component.prototype.initBlock = function (blockConfig, leftorRight) {

        if (!blockConfig) {
            return;
        }

        if (!blockConfig.key || !blockConfig.width) {
            console.error("listview 的" + leftorRight + "Block配置需要包括key和widt属性");
        }
        try {
            blockConfig.width = parseInt(blockConfig.width);
        } catch (e) {

        }
        if (isNaN(blockConfig.width)) {
            console.error("listview 的" + leftorRight + "Block的widt属性必须为数值");
        }
        blockConfig.width = utils.getRealWidth(blockConfig.width);
        var key = this.getUniqueKey() + leftorRight;
        this.$el.addClass(key);
        if (!this.showBlockClassNameDict) {
            this.showBlockClassNameDict = {};
        }
        this.showBlockClassNameDict[leftorRight] = key + "_show" + leftorRight;

        utils.createStyleSheet(key, "." + blockConfig.key + " {transition:width .12s ease;-webkit-transition:width .12s ease;} ." + this.showBlockClassNameDict[leftorRight] + " ." + blockConfig.key + " {width:" + blockConfig.width + "px !important;}");

    };


    Component.prototype.init = function () {

        var _this = this;

        if (this.config.nodata) {
            this.getComponentInstanceByComKey(this.config.nodata, null, null, function (comInstance) {
                    _this.$el.append(comInstance.$el);
                    // if(_this.components.length > 0 ){
                    comInstance.$el.addClass("displaynone");
                    // }
                    _this.noDataDom = comInstance;
                },
                function () {});
        }

        this.initEvent();
        this.initLeftRightBlock();
        if (this.autoLoadData) {
            window.setTimeout(function () {
                if (_this.parent && _this.parent.setCanLoadMore) {
                    _this.parent.setPullLoadingState();
                }
                _this.loadFirstPageData();
            }, 430);

        }
    }

    Component.prototype.getTargetRow = function (e) {
        var target = e.target;
        while (target.className != "yy-listrow") {
            if (target.className == "yy-listview") {
                break;
            }
            if (target.tagName == "BODY") {
                break;
            }
            target = target.parentNode;
        }
        var rowMark = target.getAttribute("row-mark");
        var Re = null;
        if (rowMark) {
            for (var i = 0, j = this.rows.length; i < j; i++) {
                var row = this.rows[i];
                if (row.rowMark === rowMark) {
                    Re = row;
                    break;
                }
            }
        }
        return Re;
    };


    Component.prototype.initEvent = function () {
        var _this = this;
        this.curSwipRow = null;
        var swipeOffSetRight = utils.getRealWidth(280);
        if (this.config.rowSwipeIcons) {
            var canSwipe = false, startX, diff, startY;
            this.$el.bind("touchstart", function (e) {

                if (_this.status === "edit") {return;}

                var touch = e.touches[0];
                if (e.target.getAttribute("data-swipeicon") !== "1") {
                    _this.curSwipRow && _this.curSwipRow.closeSwipe();
                    startX = touch.pageX;
                    startY = touch.pageY;
                    canSwipe = utils.viewport.width - startX < swipeOffSetRight;
                    if (canSwipe) {
                        _this.curSwipRow = _this.getTargetRow(e);
                        if (_this.curSwipRow) {
                            _this.curSwipRow.initSwipeDom();
                        }
                    }
                } else {
                    canSwipe = false;
                }


            });
            this.$el.bind("touchmove", function (e) {
                if (_this.status === "edit") {return;}

                if (!canSwipe || !_this.curSwipRow || _this.curSwipRow.SwipeIconsSumWidth == 0) {
                    canSwipe = false;
                    return;
                }
                var touch = e.touches[0];
                var curX = touch.pageX;
                diff = curX - startX;
                var diff_abs = Math.abs(diff);
                var diffY = startY - touch.pageY;
                if (Math.abs(diffY) > 30 && diff_abs > 0) {
                    diff = 10;
                    return;
                }

                if (diff < -10) {
                    if (diff_abs > 10) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                    diff = diff_abs > _this.curSwipRow.SwipeIconsSumWidth + _this.swipeOffsetX ? (0 - _this.curSwipRow.SwipeIconsSumWidth - _this.swipeOffsetX) : diff;
                    _this.curSwipRow.swipeToLeft(diff);
                }

            });
            this.$el.bind("touchend", function () {

                if (_this.status === "edit") {return;}
                if (!canSwipe || diff >= 0) {
                    diff = 0;
                    return;
                }
                canSwipe = false;
                if (Math.abs(diff) > _this.canOpenOffsetRight) {
                    _this.curSwipRow && _this.curSwipRow.setSwipeOpenPos();
                } else {
                    diff != 0 && _this.curSwipRow && _this.curSwipRow.closeSwipe();
                }
                diff = 0;
            });
        }
    };

    Component.prototype.getRowCount = function () {
        if (this.isGroupList) {
            var len = 0;
            this.eachRow(function (row) {
                len += 1;
            });
            return len;
        } else {
            return this.rows.length;
        }
    };
    Component.prototype.eachRow = function (callback) {
        if (this.isGroupList) {
            for (var key in this.groups) {
                var group = this.groups[key];
                for (var i = 0, j = group.rows.length; i < j; i++) {
                    callback(group.rows[i], i, group);
                }
            }
        } else {
            for (var ii = 0, jj = this.rows.length; ii < jj; ii++) {
                callback(this.rows[ii], ii);
            }
        }
    };

    Component.prototype.empty = function () {
        // this.$el.empty();
        if (this.isGroupList) {
            for (var key in this.groups) {
                this.groups[key].remove(true);
                delete this.groups[key];
            }

            return;
        }
        for (var i = this.rows.length - 1; i >= 0; i--) {
            this.rows[i].remove();
        }
        this.rows = [];
    };

    Component.prototype.selectAll = function () {
        var _this = this;
        if (this.config.selectedMode === "m") {

            this.selectedRows = [];
            this.eachRow(function (row) {
                _this.selectedRows.push(row);
                row.selected();
            });
        }
    };

    Component.prototype.clearSelectAll = function () {
        var _this = this;
        if (this.config.selectedMode === "m") {
            this.selectedRows = [];
            this.eachRow(function (row) {
                row.unSelected();
            });
        }
    };

    Component.prototype.loadFirstPageData = function (params) {
        var _this = this;
        params = params || {};
        _this.parent.setInitLoadMessage && _this.parent.setInitLoadMessage();

        if (!this.pageNumKey) {
            this.pageNumKey = this.ajaxConfig.pageNumKey;
            if (!this.pageNumKey) {
                console.error("listview 配置没有设置页码字段属性pageNumKey");
            }
        }
        this.parentAnimate = params.parentAnimate;
        if (params.parentAnimate !== false) {
            // if(!this.config.autoLoadData){
            this.parent.setPullLoadingState();
            // }
        }
        var firstPageIndex = (this.ajaxConfig.firstPageIndex || this.ajaxConfig.firstPageIndex === 0) ? this.ajaxConfig.firstPageIndex : 1;
        this.ajaxConfig.data[this.pageNumKey] = firstPageIndex;
        
        // 测试数据写死
        var data=[ {
            "id" : "e619dc30-f9f8-11e8-8cbc-0242ac1e1582",
            "url" : "http://ys.esn.ren/ubpm-web-rest/service/runtime/tasks/e619dc30-f9f8-11e8-8cbc-0242ac1e1582",
            "owner" : null,
            "assignee" : "989ac042-8376-43a7-affb-0a82ba400a72",
            "delegationState" : null,
            "name" : "部门负责人",
            "description" : null,
            "createTime" : "2018-12-07T16:20:04.000+08:00",
            "dueDate" : "3017-12-07T16:20:04.000+08:00",
            "priority" : 50,
            "suspended" : false,
            "taskDefinitionKey" : "approveUserTask_wq1fb4f4e",
            "tenantId" : "zuye0hrs",
            "category" : "3d6943fd-5e26-4779-9c82-dd3ff2fe9924",
            "formKey" : null,
            "parentTaskId" : null,
            "parentTaskUrl" : null,
            "executionId" : "e61966fa-f9f8-11e8-8cbc-0242ac1e1582",
            "executionUrl" : "http://ys.esn.ren/ubpm-web-rest/service/runtime/executions/e61966fa-f9f8-11e8-8cbc-0242ac1e1582",
            "processInstanceId" : "e612d729-f9f8-11e8-8cbc-0242ac1e1582",
            "processInstanceUrl" : "http://ys.esn.ren/ubpm-web-rest/service/runtime/process-instances/e612d729-f9f8-11e8-8cbc-0242ac1e1582",
            "processDefinitionId" : "iform_a12167c00db1:4:6ea82da4-f9cc-11e8-ac71-0242ac1e0808",
            "processDefinitionUrl" : "http://ys.esn.ren/ubpm-web-rest/service/repository/process-definitions/iform_a12167c00db1:4:6ea82da4-f9cc-11e8-ac71-0242ac1e0808",
            "variables" : [ ],
            "processDefinitionName" : "用车申请单",
            "activity" : {
              "id" : "approveUserTask_wq1fb4f4e",
              "name" : "部门负责人",
              "type" : "userTask",
              "properties" : {
                "documentation" : null,
                "type" : "userTask",
                "useCloudsignature" : "true",
                "rejectToEnd" : "true",
                "rejectAble" : "true",
                "copyToAble" : "true",
                "extendAttributes" : "[]",
                "multiInstance" : "parallel",
                "default" : null,
                "canBeRejected" : "true",
                "name" : "部门负责人",
                "canBeJumped" : "false",
                "countersignOnlyLastJump" : "false"
              },
              "participants" : null,
              "extendId" : null
            },
            "assigneeParticipant" : {
              "id" : "989ac042-8376-43a7-affb-0a82ba400a72",
              "code" : "yhtc_zhangyyz@yonyou.com",
              "name" : "张娅宇",
              "org" : null,
              "org_name" : null,
              "pic" : "https://cdn.yonyoucloud.com/pro/yht/102462/2892082/201801/29/151720300824c717784f8d427129fafa3bb299e484.jpg.thumb.jpg",
              "source" : null,
              "type" : "USER",
              "priority" : 50
            },
            "candidateParticipants" : null,
            "processInstance" : {
              "id" : "e612d729-f9f8-11e8-8cbc-0242ac1e1582",
              "url" : "http://ys.esn.ren/ubpm-web-rest/service/runtime/process-instances/e612d729-f9f8-11e8-8cbc-0242ac1e1582",
              "businessKey" : "9f2b4e3c-bbc0-4d97-b756-77ef381eef47:c257949d-5fdf-4b85-a9f7-c77e27b7ef0b",
              "suspended" : false,
              "ended" : false,
              "processDefinitionId" : "iform_a12167c00db1:4:6ea82da4-f9cc-11e8-ac71-0242ac1e0808",
              "processDefinitionUrl" : "http://ys.esn.ren/ubpm-web-rest/service/repository/process-definitions/iform_a12167c00db1:4:6ea82da4-f9cc-11e8-ac71-0242ac1e0808",
              "activityId" : null,
              "variables" : [ ],
              "tenantId" : "zuye0hrs",
              "completed" : false,
              "historicTasks" : null,
              "tasks" : null,
              "name" : "张娅宇的用车申请单",
              "keyFeature" : "[]",
              "startParticipant" : {
                "id" : "989ac042-8376-43a7-affb-0a82ba400a72",
                "code" : "yhtc_zhangyyz@yonyou.com",
                "name" : "张娅宇",
                "org" : null,
                "org_name" : null,
                "pic" : "https://cdn.yonyoucloud.com/pro/yht/102462/2892082/201801/29/151720300824c717784f8d427129fafa3bb299e484.jpg.thumb.jpg",
                "source" : null,
                "type" : "USER",
                "priority" : 50
              },
              "subHistoricProcessInstanceResponses" : null
            },
            "taskComments" : [ ],
            "categoryResponse" : {
              "errcode" : 0,
              "errmsg" : "ok",
              "id" : "3d6943fd-5e26-4779-9c82-dd3ff2fe9924",
              "url" : null,
              "tenantId" : "zuye0hrs",
              "revision" : 1,
              "code" : "3d6943fd-5e26-4779-9c82-dd3ff2fe9924",
              "name" : "12.5上线"
            },
            "operations" : null,
            "warning" : false,
            "outtime" : false,
            "procInsStartTime" : "2018-12-07T16:20:04.000+08:00"
          }, {
            "id" : "ba3dd502-f9f8-11e8-877d-0242ac1e2b87",
            "url" : "http://ys.esn.ren/ubpm-web-rest/service/runtime/tasks/ba3dd502-f9f8-11e8-877d-0242ac1e2b87",
            "owner" : null,
            "assignee" : "989ac042-8376-43a7-affb-0a82ba400a72",
            "delegationState" : null,
            "name" : "部门负责人",
            "description" : null,
            "createTime" : "2018-12-07T16:18:51.000+08:00",
            "dueDate" : "3017-12-07T16:18:51.000+08:00",
            "priority" : 50,
            "suspended" : false,
            "taskDefinitionKey" : "approveUserTask_wq1fb4f4e",
            "tenantId" : "zuye0hrs",
            "category" : "3d6943fd-5e26-4779-9c82-dd3ff2fe9924",
            "formKey" : null,
            "parentTaskId" : null,
            "parentTaskUrl" : null,
            "executionId" : "ba3cc38c-f9f8-11e8-877d-0242ac1e2b87",
            "executionUrl" : "http://ys.esn.ren/ubpm-web-rest/service/runtime/executions/ba3cc38c-f9f8-11e8-877d-0242ac1e2b87",
            "processInstanceId" : "ba29627b-f9f8-11e8-877d-0242ac1e2b87",
            "processInstanceUrl" : "http://ys.esn.ren/ubpm-web-rest/service/runtime/process-instances/ba29627b-f9f8-11e8-877d-0242ac1e2b87",
            "processDefinitionId" : "iform_a12167c00db1:4:6ea82da4-f9cc-11e8-ac71-0242ac1e0808",
            "processDefinitionUrl" : "http://ys.esn.ren/ubpm-web-rest/service/repository/process-definitions/iform_a12167c00db1:4:6ea82da4-f9cc-11e8-ac71-0242ac1e0808",
            "variables" : [ ],
            "processDefinitionName" : "用车申请单",
            "activity" : {
              "id" : "approveUserTask_wq1fb4f4e",
              "name" : "部门负责人",
              "type" : "userTask",
              "properties" : {
                "documentation" : null,
                "type" : "userTask",
                "useCloudsignature" : "true",
                "rejectToEnd" : "true",
                "rejectAble" : "true",
                "copyToAble" : "true",
                "extendAttributes" : "[]",
                "multiInstance" : "parallel",
                "default" : null,
                "canBeRejected" : "true",
                "name" : "部门负责人",
                "canBeJumped" : "false",
                "countersignOnlyLastJump" : "false"
              },
              "participants" : null,
              "extendId" : null
            },
            "assigneeParticipant" : {
              "id" : "989ac042-8376-43a7-affb-0a82ba400a72",
              "code" : "yhtc_zhangyyz@yonyou.com",
              "name" : "张娅宇",
              "org" : null,
              "org_name" : null,
              "pic" : "https://cdn.yonyoucloud.com/pro/yht/102462/2892082/201801/29/151720300824c717784f8d427129fafa3bb299e484.jpg.thumb.jpg",
              "source" : null,
              "type" : "USER",
              "priority" : 50
            },
            "candidateParticipants" : null,
            "processInstance" : {
              "id" : "ba29627b-f9f8-11e8-877d-0242ac1e2b87",
              "url" : "http://ys.esn.ren/ubpm-web-rest/service/runtime/process-instances/ba29627b-f9f8-11e8-877d-0242ac1e2b87",
              "businessKey" : "9718c090-ae15-4591-bc9c-8440bc86a43c:c257949d-5fdf-4b85-a9f7-c77e27b7ef0b",
              "suspended" : false,
              "ended" : false,
              "processDefinitionId" : "iform_a12167c00db1:4:6ea82da4-f9cc-11e8-ac71-0242ac1e0808",
              "processDefinitionUrl" : "http://ys.esn.ren/ubpm-web-rest/service/repository/process-definitions/iform_a12167c00db1:4:6ea82da4-f9cc-11e8-ac71-0242ac1e0808",
              "activityId" : null,
              "variables" : [ ],
              "tenantId" : "zuye0hrs",
              "completed" : false,
              "historicTasks" : null,
              "tasks" : null,
              "name" : "张娅宇的用车申请单",
              "keyFeature" : "[]",
              "startParticipant" : {
                "id" : "989ac042-8376-43a7-affb-0a82ba400a72",
                "code" : "yhtc_zhangyyz@yonyou.com",
                "name" : "张娅宇",
                "org" : null,
                "org_name" : null,
                "pic" : "https://cdn.yonyoucloud.com/pro/yht/102462/2892082/201801/29/151720300824c717784f8d427129fafa3bb299e484.jpg.thumb.jpg",
                "source" : null,
                "type" : "USER",
                "priority" : 50
              },
              "subHistoricProcessInstanceResponses" : null
            },
            "taskComments" : [ ],
            "categoryResponse" : {
              "errcode" : 0,
              "errmsg" : "ok",
              "id" : "3d6943fd-5e26-4779-9c82-dd3ff2fe9924",
              "url" : null,
              "tenantId" : "zuye0hrs",
              "revision" : 1,
              "code" : "3d6943fd-5e26-4779-9c82-dd3ff2fe9924",
              "name" : "12.5上线"
            },
            "operations" : null,
            "warning" : false,
            "outtime" : false,
            "procInsStartTime" : "2018-12-07T16:18:51.000+08:00"
          }, {
            "id" : "a5243834-f9f8-11e8-9f8d-0242ac1e3506",
            "url" : "http://ys.esn.ren/ubpm-web-rest/service/runtime/tasks/a5243834-f9f8-11e8-9f8d-0242ac1e3506",
            "owner" : null,
            "assignee" : "989ac042-8376-43a7-affb-0a82ba400a72",
            "delegationState" : null,
            "name" : "部门负责人",
            "description" : null,
            "createTime" : "2018-12-07T16:18:15.000+08:00",
            "dueDate" : "3017-12-07T16:18:15.000+08:00",
            "priority" : 50,
            "suspended" : false,
            "taskDefinitionKey" : "approveUserTask_wq1fb4f4e",
            "tenantId" : "zuye0hrs",
            "category" : "3d6943fd-5e26-4779-9c82-dd3ff2fe9924",
            "formKey" : null,
            "parentTaskId" : null,
            "parentTaskUrl" : null,
            "executionId" : "a523c2fe-f9f8-11e8-9f8d-0242ac1e3506",
            "executionUrl" : "http://ys.esn.ren/ubpm-web-rest/service/runtime/executions/a523c2fe-f9f8-11e8-9f8d-0242ac1e3506",
            "processInstanceId" : "a51c48cd-f9f8-11e8-9f8d-0242ac1e3506",
            "processInstanceUrl" : "http://ys.esn.ren/ubpm-web-rest/service/runtime/process-instances/a51c48cd-f9f8-11e8-9f8d-0242ac1e3506",
            "processDefinitionId" : "iform_a12167c00db1:4:6ea82da4-f9cc-11e8-ac71-0242ac1e0808",
            "processDefinitionUrl" : "http://ys.esn.ren/ubpm-web-rest/service/repository/process-definitions/iform_a12167c00db1:4:6ea82da4-f9cc-11e8-ac71-0242ac1e0808",
            "variables" : [ ],
            "processDefinitionName" : "用车申请单",
            "activity" : {
              "id" : "approveUserTask_wq1fb4f4e",
              "name" : "部门负责人",
              "type" : "userTask",
              "properties" : {
                "documentation" : null,
                "type" : "userTask",
                "useCloudsignature" : "true",
                "rejectToEnd" : "true",
                "rejectAble" : "true",
                "copyToAble" : "true",
                "extendAttributes" : "[]",
                "multiInstance" : "parallel",
                "default" : null,
                "canBeRejected" : "true",
                "name" : "部门负责人",
                "canBeJumped" : "false",
                "countersignOnlyLastJump" : "false"
              },
              "participants" : null,
              "extendId" : null
            },
            "assigneeParticipant" : {
              "id" : "989ac042-8376-43a7-affb-0a82ba400a72",
              "code" : "yhtc_zhangyyz@yonyou.com",
              "name" : "张娅宇",
              "org" : null,
              "org_name" : null,
              "pic" : "https://cdn.yonyoucloud.com/pro/yht/102462/2892082/201801/29/151720300824c717784f8d427129fafa3bb299e484.jpg.thumb.jpg",
              "source" : null,
              "type" : "USER",
              "priority" : 50
            },
            "candidateParticipants" : null,
            "processInstance" : {
              "id" : "a51c48cd-f9f8-11e8-9f8d-0242ac1e3506",
              "url" : "http://ys.esn.ren/ubpm-web-rest/service/runtime/process-instances/a51c48cd-f9f8-11e8-9f8d-0242ac1e3506",
              "businessKey" : "594142fe-047b-4c40-9cb4-83c94ea14b1f:c257949d-5fdf-4b85-a9f7-c77e27b7ef0b",
              "suspended" : false,
              "ended" : false,
              "processDefinitionId" : "iform_a12167c00db1:4:6ea82da4-f9cc-11e8-ac71-0242ac1e0808",
              "processDefinitionUrl" : "http://ys.esn.ren/ubpm-web-rest/service/repository/process-definitions/iform_a12167c00db1:4:6ea82da4-f9cc-11e8-ac71-0242ac1e0808",
              "activityId" : null,
              "variables" : [ ],
              "tenantId" : "zuye0hrs",
              "completed" : false,
              "historicTasks" : null,
              "tasks" : null,
              "name" : "张娅宇的用车申请单",
              "keyFeature" : "[]",
              "startParticipant" : {
                "id" : "989ac042-8376-43a7-affb-0a82ba400a72",
                "code" : "yhtc_zhangyyz@yonyou.com",
                "name" : "张娅宇",
                "org" : null,
                "org_name" : null,
                "pic" : "https://cdn.yonyoucloud.com/pro/yht/102462/2892082/201801/29/151720300824c717784f8d427129fafa3bb299e484.jpg.thumb.jpg",
                "source" : null,
                "type" : "USER",
                "priority" : 50
              },
              "subHistoricProcessInstanceResponses" : null
            },
            "taskComments" : [ ],
            "categoryResponse" : {
              "errcode" : 0,
              "errmsg" : "ok",
              "id" : "3d6943fd-5e26-4779-9c82-dd3ff2fe9924",
              "url" : null,
              "tenantId" : "zuye0hrs",
              "revision" : 1,
              "code" : "3d6943fd-5e26-4779-9c82-dd3ff2fe9924",
              "name" : "12.5上线"
            },
            "operations" : null,
            "warning" : false,
            "outtime" : false,
            "procInsStartTime" : "2018-12-07T16:18:15.000+08:00"
          }, {
            "id" : "3da68954-f9f8-11e8-8cbc-0242ac1e1582",
            "url" : "http://ys.esn.ren/ubpm-web-rest/service/runtime/tasks/3da68954-f9f8-11e8-8cbc-0242ac1e1582",
            "owner" : null,
            "assignee" : "989ac042-8376-43a7-affb-0a82ba400a72",
            "delegationState" : null,
            "name" : "部门负责人",
            "description" : null,
            "createTime" : "2018-12-07T16:15:22.000+08:00",
            "dueDate" : "3017-12-07T16:15:22.000+08:00",
            "priority" : 50,
            "suspended" : false,
            "taskDefinitionKey" : "approveUserTask_wq1fb4f4e",
            "tenantId" : "zuye0hrs",
            "category" : "3d6943fd-5e26-4779-9c82-dd3ff2fe9924",
            "formKey" : null,
            "parentTaskId" : null,
            "parentTaskUrl" : null,
            "executionId" : "3da6141e-f9f8-11e8-8cbc-0242ac1e1582",
            "executionUrl" : "http://ys.esn.ren/ubpm-web-rest/service/runtime/executions/3da6141e-f9f8-11e8-8cbc-0242ac1e1582",
            "processInstanceId" : "3d9d6165-f9f8-11e8-8cbc-0242ac1e1582",
            "processInstanceUrl" : "http://ys.esn.ren/ubpm-web-rest/service/runtime/process-instances/3d9d6165-f9f8-11e8-8cbc-0242ac1e1582",
            "processDefinitionId" : "iform_a12167c00db1:4:6ea82da4-f9cc-11e8-ac71-0242ac1e0808",
            "processDefinitionUrl" : "http://ys.esn.ren/ubpm-web-rest/service/repository/process-definitions/iform_a12167c00db1:4:6ea82da4-f9cc-11e8-ac71-0242ac1e0808",
            "variables" : [ ],
            "processDefinitionName" : "用车申请单",
            "activity" : {
              "id" : "approveUserTask_wq1fb4f4e",
              "name" : "部门负责人",
              "type" : "userTask",
              "properties" : {
                "documentation" : null,
                "type" : "userTask",
                "useCloudsignature" : "true",
                "rejectToEnd" : "true",
                "rejectAble" : "true",
                "copyToAble" : "true",
                "extendAttributes" : "[]",
                "multiInstance" : "parallel",
                "default" : null,
                "canBeRejected" : "true",
                "name" : "部门负责人",
                "canBeJumped" : "false",
                "countersignOnlyLastJump" : "false"
              },
              "participants" : null,
              "extendId" : null
            },
            "assigneeParticipant" : {
              "id" : "989ac042-8376-43a7-affb-0a82ba400a72",
              "code" : "yhtc_zhangyyz@yonyou.com",
              "name" : "张娅宇",
              "org" : null,
              "org_name" : null,
              "pic" : "https://cdn.yonyoucloud.com/pro/yht/102462/2892082/201801/29/151720300824c717784f8d427129fafa3bb299e484.jpg.thumb.jpg",
              "source" : null,
              "type" : "USER",
              "priority" : 50
            },
            "candidateParticipants" : null,
            "processInstance" : {
              "id" : "3d9d6165-f9f8-11e8-8cbc-0242ac1e1582",
              "url" : "http://ys.esn.ren/ubpm-web-rest/service/runtime/process-instances/3d9d6165-f9f8-11e8-8cbc-0242ac1e1582",
              "businessKey" : "4f1465e3-6435-46ec-a689-e31692661fc2:c257949d-5fdf-4b85-a9f7-c77e27b7ef0b",
              "suspended" : false,
              "ended" : false,
              "processDefinitionId" : "iform_a12167c00db1:4:6ea82da4-f9cc-11e8-ac71-0242ac1e0808",
              "processDefinitionUrl" : "http://ys.esn.ren/ubpm-web-rest/service/repository/process-definitions/iform_a12167c00db1:4:6ea82da4-f9cc-11e8-ac71-0242ac1e0808",
              "activityId" : null,
              "variables" : [ ],
              "tenantId" : "zuye0hrs",
              "completed" : false,
              "historicTasks" : null,
              "tasks" : null,
              "name" : "张娅宇的用车申请单",
              "keyFeature" : "[]",
              "startParticipant" : {
                "id" : "989ac042-8376-43a7-affb-0a82ba400a72",
                "code" : "yhtc_zhangyyz@yonyou.com",
                "name" : "张娅宇",
                "org" : null,
                "org_name" : null,
                "pic" : "https://cdn.yonyoucloud.com/pro/yht/102462/2892082/201801/29/151720300824c717784f8d427129fafa3bb299e484.jpg.thumb.jpg",
                "source" : null,
                "type" : "USER",
                "priority" : 50
              },
              "subHistoricProcessInstanceResponses" : null
            },
            "taskComments" : [ ],
            "categoryResponse" : {
              "errcode" : 0,
              "errmsg" : "ok",
              "id" : "3d6943fd-5e26-4779-9c82-dd3ff2fe9924",
              "url" : null,
              "tenantId" : "zuye0hrs",
              "revision" : 1,
              "code" : "3d6943fd-5e26-4779-9c82-dd3ff2fe9924",
              "name" : "12.5上线"
            },
            "operations" : null,
            "warning" : false,
            "outtime" : false,
            "procInsStartTime" : "2018-12-07T16:15:22.000+08:00"
          }, {
            "id" : "27407576-f9e6-11e8-8cbc-0242ac1e1582",
            "url" : "http://ys.esn.ren/ubpm-web-rest/service/runtime/tasks/27407576-f9e6-11e8-8cbc-0242ac1e1582",
            "owner" : null,
            "assignee" : "989ac042-8376-43a7-affb-0a82ba400a72",
            "delegationState" : null,
            "name" : "孟玮1",
            "description" : null,
            "createTime" : "2018-12-07T14:05:53.000+08:00",
            "dueDate" : "3017-12-07T14:05:53.000+08:00",
            "priority" : 50,
            "suspended" : false,
            "taskDefinitionKey" : "approveUserTask_yql72efhh",
            "tenantId" : "zuye0hrs",
            "category" : "3d6943fd-5e26-4779-9c82-dd3ff2fe9924",
            "formKey" : null,
            "parentTaskId" : null,
            "parentTaskUrl" : null,
            "executionId" : "27400041-f9e6-11e8-8cbc-0242ac1e1582",
            "executionUrl" : "http://ys.esn.ren/ubpm-web-rest/service/runtime/executions/27400041-f9e6-11e8-8cbc-0242ac1e1582",
            "processInstanceId" : "69339450-f9cd-11e8-9f8d-0242ac1e3506",
            "processInstanceUrl" : "http://ys.esn.ren/ubpm-web-rest/service/runtime/process-instances/69339450-f9cd-11e8-9f8d-0242ac1e3506",
            "processDefinitionId" : "iform_86e6e2d57307:1:bd7313ad-f9cc-11e8-ac71-0242ac1e0808",
            "processDefinitionUrl" : "http://ys.esn.ren/ubpm-web-rest/service/repository/process-definitions/iform_86e6e2d57307:1:bd7313ad-f9cc-11e8-ac71-0242ac1e0808",
            "variables" : [ {
              "name" : "bpmAssigninfoBy_",
              "type" : "string",
              "value" : "064fd6c5-f9e6-11e8-8cbc-0242ac1e1582",
              "scope" : "global"
            }, {
              "name" : "counterSigning",
              "type" : "boolean",
              "value" : false,
              "scope" : "global"
            }, {
              "name" : "counterSignType",
              "type" : "string",
              "value" : "grab",
              "scope" : "global"
            } ],
            "processDefinitionName" : "JHJC员工调薪审批表",
            "activity" : {
              "id" : "approveUserTask_yql72efhh",
              "name" : "孟玮1",
              "type" : "userTask",
              "properties" : {
                "addsignAble" : "true",
                "addsignBehindAble" : "true",
                "documentation" : null,
                "type" : "userTask",
                "useCloudsignature" : "true",
                "rejectToEnd" : "true",
                "rejectAble" : "true",
                "delegateAble" : "true",
                "copyToAble" : "true",
                "extendAttributes" : "[]",
                "multiInstance" : "parallel",
                "default" : null,
                "canBeRejected" : "true",
                "rotatabletask" : "true",
                "name" : "孟玮1",
                "canBeJumped" : "false",
                "samepostApprove" : "true",
                "sendRejectMesToEvery" : "true",
                "assignAble" : "true",
                "countersignOnlyLastJump" : "false"
              },
              "participants" : null,
              "extendId" : null
            },
            "assigneeParticipant" : {
              "id" : "989ac042-8376-43a7-affb-0a82ba400a72",
              "code" : "yhtc_zhangyyz@yonyou.com",
              "name" : "张娅宇",
              "org" : null,
              "org_name" : null,
              "pic" : "https://cdn.yonyoucloud.com/pro/yht/102462/2892082/201801/29/151720300824c717784f8d427129fafa3bb299e484.jpg.thumb.jpg",
              "source" : null,
              "type" : "USER",
              "priority" : 50
            },
            "candidateParticipants" : null,
            "processInstance" : {
              "id" : "69339450-f9cd-11e8-9f8d-0242ac1e3506",
              "url" : "http://ys.esn.ren/ubpm-web-rest/service/runtime/process-instances/69339450-f9cd-11e8-9f8d-0242ac1e3506",
              "businessKey" : "41c7ef6c-d68a-424b-9b6a-95215ba028d3:1aa69578-5841-456d-b04d-9a0efe0f08d8",
              "suspended" : false,
              "ended" : false,
              "processDefinitionId" : "iform_86e6e2d57307:1:bd7313ad-f9cc-11e8-ac71-0242ac1e0808",
              "processDefinitionUrl" : "http://ys.esn.ren/ubpm-web-rest/service/repository/process-definitions/iform_86e6e2d57307:1:bd7313ad-f9cc-11e8-ac71-0242ac1e0808",
              "activityId" : null,
              "variables" : [ ],
              "tenantId" : "zuye0hrs",
              "completed" : false,
              "historicTasks" : null,
              "tasks" : null,
              "name" : "张娅宇的JHJC员工调薪审批表",
              "keyFeature" : "[]",
              "startParticipant" : {
                "id" : "989ac042-8376-43a7-affb-0a82ba400a72",
                "code" : "yhtc_zhangyyz@yonyou.com",
                "name" : "张娅宇",
                "org" : null,
                "org_name" : null,
                "pic" : "https://cdn.yonyoucloud.com/pro/yht/102462/2892082/201801/29/151720300824c717784f8d427129fafa3bb299e484.jpg.thumb.jpg",
                "source" : null,
                "type" : "USER",
                "priority" : 50
              },
              "subHistoricProcessInstanceResponses" : null
            },
            "taskComments" : [ {
              "id" : "335fa31d-f9e6-11e8-9f8d-0242ac1e3506",
              "author" : "989ac042-8376-43a7-affb-0a82ba400a72",
              "message" : "前加签",
              "time" : "2018-12-07T14:06:13.000+08:00",
              "taskId" : "27407576-f9e6-11e8-8cbc-0242ac1e1582",
              "taskUrl" : "http://ys.esn.ren/ubpm-web-rest/service/runtime/tasks/27407576-f9e6-11e8-8cbc-0242ac1e1582/comments/335fa31d-f9e6-11e8-9f8d-0242ac1e3506",
              "processInstanceId" : "69339450-f9cd-11e8-9f8d-0242ac1e3506",
              "processInstanceUrl" : "http://ys.esn.ren/ubpm-web-rest/service/history/historic-process-instances/69339450-f9cd-11e8-9f8d-0242ac1e3506/comments/335fa31d-f9e6-11e8-9f8d-0242ac1e3506"
            } ],
            "categoryResponse" : {
              "errcode" : 0,
              "errmsg" : "ok",
              "id" : "3d6943fd-5e26-4779-9c82-dd3ff2fe9924",
              "url" : null,
              "tenantId" : "zuye0hrs",
              "revision" : 1,
              "code" : "3d6943fd-5e26-4779-9c82-dd3ff2fe9924",
              "name" : "12.5上线"
            },
            "operations" : null,
            "warning" : false,
            "outtime" : false,
            "procInsStartTime" : "2018-12-07T11:08:46.000+08:00"
          }, {
            "id" : "f6387613-f9cc-11e8-9f8d-0242ac1e3506",
            "url" : "http://ys.esn.ren/ubpm-web-rest/service/runtime/tasks/f6387613-f9cc-11e8-9f8d-0242ac1e3506",
            "owner" : null,
            "assignee" : "989ac042-8376-43a7-affb-0a82ba400a72",
            "delegationState" : null,
            "name" : "部门负责人",
            "description" : null,
            "createTime" : "2018-12-07T11:05:33.000+08:00",
            "dueDate" : "3017-12-07T11:05:33.000+08:00",
            "priority" : 50,
            "suspended" : false,
            "taskDefinitionKey" : "approveUserTask_wq1fb4f4e",
            "tenantId" : "zuye0hrs",
            "category" : "3d6943fd-5e26-4779-9c82-dd3ff2fe9924",
            "formKey" : null,
            "parentTaskId" : null,
            "parentTaskUrl" : null,
            "executionId" : "f637d9cd-f9cc-11e8-9f8d-0242ac1e3506",
            "executionUrl" : "http://ys.esn.ren/ubpm-web-rest/service/runtime/executions/f637d9cd-f9cc-11e8-9f8d-0242ac1e3506",
            "processInstanceId" : "f630adbc-f9cc-11e8-9f8d-0242ac1e3506",
            "processInstanceUrl" : "http://ys.esn.ren/ubpm-web-rest/service/runtime/process-instances/f630adbc-f9cc-11e8-9f8d-0242ac1e3506",
            "processDefinitionId" : "iform_a12167c00db1:4:6ea82da4-f9cc-11e8-ac71-0242ac1e0808",
            "processDefinitionUrl" : "http://ys.esn.ren/ubpm-web-rest/service/repository/process-definitions/iform_a12167c00db1:4:6ea82da4-f9cc-11e8-ac71-0242ac1e0808",
            "variables" : [ ],
            "processDefinitionName" : "用车申请单",
            "activity" : {
              "id" : "approveUserTask_wq1fb4f4e",
              "name" : "部门负责人",
              "type" : "userTask",
              "properties" : {
                "documentation" : null,
                "type" : "userTask",
                "useCloudsignature" : "true",
                "rejectToEnd" : "true",
                "rejectAble" : "true",
                "copyToAble" : "true",
                "extendAttributes" : "[]",
                "multiInstance" : "parallel",
                "default" : null,
                "canBeRejected" : "true",
                "name" : "部门负责人",
                "canBeJumped" : "false",
                "countersignOnlyLastJump" : "false"
              },
              "participants" : null,
              "extendId" : null
            },
            "assigneeParticipant" : {
              "id" : "989ac042-8376-43a7-affb-0a82ba400a72",
              "code" : "yhtc_zhangyyz@yonyou.com",
              "name" : "张娅宇",
              "org" : null,
              "org_name" : null,
              "pic" : "https://cdn.yonyoucloud.com/pro/yht/102462/2892082/201801/29/151720300824c717784f8d427129fafa3bb299e484.jpg.thumb.jpg",
              "source" : null,
              "type" : "USER",
              "priority" : 50
            },
            "candidateParticipants" : null,
            "processInstance" : {
              "id" : "f630adbc-f9cc-11e8-9f8d-0242ac1e3506",
              "url" : "http://ys.esn.ren/ubpm-web-rest/service/runtime/process-instances/f630adbc-f9cc-11e8-9f8d-0242ac1e3506",
              "businessKey" : "f5b35c42-63b5-423c-b50a-36fb48a34410:c257949d-5fdf-4b85-a9f7-c77e27b7ef0b",
              "suspended" : false,
              "ended" : false,
              "processDefinitionId" : "iform_a12167c00db1:4:6ea82da4-f9cc-11e8-ac71-0242ac1e0808",
              "processDefinitionUrl" : "http://ys.esn.ren/ubpm-web-rest/service/repository/process-definitions/iform_a12167c00db1:4:6ea82da4-f9cc-11e8-ac71-0242ac1e0808",
              "activityId" : null,
              "variables" : [ ],
              "tenantId" : "zuye0hrs",
              "completed" : false,
              "historicTasks" : null,
              "tasks" : null,
              "name" : "张娅宇的用车申请单",
              "keyFeature" : "[]",
              "startParticipant" : {
                "id" : "989ac042-8376-43a7-affb-0a82ba400a72",
                "code" : "yhtc_zhangyyz@yonyou.com",
                "name" : "张娅宇",
                "org" : null,
                "org_name" : null,
                "pic" : "https://cdn.yonyoucloud.com/pro/yht/102462/2892082/201801/29/151720300824c717784f8d427129fafa3bb299e484.jpg.thumb.jpg",
                "source" : null,
                "type" : "USER",
                "priority" : 50
              },
              "subHistoricProcessInstanceResponses" : null
            },
            "taskComments" : [ ],
            "categoryResponse" : {
              "errcode" : 0,
              "errmsg" : "ok",
              "id" : "3d6943fd-5e26-4779-9c82-dd3ff2fe9924",
              "url" : null,
              "tenantId" : "zuye0hrs",
              "revision" : 1,
              "code" : "3d6943fd-5e26-4779-9c82-dd3ff2fe9924",
              "name" : "12.5上线"
            },
            "operations" : null,
            "warning" : false,
            "outtime" : false,
            "procInsStartTime" : "2018-12-07T11:05:33.000+08:00"
          }, {
            "id" : "79a06716-f9cc-11e8-9f8d-0242ac1e3506",
            "url" : "http://ys.esn.ren/ubpm-web-rest/service/runtime/tasks/79a06716-f9cc-11e8-9f8d-0242ac1e3506",
            "owner" : null,
            "assignee" : "989ac042-8376-43a7-affb-0a82ba400a72",
            "delegationState" : null,
            "name" : "部门负责人",
            "description" : null,
            "createTime" : "2018-12-07T11:02:04.000+08:00",
            "dueDate" : "3017-12-07T11:02:04.000+08:00",
            "priority" : 50,
            "suspended" : false,
            "taskDefinitionKey" : "approveUserTask_wq1fb4f4e",
            "tenantId" : "zuye0hrs",
            "category" : "3d6943fd-5e26-4779-9c82-dd3ff2fe9924",
            "formKey" : null,
            "parentTaskId" : null,
            "parentTaskUrl" : null,
            "executionId" : "799ff1e0-f9cc-11e8-9f8d-0242ac1e3506",
            "executionUrl" : "http://ys.esn.ren/ubpm-web-rest/service/runtime/executions/799ff1e0-f9cc-11e8-9f8d-0242ac1e3506",
            "processInstanceId" : "79998a1f-f9cc-11e8-9f8d-0242ac1e3506",
            "processInstanceUrl" : "http://ys.esn.ren/ubpm-web-rest/service/runtime/process-instances/79998a1f-f9cc-11e8-9f8d-0242ac1e3506",
            "processDefinitionId" : "iform_a12167c00db1:4:6ea82da4-f9cc-11e8-ac71-0242ac1e0808",
            "processDefinitionUrl" : "http://ys.esn.ren/ubpm-web-rest/service/repository/process-definitions/iform_a12167c00db1:4:6ea82da4-f9cc-11e8-ac71-0242ac1e0808",
            "variables" : [ ],
            "processDefinitionName" : "用车申请单",
            "activity" : {
              "id" : "approveUserTask_wq1fb4f4e",
              "name" : "部门负责人",
              "type" : "userTask",
              "properties" : {
                "documentation" : null,
                "type" : "userTask",
                "useCloudsignature" : "true",
                "rejectToEnd" : "true",
                "rejectAble" : "true",
                "copyToAble" : "true",
                "extendAttributes" : "[]",
                "multiInstance" : "parallel",
                "default" : null,
                "canBeRejected" : "true",
                "name" : "部门负责人",
                "canBeJumped" : "false",
                "countersignOnlyLastJump" : "false"
              },
              "participants" : null,
              "extendId" : null
            },
            "assigneeParticipant" : {
              "id" : "989ac042-8376-43a7-affb-0a82ba400a72",
              "code" : "yhtc_zhangyyz@yonyou.com",
              "name" : "张娅宇",
              "org" : null,
              "org_name" : null,
              "pic" : "https://cdn.yonyoucloud.com/pro/yht/102462/2892082/201801/29/151720300824c717784f8d427129fafa3bb299e484.jpg.thumb.jpg",
              "source" : null,
              "type" : "USER",
              "priority" : 50
            },
            "candidateParticipants" : null,
            "processInstance" : {
              "id" : "79998a1f-f9cc-11e8-9f8d-0242ac1e3506",
              "url" : "http://ys.esn.ren/ubpm-web-rest/service/runtime/process-instances/79998a1f-f9cc-11e8-9f8d-0242ac1e3506",
              "businessKey" : "f23390a5-4099-460d-9dbf-efeb9da6c906:c257949d-5fdf-4b85-a9f7-c77e27b7ef0b",
              "suspended" : false,
              "ended" : false,
              "processDefinitionId" : "iform_a12167c00db1:4:6ea82da4-f9cc-11e8-ac71-0242ac1e0808",
              "processDefinitionUrl" : "http://ys.esn.ren/ubpm-web-rest/service/repository/process-definitions/iform_a12167c00db1:4:6ea82da4-f9cc-11e8-ac71-0242ac1e0808",
              "activityId" : null,
              "variables" : [ ],
              "tenantId" : "zuye0hrs",
              "completed" : false,
              "historicTasks" : null,
              "tasks" : null,
              "name" : "张娅宇的用车申请单",
              "keyFeature" : "[]",
              "startParticipant" : {
                "id" : "989ac042-8376-43a7-affb-0a82ba400a72",
                "code" : "yhtc_zhangyyz@yonyou.com",
                "name" : "张娅宇",
                "org" : null,
                "org_name" : null,
                "pic" : "https://cdn.yonyoucloud.com/pro/yht/102462/2892082/201801/29/151720300824c717784f8d427129fafa3bb299e484.jpg.thumb.jpg",
                "source" : null,
                "type" : "USER",
                "priority" : 50
              },
              "subHistoricProcessInstanceResponses" : null
            },
            "taskComments" : [ ],
            "categoryResponse" : {
              "errcode" : 0,
              "errmsg" : "ok",
              "id" : "3d6943fd-5e26-4779-9c82-dd3ff2fe9924",
              "url" : null,
              "tenantId" : "zuye0hrs",
              "revision" : 1,
              "code" : "3d6943fd-5e26-4779-9c82-dd3ff2fe9924",
              "name" : "12.5上线"
            },
            "operations" : null,
            "warning" : false,
            "outtime" : false,
            "procInsStartTime" : "2018-12-07T11:02:04.000+08:00"
          }, {
            "id" : "13a84710-f9cc-11e8-9f8d-0242ac1e3506",
            "url" : "http://ys.esn.ren/ubpm-web-rest/service/runtime/tasks/13a84710-f9cc-11e8-9f8d-0242ac1e3506",
            "owner" : null,
            "assignee" : "989ac042-8376-43a7-affb-0a82ba400a72",
            "delegationState" : null,
            "name" : "部门负责人",
            "description" : null,
            "createTime" : "2018-12-07T10:59:13.000+08:00",
            "dueDate" : "3017-12-07T10:59:13.000+08:00",
            "priority" : 50,
            "suspended" : false,
            "taskDefinitionKey" : "approveUserTask_wq1fb4f4e",
            "tenantId" : "zuye0hrs",
            "category" : "3d6943fd-5e26-4779-9c82-dd3ff2fe9924",
            "formKey" : null,
            "parentTaskId" : null,
            "parentTaskUrl" : null,
            "executionId" : "13a7d1db-f9cc-11e8-9f8d-0242ac1e3506",
            "executionUrl" : "http://ys.esn.ren/ubpm-web-rest/service/runtime/executions/13a7d1db-f9cc-11e8-9f8d-0242ac1e3506",
            "processInstanceId" : "13a1de4a-f9cc-11e8-9f8d-0242ac1e3506",
            "processInstanceUrl" : "http://ys.esn.ren/ubpm-web-rest/service/runtime/process-instances/13a1de4a-f9cc-11e8-9f8d-0242ac1e3506",
            "processDefinitionId" : "iform_a12167c00db1:3:f6f46899-f9cb-11e8-9480-0242ac1e3507",
            "processDefinitionUrl" : "http://ys.esn.ren/ubpm-web-rest/service/repository/process-definitions/iform_a12167c00db1:3:f6f46899-f9cb-11e8-9480-0242ac1e3507",
            "variables" : [ ],
            "processDefinitionName" : "用车申请单",
            "activity" : {
              "id" : "approveUserTask_wq1fb4f4e",
              "name" : "部门负责人",
              "type" : "userTask",
              "properties" : {
                "documentation" : null,
                "type" : "userTask",
                "useCloudsignature" : "true",
                "rejectToEnd" : "true",
                "rejectAble" : "true",
                "copyToAble" : "true",
                "extendAttributes" : "[]",
                "multiInstance" : "parallel",
                "default" : null,
                "canBeRejected" : "true",
                "name" : "部门负责人",
                "canBeJumped" : "false",
                "countersignOnlyLastJump" : "false"
              },
              "participants" : null,
              "extendId" : null
            },
            "assigneeParticipant" : {
              "id" : "989ac042-8376-43a7-affb-0a82ba400a72",
              "code" : "yhtc_zhangyyz@yonyou.com",
              "name" : "张娅宇",
              "org" : null,
              "org_name" : null,
              "pic" : "https://cdn.yonyoucloud.com/pro/yht/102462/2892082/201801/29/151720300824c717784f8d427129fafa3bb299e484.jpg.thumb.jpg",
              "source" : null,
              "type" : "USER",
              "priority" : 50
            },
            "candidateParticipants" : null,
            "processInstance" : {
              "id" : "13a1de4a-f9cc-11e8-9f8d-0242ac1e3506",
              "url" : "http://ys.esn.ren/ubpm-web-rest/service/runtime/process-instances/13a1de4a-f9cc-11e8-9f8d-0242ac1e3506",
              "businessKey" : "6ed92c26-f3e6-4ec9-8d2d-30f26c6ace1f:c257949d-5fdf-4b85-a9f7-c77e27b7ef0b",
              "suspended" : false,
              "ended" : false,
              "processDefinitionId" : "iform_a12167c00db1:3:f6f46899-f9cb-11e8-9480-0242ac1e3507",
              "processDefinitionUrl" : "http://ys.esn.ren/ubpm-web-rest/service/repository/process-definitions/iform_a12167c00db1:3:f6f46899-f9cb-11e8-9480-0242ac1e3507",
              "activityId" : null,
              "variables" : [ ],
              "tenantId" : "zuye0hrs",
              "completed" : false,
              "historicTasks" : null,
              "tasks" : null,
              "name" : "张娅宇的用车申请单",
              "keyFeature" : "[]",
              "startParticipant" : {
                "id" : "989ac042-8376-43a7-affb-0a82ba400a72",
                "code" : "yhtc_zhangyyz@yonyou.com",
                "name" : "张娅宇",
                "org" : null,
                "org_name" : null,
                "pic" : "https://cdn.yonyoucloud.com/pro/yht/102462/2892082/201801/29/151720300824c717784f8d427129fafa3bb299e484.jpg.thumb.jpg",
                "source" : null,
                "type" : "USER",
                "priority" : 50
              },
              "subHistoricProcessInstanceResponses" : null
            },
            "taskComments" : [ ],
            "categoryResponse" : {
              "errcode" : 0,
              "errmsg" : "ok",
              "id" : "3d6943fd-5e26-4779-9c82-dd3ff2fe9924",
              "url" : null,
              "tenantId" : "zuye0hrs",
              "revision" : 1,
              "code" : "3d6943fd-5e26-4779-9c82-dd3ff2fe9924",
              "name" : "12.5上线"
            },
            "operations" : null,
            "warning" : false,
            "outtime" : false,
            "procInsStartTime" : "2018-12-07T10:59:13.000+08:00"
          }, {
            "id" : "0096d6f8-f9cc-11e8-9f8d-0242ac1e3506",
            "url" : "http://ys.esn.ren/ubpm-web-rest/service/runtime/tasks/0096d6f8-f9cc-11e8-9f8d-0242ac1e3506",
            "owner" : null,
            "assignee" : "989ac042-8376-43a7-affb-0a82ba400a72",
            "delegationState" : null,
            "name" : "部门负责人",
            "description" : null,
            "createTime" : "2018-12-07T10:58:41.000+08:00",
            "dueDate" : "3017-12-07T10:58:41.000+08:00",
            "priority" : 50,
            "suspended" : false,
            "taskDefinitionKey" : "approveUserTask_wq1fb4f4e",
            "tenantId" : "zuye0hrs",
            "category" : "3d6943fd-5e26-4779-9c82-dd3ff2fe9924",
            "formKey" : null,
            "parentTaskId" : null,
            "parentTaskUrl" : null,
            "executionId" : "009688d3-f9cc-11e8-9f8d-0242ac1e3506",
            "executionUrl" : "http://ys.esn.ren/ubpm-web-rest/service/runtime/executions/009688d3-f9cc-11e8-9f8d-0242ac1e3506",
            "processInstanceId" : "008dfd32-f9cc-11e8-9f8d-0242ac1e3506",
            "processInstanceUrl" : "http://ys.esn.ren/ubpm-web-rest/service/runtime/process-instances/008dfd32-f9cc-11e8-9f8d-0242ac1e3506",
            "processDefinitionId" : "iform_a12167c00db1:3:f6f46899-f9cb-11e8-9480-0242ac1e3507",
            "processDefinitionUrl" : "http://ys.esn.ren/ubpm-web-rest/service/repository/process-definitions/iform_a12167c00db1:3:f6f46899-f9cb-11e8-9480-0242ac1e3507",
            "variables" : [ ],
            "processDefinitionName" : "用车申请单",
            "activity" : {
              "id" : "approveUserTask_wq1fb4f4e",
              "name" : "部门负责人",
              "type" : "userTask",
              "properties" : {
                "documentation" : null,
                "type" : "userTask",
                "useCloudsignature" : "true",
                "rejectToEnd" : "true",
                "rejectAble" : "true",
                "copyToAble" : "true",
                "extendAttributes" : "[]",
                "multiInstance" : "parallel",
                "default" : null,
                "canBeRejected" : "true",
                "name" : "部门负责人",
                "canBeJumped" : "false",
                "countersignOnlyLastJump" : "false"
              },
              "participants" : null,
              "extendId" : null
            },
            "assigneeParticipant" : {
              "id" : "989ac042-8376-43a7-affb-0a82ba400a72",
              "code" : "yhtc_zhangyyz@yonyou.com",
              "name" : "张娅宇",
              "org" : null,
              "org_name" : null,
              "pic" : "https://cdn.yonyoucloud.com/pro/yht/102462/2892082/201801/29/151720300824c717784f8d427129fafa3bb299e484.jpg.thumb.jpg",
              "source" : null,
              "type" : "USER",
              "priority" : 50
            },
            "candidateParticipants" : null,
            "processInstance" : {
              "id" : "008dfd32-f9cc-11e8-9f8d-0242ac1e3506",
              "url" : "http://ys.esn.ren/ubpm-web-rest/service/runtime/process-instances/008dfd32-f9cc-11e8-9f8d-0242ac1e3506",
              "businessKey" : "4efac9f0-143b-4a25-b81c-1a41e988f7b2:c257949d-5fdf-4b85-a9f7-c77e27b7ef0b",
              "suspended" : false,
              "ended" : false,
              "processDefinitionId" : "iform_a12167c00db1:3:f6f46899-f9cb-11e8-9480-0242ac1e3507",
              "processDefinitionUrl" : "http://ys.esn.ren/ubpm-web-rest/service/repository/process-definitions/iform_a12167c00db1:3:f6f46899-f9cb-11e8-9480-0242ac1e3507",
              "activityId" : null,
              "variables" : [ ],
              "tenantId" : "zuye0hrs",
              "completed" : false,
              "historicTasks" : null,
              "tasks" : null,
              "name" : "张娅宇的用车申请单",
              "keyFeature" : "[]",
              "startParticipant" : {
                "id" : "989ac042-8376-43a7-affb-0a82ba400a72",
                "code" : "yhtc_zhangyyz@yonyou.com",
                "name" : "张娅宇",
                "org" : null,
                "org_name" : null,
                "pic" : "https://cdn.yonyoucloud.com/pro/yht/102462/2892082/201801/29/151720300824c717784f8d427129fafa3bb299e484.jpg.thumb.jpg",
                "source" : null,
                "type" : "USER",
                "priority" : 50
              },
              "subHistoricProcessInstanceResponses" : null
            },
            "taskComments" : [ ],
            "categoryResponse" : {
              "errcode" : 0,
              "errmsg" : "ok",
              "id" : "3d6943fd-5e26-4779-9c82-dd3ff2fe9924",
              "url" : null,
              "tenantId" : "zuye0hrs",
              "revision" : 1,
              "code" : "3d6943fd-5e26-4779-9c82-dd3ff2fe9924",
              "name" : "12.5上线"
            },
            "operations" : null,
            "warning" : false,
            "outtime" : false,
            "procInsStartTime" : "2018-12-07T10:58:41.000+08:00"
          }, {
            "id" : "35024435-f9c3-11e8-8b2c-0242ac1e0e06",
            "url" : "http://ys.esn.ren/ubpm-web-rest/service/runtime/tasks/35024435-f9c3-11e8-8b2c-0242ac1e0e06",
            "owner" : null,
            "assignee" : "989ac042-8376-43a7-affb-0a82ba400a72",
            "delegationState" : null,
            "name" : "2222",
            "description" : null,
            "createTime" : "2018-12-07T09:55:44.000+08:00",
            "dueDate" : "3017-12-07T09:55:44.000+08:00",
            "priority" : 50,
            "suspended" : false,
            "taskDefinitionKey" : "approveUserTask_3568c0ac28cc4e879af7fe81f6a4e056",
            "tenantId" : "zuye0hrs",
            "category" : "defaultCategory",
            "formKey" : null,
            "parentTaskId" : null,
            "parentTaskUrl" : null,
            "executionId" : "3501f612-f9c3-11e8-8b2c-0242ac1e0e06",
            "executionUrl" : "http://ys.esn.ren/ubpm-web-rest/service/runtime/executions/3501f612-f9c3-11e8-8b2c-0242ac1e0e06",
            "processInstanceId" : "34f91c63-f9c3-11e8-8b2c-0242ac1e0e06",
            "processInstanceUrl" : "http://ys.esn.ren/ubpm-web-rest/service/runtime/process-instances/34f91c63-f9c3-11e8-8b2c-0242ac1e0e06",
            "processDefinitionId" : "iform_02e6d6e7d1:1:0ceae681-f9c3-11e8-ac71-0242ac1e0808",
            "processDefinitionUrl" : "http://ys.esn.ren/ubpm-web-rest/service/repository/process-definitions/iform_02e6d6e7d1:1:0ceae681-f9c3-11e8-ac71-0242ac1e0808",
            "variables" : [ ],
            "processDefinitionName" : "审批申请单",
            "activity" : {
              "id" : "approveUserTask_3568c0ac28cc4e879af7fe81f6a4e056",
              "name" : "2222",
              "type" : "userTask",
              "properties" : {
                "documentation" : null,
                "type" : "userTask",
                "useCloudsignature" : "true",
                "rejectToEnd" : "true",
                "rejectAble" : "true",
                "copyToAble" : "true",
                "extendAttributes" : "[]",
                "multiInstance" : "parallel",
                "default" : null,
                "canBeRejected" : "true",
                "name" : "2222",
                "canBeJumped" : "false",
                "countersignOnlyLastJump" : "false"
              },
              "participants" : null,
              "extendId" : null
            },
            "assigneeParticipant" : {
              "id" : "989ac042-8376-43a7-affb-0a82ba400a72",
              "code" : "yhtc_zhangyyz@yonyou.com",
              "name" : "张娅宇",
              "org" : null,
              "org_name" : null,
              "pic" : "https://cdn.yonyoucloud.com/pro/yht/102462/2892082/201801/29/151720300824c717784f8d427129fafa3bb299e484.jpg.thumb.jpg",
              "source" : null,
              "type" : "USER",
              "priority" : 50
            },
            "candidateParticipants" : null,
            "processInstance" : {
              "id" : "34f91c63-f9c3-11e8-8b2c-0242ac1e0e06",
              "url" : "http://ys.esn.ren/ubpm-web-rest/service/runtime/process-instances/34f91c63-f9c3-11e8-8b2c-0242ac1e0e06",
              "businessKey" : "3f5f39b976dd404c971ff308d322530a:88e8004d-249b-4359-8655-72f5631334bb",
              "suspended" : false,
              "ended" : false,
              "processDefinitionId" : "iform_02e6d6e7d1:1:0ceae681-f9c3-11e8-ac71-0242ac1e0808",
              "processDefinitionUrl" : "http://ys.esn.ren/ubpm-web-rest/service/repository/process-definitions/iform_02e6d6e7d1:1:0ceae681-f9c3-11e8-ac71-0242ac1e0808",
              "activityId" : null,
              "variables" : [ ],
              "tenantId" : "zuye0hrs",
              "completed" : false,
              "historicTasks" : null,
              "tasks" : null,
              "name" : "张娅宇的审批申请单",
              "keyFeature" : "[]",
              "startParticipant" : {
                "id" : "989ac042-8376-43a7-affb-0a82ba400a72",
                "code" : "yhtc_zhangyyz@yonyou.com",
                "name" : "张娅宇",
                "org" : null,
                "org_name" : null,
                "pic" : "https://cdn.yonyoucloud.com/pro/yht/102462/2892082/201801/29/151720300824c717784f8d427129fafa3bb299e484.jpg.thumb.jpg",
                "source" : null,
                "type" : "USER",
                "priority" : 50
              },
              "subHistoricProcessInstanceResponses" : null
            },
            "taskComments" : [ ],
            "categoryResponse" : null,
            "operations" : null,
            "warning" : false,
            "outtime" : false,
            "procInsStartTime" : "2018-12-07T09:55:44.000+08:00"
          } ]
        _this.bindData(data, true);
        this.loadData({
            success: function (data, isFirstLoad) {
                _this.rowMarkSeed = 0;
                _this.empty();
                _this.bindData(data, true);
                if ((!data || data.length == 0)) {
                    _this.showNodata(true);
                }
            },
            isAutoLoad: false,
            isFirstLoad: true
        });
    };


    Component.prototype._loadNextPageData = function (isReload) {
        var _this = this;
        if (!this.pageNumKey) {
            this.pageNumKey = this.ajaxConfig.pageNumKey;
            if (!this.pageNumKey) {
                console.error("listview 配置没有设置页码字段属性pageNumKey");
            }
        }
        var pageNo = this.ajaxConfig.data[this.pageNumKey];

        if ((!pageNo || isNaN(pageNo)) && pageNo !== 0) {
            var firstPageIndex = (this.ajaxConfig.firstPageIndex || this.ajaxConfig.firstPageIndex === 0) ? this.ajaxConfig.firstPageIndex : 1;
            pageNo = firstPageIndex;
        } else {
            if (isReload === true) {
            } else {
                pageNo = parseInt(pageNo) + 1;
            }
        }
        this.ajaxConfig.data[this.pageNumKey] = pageNo;
        this.loadData({
            success: function (data) {
                _this.bindData(data);


            },
            isAutoLoad: false,
            isFirstLoad: false
        });
    }
    Component.prototype.loadNextPageData = function () {
        this._loadNextPageData(false);
    }
    Component.prototype.reload = function () {
        this._loadNextPageData(true);
        this.parent.setCanLoadMore({isReload: true});
    };

    Component.prototype.showNodata = function (showOrHide) {
        if (this.noDataDom) {
            if (showOrHide) {

                this.noDataDom.$el.removeClass("displaynone");
            } else {
                this.noDataDom.$el.addClass("displaynone");
            }
        }
    };

    Component.prototype.loadData = function (para) {
        var _this = this;
        var isFirstLoad = para.isFirstLoad;

        if (this.pluginBeforeLoadDataMethod) {
            this.pluginBeforeLoadDataMethod.call(this.pageview.plugin, this, {
                ajaxConfig: this.ajaxConfig,
                isAutoLoad: para.isAutoLoad
            });
        }

        if (this.config.isStatic) {
            var data = [];
            if (_this.pluginParseDataMethod) {
                data = _this.pluginParseDataMethod.call(_this.pageview.plugin, _this, {
                    params: this.ajaxConfig,
                    data: data,
                    cancel: false
                });

                if (data === undefined) {
                    console.error("程序错误：" + _this.config.comKey + "_parsedata 方法没有返回值或者返回值错误");
                }

                if (data === false) {
                    _this.setError(para);
                    return;
                }
            }

            // if((!data||data.length==0)&&isFirstLoad){
            //   this.showNodata(true);
            // }else{
            //   this.showNodata(false);
            // }
            para.success(data);
            return;
        }

        this.beforeAjaxConfig = utils.copy(this.ajaxConfig);
        var params = this.ajaxConfig.data || {};
        utils.ajax({
            type: this.ajaxConfig.type || 'get',
            url: this.ajaxConfig.url,
            pageviewInstance: this.config.$$pageview,
            timeout: this.ajaxConfig.timeout || 7000,
            data: params,
            success: function (data) {
                _this.showNodata(false);

                if (_this.pluginParseDataMethod) {
                    data = _this.pluginParseDataMethod.call(_this.pageview.plugin, _this, {
                        params: params,
                        data: data,
                        isFirstLoad: isFirstLoad
                    });

                    if (data === undefined) {
                        console.error("程序错误：" + _this.config.comKey + "_parsedata 方法没有返回值或者返回值错误");
                    }

                    if (data === false) {
                        _this.setError(para);
                        return;
                    }
                }
                if (!(data instanceof Array)) {
                    console.error(_this.config.comKey + "返回的数据不是数组类型,或者在" + _this.config.comKey + "_parsedata方法中进行预处理 ");
                }


                para.success(data, isFirstLoad);
                _this.pluginAfterLoadDataMethod && _this.pluginAfterLoadDataMethod.call(_this.pageview.plugin, _this, {
                    isSuccess: true,
                    params: params,
                    data: data,
                    isFirstLoad: para.isFirstLoad
                });


            },
            error: function (err) {
                if (_this.DemoMethod) {
                    var demodata = _this.DemoMethod.call(_this.pageview.plugin, _this, {
                        params: params,
                        isFirstLoad: para.isFirstLoad
                    });
                    if (demodata === null) {
                        _this.setError(para);
                        if (para.error) {
                            para.error(err);
                        }
                    } else {
                        para.success(demodata, isFirstLoad);
                    }
                } else {
                    _this.setError(para);
                    if (para.error) {
                        para.error(err);
                    }
                }

            }
        })
    }

    Component.prototype.setError = function (para) {
        var _this = this;
        window.setTimeout(function () {
            if (para.isFirstLoad) {
                _this.parent.setLoadFirstError && _this.parent.setLoadFirstError();
            } else {
                _this.parent.setLoadMoreErrorState && _this.parent.setLoadMoreErrorState();
            }
            _this.ajaxConfig = _this.beforeAjaxConfig;
            _this.pluginAfterLoadDataMethod && _this.pluginAfterLoadDataMethod.call(_this.pageview.plugin, _this, {isSuccess: false});
        }, 100)
    }

    Component.prototype.createFragmentByDataSource = function (datasource) {
        var fragment = document.createDocumentFragment();
        for (var i = 0, j = datasource.length; i < j; i++) {
            if(datasource[i].hasOwnProperty("historicProcessInstanceResponse")){
                if(datasource[i].historicProcessInstanceResponse){
                    var row1 = this.createRow(datasource[i]);
                    this.rows.push(row1);
                    fragment.appendChild(row1.$el[0]);
                }
            }else{
                var row = this.createRow(datasource[i]);
                this.rows.push(row);
                fragment.appendChild(row.$el[0]);
            }
        }
        return fragment;
    }


    Component.prototype.bindData = function (datasource, isFirstLoad) {
        var _this = this;

        if (this.isGroupList) {
            this.bindGroupListData(datasource, isFirstLoad);
            return;
        }
// console.log(datasource)
        var rows = this.createFragmentByDataSource(datasource);
        window.setTimeout(function () {
            _this.$el[0].appendChild(rows);
            _this.setLoadStateWhenBindDone(datasource, isFirstLoad);
        }, 16);
    };
    Component.prototype.setLoadStateWhenBindDone = function (datasource, isFirstLoad) {
        var _this = this;
        if (this.parentAnimate !== false) {
            if (datasource.length < _this.ajaxConfig.pageSize) {
                _this.parent.setHasLoadDone && _this.parent.setHasLoadDone();
            } else {
                _this.parent.setCanLoadMore && _this.parent.setCanLoadMore();
            }
        }


        if (isFirstLoad) {
            _this.parent.resetPullLoadState && _this.parent.resetPullLoadState();
            if (!datasource || datasource.length === 0) {
                _this.parent.setInitLoadMessage && _this.parent.setInitLoadMessage();
            }
        }
        if (_this.getRowCount() === 0) {
            _this.showNodata(true);
            _this.parent.hideLoadMore && _this.parent.hideLoadMore();
        }


    },

        Component.prototype.groupBy = function (groupKey) {
            this.empty();
            var _this = this;
            if (groupKey) {
                this.groupKey = groupKey;
                this.isGroupList = true;
                this.groups = {};
            } else {
                this.isGroupList = false;
                this.groupKey = null;
                this.groups = {};
            }
            if (_this.parent && _this.parent.setCanLoadMore) {
                _this.parent.setPullLoadingState();
            }
            _this.loadFirstPageData();
        };
    Component.prototype.bindGroupListData = function (datasource, isFirstLoad) {
        //this.groupKey
        var _this = this;
        //this.groups
        var rowFragmentDict = {};
        var newGroups = {};
        for (var i = 0, j = datasource.length; i < j; i++) {
            var rowdata = datasource[i];
            var groupValue = rowdata[this.groupKey];
            if (!groupValue) {
                rowdata[this.groupKey] = this.config.otherGroupName || "其他";
                groupValue = this.config.otherGroupName || "其他";
            }
            if (!rowFragmentDict[groupValue]) {
                rowFragmentDict[groupValue] = document.createDocumentFragment();
            }

            if (!this.groups[groupValue]) {
                this.groups[groupValue] = new ListGroup({
                    type: "listgroup",
                    rootConfig: this.config,
                    style: this.config.groupStyle,
                    $$pageview: this.pageview,
                    groupValue: groupValue,
                    groupHeaderData: rowdata,
                    $$parent: this,
                });
                newGroups[groupValue] = this.groups[groupValue];
            }

            var listRow = this.createGroupListRow(rowdata, this.groups[groupValue]);
            rowFragmentDict[groupValue].appendChild(listRow.$el[0]);
            this.groups[groupValue].rows.push(listRow);
        }


        window.setTimeout(function () {
            for (var groupValue in rowFragmentDict) {
                _this.groups[groupValue].append(rowFragmentDict[groupValue]);
                if (newGroups[groupValue]) {
                    _this.$el.append(newGroups[groupValue].$el);
                }
            }
            _this.setLoadStateWhenBindDone(datasource, isFirstLoad);
        }, 16);

    };

    Component.prototype.createGroupListRow = function (rowdata, listgroup) {
        var row_instance = new ListRow({
            type: "listrow",
            listview: this,
            root: this.config.root,
            style: this.config.rowStyle,
            $$pageview: this.pageview,
            $$datasource: rowdata,
            $$parent: listgroup,
            itemClassName: this.config.itemClassName
        });
        return row_instance;
    };

    Component.prototype.setAjaxConfigParams = function (obj) {
        if (!this.ajaxConfig) {

            console.error("ListView未配置ajaxConfig属性");
        }
        this.ajaxConfig.data = this.ajaxConfig.data || {};
        for (var key in obj) {
            this.ajaxConfig.data[key] = obj[key];
        }
    };

    Component.prototype.initAjaxConfig = function (ajaxConfig) {
        if (this.config.isStatic) {
            this.ajaxConfig = {};
            return;
        }
        if (!ajaxConfig) {
            console.error("ListView未配置ajaxConfig属性");
        }
        if (!ajaxConfig.pageSize) {
            console.warn("ajaxConfig配置需要指定pageSize属性");
        }
        if (isNaN(ajaxConfig.pageSize)) {
            console.warn("ajaxConfig配置需要指定pageSize属性为number类型");
        }
        ajaxConfig.pageSize = parseInt(ajaxConfig.pageSize);
    }

    Component.prototype.createRow = function (rowdata) {
        var row_instance = new ListRow({
            type: "listrow",
            listview: this,
            root: this.config.root,
            style: this.config.rowStyle,
            $$pageview: this.pageview,
            $$datasource: rowdata,
            $$parent: this,
            itemClassName: this.config.itemClassName
        });
        return row_instance;
    }

    Component.prototype.insertGroup = function (rowdata, index) {
        if (!this.isGroupList) {
            return this;
        }
        var groupValue = rowdata[this.groupKey];
        var group = this.groups[groupValue];
        if (group) {
            return this;
        }
        group = new ListGroup({
            type: "listgroup",
            rootConfig: this.config,
            style: this.config.groupStyle,
            $$pageview: this.pageview,
            groupValue: groupValue,
            groupHeaderData: rowdata,
            $$parent: this,
        });
        this.groups[groupValue] = group;
        var nextgroup = this.getGroupByIndex(index);
        if (nextgroup) {
            group.$el.insertBefore(nextgroup.$el);
        } else {
            this.$el.append(group.$el);
        }
        return this;
    }

    Component.prototype.getGroupByIndex = function (index) {
        var groupDoms = this.$el.children();
        var groupDom = groupDoms[index];
        var group;
        if (groupDom) {
            var groupValue = groupDom.getAttribute("data-gval");
            group = this.groups[groupValue];
        }
        return group;
    };

    Component.prototype.insertRow = function (rowData, index) {
        if (this.isGroupList) {
            var groupValue = rowData[this.groupKey];
            var group = this.groups[groupValue];
            if (group) {
                var row = this.createGroupListRow(rowData, group);
                this.showNodata(false);
                return group.insertRow(row, index);
            } else {
                this.insertGroup(rowData, 0);
                this.insertRow(rowData, index)
                return;
            }
            return;
        }
        var row = this.rows[index];
        var newRow = this.createRow(rowData);
        this.showNodata(false);
        if (index !== undefined && index != null && index >= 0 && index < this.rows.length) {
            this.rows.splice(index, 0, newRow);
        } else {
            this.rows.push(newRow);
        }
        if (row) {
            newRow.$el.insertBefore(row.$el);
        } else {
            this.$el.append(newRow.$el);
        }
    };
    Component.prototype.deleteRowByPrimaryKey = function (key) {

    }

    return Component;
});
