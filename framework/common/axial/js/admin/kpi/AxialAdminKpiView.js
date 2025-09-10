"use strict";

import { AxialAdminViewBase } from "../base/AxialAdminViewBase.js";
import { AxialAdminKpiTile } from "./AxialAdminKpiTile.js";

class AxialAdminKpiView extends AxialAdminViewBase
{
    /** @type { HTMLElement } */
    #kpiHolder;

    /** @type { Array<AxialAdminKpiTile>} */
    #kpiTiles = new Array();

    constructor()
    {
        super();
        this.template = "axial-admin-kpi-view-template";
        
    }

    _buildComponent()
    {
        super._buildComponent();
        this.#kpiHolder = this.shadowRoot.getElementById("kpiHolder");
        const c = this.#kpiHolder.children;
        for(const k of c )
        {
            if( k instanceof AxialAdminKpiTile )
            {
                //this.#kpiTiles = Array.from( this.#kpiHolder.getElementsByTagName("axial-admin-kpi-tile") );
                this.#kpiTiles.push( k );
            }
        }
        console.log(this.#kpiTiles);

        
    }

    _prepareGetData()
    {
        
    }

    _onGetResponse()
    {
        
    }

    loadAllKpi()
    {
        if( this.#kpiTiles && this.#kpiTiles.length > 0 )
        {
            for( const tile of this.#kpiTiles )
            {
                tile.loadGetData();
            }
        }
    }

}
window.customElements.define("axial-admin-kpi-view", AxialAdminKpiView);
export { AxialAdminKpiView }