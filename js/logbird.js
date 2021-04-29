/**
 * logbird.js
 * 
 * Copyright (C) 2014 Dariusz Iwanoczko
 * All rights reserved.
 */

// Global namespace
var LOGBIRD = LOGBIRD || {};

var onMainScreen = true;

// ---------------------------------------------------------------------------
// Sections
// ---------------------------------------------------------------------------
var section = {
    cookies   : document.getElementById('section-cookies'),
    dialogs   : document.getElementById('section-dialog-wrapper'),
    navbar    : document.getElementById('section-navbar'),
    progress  : document.getElementById('section-progress'),
    header    : document.getElementById('section-header'),
    messages  : document.getElementById('section-messages'),
    files     : document.getElementById('section-files'),
    submit    : document.getElementById('section-submit'),
    blacklist : document.getElementById('section-blacklist'),
    settings  : document.getElementById('section-settings'),
    debug     : document.getElementById('section-debug'),
    poweredby : document.getElementById('section-poweredby'),
    output    : document.getElementById('section-output'),
    footer    : document.getElementById('section-footer')
}

// ---------------------------------------------------------------------------
// HTML
// ---------------------------------------------------------------------------
var html = {
    messageBox    : document.getElementById('htmlMessageBox'),
    inputFiles    : document.getElementById('htmlInputfiles'),
    logbirdTable  : document.getElementById('htmlLogbirdTable'),
    fileName      : document.getElementById('htmlFileName'),
    tagsNumber    : document.getElementById('htmlTagsNumber'),
    tagList       : document.getElementById('htmlTagList'),
    pidList       : document.getElementById('htmlPidList'),
    fatalList     : document.getElementById('htmlFatalList'),
    loadTime      : document.getElementById('htmlLoadTime'),
    logbirdLogo   : document.getElementById('htmlLogbirdLogo'),
    backToTop     : document.getElementById('htmlBackToTop'),

    button : {
        browse    : document.getElementById('htmlButtonBrowse'),
        submit    : document.getElementById('htmlButtonSubmit')
    },
}

// ---------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------
var output = {
    messages : document.getElementById('output-messages'),
    filename : document.getElementById('output-filename'),
    metadata : document.getElementById('output-metadata'),
    priority : document.getElementById('output-priority'),

    list : {
        tag       : document.getElementById('output-list-tag'),
        pid       : document.getElementById('output-list-pid'),
        fatal     : document.getElementById('output-list-fatal'),
    }
}

// ---------------------------------------------------------------------------
// Menu
// ---------------------------------------------------------------------------
var menu = {
    home        : document.getElementById('menu-home'),
    timeMeasure : document.getElementById('menu-time-measure'),
    timeValue   : document.getElementById('menu-time-measure-value'),
    timeUpdate  : document.getElementById('menu-time-measure-update'),
    timeSeconly : document.getElementById('menu-time-measure-seconly'),

    /* Checkpoints Menu */
    checkpoint : {
        menu : document.getElementById('menu-checkpoint-dropdown'),
        add  : function(name) {
//             $(this.menu).append('<li id="menu-checkpoint-add"><a>' + name + '</a></li>');
            alert(name);
        }
    },

    checkpointMenu  : document.getElementById('menu-checkpoint'),
    addCheckpoint   : document.getElementById('menu-checkpoint-add'),
    checkpoint      : document.getElementById('menu-checkpoint-difference'),

    update : function(input) {
        $('[data-toggle="dropdown"]').parent().removeClass('open');
        if (format.haveTime(input)) {
            if (logbird.settings.time.run) {
                // TODO
            } else {
                // TODO
            }

            if (logbird.settings.time.secondsOnly) {
                $(this.timeSeconly).attr('checked', true);
            } else {
                $(this.timeSeconly).attr('checked', false);
            }
            show(this.timeMeasure);
            hide(this.checkpointMenu); // FIXME to show()
        } else {
            hide(this.timeMeasure);
            hide(this.checkpointMenu);
        }
    }
}

// ---------------------------------------------------------------------------
// Scroll to line
// ---------------------------------------------------------------------------
function scrollWindowToLine(line) {
    $('html,body').animate({
        scrollTop: ($("#l"+line).offset().top - 50) // 50px is the fixed navbar size
    }, 0);
}

// ---------------------------------------------------------------------------
// Dialogs
// ---------------------------------------------------------------------------
var dialog = {
    self : document.getElementById('dialog'),

    init : function() {
        $(this.self).click(function(e){
            e.stopPropagation();
        });
    },

    input : {
        text : {
            title  : document.getElementById('dialog-title'),
            close  : document.getElementById('dialog-close'),
            text   : document.getElementById('dialog-input-text'),
            submit : document.getElementById('dialog-submit'),

            show   : function(title, onSubmitListener, onCancelListener) {
                $(this.title).html(title);
                $(section.dialogs).click(function(e){
                    e.stopPropagation();
                    onCancelListener();
                    dialog.input.text.toggle(true);
                });
                $(this.close).click(function(e){
                    e.stopPropagation();
                    onCancelListener();
                    dialog.input.text.toggle(true);
                });
                $(this.submit).click(function(e){
                    e.stopPropagation();
                    var ret = onSubmitListener();
                    if (ret) {
                        dialog.input.text.toggle(true);
                    }
                });
                this.text.value = '';
                this.toggle(false);
            },

            value : function() {
                return this.text.value;
            },

            toggle : function(hidded) {
                $(section.dialogs).toggleClass('hide', hidded);
            }
        }
    }
}

// ---------------------------------------------------------------------------
// Checkpoint
// ---------------------------------------------------------------------------
function Checkpoint(time, name, obj) {
    this.time = time;
    this.name = name;
    this.obj = obj;

    this.reset = function() {
        this.time = -1;
//         this.name = "unknown";
        this.obj = "undefined";
    };

    this.update = function() {
        this.obj.find('td')[1].innerHTML = '<span class="label min danger">' +
            this.name + '</span>';
    };

    this.remove = function() {
        this.obj.find('td')[1].innerHTML = '';
        this.reset();
    }
}

// ---------------------------------------------------------------------------
// CheckpointManager
// ---------------------------------------------------------------------------
var CheckpointManager = {
    checkpointA : new Checkpoint(-1, "A", "undefined"),
    checkpointB : new Checkpoint(-1, "B", "undefined"),

    reset : function() {
        this.checkpointA.reset();
        this.checkpointB.reset();
        this.update();
    },

    setCheckpointA : function(time, obj) {
        if (this.checkpointA.time != -1) {
            this.checkpointA.remove();
        }

        this.checkpointA.time = time;
        this.checkpointA.obj = obj;
        this.update();
    },

    setCheckpointB : function(time, obj) {
        if (this.checkpointB.time != -1) {
            this.checkpointB.remove();
        }

        this.checkpointB.time = time;
        this.checkpointB.obj = obj;
        this.update();
    },

    update : function() {
        if (this.checkpointA.time != -1) {
            this.checkpointA.update();
        }

        if (this.checkpointB.time != -1) {
            this.checkpointB.update();
        }

        if (this.checkpointA.time != -1 && this.checkpointB.time != -1) {
            var diff = this.checkpointB.time - this.checkpointA.time;

            $(menu.checkpoint).html('<span class="label danger">A-B</span>: <span class="label">' + diff.toFixed(6) + ' s.</span>');
            $(menu.checkpoint).show();
        } else {
            $(menu.checkpoint).hide();
        }
    }
}

// ---------------------------------------------------------------------------
// blacklist
// ---------------------------------------------------------------------------
var blacklist = {
    id : "htmlBlackList",
    list : new Array(),

    init : function() {
        var cookie = getCookie('CookieBlackList');
        if (cookie) {
            this.list = JSON.parse(cookie);
            this.list.forEach(function(entry) {
                blacklist.push(entry)
            });
        }
    },

    check : function(tname) {
        return this.list.indexOf(tname);
    },

    add : function(tname) {
        if (this.check(tname) == -1) {
            this.list.push(tname);
            this.push(tname);
            this.update();
            return true;
        }

        return false;
    },

    remove : function(tname) {
        var index = this.check(tname);
        if (index != -1) {
            this.list.splice(index, 1);
            this.pop(tname);
            this.update();
            return true;
        }

        return false;
    },

    update : function() {
        setCookie('CookieBlackList', JSON.stringify(this.list), 999);
    },

    push : function(entry) {
        $('#' + blacklist.id).append('<span class="label success" data-tag="'
                + entry + '" onclick="onBlacklistTagClick(this)">' + entry + ' </span>');
    },

    pop : function(entry) {
        $('#' + blacklist.id + ' [data-tag="' + entry + '"]').remove();
    },

    flush : function() {
        this.list = [];
        this.update();
        this.html('');
    },

    html : function(html) {
        $('#' + this.id).html(html);
    }
};

