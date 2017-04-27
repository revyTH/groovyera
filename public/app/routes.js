/*
 * ---------------------------------------------------------------------------------------
 * routes.js
 * ---------------------------------------------------------------------------------------
 */

export function initRoutes($routeProvider) {


    $routeProvider.when('/', {
        controller: "drumMachineController",
        templateUrl: "app/components/drum-machine/drumMachineView.html"
    });

    $routeProvider.when('/test', {
        controller: "testController",
        templateUrl: "app/components/test/testView.html"
    });

    $routeProvider.otherwise({redirectTo: '/'});

}