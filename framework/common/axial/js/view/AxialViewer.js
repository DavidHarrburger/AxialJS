"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";
import { AxialView } from "./AxialView.js";

class AxialViewer extends AxialComponentBase
{
    /// vars
    /** @type { Array } */
    #views = new Array();

    /// elements
    /** @type { HTMLSlotElement } */
    #slot;

    constructor()
    {
        super();
        this.classList.add("axial_viewer");
        this.template = "axial-viewer-template";
    }

    connectedCallback()
    {
        super.connectedCallback();
    }

    _buildComponent()
    {
        super._buildComponent();

        this.#slot = this.shadowRoot.getElementById("slot");
        if( this.#slot )
        {
            const possibleViews = this.#slot.assignedElements();
            const viewsLength = possibleViews.length;
            if( viewsLength > 0 )
            {
                for( let i = 0; i < viewsLength; i++ )
                {
                    const view = possibleViews[i];
                    if( view instanceof AxialView === true )
                    {
                        this.#views.push(view);
                        if( i === 0 ) { view.style.display = "block"; } else { view.style.display = "none"; }
                    }
                }
            }
        }
    }

    gotoViewByIndex( index = 0 )
    {
        const viewsLength = this.#views.length;
        if( viewsLength > 0 )
        {
            for( let i = 0; i < viewsLength; i++ )
            {
                const view = this.#views[i];
                if( i === index ) { view.style.display = "block"; } else { view.style.display = "none"; }
            }
        }
    }


}

window.customElements.define("axial-viewer", AxialViewer);
export { AxialViewer }