"use strict"

import { AxialFavoriteManager } from "./AxialFavoriteManager";

class AxialLocalFavoriteManager extends AxialFavoriteManager
{
    constructor( name )
    {
        super(name);
        this._storageSeparator = "$$$";
        let itemString = window.localStorage.getItem( this._name );
        if( itemString == "" )
        {
            this._favorites = new Set();
        }
        else if( itemString != null )
        {
            let a = itemString.split(this._storageSeparator);
            this._favorites = new Set(a);
        }
    }

    add( value )
    {
        super.add(value);
        this._save();
    }

    delete( value )
    {
        super.delete(value);
        this._save();
    }

    clear()
    {
        super.clear();
        this._save();
    }
    _save()
    {
        if( this._favorites.size == 0 ) { window.localStorage.setItem(this._name, ""); return; }
        let saveString = "";
        for( let value of this._favorites.values() )
        {
            saveString += value + this._storageSeparator;
        }
        saveString = saveString.substr( 0, (saveString.length - this._storageSeparator.length) );
        window.localStorage.setItem(this._name, saveString);
    }
}

export { AxialLocalFavoriteManager }