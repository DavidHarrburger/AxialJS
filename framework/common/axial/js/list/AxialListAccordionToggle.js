"use strict";

import { AxialAccordionToggle } from "../accordion/AxialAccordionToggle.js";

class AxialListAccordionToggle extends AxialAccordionToggle
{
    constructor()
    {
        super();
        this.classList.add("axial_list_accordion_toggle");
        this.template = "axial-list-accordion-toggle-template";
    }
}

window.customElements.define("axial-list-accordion-toggle", AxialListAccordionToggle);
export { AxialListAccordionToggle }