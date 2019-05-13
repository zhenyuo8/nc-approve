define(["./common"], function (c) {
    var jsonList = [];
    var Re = {
        getAnalysis_ifroms: function (data) {
            this.getComponentData(data);
            return jsonList;
        },
        // 处理数据展示格式化
        getComponentData: function (data) {
            jsonList = [];
            var formDataList=data.inst.formDataList[0];
            var layoutDetail=this.getLayoutDatail(data.inst.bpmForms[0].fields);
            layoutDetail.forEach(function(item){
                item.content=formDataList[item.type];
                jsonList.push(item);
            });
        }, 
        getLayoutDatail: function (layoutDetail) {
            var layout=[];
            layoutDetail.forEach(function(item,index){
                var variableContent=JSON.parse(item.variableContent);
                layout.push({
                    title:variableContent.name,
                    type:item.tableFieldName,
                    content:'',
                    id:variableContent.id
                });
            });
            return layout;
        }
  
    };
    return Re;
});