// ---------------------------------------------------------------------------
// DebugTimer
// ---------------------------------------------------------------------------
function DebugTimer(description) {
    this.time = 0;
    this.description = description;

    this.start = function() {
        this.time = new Date().getTime();
    };

    this.stop = function() {
        var diff = new Date().getTime() - this.time;
        console.log("[DEBUG] " + this.description + " : " + diff + "ms.");
    };

    this.reset = function() {
        this.time = 0;
    }
}

// ---------------------------------------------------------------------------
// Process
// ---------------------------------------------------------------------------
function Process(pid) {
    this.pid = pid;
    this.tid = [];
    this.count = 1;
    this.visable = true;
    this.logs = [];
    this.tags = [];

    this.hide = function() {
        this.logs.toggleClass('hide', true);
        this.visable = false;
    }

    this.show = function() {
        if (this.visable) return;
        selectivelyShow(this.logs, false, false, true);
        this.visable = true;
    }

    this.check = function(tid) {
        return this.tid.indexOf(tid);
    },

    this.sort = function() {
        this.tid.sort();
    },

    this.addTag = function(tag) {
        if (this.tags.hasOwnProperty(tag)) {
            this.tags[tag]++;
        } else {
            this.tags[tag] = 1;
        }
    },

    this.removeTag = function(tag) {
        // TODO, Is it realy needed?
    },

    this.addThread = function(tid) {
        if (this.check(tid) == -1) {
            this.tid.push(tid);
            return true;
        }

        return false;
    },

    this.removeThread = function(tid) {
        var index = this.check(tid);
        if (index != -1) {
            this.tid.splice(index, 1);
            return true;
        }

        return false;
    },

    this.getTags = function() {
        var ret = '';
        for (var key in this.tags) {
            if (this.tags.hasOwnProperty(key)) {
                ret += key + ' (' + this.tags[key] + ') ';
            }
        }
        return ret.trim();
    }
}

// ---------------------------------------------------------------------------
// Priority
// ---------------------------------------------------------------------------
function Priority() {
    this.logs = [];
    this.visable = true;

    this.show = function() {
        if (this.visable) return;
        selectivelyShow(this.logs, true, false, false);
        this.visable = true;
    };

    this.hide = function() {
        this.logs.toggleClass('hide', true);
        this.visable = false;
    };

    this.getSize = function() {
        return this.logs.length;
    };

    this.reset = function() {
        this.visable = true;
        this.logs = [];
    };
}

// ---------------------------------------------------------------------------
// Tag
// ---------------------------------------------------------------------------
function Tag(name) {
    this.name = name;
    this.visable = true;
    this.logs = [];

    this.show = function() {
        if (this.visable) return;
        selectivelyShow(this.logs, false, true, false);
        this.visable = true;
    };

    this.hide = function() {
        this.logs.toggleClass('hide', true);
        this.visable = false;
    };

    this.getSize = function() {
        return this.logs.length;
    };

    this.reset = function() {
        this.visable = true;
        this.logs = [];
    };
}

// ---------------------------------------------------------------------------
// Format
// ---------------------------------------------------------------------------
var format = {
    RAW        : 0,
    BRIEF      : 1,
    PROCESS    : 2,
    TAG        : 3,
    TIME       : 4,
    THREADTIME : 5,
    LONG       : 6,
    CRASH      : 7,
    KERNEL     : 8,
    SYSLOG     : 9,

    haveData     : function(f) { return (f == this.TIME || f == this.THREADTIME || f == this.LONG || f == this.SYSLOG) ? true : false; },
    haveTime     : function(f) { return (f == this.TIME || f == this.THREADTIME || f == this.LONG || f == this.CRASH || f == this.KERNEL || f == this.SYSLOG) ? true : false; },
    haveTag      : function(f) { return (f != this.RAW && f != this.KERNEL) ? true : false; },
    havePriority : function(f) { return (f != this.RAW) ? true : false; },
    havePID      : function(f) { return (f != this.RAW && f != this.TAG && f != this.KERNEL) ? true : false; },
    haveTID      : function(f) { return (f == this.THREADTIME || f == this.LONG || f == this.CRASH) ? true : false; },

    toString   : function(f) {
        switch(f) {
            case this.BRIEF: return "Logcat::Brief";
            case this.PROCESS: return "Logcat::Process";
            case this.TAG: return "Logcat::Tag";
            case this.TIME: return "Logcat::Time";
            case this.THREADTIME: return "Logcat::Threadtime";
            case this.LONG: return "Logcat::Long";
            case this.CRASH: return "Crash";
            case this.KERNEL: return "Kernel";
            case this.SYSLOG: return "Syslog";
            default: return "Raw";
        }
    }
}

// ---------------------------------------------------------------------------
// Logbird
// ---------------------------------------------------------------------------
var logbird = {
    priority : {
        verbose : new Priority(),
        debug   : new Priority(),
        info    : new Priority(),
        warning : new Priority(),
        error   : new Priority(),
        fatal   : new Priority()
    },

    tags : [],

    addTag : function(name) {
        // check if tag exist
        for (var i=0, l=this.tags.length; i<l; i++) {
            if (name == this.tags[i].name) {
                return;
            }
        }
        this.tags.push(new Tag(name));
    },

    process : [],

    addProcess : function(pid, tag) {
        for (var i=0, l=this.process.length; i<l; i++) {
            if (pid == this.process[i].pid) {
                this.process[i].count++;
                this.process[i].addTag(tag);
                return;
            };
        }

        var proc = new Process(pid);
        proc.addTag(tag);
        this.process.push(proc);
    },

    addThread : function(tid, pid) {
        // TODO
    },

    isPriorityVisable : function(priority) {
        return this.priority[priority].visable;
    },

    isTagVisable : function (tag) {
        for (var i=0, l=this.tags.length; i<l; i++) {
            var t = this.tags[i];
            if (tag == t.name) {
                return t.visable;
            }
        }
        return false;
    },

    isProcessVisable : function(pid) {
        for (var i=0, l=this.process.length; i<l; i++) {
            var p = this.process[i];
            if (pid == p.pid) {
                return p.visable;
            }
        }
        return false;
    },

    format : format.RAW,

    unexpectedTimeDiff : 0,

    listenersSetOnPriority : false,

    // Configuration
    settings : {
        syntax : {
            colorized : true,

            keywords : ['false', 'true', 'null', 'NULL', 'error', 'Error', 'ERROR'],

            colors : {
                keyword : "#ffffff",
                string  : "#ff0000",
                number  : "#ff0000"
            }
        },

        avoidEmptyLines : false,
        maxTagLength: 18,

        time : {
            run         : true,
            secondsOnly : true,
            limes       : 30.5
        }
    },

    scrollToTop : function(speed) {
        $('html, body').animate({ scrollTop:0 }, speed);
    },

    syntaxColor : function(msg) {
        var config = this.settings.syntax;

        if (config.colorized) {
            // Bold keywords
            for (var i=0, l=config.keywords.length; i<l; i++) {
                msg = msg.replace(new RegExp('(' + config.keywords[i] + ')', 'g'), '<b>$1</b>');
            }
        }

        return msg;
    },

    reset : function() {
        this.priority.verbose.reset();
        this.priority.debug.reset();
        this.priority.info.reset();
        this.priority.warning.reset();
        this.priority.error.reset();
        this.priority.fatal.reset();
        this.tags = [];
        this.process = [];
        this.format = format.RAW;

        // Remove all dropdown menus created by Context.js
        $('ul.dropdown-menu.dropdown-context.compressed-context').remove();

        html.logbirdTable.innerHTML = '';
        html.fileName.innerHTML = '';
        html.tagList.innerHTML = '';
        html.tagsNumber.innerHTML = '';
        html.fatalList.innerHTML = '';
        html.inputFiles.innerHTML = '';

        output.messages.innerHTML = '';
        this.unexpectedTimeDiff = 0;

        $(section.files) // keep in sync with css
            .css('background-image', 'url(img/android.png)');

        statistics.reset();
        CheckpointManager.reset();

        fatalsArray = [];
        uploader.files = [];

        hide(html.loadTime);

        hide(section.navbar);
        hide(section.output);
        show(section.header);
        show(section.files);
        show(section.submit);
        show(section.blacklist);
        show(section.settings);
        show(section.feedback);
        show(section.about);
        show(section.contact);
        show(section.debug);
        show(section.poweredby);
        show(section.features);
        show(section.contact);

        onMainScreen = true;
        logbird.scrollToTop(300);
    },

    isBrowserSupportWorkers : function() {
        if (typeof(Worker) !== "undefined") {
            return true;
        } else {
            return false;
        }
    },

    workers : {
        upload : 0
    },

    progress : {
        show : function() {
            show(section.progress);
        },

        hide : function() {
            hide(section.progress);
        }
    },

    output : {
        sendMessage : function(label, title, msg) {
            var tmp = new Array();

            tmp.push('<div class="alert alert-', label, ' alert-dismissable">');
            tmp.push('<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>');
            tmp.push('<strong>', title, '</strong> ');
            tmp.push(msg);
            tmp.push('</div>');

            $(output.messages).append(tmp.join(''));
        },

        sendSuccess : function(title, msg) {
            this.sendMessage('success', title, msg);
        },

        sendInfo : function(title, msg) {
            this.sendMessage('info', title, msg);
        },

        sendWarning : function(title, msg) {
            this.sendMessage('warning', title, msg);
        },

        sendError : function(title, msg) {
            this.sendMessage('danger', title, msg);
        }
    }
};

