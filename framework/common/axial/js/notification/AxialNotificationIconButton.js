"use strict";

import { AxialIconButton } from "../button/AxialIconButton.js";
import { AxialNotificationManager } from "./AxialNotificationManager.js";
import { AxialNotificationOverlay } from "./AxialNotificationOverlay.js";

class AxialNotificationIconButton extends AxialIconButton
{    
    /** @type { AxialNotificationManager} */
    #manager;

    /** @type { String } */
    #overlayId = "notificationOverlay";

    /** @type { AxialNotificationOverlay } */
    #overlay;

    /** @type { Function } */
    #boundInitializedHandler;

    /** @type { Function } */
    #boundNotificationStatusChangedHandler;

    /** @type { Function } */
    #boundOverlayHandler;

    constructor()
    {
        super();
        this.#boundInitializedHandler = this.#initializedHandler.bind(this);
        this.#boundNotificationStatusChangedHandler = this.#notificationStatusChangedHandler.bind(this);
        this.#boundOverlayHandler = this.#overlayHandler.bind(this);
        this.#manager = AxialNotificationManager.getInstance();
        this.#manager.addEventListener("notificationInitialized", this.#boundInitializedHandler);
        this.#manager.addEventListener("notificationStatusChanged", this.#boundNotificationStatusChangedHandler);
    }

    static get observedAttributes()
    {
        return [ "axial-icon-name", "axial-tooltip-text", "axial-fill", "axial-foreground", "axial-background" ];
    }

    _buildComponent()
    {
        super._buildComponent();
        this.addEventListener( "click", this.#boundOverlayHandler);
    }

    
    #initializedHandler( event )
    {
        this.#update();
    }

    #notificationStatusChangedHandler( event )
    {
        this.#update();
    }

    #update()
    {
        switch( this.#manager.status )
        {
            case "not_supported":
                this.iconName = "bell_off";
            break;

            case "subscribed":
                this.iconName = "bell";
            break;

            case "authorized":
                this.iconName = "bell_off";
            break;

            case "pending":
                this.iconName = "bell_off";
            break;

            case "blocked":
                this.iconName = "bell_off";
            break;

            default:
                this.iconName = "bell_off";
            break;
        }
    }

    #overlayHandler( event )
    {
        console.log( "notif clicked");
        /** @type { AxialNotificationOverlay } */
        this.#overlay = document.getElementById(this.#overlayId);
        if( this.#overlay )
        {
            this.#overlay.showAtTarget( this, event );
        }
    }
}

window.customElements.define("axial-notification-icon-button", AxialNotificationIconButton);
export { AxialNotificationIconButton }
