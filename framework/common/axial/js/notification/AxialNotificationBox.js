"use strict";

import { AxialButton } from "../button/AxialButton.js";
import { AxialServiceButton } from "../button/AxialServiceButton.js";
import { AxialComponentBase } from "../core/AxialComponentBase.js";
import { AxialNotificationManager } from "./AxialNotificationManager.js";

class AxialNotificationBox extends AxialComponentBase
{
    /// manager
    /** @type { AxialNotificationManager } */
    #manager;

    /// elements
    /** @type { HTMLElement } */
    #notSupportedState;

    /** @type { HTMLElement } */
    #subscribedState;

    /** @type { HTMLElement } */
    #authorizedState;

    /** @type { HTMLElement } */
    #pendingState;

    /** @type { HTMLElement } */
    #blockedState;

    /** @type { AxialServiceButton } */
    #permissionButton;

    /** @type { AxialServiceButton } */
    #subscribeButton;

    /** @type { AxialServiceButton } */
    #unsubscribeButton;

    /// events
    /** @type { Function } */
    #boundInitializedHandler;

    /** @type { Function } */
    #boundNotificationStatusChangedHandler;

    /** @type { Function } */
    #boundPermissionHandler;

    /** @type { Function } */
    #boundSubscribeHandler;

    /** @type { Function } */
    #boundUnsubscribeHandler;

    constructor()
    {
        super();
        this.classList.add("axial_notification_box");
        this.template = "axial-notification-box-template";
        this.#manager = AxialNotificationManager.getInstance();

        this.#boundInitializedHandler = this.#initializedHandler.bind(this);
        this.#boundNotificationStatusChangedHandler = this.#notificationStatusChangedHandler.bind(this);
        this.#manager.addEventListener("notificationInitialized", this.#boundInitializedHandler);
        this.#manager.addEventListener("notificationStatusChanged", this.#boundNotificationStatusChangedHandler);

        this.#boundPermissionHandler = this.#permissionHandler.bind(this);
        this.#boundSubscribeHandler = this.#subscribeHandler.bind(this);
        this.#boundUnsubscribeHandler = this.#unsubscribeHandler.bind(this);
    }

    _buildComponent()
    {

        this.#notSupportedState = this.shadowRoot.getElementById("notSupportedState");
        this.#subscribedState = this.shadowRoot.getElementById("subscribedState");
        this.#authorizedState = this.shadowRoot.getElementById("authorizedState");
        this.#pendingState = this.shadowRoot.getElementById("pendingState");
        this.#blockedState = this.shadowRoot.getElementById("blockedState");

        this.#permissionButton = this.shadowRoot.getElementById("permissionButton");
        if( this.#permissionButton )
        {
            this.#permissionButton.addEventListener("click", this.#boundPermissionHandler);
        }

        this.#subscribeButton = this.shadowRoot.getElementById("subscribeButton");
        if( this.#subscribeButton )
        {
            this.#subscribeButton.addEventListener("click", this.#boundSubscribeHandler);
        }

        this.#unsubscribeButton = this.shadowRoot.getElementById("unsubscribeButton");
        if( this.#unsubscribeButton )
        {
            this.#unsubscribeButton.addEventListener("click", this.#boundUnsubscribeHandler);
        }

    }

    #initializedHandler( event )
    {
        console.log("notification box initialized");
        this.#refresh();
    }

    #notificationStatusChangedHandler( event )
    {
        console.log("notification box status changed");
        this.#refresh();
    }

    #refresh()
    {
        this.#notSupportedState.style.display = "none";
        this.#subscribedState.style.display = "none";
        this.#authorizedState.style.display = "none";
        this.#pendingState.style.display = "none";
        this.#blockedState.style.display = "none";
        
        this.#permissionButton.enabled = true;
        this.#permissionButton.loading = false;

        this.#subscribeButton.enabled = true;
        this.#subscribeButton.loading = false;

        this.#unsubscribeButton.enabled = true;
        this.#unsubscribeButton.loading = false;
        
        switch( this.#manager.status )
        {
            case "not_supported":
                this.#notSupportedState.style.display = "flex";
            break;

            case "subscribed":
                this.#subscribedState.style.display = "flex";
            break;

            case "authorized":
                this.#authorizedState.style.display = "flex";
            break;

            case "pending":
                this.#pendingState.style.display = "flex";
            break;

            case "blocked":
                this.#blockedState.style.display = "flex";
            break;

            default:
                this.#notSupportedState.style.display = "flex";
            break;
        }
    }

    async #permissionHandler( event )
    {
        this.#permissionButton.enabled = false;
        this.#permissionButton.loading = true;
        await this.#manager.requestPermission();
    }

    async #subscribeHandler( event )
    {
        this.#subscribeButton.enabled = false;
        this.#subscribeButton.loading = true;
        await this.#manager.subscribe();
    }

    async #unsubscribeHandler( event )
    {
        this.#unsubscribeButton.enabled = false;
        this.#unsubscribeButton.loading = true;
        await this.#manager.unsubscribe();
    }


}

window.customElements.define("axial-notification-box", AxialNotificationBox);
export { AxialNotificationBox }