"use strict";

/**
 * The main base class for all components.
 * @class
 * @extends { HTMLElement }
 */
class AxialComponentBase extends HTMLElement
{
    /// static
    /** @type { Set.<String> } */
    static #MANIPULATION_TYPES = Object.freeze( new Set(["none", "swipe"]) );

    /// events
    // dom (for lifecycle in specific cases)
    /** @type { Function } */
    #boundDomLoadedHandler;
    // resize
    /** @type { Function } */
    #boundResizeHandler;

    /// properties
    /**
     * @private
     * @type { undefined | null | Object }
     * @default undefined
     */
    #data = undefined;

    /**
     * @private
     * @type { Boolean }
     * @default false
     */
    #isResizable = false;

    /**
     * @private
     * @type { Boolean }
     * @default false
     */
    #useResizeObserver = false;

    /**
     * @private
     * @type { ResizeObserver }
     */
    #resizeObserver;

    /**
     * @type { Function }
     */
    #boundResizeObserverHandler;

    /**
     * @private
     * @type { Set }
     */
    #states = new Set(["init"]);

    /**
     * @private
     * @type { Boolean }
     * @default false
     */
    #useStates = false;

    /**
     * @private
     * @type { String }
     * @default ""
     */
    #previousState = "";

    /**
     * @private
     * @type { String }
     * @default "init"
     */
    #currentState = "init";

    /**
     * The identifier of the template we inject into the component's ShadowRoot.
     * @private
     * @type { String }
     * @default ""
     */
    #template = "";

    /**
     * @private
     */
    #shadowBuilt = false;

    /**
     * @private
     */
    #componentBuilt = false;

