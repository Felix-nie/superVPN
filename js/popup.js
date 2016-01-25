
(function() {
  var customProfiles, i, module, shortcutKeys, _i,
    __hasProp = {}.hasOwnProperty;

  module = angular.module('omegaPopup', ['omegaTarget', 'omegaDecoration', 'ui.bootstrap', 'ui.validate']);

  module.filter('tr', function(omegaTarget) {
    return omegaTarget.getMessage;
  });

  module.filter('dispName', function(omegaTarget) {
    return function(name) {
      if (typeof name === 'object') {
        name = name.name;
      }
      return omegaTarget.getMessage('profile_' + name) || name;
    };
  });

  shortcutKeys = {
    38: function(activeIndex, items) {
      var i, _ref;
      i = activeIndex - 1;
      if (i >= 0) {
        return (_ref = items.eq(i)[0]) != null ? _ref.focus() : void 0;
      }
    },
    40: function(activeIndex, items) {
      var _ref;
      return (_ref = items.eq(activeIndex + 1)[0]) != null ? _ref.focus() : void 0;
    },
    48: '+direct',
    83: '+system',
    191: 'help',
    63: 'help',
    69: 'external',
    65: 'addRule',
    43: 'addRule',
    61: 'addRule',
    84: 'tempRule',
    79: 'option',
    73: 'issue',
    76: 'log'
  };

  for (i = _i = 1; _i <= 9; i = ++_i) {
    shortcutKeys[48 + i] = i;
  }

  customProfiles = (function() {
    var _customProfiles;
    _customProfiles = null;
    return function() {
      return _customProfiles != null ? _customProfiles : _customProfiles = jQuery('.custom-profile:not(.ng-hide) > a');
    };
  })();

  jQuery(document).on('keydown', function(e) {
    var handler, items, key, keys, shortcut, showHelp, _ref, _ref1;
    handler = shortcutKeys[e.keyCode];
    if (!handler) {
      return;
    }
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      return;
    }
    switch (typeof handler) {
      case 'string':
        switch (handler) {
          case 'help':
            showHelp = function(element, key) {
              var span;
              if (typeof element === 'string') {
                element = jQuery("a[data-shortcut='" + element + "']");
              }
              span = jQuery('.shortcut-help', element);
              if (span.length === 0) {
                span = jQuery('<span/>').addClass('shortcut-help');
              }
              span.text(key);
              return element.find('.glyphicon').after(span);
            };
            keys = {
              '+direct': '0',
              '+system': 'S',
              'external': 'E',
              'addRule': 'A',
              'tempRule': 'T',
              'option': 'O',
              'issue': 'I',
              'log': 'L'
            };
            for (shortcut in keys) {
              key = keys[shortcut];
              showHelp(shortcut, key);
            }
            customProfiles().each(function(i, el) {
              if (i <= 8) {
                return showHelp(jQuery(el), i + 1);
              }
            });
            break;
          default:
            if ((_ref = jQuery("a[data-shortcut='" + handler + "']")[0]) != null) {
              _ref.click();
            }
        }
        break;
      case 'number':
        if ((_ref1 = customProfiles().eq(handler - 1)) != null) {
          _ref1.click();
        }
        break;
      case 'function':
        items = jQuery('.popup-menu-nav > li:not(.ng-hide) > a');
        i = items.index(jQuery(e.target).closest('a'));
        if (i === -1) {
          i = items.index(jQuery('.popup-menu-nav > li.active > a'));
        }
        handler(i, items);
    }
    return false;
  });

  module.controller('PopupCtrl', function($scope, $window, $q, omegaTarget, profileIcons, profileOrder, dispNameFilter, getVirtualTarget) {
    var refresh, refreshOnProfileChange;
    $scope.closePopup = function() {
      return $window.close();
    };
    $scope.openManage = function() {
      omegaTarget.openManage();
      return $window.close();
    };

    refreshOnProfileChange = false;
    refresh = function() {
      if (refreshOnProfileChange) {
        return omegaTarget.refreshActivePage().then(function() {
          return $window.close();
        });
      } else {
        return $window.close();
      }
    };
    $scope.profileIcons = profileIcons;
    $scope.dispNameFilter = dispNameFilter;
    $scope.isActive = function(profileName) {
      if ($scope.isSystemProfile) {
        return profileName === 'system';
      } else {
        return $scope.currentProfileName === profileName;
      }
    };

    $scope.isEffective = function(profileName) {
      return $scope.isSystemProfile && $scope.currentProfileName === profileName;
    };

    $scope.getIcon = function(profile, normal) {
      if (!profile) {
        return;
      }
      if (!normal && $scope.isEffective(profile.name)) {
        return 'glyphicon-ok';
      } else {
        return void 0;
      }
    };
    $scope.getProfileTitle = function(profile, normal) {
      var desc;
      desc = '';
      while (profile) {
        desc = profile.desc;
        profile = getVirtualTarget(profile, $scope.availableProfiles);
      }
      return desc || (profile != null ? profile.name : void 0) || '';
    };
    $scope.openOptions = function(hash) {
      return omegaTarget.openOptions(hash).then(function() {
        return $window.close();
      });
    };
    $scope.openConditionHelp = function() {
      var pname;
      pname = encodeURIComponent($scope.currentProfileName);
      return $scope.openOptions("#/profile/" + pname + "?help=condition");
    };
    //应用代理
    $scope.applyProfile = function(profile) {
      common.set_chrome_storage({"last_selected_profile":profile.name},function(){})
      return omegaTarget.applyProfile(profile.name).then(function() {
        if (refreshOnProfileChange) {
          return omegaTarget.refreshActivePage();
        }
      }).then(function() {
        if (profile.profileType === 'SwitchProfile') {
          return omegaTarget.state('web.switchGuide').then(function(switchGuide) {
            if (switchGuide === 'showOnFirstUse') {
              return $scope.openOptions("#/profile/" + profile.name);
            }
          });
        }
      }).then(function() {
        return $window.close();
      });
    };
    $scope.tempRuleMenu = {
      open: false
    };
    $scope.nameExternal = {
      open: false
    };
    $("#btn_apply_random_node").click(function(){
      retry_node_list(true);
      window.setTimeout(function(){
        if (common.proxy_mode != common.proxy_mode_enum.ALL)
        {
          $("#btn_mode_all").click();
          window.setTimeout(function(){
            background = common.getBackground();
            background.applyRandomProfile();
            omegaTarget.refreshActivePage();
            location.reload();
          },500);
        }
        else
        {
          background = common.getBackground();
          background.applyRandomProfile();
          omegaTarget.refreshActivePage();
          location.reload();
        }
      },200);



    });
    $scope.addTempRule = function(domain, profileName) {
      $scope.tempRuleMenu.open = false;
      return omegaTarget.addTempRule(domain, profileName).then(function() {
        return refresh();
      });
    };
    $scope.setDefaultProfile = function(profileName, defaultProfileName) {
      return omegaTarget.setDefaultProfile(profileName, defaultProfileName).then(function() {
        return refresh();
      });
    };
    $scope.addCondition = function(condition, profileName) {
      return omegaTarget.addCondition(condition, profileName).then(function() {
        return refresh();
      });
    };
    $scope.validateProfileName = {
      conflict: '!$value || !availableProfiles["+" + $value]',
      hidden: '!$value || $value[0] != "_"'
    };
    $scope.saveExternal = function() {
      var name;
      $scope.nameExternal.open = false;
      name = $scope.externalProfile.name;
      if (name) {
        return omegaTarget.addProfile($scope.externalProfile).then(function() {
          return omegaTarget.applyProfile(name).then(function() {
            return refresh();
          });
        });
      }
    };

    omegaTarget.state(['availableProfiles', 'currentProfileName', 'isSystemProfile', 'validResultProfiles', 'refreshOnProfileChange', 'externalProfile', 'proxyNotControllable']).then(function(_arg) {
      var availableProfiles, charCodeUnderscore, currentProfileName, externalProfile, isSystemProfile, key, profile, profilesByNames, proxyNotControllable, refresh, validResultProfiles;
      availableProfiles = _arg[0], currentProfileName = _arg[1], isSystemProfile = _arg[2], validResultProfiles = _arg[3], refresh = _arg[4], externalProfile = _arg[5], proxyNotControllable = _arg[6];
      $scope.proxyNotControllable = proxyNotControllable;
      if (proxyNotControllable) {
        return;
      }


      $scope.availableProfiles = availableProfiles;
      $scope.currentProfile = availableProfiles['+' + currentProfileName];
      $scope.currentProfileName = currentProfileName;
      $scope.isSystemProfile = isSystemProfile;
      $scope.externalProfile = externalProfile;
      refreshOnProfileChange = refresh;
      charCodeUnderscore = '_'.charCodeAt(0);
      profilesByNames = function(names) {
        var name, profiles, shown, _j, _len;
        profiles = [];
        for (_j = 0, _len = names.length; _j < _len; _j++) {
          name = names[_j];
          shown = name.charCodeAt(0) !== charCodeUnderscore || name.charCodeAt(1) !== charCodeUnderscore;
          if (shown) {
            profiles.push(availableProfiles['+' + name]);
          }
        }
        return profiles;
      };
      $scope.validResultProfiles = profilesByNames(validResultProfiles);
      $scope.builtinProfiles = [];
      $scope.customProfiles = [];

     // //console.log(currentProfileName);

      window.setTimeout(function(){
        if (common.profile_list !==null)
        {
          for (key in availableProfiles) {
            availableProfiles[key].region_name =  common.profile_list[key].region_name;
            availableProfiles[key].region_flag =  common.profile_list[key].region_flag;
            availableProfiles[key].sort_id =  common.profile_list[key].sort_id;
            availableProfiles[key].favourite =  common.profile_list[key].favourite;
            availableProfiles[key].online =  common.profile_list[key].online;
            availableProfiles[key].max_online =  common.profile_list[key].max_online;
            if (isNaN(availableProfiles[key].online))
            {
              availableProfiles[key].online = 100;
            }
          }
          $("a.ng-scope").each(function(index,element){
            var link = $(element).find(".ng-binding");
            var a = link.text();
            var profile = availableProfiles["+" + a.replace(/(^\s*)|(\s*$)/g, "")];
            var region_flag = profile.region_flag;
            var online = parseInt(profile.online);
           if(profile.max_online == undefined || profile.max_online == 0 || profile.max_online =="" || isNaN(profile.max_online))
           {
             profile.max_online = 800;
           }
            var online_percent = parseFloat(online / profile.max_online * 100).toFixed(1);
              if (online_percent>=100)
              {
                  online_percent = 100;
              }
            var online_css = "progress-bar-success";

            if (online_percent>40)
            {
              online_css = "progress-bar-warning";
            }
            if (online_percent>70)
            {
              online_css = "progress-bar-danger";
            }
            var recommend_html = "";
            if(profile.favourite == 1)
            {
              recommend_html = "<div class='recommend'></div>";
            }
            var tmp2 = "";
            if (online_percent<=20)
            {
              tmp2="color:#999; text-shadow:0px 0px 0px;";
            }

            var percent_html = '<div style="width:60px; height:20px; position: absolute; margin-left: 150px; margin-top: -24px;">';
            percent_html += '    <div class="progress" pname="'+profile.name+'">';
            percent_html += '     <div class="progress-bar  '+online_css+' progress-bar-striped active" role="progressbar"  aria-valuenow="'+online_percent+'" aria-valuemin="0" aria-valuemax="100" style="font-size:8px;padding-left:10px; text-shadow: 0px 0px 0px ;text-shadow:0px 0px 1px #000; color:#fff;'+tmp2+'; width: '+online_percent+'%">';
            percent_html += '     ' + online_percent+'% </div>';
            percent_html += '     </div>';
            percent_html += '     </div>';

            $(element).attr("sort_id",profile.sort_id);
            var icon =  $(element).find(".glyphicon");
            icon.removeClass("glyphicon");
            icon.removeClass("glyphicon-file");
           // link.css("color",profile.color);
            icon.html('<img src="img/flag_'+region_flag+'.png" /> ' + percent_html + recommend_html);

          });

          var timer2 = window.setTimeout(function(){
            var current_profile_name = common.get_current_profile_name();
            $("#now_node_selected").text(current_profile_name);
            $("#now_node_selected").parent().find(".glyphicon-signal").show();
            $("a.ng-scope").each(function(index,element) {
              var info = JSON.parse($(element).parent().attr("t"));
              if(info[0].name == current_profile_name)
              {
                var src =$(element).find("img").attr("src");
                $("#now_node_selected").html('<img src="'+src+'"> ' + current_profile_name);
                $("#now_node_selected").parent().find(".glyphicon-signal").hide();
              }
            });
          },100);

            var list = [];
          $(".custom-profile a.ng-scope").each(function(index,element){
              var sort_id = $(element).attr("sort_id");
              list[index] = {};
              list[index].sort_id = sort_id;
              list[index].index_id = index;
          });
            for (var i in list)
            {
                for (var j in list)
                {
                    if (list[j].sort_id<list[i].sort_id)
                    {
                        var tmp;
                        tmp = list[i];
                        list[i] = list[j];
                        list[j] = tmp;
                    }
                }
            }
            var obj_list = [];
            for (var i in list)
            {
                obj_list[i] =  $(".custom-profile a.ng-scope:eq("+list[i].index_id+")").parent();
            }
            for (var i in obj_list)
            {
                 $("#custom_profile_after").before(obj_list[i]);
            }

        }
      },300);

      delete  availableProfiles['+system'];
      delete  availableProfiles['+__ruleListOf_自动切换'];
      delete  availableProfiles['+direct'];
      delete  availableProfiles['+auto switch'];
      delete  availableProfiles['+proxy'];
      delete  availableProfiles['+自动切换'];

      for (key in availableProfiles) {

        if (!__hasProp.call(availableProfiles, key)) continue;
        profile = availableProfiles[key];
        if (profile.builtin) {
          $scope.builtinProfiles.push(profile);
        } else if (profile.name.charCodeAt(0) !== charCodeUnderscore) {
          $scope.customProfiles.push(profile);
        }

        if (profile.validResultProfiles) {
          profile.validResultProfiles = profilesByNames(profile.validResultProfiles);
        }
      }
      return $scope.customProfiles.sort(profileOrder);
    });
    return omegaTarget.getActivePageInfo().then(function(info) {
      if (info) {
        $scope.currentTempRuleProfile = info.tempRuleProfileName;
        return $scope.currentDomain = info.domain;
      } else {
        return $q.reject();
      }
    }).then(function() {
      return omegaTarget.state('currentProfileCanAddRule');
    }).then(function(value) {
      var conditionSuggestion, currentDomain, currentDomainEscaped, _ref;
      $scope.currentProfileCanAddRule = value;
      if ($scope.currentProfileCanAddRule) {
        currentDomain = $scope.currentDomain;
        currentDomainEscaped = currentDomain.replace('.', '\\.');
        conditionSuggestion = {
          'HostWildcardCondition': '*.' + currentDomain,
          'HostRegexCondition': '(^|\\.)' + currentDomainEscaped + '$',
          'UrlWildcardCondition': '*://*.' + currentDomain + '/*',
          'UrlRegexCondition': '://([^/.]+\\.)*' + currentDomainEscaped + '/',
          'KeywordCondition': currentDomain
        };
        $scope.rule = {
          condition: {
            conditionType: 'HostWildcardCondition',
            pattern: conditionSuggestion['HostWildcardCondition']
          },
          profileName: (_ref = $scope.currentTempRuleProfile) != null ? _ref : 'direct'
        };
        return $scope.$watch('rule.condition.conditionType', function(type) {
          return $scope.rule.condition.pattern = conditionSuggestion[type];
        });
      }
    });
  });

  var init_popup_ui = function(){
    if(common.user_data!=undefined)
    {
      $("#svpn_username").text(common.user_data.username);
      var tmp = "";
      if (common.expries_days<=0)
      {
        tmp =common.expries_days = "已过期";
      }
      else
      {
        tmp = common.expries_days + "天";
      }
      $("#svpn_days").text(tmp);
    }

  };

  var timer_var_ready = window.setInterval(function(){
    if (common.var_ready == true)
    {
      init_popup_ui();
      window.clearInterval(timer_var_ready);
    }
  },100);

  var background = common.getBackground();
  common.get_chrome_storage("charge_promotion_tip",function(e){
    $("#charge_promotion_tip").html(e);
  });
  common.proxy_mode =  background.get_proxy_mode();
  //console.log(common.proxy_mode);
  if(common.proxy_mode == common.proxy_mode_enum.ALL)
  {
    $(".btn_mode").removeClass("btn-success");
    $(".btn_mode").addClass("btn-default");
    $("#btn_mode_all").removeClass("btn-default");
    $("#btn_mode_all").addClass("btn-success");
  }
  if(common.proxy_mode == common.proxy_mode_enum.REQUIRE)
  {
    $(".btn_mode").removeClass("btn-success");
    $(".btn_mode").addClass("btn-default");
    $("#btn_mode_require").removeClass("btn-default");
    $("#btn_mode_require").addClass("btn-success");
  }
  if(common.proxy_mode == common.proxy_mode_enum.DIRECT)
  {
    $(".btn_mode").removeClass("btn-success");
    $(".btn_mode").addClass("btn-default");
    $("#btn_mode_close").removeClass("btn-default");
    $("#btn_mode_close").addClass("btn-success");
    $(".node_list_tip").hide();
    $("#btn_select_node").hide();
  }

  var check_login_status = function(){
    var status = background.get_login_status();
    if (status!=true  )
    {
      common.openOptions("login.html",true);
      window.close();
    }
  };
  check_login_status();
  window.setInterval(function(){
    check_login_status();
  },500);


}).call(this);
var background = common.getBackground();
$("#btn_mode_all").mouseenter(function(e){
  $(".proxy_mode_tip").hide();
  $("#proxy_tip_all").show();
});
$("#btn_mode_require").mouseenter(function(e){
  $(".proxy_mode_tip").hide();
  $("#proxy_tip_require").show();
});
$("#btn_mode_close").mouseenter(function(e){
  $(".proxy_mode_tip").hide();
  $("#proxy_tip_close").show();
});
$(".proxy_mode_select").mouseleave(function(e){
  $(".proxy_mode_tip").hide();
});

