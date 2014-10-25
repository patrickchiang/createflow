$(function () {
    $('.well').hide();
    $('.sign-in-btn').click(signin);
});

function signin(event) {
    event.preventDefault();

    var email = $('input[name="email"]').val();
    var pass = $('input[name="pass"]').val();

    var payload = {email: email, pass: pass};

    $.ajax({
        type: 'POST',
        url: '/login-admin',
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