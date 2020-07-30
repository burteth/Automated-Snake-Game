


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

  }

  update(){

	if (this.paused){
		return
	}

	background(0) 	
	
	
	//Check if the food was eaten
	var foodEaten = false;
	if (this.fruit.x === this.snake.x && this.fruit.y === this.snake.y){

		//Update Fruit
		this.fruit.newFruit()
		foodEaten = true;

		//If score is current high score 
		if (this.snake.tail.length > this.highScore){
			this.highScore = this.snake.tail.length;
		}
		
		//Update Score Counters
		document.getElementById("ScoreCounter").innerText = "Score: ".concat(this.snake.tail.length.toString());
		document.getElementById("HighScoreCounter").innerText = "High Score: ".concat(this.highScore.toString());
		
	
		if (this.automated){
			this.steps = this.findPath();	
			this.nowAutomated = true;
		}

	}
	



	//Just for testing path
	if (this.nowAutomated){

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


	
	this.snake.x += this.snake.xVel;
	this.snake.y += this.snake.yVel;



	//Check bounds
	if (this.snake.x < 0 || this.snake.x >= this.numSquares || this.snake.y < 0 || this.snake.y >= this.numSquares){
		this.gameOver = true;
	}
	//Check if the head hit the tail
	for(var i = 0; i < this.snake.tail.length; i++){
		if (this.snake.tail[i][0] === this.snake.x && this.snake.tail[i][1] === this.snake.y){
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

	this.fruit.newFruit()

	this.gameOver = false;

  }




  findPath(){
	/*
	Returns a list of X velocities and Y velocities
		ex) [
				[0,1],[1,0],[-1,0]....
			]
	*/

	//BFS
	
	var snakeTailPos = {}

	for (var i = 0; i < this.snake.tail.length; i++){
		snakeTailPos[toIndex(this.snake.tail[i][0], this.snake.tail[i][0])] = i;
	}


	/*Queue
		X position,
		Y position,
		Set of visited node positions
		Set of past movements (Velocities)
	*/
	var queue = [ {
		x : this.snake.x,
		y : this.snake.y, 
		visited : [toIndex(this.snake.x, this.snake.y)],
		directions : []
	} ];

	var globalVisited = new Set();
	globalVisited.add(toIndex(this.snake.x, this.snake.y));


	var item, newX, newY, index;
	var directions = [[1,0],[0,1],[-1,0],[0,-1]];
	
	while (queue.length > 0){		



		item = queue.shift();
	
		//If the fruit is found
		if (item.x === this.fruit.x & item.y === this.fruit.y){

			return(item.directions);
		}

		for(var i = 0; i < directions.length; i++){

			newX = directions[i][0] + item.x;
			newY = directions[i][1] + item.y;
			index = toIndex(newX, newY);
			
			if (newX < 0 || newX >= NUM_SQUARES || newY < 0 || newY >= NUM_SQUARES || item["visited"].includes(index) || globalVisited.has(index)){
				continue
			}
			
			//If the node is currently occupied by the tail
			if (snakeTailPos.hasOwnProperty(index)){

				continue
				//If the tail will still be there when the head gets there
				if (snakeTailPos[index] > item.directions.length){
					//console.log('Tail is in the way');
					continue
				}
			}
			
			//console.log("Add:", add);

			globalVisited.add(index);

			queue.push({
				x : newX,
				y : newY,
				visited : item.visited.concat(index),
				directions : item.directions.concat([[directions[i][0], directions[i][1]]])
			})
			

			

		}
	
	}
	return([])	

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


	}

	draw(){

		var curX;
		var curY;

		fill(102,218,56);

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
		this.newFruit()

		
	}

	newFruit(){

		this.x = Math.trunc(random(0, this.numSquares))
		this.y = Math.trunc(random(0, this.numSquares))

	}

	draw(){
		
		fill(230,54,59);	
		rect(this.x * this.width, this.y * this.height, this.width, this.height);

	}
}









var Game;

let BOARD_WIDTH = 800;
let BOARD_HEIGHT = 600;
let NUM_SQUARES = 20;
let FRAME_RATE = 30;

let UPDATE_GAME_BUFFER = 10;
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