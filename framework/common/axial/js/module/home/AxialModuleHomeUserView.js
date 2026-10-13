"use strict";

import { AxialModuleView } from "../../view/AxialModuleView.js";
import { AxialButton } from "../../button/AxialButton.js";
import { PathUtils } from "../../utils/PathUtils.js";
import { AxialNotificationBox } from "../../notification/AxialNotificationBox.js";

import { AxialCardDisplayer } from "../../card/AxialCardDisplayer.js";
import { AxialCardBooking } from "../../card/widgets/AxialCardBooking.js";
import { AxialCardWelcomeUser } from "../../card/widgets/AxialCardWelcomeUser.js";
import { AxialCard } from "../../card/AxialCard.js";

import { TestComponent } from "../../aaaa/TestComponent.js";
import { SubTestComponent } from "../../aaaa/SubTestComponent.js";

class AxialModuleHomeUserView extends AxialModuleView
{
    /// vars

    /// elements
    /** @type { AxialButton } */
    #mainButton;

    /** @type { AxialCardDisplayer } */
    #cardDisplayer;

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
        this.#cardDisplayer = this.shadowRoot.getElementById("cardDisplayer");
    }

    #mainHandler( event )
    {
        
    }

    loadGetData()
    {
        this.#cardDisplayer.refreshCards();
    }

    
}
window.customElements.define("axial-module-home-user-view", AxialModuleHomeUserView);
export { AxialModuleHomeUserView }
