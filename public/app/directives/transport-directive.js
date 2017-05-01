/**
 * ---------------------------------------------------------------------------------------
 * transport-directive.js
 * ---------------------------------------------------------------------------------------
 */



"use strict";


export function transportDirective() {


    return {
        restrict: 'AE',
        replace: 'false',
        templateUrl: "app/directives/templates/transportDirTemplate.html",
        link: function (scope, elem, attrs) {

            console.log("[TRANSPORT_DIRECTIVE]", scope);


        }
    };

}


