"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase";
import { AxialViewBase } from "./AxialViewBase";

class AxialViewerBase extends AxialComponentBase
{
    /// events
    #boundManipulationStartedHandler;
    #boundManipulationChangedHandler;
    #boundManipulationFinishedHandler;
    #boundManipulationCancelledHandler;

    /// properties
    /**
     * @type { Array<AxialViewBase> }
     */
    #views = new Array();

    /** @type { AxialViewBase } */
    #oldView = undefined;

    /** @type { AxialViewBase } */
    #newView = undefined;

    /**
     * The current index of the displayed view (if it exists).
     * @type { Number }
     */
    #index = -1;

    /**
     * @type { HTMLDivElement }
     */
    #holder;

    /**
     * Cached duration. Used to know if we have long touch or just a quick finger move
     */
    #duration = 0;

    /**
     * Cached X distance for swipe between views.
     * @type { Number }
     */
    #distanceX = 0;

    #direction = 0;

    #currentTransition = "none";
    #boundAnimationFinish;

    #oldAnimation;
    #newAnimation;

    #animationDuration = 1000;
    #animationExpected = 0;
    #animationFinished = 0;

    

    static #TRANSITIONS = Object.freeze(new Set(["none", "fade", "slide"]));
    static get TRANSITIONS()
    {
        return AxialViewerBase.#TRANSITIONS;
    }

