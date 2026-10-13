"use strict";

import { AxialServiceButton } from "../../button/AxialServiceButton.js";
import { AxialModuleView } from "../../view/AxialModuleView.js";
import { PathUtils } from "../../utils/PathUtils.js";
import { StringUtils } from "../../utils/StringUtils.js";
import { FetchUtils } from "../../utils/FetchUtils.js";

class AxialModuleNotificationView extends AxialModuleView
{
    /// vars
    /** @type { String } */
    #apiPushSendPath = "./api/push/send";

    /** @type { Number } */
    #maxTitle = 40;

    /** @type { Number } */
    #maxMessage = 200;

    /// elements
    /** @type { HTMLInputElement } */
    #titleInput;

    /** @type { HTMLInputElement } */
    #titleLegend;

    /** @type { HTMLTextAreaElement} */
    #messageArea;

    /** @type { HTMLInputElement } */
    #messageLegend;

    /** @type { AxialServiceButton } */
    #sendButton;

    /// events
    /** @type { Function } */
    #boundInputHandler;

    /** @type { Function } */
    #boundAreaHandler;

    /** @type { Function } */
    #boundSendHandler;

    constructor()
    {
        super();
        this.template = "axial-module-notification-view-template";

        this.#apiPushSendPath = PathUtils.getPathFromRelative( this.#apiPushSendPath );

        this.#boundInputHandler = this.#inputHandler.bind(this);
        this.#boundAreaHandler = this.#areaHandler.bind(this);
        this.#boundSendHandler = this.#sendHandler.bind(this);
    }

    _buildComponent()
    {
        super._buildComponent();

        this.#titleInput = this.shadowRoot.getElementById("titleInput");
        this.#titleLegend = this.shadowRoot.getElementById("titleLegend");
        this.#messageArea = this.shadowRoot.getElementById("messageArea");
        this.#messageLegend = this.shadowRoot.getElementById("messageLegend");
        this.#sendButton = this.shadowRoot.getElementById("sendButton");

        this.#titleInput.addEventListener("input", this.#boundInputHandler);
        this.#titleInput.addEventListener("focusout", this.#boundInputHandler);

        this.#messageArea.addEventListener("input", this.#boundAreaHandler);
        this.#messageArea.addEventListener("focusout", this.#boundAreaHandler);

        this.#sendButton.addEventListener("click", this.#boundSendHandler);
        this.#sendButton.enabled = false;
    }

    #inputHandler( event )
    {
        const len = this.#titleInput.value.length;
        this.#titleLegend.innerHTML = `${len} / ${this.#maxTitle} caractères`;
        this.#checkValidity();
    }

    #areaHandler( event )
    {
        const len = this.#messageArea.value.length;
        this.#messageLegend.innerHTML = `${len} / ${this.#maxMessage} caractères`;
        this.#checkValidity();
    }


    #checkValidity()
    {
        if( this.#titleInput.validity.valid === true && this.#messageArea.validity.valid === true )
        {
            this.#sendButton.enabled = true;
        }
        else
        {
            this.#sendButton.enabled = false;
        }
    }

    async #sendHandler( event )
    {
        this.#sendButton.enabled = false;
        this.#sendButton.loading = true;

        this.#titleInput.disabled = true;
        this.#messageArea.disabled = true;

        await this.#sendNotification();
    }

    async #sendNotification()
    {
        try
        {
            const payload = 
            {
                title: this.#titleInput.value,
                message: this.#messageArea.value
            }
            const result = await FetchUtils.POST( this.#apiPushSendPath, payload );
        }
        catch(err)
        {
            console.log( err );
        }
        finally
        {
            this.#reinit()
        }
    }

    #reinit()
    {
        this.#sendButton.enabled = true;
        this.#sendButton.loading = false;

        this.#titleInput.disabled = false;
        this.#messageArea.disabled = false;

        this.#titleInput.value = "";
        this.#messageArea.value = "";

        this.#titleLegend.innerHTML = `0 / ${this.#maxTitle} caractères`;
        this.#messageLegend.innerHTML = `0 / ${this.#maxMessage} caractères`;
    }

}

window.customElements.define("axial-module-notification-view", AxialModuleNotificationView);
export { AxialModuleNotificationView }