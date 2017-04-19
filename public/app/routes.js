/*
 * ---------------------------------------------------------------------------------------
 * routes.js
 * ---------------------------------------------------------------------------------------
 */

export function initRoutes($routeProvider) {


    $routeProvider.when('/', {
        controller: "mainController",
        templateUrl: "app/components/main/mainView.html"
    });

    $routeProvider.when('/test', {
        controller: "testController",
        templateUrl: "app/components/test/testView.html"
    });

    $routeProvider.otherwise({redirectTo: '/'});

}