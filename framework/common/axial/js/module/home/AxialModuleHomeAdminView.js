"use strict";

import { AxialModuleView } from "../../view/AxialModuleView.js";
import { AxialButton } from "../../button/AxialButton.js";

import { PathUtils } from "../../utils/PathUtils.js";

import { AxialModuleOnboardingContactOverlay } from "../onboarding/AxialModuleOnboardingContactOverlay.js";

class AxialModuleHomeAdminView extends AxialModuleView
{
    /// vars

    /** @type { String } */
    #onboardingContactOverlayId = "onboardingContactOverlay";

    /// elements
    /** @type { AxialButton } */
    #mainButton;

    /** @type { AxialModuleOnboardingContactOverlay } */
    #onboardingContactOverlay;

    /// events
    /** @type { Function } */
    #boundMainHandler;

    constructor()
    {
        super();
        this.template = "axial-module-home-admin-view-template";
        this.#boundMainHandler = this.#mainHandler.bind(this);
    }

    _buildComponent()
    {
        super._buildComponent();

        this.#mainButton = this.shadowRoot.getElementById("mainButton");
        this.#mainButton.addEventListener("click", this.#boundMainHandler);

        this.#onboardingContactOverlay = document.getElementById( this.#onboardingContactOverlayId );
    }

    #mainHandler( event )
    {
        if( this.#onboardingContactOverlay )
        {
            this.#onboardingContactOverlay.show();
        }
    }

    
}
window.customElements.define("axial-module-home-admin-view", AxialModuleHomeAdminView);
export { AxialModuleHomeAdminView }
