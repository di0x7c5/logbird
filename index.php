<?php
    /*
     * Copyright (C) 2014 Dariusz Iwanoczko
     * All rights reserved.
     */

    define('_LBEXEC', 1);

    $LOGCAT_VERSION_MAJOR = "0";
    $LOGCAT_VERSION_MINOR = "3";
    $LOGCAT_VERSION_REVISION = "8";

    $inDevMode = false;
    $version = $LOGCAT_VERSION_MAJOR . '.' . $LOGCAT_VERSION_MINOR . '.' . $LOGCAT_VERSION_REVISION;
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="logbird, logcat, android, log, analyze">
    <meta name="author" content="di0x7c5">

    <title>Logbird <?php echo $version; ?></title>

    <link rel="icon" type="image/png"  href="img/favicon.ico">
    <link href="css/context.css" rel="stylesheet" type="text/css">
    <link href="plugins/bootstrap/css/bootstrap<?php if ($inDevMode) echo '.min'; ?>.css" rel="stylesheet" type="text/css">
    <?php if ($inDevMode) : ?>
        <link href="less/logbird.less" rel="stylesheet/less" type="text/css">
    <?php else : ?>
        <link href="css/logbird.min.css" rel="stylesheet" type="text/css">
    <?php endif; ?>
    <link href="http://fonts.googleapis.com/css?family=Roboto+Condensed:400,300,700" rel="stylesheet" type="text/css">
    <link href="http://fonts.googleapis.com/css?family=Roboto:400,300,500,100,700,900" rel="stylesheet" type="text/css">
    <link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css">
</head>

<body>

<!-- Dialog box background -->
<div id="section-dialog-wrapper" class="hide">
    <div id="dialog" class="dialog">
        <button id="dialog-close" type="button" class="close" onClick=""><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>
        <h3 id="dialog-title" class="mt0 mb2">Checkpoint name:</h3>

        <div class="input-group">
            <input  id="dialog-input-text" type="text" class="form-control" step="any" />
            <span class="input-group-btn">
                <button id="dialog-submit" class="btn btn-success" type="button">OK</button>
            </span>
        </div>
    </div>
</div>

<!-- Navbar -->
<section id="section-navbar">
    <nav class="navbar navbar-default navbar-fixed-top" role="navigation">
        <div class="navbar-header">
            <a id="menu-home" class="navbar-brand">
                <span class="glyphicon glyphicon-home"></span>
            </a>
        </div>

        <ul class="nav navbar-nav">
            <li class="dropdown">
                <a id="menu-time-measure" href="#" class="dropdown-toggle" data-toggle="dropdown"><span class="glyphicon glyphicon-time"></span> Time <span class="caret"></span></a>
                <ul class="dropdown-menu" role="menu">
                    <li style="z-index:1000;">
                        <div class="pr2 pl2" style="width: 410px; display:block;">
                            <form role="form">
                                <h2><button class="btn btn-power-on" onclick="return false;"><span class="glyphicon glyphicon glyphicon-off"></span></button> Time measurement options</h2>
                                <div class="form-group">
                                    <label for="menu-time-measure-value"><strong>Display note if time diff. is more then (in seconds):</strong></label>
                                    <input id="menu-time-measure-value" name="menu-time-measure-value" type="number" class="form-control" step="any" />
                                </div>
                                <div class="checkbox">
                                    <label>
                                        <input id="menu-time-measure-seconly" type="checkbox"> Show only a seconds instead full time
                                    </label>
                                </div>
                                <div class="text-right">
                                    <button id="menu-time-measure-update" class="btn btn-primary" onclick="return false;">Update</button>
                                </div>
                            </form>
                        </div>
                    </li>
                </ul>
            </li>

            <!-- Checkpoints -->
            <li id="menu-checkpoint" class="dropdown">
                <a class="dropdown-toggle" data-toggle="dropdown"><span class="glyphicon glyphicon-ok-sign"></span> Checkpoints <span class="caret"></span></a>
                <ul role="menu" id="menu-checkpoint-dropdown" class="dropdown-menu">
                    <li role="presentation" class="dropdown-header">Standard checkpoints:</li>
                    <li><a><span class="label danger">A</span> - not set</a></li>
                    <li><a><span class="label danger">B</span> - not set</a></li>
                    <li role="presentation" class="dropdown-header">Custom checkpoints:</li>
                    <li class="disabled"><a>none</a></li>
                </ul>
            </li>
        </ul>

        <p id="menu-checkpoint-difference" class="navbar-text navbar-right pr2"></p>
    </nav>
</section>

<!-- Progress Bar -->
<section id="section-progress">
    <div class="progress progress-striped active">
        <div class="progress-bar"  role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%"></div>
    </div>
