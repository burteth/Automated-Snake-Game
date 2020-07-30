


class SnakeGame {
  constructor(boardWidth, boardHeight, numSquares){

	this.height = Math.trunc(boardHeight / numSquares);
	this.width = Math.trunc(boardWidth / numSquares);

	this.snake = new Snake(boardWidth, boardHeight, numSquares, this.height, this.width);
	this.fruit = new Fruit(boardWidth, boardHeight, numSquares, this.height, this.width);


	this.boardHeight = boardHeight;
	this.boardWidth = boardWidth;
	this.numSquares = numSquares;
	
	this.gameOver = false;
	this.highScore = 0;

	this.paused = false;

	this.automated = true;
	this.nowAutomated = false;
	this.steps = [];

	this.dfsCounter = 0;

	

	if (this.automated){
		this.steps = this.findPath();
	}

  }

  update(){

	if (this.paused){
		return
	}
	if (this.stressLevel === 0){
		background(0);
	}else{
		background(230, 0, 0);
	}
	
	
	
	//Check if the food was eaten
	var foodEaten = false;
	if (this.fruit.x === this.snake.x && this.fruit.y === this.snake.y){

		//Update Fruit
		this.fruit.newFruit(this.snake.tail)
		foodEaten = true;

		//If score is current high score 
		if (this.snake.tail.length > this.highScore){
			this.highScore = this.snake.tail.length;
		}
		
		//Update Score Counters
		document.getElementById("ScoreCounter").innerText = "Score: ".concat(this.snake.tail.length.toString());
		
	
		if (this.automated){
			this.steps = this.findPath();	
			if (false){
			//if (this.steps.length === 0){
				this.paused = true;
				this.snake.draw();
				this.fruit.draw();
				return
			}
		}

	}
	

	
	
	if (this.automated){
		if (this.steps.length === 0){
			this.steps = this.findPath();	
		}

		this.snake.x += this.steps[0][0];
		this.snake.y += this.steps[0][1];
		this.steps.shift();
	}	

	// Draw Path Just for testing path
	if (false){

		var curX = this.snake.x;
		var curY = this.snake.y;
		

		fill('yellow');
		for(var i = 0; i < this.steps.length; i++){
			curX += this.steps[i][0];
			curY += this.steps[i][1];

			rect(curX * this.width, curY * this.height, this.width, this.height)

		}

		this.snake.draw()
		this.fruit.draw()

		this.paused = true
		return
		//this.steps[0][0] = this.snake.xVel;
		//this.steps[0][1] = this.snake.yVel;
		//this.steps.shift();
	}


	




	//Check bounds
	if (this.snake.x < 0 || this.snake.x >= this.numSquares || this.snake.y < 0 || this.snake.y >= this.numSquares){
		this.gameOver = true;
		console.log("out of bounds");
		
	}
	//Check if the head hit the tail
	for(var i = 0; i < this.snake.tail.length; i++){
		if (this.snake.tail[i][0] === this.snake.x && this.snake.tail[i][1] === this.snake.y){
			console.log("ran into itself");
			this.paused = true
			
			this.snake.draw
			fill(255,255,255);			
			rect(this.snake.tail[i][0]*this.snake.width, this.snake.tail[i][1] * this.snake.height, this.snake.width, this.snake.height )
			this.gameOver = true;
			break
	
		}
	}
	
	
	this.snake.tail.push(
		[this.snake.x, this.snake.y]
	);


	if (!(foodEaten)){
		this.snake.tail.shift();
	}

	
	if (this.gameOver){

		this.resetGame();
		return
	}
	

	this.snake.draw();
	this.fruit.draw();

  }



  updateDir(keyCode){


    if (keyCode === LEFT_ARROW || keyCode === 65){
		this.snake.xVel = -1;
		this.snake.yVel = 0;

    } else if (keyCode === RIGHT_ARROW || keyCode === 68){
		this.snake.xVel = 1;
		this.snake.yVel = 0;
  
    } else if (keyCode === UP_ARROW || keyCode === 87){
      	this.snake.xVel = 0;
		this.snake.yVel = -1;
      
    } else if (keyCode === DOWN_ARROW || keyCode === 83){
		this.snake.xVel = 0;
		this.snake.yVel = 1;

    } else if (keyCode === 32 ){
		this.automated = !(this.automated);

	} else if (keyCode === 80){
		this.paused = !(this.paused);
	}

  }