// Regular Expressions
var regex = {
    DATA   : "(\\d{2}-\\d{2})",
    TIME   : "(\\d{2}:\\d{2}:\\d{2}\\.\\d{3})",
    TAG    : "(.*?)",
    PRIO   : "([VDIWEF]|VERBOSE|DEBUG|INFO|WARN|WARNING|ERROR|FATAL|NOTICE|\\d)",
    PID    : "(\\s*\\d+\\s*)",
    TID    : "(\\s*\\d+\\s*)",
    LOG    : "(.*)",
    TIMSTP : "(\\d+\\.\\d+)"
};

var kPriority = {
    KERN_EMERG : 0,
    KERN_ALERT : 1,
    KERN_CRIT : 2,
    KERN_ERR : 3,
    KERN_WARNING : 4,
    KERN_NOTICE : 5,
    KERN_INFO : 6,
    KERN_DEBUG : 7
};

// REGEXP Objects
var kRegexpInputFormatBrief
    = new RegExp("^"+regex.PRIO+"\\/"+regex.TAG+"\\("+regex.PID+"\\)\\s*:\\s"+regex.LOG+"$");
var kRegexpInputFormatProcess
    = new RegExp("^"+regex.PRIO+"\\("+regex.PID+"\\)\\s"+regex.LOG+"\\s*\\("+regex.TAG+"\\)$");
var kRegexpInputFormatTag
    = new RegExp("^"+regex.PRIO+"\\/"+regex.TAG+"\\s*:\\s"+regex.LOG+"$");
var kRegexpInputFormatTime
    = new RegExp("^"+regex.DATA+"\\s"+regex.TIME+"\\s"+regex.PRIO+"\\/"+regex.TAG+"\\("+regex.PID+"\\)\\s*:\\s"+regex.LOG+"$");
var kRegexpInputFormatThreadtime
    = new RegExp("^(\\d{2}-\\d{2})\\s+(\\d{2}:\\d{2}:\\d{2}\.\\d{3})\\s+[^ ]+\\s+(\\s*\\d+\\s*)\\s+(\\s*\\d+\\s*)\\s+([VDIWEF])\\s+(.*?)\\s*:\\s+(.*)$");
var kRegexpInputFormatLong
    = new RegExp("^\\[.*\\]$");
var kRegexpTitle
    = new RegExp("^-{9}\\s|^Main log$|^Radio log$");
var kRegexpInputFormatCrash
    = new RegExp("^\\s*"+regex.PRIO+"\\s+\\[\\s*"+regex.TIMSTP+"]\\s+\\("+regex.PID+":"+regex.TID+"\\)\\s+"+regex.TAG+"\\s{2}"+regex.LOG+"$");
var kRegexpInputFormatKernel
    = new RegExp("^<"+regex.PRIO+">\\[\\s*"+regex.TIMSTP+"\\]\\s+"+regex.LOG+"$");
var kRegexpInputFormatSyslog
    = new RegExp("^(\\d{4})-(\\d{2})-(\\d{2})T(\\d{2}):(\\d{2}):(\\d{2})\\.(\\d+)Z\\s*(VERBOSE|DEBUG|ERR|INFO|NOTICE|WARNING)\\s*([^:]+):\\s*(.*)$");

// Statistics
var statistics = {
    emptyLines : 0,

    reset : function() {
        this.emptyLines = 0;
    }
}

/* File Data */
var reader;
var file;
var fileName;
var fileSize;
var fileType;
var fileLastModifiedDate;
var fileMaxSize = 5.0 * 1024 * 1024; // 5.0Mb
var fileAllowedTypes = new Array(
    "n/a",
    "text/x-log",
    "text/plain",
    "application/octet-stream"
);

// Global Data
var numberOfColumn = -1;
var fatalsArray = new Array();

function show(obj) {
    $(obj).fadeIn(200);
}

function hide(obj) {
    $(obj).fadeOut(200);
}

/* Table Generate Measurment BEGIN */
var befrTimerValue;
var aftrTimerValue;
var diffLoadTime;

function startTimer() {
    befrTimerValue = new Date().getTime();
}

function stopTimer() {
    var aftrTimerValue = new Date().getTime();
    diffLoadTime = (aftrTimerValue - befrTimerValue);
    html.loadTime.innerHTML = (diffLoadTime + ' msec');
    show(html.loadTime);
}

function selectivelyShow(logs, fromPrio, fromTag, fromPid) {
    for (var i=0, l=logs.length; i<l; i++) {
        var log = logs[i];

        var priorityVisable = true;
        var tagVisable = true;
        var pidVisable = true;

        if (format.havePriority(logbird.format) && !fromPrio) {
            priorityVisable = logbird.isPriorityVisable($(log).data('priority'));
            if (!priorityVisable) continue;
        }

        if (format.haveTag(logbird.format) && !fromTag) {
            tagVisable = logbird.isTagVisable($(log).data('tag'));
            if (!tagVisable) continue;
        }

        if (format.havePID(logbird.format) && !fromPid) {
            pidVisable = logbird.isProcessVisable($(log).data('pid'));
            if (!pidVisable) continue;
        }

        if (priorityVisable && tagVisable && pidVisable) {
            $(log).toggleClass('hide', false);
        }
    }
}

