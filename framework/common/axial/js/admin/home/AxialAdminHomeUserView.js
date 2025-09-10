"use strict";

import { AxialAdminViewBase } from "../base/AxialAdminViewBase.js";

class AxialAdminHomeUserView extends AxialAdminViewBase
{
    constructor()
    {
        super();
        this.template = "axial-admin-home-user-view-template";
    }

    _buildComponent()
    {
        super._buildComponent();
    }

    _onViewEntered()
    {
        
    }

    _prepareGetData()
    {
        
    }

    _onGetResponse()
    {
        
    }

}
window.customElements.define("axial-admin-home-user-view", AxialAdminHomeUserView);
export { AxialAdminHomeUserView }