/*
 * ---------------------------------------------------------------------------------------
 * trackDirective
 * ---------------------------------------------------------------------------------------
 */


"use strict";

 export function trackDirective() {

     return {
         restrict: 'AE',
         replace: 'true',
         scope: {track: "="},
         templateUrl: "app/directives/templates/trackDirTemplate.html",
         link: function(scope, elem, attrs) {

             console.log(scope);


             // elem.on('click', function() {
             //     elem.css('background-color', 'white');
             //     $scope.$apply(function() {
             //         $scope.color = "white";
             //         // $scope.startSequencer();
             //     });
             // });
             // elem.on('mouseover', function() {
             //     elem.css('cursor', 'pointer');
             // });


         }
     };

 }


