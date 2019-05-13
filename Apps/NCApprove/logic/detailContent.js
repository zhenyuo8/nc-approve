
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
        subform_view_item_init: function (sender, params) {
            sender.bindData(sender.rowInstance.datasource.item);
        },
        subform_view_item_content_init: function (sender, params) {
            // ac.getAnalysisContent(sender, this);
        },
    };
    return PageLogic;
});
