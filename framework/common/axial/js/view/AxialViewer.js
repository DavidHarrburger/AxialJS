"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";
import { DomUtils } from "../utils/DomUtils.js";
import { AxialView } from "./AxialView.js";

class AxialViewer extends AxialComponentBase
{
    /// vars
    /** @type { Array<AxialView> } */
    #views = new Array();

    /** @type { Number } */
    #currentIndex = 0;

    /** @type { Number } */
    #previousIndex = 0;

    /** @type { Function } */
    #defaultViewClass = AxialView;

    /** @type { String } */
    #effect = "none";

    /** @type { AxialView } */
    #oldView;

    /** @type { AxialView } */
    #newView;

    /** @type { Boolean } */
    #isSwitching = false;

    /** @type { Number } */
    #maxSwitch = 2;

    /** @type { Number } */
    #currentSwitch = 0;

    /** @type { Set.<String> } */
    #EFFECTS = Object.freeze( new Set( [ "none", "slide", "card", "deep" ] ) );

    /// elements
    /** @type { HTMLElement } */
    #holder;

    /** @type { HTMLSlotElement } */
    #slot;

    /// events
    /** @type { Function } */
    #boundTransitionEndHandler;

    /** @type { Function } */
    #boundMove;

    constructor()
    {
        super();
        this.classList.add("axial_viewer");
        this.template = "axial-viewer-template";
        this.#boundMove = this.#move.bind(this);
        this.#boundTransitionEndHandler = this.#transitionEndHandler.bind(this);
    }

