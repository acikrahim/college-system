angular 

.module('collegeSystemEvent.controllers', ['ngMaterial'])

.controller('eventCtrl', function ($scope, $http, $mdDialog, $mdMedia, $filter)  {

    $scope.adminDetail = $scope.checkCookies();

	$scope.eventsData = [];

	$http.get('/admin/eventlist')
	    .success(function (data)    {
	        $scope.eventsData = data;
            for (var i = 0; i < $scope.eventsData.length; i++)  {
                $scope.eventsData[i].edate = $filter('date')($scope.eventsData[i].edate, 'dd/MM/yyyy');
            }
	    })
	    .error(function (error) {
	        console.log('Error: ' + error);
	    });

	$scope.createDialog = function() {
		$mdDialog.show({
			controller: createEventCtrl,
			templateUrl: 'views/template/eventCreate.html',
			parent: angular.element(document.body),
			clickOutsideToClose:true
		})
	};

	$scope.editDialog = function(eventData) {
		$mdDialog.show({
			controller: editEventCtrl,
			templateUrl: 'views/template/eventEdit.html',
			parent: angular.element(document.body),
			clickOutsideToClose:true,
			locals: {
				event: eventData
			}
		})
	};

    $scope.organizerDialog = function(eventData) {
        $mdDialog.show({
            controller: organizerCtrl,
            templateUrl: 'views/template/eventOrganizer.html',
            parent: angular.element(document.body),
            clickOutsideToClose:true,
            locals: {
                event: eventData
            }
        })
    };

	$scope.deleteEvent = function (event_id) {
        $http.delete('/admin/deleteevent/' + event_id)
            .success(function (data)    {
                $scope.eventsData = $filter('filter')($scope.eventsData, function(value, index) { 
                    return value.event_id !== event_id; 
                });
            })
            .error(function (error) {
                console.log(error);
            });
    };

})


function editEventCtrl($scope, $mdDialog, $http, event, $window, $filter) {
	$scope.event = event;
	$scope.form = {};
	$scope.edate = new Date();
	$scope.locationList;

	$scope.updateEvent = function ()  {
		if ($scope.form.ename ==  null && $scope.form.description == null && $scope.edate == null && $scope.form.location == null)	{
			return $window.alert("You need to fill one of the input given.");
		}

        if ($scope.form.ename ==  "" && $scope.form.description == "" && $scope.edate == "" && $scope.form.location == "")  {
            return $window.alert("You need to fill one of the input given.");
        }

        if ($scope.form.ename == null)
            $scope.form.ename = $scope.event.ename;
        if ($scope.form.description == null)
            $scope.form.description = $scope.event.description;
        if ($scope.edate == null)
            $scope.form.edate = $scope.event.edate;
        else
        	$scope.form.edate = $filter('date')($scope.edate, 'M/d/yyyy');
        if ($scope.form.location == null)
            $scope.form.location = $scope.event.location;

        console.log($scope.form.edate)
        $http.post('/admin/updateevent/' + $scope.event.event_id, $scope.form)
            .success(function (data)    {
                if (data.success == true)   {
                    $window.alert(data.msg);
                    $scope.form = {};
                    $window.location.reload();
                }   else    {
                    $window.alert(data.msg);
                    $scope.form = {};
                    $mdDialog.cancel();
                }
            })
            .error(function (error) {
                console.log(error);
            });
    };

    $http.get('/admin/locationlist')
        .success(function (data)    {

            $scope.locationList = data;
            console.log(data);

        })
        .error(function (error) {
            console.log('Error: ' + error);
        });

    $scope.uploadPhoto = function () {
        console.log("masuk");
        var file = $scope.photo;
       
        var uploadUrl = "/admin/uploadphoto/" + $scope.event.event_id;
        var fd = new FormData();
        fd.append('file', file);

        $http.post(uploadUrl,fd, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
            })
            .success(function (data)    {
                if (data.success == true)   {
                    $window.alert(data.msg);
                    $scope.form = {};
                    $window.location.reload();
                }   else    {
                    $window.alert(data.msg);
                    $scope.form = {};
                    $mdDialog.cancel();
                }
            })
            .error(function ()  {
                $window.alert("Error connecting to the database.");
            });
    };

	$scope.cancel = function() {
		$mdDialog.cancel();
	};
}

