/**
 * ---------------------------------------------------------------------------------------
 * savePresetDirective.js
 * ---------------------------------------------------------------------------------------
 */


"use strict";



export function savePresetDirective() {


    return {
        restrict: 'AE',
        replace: 'false',
        templateUrl: "app/directives/templates/savePreset.html",
        link: function (scope, elem, attrs) {


            scope.tagHandler = function (tag){
                return null;
            };

            scope.invalidPresetNameMessage = "Choose a preset name (6-32 characters)";
            scope.invalidCategoryMessage = "Choose a category";









            function initUI() {

                $("#presetCancelBtn").button();
                $("#presetSaveBtn").button();
            }





            /**
             * ---------------------------------------------------------------------------------------
             * init
             * ---------------------------------------------------------------------------------------
             */

            initUI();

        }


    }


}