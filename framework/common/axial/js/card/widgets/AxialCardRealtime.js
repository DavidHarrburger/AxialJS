"use strict";

import { AxialCard } from "../AxialCard.js";
import { AxialEventSourceManager } from "../../realtime/AxialEventSourceManager.js";

class AxialCardRealtime extends AxialCard
{
    /// vars
    /** @type { AxialEventSourceManager } */
    #eventSourceManager;

    /// elements
    /** @type { HTMLElement } */
    #main;

    /// events
    /** @type { Function } */
    #boundConnectionCallback;

    constructor()
    {
        super();
        this.template = "axial-card-realtime-template";
        this.#boundConnectionCallback = this.#connectionCallback.bind(this);
        
        this.#eventSourceManager = new AxialEventSourceManager();
        this.#eventSourceManager.addEvent("connected", this.#boundConnectionCallback );
        this.#eventSourceManager.addEvent("disconnected", this.#boundConnectionCallback );
    }

    _buildComponent()
    {
        super._buildComponent();
        this.#main = this.shadowRoot.getElementById("main");
    }

    #connectionCallback( data )
    {
        const jsonData = JSON.parse( data );
        if( this.#main )
        {
            if( jsonData.num && isNaN( jsonData.num ) === false )
            {
                this.#main.innerHTML = jsonData.num - 1;
            }
        }
    }
}

window.customElements.define("axial-card-realtime", AxialCardRealtime);
export { AxialCardRealtime }