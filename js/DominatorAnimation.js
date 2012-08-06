function DominatorAnimation(targetElement) {
    // Public vars
	this.targetElement = targetElement || null;
	
	// Private vars
	var that  = this;
	
	// Public functions
	this.update = function() 
	{
		console.log("update function from DominatorAnimation class");
	}	
}

window.requestAnimFrame = (function(){
	return  window.requestAnimationFrame       ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame    ||
			window.oRequestAnimationFrame      ||
			window.msRequestAnimationFrame     ||
			function( callback ){
			  window.setTimeout(callback, 1000 / 60);
			};
})();

/*

BASED ON CLOSURE METHOD;
http://stackoverflow.com/questions/1595611/how-to-properly-create-a-custom-object-in-javascript#1598077

function Shape(x, y) {
    var that= this;

    this.x= x;
    this.y= y;

    this.toString= function() {
        return 'Shape at '+that.x+', '+that.y;
    };
}*/