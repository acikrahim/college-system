var express = require('express');
var pg = require('pg');

var router = express.Router();
var conString = 'postgres://postgres:postgres@localhost:5432/collegesystem';

var calculateDistance = function (lat1, lon1, lat2, lon2) {
    var p = 0.017453292519943295;    // Math.PI / 180
    var c = Math.cos;
    var a = 0.5 - c((lat2 - lat1) * p)/2 + 
              c(lat1 * p) * c(lat2 * p) * 
              (1 - c((lon2 - lon1) * p))/2;

    return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
};

router.post('/login', function (request, respond)   {
    var result = [];
    var data = {
            matric_no: request.body.matric_no,
            password: request.body.password
    };

    pg.connect(conString, function (err, client, done)  {
        if (err)    {
            done();
            console.log(err);
            return respond.status(500).json({ msg: err });
        }

        var validatequery = 'select * from students where matric_no = $1 and register = true';
        var loginquery = 'select matric_no from students where matric_no = $1 and password = $2';

        var validateQuery = client.query(validatequery, [data.matric_no]);

        validateQuery.on('row', function (row) {
            result.push(row);
        });

        validateQuery.on('end', function () {
            if (result.length == 1) {
                var loginQuery = client.query(loginquery, [data.matric_no, data.password]);
                loginQuery.on('end', function ()   {
                    done();
                    return respond.json({ success:true, msg: 'Login success !' });
                });
            }   else    {
                    done();
                    return respond.json({ success: false, msg: 'Wrong password or username !'});
                }
        });

    });
});

router.post('/register', function (request, respond)   {
    var result = [];

    var data = {
            matric_no: request.body.matric_no,
            password: request.body.password,
            code: request.body.code
    };

    pg.connect(conString, function (err, client, done)  {
        if (err)    {
            done();
            console.log(err);
            return respond.status(500).json({ msg: err });
        }

        var validatequery = 'select * from students where matric_no = $1 and register = false and occupant = true';
        var updatequery = 'update students set password = $1, register = true where matric_no = $2 and password = $3 and occupant = true';

        var validateQuery = client.query(validatequery, [data.matric_no]);

        validateQuery.on('row', function (row) {
            result.push(row);
        });

        validateQuery.on('end', function () {
            if (result.length == 1) {
                var updateQuery = client.query(updatequery, [data.password, data.matric_no, data.code]);
                updateQuery.on('end', function ()   {
                    done();
                    return respond.json({ success:true, msg: 'Registration success' });
                });
            }   else    {
                    done();
                    return respond.json({ success: false, msg: 'Wrong code or matric number entered !'});
                }
        });

    });
});

router.get('/view-me/:matric_no', function (request, respond)  {
    var result = [];
    var profile = [];

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
        var profilequery = 'select * from students where matric_no = ' + data.matric_no;

        var meritQuery = client.query(meritquery);
        var profileQuery = client.query(profilequery);

        meritQuery.on('row', function (row)  {
            result.push(row);
        });

        profileQuery.on('row', function (row)   {
            profile.push(row);
        });

        profileQuery.on('end', function () { 
            done();
            return respond.json({ success: true, msg: 'Authentication success.', result: result, profile: profile });
        });
    });   
});

router.post('/event-list', function (request, respond)  {
    var result = [];

    var data = {
            matric_no: request.body.matric_no
    };

    pg.connect(conString, function (err, client, done)  {
        if (err)    {
            done();
            console.log(err);
            return respond.status(500).json({ success: false, data: err});
        }

        var eventlistquery = 'select * from events inner join locations on events.location = locations.id where status = 0 order by edate asc';
        var eventlistQuery = client.query(eventlistquery);

        eventlistQuery.on('row', function (row)  {
            result.push(row);
        });

        eventlistQuery.on('end', function () {
            done();
            return respond.json({ success: true, msg: 'Retrieve success.', result: result });
        });
    });  
});

