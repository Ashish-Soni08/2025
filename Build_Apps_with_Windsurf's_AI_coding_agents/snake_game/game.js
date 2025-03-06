document.addEventListener('DOMContentLoaded', () => {
    // Canvas setup
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    
    // Game constants
    const gridSize = 20;
    const gridWidth = canvas.width / gridSize;
    const gridHeight = canvas.height / gridSize;
    
    // Game variables
    let snake = [];
    let food = {
        x: 0,
        y: 0,
        moveTimer: 0,
        moveInterval: 15, // How often the food moves (in frames)
        direction: Math.floor(Math.random() * 4) // 0: up, 1: right, 2: down, 3: left
    };
    let direction = 'right';
    let nextDirection = 'right';
    let score = 0;
    let highScore = localStorage.getItem('snakeHighScore') || 0;
    let gameSpeed = 150; // milliseconds
    let gameInterval;
    let gameRunning = false;
    let frameCount = 0;
    
    // Explosion animation variables
    let explosion = {
        active: false,
        x: 0,
        y: 0,
        radius: 0,
        maxRadius: gridSize * 1.5,
        particles: [],
        duration: 0,
        maxDuration: 10
    };
    
    // Background color variables
    const backgroundColors = [
        '#f0f0f0', // Default light gray
        '#e8f4f8', // Light blue
        '#f8e8e8', // Light pink
        '#e8f8e8', // Light green
        '#f8f8e8', // Light yellow
        '#f0e8f8', // Light purple
        '#e8f0f8', // Light cyan
        '#f8e8f0', // Light magenta
        '#e8f8f0', // Light mint
        '#f0f8e8'  // Light lime
    ];
    let currentBgColorIndex = 0;
    
    // DOM elements
    const scoreElement = document.getElementById('score');
    const highScoreElement = document.getElementById('highScore');
    const restartButton = document.getElementById('restartButton');
    const body = document.querySelector('body');
    
    // Initialize high score display
    highScoreElement.textContent = highScore;
    
    // Initialize game
    function initGame() {
        // Reset snake
        snake = [
            {x: 5, y: 10},
            {x: 4, y: 10},
            {x: 3, y: 10}
        ];
        
        // Reset direction
        direction = 'right';
        nextDirection = 'right';
        
        // Reset score
        score = 0;
        scoreElement.textContent = score;
        
        // Reset background color
        currentBgColorIndex = 0;
        body.style.backgroundColor = backgroundColors[currentBgColorIndex];
        
        // Reset explosion
        explosion.active = false;
        
        // Reset frame count
        frameCount = 0;
        
        // Generate food
        generateFood();
        
        // Start game loop
        if (gameInterval) clearInterval(gameInterval);
        gameRunning = true;
        gameInterval = setInterval(gameLoop, gameSpeed);
    }
    
    // Generate food at random position
    function generateFood() {
        food.x = Math.floor(Math.random() * gridWidth);
        food.y = Math.floor(Math.random() * gridHeight);
        food.moveTimer = 0;
        food.direction = Math.floor(Math.random() * 4);
        
        // Make sure food doesn't spawn on snake
        for (let segment of snake) {
            if (segment.x === food.x && segment.y === food.y) {
                generateFood();
                break;
            }
        }
    }
    
    // Move food
    function moveFood() {
        food.moveTimer++;
        
        // Only move food at certain intervals
        if (food.moveTimer >= food.moveInterval) {
            food.moveTimer = 0;
            
            // Store previous position
            const prevX = food.x;
            const prevY = food.y;
            
            // Randomly change direction occasionally (20% chance)
            if (Math.random() < 0.2) {
                food.direction = Math.floor(Math.random() * 4);
            }
            
            // Move food based on direction
            switch (food.direction) {
                case 0: // Up
                    food.y = (food.y - 1 + gridHeight) % gridHeight;
                    break;
                case 1: // Right
                    food.x = (food.x + 1) % gridWidth;
                    break;
                case 2: // Down
                    food.y = (food.y + 1) % gridHeight;
                    break;
                case 3: // Left
                    food.x = (food.x - 1 + gridWidth) % gridWidth;
                    break;
            }
            
            // Check if food would move onto snake
            let foodOnSnake = false;
            for (let segment of snake) {
                if (segment.x === food.x && segment.y === food.y) {
                    foodOnSnake = true;
                    break;
                }
            }
            
            // If food would be on snake, revert position and change direction
            if (foodOnSnake) {
                food.x = prevX;
                food.y = prevY;
                food.direction = (food.direction + 2) % 4; // Reverse direction
            }
        }
    }
    
    // Change background color
    function changeBackgroundColor() {
        currentBgColorIndex = (currentBgColorIndex + 1) % backgroundColors.length;
        body.style.backgroundColor = backgroundColors[currentBgColorIndex];
    }
    
    // Create explosion
    function createExplosion(x, y) {
        explosion.active = true;
        explosion.x = x * gridSize + gridSize / 2;
        explosion.y = y * gridSize + gridSize / 2;
        explosion.radius = 0;
        explosion.duration = 0;
        explosion.particles = [];
        
        // Create explosion particles
        const particleCount = 12;
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 / particleCount) * i;
            const speed = 1 + Math.random() * 2;
            explosion.particles.push({
                x: explosion.x,
                y: explosion.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: 2 + Math.random() * 3,
                color: `hsl(${Math.random() * 60}, 100%, 50%)` // Yellow-orange colors
            });
        }
    }
    
    // Update explosion
    function updateExplosion() {
        if (!explosion.active) return;
        
        explosion.duration++;
        
        // Update explosion radius
        if (explosion.radius < explosion.maxRadius) {
            explosion.radius += 2;
        }
        
        // Update particles
        for (let particle of explosion.particles) {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.radius *= 0.95; // Shrink particles over time
        }
        
        // Deactivate explosion after duration
        if (explosion.duration >= explosion.maxDuration) {
            explosion.active = false;
        }
    }
    
    // Draw explosion
    function drawExplosion() {
        if (!explosion.active) return;
        
        // Draw explosion glow
        ctx.globalAlpha = 0.7 - (explosion.duration / explosion.maxDuration) * 0.7;
        ctx.fillStyle = 'rgba(255, 200, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(explosion.x, explosion.y, explosion.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw particles
        ctx.globalAlpha = 1 - (explosion.duration / explosion.maxDuration);
        for (let particle of explosion.particles) {
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Reset alpha
        ctx.globalAlpha = 1;
    }
    
    // Game loop
    function gameLoop() {
        frameCount++;
        update();
        draw();
    }
    
    // Update game state
    function update() {
        // Update explosion
        updateExplosion();
        
        // Move food
        moveFood();
        
        // Update direction
        direction = nextDirection;
        
        // Calculate new head position
        const head = {...snake[0]};
        
        switch (direction) {
            case 'up':
                head.y -= 1;
                break;
            case 'down':
                head.y += 1;
                break;
            case 'left':
                head.x -= 1;
                break;
            case 'right':
                head.x += 1;
                break;
        }
        
        // Check for wall collision
        if (head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight) {
            gameOver();
            return;
        }
        
        // Check for self collision
        for (let i = 0; i < snake.length; i++) {
            if (snake[i].x === head.x && snake[i].y === head.y) {
                gameOver();
                return;
            }
        }
        
        // Add new head
        snake.unshift(head);
        
        // Check for food collision
        if (head.x === food.x && head.y === food.y) {
            // Create explosion at food position
            createExplosion(food.x, food.y);
            
            // Increase score
            score += 10;
            scoreElement.textContent = score;
            
            // Change background color
            changeBackgroundColor();
            
            // Update high score if needed
            if (score > highScore) {
                highScore = score;
                highScoreElement.textContent = highScore;
                localStorage.setItem('snakeHighScore', highScore);
            }
            
            // Generate new food
            generateFood();
            
            // Increase speed slightly
            if (gameSpeed > 50) {
                clearInterval(gameInterval);
                gameSpeed -= 5;
                gameInterval = setInterval(gameLoop, gameSpeed);
            }
            
            // Make food move faster as score increases
            food.moveInterval = Math.max(5, 15 - Math.floor(score / 50));
        } else {
            // Remove tail if no food was eaten
            snake.pop();
        }
    }
    
    // Draw game elements
    function draw() {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw snake
        for (let i = 0; i < snake.length; i++) {
            const segment = snake[i];
            
            // Different color for head
            if (i === 0) {
                ctx.fillStyle = '#2ecc71'; // Green head
            } else {
                ctx.fillStyle = '#27ae60'; // Darker green body
            }
            
            ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
            
            // Add border to each segment
            ctx.strokeStyle = '#fff';
            ctx.strokeRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
        }
        
        // Draw food as football emoji
        ctx.font = `${gridSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⚽', food.x * gridSize + gridSize/2, food.y * gridSize + gridSize/2);
        
        // Draw explosion
        drawExplosion();
    }
    
    // Game over
    function gameOver() {
        gameRunning = false;
        clearInterval(gameInterval);
        
        // Display game over message
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.font = '30px Arial';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 15);
        
        ctx.font = '20px Arial';
        ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
        ctx.fillText('Press Restart to play again', canvas.width / 2, canvas.height / 2 + 50);
    }
    
    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        if (!gameRunning) return;
        
        switch (e.key) {
            case 'ArrowUp':
                if (direction !== 'down') nextDirection = 'up';
                break;
            case 'ArrowDown':
                if (direction !== 'up') nextDirection = 'down';
                break;
            case 'ArrowLeft':
                if (direction !== 'right') nextDirection = 'left';
                break;
            case 'ArrowRight':
                if (direction !== 'left') nextDirection = 'right';
                break;
        }
        
        // Prevent default behavior for arrow keys (page scrolling)
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault();
        }
    });
    
    // Restart button
    restartButton.addEventListener('click', initGame);
    
    // Start the game
    initGame();
});
