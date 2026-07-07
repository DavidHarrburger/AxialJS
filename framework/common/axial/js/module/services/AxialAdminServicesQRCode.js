"use strict";

import { AxialServiceComponentBase } from "../../core/AxialServiceComponentBase.js";
import { AxialServiceButton } from "../../button/AxialServiceButton.js";
import { PathUtils } from "../../utils/PathUtils.js";
import { AxialToggleButtonGroupBase } from "../../button/AxialToggleButtonGroupBase.js";
import { AxialToggleRadio } from "../../button/AxialToggleRadio.js";

class AxialAdminServicesQRCode extends AxialServiceComponentBase
{

    /** @type { HTMLInputElement } */
    #qrtext;

    /** @type { HTMLInputElement } */
    #qrcolor;

    /** @type { HTMLInputElement } */
    #qrbg;

    /** @type { HTMLInputElement } */
    #qrbgAlpha;

    /** @type { HTMLImageElement } */
    #qrimage;

    /** @type { HTMLInputElement } */
    #qrsize;

    /** @type { HTMLInputElement } */
    #qrmargin;

    /** @type { AxialToggleButtonGroupBase } */
    #qrformat;

    /** @type { HTMLElement } */
    #placeholder;

    /** @type { AxialServiceButton } */
    #button;

    /// events
    /** @type { Function } */
    #boundButtonClickHandler;

    /** @type { Function } */
    #boundTextChangedHandler;

    constructor()
    {
        super();
        //this.classList.add("axial_admin_params_infobar"); n'existe pas !!!
        this.template = "axial-admin-services-qrcode-template";
        this.#boundButtonClickHandler = this.#buttonClickHandler.bind(this);
        this.#boundTextChangedHandler = this.#textChangedHandler.bind(this);
    }

    _buildComponent()
    {
        super._buildComponent();

        this.#qrtext = this.shadowRoot.getElementById("qrtext");
        this.#qrcolor = this.shadowRoot.getElementById("qrcolor");
        this.#qrbg = this.shadowRoot.getElementById("qrbg");
        this.#qrbgAlpha = this.shadowRoot.getElementById("qrbgAlpha");
        this.#qrformat = this.shadowRoot.getElementById("qrformat");
        this.#qrsize = this.shadowRoot.getElementById("qrsize");
        this.#qrmargin = this.shadowRoot.getElementById("qrmargin");
        this.#qrimage = this.shadowRoot.getElementById("qrimage");
        this.#placeholder = this.shadowRoot.getElementById("placeholder");
        this.#button = this.shadowRoot.getElementById("button");

        if( this.#qrtext )
        {
            this.#qrtext.addEventListener("input", this.#boundTextChangedHandler);
        }

        this.#button.enabled = false;
        this.#button.addEventListener("click", this.#boundButtonClickHandler);
    }

    _onPostResponse()
    {
        if( this.postData && this.postData.qrcode )
        {
            this.#qrimage.src = this.postData.qrcode;
            this.#placeholder.style.display = "none";
            this.#button.loading = false;
            this.#button.enabled = true;
        }
    }

    _preparePostData()
    {
        const bg = this.#qrbg.value;
        let alpha = Math.round( this.#qrbgAlpha.value * 255 ).toString(16);
        alpha = alpha.length === 1 ? "0" + alpha : alpha;
        const finalbg = bg + alpha;

        let postObject = 
        {
            qrtext: this.#qrtext.value.trim(),
            qrcolor: this.#qrcolor.value,
            qrbg: finalbg,
            qrsize: this.#qrsize.valueAsNumber,
            qrmargin: this.#qrmargin.valueAsNumber
        }
        return postObject;
    }

    #checkForm()
    {
        const valid = this.#qrtext.value.trim() !== "";
        if( valid === true )
        {
            this.#button.enabled = true;
        }
    }

    /**
     * 
     * @param { CustomEvent } event 
     */
    /*
    #serviceSuccessHandler( event )
    {

        const method = event.detail.method;
        if( method == "get" )
        {
            
        }
        else if( method == "post" )
        {
            
        }
    }
    */

    #textChangedHandler( event )
    {
        this.#checkForm();
    }

    async #buttonClickHandler( event )
    {
        this.#button.loading = true;
        this.#button.enabled = false;
        try
        {
            await this.loadPostData();
        }
        catch(err)
        {
            console.log(err);
        }
    }

}
window.customElements.define("axial-admin-services-qrcode", AxialAdminServicesQRCode);
export { AxialAdminServicesQRCode }