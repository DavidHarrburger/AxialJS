"use strict";

import { AxialAdminViewBase } from "../base/AxialAdminViewBase.js";
import { AxialButton } from "../../button/AxialButton.js";
import { AxialAdminToggleBarButton } from "../button/AxialAdminToggleBarButton.js";
import { AxialToggleButtonGroupBase } from "../../button/AxialToggleButtonGroupBase.js";


class AxialAdminParamsView extends AxialAdminViewBase
{
    
    constructor()
    {
        super();
        this.template = "axial-admin-params-view-template";
    }

    _buildComponent()
    {
        super._buildComponent();
        
    }

}
window.customElements.define("axial-admin-params-view", AxialAdminParamsView);
export { AxialAdminParamsView }
