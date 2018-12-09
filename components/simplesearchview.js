/**
 */
define(["utils", "base"], function (utils, baseClass) {
    var Component = function (config) {
        var _this = this;


        Component.baseConstructor.call(this, config);
        var className = "displayflex yy-seachview yy-fd-column";
        this.$el.addClass(className);

        this.cancelBtnWidth = utils.getRealWidth(60);
        this.inputWidth = utils.getRealWidth(355);
        var inputMarginLeft = utils.getRealWidth(10);
        var inputHeight = utils.getRealHeight(30);
        var offset = utils.getRealHeight(10);
        var inputPaddingLeft = utils.getRealWidth(30);
        this.inputFocusWidth = this.inputWidth - this.cancelBtnWidth + offset;

        this.searchBarClassName = "yy-sv-bar yy-fd-row displayflex yy-ai-center";
        this.searchBar = $("<div class='" + this.searchBarClassName + " yy-sv-defalut'></div>");
        if (this.config.searchBarStyle) {
            if (!this.config.searchBarStyle["paddingLeft"]) {
                this.config.searchBarStyle["paddingLeft"] = utils.getRealWidth(10);
            }
            if (!this.config.searchBarStyle["paddingRight"]) {
                this.config.searchBarStyle["paddingRight"] = utils.getRealWidth(10);
            }
            utils.css(this.searchBar, this.config.searchBarStyle);
        }

        this.form = $("<form class='yy-sv-form' style='margin-left:" + inputMarginLeft + "px;height:" + inputHeight + "px;width:" + this.inputWidth + "px'></form>");
        this.formdiv = $("<div class='yy-sv-input-div' style=''></div>");
        this.clearBtn = $("<div class='yy-sv-clear yy-icommon displaynone' style='height:" + inputHeight + "px;width:" + inputHeight + "px'></div>");
        var placeholder = this.config.placeholder || utils.getLanguageText('search');
        this.input = $("<input style='text-align:center;font-size:" + utils.fontSize(14) + "px;padding-left:" + inputPaddingLeft + "px' placeholder='" + placeholder + "' type='search'/>");

        this.input.bind("focus", function () {
            _this._focus();
        });

        this.input.bind("input", function () {
            _this.inputChange();
        });


        this.clearBtn.bind("click", function () {
            _this.input.val("");
            _this.input.focus();
            // _this.formdiv.removeClass("yy-input-index-state");
            if (changeMethod) {
                changeMethod.call(_this.pageview.plugin, _this, {value: _this.input.val()});
            }
        });

        this.formdiv.append(this.clearBtn).append(this.input);
        this.form.append(this.formdiv);


        this.form.bind("submit", function (e) {
            e.preventDefault();
            return false;
        });

        var cancelTitle=this.config.cancel||utils.getLanguageText('cancel');
        var cancelBtn = $("<div style='width:" + this.cancelBtnWidth + "px;height:" + inputHeight + "px;font-size:" + utils.fontSize(16) + "px' class='yy-sv-cancel displayflex yy-jc-center yy-ai-center'>"+cancelTitle+"</div>");

        if (this.config.cancelBtnStyle) {
            utils.css(cancelBtn, this.config.cancelBtnStyle);
        }

        var cancelMethodName = this.config.comKey + "_cancel";
        var cancelMethod = this.pageview.plugin[cancelMethodName];
        cancelBtn.bind("click", function () {
            _this._cancelSearch();
            if(_this.pageview.pageManager.fromPage==='index'||_this.pageview.pageManager.fromPage==='moreTemplate'){
                _this.$el.addClass("yy-sv-input-hide");
            }
            if (cancelMethod) {
                cancelMethod.call(_this.pageview.plugin, _this, {value: _this.input.val()});
            }
        });

        var changeMethodName = this.config.comKey + "_search";
        var changeMethod = this.pageview.plugin[changeMethodName];
        this.input.bind("keydown", function (e) {
            if (e.keyCode === 13) {
                // _this._cancelSearch();
                _this.input.blur();
                if (changeMethod) {
                    changeMethod.call(_this.pageview.plugin, _this, {value: _this.input.val()});
                }
            }
        });

        this.searchBar.append(this.form).append(cancelBtn);
        this.$el.append(this.searchBar);
    };

    utils.extends(Component, baseClass);
    Component.prototype.inputChange = function (noTimeout) {
        var _this = this;
        var val = this.input.val();
        if (val == "") {
            this.clearBtn.addClass("displaynone");
            this.formdiv.removeClass("yy-input-index-state");
        } else {
            this.formdiv.addClass("yy-input-index-state");
            this.clearBtn.removeClass("displaynone");
        }
    };
    Component.prototype._cancelSearch = function () {
        this.form.css({"width": (this.inputWidth) + "px"});
        this.clearBtn.addClass("displaynone");
        this.formdiv.removeClass("yy-input-index-state");
        this.input[0].setAttribute('placeholder',this.config.placeholder);
        this.searchBar[0].className = this.searchBarClassName + " yy-sv-defalut";
        if (this.defaultComyWrapper) {
            this.defaultComyWrapper.removeClass("displaynone");
            this.resultComWrapper && this.resultComWrapper.addClass("displaynone");
        }
    };

    Component.prototype._focus = function () {
        this.formdiv.addClass("yy-input-index-state");
        this.clearBtn.removeClass("displaynone");
        this.form.css({"width": this.inputFocusWidth + "px"});
        this.input[0].removeAttribute('placeholder');
        if (this.input.val().length > 0) {
            // this.clearBtn.removeClass("displaynone");
        }
        this.searchBar[0].className = this.searchBarClassName + " yy-sv-active";
        if (this.resultComWrapper) {
            this.resultComWrapper.removeClass("displaynone");
            this.defaultComyWrapper && this.defaultComyWrapper.addClass("displaynone");
        }
    };
    return Component;
});
