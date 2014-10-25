var express = require('express');
var mysql = require('mysql');
var fs = require('fs');
var bcrypt = require('bcrypt-nodejs');
var passport = require('passport'), LocalStrategy = require('passport-local').Strategy;
var session = require('express-session');
var bodyParser = require('body-parser');

var app = express();
var mysql_config = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'createflow',
    multipleStatements: true
};

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.use(session({
    secret: 'create flow is the best as always',
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

passport.use('local-user', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'pass'
    },
    function (username, password, done) {
        var sql = "SELECT * FROM users WHERE email = ?;";
        var insert = [username];
        sql = mysql.format(sql, insert);

        var connection = mysql.createConnection(mysql_config);
        connection.connect();
        connection.query(sql, function (err, results) {
            if (err) {
                console.log(err);
            } else {
                console.log(results);
                if (results == null || results[0] == null)
                    return done(null, false);
                if (bcrypt.compareSync(password, results[0].password)) {
                    var user = results[0];
                    return done(null, {
                        user_id: user.user_id,
                        first_name: user.first_name,
                        last_name: user.last_name,
                        email: user.email
                    });
                }
                return done(null, false);
            }
            return done(null, false);
        });
        connection.end();
    }
));

passport.use('local-admin', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'pass'
    },
    function (username, password, done) {
        var sql = "SELECT * FROM users WHERE email = ?;";
        var insert = [username];
        sql = mysql.format(sql, insert);

        var connection = mysql.createConnection(mysql_config);
        connection.connect();
        connection.query(sql, function (err, results) {
            if (err) {
                console.log(err);
            } else {
                console.log(results);
                if (results == null || results[0] == null)
                    return done(null, false);
                if (results[0].user_type == 'admin' && bcrypt.compareSync(password, results[0].password)) {
                    var user = results[0];
                    return done(null, {
                        user_id: user.user_id,
                        first_name: user.first_name,
                        last_name: user.last_name,
                        email: user.email,
                        user_type: 'admin'
                    });
                }
                return done(null, false);
            }
            return done(null, false);
        });
        connection.end();
    }
));

app.get('/', function (req, res, next) {
    if (!req.user) {
        res.redirect('/login.html');
    } else {
        res.redirect('/index.html');
    }
});

app.post('/addGroup', function (req, res) {
    var sql = "INSERT INTO groups (group_name, group_owner_id) VALUES (?, ?);";
    var insert = [req.body.name, req.body.owner_id];
    sql = mysql.format(sql, insert);

    var connection = mysql.createConnection(mysql_config);
    connection.connect();
    connection.query(sql, function (err, results) {
        if (err) {
            res.json(err);
        }
        else if (results != null) {
            var sql1 = "INSERT INTO users_groups (user_id, group_id) VALUES (?, ?);";
            var insert1 = [req.body.owner_id, results.insertId];
            sql1 = mysql.format(sql1, insert1);

            var connection1 = mysql.createConnection(mysql_config);
            connection1.connect();
            connection1.query(sql1, function (err, results1) {
                res.json(results.insertId);
            });
            connection1.end();
        }
    });
    connection.end();
});

app.post('/addUserToGroup', function (req, res) {
    var sql = "INSERT INTO users_groups (user_id, group_id) VALUES (?, ?);";
    var insert = [req.body.user_id, req.body.group_id];
    sql = mysql.format(sql, insert);

    var connection = mysql.createConnection(mysql_config);
    connection.connect();
    connection.query(sql, function (err, results) {
        if (err) {
            res.json(err);
        }
        else if (results != null) {
            res.json(results);
        }
    });
    connection.end();
});

app.post('/removeUserFromGroup', function (req, res) {
    var sql = "UPDATE users_groups SET archived = true WHERE user_id = ? AND group_id = ?";
    var insert = [req.body.user_id, req.body.group_id];
    sql = mysql.format(sql, insert);

    var connection = mysql.createConnection(mysql_config);
    connection.connect();
    connection.query(sql, function (err, results) {
        if (err) {
            res.json(err);
        }
        else if (results != null) {
            res.json(results);
        }
    });
    connection.end();
});

app.get('/getGroups', function (req, res) {
    var sql = "SELECT * FROM groups WHERE group_owner_id = ? AND archived != true;";
    var insert = [req.body.owner_id];
    sql = mysql.format(sql, insert);

    var connection = mysql.createConnection(mysql_config);
    connection.connect();
    connection.query(sql, function (err, results) {
        if (err) {
            res.json(err);
        }
        else {
            res.json(results);
        }
    });
    connection.end();
});

app.post('/login', passport.authenticate('local-user'), function (req, res) {
    res.json(req.user);
});

app.get('/admin', function (req, res) {
    res.sendFile(__dirname + '/site/admin.html');
});

app.post('/login-admin', passport.authenticate('local-admin'), function (req, res) {
    res.json(req.user);
});

app.post('/register', function (req, res) {
    var sql = "INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?);";
    var insert = [req.body.first, req.body.last, req.body.email, bcrypt.hashSync(req.body.pass)];
    sql = mysql.format(sql, insert);

    var connection = mysql.createConnection(mysql_config);
    connection.connect();
    connection.query(sql, function (err, results) {
        if (err) {
            res.json(err);
        }
        else {
            passport.authenticate('local-user')(req, res, function () {
                res.redirect('/');
            });
        }
    });
    connection.end();
});

app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/login.html');
});

app.get('/init', ensureAdmin, function (req, res) {
    fs.readFile(__dirname + '/init.sql', 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        }
        console.log('Initializing database: ' + data);

        var connection = mysql.createConnection(mysql_config);
        connection.connect();
        connection.query(data, function (err, results) {
            res.json(results);
        });
        connection.end();
    });
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login.html');
}

function ensureAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user.user_type == 'admin') {
        return next();
    }
    res.redirect('/admin.html');
}

app.use('/', express.static(__dirname + '/'));

var server = app.listen(3000, function () {
    console.log('Listening on port %d', server.address().port);
});