router.get('/event-status/:matric_no', function (request, respond)  {
    var result = [];

    // 0 = waiting to start opening
    // 1 = can be closed opening
    // 2 = waiting to start closing
    // 3 = can be closed closing
    // 4 = auto
    // 41 = auto opening
    // 42 = auto closing
    // 5 = finish can give feedback
    // 6 = finish never to be kept

    var data = {
            matric_no: request.params.matric_no
    };

    pg.connect(conString, function (err, client, done)  {
        if (err)    {
            done();
            console.log(err);
            return respond.status(500).json({ success: false, data: err});
        }

        var eventlistquery =    'select * from events ' + 
                                'inner join locations on events.location = locations.id '+
                                'inner join organizers on events.event_id = organizers.event_id ' + 
                                'where organizers.matric_no = ' + data.matric_no +
                                'and (status = 0 or status = 1 or status = 2 or status = 3)';

        var eventlistQuery = client.query(eventlistquery);

        eventlistQuery.on('row', function (row)  {
            result.push(row);
        });

        eventlistQuery.on('end', function () {
            done();
            return respond.json({ success: true, msg: 'Retrieve success.', result: result });
        });
    });   
});

router.get('/event-opening/:matric_no', function (request, respond)  { //list of event currently opening
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

        var eventopeningquery = 'select * from events inner join locations on events.location = locations.id where status = 1 order by edate asc';

        var eventopeningQuery = client.query(eventopeningquery);

        eventopeningQuery.on('row', function (row)  {
            result.push(row);
        });

        eventopeningQuery.on('end', function () {
            done();
            return respond.json({ success: true, msg: 'Retrieve success.', result: result });
        });
    });    
});

router.get('/event-closing/:matric_no', function (request, respond)  { //list of event currently closing
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

        var eventclosingquery = 'select * from events inner join locations on events.location = locations.id where status = 3 order by edate asc';

        var eventclosingQuery = client.query(eventclosingquery);

        eventclosingQuery.on('row', function (row)  {
            result.push(row);
        });

        eventclosingQuery.on('end', function () {
            done();
            return respond.json({ success: true, msg: 'Retrieve success.', result: result });
        });
    });    
});

router.get('/start-open/:event_id', function (request, respond)  { //glist of event can be given feedback
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

        var updatequery = 'update events set status = 1 where event_id = $1';

         var updateQuery = client.query(updatequery, [data.event_id], function (err, result)  {
            done();
            if (err)
                console.log(err);
            else
                return respond.json({ success: true, msg: 'Start success.', result: result });
        });
    });    
});

router.get('/close-open/:event_id', function (request, respond)  { //glist of event can be given feedback
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

        var updatequery = 'update events set status = 2 where event_id = $1';

         var updateQuery = client.query(updatequery, [data.event_id], function (err, result)  {
            done();
            if (err)
                console.log(err);
            else
                return respond.json({ success: true, msg: 'Close success.', result: result });
        });
    });    
});

router.get('/start-close/:event_id', function (request, respond)  { //glist of event can be given feedback
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

        var updatequery = 'update events set status = 3 where event_id = $1';

         var updateQuery = client.query(updatequery, [data.event_id], function (err, result)  {
            done();
            if (err)
                console.log(err);
            else
                return respond.json({ success: true, msg: 'Start success.', result: result });
        });
    });    
});

router.delete('/close-close/:event_id', function (request, respond)  { //glist of event can be given feedback
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

        var updatequery = 'update events set status = 5 where event_id = $1';

        var deletequery = 'delete from merits where status = 1 and event_id = $1';

        
        var updateQuery = client.query(updatequery, [data.event_id]);

        updateQuery.on('end', function ()   {
            var deleteQuery = client.query(deletequery, [data.event_id], function (err, result)  {
                    done();
                    if (err)
                        console.log(err);
                    else
                        return respond.json({ success: true, msg: 'Close success.', result: result });
            });
        });
    });   
});

