"use strict";

import { AxialToggleButton } from "../button/AxialToggleButton.js";
import { AxialTabBar } from "./AxialTabBar.js";

class AxialTabToggle extends AxialToggleButton
{
    /// vars
    /** @type { Boolean } */
    #isDone = false;

    /** @type { String } */
    #backgroundNormal = "#fff";

    /** @type { String } */
    #backgroundDone = "#eafce4";

    /** @type { String } */
    #foregroundNormal = "#ddd";

    /** @type { String } */
    #foregroundDone = "#d1fac5";

    /// elements
    /** @type { HTMLElement } */
    #dropleft;

    /** @type { HTMLElement } */
    #dropright;

    /// events
    /** @type { Function } */
    #boundContextHandler;

    constructor()
    {
        super();
        this.classList.remove("axial_toggle_button");
        this.classList.add("axial_tab_toggle");
        this.template = "axial-tab-toggle-template";

        this.#boundContextHandler = this.#contextHandler.bind(this);
    }


    get isDone() { return this.#isDone; }
    set isDone( value )
    {
        if( typeof value !== "boolean" )
        {
            throw new TypeError("Boolean value required");
        }
        if( this.#isDone ===  value ) { return; }
        this.#isDone = value;
        this.background.style.backgroundColor = this.#isDone === false ? this.#backgroundNormal : this.#backgroundDone;
        this.foreground.style.backgroundColor = this.#isDone === false ? this.#foregroundNormal : this.#foregroundDone;
    }

    /**
     * @type { HTMLElement }
     * @readonly
     */
    get dropleft() {return this.#dropleft; }

    /**
     * @type { HTMLElement }
     * @readonly
     */
    get dropright() {return this.#dropright; }
    
    _buildComponent()
    {
        super._buildComponent();

        this.#dropleft = this.shadowRoot.getElementById("dropleft");
        this.#dropleft.style.height = "100%";

        this.#dropright = this.shadowRoot.getElementById("dropright");
        this.#dropright.style.height = "100%";

        this.addEventListener("contextmenu", this.#boundContextHandler);
    }

    #contextHandler( event )
    {
        event.preventDefault();
        
        if( this.buttonGroup instanceof AxialTabBar === true
            && this.buttonGroup.useContext === true
            && this.buttonGroup.contextOverlay !== undefined )
        {
            //console.log("should show context");
            const context = this.buttonGroup.contextOverlay;
            //console.log(context);
            context.showAsContext( event, this );
        }

    }
}

window.customElements.define("axial-tab-toggle", AxialTabToggle);
export { AxialTabToggle }