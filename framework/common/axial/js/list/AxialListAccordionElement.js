"use strict";

import { AxialAccordionElement } from "../accordion/AxialAccordionElement.js";

class AxialListAccordionElement extends AxialAccordionElement
{
    constructor()
    {
        super();
        this.template = "axial-list-accordion-element-template";
    }
}

window.customElements.define("axial-list-accordion-element", AxialListAccordionElement);
export { AxialListAccordionElement }