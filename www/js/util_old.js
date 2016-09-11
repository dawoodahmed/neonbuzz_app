// function for app
function j2s(json) {
    return JSON.stringify(json);
}

function goto_register(type) {

    myApp.showIndicator();

    if (type == 'shopper') {
        mainView.router.load({
            url: 'shopper_register.html',
            ignoreCache: false,
        });
    } else {
        mainView.router.load({
            url: 'business_register.html',
            ignoreCache: false,
        });
    }
}

function goto_page(page) {
    mainView.router.load({
        url: page,
        ignoreCache: false,
    });
}

function bottom_tabs() {
    clearInterval(new_comment_interval);
    clearInterval(new_chat_interval);
    if (user_data.user_type == 'Shopper') {
        $('.buzzs').show();
        $('.offers').hide();
    } else {
        $('.buzzs').hide();
        $('.offers').show();
    }
}

function image_gallery() {
    navigator.camera.getPicture(shopper_register_onSuccess, shopper_register_onFail, {
        quality: 50,
        destinationType: Camera.DestinationType.FILE_URI,
        sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM,
        targetWidth: 720,
        targetHeight: 640,
        correctOrientation: true,
        allowEdit: true,
    });
}

function image_camera() {
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

function shopper_register_onError_file(error) {
    myApp.hidePreloader();
    console.log("An error has occurred: Code = " + error.code);
    console.log("upload error source " + error.source);
    console.log("upload error target " + error.target);
    myApp.alert("Some Error Occured While image upload please try again");
}

function shopper_register_onFail(message) {
    console.log('Failed because: ' + message);
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
                $('.cover_image').attr('src', image_url+uploaded_image);
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

function login() {
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
        url: base_url + '/login',
        type: 'POST',
        crossDomain: true,
        data: {
            "identity": email,
            "password": password,
        },
    })
    .done(function(res) {
        console.log('done: ' + j2s(res));
        myApp.hideIndicator();
        if (res.status == 'success') {
            Lockr.set('token', res.data.user_id);
            token = res.data.user_id;
            user_data = res.data;
            mainView.router.load({
                url: 'feeds.html',
                ignoreCache: false,
            });
        } else {
            myApp.alert('Email or Password Mismatch');
        }
    })
    .fail(function(err) {
        myApp.hideIndicator();
        myApp.alert('Some error occurred on connecting.');
        console.log('fail: ' + j2s(err));
    })
    .always(function() {});
}


$(document).on('change','#shopper_register-dob',function(){

    // console.log('working');

    var dob = $('#shopper_register-dob').val().trim();
    var date = dob;
    var parts = date.split("-");
    var y=parts[0];
    var m=parts[1]; // 15
    var date=parts[2]; // 2009

    var monthNames = ["January", "February", "March", "April", "May", "June","July", "August", "September", "October", "November", "December"];
    var d = new Date(dob);
    var monthstring=monthNames[d.getMonth()];
    var dated= date + '-' + monthstring +'-'+ y;

    console.log(dated);
    document.getElementById("shopper_register-dob").type = 'text';
    document.getElementById("shopper_register-dob").value = dated;
})


