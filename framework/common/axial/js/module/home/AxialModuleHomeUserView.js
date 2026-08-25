"use strict";

import { AxialModuleView } from "../../view/AxialModuleView.js";
import { AxialButton } from "../../button/AxialButton.js";
import { PathUtils } from "../../utils/PathUtils.js";
import { AxialNotificationBox } from "../../notification/AxialNotificationBox.js";

class AxialModuleHomeUserView extends AxialModuleView
{
    /// vars

    /// elements
    /** @type { AxialButton } */
    #mainButton;

    /// events
    /** @type { Function } */
    #boundMainHandler;

    constructor()
    {
        super();
        this.template = "axial-module-home-user-view-template";
        this.#boundMainHandler = this.#mainHandler.bind(this);
    }

    _buildComponent()
    {
        super._buildComponent();
    }

    #mainHandler( event )
    {
        
    }

    
}
window.customElements.define("axial-module-home-user-view", AxialModuleHomeUserView);
export { AxialModuleHomeUserView }
