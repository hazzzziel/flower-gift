// Canvas Setup
const canvas = document.getElementById('flowerCanvas');
const ctx = canvas.getContext('2d');

// State
let flowers = [];
let flowerCount = 0;
let hasClicked = false;

// Elements
const introScreen = document.getElementById('introScreen');
const flowerCountEl = document.getElementById('flowerCount');
const hiddenMessage = document.getElementById('hiddenMessage');

// Resize canvas
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Color palette - yellow and bright green with transparency
const colors = {
    yellow: {
        light: 'rgba(255, 230, 100, 0.7)',
        main: 'rgba(255, 215, 0, 0.6)',
        dark: 'rgba(218, 165, 32, 0.5)'
    },
    green: {
        light: 'rgba(144, 238, 144, 0.7)',
        main: 'rgba(50, 205, 50, 0.6)',
        dark: 'rgba(34, 139, 34, 0.5)'
    },
    stem: 'rgba(34, 139, 34, 0.4)',
    leaf: 'rgba(50, 205, 50, 0.5)'
};

// Flower class
class Flower {
    constructor(x, y) {
        this.x = x;
        this.targetY = y;
        this.currentY = canvas.height + 100;
        this.petalCount = Math.floor(Math.random() * 3) + 5; // 5-7 petals
        this.petalSize = Math.random() * 20 + 25;
        this.colorType = Math.random() > 0.5 ? 'yellow' : 'green';
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.01;
        this.growth = 0;
        this.maxGrowth = 1;
        this.growthSpeed = Math.random() * 0.015 + 0.01;
        this.stemHeight = canvas.height - y + 50;
        this.currentStemHeight = 0;
        this.swayOffset = Math.random() * Math.PI * 2;
        this.swaySpeed = Math.random() * 0.02 + 0.01;
        this.leafCount = Math.floor(Math.random() * 2) + 1;
        this.leaves = [];
        this.hasLeaves = false;
        
        // Generate leaf positions
        for (let i = 0; i < this.leafCount; i++) {
            this.leaves.push({
                height: Math.random() * 0.5 + 0.3,
                side: Math.random() > 0.5 ? 1 : -1,
                size: Math.random() * 15 + 10
            });
        }
    }
    
    update() {
        // Stem growing
        if (this.currentStemHeight < this.stemHeight) {
            this.currentStemHeight += 8;
            if (this.currentStemHeight > this.stemHeight) {
                this.currentStemHeight = this.stemHeight;
            }
        }
        
        // Flower position
        this.currentY = this.targetY;
        
        // Growth animation
        if (this.growth < this.maxGrowth) {
            this.growth += this.growthSpeed;
            if (this.growth > this.maxGrowth) {
                this.growth = this.maxGrowth;
            }
        }
        
        // Gentle rotation
        this.rotation += this.rotationSpeed;
        
        // Leaves appear after stem grows
        if (this.currentStemHeight > this.stemHeight * 0.5 && !this.hasLeaves) {
            this.hasLeaves = true;
        }
    }
    
    draw() {
        const time = Date.now() * 0.001;
        const sway = Math.sin(time * this.swaySpeed + this.swayOffset) * 3;
        
        ctx.save();
        ctx.translate(this.x + sway, this.currentY);
        
        // Draw stem
        if (this.currentStemHeight > 0) {
            ctx.beginPath();
            ctx.moveTo(0, 0);
            
            // Curved stem
            const controlX = sway * 0.3;
            const stemEnd = Math.min(this.currentStemHeight, this.stemHeight);
            
            ctx.quadraticCurveTo(
                controlX, 
                stemEnd * 0.5, 
                sway * 0.5, 
                stemEnd
            );
            
            ctx.strokeStyle = colors.stem;
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Draw leaves
            if (this.hasLeaves) {
                this.leaves.forEach(leaf => {
                    const leafY = stemEnd * leaf.height;
                    ctx.save();
                    ctx.translate(sway * 0.3 * leaf.height, leafY);
                    ctx.rotate(leaf.side * 0.5);
                    this.drawLeaf(leaf.size);
                    ctx.restore();
                });
            }
        }
        
        // Draw flower head (only after growth starts)
        if (this.growth > 0) {
            ctx.save();
            ctx.translate(sway * 0.1, -this.currentStemHeight * 0.02);
            this.drawFlowerHead();
            ctx.restore();
        }
        
        ctx.restore();
    }
    
