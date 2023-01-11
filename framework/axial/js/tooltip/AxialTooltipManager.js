"use strict"

const AXIAL_TOOLTIP_LAYER = document.getElementById("axialTooltipLayer");
const AXIAL_TOOLTIP_ARROW_SIZE = 8;

class AxialTooltipManager
{
    /**
     * Return the layer where we add the tooltips
     */
    static get layer()
    {
        return AXIAL_TOOLTIP_LAYER;
    }

    /**
     * Show the tooltip
     * @param { AxialTooltipBase } tooltip 
     */
    static showTooltip( tooltip )
    {
        tooltip._removeArrowPositionClass();

        let targetRect = tooltip.target.getBoundingClientRect();
        let tooltipRect = tooltip.element.getBoundingClientRect();

        let freeLeft = targetRect.left;
        let freeRight = window.innerWidth - targetRect.right;
        let freeTop = targetRect.top;
        let freeBottom = window.innerHeight - targetRect.bottom;

        let tempPosition = tooltip.position;
        let finalLeft = 0;
        let finalTop = 0;
        let offset = tooltip.offset;

        // normalize horizontal
        if( tempPosition == "left" )
        {
            if( freeLeft < tooltipRect.width && freeRight >= tooltipRect.width )
            {
                tempPosition = "right";
            }
        }
        else if( tempPosition == "right" )
        {
            if( freeRight < tooltipRect.width && freeLeft >= tooltipRect.width )
            {
                tempPosition = "left";
            }
        }
        // normalize vertical
        if( tempPosition == "top" )
        {
            if( freeTop < tooltipRect.top && freeBottom >= tooltipRect.height )
            {
                tempPosition = "bottom";
            }
        }
        else if( tempPosition == "bottom" )
        {
            if( freeBottom < tooltipRect.height && freeTop >= tooltipRect.height )
            {
                tempPosition = "top";
            }
        }

        // horizontal positionning
        if( tempPosition == "left" || tempPosition == "right")
        {
            finalTop = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
            if( tempPosition == "left" )
            {
                finalLeft = targetRect.left - tooltipRect.width - offset;
            }
            else
            {
                finalLeft = targetRect.right + offset;
            }
        }
        // vertical positionning
        if( tempPosition == "top" || tempPosition == "bottom")
        {
            finalLeft = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
            if( tempPosition == "top" )
            {
                finalTop = targetRect.top - tooltipRect.height - offset;
            }
            else
            {
                finalTop = targetRect.bottom + offset;
            }
        }

        // arrow
        if( tooltip.useArrow == false )
        {
            tooltip.arrow.style.visibility = "hidden";
        }
        else
        {
            let arrowClass = "ax-tooltip-arrow-" + tempPosition;
            tooltip.arrow.classList.add(arrowClass);

            let arrowRect = tooltip.arrow.getBoundingClientRect();
            let arrowFinalLeft = 0;
            let arrowFinalTop = 0;
            // horizontal
            if( tempPosition == "left" || tempPosition == "right")
            {
                arrowFinalTop = (tooltipRect.height - arrowRect.height) / 2;
                if( tempPosition == "left" )
                {
                    arrowFinalLeft = tooltipRect.width;
                    finalLeft -= (AXIAL_TOOLTIP_ARROW_SIZE);
                }
                else
                {
                    arrowFinalLeft = -arrowRect.width;
                    finalLeft += (AXIAL_TOOLTIP_ARROW_SIZE);
                }
            }
            // vertical
            if( tempPosition == "top" || tempPosition == "bottom")
            {
                arrowFinalLeft = (tooltipRect.width - arrowRect.width) / 2;
                if( tempPosition == "top" )
                {
                    arrowFinalTop = tooltipRect.height;
                    finalTop -= (AXIAL_TOOLTIP_ARROW_SIZE + offset);
                }
                else
                {
                    arrowFinalTop = -arrowRect.height;
                    finalTop += (AXIAL_TOOLTIP_ARROW_SIZE + offset);
                }
            }

            tooltip.arrow.style.left = arrowFinalLeft + "px";
            tooltip.arrow.style.top = arrowFinalTop + "px";
            tooltip.arrow.style.visibility = "visible";
        }

        tooltip.element.style.left = finalLeft + "px";
        tooltip.element.style.top = finalTop + "px";
        tooltip.element.style.visibility = "visible";
    }

    /**
     * Hide the tooltip
     * @param { AxialTooltipBase } tooltip 
     */
    static hideTooltip( tooltip )
    {
        tooltip.arrow.style.visibility = "hidden";
        tooltip.element.style.visibility = "hidden";
    }
}

export { AxialTooltipManager }