"us strict";

import { AxialIconFetchButton } from "../../button/AxialIconFetchButton.js";
import { StringUtils } from "../../utils/StringUtils.js";

class AxialIconListButtonClone extends AxialIconFetchButton
{
    /** @type { String } */
    #clonePath;

    /** @type { String } */
    #_id;

    /** @type { String } */
    #collection;

    constructor()
    {
        super();
        this.iconName = "clone";
        this.tooltipText = "Dupliquer cette ligne";
    }

    get _id() { return this.#_id; }
    set _id( value )
    {
        if( StringUtils.isWhite(value) === true )
        {
            throw new Error("Not white String required");
        }
        this.#_id = value;
    }

    get collection() { return this.#collection; }
    set collection( value )
    {
        if( StringUtils.isWhite(value) === true )
        {
            throw new Error("Not white String required");
        }
        this.#collection = value;
    }

    get clonePath() { return this.#clonePath; }
    set clonePath( value )
    {
        if( StringUtils.isWhite(value) === true )
        {
            throw new Error("Not white Strinbg required");
        }
        this.#clonePath = value;
        this.operationPath = this.#clonePath;
    }

    _onFetching()
    {
        super._onFetching();
        console.log("onFetching clonebutton");
        this.body = { _id: this.#_id };
    }
}

window.customElements.define("axial-icon-list-button-clone", AxialIconListButtonClone);
export { AxialIconListButtonClone }