/**
 *
 */
//var API_SERVER = "http://10.0.0.168:8099/vspn/";
var API_SERVER = "http://api.chrome.shicishe.com/vspn/";
var API_SERVER_DEFAULT = "http://api.chrome.shicishe.com/vspn/";
var API_SERVER_BACKUP = "http://apiv2.chrome.shicishe.com/vspn/";


var API_SERVER3 = "http://api.google.dfcqd.com:8951/";
var API_SERVER_RETRY_COUNT = 0;
var API_SERVER_BACKUP_COUNT = 0;
var IS_MAIN_FAILED = false;
var API = function(){
    var that = this;
    this.call = function(api_name,data,callback){
        console.log(API_SERVER);
        $.ajax(API_SERVER + "" + api_name,{async:true,timeout:6000,type:"POST",dataType:"JSON",data:data,success:function(e){

            if (API_SERVER_RETRY_COUNT>0)
            {
                if(API_SERVER_BACKUP_COUNT>10)
                {
                    //重试10次后恢复
                    API_SERVER_RETRY_COUNT = 0;
                    API_SERVER_BACKUP_COUNT = 0;
                    API_SERVER = API_SERVER_DEFAULT;
                }
                API_SERVER_BACKUP_COUNT++;
            }

            callback(e);
        },error:function(e){
            API_SERVER_RETRY_COUNT++;
            that.log(that.LOG_TYPE_ERROR,"API请求失败",API_SERVER + "-" + api_name);
            if (API_SERVER_RETRY_COUNT<=10)
            {
                API_SERVER = API_SERVER_BACKUP;

                window.setTimeout(function(){
                    that.call(api_name,data,callback);
                },100);
            }
            else
            {
                callback(e);
            }
        }})
    };
    this.get_var = function(name,callback){
        that.call("vspn_get_var",{name:name},function(e){
            callback(e);
        });
    };
    this.get_var_list = function(type,callback){
        that.call("vspn_get_var_list",{type:type},function(e){
            callback(e);
        });
    };
    this.check_user_pass = function(username,password,hardware_sn,software_version,callback,is_kick)
    {
        that.call("vspn_check_user_pass",{username:username,password:password,hardware_sn:hardware_sn,soft_version:software_version,is_kick:is_kick},function(e){
            callback(e);
        })
    };
    this.get_block_list = function(callback)
    {
        that.call("vspn_update_block_roles",{},function(e){
            callback(e);
        });
    };
    this.do_reg = function(username,password,callback){
        that.call("vspn_do_reg",{username:username,password:password},function(e){
            callback(e);
        })
    };
    this.get_node_list = function(callback)
    {
        that.call("vspn_get_list",{},function(e){
            callback(e);
        });
    };
    this.beat = function(session_id,callback)
    {
        that.call("beat",{session_id:session_id},function(e){
            callback(e);
        });
    };
    this.check_update = function(callback){
        that.call("check_update",{client_version:common.version},function(e){
            callback(e);
        });
    }
    this.LOG_TYPE_LOGIN = 1;
    this.LOG_TYPE_LOGOUT = 2;
    this.LOG_TYPE_ERROR = 4;
    this.LOG_TYPE_URL = 5;
    this.LOG_TYPE_CHECK_PASS = 6;
    this.LOG_TYPE_STATUS = 7;
    this.log = function(type,msg2,msg3){
        var hardware_sn = common.hard_key;
        var session_id = common.session_id;
        var txt = "msg:" + type  + "" ;
        var uid = common.username;

        chrome.system.storage.getInfo(function(info){
            common.get_chrome_storage("hard_key",function(e){
                txt += "|tx1:" + e ;
                txt += "|in2:" + common.version;
                if(type==that.LOG_TYPE_URL)
                {
                    txt += "|in3:" + msg3[0];
                    txt += "|tx4:" + msg3[1];
                    msg3="";
                    //msg2="";
                }
                if(type==that.LOG_TYPE_STATUS)
                {
                    txt += "|in3:" + msg3[0];
                    txt += "|tx4:" + msg3[1];
                    msg3="";
                    //msg2="";
                }
                if (type == that.LOG_TYPE_LOGIN)
                {
                    txt += "|tx3:" + getBrowserInfo();
                }
                if (msg2 != undefined && msg2!="")
                {
                    txt += "|tx2:" + msg2;
                }
                if (msg3 != undefined && msg3!="")
                {
                    txt += "|tx4:" + msg3;
                }

                if (uid != undefined && uid!="")
                {
                    txt += "|usr:" + uid;
                }
                if (session_id != undefined && session_id!="")
                {
                    txt += "|tx3:" + session_id;
                }

                $.ajax(API_SERVER3,{type:"POST",data:txt,async:true,success:function(e){
                    //console.log("LOG_SUCCESS");
                }});
            });

        });

    };
};





function getBrowserInfo()
{
    var agent = navigator.userAgent.toLowerCase() ;

    var regStr_ie = /msie [\d.]+;/gi ;
    var regStr_ff = /maxthon\/[\d.]+/gi
    var regStr_chrome = /chrome\/[\d.]+/gi ;
    var regStr_saf = /qqbrowser\/[\d.]+/gi ;

    //QQBrowser
    var browser_name = "";
    var browser_version = "";
    if(agent.indexOf("qqbrowser") > 0)
    {
        browser_name = "QQ浏览器";
        browser_version=agent.match(regStr_saf) ;
    }
    if(agent.indexOf("maxthon") > 0)
    {
        browser_name = "遨游浏览器";
        browser_version=agent.match(regStr_ff) ;
    }
    if(agent.indexOf("lbbrowser") > 0)
    {
        browser_name = "猎豹浏览器";
    }
    if (agent.indexOf("bidubrowser"))
    {
        browser_name = "百度浏览器";
    }
    if (agent.indexOf("opr/"))
    {
        browser_name = "Opera浏览器";
    }
    if (agent.indexOf("ubrowser"))
    {
        browser_name = "UC浏览器";
    }
    //Chrome
    if(agent.indexOf("chrome") > 0)
    {
        browser_version=agent.match(regStr_chrome) ;
    }
    return(browser_name + ' ' + browser_version);


}