    constructor()
    {
        super();

        this.#boundDomLoadedHandler = this.#domLoadedHandler.bind(this);
        window.addEventListener("DOMContentLoaded", this.#boundDomLoadedHandler);

        this.#boundResizeHandler = this.#resizeHandler.bind(this);
        this.#boundResizeObserverHandler = this.#resizeObserverHandler.bind(this);

        this.classList.add("axial_component_base");
        this.#resizeObserver = new ResizeObserver( this.#boundResizeObserverHandler );

    }

    ///
    /// PART: WEB COMPONENT
    ///

    /**
     * Returned an array of attributes we want to observe when the attributeChangedCallback is invoked.
     * @static
     * @returns { Array }
     */
    static get observedAttributes()
    {
        //console.log("AxialComponentBase#observedAttributes()");
        return ["axial-template"];
    }

    /**
     * Get or Set the template identifier of the template we want to clone in our Shadow Component.
     * The setter invokes the private #buildShadow method to create the structure of the component.
     * @type { String }
     */
    get template() { return this.#template; }
    set template( value )
    {
        if( typeof value !== "string" )
        {
            throw new TypeError("String value required");
        }
        if( this.#template == value ) { return; }
        this.#template = value;
    }

    /**
     * Clone the node of the template into the ShadowRoot of the component
     * @private
     */
    #buildShadow()
    {
        this.attachShadow( { mode: "open" } );

        // see to change template at runtime but in fact who will need really that
        
        const template = document.getElementById(this.#template);
        if( template )
        {
            const templateContent = template.content;
            this.shadowRoot.appendChild(templateContent.cloneNode(true));
            this.#shadowBuilt = true;
        }
    }

    #domLoadedHandler( event )
    {
        window.removeEventListener("DOMContentLoaded", this.#boundDomLoadedHandler);
        this.#buildComponent();
    }

    #buildComponent()
    {
        /// WAARNING SUPER SUTILE
        if( this.#template !== "" && this.#shadowBuilt === false )
        {
            this.#buildShadow();
        }
        if( this.#componentBuilt === true ) { return; }
        this.#componentBuilt = true;
        this._buildComponent();
        const axialEvent = new CustomEvent("componentBuilt", { detail: { component: this}, bubbles: false });
        this.dispatchEvent(axialEvent);
    }

    /**
     * @type { Boolean }
     * @readonly
     */
    get componentBuilt() { return this.#componentBuilt; }

    /**
     * @override
     */
    _buildComponent() {}

    /**
     * Web Components Lifecycle : [MDN_docs] Invoked when the custom element is first connected to the document's DOM.
     * @public
     * @override
     */
    connectedCallback()
    {
        if( this.#template !== "" )
        {
            this.#buildShadow();
        }

        if( window.AXIAL !== undefined )
        {
            if( window.AXIAL.applicationDomLoaded === true )
            {
                this.#buildComponent();
            }
            else
            {
                // very special case where the component starts to be connected w/ domLoaded == false buuuut finished when the domLoaded == true
                // so the buildComponent does not fire
                // see this one for the hack : https://stackoverflow.com/questions/69381451/dom-events-domcontentloaded-in-a-web-component
                setTimeout( this.#buildComponent.bind(this), 0 ); 
            }
        }
    }

    /**
     * Web Components Lifecycle : [MDN_docs] Invoked when the custom element is disconnected from the document's DOM.
     * @public
     * @override
     */
    disconnectedCallback()
    {
        //console.log("AxialComponentBase.disconnectedCallback()");
    }

    /**
     * Web Components Lifecylce : [MDN_docs] Invoked when the custom element is moved to a new document.
     * @public
     * @override
     */
    adoptedCallback()
    {
        //console.log("AxialComponentBase.adoptedCallback()");
    }

    /**
     * Web Components Lifecycle : [MDN_docs] Invoked when one of the custom element's attributes is added, removed, or changed.
     * This callback returned if the component is not already connected. That beacause in some cases, you can update a private field before the constructor has ended.
     * The framework is designed to match all cases ie:
     *  - create a web component directly in the html file
     *  - create a component dynamically
     * @param { String } name - The name of the attribute that has changed.
     * @param { String } oldValue  - The old value of the attribute.
     * @param { String } newValue - The new value of the attribute
     * @public
     * @override
     */
    attributeChangedCallback(name, oldValue, newValue)
    {
        /*
        if( name === "axial-template" )
        {
            console.log("TEMPLATE ATTENTION REQUIRED")
            console.log(name, newValue);
        }
        */

        if( name === "axial-template" && newValue !== null && newValue !== "")
        {
            this.#template = newValue;
        }
    }

    ///
    /// PART: DATA
    ///

    /**
     * Get or set data of the component.
     * @public
     * @type { any }
     * @param { any } value 
     */
    get data() { return this.#data; }
    set data( value )
    {
        //if( this.#data == value && value !== undefined ) { return; }
        this.#data = value;
        this._onDataChanged();
        const dataChangedEvent = new CustomEvent("dataChanged", { detail: this.#data });
        this.dispatchEvent(dataChangedEvent);
    }

    /**
     * This method is called once the data property has just been setted and before the AxialComponentBase dispatches the dataChanged Custom Event.
     * @public
     * @abstract
     */
    _onDataChanged()
    {
        //console.log("AxialComponentBase._onDataChanged()");
    }

    /**
     * A convenience method to format the component as an Object.
     * @abstract
     */
    _getAsObject() { return {}; }

    ///
    /// PART: RESIZE
    ///

    /**
     * Make the component resizable or not when the window is resized.
     * @public
     * @type { Boolean }
     * @param { Boolean } value 
     * @default false
     */
    get isResizable() { return this.#isResizable; }
    set isResizable( value )
    {
        if( typeof value !== "boolean" )
        {
            throw new TypeError("Boolean value required");
        }
        if( this.#isResizable == value ) { return; }
        this.#isResizable = value;
        
        if( this.#isResizable == false )
        {
            window.removeEventListener("resize", this.#boundResizeHandler); // see for bubbling etc.
        }
        else
        {
            window.addEventListener("resize", this.#boundResizeHandler); // see for bubbling etc.
        }
    }

    /**
     * 
     */
    get useResizeObserver() { return this.#useResizeObserver; }
    set useResizeObserver( value )
    {
        if( typeof value !== "boolean" )
        {
            throw new TypeError("Boolean value required");
        }
        if( this.#useResizeObserver == value ) { return; }
        this.#useResizeObserver = value;
        
        if( this.#useResizeObserver == false )
        {
            this.#resizeObserver.unobserve(this);
        }
        else
        {
            this.#resizeObserver.observe(this);
        }
    }


    /**
     * The handler of the window resize event, bounded into the Axial component.
     * @param { Event } event - The resize event.
     */
    #resizeHandler( event )
    {
        this._resize();
    }

    /**
     * If the AxialComponentBase.isResizable property is setted to true, this method is called each time the window is resized.
     * @public
     * @override
     */
    _resize() {}

    /**
     * To bind the callback inside the component
     * @param { Array.<ResizeObserverEntry> } entries 
     * @param { ResizeObserver } observer 
     */
    #resizeObserverHandler( entries, observer )
    {
        this._observerResize( entries, observer );

        const elementResizedEvent = new CustomEvent("elementResized", { bubbles: true, detail: { entries: entries, observer, observer } } );
        this.dispatchEvent(elementResizedEvent);
    }


    /**
     * Plays the natural Resize Observer call back
     * @override
     * @param { Array.<ResizeObserverEntry> } entries 
     * @param { ResizeObserver } observer 
     */
    _observerResize( entries, observer ) {}


    ///
    /// PART: STATES
    ///

    /**
     * Return all the registered states as an Array of strings.
     * @public
     * @readonly
     * @return { Array.<String> }
     */
    get states() { return Array.from(this.#states); }

    /**
     * Indicates if the component uses states. If it uses states, the component dispatch the "stateChanged" CustomEvent when the switchToState method is called successfully.
     * @public
     * @type { Boolean }
     * @param { Boolean } value 
     * @default false
     */
    get useStates() { return this.#useStates; }
    set useStates( value )
    {
        if( typeof value !== "boolean" )
        {
            throw new TypeError("Boolean value required");
        }
        if( this.#useStates == value ) { return; }
        this.#useStates = value;
    }
    /**
     * Get the previous state of the component. Returns an empty string if the state of the component has not changed since it were created.
     * @public
     * @readonly
     * @return { String }
     */
    get previousState() { return this.#previousState; }

    /**
     * Get the previous state of the component. Returns an empty string if the state of the component has not changed since it were created.
     * @public
     * @readonly
     * @return { String }
     */
    get currentState() { return this.#currentState; }

    /**
     * Called when the component current state changes successfully.
     * @public
     */
    _onStateChanged() {}

    /**
     * Add a new state to the states registry of the component.
     * @public
     * @param { String } stateName The name of the new state.
     */
    addState( stateName )
    {
        if( typeof stateName !== "string" )
        {
            throw new TypeError("String value required");
        }
        this.#states.add(stateName);
    }

    /**
     * Delete the state from the states registry of the component. Throws an error if the state is not registered yet.
     * @public
     * @param { String } stateName The name of the state to delete.
     */
    deleteState( stateName )
    {
        if( typeof stateName !== "string" )
        {
            throw new TypeError("String value required");
        }
        if( this.#states.has(stateName) === false )
        {
            throw new Error(`The state ${stateName} is not registered`);
        }
        this.#states.delete(stateName);
    }

    /**
     * Change the state of the component to a new state that has been already registered with the addState method.
     * @param { String } stateName The name of new state.
     */
    switchToState( stateName )
    {
        if( typeof stateName !== "string" )
        {
            throw new TypeError("String value required");
        }
        if( this.#states.has(stateName) == false )
        {
            throw new Error(`The state "${stateName}" is not registered`);
        }
        if( this.#currentState != stateName )
        {
            this.#previousState = this.#currentState;
            this.#currentState = stateName;
            this._onStateChanged();

            const stateChangedEventDetail = { newState: this.#currentState, oldState: this.#previousState };
            const stateChangedEvent = new CustomEvent("stateChanged", { detail: stateChangedEventDetail });
            this.dispatchEvent(stateChangedEvent);
        }
    }

    
}

window.customElements.define("axial-component-base", AxialComponentBase);
export { AxialComponentBase }