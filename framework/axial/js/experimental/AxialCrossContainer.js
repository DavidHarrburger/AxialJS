"use strict"

import { AxialComponentBase } from "../core/AxialComponentBase";

class AxialCrossContainer extends AxialComponentBase
{
    /** @type { HTMLElement } */
    #center;
    /** @type { HTMLElement } */
    #top;
    /** @type { HTMLElement } */
    #right;
    /** @type { HTMLElement } */
    #bottom;
    /** @type { HTMLElement } */
    #left;

    /** @type { Array.<HTMLElement> } */
    #containers = new Array();

    /** @type { String } */
    #currentContainter = "center";

    /** @type { Set.<String>} */
    #directions = new Set( [ "center", "top", "right", "bottom", "left" ] );


    /** @type { Boolean } */
    #isMoving = false;

    /** @type { Boolean } */
    #isWheeling = false;

    /** @type { Number */
    #wheelTimeoutDelay = 500;

    /** @type { Number | undefined } */
    #wheelTimeoutId = undefined;

    /** @type { Boolean } */
    #useMouse = true;

    /** @type { Boolean } */
    #inverted = false;

    /** @type { Boolean } */
    #overlaid = false;


    /** @type { Number } */
    #transitionsExpected = 0;

    /** @type { Number } */
    #transitionsEnded = 0;


    /** @type { Function } */
    #boundWheelHandler;

    /** @type { Function } */
    #boundWheelTimeoutHandler;

    /** @type { Function } */
    #boundTransitionEndHandler;

    constructor()
    {
        super();
        this.classList.add("axial_cross_container");
        this.template = "axial-cross-container-template";

        this.#boundWheelHandler = this.#wheelHandler.bind(this);


        this.#boundTransitionEndHandler = this.#transitionEndHandler.bind(this);
        this.#boundWheelTimeoutHandler = this.#wheelTimeoutHandler.bind(this);
    }

