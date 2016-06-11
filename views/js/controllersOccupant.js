angular 

.module('collegeSystemOccupant.controllers', ['ngMaterial'])

.controller('occupantCtrl', function ($scope, $http, $mdDialog, $mdMedia, $filter)  {

	$scope.adminDetail = $scope.checkCookies();
	$scope.studentsData = [];

	$http.get('/admin/listoccupant')
		.success(function (data)  {
			$scope.studentsData = data;
			console.log(data);
		})
		.error(function (error) {
			console.log('Error: ' + error);
		});

	$scope.createDialog = function() {
		$mdDialog.show({
			controller: createOccupantCtrl,
			templateUrl: 'views/template/occupantCreate.html',
			parent: angular.element(document.body),
			clickOutsideToClose:true
		})
	};

	$scope.moreDialog = function(studentData) {
		$mdDialog.show({
			controller: editMeritOccupantCtrl,
			templateUrl: 'views/template/occupantEdit.html',
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

	$scope.dropStudent = function (matric_no)   {
		$http.post('/admin/dropstudent/' + matric_no)
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

})


function editMeritOccupantCtrl($scope, $mdDialog, $http, student, $window) {	
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

	$scope.updateOccupant = function ()  {
		if ($scope.form.sname == null && $scope.form.faculty == null && $scope.form.intake == null)	{
			return $window.alert("You need to fill one of the input given.");
		}

		if ($scope.form.sname == "" && $scope.form.faculty == "" && $scope.form.intake == "")	{
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
				$window.alert("Error connecting to the database.");
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

function createOccupantCtrl($scope, $mdDialog, $http, $window) {

	$scope.form = {};

	$scope.createOccupant = function () {
		if ($scope.form.matric_no == null || $scope.form.sname == null || $scope.form.faculty == null || $scope.form.intake == null)    {
			$window.alert("Unsuccessful. Please fill in all blanks.");
		}

		if ($scope.form.matric_no == "" || $scope.form.sname == "" || $scope.form.faculty == "" || $scope.form.intake == "")    {
			$window.alert("Unsuccessful. Please fill in all blanks.");
		}	else    {
				$http.post('/admin/createoccupant', $scope.form)
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