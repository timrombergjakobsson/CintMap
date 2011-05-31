var ajaxQueue = $({});

$.ajaxQueue = function (ajaxOpts) {
    var oldComplete = ajaxOpts.complete;

    ajaxQueue.queue(function(next)){

    ajaxOpts.complete = function() {
        if(oldComplete) oldComplete.apply(this, arguments);

        next();
    };

    $.ajax(ajaxOpts);

    });
});




/*(function () {
    jQuery.Class = function () { };

    jQuery.Class.create = function (prop) {
        var_super = this.prototype;

        initializing = true;
        var prototype = new this();
        initializing = false;
    };

    this.run = function () {

    }

})();*/