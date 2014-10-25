$(function () {
    $('.register-show').hide();

    $('.register-link').click(registering);
    $('.sign-in-link').click(logging);

    $('.register-btn').click(register);
    $('.sign-in-btn').click(signin);

    $('.well').hide();
});

function register(event) {
    event.preventDefault();

    var email = $('input[name="email"]').val();
    var pass = $('input[name="pass"]').val();
    var first = $('input[name="first"]').val();
    var last = $('input[name="last"]').val();

    if (!validateEmail(email)) {
        $('.well').html('Your email sucks.');
        $('.well').show();
        return;
    }

    if (pass.length < 5) {
        $('.well').html('Your password sucks.');
        $('.well').show();
        return;
    }

    if (first == "" || last == "") {
        $('.well').html('Pretty sure you have a full name.');
        $('.well').show();
        return;
    }

    var payload = {email: email, pass: pass, first: first, last: last};

    $.ajax({
        type: 'POST',
        url: '/register',
        data: payload,
        success: function (data) {
            if (data.code != null) {
                $('.well').html('Name or email already registered. Try another one, noob.');
                $('.well').show();
                console.log(data);
            } else {
                window.location.replace('/');
            }
        },
        statusCode: {
            400: function () {
                $('.well').html('You forgot to fill in an email or password. Or both.');
                $('.well').show();
            },
            401: function () {
                $('.well').html('Your email/pass combo was wrong.');
                $('.well').show();
            }
        }
    });
}

function signin(event) {
    event.preventDefault();

    var email = $('input[name="email"]').val();
    var pass = $('input[name="pass"]').val();

    var payload = {email: email, pass: pass};

    $.ajax({
        type: 'POST',
        url: '/login',
        data: payload,
        success: function (data) {
            window.location.replace('/');
        },
        statusCode: {
            400: function () {
                $('.well').html('You forgot to fill in an email or password. Or both.');
                $('.well').show();
            },
            401: function () {
                $('.well').html('Your email/pass combo was wrong.');
                $('.well').show();
            }
        }
    });
}

function registering(event) {
    $('.register-link').unbind('click');
    $('.sign-in-btn').unbind('click');

    event.preventDefault();
    $('.register-show').slideDown();
    $('.sign-in-btn').removeClass('sign-in-btn').addClass('register-btn').html('Register');
    $('.register-link').removeClass('register-link').addClass('sign-in-link').html('Back to Sign In');
    $('h1').html('Register');
    $('.register-btn').click(register);

    $('.sign-in-link').click(logging);
}

function logging(event) {
    $('.sign-in-link').unbind('click');
    $('.register-btn').unbind('click');

    event.preventDefault();
    $('.register-show').slideUp();
    $('.register-btn').removeClass('register-btn').addClass('sign-in-btn').html('Sign In');
    $('.sign-in-link').removeClass('sign-in-link').addClass('register-link').html('Register');
    $('h1').html('Login');
    $('.sign-in-btn').click(signin);

    $('.register-link').click(registering);
}

function validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}