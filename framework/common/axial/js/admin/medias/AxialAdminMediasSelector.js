"use strict"

import { AxialServiceComponentBase } from "../../core/AxialServiceComponentBase.js";
import { DomUtils } from "../../utils/DomUtils.js";
import { AxialAdminMediasSelectorItem } from "./AxialAdminMediasSelectorItem.js";

class AxialAdminMediasSelector extends AxialServiceComponentBase
{
    /** @type { Array } */
    #medias;

    /** @type { HTMLElement } */
    #grid;

    constructor()
    {
        super();
        this.classList.add("axial_admin_medias_selector");
        this.template = "axial-admin-medias-selector-template";
    }

    connectedCallback()
    {
        super.connectedCallback();
        this.#buildComponent();
    }

    #buildComponent()
    {
        this.#grid = this.shadowRoot.getElementById("grid");
    }

    async getAllFiles()
    {
        console.log("selector.getAllFiles()");
        
        try
        {
            await this.loadGetData();
            this.#medias = this.getData.medias;
            this.#updateSelector();
        }
        catch(err)
        {
            console.log(err);
        }
        
    }

    show()
    {
        this.style.visibility = "visible";
        this.style.transform = "translateY(0%)";
        this.getAllFiles();
    }

    hide()
    {
        this.style.transform = "translateY(101%)";
    }

    #updateSelector()
    {
        
        if( this.#grid )
        {
            DomUtils.cleanElement(this.#grid);
            for( const media of this.#medias )
            {
                const item = new AxialAdminMediasSelectorItem();
                this.#grid.appendChild(item);
                item.data = media;
            }
        }
        
    }



}
window.customElements.define("axial-admin-medias-selector", AxialAdminMediasSelector);
export { AxialAdminMediasSelector }