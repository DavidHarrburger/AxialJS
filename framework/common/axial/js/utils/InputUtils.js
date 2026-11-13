"use strict";

class InputUtils
{
    /** @type { Set } */
    static #inputs = new Set();

    /**
     * 
     * @param { HTMLInputElement } target 
     */
    static formatPhone( target )
    {
        target.addEventListener("input", InputUtils.#phoneHandler )
        InputUtils.#inputs.add( target );
    }

    /**
     * 
     * @param { InputEvent } event 
     */
    static #phoneHandler( event )
    {
        console.log(event);
        const input = event.target;
        const start = input.selectionStart;

        // Nombre de chiffres avant le curseur
        const digitsBeforeCaret = input.value
            .slice(0, start)
            .replace(/\D/g, '').length;

        // Formatage
        const formatted = input.value
            .replace(/\D/g, '')
            .slice(0, 10)
            .replace(/(\d{2})(?=\d)/g, '$1 ')
            .trim();

        input.value = formatted;

        // Recalcule la position du curseur
        let newPos = 0;
        let digitCount = 0;

        while (newPos < formatted.length && digitCount < digitsBeforeCaret) {
            if (/\d/.test(formatted[newPos])) {
                digitCount++;
            }
            newPos++;
        }

        input.setSelectionRange(newPos, newPos);
    }
    
}

export { InputUtils }