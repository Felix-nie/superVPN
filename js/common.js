/**
 *
 */
var Common = function(){
    var common_var =  null;
    var that = this;
    this.version = 126;
    this.version_text = "1.2.6";
    this.hard_key = "";
    this.block_list = null;
    this.profile_list = null;
    this.storage_items = null;
    this.user_data = null;
    this.session_id = null;
    this.currentProfileName = null;
    this.currentServerIP = null;
    this.beat_error_time = 0;
    this.user_id = 0;
    this.username = "";
    this.is_agent_version = false;

    //非background页面 判断common var 是否已备妥
    this.var_ready = false;

    //REQUIRE:按需，ALL：总是，DIRECT：
    this.proxy_mode_enum = {"DIRECT":3,"REQUIRE":1,"ALL":2};
   //代理模式
    this.proxy_mode = this.proxy_mode_enum.ALL;

    //获取储存的内容
    this.get_chrome_storage = function (key,callback)
    {
        chrome.storage.local.get(key,function(items){
            callback(items[key]);
        });
    };
    /*
    把相对路径转换为插件路径
     */
    this.get_url = function (url)
    {
        return chrome.extension.getURL(url);
    };
    //获取所有储存的项目
    this.get_all_chrome_storage = function (callback_items)
    {
        chrome.storage.local.get(null,function(items){
            callback_items(items);
        });
    };
    this.remove_chrome_storage = function(key)
    {
        chrome.storage.local.remove(key,function(){
        });
    };
    //当存储项目发生改变的时候
    this.chrome_storage_on_change = function(callback)
    {
        chrome.storage.onChanged.addListener(function(changes, namespace) {
            callback(changes,namespace);
        });
    };
    //清除所有存储内容
    this.clear_all_chrome_storage = function(callback){

    };
    //设置存储内容
    this.set_chrome_storage =  function (data,callback)
    {
        chrome.storage.local.set(data,function(e){
            if (callback!=undefined) {
                callback(e);
            }
        });
    };
    //初始化页面变量
    this.init_common_vars = function ()
    {
        $(".self_update_content").each(function(index,element){
            var name = $(element).attr("data-name");
            for (var key in that.common_var)
            {
                if (name == key)
                {
                    $(element).html(that.common_var[key]);
                    return;
                }
            }
        });
    };
    //打开内部网页
    this.openOptions = function(url,is_app) {
        //console.log("open_options: " + url);
        var d, options_url;
       // d = $q['defer']();
        options_url = chrome.extension.getURL(url);

        chrome.tabs.query({
            url: options_url
        }, function(tabs) {
            var props, url, _ref;
            var urlParser = document.createElement('a');
            var hash = null;
            url = hash ? (urlParser.href = ((_ref = tabs[0]) != null ? _ref.url : void 0) || options_url, urlParser.hash = hash, urlParser.href) : options_url;
            if (tabs.length > 0) {
                props = {
                    active: true
                };
                if (hash) {
                    props.url = url;
                }
                chrome.tabs.update(tabs[0].id, props);
            } else {
                chrome.tabs.create({
                    url: url
                });
            }
            return true;
        });
        return false;
    };
    this.getBackground = function(){
        var bgPage = chrome.extension.getBackgroundPage();
        return  bgPage.background;
    };
    this.applyProfile = function(name){
        that.send_message("applyProfile",[name],function(){
        });
    };
    this.set_last_selected_profile = function(name,callback){
        common.set_chrome_storage({"last_selected_profile":name},function(e){
            if (callback!=undefined)
            {
                callback(e);
            }
        });
    };
    //向background发送message
    this.send_message = function(method,args,respond){
        chrome.runtime.sendMessage({
            method: method,
            args: args
        }, function(response) {
            respond(response);
        });
    };
    this.log = function(){
        var type = "error";
        var result = "dev:chrome|";
        result += "ver:"+that.version+"|";
        result += "msg:"+type+"|";
        result += "har:"+that.hard_key+"|";
        result += "usr:"+that.user_data.username+"|";
        result += "ses:"+that.session_id+"|";
        result += "ses:"+that.session_id+"|";
        result += "ses:"+that.session_id+"|";

    };
    this.get_background_vars = function(callback){
        this.send_message("get_background_vars",[],function(e){
            callback(e);
        });
    };
    this.get_current_profile_name = function(){
        var bgPage = chrome.extension.getBackgroundPage();
        if ( bgPage.common != undefined &&  bgPage.common != null)
        {
            var profile_name = bgPage.common.currentProfileName;
            this.currentProfileName = profile_name;
            return profile_name;
        }


    };
};


var api = new API();
var common = new Common();
common.get_all_chrome_storage(function(obj){

    common.block_list = obj.block_list;

    common.storage_items = obj;
    common.profile_list = {};
    for (var i in obj)
    {
        if (i.substr(0,1) == "+")
        {
            common.profile_list[i] = obj[i];
        }
    }
});

$(document).ready(function(){
    var page = $("#page").val();
    var ready = false;
    if (page!="background")
    {
        common.get_background_vars(function(e){
            common.session_id = e.result.session_id ;
            common.hard_key = e.result.hard_key ;
            common.user_data = e.result.user_data;
            common.proxy_mode = e.result.proxy_mode;
            common.expries_days = e.result.expries_days;
            common.currentProfileName = e.result.currentProfileName;
            common.var_ready = true;
            common.profile_list = e.result.profile_list;

            //console.log("get_background_vars get_profile_list");
        });
    }




    common.get_chrome_storage("COMMON_VAR_LAST_UPDATE",function(e){
        var timestamp = Math.round(new Date().getTime()/1000);
        if (e > timestamp )
        {
            common.get_chrome_storage("COMMON_VAR",function(e) {
                //console.log("缓存！@");
                common.common_var = e;
                common.init_common_vars();
            });
            return;
        }
        api.get_var_list("COMMON",function(e){
            common.set_chrome_storage({"COMMON_VAR_LAST_UPDATE":timestamp + 600},function(){})
            common.set_chrome_storage({"COMMON_VAR":e.result},function(){})
            common.common_var = e.result;
            common.init_common_vars();
        });
    });
    if (common.is_agent_version == true)
    {
        $("#btn_recharge").hide();
        $("#btn_charge").hide();
        $("#login_bottom").hide();
        $("#btn_charge_link").hide();
        $("#btn_forget_password").hide();
        $("#tab_reg").attr("id","");
    }


});
