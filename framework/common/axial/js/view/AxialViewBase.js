"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase";

class AxialViewBase extends AxialComponentBase
{
    constructor()
    {
        super();
        this.classList.add("axial_view_base");
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