  resetGame(){

	this.snake.x = 0;
	this.snake.y = 0;
	this.snake.xVel = 1;
	this.snake.yVel = 0;

	this.snake.tail = [ [0,0] ];
	this.snake.tailLength = 0;

	this.fruit.newFruit([0.0])

	this.gameOver = false;

	if (this.automated){
		this.steps = this.findPath();
	}else{
		this.steps = [];
	}

  }


  BreathFirstSearch(tailList, snakeX, snakeY, fruitX, fruitY){
	
	//BFS
	
	var snakeTailPos = {}
	
	for (var i = 0; i < tailList.length; i++){
		snakeTailPos[toIndex(tailList[i][0], tailList[i][1])] = i;
	}
	


	/*Queue
		X position,
		Y position,
		Set of past movements (Velocities)
	*/
	var queue = [ {
		x : snakeX,
		y : snakeY, 
		directions : []
	} ];

	var globalVisited = new Set();
	globalVisited.add(toIndex(snakeX, snakeY));


	var item, newX, newY, index;
	var directions = [[1,0],[0,1],[-1,0],[0,-1]];
	
	while (queue.length > 0){		



		item = queue.shift();
	
		//If the fruit is found
		if (item.x === fruitX & item.y === fruitY){

			return(item.directions);
		}

		for(var i = 0; i < directions.length; i++){

			newX = directions[i][0] + item.x;
			newY = directions[i][1] + item.y;
			index = toIndex(newX, newY);
			
			if (newX < 0 || newX >= NUM_SQUARES || newY < 0 || newY >= NUM_SQUARES || globalVisited.has(index)){
				continue
			}
			
			//If the node is currently occupied by the tail
			if (snakeTailPos.hasOwnProperty(index)){

				//If the tail will still be there when the head gets there
				if (snakeTailPos[index] >= item.directions.length - 1){		
					continue
				}
			}

			globalVisited.add(index);

			queue.push({
				x : newX,
				y : newY,
				directions : item.directions.concat([[directions[i][0], directions[i][1]]])
			})
			
		}
	
	}
	console.log("Path not found");
	
	return([])	


  }

  AStar(tailList, snakeX, snakeY, fruitX, fruitY, optimal){

	var snakeTailPos = {}

	for (var i = 0; i < tailList.length; i++){
		snakeTailPos[toIndex(tailList[i][0], tailList[i][1])] = i;
	}

	var queue = [{
		x : snakeX,
		y : snakeY,
		cost : dist(snakeX, snakeY, fruitX, fruitY),
		directions : []
	}]

	
	var globalVisited = new Set();
	globalVisited.add(toIndex(snakeX, snakeY));

	var solutions = []
	var item, newX, newY, index;
	var directions = [[1,0],[0,1],[-1,0],[0,-1]];
	
	while (queue.length > 0){		
		
		item = queue.shift();
	
		//If the fruit is found
		if (item.x === fruitX & item.y === fruitY){

			if (optimal){
				var simulatedTailList = this.SimulateTraversal([...tailList], snakeX, snakeY, item.directions)
				solutions.push([this.CheckEscape(simulatedTailList, fruitX, fruitY), item.directions])
			}else{
				return(item.directions);
			}
			
			
		}

		for(var i = 0; i < directions.length; i++){

			newX = directions[i][0] + item.x;
			newY = directions[i][1] + item.y;
			index = toIndex(newX, newY);
			
			if (newX < 0 || newX >= NUM_SQUARES || newY < 0 || newY >= NUM_SQUARES || globalVisited.has(index)){
				continue
			}
			
			//If the node is currently occupied by the tail
			if (snakeTailPos.hasOwnProperty(index)){

				//If the tail will still be there when the head gets there
				if (snakeTailPos[index] >= item.directions.length - 1){		
					continue
				}
			}

			globalVisited.add(index);

			queue.push({
				x : newX,
				y : newY,
				cost : dist(newX, fruitX, newY, fruitY) + item.directions.length + 1,
				directions : item.directions.concat([[directions[i][0], directions[i][1]]])
			})
			
		}


		queue.sort(compare);

		function compare(a, b) {
			if (a.cost < b.cost) {
			  return -1;
			}
			if (a.cost > b.cost) {
			  return 1;
			}
			// a must be equal to b
			return 0;
		  }
		
	
	}
	if (solutions.length){
		solutions.sort(function(a, b) {
			return a[0] > b[0];
		  });
		  

		if (solutions[0][0] > tailList.length){
			return(solutions[0][1])
		}else{
			return([])
		}
		
	}else{
		return([])
	}
  }

