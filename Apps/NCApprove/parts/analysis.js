define([], function () {
    var jsonList = [];
    var Re = {
        getAnalysis_ifroms: function (data) {
            this.getComponentData(data);
            return jsonList;
        },
        // 处理数据展示格式化
        getComponentData: function (layoutDetail) {
            var jsonContent = {};
            jsonList = [];
            // head 主表数据 body 子表数据
            var head=layoutDetail[0].taskbill.head[0].tabContent.billItemData;
            var body=layoutDetail[0].taskbill.body[0].tabContent;
            for(var i=0;i<head.length;i++){
                var cur=head[i];
                jsonContent = {};
                jsonContent=this.processContent(cur)
                jsonList.push(jsonContent);
            }
            
            // 子表数据处理
            jsonContent={};
            jsonContent.title='明细子表';
            jsonContent.type='DataTable',
            jsonContent.items=[]
            
           for(var n=0;n<body.length;n++){
                var jsonTable={};
                jsonTable.title='明细子表';
                jsonTable.type='DataTable',
                jsonTable.num=n+1,
                jsonTable.items=[];
                var bodyItem=body[n].billItemData;
                for(var j=0;j<bodyItem.length;j++){
                    var jsonComponet={};
                    var cur=bodyItem[j];
                    jsonComponet = {};
                    jsonComponet=this.processContent(cur)
                    jsonTable.items.push(jsonComponet);
                }
                jsonContent.items.push(jsonTable);
           }    
            jsonList.push(jsonContent);
        }, 
        // 处理内容item
        processContent: function (obj) {
            var data={};
            obj=obj||{};
            var contentKey='',titleKey='',contentIdKey;
            for(var key in obj){
                if(key.indexOf('itemShowName')>-1){
                    titleKey=key;
                }
            }
            for(var keys in obj){
                if(titleKey&&titleKey.indexOf(keys)===0){
                    contentKey=keys;
                }
                if(titleKey&&keys.indexOf('_ID')>0){
                    contentIdKey=keys;
                }
            }
            if(obj[contentKey] instanceof Object){
                if(obj[contentKey].hasOwnProperty('year')){
                    var arr=[obj[contentKey].year,obj[contentKey].month,obj[contentKey].day];
                    data.content=arr.join('-');
                }else{
                    data.content='';
                }
            }else{
                data.content=obj[contentKey];
            }
            data.title=obj[titleKey];
            data.type='Text';
            return data;
        }   
    };
    return Re;
});
