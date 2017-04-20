/*
 * ---------------------------------------------------------------------------------------
 * verticalSlider directive
 * ---------------------------------------------------------------------------------------
 */

"use strict";

export function verticalSliderDirective() {

    return {
        restrict: 'AE',
        replace: 'false',
        scope: {tick: "="},
        link: (scope, elem, attrs) => {

            if (scope.tick.index === 0) {
                return;
            }
            console.log(scope.tick);


            elem.slider({
                min: 0,
                max: 100,
                orientation: "vertical",
                value: scope.tick.volume * 100,
                slide: (event, ui) => {

                    if (!scope.tick.active) {
                        scope.tick.active = true;
                        // console.log("Tick not active");
                        // return;
                    }

                    scope.tick.volume = ui.value * 0.01;
                    console.log(scope.tick.volume);
                }
            }).draggable();
        }
    };

}
