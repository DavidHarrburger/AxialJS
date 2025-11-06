"use strict";

import { AxialAdminApplicationBase } from "../../../../axial/js/admin/base/AxialAdminApplicationBase.js";

// global components
import { AxialButton }  from "../../../../axial/js/button/AxialButton.js";
import { AxialCalendarButton }  from "../../../../axial/js/date/AxialCalendarButton.js";
import { AxialAdminList } from "../../../../axial/js/admin/base/AxialAdminList.js";
import { AxialToggleRadio } from "../../../../axial/js/button/AxialToggleRadio.js";
import { AxialToggleSwitch } from "../../../../axial/js/button/AxialToggleSwitch.js";
import { AxialViewerIndicatorStep } from "../../../../axial/js/view/AxialViewerIndicatorStep.js";
import { AxialViewerIndicator } from "../../../../axial/js/view/AxialViewerIndicator.js";
import { AxialViewBase } from "../../../../axial/js/view/AxialViewBase.js";
import { AxialViewerBase } from "../../../../axial/js/view/AxialViewerBase.js";

//
import { AxialCalendar } from "../../../../axial/js/date/AxialCalendar.js";
import { AxialDropdownCalendar } from "../../../../axial/js/dropdown/AxialDropdownCalendar.js";
import { AxialOverlayCalendar } from "../../../../axial/js/date/AxialOverlayCalendar.js";

import { AxialAdminParamsInformationBar } from "../../../../axial/js/admin/params/AxialAdminParamsInformationBar.js";

// charts
import { AxialChartTraffic } from "../../../../axial/js/charts/AxialChartTraffic.js";


class MasterPage extends AxialAdminApplicationBase
{
    constructor()
    {
        super();
    }

    _onApplicationDomLoaded( event )
    {
        super._onApplicationDomLoaded( event );
    }

    _onApplicationPageLoaded( event )
    {
        super._onApplicationPageLoaded( event );
    }

    _onApplicationUserReady()
    {
        super._onApplicationUserReady();
    }

    _onApplicationViewChanged( view )
    {
        super._onApplicationViewChanged( view );
        
    }

    _onApplicationPopupHidden( popup )
    {
        super._onApplicationPopupHidden( popup )
    }

}

export { MasterPage }