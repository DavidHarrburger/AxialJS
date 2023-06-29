"use strict"

class CatalogUtils
{
    /**
     * Return the number of a double page from the number of a simple page.
     * @param { Number } n
     */
    static toDoublePage(n)
    {
        return Math.floor( Math.abs(n) / 2 ) + 1;
    }

    /**
     * Return the even number of a simple page from the num of a double page. 
     * @param { Number } n
     */
    static toSimplePage(n)
    {
         return ( Math.abs(n) - 1 ) * 2;
    }
}

export { CatalogUtils }