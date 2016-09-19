// function for app
function j2s(json) {
    return JSON.stringify(json);
}

function register(){
    mainView.router.load({
        url: 'register.html',
        ignoreCache: false,
     });
}

function login_page(){
     mainView.router.load({
        url: 'login.html',
        ignoreCache: false,
     });
}

function business(){
    console.log('business');
    mainView.router.load({
        url: 'business_register.html',
        ignoreCache: false,
     });
}

function shopper() {
    console.log('shopper');
    mainView.router.load({
        url: 'shopper_register.html',
        ignoreCache: false,
     });
}

//login
function login_app() {
    var email = $('#login-email').val().trim();
    var password = $('#login-password').val().trim();
    if (email == '') {
        myApp.alert('Email Id should be provided.');
        return false;
    } else if (!email.match(email_regex)) {
        myApp.alert('Valid Email Id should be provided.');
        return false;
    }

    if (password == '') {
        myApp.alert('Password should not be blank.');
        return false;
    }

    myApp.showIndicator();
    $.ajax({
        url: base_url + '/user_signin',
        type: 'POST',
        crossDomain: true,
        data: {
            "param": email,
            "param1": password,
        },
    })
    .done(function(res) {
        console.log(j2s(res.users_data));
        myApp.hideIndicator();
        if (res.response_text == 'success') {
            myApp.alert(j2s(res.response_msg));
            Lockr.set('token', res.users_data.id);
            token = res.users_data.id;
            user_data = res.users_data;

            if (!notification_interval) {
                load_notification_count();
                notification_interval = setInterval(function() {
                    load_notification_count();
                }, 5000);
            }

            if (res.users_data.user_type == "Business") {
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
        }else {
            myApp.alert(j2s(res.response_msg));

        }
    })
    .fail(function(err) {
        myApp.hideIndicator();
        alert('Some error occurred on connecting.');
        console.log('fail: ' + j2s(err));
    })
    .always(function() {});
}

//logout
function logout() {
    //window.location.reload();
    // $('.ne_on').css("margin-top","2px");
    // $('#login').show();
    // $('#register').show();
    Lockr.flush();
    token = false;
    mainView.router.load({
        url: 'index.html',
        ignoreCache: false,
        query: {
            isLogout: true
        }
    });
}

function load_city(selecter) {
    myApp.showIndicator();
    $.ajax({
        url: base_url + '/get_city',
        type: 'POST',
        crossDomain: true,
        async: false,
        data: {},
    })
    .done(function(res) {
        console.log('res: ' + j2s(res));
        myApp.hideIndicator();
        if (res.status == 'success') {
            html = '<option value="">Select City</option>';
            $.each(res.data, function(index, val) {
                html += '<option value="' + val.id + '" >' + val.name + '</option>';
            });
            $(selecter).append(html)
        } else {}
    }).fail(function(err) {
        myApp.hideIndicator();
        myApp.alert('some error');
        console.log('error: ' + err);
    }).always();
}

function load_category(selector, afterCallback) {
    myApp.showIndicator();
    $.ajax({
        url: base_url + '/get_category',
        type: 'POST',
        crossDomain: true,
        async: false,
        data: {},
    })
    .done(function(res) {
        console.log('res: ' + j2s(res));
        myApp.hideIndicator();
        if (res.status == 'success') {
            var html = '';
            $.each(res.data, function(index, val) {
                html += '<option value="' + val.id + '" >' + val.name + '</option>';
            });
            $(selector).html(html);
            afterCallback();
        } else {}
    })
    .fail(function(err) {
        myApp.hideIndicator();
        myApp.alert('Some error occurred');
        console.log('error: ' + j2s(err));
    }).always();
}

function load_location(selector, city_id, callback) {
    console.log('city-id: '+city_id);
    $.ajax({
        url: base_url + '/get_location',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {
            city_id: city_id,
        },
    })
    .done(function(res) {
        console.log("success: " + j2s(res));
        if (res.status == 'success') {
            html = '<option value="">Select Location</option>';
            $.each(res.data, function(index, val) {
                html += '<option value="' + val.id + '">' + val.name + '</option>';
            });
            $(selector).html(html);
            callback();
        }
    })
    .fail(function(err) {
        console.log("error: " + err);
    })
    .always(function() {
        console.log("complete");
    });
}

function open_dialog_for_image() {
    var buttons1 = [{
        text: 'choose source',
        label: true
    }, {
        text: 'Camera',
        bold: true,
        onClick: image_camera,
    }, {
        text: 'Gallery',
        bold: true,
        onClick: image_gallery,
    }];
    var buttons2 = [{
        text: 'Cancel',
        color: 'red'
    }];
    var groups = [buttons1, buttons2];
    myApp.actions(groups);
}

function image_camera() {
    console.log('in image');
    navigator.camera.getPicture(shopper_register_onSuccess, shopper_register_onFail, {
        quality: 50,
        destinationType: Camera.DestinationType.FILE_URI,
        sourceType: Camera.PictureSourceType.CAMERA,
        targetWidth: 720,
        targetHeight: 640,
        correctOrientation: true,
        allowEdit: true,
    });
}

function image_gallery() {
    navigator.camera.getPicture(shopper_register_onSuccess, shopper_register_onFail, {
        quality: 50,
        destinationType: Camera.DestinationType.FILE_URI,
        sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM,
        targetWidth: 600,
        targetHeight: 600,
        correctOrientation: true,
        allowEdit: true,
    });
}

function shopper_register_onSuccess(fileURL) {
    myApp.showPreloader('uploading image');
    var uri = encodeURI(base_url + "/upload_user");
    var options = new FileUploadOptions();
    options.fileKey = "file";
    options.fileName = fileURL.substr(fileURL.lastIndexOf('/') + 1);
    options.mimeType = "image/jpeg";
    var headers = {
        'headerParam': 'headerValue'
    };
    options.headers = headers;
    new FileTransfer().upload(fileURL, uri, shopper_register_onSuccess_file, shopper_register_onError_file, options);
}

function shopper_register_onFail(message) {
    console.log('Failed because: ' + message);
}

function shopper_register_onError_file(error) {
    myApp.hidePreloader();
    console.log("An error has occurred: Code = " + error.code);
    console.log("upload error source " + error.source);
    console.log("upload error target " + error.target);
    myApp.alert("Some Error Occured While image upload please try again");
}

function shopper_register_onSuccess_file(res) {
    console.log('res: ' + j2s(res));
    myApp.hidePreloader();
    if (res.responseCode == 200) {
        uploaded_image = res.response.replace(/\"/g, "");
        image_from_device = uploaded_image;
        console.log('uploaded_image: ' + uploaded_image);
        // $('#shopper_register-profile_image').val(uploaded_image);
        myApp.alert("Image Uploaded Successfully");
    } else {
        myApp.hidePreloader();
        myApp.alert('Some error occurred on uploading');
    }
}

//register business
function register_business() {
    console.log('shopper_register');
    var name = $('#business_register-name').val().trim();
    var email = $('#business_register-email').val().trim();
    var password = $('#business_register-password').val().trim();
    var confirm_password = $('#business_register-confirm_password').val().trim();
    var city_id = $('#business_register-city_select').val().trim();
    var location_id = $('#business_register-location_select').val();
    // var gender = $('.business_register-gender:checked').val();
    var gender = $('input[name=business_register-gender]:checked').val();
    var business_name = $('#business_register-buissness').val().trim();
    var category = $('#business_register-category').val();
    var business_category = '';
    // var profile_image = $('#shopper_register-profile_image').val().trim();
    var profile_image = image_from_device.trim();
    var phone = $('#business_register-phone').val().trim();

    if (name == '') {
        myApp.alert('Please provide name.');
        return false;
    }
    if (business_name == '') {
        myApp.alert('Please provide business name.');
        return false;
    }
    if (!category) {
        myApp.alert('Please select category.');
        return false;
    }
    if (email == '') {
        myApp.alert('Please provide email id.');
        return false;
    }
    if (!phone.match(phone_regex)) {
        myApp.alert('Please enter valid phone number.');
        return false;
    }
    if (!email.match(email_regex)) {
        myApp.alert('Please provide valid email id.');
        return false;
    }
    if (password == '') {
        myApp.alert('Please provide password.');
        return false;
    }
    if (confirm_password == '') {
        myApp.alert('Please confirm password.');
        return false;
    }
    if (!password == confirm_password) {
        myApp.alert('Password mismatch.');
        return false;
    }
    if (city_id == '') {
        myApp.alert('Please provide city.');
        return false;
    }
    if (!location_id) {
        myApp.alert('Please provide location.');
        return false;
    }
    if (!gender) {
        myApp.alert('Please select gender.');
        return false;
    }
    if (profile_image == '') {
      profile_image = 'default_image.png';
    }

    $.each(category, function(index, val) {
        business_category += val + ',';
    });
    business_category = business_category.slice(0, -1);

    myApp.showIndicator();
    $.ajax({
        url: base_url + '/user_signup',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {
            // identity: email,
            email: email,
            name: name,
            password: password,
            city_id: city_id,
            location_id: location_id,
            gender: gender,
            profile_image: profile_image,
            user_type: 'Business',
            medium: 'register',
            bussiness_name: business_name,
            bussiness_category_id: business_category,
            phone: phone,
        },
    })
    .done(function(res) {
        console.log("success: " + j2s(res));
        myApp.hideIndicator();
        if (res.response_text == 'success') {
            $('#buzzCreate').hide();
            $('#offerCreate').show();
            myApp.alert(j2s(res.response_msg));
            Lockr.set('token', res.user_id);
            token = res.user_id;
            user_data = res.users_data;

            if (!notification_interval) {
                load_notification_count();
                notification_interval = setInterval(function() {
                    load_notification_count();
                }, 5000);
            }

            // if (res.users_data.user_type == "Business") {
            //     $("#buzzCreate").hide();
                mainView.router.load({
                    url: 'offers.html',
                    ignoreCache: false,
                    query: {
                        register: true
                    },
                });
            // } else {

            //     $("#offerCreate").hide();
            //     mainView.router.load({
            //         url: 'buzzs.html',
            //         ignoreCache: false,
            //         query: {
            //             register: true
            //         },
            //     });

            // }


            // myApp.alert(j2s(res.response_msg));
            // Lockr.set('token', res.user_id);
            // token = res.user_id;
            // user_data = res.users_data;

            // if (!notification_interval) {
            //     load_notification_count();
            //     notification_interval = setInterval(function() {
            //         load_notification_count();
            //     }, 5000);
            // }

            // mainView.router.load({
            //     url: 'offers.html',
            //     ignoreCache: false,
            //     query: {
            //         register: true
            //     },
            // });
        } else {
            alert(j2s(res.response_msg));
        }
    })
    .fail(function(err) {
        console.log("error: " + j2s(err));
        alert("error: " + j2s(err));
    })
    .always(function() {
        console.log("complete");
    });
}

//regiter shopper
function register_shopper() {

    console.log('shopper_register');
    var name = $('#shopper_register-name').val().trim();
    var email = $('#shopper_register-email').val().trim();
    var password = $('#shopper_register-password').val().trim();
    var confirm_password = $('#shopper_register-confirm_password').val().trim();
    var city_id = $('#shopper_register-city_select').val();
    var location_id = $('#shopper_register-location_select').val();
    // var gender = $('input[name=shopper_register-gender]:checked').val();
    // var dob = $('#shopper_register-dob').val().trim();
    var gender = '';
    var dob = '';
    // var profile_image = image_from_device.trim();
    var profile_image = 'default_image.png';
    var phone = $('#shopper_register-phone').val().trim();

    if (name == '') {
        myApp.alert('Please provide name.');
        return false;
    }
    if (email == '') {
        myApp.alert('Please provide Email Id.');
        return false;
    }
    if (!email.match(email_regex)) {
        myApp.alert('Please provide valid Email Id.');
        return false;
    }
    if (!phone.match(phone_regex)) {
        myApp.alert('Please enter valid Phone Number.');
        return false;
    }
    if (password == '') {
        myApp.alert('Please enter Password.');
        return false;
    }
    if (confirm_password == '') {
        myApp.alert('Please confirm password.');
        return false;
    }
    if (password!=confirm_password) {
        myApp.alert('Password mismatch.');
        return false;
    }
    if (city_id == '') {
        myApp.alert('Please provide city.');
        return false;
    }
    if (!location_id) {
        myApp.alert('Please provide location.');
        return false;
    }
    // if (!gender) {
    //     myApp.alert('Please select gender.');
    //     return false;
    // }
    // if (dob == '') {
    //     myApp.alert('Please enter date of birth.');
    //     return false;
    // }
    // if (profile_image == '') {
    //     profile_image = 'default_image.png';
    //     // myApp.alert('Please upload profile image.');
    //     // return false;
    // }

    myApp.showIndicator();
    $.ajax({
        url: base_url + '/user_signup',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {
            // param: email,
            email:email,
            name: name,
            password: password,
            city_id: city_id,
            location_id: location_id,
            gender: gender,
            dob: dob,
            profile_image: profile_image,
            medium: 'register',
            user_type: 'Shopper',
            phone: phone,
        },
    })
    .done(function(res) {
        console.log("success: " + j2s(res));
        // alert(j2s(res));
        myApp.hideIndicator();
        if (res.response_text == 'success') {
            $('#offerCreate').hide();
            myApp.alert(j2s(res.response_msg));
            Lockr.set('token', res.user_id);
            token = res.user_id;
            user_data = res.users_data;

            if (!notification_interval) {
                load_notification_count();
                notification_interval = setInterval(function() {
                    load_notification_count();
                }, 5000);
            }

            mainView.router.load({

                url: 'buzzs.html',
                ignoreCache: false,
                query: {
                    register: true
                },
            });
        } else {
            alert(j2s(res.response_msg));
        }
    })
    .fail(function(err) {
        myApp.hideIndicator();
        console.log("error: " + j2s(err));
        alert("error: "+j2s(err));
    })
    .always(function() {
        console.log("complete");
    });
}

//fb login start
openFB.init('1082629788484751', '', window.localStorage);

function fb_login() {
    console.log('fb_login');
    openFB.login('email',
        function(res) {
            console.log('openFB.login success: '+res);
            get_info();
        },
        function(err) {
            console.log('openFB.login fail: '+err);
            myApp.alert('Facebook login failed');
        }
    );
}

function get_info() {
    console.log('get_info');
    openFB.api({
        path: '/me',
        success: function(data) {
            console.log('openFB.api success: '+data);
            login_via_fb(data);
        },
        error: function(response) {
            console.log('openFB.api fail: '+data);
            myApp.alert('Not able to access data');
        }
    });
}

function login_via_fb(data) {
    myApp.showIndicator();
    $.ajax({
        url: base_url + '/facebook_login_api',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {
            fb_id: data.id,
            name: data.name,
            profile_image: 'http://graph.facebook.com/'+data.id+'/picture',
            medium: 'facebook',
            user_type: 'Shopper',
        },
    })
    .done(function(res) {
        console.log("success: " + j2s(res));
        myApp.hideIndicator();
         $("#offerCreate").hide();
        if (res.response_text == 'success') {
            myApp.alert(j2s(res.response_msg));
            Lockr.set('token', res.users_data.id);
            token = res.users_data.id;
            user_data = res.users_data;

            if (!notification_interval) {
                load_notification_count();
                notification_interval = setInterval(function() {
                    load_notification_count();
                }, 5000);
            }

            mainView.router.load({
                url: 'buzzs.html',
                ignoreCache: false,
                query: {
                    register: true
                },
            });
        } else {
            myApp.alert(j2s(res.response_msg));
            Lockr.set('token', res.users_data.id);
            token = res.users_data.id;
            user_data = res.users_data;

            if (!notification_interval) {
                load_notification_count();
                notification_interval = setInterval(function() {
                    load_notification_count();
                }, 5000);
            }
            
            mainView.router.load({
                url: 'buzzs.html',
                ignoreCache: false,
                query: {
                    register: true
                },
            });
        }
    })
    .fail(function(err) {
        console.log("error: " + j2s(err));
        myApp.alert("error: " + j2s(err));
    })
    .always(function() {
        console.log("complete");
    });

    myApp.showIndicator();
}
//fb login end

//create buzz
function add_buzz() {
    console.log('add_buzzoffer');
    var buzz_offer_image = image_from_device.trim();
    var price = $('#create_buzz-price').val().trim();
    var location_id = $('#create_buzz-location').val().trim();
    var categories = $('#create_buzz-categories').val();
    // var description = $('#create_buzz-description').val().trim();
    var tag = $('#create_buzz_tag').val(); 
    console.log("image :"+buzz_offer_image);
     console.log("tag :"+tag);
    
    if (buzz_offer_image == '') {
        buzz_offer_image = 'neon_buzz.jpg';
    }
    if (tag == 'select') {
        myApp.alert('Please Select tags.');
        return false;
    }else if (tag == 'looking for something') {
        if (price == '') {
            myApp.alert('Please provide price.');
            return false;
        }
    }else {
        if (!location_id) {
            myApp.alert('Please select location.');
            return false;
        }
    }
    if (!categories) {
        myApp.alert('Please select categories.');
        return false;
    }
    // if (description == '') {
    //     myApp.alert('Please provide description.');
    //     return false;
    // }
    // console.log(buzz_offer_image+'price'+price+'location_id'+location_id+'categories'+categories+'description'+description+'tag'+tag);
    myApp.showIndicator();
    $.ajax({
        url: base_url + '/create_buzz',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {
            user_id: token,
            tag:tag,
            image: buzz_offer_image,
            location: location_id,
            price: price,
            categories: categories,
            // description: description,
        },
    })
    .done(function(res) {
        console.log("success: " + j2s(res));
        myApp.hideIndicator();
        if (res.status == 'success') {
            mainView.router.load({
                url:'buzzs.html',
                ignoreCache: false,
            });
        } else {
            myApp.alert('Provide valid data');
        }
    })
    .fail(function(err) {
        myApp.hideIndicator();
        console.log("error: " + j2s(err));
        // myApp.alert("error: "+j2s(err));
    })
    .always(function() {
        console.log("complete");
    });
}

function load_location_all(selector) {
    $.ajax({
        url: base_url + '/get_location_master',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {},
    })
    .done(function(res) {
        console.log("success: " + j2s(res));
        if (res.status == 'success') {
            html = '<option value="">Select Location</option>';
            $.each(res.data, function(index, val) {
                html += '<option value="' + val.id + '">' + val.name + '</option>';
            });
            $(selector).html(html);
        }
    })
    .fail(function(err) {
        console.log("error: " + err);
    })
    .always(function() {
        console.log("complete");
    });
}
//end create buzz

//create offer
function add_offer() {
    console.log('add_offer');
    var buzz_offer_image = image_from_device.trim();
    var price = $('#create_offer_price').val().trim();
    var tag = $('#create_offer_tag').val();
    var location_id = $('#create_buzz-location').val().trim();
    var categories = $('#create_buzz-categories').val();
     console.log('buzz_offer_image :'+buzz_offer_image+'price :'+price+'tags :'+tag+'location_id :'+location_id+'categories :'+categories);
    if (buzz_offer_image == '') {
        // myApp.alert('Please provide image.');
        // return false;
        buzz_offer_image = 'neon_buzz.jpg';
    }
    if (tag == 'select') {
        myApp.alert('Please Select tags.');
        return false;
    }else if (tag == 'great value') {
        if (price == '') {
            myApp.alert('Please provide price.');
            return false;
        }
    }else {
        if (!location_id) {
            myApp.alert('Please select location.');
            return false;
        }
    }
    if (!location_id) {
        myApp.alert('Please select location.');
        return false;
    }
    if (!categories) {
        myApp.alert('Please select categories.');
        return false;
    }

    myApp.showIndicator();
    $.ajax({
        url: base_url + '/create_offer',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {
            user_id: token,
            image: buzz_offer_image,
            location: location_id,
            tags: tag,
            categories: categories,
            price: price,
            //description: description,
        },
    })
    .done(function(res) {
        console.log("success: " + j2s(res));
        myApp.hideIndicator();
        if (res.status == 'success') {
            mainView.router.load({
                url:'offers.html',
                ignoreCache: false,
            });
        } else {
            myApp.alert('Provide valid data');
        }
    })
    .fail(function(err) {
        myApp.hideIndicator();
        console.log("error: " + j2s(err));
        // myApp.alert("error: "+j2s(err));
    })
    .always(function() {
        console.log("complete");
    });
}

//LOAD BUZZ
function load_buzzs() {
    myApp.showIndicator();
    $.ajax({
        url: base_url + '/load_buzzs',
        type: 'POST',
        data: {
            user_id: token,
        },
    })
    .done(function(res) {
        console.log('buzzs: ' + j2s(res));

        myApp.hideIndicator();
        if (res.status == 'success') {
            var html = '';
            $.each(res.data, function(index, val) {
                var pofile_image;
                var profile_link = '';
                var like_link = '';
                var tags = '';
                var type = 'buzz';
                var count_like ='';
                var remove_link = '<a href="javascript:void(0);" style="display:none;" onclick="remove_me(' + val.id + ', \'' + type + '\', this)" class="dlt_lnk" ><i class="material-icons white_heart" style="font-size:30px !important;">delete</i></a>';
                // var remove_link = '<a href="#" onclick="remove_me(' + val.id + ', \'' + type + '\', this)" class="link">Remove</a>';
                var share_link = '<a href="javascript:void(0);" style="" onClick="share(\'http://neonbuzz.co/' + type + '/' + val.id + '\', \'' + image_url + val.image + '\')" class="shr_lnk" style=""><i class="material-icons white_heart" style="font-size:28px !important;">share</i></a>';
                // var share_link = '<a href="#" onClick="share(\'http://neonbuzz.co/' + type + '/' + val.id + '\', ' + image_url + val.image + ')" class="link">Share</a>';
                
                if (val.user_image.indexOf('http') != -1) {
                    profile_image = val.user_image;
                } else {
                    profile_image = image_url + val.user_image;
                }

                if (val.is_liked == '1') {
                    // already liked
                    like_link = '<a href="javascript:void(0);" data-liked="1" class="" onClick="like(' + val.id + ', \'' + type + '\', this)"><i class="material-icons white_heart">favorite</i></a>';
                } else {
                    like_link = '<a href="javascript:void(0);" data-liked="0" class="" onClick="like(' + val.id + ', \'' + type + '\', this)"><i class="material-icons white_heart" >favorite_border</i></a>';
                }

                // if (val.user_type == 'Shopper') {
                    profile_link = 'profile_shopper.html?id=' + val.user_id;
                // } else {
                //     profile_link = 'profile_business.html?id=' + val.user_id;
                // }

                var tagsArraay = val.tag.split(',');
                $.each(tagsArraay, function(tagsIndex, tagsVal) {
                    tags += ' #' + tagsVal + ',';
                });

                tags = tags.slice(0, -1);
                console.log('val.id: '+val.id);
                
                if (val.buzz_like == null) {
                    count_like = 0;
                }else{
                    count_like = val.count;
                }
                html +=
                    '<div class="card c_ard ks-facebook-card">' +
                        '<div class="black_overlay"></div>' +
                        '<a href="' + profile_link + '" class="card-header no-border pro_view">' +
                            // '<div class="price"> Price : ' + val.price + '</div>' +
                            '<div class="ks-facebook-avatar pro_pic">' +
                                '<img src="' + profile_image + '" width="34" height="34">' +
                            '</div>' +
                            '<div class="ks-facebook-name pro_name">' + val.user_name + '</div>' +
                            '<div class="ks-facebook-date pro_tag">'+tags+'</div>' +
                        '</a>' +
                        '<a class="card-content ks-facebook-card" >' +
                            '<img data-src="' + image_url + val.image + '" width="100%" class="lazy lazy-fadein">' +
                        '</a>'+                      
                        '<div style="position: absolute;top: 0%;background: rgba(19, 17, 17, 0.32);right: 0;padding: 2%;text-align: right;color: white;">'+
                            '<i class="material-icons" style="font-size: 13px !important;color: red;">favorite</i>&nbsp;'+
                            '<span class="count_buzz_like">'+count_like+' </span>likes<br>'+
                            '<span style="">₹&nbsp;'+val.price+'</span>'+
                        '</div>'+
                        '<div class="card-footer no-border like_share" style="padding: 4px;">' +
                            share_link +
                            // '<a href="javascript:void(0);" class="add_clk"><i class="material-icons white_heart">add_circle</i></a>'+
                            // remove_link +
                            like_link ;
                            if (parseInt(val.user_id) == parseInt(token)) {
                                html +=
                                '<i class="material-icons chat" style="font-size:28px !important;color:white;">chat</i></a>';
                            } else {
                                html +=
                                 '<a href="javascript:void(0);" class="chat_lnk" onClick="goto_single_chat('+val.user_id+')"><i class="material-icons chat" style="font-size:28px !important;color:white;">chat</i></a>';
                            }
                        html +=
                        '</div>' +
                    '</div>';
            });

            $('#buzzs-container').html(html);
            // $( ".add_clk" ).click(function() {
            //     $(this).prev( ".shr_lnk" ).slideToggle();
            //     $(this).next( ".dlt_lnk" ).slideToggle();
            //     // $(this).next( ".chat_lnk" ).slideToggle();
            // });
            myApp.initImagesLazyLoad($('[data-page="buzzs"]'));
        } else {
            var html = '<h4> Content not found.</h4>';
            $(selector).html(html);
        }
    }).fail(function(err) {
        myApp.hideIndicator();
        myApp.alert('Some error occurred on connecting.');
        console.log('fail: ' + j2s(err));
    }).always();
}

function load_buzz_filter_location(selector) {
    $.ajax({
        url: base_url + '/get_location_master',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {},
    })
    .done(function(res) {
        console.log("success: " + j2s(res));
        if (res.status == 'success') {
            var html = '';
            $.each(res.data, function(index, val) {
                // html += '<option value="' + val.id + '">' + val.name + '</option>';
                html += '<li>'+
                            '<label class="label-checkbox item-content">'+
                                '<input type="checkbox" name="location" value="'+val.id+'" />'+
                                '<div class="item-media">'+
                                    '<i class="icon icon-form-checkbox"></i>'+
                                '</div>'+
                                '<div class="item-inner">'+
                                    '<div class="item-title">'+val.name+'</div>'+
                                '</div>'+
                            '</label>'+
                        '</li>';
            });
            // html += '<br><br><br><br><br><br><br><br><br><br>';
            $(selector).html(html);
        }
    })
    .fail(function(err) {
        console.log("error: " + err);
    })
    .always(function() {
        console.log("complete");
    });
}

function load_buzz_filter_category(selector) {
    myApp.showIndicator();
    $.ajax({
        url: base_url + '/get_category',
        type: 'POST',
        crossDomain: true,
        async: false,
        data: {},
    })
    .done(function(res) {
        console.log('res: ' + j2s(res));
        myApp.hideIndicator();
        if (res.status == 'success') {
            var html = '';
            $.each(res.data, function(index, val) {
                 html += '<li>'+
                            '<label class="label-checkbox item-content">'+
                                '<input type="checkbox" name="category" value="'+val.id+'" />'+
                                '<div class="item-media">'+
                                    '<i class="icon icon-form-checkbox"></i>'+
                                '</div>'+
                                '<div class="item-inner">'+
                                    '<div class="item-title">'+val.name+'</div>'+
                                '</div>'+
                            '</label>'+
                        '</li>';
            });
            $(selector).html(html);
            //afterCallback();
        } else {}
    })
    .fail(function(err) {
        myApp.hideIndicator();
        myApp.alert('Some error occurred');
        console.log('error: ' + j2s(err));
    }).always();
}

function load_buzzs_filter() {
    myApp.closeModal('.filter-popup');
    myApp.showIndicator();
    var filter_tags = $('input[name="tags"]:checked').val();
    //var filter_location = $("input[type='checkbox']").val();
    var filter_location = $('input[name=location]:checked').map(function(_, el) {
        return $(el).val();
    }).get();

    var filter_category = $('input[name=category]:checked').map(function(_, el) {
        return $(el).val();
    }).get();

    console.log('filter_tags:'+filter_tags);
    console.log('filter_location:'+filter_location);
    console.log('filter_category:'+filter_category);    
    $.ajax({
        url: base_url + '/load_buzzs_filter',
        type: 'POST',
        data: {
            user_id: token,
            filter_tags: filter_tags,
            filter_location : filter_location ,
            filter_category : filter_category,
        },
    })
    .done(function(res) {
        console.log('buzzs: ' + j2s(res));

        myApp.hideIndicator();
        if (res.status == 'success') {
            if (res.data == '') {
                myApp.alert('NO BUZZ FOUND');
            }
            var html = '';
            $.each(res.data, function(index, val) {
                var pofile_image;
                var profile_link = '';
                var like_link = '';
                var tags = '';
                var type = 'buzz';
                var count_like = '';
                var remove_link = '<a href="javascript:void(0);" style="display:none;" onclick="remove_me(' + val.id + ', \'' + type + '\', this)" class="dlt_lnk" ><i class="material-icons white_heart" style="font-size:30px !important;">delete</i></a>';
                // var remove_link = '<a href="#" onclick="remove_me(' + val.id + ', \'' + type + '\', this)" class="link">Remove</a>';
                var share_link = '<a href="javascript:void(0);" style="" onClick="share(\'http://neonbuzz.co/' + type + '/' + val.id + '\', \'' + image_url + val.image + '\')" class="shr_lnk" style=""><i class="material-icons white_heart" style="font-size:28px !important;">share</i></a>';
                // var share_link = '<a href="#" onClick="share(\'http://neonbuzz.co/' + type + '/' + val.id + '\', ' + image_url + val.image + ')" class="link">Share</a>';
                
                if (val.user_image.indexOf('http') != -1) {
                    profile_image = val.user_image;
                } else {
                    profile_image = image_url + val.user_image;
                }

                if (val.is_liked == '1') {
                    // already liked
                    like_link = '<a href="javascript:void(0);" data-liked="1" class="" onClick="like(' + val.id + ', \'' + type + '\', this)"><i class="material-icons white_heart">favorite</i></a>';
                } else {
                    like_link = '<a href="javascript:void(0);" data-liked="0" class="" onClick="like(' + val.id + ', \'' + type + '\', this)"><i class="material-icons white_heart" >favorite_border</i></a>';
                }

                if (val.user_type == 'Shopper') {
                    profile_link = 'profile_shopper.html?id=' + val.user_id;
                } else {
                    profile_link = 'profile_business.html?id=' + val.user_id;
                }

                var tagsArraay = val.tag.split(',');
                $.each(tagsArraay, function(tagsIndex, tagsVal) {
                    tags += ' #' + tagsVal + ',';
                });

                tags = tags.slice(0, -1);
                console.log('val.id: '+val.id);
                
                if (val.buzz_like == null) {
                    count_like = 0;
                }else{
                    count_like = val.count;
                }

                html +=
                    '<div class="card c_ard ks-facebook-card">' +
                        '<div class="black_overlay"></div>' +
                        '<a href="' + profile_link + '" class="card-header no-border pro_view">' +
                            // '<div class="price"> Price : ' + val.price + '</div>' +
                            '<div class="ks-facebook-avatar pro_pic">' +
                                '<img src="' + profile_image + '" width="34" height="34">' +
                            '</div>' +
                            '<div class="ks-facebook-name pro_name">' + val.user_name + '</div>' +
                            '<div class="ks-facebook-date pro_tag">'+tags+'</div>' +
                        '</a>' +
                        '<a class="card-content" >' +
                            '<img data-src="' + image_url + val.image + '" width="100%" class="lazy lazy-fadein">' +
                        '</a>' +
                        '<div style="position: absolute;top: 0%;background: rgba(19, 17, 17, 0.32);right: 0;padding: 2%;text-align: right;color: white;">'+
                            '<i class="material-icons" style="font-size: 13px !important;color: red;">favorite</i>&nbsp;'+
                            '<span class="count_buzz_like">'+count_like+' </span>likes<br>'+
                            '<span style="">₹&nbsp;'+val.price+'</span>'+
                        '</div>'+
                        '<div class="card-footer no-border like_share" style="padding: 4px;">' +
                            share_link +
                            // '<a href="javascript:void(0);" class="add_clk"><i class="material-icons white_heart">add_circle</i></a>'+
                            // remove_link +
                            like_link +
                            '<a href="javascript:void(0);" class="chat_lnk" onClick="goto_single_chat('+val.user_id+')"><i class="material-icons chat" style="font-size:28px !important;color:white;">chat</i></a>'+
                        '</div>' +
                    '</div>';
            });

            $('#buzzs-container').html(html);
            // $( ".add_clk" ).click(function() {
            //     $(this).prev( ".shr_lnk" ).slideToggle();
            //     $(this).next( ".dlt_lnk" ).slideToggle();
            //     // $(this).next( ".chat_lnk" ).slideToggle();
            // });
            myApp.initImagesLazyLoad($('[data-page="buzzs"]'));
        } else {
            // var html = '<h4> Content not found.</h4>';
            // $(selector).html(html);
        }
    }).fail(function(err) {
        myApp.hideIndicator();
        myApp.alert('Some error occurred on connecting.');
        console.log('fail: ' + j2s(err));
    }).always();
}

function clear_filter(){
    $('input[name="tags"]').attr('checked', false);
    $('input[type="checkbox"]').attr('checked', false);
     myApp.closeModal('.filter-popup');
    load_buzzs();
}

function load_offer_filter_location(selector) {
    $.ajax({
        url: base_url + '/get_location_master',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {},
    })
    .done(function(res) {
        console.log("success: " + j2s(res));
        if (res.status == 'success') {
            var html = '';
            $.each(res.data, function(index, val) {
                // html += '<option value="' + val.id + '">' + val.name + '</option>';
                html += '<li>'+
                            '<label class="label-checkbox item-content">'+
                                '<input type="checkbox" name="offer_location" value="'+val.id+'" />'+
                                '<div class="item-media">'+
                                    '<i class="icon icon-form-checkbox"></i>'+
                                '</div>'+
                                '<div class="item-inner">'+
                                    '<div class="item-title">'+val.name+'</div>'+
                                '</div>'+
                            '</label>'+
                        '</li>';
            });
            // html += '<br><br><br><br><br><br><br><br><br><br>';
            $(selector).html(html);
        }
    })
    .fail(function(err) {
        console.log("error: " + err);
    })
    .always(function() {
        console.log("complete");
    });
}

function load_offer_filter_category(selector) {
    myApp.showIndicator();
    $.ajax({
        url: base_url + '/get_category',
        type: 'POST',
        crossDomain: true,
        async: false,
        data: {},
    })
    .done(function(res) {
        console.log('res: ' + j2s(res));
        myApp.hideIndicator();
        if (res.status == 'success') {
            var html = '';
            $.each(res.data, function(index, val) {
                 html += '<li>'+
                            '<label class="label-checkbox item-content">'+
                                '<input type="checkbox" name="offer_category" value="'+val.id+'" />'+
                                '<div class="item-media">'+
                                    '<i class="icon icon-form-checkbox"></i>'+
                                '</div>'+
                                '<div class="item-inner">'+
                                    '<div class="item-title">'+val.name+'</div>'+
                                '</div>'+
                            '</label>'+
                        '</li>';
            });
            $(selector).html(html);
            //afterCallback();
        } else {}
    })
    .fail(function(err) {
        myApp.hideIndicator();
        myApp.alert('Some error occurred');
        console.log('error: ' + j2s(err));
    }).always();
}

function load_offer_filter() {
    myApp.closeModal('.filter-popup-offer');
    myApp.showIndicator();
    var filter_tags = $('input[name="offer_tags"]:checked').val();
    //var filter_location = $("input[type='checkbox']").val();
    var filter_location = $('input[name=offer_location]:checked').map(function(_, el) {
        return $(el).val();
    }).get();

    var filter_category = $('input[name=offer_category]:checked').map(function(_, el) {
        return $(el).val();
    }).get();

    console.log('filter_tags:'+filter_tags);
    console.log('filter_location:'+filter_location);
    console.log('filter_category:'+filter_category);    
    $.ajax({
        url: base_url + '/load_offer_filter',
        type: 'POST',
        data: {
            user_id: token,
            filter_tags: filter_tags,
            filter_location : filter_location ,
            filter_category : filter_category,
        },
    })
    .done(function(res) {
        console.log('offers: ' + j2s(res));

        myApp.hideIndicator();
        if (res.status == 'success') {
             if (res.data == '') {
                myApp.alert('NO offer FOUND');
            }
            var html = '';
            $.each(res.data, function(index, val) {
                var pofile_image;
                var profile_link = '';
                var like_link = '';
                var tags = '';
                var type = 'offer';
                var count_like = '';
                var remove_link = '<a href="javascript:void(0);" style="display:none;" onclick="remove_me(' + val.id + ', \'' + type + '\', this)" class="dlt_lnk" ><i class="material-icons white_heart" style="font-size:30px !important;">delete</i></a>';
                // var remove_link = '<a href="#" onclick="remove_me(' + val.id + ', \'' + type + '\', this)" class="link">Remove</a>';
                var share_link = '<a href="javascript:void(0);" style="" onClick="share(\'http://neonbuzz.co/' + type + '/' + val.id + '\', \'' + image_url + val.image + '\')" class="shr_lnk" style=""><i class="material-icons white_heart" style="font-size:28px !important;">share</i></a>';
                // var share_link = '<a href="#" onClick="share(\'http://neonbuzz.co/' + type + '/' + val.id + '\', ' + image_url + val.image + ')" class="link">Share</a>';
                
                if (val.user_image.indexOf('http') != -1) {
                    profile_image = val.user_image;
                } else {
                    profile_image = image_url + val.user_image;
                }

                if (val.is_liked == '1') {
                    // already liked
                    like_link = '<a href="javascript:void(0);" data-liked="1" class="" onClick="like(' + val.id + ', \'' + type + '\', this)"><i class="material-icons white_heart">favorite</i></a>';
                } else {
                    like_link = '<a href="javascript:void(0);" data-liked="0" class="" onClick="like(' + val.id + ', \'' + type + '\', this)"><i class="material-icons white_heart" >favorite_border</i></a>';
                }

                if (val.user_type == 'Shopper') {
                    profile_link = 'profile_shopper.html?id=' + val.user_id;
                } else {
                    profile_link = 'profile_business.html?id=' + val.user_id;
                }

                var tagsArraay = val.tag.split(',');
                $.each(tagsArraay, function(tagsIndex, tagsVal) {
                    tags += ' #' + tagsVal + ',';
                });

                tags = tags.slice(0, -1);
                console.log('val.id: '+val.id);

                 if (val.offer_like == null) {
                    count_like = 0;
                }else{
                    count_like = val.count;
                }
       
                html +=
                    '<div class="card c_ard ks-facebook-card">' +
                        '<div class="black_overlay"></div>' +
                        '<a href="' + profile_link + '" class="card-header no-border pro_view">' +
                            // '<div class="price"> Price : ' + val.price + '</div>' +
                            '<div class="ks-facebook-avatar pro_pic">' +
                                '<img src="' + profile_image + '" width="34" height="34">' +
                            '</div>' +
                            '<div class="ks-facebook-name pro_name">' + val.user_name + '</div>' +
                            '<div class="ks-facebook-date pro_tag">'+tags+'</div>' +
                        '</a>' +
                        '<a class="card-content" >' +
                            '<img data-src="' + image_url + val.image + '" width="100%" class="lazy lazy-fadein">' +
                        '</a>' +
                         '<div style="position: absolute;top: 0%;background: rgba(19, 17, 17, 0.32);right: 0;padding: 2%;text-align: right;color: white;">'+
                            '<i class="material-icons" style="font-size: 13px !important;color: red;">favorite</i>&nbsp;'+
                            '<span class="count_buzz_like">'+count_like+' </span>likes<br>'+
                            '<span style="">₹&nbsp;'+val.price+'</span>'+
                        '</div>'+
                        '<div class="card-footer no-border like_share" style="padding: 4px;">' +
                            share_link +
                            // '<a href="javascript:void(0);" class="add_clk"><i class="material-icons white_heart">add_circle</i></a>'+
                            // remove_link +
                            like_link +
                            '<a href="javascript:void(0);" class="chat_lnk" onClick="goto_single_chat('+val.user_id+')"><i class="material-icons chat" style="font-size:28px !important;color:white;">chat</i></a>'+
                        '</div>' +
                    '</div>';
            });

            $('#offers-container').html(html);
            // $( ".add_clk" ).click(function() {
            //     $(this).prev( ".shr_lnk" ).slideToggle();
            //     $(this).next( ".dlt_lnk" ).slideToggle();
            //     // $(this).next( ".chat_lnk" ).slideToggle();
            // });
            myApp.initImagesLazyLoad($('[data-page="offers"]'));
        } else {
            var html = '<h4> Content not found.</h4>';
            $(selector).html(html);
        }
    }).fail(function(err) {
        myApp.hideIndicator();
        myApp.alert('Some error occurred on connecting.');
        console.log('fail: ' + j2s(err));
    }).always();
}
function clear_filter_offer(){
    $('input[name="offer_tags"]').attr('checked', false);
    $('input[type="checkbox"]').attr('checked', false);
     myApp.closeModal('.filter-popup-offer');
    load_offers();
}

function share(link, image) {
    console.log('share');
    var message = {
        subject: "NeonBuzz App",
        text: "Click the link below to download NeonBuzz",
        url: "https://play.google.com/store/apps/details?id=com.kreaserv.neonbuzz&hl=en",
        image: image
    };
    window.socialmessage.send(message);
}

function like(id, type, me) {
    if ($(me).data('liked') == '0') {
        // $(me).css('backgroundColor', 'white');
        $(me).data('liked', '1');
        $(me).html('<i class="material-icons white_heart" style="color:red">favorite</i>');
        var like_count = parseInt(($(me).parent().parent().find('.count_buzz_like').text()));
        console.log(like_count+1);
        $(me).parent().parent().find('.count_buzz_like').text(like_count+1+" ");
    } else {
        // $(me).css('backgroundColor', 'lime');
        $(me).data('liked', '0');
        $(me).html('<i class="material-icons white_heart">favorite_border</i>');
        var like_count = parseInt(($(me).parent().parent().find('.count_buzz_like').text()));
        console.log(like_count-1);
        if (like_count == 0) {
             //$(me).parent().parent().find('.count_buzz_like').text(like_count);
         } else {
             $(me).parent().parent().find('.count_buzz_like').text(like_count-1+" ");
        }
    }

    // console.log('like: '+id+type);
    $.ajax({
        url: base_url + '/like',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {
            user_id: token,
            type: type,
            id: id,
        },
    })
    .done(function(res) {
        // window.location.reload();

        console.log("success: " + j2s(res));
    })
    .fail(function(err) {
        console.log("error: " + j2s(err));
    })
    .always(function() {
        console.log("complete");
    });

}

function like1(id, type, me) {
    if ($(me).data('liked') == '0') {
        // $(me).css('backgroundColor', 'white');
        $(me).data('liked', '1');
        $(me).html('<i class="material-icons white_heart" style="color:red;margin-left: 64px;margin-top: 26px;">favorite</i>');
        var like_count = parseInt(($(me).parent().parent().find('.count_buzz_like').text()));
        console.log(like_count+1);

        $(me).parent().parent().find('.count_buzz_like').text(like_count+1+" ");
    } else {
        // $(me).css('backgroundColor', 'lime');
        $(me).data('liked', '0');
        $(me).html('<i class="material-icons white_heart" style="margin-left: 64px;margin-top: 26px;">favorite_border</i>');
        var like_count = parseInt(($(me).parent().parent().find('.count_buzz_like').text()));
        console.log(like_count-1);
        if (like_count == 0) {
             //$(me).parent().parent().find('.count_buzz_like').text(like_count);
         } else {
             $(me).parent().parent().find('.count_buzz_like').text(like_count-1+" ");
        }
    }

    // console.log('like: '+id+type);
    $.ajax({
        url: base_url + '/like',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {
            user_id: token,
            type: type,
            id: id,
        },
    })
    .done(function(res) {
        // window.location.reload();

        console.log("success: " + j2s(res));
    })
    .fail(function(err) {
        console.log("error: " + j2s(err));
    })
    .always(function() {
        console.log("complete");
    });

}

function remove_me(id, type, me) {
    console.log('remove: ' + id + type);
    $(me).parent().parent().remove();
    $.ajax({
        url: base_url + '/remove_me',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {
            user_id: token,
            type: type,
            id: id,
        },
    })
    .done(function(res) {
        console.log("success: " + j2s(res));
    })
    .fail(function(err) {
        console.log("error: " + j2s(err));
    })
    .always(function() {
        console.log("complete");
    });

}

//profile edit
function goto_edit_profile() {
    if (user_data.user_type == 'Shopper') {
        mainView.router.load({
            url: 'edit_profile_shopper.html',
            query: {
                id: token
            },
            ignoreCache: true,
        });
    } else {
        mainView.router.load({
            url: 'edit_profile_business.html',
            query: {
                id: token
            },
            ignoreCache: true,
        });
    }
}

function load_edit_profile_shopper() {
    myApp.showIndicator();
    $.ajax({
        url: base_url + '/get_user',
        type: 'POST',
        crossDomain: true,
        async: false,
        data: {
            user_id: token
        },
    })
    .done(function(res) {
        console.log('res: ' + j2s(res));
        myApp.hideIndicator();
        if (res.status = 'success') {
            user_data = res.data;

            calendarDefault = myApp.calendar({
                input: '.calendar-default',
                maxDate: new Date(),
                value: [new Date(user_data.dob)],
            });

            load_city('#edit_profile_shopper-city_select');

            $('#edit_profile_shopper-city_select').change(function(event) {
                var city_id = $(this).val();
                console.log('city_id: ' + city_id);
                load_location('#edit_profile_shopper-location_select', city_id, function(){});
            });
            load_location('#edit_profile_shopper-location_select', user_data.city_id, load_location_after_city_load_for_edit_profile_shopper);
            $('#edit_profile_shopper-name').val(user_data.name);
            $('#edit_profile_shopper-email').val(user_data.username);
            $('#edit_profile_shopper-phone').val(user_data.phone);
            $('#edit_profile_shopper-city_select').val(user_data.city_id);
            // $('#edit_profile_shopper-location_select').val(user_data.location_id);
            // $('input[name=edit_profile_shopper-gender][value='+user_data.gender+']').attr('checked', true); 
            image_from_device = user_data.image;
        } else {
            myApp.alert('Some error occurred');
        }
    }).fail(function(err) {
        myApp.hideIndicator();
        myApp.alert('Some error occurred');
    }).always();
}

function load_edit_profile_business() {
    myApp.showIndicator();
    $.ajax({
        url: base_url + '/get_user',
        type: 'POST',
        crossDomain: true,
        data: {
            user_id: token
        },
    })
    .done(function(res) {
        console.log('res: ' + j2s(res));
        myApp.hideIndicator();
        if (res.status = 'success') {
            user_data = res.data;

            calendarDefault = myApp.calendar({
                input: '.calendar-default',
                maxDate: new Date(),
                value: [new Date(user_data.dob)],
            });

            load_city('#edit_profile_business-city_select');

            $('#edit_profile_business-city_select').change(function(event) {
                var city_id = $(this).val();
                console.log('city_id: ' + city_id);
                load_location('#edit_profile_business-location_select', city_id, function(){});
            });
            load_location('#edit_profile_business-location_select', user_data.city_id, load_location_after_city_load_for_edit_profile_business);
            $('#edit_profile_business-name').val(user_data.name);
            $('#edit_profile_business-email').val(user_data.username);
            $('#edit_profile_business-phone').val(user_data.phone);
            $('#edit_profile_business-city_select').val(user_data.city_id);
            $('#edit_profile_business-buissness').val(user_data.bussiness_name);
            load_category('#edit_profile_business-category', set_category_business_edit);
            $('input[name=edit_profile_business-gender][value='+user_data.gender+']').attr('checked', true); 
            image_from_device = user_data.image;
        } else {
            myApp.alert('Some error occurred');
        }
    }).fail(function(err) {
        myApp.hideIndicator();
        myApp.alert('Some error occurred');
    }).always();
}

function load_location_after_city_load_for_edit_profile_shopper() {
    $('#edit_profile_shopper-location_select').val(user_data.location_id);
}

function load_location_after_city_load_for_edit_profile_business() {
    $('#edit_profile_business-location_select').val(user_data.location_id);
}

function set_category_business_edit() {
    var categories = user_data.bussiness_category_id.split(",");
    $( "#edit_profile_business-category" ).val(categories);
}

function update_shopper_profile() {
    console.log('shopper-update');
    console.log(calendarDefault.value);
    var name = $('#edit_profile_shopper-name').val().trim();
    var email = $('#edit_profile_shopper-email').val().trim();
    var city_id = $('#edit_profile_shopper-city_select').val();
    var location_id = $('#edit_profile_shopper-location_select').val();
    var gender = $('input[name=edit_profile_shopper-gender]:checked').val();
    var dob = $('#edit_profile_shopper-dob').val().trim();
    var profile_image = image_from_device.trim();
    var phone = $('#edit_profile_shopper-phone').val().trim();

    if (name == '') {
        myApp.alert('Please provide name.');
        return false;
    }
    if (email == '') {
        myApp.alert('Please provide email id.');
        return false;
    }
    if (!email.match(email_regex)) {
        myApp.alert('Please provide valid email id.');
        return false;
    }
    if (!phone.match(phone_regex)) {
        myApp.alert('Please enter valid phone number.');
        return false;
    }
    if (city_id == '') {
        myApp.alert('Please provide city.');
        return false;
    }
    if (!location_id) {
        myApp.alert('Please provide location.');
        return false;
    }
    if (!gender) {
        myApp.alert('Please select gender.');
        return false;
    }
    if (dob == '') {
        myApp.alert('Please enter date of birth.');
        return false;
    }
    if (profile_image == '') {
        myApp.alert('Please upload profile image.');
        return false;
    }

    myApp.showIndicator();
    $.ajax({
        url: base_url + '/update_user',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {
            id: token,
            identity: email,
            username: email,
            first_name: name,
            city_id: city_id,
            location_id: location_id,
            gender: gender,
            dob: dob,
            image: profile_image,
            medium: 'register',
            user_type: 'Shopper',
            phone: phone,
        },
    })
    .done(function(res) {
        console.log("success: " + j2s(res));
        myApp.hideIndicator();
        if (res.status == 'success') {
            myApp.alert('Successfully updated.');
            mainView.router.refreshPage();
        } else {
            myApp.alert('Some error occurred');
        }
    })
    .fail(function(err) {
        myApp.hideIndicator();
        console.log("error: " + j2s(err));
        // myApp.alert("error: "+j2s(err));
    })
    .always(function() {
        console.log("complete");
    });
}

function edit_profile_business() {
    console.log('business-update');
    console.log(calendarDefault.value);
    var name = $('#edit_profile_business-name').val().trim();
    var email = $('#edit_profile_business-email').val().trim();
    var city_id = $('#edit_profile_business-city_select').val();
    var location_id = $('#edit_profile_business-location_select').val();
    var gender = $('input[name=edit_profile_business-gender]:checked').val();
    var profile_image = image_from_device.trim();
    var phone = $('#edit_profile_business-phone').val().trim();
    var business_name = $('#edit_profile_business-buissness').val().trim();
    var category = $('#edit_profile_business-category').val();
    var business_category = '';

    $.each(category, function(index, val) {
        business_category += val + ',';
    });
    business_category = business_category.slice(0, -1);

    if (name == '') {
        myApp.alert('Please provide name.');
        return false;
    }
    if (email == '') {
        myApp.alert('Please provide email.');
        return false;
    }
    if (!email.match(email_regex)) {
        myApp.alert('Please provide valid email id.');
        return false;
    }
    if (!phone.match(phone_regex)) {
        myApp.alert('Please enter valid phone number.');
        return false;
    }
    if (business_name==''){
        myApp.alert('Please provide business name.');
        return false;
    }
    if (city_id == '') {
        myApp.alert('Please provide city.');
        return false;
    }
    if (!location_id) {
        myApp.alert('Please provide location.');
        return false;
    }
    if (!gender) {
        myApp.alert('Please select gender.');
        return false;
    }
    if (profile_image == '') {
        myApp.alert('Please upload profile image.');
        return false;
    }
    if (!business_category) {
        myApp.alert('Please choose category.');
        return false;
    }

    myApp.showIndicator();
    $.ajax({
        url: base_url + '/update_user',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {
            id: token,
            identity: email,
            username: email,
            first_name: name,
            city_id: city_id,
            location_id: location_id,
            gender: gender,
            image: profile_image,
            phone: phone,
            bussiness_name: business_name,
            bussiness_category_id: business_category,
        },
    })
    .done(function(res) {
        console.log("success: " + j2s(res));
        myApp.hideIndicator();
        if (res.status == 'success') {
            myApp.alert('Successfully updated.');
            mainView.router.refreshPage();
        } else {
            myApp.alert('some error');
        }
    })
    .fail(function(err) {
        myApp.hideIndicator();
        console.log("error: " + j2s(err));
        // myApp.alert("error: "+j2s(err));
    })
    .always(function() {
        console.log("complete");
    });
}
//edit profile end

//load chat list
function load_chats() {
    myApp.showIndicator();
    $.ajax({
        url: base_url+'/get_chat_list',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {
            user_id: token,
        },
    })
    .done(function(res) {
        console.log("success: "+j2s(res.data));
        if (res.status=='success') {
            var html = '';
            if (res.data==null || res.data.length==0) {
                console.log('chats not found.');
                html = "<p style='text-align: center'>To chat, please follow Shopper/Brands.</p>";
                $('#shopper_chat_list').html(html);
            }
            $.each(res.data, function(index, val) {
                console.log(val.user);
            //     val = val[0];
                var profile_link = '';
                var profile_image = '';

                if (val.user.image.indexOf('http') != -1) {
                    profile_image = val.user.image;
                } else {
                    profile_image = image_url + val.user.image;
                }

                html += 
                '<li class="">'+
                    '<a href="chat.html?id='+val.user.id+'" class="item-content">'+
                        '<div class="item-media notify_box"><img src="'+profile_image+'" width="44"></div>'+
                        '<div class="item-inner">'+
                            '<div class="item-title-row">'+
                                '<div class="item-title" style="color: rgba(0,0,0,0.71)">'+val.user.name+'</div>'+
                            '</div>'+
                            '<div class="item-subtitle notify_sub" style="color: rgba(0,0,0,0.71)">'+val.msg.message+'</div>'+
                            '<p class="item-subtitle notify_sub" style="color: rgba(0,0,0,0.71);text-align: right;margin: 0;">'+val.user.user_type+'</p>'+
                        '</div>'+
                    '</a>'+
                '</li>';
            });

            $('#shopper_chat_list').html(html);
        }
        myApp.hideIndicator();
    })
    .fail(function() {
        myApp.hideIndicator();
        console.log("error");
        var html = "<p style='text-align: center'>To chat, please follow Shopper/Brands.</p>";
        $('#shopper_chat_list').html(html);
    })
    .always(function() {
        console.log("complete");
    });
}

//load chat history
function load_chat(reciever_id) {
    $('#send_chat_btn').val(reciever_id);
    myApp.showIndicator();
    $.ajax({
        url: base_url+'/get_chat_history',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {
            from_id: token,
            to_id: reciever_id,
        },
    })
    .done(function(res) {
        console.log("success: "+j2s(res));
        // Init Messages
        myChat = myApp.messages('.messages', {
            autoLayout: true
        });

        // Init Messagebar
        myChatMessagebar = myApp.messagebar('.messagebar');

        if (res.status=='success') {
            $.each(res.data, function(index, val) {
                var messageType = '';

                if (val.from_id==token) {
                    messageType = 'sent';
                    name = '';
                } else {
                    messageType = 'received';
                    name = val.name;
                }

                var d = new Date(val.created_time);

                // Add message
                myChat.addMessage({
                    // Message text
                    text: val.message,
                    // Random message type
                    type: messageType,
                    // Avatar and name:
                    name: name,
                    // Day
                    day: days[d.getDay()] + ' ' + months[d.getMonth()] + ' ' + d.getDate() + ' ' + d.getFullYear(),
                    time: d.getHours() + ':' + d.getMinutes(),
                });
            });
            
            new_chat_interval = setInterval(function() {
                load_new_chat(reciever_id);
            }, 2000);
        }
        myApp.hideIndicator();
    })
    .fail(function() {
        myApp.hideIndicator();
        console.log("error");
    })
    .always(function() {
        console.log("complete");
    });
}

function load_new_chat(reciever_id) {
    $('#send_chat_btn').val(reciever_id);
    $.ajax({
        url: base_url+'/get_new_chat',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {
            from_id: token,
            to_id: reciever_id,
        },
    })
    .done(function(res) {
        console.log("success: "+j2s(res));
        if (res.status=='success') {
            $.each(res.data, function(index, val) {
                var messageType = '';

                if (val.from_id==token) {
                    messageType = 'sent';
                    name = '';
                } else {
                    messageType = 'received';
                    name = val.name;
                }

                var d = new Date(val.created_time);

                // Add message
                myChat.addMessage({
                    // Message text
                    text: val.message,
                    // Random message type
                    type: messageType,
                    // Avatar and name:
                    name: name,
                    // Day
                    day: days[d.getDay()] + ' ' + months[d.getMonth()] + ' ' + d.getDate() + ' ' + d.getFullYear(),
                    time: d.getHours() + ':' + d.getMinutes(),
                });
            });
        }
    })
    .fail(function() {
        console.log("error");
    })
    .always(function() {
        console.log("complete");
    });
}

function send_chat() {
    reciever_id = $('#send_chat_btn').val();

    var messageText = myChatMessagebar.value().trim();
    // Exit if empy message
    if (messageText.length === 0) return;

    // Empty messagebar
    myChatMessagebar.clear()

    // Random message type
    var messageType = 'sent';
    d = new Date();

    // Avatar and name for received message
    var name = '';
    // Add message
    myChat.addMessage({
        // Message text
        text: messageText,
        // Random message type
        type: messageType,
        // Avatar and name:
        name: name,
        // Day
        day: days[d.getDay()] + ' ' + months[d.getMonth()] + ' ' + d.getDate() + ' ' + d.getFullYear(),
        time: d.getHours() + ':' + d.getMinutes(),
    });

    $.ajax({
        url: base_url + '/save_chat',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {
            from_id: token,
            to_id: reciever_id,
            message: messageText
        },
    })
    .done(function(res) {
        console.log('res: ' + j2s(res));
        if (res.status == 'success') {} else {}
    })
    .fail(function(err) {
        myApp.alert('Some error occurred');
        console.log('error: ' + j2s(err));
    }).always();
}
//end chat

//profile view
function goto_profile() {
    if (user_data.user_type == 'Shopper') {
        mainView.router.load({
            url: 'profile_shopper.html',
            query: {
                id: token
            },
            ignoreCache: true,
        });
    } else {
        mainView.router.load({
            url: 'profile_business.html',
            query: {
                id: token
            },
            ignoreCache: true,
        });
    }
}

function load_shopper_profile(user_id) {
    console.log('user_id: ' + user_id);
    console.log('token: ' + token);
    $('.follow_block').hide();
    $.ajax({
        url: base_url + '/get_user_profile',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {
            my_id: token,
            user_id: user_id,
            type:'buzz',
        },
    })
    .done(function(res) {
        console.log("success: " + j2s(res));
        if (res.status == 'success') {
            var followers_image = '';
            var followers_profile_link = '';
            var followings_image = '';
            var followings_profile_link = '';
            var image = '';
            var like_link = '';
            if (res.data.medium == 'register') {
                image = image_url + res.data.image;
            } else {
                image = res.data.image;
            }
            // if (res.data.cover_profile == null) {
            //     $('.cover_image').attr('src', 'http://casaestilo.in/neonbuzz_d/neonbuzz_app/www/img/default_cover_image.jpg');
            // } else {
            //     $('.cover_image').attr('src', image_url + res.data.cover_profile);
            // }
            $('.profie_image').attr('src', image);
            $('.pro_pic_background').attr('src', image);

            if (parseInt(user_id) != parseInt(token)) {
                // vstr
                $('.follow_block').show();
                $('.cover_image_btn').hide();
                $('.user_status').hide();

                if (res.follow_status == 'unfollow') {
                    $('.unfollow').show();
                    $('.follow').hide();
                } else {
                    $('.unfollow').hide();
                    $('.follow').show();
                }
            } else {
                // me
                $('.follow_block').hide();  
                $('.cover_image_btn').show();
                // $('.delete_buzz').show();
                $('.status_me').change(function(event) {
                    status_update($(this).val());
                });
            }

            $('.status_vstr').text(res.data.status);
            $('.status_me').val(res.data.status);

            if (res.data.status == '') {
                $('.status').text('');
            } else {
                $('.status').text(res.data.status);
            }

            $('.followers').text(res.followers);
            $('.followings').text(res.followings);

            $('.chat').click(function(event) {
                goto_single_chat(res.data.id);
            });

            $('.follow').click(function(event) {
                follow(res.data.id);
            });

            $('.unfollow').click(function(event) {
                unfollow(res.data.id);
            });

            $('.p_name').text(res.data.name);

            var myApp = new Framework7();
 
            var $$ = Dom7;
             
            $$('.followers-popup').on('click', function () {
              var popupHTML = '<div class="popup" style="background-color: #393939;">'+
                                '<div class="navbar header">'+
                                    '<div class="navbar-inner">'+
                                        '<div class="left"></div>'+
                                        '<div style="margin: 0 4% !important;" class="center title1" id="single-header">Followers List</div>'+
                                        '<div class="right">'+
                                            '<a href="#" class="close-popup link icon-only">'+
                                                '<i class="material-icons" style="color:#000;margin-left: -5px;">close</i>'+
                                            '</a>'+
                                        '</div>'+
                                    '</div>'+
                                '</div>'+
                                '<div class="list-block" style="background_color:black;">'+
                                    '<ul style="padding-left: 0; list-style: none;"">';
                                        $.each(res.followers_data, function(index, val) {
                                            if (val.image.indexOf('http') != -1) {
                                                followers_image = val.image;
                                            } else {
                                                followers_image = image_url + val.image;
                                            }
                                            if (val.user_type == 'Shopper') {
                                                followers_profile_link = 'profile_shopper.html?id=' + val.id;
                                            } else {
                                                followers_profile_link = 'profile_business.html?id=' + val.id;
                                            }
                                            
                                            // popupHTML += 
                                            // '<li style="padding-top: 70px;" class="item-content" data-id="'+val.id+'">'+
                                            //     '<a href="'+followers_profile_link+'" class="card c_ard ks-facebook-card close-popup">'+
                                            //     '<div class="black_overlay"></div>'+
                                            //     '<div class="card-header no-border pro_view">'+
                                            //         '<div class="ks-facebook-avatar pro_pic"><img src="'+followers_image+'" style="height: inherit;"></div>'+
                                            //          '<div class="ks-facebook-name item-title pro_name" style="overflow: inherit !important;display: table-cell;left:21% !important;">'+val.name+
                                            //     '<div class="ks-facebook-name" style="margin-left: 1px;font-size:12px; !important">'+val.user_type+'</div></div>'+
                                            // '</li>';
                                                    
                                            popupHTML += 
                                            '<li>'+
                                                '<a href="'+followers_profile_link+'" class="item-content close-popup">'+
                                                    '<div class="item-media"><img src="'+followers_image+'" width="44"></div>'+
                                                    '<div class="item-inner search-text">'+
                                                        '<div class="item-title-row">'+
                                                            '<div class="item-title">'+val.name+'</div>'+
                                                            '<div class="item-subtitle">'+val.user_type+'</div>'+
                                                        '</div>'+
                                                    '</div>'+
                                                '</a>'+
                                            '</li>';


                                        });
                                            popupHTML += '';
                                    '</ul>'+
                                '</div>'+
                              '</div>';
              myApp.popup(popupHTML);
            });
            
            $$('.followings-popup').on('click', function () {
              var popupHTML = '<div class="popup" style="background-color: #393939;">'+
                                '<div class="navbar header">'+
                                    '<div class="navbar-inner">'+
                                        '<div class="left"></div>'+
                                        '<div style="margin: 0 4% !important;" class="center title1" id="single-header">Followings List</div>'+
                                        '<div class="right">'+
                                            '<a href="#" class="close-popup link icon-only">'+
                                                '<i class="material-icons" style="color:#000;margin-left: -5px;">close</i>'+
                                            '</a>'+
                                        '</div>'+
                                    '</div>'+
                                '</div>'+
                                '<div class="list-block" style="background_color:black;">'+
                                    '<ul style="padding-left: 0; list-style: none;"">';
                                        $.each(res.followings_data, function(index, val) {
                                            if (val.image.indexOf('http') != -1) {
                                                followings_image = val.image;
                                            } else {
                                                followings_image = image_url + val.image;
                                            }
                                            if (val.user_type == 'Shopper') {
                                                followings_profile_link = 'profile_shopper.html?id=' + val.id;
                                            } else {
                                                followings_profile_link = 'profile_business.html?id=' + val.id;
                                            }

                                            // popupHTML += 
                                            // '<li style="padding-top: 70px;" class="item-content" data-id="'+val.id+'">'+
                                            //     '<a href="'+followings_profile_link+'" class="card c_ard ks-facebook-card close-popup">'+
                                            //     '<div class="black_overlay"></div>'+
                                            //     '<div class="card-header no-border pro_view">'+
                                            //         '<div class="ks-facebook-avatar pro_pic"><img src="'+followings_image+'" style="height: inherit;"></div>'+
                                            //         '<div class="ks-facebook-name item-title pro_name" style="overflow: inherit !important;display: table-cell;left:21% !important;">'+val.name+
                                            //         '<div class="ks-facebook-name item-title " style="font-size:12px; !important">'+val.user_type+'</div>'+
                                            //     '</div>'+
                                            // '</li>';

                                            popupHTML += 
                                            '<li>'+
                                                '<a href="'+followings_profile_link+'" class="item-content close-popup">'+
                                                    '<div class="item-media"><img src="'+followings_image+'" width="44"></div>'+
                                                    '<div class="item-inner search-text">'+
                                                        '<div class="item-title-row">'+
                                                            '<div class="item-title">'+val.name+'</div>'+
                                                            '<div class="item-subtitle">'+val.user_type+'</div>'+
                                                        '</div>'+
                                                    '</div>'+
                                                '</a>'+
                                            '</li>';
                                                    
                                            
                                        });
                                            popupHTML += '';
                                    '</ul>'+
                                '</div>'+
                              '</div>';
              myApp.popup(popupHTML);
            });

            var buzz = '';
            var type = 'buzz';
            $.each(res.buzz, function(index, val) {
                if (val.is_liked == '1') {
                    // already liked
                    like_link = '<a href="javascript:void(0);" data-liked="1" class="" onClick="like1(' + val.buzz_data.id + ', \'' + type + '\', this)"><i class="material-icons white_heart" style="margin-left: 64px;margin-top: 26px;">favorite</i></a>';
                } else {
                    like_link = '<a href="javascript:void(0);" data-liked="0" class="" onClick="like1(' + val.buzz_data.id + ', \'' + type + '\', this)"><i class="material-icons white_heart" style="margin-left: 64px;margin-top: 26px;">favorite_border</i></a>';
                }
                buzz+= 
                '<div class="card c_ard ks-facebook-card" >'+
                    '<img src="'+image_url+val.buzz_data.image+'" class="wdh" alt="" /></a>'+
                    '<div style="position: absolute;top: 0%;background: rgba(19, 17, 17, 0.32);right: 0;padding: 2%;text-align: right;color: white;">'+
                        '<i class="material-icons" style="font-size: 13px !important;color: red;">favorite</i>&nbsp;'+
                        '<span class="count_buzz_like">'+val.buzz_count+'</span> likes<br>'+
                                '₹&nbsp;<span>'+val.buzz_data.price+'</span>'+
                    '</div>';
                    if (parseInt(user_id) == parseInt(token)) {
                        buzz += '<div class="card-footer no-border like_share delete_buzz" style="top: 75% !important;">' +
                            // '<h1 style="color: white;">6</h1><a href="javascript:void(0);" class="" onClick=""><i class="material-icons white_heart" style="">favorite</i></a>'+
                                    '<a href="javascript:void(0);" class="" onclick="buzz_delete(' + val.buzz_data.id + ', this)"><i class="material-icons" style="color: white;margin-left:49px;margin-top:27px;">delete</i></a>'+
                                '</div>';
                    } else{
                         buzz += '<div class="card-footer no-border like_share delete_buzz" style="top: 75% !important;">' +
                            // '<h1 style="color: white;">6</h1><a href="javascript:void(0);" class="" onClick=""><i class="material-icons white_heart" style="">favorite</i></a>'+
                                    like_link+
                                '</div>';
                    }
               buzz+=  '</div>';
            });
            $('.profile-buzz-container').html(buzz);
        }
    })
    .fail(function(err) {
        console.log("error: " + j2s(err));
    })
    .always(function() {
        console.log("complete");
    });
}

//buzz delete

function buzz_delete(id, me) {
    console.log('buzz_delete: ' + id );
    myApp.confirm('Are you sure?', 'delete this buzz', function () {
        // myApp.alert('You clicked Ok button');
        $(me).parent().parent().remove();
        $.ajax({
            url: base_url + '/buzz_delete',
            type: 'POST',
            dataType: 'json',
            crossDomain: true,
            data: {
                user_id: token,
                id: id,
            },
        })
        .done(function(res) {
            console.log("success: " + j2s(res));
            myApp.alert('Buzz Successfully deleted.');
        })
        .fail(function(err) {
            console.log("error: " + j2s(err));
        })
        .always(function() {
            console.log("complete");
        });
    });
}

function load_business_profile(user_id) {
    console.log('user_id: ' + user_id);
    console.log('token: ' + token);
    $('.follow_block').hide();
    $.ajax({
        url: base_url + '/get_user_profile',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {
            my_id: token,
            user_id: user_id,
            type:'offer',
        },
    })
    .done(function(res) {
        console.log("success: " + j2s(res));
        if (res.status == 'success') {
            var followers_image = '';
            var followers_profile_link = '';
            var followings_image = '';
            var followings_profile_link = '';
            var image = '';
            if (res.data.medium == 'register') {
                image = image_url + res.data.image;
            } else {
                image = res.data.image;
            }
            // if (res.data.cover_profile == null) {
            //     $('.cover_image').attr('src', 'http://casaestilo.in/neonbuzz_d/neonbuzz_app/www/img/default_cover_image.jpg');
            // } else {
            //     $('.cover_image').attr('src', image_url + res.data.cover_profile);
            // }
            // $('.cover_image').attr('src', image_url + res.data.cover_profile);
            $('.profie_image').attr('src', image);
            $('.pro_pic_background').attr('src', image);

            if (parseInt(user_id) != parseInt(token)) {
                console.log('vsts');
                $('.follow_block').show();

                if (res.follow_status == 'unfollow') {
                    $('.unfollow').show();
                    $('.follow').hide();
                } else {
                    $('.unfollow').hide();
                    $('.follow').show();
                }
            } else {
                console.log('me');
                $('.follow_block').hide();
            }

            $('.chat').click(function(event) {
                goto_single_chat(res.data.id);
            });

            $('.call').click(function(event) {
                dial_number(res.data.phone);
            });

            $('.p_name').text(res.data.name);
            $('.p_name1').text(res.data.bussiness_name);

            if (res.data.status == '') {
                $('.status').text('');
            } else {
                $('.status').text(res.data.status);
            }
            $('.followers').text(res.followers);
            $('.followings').text(res.followings);

            $('.follow').click(function(event) {
                follow(res.data.id);
            });

            $('.unfollow').click(function(event) {
                unfollow(res.data.id);
            });

            var myApp = new Framework7();
 
            var $$ = Dom7;
             
            $$('.followers-popup').on('click', function () {
              var popupHTML = '<div class="popup" style="background-color: #393939;">'+
                                '<div class="navbar header">'+
                                    '<div class="navbar-inner">'+
                                        '<div class="left"></div>'+
                                        '<div style="margin: 0 4% !important;" class="center title1" id="single-header">Followers List</div>'+
                                        '<div class="right">'+
                                            '<a href="#" class="close-popup link icon-only">'+
                                                '<i class="material-icons" style="color:#000;margin-left: -5px;">close</i>'+
                                            '</a>'+
                                        '</div>'+
                                    '</div>'+
                                '</div>'+
                                '<div class="list-block" style="background_color:black;">'+
                                    '<ul style="padding-left: 0; list-style: none;"">';
                                        $.each(res.followers_data, function(index, val) {
                                            if (val.image.indexOf('http') != -1) {
                                                followers_image = val.image;
                                            } else {
                                                followers_image = image_url + val.image;
                                            }
                                            if (val.user_type == 'Shopper') {
                                                followers_profile_link = 'profile_shopper.html?id=' + val.id;
                                            } else {
                                                followers_profile_link = 'profile_business.html?id=' + val.id;
                                            }
                                            // popupHTML += 
                                            // '<li style="padding-top: 70px;" class="item-content" data-id="'+val.id+'">'+
                                            //     '<a href="'+followers_profile_link+'" class="card c_ard ks-facebook-card close-popup">'+
                                            //     '<div class="black_overlay"></div>'+
                                            //     '<div class="card-header no-border pro_view">'+
                                            //         '<div class="ks-facebook-avatar pro_pic"><img src="'+followers_image+'" style="height: inherit;"></div>'+
                                            //          '<div class="ks-facebook-name item-title pro_name" style="overflow: inherit !important;display: table-cell;left:21% !important;">'+val.name+
                                            //     '<div class="ks-facebook-name" style="margin-left: 1px;font-size:12px; !important">'+val.user_type+'</div></div>'+
                                            // '</li>';

                                            popupHTML += 
                                            '<li>'+
                                                '<a href="'+followers_profile_link+'" class="item-content close-popup">'+
                                                    '<div class="item-media"><img src="'+followers_image+'" width="44"></div>'+
                                                    '<div class="item-inner search-text">'+
                                                        '<div class="item-title-row">'+
                                                            '<div class="item-title">'+val.name+'</div>'+
                                                            '<div class="item-subtitle">'+val.user_type+'</div>'+
                                                        '</div>'+
                                                    '</div>'+
                                                '</a>'+
                                            '</li>';
                                                    
                                            
                                        });
                                            popupHTML += '';
                                    '</ul>'+
                                '</div>'+
                              '</div>';
              myApp.popup(popupHTML);
            });
            
            $$('.followings-popup').on('click', function () {
              var popupHTML = '<div class="popup" style="background-color: #393939;">'+
                                '<div class="navbar header">'+
                                    '<div class="navbar-inner">'+
                                        '<div class="left"></div>'+
                                        '<div style="margin: 0 4% !important;" class="center title1" id="single-header">Followings List</div>'+
                                        '<div class="right">'+
                                            '<a href="#" class="close-popup link icon-only">'+
                                                '<i class="material-icons" style="color:#000;margin-left: -5px;">close</i>'+
                                            '</a>'+
                                        '</div>'+
                                    '</div>'+
                                '</div>'+
                                '<div class="list-block" style="background_color:black;">'+
                                    '<ul style="padding-left: 0; list-style: none;"">';
                                        $.each(res.followings_data, function(index, val) {
                                            if (val.image.indexOf('http') != -1) {
                                                followings_image = val.image;
                                            } else {
                                                followings_image = image_url + val.image;
                                            }
                                            if (val.user_type == 'Shopper') {
                                                followings_profile_link = 'profile_shopper.html?id=' + val.id;
                                            } else {
                                                followings_profile_link = 'profile_business.html?id=' + val.id;
                                            }
                                            // popupHTML += 
                                            // '<li style="padding-top: 70px;" class="item-content" data-id="'+val.id+'">'+
                                            //     '<a href="'+followings_profile_link+'" class="card c_ard ks-facebook-card close-popup">'+
                                            //     '<div class="black_overlay"></div>'+
                                            //     '<div class="card-header no-border pro_view">'+
                                            //         '<div class="ks-facebook-avatar pro_pic"><img src="'+followings_image+'" style="height: inherit;"></div>'+
                                            //         '<div class="ks-facebook-name item-title pro_name" style="overflow: inherit !important;display: table-cell;left:21% !important;">'+val.name+
                                            //         '<div class="ks-facebook-name item-title " style="font-size:12px; !important">'+val.user_type+'</div>'+
                                            //     '</div>'+
                                            // '</li>';
                                            
                                            popupHTML += 
                                            '<li>'+
                                                '<a href="'+followings_profile_link+'" class="item-content close-popup">'+
                                                    '<div class="item-media"><img src="'+followings_image+'" width="44"></div>'+
                                                    '<div class="item-inner search-text">'+
                                                        '<div class="item-title-row">'+
                                                            '<div class="item-title">'+val.name+'</div>'+
                                                            '<div class="item-subtitle">'+val.user_type+'</div>'+
                                                        '</div>'+
                                                    '</div>'+
                                                '</a>'+
                                            '</li>';
                                                    
                                            
                                        });
                                            popupHTML += '';
                                    '</ul>'+
                                '</div>'+
                              '</div>';
              myApp.popup(popupHTML);
            });

           var offer = '';
           var like_link = '';
           var type = 'offer';
            $.each(res.offer, function(index, val) {
                 if (val.is_liked == '1') {
                    // already liked
                    like_link = '<a href="javascript:void(0);" data-liked="1" class="" onClick="like1(' + val.offer_data.id + ', \'' + type + '\', this)"><i class="material-icons white_heart" style="margin-left: 64px;margin-top: 26px;">favorite</i></a>';
                } else {
                    like_link = '<a href="javascript:void(0);" data-liked="0" class="" onClick="like1(' + val.offer_data.id + ', \'' + type + '\', this)"><i class="material-icons white_heart" style="margin-left: 64px;margin-top: 26px;">favorite_border</i></a>';
                }
                offer+= 
                '<div class="card c_ard ks-facebook-card" >'+
                    '<img src="'+image_url+val.offer_data.image+'" class="wdh" alt="" /></a>'+
                    '<div style="position: absolute;top: 0%;background: rgba(19, 17, 17, 0.32);right: 0;padding: 2%;text-align: right;color: white;">'+
                        '<i class="material-icons" style="font-size: 13px !important;color: red;">favorite</i>&nbsp;'+
                        '<span class="count_buzz_like">'+val.offer_count+'</span> likes<br>'+
                                '₹&nbsp;<span>'+val.offer_data.price+'</span>'+
                    '</div>';
                    if (parseInt(user_id) == parseInt(token)) {
                         offer+=
                        '<div class="card-footer no-border like_share delete_buzz" style="top: 75% !important;">' +
                             '<a href="javascript:void(0);" class="" onclick="offer_delete(' + val.offer_data.id + ', this)"><i class="material-icons" style="color: white;margin-left:49px;margin-top:27px;">delete</i></a>'+
                        '</div>';
                    }else {
                         offer+=
                         '<div class="card-footer no-border like_share delete_buzz" style="top: 75% !important;">' +
                            like_link+
                         '</div>';
                    }
               offer+=  '</div>';
            });
            $('.profile-offer-container').html(offer);
        }
    })
    .fail(function(err) {
        console.log("error: " + j2s(err));
    })
    .always(function() {
        console.log("complete");
    });
}

function offer_delete(id, me) {
    console.log('offer_delete: ' + id );
    myApp.confirm('Are you sure?', 'delete this offer', function () {
        // myApp.alert('You clicked Ok button');
        $(me).parent().parent().remove();
        $.ajax({
            url: base_url + '/offer_delete',
            type: 'POST',
            dataType: 'json',
            crossDomain: true,
            data: {
                user_id: token,
                id: id,
            },
        })
        .done(function(res) {
            console.log("success: " + j2s(res));
            myApp.alert('Buzz Successfully deleted.');
        })
        .fail(function(err) {
            console.log("error: " + j2s(err));
        })
        .always(function() {
            console.log("complete");
        });
    });
}

function status_update(status) {
    $.ajax({
        url: base_url+'/update_status',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {
            user_id: token,
            status: status,
        },
    })
    .done(function(res) {
        console.log("success: "+j2s(res));
    })
    .fail(function(err) {
        console.log("error: "+j2s(err));
    })
    .always(function() {
        console.log("complete");
    });
    
}

function goto_single_chat(id) {
    mainView.router.load({
        url: 'chat.html',
        query: {id: id},
        ignoreCache: false,
    });
}

function follow(id_to_follow) {
    console.log('id: ' + id_to_follow);
    $.ajax({
            url: base_url + '/follow',
            type: 'POST',
            dataType: 'json',
            crossDomain: true,
            data: {
                user_id: token,
                id_to_follow: id_to_follow,
            },
        })
        .done(function(response) {
            console.log("success: " + j2s(response));
            $('.follow').hide();
            $('.unfollow').show();
            // mainView.router.refreshPage();
        })
        .fail(function(data) {
            console.log("error: " + data);
        })
        .always(function() {
            console.log("complete");
        });

}

function unfollow(id_to_unfollow) {
    console.log('id: ' + id_to_unfollow);
    $.ajax({
        url: base_url + '/unfollow',
        type: 'POST',
        dataType: 'json',
        data: {
            user_id: token,
            id_to_unfollow: id_to_unfollow,
        },
    })
    .done(function(response) {
        console.log("success: " + j2s(response));
        $('.follow').show();
        $('.unfollow').hide();
        // mainView.router.refreshPage();
    })
    .fail(function() {
        console.log("error");
    })
    .always(function() {
        console.log("complete");
    });
}

function dial_number(phone) {
    window.open('tel:'+phone, '_system');
}
function profile_cover_image() {
    navigator.camera.getPicture(cover_image_onSuccess, shopper_register_onFail, {
        quality: 50,
        destinationType: Camera.DestinationType.FILE_URI,
        sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM,
        targetWidth: 800,
        targetHeight: 500,
        correctOrientation: true,
        allowEdit: true,
    });
}

function cover_image_onSuccess(fileURL) {
    myApp.showPreloader('uploading image');
    var uri = encodeURI(base_url + "/upload_user");
    var options = new FileUploadOptions();
    options.fileKey = "file";
    options.fileName = fileURL.substr(fileURL.lastIndexOf('/') + 1);
    options.mimeType = "image/jpeg";
    var headers = {
        'headerParam': 'headerValue'
    };
    options.headers = headers;
    new FileTransfer().upload(fileURL, uri, cover_image_onSuccess_file, shopper_register_onError_file, options);
}

function cover_image_onSuccess_file(res) {
    console.log('res: ' + j2s(res));
    myApp.hidePreloader();
    if (res.responseCode == 200) {
        uploaded_image = res.response.replace(/\"/g, "");
        // image_from_device = uploaded_image;
        myApp.confirm('Image uploaded. Are you sure?', 'NeonBuzz', function() {
            $.ajax({
                url: base_url+'/cover_image',
                type: 'POST',
                dataType: 'json',
                crossDomain: true,
                data: {
                    user_id: token,
                    cover_image: uploaded_image,
                },
            })
            .done(function(res) {
                console.log("cover image ok callback: "+j2s(res));
                myApp.alert('Cover image updated Successfully');
                // mainView.router.refreshPage();
                // if (uploaded_image =='') {
                //     $('.cover_image').attr('src', 'http://casaestilo.in/neonbuzz_d/neonbuzz_app/www/img/default_cover_image.jpg');
                // } else {
                    $('.cover_image').attr('src', image_url+uploaded_image);
                // }
            })
            .fail(function(err) {
                console.log("cover image ok callback: error: "+j2s(err));
            })
            .always(function() {
                console.log("complete");
            });
            
        });
        console.log('uploaded_image: ' + uploaded_image);
        // $('#shopper_register-profile_image').val(uploaded_image);
        // myApp.alert("Image Uploaded Successfully");
    } else {
        myApp.hidePreloader();
        myApp.alert('Some error occurred on uploading');
    }
}
//end profile

function load_search() {
    myApp.showIndicator();
    $.ajax({
        url: base_url+'/search',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {},
    })
    .done(function(res) {
        console.log("success: "+j2s(res));
        if (res.status=='success') {
            var html = '';
            $.each(res.data, function(index, val) {
                var profile_link = '';
                var profile_image = '';

                if (val.image.indexOf('http') != -1) {
                    profile_image = val.image;
                } else {
                    profile_image = image_url + val.image;
                }
                
                if (val.user_type == 'Shopper') {
                    profile_link = 'profile_shopper.html?id=' + val.id;
                } else {
                    profile_link = 'profile_business.html?id=' + val.id;
                }

               /* html += 
                '<li class="item-content" style="padding-left: 0; margin-top:1% !important" data-id="'+val.id+'">'+
                '<a href="'+profile_link+'" class="card c_ard ks-facebook-card">'+
                    '<div class="black_overlay"></div>'+
                    '<div class="card-header no-border pro_view">'+
                        '<div class="ks-facebook-avatar pro_pic"><img src="'+profile_image+'" style="height: inherit;"></div>';
                // if (val.user_type == 'Business') {
                    html += '<div class="ks-facebook-name item-title pro_name" style="overflow: inherit !important;display: table-cell;">'+val.name;
                // } else {
                    html += '<div class="ks-facebook-name" style="margin-top: -21px;margin-left: 174px">'+val.user_type+'</div></div>'+
                '</li>';*/


                html += '<li>'+
                            '<a href="'+profile_link+'" class="item-content">'+
                                '<div class="item-media"><img src="'+profile_image+'" width="44"></div>'+
                                    '<div class="item-inner search-text">'+
                                        '<div class="item-title-row">'+
                                            '<div class="item-title">'+val.name+'</div>'+
                                        '</div>'+
                                    '<div class="item-subtitle">'+val.user_type+'</div>'+
                                '</div>'+
                            '</a>'+
                        '</li>';
                
            });
            $('#search-list').html(html);
            myApp.initImagesLazyLoad($('[data-page="search"]'));
            
        }
        myApp.hideIndicator();
    })
    .fail(function() {
        myApp.hideIndicator();
        console.log("error");
    })
    .always(function() {
        console.log("complete");
    });
}

function load_offers() {
    myApp.showIndicator();
    $.ajax({
        url: base_url + '/load_offers',
        type: 'POST',
        data: {
            user_id: token,
        },
    })
    .done(function(res) {
        console.log('offers: ' + j2s(res));

        myApp.hideIndicator();
        if (res.status == 'success') {
            var html = '';
            $.each(res.data, function(index, val) {
                var pofile_image;
                var profile_link = '';
                var like_link = '';
                var tags = '';
                var type = 'offer';
                var count_like = '';
                var remove_link = '<a href="javascript:void(0);" style="display:none;" onclick="remove_me(' + val.id + ', \'' + type + '\', this)" class="dlt_lnk" ><i class="material-icons white_heart" style="font-size:30px !important;">delete</i></a>';
                // var remove_link = '<a href="#" onclick="remove_me(' + val.id + ', \'' + type + '\', this)" class="link">Remove</a>';
                var share_link = '<a href="javascript:void(0);" style="" onClick="share(\'http://neonbuzz.co/' + type + '/' + val.id + '\', \'' + image_url + val.image + '\')" class="shr_lnk" style=""><i class="material-icons white_heart" style="font-size:28px !important;">share</i></a>';
                // var share_link = '<a href="#" onClick="share(\'http://neonbuzz.co/' + type + '/' + val.id + '\', ' + image_url + val.image + ')" class="link">Share</a>';
                
                if (val.user_image.indexOf('http') != -1) {
                    profile_image = val.user_image;
                } else {
                    profile_image = image_url + val.user_image;
                }

                if (val.is_liked == '1') {
                    // already liked
                    like_link = '<a href="javascript:void(0);" data-liked="1" class="" onClick="like(' + val.id + ', \'' + type + '\', this)"><i class="material-icons white_heart">favorite</i></a>';
                } else {
                    like_link = '<a href="javascript:void(0);" data-liked="0" class="" onClick="like(' + val.id + ', \'' + type + '\', this)"><i class="material-icons white_heart" >favorite_border</i></a>';
                }

                if (val.user_type == 'Shopper') {
                    profile_link = 'profile_shopper.html?id=' + val.user_id;
                } else {
                    profile_link = 'profile_business.html?id=' + val.user_id;
                }

                var tagsArraay = val.tag.split(',');
                $.each(tagsArraay, function(tagsIndex, tagsVal) {
                    tags += ' #' + tagsVal + ',';
                });

                tags = tags.slice(0, -1);
                console.log('val.id: '+val.id);

                 if (val.offer_like == null) {
                    count_like = 0;
                }else{
                    count_like = val.count;
                }
       
                html +=
                    '<div class="card c_ard ks-facebook-card">' +
                        '<div class="black_overlay"></div>' +
                        '<a href="' + profile_link + '" class="card-header no-border pro_view">' +
                            // '<div class="price"> Price : ' + val.price + '</div>' +
                            '<div class="ks-facebook-avatar pro_pic">' +
                                '<img src="' + profile_image + '" width="34" height="34">' +
                            '</div>' +
                            '<div class="ks-facebook-name pro_name">' + val.user_name + '</div>' +
                            '<div class="ks-facebook-date pro_tag">'+tags+'</div>' +
                        '</a>' +
                        '<a class="card-content" >' +
                            '<img data-src="' + image_url + val.image + '" width="100%" class="lazy lazy-fadein">' +
                        '</a>' +
                         '<div style="position: absolute;top: 0%;background: rgba(19, 17, 17, 0.32);right: 0;padding: 2%;text-align: right;color: white;">'+
                            '<i class="material-icons" style="font-size: 13px !important;color: red;">favorite</i>&nbsp;'+
                            '<span class="count_buzz_like">'+count_like+' </span>likes<br>'+
                            '<span style="">₹&nbsp;'+val.price+'</span>'+
                        '</div>'+
                        '<div class="card-footer no-border like_share" style="padding: 4px;">' +
                            share_link +
                            // '<a href="javascript:void(0);" class="add_clk"><i class="material-icons white_heart">add_circle</i></a>'+
                            // remove_link +
                            like_link +
                            '<a href="javascript:void(0);" class="chat_lnk" onClick="goto_single_chat('+val.user_id+')"><i class="material-icons chat" style="font-size:28px !important;color:white;">chat</i></a>'+
                        '</div>' +
                    '</div>';
            });

            $('#offers-container').html(html);
            // $( ".add_clk" ).click(function() {
            //     $(this).prev( ".shr_lnk" ).slideToggle();
            //     $(this).next( ".dlt_lnk" ).slideToggle();
            //     // $(this).next( ".chat_lnk" ).slideToggle();
            // });
            myApp.initImagesLazyLoad($('[data-page="offers"]'));
        } else {
            var html = '<h4> Content not found.</h4>';
            $(selector).html(html);
        }
    }).fail(function(err) {
        myApp.hideIndicator();
        myApp.alert('Some error occurred on connecting.');
        console.log('fail: ' + j2s(err));
    }).always();
}


function load_notification() {
    myApp.showIndicator();
    $.ajax({
        url: base_url + '/notifications',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {
            user_id: token,
        },
    })
    .done(function(res) {
        console.log("success: " + j2s(res));
        myApp.hideIndicator();
        if (res.status == 'success') {
            var html = '';
            $.each(res.data, function(index, val) {
                var profile_image = '';
                if (val.image.indexOf('http') != -1) {
                    profile_image = val.image;
                } else {
                    profile_image = image_url + val.image;
                }

                var text = '';
                var id;
                // switch (val.category) {
                //     case 'buzz':
                //         text = 'liked your buzz.';
                //         id = val.category_id;
                //         break;
                //     case 'offer':
                //         text = 'liked your offer.';
                //         id = val.category_id;
                //         break;
                //     case 'follow':
                //         text = 'is following you.';
                //         id = val.user_id;
                //         break;
                //     default:
                //         // statements_def
                //         break;
                // }

                html +=
                '<li class="notify">'+
                    '<div class="item-content">'+
                        '<a onclick="come_form_notification_image(\''+val.category+'\', '+val.creator_id+', \''+val.user_type+'\')" class="item-media notify_box"><img src="'+profile_image+'" width="44"></a>'+
                        '<div class="item-inner" onclick="come_form_notification(\''+val.category+'\', '+id+', \''+val.user_type+'\')">'+
                            '<div class="item-title-row">'+
                                '<div class="item-title">'+val.name+'</div>'+
                            '</div>'+
                            '<div class="item-subtitle notify_sub">'+val.text+'</div>'+
                        '</div>'+
                    '</div>'+
                '</li>';
            });
            $('#notifications-ul').html(html);
        } else {
            myApp.alert('Some error occurred');
        }
    })
    .fail(function(err) {
        myApp.hideIndicator();
        console.log("error: " + j2s(err));
        // myApp.alert("error: "+j2s(err));
    })
    .always(function() {
        console.log("complete");
    });
}

function come_form_notification_image(cat, id, type) {
    console.log(cat+id+type);
    if (type == 'Shopper') {
        mainView.router.load({
            url: 'profile_shopper.html',
            query: {
                id: id
            },
            ignoreCache: true,
        });
    } else {
        mainView.router.load({
            url: 'profile_business.html',
            query: {
                id: id
            },
            ignoreCache: true,
        });
    }
}

function come_form_notification() {
    // ola
}

function load_notification_count() {
    $.ajax({
        url: base_url+'/get_chat_notification_count',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {
            user_id: token
        },
    })
    .done(function(res) {
        console.log("success: "+j2s(res));
        if (res.status=='success') {
            var notification = res.data.notification;
            var chat = res.data.chat;
            console.log('notification: '+notification);
            console.log('chat: '+chat);
            $('#chat_count').text(chat);
            $('#notification_count').text(notification);
        }
    })
    .fail(function(err) {
        console.log("error: "+j2s(err));
    })
    .always(function() {
        console.log("complete");
    });
    
}

document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
    document.addEventListener("backbutton", function(e) {
        e.preventDefault();
        var page = myApp.getCurrentView().activePage;
        myApp.hideIndicator();
        image_from_device = '';
        if (page.name == "buzzs" || page.name == "index" || page.name == "offers" ) {
            console.log('buzzs');
            myApp.confirm('would you like to exit app.', function() {
                navigator.app.clearHistory();
                gaPlugin.exit(nativePluginResultHandler, nativePluginErrorHandler);
                navigator.app.exitApp();
            });
        }
        else {
            console.log('else');
            mainView.router.back({});
            // navigator.app.backHistory();
        }
    }, false);

    gaPlugin = window.plugins.gaPlugin;
    gaPlugin.init(nativePluginResultHandler, nativePluginErrorHandler, "UA-78959047-1", 10);
}

function nativePluginResultHandler(result) {
    console.log('GA result: '+result);
    // alert('GA result: '+result);
}

function nativePluginErrorHandler(error) {
    console.log('GA error: '+error);
    // alert('GA error: '+error);
}

function sendemail(email){
    console.log(email);
    if (email == '') {
         myApp.alert('Email Field is empty');
    } else {
        $.ajax({
          url: base_url + '/forgot_password',
          type: 'POST',
          dataType: 'json',
          data:{
            email:email
          },    
        })
      .done(function(result) {
        if(result['status']=="success"){
          myApp.alert('Password Sent To The Registered Email ID');
          myApp.closeModal('.forgot_picker')
        } else {
              if(result['msg']=="no data"){
                myApp.alert('Please Enter The Registered Email ID');
              } else {

                alert("failed");
              }
        }  
      })
      .fail(function() {
        console.log("error");
      })
      .always(function() {
        console.log("complete");
      });
    }


}