$("#btn_mode_all").click(function(e){
  common.proxy_mode = common.proxy_mode_enum.ALL;
  $(".btn_mode").removeClass("btn-success");
  $(".btn_mode").addClass("btn-default");
  $("#btn_mode_all").removeClass("btn-default");
  $("#btn_mode_all").addClass("btn-success");
  $("#now_domain").hide();
  $("#now_domain_liner").hide();
  $(".node_list_tip").show();
  $("#btn_select_node").show();
  console.log(common.currentProfileName);
  if(common.currentProfileName == "[直接连接]")
  {
    var background = common.getBackground();
    background.applyRandomProfile();

    window.setTimeout(function(){
      common.set_chrome_storage({"proxy_mode":common.proxy_mode},function(){
        background.refresh();
        window.setTimeout(function(){
          location.reload();
        },500);
      });
    },100);
  }
  else
  {
    common.set_chrome_storage({"proxy_mode":common.proxy_mode},function(){background.refresh();});
  }

});
$("#btn_mode_close").click(function(e){
  $("#now_domain").hide();
  $("#now_domain_liner").hide();
  common.proxy_mode = common.proxy_mode_enum.DIRECT;
  $(".btn_mode").removeClass("btn-success");
  $(".btn_mode").addClass("btn-default");
  $("#btn_mode_close").removeClass("btn-default");
  $("#btn_mode_close").addClass("btn-success");
  $(".node_list_tip").hide();
  $("#btn_select_node").hide();
  common.set_chrome_storage({"proxy_mode":common.proxy_mode},function(){background.refresh();});
});
$("#btn_mode_require").click(function(e){
  $("#now_domain").show();
  $("#now_domain_liner").show();
  common.proxy_mode = common.proxy_mode_enum.REQUIRE;
  $(".btn_mode").removeClass("btn-success");
  $(".btn_mode").addClass("btn-default");
  $("#btn_mode_require").removeClass("btn-default");
  $("#btn_mode_require").addClass("btn-success");
  get_current_domain();
  $(".node_list_tip").show();
  $("#btn_select_node").show();
  common.set_chrome_storage({"proxy_mode":common.proxy_mode},function(){background.refresh();});

});