</section>

<!-- JavaScript Alert -->
<noscript>
    <div class="container">
        <div class="row">
            <div class="col-xs-12">
                <div class="alert alert-danger">
                    <strong>JavaScript!</strong> For full functionality of this site it is necessary to enable JavaScript.
                    Here are the <a href="http://www.enable-javascript.com/" target="_blank" class="alert-link">
                    instructions how to enable JavaScript in your web browser</a>.
                </div>
            </div>
        </div>
    </div>
</noscript>

<!-- Cookies Alert -->
<?php include 'php/cookiealert.php'; ?>

<!-- Header -->
<section id="section-header">
    <div class="container">
        <div class="row pt1 pb1">
            <div class="col-xs-12 text-right">
                <!-- Menu -->
                 <div id="htmlMenuTop">
                    <a href="http://www.android.com/" target="_blank">Android</a>
                    <a href="https://source.android.com/" target="_blank">AOSP</a>
                    <a href="http://developer.android.com/tools/help/logcat.html" target="_blank">logcat</a>
                </div>
            </div>
        </div>
        <div class="row pt3 pb4">
            <div class="col-xs-12">
                <!-- Title -->
                <div id="htmlLogbirdLogo">
                    <h1>&nbsp;&nbsp;log<strong>bird</strong><span class="beta"><?php echo $version; ?></span></h1>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Message Box -->
<section id="section-messages">
    <div class="container">
        <div class="row">
            <div id="htmlMessageBox"></div>
        </div>
    </div>
</section>

<!-- File Input -->
<input type="file" id="file" name="file" />
<!-- multiple -->

<!-- File Input Form -->
<section id="section-files" class="stripe">
    <div class="container">
        <div class="row">
            <div class="col-xs-12">
                <div id="htmlInputfiles"></div>
            </div>
        </div>
    </div>
</section>

<!-- Submit/Browse Buttons -->
<section id="section-submit">
    <div class="container">
        <div class="row">
            <div class="col-sm-offset-2 col-sm-4 col-md-offset-3 col-md-3">
                <div id="htmlButtonBrowse">Browse</div>
            </div>

            <div class="col-sm-4 col-md-3">
                <div id="htmlButtonSubmit">Submit</div>
            </div>
        </div>
    </div>
</section>

<!-- BlackList -->
<section id="section-blacklist">
    <div class="container">
        <div class="row">
            <div class="col-xs-12">
                <h1 class="section-title">Black List</h1>
                <form id="htmlBlackListForm" onsubmit="onBlacklistAddClick(); return false;">
                    <div class="input-group">
                        <input id="blacklist-input" name="blacklist-input" type="text" class="form-control" placeholder="Tag Name">
                        <span class="input-group-btn">
                            <button id="blacklist-add" class="btn btn-success" type="button" onclick="onBlacklistAddClick()"> Add</button>
                        </span>
                    </div>
                </form>
            </div>

            <div class="col-xs-12">
                <div id="htmlBlackList"></div>
                <div class="text-right"><a onclick="onBlacklistClearAllClick()" style="cursor:pointer">Clear All</a></div>
            </div>
        </div>
    </div>
</section>

<?php if (0) : ?>
<!-- Settings -->
<section id="section-settings">
    <div class="container">
        <div class="row">
            <div class="col-xs-12">
                <h1 class="section-title">Settings</h1>
            </div>

            <div class="col-xs-12">
                <p class="text-center" style="margin: 30px 0;">Here will be placed some usefull settings for parser.</p>
                <div class="checkbox hide">
                    <label>
                        <input id="settings-avoid-empty-lines" type="checkbox"> Avoid empty lines
                    </label>
                </div>
            </div>
        </div>
    </div>
</section>
<?php endif; ?>

<!-- Debug -->
<section id="section-debug" <?php if (!$inDevMode) echo 'class="hide"'; ?>>
    <div class="container">
        <div class="row">
            <div class="col-xs-12">
                <h1 class="section-title">Debug</h1>
            </div>

            <div class="col-xs-12 text-center">
                <a class="clearCookieButton" onclick="onClearCookies()">Remove Cookies</a>
            </div>
        </div>
    </div>
</section>

<!-- Powered By -->
<section id="section-poweredby" class="hide">
    <div class="container">
        <div class="row">
            <div class="col-xs-12">
                <h1 class="section-title">Powered By</h1>
                <div id="htmlPoweredBy">
                    <a class="simpleicon simpleicon-html5"></a>
                    <a class="simpleicon simpleicon-css3"></a>
                    <a class="simpleicon simpleicon-bootstrap" target="_blank" href="http://getbootstrap.com/"></a>
                    <a class="simpleicon simpleicon-jquery" target="_blank" href="http://jquery.com/"></a>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Logbird output container -->
