// ============================================
// SHADOW ARENA: LEGACY FIGHT
// ВЕРСИЯ: 1.0.1 (Исправлена)
// ============================================

// Глобальные настройки
let gameSettings = {
    soundVolume: 0.7,
    musicVolume: 0.5,
    vibration: true,
    difficulty: 'normal'
};

let playerData = {
    coins: 0,
    wins: 0,
    losses: 0,
    maxCombo: 0
};

// ============================================
// 1. КОНФИГУРАЦИЯ И ЗАПУСК ИГРЫ (ВАЖНО!)
// ============================================
const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: 1280,
    height: 720,
    backgroundColor: '#000000',
    scene: [BootScene, PreloadScene, MainMenu, GameScene], // Порядок важен!
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 800 },
            debug: false
        }
    }
};

// Запуск игры
const game = new Phaser.Game(config);

// ============================================
// 2. СЦЕНА: ЗАГРУЗКА ДВИЖКА (BootScene)
// ============================================
class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }
    
    preload() {
        // Здесь можно загрузить минимальные ресурсы для заставки
    }
    
    create() {
        console.log('BootScene запущена');
        // Немедленно переходим к загрузке ресурсов
        this.scene.start('PreloadScene');
    }
}

// ============================================
// 3. СЦЕНА: ЗАГРУЗКА РЕСУРСОВ (PreloadScene)
// ============================================
class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
        this.loadingBar = null;
    }
    
    preload() {
        console.log('PreloadScene: начало загрузки');
        
        // Создаем полоску загрузки
        this.createLoadingBar();
        
        // Загружаем КРИТИЧЕСКИ важное - фоны
        this.load.image('menu_bg', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
        this.load.image('arena_bg', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
        
        // Загружаем игроков как цветные прямоугольники (тестовые спрайты)
        this.load.spritesheet('player', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAXklEQVR42u3QMQ0AAAgDsHf/aD3uAAIq5AqJqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAAB8GQH2UAECp1Zh4wAAAABJRU5ErkJggg==', {
            frameWidth: 64,
            frameHeight: 128
        });
        
        this.load.spritesheet('enemy', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAXklEQVR42u3QMQ0AAAgDsHf/aD3uAAIq5AqJqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAAB8GQH2UAECp1Zh4wAAAABJRU5ErkJggg==', {
            frameWidth: 64,
            frameHeight: 128
        });
        
        // Обновляем полоску загрузки
        this.load.on('progress', (value) => {
            if (this.loadingBar) {
                this.loadingBar.width = 400 * value;
            }
        });
        
        // Когда всё загружено - запускаем меню
        this.load.on('complete', () => {
            console.log('PreloadScene: все ресурсы загружены');
            this.createAnimations();
            this.time.delayedCall(500, () => {
                this.scene.start('MainMenu');
            });
        });
    }
    
    createLoadingBar() {
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
        
        // Фон полоски
        this.add.rectangle(centerX, centerY, 404, 34, 0x000000).setOrigin(0.5);
        this.add.rectangle(centerX, centerY, 400, 30, 0x333333).setOrigin(0.5);
        
        // Сама полоска
        this.loadingBar = this.add.rectangle(centerX - 200, centerY, 0, 20, 0xff4444).setOrigin(0, 0.5);
        
        // Текст
        this.add.text(centerX, centerY - 50, 'SHADOW ARENA', {
            fontSize: '48px',
            fill: '#ff4444',
            fontFamily: 'Press Start 2P'
        }).setOrigin(0.5);
        
        this.add.text(centerX, centerY + 50, 'Загрузка...', {
            fontSize: '20px',
            fill: '#cccccc',
            fontFamily: 'Press Start 2P'
        }).setOrigin(0.5);
    }
    
    createAnimations() {
        // Анимация для игрока
        this.anims.create({
            key: 'player_idle',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 0 }),
            frameRate: 1,
            repeat: -1
        });
        
        // Анимация для врага
        this.anims.create({
            key: 'enemy_idle',
            frames: this.anims.generateFrameNumbers('enemy', { start: 0, end: 0 }),
            frameRate: 1,
            repeat: -1
        });
        
        console.log('PreloadScene: анимации созданы');
    }
}

