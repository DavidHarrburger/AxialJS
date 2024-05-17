"use strict"

import { AxialComponentBase } from "../core/AxialComponentBase.js";

class AxialFlipbookPageBase extends AxialComponentBase
{
    constructor()
    {
        super();
        this.classList.add("axial_flipbook_page_base");
    }
}

window.customElements.define("axial-flipbook-page-base", AxialFlipbookPageBase);
export { AxialFlipbookPageBase }