  DFS(tailList, snakeX, snakeY, stepLimit, fruitX, fruitY, steps){
	

	//Returns object with directions that had the snake stall for a specific number of steps

	var solutions = [];
	var snakeTailPos = new Set();

	for (var i = 0; i < tailList.length; i++){
		snakeTailPos[toIndex(tailList[i][0], tailList[i][1])] = i;
	}
	

	var stack = [{
			x : snakeX,
			y : snakeY, 
			directions : [],
			visited : new Set([toIndex(snakeX,snakeY)]),
			orientation : [[1,0],[0,1],[-1,0],[0,-1]]
		},
		{
			x : snakeX,
			y : snakeY, 
			directions : [],
			visited : new Set([toIndex(snakeX,snakeY)]),
			orientation : [[0,-1],[-1,0],[0,1],[1,0]]
		}
	]

	var item, newX, newY, index, directions;
	
	while (stack.length > 0){		
		
		item = stack.pop();
		directions = item.orientation;

		if (item.directions.length >= stepLimit && steps){

			var simulatedTailList = this.SimulateTraversal([...tailList], snakeX, snakeY, item.directions)
			solutions.push([this.CheckEscape(simulatedTailList, fruitX, fruitY), item.directions])

			if (solutions.length > 20){
				solutions.sort(function(a, b) {
					return a[0] > b[0];
					});
				return(solutions[0])
			}
						
		}


		for(var i = 0; i < directions.length; i++){

			newX = directions[i][0] + item.x;
			newY = directions[i][1] + item.y;
			index = toIndex(newX, newY);

			if (!(steps) && newX === fruitX && newY === fruitY){

				if (item.directions.length + 1 > solution.length){
					solution = item.directions.concat([[directions[i][0], directions[i][1]]]);
				}
				continue
			}

			if (newX < 0 || newX >= NUM_SQUARES || newY < 0 || newY >= NUM_SQUARES || item.visited.has(index)){
				continue
			}
			
			//If the node is currently occupied by the tail
			if (snakeTailPos.hasOwnProperty(index)){

				//If the tail will still be there when the head gets there
				if (snakeTailPos[index] >= item.directions.length - 1){		
					continue
				}
			}

			var tmpSet = new Set(item.visited);
			tmpSet.add(toIndex(newX,newY));
			tmpSet.add(toIndex(item.x,item.y));
			stack.push({
				x : newX,
				y : newY,
				directions : item.directions.concat([[directions[i][0], directions[i][1]]]),
				visited : tmpSet,
				orientation : directions

			})
			
		}
	
	}
	
	if (solutions.length){
		solutions.sort(function(a, b) {
			return a[0] > b[0];
			});
		return(solutions[0])
	}else{
		return([]);
	}

  }


  CheckEscape(tailList, snakeX, snakeY){
	  
	//CheckEscape
	var availableSquares = (NUM_SQUARES * NUM_SQUARES) - tailList.length;

	var snakeTailPos = {}
	
	for (var i = 0; i < tailList.length; i++){
		snakeTailPos[toIndex(tailList[i][0], tailList[i][1])] = i;
	}
	
	/*Queue
		X position,
		Y position,
	*/
	var queue = [ {
		x : snakeX,
		y : snakeY,
		directions : []
	} ];

	var globalVisited = new Set();
	globalVisited.add(toIndex(snakeX, snakeY));

	var simpleVisited = new Set();

	var overlapCounter = 0;
	var item, newX, newY, index;
	var directions = [[1,0],[0,1],[-1,0],[0,-1]];
	
	while (queue.length > 0){		

		item = queue.shift();

		for(var i = 0; i < directions.length; i++){

			newX = directions[i][0] + item.x;
			newY = directions[i][1] + item.y;
			index = toIndex(newX, newY);
			
			if (newX < 0 || newX >= NUM_SQUARES || newY < 0 || newY >= NUM_SQUARES || globalVisited.has(index)){
				continue
			}
			
			
			//If the node is currently occupied by the tail
			if (snakeTailPos.hasOwnProperty(index)){
				overlapCounter += 1;
				//If the tail will still be there when the head gets there
				if (snakeTailPos[index] >= item.directions.length - 1){
					continue
				}
			}else{
				simpleVisited.add(index)
			}


			globalVisited.add(index);

			queue.push({
				x : newX,
				y : newY,
				directions : item.directions.concat( [[directions[i][0], directions[i][1]]])
			})
		}
	
	}

	return(simpleVisited.size);


  }

