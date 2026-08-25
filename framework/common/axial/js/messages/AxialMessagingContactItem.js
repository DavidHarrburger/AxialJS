"use strict";

import { AxialListItem } from "../list/AxialListItem.js"; 

class AxialMessagingContactItem extends AxialListItem
{
    /** @type { HTMLElement } */
    #name;

    /** @type { Function } */
    #boundClickHandler;

    constructor()
    {
        super();
        this.classList.add("axial_messaging_contact_item");
        this.template = "axial-messaging-contact-item-template";
        this.#boundClickHandler = this.#clickHandler.bind(this);
    }

    _buildComponent()
    {
        this.#name = this.shadowRoot.getElementById("name");
        super._buildComponent();
    }

    _updateComponent()
    {
        //console.log(this.data);
        super._updateComponent();
        this.#name.innerHTML = this.data.label;
        this.addEventListener("click", this.#boundClickHandler);
    }

    #clickHandler(event)
    {
        const messagingEvent = new CustomEvent("conversationStart", { detail: { uuids: this.data.uuids } });
        this.dispatchEvent(messagingEvent);
    }
}

window.customElements.define("axial-messaging-contact-item", AxialMessagingContactItem);
export { AxialMessagingContactItem }