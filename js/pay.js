/**
 * Created by Administrator on 2015/10/21.
 */
    $(document).ready(function () {
        $("#select_plans").change(function () {
            $("#alipay_pay_price").val($("#select_plans").find("option:selected").attr("price"));
        });
        $("#select_payment").change(function () {
            if ($("#select_payment").find("option:selected").val() == "alipay") {
                $("#div_alipay").show();
                $("#div_paycard").hide();
                $("#div_alipay_tip").show();
                $("#div_paycard_tip").hide();
            }
            if ($("#select_payment").find("option:selected").val() == "paycard") {
                $("#div_alipay").hide();
                $("#div_paycard").show();
                $("#div_alipay_tip").hide();
                $("#div_paycard_tip").show();
            }
        });
        $("#submit").click(function () {
            var layer = $("#layer");
            var username = $("#username").val();
            if (username == "") {
                layer.text("用户名不能为空!");
                return false;
            }
            var usernamerepeat = $("#username_repeat").val();
            if (username != usernamerepeat) {
                layer.text("两次输入的帐号不一致!");
                return false;
            }
            $("#pay_status_panel").show();
            $("#pay_status_panel_bg").show();
            window.open('http://pay.zhuanyungongsi.com/agent/pay.aspx?plans=' + $("#select_plans").find("option:selected").attr("value") + '&username=' + username + '&agent=chaoji2&domain=' + "www.chaojivpn.com");
            return false;
        });
        $(".nav" + "1").click();

        $('#popreg').on('click', function () {
            $.layer({
                type: 2,
                shade: [0.5, '#000'],
                fix: false,
                title: '注册用户',
                maxmin: true,
                iframe: { src: '/popup_register.aspx' },
                area: ['1000px', '600px'],
                close: function (index) {
                    //alert(index);
                    //layer.msg('您获得了子窗口标记：' + layer.getChildFrame('#name', index).val(), 3, 1);
                    window.location.reload();
                }
            });
        });
    });
$(function () {
    $("#btn_pay_success").click(function(){
        common.openOptions("options.html");
        window.setTimeout(function(){
            window.close();
        },200)
    });
    $("#btn_pay_failed").click(function(){
        alert("请重新尝试付款！如果支付遇到问题，请点击页面底部的客服QQ联系我们解决问题！");
        window.location.reload();
    });

    $(".nav ul li a").hover(function () {
        $(this).find("i").show();
    }, function () {
        $(this).find("i").hide();
    });

    $(".td_box .td_list_a").hide();

    $(".td_box span").hover(function () {
        $(this).next(".td_list_a").show();
    }, function () {
        $(this).next(".td_list_a").hide();
    });

    $(".td_box").hover(function () {
        $(this).find("b").css({
            "border-top": " 5px solid #191b1c",
            "border-bottom": " 5px solid #fff",
            top: "3px"
        });
    }, function () {
        $(this).find("b").css({

            "border-bottom": " 5px solid #191b1c",
            "border-top": " 5px solid #fff",
            top: "7px"
        });
    });

    $(".td_box .td_list_a").hover(function () {
        $(this).show();
    }, function () {
        $(this).hide();

    });
    var init_options_ui = function(){
        if(common.user_data!=undefined)
        {
            $(".text_username").val(common.user_data.username);
        }
    };
    var timer_var_ready = window.setInterval(function(){
        if (common.var_ready == true)
        {
            init_options_ui();
            window.clearInterval(timer_var_ready);
            return;
        }
    },100);
});









