"use strict";

import { AxialButton } from "../button/AxialButton.js";
import { AxialComponentBase } from "../core/AxialComponentBase.js";

class AxialNotificationBox extends AxialComponentBase
{
    /** @type { AxialButton } */
    #permissionButton;

    /** @type { Function } */
    #boundPermissionButtonClickHandler;

    constructor()
    {
        super();
        this.classList.add("axial_notification_box");
        this.template = "axial-notification-box-template";
        this.#boundPermissionButtonClickHandler = this.#permissionButtonClickHandler.bind(this);
    }

    _buildComponent()
    {
        this.#permissionButton = this.shadowRoot.getElementById("permissionButton");
        if( this.#permissionButton )
        {
            this.#permissionButton.addEventListener("click", this.#boundPermissionButtonClickHandler);
        }
        if( "Notification" in window === false )
        {
            this.#permissionButton.style.display = "none";
        }
    }


    #permissionButtonClickHandler( event )
    {
        console.log("button clicked");
        this.#requestNotification();
    }

    async #requestNotification()
    {
        try
        {
            if( Notification.permission && Notification.permission === "default" )
            {
                const permissionState = await Notification.requestPermission();
                if( permissionState === "granted" )
                {
                    console.log("youpii tra lala");
                    await window.AXIAL.initPushService();
                }
            }
        }
        catch(err) { console.log( err ); }
    }
}

window.customElements.define("axial-notification-box", AxialNotificationBox);
export { AxialNotificationBox }