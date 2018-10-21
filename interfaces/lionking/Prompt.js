function Prompt(context, x, y, cw, ch, l, bg){
	var canvasW = cw;
	var canvasH = ch;
	this.maxWidth = cw - x - 400 - 10;	//400 as size of graphs	//10 = padding

	var lineHeight = 22; //18;
	var breakHeight = 30; //25;
	var styleMarker = '§';
	// table code style --> font style
	var styleCodeToStyle = {
	    r: '',
	    i: 'italic',
	    b: 'bold',
	    l: 'lighter'
	};

	var promptsList = [
	   	{level:1,
		instruction:"Welcome to Level 1. Drag the species into the work area to get started.",
		connection:"You've created a food chain: §bLions eat zebras§r.<br>When this happens, the zebra gives energy to the lion.<br>Right now, the ‘population over time’ graphs (on the right) show that populations are stable.<br>Based on the food chain, what do you think happens to the §bzebra§r (prey) population if the §blion§r (predator) population goes §bup§r?<br>Click the 'up' button above the lion to make a prediction and find out.",
		continue1:"This is a direct predator-prey relationship. What if the §bzebra§r (prey) population goes §bup§r? What do you think happens to the §blion§r (predator) population?<br>Click the 'up' button above the zebra to make a prediction and find out.",
		continue2:"Now we’re going to look at what happens when species populations go §bdown§r.<br>If the §blion§r (predator) population goes §bdown§r, what happens to the zebra (prey) population?<br>Click the 'down' button below the lion to make a prediction and find out.",
		continue3:"What happens to the §blion§r population if the §bzebra§r (prey) population goes down?<br>Click the 'down' button below the zebra to make a prediction and find out.",
		continue4:"You've completed the first level! Click \u2192 (on the screen's lower left) to move on to the next level."
		},
		{level:2,
		instruction:"This is Level 2. Earlier you created a food chain and looked at predator and prey relationships. Here, you'll be examining §bcompetition§r relationships in an ecosystem.<br>Drag the species into the work area to get started.",
		connection:"Grass and acacia trees compete for space.<br>Click the 'up' button above the grass to make a prediction and find out what happens to the acacia tree population when the population of grass increases.",
		continue1:"When the population of grass goes up, the population of acacia trees go down. This is a direct competition relationship. Now, what happens when you §bincrease§r the population of §bacacia trees§r?<br>Click the 'up' button above the acacia tree to make a prediction and find out.",
		continue2:"Now let’s look at what happens when populations §bdecrease§r.<br>Click the 'down' button below the §bgrass§r to §bdecrease§r the its population.",
		continue3:"What do you think happens to the §bacacia tree§r population when the §bgrass§r population goes §bdown§r?<br>Click the 'down' button below the acacia tree to make a prediction and find out.",
		continue4:"You've completed level 2. Next, you will create more complex relationships with three and (later) four species<br>Click \u2192 to continue."
		},
		{level:3,
		instruction:"This is Level 3, where we will look at §bindirect§r relationships.<br>Drag the species into the work area to start.",
		connection:"Lions eat zebras and zebras eat grass. Click on the ‘up’ button above the lion to predict what happens to the zebra and grass populations.",
		continue1:"When one level of the trophic system is affected, all of the trophic levels below them are also affected. This is called a trophic cascade. They are powerful indirect interactions that can control entire ecosystems. What happens if the §bgrass§r (producer) population goes §bup§r? <br>Click the 'up' button above the grass to make a prediction and find out.",
		continue2:"Now we’re going to look at what happens when species populations §bdecrease§r.<br>If the §blion§r (predator) population goes §bdown§r, what happens?<br>Click the 'down' button below the lion to make a prediction and find out.",
		continue3:"What happens to the §blion§r population if the §bgrass§r population goes down?<br>Click the 'down' button below the grass to make a prediction and find out.",
		continue4:"Great work so far! Click \u2192 to continue."
		},
		{level:4,
		instruction:"You've reached Level 4. There are three species: lion, zebra, and leopard. Drag the species into the work area to start.",
		connection:"Both lions and leopards prey on zebras. Click on the ‘up’ button above the lion to predict what happens to the zebra and leopard populations.",
		continue1:"When two species share a common prey, it is also called §bresource competition§r. What happens if the §bleopard§r population goes §bup§r? <br>Click the 'up' button above the leopard to make a prediction and find out.",
		continue2:"If the §blion§r population goes §bdown§r, what happens to the leopard population?<br>Click the 'down' button below the lion to make a prediction and find out.",
		continue3:"Now, if the §bleopard§r population goes §bdown§r, what happens to the lion population?<br>Click the 'down' button below the leopard to make a prediction and find out.",
		continue4:"Level 4 is complete! Click \u2192 to continue."
		},		
		{level:5,
		instruction:"There are three species in Level 5: lion, zebra, and giraffe. Drag the species into the work area to start.",
		connection:"Lions prey on both zebras and giraffes. Click on the ‘up’ button above the zebra to predict what happens to the giraffe population.",
		continue1:"When two species share a common predator, it is also called §bapparent competition§r. What do you think happens if the §bgiraffe§r population goes §bup§r? <br>Click the 'up' button above the giraffe to make a prediction and find out.",
		continue2:"If the §bzebra§r population goes §bdown§r, what happens to the giraffe population?<br>Click the 'down' button below the zebra to make a prediction and find out.",
		continue3:"Now, if the §bgiraffe§r population goes §bdown§r, what happens to the zebra population?<br>Click the 'down' button below the leopard to make a prediction and find out.",
		continue4:"We've looked at a few different types of population effects so far: direct predator-prey, direct competition, trophic cascade, resource competition, and apparent competition. Next we'll look at indirect mutualism. Click \u2192 to continue."
		},
		{level:6,
		instruction:"This is Level 6. There are four species now: zebra, giraffe, grass and the acacia tree. Drag the species into the work area to start.",
		connection:"Zebras eat grass and giraffes eat the leaves on acacia trees. We also know that grass and acacia trees compete for space. How do they affect one another? Click on the ‘up’ button above the zebra to predict what happens.",
		continue1:"When two species have different prey that compete with each other, it is also called §bindirect mutualism§r. What do you think happens if the §bgiraffe§r population goes §bup§r? <br>Click the 'up' button above the giraffe to make a prediction and find out.",
		continue2:"If the §bzebra§r population goes §bdown§r, what happens to the giraffe population?<br>Click the 'down' button below the zebra to make a prediction and find out.",
		continue3:"Now, if the §bgiraffe§r population goes §bdown§r, what happens to the zebra population?<br>Click the 'down' button below the leopard to make a prediction and find out.",
		continue4:"You're almost done! Click \u2192 to continue."
		},
		{level:7,
		instruction:"This is Level 7. There are five species now: lion, zebra, giraffe, grass and the acacia tree. Drag the species into the work area and try creating more complex food webs.",
		connection:"Continue changing and predicting all of the species’ populations in the food web.",
		continue1:"When you've changed each of the species’ populations and correctly predicted all of the populations changes in the food web, congratulations, you’re done! Keep exploring until you're confident about your predictions. Feel free go back and try previous levels again if you like."
		}
	];

	this.level = l;
	this.ctx = context;
	this.name = "prompt";
	this.x = x;
	this.y = y;
	this.height = 100;	//need x, y, height and width properties to be same as graphs and mouse to detect mouse up
	this.width = this.ctx.canvas.width; 
	this.message = "" ;
	this.EVENT_CLICKED = "clicked";	
	
	var background = bg;
	var textColour;
	var itemList = [];
	var mcMarginX = this.x + 100;
	var mcMarginY = this.y + 10;

	if ( this.level ){
		this.message = promptsList[ this.level-1 ].instruction;	
	} else {
		this.message = "Error";
	}
	if ( background == "dark" ){
		textColour = "#FFFFFF";
	} else {
		textColour = "black";
	}
	function drawStyledBreakedWrappedText(context, text, x, y, font, fontSize, maxWidth){
		var textblock = text.split("<br>");
		var lastY = y;
		for ( var i = 0; i<textblock.length; i++ ){
			var tb = textblock[i];
			lastY = wrapText(context, tb, x, lastY, maxWidth, lineHeight, font, fontSize);
			//console.log( tb + ", x: "+x+", y: "+lastY+", maxWidth: "+maxWidth+", lineHeight: "+lineHeight);
			//lastY += lineHeight;
			lastY += breakHeight;
		}
		//return textblock;
	}
	function drawStyledText(context, text, x, y, font, fontSize) {
	    // start with regular style
	    var fontCodeStyle = 'r';
	    do {
	        // set context font
	        context.font = buildFont(font, fontSize, fontCodeStyle);
	        // find longest run of text for current style
	        var ind = text.indexOf(styleMarker);
	        // take all text if no more marker
	        if (ind == -1) ind = text.length;
	        // fillText current run
	        var run = text.substring(0, ind);
	        context.fillText(run, x, y);
	        // return if ended
	        if (ind == text.length) return;
	        // move forward
	        x += context.measureText(run).width;
	        // update current style
	        fontCodeStyle = text[ind + 1];
	        // keep only remaining part of text
	        text = text.substring(ind + 2);
	    } while (text.length > 0)
	}
	function buildFont(font, fontSize, fontCodeStyle) {
	    var style = styleCodeToStyle[fontCodeStyle];
	    return style + ' ' + fontSize + 'px' + ' ' + font;
	}
	function wrapText(context, text, x, y, maxWidth, lineHeight, font, fontSize) {
		var words = text.split(' ');
		var line = '';

		for(var n = 0; n < words.length; n++) {
		  var testLine = line + words[n] + ' ';
		  var metrics = context.measureText(testLine);
		  var testWidth = metrics.width;
		  if (testWidth > maxWidth && n > 0) {
		    //context.fillText(line, x, y);
		    drawStyledText(context, line, x, y, font, fontSize);
		    line = words[n] + ' ';
		    y += lineHeight;
		  }
		  else {
		    line = testLine;
		  }
		}
		//context.fillText(line, x, y);
		drawStyledText(context, line, x, y, font, fontSize);
		return y;
	}
	function onMultipleChoiceClick(e){
		//console.log("onMultipleChoiceClick");
	}
	this.setText = function(m){
		this.message = m;
	}
	this.setMaxWidth = function( cw ){
		this.maxWidth = cw - this.x - 400 - 10;
	}
	this.onMouseUp = function (mouseX,mouseY) {
		/*
		//this is being called by DisplayList when the mouse/touch on canvas is UP
		console.log("prompt clicked: "+mouseX+", "+mouseY);
		mc1.onMouseUp();

		//calls onPromptClicked in FoodWeb.js
		//this.dispatch(this.EVENT_CLICKED);
		
		//runs through all the clickable items and see which one was clicked
		for (i=0; i< itemList.length; i++) {
		    var to = itemList[i];
		    if ( (mouseY >= to.y) && (mouseY <= to.y+to.height)
		            && (mouseX >= to.x) && (mouseX <=
		         to.x+to.width) ) {
		         to.onMouseUp(mouseX,mouseY);
		    }
		}
		*/
	}
	
	this.setConnectionPrompt = function(){
		if ( this.level ){
			this.message = promptsList[ this.level-1 ].connection;	
		} else {
			this.message = "Error";
		}
	}
	this.setContinuePrompt = function(num){
		if ( this.level ){
			switch (num){
				case 1:
					this.message = promptsList[ this.level-1 ].continue1;
					break;
				case 2: 
					this.message = promptsList[ this.level-1 ].continue2;
					break;
				case 3: 
					this.message = promptsList[ this.level-1 ].continue3;
					break;
				case 4: 
					this.message = promptsList[ this.level-1 ].continue4;
					break;
				default:
					this.message = "Error";
			}

		} else {
			this.message = "Error";
		}
	}
	this.draw = function() {
		this.ctx.shadowBlur=0;
		this.ctx.shadowOffsetX = 0;
		this.ctx.shadowOffsetY = 0
		this.ctx.font = "300 18pt 'Roboto'";
		this.ctx.textAlign = "left";
		this.ctx.textBaseline = "top";
		this.ctx.fillStyle = textColour; "black"; //"#FFFFFF";
		//wrapText(this.ctx, this.message, this.x, this.y, maxWidth, lineHeight);
		drawStyledBreakedWrappedText( this.ctx, this.message, this.x, this.y, 'Roboto', 18, this.maxWidth );
		//this.ctx.fillText(this.message, this.x, this.y);
	}
}
Prompt.prototype = new EventDispatcher();
Prompt.prototype.constructor = Prompt;