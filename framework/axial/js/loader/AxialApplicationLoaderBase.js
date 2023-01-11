"use strict"

class AxialApplicationLoaderBase
{
    #layer;
    #loader
    #box;

    #text = "";

    constructor()
    {
        this.#layer = document.getElementById("axialLoaderLayer");
        this.#loader = document.getElementById("axialLoader");
        this.#box = document.getElementById("axialLoaderBox");
    }

    get text() { return this.#text; }
    set text( value )
    {
        if( typeof value !== "string" )
        {
            throw new TypeError("String value expected");
        }
        this.#text = value;
        this.#box.innerHTML = this.#text;
    }

    show()
    {
        this.#layer.style.visibility = "visible";
        this.#loader.classList.add("ax-loader-element-circle-quarter-animation");
    }

    hide()
    {
        this.#layer.style.visibility = "hidden";
        this.#loader.classList.remove("ax-loader-element-circle-quarter-animation");
    }
}

export { AxialApplicationLoaderBase }