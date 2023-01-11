"use strict"

import { Environment } from "../core/Environment";
import { Point } from "../core/Point";
import { AxialMenuBase } from "../menu/AxialMenuBase";
import { AxialTooltipBase } from "../tooltip/AxialTooltipBase";
import { AxialEffectBase } from "../effect/AxialEffectBase";
import { AxialEase } from "../easing/AxialEase";

/**
 * @public
 * Base class for all the Axial framework components. 
 */
class AxialComponentBase
{
    // core vars
    #element;
    #data;
    #template = "";
    #initialized = true;

    // states
    #useStates = false;
    #states = new Set();
    #previousState = "";
    #currentState = "init";

    #boundStatePointerEnterHandler;
    #boundStatePointerOverHandler;
    #boundStatePointerDownHandler;

    #boundStatePointerUpHandler;
    #boundStatePointerOutHandler;
    #boundStatePointerLeaveHandler;

    #boundStatePointerCancelHandler;
    #boundStatePointerGotCaptureHandler;
    #boundStatePointerLostCaptureHandler;

    #boundStatePointerClickHandler;
    #boundStatePointerMoveHandler;
    // end states

    // manipulation // 2022-05-05 pointer events in all browsers
    #privilegedDownEvent = "pointerdown";
    #privilegedMoveEvent = "pointermove";
    #privilegedUpEvent = "pointerup";

    // util to fix a weird behaviour on track pad
    #isTrackPad = false;

    #manipulationEnabled = false; // we don't need to perfom any event if manipulation is not explicity required
    #manipulationScaleEnabled = false;

    #initialManipulationEvents = new Array(); // Pointer
    #initialManipulationTouches = new Array(); // iOS / Touches
    #cachedPointerEvents = new Array(); // Pointer to calculate manipulation distance and middle point
    #lastPointerMoveEvent = undefined; //

    #isManipulating = false; // a flag to indicate if we can remove the handlers : we must not if a manipulation is occuring

    // manipulation types
    #hasSwiped = false; // we flag if a move event occured
    #hasScaled = false;
    #hasRotated = false;

    // flags for dispacth events
    #swipeChanged = false;
    #scaleChanged = false;
    #rotateChanged = false;

    #manipulationDuration = 0;

    #manipulationDistance = -1;
    #manipulationMiddlePoint = new Point();

    #manipulationDeltaX = 0;
    #manipulationDeltaY = 0;
    #manipulationDeltaD = 0;
    #manipulationDeltaS = 0;

    // scale
    #scale = 1;
    #scaleMin = 1;
    #scaleMax = 4;
    #scaleEffect;
    #isScaling = false;

    // tooltip
    #tooltip = null;
    #hasTooltip = false;

    #boundTooltipMouseEnterHandler;
    #boundTooltipMouseLeaveHandler;
    #boundTooltipClickHandler;

    // context menu
    #contextMenu = null;
    #hasContextMenu = false;
    #boundContextMenuShowHandler;

    // bound functions
    #boundManipulationDownHandler;
    #boundManipulationMoveHandler;
    #boundManipulationUpHandler;
    #boundManipulationClickHandler;
    #boundManipulationCancelHandler;

    #boundScaleEffectEndedHandler;

    /**
     * Upgrade the targeted HTMLElement
     * @param { HTMLElement } element 
     */
    constructor( element )
    {
        //console.log("ComponentBase : constructor");
        if( element instanceof Element == false )
        {
            throw new TypeError( "Element value expected" );
        }
        this.#element = element;

        // states
        this.#boundStatePointerEnterHandler = this._statePointerEnterHandler.bind(this);
        this.#boundStatePointerOverHandler = this._statePointerOverHandler.bind(this);
        this.#boundStatePointerDownHandler = this._statePointerDownHandler.bind(this);

        this.#boundStatePointerUpHandler = this._statePointerUpHandler.bind(this);
        this.#boundStatePointerOutHandler = this._statePointerOutHandler.bind(this);
        this.#boundStatePointerLeaveHandler = this._statePointerLeaveHandler.bind(this);

        this.#boundStatePointerCancelHandler = this._statePointerCancelHandler.bind(this);
        this.#boundStatePointerGotCaptureHandler = this._statePointerGotCaptureHandler.bind(this);
        this.#boundStatePointerLostCaptureHandler = this._statePointerLostCaptureHandler.bind(this);

        this.#boundStatePointerClickHandler = this._statePointerClickHandler.bind(this);
        this.#boundStatePointerMoveHandler = this._statePointerMoveHandler.bind(this);

        // manipulation
        this.#boundManipulationDownHandler = this.#manipulationDownHandler.bind(this);
        this.#boundManipulationMoveHandler = this.#manipulationMoveHandler.bind(this);
        this.#boundManipulationUpHandler = this.#manipulationUpHandler.bind(this);
        this.#boundManipulationClickHandler = this.#manipulationClickHandler.bind(this);
        this.#boundManipulationCancelHandler = this.#manipulationCancelHandler.bind(this);

        this.#boundScaleEffectEndedHandler = this.#scaleEffectEndedHandler.bind(this);

        this.#boundTooltipMouseEnterHandler = this.#tooltipMouseEnterHandler.bind(this);
        this.#boundTooltipMouseLeaveHandler = this.#tooltipMouseLeaveHandler.bind(this);
        this.#boundTooltipClickHandler = this.#tooltipClickHandler.bind(this);
        
        this.#boundContextMenuShowHandler = this.#contextMenuShowHandler.bind(this);

        this._registerTemplate();
        /*
        if( this.#template && this.#template != "" )
        {
            this.#element.innerHTML = this.#template;
        }
        */

        //this.#initialized = false; // _init must be fired only once
        //this._init();
    }

