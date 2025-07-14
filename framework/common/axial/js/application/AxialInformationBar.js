"use strict";

import { AxialServiceComponentBase } from "../core/AxialServiceComponentBase.js";
import { DateUtils } from "../utils/DateUtils.js";

class AxialInformationBar extends AxialServiceComponentBase
{
    /// vars
    #message = "";

    /// elements
    /** @type { HTMLElement } */
    #holder;

    /** @type { HTMLElement } */
    #content;

    /** @type { HTMLElement } */
    #closer;

    /** @type { HTMLElement } */
    #headerElement;

    /// styles
    /** @type { String } */ // computed
    #themeColor = "";

    /** @type { String } */ // computed
    #textColor = "";

    /** @type { String } */ // computed
    #textSize = "";

    /** @type { String } */ // computed
    #textWeight = "";

    /// events
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

    static get observedAttributes()
    {
        return ["axial-message", "axial-theme", "axial-color", "axial-size", "axial-weight", "axial-align" ];
    }

    attributeChangedCallback(name, oldValue, newValue)
    {
        super.attributeChangedCallback(name, oldValue, newValue);
        if( name === "axial-message" )
        {
            this.#message = newValue;
            if( this.#content )
            {
                this.#content.innerHTML = this.#message;
            }
        }

        if( name === "axial-theme" )
        {
            this.#themeColor = newValue;
            if( this.#holder ) { this.#holder.style.backgroundColor = this.#themeColor; }
        }

        if( name === "axial-color" )
        {
            this.#textColor = newValue;
            if( this.#content ) { this.#content.style.color = this.#textColor; }
        }

        if( name === "axial-size" )
        {
            this.#textSize = newValue;
            if( this.#content ) { this.#content.style.fontSize = this.#textSize; }
        }

        if( name === "axial-weight" )
        {
            this.#textWeight = newValue;
            if( this.#content ) { this.#content.style.fontWeight = this.#textWeight; }
        }
    }

    _buildComponent()
    {
        super._buildComponent();
        
        this.#holder = this.shadowRoot.getElementById("holder");
        this.#content = this.shadowRoot.getElementById("content");
        this.#closer = this.shadowRoot.getElementById("closer");

        if( this.#closer ) { this.#closer.addEventListener("click", this.#boundCloserClickHandler); }

        this.#headerElement =  document.getElementsByTagName("header")[0]; // try to catch the header asap

        // styles
        if( this.#holder )
        {
            if( this.#themeColor != "" )
            {
                this.#holder.style.backgroundColor = this.#themeColor;
            }
            else
            {
                this.#themeColor = window.getComputedStyle( this.#holder ).backgroundColor;
            }
        }

        if( this.#content )
        {
            if( this.#textColor != "" )
            {
                this.#content.style.color = this.#textColor;
            }
            else
            {
                this.#textColor = window.getComputedStyle( this.#holder ).color;
            }

            if( this.#textSize != "" )
            {
                this.#content.style.fontSize = this.#textSize;
            }
            else
            {
                this.#textSize = window.getComputedStyle( this.#holder ).fontSize;
            }

            if( this.#textWeight != "" )
            {
                this.#content.style.fontWeight = this.#textWeight;
            }
            else
            {
                this.#textWeight = window.getComputedStyle( this.#holder ).fontWeight;
            }
        }

        this.loadGetData();
    }

    _onGetResponse()
    {
        try
        {
            console.log( this.getData);
            if( this.getData.status === "ok" )
            {
                const dataContent = this.getData.content;
                if( dataContent.message && dataContent.message !== "" )
                {
                    this.#message = dataContent.message;
                    this.#content.innerHTML = dataContent.message;
                }

                if( dataContent.text_color && dataContent.text_color !== "" )
                {
                    this.#textColor = dataContent.text_color;
                    this.#content.style.color = this.#textColor;
                }

                if( dataContent.theme_color && dataContent.theme_color !== "" )
                {
                    this.#themeColor = dataContent.theme_color;
                    this.#holder.style.backgroundColor = this.#themeColor;
                }
                
                const dateStart = new Date( dataContent.date_start );
                const dateEnd = new Date( dataContent.date_end );
                const isInPeriod = DateUtils.isInPeriod(dateStart, dateEnd)
                
                if( dataContent.message !== "" && dataContent.active === true && isInPeriod === true )
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