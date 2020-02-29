<?php
    /**
     * Copyright (C) 2014 Dariusz Iwanoczko
     * All rights reserved.
     */

    defined('_LBEXEC') or die('Restricted access');

    $cookieAccept = (isset($_COOKIE["CookieAccept"])) ? $_COOKIE["CookieAccept"] : "false";
?>

<section id="section-cookies" class="<?php if ($cookieAccept === "true") echo "hide"; ?>">
    <div class="container">
        <div class="row">
            <div class="col-xs-12">
                <div class="alert alert-info">
                    In order for this site to work properly, and in order to
                    evaluate and improve the site we need to store small files (called cookies) on your computer.
                    Over 90% of all websites do this, however, since the 25th of May 2011 we are required by EU regulations
                    to obtain your consent first. What do You say?
                    <br>
                    <div style="text-align:right;">
                        <a class="btn btn-success" onclick="onCookieAccept()">That's fine</a>
                        <a href="http://www.google.com" class="btn btn-danger">I don't agree</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

<script>
    function onCookieAccept() {
        jQuery('#section-cookies').fadeOut(500);
        setCookie("CookieAccept", "true", 7);
    }

    function onClearCookies() {
        jQuery('#section-cookies').fadeIn(500);
        deleteCookie("CookieAccept");
        blacklist.flush();
        deleteCookie('CookieBlackList');
    }

    function setCookie(cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime()+(exdays*24*60*60*1000));
        var expires = "expires="+d.toGMTString();
        document.cookie = cname + "=" + cvalue + "; " + expires;
    }

    function getCookie(cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for(var i=0; i<ca.length; i++) {
            var c = ca[i].trim();
            if (c.indexOf(name)==0) return c.substring(name.length,c.length);
        }
        return "";
    }

    function deleteCookie(cname) {
        setCookie(cname, "", 0);
    }
</script>