function onFileUpload(evt) {
    // We are leave the main screen
    onMainScreen = false;

    // Replace whitespace by assosiated tags
    var logArray = reader.result.replace(/\u0001/g, '<span class="label min danger">SOH</span>')
        .replace(/\u0002/g, '<span class="label min danger">STX</span>')
        .replace(/\u0003/g, '<span class="label min danger">ETX</span>')
        .replace(/\u0004/g, '<span class="label min danger">EOT</span>')
        .replace(/\u0005/g, '<span class="label min danger">ENQ</span>')
        .replace(/\u0006/g, '<span class="label min danger">ACK</span>')
        .replace(/\u0007/g, '<span class="label min danger">BEL</span>')
        .replace(/\u0008/g, '<span class="label min danger">BS</span>')
        .replace(/\u0009/g, '<span class="label min danger">TAB</span>')
        .replace(/\u000b/g, '<span class="label min danger">VT</span>')
        .replace(/\u000e/g, '<span class="label min danger">SO</span>')
        .replace(/\u000f/g, '<span class="label min danger">SI</span>')
        .replace(/\u0010/g, '<span class="label min danger">DLE</span>')
        .replace(/\u0011/g, '<span class="label min danger">DC1</span>')
        .replace(/\u0012/g, '<span class="label min danger">DC2</span>')
        .replace(/\u0013/g, '<span class="label min danger">DC3</span>')
        .replace(/\u0014/g, '<span class="label min danger">DC4</span>')
        .replace(/\u0015/g, '<span class="label min danger">NAK</span>')
        .replace(/\u0016/g, '<span class="label min danger">SYN</span>')
        .replace(/\u0017/g, '<span class="label min danger">ETB</span>')
        .replace(/\u0018/g, '<span class="label min danger">CAN</span>')
        .replace(/\u0019/g, '<span class="label min danger">EM</span>')
        .replace(/\u001a/g, '<span class="label min danger">SUB</span>')
        .replace(/\u001b/g, '<span class="label min danger">ESC</span>')
        .replace(/\u001c/g, '<span class="label min danger">FS</span>')
        .replace(/\u001d/g, '<span class="label min danger">GS</span>')
        .replace(/\u001e/g, '<span class="label min danger">RS</span>')
        .replace(/\u001f/g, '<span class="label min danger">US</span>')
        .replace(/SIGHUP/g, '<span class="label min danger">SIGHUP</span>')
        .replace(/SIGINT/g, '<span class="label min danger">SIGINT</span>')
        .replace(/SIGQUIT/g, '<span class="label min danger">SIGQUIT</span>')
        .replace(/SIGILL/g, '<span class="label min danger">SIGILL</span>')
        .replace(/SIGTRAP/g, '<span class="label min danger">SIGTRAP</span>')
        .replace(/SIGABRT/g, '<span class="label min danger">SIGABRT</span>')
        .replace(/SIGBUS/g, '<span class="label min danger">SIGBUS</span>')
        .replace(/SIGFPE/g, '<span class="label min danger">SIGFPE</span>')
        .replace(/SIGKILL/g, '<span class="label min danger">SIGKILL</span>')
        .replace(/SIGUSR1/g, '<span class="label min danger">SIGUSR1</span>')
        .replace(/SIGSEGV/g, '<span class="label min danger">SIGSEGV</span>')
        .replace(/SIGUSR2/g, '<span class="label min danger">SIGUSR2</span>')
        .replace(/SIGPIPE/g, '<span class="label min danger">SIGPIPE</span>')
        .replace(/SIGALRM/g, '<span class="label min danger">SIGALRM</span>')
        .replace(/SIGTERM/g, '<span class="label min danger">SIGTERM</span>')
        .replace(/SIGSTKFLT/g, '<span class="label min danger">SIGSTKFLT</span>')
        .replace(/SIGCHLD/g, '<span class="label min danger">SIGCHLD</span>')
        .replace(/SIGCONT/g, '<span class="label min danger">SIGCONT</span>')
        .replace(/SIGSTOP/g, '<span class="label min danger">SIGSTOP</span>')
        .replace(/SIGTSTP/g, '<span class="label min danger">SIGTSTP</span>')
        .replace(/SIGTTIN/g, '<span class="label min danger">SIGTTIN</span>')
        .replace(/SIGTTOU/g, '<span class="label min danger">SIGTTOU</span>')
        .replace(/SIGURG/g, '<span class="label min danger">SIGURG</span>')
        .replace(/SIGXCPU/g, '<span class="label min danger">SIGXCPU</span>')
        .replace(/SIGXFSZ/g, '<span class="label min danger">SIGXFSZ</span>')
        .replace(/SIGVTALRM/g, '<span class="label min danger">SIGVTALRM</span>')
        .replace(/SIGPROF/g, '<span class="label min danger">SIGPROF</span>')
        .replace(/SIGWINCH/g, '<span class="label min danger">SIGWINCH</span>')
        .replace(/SIGIO/g, '<span class="label min danger">SIGIO</span>')
        .replace(/SIGPWR/g, '<span class="label min danger">SIGPWR</span>')
        .replace(/SIGSYS/g, '<span class="label min danger">SIGSYS</span>')
        .replace(/\r\n|\n\r|\r/g, "\n").split("\n");

    logbird.format = discoveryLogInputFormat(logArray);
    console.log("Discovered input format : " + format.toString(logbird.format));

    var tableContent = [];

    /* Generate header for table */
    var perflog = new DebugTimer("Generate header for table");
    perflog.start();

    tableContent.push('<thead>');
    tableContent.push('<tr>');
    tableContent.push('<th class="col-line">Line</th>');

    if (format.haveTime(logbird.format))
        tableContent.push('<th class="col-icon">I</th>');
    if (format.haveData(logbird.format))
        tableContent.push('<th class="col-data">Data</th>');
    if (format.haveTime(logbird.format))
        tableContent.push('<th class="col-time">Time</th>');
    if (format.haveTag(logbird.format))
        tableContent.push('<th class="col-tag">Tag</th>');
    if (format.havePriority(logbird.format))
        tableContent.push('<th class="col-priority">P</th>');
    if (format.havePID(logbird.format))
        tableContent.push('<th class="col-pid">PID</th>');
    if (format.haveTID(logbird.format))
        tableContent.push('<th class="col-pid">TID</th>');

    tableContent.push('<th class="col-msg">Message</th>');
    tableContent.push('</tr>');
    tableContent.push('</thead>');

    perflog.stop();

    /* Generate table content */
    perflog = new DebugTimer("Generate table content");
    perflog.start();

    tableContent.push('<tbody>');

    var ic = 0;
    var index = 0;
    var numberOfLogs = 0;
    var timeDiff = 0;

    for (var i=0, l=logArray.length; i<l; i++) {
        var index = i - ic;
        var columnleft = numberOfColumn;

        /* Empty line */
        if (logArray[i].trim() == "") {
            continue;
        }

        /* Title */
        if (kRegexpTitle.test(logArray[i])) {
            console.log(logArray[i]);
            continue;
        }

        var log = parseLog(logbird.format, logArray[i]);

        // Avoid empty lines in msg
        if (logbird.settings.avoidEmptyLines && log.msg.trim() == "") {
            statistics.emptyLines++;
            return;
        }

        if (log.type == "log") {
            tableContent.push('<tr id="l', index, '" class="log');
            if (format.haveTag(logbird.format)) {
                if (!(blacklist.check(log.tag) < 0)) {
                    tableContent.push(' hide');
                }
            }

            tableContent.push('"');

            if (format.haveTag(logbird.format)) {
                tableContent.push(' data-tag="', log.tag, '"');
            }

            if (format.havePriority(logbird.format)) {
                tableContent.push(' data-priority="');
                if (logbird.format == format.KERNEL) {
                    tableContent.push(kPriorityToString(log.priority));
                } else {
                    tableContent.push(priorityToString(log.priority));
                }
                tableContent.push('"');
                if (log.priority == "F") {
                    fatalsArray.push([index, log.msg]);
                }
            }

            if (format.havePID(logbird.format)) {
                tableContent.push(' data-pid="', log.pid, '"');
            }

            if (format.haveTID(logbird.format)) {
                tableContent.push(' data-tid="', log.tid, '"');
            }

            if (format.haveTime(logbird.format)) {
                tableContent.push(' data-time="');
                // Format Crash have already time in timestamp format
                if (logbird.format == format.CRASH || logbird.format == format.KERNEL) {
                    tableContent.push(log.time);
                } else {
                    tableContent.push(logTime2Timestamp(log.time));
                }
                tableContent.push('"');
            }
            tableContent.push('>');

            // Line number
            tableContent.push('<td link-to-line="', index, '">', index, '</td>');

            // Checkpoint icon
            if (format.haveTime(logbird.format)) {
                tableContent.push('<td><span class="label checkpoint">&nbsp;</span></td>');
            }

            if (format.haveData(logbird.format)) {
                tableContent.push('<td class="nw">', log.data, '</td>');
                columnleft--;
            }

            if (format.haveTime(logbird.format)) {
                tableContent.push('<td class="nw">', log.time, '</td>');
                columnleft--;
            }

            if (format.haveTag(logbird.format)) {
                tableContent.push('<td class="nw">', wrapTag(log.tag), '</td>');
                logbird.addTag(log.tag);
                columnleft--;
            }

            if (format.havePriority(logbird.format)) {
                tableContent.push('<td>', log.priority, '</td>');
                columnleft--;
            }

            if (format.havePID(logbird.format)) {
                tableContent.push('<td>', log.pid, '</td>');

                if (format.haveTag(logbird.format)) {
                    logbird.addProcess(log.pid, log.tag);
                } else {
                    logbird.addProcess(log.pid, '');
                }
                columnleft--;
            }

            if (format.haveTID(logbird.format)) {
                tableContent.push('<td>', log.tid, '</td>');
                logbird.addThread(log.tid, log.pid);
                columnleft--;
            }

            if (columnleft > 1) {
                tableContent.push('<td colspan="', columnleft, '">', log.msg, '</td>');
            } else {
                tableContent.push('<td>', logbird.syntaxColor(log.msg), '</td>');
            }
            tableContent.push('</tr>');
        } else if (log.type == "waif") {
            tableContent[tableContent.length-3] += '<span class="label min danger">NL</span>' + log.msg;
            ic++;
        }
    }

    tableContent.push('</tbody>');
    html.logbirdTable.innerHTML = tableContent.join('');

    perflog.stop();

    /* Display uploaded filename */
    html.fileName.innerHTML =
        '<h1 class="section-title">' + fileName + ' </h1>' +
        '<span class="label success">' + format.toString(logbird.format) + '</span>' +
        '<span class="label success">' + logArray.length + ' logs</span>' +
        '<span class="label success">' + fileType + '</span>' +
        '<span class="label success">' + fileSize + ' bytes</span>';

    /* Generate priority list */
    perflog = new DebugTimer("Generate priority list");
    perflog.start();

    if (format.havePriority(logbird.format)) {
        var prio = logbird.priority;
        var table = $(html.logbirdTable);
        prio.verbose.logs = table.find('tr[data-priority="verbose"]');
        prio.debug.logs = table.find('tr[data-priority="debug"]');
        prio.info.logs = table.find('tr[data-priority="info"]');
        prio.warning.logs = table.find('tr[data-priority="warning"]');
        prio.error.logs = table.find('tr[data-priority="error"]');
        prio.fatal.logs = table.find('tr[data-priority="fatal"]');

        $('#label-verbose').data('original-title', prio.verbose.getSize());
        $('#label-debug').data('original-title', prio.debug.getSize());
        $('#label-info').data('original-title', prio.info.getSize());
        $('#label-warning').data('original-title', prio.warning.getSize());
        $('#label-error').data('original-title', prio.error.getSize());
        $('#label-fatal').data('original-title', prio.fatal.getSize());

        if (!logbird.listenersSetOnPriority) {
            logbird.listenersSetOnPriority = true;

            $('#label-verbose').click(function() {
                prio.verbose.visable = onClickPriority("verbose", prio.verbose.visable);
            });

            $('#label-debug').click(function() {
                prio.debug.visable = onClickPriority("debug", prio.debug.visable);
            });

            $('#label-info').click(function() {
                prio.info.visable = onClickPriority("info", prio.info.visable);
            });

            $('#label-warning').click(function() {
                prio.warning.visable = onClickPriority("warning", prio.warning.visable);
            });

            $('#label-error').click(function() {
                prio.error.visable = onClickPriority("error", prio.error.visable);
            });

            $('#label-fatal').click(function() {
                    prio.fatal.visable = onClickPriority("fatal", prio.fatal.visable);
            });
        }

        show(output.priority);
    } else {
        hide(output.priority);
    }

    perflog.stop();

    /* Generate Tag list */
    perflog = new DebugTimer("Generate Tag list");
    perflog.start();

    if (format.haveTag(logbird.format)) {
        var numberOfTags = logbird.tags.length;
        var tmpcontent = [];

        var table = $(html.logbirdTable);

        for (var i=0; i<numberOfTags; i++) {
            var tag = logbird.tags[i];
            tag.logs = table.find('tr[data-tag="' + tag.name + '"]');

            tmpcontent.push('<span class="label tag ');
            if (blacklist.check(tag.name) < 0) {
                tmpcontent.push('success');
            } else {
                tmpcontent.push('default');
            }
            tmpcontent.push('" data-tag="', tag.name, '">', tag.name, ' <span class="badge">', tag.getSize(), '</span> ', '</span>');
        }

        html.tagsNumber.innerHTML = numberOfTags;
        html.tagList.innerHTML = tmpcontent.join('');

        // Bind listener to click on tag
        $('#htmlTagList [data-tag]').click(function(){
            var obj = $(this);
            if (obj.hasClass('success')) {
                hideTag(obj.data('tag'));
            } else {
                showTag(obj.data('tag'));
            }
            processTimeDiff();
        });

        show(output.list.tag);
    } else {
        hide(output.list.tag);
    }

    perflog.stop();

    /* Generate Process and/or Threads list */
    if (format.havePID(logbird.format)) {
        perflog = new DebugTimer("Generate Process and/or Threads list");
        perflog.start();

        // Sort process 
        logbird.process.sort(function(a, b) {
            return a.pid - b.pid
        });

        var tmp = new Array();
        tmp.push('<h3>Processes <span class="badge">', logbird.process.length,'</span>',
                 ' <a class="btn btn-default" onClick="showAllProcess()" >All</a>',
                 ' <a class="btn btn-default" onClick="hideAllProcess()">None</a>',
                 ' <button type="button" disabled="true" class="btn btn-default"><span class="glyphicon glyphicon-sort-by-attributes-alt"></span></button>',
                 ' <button type="button" disabled="true" class="btn btn-default"><span class="glyphicon glyphicon-sort-by-attributes"></span></button>',
                 ' <button type="button" disabled="true" class="btn btn-default"><span class="glyphicon glyphicon-sort-by-order"></span></button>',
                 ' <button type="button" disabled="true" class="btn btn-default"><span class="glyphicon glyphicon-sort-by-order-alt"></span></button></h3>');

        for (var i=0, l=logbird.process.length; i<l; i++) {
            var proc = logbird.process[i];
            tmp.push('<span class="label pid success" data-pid="',  proc.pid, '" data-toggle="tooltip" data-placement="top" title="',  proc.getTags(), '">', proc.pid, ' <span class="badge">', proc.count, '</span> ', '</span> ');

//             tmp.push('<div class="1col-xs-2"><div class="process-record"><div class="process-pid" data-pid="', proc.pid, '">PID: ', proc.pid, ' <span class="badge">',  proc.count, '</span></div><div class="process-tags">');
//             for (var tag in proc.tags) {
//                 tmp.push('<div class="label success">', tag, ' <span class="badge">', proc.tags[tag], '</span></div>');
//             }
//             tmp.push('</div></div></div>');
        }

        html.pidList.innerHTML = tmp.join('');

        // Update tooltips
        $('[data-toggle="tooltip"]').tooltip();

        // Bind listener to click on PID
        $('#htmlPidList [data-pid]').click(function() {
            var obj = $(this);
            if (obj.hasClass('success')) {
                hideProcess(obj.data('pid'));
            } else {
                showProcess(obj.data('pid'));
            }
            processTimeDiff();
        });

        // Get all logs pid and save it
        for (var i=0, l=logbird.process.length; i<l; i++) {
            logbird.process[i].logs = $('#htmlLogbirdTable tr[data-pid=' + logbird.process[i].pid + ']');
        }

        show(output.list.pid);
        perflog.stop();
    } else {
        hide(output.list.pid);
    }

    /* Generate Fatals List */
    perflog = new DebugTimer("Generate Fatals List");
    perflog.start();

    if (fatalsArray.length > 0) {
        var tmpcontent = new Array();
        tmpcontent.push('<h3>Fatals <span class="badge">', fatalsArray.length, '</span></h3>');

        for(var i=0, j=fatalsArray.length; i<j; i++) {
            tmpcontent.push('<div class="fatal-record"><span class="label danger" data-anchor="',
                            fatalsArray[i][0], '">', fatalsArray[i][0], '</span>',
                            '<span class="label default">', fatalsArray[i][1], '</span></div>');
        }

        html.fatalList.innerHTML = tmpcontent.join('');

        show(output.list.fatal);

        // Bind click to lines
        $('[data-anchor]').click(
            function(e) {
                scrollWindowToLine($(this).data('anchor'))
            }
        );
    } else {
        hide(output.list.fatal);
    }


    perflog.stop();

    /* Hide tag if is in blacklist */
/*
    perflog = new DebugTimer("Hide tag if is in blacklist");
    perflog.start();

    for(var i=0, l=logbird.tags.length; i<l; i++) {
        var name = logbird.tags[i].name;
        if (blacklist.check(name) != -1) {
            hideTag(name);
        }
    }

    perflog.stop();

    $('[link-to-line]').click(function() {
        var line = $(this).attr('link-to-line');
        console.log('Scroll to line number ' + line);
        $('html, body').scrollTo('#l' + line);
    });
*/

    perflog = new DebugTimer("UI update");
    perflog.start();

    menu.update(logbird.format);

    hide(section.header);
    hide(section.files);
    hide(section.submit);
    hide(section.blacklist);
    hide(section.settings);
    hide(section.feedback);
    hide(section.about);
    hide(section.contact);
    hide(section.debug);
    hide(section.poweredby);
    hide(section.features);
    hide(section.contact);
    show(section.navbar);
    show(section.output);
    show(html.logbirdTable);

    perflog.stop();

    processTimeDiff();
    updateTooltips();
    stopTimer();

    if (logbird.unexpectedTimeDiff > 3) {
        logbird.output.sendWarning("Warning!", "Your logs look to be damaged due to the large number of logs possessing earlier date than that preceded.");
    }

    logbird.scrollToTop(800);
}

