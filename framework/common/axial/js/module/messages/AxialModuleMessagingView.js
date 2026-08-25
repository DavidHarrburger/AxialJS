"use strict";

import { AxialModuleView } from "../../view/AxialModuleView.js";
import { AxialMessaging } from "../../messages/AxialMessaging.js";
import { AxialButton } from "../../button/AxialButton.js";

class AxialModuleMessagingView extends AxialModuleView
{
    /** @type { AxialMessaging } */
    #messaging;

    /** @type { AxialButton } */
    #contactButton;

    /** @type { Function } */
    #boundContactHandler;

    /** @type { Function } */
    #boundMessagingContactHandler;

    constructor()
    {
        super();
        this.template = "axial-module-messaging-view-template";
        this.#boundContactHandler = this.#contactHandler.bind(this);
        this.#boundMessagingContactHandler = this.#messagingContactHandler.bind(this);
    }

    loadGetData()
    {
        if( this.#messaging )
        {
            this.#messaging.init();
        }
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
        if( this.#messaging )
        {
            this.#messaging.addEventListener("messagingContact", this.#boundMessagingContactHandler);
        }

        this.#contactButton = this.shadowRoot.getElementById("contactButton");
        if( this.#contactButton )
        {
            this.#contactButton.addEventListener("click", this.#boundContactHandler);
        }
    }

    #contactHandler( event )
    {
        if( this.#messaging )
        {
            this.#messaging.displayContact();
        }
    }

    #messagingContactHandler( event )
    {
        const contacts = event.detail.contacts;
        if( Array.isArray(contacts) === true && contacts.length > 1 )
        {
            this.#contactButton.style.display = "block";
        }
        else
        {
            this.#contactButton.style.display = "none";
        }
    }
}
window.customElements.define("axial-module-messaging-view", AxialModuleMessagingView);
export { AxialModuleMessagingView }