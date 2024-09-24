"use strict"

import { AxialServiceComponentBase } from "../../core/AxialServiceComponentBase.js";
import { AxialPopupManager } from "../../popup/AxialPopupManager.js";
import { DomUtils } from "../../utils/DomUtils.js";
import { AxialAdminMailItem } from "./AxialAdminMailItem.js";

class AxialAdminMailList extends AxialServiceComponentBase
{
    /// vars
    /** @type { Array } */
    #mails;

    /// elements
    /** @type { HTMLElement } */
    #holder;

    constructor()
    {
        super();
        this.classList.add("axial_admin_mail_list")
        this.template = "axial-admin-mail-list-template";
    }

    connectedCallback()
    {
        super.connectedCallback();
        this.#buildComponent();
    }

    #buildComponent()
    {
        this.#holder = this.shadowRoot.getElementById("holder");
    }

    async getAllMails()
    {
        try
        {
            await this.loadGetData();
            this.#mails = this.getData.mails;
            const mailPopup = AxialPopupManager.getPopupById("mailPopup");
            if( mailPopup )
            {
                mailPopup.mailViewer.data = this.#mails;
            }
            this.#updateComponent();
        }
        catch(err)
        {
            console.log(err);
        }
    }

    #updateComponent()
    {
        if( this.#holder )
        {
            DomUtils.cleanElement( this.#holder );
            const mailLength = this.#mails.length;
            
            for( let i = 0; i < mailLength; i++ )
            {
                let mailModel = this.#mails[i];
                const mailItem = new AxialAdminMailItem();
                this.#holder.appendChild( mailItem );
                mailItem.data = mailModel;
                mailItem.index = i;
            }
        }
    }

}

window.customElements.define("axial-admin-mail-list", AxialAdminMailList);
export { AxialAdminMailList }