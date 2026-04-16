"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";

class AxialAccordionContainer extends AxialComponentBase
{
    /// vars
    /** @type { Boolean } */
    #isOpened = false;

    /// elements
    /** @type { HTMLElement } */
    #content;

    constructor()
    {
        super();
        this.classList.add("axial_accordion_container");
        this.template = "axial-accordion-container-template";
        this.useResizeObserver = false; // too much dispatch
    }

    /**
     * @public
     * @readonly
     */
    get isOpened() { return this.#isOpened; }

    _buildComponent()
    {
        super._buildComponent();
        this.#content = this.shadowRoot.getElementById("content");
    }

    _observerResize( entries, observer )
    {
        super._observerResize( entries, observer );
        if( this.isOpened === true )
        {
            const h = this.#content.offsetHeight;
            this.style.height = String(h) + "px";
        }
    }

    open()
    {
        this.#isOpened = true;
        const h = this.#content.offsetHeight;
        this.style.height = String(h) + "px";
    }

    close()
    {
        this.#isOpened = false;
        this.style.height = "0px";
    }

    /**
     * 
     * @param { HTMLElement } element 
     */
    addElement( element )
    {
        if( element && element instanceof HTMLElement === true && this.#content )
        {
            this.#content.appendChild(element);
        }
    }
}

window.customElements.define("axial-accordion-container", AxialAccordionContainer);
export { AxialAccordionContainer }