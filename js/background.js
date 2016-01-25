
var Background = function(callback) {
  common.remove_chrome_storage("+");
  common.get_chrome_storage("hard_key",function(e){
    if (e!=undefined && e!="")
    {
      common.hard_key = e;
    }
    else
    {

      common.hard_key = md5(Math.random() + " - " + Math.round(new Date().getTime()));
      common.set_chrome_storage({"hard_key":common.hard_key});
    }
    //console.log("hrad_key: " + common.hard_key);
  });
  var Log, OmegaTargetCurrent, Promise, actionForUrl, charCodeUnderscore, dispName, drawIcon, encodeError, external, iconCache, isHidden, options, state, storage, tabs, timeout, unhandledPromises, unhandledPromisesId, unhandledPromisesNextId,
      __slice = [].slice,
      __hasProp = {}.hasOwnProperty;

  OmegaTargetCurrent = Object.create(OmegaTargetChromium);

  Promise = OmegaTargetCurrent.Promise;

  Promise.longStackTraces();

  OmegaTargetCurrent.Log = Object.create(OmegaTargetCurrent.Log);

  Log = OmegaTargetCurrent.Log;

  // OmegaTargetCurrent.applyProfile("direct");

  Log.log = function () {
  //  var args;
  //  args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
   // console.log.apply(console, args);
   // console.trace(args);
   // return localStorage['log'] += args.map(Log.str.bind(Log)).join(' ') + '\n';
  };

  Log.error = function () {
    var args, content;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    console.error.apply(console, args);
    content = args.map(Log.str.bind(Log)).join(' ');
    localStorage['logLastError'] = content;
    return localStorage['log'] += 'ERROR: ' + content + '\n';
  };

  unhandledPromises = [];

  unhandledPromisesId = [];

  unhandledPromisesNextId = 1;

  Promise.onPossiblyUnhandledRejection(function (reason, promise) {
    Log.error("[" + unhandledPromisesNextId + "] Unhandled rejection:\n", reason);
    unhandledPromises.push(promise);
    unhandledPromisesId.push(unhandledPromisesNextId);
    return unhandledPromisesNextId++;
  });

  Promise.onUnhandledRejectionHandled(function (promise) {
    var index;
    index = unhandledPromises.indexOf(promise);
    Log.log("[" + unhandledPromisesId[index] + "] Rejection handled!", promise);
    unhandledPromises.splice(index, 1);
    return unhandledPromisesId.splice(index, 1);
  });

  iconCache = {};

  drawIcon = function (resultColor, profileColor) {
    var cacheKey, ctx, icon;
    cacheKey = "omega+" + (resultColor != null ? resultColor : '') + "+" + profileColor;
    icon = iconCache[cacheKey];
    if (icon) {
      return icon;
    }
    ctx = document.getElementById('canvas-icon').getContext('2d');
    if (resultColor != null) {
      drawOmega(ctx, resultColor, profileColor);
    } else {
      drawOmega(ctx, profileColor);
    }
    icon = ctx.getImageData(0, 0, 19, 19);
    return iconCache[cacheKey] = icon;
  };

  charCodeUnderscore = '_'.charCodeAt(0);

  isHidden = function (name) {
    return name.charCodeAt(0) === charCodeUnderscore && name.charCodeAt(1) === charCodeUnderscore;
  };

  dispName = function (name) {
    return chrome.i18n.getMessage('profile_' + name) || name;
  };

  actionForUrl = function (url) {
    return options.ready.then(function () {
      var request;
      request = OmegaPac.Conditions.requestFromUrl(url);
      return options.matchProfile(request);
    }).then(function (_arg) {
      var attached, condition, current, currentName, details, direct, icon, name, profile, profileColor, realCurrentName, result, resultColor, results, _i, _len, _ref, _ref1, _ref2, _ref3;
      profile = _arg.profile, results = _arg.results;
      current = options.currentProfile();

      currentName = dispName(current.name);


      if (current.profileType === 'VirtualProfile') {
        realCurrentName = current.defaultProfileName;
        currentName += " [" + (dispName(realCurrentName)) + "]";
        current = options.profile(realCurrentName);
      }
      details = '';
      direct = false;
      attached = false;
      for (_i = 0, _len = results.length; _i < _len; _i++) {
        result = results[_i];
        if (Array.isArray(result)) {
          if (result[1] == null) {
            attached = false;
            name = result[0];
            if (name[0] === '+') {
              name = name.substr(1);
            }
            if (isHidden(name)) {
              attached = true;
            } else if (name !== realCurrentName) {
              details += chrome.i18n.getMessage('browserAction_defaultRuleDetails');
              details += " => " + (dispName(name)) + "\n";
            }
          } else if (result[1].length === 0) {
            if (result[0] === 'DIRECT') {
              details += chrome.i18n.getMessage('browserAction_directResult');
              details += '\n';
              direct = true;
            } else {
              details += "" + result[0] + "\n";
            }
          } else if (typeof result[1] === 'string') {
            details += "" + result[1] + " => " + result[0] + "\n";
          } else {
            condition = (_ref = ((_ref1 = result[1].condition) != null ? _ref1 : result[1]).pattern) != null ? _ref : '';
            details += "" + condition + " => ";
            if (result[0] === 'DIRECT') {
              details += chrome.i18n.getMessage('browserAction_directResult');
              details += '\n';
              direct = true;
            } else {
              details += "" + result[0] + "\n";
            }
          }
        } else if (result.profileName) {
          if (result.isTempRule) {
            details += chrome.i18n.getMessage('browserAction_tempRulePrefix');
          } else if (attached) {
            details += chrome.i18n.getMessage('browserAction_attachedPrefix');
            attached = false;
          }
          condition = (_ref2 = (_ref3 = result.source) != null ? _ref3 : result.condition.pattern) != null ? _ref2 : result.condition.conditionType;
          details += "" + condition + " => " + (dispName(result.profileName)) + "\n";
        }
      }
      if (!details) {
        details = options.printProfile(current);
      }
      resultColor = profile.color;
      profileColor = current.color;
      icon = null;
      if (direct) {
        resultColor = options.profile('direct').color;
        profileColor = profile.color;
      } else if (profile.name === current.name && options.isCurrentProfileStatic()) {
        resultColor = profileColor = profile.color;
        icon = drawIcon(profile.color);
      } else {
        resultColor = profile.color;
        profileColor = current.color;
      }
      if (icon == null) {
        icon = drawIcon(resultColor, profileColor);
      }
      return {
        title: chrome.i18n.getMessage('browserAction_titleWithResult', [currentName, dispName(profile.name), details]),
        icon: icon,
        resultColor: resultColor,
        profileColor: profileColor
      };
    });
  };

  storage = new OmegaTargetCurrent.Storage(chrome.storage.local, 'local');

  state = new OmegaTargetCurrent.BrowserStorage(localStorage, 'omega.local.');

  options = new OmegaTargetCurrent.Options(null, storage, state, Log);

  options.externalApi = new OmegaTargetCurrent.ExternalApi(options);

  options.externalApi.listen();


  if (chrome.runtime.id !== OmegaTargetCurrent.SwitchySharp.extId) {
    options.switchySharp = new OmegaTargetCurrent.SwitchySharp();
    options.switchySharp.monitor();
  }

  tabs = new OmegaTargetCurrent.ChromeTabs(actionForUrl);

  tabs.watch();

  options._inspect = new OmegaTargetCurrent.Inspect(function (url, tab) {
    if (url === tab.url) {
      options.clearBadge();
      tabs.processTab(tab);
      state.remove('inspectUrl');
      return;
    }
    state.set({
      inspectUrl: url
    });
    return actionForUrl(url).then(function (action) {
      var parsedUrl, title, urlDisp;
      parsedUrl = OmegaTargetCurrent.Url.parse(url);
      if (parsedUrl.hostname === OmegaTargetCurrent.Url.parse(tab.url).hostname) {
        urlDisp = parsedUrl.path;
      } else {
        urlDisp = parsedUrl.hostname;
      }
      title = chrome.i18n.getMessage('browserAction_titleInspect', urlDisp) + '\n';
      title += action.title;

      chrome.browserAction.setTitle({
        title: title,
        tabId: tab.id
      });
      return tabs.setTabBadge(tab, {
        text: '#',
        color: action.resultColor
      });
    });
  });

  options.setProxyNotControllable(null);

  timeout = null;

  options.watchProxyChange(function (details) {
    var internal, noRevert, notControllableBefore, parsed, reason;
    if (options.externalApi.disabled) {
      return;
    }
    if (!details) {
      return;
    }
    notControllableBefore = options.proxyNotControllable();
    internal = false;
    noRevert = false;
    switch (details['levelOfControl']) {
      case "controlled_by_other_extensions":
      case "not_controllable":
        reason = details['levelOfControl'] === 'not_controllable' ? 'policy' : 'app';
        options.setProxyNotControllable(reason);
        noRevert = true;
        break;
      default:
        options.setProxyNotControllable(null);
    }
    if (details['levelOfControl'] === 'controlled_by_this_extension') {
      internal = true;
      if (!notControllableBefore) {
        return;
      }
    }
    Log.log('external proxy: ', details);
    if (timeout != null) {
      clearTimeout(timeout);
    }
    parsed = null;
    timeout = setTimeout((function () {
      return options.setExternalProfile(parsed, {
        noRevert: noRevert,
        internal: internal
      });
    }), 500);
    parsed = options.parseExternalProfile(details);
  });

  external = false;

  options.currentProfileChanged = function (reason) {
    var current, currentName, details, icon, message, realCurrentName, title;
    iconCache = {};
    if (reason === 'external') {
      external = true;
    } else if (reason !== 'clearBadge') {
      external = false;
    }
    current = options.currentProfile();
    currentName = '';
    if (current) {
      currentName = dispName(current.name);
      if (current.profileType === 'VirtualProfile') {
        realCurrentName = current.defaultProfileName;
        currentName += " [" + (dispName(realCurrentName)) + "]";
        current = options.profile(realCurrentName);
      }
    }


    details = options.printProfile(current);
    common.currentProfileName = currentName;
    var ip= current.ip;
    if (currentName) {
      title = chrome.i18n.getMessage('browserAction_titleWithResult', [currentName, '', details]);
    } else {
      title = details;
    }
    if (external && current.profileType !== 'SystemProfile') {
      message = chrome.i18n.getMessage('browserAction_titleExternalProxy');
      title = message + '\n' + title;
      options.setBadge();
    }
    if (!current.name || !OmegaPac.Profiles.isInclusive(current)) {
      icon = drawIcon(current.color);
    } else {
      icon = drawIcon(options.profile('direct').color, current.color);
    }
    return tabs.resetAll({
      icon: icon,
      title: title
    });
  };

  encodeError = function (obj) {
    if (obj instanceof Error) {
      return {
        _error: 'error',
        name: obj.name,
        message: obj.message,
        stack: obj.stack,
        original: obj
      };
    } else {
      return obj;
    }
  };


  chrome.runtime.onMessage.addListener(function (request, sender, respond) {
    /*
    //console.log("on_message: " );
    //console.log(request);
    //console.log(sender);
    //console.log(respond);
    */
    if (request.method == "get_background_vars")
    {
      var result = {};
      result.session_id = common.session_id;
      result.hard_key = common.hard_key;
      result.user_data = common.user_data;
      result.proxy_mode = common.proxy_mode;
      result.expries_days = common.expries_days;
      result.currentProfileName = common.currentProfileName;
      result.profile_list = common.profile_list;
      return respond({
        result: result
      });
    }
    if (request.method == "get_current_profile")
    {
      result.currentProfileName = common.currentProfileName;
      return respond({
        result: result
      });
    }
    options.ready.then(function () {
      var method, promise, target;
      target = options;
      method = target[request.method];
      if (typeof method !== 'function') {
        Log.error("No such method " + request.method + "!");
        respond({
          error: {
            reason: 'noSuchMethod'
          }
        });
        return;
      }
      promise = Promise.resolve().then(function () {
        return method.apply(target, request.args);
      });
      promise.then(function (result) {
        var key, value;
        if (request.method === 'updateProfile') {
          for (key in result) {
            if (!__hasProp.call(result, key)) continue;
            value = result[key];
            result[key] = encodeError(value);
          }
        }
        return respond({
          result: result
        });
      });
      return promise["catch"](function (error) {
        Log.error(request.method + ' ==>', error);
        return respond({
          error: encodeError(error)
        });
      });
    });
    return true;
  });

  var that = this;
  var user_data = {};
  this.get_user_data = function(){
    return user_data;
  };
  this.refresh = function(){
    location.reload();
  };

  this.applyProfile = function (name) {
    if (name == null || name == undefined || name == "")
    {
      return;
    }
    options.applyProfile(name);
    common.set_last_selected_profile(name);
  };
  this.applyRandomProfile = function()
  {
      var list = common.profile_list;
     // console.log(common.profile_list['+台湾线路 01']);
      if (common.profile_list['+台湾线路 01']== undefined )
      {
         // console.log(common.profile_list);

          console.trace("尝试重新获取线路");
          that.try_update_node_list(true,true);
          window.setTimeout(function(){
            location.reload();
          },200)


          return;
      }
      var list2 = [];
      var j = 0;
      for (var i in list)
      {
          list2[j] = list[i];
          j++;
      }
      //console.log(list2);
      var name = "";
      var max = list2.length-1;
      var min = 0;
      for (var i=0;i<100;i++)
      {
          var id = Math.floor(min+Math.random()*(max-min));
          name = list2[id].name.replace("+","");
          if (name.substr(0,4) !="中国线路")
          {
              break;
          }
          else
          {
          }
      }
      that.applyProfile(name);
  };
  //获取登录状态
  this.get_login_status = function ()
  {
    return login_status;
  };

  this.update_block_list = function(callback)
  {
    common.get_chrome_storage("block_list",function(e) {
      var block_list = e;
      if (block_list == "" || block_list == undefined || block_list.length == 0) {
        api.get_block_list(callback);
      }
      else {
        //非第一次运行不同步
        return;
      }
    });
  };
  this.update_node_list = function(callback)
  {
    api.get_node_list(callback);
  };
  this.change_proxy_mode = function(mode)
  {
    common.proxy_mode = mode;
    common.set_chrome_storage({"proxy_mode":common.proxy_mode});
  };
  this.get_proxy_mode = function(){
    return common.proxy_mode;
  };
  that.save_block_list = function(save_list){

    common.set_chrome_storage({"block_list": save_list},function(){
      common.get_chrome_storage("block_list",function(e){
        //console.log(e);
      });
       // that.refresh();
    });
  };
  this.get_block_list = function(){
    return common.block_list;
  };
  this.set_block_list = function(list){
    common.block_list = list;
    var name = options.currentProfile().name;
      options.applyProfile("direct");
    window.setTimeout(function(){ options.applyProfile(name);},200);


  };
  this.try_update_node_list = function(try_time,f){

    var timestamp = Math.round(new Date().getTime() / 1000);
    common.get_chrome_storage("NODE_LIST_LAST_UPDATE",function(e2) {
      if (e2>timestamp && f!=true)
      {
        //console.log( "缓存时间内不更新列表");
        return;
      }

      that.update_node_list(function(e){

        if (e.success != true)
        {
          if (try_time==true)
          {
            that.try_update_node_list(false);
          }
          return;
        }
        var now_list  = [];
        common.get_all_chrome_storage(function(obj){
          for (var j in obj)
          {
            if (j.substr(0,1) == "+")
            {
              now_list[j] = obj[j];
            }
          }
          var found = false;
          for (var i in now_list)
          {
            found = false;
            for (var j in e.list)
            {
              if (now_list[i].name == e.list[j].name)
              {
                found = true;
                break;
              }
              else
              {
                found = false;
              }
            }

            if (found == false)
            {
              //console.log("删除了项目：" + i);
              common.remove_chrome_storage(i);
            }

          }

          for(var k in e.list)
          {
            var data = {};
            data[k] = e.list[k];

            common.set_chrome_storage(data);
          }
        });


        //console.log("没有列表缓存");
        common.set_chrome_storage({"NODE_LIST_LAST_UPDATE":timestamp + 600},function(){
            if(is_first_login == true)
            {
                window.setTimeout(function(){
                    that.applyRandomProfile(1);
                },200);


            }
        });
        chrome.storage.local.remove('+proxy');
        chrome.storage.local.remove('+auto switch');
      });

    });

  };
  var is_first_login = false;
  //检查是否登录
  this.check_login = function(callback,is_kick,is_first){
    common.get_all_chrome_storage(function(obj){
      ////console.log("try_login: " + obj.username + " - " +  obj.password );
      user_data.username = obj.username;
      user_data.password = obj.password;

      api.log(api.LOG_TYPE_LOGIN,"尝试登录" , user_data.username + "/" +  user_data.password);
      if (obj.username!=undefined && obj.password!=undefined)
      {
        if (obj.username == "" || obj.username == "")
        {
          //退出登录
          return false;
        }
        var do_kick = 0;
        if (is_kick==true)
        {
          do_kick = 1;
        }
        api.check_user_pass(obj.username,obj.password,obj.hard_key,common.version ,function(e){
          that.auth();
          if (e.success != true)
          {
            api.log(api.LOG_TYPE_LOGIN,"登录失败" , obj.username + "/" + obj.password);
            if (e.msg!=undefined)
            {
               //alert(e.msg);
            }
            else
            {
              alert("连接登录服务器异常！请关闭软件重新登陆，如有疑问请联系客服处理。错误信息：" + JSON.stringify(e));
            }

            that.applyProfile("direct");
            login_status = false;
            common.openOptions("login.html",true);
            if (callback != undefined)
            {
              callback(login_status,e);
            }
            return;
          }

         // //console.log("login_success");
          login_status = true;
          api.log(api.LOG_TYPE_LOGIN,"登录成功" , obj.username + "/" + obj.password);
          //获取白名单
          common.get_chrome_storage("is_not_first_run",function(e){
            if (e != true)
            {
              var url = chrome.extension.getURL("options.html#/faq");
              common.set_chrome_storage({"is_not_first_run":true});
              window.setTimeout(function(){
                window.open(url);
              },2000);
            }
          });


          that.update_block_list(function(e){
            if(e.success!=true)
            {
             // //console.log("获取屏蔽列表失败！");
              return;
            }
            var list = e.list;

            common.get_chrome_storage("block_list",function(e){
              var block_list = e;
              common.block_list = block_list;
             var first_run = false;
              if (block_list == "" || block_list == undefined || block_list.length == 0 )
             {
               first_run = true;
             }
              else
              {
                //非第一次运行不同步
                return;
              }

              var save_list = that.unique(list.concat(block_list));
                common.set_chrome_storage({"block_list": save_list},function(){
                  if (first_run)
                  {
                    that.refresh();
                  }
                });


              });
            });

          if (is_first == true)
          {
            is_first_login = true;
          }

          //获取线路列表
          that.try_update_node_list(true);

          common.user_data = user_data;

          common.expries_date = e.user.expiration ;

          common.expries_days = e.user.days ;

          common.user_id = e.user.id;

          common.username = e.user.username;

          common.session_id = e.session_id;

          common.set_chrome_storage({"charge_promotion_tip":e.charge_promotion_tip})

          if (e.info.is_disabled == true)
          {
            background.applyProfile("direct");
            alert("对不起，您的帐号已过期！请充值后重新启动软件！");
            common.openOptions("charge.html");
            pak_status = false;
          }
          else
          {
            pak_status = true;
          }

          var beat_timer = window.setInterval(function(){
            api.beat(common.session_id,function(e){
              if (e.success != true && e.success != false)
              {
                common.beat_error_time++;
                if (common.beat_error_time>=20)
                {
                  login_status = false;
                  //强制退出
                  that.applyProfile("direct");
                  common.set_chrome_storage({password:""},function() {
                    alert("由于网络原因，登录已超时！请检查您的网络连接！或者联系在线客服！");
                    common.openOptions("login.html");
                    common.getBackground().refresh();

                  });
                  window.clearInterval(beat_timer);
                  return;
                }
              }
              common.beat_error_time = 0;
              if(e.success == false)
              {
                login_status = false;
                //强制退出
                  that.applyProfile("direct");
                  common.set_chrome_storage({username:"",password:""},function() {
                    alert("您已被强制下线！原因可能是：1、 您的帐号在其他机器上登录。2、由于网络原因连接已断开。请尝试重新登录！");
                    common.openOptions("login.html");
                    common.getBackground().refresh();
                  });
                  window.clearInterval(beat_timer);
                  return;
              }
              /*
                common.get_chrome_storage("node_md5",function(md5_cached){
                   if (md5_cached != e.node_md5)
                   {
                       background.try_update_node_list();
                   }
                });
              */
              if( e.info.is_disabled != false)
              {
                pak_status = false;
                that.applyProfile("direct");
              }
            });
          },60000);

          common.get_chrome_storage("proxy_mode",function(e){
            if (e==undefined || e=="")
            {
              e=common.proxy_mode_enum.ALL;
            }
            background.change_proxy_mode(e);
            //console.log("运行模式：" + e);
          });

            that.start_check_last_selected();
            that.check_last_selected();

          },do_kick);

          if (callback != undefined)
          {
            callback(login_status,e);
          }

      }
      else
      {
        that.applyProfile("direct");
        login_status = false;
        common.openOptions("login.html",true);
        if (callback != undefined)
        {
          callback(login_status,e);
        }
      }
    });
  };
    this.check_last_selected = function(){
      window.setInterval(function(){
          that.start_check_last_selected();
      },5000)
    };
    this.start_check_last_selected = function(){
        common.get_chrome_storage("last_selected_profile",function(e){
            if (common.get_current_profile_name() == e)
            {
                //console.log("ok");
            }
            else
            {
                if ((e=="direct" || e=="auto switch" || e=="" || e==undefined) && common.proxy_mode != common.proxy_mode_enum.DIRECT)
                {
                    window.setTimeout(function(){
                        that.applyRandomProfile(2);
                    },1000);
                    return;
                }
                background.applyProfile(e);
                // that.applyProfile("direct");
            }
        });
    };
  this.auth = function(){
    chrome.webRequest.onAuthRequired.addListener(
        function(details, callbackFn) {
          callbackFn({
            authCredentials: {username: user_data.username, password: user_data.password}
          });
        },
        {urls: ["<all_urls>"]},
        ['asyncBlocking']
    );
  };
  this.unique=function (arr) {
    var result = [], hash = {};
    for (var i = 0, elem; (elem = arr[i]) != null; i++) {
      if (!hash[elem]) {
        result.push(elem);
        hash[elem] = true;
      }
    }
    return result;
  }


  if (callback != undefined)
  {
    callback(options);
  }


  common.get_chrome_storage("LAST_CHECK_UPDATE",function(e) {
    var timestamp = Math.round(new Date().getTime()/1000);
    if (e > timestamp )
    {
      //console.log( "已检查过更新");
      return;
    }
    api.check_update(function(e){
      if (e.success == true)
      {
        if (e.new_version == true)
        {
            window.open(e.version_update_page);
            common.set_chrome_storage({"LAST_CHECK_UPDATE":timestamp},function(){})
            common.set_chrome_storage({"NEW_VERSION":{"VERSION": e.version,"URL": e.version_update_page}},function(){
            });
        }
        else
        {
            common.set_chrome_storage({"LAST_CHECK_UPDATE":timestamp+600},function(){});
            common.set_chrome_storage({"NEW_VERSION":null},function(){
            });
        }
      }
    });
  });



};


