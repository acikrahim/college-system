var express = require('express');
var pg = require('pg');
var multer = require('multer');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
});

var upload = multer({ storage: storage }).single('file');

var router = express.Router();
var conString = 'postgres://postgres:postgres@localhost:5432/collegesystem';

router.get('/eventlist', function (request, respond)  {
    var result = [];

    pg.connect(conString, function (err, client, done)  {
        if (err)    {
            done();
            console.log(err);
            return respond.status(500).json({ success: false, data: err});
        }

        var query = client.query('select * from events inner join locations on events.location = locations.id order by edate asc');

        query.on('row', function (row)  {
            result.push(row);
        });

        query.on('end', function () {
            done();
            return respond.json(result);
        });
    });   
});

router.get('/locationlist', function (request, respond)  {
    var result = [];

    pg.connect(conString, function (err, client, done)  {
        if (err)    {
            done();
            console.log(err);
            return respond.status(500).json({ success: false, data: err});
        }

        var query = client.query('select lname, id from locations');

        query.on('row', function (row)  {
            result.push(row);
        });

        query.on('end', function () {
            done();
            return respond.json(result);
        });
    });   
});

router.post('/createevent', function (request, respond)   {
    var result = [];

    var data = {
            ename: request.body.ename,
            description: request.body.description,
            edate: request.body.edate,
            location: request.body.location,
            status: 0
    };

    pg.connect(conString, function (err, client, done)  {
        if (err)    {
            done();
            console.log(err);
            return respond.status(500).json({ success: false, data: err});
        }

        var insertquery = 'insert into events(ename, description, edate, status, location) values ($1, $2, $3, $4, $5)';

        client.query(insertquery, [data.ename, data.description, data.edate, data.status, data.location], function (err, result)  {
            done();
            if (err)
                return respond.status(200).json({success: false, msg: data.ename + ' has not been successfully created.'});
            else
                return respond.status(200).json({success: true, msg: data.ename + ' has been successfully created.'});
        });

    });
});

router.post('/createlocation', function (request, respond)   {
    var result = [];

    var data = {
            lname: request.body.lname,
            ldescription: request.body.ldescription,
            latitude: request.body.latitude,
            longitude: request.body.longitude   
    };

    pg.connect(conString, function (err, client, done)  {
        if (err)    {
            done();
            console.log(err);
            return respond.status(500).json({ success: false, data: err});
        }

        var insertquery = 'insert into locations(lname, ldescription, latitude, longitude) values ($1, $2, $3, $4)';

        client.query(insertquery, [data.lname, data.ldescription, data.latitude, data.longitude], function (err, result)  {
            done();
            if (err)
                return respond.status(200).json({success: false, msg: data.lname + ' has not been successfully created.'});
            else
                return respond.status(200).json({success: true, msg: data.lname + ' has been successfully created.'});
        });


    });
});

router.delete('/deleteevent/:event_id', function (request, respond)   {
    var result = [];

    var data = {
            event_id: request.params.event_id
    };

    pg.connect(conString, function (err, client, done)  {
        if (err)    {
            done();
            console.log(err);
            return respond.status(500).json({ success: false, data: err});
        }

        var deletequery = 'delete from events where event_id = $1';

        var deleteQuery = client.query(deletequery, [data.event_id], function (err, result)  {
            done();
            if (err)
                console.log(err);
            else
                return respond.status(200).json({ success: true });
        });
    });
});

router.post('/updateevent/:event_id', function (request, respond)   {
    var result = [];

    var data = {
            ename: request.body.ename,
            description: request.body.description,
            edate: request.body.edate,
            location: request.body.location,
            event_id: request.params.event_id
    };

    console.log(data.edate)
    pg.connect(conString, function (err, client, done)  {
        if (err)    {
            done();
            console.log(err);
            return respond.status(500).json({ success: false, data: err});
        }

        var updatequery = 'update events set ename = $1, description = $2, edate = $3, location = $4 where event_id = $5';

        var updateQuery = client.query(updatequery, [data.ename, data.description, data.edate, data.location, data.event_id], function (err, result)  {
            done();
            if (err)
                return respond.status(200).json({success: false, msg: data.ename + ' has not been successfully updated.'});
            else
                return respond.status(200).json({success: true, msg: data.ename + ' has been successfully updated.'});
        });
    });
});

