// ========================================
// SETUP
// ========================================
const canvas = document.getElementById('garden');
const ctx = canvas.getContext('2d');
const intro = document.getElementById('intro');
const counterBox = document.getElementById('counterBox');
const countNum = document.getElementById('countNum');

let width, height;
let flowers = [];
let particles = [];
let flowerCount = 0;
let firstClick = false;

// Warna bunga
const palette = {
    yellow: {
        petal: 'rgba(255, 223, 0, 0.65)',
        petalLight: 'rgba(255, 240, 150, 0.7)',
        petalDark: 'rgba(200, 170, 0, 0.5)',
        center: 'rgba(180, 130, 20, 0.7)'
    },
    green: {
        petal: 'rgba(50, 205, 50, 0.6)',
        petalLight: 'rgba(144, 238, 144, 0.7)',
        petalDark: 'rgba(34, 139, 34, 0.5)',
        center: 'rgba(60, 120, 60, 0.7)'
    },
    stem: 'rgba(60, 140, 60, 0.5)',
    leaf: 'rgba(80, 180, 80, 0.45)',
    bud: 'rgba(100, 180, 100, 0.6)'
};

// Resize
function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

// ========================================
// BUNGA CLASS - Fase pertumbuhan lengkap
// ========================================
class Flower {
    constructor(x, targetY) {
        this.x = x;
        this.targetY = targetY;
        
        // Tinggi total tanaman
        this.maxStemHeight = height - targetY + 30;
        this.stemHeight = 0;
        this.stemGrowthSpeed = 2.5 + Math.random() * 1.5;
        
        // Fase: 'sprout' -> 'growing' -> 'budding' -> 'blooming' -> 'bloomed'
        this.phase = 'sprout';
        this.phaseProgress = 0;
        
        // Properti bunga
        this.colorType = Math.random() < 0.55 ? 'yellow' : 'green';
        this.petalCount = 5 + Math.floor(Math.random() * 3);
        this.petalLength = 22 + Math.random() * 18;
        this.petalWidth = 12 + Math.random() * 8;
        
        // Rotasi & gerakan
        this.rotation = Math.random() * Math.PI * 2;
        this.swayPhase = Math.random() * Math.PI * 2;
        this.swaySpeed = 0.008 + Math.random() * 0.006;
        
        // Daun
        this.leaves = [];
        this.leafCount = 1 + Math.floor(Math.random() * 2);
        this.generateLeaves();
        
        // Tunas & mekar
        this.budSize = 0;
        this.bloomProgress = 0;
        this.bloomSpeed = 0.012 + Math.random() * 0.008;
    }
    
    generateLeaves() {
        for (let i = 0; i < this.leafCount; i++) {
            this.leaves.push({
                heightRatio: 0.3 + Math.random() * 0.4,
                side: Math.random() < 0.5 ? -1 : 1,
                size: 12 + Math.random() * 10,
                angle: 0.3 + Math.random() * 0.3,
                growth: 0
            });
        }
    }
    
    update() {
        const time = performance.now() * 0.001;
        this.swayPhase += this.swaySpeed;
        
        // Fase SPROUT - tunas muncul dari tanah
        if (this.phase === 'sprout') {
            this.phaseProgress += 0.025;
            if (this.phaseProgress >= 1) {
                this.phase = 'growing';
                this.phaseProgress = 0;
            }
        }
        
        // Fase GROWING - batang tumbuh ke atas
        else if (this.phase === 'growing') {
            this.stemHeight += this.stemGrowthSpeed;
            
            // Daun mulai tumbuh saat batang cukup tinggi
            this.leaves.forEach(leaf => {
                if (this.stemHeight > this.maxStemHeight * leaf.heightRatio) {
                    leaf.growth = Math.min(1, leaf.growth + 0.02);
                }
            });
            
            if (this.stemHeight >= this.maxStemHeight) {
                this.stemHeight = this.maxStemHeight;
                this.phase = 'budding';
                this.phaseProgress = 0;
            }
        }
        
        // Fase BUDDING - tunas bunga muncul
        else if (this.phase === 'budding') {
            this.budSize = Math.min(1, this.budSize + 0.015);
            if (this.budSize >= 1) {
                this.phase = 'blooming';
            }
        }
        
        // Fase BLOOMING - bunga mekar
        else if (this.phase === 'blooming') {
            this.bloomProgress += this.bloomSpeed;
            if (this.bloomProgress >= 1) {
                this.bloomProgress = 1;
                this.phase = 'bloomed';
            }
        }
        
        // Rotasi pelan saat sudah mekar
        if (this.phase === 'bloomed') {
            this.rotation += 0.0005;
        }
    }
    