function createEventCtrl($scope, $mdDialog, $http, $window, $filter) {

	$scope.form = {};
	$scope.locationList;
	$scope.edate = new Date();

	$scope.createEvent = function () {
        if ($scope.form.ename ==  null || $scope.form.description == null || $scope.edate == null|| $scope.form.location == null)    {
            return $window.alert("Unsuccessful. Please fill in all blanks.");
        }

        if ($scope.form.ename ==  "" || $scope.form.description == "" || $scope.edate == "" || $scope.form.location == "")    {
            return $window.alert("Unsuccessful. Please fill in all blanks.");
        }

        $scope.form.edate = $filter('date')($scope.edate, 'M/d/yyyy');

	        $http.post('/admin/createevent', $scope.form)
	            .success(function (data)    {
                    if (data.success == true)   {
                        $window.alert(data.msg);
                        $scope.form = {};
                        $window.location.reload();
                    }   else    {
                        $window.alert(data.msg);
                        $scope.form = {};
                        $mdDialog.cancel();
                    }

	            })
	            .error(function (error) {
	                $window.alert("Error connecting to the database.");
	            });
    };

    $http.get('/admin/locationlist')
        .success(function (data)    {

            $scope.locationList = data;
            console.log(data);

        })
        .error(function (error) {
            console.log('Error: ' + error);
        });

    $scope.createLocation = function () {
    	if ($scope.form.lname ==  null || $scope.form.description == null || $scope.form.latitude == null|| $scope.form.longitude == null)    {
            $window.alert("Unsuccessful. Please fill in all blanks.");
        }

        if ($scope.form.lname ==  "" || $scope.form.description == "" || $scope.form.latitude == ""|| $scope.form.longitude == "")    {
            $window.alert("Unsuccessful. Please fill in all blanks.");
        }

        $http.post('/admin/createlocation', $scope.form)
            .success(function (data)    {
            	if (data.success == true)   {
                    $window.alert(data.msg);
                    $scope.form = {};
                    $window.location.reload();
                }   else    {
                    $window.alert(data.msg);
                    $scope.form = {};
                    $mdDialog.cancel();
                }
            })
            .error(function (error) {
                $window.alert("Error connecting to the database.");
            });
    };

	$scope.cancel = function() {
		$mdDialog.cancel();
	};
}

function organizerCtrl($scope, $mdDialog, $http, event, $window, $filter) {
    
    $scope.event = event;
    $scope.organizers = {};
    $scope.form = {};
    $scope.organizerList = [];

    $http.get('/admin/organizerlist/' + $scope.event.event_id)
        .success(function (data)    {
            $scope.organizerList = data;
        })
        .error(function (error) {
            console.log('Error: ' + error);
        });

    $scope.addOrganizer = function ()  {

        if ($scope.form.matric_no == null) {
            return $window.alert("Please fill in the matric number !");
        }

        if ($scope.form.matric_no == "") {
            return $window.alert("Please fill in the matric number !");
        }
            
        $http.post('/admin/organizerevent/'+ $scope.event.event_id, $scope.form)
            .success(function (data)    {
               if (data.success == true)   {
                    $window.alert(data.msg);
                    $scope.form = {};
                    $window.location.reload();
                }   else    {
                    $window.alert(data.msg);
                    $scope.form = {};
                    $mdDialog.cancel();
                }
            })
            .error(function (error) {
                $window.alert("Error connecting to the database.");
            });
    };

    $scope.deleteOrganizer = function (matric_no)  {

        $scope.deleteForm = {
            matric_no: matric_no
        };    

        $http.post('/admin/deleteorganizer/'+ $scope.event.event_id, $scope.deleteForm)
            .success(function (data)    {
                $window.location.reload();
                $window.alert("The organizer has been deleted!");
            })
            .error(function (error) {
                $window.alert("There has been an error reaching the server !");
            });
    };

    $scope.cancel = function() {
        $mdDialog.cancel();
    };
}