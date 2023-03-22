"use strict"
import { AxialApplicationBase } from "../../axial/js/core/AxialApplicationBase";
import { AxialComponentBase } from "../../axial/js/core/AxialComponentBase";

// application
import { AxialScrollerBase } from "../../axial/js/application/AxialScrollerBase";
import { AxialScrollerItemBase } from "../../axial/js/application/AxialScrollerItemBase";

// button
import { AxialButton } from "../../axial/js/button/AxialButton";
import { AxialToggleButtonGroupBase } from "../../axial/js/button/AxialToggleButtonGroupBase";
import { AxialToggleCheck } from "../../axial/js/button/AxialToggleCheck";
import { AxialToggleSwitch } from "../../axial/js/button/AxialToggleSwitch";
import { AxialToggleRadio } from "../../axial/js/button/AxialToggleRadio";

// view
import { AxialViewerBase } from "../../axial/js/view/AxialViewerBase";
import { AxialViewBase } from "../../axial/js/view/AxialViewBase";

class GlobalPage extends AxialApplicationBase
{
    constructor()
    {
        super();
        console.log("Hello Axial GlobalPage");
    }
}
export { GlobalPage }