function zeroPad(num, places) {
    var zero = places - num.toString().length + 1;
    return Array(+(zero > 0 && zero)).join("0") + num;
}

function processTimeDiff() {
    if (!logbird.settings.time.run || !format.haveTime(logbird.format)) {
        return;
    }

    var perf = new DebugTimer('processTimeDiff()');
    perf.start();

    var firstLog = true;
    var lastTime = -1;

    // Remove all time note
    jQuery(".note-time").remove();

    $('#htmlLogbirdTable > tbody  > tr.log').each(function() {
        var self = $(this);

        var time = self.data('time');
        var visable = self.css('display') != "none";

        // Don't cate about unvisible logs
        if (!visable) {
            return;
        }

        // Find the first log with time
        if (firstLog) {
            firstLog = false;
            lastTime = time;
            return;
        }

        // Calculate difference in time
        var diff = time - lastTime;
        lastTime = time;

        // Debug
        if (false) {
            console.log("Difference beatween " + time + " and " + lastTime + " is " + diff + ".");
        }

        var html = [];

        // Negative value
        if (diff < 0) {
            logbird.unexpectedTimeDiff++;

            html.push('<tr class="note-time error"><td colspan="', numberOfColumn, '">', '<span class="glyphicon glyphicon-time"></span> ');
            if (logbird.settings.time.secondsOnly) {
                html.push(diff.toFixed(6));
                html.push(' seconds ');
            } else {
                html.push(makeFullTimeFromMs(diff));
            }
            html.push('</td></tr>');

            self.before(html.join(''));
        } else if (diff > logbird.settings.time.limes) {
            html.push('<tr class="note-time">');
            html.push('<td colspan="', numberOfColumn, '"><span class="glyphicon glyphicon-time"></span> ');
            if (logbird.settings.time.secondsOnly) {
                html.push(diff.toFixed(6));
                html.push(' seconds ');
            } else {
                html.push(makeFullTimeFromMs(diff));
            }
            html.push('</td></tr>');
            self.before(html.join(''));
        }
    });

    perf.stop();
}

