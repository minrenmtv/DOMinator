// DOMinator
// Building your page elements in the browser like a hallucinogenic dream.s

;(function($) {

    $.dominator = function(el, options) {

        var defaults = {
            concurrentBuilds: 2,
            onSomeEvent: function() {}
        };

        var plugin = this;

        plugin.settings = {};

        var init = function() {
            plugin.settings = $.extend({}, defaults, options);
            plugin.el = el;
            plugin.settings.currentBuilds = 0;      //Current Number of Builds Occuring
            plugin.settings.buildOrderArray = [];   //Array to hold Elements to Build

            el.children().css('display', 'none');   //hide each element on load
            el.children().each(function(){
                plugin.settings.buildOrderArray.push($(this)); //Add Element to the end of the array to build
            });
            //commence the building
            for (var i = 0; i < plugin.settings.concurrentBuilds; i++) {   //loop the number of times
                buildMe(plugin.settings.buildOrderArray.shift());           //initiate building chain
            }
            
        };

        plugin.foo_public_method = function() {
            // code goes here
        };
        
        //buildMe function - private
        var buildMe = function(el) {
            if (plugin.settings.currentBuilds < plugin.settings.concurrentBuilds) {     //if there are fewer current builds than total builds
                plugin.settings.currentBuilds ++;
                el.slideDown(function(){triggerNextEl();});}
        };

        //callBack after element is done building - private
        var triggerNextEl = function(){
            if (plugin.settings.currentBuilds > 0) {        //Subtract from current build tracker
                plugin.settings.currentBuilds--;
            }
            
            if (plugin.settings.buildOrderArray.length > 0) {           //If there are any left in the array...
                buildMe(plugin.settings.buildOrderArray.shift());       //Build the next one
            }
        };
        init();

    };

})(jQuery);
