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
            el.children().each(function(){
               //hasPosition Fix:
               //if no absolute position, apply relative to ensure element hasPosition
                if ($(this).css('position') != 'absolute'){
                    $(this).css('position', 'relative');
                }

                //Create a placeholder div.  This container will lay over the element in the DOM and reserve position.
                $(this).wrap('<div></div>');  //create the wrapper with a unique ID
                $(this).parent()
                    .width($(this).width())
                    .height($(this).height())
                    .css({
                        position:$(this).css('position'),
                        float:$(this).css('float'),
                        margin:$(this).css('margin'),
                        padding:$(this).css('padding')
                    });

                $(this).css({margin:0,padding:0});  //Remove Margin and Padding from child
                $(this).css('display', 'none');   //hide each element on load

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
                animateBuild(el, triggerNextEl);
           }
                
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

        //animation function for the element
       var animateBuild = function(el, callback){

                //Throw the animation sprites
                el.parent().append("<div style='position:absolute;left:0;top:"+el.css('margin-top')+";background-color:green;width:30px;height:30px;'></div>");
                el.parent().append("<div style='position:absolute;right:"+el.css('margin-right')+";top:"+el.css('margin-top')+";background-color:green;width:30px;height:30px;'></div>");
                el.parent().append("<div style='position:absolute;bottom:"+el.css('margin-bottom')+";right:"+el.css('margin-right')+";background-color:green;width:30px;height:30px;'></div>");
                el.parent().append("<div style='position:absolute;bottom:"+el.css('margin-bottom')+";left:"+el.css('margin-left')+";background-color:green;width:30px;height:30px;'></div>");
                el.slideDown(function(){callback()});     //Basic Slide Down

        };

        init();

    };

})(jQuery);