    /**
     * TEMPORARY until add at index is ok
     * @type { HTMLElement }
     * @readonly
     */
    get holder() { return this.#holder; }

    /**
     * @type { Array<AxialView>}
     * @readonly
     */
    get views() { return this.#views }

    /**
     * @type { AxialView }
     * @readonly
     */
    get currentView() { return this.#views[this.#currentIndex] }

    /**
     * @type { Number }
     * @readonly
     */
    get currentViewIndex() { return this.#currentIndex; }

    /**
     * @type { Number }
     * @readonly
     */
    get previousViewIndex() { return this.#previousIndex; }

    get effect() { return this.#effect; }
    set effect( value )
    {
        if( this.#EFFECTS.has( value ) === false )
        {
            this.#effect = "none";
        }
        else
        {
            this.#effect = value;
        }

    }

    get defaultViewClass() { return this.#defaultViewClass; }
    set defaultViewClass( value )
    {
        if( typeof value !== "function" )
        {
            throw new TypeError("Class with constructor required");
        }
        /// TODO check extends AxialView
        this.#defaultViewClass = value;
    }

    _buildComponent()
    {
        super._buildComponent();

        this.#holder = this.shadowRoot.getElementById("holder");
        if( this.#holder )
        {
            const cl = this.#holder.children.length;
            if( cl === 1 && this.#views.length > 0 )
            {
                for( const v of this.#views )
                {
                    this.#holder.appendChild(v);
                }
            }
            
        }

        this.#slot = this.shadowRoot.getElementById("slot");
        if( this.#slot )
        {
            const possibleViews = this.#slot.assignedElements( { flatten: true });
            const viewsLength = possibleViews.length;
            if( viewsLength > 0 )
            {
                for( let i = 0; i < viewsLength; i++ )
                {
                    const view = possibleViews[i];
                    if( view instanceof AxialView === true )
                    {
                        this.#views.push(view);
                        if( i === 0 ) { view.style.display = "block"; }
                        //else { view.style.display = "none"; }
                    }
                }
            }
        }
    }

    /**
     * Add a new view at specified index. If arg view is ignored, the view is created.
     * @param { AxialView } view 
     * @param { String } label (ignored ATM)
     * @param { Number } index (ignored ATM)
     */
    addView( view = new this.#defaultViewClass(), label = "label", index = -1 )
    {
        if( this.#views.length === 0 )
        {
            view.style.display = "block";
        }
        this.#views.push(view);
        if( this.#holder )
        {
            this.#holder.appendChild(view);
        }
        return view;
    }

    gotoViewByIndex( index = 0 )
    {
        if( index < 0 || index > (this.#views.length - 1) ) { return; }
        if( index === this.#currentIndex ) { return; }
        if( this.#isSwitching === true ) { return; }
        
        const oldView = this.#views[this.#currentIndex];
        const newView = this.#views[index];

        
        const dir = index > this.#currentIndex ? "forward" : "backward";
        const oldViewEventName = `${dir}Leaving`;
        const newViewEventName = `${dir}Entering`;

        const oldViewEvent = new CustomEvent( oldViewEventName, { bubbles: true } );
        const newViewEvent = new CustomEvent( newViewEventName, { bubbles: true } );

        oldView.dispatchEvent( oldViewEvent );
        newView.dispatchEvent( newViewEvent );
        

        if( this.#effect === "none" )
        {
            oldView.style.display = "none";
            newView.style.display = "block";

            this.#previousIndex = this.#currentIndex;
            this.#currentIndex = index;

            const viewerChangedEvent = new CustomEvent("viewerChanged", { detail: { oldView: oldView, newView: newView } } )
            this.dispatchEvent(viewerChangedEvent);
        }
        else
        {
            this.#isSwitching = true;
            this.#currentSwitch = 0;

            oldView.style.transform = "translateX(0)";

            newView.style.display = "block";

            oldView.style.transitionProperty = "none";
            newView.style.transitionProperty = "none";

            if( index > this.#currentIndex )
            {
                newView.style.transform = "translateX(101%)";
            }
            else
            {
                newView.style.transform = "translateX(-101%)";
            }

            oldView.addEventListener("transitionend", this.#boundTransitionEndHandler);
            newView.addEventListener("transitionend", this.#boundTransitionEndHandler);

            this.#oldView = oldView;
            this.#newView = newView;

            window.setTimeout( this.#boundMove, 1, this.#currentIndex, index );
        }
    }

    /**
     * 
     * @param { Number } from 
     * @param { Number } to 
     */
    #move( from, to )
    {
        //if( this.#isSwitching === true ) { return; }
        console.log("viewer.move()"); // keep from ATM
        //const oldView = this.#views[from];
        //const newView = this.#views[to];

        console.log( from, to );

        this.#oldView.style.transitionProperty = "transform";
        this.#newView.style.transitionProperty = "transform";

        /*
        const dir = to > from ? "forward" : "backward";
        const oldViewEventName = `${dir}Leaving`;
        const newViewEventName = `${dir}Entering`;

        const oldViewEvent = new CustomEvent( oldViewEventName, { bubbles: true } );
        const newViewEvent = new CustomEvent( newViewEventName, { bubbles: true } );

        this.#oldView.dispatchEvent( oldViewEvent );
        this.#newView.dispatchEvent( newViewEvent );
        */

        if( to > this.#currentIndex )
        {
            this.#oldView.style.transform = "translateX(-101%)";
        }
        else
        {
            this.#oldView.style.transform = "translateX(101%)";
        }
        this.#newView.style.transform = "translateX(0)";
        this.#previousIndex = from;
        this.#currentIndex = to;
    }

    /**
     * 
     * @param { TransitionEvent } event 
     */
    #transitionEndHandler( event )
    {
        /** @type { AxialView } */
        const view = event.target;
        
        view.removeEventListener( "transitionend", this.#boundTransitionEndHandler );
        if( event.propertyName === "transform" )
        {
            this.#currentSwitch = this.#currentSwitch + 1;
            if( this.#currentSwitch === this.#maxSwitch )
            {
                //console.log("should happened once");
                this.#isSwitching = false;
                this.#currentSwitch = 0;

                const viewerChangedEvent = new CustomEvent("viewerChanged", { detail: { oldView: this.#oldView, newView: this.#newView } } );
                this.dispatchEvent(viewerChangedEvent);
            }
        }
    }
    
    previous()
    {
        console.log("previous");
        const prevIndex = this.#currentIndex - 1 < 0 ? 0 : this.#currentIndex - 1; // see for infinity here
        if( prevIndex != this.#currentIndex ) // bad check
        {
            this.gotoViewByIndex( prevIndex );
        }
    }

    next()
    {
        console.log("next");
        const nextIndex = this.#currentIndex + 1 < this.#views.length ? this.#currentIndex + 1 : this.#currentIndex;
        if( nextIndex != this.#currentIndex )
        {
            this.gotoViewByIndex( nextIndex );
        }
    }

    moveViewAt( fromIndex, toIndex )
    {
        console.log("view move at entry point");
        if( fromIndex === toIndex ) { return; }
        const vl = this.#views.length;
        const view = this.#views[fromIndex];
        const copyView = new this.#defaultViewClass();
        const copyViewData = view._getAsObject();

        let deleteIndex = -1;
        let insertIndex = -1;

        if( toIndex === (vl - 1) )
        {
            this.holder.appendChild(copyView);

            insertIndex = vl - 1;
            deleteIndex = fromIndex;
        }
        else if( toIndex < fromIndex )
        {
            const previousView = this.#views[toIndex];
            this.holder.insertBefore( copyView, previousView ); // ARRAY : insert after dropIndex - 1
            deleteIndex = fromIndex + 1;
            insertIndex = toIndex - 1;
            
        }
        else if( toIndex > fromIndex )
        {
            const nextView = this.#views[toIndex+1];
            this.holder.insertBefore( copyView, nextView); // insert after dropIndex
            deleteIndex = fromIndex;
            insertIndex = toIndex;
        }
        else
        {
            console.warn("MOVE OPERATION NOT HANDLE");
        }

        this.#views.splice( insertIndex+1, 0, copyView );
        this.#views.splice( deleteIndex, 1 );

        view.remove();
        copyView.data = copyViewData;

        // fuckin dispatch
        const viewerEvent = new CustomEvent("viewMoved", { bubbles: true, detail: { movedView: copyView } } );
        this.dispatchEvent(viewerEvent);
        //return copyView;
    }

    deleteViewAt( index )
    {
        if( index >= 0 && index < this.#views.length )
        {
            console.log("delete view");
            const view = this.#views[index];
            this.#views.splice(index, 1);
            view.remove();
            const viewerEvent = new CustomEvent("viewDeleted", { bubbles: true, composed: true } );
            this.dispatchEvent(viewerEvent);
        }
    }

    clearViews()
    {
        DomUtils.cleanElement( this.#holder );
        this.#views = new Array();
    }
}

window.customElements.define("axial-viewer", AxialViewer);
export { AxialViewer }