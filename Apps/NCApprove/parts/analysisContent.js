define(["./common", "utils","../parts/language"], function (c, utils,language) {
    var Re = {
        getAnalysisContent: function (sender, _this) {
            var type = sender.datasource.type;
            if(sender.datasource.comHeight){
                sender.config.style.height=sender.datasource.comHeight+'px';
                sender.config.style.isTextarea=true;
            }
            switch (type) {
                case "Money":
                    if (sender.config.text !== "") {//by huangzhy 金额为负值，金额大写显示颜色
                        if (sender.config.text !== '0' && sender.config.text !== '零元整') {
                            if(typeof sender.config.text=="number"){
                                sender.config.text=sender.config.text+"";
                            }
                            if(sender.config.text){
                                if(sender.config.text.indexOf("-")>-1&&isNaN(sender.config.text[1])){
                                    sender.config.style.color="#ff0000";
                                    sender.config.text = sender.config.text.slice(1) + " ";
                                }else{
                                    sender.config.text = sender.config.text + " " ;
                                }
                            }

                        } else {
                            sender.config.text = '';
                        }
                    } else {
                        sender.config.text = "";//by liuhca 如果默认金额没有填写，则不显示
                    }
                    if(sender.config.$$datasource.color==="red"){
                        sender.config.style.color="#ff0000";
                    }
                    // sender.$el.addClass("line_clamp10");
                    break;
                case "boolean":
                    var boolean = sender.datasource.content === "1" ? "是" : "否";
                    sender.config.text = boolean;
                    break;
                case "DateCalculate":
                    if (sender.config.text) {
                        sender.config.text += "";
                    } else {
                        sender.config.text = "0 天";
                    }
                    break;
            }
        }
    };
    return Re;
});
