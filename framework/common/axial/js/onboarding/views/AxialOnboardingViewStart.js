"use strict";

import { AxialServiceButton } from "../../button/AxialServiceButton.js";
import { AxialOnboardingView } from "../AxialOnboardingView.js";

import { PathUtils } from "../../utils/PathUtils.js";
import { FetchUtils } from "../../utils/FetchUtils.js";
import { ColorUtils } from "../../utils/ColorUtils.js";
import { AxialToggleCheck } from "../../button/AxialToggleCheck.js";

class AxialOnboardingViewStart extends AxialOnboardingView
{
    /// elements
    /** @type { AxialToggleCheck } */
    #legalCheck;

    /** @type { Function } */
    #boundCheckHandler;

    constructor()
    {
        super();
        this.#boundCheckHandler = this.#checkHandler.bind(this);
        this.template = "axial-onboarding-view-start-template";
    }

    _buildComponent()
    {
        this.#legalCheck = this.shadowRoot.getElementById("legalCheck");
        if( this.#legalCheck )
        {
            this.#legalCheck.addEventListener("toggleChanged", this.#boundCheckHandler);
        }
        super._buildComponent();
    }

    #checkHandler( event )
    {
        const validated = this.#legalCheck.selected;
        const onboardingEvent = new CustomEvent("onboardingViewValidated", { bubbles: false, detail: { validated: validated } } );
        this.dispatchEvent(onboardingEvent);
    }
    

}

window.customElements.define("axial-onboarding-view-start", AxialOnboardingViewStart);
export { AxialOnboardingViewStart }