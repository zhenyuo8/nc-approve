
define([], function () {
    function PageLogic(config) {
        this.pageview = config.pageview;
    }

    PageLogic.prototype = {
        detail_iamge_init: function (sender, params) {
            sender.$el.hide();
        },
        detail_DividingLine_init: function (sender, params) {
            sender.$el.hide();
        },
    };
    return PageLogic;
});