// ============================================
// 4. СЦЕНА: ГЛАВНОЕ МЕНЮ (MainMenu)
// ============================================
class MainMenu extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenu' });
    }
    
    create() {
        console.log('MainMenu запущено');
        
        // Фон
        this.add.image(640, 360, 'menu_bg').setAlpha(0.7);
        this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.5);
        
        // Заголовок
        this.add.text(640, 150, 'SHADOW ARENA', {
            fontSize: '72px',
            fill: '#ff4444',
            fontFamily: 'Press Start 2P',
            stroke: '#000',
            strokeThickness: 10
        }).setOrigin(0.5);
        
        this.add.text(640, 220, 'LEGACY FIGHT', {
            fontSize: '36px',
            fill: '#ffffff',
            fontFamily: 'Press Start 2P',
            stroke: '#000',
            strokeThickness: 6
        }).setOrigin(0.5);
        
        // Кнопка "Начать бой"
        const startButton = this.add.text(640, 350, 'НАЧАТЬ БОЙ', {
            fontSize: '32px',
            fill: '#ffffff',
            fontFamily: 'Press Start 2P',
            backgroundColor: '#ff4444',
            padding: { x: 30, y: 15 },
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        startButton.on('pointerover', () => {
            startButton.setBackgroundColor('#ff6666');
        });
        
        startButton.on('pointerout', () => {
            startButton.setBackgroundColor('#ff4444');
        });
        
        startButton.on('pointerdown', () => {
            startButton.setScale(0.95);
        });
        
        startButton.on('pointerup', () => {
            startButton.setScale(1.0);
            console.log('Запуск игры...');
            this.scene.start('GameScene');
        });
        
        // Статистика
        this.add.text(640, 500, `ПОБЕД: ${playerData.wins} | ПОРАЖЕНИЙ: ${playerData.losses}`, {
            fontSize: '20px',
            fill: '#cccccc',
            fontFamily: 'Press Start 2P'
        }).setOrigin(0.5);
        
        // Управление
        this.add.text(640, 600, 'УПРАВЛЕНИЕ: СТРЕЛКИ + A/S/D ИЛИ КАСАНИЯ', {
            fontSize: '14px',
            fill: '#888888',
            fontFamily: 'Press Start 2P'
        }).setOrigin(0.5);
    }
}