    drawLeaf(size) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(size * 0.5, -size * 0.3, size, 0);
        ctx.quadraticCurveTo(size * 0.5, size * 0.3, 0, 0);
        ctx.fillStyle = colors.leaf;
        ctx.fill();
    }
    
    drawFlowerHead() {
        const color = colors[this.colorType];
        const size = this.petalSize * this.growth;
        
        // Outer petals
        for (let i = 0; i < this.petalCount; i++) {
            const angle = (i / this.petalCount) * Math.PI * 2 + this.rotation;
            const petalX = Math.cos(angle) * size * 0.8;
            const petalY = Math.sin(angle) * size * 0.8;
            
            ctx.save();
            ctx.translate(petalX, petalY);
            ctx.rotate(angle);
            
            ctx.beginPath();
            ctx.ellipse(0, 0, size * 0.4, size * 0.8, 0, 0, Math.PI * 2);
            ctx.fillStyle = color.main;
            ctx.fill();
            
            // Petal detail
            ctx.beginPath();
            ctx.ellipse(0, size * 0.1, size * 0.15, size * 0.4, 0, 0, Math.PI * 2);
            ctx.fillStyle = color.light;
            ctx.fill();
            
            ctx.restore();
        }
        
        // Inner petals (layered)
        for (let i = 0; i < this.petalCount; i++) {
            const angle = (i / this.petalCount) * Math.PI * 2 + this.rotation + Math.PI / this.petalCount;
            const petalX = Math.cos(angle) * size * 0.4;
            const petalY = Math.sin(angle) * size * 0.4;
            
            ctx.save();
            ctx.translate(petalX, petalY);
            ctx.rotate(angle);
            
            ctx.beginPath();
            ctx.ellipse(0, 0, size * 0.25, size * 0.5, 0, 0, Math.PI * 2);
            ctx.fillStyle = color.light;
            ctx.fill();
            
            ctx.restore();
        }
        
        // Center
        const centerSize = Math.max(1, size * 0.25);
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, centerSize);
        gradient.addColorStop(0, 'rgba(255, 255, 200, 0.9)');
        gradient.addColorStop(0.5, 'rgba(255, 215, 0, 0.7)');
        gradient.addColorStop(1, 'rgba(218, 165, 32, 0.5)');
        
        ctx.beginPath();
        ctx.arc(0, 0, centerSize, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Center dots
        for (let i = 0; i < 8; i++) {
            const dotAngle = (i / 8) * Math.PI * 2;
            const dotX = Math.cos(dotAngle) * centerSize * 0.5;
            const dotY = Math.sin(dotAngle) * centerSize * 0.5;
            
            ctx.beginPath();
            ctx.arc(dotX, dotY, Math.max(1, centerSize * 0.15), 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(139, 90, 43, 0.6)';
            ctx.fill();
        }
    }
}

// Create sparkles on click
function createSparkles(x, y) {
    const sparkCount = 5;
    for (let i = 0; i < sparkCount; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'click-sparkle';
        sparkle.style.left = (x + (Math.random() - 0.5) * 30) + 'px';
        sparkle.style.top = (y + (Math.random() - 0.5) * 30) + 'px';
        sparkle.style.background = Math.random() > 0.5 
            ? colors.yellow.main 
            : colors.green.main;
        document.body.appendChild(sparkle);
        
        setTimeout(() => sparkle.remove(), 600);
    }
}

// Click handler
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Hide intro screen on first click
    if (!hasClicked) {
        hasClicked = true;
        introScreen.classList.add('hidden');
    }
    
    // Create flower
    const flower = new Flower(x, y);
    flowers.push(flower);
    
    // Update counter
    flowerCount++;
    flowerCountEl.textContent = flowerCount;
    
    // Show hidden message after 5 flowers
    if (flowerCount === 5) {
        hiddenMessage.classList.add('visible');
    }
    
    // Change message after more flowers
    if (flowerCount === 15) {
        hiddenMessage.style.opacity = '0';
        setTimeout(() => {
            hiddenMessage.textContent = 'Terima kasih sudah hadir dalam hidupku';
            hiddenMessage.style.opacity = '1';
        }, 500);
    }
    
    if (flowerCount === 30) {
        hiddenMessage.style.opacity = '0';
        setTimeout(() => {
            hiddenMessage.textContent = 'Selamanya akan kutinggal kan bunga untukmu';
            hiddenMessage.style.opacity = '1';
        }, 500);
    }
    
    // Create sparkles
    createSparkles(e.clientX, e.clientY);
});

// Animation loop
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update and draw flowers
    flowers.forEach(flower => {
        flower.update();
        flower.draw();
    });
    
    requestAnimationFrame(animate);
}

// Start animation
animate();

// Add some ambient particles
class Particle {
    constructor() {
        this.reset();
    }
    
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedY = -Math.random() * 0.3 - 0.1;
        this.speedX = (Math.random() - 0.5) * 0.2;
        this.opacity = Math.random() * 0.3 + 0.1;
        this.color = Math.random() > 0.5 ? colors.yellow.main : colors.green.main;
    }
    
    update() {
        this.y += this.speedY;
        this.x += this.speedX;
        
        if (this.y < -10) {
            this.reset();
            this.y = canvas.height + 10;
        }
    }
    
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, Math.max(0.5, this.size), 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

// Create ambient particles
const particles = [];
for (let i = 0; i < 30; i++) {
    particles.push(new Particle());
}

// Add particle animation to main loop
const originalAnimate = animate;
function animateWithParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw particles
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    
    // Update and draw flowers
    flowers.forEach(flower => {
        flower.update();
        flower.draw();
    });
    
    requestAnimationFrame(animateWithParticles);
}

// Override animation
cancelAnimationFrame(animate);
animateWithParticles();
