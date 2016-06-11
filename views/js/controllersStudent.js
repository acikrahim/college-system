angular 

.module('collegeSystemStudent.controllers', ['ngMaterial'])


.controller ('appCtrl', function ($scope, $http, $filter, $mdDialog, $cookies, $location, $window, Idle) {

	$scope.form = {};
	$scope.loginNotPresent = $cookies.get('username') == null && $cookies.get('email') == null;

	$scope.adminPresent = {};

	$scope.login = function()	{
		$http.post('/admin/login/', $scope.form)
            .success(function (data)    {
            	if(data.success == true)	{
            		Idle.watch();
            		$cookies.put('username', data.result[0].username);
            		$cookies.put('email', data.result[0].email);
            		$scope.adminPresent = {
       					username: $cookies.get('username'),
        				email: $cookies.get('email')
   					};
            		$scope.loginNotPresent = false;
            		$location.url('/occupants');
            	}	else	{
            		return $window.alert("Wrong password or username");
            	}
            })
            .error(function (error) {
                console.log(error);
            });
	};

	$scope.logout = function()	{
		$cookies.remove('username');
		$cookies.remove('email');
		$scope.loginNotPresent = true;
		$location.url('/login');
	};

	$scope.checkCookies = function()	{
		if ($cookies.get('username') == null && $cookies.get('email') == null)	{
			$location.url('/login');
			return $window.alert("You need to log in back to use");
		}	else	{
			$scope.adminPresent = {
       					username: $cookies.get('username'),
        				email: $cookies.get('email')
   					};
		}
	}

	$scope.$on('IdleTimeout', function()	{
		$cookies.remove('username');
		$cookies.remove('email');
		$scope.loginNotPresent = true;
		$location.url('/login');
	});	

	$scope.checkCookies();
})

.controller('studentCtrl', function ($scope, $http, $mdDialog, $mdMedia, $filter)  {

	$scope.adminDetail = $scope.checkCookies();
	
	$scope.studentsData = [];

	$http.get('/admin/liststudent')
		.success(function (data)  {
			$scope.studentsData = data;
			console.log(data);
		})
		.error(function (error) {
			console.log('Error: ' + error);
		});

	$scope.createDialog = function() {
		$mdDialog.show({
			controller: createStudentCtrl,
			templateUrl: 'views/template/studentCreate.html',
			parent: angular.element(document.body),
			clickOutsideToClose:true
		})
	};

	$scope.moreDialog = function(studentData) {
		$mdDialog.show({
			controller: editMeritStudentCtrl,
			templateUrl: 'views/template/studentEdit.html',
			parent: angular.element(document.body),
			clickOutsideToClose:true,
			locals: {
				student: studentData
			}
		})
	};

	$scope.deleteStudent = function (matric_no) {
        if (confirm("Are you sure to delete"))  {
            $http.delete('/admin/deletestudent/' + matric_no)
                .success(function (data)    {
                    $scope.studentsData = $filter('filter')($scope.studentsData, function(value, index) { 
                        return value.matric_no !== matric_no; 
                    });
                })
                .error(function (error) {
                    console.log(error);
                });
        }
        else
            return
    };

    $scope.addOccupant = function (matric_no)   {
        $http.post('/admin/addoccupant/' + matric_no)
            .success(function (data)    {
                $scope.studentsData = $filter('filter')($scope.studentsData, function (value, index)    {
                    return value.matric_no !== matric_no;
                });
            })
            .error(function (error) {
                console.log(error);
            });
    };

    var orderBy = $filter('orderBy');

    $scope.order = function(predicate) {
        $scope.predicate = predicate;
        $scope.reverse = ($scope.predicate === predicate) ? !$scope.reverse : false;
        $scope.studentsData = orderBy($scope.studentsData, predicate, $scope.reverse);
    };

});

function editMeritStudentCtrl($scope, $mdDialog, $http, student, $window) {
	$scope.student = student;
	$scope.form = {};
	$scope.profile = [];

	$http.get('admin/getmerit/' + $scope.student.matric_no)
		.success(function (data)	{
			$scope.profile = data;
		})
		.error(function (error) {
			console.log('Error: ' + error);
		});

	$scope.updateStudent = function ()  {
		if ($scope.form.sname == null && $scope.form.faculty == null && $scope.form.intake == null)	{
			return $window.alert("You need to fill one of the input given.");
		}

		if ($scope.form.matric_no ==  "" && $scope.form.sname == "" && $scope.form.faculty == "" && $scope.form.intake == "")	{
			return $window.alert("You need to fill one of the input given.");
		}

		if ($scope.form.sname == null)
			$scope.form.sname = $scope.student.sname;
		if ($scope.form.faculty == null)
			$scope.form.faculty = $scope.student.faculty;
		if ($scope.form.intake == null)
			$scope.form.intake = $scope.student.intake;

		$http.post('/admin/updatestudent/' + $scope.student.matric_no, $scope.form)
			.success(function (data)    {
				$scope.form = {};
				$window.alert("Student information has been updated !");
				$window.location.reload();
			})
			.error(function (error) {
				console.log(error);
			});
	};

	$scope.updateMerit = function ()	{
		if ($scope.form.event_id == null && $scope.form.responsiblity == null && $scope.form.merit == null)	{
			return $window.alert("You need to fill all of the input given.");
		}

		$http.post('/admin/updatemerit/' + $scope.student.matric_no, $scope.form)
			.success(function (data)    {
				if (data.success == true)	{
                    	$window.alert(data.msg);
                    	$mdDialog.cancel();
                    	$window.location.reload();
                    }	else	{
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

function createStudentCtrl($scope, $mdDialog, $http, $window) {

	$scope.form = {};

	$scope.createStudent = function () {
        if ($scope.form.matric_no == null || $scope.form.sname == null || $scope.form.faculty == null || $scope.form.intake == null)    {
            $window.alert("Unsuccessful. Please fill in all blanks.");
        }

        if ($scope.form.matric_no == "" || $scope.form.sname == "" || $scope.form.faculty == "" || $scope.form.intake == "")    {
			$window.alert("Unsuccessful. Please fill in all blanks.");
		}	else    {
	            $http.post('/admin/createstudent', $scope.form)
	                .success(function (data)    {
	                	if (data.success == true)	{
	                    	$window.alert(data.msg);
	                    	$mdDialog.cancel();
	                    	$window.location.reload();
	                    }	else	{
	                    	$window.alert(data.msg);
	                    	$scope.form = {};
	                    	$mdDialog.cancel();
	                    }

	                })
	                .error(function (error) {
	                    $window.alert("Error connecting to the database.");
	                });    
        }   
    };

	$scope.cancel = function() {
		$mdDialog.cancel();
	};

}