define(["./common"], function (c) {
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
            jsonContent.title=layoutDetail[0].taskbill.body[0].tabName;
            jsonContent.type='DataTable';
            jsonContent.items=[];
            var totalJsonContent=[]
            
           for(var n=0;n<body.length;n++){
                var jsonTable={};
                jsonTable.title=layoutDetail[0].taskbill.body[0].tabName;
                jsonTable.type='DataTable',
                jsonTable.num=n+1,
                jsonTable.items=[];
                var bodyItem=body[n].billItemData;
                for(var j=0;j<bodyItem.length;j++){    
                    var jsonComponet=this.processContent(bodyItem[j])    
                    if(!isNaN(jsonComponet.content-0)){
                        jsonComponet.type='Money';
                    }
                    if(!jsonComponet.digest){
                        jsonTable.items.push(jsonComponet);
                    }else if(jsonComponet.type==='Money'){
                        totalJsonContent.push(jsonComponet)
                    }    
                }
                jsonContent.items.push(jsonTable);
           }    
            jsonList.push(jsonContent);

            // 合计字段处理  
            if(totalJsonContent&&totalJsonContent.length>0){
                var total={
                    title:'',
                    content:0,
                    type:'Money',
                }
                for(var m=0;m<totalJsonContent.length;m++){
                    total.title=totalJsonContent[m].title +"(合计)";
                    total.content+=(c.sumVal(totalJsonContent[m].amount.dV,2)-0);
                }
                // amount 大写
                var totalAmount={
                    title:total.title+('大写'),
                    content: c.MoneyDX(total.content),
                    type:'Money',
                }
                console.log(c.thousandthValue(total.content))
                total.content=c.thousandthValue(total.content)
                jsonList.push(total);
                jsonList.push(totalAmount);
            }
        }, 
        // 处理内容item
        processContent: function (obj) {
            var data={};
            obj=obj||{};
            var contentKey='',titleKey='';
            for(var key in obj){
                if(key.indexOf('itemShowName')>-1){
                    titleKey=key;
                }
            }
            for(var keys in obj){
                if(titleKey&&titleKey.indexOf(keys)===0){
                    contentKey=keys;
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
            if(obj.hasOwnProperty('amount')){
                data.amount=obj.amount;
            }
            data.title=obj[titleKey];
            data.type='Text';
            data.digest=obj.digest
            return data;
        }   
    };
    return Re;
});
