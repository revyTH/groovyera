/*
 * ---------------------------------------------------------------------------------------
 * verticalSlider directive
 * ---------------------------------------------------------------------------------------
 */

"use strict";

export function tickSliderDirective() {

    return {
        restrict: 'AE',
        replace: 'false',
        scope: {
            tick: "=",
            ticksElements: "=",
            resizeTick: "="
        },
        link: (scope, elem, attrs) => {


            // console.log(scope.tick);
            scope.ticksElements.push(elem);


            elem.slider({
                min: 0,
                max: 100,
                orientation: "vertical",
                value: scope.tick.active ? scope.tick.volume * 100 : 0,
                slide: (event, ui) => {

                    if (!scope.tick.active) {
                        scope.tick.active = true;
                    }

                    scope.tick.volume = ui.value * 0.01;
                    // console.log(scope.tick.volume);
                }
            }).draggable();



            // scope.resizeTick(elem);

        }
    };

}