function get_current_domain() {
  chrome.windows.getCurrent(function (w) {
    chrome.tabs.getSelected(w.id,
        function (response) {
          var durl = /(.*?):\/\/([^\/]+)\//i;
          var tmp = response.url.match(durl);
          var protocol = tmp[1];
          var tmp2 = tmp[2].split(".");
          var domain = "";
          if (tmp2.length >= 2) {
            var a = tmp2[tmp2.length - 2];
            var b = tmp2[tmp2.length - 1];
            var c = tmp2[tmp2.length - 3];
            domain = a + "." + b;
            if (a == "com" || a == "net" || a == "gov" || a == "org" || a == "edu") {
              domain = c + "." + a + "." + b;
            }
          }
          else {
            domain = tmp2[tmp2.length - 1];
            protocol = "local";
          }
          if (tmp2.length == 4) {
            var is_ok = 0;
            var regex = /[0-9]{1,3}/;
            for (var i in tmp2) {
              if (regex.test(tmp2[i])) {
                is_ok++;
              }
            }
            domain = tmp2[0] + "." + tmp2[1] + "." + tmp2[2] + "." + tmp2[3];
          }

          $("#domain_name").text(domain);
          $(".show_domain_name").text(domain);
          if (common.proxy_mode == common.proxy_mode_enum.REQUIRE && (protocol == "http" || protocol == "https")) {

            $("#now_domain").show();
            $("#now_domain_liner").show();
            $("#domain_add_tip").hide();
            $("#domain_add_btn").show();
            $("#profile_list").css("height", "200px");
            for (var i in common.block_list) {
              if (common.block_list[i] == domain) {
                $("#domain_add_tip").show();
                $("#domain_add_btn").hide();
                break;
              }
            }
          }
          else {
            $("#now_domain").hide();
            $("#now_domain_liner").hide();
          }

        });
  });
}
get_current_domain();
$("#search_domain_text_input").keyup(function(){
  var text = $(this).val();
  if (text=="")
  {
    init_block_list();
    return;
  }
  $("#rules_list li").each(function(index,element){
    var domain = $(element).find("a").attr("title");
    if (domain.indexOf(text) != -1)
    {
      $(element).show();
      return;
    }
    $(element).hide();
  });
});
$("#link_exit").click(function(e){
  //退出登录
  var background = common.getBackground();
  common.set_chrome_storage({password:""},function(){
    background.refresh();
    window.close();
  });
});

