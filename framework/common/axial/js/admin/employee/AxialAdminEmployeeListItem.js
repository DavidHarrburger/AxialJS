"use strict";

import { AxialAdminListItem } from "../base/AxialAdminListItem.js";
import { PathUtils } from "../../utils/PathUtils.js";
import { DateUtils } from "../../utils/DateUtils.js";
import { FormatUtils } from "../../utils/FormatUtils.js";
import { AxialPopupManager } from "../../popup/AxialPopupManager.js";

class AxialAdminEmployeeListItem extends AxialAdminListItem
{
    /// elements
    /** @type { HTMLElement } */
    #photo;

    /** @type { HTMLElement } */
    #name;

    /** @type { HTMLElement } */
    #email;
    
    /** @type { HTMLElement } */
    #tel;

    /** @type { HTMLElement } */
    #datein;

    /** @type { HTMLElement } */
    #dateout;

    constructor()
    {
        super();
        this.classList.add("axial_admin_list_item");
        this.template = "axial-admin-employee-list-item-template";
        this.popupId = "employeePopup";
    }

    _buildComponent()
    {
        super._buildComponent();

        this.#photo = this.shadowRoot.getElementById("photo");
        this.#name = this.shadowRoot.getElementById("name");
        this.#email = this.shadowRoot.getElementById("email");
        this.#tel = this.shadowRoot.getElementById("tel");
        this.#datein = this.shadowRoot.getElementById("datein");
        this.#dateout = this.shadowRoot.getElementById("dateout");

        if( this.data !== undefined )
        {
            this.#updateComponent();
        }
    }

    _onDataChanged()
    {
        super._onDataChanged();
        if( this.componentBuilt === true )
        {
            this.#updateComponent();
        }
    }

    #updateComponent()
    {
        if( this.componentBuilt === true && this.data !== undefined )
        {
            this.#photo.style.backgroundImage = `url('${PathUtils.getPathFromRelative(this.data.image_main)}')`;
            
            this.#name.innerHTML = `${this.data.first_name} ${this.data.last_name.toUpperCase()}`;
            this.#email.innerHTML = this.data.email;
            this.#tel.innerHTML = FormatUtils.formatPhone(this.data.tel);

            // date_in
            if( this.data.date_in && DateUtils.isValidDate( new Date( this.data.date_in ) ) === true )
            {
                this.#datein.innerHTML = DateUtils.format( new Date( this.data.date_in ) );
            }
            else
            {
                this.#datein.innerHTML = "--/--/----";
            }

            // date_out
            if( this.data.date_out && DateUtils.isValidDate( new Date( this.data.date_out ) ) === true )
            {
                this.#dateout.innerHTML = DateUtils.format( new Date( this.data.date_out ) );
            }
            else
            {
                this.#dateout.innerHTML = "--/--/----";
            }
        }
    }

    _onItemEdit()
    {
        super._onItemEdit();
        const popup = AxialPopupManager.getPopupById(this.popupId);
        if( popup )
        {
            popup.title = `Modifier ${this.data.first_name} ${this.data.last_name.toUpperCase()}`;
        }
    }
}

window.customElements.define("axial-admin-employee-list-item", AxialAdminEmployeeListItem);
export { AxialAdminEmployeeListItem }