  SimulateTraversal(tailList, snakeX, snakeY, directionList){

	var curX = snakeX;
	var curY = snakeY;

	for(var i = 0; i < directionList.length; i++){
		curX += directionList[i][0];
		curY += directionList[i][1];

		tailList.shift();
		tailList.push([curX, curY]);
	}

	return(tailList)

  }


  findPath(){
	  
	/*
	Returns a list of X velocities and Y velocities
		ex) [
				[0,1],[1,0],[-1,0]....
			]
	*/
	
	var solution = this.AStar(this.snake.tail, this.snake.x, this.snake.y, this.fruit.x, this.fruit.y, true);
	console.log("Finished A*");
	

	
	if (solution.length === 0){
		console.log("Attempting DFS");

		this.snake.stressLevel = 1;
		this.stressLevel = 1;

		var openTiles = this.CheckEscape(this.snake.tail, this.snake.x, this.snake.y); 
		console.log(openTiles);
		
		if (openTiles === 0){
			this.gameOver = true;
			return([]);

		}else{

			console.log("get DFS");

			var dfsSolutions = []

				for (var i = Math.floor(openTiles / 5); i < openTiles / 3; i += Math.floor(openTiles / 5)){
					dfsSolutions.push(this.DFS(this.snake.tail, this.snake.x, this.snake.y, i, this.fruit.x, this.fruit.y, true));					
				}

				console.log(dfsSolutions);
				
				if (dfsSolutions.length){
					dfsSolutions.sort(function(a, b) {
						return a[0] > b[0];
						});
					return(dfsSolutions[0][1])
				}else{
					return([])
				}
			}
			
			
	
	}
	this.snake.stressLevel = 0;
	this.stressLevel = 0;
	this.dfsCounter = 0;
	return(solution)
}

}
class Snake{
	constructor(boardWidth, boardHeight, numSquares, height, width){

		this.x = 0;
		this.y = 0;
		this.xVel = 1;
		this.yVel = 0;

		this.height = height;
		this.width = width;

		this.tail = [ [0,0] ];

		this.stressLevel = 0;

	}

	draw(){

		var curX;
		var curY;
		if (this.stressLevel === 1){
			fill(0, 0, 0);
		}else{
			fill(102,218,56);
		}
		

		for (var i = 0; i < this.tail.length; i++){

			curX = this.tail[i][0] * this.width;
			curY = this.tail[i][1] * this.height;

			rect(curX , curY, this.width, this.height);		

		}

	}

}

class Fruit{
	constructor(boardWidth, boardHeight, numSquares, height, width){

		this.boardHeight = boardHeight;
		this.boardWidth = boardWidth;
		this.numSquares = numSquares;

		this.height = height;
		this.width = width;

		this.x;
		this.y;
		this.newFruit([0,0])

		
	}

	newFruit(tailPos){

		

		var tailSet = new Set();
		for(var i = 0; i < tailPos.length; i++){
			tailSet.add(toIndex(tailPos[i][0],tailPos[i][1]))
		}

		var newX = Math.trunc(random(0, this.numSquares));
		var newY = Math.trunc(random(0, this.numSquares));

		while (tailSet.has(toIndex(newX,newY))) {

			var newX = Math.trunc(random(0, this.numSquares));
			var newY = Math.trunc(random(0, this.numSquares));

		}
		this.x = newX;
		this.y = newY;

	}

	draw(){
		
		fill(230,54,59);	
		rect(this.x * this.width, this.y * this.height, this.width, this.height);

	}
}









var Game;

let BOARD_WIDTH = Math.floor(window.innerWidth * .8);
let BOARD_HEIGHT =  Math.floor(window.innerHeight * .8);
let NUM_SQUARES = 50;
let FRAME_RATE = 100;

//console.log(window.innerWidth);

function setup() {

	createCanvas(BOARD_WIDTH, BOARD_HEIGHT);
	background(0) 

	frameRate(FRAME_RATE);

	Game = new SnakeGame(BOARD_WIDTH, BOARD_HEIGHT, NUM_SQUARES);

}

function draw() {

	Game.update()

}


function keyPressed(){

	Game.updateDir(keyCode);

}


function toIndex(x, y){
	return(y*NUM_SQUARES + x)
}

function toPos(index){
	return([index % NUM_SQUARES, Math.trunc(index / NUM_SQUARES)])
}

function dist(startX, startY, endX, endY){
	var xDif = Math.abs(startX - endX);
	var yDif = Math.abs(startY - endY);
	return(xDif + yDif)
}