    draw() {
        const sway = Math.sin(this.swayPhase) * 4;
        const stemTopY = height - this.stemHeight;
        
        ctx.save();
        
        // === 1. GAMBAR BATANG ===
        if (this.stemHeight > 0) {
            this.drawStem(sway, stemTopY);
        }
        
        // === 2. GAMBAR DAUN ===
        if (this.stemHeight > 50) {
            this.drawLeaves(sway);
        }
        
        // === 3. GAMBAR TUNAS/BUNGA ===
        if (this.phase === 'sprout') {
            this.drawSprout();
        } else if (this.phase === 'budding' || this.phase === 'blooming' || this.phase === 'bloomed') {
            this.drawFlowerHead(sway, stemTopY);
        }
        
        ctx.restore();
    }
    
    drawStem(sway, stemTopY) {
        ctx.beginPath();
        ctx.moveTo(this.x, height);
        
        // Batang melengkung natural
        const cp1x = this.x + sway * 0.3;
        const cp1y = height - this.stemHeight * 0.4;
        const cp2x = this.x + sway * 0.6;
        const cp2y = stemTopY + this.stemHeight * 0.3;
        const endX = this.x + sway * 0.8;
        
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, stemTopY);
        
        ctx.strokeStyle = palette.stem;
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.stroke();
    }
    
    drawLeaves(sway) {
        this.leaves.forEach(leaf => {
            if (leaf.growth <= 0) return;
            
            const leafY = height - this.stemHeight * leaf.heightRatio;
            const leafX = this.x + sway * (1 - leaf.heightRatio) * 0.5;
            const size = leaf.size * leaf.growth;
            
            ctx.save();
            ctx.translate(leafX, leafY);
            ctx.rotate(leaf.angle * leaf.side);
            
            // Bentuk daun
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(size * 0.5 * leaf.side, -size * 0.4, size * leaf.side, 0);
            ctx.quadraticCurveTo(size * 0.5 * leaf.side, size * 0.4, 0, 0);
            
            ctx.fillStyle = palette.leaf;
            ctx.fill();
            
            // Tulang daun
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(size * 0.7 * leaf.side, 0);
            ctx.strokeStyle = 'rgba(60, 120, 60, 0.3)';
            ctx.lineWidth = 0.5;
            ctx.stroke();
            
            ctx.restore();
        });
    }
    
    drawSprout() {
        // Tunas kecil muncul dari tanah
        const sproutHeight = 15 * this.phaseProgress;
        const sproutWidth = 6 + 4 * this.phaseProgress;
        
        ctx.save();
        ctx.translate(this.x, height - 5);
        
        // Dua helai tunas
        for (let i = 0; i < 2; i++) {
            ctx.save();
            ctx.rotate((i === 0 ? -1 : 1) * 0.3);
            
            ctx.beginPath();
            ctx.ellipse(0, -sproutHeight / 2, sproutWidth / 2, sproutHeight, 0, 0, Math.PI * 2);
            ctx.fillStyle = palette.bud;
            ctx.fill();
            
            ctx.restore();
        }
        
        ctx.restore();
    }
    
    drawFlowerHead(sway, stemTopY) {
        const colors = palette[this.colorType];
        const headX = this.x + sway * 0.8;
        const headY = stemTopY;
        
        ctx.save();
        ctx.translate(headX, headY);
        
        // Tunas (belum mekar penuh)
        if (this.phase === 'budding') {
            const budW = 12 * this.budSize;
            const budH = 18 * this.budSize;
            
            ctx.beginPath();
            ctx.ellipse(0, -budH / 2, budW, budH, 0, 0, Math.PI * 2);
            ctx.fillStyle = colors.petalDark;
            ctx.fill();
            
            // Lipatan tunas
            for (let i = 0; i < 3; i++) {
                ctx.save();
                ctx.rotate(i * Math.PI * 2 / 3);
                ctx.beginPath();
                ctx.ellipse(0, -budH * 0.6, budW * 0.4, budH * 0.5, 0, 0, Math.PI);
                ctx.fillStyle = colors.petal;
                ctx.fill();
                ctx.restore();
            }
        }
        
        // Mekar
        else {
            const openFactor = this.bloomProgress;
            const petalLen = this.petalLength * openFactor;
            const petalWid = this.petalWidth * openFactor;
            
            // Kelopak luar
            for (let i = 0; i < this.petalCount; i++) {
                const angle = (i / this.petalCount) * Math.PI * 2 + this.rotation;
                const spreadAngle = 0.25 * openFactor;
                
                ctx.save();
                ctx.rotate(angle);
                ctx.translate(0, -5);
                ctx.rotate(spreadAngle);
                
                ctx.beginPath();
                ctx.ellipse(0, -petalLen / 2, petalWid / 2, petalLen / 2, 0, 0, Math.PI * 2);
                ctx.fillStyle = colors.petal;
                ctx.fill();
                
                // Highlight
                ctx.beginPath();
                ctx.ellipse(-petalWid * 0.15, -petalLen * 0.35, petalWid * 0.2, petalLen * 0.3, -0.2, 0, Math.PI * 2);
                ctx.fillStyle = colors.petalLight;
                ctx.fill();
                
                ctx.restore();
            }
            
            // Kelopak dalam (lebih kecil)
            if (openFactor > 0.3) {
                const innerPetalLen = petalLen * 0.6;
                const innerPetalWid = petalWid * 0.5;
                
                for (let i = 0; i < this.petalCount; i++) {
                    const angle = (i / this.petalCount) * Math.PI * 2 + this.rotation + Math.PI / this.petalCount;
                    
                    ctx.save();
                    ctx.rotate(angle);
                    ctx.translate(0, -3);
                    
                    ctx.beginPath();
                    ctx.ellipse(0, -innerPetalLen / 2, innerPetalWid / 2, innerPetalLen / 2, 0, 0, Math.PI * 2);
                    ctx.fillStyle = colors.petalLight;
                    ctx.fill();
                    
                    ctx.restore();
                }
            }
            
            // Pusat bunga
            if (openFactor > 0.5) {
                const centerSize = 6 * openFactor;
                
                ctx.beginPath();
                ctx.arc(0, 0, centerSize, 0, Math.PI * 2);
                ctx.fillStyle = colors.center;
                ctx.fill();
                
                // Detail pusat
                if (openFactor > 0.8) {
                    for (let i = 0; i < 6; i++) {
                        const dotAngle = (i / 6) * Math.PI * 2 + this.rotation;
                        const dotX = Math.cos(dotAngle) * centerSize * 0.5;
                        const dotY = Math.sin(dotAngle) * centerSize * 0.5;
                        
                        ctx.beginPath();
                        ctx.arc(dotX, dotY, 1.5, 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(255, 255, 200, 0.5)';
                        ctx.fill();
                    }
                }
            }
        }
        
        ctx.restore();
    }
}

