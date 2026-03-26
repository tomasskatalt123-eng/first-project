// Game Constants
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 500;
const GROUND_Y = 350;

// Player Class
class Fighter {
    constructor(x, name, isPlayer1) {
        this.x = x;
        this.y = GROUND_Y;
        this.width = 50;
        this.height = 80;
        this.velocityY = 0;
        this.velocityX = 0;
        this.health = 100;
        this.maxHealth = 100;
        this.name = name;
        this.isPlayer1 = isPlayer1;
        this.isJumping = false;
        this.isCrouching = false;
        this.isAttacking = false;
        this.attackCooldown = 0;
        this.specialCooldown = 0;
        this.frame = 0;
    }

    takeDamage(damage) {
        this.health = Math.max(0, this.health - damage);
    }

    update() {
        // Gravity
        this.velocityY += 0.5;
        this.y += this.velocityY;

        // Ground collision
        if (this.y >= GROUND_Y) {
            this.y = GROUND_Y;
            this.velocityY = 0;
            this.isJumping = false;
        }

        // Boundary collision
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > CANVAS_WIDTH) this.x = CANVAS_WIDTH - this.width;

        // Cooldowns
        if (this.attackCooldown > 0) this.attackCooldown--;
        if (this.specialCooldown > 0) this.specialCooldown--;

        this.x += this.velocityX;
    }

    jump() {
        if (!this.isJumping) {
            this.velocityY = -15;
            this.isJumping = true;
        }
    }

    attack() {
        if (this.attackCooldown <= 0) {
            this.isAttacking = true;
            this.attackCooldown = 30;
            return true;
        }
        return false;
    }

    special() {
        if (this.specialCooldown <= 0) {
            this.specialCooldown = 80;
            return true;
        }
        return false;
    }

    draw(ctx) {
        // Body
        ctx.fillStyle = this.isPlayer1 ? '#FF6B6B' : '#4ECDC4';
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Head
        ctx.fillStyle = '#FDB8C0';
        ctx.fillRect(this.x + 12, this.y - 20, 26, 25);

        // Eyes
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x + 16, this.y - 15, 5, 5);
        ctx.fillRect(this.x + 29, this.y - 15, 5, 5);

        // Health indicator above head
        if (this.isAttacking) {
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 3;
            ctx.strokeRect(this.x - 5, this.y - 30, this.width + 10, 10);
        }
    }
}

// Game Class
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.player1 = new Fighter(100, 'Ryu', true);
        this.player2 = new Fighter(CANVAS_WIDTH - 150, 'Ken', false);
        this.gameActive = false;
        this.round = 1;

        // Input handling
        this.keys = {};
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));

        // Buttons
        document.getElementById('startBtn').addEventListener('click', () => this.start());
        document.getElementById('resetBtn').addEventListener('click', () => this.reset());
    }

    handleKeyDown(e) {
        this.keys[e.key] = true;
    }

    handleKeyUp(e) {
        this.keys[e.key] = false;
    }

    start() {
        this.gameActive = true;
        this.gameLoop();
    }

    reset() {
        this.gameActive = false;
        this.player1.health = 100;
        this.player2.health = 100;
        this.round = 1;
        this.updateHealthDisplay();
        this.draw();
    }

    handleInputs() {
        // Player 1: WASD + Space + Q
        if (this.keys['w'] || this.keys['W']) {
            this.player1.jump();
        }
        if (this.keys['a'] || this.keys['A']) {
            this.player1.velocityX = -5;
        } else if (this.keys['d'] || this.keys['D']) {
            this.player1.velocityX = 5;
        } else {
            this.player1.velocityX = 0;
        }

        if (this.keys['s'] || this.keys['S']) {
            this.player1.isCrouching = true;
        } else {
            this.player1.isCrouching = false;
        }

        if (this.keys[' ']) {
            if (this.player1.attack()) {
                this.checkHit(this.player1, this.player2);
            }
        }

        if (this.keys['q'] || this.keys['Q']) {
            if (this.player1.special()) {
                this.checkHit(this.player1, this.player2, 30);
            }
        }

        // Player 2: Arrow Keys + Enter + P
        if (this.keys['ArrowUp']) {
            this.player2.jump();
        }
        if (this.keys['ArrowLeft']) {
            this.player2.velocityX = -5;
        } else if (this.keys['ArrowRight']) {
            this.player2.velocityX = 5;
        } else {
            this.player2.velocityX = 0;
        }

        if (this.keys['ArrowDown']) {
            this.player2.isCrouching = true;
        } else {
            this.player2.isCrouching = false;
        }

        if (this.keys['Enter']) {
            if (this.player2.attack()) {
                this.checkHit(this.player2, this.player1);
            }
        }

        if (this.keys['p'] || this.keys['P']) {
            if (this.player2.special()) {
                this.checkHit(this.player2, this.player1, 30);
            }
        }
    }

    checkHit(attacker, defender, damageMultiplier = 1) {
        const distance = Math.abs(attacker.x - defender.x);
        const attackRange = 80;

        if (distance < attackRange) {
            const damage = 10 * damageMultiplier;
            defender.takeDamage(damage);
            this.updateHealthDisplay();

            if (defender.health <= 0) {
                this.gameActive = false;
                alert(`${attacker.name} wins the round!`);
            }
        }
    }

    updateHealthDisplay() {
        const p1HealthPercent = (this.player1.health / this.player1.maxHealth) * 100;
        const p2HealthPercent = (this.player2.health / this.player2.maxHealth) * 100;

        document.getElementById('player1Health').style.width = p1HealthPercent + '%';
        document.getElementById('player2Health').style.width = p2HealthPercent + '%';
        document.getElementById('player1HealthText').textContent = Math.ceil(this.player1.health);
        document.getElementById('player2HealthText').textContent = Math.ceil(this.player2.health);
    }

    update() {
        if (!this.gameActive) return;

        this.handleInputs();
        this.player1.update();
        this.player2.update();
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#001a4d';
        this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Draw ground
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);

        // Draw grid background
        this.ctx.strokeStyle = '#444';
        this.ctx.lineWidth = 1;
        for (let i = 0; i < CANVAS_WIDTH; i += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, GROUND_Y);
            this.ctx.lineTo(i, CANVAS_HEIGHT);
            this.ctx.stroke();
        }

        // Draw fighters
        this.player1.draw(this.ctx);
        this.player2.draw(this.ctx);

        // Draw status text
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.fillText('Round: ' + this.round, 20, 40);
    }

    gameLoop() {
        this.update();
        this.draw();

        if (this.gameActive) {
            requestAnimationFrame(() => this.gameLoop());
        }
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    const game = new Game();
});
