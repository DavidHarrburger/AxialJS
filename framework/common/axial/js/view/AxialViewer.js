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

    /// elements
    /** @type { HTMLElement } */
    #holder;

    /** @type { HTMLSlotElement } */
    #slot;

    /** @type { Function } */
    #defaultViewClass = AxialView;

    constructor()
    {
        super();
        this.classList.add("axial_viewer");
        this.template = "axial-viewer-template";
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
        //view.style.display = "none";
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
        
        const oldView = this.#views[this.#currentIndex];
        const newView = this.#views[index];
        const viewsLength = this.#views.length;
        if( viewsLength > 0 )
        {
            for( let i = 0; i < viewsLength; i++ )
            {
                const view = this.#views[i];
                if( i === index )
                {
                    view.style.display = "block";
                    this.#currentIndex = i;
                }
                else
                {
                    view.style.display = "none";
                }
            }
        }
        const viewerChangedEvent = new CustomEvent("viewerChanged", { detail: { oldView: oldView, newView: newView } } )
        this.dispatchEvent(viewerChangedEvent);
    }

    nextView()
    {
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
        const viewerEvent = new CustomEvent("viewMoved", {bubbles: true, detail: { movedView: copyView } } );
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
            const viewerEvent = new CustomEvent("viewDeleted", {bubbles: true } );
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