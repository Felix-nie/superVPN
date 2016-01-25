/**
 * Created by Administrator on 2015/10/16.
 */
(function(){
    var check_login_status = function(){
        var background = common.getBackground();
        var status = background.get_login_status();
        if (status!=true  )
        {
            common.openOptions("login.html",true);
            window.close();
        }
    };
    check_login_status();
    window.setInterval(function(){
        //console.log("check_login_status");
        check_login_status();
    },500);

    var init_options_ui = function(){
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
            init_options_ui();
            window.clearInterval(timer_var_ready);
        }
    },100);

    var init_block_list = function(){
        var background = common.getBackground();
        var block_list = background.get_block_list();
        var html ="";
        for (var i in block_list)
        {
            html += '<li><button  href=""  class="btn btn-default" bid="'+i+'"><span><i class="glyphicon glyphicon-remove" style="display: none"></i></span>'+block_list[i]+'</button></li>';
        }
        $("#block_list_container").html(html);

        $("#block_list_container li").hover(function(){
            $(this).find(".glyphicon").show();
        });
        $("#block_list_container li").mouseleave(function(){
            $(this).find(".glyphicon").hide();
        });

        $("#block_list_container li button").click(function(){
            var bid = $(this).attr("bid");
            if (!confirm("是否要将" + $(this).text() + "移出白名单？"))
            {
                return;
            }
            var new_block_list = [];
            for (var i in block_list)
            {
                if (i==bid)
                {
                    continue;
                }
                new_block_list[new_block_list.length] = block_list[i];
            }
            common.block_list = new_block_list;
            background.set_block_list(new_block_list);

            common.set_chrome_storage({"block_list":new_block_list},function(){
                $("#block_list_container").html("");
                init_block_list();
                background.refresh();
            });
        });
    };
    init_block_list();
    var add_domain_handler = function(e){
        var background = common.getBackground();
        var block_list = background.get_block_list();
        var text = $("#add_domain_text");
        if(e.keyCode != undefined && e.keyCode != 13)
        {
            return;
        }

        var str = text.val();
        var reg = /^[A-Za-z0-9_]+(\.[A-Za-z0-9_]+)+$/;
        var c = reg.test(str);
        if (!c)
        {
            alert('您输入的可能不是域名，请重试！');
            return;
        }
        var domain = text.val();
        for (var i in block_list)
        {
            if (block_list[i] == domain)
            {
                alert("域名已存在！");
                text.val("");
                return;
            }
        }
        block_list[block_list.length] = domain;
        common.block_list = block_list;
        background.set_block_list(block_list);
        common.set_chrome_storage({"block_list":block_list},function(){
            text.val("");
            $("#block_list_container").html("");
            init_block_list();
        });

    };
    $("#btn_add_domain").click(add_domain_handler);
    $("#add_domain_text").keyup(add_domain_handler);
    $("#btn_charge").click(function(){
        common.openOptions("charge.html",true);
    });
    $("#btn_rules_list").click(function(){
        $(".nav-menu a").removeClass("selected");
        $(this).addClass("selected");
        $("#rules_manage").show();
        $("#faq_list").hide();
        $("#fresh_list").hide();
    });
    $("#btn_faq_list").click(function(){
        $(".nav-menu a").removeClass("selected");
        $(this).addClass("selected");
        $("#rules_manage").hide();
        $("#faq_list").show();
        $("#fresh_list").hide();
    });
    $("#btn_fresh").click(function(){
        $(".nav-menu a").removeClass("selected");
        $(this).addClass("selected");
        $("#rules_manage").hide();
        $("#faq_list").hide();
        $("#fresh_list").show();
    });

    $("#faq_list .faqList li a").click(function(){
        var obj = $(this).parent();
        var id = obj.attr("ref-data");
        $(".ansCon").hide();
        $(".faqList").hide();
        $("#qnum-" + id).show();
    });
    $(".ansCon button").click(function(){
        $(".ansCon").hide();
        $(".faqList").show();
    });
    var regex = /.*#\/faq$/;
    if (regex.test(location.href))
    {
        $("#btn_faq_list").click();
    }
    $("#version_show").text(common.version_text);


}).call(this);

