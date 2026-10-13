"use strict";

import { AxialServiceComponentBase } from "../core/AxialServiceComponentBase.js";
import { PathUtils } from "../utils/PathUtils.js";

/** en cours d'écriture */
class AxialOpenHours extends AxialServiceComponentBase
{
    /** @type { HTMLElement } */
    #gridHalf;

    /** @type { HTMLElement } */
    #gridFull;

    /** @type { String } */
    #classNameBase = "axial_open_hours-";

    /** @type { String } */
    #localGetPath = "./api/params/company/timeshift/get";

    constructor()
    {
        super();
        this.classList.add("axial_open_hours");
        this.template = "axial-open-hours-template";
        this.getPath = PathUtils.getPathFromRelative( this.#localGetPath );
    }

    _buildComponent()
    {
        super._buildComponent();

        this.#gridHalf = this.shadowRoot.getElementById("gridHalf");
        this.#gridFull = this.shadowRoot.getElementById("gridFull");
        
        this.loadGetData();
    }

    _onGetResponse()
    {
        this.#displayHours();
    }

    #displayHours()
    {
        const hours = this.getData?.content?.items[0]?.value;
        console.log( hours );
        if( hours )
        {
            if( hours.mode === 0 )
            {
                this.#gridHalf.style.display = "grid";
                const half = hours.half;
                for( let i = 0; i < 7; i++ )
                {
                    const data = half[i];
                    const isOpen = data[4] === false;
                    if( isOpen === false )
                    {
                        //cell.innerHTML = "Fermé";
                        const apName = this.#classNameBase + "ap" + (i+1);
                        const apCell = this.#gridHalf.getElementsByClassName(apName)[0];
                        apCell.innerHTML = "Fermé";
                    }
                    else
                    {
                        const amName = this.#classNameBase + "am" + (i+1);
                        const pmName = this.#classNameBase + "pm" + (i+1);
                        
                        const amCell = this.#gridHalf.getElementsByClassName(amName)[0];
                        const pmCell = this.#gridHalf.getElementsByClassName(pmName)[0];

                        amCell.innerHTML = `${data[0]} - ${data[1]}`;
                        pmCell.innerHTML = `${data[2]} - ${data[3]}`;
                    }
                }
            }
            else if( hours.mode === 1 )
            {
                this.#gridFull.style.display = "grid";
                const full = hours.full;
                for( let i = 0; i < 7; i++ )
                {
                    const cellName = this.#classNameBase + "f" + (i+1);
                    const cell = this.#gridFull.getElementsByClassName(cellName)[0];
                    const data = full[i];
                    const isOpen = data[2] === false;
                    if( isOpen === false )
                    {
                        cell.innerHTML = "Fermé";
                    }
                    else
                    {
                        cell.innerHTML = `${data[0]} - ${data[1]}`;
                    }
                }
            }
            else
            {
                // we will see
            }
        }
    }
}

window.customElements.define("axial-open-hours", AxialOpenHours);
export { AxialOpenHours }