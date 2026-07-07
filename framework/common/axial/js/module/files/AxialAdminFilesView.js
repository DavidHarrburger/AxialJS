"use strict";

import { AxialButton } from "../../button/AxialButton.js";
import { AxialAdminViewBase } from "../base/AxialAdminViewBase.js";
import { AxialAccordionElement } from "../../accordion/AxialAccordionElement.js";

class AxialAdminFilesView extends AxialAdminViewBase
{
    constructor()
    {
        super();
        this.template = "axial-admin-files-view-template";
    }

    _buildComponent()
    {
        super._buildComponent();
    }

    _onGetResponse()
    {
        console.log(this.getData);
    }
}
window.customElements.define("axial-admin-files-view", AxialAdminFilesView);
export { AxialAdminFilesView }