// File: mariodk.js
// Description: Animates mario graphic around the corners of a parent DOM element, playfully "building" out the element.
// Author: Alex Baker

// WAYYYYYY TOO MANY VARS HERE 
var canvas = null, reverseCanvas = null, img = null, ctx = null, imageReady = false, flipped = false, xpos = 0, ypos, xspeed = 0, yspeed = 0, yvel = 0, parentWidth, parentHeight;

var currentFrame = 0, lastUpdateTime = 0, acDelta = 0,  frameWidth = 80, frameHeight = 64, currentAnimation, standingCounter = 0, standingCounterStart = 0, cornerHits = 0, edgePadding = 100;
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

function onload() {
  canvas = document.getElementById('gameCanvas');
  parentWidth = $(canvas).parent().css('width').replace('px', '');
  parentHeight = $(canvas).parent().css('height').replace('px', '');
  
  ctx = canvas.getContext("2d");
  img = new Image();
  img.src = "/dominator/images/mario_dk_2x.png";
  img.onload = createReverseImage();
}

function createReverseImage() {
	reverseCanvas = document.createElement('canvas');
	reverseCanvas.width = img.width;
	reverseCanvas.height = img.height;
	var rctx = reverseCanvas.getContext("2d");
	rctx.save();
	rctx.translate(img.width, 0);
	rctx.scale(-1, 1);
	rctx.drawImage(img, 0, 0);
	rctx.restore();
	
	loaded();
}

function loaded() {
	imageReady = true;
	yvel = 10;
	xspeed = calculateJumpSpeed();
	ypos = 0;
	
	destinationLocation = NE;
	currentAnimation = jumpAnimation;
	currentState = JUMPING;
	
	redraw();
	requestAnimFrame(update);
}

function redraw() {
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
}

function update() {
	$('.state').html('State: ' + currentStateAsString());
	requestAnimFrame(update);
	
	var delta = Date.now() - lastUpdateTime;
	
	// Determine if animation needs to be updated. 
	// acDelta stands for "accumulated delta", where delta is the amount of time elapsed since the previous call to update(). 
	
	if (acDelta > currentAnimation[currentFrame][1]) {
		acDelta = 0;
		redraw();
		
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
		
		if (arrivedAtDestination() == true) {
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
					xspeed = calculateJumpSpeed(); yspeed = 0; currentState = JUMPING; currentFrame = 0; currentAnimation = jumpAnimation; yvel = 10; break;
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

function calculateJumpSpeed() {	
	return parentWidth / 40; // 40 is the number of steps per jump animation.
}

function arrivedAtDestination() {
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
 
function currentStateAsString() {
	switch (currentState) {
		case 0: return "walking"; break;
		case 1: return "standing"; break;
		case 2: return "jumping"; break;
	}
	return "undefined state";
}