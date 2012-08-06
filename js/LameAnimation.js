function LameAnimation(targetElement) {
    // Public vars
	this.targetElement = targetElement || null;
	this.canvas = null;
	this.reverseCanvas = null;
	
	DominatorAnimation.call(this, targetElement);
	
	// Private vars
	var that  = this;
	
	// Public functions
	this.init = function() 
	{		
		// Create canvas and add it
		canvas = document.createElement('canvas');
		$(targetElement).prepend(canvas);
		ctx = canvas.getContext("2d");
		
		this.draw();
	}
		
	this.draw = function() 
	{
		ctx.fillStyle="#FF0000";
		ctx.fillRect(0,0,150,75);
	}
	
	this.update = function() 
	{
		console.log("Lame Animation update");
	}	
}