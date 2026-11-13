"use strict";

import { PathUtils } from "../../utils/PathUtils.js";
import { AxialModuleView } from "../../view/AxialModuleView.js";
import { AxialButton } from "../../button/AxialButton.js";
import { AxialCardDisplayer } from "../../card/AxialCardDisplayer.js";
import { AxialCard } from "../../card/AxialCard.js";

// cards goes here

class AxialModuleHomeAdminView extends AxialModuleView
{
    /// elements
    /** @type { AxialCardDisplayer } */
    #cardDisplayer;

    constructor()
    {
        super();
        this.template = "axial-module-home-admin-view-template";
    }

    _buildComponent()
    {
        super._buildComponent();
    }
}

window.customElements.define("axial-module-home-admin-view", AxialModuleHomeAdminView);
export { AxialModuleHomeAdminView }
