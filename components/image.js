/**
 * Created by xiaoz on 16/8/13.
 */
define(["utils", "base"], function (utils, baseClass) {
    var Component = function (config) {
        var _this = this;
        Component.baseConstructor.call(this, config);
        _this.config.style = _this.config.style || {};
        var className = "yy-image displayflex yy-jc-center yy-ai-center";
        this.src = config.src || config.defaultSrc;
        this.title = this.config.title || "";
        this.width = this.config.style.width;
        try {
            this.width = parseInt(width);
        } catch (e) {
            this.width = null;
        }
        this.height = this.config.style.height;
        try {
            this.height = parseInt(height);
        } catch (e) {
            this.height = null;
        }
        this.img = new Image();
        var preErrorImagesrc = "";
        this.img.onload = function () {

            var style = {};
            if (_this.height && _this.width) {
                var size = utils.getPicSize(_this.width, _this.height, _this.img.width, _this.img.height);
                style.width = size.w;
                style.height = size.h;
            } else {
                style.height = "100%";
                style.width = "100%";
            }
            if (_this.config.style.borderRadius) {
                style.borderRadius = _this.config.style.borderRadius;
            }
            utils.css($(_this.img), style);
        };
        this.img.onerror = function () {
            var imgOnErrorMethodName = _this.config.comKey + "_error";
            var imgOnErrorMethod = _this.pageview.plugin[imgOnErrorMethodName];
            if (imgOnErrorMethod) {
                imgOnErrorMethod.call(_this.pageview.plugin, _this, {});
            }
            if (_this.title.length > 0) {
                var title = utils.getImgTitle(_this.title);
                _this.$el.html(title);
                _this.$el.css({
                    color: "#fff",
                    fontSize: utils.fontSize(_this.config.style.fontSize || 13),
                    backgroundColor: utils.getImgBg(title)
                });
                return;
            }
            if (config.defaultSrc) {
                if (preErrorImagesrc === config.defaultSrc) {
                    _this.img.classList.add("displaynone");
                    return;
                }
                preErrorImagesrc = config.defaultSrc;
                _this.img.src = config.defaultSrc;
            }
        }
        this.src = this.src || "";
        // if (this.src.length > 0) {
            this.img.src = this.src;
        // }
        _this.$el.append(_this.img);
        this.$el.addClass(className);
    }
    utils.extends(Component, baseClass);

    Component.prototype.setSrc = function (src) {
        if (this.$el.find('img').length > 0) {
            this.$el.find('img').attr('src', src);
        } else {
            this.img.src = src;
            this.$el.html(this.img);
        }


    }
    Component.prototype.setTitle = function (title) {
        var _this = this;
        var _title = utils.getImgTitle(title);
        this.$el.html(_title);
        this.$el.css({
            color: "#fff",
            fontSize: utils.fontSize(_this.config.style.fontSize || 13),
            backgroundColor: utils.getImgBg(_title)
        });
    }

    return Component;
});
