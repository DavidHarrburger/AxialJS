"use strict"

class ShareUtils
{
    static facebook()
    {
        let shareUrl = "https://www.facebook.com/sharer.php?u=" + window.location;
        window.open(shareUrl, "_blank");
    }

    static pinterest()
    {
        let shareUrl = "https://pinterest.com/pin/create/button/?url=" + window.location;
        window.open(shareUrl, "_blank");
    }

    static twitter()
    {
        let shareUrl = "https://twitter.com/share?url=" + window.location;
        window.open(shareUrl, "_blank");
    }

    static googlePlus()
    {
        let shareUrl = "https://plus.google.com/share?url=" + window.location;
        window.open(shareUrl, "_blank");
    }
}

export { ShareUtils }