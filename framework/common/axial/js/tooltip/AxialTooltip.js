"use strict"

import { AxialTooltipBase } from "./AxialTooltipBase";

class AxialTooltip extends AxialTooltipBase
{
    constructor( label = "undefined" )
    {
        super();
        if( typeof label !== "string" )
        {
            throw new Error("String value expected");
        }

        this._label = label;

        this._icon = "";
        this._iconColor = "#fff";
        
        // icon
        this._iconHolder = document.createElement("i");
        this._iconHolder.classList.add("material-icons");
        this._iconHolder.classList.add("md-18");
        this._iconHolder.style.color = this._iconColor;
        if( this._icon != "" ) // TODO : do better control here -> type / if is in set
        {
            this._iconHolder.classList.add("ax-tooltip-icon-space");
            this._iconHolder.innerHTML = this._icon;
        }
        this._element.appendChild(this._iconHolder);

        this._labelHolder = document.createElement("span");
        this._labelHolder.innerHTML = this._label;
        this._element.appendChild(this._labelHolder);
    }

    get icon() { return this._icon; }
    set icon( value )
    {
        if( typeof value !== "string" )
        {
            throw new Error("String value expected");
        }
        this._icon = value;
        if( this._icon == "" && this._iconHolder.classList.contains("ax-tooltip-icon-space") == true )
        {
            this._iconHolder.classList.remove("ax-tooltip-icon-space");
        }
        if( this._icon != "" && this._iconHolder.classList.contains("ax-tooltip-icon-space") == false )
        {
            this._iconHolder.classList.add("ax-tooltip-icon-space");
        }
        this._iconHolder.innerHTML = value;
    }

    get label() { return this._label; }
    set label( value )
    {
        if( typeof value !== "string" )
        {
            throw new Error("String value expected");
        }
        this._label = value;
        if( this._labelHolder )
        {
            this._labelHolder.innerHTML = this._label;
        }
    }
}

export { AxialTooltip }