function makeFullTimeFromMs(ms) {
    var negative = (ms < 0);
    var tmp = ms;

    if (negative) {
        tmp = -ms;
    }

    var hrs = Math.floor(tmp / 3600);
    var min = Math.floor(tmp / 60) % 60;
    var sec = Math.floor(tmp) - (hrs * 3600) - (min * 60);
    var uni = (tmp % 1).toFixed(3) * 1000;

    var result = zeroPad(hrs, 2) + ':' + zeroPad(min, 2) + ':' + zeroPad(sec, 2) + '.' + zeroPad(uni, 3)
    if (negative) {
        result = '-' + result;
    }

    return result;
}

function logTime2Timestamp(str) {
    var result = -1;

    if (format.haveTime(logbird.format)) {
        var time = str.trim();
        var regex = new RegExp("^(\\d{2}):(\\d{2}):(\\d{2})\\.(\\d+)$");

        if (regex.test(time)) {
            var match = regex.exec(time);
            var hrs = parseInt(match[1]);
            var min = parseInt(match[2]);
            var sec = parseInt(match[3]);
            var uni = parseInt(match[4]);

            console.log(logbird.format);
            if (logbird.format == format.SYSLOG) {
                result = (uni/1000000) + sec + (min * 60) + (hrs *3600);
            } else {
                result = (uni/1000) + sec + (min * 60) + (hrs *3600);
            }
        }
    }

    return result;
}

function updateTooltips() {
    $('[rel=tooltip]').tooltip();
}

function discoveryLogInputFormat(arr) {
    // Featured column are columns not assosiated with specific
    // logcat format but they are needed for specific feature like
    // checkbox icon or line number etc.
    var FEATURED_COLUMN = 2;

//     if (format.haveTime(logbird.format)) {
//         FEATURED_COLUMN++;
//     }

    for(var i = 0; i<10; i++) {
        var log = arr[i];

        /* Brief */
        if (kRegexpInputFormatBrief.test(log)) {
            numberOfColumn = 4 + FEATURED_COLUMN;
            return format.BRIEF;
        }

        /* Process */
        if (kRegexpInputFormatProcess.test(log)) {
            numberOfColumn = 3 + FEATURED_COLUMN;
            return format.PROCESS;
        }

        /* Tag */
        if (kRegexpInputFormatTag.test(log)) {
            numberOfColumn = 3 + FEATURED_COLUMN;
            return format.TAG;
        }

        /* Time */
        if (kRegexpInputFormatTime.test(log)) {
            numberOfColumn = 6 + FEATURED_COLUMN;
            return format.TIME;
        }

        /* Threadtime */
        if (kRegexpInputFormatThreadtime.test(log)) {
            numberOfColumn = 7 + FEATURED_COLUMN;
            return format.THREADTIME;
        }

        /* Long */
        if (kRegexpInputFormatLong.test(log)) {
            numberOfColumn = 7 + FEATURED_COLUMN;
            return format.LONG;
        }

        /* Kernel */
        if (kRegexpInputFormatKernel.test(log)) {
            numberOfColumn = 3 + FEATURED_COLUMN;
            return format.KERNEL;
        }

        /* Crash */
        if (kRegexpInputFormatCrash.test(log)) {
            numberOfColumn = 7 + FEATURED_COLUMN;
            return format.CRASH;
        }

        /* Syslog */
        if (kRegexpInputFormatSyslog.test(log)) {
            numberOfColumn = 6 + FEATURED_COLUMN;
            return format.SYSLOG;
        }
   }

    numberOfColumn = 1 + FEATURED_COLUMN;
    return format.RAW;
}

function validateTag(tag) {
    var valid = tag.trim();
    return (valid == "") ? ".unknown" : valid;
}

function wrapTag(tag) { // FIXME
    var maxTagLength = logbird.settings.maxTagLength;

    if (tag.length < (maxTagLength+2))
        return tag;

    var tmp = tag.substring(0, (maxTagLength/2));
    tmp += '...';
    tmp += tag.substring(tag.length-(maxTagLength/2), tag.length);
    return tmp;
}

function priorityToString(priority) {
    if (!priority) {
        return "verbose";
    }

    p = priority.toLowerCase();

    if (p == "v" || p == "verbose") return "verbose";
    if (p == "d" || p == "debug" || p == "notice") return "debug";
    if (p == "i" || p == "info") return "info";
    if (p == "w" || p == "warn" || p == "warning") return "warning";
    if (p == "e" || p == "err" | p == "error") return "error";
    if (p == "f" || p == "fatal") return "fatal";
    return "";
}

function kPriorityToString(priority) {
    // KERN_EMERG
    if (priority == 0)
        return "fatal";

    // KERN_ALERT, KERN_CRIT, KERN_ERR
    if (priority == 1 || priority == 2 || priority == 3)
        return "error";

    // KERN_WARNING
    if (priority == 4)
        return "warning";

    // KERN_NOTICE
    if (priority == 5)
        return "info";

    // KERN_INFO
    if (priority == 6)
        return "debug"

    // KERN_DEBUG
    return "verbose"
}


function parseLog(inputFormat, entry) {
    switch (inputFormat) {
        case format.BRIEF:
            return parseBriefLog(entry);
        case format.PROCESS:
            return parseProcessLog(entry);
        case format.TAG:
            return parseTagLog(entry);
        case format.TIME:
            return parseTimeLog(entry);
        case format.THREADTIME:
            return parseThreadtimeLog(entry);
        case format.LONG:
            return parseLongLog(entry);
        case format.CRASH:
            return parseCrashLog(entry);
        case format.KERNEL:
            return parseKernelLog(entry);
        case format.SYSLOG:
            return parseSyslogLog(entry);
        case format.RAW:
        default:
            return parseRawLog(entry);
    }
}

function parseBriefLog(log) {
    var match = kRegexpInputFormatBrief.exec(log);

    if (match != null && match.length) {
        var priority = match[1];
        var tag = validateTag(match[2]);
        var pid = match[3].trim();
        var msg = match[4];

        return { type: "log", priority: priority, tag: tag, pid: pid, msg: msg };
    } else {
        return { type: "waif", msg: log };
    }
}

function parseProcessLog(log) {
    var match = kRegexpInputFormatProcess.exec(log);

    if (match != null && match.length) {
        var priority = match[1];
        var pid = match[2].trim();
        var msg = match[3];
        var tag = validateTag(match[4]);

        return { type: "log", priority: priority, tag: tag,  pid: pid, msg: msg };
    } else {
        return { type: "waif", msg: log };
    }
}

