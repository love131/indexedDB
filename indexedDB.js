/**
 * Created by Sinson on 2017/3/19.
 */

/*
 * 打开indexedDB
 *
 * */

//  objectStore,openStore,transactionStore应该保持相同
var config = {

    databaseName:"sinson",   //创建或要打开的数据库的名称
    objectStore:"third",   //创建或要被打开的数据仓库的名称
    databaseVersion:"1",  //创建的数据库的版本号
    index:"name",      //创建的索引属性
    indexName:"name",  //创建的索引名称
    indexUnique:false,  //是否指定索引属性唯一,可以更改为true
    keyPath:"id",    //创建的数据仓库的主键
    autoIncrement:true,  //是否设置主键自动增长
    openStore:["third"], //事物打开的仓库列表
    operateModel:"readwrite", //事物的打开模式
    db:null,   //要被操作的数据库引用，不可修改
    transaction:null,  //事物对象
    transactionStore:"third" , //事物操作的仓库，仓库列表中的一个
    store:null  //不可修改

};
/*
 * 私有方法不可直接调用
 * 创建事务
 * */
function Transaction(){

    config.transaction = config.db.transaction(config.openStore,config.operateModel);
    config.transaction.onabort = function(e){
        console.log("事务操作中断");
    };

    config.transaction.onerror = function(e){
        console.log("事务创建失败");

    };

    config.transaction.oncomplete = function(e){
        console.log("事务操作完成");
    };


    config.store = config.transaction.objectStore(config.transactionStore);
    console.log("创建事务完成");
    //console.log(config.store);
}

/*
 * 参数：均可选，store表示要创建的仓库名，name表示数据库名字，version表示数据库的版本
 * 函数功能：打开指定数据的数据仓库
 *
 * */
function openDB(store,name,version)
{

    var version = version || config.databaseVersion ;
    var store = store || config.objectStore;
    var name = name || config.databaseName;

    var openRequest = window.indexedDB.open(name,version);


    openRequest.onerror = function(e){
        console.error("打开数据库失败");
        // console.log(e.target.result);
    };

    openRequest.onsuccess = function(e){
        config.db = e.target.result;
        console.log("成功打开数据库");
        //Transaction();
    };

    openRequest.onupgradeneeded = function(e){

        var objectStore;
        config.db = e.target.result;
        console.log(config.db);

        if(!config.db.objectStoreNames.contains(config.objectStore))
        {
            if(!(config.keyPath == "")){
                objectStore = config.db.createObjectStore(config.objectStore,{keyPath:config.keyPath,autoIncrement:config.autoIncrement});
            }
            else
            {
                objectStore =  config.db.createObjectStore(config.objectStore,{autoIncrement:true});
            }

        }

        if(config.index != ""  &&  config.indexName != "")
        {
            objectStore.createIndex(config.indexName,config.index,{unique:config.indexUnique});
        }

        //  Transaction();
        console.log("已经成功创建对象仓库");


    }
}

/*
 * 功能：关闭数据库
 * */

function closeDB(){
    config.db.close();
    console.log("成功关闭数据库");
}
/*
 * 功能：删除数据库
 * */
function deleteDB(name){
    indexedDB.deleteDatabase(name);
}

/*
 * 操作对象，包含五个方法，分别为add,update,getData,indexData,deleteData
 *
 *
 *
 * */
var operate = {

    add:function(data){

        Transaction();
        console.log("zengjia");
        //添加数据，重复添加会报错
        var store  =config.store,request;
        request = store.add(data);
        request.onerror = function(){
            console.error('add添加数据库中已有该数据')
        };
        request.onsuccess = function(){
            console.log('add添加数据已存入数据库')
        };

    },
    update:function(data){
        Transaction();
        //添加数据，重复添加会报错
        var store  = config.store,request;
        request = store.put(data);
        request.onerror = function(){
            console.error('put添加数据库中已有该数据')
        };
        request.onsuccess = function(){
            console.log('put添加数据已存入数据库')
        };
    },
    deleteData:function(PrimaryKey){

        Transaction();
        var t= config.store.delete(PrimaryKey);
        t.onsuccess = function(e){
            console.log("已经成功删除指定数据");
        }
    },
    getData:function(key,callback){

        Transaction();

        var handler =  config.store.get(key);

        var data;

        handler.onsuccess = function(e){

            data = this.result;
            callback(data);


        };

        handler.onerror = function(e){
            console.log("获取数据失败")
        }

    },
    indexData:function(index,callback){

        var request,data;
        var mutipleData = [];

        Transaction();
        var table = config.store.index(config.indexName);

        if(config.indexUnique){
            request = table.get(index);
            request.onsuccess = function(){

                data = this.result;
                if(callback != undefined)
                    callback(data);

            }
        }
        else{

            request = table.openCursor();
            request.onsuccess = function(e){
                var cursor = e.target.result;
                if(cursor){

                    console.log(cursor.value);
                    mutipleData.push(cursor.value);
                    cursor.continue();

                }

                if(cursor == undefined){
                    if(callback != ""){

                        callback(mutipleData);

                    }
                }

            }
        }
    }



};

openDB();

setTimeout(function(){
    var info = {
        id : 2,
        name:"陈兴爽",
        school:"信息工程",
        gender:"女"
    };

    operate.add(info);

    //deleteDB("sinson");
},800);
