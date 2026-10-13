"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";
import { FetchUtils } from "../utils/FetchUtils.js";
import { ObjectUtils } from "../utils/ObjectUtils.js";
import { PathUtils } from "../utils/PathUtils.js";

class AxialQuoteHeader extends AxialComponentBase
{
    /** @type { HTMLImageElement } */
    #logo;

    /** @type { HTMLElement } */
    #address;

    /** @type { String } */
    #logoPath = "./api/params/estimation/image/get";

    /** @type { String } */
    #addressPath = "./api/params/estimation/address/get";

    constructor()
    {
        super();
        this.classList.add("axial_quote_header");
        this.template = "axial-quote-header-template";
        this.#logoPath = PathUtils.getPathFromRelative(this.#logoPath);
        this.#addressPath = PathUtils.getPathFromRelative(this.#addressPath);
    }

    _buildComponent()
    {
        super._buildComponent();
        this.#logo = this.shadowRoot.getElementById("logo");
        this.#address = this.shadowRoot.getElementById("address");
        this.#fetchHeader();
    }

    async #fetchHeader()
    {
        try
        {
            const logoJson = await FetchUtils.GET(this.#logoPath);
            const logoUrl = PathUtils.getPathFromRelative(logoJson.content.items[0].value);
            this.#logo.src = logoUrl;

            const addressJson = await FetchUtils.GET(this.#addressPath);
            if( addressJson )
            {
                //console.log(addressJson);
                const content = addressJson.content;
                const name = ObjectUtils.getObjectByField( content, "field", "company_name");
                const address = ObjectUtils.getObjectByField( content, "field", "address_line_1");
                const zip = ObjectUtils.getObjectByField( content, "field", "address_zip");
                const city = ObjectUtils.getObjectByField( content, "field", "address_city");

                this.#address.innerHTML = `${name.value}<br>${address.value}<br>${zip.value} ${city.value}`;
            }
        }
        catch(err)
        {
            console.log(err);
        }
    }
}

window.customElements.define("axial-quote-header", AxialQuoteHeader);
export { AxialQuoteHeader }