function parseTagLog(log) {
    var match = kRegexpInputFormatTag.exec(log);

    if (match != null && match.length) {
        var priority = match[1];
        var tag = validateTag(match[2]);
        var msg = match[3];

        return { type: "log", priority: priority, tag: tag, msg: msg };
    } else {
        return { type: "waif", msg: log };
    }
}

function parseRawLog(log) {
    return { type: "log", msg: log };
}

function parseTimeLog(log) {
    var match = kRegexpInputFormatTime.exec(log);

    if (match != null && match.length) {
        var data = match[1];
        var time = match[2];
        var priority = match[3];
        var tag = validateTag(match[4]);
        var pid = match[5].trim();
        var msg = match[6];

        return { type: "log", data: data, time: time, priority: priority, tag: tag, pid: pid, msg: msg };
    } else {
        return { type: "waif", msg: log };
    }
}

function parseThreadtimeLog(log) {
    var match = kRegexpInputFormatThreadtime.exec(log);

    if (match != null && match.length) {
        var data = match[1];
        var time = match[2];
        var pid = match[3].trim();
        var tid = match[4].trim();
        var priority = match[5];
        var tag = validateTag(match[6]);
        var msg = match[7];

        return { type: "log", data: data, time: time,  pid: pid,  tid: tid, priority: priority, tag: tag, msg: msg };
    } else {
        return { type: "waif", msg: log };
    }
}

function parseLongLog(log) {
    // TODO
    return { type: "log", msg: log };
}

function parseCrashLog(log) {
    var match = kRegexpInputFormatCrash.exec(log);

    if (match != null && match.length) {
        var priority = match[1];
        var time = match[2];
        var pid = match[3].trim();
        var tid = match[4].trim();
        var tag = validateTag(match[5]);
        var msg = match[6];

        return { type: "log", priority: priority, time: time, pid: pid, tid: tid, tag: tag, msg: msg };
    } else {
        return { type: "waif", msg: log };
    }
}

function parseKernelLog(log) {
    var match = kRegexpInputFormatKernel.exec(log);

    if (match != null && match.length) {
        var priority = match[1];
        var time = match[2];
        var msg = match[3];

        return { type: "log", priority: priority, time: time, msg: msg };
    } else {
        return { type: "waif", msg: log };
    }
}

function parseSyslogLog(log) {
    var match = kRegexpInputFormatSyslog.exec(log);
    var kRegexpTagWithProcess = new RegExp("^(.+)\\[(\\d+)\\]$");

    if (match != null && match.length) {
        var data = match[1] + "-" +  match[2] + "-" + match[3];
        var time = match[4] + ":" + match[5] + ":" + match[6] + "." + match[7];

        var priority = match[8];
        var tag = validateTag(match[9]);
        var msg = match[10];
        var pid = "kernel";

        if (kRegexpTagWithProcess.test(tag)) {
            var tagMatch = kRegexpTagWithProcess.exec(tag);

            if (tagMatch != null && tagMatch.length) {
                tag = tagMatch[1];
                pid = tagMatch[2];
            }
        } else {
            msg = msg.replace(/(^\[ +\d+\.\d+\] )/mg, "");

            // Always assume the first word in kernel is tag ...
            var kRegexpKernelSyslog = new RegExp("^([0-9a-zA-Z\\-_:\\[\\]]+) +(.*)$");
            // ... or not - only these with : after word without spaces
            //var kRegexpKernelSyslog = new RegExp("^([0-9a-zA-Z_]+): +(.*)$");
            var kMatch = kRegexpKernelSyslog.exec(msg);

            if (kMatch != null && match.length) {
                tag = validateTag(kMatch[1].replace(/[\[\]:]/mg, ""));
                msg = kMatch[2];
            }
        }

        return { type: "log", priority: priority[0], data: data, time: time, pid: pid, tag: tag, msg: msg };
    } else {
        return { type: "waif", msg: log };
    }
}

function onClickPriority(name, visable) {
    if (visable) {
        hidePriority(name);
        $("#label-" + name).removeClass("success").addClass("default");
        processTimeDiff();
        return false;
    } else {
        showPriority(name);
        $("#label-" + name).removeClass("default").addClass("success");
        processTimeDiff();
        return true;
    }
}

function showPriority(prio) {
    var perf = new DebugTimer("showPriority(" + prio + ")");
    perf.start();
    logbird.priority[prio].show();
    perf.stop();
}

function hidePriority(prio) {
    var perf = new DebugTimer("hidePriority(" + prio + ")");
    perf.start();
    logbird.priority[prio].hide();
    perf.stop();
}

function showTag(name) {
    var perf = new DebugTimer("showTag(" + name + ")");
    perf.start();

    for (var i=0, l=logbird.tags.length; i<l; i++) {
        var tag = logbird.tags[i];
        if (tag.name == name) {
            tag.show();
            break;
        }
    }

    $('.label.tag[data-tag="' + name + '"]').removeClass("default").addClass("success");
    perf.stop();
}

function hideTag(name) {
    var perf = new DebugTimer("hideTag(" + name + ")");
    perf.start();

    for (var i=0, l=logbird.tags.length; i<l; i++) {
        var tag = logbird.tags[i];
        if (tag.name == name) {
            tag.hide();
            break;
        }
    }

    $('.label.tag[data-tag="' + name + '"]').removeClass("success").addClass("default");
    perf.stop();
}

function showAllTags() {
    var perf = new DebugTimer("showAllTags()");
    perf.start();

    for (var i=0, l=logbird.tags.length; i<l; i++) {
        logbird.tags[i].show();
    }

    $("#htmlTagList .label.tag").removeClass("default").addClass("success");
    perf.stop();

    // Update Time
    processTimeDiff();
}

function hideAllTags() {
    var perf = new DebugTimer("hideAllTags()");
    perf.start();

    for (var i=0, l=logbird.tags.length; i<l; i++) {
        logbird.tags[i].hide();
    }

    $("#htmlTagList .label.tag").removeClass("success").addClass("default");
    perf.stop();

    // Update Time
    processTimeDiff();
}

function displayOnlyTag(name) {
    $("tr[data-tag!='" + name + "']").toggleClass('hide', true);
    $('.label.tag[data-tag!="' + name + '"]').removeClass("success").addClass("default");
}

function showProcess(pid) {
    var perf = new DebugTimer("showProcess(" + pid + ")");
    perf.start();

    for (var i=0, l=logbird.process.length; i<l; i++) {
        if (pid == logbird.process[i].pid) {
            logbird.process[i].show();
            break;
        }
    }

    $('#htmlPidList [data-pid="' + pid + '"]')
        .removeClass("default")
        .addClass("success");

    perf.stop();
}

function hideProcess(pid) {
    var perf = new DebugTimer("hideProcess(" + pid + ")");
    perf.start();

    for (var i=0, l=logbird.process.length; i<l; i++) {
        if (pid == logbird.process[i].pid) {
            logbird.process[i].hide();
            break;
        }
    }

    $('#htmlPidList [data-pid="' + pid + '"]')
        .removeClass("success")
        .addClass("default");

    perf.stop();
}

function showAllProcess() {
    var perf = new DebugTimer("showAllProcess()");
    perf.start();

    for (var i=0, l=logbird.process.length; i<l; i++) {
        logbird.process[i].show();
    }

    $('#htmlPidList .label.pid').removeClass("default").addClass("success");
    perf.stop();

    // Update Time
    processTimeDiff();
}

function hideAllProcess() {
    var perf = new DebugTimer("hideAllProcess()");
    perf.start();

    for (var i=0, l=logbird.process.length; i<l; i++) {
        logbird.process[i].hide();
    }

    $('#htmlPidList .label.pid')
        .removeClass("success")
        .addClass("default");

    perf.stop();

    // Update Time
    processTimeDiff();
}

var tagRegexInputChangePending = false;
var timeValueInputChangePending = false;

function onTagRegexInputChange(object) {
    if (tagRegexInputChangePending) {
        console.log("onTagRegexInputChange pending!");
        return;
    }
    tagRegexInputChangePending = true;

    var tags = $(html.tagList).find('.tag');

    if (object.value == "") {
        show(tags);
        tagRegexInputChangePending = false;
        return;
    }

    var pattern = new RegExp(object.value, "i");

    for (var i=0, l=tags.length; i<l; ++i) {
        if (pattern.test($(tags[i]).data('tag'))) {
            show(tags[i]);
        } else {
            hide(tags[i]);
        }
    }

    tagRegexInputChangePending = false;
}

