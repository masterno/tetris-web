// script.js

document.addEventListener('DOMContentLoaded', () => {

    // Selecting DOM Elements
    const grid = document.querySelector('.game-grid');
    const miniGrid = document.querySelector('.mini-grid');
    const scoreDisplay = document.getElementById('score');
    const levelDisplay = document.getElementById('level');
    const startButton = document.getElementById('start-button');
    const pauseButton = document.getElementById('pause-button');
    const audioButton = document.getElementById('audio-button');
    const gameOverDisplay = document.getElementById('game-over');
    const finalScoreDisplay = document.getElementById('final-score');
    const restartButton = document.getElementById('restart-button');

    // Constants and Variables
    const width = 10;
    const height = 20;
    const squares = [];
    let nextRandom = Math.floor(Math.random() * 7);
    let timerId = null;
    let score = 0;
    let level = 1;
    let isPaused = false;
    let isGameOver = false;
    let highScore = localStorage.getItem('tetrisHighScore') || 0;

    // Create the Game Board
    function createGrid() {
        for (let i = 0; i < width * height; i++) {
            const square = document.createElement('div');
            grid.appendChild(square);
            squares.push(square);
        }
        // Add extra squares at the bottom
        for (let i = 0; i < width; i++) {
            const square = document.createElement('div');
            square.classList.add('taken');
            grid.appendChild(square);
            squares.push(square);
        }
    }

    createGrid();

    // Create mini-grid for displaying next Tetromino
    const displaySquares = [];
    const displayWidth = 4;

    function createMiniGrid() {
        for (let i = 0; i < displayWidth * displayWidth; i++) {
            const square = document.createElement('div');
            miniGrid.appendChild(square);
            displaySquares.push(square);
        }
    }

    createMiniGrid();

    // Audio Elements
    const backgroundMusic = document.getElementById('background-music');
    const rotateSound = document.getElementById('rotate-sound');
    const lineClearSound = document.getElementById('line-clear-sound');

    // The Tetrominoes
    const lTetromino = [
        [1, width+1, width*2+1, 2],
        [width, width+1, width+2, width*2+2],
        [1, width+1, width*2+1, width*2],
        [width, width*2, width*2+1, width*2+2]
    ];

    const zTetromino = [
        [0, width, width+1, width*2+1],
        [width+1, width+2, width*2, width*2+1],
        [0, width, width+1, width*2+1],
        [width+1, width+2, width*2, width*2+1]
    ];

    const tTetromino = [
        [1, width, width+1, width+2],
        [1, width+1, width+2, width*2+1],
        [width, width+1, width+2, width*2+1],
        [1, width, width+1, width*2+1]
    ];

    const oTetromino = [
        [0, 1, width, width+1],
        [0, 1, width, width+1],
        [0, 1, width, width+1],
        [0, 1, width, width+1]
    ];

    const iTetromino = [
        [1, width+1, width*2+1, width*3+1],
        [width, width+1, width+2, width+3],
        [1, width+1, width*2+1, width*3+1],
        [width, width+1, width+2, width+3]
    ];

    const sTetromino = [
        [1, width, width+1, width*2],
        [0, width, width+1, width+2],
        [1, width, width+1, width*2],
        [0, width, width+1, width+2]
    ];

    const jTetromino = [
        [1, width+1, width*2+1, width*2],
        [width, width+1, width+2, 2],
        [1, width+1, width*2+1, 0],
        [width, width*2, width*2+1, width*2+2]
    ];

    const theTetrominoes = [lTetromino, zTetromino, tTetromino, oTetromino, iTetromino, sTetromino, jTetromino];

    // Randomly select a Tetromino and its rotation
    let currentPosition = 4;
    let currentRotation = 0;
    let random = Math.floor(Math.random() * theTetrominoes.length);
    let current = theTetrominoes[random][currentRotation];
    let currentClassName = getTetrominoClassName(random);

    // Function to get the Tetromino class name
    function getTetrominoClassName(index) {
        const classes = ['l', 'z', 't', 'o', 'i', 's', 'j'];
        return classes[index];
    }

    // Draw the Tetromino
    function draw() {
        current.forEach(index => {
            squares[currentPosition + index].classList.add('tetromino', 'active', currentClassName);
        });
    }

    // Undraw the Tetromino
    function undraw() {
        current.forEach(index => {
            squares[currentPosition + index].classList.remove('tetromino', 'active', currentClassName);
        });
    }

    // Move the Tetromino down
    function moveDown() {
        undraw();
        currentPosition += width;
        draw();
        freeze();
    }

    // New helper function to add permanent classes
    function addPermanentClasses(position, className) {
        squares[position].classList.add('taken', 'permanent', className);
    }

    // Freeze function
    function freeze() {
        if (current.some(index => squares[currentPosition + index + width].classList.contains('taken'))) {
            current.forEach(index => {
                const square = squares[currentPosition + index];
                square.classList.remove('active');
                square.classList.add('taken', 'placed', currentClassName);
            });
            addScore();
            // Start a new Tetromino
            currentPosition = 4;
            currentRotation = 0;
            random = nextRandom;
            nextRandom = Math.floor(Math.random() * theTetrominoes.length);
            current = theTetrominoes[random][currentRotation];
            currentClassName = getTetrominoClassName(random);
            displayNextTetromino();
            gameOver();
            draw();
            drawGhost();
        }
    }

    // Move left
    function moveLeft() {
        undraw();
        const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0);

        if (!isAtLeftEdge) currentPosition -= 1;

        if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition += 1;
        }

        draw();
        drawGhost();
    }

    // Move right
    function moveRight() {
        undraw();
        const isAtRightEdge = current.some(index => (currentPosition + index) % width === width - 1);

        if (!isAtRightEdge) currentPosition += 1;

        if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition -= 1;
        }

        draw();
        drawGhost();
    }

    // Rotate Tetromino
    function rotate() {
        undraw();
        currentRotation++;
        if (currentRotation === current.length) {
            currentRotation = 0;
        }
        current = theTetrominoes[random][currentRotation];

        if (current.some(index => squares[currentPosition + index].classList.contains('taken')) ||
            current.some(index => (currentPosition + index) % width === width - 1 && (currentPosition + index + 1) % width === 0)) {
            currentRotation--;
            if (currentRotation < 0) {
                currentRotation = current.length - 1;
            }
            current = theTetrominoes[random][currentRotation];
        }

        draw();
        drawGhost();
        rotateSound.currentTime = 0;
        rotateSound.play();
    }

    // Show next Tetromino in mini-grid
    const displayIndex = 0;
    const upNextTetrominoes = [
        [1, displayWidth+1, displayWidth*2+1, 2], // lTetromino
        [0, displayWidth, displayWidth+1, displayWidth*2+1], // zTetromino
        [1, displayWidth, displayWidth+1, displayWidth+2], // tTetromino
        [0, 1, displayWidth, displayWidth+1], // oTetromino
        [1, displayWidth+1, displayWidth*2+1, displayWidth*3+1], // iTetromino
        [1, displayWidth, displayWidth+1, displayWidth*2], // sTetromino
        [1, displayWidth+1, displayWidth*2+1, displayWidth*2] // jTetromino
    ];

    function displayNextTetromino() {
        displaySquares.forEach(square => {
            square.classList.remove('tetromino', 'l', 'z', 't', 'o', 'i', 's', 'j');
        });
        upNextTetrominoes[nextRandom].forEach(index => {
            displaySquares[displayIndex + index].classList.add('tetromino', getTetrominoClassName(nextRandom));
        });
    }

    // Add score
    function addScore() {
        for (let i = 0; i < squares.length - width; i += width) {
            const row = [];
            for (let j = 0; j < width; j++) {
                row.push(i + j);
            }
            if (row.every(index => squares[index].classList.contains('taken'))) {
                score += 10;
                scoreDisplay.innerHTML = score;
                lineClearSound.currentTime = 0;
                lineClearSound.play();

                // Remove all classes from the current line
                row.forEach(index => {
                    squares[index].className = '';
                });

                // Move down the classes from above lines
                for (let k = i - 1; k >= 0; k--) {
                    for (let j = 0; j < width; j++) {
                        const fromIndex = k * width + j;
                        const toIndex = (k + 1) * width + j;
                        squares[toIndex].className = squares[fromIndex].className;
                    }
                }

                // Clear the top row
                for (let j = 0; j < width; j++) {
                    squares[j].className = '';
                }

                // Increase level every 100 points
                if (score >= level * 100) {
                    level++;
                    levelDisplay.innerHTML = level;
                    if (timerId) {
                        clearInterval(timerId);
                        timerId = setInterval(moveDown, Math.max(100, 1000 - level * 100));
                    }
                }
            }
        }
    }

    // Game over
    function gameOver() {
        if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            isGameOver = true;
            clearInterval(timerId);
            backgroundMusic.pause();
            gameOverDisplay.style.display = 'block';
            finalScoreDisplay.innerHTML = score;
            if (score > highScore) {
                localStorage.setItem('tetrisHighScore', score);
            }
        }
    }

    // Control function
    function control(e) {
        if (!isGameOver && !isPaused) {
            if (e.keyCode === 37) {
                moveLeft();
            } else if (e.keyCode === 38) {
                rotate();
            } else if (e.keyCode === 39) {
                moveRight();
            } else if (e.keyCode === 40) {
                moveDown();
            } else if (e.keyCode === 32) {
                hardDrop();
            }
        }
    }

    document.addEventListener('keydown', control);

    // Hard drop
    function hardDrop() {
        undraw();
        while (!current.some(index => squares[currentPosition + index + width].classList.contains('taken'))) {
            currentPosition += width;
        }
        draw();
        freeze();
    }

    // Pause functionality
    pauseButton.addEventListener('click', () => {
        if (!isPaused) {
            clearInterval(timerId);
            backgroundMusic.pause();
            isPaused = true;
        } else {
            timerId = setInterval(moveDown, Math.max(100, 1000 - level * 100));
            backgroundMusic.play();
            isPaused = false;
        }
    });

    // Start game
    startButton.addEventListener('click', () => {
        if (timerId) {
            return;
        }
        draw();
        drawGhost();
        displayNextTetromino();
        timerId = setInterval(moveDown, Math.max(100, 1000 - level * 100));
        backgroundMusic.play();
        isPaused = false;
    });

    // Restart game
    restartButton.addEventListener('click', () => {
        // Reset variables
        squares.forEach(square => {
            square.className = '';
        });
        for (let i = squares.length - width; i < squares.length; i++) {
            squares[i].classList.add('taken');
        }
        clearInterval(timerId);
        score = 0;
        level = 1;
        scoreDisplay.innerHTML = score;
        levelDisplay.innerHTML = level;
        currentPosition = 4;
        currentRotation = 0;
        random = Math.floor(Math.random() * 7);
        nextRandom = Math.floor(Math.random() * 7);
        current = theTetrominoes[random][currentRotation];
        currentClassName = getTetrominoClassName(random);
        isGameOver = false;
        gameOverDisplay.style.display = 'none';
        startButton.click();
    });

    // Audio control
    audioButton.addEventListener('click', () => {
        if (backgroundMusic.paused) {
            backgroundMusic.play();
            audioButton.textContent = 'Mute Music';
        } else {
            backgroundMusic.pause();
            audioButton.textContent = 'Play Music';
        }
    });

    // Ghost piece
    function drawGhost() {
        undrawGhost();
        let ghostPosition = currentPosition;
        while (!current.some(index => squares[ghostPosition + index + width].classList.contains('taken'))) {
            ghostPosition += width;
        }
        current.forEach(index => {
            if (squares[ghostPosition + index] && !squares[ghostPosition + index].classList.contains('taken')) {
                squares[ghostPosition + index].classList.add('ghost');
            }
        });
    }

    function undrawGhost() {
        squares.forEach(square => {
            square.classList.remove('ghost');
        });
    }

    // Initial function calls
    displayNextTetromino();
});