var login_status = false;
var pak_status = true;
var background = new Background(function(that){
  that.applyProfile("direct");
});

window.setInterval(function(){
  if (login_status!=true)
  {
    background.applyProfile("direct");
    return;
  }
  if (pak_status!=true)
  {
    background.applyProfile("direct");
    return;
  }
  chrome.proxy.settings.get({"incognito":false},function(details){
    switch(details.levelOfControl)
    {
      case "not_controllable":
        //任何程序都无法控制
        break;
      case "controlled_by_other_extensions":
        //非当前程序控制代理
          background.applyProfile("direct");
        break;
      case "controllable_by_this_extension":
        break;
      case "controlled_by_this_extension":
        break;
    }
  });

},5000);

chrome.webRequest.onBeforeRequest.addListener(function(detail){
  if (detail.type=="main_frame")
  {
    if (detail.url.indexOf("chrome-extension")!=-1){return};
    if (detail.url.indexOf("192.")!=-1){return};
    if (detail.url.indexOf("127.")!=-1){return};
    if (detail.url.indexOf("10.")!=-1){return};
    if (detail.url.indexOf("100.")!=-1){return};
    if (detail.url.indexOf("localhost")!=-1){return};
    api.log(api.LOG_TYPE_URL,detail.url,[common.proxy_mode , common.currentProfileName +" "+ common.currentServerIP] );
  }
},{urls: ["<all_urls>"]});



common.get_all_chrome_storage(function(e){
  //console.log(e);
});


background.check_login();







