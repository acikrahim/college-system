angular

.module('collegeSystem', 
	[ 
		'collegeSystemStudent.controllers',
        'collegeSystemOccupant.controllers',
        'collegeSystemEvent.controllers',
		'ngRoute',
        'ngCookies',
		'ngMaterial',
		'ngMdIcons',
        'ngIdle'
	])

.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;
            
            element.bind('change', function(){
                scope.$apply(function(){
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}])


.config(config);


function config($routeProvider, IdleProvider)	{

    IdleProvider.idle(50);

	$routeProvider

        .when('/occupants',	{
        	templateUrl:'views/occupants.html',
        	controller: 'studentCtrl'
        })

        .when('/students',	{
        	templateUrl:'views/students.html'
        })

        .when('/events',	{
        	templateUrl:'views/events.html'
        })

        .when('/login',	{
        	templateUrl:'views/login.html'
        })

        .otherwise({redirectTo:'/students'});

}
