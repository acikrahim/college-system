var express = require('express');
var pg = require('pg');

var router = express.Router();
var conString = 'postgres://postgres:postgres@localhost:5432/collegesystem';

router.post('/login', function (request, respond)   {
    var result = [];

    var data = {
            username: request.body.username,
            password: request.body.password
    };

   pg.connect(conString, function (err, client, done)  {
        if (err)    {
            done();
            console.log(err);
            return respond.status(500).json({ msg: err });
        }

        var validatequery = 'select * from admins where username = $1 and password = $2';
        var loginquery = 'select username, email from admins where username = $1 and password = $2';

        var validateQuery = client.query(validatequery, [data.username, data.password]);

        validateQuery.on('row', function (row) {
            result.push(row);
        });

        validateQuery.on('end', function () {
            if (result.length == 1) {
                var loginQuery = client.query(loginquery, [data.username, data.password]);
                loginQuery.on('end', function ()   {
                    done();
                    return respond.json({ success:true, msg: 'Login success !', result: result });
                });
            }   else    {
                    done();
                    return respond.json({ success: false, msg: 'Wrong password or username !'});
                }
        });

    });
});

module.exports = router;