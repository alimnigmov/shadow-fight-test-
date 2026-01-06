// ============================================
// SHADOW ARENA: LEGACY FIGHT
// Версия 1.0.0
// Полный код игры
// ============================================

// Конфигурация Phaser
const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    parent: 'game-container',
    backgroundColor: '#000000',
    scene: [BootScene, PreloadScene, MainMenu, GameScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        min: {
            width: 800,
            height: 450
        },
        max: {
            width: 1920,
            height: 1080
        }
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 980 },
            debug: false
        }
    },
    fps: {
        target: 60,
        forceSetTimeOut: true
    },
    input: {
        activePointers: 3
    },
    render: {
        pixelArt: false,
        antialias: true,
        roundPixels: false
    }
};

// Инициализация игры
const game = new Phaser.Game(config);

// Глобальные переменные
let gameSettings = {
    soundVolume: 0.7,
    musicVolume: 0.5,
    vibration: true,
    difficulty: 'normal',
    language: 'ru'
};

let playerData = {
    level: 1,
    xp: 0,
    coins: 0,
    wins: 0,
    losses: 0,
    totalDamage: 0,
    maxCombo: 0,
    unlockedCharacters: ['shadow'],
    currentCharacter: 'shadow'
};

// ============================================
// СЦЕНА ЗАГРУЗКИ (BootScene)
// ============================================
class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Минимальные ресурсы для загрузки
        this.load.image('loading_bg', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
    }

    create() {
        console.log('BootScene: Игра загружается');
        this.scale.refresh();
        this.scene.start('PreloadScene');
    }
}