router.post('/uploadphoto/:event_id', function (request, respond)   {

    
    var filename;
    
    var data = {
        event_id: request.params.event_id
    };

    var uploadquery = 'update events set photolink = $1 where event_id = $2';

    upload(request, respond, function(err)    {

        if(err)
            return respond.status(500).json({ success: false, data: err});
        pg.connect(conString, function (err, client, done)  {
            if (err)    {
                done();
                console.log(err);
                return respond.status(500).json({ success: false, data: err});
            }

            var address = 'http://192.168.56.1:3000/uploads/' + request.file.filename;
            var uploadquery = 'update events set photolink = $1 where event_id = $2';

            var uploadQuery = client.query(uploadquery, [address, data.event_id], function (err, result)  {
                done();
                if (err)
                    return respond.status(200).json({success: true, msg: request.file.filename + ' has not been successfully uploaded.'});
                else
                    return respond.status(200).json({success: true, msg: request.file.filename + ' has been successfully uploaded.'});
            });
        });
    })
});

router.post('/organizerevent/:event_id', function (request, respond)   {
    var result = [];
        
    var data = {
        event_id: request.params.event_id,
        matric_no: request.body.matric_no,
        responsibility: request.body.responsibility
    };

    pg.connect(conString, function (err, client, done)  {
        if (err)    {
            done();
            console.log(err);
            return respond.status(500).json({ msg: err });
        }

        var organizerquery = 'insert into organizers(event_id, matric_no, responsibility) values ($1, $2, $3)';
        var validatequery = 'select matric_no from students where matric_no = $1 and occupant = true';

        var validateQuery = client.query(validatequery, [data.matric_no]);

            validateQuery.on('row', function (row) {
                result.push(row);
            });

            validateQuery.on('end', function () {
                if (result.length == 1) {

                    var organizerQuery = client.query(organizerquery, [data.event_id, data.matric_no, data.responsibility]);

                    organizerQuery.on('end', function ()   {
                        done();
                        return respond.status(200).json({success: false, msg: data.matric_no + ' has been added as organizer.'});
                    });
                }   else    {
                        done();
                        return respond.status(200).json({success: true, msg: data.matric_no + ' is not in database or not an occupant.'});
                    }
            });

    });
});

router.get('/organizerlist/:event_id', function (request, respond)   {
    var result = [];
        
    var data = {
        event_id: request.params.event_id,
    };

    pg.connect(conString, function (err, client, done)  {
        if (err)    {
            done();
            console.log(err);
            return respond.status(500).json({ msg: err });
        }

        var organizersquery = 'select * from organizers where event_id = $1';

        var organizersQuery = client.query(organizersquery, [data.event_id]);

        organizersQuery.on('row', function (row) {
            result.push(row);
        });

        organizersQuery.on('end', function () {
            done();
            return respond.json(result);
        });

    });
});

router.post('/deleteorganizer/:event_id', function (request, respond)   {
    var result = [];
        
    var data = {
        event_id: request.params.event_id,
        matric_no: request.body.matric_no
    };

    console.log(data.matric_no)

    pg.connect(conString, function (err, client, done)  {
        if (err)    {
            done();
            console.log(err);
            return respond.status(500).json({ msg: err });
        }

        var organizersquery = 'delete from organizers where event_id = $1 and matric_no = $2';

        var organizersQuery = client.query(organizersquery, [data.event_id, data.matric_no]);

        organizersQuery.on('end', function () {
            done();
            return respond.status(200).json({ success: true });
        });

    });
});

module.exports = router;