    constructor()
    {
        super();

        this.#boundManipulationStartedHandler = this.#manipulationStartedHandler.bind(this);
        this.#boundManipulationChangedHandler = this.#manipulationChangedHandler.bind(this);
        this.#boundManipulationFinishedHandler = this.#manipulationFinishedHandler.bind(this);
        this.#boundManipulationCancelledHandler = this.#manipulationCancelledHandler.bind(this);

        this.#boundAnimationFinish = this.#animationFinish.bind(this);

        this.addEventListener("manipulationStarted", this.#boundManipulationStartedHandler);
        this.addEventListener("manipulationChanged", this.#boundManipulationChangedHandler);
        this.addEventListener("manipulationFinished", this.#boundManipulationFinishedHandler);
        this.addEventListener("manipulationCancelled", this.#boundManipulationCancelledHandler);

        this.classList.add("axial_viewer_base");
        this.template = "axial-viewer-base-template";
        this.isResizable = true;
    }

    _finalizeComponent()
    {
        // ui : check the children length and get the holder
        const children = this.shadowRoot.children;
        const childrenLength = children.length;
        if( childrenLength != 2 ) { throw new Error("AxialViewerBase seems to not have the correct template"); }

        const tempHolder = children[1];
        if( tempHolder.classList.contains("axial_viewer_base-holder") == true )
        {
            this.#holder = tempHolder;
        }

        const slot = this.#holder.children[0];
        if( slot == undefined || slot == null ) { throw new Error("AxialViewerBase seems to not have the correct template"); }

        const tempViews = slot.assignedElements();
        const tempViewsLength = tempViews.length;
        if( tempViewsLength > 0 )
        {
            this.#index = 0;
            for( let i = 0; i < tempViewsLength; i++ )
            {
                const tempView = tempViews[i];
                if( tempView instanceof AxialViewBase == true )
                {
                    this.#views.push(tempView);
                }
                else
                {
                    throw new Error("Elements in a viewer must be or extends AxialViewBase");
                }
            }
            this.#adjustViews();
        }
    }

    /** @override */
    _resize()
    {
        super._resize();
        this.#adjustViews();
    }

    /**
     * Return the current view in the viewer.
     * @public
     * @type { AxialViewBase }
     * @return { AxialViewBase }
     */
    get currentView() { return this.#views[this.#index]; }

    /**
     * Get the current index of the displayed view
     * @public
     * @type { Number }
     * @return { Number }
     */
    get currentViewIndex() { return this.#index; }

    /**
     * Get the max view in the container
     * @public
     * @type { Number }
     * @return { Number }
     */
    get maxViews() { return this.#views.length; }

    /**
     * Get an array with all the views
     * @public
     * @type { Array<AxialViewBase> }
     * @return { Array<AxialViewBase> }
     */
    get allViews() { return this.#views; }

    /**
     * Add a view to the viewer
     * @param { AxialViewBase } view 
     */
    addView( view )
    {
        if( view instanceof AxialViewBase == false )
        {
            throw new Error("Elements in a viewer must be or extends AxialViewBase");
            
        }
        this.#views.push(view);
        this.#holder.appendChild(view);
        if( this.#index == -1 )
        {
            this.#index = 0;
        }
        this.#adjustViews();
    }

    /**
     * Go to a view via its index and play the associated transition if passed
     * @param { Number } index - The index of the view we want to display
     * @param { String } transition - The name of the transition we want to play.
     */
    gotoViewByIndex( index = 0, transition = "none" )
    {
        // index check
        const viewsLength = this.#views.length;
        if( viewsLength == 0 ) { return; }

        if( isNaN(index) == true )
        {
            throw new TypeError("index arg must be a number");
        }
        
        if( index < 0 ) { throw new Error("index value can't be negative"); }
        if( index > this.#views.length ) { throw new Error("index value can't excess the maximum of views in the viewer"); }
        if( index == this.#index ) { return; } // 

        // other index checks ???
        // then transition checks
        if( typeof transition !== "string" )
        {
            throw new TypeError("String value expected for transition");
        }

        if( AxialViewerBase.#TRANSITIONS.has(transition) == false )
        {
            throw new Error(" 'none', 'fade' or 'slide' value expected ");
        }

        this.#oldView = this.#views[this.#index];
        this.#newView = this.#views[index];

        this.#oldView._onViewLeaving();
        this.#newView._onViewEntering();

        // fix it later
        const viewLeavingEvent = new CustomEvent("viewLeaving");
        this.dispatchEvent(viewLeavingEvent);

        const viewEnteringEvent = new CustomEvent("viewEntering");
        this.dispatchEvent(viewEnteringEvent);


        // main code
        this.#direction = index > this.#index ? -1 : 1;
        this.#index = index;
        this.#currentTransition = transition;

        if( transition == "none" )
        {
            for( let i = 0; i < viewsLength; i++ )
            {
                const currentView = this.#views[i];
                currentView.style.left = "0px"; // bug in adjust views ?
                i == this.#index ? currentView.style.display = "block" : currentView.style.display = "none";
            }
            this.#oldView._onViewLeft();
            this.#newView._onViewEntered();

            // fix it later : view should dispacth ?
            const viewLeftEvent = new CustomEvent("viewLeft");
            this.dispatchEvent(viewLeftEvent);

            const viewEnteredEvent = new CustomEvent("viewEntered");
            this.dispatchEvent(viewEnteredEvent);
        }
        else
        {
            this.#animationFinished = 0;
            this.#animationExpected = 2;
            this.#prepareTransitions();
        }
    }

    #prepareTransitions()
    {
        switch( this.#currentTransition )
        {
            case "fade":
                this.#fade();
            break;

            case "slide":
                this.#slide();
            break;

            default:
            break;
        }
    }

    #fade()
    {
        this.#newView.style.display = "block";
        
        this.#oldAnimation = this.#oldView.animate(
            [{ display: "block" , opacity: 1 },  { display: "block" , opacity: 0 } ],
            { iterations: 1 , duration: this.#animationDuration, fill: "both" }
        );
        this.#oldAnimation.addEventListener("finish", this.#boundAnimationFinish);
        

        this.#newAnimation = this.#newView.animate(
            [ { display: "block" , opacity: 0 },  { display: "block" , opacity: 1 } ],
            { iterations: 1 , duration: this.#animationDuration, fill: "both" }
        );
        this.#newAnimation.addEventListener("finish", this.#boundAnimationFinish);
    }

    #slide()
    {
        this.#newView.style.display = "block";
        const w = this.offsetWidth;
        const oldFinalX = String(this.#direction * w) + "px";
        const newStartX = String(this.#direction * -w) + "px";

        
        this.#oldAnimation = this.#oldView.animate(
            [{ left: "0px" },  { left: oldFinalX } ],
            { iterations: 1 , duration: this.#animationDuration }
        );
        this.#oldAnimation.addEventListener("finish", this.#boundAnimationFinish);
        

        this.#newAnimation = this.#newView.animate(
            [ { left: newStartX },  { left: "0px" } ],
            { iterations: 1 , duration: this.#animationDuration }
        );
        this.#newAnimation.addEventListener("finish", this.#boundAnimationFinish);
    }

    #animationFinish( event )
    {
        //console.log(event);
        this.#animationFinished += 1;
        //console.log("this.#animationFinished = " + this.#animationFinished);
        if( this.#animationExpected == this.#animationFinished )
        {
            console.log("DONE");
            this.#oldAnimation.removeEventListener("finish", this.#boundAnimationFinish);
            this.#newAnimation.removeEventListener("finish", this.#boundAnimationFinish);

            this.#oldView._onViewLeft();
            this.#newView._onViewEntered();

            // fix it later : view should dispacth ?
            const viewLeftEvent = new CustomEvent("viewLeft");
            this.dispatchEvent(viewLeftEvent);

            const viewEnteredEvent = new CustomEvent("viewEntered");
            this.dispatchEvent(viewEnteredEvent);
            
            this.#adjustViews();
        }
    }

    #adjustViews()
    {
        console.log("ADJUSTING VIEWS");
        const viewsLength = this.#views.length;
        if( viewsLength == 0 ) { return; }

        // re init ?
        this.#distanceX = 0;
        this.#duration = 0;

        for( let i = 0; i < viewsLength; i++ )
        {
            const currentView = this.#views[i];
            currentView.style.left = "0px"; // ensure initial left position
            i == this.#index ? currentView.style.display = "block" : currentView.style.display = "none";
        }
    }

    /**
     * 
     * @param { CustomEvent } event 
     */
    #manipulationStartedHandler(event)
    {
        console.log(event.detail);
        const viewsLength = this.#views.length;
        if( viewsLength == 0 ) { return; }

        const holderWidth = this.#holder.offsetWidth;

        this.#distanceX = 0; // ensure we have the good value when the manipulation starts
        this.#duration = 0;

        // previous view
        const previousIndex = this.#index - 1;
        const previousView = this.#views[previousIndex];
        if( previousView )
        {
            previousView.style.display = "block";
            previousView.style.left = String(-holderWidth) + "px";
        }
        
        // next view
        const nextIndex = this.#index + 1;
        const nextView = this.#views[nextIndex];
        if( nextView )
        {
            nextView.style.display = "block";
            nextView.style.left = String(holderWidth) + "px";
        }
    }

    /**
     * 
     * @param { CustomEvent } event 
     */
    #manipulationChangedHandler(event)
    {
        // assumes the holder with does not change : so I should cache the initial value.
        // but I prefer write get the holder on each move and later will add a percentage factor
        console.log(event.detail);

        const viewsLength = this.#views.length;
        if( viewsLength == 0 ) { return; }


        const holderWidth = this.#holder.offsetWidth;
        this.#distanceX += event.detail.deltaX;

        // current view
        const currentView = this.#views[this.#index];
        const currentX = this.#distanceX;
        currentView.style.left = String( currentX ) + "px";

        // previous view
        const previousIndex = this.#index - 1;
        const previousView = this.#views[previousIndex];
        if( previousView )
        {
            previousView.style.display = "initial";
            previousView.style.left = String(-holderWidth + this.#distanceX) + "px";
        }
        
        // next view
        const nextIndex = this.#index + 1;
        const nextView = this.#views[nextIndex];
        if( nextView )
        {
            nextView.style.display = "initial";
            nextView.style.left = String(holderWidth + this.#distanceX) + "px";
        }
        
    }

    /**
     * 
     * @param { CustomEvent } event 
     */
    #manipulationFinishedHandler(event)
    {
        console.log(event.detail);
        console.log("MANIPULATION FINISHED !!!!");
    }

    /**
     * 
     * @param { CustomEvent } event 
     */
    #manipulationCancelledHandler(event)
    {
        console.log(event.detail);
        console.log("MANIPULATION CANCELLED !!!!");
    }

}

window.customElements.define("axial-viewer-base", AxialViewerBase);

export { AxialViewerBase }