<section id="section-output">
    <div id="output-filename" class="container-fluid" style="padding-top: 20px;">
        <!-- File Data -->
        <div class="row">
            <div class="col-xs-12 nopadding">
                <div id="htmlFileName" class="stripe"></div>
            </div>
        </div>
    </div>

    <!-- Message -->
    <div class="container">
        <div class="row">
            <div class="col-xs-12">
                <div id="output-messages"></div>
            </div>
        </div>
    </div>

    <div id="output-metadata" class="container">
        <!-- Priority -->
        <div id="output-priority" class="row">
            <div class="col-xs-12">
                <h3>Log priority</h3>
                <span id="label-verbose" rel="tooltip" class="label success">Verbose</span><span id="label-debug" rel="tooltip" class="label success">Debug</span><span id="label-info" rel="tooltip" class="label success">Info</span><span id="label-warning" rel="tooltip" class="label success">Warning</span><span id="label-error" rel="tooltip" class="label success">Error</span><span id="label-fatal" rel="tooltip" class="label success">Fatal</span>
            </div>
        </div>

        <!-- Tag Controls -->
        <div id="output-list-tag">
            <div class="row">
                <div class="col-xs-9">
                    <h3>
                        Tags <span id="htmlTagsNumber" class="badge"></span>
                        <button type="button" class="btn btn-default" onClick="showAllTags()" >All</button>
                        <button type="button" class="btn btn-default" onClick="hideAllTags()">None</button>
                        <button type="button" disabled="true" class="btn btn-default"><span class="glyphicon glyphicon-sort-by-attributes-alt"></span></button>
                        <button type="button" disabled="true" class="btn btn-default"><span class="glyphicon glyphicon-sort-by-attributes"></span></button>
                        <button type="button" disabled="true" class="btn btn-default"><span class="glyphicon glyphicon-sort-by-alphabet"></span></button>
                        <button type="button" disabled="true" class="btn btn-default"><span class="glyphicon glyphicon-sort-by-alphabet-alt"></span></button>
                    </h3>
                </div>
                <div class="col-xs-3">
                    <h3>
                        <div class="input-group">
                            <span class="input-group-addon"><span class="glyphicon glyphicon-search"></span></span>
                            <input id="htmlTagRegex" name="htmlTagRegex" type="text" class="form-control" placeholder="Tag Name">
                        </div>
                        <button id="htmlTagRegexClear" class="close" type="button">&times;</button>
                    </h3>
                </div>
            </div>

            <div class="row">
                <!-- Tag List -->
                <div class="col-xs-12">
                    <div id="htmlTagList"></div>
                </div>
            </div>
        </div>

        <!-- PID List -->
        <div id="output-list-pid" class="row">
            <div class="col-xs-12">
                <div id="htmlPidList"></div>
            </div>
        </div>

        <!-- Fatal List -->
        <div id="output-list-fatal" class="row">
            <div class="col-xs-12">
                <div id="htmlFatalList"></div>
            </div>
        </div>
    </div>

    <!-- Main Table Content -->
    <table id="htmlLogbirdTable"></table>
</section>

<!-- Back To Top -->
<div id="htmlBackToTop">
    <span class="glyphicon glyphicon-chevron-up"></span>
</div>

<!-- Load Timer Box -->
<div id="htmlLoadTime"></div>

<!-- Footer -->
<section id="section-footer">
    <div class="container">
        <div class="row">
            <div class="col-xs-12">
                <p>This tool is licenced under GNU General Public License v2.0</p>
                <p>Source code on <a href="https://github.com/di0x7c5/logbird">GitHub</a></p>
            </div>
        </div>
    </div>
</section>

    <script src="plugins/jquery/jquery-1.11.1.min.js"></script>
    <script src="plugins/bootstrap/js/bootstrap.min.js"></script>
    <script src="js/context.js"></script>
    <script src="plugins/less/less.min.js"></script>

    <script>var inDevMode = <?php print ($inDevMode ? "true" : "false"); ?>;</script>
    <script src="js/logbird<?php if (!$inDevMode) echo '.min'; ?>.js"></script>

    <script>
        function onBlacklistAddClick() {
            var tag = $("#blacklist-input").val().trim();
            if (tag && blacklist.add(tag)) {
                $("#blacklist-input").val('');
            }
        }

        function onBlacklistTagClick(object) {
            var tag = $(object).html().trim();
            blacklist.remove(tag);
        }

        function onBlacklistClearAllClick() {
            blacklist.flush();
        }
    </script>

</body>
</html>