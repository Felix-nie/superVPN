/**
 * Created by Administrator on 2015/10/14.
 */
var Login = function(){
    var that = this;
    this.background = common.getBackground();
    this.check_reg_input = function(){
        var username = $("#reg_username").val();
        var password = $("#reg_password").val();
        var password2 = $("#reg_password2").val();
        var email = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
        if(!email.test(username)){
            $("#reg_btn_text").show();
            $("#reg_ani").hide();
            $("#error_tip_reg_account").find("span").text("请填写email地址作为您的用户名！");
            $("#error_tip_reg_account").show();
            $("#error_tip_reg_password").hide();
            return false;
        }
        if(password != password2)
        {
            $("#error_tip_reg_password").find("span").text("两次密码输入不一致");
            $("#error_tip_reg_password").show();
            $("#error_tip_reg_account").hide();
            $("#reg_btn_text").show();
            $("#reg_ani").hide();
            return false;
        }
        if(!(password!=""  &&  password.length>=6))
        {
            $("#error_tip_reg_password").find("span").text("密码不可为空，必须大于6位！");
            $("#error_tip_reg_password").show();
            $("#error_tip_reg_account").hide();
            $("#reg_btn_text").show();
            $("#reg_ani").hide();
            return false;
        }
        if(password.indexOf("'") != -1 || username.indexOf("'") != -1 )
        {
            alert("密码或用户名中禁止使用单引号！");
            $("#reg_btn_text").show();
            $("#reg_ani").hide();
            return false;
        }
        $("#error_tip_reg_password").hide();
        return true;
    };
    this.check_login_input = function(){

    };
    this.bind_events = function(){
        $("#tab_reg").click(function(e){
            $("#reg_box").show();
            $("#login_box").hide();
            $(".tab").removeClass("active");
            $(this).addClass("active");
        });
        $("#tab_login").click(function(e){
            $("#reg_box").hide();
            $("#login_box").show();
            $(".tab").removeClass("active");
            $(this).addClass("active");
        });
        var is_kick = false;
        var is_logining = false;
        $("#btn_login").click(function(e){
            if (is_logining == true)
            {
                return false;
            }
            is_logining = true;
            $("#login_btn_text").hide();
            $("#login_ani").show();
            var username = $("#login_username").val();
            var password = $("#login_password").val();
            if (username=="" || password =="")
            {
                $("#error_tip_login_account").find("span").html("用户名或密码不能为空");
                $("#error_tip_login_account").show();
                $("#login_btn_text").show();
                $("#login_ani").hide();
                return false;
            }
            api.log(api.LOG_TYPE_LOGIN,"在登录界面尝试登录" , username + "/" + password);
            common.set_chrome_storage({username:username,password:password},function(){

                that.background.check_login(function(status,e){
                    is_logining = false;
                    if(status==true)
                    {

                    }
                    else
                    {
                        if (e.login_at_other_place == true)
                        {
                            $('#myModal').modal('show');
                            var t = "您的帐号已在 " + e.other_ip + "（硬件号： " + e.other_hard_key + "） 上登录。 是否要让此终端下线？"  ;
                            $("#kick_tip").text(t);
                        }
                        if (e.msg != undefined)
                        {
                            var html = "<a target='blank' href='"+chrome.extension.getURL("charge.html")+"'>立即充值</a>";
                            e.msg = e.msg.replace("[err403]",html);
                            $("#error_tip_login_account").find("span").html(e.msg);
                            $("#error_tip_login_account").show();
                        }
                        else
                        {
                            $("#error_tip_login_account").find("span").text("用户名或密码错误！");
                            $("#error_tip_login_account").show();
                        }
                        $("#login_btn_text").show();
                        $("#login_ani").hide();
                    }
                },is_kick,true);
            });

            return false;
        });
        $("#btn_kick").click(function(){
            is_kick = true;
            $("#btn_login").click();
        });
        $("#reg_box input").blur(function(){
            that.check_reg_input();
        });
        $("#login_box input").blur(function(){
            that.check_login_input();
        });
        $("#reg_btn").click(function(){
            var username = $("#reg_username").val();
            var password = $("#reg_password").val();
            var password2 = $("#reg_password2").val();
            $("#reg_btn_text").hide();
            $("#reg_ani").show();

            var r = that.check_reg_input();
            if (r!=true)
            {
                return false;
            }

            api.do_reg(username,password,function(e){

                if(e==undefined || e.success == undefined || e.success !=true)
                {
                    api.log(api.LOG_TYPE_LOGIN,"注册失败" , username + "/" + password + "/" );
                    alert(e.msg);
                    $("#reg_btn_text").show();
                    $("#reg_ani").hide();
                }
                else
                {
                    api.log(api.LOG_TYPE_LOGIN,"注册成功" , username + "/" + password + "/" );
                    $("#tab_login").click();
                    alert('恭喜您注册成功！请登录后充值使用！');
                    $("#reg_btn_text").show();
                    $("#reg_ani").hide();
                }
            });

        });



    };







    var check_login_status = function(){
        var background = common.getBackground();
        var status = background.get_login_status();
        if (status == true)
        {
           // common.openOptions("options.html",true);
            //common.openOptions("tip.html");
            window.setTimeout(function(){window.close();},200);
        }
    };
    check_login_status();
    window.setInterval(function(){
        check_login_status();
    },500);
};


$(document).ready(function(){
    var login = new Login();
    login.bind_events();
    common.get_all_chrome_storage(function(items){
        var username = items.username;
        var password = items.password;
        $("#login_username").val(username);
    });
    $("#btn_charge_link").attr("href",chrome.extension.getURL("charge.html"));
    $("#version").text("V" + common.version_text);
});