// ============================================
// 5. СЦЕНА: ИГРОВОЙ ПРОЦЕСС (GameScene)
// ============================================
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.player = null;
        this.enemy = null;
        this.cursors = null;
        this.keys = null;
        this.isGameOver = false;
        this.playerHealth = 100;
        this.enemyHealth = 100;
    }
    
    create() {
        console.log('GameScene запущена');
        
        // Фон
        this.add.image(640, 360, 'arena_bg');
        
        // Создание игрока
        this.player = this.physics.add.sprite(320, 500, 'player');
        this.player.setCollideWorldBounds(true);
        this.player.setBounce(0.1);
        this.player.setSize(40, 100);
        this.player.setOffset(12, 28);
        this.player.play('player_idle');
        
        // Создание врага
        this.enemy = this.physics.add.sprite(960, 500, 'enemy');
        this.enemy.setCollideWorldBounds(true);
        this.enemy.setBounce(0.1);
        this.enemy.setSize(40, 100);
        this.enemy.setOffset(12, 28);
        this.enemy.play('enemy_idle');
        
        // Столкновения
        this.physics.add.collider(this.player, this.enemy);
        
        // Полоски здоровья
        this.createHealthBars();
        
        // Управление для ПК
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys({
            a: Phaser.Input.Keyboard.KeyCodes.A,
            s: Phaser.Input.Keyboard.KeyCodes.S,
            d: Phaser.Input.Keyboard.KeyCodes.D,
            w: Phaser.Input.Keyboard.KeyCodes.W,
            space: Phaser.Input.Keyboard.KeyCodes.SPACE
        });
        
        // Управление для телефона
        this.setupMobileControls();
        
        // Кнопка паузы
        this.createPauseButton();
        
        // ИИ врага (очень простой)
        this.setupEnemyAI();
        
        // Имена игроков
        this.add.text(200, 50, 'ИГРОК', {
            fontSize: '24px',
            fill: '#ff4444',
            fontFamily: 'Press Start 2P',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        this.add.text(1080, 50, 'ПРОТИВНИК', {
            fontSize: '24px',
            fill: '#4444ff',
            fontFamily: 'Press Start 2P',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        // Инструкция
        this.add.text(640, 680, '←→ ДВИЖЕНИЕ | A: ЛЕГКИЙ УДАР | S: ТЯЖЕЛЫЙ УДАР | D: БЛОК', {
            fontSize: '12px',
            fill: '#888888',
            fontFamily: 'Press Start 2P'
        }).setOrigin(0.5);
    }
    
    createHealthBars() {
        // Полоска здоровья игрока
        this.playerHealthBar = this.add.graphics();
        this.updateHealthBar('player', this.playerHealth);
        
        // Полоска здоровья врага
        this.enemyHealthBar = this.add.graphics();
        this.updateHealthBar('enemy', this.enemyHealth);
    }
    
    updateHealthBar(who, health) {
        const bar = who === 'player' ? this.playerHealthBar : this.enemyHealthBar;
        const x = who === 'player' ? 100 : 1180;
        const width = 200;
        
        bar.clear();
        
        // Фон (черный)
        bar.fillStyle(0x000000, 1);
        bar.fillRect(x - 2, 28, width + 4, 24);
        
        // Фон (серый)
        bar.fillStyle(0x333333, 1);
        bar.fillRect(x, 30, width, 20);
        
        // Здоровье (цвет меняется)
        let color;
        if (health > 60) color = 0x00ff00;
        else if (health > 30) color = 0xffff00;
        else color = 0xff0000;
        
        bar.fillStyle(color, 1);
        bar.fillRect(x, 30, (width * health) / 100, 20);
    }
    
    setupMobileControls() {
        this.input.on('pointerdown', (pointer) => {
            // Если касание в правой половине экрана - это атака
            if (pointer.x > 640) {
                if (pointer.y < 360) {
                    this.performJumpAttack(this.player);
                } else {
                    if (Math.random() > 0.5) {
                        this.performLightAttack(this.player);
                    } else {
                        this.performHeavyAttack(this.player);
                    }
                }
            }
        });
    }
    
    createPauseButton() {
        const pauseButton = this.add.text(1240, 40, 'II', {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Press Start 2P',
            backgroundColor: '#333333',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        pauseButton.on('pointerdown', () => {
            this.scene.pause();
            this.showPauseMenu();
        });
    }
    
    showPauseMenu() {
        const overlay = this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.7);
        
        const title = this.add.text(640, 200, 'ПАУЗА', {
            fontSize: '48px',
            fill: '#ffff00',
            fontFamily: 'Press Start 2P',
            stroke: '#000',
            strokeThickness: 6
        }).setOrigin(0.5);
        
        const continueButton = this.add.text(640, 300, 'ПРОДОЛЖИТЬ', {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Press Start 2P',
            backgroundColor: '#ff4444',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        continueButton.on('pointerdown', () => {
            overlay.destroy();
            title.destroy();
            continueButton.destroy();
            menuButton.destroy();
            this.scene.resume();
        });
        
        const menuButton = this.add.text(640, 380, 'В МЕНЮ', {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Press Start 2P',
            backgroundColor: '#444444',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        menuButton.on('pointerdown', () => {
            this.scene.stop('GameScene');
            this.scene.start('MainMenu');
        });
    }
    
    setupEnemyAI() {
        this.time.addEvent({
            delay: 1500,
            callback: () => {
                if (this.isGameOver) return;
                
                const distance = Phaser.Math.Distance.Between(
                    this.player.x, this.player.y,
                    this.enemy.x, this.enemy.y
                );
                
                if (distance < 150) {
                    if (Math.random() > 0.7) {
                        this.performHeavyAttack(this.enemy);
                    } else {
                        this.performLightAttack(this.enemy);
                    }
                } else {
                    // Двигаться к игроку
                    if (this.player.x < this.enemy.x) {
                        this.enemy.setVelocityX(-100);
                    } else {
                        this.enemy.setVelocityX(100);
                    }
                }
            },
            loop: true
        });
    }
    
    performLightAttack(attacker) {
        const isPlayer = attacker === this.player;
        const target = isPlayer ? this.enemy : this.player;
        
        // Нанесение урона
        if (isPlayer) {
            this.enemyHealth -= 10;
            this.updateHealthBar('enemy', this.enemyHealth);
        } else {
            this.playerHealth -= 10;
            this.updateHealthBar('player', this.playerHealth);
        }
        
        // Эффект попадания
        this.createHitEffect(target.x, target.y);
        
        // Проверка смерти
        if (this.enemyHealth <= 0 || this.playerHealth <= 0) {
            this.gameOver(isPlayer ? 'player' : 'enemy');
        }
    }
    
    performHeavyAttack(attacker) {
        const isPlayer = attacker === this.player;
        const target = isPlayer ? this.enemy : this.player;
        
        // Нанесение урона
        if (isPlayer) {
            this.enemyHealth -= 20;
            this.updateHealthBar('enemy', this.enemyHealth);
        } else {
            this.playerHealth -= 20;
            this.updateHealthBar('player', this.playerHealth);
        }
        
        // Эффект попадания
        this.createHitEffect(target.x, target.y, true);
        
        // Отбрасывание
        const direction = isPlayer ? 1 : -1;
        target.setVelocityX(200 * direction);
        
        // Проверка смерти
        if (this.enemyHealth <= 0 || this.playerHealth <= 0) {
            this.gameOver(isPlayer ? 'player' : 'enemy');
        }
    }
    
    performJumpAttack(attacker) {
        if (!attacker.body.onFloor()) return;
        
        attacker.setVelocityY(-400);
        
        this.time.delayedCall(300, () => {
            if (this.isGameOver) return;
            
            const isPlayer = attacker === this.player;
            const target = isPlayer ? this.enemy : this.player;
            
            if (isPlayer) {
                this.enemyHealth -= 15;
                this.updateHealthBar('enemy', this.enemyHealth);
            } else {
                this.playerHealth -= 15;
                this.updateHealthBar('player', this.playerHealth);
            }
            
            this.createHitEffect(target.x, target.y);
            
            if (this.enemyHealth <= 0 || this.playerHealth <= 0) {
                this.gameOver(isPlayer ? 'player' : 'enemy');
            }
        });
    }
    
    createHitEffect(x, y, isHeavy = false) {
        const size = isHeavy ? 40 : 25;
        const effect = this.add.circle(x, y, size, 0xffffff, 0.7);
        
        this.tweens.add({
            targets: effect,
            radius: 0,
            alpha: 0,
            duration: 200,
            onComplete: () => effect.destroy()
        });
    }
    
    gameOver(winner) {
        if (this.isGameOver) return;
        
        this.isGameOver = true;
        this.physics.pause();
        
        const isPlayerWin = winner === 'player';
        
        // Обновляем статистику
        if (isPlayerWin) {
            playerData.wins++;
            playerData.coins += 50;
        } else {
            playerData.losses++;
            playerData.coins += 10;
        }
        
        // Текст победы
        const winText = isPlayerWin ? 'ПОБЕДА!' : 'ПОРАЖЕНИЕ!';
        const color = isPlayerWin ? '#00ff00' : '#ff0000';
        
        this.add.text(640, 200, winText, {
            fontSize: '64px',
            fill: color,
            fontFamily: 'Press Start 2P',
            stroke: '#000',
            strokeThickness: 8
        }).setOrigin(0.5);
        
        // Кнопка реванша
        const replayButton = this.add.text(640, 350, 'РЕВАНШ', {
            fontSize: '32px',
            fill: '#ffffff',
            fontFamily: 'Press Start 2P',
            backgroundColor: '#ff4444',
            padding: { x: 30, y: 15 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        replayButton.on('pointerdown', () => {
            this.scene.restart();
        });
        
        // Кнопка в меню
        const menuButton = this.add.text(640, 450, 'В МЕНЮ', {
            fontSize: '32px',
            fill: '#ffffff',
            fontFamily: 'Press Start 2P',
            backgroundColor: '#444444',
            padding: { x: 30, y: 15 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        menuButton.on('pointerdown', () => {
            this.scene.stop('GameScene');
            this.scene.start('MainMenu');
        });
    }
    
    update() {
        if (this.isGameOver) return;
        
        // Управление игроком
        this.updatePlayer();
    }
    
    updatePlayer() {
        const speed = 200;
        
        // Движение
        if (this.cursors.left.isDown || this.keys.a.isDown) {
            this.player.setVelocityX(-speed);
        } else if (this.cursors.right.isDown || this.keys.d.isDown) {
            this.player.setVelocityX(speed);
        } else {
            this.player.setVelocityX(0);
        }
        
        // Прыжок
        if ((this.cursors.up.isDown || this.keys.w.isDown || this.keys.space.isDown) && 
            this.player.body.onFloor()) {
            this.player.setVelocityY(-400);
        }
        
        // Атаки с клавиатуры
        if (Phaser.Input.Keyboard.JustDown(this.keys.a)) {
            this.performLightAttack(this.player);
        }
        
        if (Phaser.Input.Keyboard.JustDown(this.keys.s)) {
            this.performHeavyAttack(this.player);
        }
    }
}

// ============================================
// КОНЕЦ ФАЙЛА
// ============================================
