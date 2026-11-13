"use strict";

import { AxialServiceButton } from "../../button/AxialServiceButton.js";
import { AxialOnboardingView } from "../AxialOnboardingView.js";

import { PathUtils } from "../../utils/PathUtils.js";
import { FetchUtils } from "../../utils/FetchUtils.js";
import { ColorUtils } from "../../utils/ColorUtils.js";

class AxialOnboardingViewOption extends AxialOnboardingView
{
    constructor()
    {
        super();
        this.template = "axial-onboarding-view-option-template";
    }
}

window.customElements.define("axial-onboarding-view-option", AxialOnboardingViewOption);
export { AxialOnboardingViewOption }