"use strict"

const AXIAL_FAVORITE_DEFINITIONS = new Set();

class AxialFavoriteManager
{
    constructor( name )
    {
        if( name == null || name == undefined || typeof name !== "string" || name.trim() == "" )
        {
            throw new TypeError( "'name' value must be a not empty string" );
        }

        if( AXIAL_FAVORITE_DEFINITIONS.has(name) == true )
        {
            throw new Error("This Favorite Manager name is already registered");
        }

        this._name = name;
        this._favorites = new Set();
    }

    add( value )
    {
        if( this._favorites.has( value ) == false )
        {
            this._favorites.add( value );
        }   
    }

    has( value )
    {
        return this._favorites.has( value );
    }

    delete( value )
    {
        if( this._favorites.has( value ) == true )
        {
            this._favorites.delete( value );
        }
    }

    clear()
    {
        this._favorites.clear();
    }

    toArray()
    {
        return Array.from(this._favorites);
    }

    get size()
    {
        return this._favorites.size;
    }
    
    // utils if you want to create a new favoriteManager
    static exists( name )
    {
        return AXIAL_FAVORITE_DEFINITIONS.has(name);
    }
    
}

export { AxialFavoriteManager }