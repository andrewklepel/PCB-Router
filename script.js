(function() {
	// configurable variables
	var snapPoint = 50;
	var browserWidth = 1000;
	var browserHeight = 800;
	var colorArray = ["#555", "#550", "#505", "#055", "#500", "#050", "#005", "#00c", "#0c0", "#c00", "#cc0", "#c0c", "#0cc"];
	var lineColor = "#f00";
	var holePairCount = 8;
	
	// system variables
	var flag = false;
	var prevX = 0,
        currX = 0,
        prevY = 0,
        currY = 0;
	var holes = [];
	var existingDrawnCoords = [];
	var lineCount = 0;
		
	// block right-click context menu, so that it doesn't interfere with game
	document.body.addEventListener("contextmenu", function(evt){evt.preventDefault();return false;});
		
	// set up canvas and dynamically adjust grid size
	document.getElementById("gamewrapper").setAttribute("style", "height:" + browserHeight + "px; width:" + browserWidth + "px;");
	var canvas = document.getElementById("game");
	canvas.setAttribute("width", browserWidth);
	canvas.setAttribute("height", browserHeight);
	var context = canvas.getContext("2d");
	
	// set up canvas event listeners
	canvas.addEventListener("mousemove", function (e) {
		findxy('move', e)
	}, false);
	canvas.addEventListener("mousedown", function (e) {
		findxy('down', e)
	}, false);
	canvas.addEventListener("mouseup", function (e) {
		findxy('up', e)
	}, false);
	canvas.addEventListener("mouseout", function (e) {
		findxy('out', e)
	}, false);
	
	// initialize canvas
	holes = generateHoles();
	drawCanvas();
	
	// clears and re-draws the entire canvas, with stored holes and lines
	function drawCanvas() {
		context.clearRect(0, 0, canvas.width, canvas.height);
		drawCanvasBackground();
		drawHoles(holes);
		drawLines(existingDrawnCoords);
	}
	
	function coordsExist(existingCoords, xCoord, yCoord, group = -1) {
		for (var k = 0; k < existingCoords.length; k++) {
			if (existingCoords[k][0] === xCoord && existingCoords[k][1] === yCoord) {
				if (group === -1 || group === existingCoords[k][2]) {
					return true;
				}
			}
		}
		return false;
	}
	
	function generateHole(color) {
		var xCoord = roundToNearest(randomNumber(browserWidth, snapPoint*4));
		var yCoord = roundToNearest(randomNumber(browserHeight, snapPoint*4));
		
		return [xCoord, yCoord, color];
	}
	
	function generateHoles() {
		var generatedHoles = [];
		
		for (var i = 0; i < holePairCount; i++) {
			for (var j = 0; j < 2; j++) {
				var hole = generateHole(colorArray[i]);
				while (coordsExist(generatedHoles, hole[0], hole[1])) {
					hole = generateHole(colorArray[i]);
				};
				
				generatedHoles.push(hole);
			};
		};
		
		return generatedHoles;
	}
	
	function drawCanvasBackground() {
		// set canvas up with black background color
		context.fillStyle = 'black';
		context.fillRect(0, 0, browserWidth, browserHeight);
		context.lineJoin = "round";
		context.lineCap = "round";
	};
	
	function drawHole(hole) {
		var radius = (snapPoint/4);
		
		context.beginPath();
		context.arc(hole[0], hole[1], radius, 0, 2 * Math.PI, false);
		context.fillStyle = 'black';
		context.fill();
		context.lineWidth = (snapPoint/6);
		context.strokeStyle = hole[2];
		context.stroke();
	};
	
	function drawHoles(holeList) {
		for (var i = 0; i < holeList.length; i++) {
			drawHole(holeList[i]);
		}
	};
	
	function drawLine(pX, pY, cX, cY) {
        context.beginPath();
        
		context.moveTo(pX, pY);
        context.lineTo(cX, cY);
		
        context.strokeStyle = lineColor;
        context.lineWidth = (snapPoint/4);
        context.stroke();
        context.closePath();
    }
	
	function drawLines(lines) {
		var lastX = -1;
		var lastY = -1;
		var lastLine = -1;
		
		for (var i = 0; i < lines.length; i++) {
			if (lastX !== -1 && lastY !== -1) {
				if (lastLine === lines[i][2]) {
					drawLine(lastX, lastY, lines[i][0], lines[i][1]);
				}
			}
			
			lastX = lines[i][0];
			lastY = lines[i][1];
			lastLine = lines[i][2];
		}
	}
	
	function deleteLine(x, y) {
		var lineToRemove = -1;
				
		// check clicked tile for the existence of a line
		for (var i = 0; i < existingDrawnCoords.length; i++) {
			if (existingDrawnCoords[i][0] === x && existingDrawnCoords[i][1] === y) {
				lineToRemove = existingDrawnCoords[i][2];
				break;
			}
		}
		
		// remove all segments of that line, if any
		if (lineToRemove !== -1) {
			for (var i = existingDrawnCoords.length - 1; i >= 0; i--) {
				if (existingDrawnCoords[i][2] === lineToRemove) {
					existingDrawnCoords.splice(i, 1);
				}
			}
		}
	}
	
	function arePointsAdjacent(x1, y1, x2, y2) {
		// in this case, it's the very first line
		if (x1 === 0 && y1 === 0) {
			return true;
		}
		
		if (x1 === x2) {
			if (Math.abs(y1 - y2) === snapPoint) {
				return true;
			}
		}
		else if (y1 === y2) {
			if (Math.abs(x1 - x2) === snapPoint) {
				return true;
			}
		}
		return false;
	}
	
	function roundToNearest(x)
	{
		return (Math.ceil(x/snapPoint)*snapPoint) - (snapPoint/2); // snapPoint/2 helps center the point around the mouse
	}
	
	function findxy(res, e) {
        if (res == 'down') {
			if (e.which === 1) { // left click
				prevX = currX;
				prevY = currY;
				currX = roundToNearest(e.clientX - canvas.offsetLeft);
				currY = roundToNearest(e.clientY - canvas.offsetTop);
		
				flag = true;
			}
			else if (e.which === 3) { // right click
				var pointerX = roundToNearest(e.clientX - canvas.offsetLeft);
				var pointerY = roundToNearest(e.clientY - canvas.offsetTop);
				
				deleteLine(pointerX, pointerY);
				drawCanvas();
			}
        }
        if (res == 'up' || res == "out") {
			lineCount++;
            flag = false;
        }
        if (res == 'move') {
			var newX = roundToNearest(e.clientX - canvas.offsetLeft);
			var newY = roundToNearest(e.clientY - canvas.offsetTop);
			
            if (flag && (newX !== currX || newY !== currY)
				&& !coordsExist(existingDrawnCoords, newX, newY)
				&& arePointsAdjacent(currX, currY, newX, newY))
			{
                prevX = currX;
                prevY = currY;
                currX = newX;
                currY = newY;
                drawLine(prevX, prevY, currX, currY);
				
				if (!coordsExist(existingDrawnCoords, prevX, prevY, lineCount)) {
					existingDrawnCoords.push([prevX, prevY, lineCount]);
				}
				
				existingDrawnCoords.push([currX, currY, lineCount]);
            }
        }
    }
	
	// generates a random number, with possible padding
	function randomNumber(max, padding = 0) {
		return Math.floor(Math.random() * (max - padding)) + (padding/2);
	}
}());