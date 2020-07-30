class Snake {
    constructor(boardWidth, boardHeight, numSquares){

        this.x = 0;
        this.y = 0;
        this.xVel = 0;
        this.yVel = 0;

        this.height = Math.trunc(boardHeight / numSquares);
        this.width = Math.trunc(boardWidth / numSquares);

        this.boardHeight = boardHeight;
        this.boardWidth = boardWidth;

    }

    update(){

        this.x += this.xVel;
        this.y += this.yVel;

        this.draw();

    }

    draw(){

        rect(this.x * this.width, this.y * this.height, this.width, this.height);
        fill('red');

    }

}