    /**
     * @public
     * Return the upgraded Element. Note, if listeners have been added during the component lifecyle, they are not removed. 
     * @type { Element }
     * @return { Element }
     */
    get element() { return this.#element; }

    /**
     * @public
     * A shortcut to add listener to the updgraded element.
     */
    addEventListener( type, listener, useCapture = false ) { this.#element.addEventListener( type, listener, useCapture ); }

    /**
     * @public
     * A shortcut to remove listener to the updgraded element.
     */
    removeEventListener( type, listener, useCapture = false ) { this.#element.removeEventListener(type, listener, useCapture ); }

    /**
     * @public
     * Register the component in the application.
     * The application will then call the _resize() method of the component when the window dispatch resize event.
     */
    registerForResize()
    {
        if( window.AXIAL )
        {
            try { window.AXIAL.registerComponentForResize( this ); }
            catch( err ) { console.log(err); }
        }
    }

    /**
     * @override
     * Method that will be called each time the window is resized if the component is registered for.
     * Call the registerForResize() method to indicates the Axial App this component need to be resized.
     */
    _resize(){}

    /**
     * @public
     * Get or set the template string used in the '_registerTemplate' method during the init phase of the component.
     * Note the setter has no effect (not true now es2020) for the moment but you may want to change it at runtime in some cases.
     * @type { String }
     * @param { String } value
     * @return { String }
     */
    get template() { return this.#template; }
    set template( value )
    {
        if( typeof value !== "string" )
        {
            throw new TypeError("String value expected");
        }
        this.#template = value;
    }

    
    /**
     * @override
     */
    _registerTemplate()
    {
        if( this.#template && this.#template != "" )
        {
            this.#element.innerHTML = this.#template;
        }
    }

    get data() { return this.#data; }
    set data( value )
    {
        this.#data = value;
        this._onDataChanged();
        let dataChangedEvent = new Event("datachanged");
        if( this.#element ) { this.#element.dispatchEvent(dataChangedEvent); }
    }

    /**
     * @override
     */
    _onDataChanged() {}

    get manipulationDeltaX() { return this.#manipulationDeltaX; }
    get manipulationDeltaY() { return this.#manipulationDeltaY; }
    get manipulationDeltaD() { return this.#manipulationDeltaD; }
    get manipulationDeltaS() { return this.#manipulationDeltaS; }

    // states
    get previousState() { return this.#previousState; }

    get currentState() { return this.#currentState; }
    set currentState( value )
    {
        if( typeof value !== "string" )
        {
            throw new TypeError("String value expected");
        }

        if( this.#useStates == false ) { return; }
        if( value == this.#currentState ) { return; }

        // state MUST be registered
        if( this.#states.has(value) == false )
        {
            throw new Error("State name must registered. Use the 'addState' method to add a state.");
        }

        let oldState = this.#currentState;
        this.#previousState =  this.#currentState;

        let newState = value;
        this.#currentState = value;

        this._onStateChanged();

        let stateChangedEvent = new Event("statechanged");
        stateChangedEvent.oldState = oldState;
        stateChangedEvent.newState = newState;
        this.#element.dispatchEvent(stateChangedEvent);
    }

    get useStates() { return this.#useStates; }
    set useStates( value )
    {
        if( typeof value !== "boolean" )
        {
            throw new TypeError("Boolean value expected");
        }
        if( value == this.#useStates ) { return; }
        this.#useStates = value;

        if(this.#useStates == true )
        {
            this.#addStatesListeners();
        }
        else
        {
            this.#removeStatesListeners();
        }
    }

    addState( value )
    {
        if( typeof value !== "string" )
        {
            throw new TypeError("String value expected");
        }
        this.#states.add(value);
    }

    deleteState( value )
    {
        if( typeof value !== "string" )
        {
            throw new TypeError("String value expected");
        }
        this.#states.delete(value);
    }

    _onStateChanged() {}

    #addStatesListeners()
    {
        this.#element.addEventListener("pointerenter", this.#boundStatePointerEnterHandler);
        this.#element.addEventListener("pointerover", this.#boundStatePointerOverHandler);
        this.#element.addEventListener("pointerdown", this.#boundStatePointerDownHandler);

        this.#element.addEventListener("pointerup", this.#boundStatePointerUpHandler);
        this.#element.addEventListener("pointerout", this.#boundStatePointerOutHandler);
        this.#element.addEventListener("pointerleave", this.#boundStatePointerLeaveHandler);

        this.#element.addEventListener("cancel", this.#boundStatePointerCancelHandler);
        this.#element.addEventListener("gotpointcapture", this.#boundStatePointerGotCaptureHandler);
        this.#element.addEventListener("lostpointcapture", this.#boundStatePointerLostCaptureHandler);

        this.#element.addEventListener("click", this.#boundStatePointerClickHandler);
        this.#element.addEventListener("pointermove", this.#boundStatePointerMoveHandler);
    }

    #removeStatesListeners()
    {
        this.#element.removeEventListener("pointerenter", this.#boundStatePointerEnterHandler);
        this.#element.removeEventListener("pointerover", this.#boundStatePointerOverHandler);
        this.#element.removeEventListener("pointerdown", this.#boundStatePointerDownHandler);

        this.#element.removeEventListener("pointerup", this.#boundStatePointerUpHandler);
        this.#element.removeEventListener("pointerout", this.#boundStatePointerOutHandler);
        this.#element.removeEventListener("pointerleave", this.#boundStatePointerLeaveHandler);

        this.#element.removeEventListener("cancel", this.#boundStatePointerCancelHandler);
        this.#element.removeEventListener("gotpointcapture", this.#boundStatePointerGotCaptureHandler);
        this.#element.removeEventListener("lostpointcapture", this.#boundStatePointerLostCaptureHandler);

        this.#element.removeEventListener("click", this.#boundStatePointerClickHandler);
        this.#element.removeEventListener("pointermove", this.#boundStatePointerMoveHandler);
    }

    _statePointerEnterHandler( event )
    {
        console.log("AxialComponent state pointer enter");
    }
    _statePointerOverHandler( event )
    {
        //console.log("state pointer over");
    }
    _statePointerDownHandler( event )
    {
        //console.log("state pointer down");
    }
    _statePointerUpHandler( event )
    {
        //console.log("state pointer up");
    }
    _statePointerOutHandler( event )
    {
        //console.log("state pointer out");
    }
    _statePointerLeaveHandler( event )
    {
        //console.log("state pointer leave");
    }
    _statePointerCancelHandler( event )
    {
        //console.log("state pointer cancel");
    }
    _statePointerGotCaptureHandler( event )
    {
        //console.log("state pointer got capture");
    }
    _statePointerLostCaptureHandler( event )
    {
        //console.log("state pointer lost capture");
    }
    _statePointerClickHandler( event )
    {
        //console.log("state pointer click");
    }
    _statePointerMoveHandler( event )
    {
        //console.log("state pointer move");
    }

    // TOOLTIP IMPLEMENTATION
    get tooltip() { return this.#tooltip; }
    set tooltip( value )
    {
        if( value == null || value == undefined )
        {
            if( this.#hasTooltip == true )
            {
                this.#removeTooltipListeners();
                this.#tooltip.target = null;
                this.#tooltip = null;
                this.#hasTooltip = false;
            }
        }
        else if( value instanceof AxialTooltipBase == false )
        {
            throw new TypeError("AxialTooltipBase value expected");
        }
        else
        {
            if( this.#hasTooltip == false )
            {
                this.#tooltip = value;
                this.#tooltip.target = this.#element;
                this.#hasTooltip = true;
                this.#addTooltipListeners();
            }
        }
    }

    #addTooltipListeners()
    {
        /// IMPORTANT TODO : PointerEvents -> tooltips can have an interest with a stylus for example
        // tooltip is typically a desktop function
        if( Environment.isDesktop == true )
        {
            this.#element.addEventListener("mouseenter", this.#boundTooltipMouseEnterHandler , false);
            this.#element.addEventListener("mouseleave", this.#boundTooltipMouseLeaveHandler , false);
            this.#element.addEventListener("click", this.#boundTooltipClickHandler , false);
        }
    }

    #removeTooltipListeners()
    {
        if( Environment.isDesktop == true )
        {
            this.#element.removeEventListener("mouseenter", this._boundTooltipMouseEnterHandler , false);
            this.#element.removeEventListener("mouseleave", this._boundTooltipMouseLeaveHandler , false);
            this.#element.removeEventListener("click", this._boundTooltipClickHandler , false);
        }
    }

    #tooltipMouseEnterHandler( event )
    {
        if( this.#contextMenu instanceof AxialMenuBase == true )
        {
            if( this.#contextMenu.isShown == false )
            {
                this.#tooltip.show();
            }
        }
        else
        {
            this.#tooltip.show();
        }
    }

    #tooltipMouseLeaveHandler( event ) { this.#tooltip.hide(); }

    #tooltipClickHandler( event ) { this.#tooltip.hide(); }

    // CONTEXT MENU IMPLEMENTATION
    set contextMenu( value )
    {
        if( value == null || value == undefined )
        {
            if( this.#hasContextMenu == true )
            {
                this.#removeContextMenuListeners();
                this.#contextMenu = null;
                this.#hasContextMenu = false;
            }
        }
        else if( value instanceof AxialMenuBase == false )
        {
            throw new TypeError("AxialMenuBase value expected");
        }
        else
        {
            if( this.#hasContextMenu == false )
            {
                this.#contextMenu = value;
                this.#contextMenu.isContextMenu = true;
                this.#hasContextMenu = true;
                this.#addContextMenuListeners();
            }
        }
    }

    #addContextMenuListeners()
    {
        this.#element.addEventListener("contextmenu", this.#boundContextMenuShowHandler , false);
    }

    #removeContextMenuListeners()
    {
        this.#element.removeEventListener("contextmenu", this.#boundContextMenuShowHandler , false);
    }

    #contextMenuShowHandler( event )
    {
        if( this.#tooltip ) { this.#tooltip.hide(); }
        this.#contextMenu.show( event );
    }

    /**
     * @public
     * Enable or disable the manipulation.
     * @type { Boolean }
     * @param { Boolean } value
     * @return { Boolean }
     * @default false
     */
    get manipulationEnabled() { return this.#manipulationEnabled; }
    set manipulationEnabled( value )
    {
        if( typeof value !== "boolean" )
        {
            throw new TypeError("Boolean value expected");
        }
        if( value == this.#manipulationEnabled ) { return; }
        this.#manipulationEnabled = value;

        if( this.#isManipulating == false )
        {
            if( this.#manipulationEnabled == true )
            {
                this.#addManipulationHandlers();
            }
            else
            {
                this.#removeManipulationHandlers();
            }
        }
    }

    /**
     * @private
     * Util to get the index of the manipulation object ie PointerEvent or Touch if is registered
     * @param { Object } o 
     */
    #getManipulationObjectIndex( o )
    {
        let index = -1;
        if( o == undefined || o == null ) { return index; }
        if( Environment.privilegedManipulationEventType == "pointer" )
        {
            let mel = this.#initialManipulationEvents.length;
            for( let p = 0; p < mel; p++ )
            {
                let pointerEvent = this.#initialManipulationEvents[p];
                if( o.pointerId && o.pointerId == pointerEvent.pointerId )
                {
                    return p;
                }
            }
        }
        else if( Environment.privilegedManipulationEventType == "touch" )
        {
            
        }
        // unhandle error
        return index;
    }

    #getManipulationTouchByIdentifier( touches, id )
    {
        let o = undefined;
        let tl = touches.length;
        for( let i = 0; i < tl; i++ )
        {
            let t = touches[i];
            if( t.identifier == id )
            {
                o = t;
            }
        }
        return o;
    }

    #addManipulationHandlers()
    {
        this.#element.addEventListener(this.#privilegedDownEvent, this.#boundManipulationDownHandler, false);
        this.#element.addEventListener(this.#privilegedUpEvent, this.#boundManipulationUpHandler, false);
        if( Environment.privilegedManipulationEventType == "pointer" )
        {
            this.#element.addEventListener("pointercancel", this.#boundManipulationCancelHandler, false);
        }
    }

    #removeManipulationHandlers()
    {
        this.#element.removeEventListener(this.#privilegedDownEvent, this.#boundManipulationDownHandler, false);
        this.#element.removeEventListener(this.#privilegedUpEvent, this.#boundManipulationUpHandler, false);
        if( Environment.privilegedManipulationEventType == "pointer" )
        {
            this.#element.removeEventListener("pointercancel", this.#boundManipulationCancelHandler, false);
        }
    }

    #manipulationCancelHandler( event )
    {
        console.log("#manipulationCancelHandler");
        //console.log(event);
        this.#boundManipulationUpHandler(event);
    }

    #manipulationDownHandler( event )
    {
        console.log("#manipulationDownHandler");
        //console.log(event);

        event.stopPropagation();
        /// EXCLUSIONS
        // no manipulation if the scale effect is running
        if( this.#isScaling == true ) { return; }
        if( this.#hasSwiped == true ) { return; }
        // we only want the left click button
        if( event.button && event.button != 0 ) { return; }

        let addMoveListener = false;

        /// we just consider manipulation with 2 entries, the third is rejected
        let mel = this.#initialManipulationEvents.length;
        let mtl = this.#initialManipulationTouches.length;
        
        if( Environment.privilegedManipulationEventType == "mouse" )
        {
            if( mel == 0 ) { this.#initialManipulationEvents.push(event); addMoveListener = true; }
            else { return; }
        }
        else if( Environment.privilegedManipulationEventType == "pointer" )
        {
            if( mel == 0 )
            {
                addMoveListener = true;
                this.#initialManipulationEvents.push(event);
                this.#cachedPointerEvents.push(event);
            }
            else if( mel == 1 )
            {
                if( event.pointerType == "touch" )
                {
                    this.#initialManipulationEvents.push(event);
                    this.#cachedPointerEvents.push(event);
                }
                else
                {
                    return;
                }
            }
            else { return; }
        }
        else
        {
            let ct = event.changedTouches;
            let ctl = ct.length;
            if( mtl == 0 )
            {
                addMoveListener = true;
                this.#initialManipulationEvents.push(event);
                if( ctl == 1 )
                {
                    this.#initialManipulationTouches.push( event.changedTouches[0] );
                }
                else if( ctl >= 2 )
                {
                    this.#initialManipulationTouches.push( event.changedTouches[0] );
                    this.#initialManipulationTouches.push( event.changedTouches[1] );
                }
            }
            else if( mtl == 1 )
            {
                this.#initialManipulationEvents.push(event);
                this.#initialManipulationTouches.push( event.changedTouches[0] );
            }
            else { return; }
        }

        // ensure we only add the listener only once
        // only add the move handler on down event to avoid the handler fired all the time
        if( addMoveListener == true )
        {
            this.#element.addEventListener(this.#privilegedMoveEvent, this.#boundManipulationMoveHandler, false);
        }
        
        if( Environment.privilegedManipulationEventType == "pointer" && this.#initialManipulationEvents.length == 2 )
        {
            let pointer1 = this.#initialManipulationEvents[0];
            let pointer2 = this.#initialManipulationEvents[1];

            let pointerPoint1 = new Point(pointer1.pageX, pointer1.pageY);
            let pointerPoint2 = new Point(pointer2.pageX, pointer2.pageY);

            this.#manipulationDistance = Point.distance(pointerPoint1, pointerPoint2);
            this.#manipulationMiddlePoint = Point.middlePoint(pointerPoint1, pointerPoint2);
        }

        if( Environment.privilegedManipulationEventType == "touch" && this.#initialManipulationTouches.length == 2 )
        {
            let touch1 = this.#initialManipulationTouches[0];
            let touch2 = this.#initialManipulationTouches[1];

            let touchPoint1 = new Point(touch1.pageX, touch1.pageY);
            let touchPoint2 = new Point(touch2.pageX, touch2.pageY);

            this.#manipulationDistance = Point.distance(touchPoint1, touchPoint2);
            this.#manipulationMiddlePoint = Point.middlePoint(touchPoint1, touchPoint2);
        }
        this.#isManipulating = true;

        //
    }

    #manipulationMoveHandler( event )
    {
        console.log("#manipulationMoveHandler");
        //console.log(event);

        event.stopPropagation();

        let mel = this.#initialManipulationEvents.length;
        let mtl = this.#initialManipulationTouches.length;

        if( Environment.privilegedManipulationEventType == "mouse" )
        {
            let initMouseEvent = this._initialManipulationEvents[0];
            this.#manipulationDeltaX = event.pageX - initMouseEvent.pageX;
            this.#manipulationDeltaY = event.pageY - initMouseEvent.pageY;
            if( this.#hasSwiped == false && ( Math.abs( this.#manipulationDeltaX ) > 5 || Math.abs( this.#manipulationDeltaY ) > 5 ) )
            {
                this.#hasSwiped = true;
                this._onSwipeStarted();
                let swipeStartedEvent = new Event("swipestarted");
                swipeStartedEvent.duration = this.#manipulationDuration;
                swipeStartedEvent.deltaX = this.#manipulationDeltaX;
                swipeStartedEvent.deltaY = this.#manipulationDeltaY;
                swipeStartedEvent.deltaD = this.#manipulationDeltaD;
                swipeStartedEvent.deltaS = this.#manipulationDeltaS;
                this.#element.dispatchEvent(swipeStartedEvent);
            }
        }
        else if( Environment.privilegedManipulationEventType == "pointer" )
        {
            this.#lastPointerMoveEvent = event;
            let eventIndex = this.#getManipulationObjectIndex(event);
            if( mel == 1 )
            {
                let initPointerEvent = this.#initialManipulationEvents[0];
                this.#manipulationDeltaX = event.pageX - initPointerEvent.pageX;
                this.#manipulationDeltaY = event.pageY - initPointerEvent.pageY;

                if( this.#hasSwiped == false )
                {
                    if( Math.abs(this.#manipulationDeltaX) > 5 || Math.abs(this.#manipulationDeltaY) > 5 )
                    {
                        this.#hasSwiped = true;
                        
                        this._onSwipeStarted();
                        let swipeStartedEvent = new Event("swipestarted");
                        swipeStartedEvent.duration = this.#manipulationDuration;
                        swipeStartedEvent.deltaX = this.#manipulationDeltaX;
                        swipeStartedEvent.deltaY = this.#manipulationDeltaY;
                        swipeStartedEvent.deltaD = this.#manipulationDeltaD;
                        swipeStartedEvent.deltaS = this.#manipulationDeltaS;
                        this.#element.dispatchEvent(swipeStartedEvent);
                    }
                }
                else
                {
                    if( eventIndex != 0 ) { return; }
                }
            }
            else if( mel == 2 )
            {
                this.#cachedPointerEvents[eventIndex] = event;

                let e1 = this.#cachedPointerEvents[0];
                let e2 = this.#cachedPointerEvents[1];

                let p1 = new Point(e1.pageX, e1.pageY);
                let p2 = new Point(e2.pageX, e2.pageY);

                let pdistance = Point.distance(p1, p2);
                let pmiddle = Point.middlePoint(p1, p2);

                this.#manipulationDeltaX = pmiddle.x - this.#manipulationMiddlePoint.x;
                this.#manipulationDeltaY = pmiddle.y - this.#manipulationMiddlePoint.y;
                this.#manipulationDeltaD = Math.abs( this.#manipulationDistance - pdistance );

                // no manipulation registered yet -> check if one just happen
                if( this.#hasSwiped == false && this.#hasScaled == false )
                {
                    // we are on a track pad and a swipe occured
                    if( this.#manipulationDistance == 0 )
                    {
                        if( (Math.abs(this.#manipulationDeltaX) > 5 || Math.abs(this.#manipulationDeltaY) > 5) )
                        {
                            this.#hasSwiped = true;
                            this.#isTrackPad = true;
                            this._onSwipeStarted();
                            let swipeStartedEvent = new Event("swipestarted");
                            swipeStartedEvent.duration = this.#manipulationDuration;
                            swipeStartedEvent.deltaX = this.#manipulationDeltaX;
                            swipeStartedEvent.deltaY = this.#manipulationDeltaY;
                            swipeStartedEvent.deltaD = this.#manipulationDeltaD;
                            swipeStartedEvent.deltaS = this.#manipulationDeltaS;
                            this.#element.dispatchEvent(swipeStartedEvent);
                        }
                    }
                    else
                    {
                        if( Math.abs(this.#manipulationDeltaX) < 5 && Math.abs(this.#manipulationDeltaY) < 5 && Math.abs(this.#manipulationDeltaD) < 5 )
                        {
                            return; //no move, no scale
                        }

                        if( this.#manipulationScaleEnabled == true )
                        {
                            if( Math.abs(this.#manipulationDeltaD) > Math.abs(this.#manipulationDeltaX)
                                || Math.abs(this.#manipulationDeltaD) > Math.abs(this.#manipulationDeltaY) )
                            {
                                this.#hasScaled = true;
                                this.#manipulationDeltaS = Math.abs( pdistance / this.#manipulationDistance );
                                this._onScaleStarted();
                                let scaleStartedEvent = new Event("scalestarted");
                                scaleStartedEvent.duration = this.#manipulationDuration;
                                scaleStartedEvent.deltaX = this.#manipulationDeltaX;
                                scaleStartedEvent.deltaY = this.#manipulationDeltaY;
                                scaleStartedEvent.deltaD = this.#manipulationDeltaD;
                                scaleStartedEvent.deltaS = this.#manipulationDeltaS;
                                this.#element.dispatchEvent(scaleStartedEvent);
                            }
                            else
                            {
                                this.#hasSwiped = true;
                                this._onSwipeStarted();
                                let swipeStartedEvent = new Event("swipestarted");
                                swipeStartedEvent.duration = this.#manipulationDuration;
                                swipeStartedEvent.deltaX = this.#manipulationDeltaX;
                                swipeStartedEvent.deltaY = this.#manipulationDeltaY;
                                swipeStartedEvent.deltaD = this.#manipulationDeltaD;
                                swipeStartedEvent.deltaS = this.#manipulationDeltaS;
                                this.#element.dispatchEvent(swipeStartedEvent);
                            }
                        }
                        else
                        {
                            if( Math.abs(this.#manipulationDeltaX) > 5 || Math.abs(this.#manipulationDeltaY) > 5 )
                            {
                                this.#hasSwiped = true;
                                this._onSwipeStarted();
                                let swipeStartedEvent = new Event("swipestarted");
                                swipeStartedEvent.duration = this.#manipulationDuration;
                                swipeStartedEvent.deltaX = this.#manipulationDeltaX;
                                swipeStartedEvent.deltaY = this.#manipulationDeltaY;
                                swipeStartedEvent.deltaD = this.#manipulationDeltaD;
                                swipeStartedEvent.deltaS = this.#manipulationDeltaS;
                                this.#element.dispatchEvent(swipeStartedEvent);
                            }
                            else
                            {
                                return;
                            }
                        }
                    }
                }
                // one pointer has been fired and the move has already started
                // because the manipulation stop on the first up event, we check the first registered event
                else if( this.#hasSwiped == true && this.#hasScaled == false )
                {
                    let eventIndex = this.#getManipulationObjectIndex(event);
                    if( eventIndex == 0 )
                    {
                        // correct the delta X / Y values
                        let initPointerEvent = this.#initialManipulationEvents[0];
                        this.#manipulationDeltaX = event.pageX - initPointerEvent.pageX;
                        this.#manipulationDeltaY = event.pageY - initPointerEvent.pageY;
                    }
                }
                else if( this.#hasSwiped == false && this.#hasScaled == true )
                {
                    this.#manipulationDeltaS = Math.abs( pdistance / this.#manipulationDistance );
                }
            }
        }
        // touch events
        else
        {
            if( mtl == 1 )
            {
                let initTouch = this.#initialManipulationTouches[0];
                let initId = initTouch.identifier;
                let currentTouch = this.#getManipulationTouchByIdentifier( event.touches, initId);
                if( currentTouch == undefined ) { return; }

                this.#manipulationDeltaX = currentTouch.pageX - initTouch.pageX;
                this.#manipulationDeltaY = currentTouch.pageY - initTouch.pageY;

                if( this.#hasSwiped == false )
                {
                    if( Math.abs(this.#manipulationDeltaX) > 5 || Math.abs(this.#manipulationDeltaY) > 5 )
                    {
                        this.#hasSwiped = true;
                        this._onSwipeStarted();
                        let swipeStartedEvent = new Event("swipestarted");
                        swipeStartedEvent.duration = this.#manipulationDuration;
                        swipeStartedEvent.deltaX = this.#manipulationDeltaX;
                        swipeStartedEvent.deltaY = this.#manipulationDeltaY;
                        swipeStartedEvent.deltaD = this.#manipulationDeltaD;
                        swipeStartedEvent.deltaS = this.#manipulationDeltaS;
                        this.#element.dispatchEvent(swipeStartedEvent);
                    }
                }
            }
            else if( mtl == 2 )
            {
                // we temporarly consider touchers 0 and 1 are the same at the beginning
                // remember the UP handler stop the manipulation
                // so not risky ! but to re consider if we have more touch points
                let e1 = event.touches[0];
                let e2 = event.touches[1];

                let p1 = new Point(e1.pageX, e1.pageY);
                let p2 = new Point(e2.pageX, e2.pageY);

                let tdistance = Point.distance(p1, p2);
                let tmiddle = Point.middlePoint(p1, p2);

                this.#manipulationDeltaX = tmiddle.x - this.#manipulationMiddlePoint.x;
                this.#manipulationDeltaY = tmiddle.y - this.#manipulationMiddlePoint.y;
                this.#manipulationDeltaD = Math.abs( this.#manipulationDistance - tdistance );

                if( this.#hasSwiped == false && this.#hasScaled == false )
                {
                    if( Math.abs(this.#manipulationDeltaX) < 5 && Math.abs(this.#manipulationDeltaY) < 5 && Math.abs(this.#manipulationDeltaD) < 5 )
                    {
                        return; //no swipe, no scale
                    }

                    if( this.#manipulationScaleEnabled == true )
                    {
                        if( Math.abs(this.#manipulationDeltaD) > Math.abs(this.#manipulationDeltaX)
                            || Math.abs(this.#manipulationDeltaD) > Math.abs(this.#manipulationDeltaY) ) // see if && not better
                        {
                            this._hasScaled = true;
                            this.#manipulationDeltaS = Math.abs(tdistance / this.#manipulationDistance);
                            this._onScaleStarted();
                            let scaleStartedEvent = new Event("scalestarted");
                            scaleStartedEvent.duration = this.#manipulationDuration;
                            scaleStartedEvent.deltaX = this.#manipulationDeltaX;
                            scaleStartedEvent.deltaY = this.#manipulationDeltaY;
                            scaleStartedEvent.deltaD = this.#manipulationDeltaD;
                            scaleStartedEvent.deltaS = this.#manipulationDeltaS;
                            this.#element.dispatchEvent(scaleStartedEvent);
                        }
                        else
                        {
                            this.#hasSwiped = true;
                            this._onSwipeStarted();
                            let swipeStartedEvent = new Event("swipestarted");
                            swipeStartedEvent.duration = this.#manipulationDuration;
                            swipeStartedEvent.deltaX = this.#manipulationDeltaX;
                            swipeStartedEvent.deltaY = this.#manipulationDeltaY;
                            swipeStartedEvent.deltaD = this.#manipulationDeltaD;
                            swipeStartedEvent.deltaS = this.#manipulationDeltaS;
                            this.#element.dispatchEvent(swipeStartedEvent);
                        }
                    }
                    else
                    {
                        if( (Math.abs(this.#manipulationDeltaX) > 5 || Math.abs(this.#manipulationDeltaY) > 5) )
                        {
                            this.#hasSwiped = true;
                            this._onSwipeStarted();
                            let swipeStartedEvent = new Event("swipestarted");
                            swipeStartedEvent.duration = this.#manipulationDuration;
                            swipeStartedEvent.deltaX = this.#manipulationDeltaX;
                            swipeStartedEvent.deltaY = this.#manipulationDeltaY;
                            swipeStartedEvent.deltaD = this.#manipulationDeltaD;
                            swipeStartedEvent.deltaS = this.#manipulationDeltaS;
                            this.#element.dispatchEvent(swipeStartedEvent);
                        }
                        else
                        {
                            return;
                        }
                    }
                }
                else if( this.#hasSwiped == true && this.#hasScaled == false )
                {
                    let initTouch = this.#initialManipulationTouches[0];
                    let initId = initTouch.identifier;
                    let currentTouch = this.#getManipulationTouchByIdentifier(event.touches, initId);
                    if( currentTouch == undefined ) { return; }

                    this.#manipulationDeltaX = currentTouch.pageX - initTouch.pageX;
                    this.#manipulationDeltaY = currentTouch.pageY - initTouch.pageY;
                }
                else if( this.#hasSwiped == false && this.#hasScaled == true )
                {
                    this.#manipulationDeltaS = Math.abs(tdistance / this.#manipulationDistance);
                }
            }
        }

        if( this.#hasSwiped == true )
        {
            this._onSwiping();
            let swipingEvent = new Event("swiping");
            swipingEvent.duration = this.#manipulationDuration;
            swipingEvent.deltaX = this.#manipulationDeltaX;
            swipingEvent.deltaY = this.#manipulationDeltaY;
            swipingEvent.deltaD = this.#manipulationDeltaD;
            swipingEvent.deltaS = this.#manipulationDeltaS;
            this.#element.dispatchEvent(swipingEvent);
        }
        if( this.#hasScaled == true )
        {
            this._onScaling();
            let scalingEvent = new Event("scaling");
            scalingEvent.duration = this.#manipulationDuration;
            scalingEvent.deltaX = this.#manipulationDeltaX;
            scalingEvent.deltaY = this.#manipulationDeltaY;
            scalingEvent.deltaD = this.#manipulationDeltaD;
            scalingEvent.deltaS = this.#manipulationDeltaS;
            this.#element.dispatchEvent(scalingEvent);
        }
    }

    #manipulationUpHandler( event )
    {
        console.log("#manipulationUpHandler");
        //console.log(event);
        event.stopPropagation();
        /// IMPORTANT KEEP
        /// sometimes, you can press the screen during swipe occurs
        /// for example, you executes an effect on swipeened event and you touch the screen during the effect
        /// and then restore the swipe capacity
        /// the privileged up handler is then fired without its original down event couterpart
        /// I TEMPORARLY return if the original down even is not here but I seriously consider other lifecycle
        let initEvent = this.#initialManipulationEvents[0];

        // touch event natively manage click (so cooool!) but not the case of the pointer and mouse
        if( Environment.privilegedManipulationEventType != "touch" )
        {
            if( initEvent == undefined || initEvent == null )
            {
                console.log("swipe click tester : undefined");
                this.#element.addEventListener("click", this.#boundManipulationClickHandler, true);
            }
            else if( this.#hasSwiped == true || this.#hasScaled == true )
            {
                console.log("swipe click tester : was manipulated");
                this.#element.addEventListener("click", this.#boundManipulationClickHandler, true);
            }
        }
        
        if( initEvent == undefined || initEvent == null )  { return; }
        
        // remove the the move handler even if a touch is still occuring
        // we consider for the moment the first up event stop the manipulation
        this.#element.removeEventListener(this.#privilegedMoveEvent, this.#boundManipulationMoveHandler, false);

        this.#manipulationDuration = event.timeStamp - initEvent.timeStamp;

        /// IMPORTANT KEEP : user can decide to disable swipe when the event is dispacthed
        /// see if the condition in the setter is really good
        this.#isManipulating = false;

        if( this.#hasSwiped == true )
        {
            this._onSwipeEnded();
            let swipeEndedEvent = new Event("swipeended"); // until we can properly extends events
            swipeEndedEvent.duration = this.#manipulationDuration;
            swipeEndedEvent.deltaX = this.#manipulationDeltaX;
            swipeEndedEvent.deltaY = this.#manipulationDeltaY;
            swipeEndedEvent.deltaD = this.#manipulationDeltaD;
            swipeEndedEvent.deltaS = this.#manipulationDeltaS;
            this.#element.dispatchEvent(swipeEndedEvent);
        }

        // re initialize values
        this.#hasSwiped = false;
        this.#hasScaled = false;

        this.#initialManipulationEvents = new Array();
        this.#initialManipulationTouches = new Array();
        this.#cachedPointerEvents = new Array();
        this.#lastPointerMoveEvent = undefined;

        this.#manipulationDistance = -1;
        this.#manipulationMiddlePoint = new Point();

        this.#manipulationDuration = 0;

        this.#manipulationDeltaX = 0;
        this.#manipulationDeltaY = 0;
        this.#manipulationDeltaD = 0;
        this.#manipulationDeltaS = 0;
    }

    /**
     * @private
     * A util function to prevent click under the manipulation element
     * @param { Event } event 
     */
    #manipulationClickHandler( event )
    {
        event.stopPropagation();
        if( Environment.privilegedManipulationEventType != "touch" )
        {
            if( this.#isTrackPad == false )
            {
                this.#element.removeEventListener("click", this.#boundManipulationClickHandler, true);
            }
        }
        this.#isTrackPad = false;
    }

    /**
     * @override
     * The 'on' method called when the swipe has just started.
     */
    _onSwipeStarted(){}

    /**
     * @override
     * The 'on' method called each time a move event is dispatched when the swipe has begun.
     */
    _onSwiping(){}

    /**
     * @override
     * The 'on' method called when the swipe has just ended.
     */
    _onSwipeEnded(){}

    /**
     * @public
     * Get or set minimum scale value. 
     * @type { Number }
     * @param { Number } value
     * @return { Number }
     */
    get scaleMin() { return this.#scaleMin; }
    set scaleMin( value )
    {
        if( isNaN(value) == true )
        {
            throw new TypeError("Number value expected");
        }
        if( this.#isManipulating == true ) { return; } // do not change this value during manipulation
        if( value == this.#scaleMin ) { return; }
        this.#scaleMin = value;
    }

    /**
     * @public
     * Get or set maximum scale value. 
     * @type { Number }
     * @param { Number } value
     * @return { Number }
     */
    get scaleMax() { return this.#scaleMax; }
    set scaleMax( value )
    {
        if( isNaN(value) == true )
        {
            throw new TypeError("Number value expected");
        }
        if( this.#isManipulating == true ) { return; } // do not change this value during manipulation
        if( value == this.#scaleMax ) { return; }
        this.#scaleMax = value;
    }

    /**
     * @public
     * Get or the ability to manipulate for scale ie pinch / zoom.
     * @type { Boolean }
     * @param { Boolean } value
     * @return { Boolean }
     * @default false
     */
    get manipulationScaleEnabled() { return this.#manipulationScaleEnabled; }
    set manipulationScaleEnabled( value )
    {
        if( typeof value !== "boolean" )
        {
            throw new TypeError("Boolean value expected");
        }
        if( this.#isManipulating == true ) { return; }
        if( value == this.#manipulationScaleEnabled ) { return; }
        this.#manipulationScaleEnabled = value;
    }

    /**
     * @public
     * Get or set the scale of the element. These getter and setter do not care about if the transition property is setted on transform.
     * No event dispatched in this case. Use the scaleTo method to dispatch 'scalestarted' and 'scaleended' events and the associated 'on' method.
     * @type { Number }
     * @param { Number } value
     * @return { Number }
     * @default 1
     */
    get scale() { return this.#scale; }
    set scale( value )
    {
        if( isNaN(value) == true )
        {
            throw new TypeError("Number value expected");
        }
        if( this.#isScaling == true ) { return; } // no call during the scale effect

        if( value < this.#scaleMin ) { value = this.#scaleMin; }
        if( value > this.#scaleMax ) { value = this.#scaleMax; }
        if( value == this.#scale ) { return; } // yeah! normalize and then return : no need to start transition in these cases
        this.#scale = value;
        this.#element.style.transform = "scale(" + this.#scale + ")";
    }

    /**
     * @public
     * Scale the element at factor f. 'scalestarted' and 'scaleended' events are dispatched and the associated 'on' method are called.
     * The transitionProperty of the element's style is setted to transform. Styles are cached and then setted after the transition is played.
     * @param { Number } f 
     */
    scaleTo( f = 1 )
    {
        if( isNaN(f) == true )
        {
            throw new TypeError("Number value expected");
        }
        if( this.#isScaling == true ) { return; } // no call during the scale effect
        if( this.#isManipulating == true ) { return; } // no call during a manipulation

        if( f < this.#scaleMin ) { f = this.#scaleMin; }
        if( f > this.#scaleMax ) { f = this.#scaleMax; }
        if( f == this.#scale ) { return; } // yeah! normalize and then return : no need to start transition in these cases

        if( this.#manipulationEnabled == true ) { this.#removeManipulationHandlers(); }
        
        this.#isScaling = true;

        this._onScaleStarted();
        let scaleStartedEvent = new Event("scalestarted");
        this.#element.dispatchEvent(scaleStartedEvent);

        this.#scaleEffect = new AxialEffectBase();
        this.#scaleEffect.target = this.#element;
        this.#scaleEffect.property = "transform";
        this.#scaleEffect.transformFunction = "scale";
        this.#scaleEffect.initialPropertyValue = this.#scale;
        this.#scaleEffect.destination = f;
        this.#scaleEffect.duration = 1000;
        this.#scaleEffect.easing = AxialEase.circularOut;
        this.#scaleEffect.addEventListener("effectended", this.#boundScaleEffectEndedHandler, false);

        this.#scale = f;

        this.#scaleEffect.start();
    }

    /**
     * @private
     * Called after the scale method has performed the transition
     * @param { Event } event 
     */
    #scaleEffectEndedHandler( event )
    {
        //console.log("COMPONENT SCALE EFFECT END");
        this.#scaleEffect.removeEventListener("effectended", this.#boundScaleEffectEndedHandler, false);
        if( this.#manipulationEnabled == true ) { this.#addManipulationHandlers(); }

        this._onScaleEnded();
        let scaleEndedEvent = new Event("scaleended");
        this.#element.dispatchEvent(scaleEndedEvent);

        this.#isScaling = false;
    }

    /**
     * @override
     * The 'on' method called when the scaleTo method is called or when a scale manipulation is occured.
     */
    _onScaleStarted(){}

    /**
     * @override
     * The 'on' method called during the scale manipulation.
     */
    _onScaling(){}

    /**
     * @override
     * The 'on' method called when the scale transition is finished or when the scale manipulation has just ended.
     */
    _onScaleEnded(){}
}

export { AxialComponentBase }