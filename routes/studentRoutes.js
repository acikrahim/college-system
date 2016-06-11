var express = require('express');
var pg = require('pg');
var crypto = require('crypto');

var router = express.Router();
var conString = 'postgres://postgres:postgres@localhost:5432/collegesystem';

function randomString(length, chars) {
    if(!chars)  {
        throw new Error('Argument \'chars\' is undefined');
    }

    var charsLength = chars.length;

    if (charsLength > 256) {
        throw new Error('Argument \'chars\' should not have more than 256 characters'
            + ', otherwise unpredictability will be broken');
    }

    var randomBytes = crypto.randomBytes(length);
    var result = new Array(length);

    var cursor = 0;
    for (var i = 0; i < length; i++) {
        cursor += randomBytes[i];
        result[i] = chars[cursor % charsLength];
    }

    return result.join('');
}

function randomAsciiString(length) {
    return randomString(length, 'abcdefghijklmnopqrstuvwxyz0123456789');
}


var calculateDistance = function (lat1, lon1, lat2, lon2) {
    var p = 0.017453292519943295;    // Math.PI / 180
    var c = Math.cos;
    var a = 0.5 - c((lat2 - lat1) * p)/2 + 
              c(lat1 * p) * c(lat2 * p) * 
              (1 - c((lon2 - lon1) * p))/2;

    return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
};

router.get('/liststudent', function (request, respond)  {
    var result = [];

    pg.connect(conString, function (err, client, done)  {
        if (err)    {
            done();
            console.log(err);
            return respond.status(500).json({ success: false, data: err});
        }

        var query = client.query('select s.*, (select SUM(merit_point) from merits where matric_no = s.matric_no) total_merit from students s where occupant = false');

        query.on('row', function (row)  {
            result.push(row);
        });

        query.on('end', function () {
            done();
            return respond.json(result);
        });
    });
    
});

router.post('/createstudent', function (request, respond)   {
    var result = [];
    var validate = [];

    var data = {
            matric_no: request.body.matric_no,
            sname: request.body.sname,
            faculty: request.body.faculty,
            intake: request.body.intake,
            occupant: 'false',
            password: randomAsciiString(8),
            register: 'false'
    };

    pg.connect(conString, function (err, client, done)  {
        if (err)    {
            done();
            console.log(err);
            return respond.status(500).json({ success: false, data: err});
        }


        var validatequery = 'select * from students where matric_no = $1';
        var insertquery = 'insert into students(matric_no, sname, faculty, intake, occupant, password, register) values ($1, $2, $3, $4, $5, $6, $7)';

        var validateQuery = client.query(validatequery, [data.matric_no]);

        validateQuery.on('row', function (row)  {
            validate.push(row);
        });



        validateQuery.on('end', function () {    
            if (validate.length == 1)   {
                done();
                return respond.status(200).json({ success: false, msg: 'Student with Matric Number ' + data.matric_no + ' already exist.' });        
            }   else    {
                
                var insertQuery = client.query(insertquery, [data.matric_no, data.sname, data.faculty, data.intake, data.occupant, data.password, data.register]);

                insertQuery.on('end', function ()   {
                    done();
                    return respond.status(200).json({ success: true, msg: 'Student with Matric Number ' + data.matric_no + ' has been created.' });
                });
            }
        });
    });
});

router.get('/getmerit/:matric_no', function (request, respond)  {
    var result = [];

    var data = {
            matric_no: request.params.matric_no
    };

    pg.connect(conString, function (err, client, done)  {
        if (err)    {
            done();
            console.log(err);
            return respond.status(500).json({ success: false, data: err});
        }

        var meritquery = 'select ename, merit_point, responsibility from students ' + 
                            'inner join merits on students.matric_no = merits.matric_no ' + 
                            'where students.matric_no = ' + data.matric_no;

        var meritQuery = client.query(meritquery);

        meritQuery.on('row', function (row)  {
            result.push(row);
        });

        meritQuery.on('end', function () { 
            done();
            return respond.json(result);
        });
    });    
});

router.get('/listoccupant', function (request, respond)  {
    var result = [];

    pg.connect(conString, function (err, client, done)  {
        if (err)    {
            done();
            console.log(err);
            return respond.status(500).json({ success: false, data: err});
        }

        var query = client.query('select s.*, (select SUM(merit_point) from merits where matric_no = s.matric_no) total_merit from students s where occupant = true');

        query.on('row', function (row)  {
            result.push(row);
        });
        
        query.on('end', function () {
            done();
            return respond.json(result);
        });
    });   
});

