function MarioAnimation(targetElement) {
  	// Public vars
	this.targetElement = targetElement || null;
	this.canvas = null;
	this.reverseCanvas = null;
	
	DominatorAnimation.call(this, targetElement);
	
	// Private vars
	var that  = this;
	var _baseUpdate = this.update;
	var img;
	var frameWidth = 80, frameHeight = 64;
	var parentWidth, parentHeight;
	var ctx;
	var xpos = 0, ypos, xspeed = 0, yspeed = 0, yvel = 0;
	var imageReady = false, flipped = false;
	var currentFrame = 0, lastUpdateTime = 0, acDelta = 0;
	var currentAnimation, standingCounter = 0, standingCounterStart = 0, cornerHits = 0, edgePadding = 100;
	var currentState = 0, previousState = 0, destinationLocation = 0, travelSpeed = 10, terminalVelocity = 10;
	
	// Character states:
	const WALKING = 0;
	const STANDING = 1;
	const JUMPING = 2;
	
	const GRAVITY = 0.5;
	
	// Locations
	const NW = 0;
	const NE = 1;
	const SE = 2;
	const SW = 3;
	
	// Animations (in the format [animation frame, duration])
	var standAndSwingHammer = [[1,50], [4, 50]];
	var walkAndSwingHammer = [[0,20], [1,40], [2,20], [3,40], [4,20], [5,40]];
	var jumpAnimation = [[6, 1]];
		
	// Public functions
	this.init = function() 
	{
		// Create image and load it
		img = new Image();
		img.src = "/dominator/images/mario_dk_2x.png";
		img.onload = this.createReverseImage();
		
		// Explicitly make the target element position relatively
		// NOTE: this could break the page. Maybe we should consider wrapping it in a parent container? 
		$(targetElement).css({"position":"relative"});
		
		// Calculate parent w, h:
		parentWidth = parseInt($(targetElement).css('width').replace('px', ''));
		parentHeight = parseInt($(targetElement).css('height').replace('px', ''));
		var canvasWidth = (parentWidth + 2*edgePadding);
		var canvasHeight = (parentHeight + 2*edgePadding);
		
		// Create canvas element for this animation and add it
		$(targetElement).before("<canvas></canvas>");
		canvas = $(targetElement).prev()[0];
		$(canvas).css({"position":"absolute", "zIndex":1000}).prop("width", canvasWidth).prop("height", canvasHeight);
		ctx = canvas.getContext("2d");
		
		// Animation specific defaults.
		// TO DO: Move into an init Object?
		imageReady = true;
		yvel = 10;
		xspeed = this.calculateJumpSpeed();
		ypos = 0;	
		destinationLocation = NE;
		currentAnimation = jumpAnimation;
		currentState = JUMPING;
		
		//this.draw();
	}
		
	this.draw = function() 
	{
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		if (imageReady) {
			ctx.save();
			
			if (flipped == true) {
				ctx.drawImage(reverseCanvas, (((img.width/frameWidth)-1) - currentAnimation[currentFrame][0])*frameWidth, 0, frameWidth, frameHeight, xpos, ypos, frameWidth, frameHeight);
			} else {
				ctx.drawImage(img, currentAnimation[currentFrame][0]*frameWidth, 0, frameWidth, frameHeight, xpos, ypos, frameWidth, frameHeight);
			}
			
			ctx.restore();
		}
		//ctx.drawImage(img, currentAnimation[currentFrame][0]*frameWidth, 0, frameWidth, frameHeight, xpos, ypos, frameWidth, frameHeight);
		//ctx.drawImage(img, frameWidth, 0, frameWidth, frameHeight, 0, 0, frameWidth, frameHeight);
	}
	
	this.start = function()
	{
		requestAnimFrame(this.update);
	}
	
	this.createReverseImage = function() {
		reverseCanvas = document.createElement('canvas');
		reverseCanvas.width = img.width;
		reverseCanvas.height = img.height;
		var rctx = reverseCanvas.getContext("2d");
		rctx.save();
		rctx.translate(img.width, 0);
		rctx.scale(-1, 1);
		rctx.drawImage(img, 0, 0);
		rctx.restore();
		//loaded();
		
	}
	
	this.update = function() 
	{
		requestAnimFrame(that.update);
		
		var delta = Date.now() - lastUpdateTime;
		
		// Determine if animation needs to be updated. 
		// acDelta stands for "accumulated delta", where delta is the amount of time elapsed since the previous call to update(). 
		
		if (acDelta > currentAnimation[currentFrame][1]) {
			acDelta = 0;
			that.draw();
			
			previousState = currentState;
			
			// Advance animation. If flipped, we need to get the opposite frame.
			if (flipped == false) {
				currentFrame--;
				if (currentFrame < 0) currentFrame = (currentAnimation.length - 1);
			} else {
				currentFrame++;
		  if (currentFrame >= currentAnimation.length) currentFrame = 0;
			}
			
		} else {
			acDelta += delta;
		}
		
		// State Handling
		
		// State WALKING
		if (currentState == WALKING) {
			xpos += xspeed;
			ypos += yspeed;
			
			if (that.arrivedAtDestination() == true) {
				currentFrame = 0;
				currentAnimation = standAndSwingHammer;
				currentState = STANDING;
				xspeed = yspeed = 0;
			}
		}
		
		// STATE STANDING
		if (currentState == STANDING) {
			if (previousState == WALKING || previousState == JUMPING) {
				standingCounterStart = Date.now();
				cornerHits = 0;
			}
			standingCounter += delta;
			if (standingCounter > 500) { 
				flipped = !flipped;
				cornerHits++;
				standingCounter = 0;
			}
			if (cornerHits > 4) {
				currentState = WALKING;
				currentAnimation = walkAndSwingHammer;
				switch (destinationLocation) {
					case NE:
						xspeed = 0; yspeed = travelSpeed; break;
					case SE:
						xspeed = -travelSpeed; yspeed = 0; break;
					case SW:
						xspeed = 0; yspeed = -travelSpeed; break;
					case NW:
						xspeed = that.calculateJumpSpeed(); 
						yspeed = 0; 
						currentState = JUMPING; 
						currentFrame = 0; 
						currentAnimation = jumpAnimation; 
						yvel = 10; 
						break;
				}
				destinationLocation += 1;
				if (destinationLocation > 3) destinationLocation = 0;
				
				// Handle flipping of Mario for edge cases:
				if (destinationLocation == 0 || destinationLocation == 3) 
					flipped = true;
				else
					flipped = false;		
			}
		}
		
		// STATE JUMPING
		if (currentState == JUMPING) {
			xpos += xspeed;
			yvel -= GRAVITY;
			
			if(yvel < -terminalVelocity) {
				yvel = -terminalVelocity;
				currentState = STANDING;
				currentAnimation = standAndSwingHammer;
			}
			ypos -= yvel;
			
			/*if (arrivedAtDestination() == true) {
				currentFrame = 0;
				currentAnimation = standAndSwingHammer;
				currentState = STANDING;
				xspeed = yspeed = 0;
			}*/
		}
		
		lastUpdateTime = Date.now();
	}
	
	this.calculateJumpSpeed = function() {	
		return parentWidth / 40; // 40 is the number of steps per jump animation.
	}
	
	this.arrivedAtDestination = function () {
		switch (destinationLocation) {
			case NE:
				if ((xpos >= parentWidth) && (ypos <= edgePadding)) 
					return true;
			case SE:
				if ((xpos >= parentWidth) && (ypos >= parentHeight)) 
				return true;
			case SW:
				if ((xpos <= edgePadding) && (ypos >= parentHeight)) 
				return true;
			case NW:
				if ((xpos <= edgePadding) && (ypos <= edgePadding)) 
				return true;
		}
		return false;
	}
	 
	this.currentStateAsString = function () {
		switch (currentState) {
			case 0: return "walking"; break;
			case 1: return "standing"; break;
			case 2: return "jumping"; break;
		}
		return "undefined state";
	}
}

/*
BASED ON CLOSURE METHOD;
http://stackoverflow.com/questions/1595611/how-to-properly-create-a-custom-object-in-javascript#1598077

function Circle(x, y, r) {
    var that= this;

    Shape.call(this, x, y);
    this.r= r;

    var _baseToString= this.toString;
    this.toString= function() {
        return 'Circular '+_baseToString(that)+' with radius '+that.r;
    };
};
*/