"use strict";

import { AxialModuleView } from "../../view/AxialModuleView.js";
import { AxialMessaging } from "../../messages/AxialMessaging.js";

class AxialModuleMessagingView extends AxialModuleView
{
    /** @type { AxialMessaging } */
    #messaging;

    constructor()
    {
        super();
        this.template = "axial-module-messaging-view-template";
    }

    /**
     * @type { AxialMessaging }
     * @readonly
     */
    get messaging() { return this.#messaging; }

    _buildComponent()
    {
        super._buildComponent();
        this.#messaging = this.shadowRoot.getElementById("messaging");
    }

}
window.customElements.define("axial-module-messaging-view", AxialModuleMessagingView);
export { AxialModuleMessagingView }