// ============================================
// СЦЕНА ПРЕДЗАГРУЗКИ (PreloadScene)
// ============================================
class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
        this.loadingBar = null;
        this.percentText = null;
    }

    preload() {
        // Создание элементов загрузки
        this.createLoadingDisplay();

        // Генерация базовых спрайтов программно
        this.generateBasicSprites();

        // Загрузка звуков (базовые)
        this.loadBasicSounds();

        // Обновление прогресса
        this.load.on('progress', (value) => {
            if (this.percentText) {
                this.percentText.setText(Math.floor(value * 100) + '%');
            }
        });

        this.load.on('complete', () => {
            console.log('PreloadScene: Все ресурсы загружены');
            this.createAnimations();
            this.time.delayedCall(500, () => {
                this.scene.start('MainMenu');
            });
        });
    }

    createLoadingDisplay() {
        // Фон
        this.add.rectangle(640, 360, 1280, 720, 0x000000);
        
        // Заголовок
        this.add.text(640, 200, 'SHADOW ARENA', {
            fontSize: '64px',
            fill: '#ff4444',
            fontFamily: 'Press Start 2P',
            stroke: '#000',
            strokeThickness: 8
        }).setOrigin(0.5);

        this.add.text(640, 270, 'LEGACY FIGHT', {
            fontSize: '32px',
            fill: '#ffffff',
            fontFamily: 'Press Start 2P',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Полоска загрузки
        this.add.rectangle(640, 360, 400, 30, 0x333333).setOrigin(0.5);
        this.loadingBar = this.add.rectangle(440, 360, 0, 20, 0xff4444).setOrigin(0, 0.5);

        // Текст процентов
        this.percentText = this.add.text(640, 400, '0%', {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Press Start 2P'
        }).setOrigin(0.5);

        // Подсказка
        this.add.text(640, 500, 'Загрузка боевых систем...', {
            fontSize: '16px',
            fill: '#888888',
            fontFamily: 'Press Start 2P'
        }).setOrigin(0.5);
    }

    generateBasicSprites() {
        // Создание простых спрайтов для тестирования
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        
        // Игрок (красный квадрат как placeholder)
        graphics.fillStyle(0xff4444, 1);
        graphics.fillRect(0, 0, 64, 128);
        graphics.generateTexture('player_temp', 64, 128);
        
        // Противник (синий квадрат)
        graphics.clear();
        graphics.fillStyle(0x4444ff, 1);
        graphics.fillRect(0, 0, 64, 128);
        graphics.generateTexture('enemy_temp', 64, 128);
        
        // Фон арены
        graphics.clear();
        graphics.fillStyle(0x1a3c27, 1);
        graphics.fillRect(0, 0, 1280, 720);
        graphics.fillStyle(0x2a5934, 1);
        for (let i = 0; i < 20; i++) {
            graphics.fillRect(100 + i * 60, 500, 40, 200);
        }
        graphics.generateTexture('arena_temp', 1280, 720);
        
        graphics.destroy();
    }

    loadBasicSounds() {
        // Создание базовых звуков программно
        const createBeepSound = (frequency, duration) => {
            const sampleRate = 44100;
            const channels = 1;
            const length = sampleRate * duration;
            const buffer = this.sys.game.context.createBuffer(channels, length, sampleRate);
            const data = buffer.getChannelData(0);
            
            for (let i = 0; i < length; i++) {
                data[i] = Math.sin(2 * Math.PI * frequency * i / sampleRate);
            }
            
            return buffer;
        };

        // Создание простых звуков
        this.cache.audio.add('sound_punch', createBeepSound(200, 0.1));
        this.cache.audio.add('sound_jump', createBeepSound(300, 0.2));
        this.cache.audio.add('sound_hit', createBeepSound(100, 0.3));
        this.cache.audio.add('sound_ui', createBeepSound(400, 0.1));
    }

    createAnimations() {
        // Создание базовых анимаций
        this.anims.create({
            key: 'player_idle',
            frames: [
                { key: 'player_temp', frame: 0 }
            ],
            frameRate: 1,
            repeat: -1
        });

        this.anims.create({
            key: 'enemy_idle',
            frames: [
                { key: 'enemy_temp', frame: 0 }
            ],
            frameRate: 1,
            repeat: -1
        });
    }

    create() {
        console.log('PreloadScene создана');
    }
}

// ============================================
// ГЛАВНОЕ МЕНЮ (MainMenu)
// ============================================
class MainMenu extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenu' });
    }

    create() {
        console.log('MainMenu: Создание меню');
        
        // Фон
        this.add.image(640, 360, 'arena_temp').setAlpha(0.7);
        
        // Затемнение
        this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.5);
        
        // Заголовок
        this.add.text(640, 150, 'SHADOW ARENA', {
            fontSize: '72px',
            fill: '#ff4444',
            fontFamily: 'Press Start 2P',
            stroke: '#000',
            strokeThickness: 10,
            shadow: { offsetX: 5, offsetY: 5, color: '#000', blur: 0, fill: true }
        }).setOrigin(0.5);

        this.add.text(640, 220, 'LEGACY FIGHT', {
            fontSize: '36px',
            fill: '#ffffff',
            fontFamily: 'Press Start 2P',
            stroke: '#000',
            strokeThickness: 6
        }).setOrigin(0.5);

        // Кнопка начала игры
        const startButton = this.add.text(640, 320, 'НАЧАТЬ БОЙ', {
            fontSize: '32px',
            fill: '#ffffff',
            fontFamily: 'Press Start 2P',
            backgroundColor: '#ff4444',
            padding: { x: 20, y: 15 },
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        // Анимация кнопки
        startButton.on('pointerover', () => {
            startButton.setScale(1.1);
            startButton.setBackgroundColor('#ff6666');
        });

        startButton.on('pointerout', () => {
            startButton.setScale(1);
            startButton.setBackgroundColor('#ff4444');
        });

        startButton.on('pointerdown', () => {
            this.sound.play('sound_ui');
            startButton.setScale(0.95);
        });

        startButton.on('pointerup', () => {
            startButton.setScale(1);
            this.scene.start('GameScene');
        });

        // Кнопка настроек
        const settingsButton = this.add.text(640, 400, 'НАСТРОЙКИ', {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Press Start 2P',
            backgroundColor: '#444444',
            padding: { x: 20, y: 10 },
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        settingsButton.on('pointerover', () => {
            settingsButton.setScale(1.1);
            settingsButton.setBackgroundColor('#666666');
        });

        settingsButton.on('pointerout', () => {
            settingsButton.setScale(1);
            settingsButton.setBackgroundColor('#444444');
        });

        settingsButton.on('pointerdown', () => {
            this.sound.play('sound_ui');
            // Здесь будет открытие настроек
            this.showSettings();
        });

        // Статистика
        this.add.text(640, 500, `ПОБЕД: ${playerData.wins} | ПОРАЖЕНИЙ: ${playerData.losses}`, {
            fontSize: '16px',
            fill: '#cccccc',
            fontFamily: 'Press Start 2P'
        }).setOrigin(0.5);

        // Управление
        this.add.text(640, 600, 'УПРАВЛЕНИЕ: СТРЕЛКИ + A/S/D ИЛИ КАСАНИЯ', {
            fontSize: '12px',
            fill: '#888888',
            fontFamily: 'Press Start 2P'
        }).setOrigin(0.5);

        // Воспроизведение звука при наведении
        this.input.on('gameobjectover', () => {
            this.sound.play('sound_ui', { volume: 0.3 });
        });
    }

    showSettings() {
        // Создание панели настроек
        const settingsPanel = this.add.rectangle(640, 360, 600, 400, 0x000000, 0.9)
            .setStrokeStyle(4, 0xff4444);
        
        const title = this.add.text(640, 200, 'НАСТРОЙКИ', {
            fontSize: '32px',
            fill: '#ffffff',
            fontFamily: 'Press Start 2P'
        }).setOrigin(0.5);

        // Слайдер громкости звуков
        this.add.text(440, 280, 'ГРОМКОСТЬ ЗВУКОВ:', {
            fontSize: '16px',
            fill: '#ffffff',
            fontFamily: 'Press Start 2P'
        }).setOrigin(0, 0.5);

        const soundSlider = this.add.rectangle(640, 280, 200, 20, 0x333333)
            .setOrigin(0.5)
            .setInteractive({ draggable: true });
        
        const soundFill = this.add.rectangle(540, 280, 100, 16, 0xff4444).setOrigin(0, 0.5);

        // Слайдер громкости музыки
        this.add.text(440, 330, 'ГРОМКОСТЬ МУЗЫКИ:', {
            fontSize: '16px',
            fill: '#ffffff',
            fontFamily: 'Press Start 2P'
        }).setOrigin(0, 0.5);

        const musicSlider = this.add.rectangle(640, 330, 200, 20, 0x333333)
            .setOrigin(0.5)
            .setInteractive({ draggable: true });
        
        const musicFill = this.add.rectangle(540, 330, 100, 16, 0x4444ff).setOrigin(0, 0.5);

        // Кнопка закрытия
        const closeButton = this.add.text(640, 450, 'ЗАКРЫТЬ', {
            fontSize: '20px',
            fill: '#ffffff',
            fontFamily: 'Press Start 2P',
            backgroundColor: '#ff4444',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        closeButton.on('pointerdown', () => {
            this.sound.play('sound_ui');
            settingsPanel.destroy();
            title.destroy();
            soundSlider.destroy();
            soundFill.destroy();
            musicSlider.destroy();
            musicFill.destroy();
            closeButton.destroy();
        });
    }
}

// ============================================
// ИГРОВАЯ СЦЕНА (GameScene)
// ============================================
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        
        this.player = null;
        this.enemy = null;
        this.cursors = null;
        this.keys = null;
        this.isGameOver = false;
        this.gameTime = 0;
        this.comboCount = 0;
        this.comboTimer = 0;
        
        // Touch controls
        this.touchStart = { x: 0, y: 0, time: 0 };
        this.touchEnd = { x: 0, y: 0, time: 0 };
        this.virtualControls = null;
    }

    create() {
        console.log('GameScene: Создание игры');
        
        // Фон арены
        this.add.image(640, 360, 'arena_temp');
        
        // Создание игрока
        this.player = this.physics.add.sprite(320, 500, 'player_temp');
        this.player.setCollideWorldBounds(true);
        this.player.setBounce(0.1);
        this.player.setSize(40, 100);
        this.player.setOffset(12, 28);
        this.player.health = 100;
        this.player.energy = 0;
        this.player.isBlocking = false;
        this.player.canAttack = true;
        this.player.lastAttack = 0;
        this.player.play('player_idle');
        
        // Создание противника
        this.enemy = this.physics.add.sprite(960, 500, 'enemy_temp');
        this.enemy.setCollideWorldBounds(true);
        this.enemy.setBounce(0.1);
        this.enemy.setSize(40, 100);
        this.enemy.setOffset(12, 28);
        this.enemy.health = 100;
        this.enemy.energy = 0;
        this.enemy.isBlocking = false;
        this.enemy.canAttack = true;
        this.enemy.play('enemy_idle');
        
        // Коллизия между игроками
        this.physics.add.collider(this.player, this.enemy);
        
        // Полоски здоровья
        this.createHealthBars();
        
        // Полоски энергии
        this.createEnergyBars();
        
        // Управление для ПК
        this.setupPCControls();
        
        // Управление для мобильных
        this.setupMobileControls();
        
        // Кнопка паузы
        this.createPauseButton();
        
        // Таймер
        this.createTimer();
        
        // ИИ противника
        this.setupEnemyAI();
        
        // Текст комбо
        this.comboText = this.add.text(640, 100, '', {
            fontSize: '32px',
            fill: '#ffff00',
            fontFamily: 'Press Start 2P',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5).setAlpha(0);
        
        // Имена игроков
        this.add.text(200, 50, 'ИГРОК', {
            fontSize: '20px',
            fill: '#ff4444',
            fontFamily: 'Press Start 2P',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        this.add.text(1080, 50, 'ПРОТИВНИК', {
            fontSize: '20px',
            fill: '#4444ff',
            fontFamily: 'Press Start 2P',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        // Инструкция
        this.add.text(640, 680, 'УПРАВЛЕНИЕ: ←→ ДВИЖЕНИЕ, A/S АТАКА, D БЛОК', {
            fontSize: '12px',
            fill: '#888888',
            fontFamily: 'Press Start 2P'
        }).setOrigin(0.5);
    }

    createHealthBars() {
        // Фон полоски здоровья игрока
        this.add.rectangle(200, 80, 204, 24, 0x000000).setOrigin(0.5);
        this.playerHealthBar = this.add.rectangle(98, 80, 200, 20, 0x00ff00).setOrigin(0, 0.5);
        
        // Фон полоски здоровья противника
        this.add.rectangle(1080, 80, 204, 24, 0x000000).setOrigin(0.5);
        this.enemyHealthBar = this.add.rectangle(980, 80, 200, 20, 0x00ff00).setOrigin(0, 0.5);
    }

    createEnergyBars() {
        // Фон полоски энергии игрока
        this.add.rectangle(200, 110, 204, 14, 0x000000).setOrigin(0.5);
        this.playerEnergyBar = this.add.rectangle(98, 110, 0, 10, 0x0088ff).setOrigin(0, 0.5);
        
        // Фон полоски энергии противника
        this.add.rectangle(1080, 110, 204, 14, 0x000000).setOrigin(0.5);
        this.enemyEnergyBar = this.add.rectangle(980, 110, 0, 10, 0x0088ff).setOrigin(0, 0.5);
    }

    setupPCControls() {
        this.cursors = this.input.keyboard.createCursorKeys();
        
        this.keys = {
            a: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            s: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            d: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
            w: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            space: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
            esc: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)
        };
    }

    setupMobileControls() {
        this.input.on('pointerdown', (pointer) => {
            this.touchStart.x = pointer.x;
            this.touchStart.y = pointer.y;
            this.touchStart.time = this.time.now;
        });

        this.input.on('pointerup', (pointer) => {
            this.touchEnd.x = pointer.x;
            this.touchEnd.y = pointer.y;
            this.touchEnd.time = this.time.now;
            
            this.processGesture();
        });
    }

    processGesture() {
        const deltaX = this.touchEnd.x - this.touchStart.x;
        const deltaY = this.touchEnd.y - this.touchStart.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const timeDiff = this.touchEnd.time - this.touchStart.time;
        
        if (distance > 50 && timeDiff < 300) {
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // Горизонтальный свайп
                if (deltaX > 0) {
                    this.performLightAttack(this.player);
                } else {
                    this.performHeavyAttack(this.player);
                }
            } else {
                // Вертикальный свайп
                if (deltaY < 0) {
                    this.performJumpAttack(this.player);
                }
            }
        }
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
            this.sound.play('sound_ui');
            this.scene.pause();
            
            // Создание меню паузы
            this.createPauseMenu();
        });
    }

    createPauseMenu() {
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
            this.sound.play('sound_ui');
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
            this.sound.play('sound_ui');
            this.scene.stop('GameScene');
            this.scene.start('MainMenu');
        });
    }

    createTimer() {
        this.timerText = this.add.text(640, 40, 'ВРЕМЯ: 0', {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Press Start 2P',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        this.time.addEvent({
            delay: 1000,
            callback: () => {
                if (!this.isGameOver) {
                    this.gameTime++;
                    this.timerText.setText('ВРЕМЯ: ' + this.gameTime);
                }
            },
            loop: true
        });
    }

    setupEnemyAI() {
        this.time.addEvent({
            delay: 1000,
            callback: () => {
                if (this.isGameOver || !this.enemy.canAttack) return;
                
                const distance = Phaser.Math.Distance.Between(
                    this.player.x, this.player.y,
                    this.enemy.x, this.enemy.y
                );
                
                // Простой ИИ
                if (distance < 150) {
                    if (Math.random() > 0.5) {
                        this.performLightAttack(this.enemy);
                    } else {
                        this.performHeavyAttack(this.enemy);
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

    updateHealthBar(character, health) {
        const bar = character === this.player ? this.playerHealthBar : this.enemyHealthBar;
        const width = (health / 100) * 200;
        bar.width = Math.max(0, width);
        
        // Изменение цвета при низком здоровье
        if (health < 30) {
            bar.fillColor = 0xff0000;
        } else if (health < 60) {
            bar.fillColor = 0xffff00;
        } else {
            bar.fillColor = 0x00ff00;
        }
    }

    updateEnergyBar(character, energy) {
        const bar = character === this.player ? this.playerEnergyBar : this.enemyEnergyBar;
        const width = (energy / 100) * 200;
        bar.width = Math.max(0, width);
    }

    performLightAttack(character) {
        if (!character.canAttack || character.isBlocking) return;
        
        character.canAttack = false;
        character.lastAttack = this.time.now;
        
        const isPlayer = character === this.player;
        const target = isPlayer ? this.enemy : this.player;
        
        // Звук удара
        this.sound.play('sound_punch');
        
        // Нанесение урона
        const damage = 10;
        this.applyDamage(target, damage);
        
        // Комбо система
        if (isPlayer) {
            this.addCombo();
        }
        
        // Визуальный эффект
        this.createHitEffect(target.x, target.y);
        
        // Восстановление атаки
        this.time.delayedCall(300, () => {
            character.canAttack = true;
        });
    }

    performHeavyAttack(character) {
        if (!character.canAttack || character.isBlocking) return;
        
        character.canAttack = false;
        character.lastAttack = this.time.now;
        
        const isPlayer = character === this.player;
        const target = isPlayer ? this.enemy : this.player;
        
        // Звук удара
        this.sound.play('sound_punch', { detune: -200 });
        
        // Нанесение урона
        const damage = 20;
        this.applyDamage(target, damage);
        
        // Комбо система
        if (isPlayer) {
            this.addCombo();
        }
        
        // Визуальный эффект
        this.createHitEffect(target.x, target.y, true);
        
        // Отбрасывание
        if (!target.isBlocking) {
            const direction = isPlayer ? 1 : -1;
            target.setVelocityX(200 * direction);
        }
        
        // Восстановление атаки
        this.time.delayedCall(500, () => {
            character.canAttack = true;
        });
    }

    performJumpAttack(character) {
        if (!character.canAttack || !character.body.onFloor()) return;
        
        character.canAttack = false;
        character.setVelocityY(-400);
        
        this.sound.play('sound_jump');
        
        // Атака в воздухе
        this.time.delayedCall(200, () => {
            if (!this.isGameOver) {
                const isPlayer = character === this.player;
                const target = isPlayer ? this.enemy : this.player;
                const damage = 15;
                
                this.applyDamage(target, damage);
                this.createHitEffect(target.x, target.y);
                
                if (isPlayer) {
                    this.addCombo();
                }
            }
        });
        
        this.time.delayedCall(800, () => {
            character.canAttack = true;
        });
    }

    applyDamage(target, damage) {
        if (target.isBlocking) {
            damage *= 0.3; // 70% снижение урона при блоке
            this.sound.play('sound_hit', { detune: 300 });
        } else {
            this.sound.play('sound_hit');
        }
        
        target.health -= damage;
        
        // Обновление полосок здоровья
        if (target === this.player) {
            this.updateHealthBar(this.player, this.player.health);
            this.player.energy = Math.min(100, this.player.energy + 10);
            this.updateEnergyBar(this.player, this.player.energy);
        } else {
            this.updateHealthBar(this.enemy, this.enemy.health);
            this.enemy.energy = Math.min(100, this.enemy.energy + 10);
            this.updateEnergyBar(this.enemy, this.enemy.energy);
        }
        
        // Эффект получения урона
        target.setTint(0xff0000);
        this.time.delayedCall(100, () => {
            target.clearTint();
        });
        
        // Проверка смерти
        if (target.health <= 0) {
            this.gameOver(target === this.player ? this.enemy : this.player);
        }
    }

    createHitEffect(x, y, isHeavy = false) {
        const size = isHeavy ? 50 : 30;
        const effect = this.add.circle(x, y, size, 0xffffff, 0.5);
        
        this.tweens.add({
            targets: effect,
            radius: 0,
            alpha: 0,
            duration: 200,
            onComplete: () => effect.destroy()
        });
    }

    addCombo() {
        const now = this.time.now;
        
        if (now - this.comboTimer > 1000) {
            this.comboCount = 0;
        }
        
        this.comboCount++;
        this.comboTimer = now;
        
        // Отображение комбо
        this.comboText.setText('COMBO x' + this.comboCount);
        this.comboText.setAlpha(1);
        
        // Анимация комбо
        this.tweens.add({
            targets: this.comboText,
            y: 80,
            alpha: 0,
            duration: 1000,
            ease: 'Power2'
        });
        
        // Обновление максимального комбо
        if (this.comboCount > playerData.maxCombo) {
            playerData.maxCombo = this.comboCount;
        }
    }

    gameOver(winner) {
        if (this.isGameOver) return;
        
        this.isGameOver = true;
        this.physics.pause();
        
        // Определение победителя
        const isPlayerWin = winner === this.player;
        const winnerName = isPlayerWin ? 'ИГРОК' : 'ПРОТИВНИК';
        
        // Обновление статистики
        if (isPlayerWin) {
            playerData.wins++;
            playerData.coins += 50;
        } else {
            playerData.losses++;
            playerData.coins += 10;
        }
        
        // Текст победы
        const gameOverText = this.add.text(640, 200, winnerName + ' ПОБЕДИЛ!', {
            fontSize: '48px',
            fill: isPlayerWin ? '#00ff00' : '#ff4444',
            fontFamily: 'Press Start 2P',
            stroke: '#000',
            strokeThickness: 8
        }).setOrigin(0.5);
        
        // Статистика матча
        const statsText = this.add.text(640, 280, 
            `Время: ${this.gameTime} сек\n` +
            `Комбо: ${this.comboCount}\n` +
            `Монеты: +${isPlayerWin ? 50 : 10}`,
            {
                fontSize: '20px',
                fill: '#ffffff',
                fontFamily: 'Press Start 2P',
                align: 'center'
            }
        ).setOrigin(0.5);
        
        // Кнопка реванша
        const replayButton = this.add.text(640, 400, 'РЕВАНШ', {
            fontSize: '32px',
            fill: '#ffffff',
            fontFamily: 'Press Start 2P',
            backgroundColor: '#ff4444',
            padding: { x: 30, y: 15 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        replayButton.on('pointerdown', () => {
            this.sound.play('sound_ui');
            this.scene.restart();
        });
        
        // Кнопка меню
        const menuButton = this.add.text(640, 480, 'В МЕНЮ', {
            fontSize: '32px',
            fill: '#ffffff',
            fontFamily: 'Press Start 2P',
            backgroundColor: '#444444',
            padding: { x: 30, y: 15 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        menuButton.on('pointerdown', () => {
            this.sound.play('sound_ui');
            this.scene.stop('GameScene');
            this.scene.start('MainMenu');
        });
    }

    update() {
        if (this.isGameOver) return;
        
        // Обновление комбо таймера
        if (this.time.now - this.comboTimer > 1000 && this.comboCount > 0) {
            this.comboCount = 0;
            this.comboText.setAlpha(0);
        }
        
        // Управление игроком
        this.updatePlayer();
        
        // Управление блоком
        this.updateBlock();
    }

    updatePlayer() {
        const speed = 200;
        
        // Движение влево/вправо
        if (this.cursors.left.isDown || (this.keys && this.keys.a.isDown)) {
            this.player.setVelocityX(-speed);
        } else if (this.cursors.right.isDown || (this.keys && this.keys.d.isDown)) {
            this.player.setVelocityX(speed);
        } else {
            this.player.setVelocityX(0);
        }
        
        // Прыжок
        if ((this.cursors.up.isDown || (this.keys && this.keys.w.isDown) || 
             (this.keys && this.keys.space.isDown)) && this.player.body.onFloor()) {
            this.player.setVelocityY(-400);
            this.sound.play('sound_jump');
        }
        
        // Приседание
        if (this.cursors.down.isDown && this.player.body.onFloor()) {
            this.player.setVelocityY(100);
        }
        
        // Атаки с клавиатуры
        if (Phaser.Input.Keyboard.JustDown(this.keys.a)) {
            this.performLightAttack(this.player);
        }
        
        if (Phaser.Input.Keyboard.JustDown(this.keys.s)) {
            this.performHeavyAttack(this.player);
        }
        
        // Блок
        this.player.isBlocking = this.keys.d.isDown;
        
        // Визуальная индикация блока
        if (this.player.isBlocking) {
            this.player.setTint(0x8888ff);
        } else {
            this.player.clearTint();
        }
    }

    updateBlock() {
        // Блок для противника (случайный)
        if (Math.random() < 0.1) {
            this.enemy.isBlocking = true;
            this.enemy.setTint(0x8888ff);
            this.time.delayedCall(500, () => {
                this.enemy.isBlocking = false;
                this.enemy.clearTint();
            });
        }
    }
}

// ============================================
// АВТОМАТИЧЕСКИЙ ЗАПУСК ИГРЫ
// ============================================
console.log('Shadow Arena: Legacy Fight загружается...');