function register_shopper() {
    console.log('shopper_register');
    console.log(calendarDefault.value);
    var name = $('#shopper_register-name').val().trim();
    var email = $('#shopper_register-email').val().trim();
    var password = $('#shopper_register-password').val().trim();
    var confirm_password = $('#shopper_register-confirm_password').val().trim();
    var city_id = $('#shopper_register-city_select').val();
    var location_id = $('#shopper_register-location_select').val();
    var gender = $('input[name=shopper_register-gender]:checked').val();

    var dob = $('#shopper_register-dob').val().trim();

    // var dob = calendarDefault.value[0];
    // var profile_image = $('#shopper_register-profile_image').val().trim();
    var profile_image = image_from_device.trim();
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
        url: base_url + '/create_user',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {
            identity: email,
            username: email,
            email:email,
            first_name: name,
            password: password,
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
            Lockr.set('token', res.data.user_id);
            token = res.data.user_id;
            user_data = res.data;
            mainView.router.load({
                url: 'feeds.html',
                ignoreCache: false,
                query: {
                    register: true
                },
            });
        } else {
            myApp.alert('Email or Password mismatch');
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
        myApp.alert('Please upload profile image.');
        return false;
    }

    $.each(category, function(index, val) {
        business_category += val + ',';
    });
    business_category = business_category.slice(0, -1);

    myApp.showIndicator();
    $.ajax({
        url: base_url + '/create_user',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {
            identity: email,
            username: email,
            first_name: name,
            password: password,
            city_id: city_id,
            location_id: location_id,
            gender: gender,
            image: profile_image,
            medium: 'register',
            user_type: 'Business',
            bussiness_name: business_name,
            bussiness_category_id: business_category,
            phone: phone,
        },
    })
    .done(function(res) {
        console.log("success: " + j2s(res));
        myApp.hideIndicator();
        if (res.status == 'success') {
            Lockr.set('token', res.data.user_id);
            token = res.data.user_id;
            user_data = res.data;
            mainView.router.load({
                url: 'feeds.html',
                ignoreCache: false,
                query: {
                    register: true
                },
            });
        } else {
            myApp.alert('Email or Password mismatch');
        }
    })
    .fail(function(err) {
        console.log("error: " + j2s(err));
        myApp.alert("error: " + j2s(err));
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

function logout() {
    Lockr.flush();
    token = false;
    mainView.router.load({
        url: 'index.html',
        ignoreCache: false,
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

function load_location_after_city_load_for_edit_profile_shopper() {
    $('#edit_profile_shopper-location_select').val(user_data.location_id);
}

function load_location_after_city_load_for_edit_profile_business() {
    $('#edit_profile_business-location_select').val(user_data.location_id);
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
            $('#edit_profile_shopper-name').val(user_data.first_name);
            $('#edit_profile_shopper-email').val(user_data.username);
            $('#edit_profile_shopper-phone').val(user_data.phone);
            $('#edit_profile_shopper-city_select').val(user_data.city_id);
            // $('#edit_profile_shopper-location_select').val(user_data.location_id);
            $('input[name=edit_profile_shopper-gender][value='+user_data.gender+']').attr('checked', true); 
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
            $('#edit_profile_business-name').val(user_data.first_name);
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

function set_category_business_edit() {
    var categories = user_data.bussiness_category_id.split(",");
    $( "#edit_profile_business-category" ).val(categories);
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

function load_buzzs_offers(type, selector) {
    myApp.showIndicator();
    $.ajax({
        url: base_url + '/buzzs_offers',
        type: 'POST',
        data: {
            user_id: token,
            type: type,
        },
    })
    .done(function(res) {
        // console.log('buzzsoffers: ' + j2s(res));

        myApp.hideIndicator();
        if (res.status == 'success') {
            var html = '';
            $.each(res.data, function(index, val) {
                var pofile_image;
                var profile_link = '';
                var like_link = '';
                var tags = '';
                var remove_link = '<a href="javascript:void(0);" style="display:none;" onclick="remove_me(' + val.id + ', \'' + type + '\', this)" class="dlt_lnk" ><i class="material-icons white_heart" style="font-size:30px !important;">delete</i></a>';
                // var remove_link = '<a href="#" onclick="remove_me(' + val.id + ', \'' + type + '\', this)" class="link">Remove</a>';
                var share_link = '<a href="javascript:void(0);" style="display:none;" onClick="share(\'http://neonbuzz.co/' + type + '/' + val.id + '\', \'' + image_url + val.image + '\')" class="shr_lnk" style=""><i class="material-icons white_heart" style="font-size:28px !important;">share</i></a>';
                // var share_link = '<a href="#" onClick="share(\'http://neonbuzz.co/' + type + '/' + val.id + '\', ' + image_url + val.image + ')" class="link">Share</a>';
                if (val.profile_img.indexOf('http') != -1) {
                    profile_image = val.profile_img;
                } else {
                    profile_image = image_url + val.profile_img;
                }

                if (val.is_liked == '1') {
                    // already liked
                    like_link = '<a href="javascript:void(0);" data-liked="1" class="" onClick="like(' + val.id + ', \'' + type + '\', this)"><i class="material-icons white_heart">favorite</i></a>';
                } else {
                    like_link = '<a href="javascript:void(0);" data-liked="0" class="" onClick="like(' + val.id + ', \'' + type + '\', this)"><i class="material-icons white_heart">favorite_border</i></a>';
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
                console.log('tags: '+tags);

                html +=
                    '<div class="card c_ard ks-facebook-card">' +
                        '<div class="black_overlay"></div>' +
                        '<a href="' + profile_link + '" class="card-header no-border pro_view">' +
                            '<div class="ks-facebook-avatar pro_pic">' +
                                '<img src="' + profile_image + '" width="34" height="34">' +
                            '</div>' +
                            '<div class="ks-facebook-name pro_name">' + val.first_name + '</div>' +
                            '<div class="ks-facebook-date pro_tag">'+tags+'</div>' +
                        '</a>' +
                        '<a class="card-content" href="'+type+'.html?id=' + val.id + '">' +
                            '<img data-src="' + image_url + val.image + '" width="100%" class="lazy lazy-fadein">' +
                        '</a>' +
                        '<div class="card-footer no-border like_share">' +
                            share_link +
                            '<a href="javascript:void(0);" class="add_clk"><i class="material-icons white_heart">add_circle</i></a>'+
                            remove_link +
                            like_link +
                        '</div>' +
                    '</div>';
            });
            $(selector).html(html);
            $( ".add_clk" ).click(function() {
                $(this).prev( ".shr_lnk" ).slideToggle();
                $(this).next( ".dlt_lnk" ).slideToggle();
            });
            myApp.initImagesLazyLoad($('[data-page="' + type + 's' + '"]'));
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

function load_buzz_offer(type, id) {
    //gaPlugin.trackEvent( nativePluginResultHandler, nativePluginErrorHandler, "single_"+type, "view", id, parseInt(token));
    myApp.showIndicator();
    $.ajax({
        url: base_url + '/buzz_offer',
        type: 'POST',
        data: {
            id: id,
            user_id: token,
            type: type,
        },
    })
    .done(function(res) {
        console.log('buzzoffer: ' + j2s(res));

        myApp.hideIndicator();
        if (res.status = 'success' && res.res_cnt == '') {
            var html = '';
            var val = res.data[0];
            // $.each(res.data, function(index, val) {
            var tags = '';
            var pofile_image;
            if (val.profile_img.indexOf('http') != -1) {
                profile_image = val.profile_img;
            } else {
                profile_image = image_url + val.profile_img;
            }

            var tagsArraay = val.tag.split(',');
            $.each(tagsArraay, function(tagsIndex, tagsVal) {
                tags += ' #' + tagsVal + ',';
            });
            tags = tags.slice(0, -1);
            console.log('tags: '+tags);


            html +=
                '<div class="card c_ard ks-facebook-card">' +
                    '<div class="black_overlay"></div>' +
                    '<div class="card-header no-border pro_view">' +
                        '<div class="ks-facebook-avatar pro_pic">' +
                            '<img src="' + profile_image + '" width="34" height="34">' +
                        '</div>' +
                        '<div class="ks-facebook-name pro_name">' + val.first_name + '</div>' +
                        '<div class="ks-facebook-date pro_tag">'+tags+'</div>' +
                    '</div>' +
                    '<div class="card-content">' +
                        '<img data-src="' + image_url + val.image + '" width="100%" class="lazy lazy-fadein">' +
                    '</div>' +
                '</div>'+
                '<div class="card-footer no-border pad_5">' +
                    '<div class="desc">' + val.description + '</div>' +
                '</div>';
            // });
            $('#' + type + '-container').html(html);
            $('#buzzoffer_comment').data('id', val.id);
            myApp.initImagesLazyLoad($('[data-page="' + type + '"]'));
        } else {
            var html = '<p>Feed not found.</p>';
            $('#' + type + '-container').html(html);
        }
    }).fail(function(err) {
        myApp.hideIndicator();
        myApp.alert('Some error occurred on connecting.');
        console.log('fail: ' + j2s(err));
    }).always();
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
            var notification = res.data.notification[0].notification_count;
            var chat = res.data.chat[0].chat_count;
            console.log('notification: '+notification);
            console.log('chat: '+chat);
            $('.chats').find('span').text(chat);
            $('.notifications').find('span').text(notification);
        }
    })
    .fail(function(err) {
        console.log("error: "+j2s(err));
    })
    .always(function() {
        console.log("complete");
    });
    
}

function load_feeds() {
    load_notification_count();
    setInterval(function() {
        load_notification_count();
    }, 5000);
    if (user_data.user_type=='Shopper') {
        $('#buzzCreate').show();
        $('#offerCreate').hide();
    }else {
        $('#buzzCreate').hide();
        $('#offerCreate').show();
    }
    myApp.showIndicator();
    $.ajax({
        url: base_url + '/feeds',
        type: 'POST',
        data: {
            user_id: token,
        },
    })
    .done(function(res) {
        // console.log('feeds: ' + j2s(res));

        myApp.hideIndicator();
        console.log("Feeds status"+ res.status);
        console.log("ENtered console log");
        if (res.status == 'success') {
            var html = '';
            var type = 'feed';
            $.each(res.data, function(index, val) {
                var pofile_image;
                var like_link = '';
                var profile_link = '';
                var tags = '';
                var share_link = '<a href="javascript:void(0);" style="display:none;" onClick="share(\'http://neonbuzz.co/' + type + '/' + val.id + '\', \'' + image_url + val.image + '\')" class="shr_lnk" style=""><i class="material-icons white_heart" style="font-size:28px !important;">share</i></a>';
                if (val.profile_img.indexOf('http') != -1) {
                    profile_image = val.profile_img;
                } else {
                    profile_image = image_url + val.profile_img;
                }

                if (val.is_liked == '1') {
                    // already liked
                    like_link = '<a href="javascript:void(0);" data-liked="1" class="" onClick="like(' + val.id + ', \'' + type + '\', this)"><i class="material-icons white_heart">favorite</i></a>';
                } else {
                    like_link = '<a href="javascript:void(0);" data-liked="0" class="" onClick="like(' + val.id + ', \'' + type + '\', this)"><i class="material-icons white_heart">favorite_border</i></a>';
                }
				
				var remove_link = '<a href="javascript:void(0);" style="display:none;" onclick="remove_me(' + val.id + ', \'' + type + '\', this)" class="dlt_lnk" ><i class="material-icons white_heart" style="font-size:30px !important;">delete</i></a>';

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
                console.log('tags: '+tags);

                html +=
                    '<div class="card c_ard ks-facebook-card">' +
						'<div class="black_overlay"></div>' +
						'<a href="' + profile_link + '" class="card-header no-border pro_view">' +
							'<div class="ks-facebook-avatar pro_pic">' +
								'<img src="' + profile_image + '" width="34" height="34">' +
							'</div>' +
							'<div class="ks-facebook-name pro_name">' + val.first_name + '</div>' +
							'<div class="ks-facebook-date pro_tag">'+tags+'</div>' +
						'</a>' +
						'<a class="card-content" href="feed.html?id=' + val.id + '">' +
							'<img data-src="' + image_url + val.image + '" width="100%" class="lazy lazy-fadein">' +
						'</a>' +
						'<div class="card-footer no-border like_share">' +
							share_link +
							'<a href="javascript:void(0);" class="add_clk"><i class="material-icons white_heart">add_circle</i></a>'+
							remove_link +
							like_link +
						'</div>' +
                    '</div>';
            });
            $('#feeds-container').html(html);
			
			$( ".add_clk" ).click(function() {
				$(this).prev( ".shr_lnk" ).slideToggle();
				$(this).next( ".dlt_lnk" ).slideToggle();
			});
			
            myApp.initImagesLazyLoad($('[data-page="feeds"]'));
        } else {
            var html = '<h4> Feeds not found.</h4>';
            $('#feeds-container').html(html);
        }
    }).fail(function(err) {
        myApp.hideIndicator();
        myApp.alert('Some error occurred on connecting.');
        console.log('fail: ' + j2s(err));
    }).always();
}

function load_feed(id) {
    //gaPlugin.trackEvent( nativePluginResultHandler, nativePluginErrorHandler, "single_feed", "view", id, parseInt(token));
    myApp.showIndicator();
    $.ajax({
        url: base_url + '/feed',
        type: 'POST',
        data: {
            user_id: token,
            feed_id: id,
        },
    })
    .done(function(res) {
        console.log('feed: ' + j2s(res));

        myApp.hideIndicator();
        if (res.status = 'success' && res.res_cnt>0) {
            var html = '';
            var type = 'feed';
            var val = res.data[0];
            var tags = '';
            // $.each(res.data, function(index, val) {
            var pofile_image;
            var like_link = '';
            if (val.profile_img.indexOf('http') != -1) {
                profile_image = val.profile_img;
            } else {
                profile_image = image_url + val.profile_img;
            }

            var tagsArraay = val.tag.split(',');
            $.each(tagsArraay, function(tagsIndex, tagsVal) {
                tags += ' #' + tagsVal + ',';
            });
            tags = tags.slice(0, -1);
            console.log('tags: '+tags);


            html +=
                '<div class="card c_ard ks-facebook-card">' +
					'<div class="black_overlay"></div>' +
					'<div class="card-header no-border pro_view">' +
						'<div class="ks-facebook-avatar pro_pic">' +
							'<img src="' + profile_image + '" width="34" height="34">' +
						'</div>' +
						'<div class="ks-facebook-name pro_name">' + val.first_name + '</div>' +
						'<div class="ks-facebook-date pro_tag">'+tags+'</div>' +
					'</div>' +
					'<div class="card-content">' +
						'<img data-src="' + image_url + val.image + '" width="100%" class="lazy lazy-fadein">' +
					'</div>' +
				'</div>'+
				'<div class="card-footer no-border pad_5">' +
					'<div class="desc">' + val.description + '</div>' +
				'</div>';
            // });
            $('#feed-container').html(html);
            $('#feed_comment').data('id', val.id);
            myApp.initImagesLazyLoad($('[data-page="feed"]'));
        } else {
            var html = '<p>Feed not found.</p>';
            $('#feed-container').html(html);
        }
    }).fail(function(err) {
        myApp.hideIndicator();
        myApp.alert('Some error occurred on connecting.');
        console.log('fail: ' + j2s(err));
    }).always();
}

function load_comments(type, id) {
    $.ajax({
        url: base_url + '/comments',
        type: 'POST',
        data: {
            user_id: token,
            type: type,
            id: id,
        },
    })
    .done(function(res) {
        console.log('comments: ' + j2s(res));

        if (res.status = 'success') {
            var html = '';
            var myMessagebar = myApp.messagebar('.messagebar');
            myComment = myApp.messages('.messages', {
                autoLayout: false,
                newMessagesFirst: true
            });
            new_comment_time = '2000-01-01 20:38:56';
            $.each(res.data, function(index, val) {
                var pofile_image;
                var like_link = '';
                if (val.image.indexOf('http') != -1) {
                    profile_image = val.image;
                } else {
                    profile_image = image_url + val.image;
                }
                var date = new Date(val.created_date);

                var conversationStarted = false;
                var messageText = val.comment;
                // Exit if empy message
                if (messageText.length === 0) console.log('www');

                // Empty messagebar
                // myMessagebar.clear()

                // Random message type
                // var messageType = (['sent', 'received'])[Math.round(Math.random())];
                var messageType = 'received';

                // Avatar and name for received message
                var avatar, name;
                avatar = profile_image;
                name = val.first_name;

                myComment.addMessage({
                    // Message text
                    text: messageText,
                    // Random message type
                    type: messageType,
                    // Avatar and name:
                    avatar: avatar,
                    name: name,
                    // Day
                    day: get_day(date),
                    time: date.getHours() + ':' + date.getMinutes(),
                });
                new_comment_time = val.created_date;
            });
            // $('#feed-container').html(html);
            comment_time = new_comment_time;
            comment_type = type;
            comment_post_id = id;

            new_comment_interval = setInterval(load_new_comments, 1000);
            myApp.initImagesLazyLoad($('[data-page="' + type + '"]'));
        } else {
            console.log('Some error occurred');
        }
    }).fail(function(err) {
        // myApp.hideIndicator();
        myApp.alert('Some error occurred on connecting.');
        console.log('fail: ' + j2s(err));
    }).always();
}

function load_new_comments() {
    // console.log('new_comments: '+type+id+time);
    $.ajax({
        url: base_url + '/new_comments',
        type: 'POST',
        crossDomain: true,
        data: {
            user_id: token,
            type: comment_type,
            id: comment_post_id,
            time: comment_time,
        },
    })
    .done(function(res) {
        console.log('new_comments: ' + j2s(res));

        if (res.status = 'success') {
            var html = '';
            // var type = 'feed';
            new_comment_time = comment_time;
            $.each(res.data, function(index, val) {
                var pofile_image;
                var like_link = '';
                if (val.image.indexOf('http') != -1) {
                    profile_image = val.image;
                } else {
                    profile_image = image_url + val.image;
                }

                var date = new Date(val.created_date);

                var conversationStarted = false;
                var messageText = val.comment;
                // Exit if empy message
                if (messageText.length === 0) console.log('www');

                // Empty messagebar
                // myMessagebar.clear()

                // Random message type
                // var messageType = (['sent', 'received'])[Math.round(Math.random())];
                var messageType = 'received';

                // Avatar and name for received message
                var avatar, name;
                avatar = profile_image;
                name = val.first_name;

                myComment.addMessage({
                    // Message text
                    text: messageText,
                    // Random message type
                    type: messageType,
                    // Avatar and name:
                    avatar: avatar,
                    name: name,
                    // Day
                    day: get_day(date),
                    time: date.getHours() + ':' + date.getMinutes(),
                });
                new_comment_time = val.created_date;
            });
            comment_time = new_comment_time;
        } else {
            console.log('Some error occurred');
        }
    }).fail(function(err) {
        myApp.alert('Some error occurred on connecting.');
        console.log('fail: ' + j2s(err));
    }).always();
}

function add_comment_feed() {
    var comment = $('#feed_comment').val();
    $('#feed_comment').val('');
    var id = $('#feed_comment').data('id');
    if (comment == '') {
        return false;
    }
    add_comment('feed', id, comment);
}

function add_comment_buzz() {
    var comment = $('#buzzoffer_comment').val();
    $('#buzzoffer_comment').val('');
    var id = $('#buzzoffer_comment').data('id');
    if (comment == '') {
        return false;
    }
    add_comment('buzz', id, comment);
}

function add_comment_offer() {
    var comment = $('#buzzoffer_comment').val();
    $('#buzzoffer_comment').val('');
    var id = $('#buzzoffer_comment').data('id');
    if (comment == '') {
        return false;
    }
    add_comment('offer', id, comment);
}

function add_comment(type, type_id, comment) {
    var pofile_image;
    var like_link = '';
    if (user_data.image.indexOf('http') != -1) {
        profile_image = user_data.image;
    } else {
        profile_image = image_url + user_data.image;
    }

    var date = new Date();

    var messageText = comment;

    // Empty messagebar
    // myMessagebar.clear()

    // Random message type
    // var messageType = (['sent', 'received'])[Math.round(Math.random())];
    var messageType = 'received';

    // Avatar and name for received message
    var avatar, name;
    avatar = profile_image;
    name = user_data.first_name;

    myComment.addMessage({
        // Message text
        text: messageText,
        // Random message type
        type: messageType,
        // Avatar and name:
        avatar: avatar,
        name: name,
        // Day
        day: get_day(date),
        time: date.getHours() + ':' + date.getMinutes(),
    });

    $.ajax({
        url: base_url + '/add_comment',
        type: 'POST',
        dataType: 'json',
        data: {
            user_id: token,
            type: type,
            type_id: type_id,
            comment: comment,
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

function add_feed() {
    console.log('add_feed');
    var feed_image = image_from_device.trim();
    var description = $('#create_feed-description').val().trim();
    var tags = $('#create_feed-tags').val().trim();
    var location_id = $('#create_feed-location').val();

    if (feed_image == '') {
        // myApp.alert('Please upload image.');
        // return false;
        feed_image = 'neon_buzz.jpg';
    }
    if (description == '') {
        myApp.alert('Please provide description.');
        return false;
    }
    if (tags == '') {
        myApp.alert('Please provide tag.');
        return false;
    }
    if (!location_id) {
        myApp.alert('Please select location.');
        return false;
    }

    myApp.showIndicator();
    $.ajax({
        url: base_url + '/create_feed',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {
            user_id: token,
            tag: tags,
            description: description,
            image: feed_image,
            location: location_id,
        },
    })
    .done(function(res) {
        console.log("success: " + j2s(res));
        myApp.hideIndicator();
        if (res.status == 'success') {
            mainView.router.load({
                url: 'feeds.html',
                ignoreCache: false,
            });
        } else {
            myApp.alert('provide valid data');
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

function add_buzz_offer(type) {
    console.log('add_buzzoffer');
    var buzz_offer_image = image_from_device.trim();
    var tags = $('#create_buzz-tags').val().trim();
    var location_id = $('#create_buzz-location').val().trim();
    var categories = $('#create_buzz-categories').val();
    var description = $('#create_buzz-description').val().trim();

    if (buzz_offer_image == '') {
        // myApp.alert('Please provide image.');
        // return false;
        buzz_offer_image = 'neon_buzz.jpg';
    }
    if (tags == '') {
        myApp.alert('Please provide tag.');
        return false;
    }
    if (!location_id) {
        myApp.alert('Please select location.');
        return false;
    }
    if (!categories) {
        myApp.alert('Please select categories.');
        return false;
    }
    if (description == '') {
        myApp.alert('Please provide description.');
        return false;
    }

    myApp.showIndicator();
    $.ajax({
        url: base_url + '/create_buzz_offer',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {
            user_id: token,
            image: buzz_offer_image,
            location: location_id,
            tags: tags,
            categories: categories,
            description: description,
            type: type,
        },
    })
    .done(function(res) {
        console.log("success: " + j2s(res));
        myApp.hideIndicator();
        if (res.status == 'success') {
            mainView.router.load({
                url: type + 's.html',
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
                switch (val.category) {
                    case 'feed':
                        text = 'liked your feed.';
                        id = val.category_id;
                        break;
                    case 'buzz':
                        text = 'liked your buzz.';
                        id = val.category_id;
                        break;
                    case 'offer':
                        text = 'liked your offer.';
                        id = val.category_id;
                        break;
                    case 'follow':
                        text = 'is following you.';
                        id = val.user_id;
                        break;
                    default:
                        // statements_def
                        break;
                }

                html +=
                '<li class="notify">'+
                    '<div class="item-content">'+
                        '<a onclick="come_form_notification_image(\''+val.category+'\', '+id+', \''+val.user_type+'\')" class="item-media notify_box"><img src="'+profile_image+'" width="44"></a>'+
                        '<div class="item-inner" onclick="come_form_notification(\''+val.category+'\', '+id+', \''+val.user_type+'\')">'+
                            '<div class="item-title-row">'+
                                '<div class="item-title">'+val.first_name+'</div>'+
                            '</div>'+
                            '<div class="item-subtitle notify_sub">'+text+'</div>'+
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

function come_form_notification(cat, id, type) {
    console.log(cat+id+type);
    $.ajax({
        url: base_url+'/read_notification',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {
            user_id: token,
            category: cat,
            category_id: id,
        },
    })
    .done(function(res) {
        console.log("success: "+j2s(res));
        if (res.status=='success') {
            console.log('working');
        }
    })
    .fail(function(err) {
        console.log("error: "+j2s(err));
    })
    .always(function() {
        console.log("complete");
    });
    
    switch (cat) {
        case 'feed':
            mainView.router.load({
                url: 'feed.html',
                query: {
                    id: id
                },
                ignoreCache: true,
            });
            break;
        case 'buzz':
            mainView.router.load({
                url: 'buzz.html',
                query: {
                    id: id
                },
                ignoreCache: true,
            });
            break;
        case 'offer':
            mainView.router.load({
                url: 'offer.html',
                query: {
                    id: id
                },
                ignoreCache: true,
            });
            break;
        case 'follow':
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
            break;
        default:
            // statements_def
            break;
    }
    
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

function load_shopper_profile(user_id) {
    //gaPlugin.trackEvent( nativePluginResultHandler, nativePluginErrorHandler, "shopper_profile", "view", user_id, parseInt(token));
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
        },
    })
    .done(function(res) {
        console.log("success: " + j2s(res));
        if (res.status == 'success') {
            var image = '';
            if (res.data.medium == 'register') {
                image = image_url + res.data.image;
            } else {
                image = res.data.image;
            }
            $('.cover_image').attr('src', image_url + res.data.cover_profile);
            $('.profie_image').attr('src', image);

            /*
            *   visitor or self view of profile
            */
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

            $('.p_name').text(res.data.first_name);

            var feeds = '';
            $.each(res.feeds, function(index, val) {
                feeds+= 
                '<div class="own_feed">'+
                    '<a href="feed.html?id='+val.id+'"><img src="'+image_url+val.image+'" class="wdh" alt="" /></a>'+
                '</div>';
            });
            $('.profile-feed-container').html(feeds);
        }
    })
    .fail(function(err) {
        console.log("error: " + j2s(err));
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

function load_business_profile(user_id) {
    //gaPlugin.trackEvent( nativePluginResultHandler, nativePluginErrorHandler, "business_profile", "view", user_id, parseInt(token));
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
        },
    })
    .done(function(res) {
        console.log("success: " + j2s(res));
        if (res.status == 'success') {
            var image = '';
            if (res.data.medium == 'register') {
                image = image_url + res.data.image;
            } else {
                image = res.data.image;
            }

            $('.cover_image').attr('src', image_url + res.data.cover_profile);
            $('.profie_image').attr('src', image);

            if (parseInt(user_id) != parseInt(token)) {
                console.log('vsts');
                $('.follow_block').show();
                $('.cover_image_btn').hide();

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
                $('.cover_image_btn').show();
            }

            $('.chat').click(function(event) {
                goto_single_chat(res.data.id);
            });

            $('.call').click(function(event) {
                dial_number(res.data.phone);
            });

            $('.p_name').text(res.data.first_name);
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

            columns = res.columns;
            series = res.series;

            $('.chart_container').highcharts({
                chart: {
                    type: 'column'
                },
                title: {
                    text: 'Monthly Follow'
                },
                subtitle: {
                    text: 'Brand Stats'
                },
                xAxis: {
                    categories: columns,
                    crosshair: true
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: 'No. of follows'
                    }
                },
                tooltip: {
                    headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                    pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y:.1f} follows</b></td></tr>',
                    footerFormat: '</table>',
                    shared: true,
                    useHTML: true
                },
                plotOptions: {
                    column: {
                        pointPadding: 0.2,
                        borderWidth: 0
                    }
                },
                series: series,
            });

            var feeds = '';
            $.each(res.feeds, function(index, val) {
                feeds+= 
                '<div class="own_feed">'+
                    '<a href="feed.html?id='+val.id+'"><img src="'+image_url+val.image+'" class="wdh" alt="" /></a>'+
                '</div>';
            });
            $('.profile-feed-container').html(feeds);
        }
    })
    .fail(function(err) {
        console.log("error: " + j2s(err));
    })
    .always(function() {
        console.log("complete");
    });
}

function dial_number(phone) {
    window.open('tel:'+phone, '_system');
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


function get_day(date) {
    return date.getDate() + '/' + date.getMonth() + '/' + date.getFullYear();
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
        $(me).html('<i class="material-icons white_heart">favorite</i>');
    } else {
        // $(me).css('backgroundColor', 'lime');
        $(me).data('liked', '0');
        $(me).html('<i class="material-icons white_heart">favorite_border</i>');
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

function forgot_password() {
    var email = $('#forgot_password-email').val().trim();

    if (email == '') {
        myApp.alert('Email id should be provided.');
        return false;
    } else if (!email.match(email_regex)) {
        myApp.alert('Valid email id should be provided.');
        return false;
    }

    $.ajax({
        url: base_url + '/forgot_password',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {
            email: email,
        },
    })
    .done(function(res) {
        console.log("success: " + j2s(res));
        if (res.status=='success') {
            myApp.alert('Password has been reset. Please check your email for updated password.');
        }
    })
    .fail(function(err) {
        console.log("error: " + j2s(err));
    })
    .always(function() {
        console.log("complete");
    });

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

                html += 
                '<li class="item-content" style="padding-left: 0; margin-top:1% !important" data-id="'+val.id+'">'+
                '<a href="'+profile_link+'" class="card c_ard ks-facebook-card">'+
                    '<div class="black_overlay"></div>'+
                    '<div class="card-header no-border pro_view">'+
                        '<div class="ks-facebook-avatar pro_pic"><img src="'+profile_image+'" width="34" height="34"></div>';
                if (val.user_type == 'Business') {
                    html += '<div class="ks-facebook-name item-title pro_name">'+val.first_name+'  '+val.bussiness_name+'</div>';
                } else {
                    html += '<div class="ks-facebook-name item-title pro_name">'+val.first_name+'</div>';
                }
                html += '</div>'+
                    '<div class="card-content"><img data-src="'+image_url+val.cover_profile+'" width="100%" class="lazy-fadein lazy-loaded" src="'+image_url+val.cover_profile+'"></div>'+
                '</a>'
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
        console.log("success: "+j2s(res));
        if (res.status=='success') {
            var html = '';
            console.log('res.data.shopper: '+res.data.shopper);
            if (res.data.shopper==null || res.data.shopper.length==0) {
                console.log('chats not found.');
                html = "<p style='text-align: center'>To chat, please follow Shopper/Brands.</p>";
                $('#shopper_chat_list').html(html);
            }
            $.each(res.data.shopper, function(index, val) {
                val = val[0];
                var profile_link = '';
                var profile_image = '';

                if (val.image.indexOf('http') != -1) {
                    profile_image = val.image;
                } else {
                    profile_image = image_url + val.image;
                }

                // if (val.user_type == 'Shopper') {
                //     profile_link = 'profile_shopper.html?id=' + val.id;
                // } else {
                //     profile_link = 'profile_business.html?id=' + val.id;
                // }

                html += 
                '<li class="">'+
                    '<a href="chat.html?id='+val.id+'" class="item-content">'+
                        '<div class="item-media notify_box"><img src="'+profile_image+'" width="44"></div>'+
                        '<div class="item-inner">'+
                            '<div class="item-title-row">'+
                                '<div class="item-title" style="color: rgba(0,0,0,0.71)">'+val.first_name+'</div>'+
                            '</div>'+
                            '<div class="item-subtitle notify_sub" style="color: rgba(0,0,0,0.71)">'+val.message+'</div>'+
                            '<p class="item-subtitle notify_sub" style="color: rgba(0,0,0,0.71);text-align: right;margin: 0;">'+val.user_type+'</p>'+
                        '</div>'+
                    '</a>'+
                '</li>';
            });

            $('#shopper_chat_list').html(html);

            /*html = '';
            val = null;
            $.each(res.data.business, function(index, val) {
                val = val[0];
                var profile_link = '';
                var profile_image = '';

                if (val.image.indexOf('http') != -1) {
                    profile_image = val.image;
                } else {
                    profile_image = image_url + val.image;
                }*/

                // if (val.user_type == 'Shopper') {
                //     profile_link = 'profile_shopper.html?id=' + val.id;
                // } else {
                //     profile_link = 'profile_business.html?id=' + val.id;
                // }

                /*html += 
                '<li class="">'+
                    '<a href="chat.html?id='+val.id+'" class="item-content">'+
                        '<div class="item-media notify_box"><img src="'+profile_image+'" width="44"></div>'+
                        '<div class="item-inner">'+
                            '<div class="item-title-row">'+
                                '<div class="item-title" style="color: rgba(0,0,0,0.71)">'+val.first_name+'</div>'+
                            '</div>'+
                            '<div class="item-subtitle notify_sub" style="color: rgba(0,0,0,0.71)">'+val.message+'</div>'+
                        '</div>'+
                    '</a>'+
                '</li>';
            });
            $('#business_chat_list').html(html);*/
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
                    name = val.first_name;
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
                    name = val.first_name;
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
    // console.log('reciever_id: '+reciever_id); return;

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

function facebook_login() {
    openFB.login('email',
        function() {
            get_info();
        },
        function() {
            alert('Facebook login failed');
        }
    );
}

function get_info() {
    openFB.api({
        path: '/me',
        success: function(data) {
            login_via_fb(data);
        },
        error: function(response) {
            alert('Not able to access data');
        }
    });
}

function login_via_fb(data) {

    myApp.showIndicator();
    $.ajax({
        url: base_url + '/create_user',
        type: 'POST',
        dataType: 'json',
        crossDomain: true,
        data: {
            fb_id: data.id,
            first_name: data.name,
            image: 'http://graph.facebook.com/'+data.id+'/picture',
            medium: 'facebook',
            user_type: 'Shopper',
        },
    })
    .done(function(res) {
        console.log("success: " + j2s(res));
        myApp.hideIndicator();
        if (res.status == 'success') {
            Lockr.set('token', res.data.user_id);
            token = res.data.user_id;
            user_data = res.data;
            mainView.router.load({
                url: 'feeds.html',
                ignoreCache: false,
            });
        } else {
            myApp.alert('Email or Password mismatch');
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
    $.ajax({
        url: base_url + '/facebook_login',
        type: 'POST',
        crossDomain: true,
        data: {
            "user_id" : data.id,
            "name" : data.name,
        },
    })
    .done(function(res) {
        console.log('done: ' + j2s(res));
        myApp.hideIndicator();
        if (res.status == 'success') {
            Lockr.set('token', res.data.user_id);
            token = res.data.user_id;
            user_data = res.data;
            mainView.router.load({
                url: 'feeds.html',
                ignoreCache: false,
            });
        } else {
            myApp.alert('Email or Password mismatch');
        }
    })
    .fail(function(err) {
        myApp.hideIndicator();
        myApp.alert('Some error occurred on connecting.');
        console.log('fail: ' + j2s(err));
    })
    .always(function() {});
}

function continue_btn() {
    if (!token == false) {
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
                mainView.router.load({
                    url: 'feeds.html',
                    ignoreCache: false,
                });
            } else {
                mainView.router.load({
                    url: 'login.html',
                    ignoreCache: false,
                });
            }
        }).fail(function(err) {
            myApp.hideIndicator();
            myApp.alert('Some error occurred');
        }).always();
    } else {
        mainView.router.load({
            url: 'login.html',
            ignoreCache: false,
        });
    }
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

document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
    document.addEventListener("backbutton", function(e) {
        e.preventDefault();
        var page = myApp.getCurrentView().activePage;
        myApp.hideIndicator();
        image_from_device = '';
        if (page.name == "feeds" || page.name == "index") {
            console.log('feeds');
            myApp.confirm('would you like to exit app.', function() {
                navigator.app.clearHistory();
                gaPlugin.exit(nativePluginResultHandler, nativePluginErrorHandler);
                navigator.app.exitApp();
            });
        } else {
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

