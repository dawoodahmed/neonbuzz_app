/*
*   app var
*/
// var base_url = 'http://casaestilo.in/neonbuzz_d/neonbuzz_admin/index.php/api';
// var image_url = 'http://casaestilo.in/neonbuzz_d/neonbuzz_admin/upload_image/profile_pic/';
var base_url = 'http://neonbuzz.co/neonbuzz_api/index.php/apid';
var image_url = 'http://neonbuzz.co/neonbuzz_api/upload_image/profile_pic/';
// var base_url = 'http://casaestilo.in/neonbuzz_d/neonbuzz_admin/index.php/api_v2';
// var image_url = 'http://casaestilo.in/neonbuzz_d/neonbuzz_admin/upload_image/profile_pic/';
var token = Lockr.get('token');
var user_data = {};
var email_regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
var phone_regex = /^\d{10}$/;
var image_from_device = '';

var time = '';

var new_comment_interval = null;
var comment_time = '';
var comment_type = '';
var comment_post_id = '';
var myComment = null;
var new_comment_time = null;

var new_chat_interval = null;
var chat_time = '';
var chat_type = '';
var chat_post_id = '';
var myChat = null;
var myChatMessagebar = null;
var new_chat_time = null;
var notification_interval = null;

// openFB.init('1709189259297910', '', window.localStorage);

var calendarDefault;

var days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
var months = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];


// init Framework7
var myApp = new Framework7({
    swipePanel: 'left',
    material: true,
    preloadPreviousPage: false,
    uniqueHistory: true,
    uniqueHistoryIgnoreGetParameters: true,
    modalTitle: 'NeonBuzz',
    imagesLazyLoadPlaceholder: 'img/lazyload.jpg',
    imagesLazyLoadThreshold: 50,

});

// $$(document).on('pageAfterAnimation', function(e) { if (e.detail.page.name == "index" || e.detail.page.name == "login" || e.detail.page.name == "before_register" || e.detail.page.name == "shopper_register" || e.detail.page.name == "business_register" || e.detail.page.name == "forgot_password") { myApp.allowPanelOpen = false; } else { myApp.allowPanelOpen = true; } });

var mainView = myApp.addView('.view-main', {});


var user_id = Lockr.get('token');
console.log('token :'+token);

if (user_id != undefined) {
    // $('#login').hide();
    // $('.login-btn').css("display", "none");
    // $('.ne_on').css("margin-top","71px");
    // $('#register').hide();
    $.ajax({
        url: base_url + '/get_user_data',
        type: 'POST',
        crossDomain: true,
        async: false,
        data: {
            user_id:user_id
        },
    })
    .done(function(res) {
        // console.log('res: ' + j2s(res));
        if (res.status=='success') {
            user_data = res.data;
            console.log('user_data: ' + j2s(user_data));

            if (!notification_interval) {
                load_notification_count();
                notification_interval = setInterval(function() {
                    load_notification_count();
                }, 5000);
            }

            if (user_data.user_type == "Business") {
                $("#buzzCreate").hide();
                mainView.router.load({
                    url: 'offers.html',
                    ignoreCache: false,
                    query: {
                        register: true
                    },
                });
            } else {
                $("#offerCreate").hide();
                mainView.router.load({
                    url: 'buzzs.html',
                    ignoreCache: false,
                    query: {
                        register: true
                    },
                });
            }
        } else {
            // 
        }
    }).fail(function(err) {
        myApp.alert('some error');
        console.log('error: ' + err);
    }).always();
} else {
    $('.ne_on').css("margin-top","2px");
    $('#login').show();
    $('#register').show();
}


myApp.onPageInit('index', function(page) {
    myApp.allowPanelOpen = false;
    clearInterval(new_comment_interval);
    clearInterval(new_chat_interval);

    if (page.query.isLogout) {
        $('.ne_on').css("margin-top","1%");
        $('#login').show();
        $('#register').show();
    }

    if (user_id == undefined) {
        $('.ne_on').css("margin-top","1%");
        $('#login').show();
        $('#register').show();
    }
});

myApp.onPageInit('login', function(page) {
    myApp.allowPanelOpen = false;
    clearInterval(new_comment_interval);
    clearInterval(new_chat_interval);
});

myApp.onPageInit('before_register', function(page) {
    myApp.allowPanelOpen = false;
    clearInterval(new_comment_interval);
    clearInterval(new_chat_interval);
});

