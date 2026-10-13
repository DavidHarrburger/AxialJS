"use strict";

import { AxialCardBase } from "./AxialCardBase.js";

class AxialCard extends AxialCardBase
{
    /// vars
    /** @type { String } */
    #titleText;
    
    /** @type { Boolean } */
    #isTransparent = false;

    /// elements
    /** @type { HTMLElement } */
    #title;

    /** @type { HTMLElement } */
    #content;

    constructor()
    {
        super();
        this.classList.add("axial_card");
        this.template = "axial-card-template";
    }

    static get observedAttributes()
    {
        return ["axial-title", "axial-grid-col", "axial-grid-row", "axial-transparent"];
    }

    
    /**
     * @readonly
     * @type { HTMLElement }
     */
    get title() { return this.#title; }
    
    /**
     * @readonly
     * @type { HTMLElement }
     */
    get content() { return this.#content; }

    attributeChangedCallback(name, oldValue, newValue)
    {
        super.attributeChangedCallback(name, oldValue, newValue);
        if( name === "axial-title" )
        {
            this.#titleText = newValue === null ? "" : newValue;
            if( this.#title )
            {
                this.#title.innerHTML = this.#titleText;
                this.#title.style.display = this.#title === "" ? "none" : "block";
            }
        }

        if( name === "axial-transparent" )
        {
            this.#isTransparent = newValue === null ? false : true;
            if( this.componentBuilt == true && this.#isTransparent == true )
            {
                this.style.backgroundColor = "transparent";
                this.style.filter = "none";
            }
        }
    }

    _buildComponent()
    {
        super._buildComponent();

        this.#title = this.shadowRoot.getElementById("title");
        if( this.#title  )
        {
            if( this.#titleText === undefined || this.#titleText === "" )
            {
                this.#title.style.display = "none";
            }
            else
            {
                this.#title.innerHTML = this.#titleText;
            }
        }

        if( this.#isTransparent == true )
        {
            this.style.backgroundColor = "transparent";
            this.style.filter = "none";
        }

        this.#content = this.shadowRoot.getElementById("content");
    }
}
window.customElements.define( "axial-card", AxialCard );
export { AxialCard }