$("#node_list_select").click(function(e){
  var popmenu = $(".popup-menu-nav");
  if (popmenu.css("display") == "none")
  {
    popmenu.show();
  }
  else
  {
    popmenu.hide();
  }

});
$("#btn_add_domain").click(function(){
  var domain_name = $("#domain_name").text();
  if (domain_name!="" && domain_name!=undefined && domain_name.length>=3)
  {
    common.get_chrome_storage("block_list",function(e){
      var block_list = e;
      block_list[block_list.length] = domain_name;
      common.block_list = block_list;
        $("#domain_add_tip").show();
        $("#domain_add_btn").hide();
        var background = common.getBackground();
        background.save_block_list(block_list);
        background.refresh();
    });
  }
});
$("#btn_remove_domain").click(function(){
  var domain_name = $("#domain_name").text();
  if (domain_name!="" && domain_name!=undefined && domain_name.length>=3)
  {
    common.get_chrome_storage("block_list",function(e){
      var block_list = e;
      var new_block_list = [];
      for (var i in block_list)
      {
        if (block_list[i] == domain_name)
        {
          continue;
        }
        new_block_list[new_block_list.length] = block_list[i];
      }
      common.block_list = new_block_list;
      $("#domain_add_tip").hide();
      $("#domain_add_btn").show();
      var background = common.getBackground();
      background.save_block_list(new_block_list);
      background.refresh();
    });
  }
});
$("#btn_recharge").click(function(){
  common.openOptions("charge.html");
});

