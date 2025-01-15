


//-------------------------------------------------------------------------------------------
let bird;
let pipes = [];
let score = 0;
let highScore = 0;
let gameState = 'start'; // 'start', 'play', 'gameOver'
let backgroundImg; // Add background image variable
let pipeImg; // Add pipe image variable

// Load the pixelated font 
let pixelFont;

// Add sound variables
let jumpSound;
let crashSound;

function preload() {
    // Use a pixelated font from Google Fonts 
    pixelFont = loadFont('fonts/PressStart2P-Regular.ttf');
    // Load sounds
    jumpSound = loadSound('sounds/jump.wav');
    crashSound = loadSound('sounds/crash.wav');
}


function setup() {
    const containerWidth = select('#canvas-container').width;
    const containerHeight = select('#canvas-container').height;

    // Use the smaller of the two ratios to ensure canvas fits
    const canvasWidth = min(containerWidth, containerHeight * 1.5);
    const canvasHeight = canvasWidth * 0.67;

    let canvas = createCanvas(canvasWidth, canvasHeight);
    canvas.parent('canvas-container');

    // Load images
    backgroundImg = loadImage('images/background.png');
    pipeImg = loadImage('images/pipe.png');

    resetGame();
}

// Add this new function to handle game reset
function resetGame() {
    const initialY = height / 2;
    const initialX = width / 4;
    bird = new Bird(initialX, initialY);
    pipes = [];
    pipes.push(new Pipe());
    score = 0;

    if (localStorage.getItem('highScore')) {
        highScore = parseInt(localStorage.getItem('highScore'));
    }
}

function windowResized() {
    const containerWidth = select('#canvas-container').width;
    const containerHeight = select('#canvas-container').height;

    let canvasWidth, canvasHeight;

    if (windowWidth < 600) { // Mobile view
        canvasWidth = containerWidth;
        canvasHeight = containerWidth * 1.5;
    } else {
        canvasWidth = min(containerWidth, containerHeight * 1.5);
        canvasHeight = canvasWidth * 0.67;
    }

    resizeCanvas(canvasWidth, canvasHeight);

    // Adjust game elements for new canvas size
    if (bird) {
        bird.groundY = height - bird.height / 2;
        if (gameState === 'play') {
            resetGame();
        }
    }

    // Adjust pipe spacing and gaps for new dimensions
    Pipe.prototype.spacing = height * 0.25;
    Pipe.prototype.minTopHeight = height * 0.1;
    Pipe.prototype.maxTopHeight = height * 0.6;
}

function showStartScreen() {
    textFont(pixelFont);
    fill(255);
    textAlign(CENTER, CENTER);


    const titleSize = min(width / 18.4, height / 12.27, 38);
    const instructionSize = min(width / 29.34, height / 22, 20);
    const logoSize = min(width / 5.33, height / 5.33, 75);

    // Calculate positions for logo and text
    const titleY = height / 3;
    const instructionY = height / 2 + (height * 0.1);

    push();
    textSize(titleSize);
    const titleWidth = textWidth('Flappy Bird');
    pop();

    // Position logo relative to screen size
    const logoX = width / 2 - titleWidth / 2 - logoSize - (width * 0.02);

    // Draw the bird logo
    if (bird && bird.imageUp) {
        push();
        imageMode(CENTER);
        image(bird.imageUp, logoX, titleY, logoSize, logoSize);
        pop();
    }

    // Draw title with responsive size
    textSize(titleSize);
    text('Flappy Bird', width / 2, titleY);

    // Draw instructions with responsive size
    textSize(instructionSize);
    // Add animation to instruction text
    let pulseSize = instructionSize * (1 + sin(frameCount * 0.05) * 0.1);
    textSize(pulseSize);
    text('Tap or Press Space to Start', width / 2, instructionY);
}

function playGame() {
    // Update and display bird
    bird.update();
    bird.show();


    if (frameCount % 60 === 0) { // Log every 60 frames
        pipes.forEach((pipe, index) => {
        });
    }

    // pipe spawning logic
    let lastPipe = pipes[pipes.length - 1];
    const minPipeDistance = width * 0.4; // Increased minimum distance

    // Only spawn a new pipe if the last pipe has moved sufficiently to the left
    if (!lastPipe || (lastPipe.x + lastPipe.width) < (width - minPipeDistance)) {

        pipes.push(new Pipe());
    }

    // Move and display pipes
    for (let i = pipes.length - 1; i >= 0; i--) {
        pipes[i].update();
        pipes[i].show();

        // Check for collisions
        if (pipes[i].hits(bird)) {
            gameState = 'gameOver';
            if (score > highScore) {
                highScore = score;
                localStorage.setItem('highScore', highScore);
            }
        }

        // Remove pipes that are off-screen
        if (pipes[i].x < -pipes[i].width) {
            pipes.splice(i, 1);
        }
    }

    // Increase score as bird passes through pipes
    for (let i = pipes.length - 1; i >= 0; i--) {
        if (pipes[i].passed(bird)) {
            score++;
        }
    }

    // Display the score and high score
    fill(255);
    textSize(24);
    textAlign(LEFT, TOP);
    text('Score: ' + score, 20, 20);
    text('High Score: ' + highScore, 20, 50);
}


let fadeAlpha = 0;