router.post('/createoccupant', function (request, respond)   {
    var result = [];
    var validate = [];

    var data = {
            matric_no: request.body.matric_no,
            sname: request.body.sname,
            faculty: request.body.faculty,
            intake: request.body.intake,
            occupant: 'true',
            password: randomAsciiString(8),
            register: 'false'
    };

     pg.connect(conString, function (err, client, done)  {
        if (err)    {
            done();
            console.log(err);
            return respond.status(500).json({ success: false, data: err});
        }


        var validatequery = 'select * from students where matric_no = $1';
        var insertquery = 'insert into students(matric_no, sname, faculty, intake, occupant, password, register) values ($1, $2, $3, $4, $5, $6, $7)';

        var validateQuery = client.query(validatequery, [data.matric_no]);

        validateQuery.on('row', function (row)  {
            validate.push(row);
        });



        validateQuery.on('end', function () {    
            if (validate.length == 1)   {
                return respond.status(200).json({ success: false, msg: 'Student with Matric Number ' + data.matric_no + ' already exist.' });        
            }   else    {
                
                var insertQuery = client.query(insertquery, [data.matric_no, data.sname, data.faculty, data.intake, data.occupant, data.password, data.register]);

                insertQuery.on('end', function ()   {
                     done();
                return respond.status(200).json({ success: true, msg: 'Occupant with Matric Number ' + data.matric_no + ' has been created.' });
                });
            }
        });
    });
});

router.delete('/deletestudent/:matric_no', function (request, respond)   {
    var result = [];

    var data = {
            matric_no: request.params.matric_no
    };

    pg.connect(conString, function (err, client, done)  {
        if (err)    {
            done();
            console.log(err);
            return respond.status(500).json({ success: false, data: err });
        }

        var deletequery = 'delete from students where matric_no = ($1)';

        var deleteQuery = client.query(deletequery, [data.matric_no], function (err, result)  {
            done();
            if (err)
                console.log(err);
            else
                return respond.status(200).json({ success: true, data: err});
        });
    });
});

router.post('/addoccupant/:matric_no', function (request, respond)  {
    var result = [];

    var data = {
            matric_no: request.params.matric_no,
            occupant: 'true'
    };

    pg.connect(conString, function (err, client, done)  {
        if (err)    {
            done();
            console.log(err);
            return respond.status(500).json({ success: false, data: err });
        }

        var addquery = 'update students set occupant = $1 where matric_no = $2';

        var addQuery = client.query(addquery, [data.occupant, data.matric_no], function (err, result)  {
            done();
            if (err)
                console.log(err);
            else
                return respond.status(200).json({ success: true, data: err});
        });
    });
});

router.post('/dropstudent/:matric_no', function (request, respond)  {
    var result = [];

    var data = {
            matric_no: request.params.matric_no,
            occupant: 'false'
    };

    pg.connect(conString, function (err, client, done)  {
        if (err)    {
            done();
            console.log(err);
            return respond.status(500).json({ success: false, data: err });
        }

        var addquery = 'update students set occupant = $1, register = false where matric_no = $2';

        var addQuery = client.query(addquery, [data.occupant, data.matric_no], function (err, result)  {
            done();
            if (err)
                console.log(err);
            else
                return respond.status(200).json({ success: true, data: err});
        });
    });
});

router.post('/updatestudent/:matric_no', function (request, respond)   {
    var result = [];

    var data = {
            sname: request.body.sname,
            faculty: request.body.faculty,
            intake: request.body.intake,
            matric_no: request.params.matric_no
    };

    pg.connect(conString, function (err, client, done)  {
        if (err)    {
            done();
            console.log(err);
            return respond.status(500).json({ success: false, data: err});
        }

        var updatequery = 'update students set sname = $1, faculty = $2, intake = $3 where matric_no = $4';

        var updateQuery = client.query(updatequery, [data.sname, data.faculty, data.intake, data.matric_no], function (err, result)  {
            done();
            if (err)
                console.log(err);
            else
                return respond.status(200).json({ success: true, data: err});
        });
    });
});

router.post('/updatemerit/:matric_no', function (request, respond)   {
    var result = [];
    var validate = [];

    var data = {
            event_id: request.body.event_id,
            responsibility: request.body.responsibility,
            merit: request.body.merit,
            matric_no: request.params.matric_no
    };

    pg.connect(conString, function (err, client, done)  {
        if (err)    {
            done();
            console.log(err);
            return respond.status(500).json({ success: false, data: err});
        }

        var validatequery = 'select * from merits where event_id = $1 and matric_no = $2';
        var namequery = 'select ename from events where event_id = $1';
        var updatequery = 'insert into merits (matric_no, event_id, ename, responsibility, merit_point, status) values ($1, $2, $3, $4, $5, $6)';

        var validateQuery = client.query(validatequery, [data.event_id, data.matric_no]);

        validateQuery.on('row', function (row)  {
            validate.push(row);
        });


        validateQuery.on('end', function (row)  {
            if (validate.length > 0)    {
                done();
                return respond.status(200).json({ success: true, msg: 'Merit already exist.' });
            }   else    {

                var nameQuery = client.query(namequery, [data.event_id]);
                nameQuery.on('row', function (row)  {
                    result.push(row);
                });

                nameQuery.on('end', function () {
                    var updateQuery = client.query(updatequery, [data.matric_no, data.event_id, result[0].ename, data.responsibility, data.merit, 2]);

                    updateQuery.on('end', function ()   {
                        done();
                        return respond.status(200).json({ success: true, msg: 'New merit has been added.' });
                    })
                });
            }
        });
            

    });
});

module.exports = router;