$("#disable_other").click(function(){
  disable_conflict();

});

$("#not_disable_other").click(function(){
  alert("不禁用其他插件可能会无法使用超级VPN！");
  $("#controllable").show();
  $("#not_controllable").hide();
});

$("#btn_select_node").click(function(){
  $("#main_control").hide();
  $("#profile_list").show();
  $("#open_options_btn").hide();
  $("#bottom_content").hide();
    $("#goback_btn").show();
});
$("#profile_list_btn").click(function(){
  $("#main_control").show();
  $("#profile_list").hide();
  $("#bottom_content").hide();
    $("#goback_btn").show();
});



$("#btn_select_mode").click(function(){
  $("#main_control").hide();
  $("#rules_list").show();
  $("#open_options_btn").hide();
  $("#bottom_content").hide();
    $("#goback_btn").show();
  init_block_list();
});
$("#goback_btn").click(function(){
  $("#main_control").show();
  $("#rules_list").hide();
  $("#profile_list").hide();
  $("#open_options_btn").show();
    $("#goback_btn").hide();
  $("#bottom_content").show();


});
function del_block_domain(domain_name)
{
  if (domain_name!="" && domain_name!=undefined && domain_name.length>=3)
  {
    common.get_chrome_storage("block_list",function(e){
      var block_list = e;
      var new_block_list = [];
      for (var i in block_list)
      {
        if (block_list[i] == domain_name)
        {
          continue;
        }
        new_block_list[new_block_list.length] = block_list[i];
      }
      common.block_list = new_block_list;

        var domain_name2 = $("#domain_name").text();
        if(domain_name2 == domain_name)
        {
          $("#domain_add_tip").hide();
          $("#domain_add_btn").show();
        }

        var background = common.getBackground();
        background.save_block_list(new_block_list);
        init_block_list();
        background.refresh();

    });
  }

}
function init_block_list()
{
  common.get_chrome_storage("block_list",function(e){
    var block_list = e;
    var obj = $("#rules_list ul");
    obj.html("");
    for (var i in block_list)
    {
      var tmp = '<li class="profile rules_list_domain"><a href="#" role="button" title="[domain_name]" style="padding-right: 0px; margin-bottom: 5px; line-height: 30px; color: #999" ><span>[domain_name]</span><button class="btn btn-danger btn-sm btn-remove-block-domain" domain="[domain_name]" style="float: right; height: 30px;padding-top: 0px; padding-bottom: 0px; margin: 0px; font-size: 12px; padding-left: 5px; padding-right:5px; " >删除</button></a></li>';
      tmp = tmp.replace(/\[domain_name\]/g,block_list[i]);
      obj.append(tmp);
    }
    $(".btn-remove-block-domain").click(function(){
      del_block_domain($(this).attr("domain"));
    });
  });
}
init_block_list();