router.get('/event-feedback/:matric_no', function (request, respond)  { //glist of event can be given feedback
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

        var eventfeedbackquery = 'select * from events inner join locations on events.location = locations.id where status = 5 order by edate asc';

        var eventfeedbackQuery = client.query(eventfeedbackquery);

        eventfeedbackQuery.on('row', function (row)  {
            result.push(row);
        });

        eventfeedbackQuery.on('end', function () {
            done();
            return respond.json({ success: true, msg: 'Retrieve success.', result: result });
        });
    });    
});

router.get('/event-seefeedback/:matric_no', function (request, respond)  { //glist of event can be given feedback
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

       var eventseefeedbackquery =    'select * from events ' + 
                                'inner join locations on events.location = locations.id '+
                                'inner join organizers on events.event_id = organizers.event_id ' + 
                                'where organizers.matric_no = ' + data.matric_no +
                                'and (status = 5 or status = 6)';

        var eventseefeedbackQuery = client.query(eventseefeedbackquery);

        eventseefeedbackQuery.on('row', function (row)  {
            result.push(row);
        });

        eventseefeedbackQuery.on('end', function () {
            done();
            return respond.json({ success: true, msg: 'Retrieve success.', result: result });
        });
    });    
});

router.post('/event-sendfeedback/:event_id', function (request, respond)  { //give feedback to events
    var result = [];

    var data = {
            event_id: request.params.event_id,
            feedback: request.body.feedback,
            matric_no: request.body.matric_no
    };

    pg.connect(conString, function (err, client, done)  {
        if (err)    {
            done();
            console.log(err);
            return respond.status(500).json({ msg: err });
        }

        var validatequery = 'select * from feedbacks where matric_no = $1 and event_id = $2';
        var feedbackquery = 'insert into feedbacks (event_id, feedback, matric_no) values ($1, $2, $3)';

        var validateQuery = client.query(validatequery, [data.matric_no, data.event_id]);

        validateQuery.on('row', function (row) {
            result.push(row);
        });

        validateQuery.on('end', function () {
            if (result.length == 0) {
                var feedbackQuery = client.query(feedbackquery, [data.event_id, data.feedback, data.matric_no]);
                feedbackQuery.on('end', function ()   {
                    done();
                    return respond.json({ success:true, msg: 'Feedback sent !' });
                });
            }   else    {
                    done();
                    return respond.json({ success: false, msg: 'You had already sent the feedback.' });
                }
        });

    });    
});

router.get('/event-getfeedback/:event_id', function (request, respond)  { //glist of event can be given feedback
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

       var eventgetfeedbackquery = 'select * from feedbacks where event_id = $1'

        var eventgetfeedbackQuery = client.query(eventgetfeedbackquery, [data.event_id]);

        eventgetfeedbackQuery.on('row', function (row)  {
            result.push(row);
        });

        eventgetfeedbackQuery.on('end', function () {
            done();
            return respond.json({ success: true, msg: 'Retrieve success.', result: result });
        });
    });    
});

