"use strict";

import { AxialAdminKpiTile } from "./AxialAdminKpiTile.js";

class AxialAdminKpiTileStorage extends AxialAdminKpiTile
{
    constructor()
    {
        super();
        this.addParser( "numOfFiles", "numOfFiles", "Nombre de fichers" );
    }
}

window.customElements.define("axial-admin-kpi-tile-storage", AxialAdminKpiTileStorage);
export { AxialAdminKpiTileStorage }