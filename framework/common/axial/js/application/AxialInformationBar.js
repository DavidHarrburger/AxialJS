"use strict"

import { AxialServiceComponentBase } from "../core/AxialServiceComponentBase.js";
import { DateUtils } from "../utils/DateUtils.js";

class AxialInformationBar extends AxialServiceComponentBase
{
    /** @type { HTMLElement } */
    #holder;

    /** @type { HTMLElement } */
    #content;

    /** @type { HTMLElement } */
    #closer;

    /** @type { HTMLElement } */
    #headerElement;

    /** @type { Function } */
    #boundCloserClickHandler;

    constructor()
    {
        super();
        this.classList.add("axial_information_bar");
        this.template = "axial-information-bar-template";
        this.#boundCloserClickHandler = this.#closerClickHandler.bind(this);
    }

    get headerElement() { return this.#headerElement; }
    set headerElement( value )
    {
        this.#headerElement = value;

        this.#headerElement.style.transitionProperty = "top";
        this.#headerElement.style.transitionDuration = "500ms";
        this.#headerElement.style.transitionTimingFunction = "ease";
    }

    connectedCallback()
    {
        super.connectedCallback();
        this.#buildComponent();
    }

    #buildComponent()
    {
        this.#holder = this.shadowRoot.getElementById("holder");
        this.#content = this.shadowRoot.getElementById("content");
        this.#closer = this.shadowRoot.getElementById("closer");

        if( this.#closer ) { this.#closer.addEventListener("click", this.#boundCloserClickHandler); }

        this.#headerElement =  document.getElementsByTagName("header")[0]; // try to catch the header asap

        this.loadGetData();
    }

    _onGetResponse()
    {
        try
        {
            console.log( this.getData);
            if( this.getData.status == "ok" )
            {
                const dataContent = this.getData.content;
                if( dataContent.information )
                {
                    this.#content.innerHTML = dataContent.information;
                }
    
                const dateStart = new Date( dataContent.dateStart );
                const dateEnd = new Date( dataContent.dateEnd );
                console.log( DateUtils.isInPeriod(dateStart, dateEnd) );
                const isInPeriod = DateUtils.isInPeriod(dateStart, dateEnd)

                if( dataContent.information != "" && dataContent.isRequired === true && isInPeriod === true )
                {
                    this.show();
                }
            }
        }
        catch( err )
        {
            console.log(err);
        }
        
    }

    show()
    {
        const newTop = Math.floor( this.#holder.offsetHeight - 1 ) + "px";
        this.style.top = newTop;
        if( this.#headerElement )
        {
            this.#headerElement.style.top = newTop;
        }
    }

    hide()
    {
        this.style.top = "0";
        if( this.#headerElement )
        {
            this.#headerElement.style.top = "0";
        }
    }

    #closerClickHandler( event )
    {
        this.hide();
    }
}

window.customElements.define("axial-information-bar", AxialInformationBar);
export { AxialInformationBar }