function onTimeValueChange(object) {
    if (timeValueInputChangePending) {
        console.log("onTimeValueChange pending!");
        return;
    }
    timeValueInputChangePending = true;

    if (object.value == "") {
        return;
    }

    console.log(object.value);
    logbird.settings.time.limes = object.value;

    timeValueInputChangePending = false;
}

function onTimeSecOnlyClick(event) {
    logbird.settings.time.secondsOnly =
            $(menu.timeSeconly).is(":checked");
}

function abortRead() {
    reader.abort();
}

var uploader = {
    isBrowserSupportFile : function() {
        return window.File;
    },

    isBrowserSupportFileReader : function() {
        return window.FileReader;
    },

    isBrowserSupportFileList : function() {
        return window.FileList;
    },

    isBrowserSupportBlob : function() {
        return window.Blob;
    },

    isBrowserSupportFileApi : function() {
        return this.isBrowserSupportFileReader();
    },

    onBrowse : function() {
        $("#file").click();
    },

    onSubmit : function() {
        if (!this.isBrowserSupportFileApi()) {
            logbird.output.sendError("Error!", "The File APIs are not fully supported in this browser.");
            return;
        }

        startTimer();

        reader = new FileReader();

        reader.onerror = function errorHandler(evt) {
            switch(evt.target.error.code) {
                case evt.target.error.NOT_FOUND_ERR:
                    logbird.output.sendError('Error!', 'File "' + fileName + '" not found!');
                    break;
                case evt.target.error.NOT_READABLE_ERR:
                    logbird.output.sendError('Error!', 'File "' + fileName + '" is not readable');
                    break;
                case evt.target.error.ABORT_ERR:
                    logbird.output.sendError('Error!', 'Cannot abort file "' + fileName + '!');
                    break; // noop
                default:
                    logbird.output.sendError('Error!', 'An error occurred reading "' + fileName + '".');
            };
        };

        reader.onabort = function(e) {
            logbird.output.sendError("Error!", "File read cancelled");
        };

        reader.onloadstart = function(e) {
            logbird.progress.show();
        };

        reader.onload = function(evt) {
            // Ensure that the progress bar displays 100% at the end.
            setTimeout(logbird.progress.hide(), 3000);

            onFileUpload(evt);
        };

        reader.readAsText(file);
    },

    onFileChange : function(files) {
        file = files[0];
        fileName = escape(file.name);
        fileSize = file.size;
        fileType = file.type ? file.type : 'n/a';
        fileLastModifiedDate = file.lastModifiedDate ? file.lastModifiedDate.toLocaleDateString() : 'n/a';
        var fileError = "";

        var supported = true;
        var supportedClass = '';

        if (fileName == "file") {
            return;
        }

        if (fileAllowedTypes.indexOf(fileType) < 0) {
            supported = false;
            fileError = "NOT_SUPPORTED";
        }

        if (fileSize > fileMaxSize) {
            supported = false;
            fileError = "MAX_SIZE";
        }

        if (supported) {
            console.log(file);
        } else {
            supportedClass = 'error';
            file = undefined;
        }

        var html = new Array();
        html.push('<div class="file-record ', supportedClass, '">',
                    '<button class="file-record-close" aria-hidden="true">&times;</button>',
                    '<div class="file-record-name">', fileName, '</div>',
                    '<div class="file-record-size">', fileSize, ' bytes</div>',
                    '<div class="file-record-mime">', fileType, '</div>',
                    '<div class="file-record-error">', fileError, '</div>',
                    '</div>');

        $("#htmlInputfiles").html(html.join(''));
        $(section.files).css('background-image', 'none');

        $('#htmlInputfiles .close').click(function() {
            var parent = $(this).parent();
            parent.remove();
            file = undefined;
            logbird.reset();
        });
    },
};

function prepareContext() {
    document.oncontextmenu = function() { return false; };

    context.init({
        fadeSpeed: 200,
        compress: true,
        preventDoubleContext: false
    });

    $("table").delegate('tr', 'mousedown', function(event) {
        var contextSubmenuBody = [];

        if( event.button == 2 ) { 
            if (format.haveTag(logbird.format)) {
                var tag = $(this).data('tag');
                contextSubmenuBody.push({
                    header: '<b><span class="glyphicon glyphicon-tag"></span> ' + tag + '</b>'
                },{
                    text: 'Hide all',
                    action: function(e) {
                        e.preventDefault();
                        hideTag(tag);
                        processTimeDiff();
                    }
                },{
                    text: 'Show only this',
                    action: function(e) {
                        e.preventDefault();
                        displayOnlyTag(tag);
                        processTimeDiff();
                    }
                },{
                    header: '<b><span class="glyphicon glyphicon-file"></span> Blacklist</b>'
                },{
                    text: "Add to BlackList",
                    action: function(e) {
                        e.preventDefault();
                        blacklist.add(tag);
                        hideTag(tag);
                        processTimeDiff();
                    }
                });
            }

            if (format.havePID(logbird.format)) {
                var pid = $(this).data('pid');
                contextSubmenuBody.push({
                    header: '<b><span class="glyphicon glyphicon-align-justify"></span> PID ' + pid + '</b>'
                },{
                    text: 'Hide all',
                    action: function(e) {
                        e.preventDefault();
                        hideProcess(pid);
                        processTimeDiff();
                    }
                });
            }

            if (format.haveTID(logbird.format)) {
                var tid = $(this).data('tid');
                // TODO
            }

            if (format.haveTime(logbird.format)) {
                var self = $(this);
                var time = self.data('time');

                contextSubmenuBody.push({
                    header: '<b><span class="glyphicon glyphicon-time"></span> Checkpoints</b>'
                },{
                    text: 'Set Checkpoint A',
                    action: function(e) {
                        e.preventDefault();
                        CheckpointManager.setCheckpointA(time, self);
                    }
                },{
                    text: 'Set Checkpoint B',
                    action: function(e) {
                        e.preventDefault();
                        CheckpointManager.setCheckpointB(time, self);
                    }
                });
            }

            if (contextSubmenuBody.length == 0) {
                return;
            }

            context.attach($(this), contextSubmenuBody);
        }

        context.destroy($(this));
    });
}

function setListeners() {
    $(menu.home).click(function() {
        logbird.reset();
    });

    $(html.button.browse).click(function() {
        uploader.onBrowse();
    });

    $(html.button.submit).click(function(){
        uploader.onSubmit();
    });

    $("#file").change(function() {
        uploader.onFileChange($(this));
    });

    function handleFileSelect(evt) {
        uploader.onFileChange(evt.target.files);
    }

    document.getElementById('file')
            .addEventListener('change', handleFileSelect, false);

    // TAG Search
    $('#htmlTagRegex').bind('input', function() {
        onTagRegexInputChange(this);
    });

    $('#htmlTagRegexClear').click(function() {
        document.getElementsByName('htmlTagRegex')[0].value='';
        $('#htmlTagList .tag').show();
    });

    // Time value change
    $(menu.timeValue).bind('input', function() {
        onTimeValueChange(this);
    });

    $(menu.timeSeconly).click(function(event){
        onTimeSecOnlyClick(event);
    });

    // Back To Top Click
    $(html.backToTop).click(function() {
        $('html, body').animate({ scrollTop:0 }, '800');
        return false;
    });

    $('#settings-avoid-empty-lines').click(function() {
        logbird.settings.avoidEmptyLines = $(this).is(":checked");
    });

    $(menu.timeUpdate).click(function() {
        processTimeDiff();
    });
}

function routeF5() {
    $(document).bind("keydown", function(e) {
        if ((e.which || e.keyCode) == 116) {
            e.preventDefault();
            logbird.reset();
        }
    });
}

function onScrollEvents() {
    $(window).scroll(function() {
        if($(window).scrollTop() > 250) {
            $(html.backToTop).fadeIn(200);
            if (!onMainScreen) {
                $(html.loadTime).fadeOut(200);
            }
        } else {
            $(html.backToTop).fadeOut(200);
            if (!onMainScreen) {
                $(html.loadTime).fadeIn(200);
            }
        }
    });
}

function loadParameters() {
//     menu.timeValue.value = logbird.settings.time.limes;
}

(function( $ ) {
    $.initialize = function() {
        dialog.init();
        blacklist.init();
        setListeners();
        prepareContext();
        loadParameters();
        onScrollEvents();
        updateTooltips();
//         if (!inDevMode)
//             routeF5();
    };
})( jQuery );

$(document).ready($.initialize);
