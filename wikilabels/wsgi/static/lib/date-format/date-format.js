(function(){
    // For convenience...
    Date.prototype.format = function (mask, utc) {
        return strftime(mask, this);
    };

})();
