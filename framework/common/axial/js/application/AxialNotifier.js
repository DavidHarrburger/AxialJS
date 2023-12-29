"use strict"

import { AxialComponentBase } from "../core/AxialComponentBase.js";

class AxialNotifier extends AxialComponentBase
{
    /** @type { HTMLElement } */
    #holder;

    /** @type { HTMLElement } */
    #content;

    /** @type { Number } */
    #timeoutId;

    /** @type { Number } */
    #timeoutDelay = 4000;

    /** @type { Function} */
    #boundTimeoutHandler;

    constructor()
    {
        super();
        this.classList.add("axial_notifier");
        this.template = "axial-notifier-template";
        this.#boundTimeoutHandler = this.#timeoutHandler.bind(this);
    }

    connectedCallback()
    {
        super.connectedCallback();
        this.#holder = this.shadowRoot.getElementById("holder");
        this.#content = this.shadowRoot.getElementById("content");
    }

    #timeoutHandler()
    {
        clearTimeout(this.#timeoutId);
        this.hide();
    }

    show( message = "" )
    {
        if( message != "" )
        {
            this.#content.innerHTML = message;
        }
        //this.#holder.style.visibility = "visible";
        this.#holder.style.transform = "translateY(0%)";
        if( this.#timeoutId )
        {
            clearTimeout(this.#timeoutId);
        }
        this.#timeoutId = setTimeout(this.#boundTimeoutHandler, this.#timeoutDelay);
    }

    hide()
    {
        this.#holder.style.transform = "translateY(100%)";
    }
}

window.customElements.define("axial-notifier", AxialNotifier);
export { AxialNotifier }