import { AxialComponentBase } from "../core/AxialComponentBase.js";
import { AxialToggleButton } from "../button/AxialToggleButton.js";
import { AxialDropdownManager } from "./AxialDropdownManager.js";

class AxialDropdown  extends AxialComponentBase
{
    /// vars
    /** @type { String } */
    #text = "Select";

    /** @type { Boolean } */
    #enabled = true;
    
    /// elements
    /** @type { AxialToggleButton } */
    #toggle;

    /** @type { HTMLElement } */
    #holder;

    /** @type { HTMLElement } */
    #content;

    /// events
    /** @type { Function } */
    #boundToggleChangedHandler;

    /**@type { Function } */
    #boundDropdownClickHandler;

    constructor()
    {
        super();
        this.classList.add("axial_dropdown");
        this.template = "axial-dropdown-template";
        this.#boundToggleChangedHandler = this.#toggleChangedHandler.bind(this);
        this.#boundDropdownClickHandler = this.#dropdownClickHandler.bind(this);

        this.addEventListener("click", this.#boundDropdownClickHandler);
        AxialDropdownManager.DROPDOWNS.add(this);
    }

    /**
     * @readonly
     */
    get toggle() { return this.#toggle; }

    /**
     * @readonly
     */
    get isOpened() { return this.#toggle.selected; }

    get enabled() { return this.#enabled; }
    set enabled( value )
    {
        if( typeof value !== "boolean" )
        {
            throw new TypeError("Boolean value expected");
        }
        if( this.#enabled === value ) { return; }
        this.#enabled = value;

        if( this.#toggle )
        {
            this.#toggle.enabled = this.#enabled;
        }
    }

    get text() { return this.#text; }
    set text( value )
    {
        if( typeof value !== "string" )
        {
            throw new TypeError("String value required");
        }
        if( this.#text === value ) { return; }
        this.#text = value;
        if( this.#toggle )
        {
            this.#toggle.text = this.#text;
        }
    }

    static get observedAttributes()
    {
        return [ "axial-template", "axial-text" ];
    }

    connectedCallback()
    {
        super.connectedCallback();
        this.#buildComponent();
    }

    attributeChangedCallback(name, oldValue, newValue)
    {
        super.attributeChangedCallback(name, oldValue, newValue);
        if( name === "axial-text" )
        {
            this.#text = newValue;
            if( this.#toggle )
            {
                this.#toggle.text = this.#text;
            }
        }
    }

    #buildComponent()
    {
        this.#toggle = this.shadowRoot.getElementById("toggle");
        if( this.#toggle )
        {
            this.#toggle.text = this.text;
            this.#toggle.addEventListener("toggleChanged", this.#boundToggleChangedHandler);
        }
        

        this.#holder = this.shadowRoot.getElementById("holder");
        this.#content = this.shadowRoot.getElementById("content");
    }

    #open()
    {
        this.#toggle.selected = true; // IMPORTANT : even if this is setted up before, not triggered twice cause of the setter
        const h = this.#content.offsetHeight;
        this.#holder.style.height = String(h) + "px";
        
        this.#holder.style.zIndex = "123456789";

        for( const dropdown of AxialDropdownManager.DROPDOWNS )
        {
            if( dropdown != this )
            {
                dropdown.close();
            }
        }
        
    }

    open() { this.#open(); }

    #close()
    {
        this.#toggle.selected = false;
        this.#holder.style.height = "0";
    }

    close() { this.#close(); }

    #toggleChangedHandler( event )
    {
        if( this.#toggle.selected === true )
        {
            this.#open();
        }
        else
        {
            this.#close();
        }
    }

    #dropdownClickHandler( event )
    {
        event.stopPropagation();
    }

}

window.customElements.define("axial-dropdown", AxialDropdown);
export { AxialDropdown }