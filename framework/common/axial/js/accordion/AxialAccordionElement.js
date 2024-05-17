"use strict"

import { AxialComponentBase } from "../core/AxialComponentBase.js";

class AxialAccordionElement extends AxialComponentBase
{

    /** @type { String } */
    #state = "closed";

    /** @type { Set } */
    #states = new Set( [ "closed", "opened" ] );

    /** @type { HTMLElement } */
    #content;

    /** @type { Boolean } */
    #isOpened = false;

    constructor()
    {
        super();
        this.classList.add("axial_accordion_element");
        this.template = "axial-accordion-element-template";
        this.useResizeObserver = true;
    }

    static get observedAttributes()
    {
        return [ "axial-state" ];
    }

    /**
     * @public
     * @readonly
     */
    get isOpened() { return this.#isOpened; }

    connectedCallback()
    {
        super.connectedCallback();
        this.#content = this.shadowRoot.getElementById("content");
        if( this.#state === "opened" )
        {
            this.open();
        }
    }

    attributeChangedCallback(name, oldValue, newValue)
    {
        super.attributeChangedCallback(name, oldValue, newValue);
        if( name === "axial-state" )
        {
            if( this.#states.has( newValue ) === true )
            {
                this.#state = newValue;
            }
        }
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
}

window.customElements.define("axial-accordion-element", AxialAccordionElement);
export { AxialAccordionElement }