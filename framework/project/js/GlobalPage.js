"use strict"
import { AxialApplicationBase } from "../../axial/js/core/AxialApplicationBase";

// import components here
import { AxialButton } from "../../axial/js/button/AxialButton";
import { AxialToggleButtonGroupBase } from "../../axial/js/button/AxialToggleButtonGroupBase";
import { AxialToggleCheck } from "../../axial/js/button/AxialToggleCheck";
import { AxialToggleSwitch } from "../../axial/js/button/AxialToggleSwitch";
import { AxialToggleRadio } from "../../axial/js/button/AxialToggleRadio";

class GlobalPage extends AxialApplicationBase
{
    constructor()
    {
        super();
        console.log("Hello Axial GlobalPage");
    }
}
export { GlobalPage }