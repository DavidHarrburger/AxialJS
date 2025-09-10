"use strict";

import { AxialServiceComponentBase } from "../../core/AxialServiceComponentBase.js";
import { DomUtils } from "../../utils/DomUtils.js";

class AxialAdminKpiTile extends AxialServiceComponentBase
{
    /// vars
    /** @type { String } */
    #titleText = "";

    /** @type { Array } */
    #parsers = new Array();

    /** @type { Object } */
    #stats = {};

    /// elements
    /** @type { HTMLElement } */
    #title;

    /** @type { HTMLElement } */
    #main;
    
    constructor()
    {
        super();
        this.classList.add("axial_admin_kpi_tile");
        this.template = "axial-admin-kpi-tile-template";
    }

    static get observedAttributes()
    {
        return ["axial-title" ];
    }

    /**
     * @type { Array }
     * @readonly
     */
    get parsers() { return this.#parsers; }


    /**
     * 
     * @param { String } name 
     * @param { String } field 
     * @param { String } label 
     */
    addParser( name = "name", field = "field", label = "label", type = "", unit = "" )
    {
        const parser = 
        {
            name: name,
            field: field,
            label: label,
            type: type,
            unit: unit
        }
        this.#parsers.push( parser )
    }

    attributeChangedCallback(name, oldValue, newValue)
    {
        super.attributeChangedCallback(name, oldValue, newValue);
        if( name === "axial-title" )
        {
            this.#titleText = newValue;
            if( this.#title )
            {
                this.#title.innerHTML = this.#titleText;
            }
        }
    }

    _buildComponent()
    {
        super._buildComponent();

        this.#title = this.shadowRoot.getElementById("title");
        if( this.#title )
        {
            this.#title.innerHTML = this.#titleText;
        }

        this.#main = this.shadowRoot.getElementById("main");
    }

    _onGetResponse()
    {
        console.log("kpi loaded");
        console.log( this.getData );
        if( this.getData && this.getData.content )
        {
            this.#stats = this.getData.content;
            this.#updateComponent();
        }
    }

    #updateComponent()
    {
        DomUtils.cleanElement( this.#main );
        for( const parser of this.#parsers )
        {
            if( Object.hasOwn( this.#stats, parser.field ) === true )
            {
                const row = document.createElement("div");
                row.innerHTML = `${this.#stats[parser.field]}`;
                this.#main.appendChild(row);
            }
        }
    }
}



window.customElements.define("axial-admin-kpi-tile", AxialAdminKpiTile);
export { AxialAdminKpiTile }