myApp.onPageInit('buzzs', function(page) {
    
    myApp.allowPanelOpen = true;
    var user_id = page.query.id;
    // bottom_tabs();
    load_buzzs();
    load_buzz_filter_location('#filterLocation');
    load_buzz_filter_category('#filtercategory');
    clearInterval(new_chat_interval);
});

myApp.onPageInit('offers', function(page) {
    myApp.allowPanelOpen = true;
     var user_id = page.query.id;
    // bottom_tabs();
    load_offers();
    load_offer_filter_location('#offer_filterLocation');
    load_offer_filter_category('#offer_filtercategory');
    clearInterval(new_chat_interval);
});

myApp.onPageInit('chats', function(page) {
    myApp.allowPanelOpen = true;
    clearInterval(new_comment_interval);
    clearInterval(new_chat_interval);
    load_chats();
});

myApp.onPageInit('chat', function(page) {
    myApp.allowPanelOpen = true;
    clearInterval(new_comment_interval);
    clearInterval(new_chat_interval);
    var reciever_id = page.query.id;
    load_chat(reciever_id);
});

myApp.onPageInit('notifications', function(page) {
    myApp.allowPanelOpen = true;
    clearInterval(new_comment_interval);
    clearInterval(new_chat_interval);
    load_notification();
});

myApp.onPageInit('create_buzz', function(page) {
    myApp.allowPanelOpen = true;
    image_from_device = '';
    // bottom_tabs();
    // $('#create_buzz-tags').materialtags('refresh');
    // load_tag('#create_buzz-tag');
    load_location_all('#create_buzz-location');
    load_category('#create_buzz-categories', function(){});
    clearInterval(new_chat_interval);
});

myApp.onPageInit('create_offer', function(page) {
    myApp.allowPanelOpen = true;
    image_from_device = '';
    // bottom_tabs();
    $('#create_buzz-tags').materialtags('refresh');
    load_location_all('#create_buzz-location');
    load_category('#create_buzz-categories', function(){});
    clearInterval(new_chat_interval);
});


myApp.onPageInit('shopper_register', function(page) {
    myApp.allowPanelOpen = false;
    clearInterval(new_comment_interval);
    clearInterval(new_chat_interval);
    image_from_device = '';
    calendarDefault = myApp.calendar({
        input: '.calendar-default',
        maxDate: new Date(),
    });

    load_city('#shopper_register-city_select');

    $('#shopper_register-city_select').change(function(event) {
        var city_id = $(this).val();
        console.log('city_id: ' + city_id);
        load_location('#shopper_register-location_select', city_id, function(){});
    });

    var rightNow = new Date();
    console.log('rightNow: '+rightNow);
    var res = rightNow.toISOString().slice(0,10).replace(/-/g,"-");
    console.log('res: '+res);
    $('#shopper_register-dob').attr('max', res);
});

myApp.onPageInit('edit_profile_shopper', function(page) {
    myApp.allowPanelOpen = true;
    clearInterval(new_comment_interval);
    clearInterval(new_chat_interval);
    load_edit_profile_shopper();
});

myApp.onPageInit('business_register', function(page) {
    myApp.allowPanelOpen = false;
    clearInterval(new_comment_interval);
    clearInterval(new_chat_interval);
    load_city('#business_register-city_select');

    $('#business_register-city_select').change(function(event) {
        var city_id = $(this).val();
        console.log('city_id: ' + city_id);
        load_location('#business_register-location_select', city_id, function(){});
    });

    load_category('#business_register-category', function(){});
});

myApp.onPageInit('edit_profile_business', function(page) {
    myApp.allowPanelOpen = true;
    clearInterval(new_comment_interval);
    clearInterval(new_chat_interval);
    load_edit_profile_business();
});

myApp.onPageInit('profile_shopper', function(page) {
    myApp.allowPanelOpen = true;
    clearInterval(new_comment_interval);
    clearInterval(new_chat_interval);
    image_from_device = '';
    // bottom_tabs();
    var user_id = page.query.id;
    console.log('user_id: ' + user_id);
    load_shopper_profile(user_id);
});

myApp.onPageInit('profile_business', function(page) {
    myApp.allowPanelOpen = true;
    image_from_device = '';
    // bottom_tabs();
    var user_id = page.query.id;
    console.log('user_id: ' + user_id);
    load_business_profile(user_id);
    clearInterval(new_chat_interval);
});

myApp.onPageInit('search', function(page) {
    myApp.allowPanelOpen = true;
    clearInterval(new_comment_interval);
    clearInterval(new_chat_interval);
    load_search();
});