function check_conflict()
{
  chrome.management.getAll(function(e) {
    var list = [];
    var my_id = chrome.extension.getURL("/").replace("chrome-extension://", "").replace("/", "");
    var html = "";
    for(var i in e)
    {
      var id = e[i].id;
      var name = e[i].name;
      if (id==my_id)
      {
        continue;
      }
      for (var j in e[i].permissions)
      {
        if(e[i].permissions[j] == "proxy" && e[i].enabled == true)
        {
          html += '<li><img width="16" src="'+e[i].icons[0].url+'"> '+ name+'</li>';
          $("#controllable").hide();
          $("#not_controllable").show();
          break;
        }
      }
    }
    $("#conflict_list").html(html);
  });
  }

function disable_conflict()
{
  chrome.management.getAll(function(e) {
    var list = [];
    var my_id = chrome.extension.getURL("/").replace("chrome-extension://", "").replace("/", "");
    for(var i in e)
    {
      var id = e[i].id;
      var name = e[i].name;
      if (id==my_id)
      {
        continue;
      }
      for (var j in e[i].permissions)
      {
        if(e[i].permissions[j] == "proxy")
        {
          chrome.management.setEnabled(id,false,function(e){
          });
          break;
        }
      }
    }
    background.refresh();
    window.close();
  });

}






    function intro_slide_to(id)
    {
        var left = 0-(id-1) * 692;
        //console.log(left);
        $("#intro_screen_content").animate({marginLeft:left},500);
    }
   $("#intro_btn_go_step1").click(function(){
       intro_slide_to(1);
   });
    $("#intro_btn_go_step2").click(function(){
        intro_slide_to(2);
    });
    $("#intro_btn_go_step3").click(function(){
        intro_slide_to(3);
    });

    $(".intro_btn_finsh").click(function()
    {


        $("#first_run").animate({width:240,opacity:0},500,"",function(){
            $("#not_controllable").hide();
            $("#controllable").show();
            common.set_chrome_storage({"INTRO_COMPLETED":true},function(){
                $("#first_run").hide();
                check_conflict();
            });
        });



    });



