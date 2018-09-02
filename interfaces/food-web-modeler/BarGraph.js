function BarGraph(ctx, ico, cw, bkgd) {
	// Private properties 
	var that = this;
	var icon;
	var ctx = ctx;
	var file = ico.file;
	var startArr;
	var endArr;
	var looping = false;
	var xOffset = 10;
	var yOffset = 0;
	var remove = false;
	var running = false;

	// Public properties 
	this.name = ico.name;
	this.width = 400;
	this.height = 80;	

	this.x = cw - this.width;	//cw = canvas width
	//this.y = 0;
	
	//console.log("BarGraph x: "+this.x+", y: "+this.y+"");
	this.maxValue = 1;
	this.margin = 1;
	this.colors = ["#333"];
	this.curArr = [];
	if ( bkgd == "light" ){
		this.backgroundColor = "#F5F5F5";//"#f1f2eb";		
	} else {
		this.backgroundColor = "#F2F4F7";//"#F5F5F5";//"#f1f2eb";		
	}
	//console.log("bkgd: "+ bkgd+", this.backgroundColor: "+this.backgroundColor);
	this.xAxisLabelArr = [];
	this.yAxisLabelArr = [];
	this.animationInterval = 100;
	this.animationSteps = 10;
	
	function setRunning(v){
		running = v;
	}
	this.getRunning = function(){
		return running;
	}

	function loadImage(){
		//console.log("file: "+file);
		icon = new Image();
		icon.onload = this.imageLoaded;
		icon.src = file;
	}

	this.imageLoaded = function() {
		this.loaded = true;
	}

	loadImage();

  	// Loop method adjusts the height of bar and redraws if neccessary
	var loop = function () {
	  var delta;
	  var animationComplete = true;

	  // Boolean to prevent update function from looping if already looping
	  looping = true;
	  
	  // For each bar
	  for (var i = 0; i < endArr.length; i += 1) {
		// Change the current bar height toward its target height
		delta = (endArr[i] - startArr[i]) / that.animationSteps;
		that.curArr[i] += delta;
		// If any change is made then flip a switch
		if (delta) {
		  animationComplete = false;
		}
	  }
	  // If no change was made to any bars then we are done
	  if (animationComplete) {
		looping = false;
	  } else {
  		// Draw and call loop again
		draw(that.curArr);
		setTimeout(loop, that.animationInterval / that.animationSteps);
	  }
	};
		
  	// Draw method updates the canvas with the current display
	var draw = function (arr) {		
		//console.log("BarGraph.draw invoked");
		var numOfBars = arr.length;
		var barWidth;
		var barHeight;
		var border = 0;//2;
		var ratio;
		var maxBarHeight;
		var gradient;
		var largestValue;
		var graphAreaX = 0;
		var graphAreaY = 0;
		var graphAreaWidth = that.width;
		var graphAreaHeight = that.height;
		var i;

		// Draw the background color
		ctx.fillStyle = that.backgroundColor;
		ctx.fillRect(that.x, yOffset, that.width, that.height);

		//Draw icon and make room
	  	//ctx.drawImage(icon, 4, yOffset+graphAreaHeight/2-10, 30, 30); //offset icon from top by 10px
	  	ctx.drawImage(icon, that.x+xOffset, yOffset+graphAreaHeight/2-10, 30, 30); //offset icon from top by 10px
	  	graphAreaWidth -= 40;
	  	graphAreaX = 50;
					
	  // If x axis labels exist then make room	
	  if (that.xAxisLabelArr.length) {
		graphAreaWidth -= 40;
	  }
				
	  // Calculate dimensions of the bar
	  barWidth = 1; //graphAreaWidth / numOfBars - that.margin * 2;
	  maxBarHeight = graphAreaHeight - 10; //- 25; 
				
	  // Determine the largest value in the bar array
	  var largestValue = 0;
	  for (i = 0; i < arr.length; i += 1) {
		if (arr[i] > largestValue) {
		  largestValue = arr[i];	
		}
	  }
	  
	  // For each bar
	  for (i = 0; i < arr.length; i += 1) {
		// Set the ratio of current bar compared to the maximum
		if (that.maxValue) {
		  ratio = arr[i] / that.maxValue;
		} else {
		  ratio = arr[i] / largestValue;
		}
		
		barHeight = ratio * maxBarHeight;

		// Draw bar
		ctx.fillStyle = "#333";
		//console.log("BarGraph x: "+that.x);
		ctx.fillRect(that.x + graphAreaX + that.margin + i * (graphAreaWidth-5) / numOfBars, //offset bars from right by 5 px
		  yOffset + graphAreaHeight - barHeight - 5, //offset bars from bottom by 5 px
		  barWidth,
		  barHeight);

		}
	};
	/*
	//Update the dimension of the canvas if graphs don't fit
	var redrawCanvas = function ( total ) {
		var totalGraphs = total;
		//console.log("totalGraphs: "+totalGraphs);
		//console.log("ctx.canvas.height: "+ctx.canvas.height);
		//console.log("that.height * totalGraphs: "+(that.height * totalGraphs));
		if ( ctx.canvas.height !== that.height * totalGraphs ){
			ctx.canvas.height = that.height * totalGraphs;
		}
	}
	*/
  
	// Loop method adjusts the height of bar and redraws if neccessary
	var append = function () {
		// Boolean to prevent append function from looping if already looping
	  	looping = true;
		var endLength = endArr.length;

		if( endLength > 0 ){
			that.curArr.push( endArr[0] );
			that.curArr.shift();
			endArr.shift();
			endLength = endArr.length;
		}
		if( endLength == 0 ){
			//last data point to be drawn
			looping = false;
			draw(that.curArr);
			setRunning(false);
		} else {
			//console.log("remove: "+remove);
			if(!remove){
				draw(that.curArr);
				setTimeout(append, 100);	//loops every 100 milliseconds, total time = 10s
			}
		}
		//console.log("append looping: "+looping);
		//console.log("curArr.length: "+that.curArr.length+", endArr.length: "+endArr.length);
	};

  	// Update method sets the end bar array and starts the animation
	this.update = function ( newArr, num ) {
		//var totalGraphs = parseInt(total);
		var id = num;
		yOffset = id * this.height;

	  // If length of target and current array is different 
	  if (that.curArr.length !== newArr.length) {
		that.curArr = newArr;
		draw(newArr);
	  } else {
		// Set the starting array to the current array
		startArr = that.curArr;
		// Set the target array to the new array
		endArr = newArr;
		// Animate from the start array to the end array
		if (!looping) {	
		  loop();
		}
	  }
	}; 

  	//Draws current array
	this.drawBarGraph = function ( num ) {
		var id = num;
		yOffset = id * this.height;
		draw(this.curArr);
	}
	//Replace new array at the end of old array
	this.replace = function ( newArr, num ){
		var id = num;
		if (!looping){
			yOffset = id * this.height;
			// Set the starting array to the current array
			startArr = that.curArr;
			// Set the target array to the new array
			endArr = newArr;
			//console.log("looping: "+looping);
			append();
			running = true;
		}
	}
	//Clear graph
	this.clearGraph = function(){
		//console.log("clearGraph");
		remove = true;
		running = false;
	}
}