router.post('/opening-attendance/:matric_no', function (request, respond)  {
    var location;
    var validate = [];
    var result = [];

    var data = {
            matric_no: request.params.matric_no,
            event_id: request.body.event_id,
            ename: request.body.ename,
            latitude: request.body.latitude,
            longitude: request.body.longitude
    };

    pg.connect(conString, function (err, client, done)  {
        if (err)    {
            done();
            console.log(err);
            return respond.status(500).json({ success: false, data: err});
        }

        var validatequery = 'select * from merits where event_id = $1 and matric_no = $2';

        var getlocationquery = 'select latitude, longitude from events ' +
                                'inner join locations on events.location = locations.id ' +
                                'where events.event_id = ' + data.event_id;

        var dataquery = 'select responsibility from organizers where event_id = $1 and matric_no = $2';

        var updatemeritquery = 'insert into merits (matric_no, event_id, responsibility, merit_point, ename, status) values ($1, $2, $3, $4, $5, $6)';

        var validateQuery = client.query(validatequery, [data.event_id, data.matric_no]);

        validateQuery.on('row', function (row)  {
            validate.push(row);
        });

        validateQuery.on('end', function () {
            if (validate.length == 0)   {

                var getlocationQuery = client.query(getlocationquery);

                getlocationQuery.on('row', function (row)  {
                    location = row;
                });
            
                getlocationQuery.on('end', function () {

                    var distance = calculateDistance(location.latitude, location.longitude, data.latitude, data.longitude)*1000;

                    if (distance < 100)   {

                        var dataQuery = client.query(dataquery, [data.event_id, data.matric_no]);

                        dataQuery.on('row', function (row)  {
                            result.push(row);
                        });

                        dataQuery.on('end', function () {

                            if (result.length == 1) {
                                if (result[0].responsibility == 'AJK')   {
                                    var updatemeritQuery = client.query(updatemeritquery, [data.matric_no, data.event_id, result[0].responsibility, 4, data.ename, 1]);

                                    updatemeritQuery.on('end', function ()   {
                                        done();
                                        return respond.json({ success:true, msg: 'Signed as AJK.' });
                                    });
                                }   else    { 
                                        var updatemeritQuery = client.query(updatemeritquery, [data.matric_no, data.event_id, result[0].responsibility, 6, data.ename, 1]);

                                        updatemeritQuery.on('end', function ()   {
                                            done();
                                            return respond.json({ success:true, msg: 'Signed as Higher-ups.' });
                                        });
                                    }
                            }   else    {
                                    var updatemeritQuery = client.query(updatemeritquery, [data.matric_no, data.event_id, 'Participant', 2, data.ename, 1]);

                                    updatemeritQuery.on('end', function ()   {
                                        done();
                                        return respond.json({ success:true, msg: 'Signed as participant.' });
                                    });
                                }   

                        });
                    }   else    {
                            done();
                            return respond.json({ success:true, msg: 'Please be within a 100m distance.' });
                        }

                });

            }   else    {
                    done();
                    return respond.json({ success:true, msg: 'Attendance already sent.' });
                }
        });

    });
});

router.post('/closing-attendance/:matric_no', function (request, respond)  {
    var location;
    var validate = [];
    var result = [];

    // merit statues
    // 1 = attend opening
    // 2 = attend close and good to go

    var data = {
            matric_no: request.params.matric_no,
            event_id: request.body.event_id,
            latitude: request.body.latitude,
            longitude: request.body.longitude
    };
    
    pg.connect(conString, function (err, client, done)  {
        if (err)    {
            done();
            console.log(err);
            return respond.status(500).json({ success: false, data: err});
        }

        var validatequery = 'select * from merits where event_id = $1 and matric_no = $2';

        var getlocationquery = 'select latitude, longitude from events ' +
                                'inner join locations on events.location = locations.id ' +
                                'where events.event_id = ' + data.event_id;

        var updatemeritquery = 'update merits set status = 2 where event_id = $1 and matric_no = $2';

        var validateQuery = client.query(validatequery, [data.event_id, data.matric_no]);

        validateQuery.on('row', function (row)  {
            validate.push(row);
        });



        validateQuery.on('end', function () {    
            if (validate.length == 1)   {        
                
                if (validate[0].status == 1)   {
                    var getlocationQuery = client.query(getlocationquery);

                    getlocationQuery.on('row', function (row)  {
                        location = row;
                    });
                
                    getlocationQuery.on('end', function () {

                            var distance = calculateDistance(location.latitude, location.longitude, data.latitude, data.longitude)*1000;

                        if (distance < 100)   {
                            
                            var updatemeritQuery = client.query(updatemeritquery, [data.event_id, data.matric_no]);

                            updatemeritQuery.on('end', function ()   {
                                done();
                                return respond.json({ success:true, msg: 'Merit as ' + validate[0].responsibility });
                            });                        
                        }   else    {
                            done();
                            return respond.json({ success:true, msg: 'Please be within a 100m distance.' });
                        }
                    });

                }   else    {
                    done();
                    return respond.json({ success:true, msg: 'Attendance had already sent.' });
                }
            }
            else    {
                done();
                return respond.json({ success:true, msg: 'Opening attendance was not signed.' });
            }
        });    
    });
});

module.exports = router;