// ========================================
// PARTIKEL AMBIENT
// ========================================
class Particle {
    constructor() {
        this.reset();
    }
    
    reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = 0.5 + Math.random() * 1.5;
        this.speedY = -(0.15 + Math.random() * 0.25);
        this.speedX = (Math.random() - 0.5) * 0.15;
        this.opacity = 0.1 + Math.random() * 0.25;
        this.color = Math.random() < 0.5 
            ? `rgba(255, 230, 100, ${this.opacity})`
            : `rgba(120, 220, 120, ${this.opacity})`;
    }
    
    update() {
        this.y += this.speedY;
        this.x += this.speedX;
        
        if (this.y < -10) {
            this.reset();
            this.y = height + 10;
        }
    }
    
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

// Inisialisasi partikel
for (let i = 0; i < 25; i++) {
    particles.push(new Particle());
}

// ========================================
// EFEK KLIK (RIPPLE)
// ========================================
function createRipple(x, y) {
    const ripple = document.createElement('div');
    ripple.className = 'ripple';
    const size = 100 + Math.random() * 50;
    ripple.style.width = size + 'px';
    ripple.style.height = size + 'px';
    ripple.style.left = (x - size / 2) + 'px';
    ripple.style.top = (y - size / 2) + 'px';
    ripple.style.background = Math.random() < 0.5 
        ? 'radial-gradient(circle, rgba(255,223,0,0.3), transparent)'
        : 'radial-gradient(circle, rgba(100,220,100,0.3), transparent)';
    document.body.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 800);
}

// ========================================
// EVENT HANDLER
// ========================================
function handleClick(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    // Sembunyikan intro
    if (!firstClick) {
        firstClick = true;
        intro.classList.add('hide');
        setTimeout(() => counterBox.classList.add('show'), 400);
    }
    
    // Buat bunga baru
    const flower = new Flower(x, y);
    flowers.push(flower);
    
    // Update counter
    flowerCount++;
    countNum.textContent = flowerCount;
    
    // Efek ripple
    createRipple(clientX, clientY);
}

// Mouse click
canvas.addEventListener('click', (e) => {
    handleClick(e.clientX, e.clientY);
});

// Touch (mobile)
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleClick(touch.clientX, touch.clientY);
}, { passive: false });

// ========================================
// ANIMATION LOOP
// ========================================
function animate() {
    ctx.clearRect(0, 0, width, height);
    
    // Partikel
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    
    // Bunga
    flowers.forEach(f => {
        f.update();
        f.draw();
    });
    
    requestAnimationFrame(animate);
}

animate();