function check_first_run()
{
    common.get_chrome_storage("INTRO_COMPLETED",function(item){
        if (item == true)
        {
            $("#first_run").hide();
            check_conflict();
            return;
        }
        else
        {
            $("#first_run").show();
            $("#not_controllable").hide();
            $("#controllable").hide();
        }
    });
}
check_first_run();

/*

common.set_chrome_storage({"INTRO_COMPLETED":false},function(){
    check_conflict();
});

*/

$("#clear_node_list").click(function(){
  common.profile_list = null;
  common.get_all_chrome_storage(function(obj){
    var now_list = [];
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
        console.log("删除了项目：" + i);
        common.remove_chrome_storage(i);

    }
  });
});
$("#retry_node_list").click(function(){
  api.get_node_list(function(e){

    if (e.success != true)
    {
      alert("加载列表失败，请重试！错误信息：" + JSON.stringify(e));
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
      window.setTimeout(function(){
        var background = common.getBackground();
        background.refresh();
      },200);
      window.setTimeout(function(){
        var background = common.getBackground();
       // background.applyRandomProfile();
        location.reload();
      },400);
    });
    });
});
common.get_chrome_storage("NEW_VERSION",function(e){
    if (e!=null && e!= undefined && e.URL != "" && e.URL != undefined)
    {
        $("#update_tip a").attr("href", e.URL);
        $("#update_tip").show();
    }
});
function retry_node_list(click)
{
  common.get_all_chrome_storage(function(obj){
    //retry_node_list
    var found = false;
    for (var j in obj)
    {
      if (j.substr(0,1) == "+")
      {
        found = true;
        break;
      }
    }
    if (found == false)
    {
      $("#retry_node_list").show();
      if (click==true)
      {
        $("#retry_node_list").click();
      }
    }
  });
}

retry_node_list(false);


