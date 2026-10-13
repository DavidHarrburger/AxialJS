"use strict";

import { AxialNotificationManager } from "./AxialNotificationManager.js";
import { AxialOverlayBase } from "../overlay/AxialOverlayBase.js";
import { AxialNotificationBox } from "./AxialNotificationBox.js";

class AxialNotificationOverlay extends AxialOverlayBase
{
    /** @type { AxialNotificationBox } */
    #box;

    constructor()
    {
        super();
        this.classList.add("axial_notification_overlay");
        this.template = "axial-notification-overlay-template";
    }

    _buildComponent()
    {
        super._buildComponent();
        this.#box = this.shadowRoot.getElementById("notificationBox");
    }
}

window.customElements.define("axial-notification-overlay", AxialNotificationOverlay);
export { AxialNotificationOverlay }