"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";
import { AxialViewBase } from "./AxialViewBase.js";

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
     * Cached X distance for swipe between views.
     * @type { Number }
     */
    #distanceX = 0;

    /**
     * @type { Number }
     */
    #direction = 0;

    /**
     * @type { String }
     */
    #currentTransition = "none";

    /**
     * @type { Function }
     */
    #boundAnimationFinishHandler;

    /**
     * @type { Function }
     */
    #boundAnimationCenterHandler;

    /**
     * @type { Animation }
     */
    #oldAnimation;

    /**
     * @type { Animation }
     */
    #newAnimation;

    /**
     * @type { Number }
     */
    #animationDuration = 600;

    /**
     * @type { Number }
     */
    #animationExpected = 0;

    /**
     * @type { Number }
     */
    #animationFinished = 0;

    /**
     * @type { Boolean }
     */
    #isChanging = false;

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

        this.#boundAnimationFinishHandler = this.#animationFinishHandler.bind(this);
        this.#boundAnimationCenterHandler = this.#animationCenterHandler.bind(this);

        this.addEventListener("manipulationStarted", this.#boundManipulationStartedHandler);
        this.addEventListener("manipulationChanged", this.#boundManipulationChangedHandler);
        this.addEventListener("manipulationFinished", this.#boundManipulationFinishedHandler);
        this.addEventListener("manipulationCancelled", this.#boundManipulationCancelledHandler);

        this.classList.add("axial_viewer_base");
        this.isResizable = true;
    }

    static get observedAttributes()
    {
        return ["axial-manipulation", "axial-transition"];
    }

    _finalizeComponent()
    {
        const children = this.children;
        const childrenLength = children.length;

        if( childrenLength > 0 )
        {
            this.#index = 0;
            for( let i = 0; i < childrenLength; i++ )
            {
                const tempView = children[i];
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

    connectedCallback()
    {
        const manipulationAttribute = this.getAttribute("axial-manipulation");
        if( manipulationAttribute !== null )
        {
            this.manipulationEnable = true;
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
        this.appendChild(view);
        if( this.#index == -1 )
        {
            this.#index = 0;
        }
        this.#adjustViews();
    }

    next()
    {
        if( this.#isChanging === true ) { return; }

        const viewsLength = this.#views.length;
        if( viewsLength < 2 ) { return; }

        const currentIndex = this.#index;
        const tempIndex = currentIndex + 1;

        if( tempIndex >= viewsLength ) { return; }

        console.log( "gotoViewByIndex at = " + tempIndex );

        this.gotoViewByIndex(tempIndex, "slide")

    }

    previous()
    {
        if( this.#isChanging === true ) { return; }

        const viewsLength = this.#views.length;
        if( viewsLength < 2 ) { return; }

        const currentIndex = this.#index;
        const tempIndex = currentIndex - 1;

        if( tempIndex < 0 ) { return; }

        console.log( "gotoViewByIndex at = " + tempIndex );

        this.gotoViewByIndex(tempIndex, "slide")
    }

    /**
     * Go to a view via its index and play the associated transition if passed
     * @param { Number } index The index of the view we want to display
     * @param { String } transition The name of the transition we want to play.
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
        if( index >= this.#views.length ) { throw new Error("index value can't excess the maximum of views in the viewer"); }
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

        const viewLeavingEvent = new CustomEvent("viewLeaving", { bubbles: true, detail: { view: this.#oldView } } );
        this.#oldView.dispatchEvent(viewLeavingEvent);

        const viewEnteringEvent = new CustomEvent("viewEntering", { bubbles: true, detail: { view: this.#newView } } );
        this.#newView.dispatchEvent(viewEnteringEvent);

        const viewerChangingEvent = new CustomEvent("viewerChanging", { detail: { oldView: this.#oldView, newView: this.#newView } } )
        this.dispatchEvent(viewerChangingEvent);

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

            const viewLeftEvent = new CustomEvent("viewLeft", { bubbles: true, detail: { view: this.#oldView } } );
            this.#oldView.dispatchEvent(viewLeftEvent);

            const viewEnteredEvent = new CustomEvent("viewEntered", { bubbles: true, detail: { view: this.#newView } } );
            this.#newView.dispatchEvent(viewEnteredEvent);

            const viewerChangedEvent = new CustomEvent("viewerChanged", { detail: { oldView: this.#oldView, newView: this.#newView } } )
            this.dispatchEvent(viewerChangedEvent);
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
            { iterations: 1 , duration: this.#animationDuration }
        );
        this.#oldAnimation.addEventListener("finish", this.#boundAnimationFinishHandler);
        

        this.#newAnimation = this.#newView.animate(
            [ { display: "block" , opacity: 0 },  { display: "block" , opacity: 1 } ],
            { iterations: 1 , duration: this.#animationDuration }
        );
        this.#newAnimation.addEventListener("finish", this.#boundAnimationFinishHandler);
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
        this.#oldAnimation.addEventListener("finish", this.#boundAnimationFinishHandler);

        this.#newAnimation = this.#newView.animate(
            [ { left: newStartX },  { left: "0px" } ],
            { iterations: 1 , duration: this.#animationDuration }
        );
        this.#newAnimation.addEventListener("finish", this.#boundAnimationFinishHandler);
    }

    #animationFinishHandler( event )
    {
        //console.log(event);
        this.#animationFinished += 1;
        //console.log("this.#animationFinished = " + this.#animationFinished);
        if( this.#animationExpected == this.#animationFinished )
        {
            console.log("DONE");
            this.#oldAnimation.removeEventListener("finish", this.#boundAnimationFinishHandler);
            this.#newAnimation.removeEventListener("finish", this.#boundAnimationFinishHandler);

            this.#oldView._onViewLeft();
            this.#newView._onViewEntered();

            // fix it later : view should dispacth ?
            const viewLeftEvent = new CustomEvent("viewLeft", { bubbles: true, detail: { view: this.#oldView } } );
            this.#oldView.dispatchEvent(viewLeftEvent);

            const viewEnteredEvent = new CustomEvent("viewEntered", { bubbles: true, detail: { view: this.#newView } } );
            this.#newView.dispatchEvent(viewEnteredEvent);

            const viewerChangedEvent = new CustomEvent("viewerChanged", { detail: { oldView: this.#oldView, newView: this.#newView } } )
            this.dispatchEvent(viewerChangedEvent);

            this.manipulationEnable = true;

            this.#adjustViews();
        }
    }

    #animationCenterHandler( event )
    {
        this.#oldAnimation.removeEventListener("finish", this.#boundAnimationCenterHandler);
        this.manipulationEnable = true;
        this.#adjustViews();
    }

    #adjustViews()
    {
        console.log("ADJUSTING VIEWS");
        const viewsLength = this.#views.length;
        if( viewsLength == 0 ) { return; }

        // re init ?
        this.#distanceX = 0;

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
        //console.log(event.detail);
        console.log("manipulationStartedHandler + isManipulating = " + this.isManipulating);
        const viewsLength = this.#views.length;
        if( viewsLength == 0 ) { return; }

        const currentWidth = this.offsetWidth;

        this.#distanceX = 0; // ensure we have the good value when the manipulation starts

        // previous view
        const previousIndex = this.#index - 1;
        const previousView = this.#views[previousIndex];
        if( previousView )
        {
            previousView.style.display = "block";
            previousView.style.left = String(-currentWidth) + "px";
        }
        
        // next view
        const nextIndex = this.#index + 1;
        const nextView = this.#views[nextIndex];
        if( nextView )
        {
            nextView.style.display = "block";
            nextView.style.left = String(currentWidth) + "px";
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
        //console.log(event.detail);

        console.log("manipulationChangedHandler + isManipulating = " + this.isManipulating);

        const viewsLength = this.#views.length;
        if( viewsLength == 0 ) { return; }


        const currentWidth = this.offsetWidth;
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
            previousView.style.left = String(-currentWidth + this.#distanceX) + "px";
        }
        
        // next view
        const nextIndex = this.#index + 1;
        const nextView = this.#views[nextIndex];
        if( nextView )
        {
            nextView.style.display = "initial";
            nextView.style.left = String(currentWidth + this.#distanceX) + "px";
        }
    }

    /**
     * 
     * @param { CustomEvent } event 
     */
    #manipulationFinishedHandler(event)
    {
        console.log("manipulationFinishedHandler + isManipulating = " + this.isManipulating);
        const viewsLength = this.#views.length;
        if( viewsLength == 0 ) { return; }
        //console.log(event.detail);
        console.log("MANIPULATION FINISHED !!!!");
        this.#animateAfterManipulation();
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

    #animateAfterManipulation()
    {
        this.manipulationEnable = false;
        console.log("#animateAfterManipulation()");
        const viewsLength = this.#views.length;
        const currentWidth = this.offsetWidth;

        //\\ special case distancex === 0

        if( viewsLength == 1 ) // handle here this special case
        {
            //TODO : center the view and re init
        }
        else
        {
            this.#direction = this.#distanceX < 0 ? 1 : -1;
            
            const oldIndex = this.#index;
            this.#oldView = this.#views[oldIndex];

            const newIndex = this.#index + this.#direction;
            this.#newView = this.#views[newIndex];

            if( (this.#index == 0 && this.#direction < 0) || (this.#index == (viewsLength-1) && this.#direction > 0 ) )
            {
                console.log("CENTER VIEWS");

                const oldFinalX = "0px";
                this.#oldAnimation = this.#oldView.animate(
                    [ { left: oldFinalX } ],
                    { iterations: 1 , duration: this.#animationDuration }
                );
                this.#oldAnimation.addEventListener("finish", this.#boundAnimationCenterHandler);
            }
            else
            {
                console.log("MOVE VIEWS");

                this.#animationFinished = 0;
                this.#animationExpected = 2;

                this.#index = newIndex;

                const oldFinalX = String(currentWidth * -this.#direction) + "px";
                this.#oldAnimation = this.#oldView.animate(
                    [ { left: oldFinalX } ],
                    { iterations: 1 , duration: this.#animationDuration }
                );
                this.#oldAnimation.addEventListener("finish", this.#boundAnimationFinishHandler);

                const newFinalX = "0px";
                this.#newAnimation = this.#newView.animate(
                    [ { left: newFinalX } ],
                    { iterations: 1 , duration: this.#animationDuration }
                );
                this.#newAnimation.addEventListener("finish", this.#boundAnimationFinishHandler);

            }
        }
    }
}

window.customElements.define("axial-viewer-base", AxialViewerBase);

export { AxialViewerBase }