"use strict";

import { AxialServiceButton } from "../../button/AxialServiceButton.js";
import { AxialOnboardingView } from "../AxialOnboardingView.js";

import { PathUtils } from "../../utils/PathUtils.js";
import { FetchUtils } from "../../utils/FetchUtils.js";
import { ColorUtils } from "../../utils/ColorUtils.js";
import { CryptoUtils } from "../../utils/CryptoUtils.js";
import { InputUtils } from "../../utils/InputUtils.js";

class AxialOnboardingViewPhone extends AxialOnboardingView
{
    /// vars
    /** @type { RegExp } */
    #phoneRegex = /^(?:\+33|0)[67]\d{8}$/;

    /** @type { Boolean } */
    #phoneValid = false;

    /// elements
    /** @type { HTMLInputElement } */
    #phoneInput;

    /** @type { HTMLlement } */
    #phoneLegend;

    /// events
    /** @type { Function } */
    #boundPhoneHandler;

    constructor()
    {
        super();
        this.template = "axial-onboarding-view-phone-template";
        this.#boundPhoneHandler = this.#phoneHandler.bind(this);
    }

    _buildComponent()
    {
        this.#phoneInput = this.shadowRoot.getElementById("phoneInput");
        this.#phoneInput.addEventListener("input", this.#boundPhoneHandler);
        this.#phoneInput.addEventListener("focusout", this.#boundPhoneHandler);
        InputUtils.formatPhone(this.#phoneInput);
        super._buildComponent();

    }

    #phoneHandler( event )
    {
        const value = this.#phoneInput.value.trim();
        const clean = value.replace(/\s+/g, '');
        this.#phoneValid = this.#phoneRegex.test( clean );
        this.#checkValidity();
    }

    #checkValidity()
    {
        const validated = this.#phoneValid === true;
        const value = this.#phoneInput.value.trim();
        const clean = value.replace(/\s+/g, '');
        const data = { tel: clean }
        const onboardingEvent = new CustomEvent("onboardingViewValidated", { bubbles: false, detail: { validated: validated, data: data } } );
        this.dispatchEvent(onboardingEvent);
    }
}

window.customElements.define("axial-onboarding-view-phone", AxialOnboardingViewPhone);
export { AxialOnboardingViewPhone }