function showGameOverScreen() {
    // Set the pixelated font
    textFont(pixelFont);

    fill(255, 0, 0);
    textSize(width / 15);
    textAlign(CENTER, CENTER);
    text('GAME OVER', width / 2, height / 4);

    fill(255);
    textSize(width / 25);
    text('Final Score: ' + score, width / 2, height / 2);

    text('High Score: ' + highScore, width / 2, height / 2 + height / 10);

    textSize(width / 35);
    let alpha = map(sin(frameCount * 0.1), -1, 1, 150, 255);
    fill(255, 255, 255, alpha);
    text('Press Space to Restart', width / 2, height / 2 + height / 5);
}


function keyPressed() {
    if (gameState === 'start' || gameState === 'gameOver') {
        fadeAlpha = 0;
        gameState = 'play';
        score = 0;
        pipes = [];
        pipes.push(new Pipe());
        bird = new Bird(width / 4, height / 2);

    } else if (gameState === 'play' && (key === ' ' || keyCode === 32)) {
        bird.flap();
    }
}

function draw() {
    // Draw background 
    image(backgroundImg, 0, 0, width, height);

    // Handle game states
    if (gameState === 'start') {
        showStartScreen();
    } else if (gameState === 'play') {
        playGame();
    } else if (gameState === 'gameOver') {
        showGameOverScreen();
    }
}








// ----------------------------------------------------------------------------------------------------------------


class Bird {
    constructor() {
        this.x = width / 4; // Starting position 
        this.y = height / 2; // Vertical starting position
        this.width = 40; // Width of the bird
        this.height = 40; // Height of the bird
        this.velocity = 0; // Initial vertical velocity
        this.gravity = 0.6; // Gravity effect (pulls the bird down)
        this.lift = -11; // Flap strength (makes the bird go up)
        this.imageRest = loadImage('images/flappybird.png'); // Bird resting image
        this.imageUp = loadImage('images/flappybird_up.png'); // Bird jumping image
        this.image = this.imageRest; // Default image
        this.groundY = height - this.height / 2; // ground position
    }

    // Update bird position based on velocity and gravity
    update() {
        this.velocity += this.gravity;
        this.y += this.velocity;

        // Check for ground collision
        if (this.y >= this.groundY) {
            this.y = this.groundY;
            this.velocity = 0;
            if (gameState === 'play') {
                console.log('Ground collision detected');
                crashSound.play(); // Play crash sound
                gameState = 'gameOver';
                if (score > highScore) {
                    highScore = score;
                    localStorage.setItem('highScore', highScore);
                }
            }
        }

        // Prevent flying above the screen
        if (this.y < 0) {
            this.y = 0;
            this.velocity = 0;
        }

        // Update bird image based on velocity
        if (this.velocity < 0) {
            this.image = this.imageUp;
        } else {
            this.image = this.imageRest;
        }
    }

    // Make the bird flap upwards when the space key is pressed
    flap() {
        this.velocity = this.lift;
        jumpSound.play();
    }

    // Display the bird on the canvas
    show() {
        imageMode(CENTER);
        image(this.image, this.x, this.y, this.width, this.height);
    }

    // Check if the bird collides with the ground or pipes
    hits(pipe) {

        return pipe.hits(this);
    }
}








// ----------------------------------------------------------------------------------------------------------------




class Pipe {
    constructor() {
        // Fixed dimensions
        this.spacing = height * 0.25;
        this.width = width * 0.15;
        this.minTopHeight = height * 0.1;
        this.maxTopHeight = height * 0.6;

        // Position
        this.x = width;
        this.top = random(this.minTopHeight, this.maxTopHeight);
        this.bottom = this.top + this.spacing;
        this.speed = width * 0.004;
        this.passedFlag = false;

        // Find last pipe to ensure minimum horizontal spacing
        let lastPipe = pipes[pipes.length - 1];
        if (lastPipe) {
            const minSpacing = width * 0.4;
            if (lastPipe.x > width - minSpacing) {
                this.x = lastPipe.x + minSpacing;
            }
        }
    }

    // Update the pipe's position
    update() {
        this.x -= this.speed;
    }

    // Display the pipe on the canvas (top and bottom)
    show() {
        imageMode(CORNER);

        // Draw top pipe (flipped vertically)
        push();
        translate(this.x, this.top);
        scale(1, -1);  // Flip the top pipe vertically
        image(pipeImg, 0, 0, this.width, this.top);
        pop();

        // Draw bottom pipe (normal orientation)
        image(pipeImg, this.x, this.bottom, this.width, height - this.bottom);
    }

    // Check if the pipe is off-screen 
    offscreen() {
        return this.x + this.width < 0;
    }

    // Check if the bird has passed through this pipe 
    passed(bird) {
        if (bird.x > this.x + this.width && !this.passedFlag) {
            this.passedFlag = true;
            return true;
        }
        return false;
    }

    // Check if the bird collides with this pipe
    hits(bird) {
        const pipeLeft = this.x + 25;
        const pipeRight = this.x + this.width - 25;

        const birdLeft = bird.x - bird.width * 0.35;
        const birdRight = bird.x + bird.width * 0.35;
        const birdTop = bird.y - bird.height * 0.35;
        const birdBottom = bird.y + bird.height * 0.35;

        if (birdRight > pipeLeft && birdLeft < pipeRight) {
            if (birdTop < this.top || birdBottom > this.bottom) {
                crashSound.play();
                return true;
            }
        }
        return false;
    }
}






// ----------------------------------------------------------------------------------------------------------------