    connectedCallback()
    {
        super.connectedCallback();

        console.log("cross container connected callback");
        
        this.#center = this.shadowRoot.getElementById("center");
        this.#top = this.shadowRoot.getElementById("top");
        this.#right = this.shadowRoot.getElementById("right");
        this.#bottom = this.shadowRoot.getElementById("bottom");
        this.#left = this.shadowRoot.getElementById("left");

        this.#containers.push(this.#center, this.#top, this.#bottom, this.#right, this.#left);

        if( this.#inverted == true )
        {
            this.#top.style.transform = "translate(0%, 100%)";
            this.#right.style.transform = "translate(-100%, 0%)";
            this.#bottom.style.transform = "translate(0%, -100%)";
            this.#left.style.transform = "translate(100%, 0%)";
        }

        if( this.#useMouse == true )
        {
            this.addEventListener("wheel", this.#boundWheelHandler);
        }
    }

    get inverted() { return this.#inverted; }
    set inverted( value )
    {
        if( typeof value !== "boolean" )
        {
            throw new TypeError("String value expected");
        }
        if( value == this.#inverted ) { return; }
        if( this.#currentContainter != "center" ) { return; }
        this.#inverted = value;
        if( this.#inverted == true )
        {
            this.#top.style.transform = "translate(0%, 100%)";
            this.#right.style.transform = "translate(-100%, 0%)";
            this.#bottom.style.transform = "translate(0%, -100%)";
            this.#left.style.transform = "translate(100%, 0%)";
        }
        else
        {
            this.#top.style.transform = "translate(0%, -100%)";
            this.#right.style.transform = "translate(100%, 0%)";
            this.#bottom.style.transform = "translate(0%, 100%)";
            this.#left.style.transform = "translate(-100%, 0%)";
        }
    }

    /**
     * 
     */
    get currentContainer() { return this.#currentContainter; }

    /**
     * 
     * @param { String } container 
     */
    #isEmptyContainer( container )
    {
        let isEmpty = true;
        const tempContainer = this.shadowRoot.getElementById(container);
        const assignedElements = tempContainer.children[0].assignedElements();
        if( assignedElements. length > 0 ) { isEmpty = false; }
        return isEmpty;
    }

    /**
     * Move to center, top, right, bottom or left
     * @param { String } direction 
     * @returns 
     */
    moveTo( direction )
    {
        if( typeof direction !== "string" )
        {
            throw new TypeError("String value expected");
        }
        if( direction === "" )
        {
            return;
        }
        if( this.#directions.has(direction) == false )
        {
            throw new Error("'direction' param must be 'center', 'left', 'right', 'top' or 'bottom'");
        }
        if( direction == this.#currentContainter ) { return; }
        
        //console.log( direction );


        // check if the container is empty
        // if yes return
        if( direction != "center ")
        {
            const isEmpty = this.#isEmptyContainer(direction);
            if( isEmpty === true ) { return; }
        }

        const viewChanging = new CustomEvent("viewChanging");
        this.dispatchEvent(viewChanging);

        let transformCenter;
        let transformBorder;

        switch( direction )
        {
            case "center":
                transformCenter = "translate(0%, 0%) scale(1)";
                switch( this.#currentContainter )
                {
                    case "top":
                        transformBorder = this.#inverted == false ? "translate(0%, -100%)" : "translate(0%, 100%)";
                    break;

                    case "right":
                        transformBorder = this.#inverted == false ? "translate(100%, 0%)" : "translate(-100%, 0%)";
                    break;

                    case "bottom":
                        transformBorder = this.#inverted == false ? "translate(0%, 100%)" : "translate(0%, -100%)";
                    break;

                    case "left":
                        transformBorder = this.#inverted == false ? "translate(-100%, 0%)" : "translate(100%, 0%)";
                    break;
                }
            break;

            case "top":
                transformCenter = this.#inverted == false ? "translate(0%, 100%)" : "translate(0%, -100%)";
                transformBorder = "translate(0%, 0%)";
            break;

            case "right":
                transformCenter = this.#inverted == false ? "translate(-100%, 0%)" : "translate(100%, 0%)";
                transformBorder = "translate(0%, 0%)";
            break;

            case "bottom":
                transformCenter = this.#inverted == false ? "translate(0%, -100%)" : "translate(0%, 100%)";
                transformBorder = "translate(0%, 0%)";
            break;

            case "left":
                transformCenter = this.#inverted == false ? "translate(100%, 0%)" : "translate(-100%, 0%)";
                transformBorder = "translate(0%, 0%)";
            break;

            default:
            break;
        }

        if( this.#useMouse == true )
        {
            this.removeEventListener("wheel", this.#boundWheelHandler);
        }

        for( const container of this.#containers )
        {
            container.style.transitionProperty = "transform";
            container.style.transitionDuration = "500ms";
            container.style.transitionTimingFunction = "ease";
            container.addEventListener("transitionend", this.#boundTransitionEndHandler);
        }

        this.#isMoving = true;
        this.#transitionsExpected = 2;
        this.#transitionsEnded = 0;

        if( this.#overlaid == true && direction != "center" )
        {
            transformCenter = "translate(0%, 0%) scale(0)";
            //this.#transitionsExpected = 1;
        }

        //console.log(transformBorder + " ___ " + transformCenter);

        const border = direction == "center" ? this.shadowRoot.getElementById(this.#currentContainter) : this.shadowRoot.getElementById(direction);
        border.style.transform = transformBorder;
        this.#center.style.transform = transformCenter;
        this.#currentContainter = direction;
    }

    #wheelTimeoutHandler()
    {
        console.log( "timeout" );
        this.#isWheeling = false;
    }

    /**
     * 
     * @param { WheelEvent } event 
     */
    #wheelHandler( event )
    {
        //console.log(event);
        //console.log(this.#isWheeling);

        
        clearTimeout(this.#wheelTimeoutId);
        this.#wheelTimeoutId = setTimeout( this.#boundWheelTimeoutHandler, this.#wheelTimeoutDelay);

        if(this.#isWheeling == true ) { return; }
        this.#isWheeling = true;
        
        let direction = "";

        if( this.#currentContainter == "center" )
        {
            if( event.deltaY < 0 ) { direction = "top"; }
            else if (event.deltaY > 0 ) { direction = "bottom" }
            else if (event.deltaX < 0 ) { direction = "left" }
            else if (event.deltaX > 0 ) { direction = "right" }
        }
        else
        {
            switch( this.#currentContainter )
            {
                case "top":
                    if( event.deltaY > 0 ) { direction = "center"; }
                break;

                case "right":
                    if( event.deltaX < 0 ) { direction = "center"; }
                break;

                case "bottom":
                    if( event.deltaY < 0 ) { direction = "center"; }
                break;

                case "left":
                    if( event.deltaX > 0 ) { direction = "center"; }
                break;

                default:
                    direction = ""
                break;
            }
        }

        if( direction !== "" )
        {
            this.moveTo(direction);
        }
        
    }

    _onBeforeMove( direction )
    {
        if( direction == "top" )
        {
            this.#overlaid = true;
            this.inverted = true;
        }
        else
        {
            this.#overlaid = false;
            this.inverted = false;
        }
    }

    /**
     * 
     * @param { TransitionEvent } event 
     */
    #transitionEndHandler( event )
    {
        //console.log(event);
        if( event.propertyName == "transform" )
        {
            this.#transitionsEnded += 1;
            if( this.#transitionsEnded == this.#transitionsExpected )
            {
                this.#transitionsEnded = 0;
                this.#transitionsExpected = 0;
                this.#isMoving = false;

                if( this.#useMouse == true )
                {
                    this.addEventListener("wheel", this.#boundWheelHandler);
                }

                for( const container of this.#containers )
                {
                    container.style.transitionProperty = "none";
                    container.style.transitionDuration = "0ms";
                    container.style.transitionTimingFunction = "none";
                    container.removeEventListener("transitionend", this.#boundTransitionEndHandler);
                }

                const viewChanged = new CustomEvent("viewChanged");
                this.dispatchEvent(viewChanged);
            }
        }
    }
}

window.customElements.define("axial-cross-container", AxialCrossContainer);
export { AxialCrossContainer }