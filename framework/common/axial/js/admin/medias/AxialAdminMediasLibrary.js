"use strict"

import { AxialServiceComponentBase } from "../../core/AxialServiceComponentBase.js";
import { DomUtils } from "../../utils/DomUtils.js";
import { AxialAdminMediasLibraryItem } from "./AxialAdminMediasLibraryItem.js";

class AxialAdminMediasLibrary extends AxialServiceComponentBase
{
    /** @type { Array } */
    #medias;

    /** @type { HTMLElement } */
    #grid;

    constructor()
    {
        super();
        this.classList.add("axial_admin_medias_library");
        this.template = "axial-admin-medias-library-template";
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
        console.log("library.getAllFiles()");
        try
        {
            await this.loadGetData();
            this.#medias = this.getData.medias;
            this.#updateLibrary();
        }
        catch(err)
        {
            console.log(err);
        }
    }

    #updateLibrary()
    {
        if( this.#grid )
        {
            DomUtils.cleanElement(this.#grid);
            for( const media of this.#medias )
            {
                const item = new AxialAdminMediasLibraryItem();
                this.#grid.appendChild(item);
                item.data = media;
            }
        }
        
    }



}
window.customElements.define("axial-admin-medias-library", AxialAdminMediasLibrary);
export { AxialAdminMediasLibrary }