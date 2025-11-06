"use strict";

import { AxialViewBase } from "../../view/AxialViewBase.js";

class AxialAdminViewBase extends AxialViewBase
{
    constructor()
    {
        super();
    }
}

window.customElements.define("axial-admin-view-base", AxialAdminViewBase);
export { AxialAdminViewBase }