"use strict";

import { AxialServiceComponentBase } from "../core/AxialServiceComponentBase.js";

class AxialViewBase extends AxialServiceComponentBase
{
    constructor()
    {
        super();
        this.classList.add("axial_view_base");
    }

    static get observedAttributes()
    {
        return [ "axial-name" ];
    }

    /** @override */
    _onViewLeaving() {}

    /** @override */
    _onViewLeft() {}

    /** @override */
    _onViewEntering() {}

    /** @override */
    _onViewEntered() {}
}

window.customElements.define("axial-view-base", AxialViewBase);
export { AxialViewBase }