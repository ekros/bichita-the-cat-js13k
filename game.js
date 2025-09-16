/*
    Bichita the Cat
    Created by Eric Ros for the 2025' js13kgames competition
*/

/**
 * @preserve
 * @suppress {checkTypes,uselessCode,missingProperties}
 */

/** @dict */

// show the LittleJS splash screen
setShowSplashScreen(false);
// enable touch
setTouchInputEnable(true);

// constants
const CAT_DENSITY_SETUPS = {
    lowest: {
        quantity: 50,
    },
    low: {
        quantity: 100,
    },
    medium: {
        quantity: 200,
    },
    high: {
        quantity: 400,
    },
    extreme: {
        quantity: 800,
    },
    ultra: {
        quantity: 1000
    },
    ultimate: {
        quantity: 2000
    }
}

const GAME_STATE = {
    TITLE: 0,
    RUNNING: 1,
    WIN: 2
};
const BICHITA_SCALE = 0.7;

// sprites
const sprites = {};
const SPRITE_SIZE = 24;
const SPRITE_MAP = {
    bichita: {
        walk: [0, 0],
        pose: [24, 0],
        drag: [24, 0]  // Reuse the pose sprite coordinates for dragging
    },
    white: {
        walk: [0, 24],
        pose: [24, 24]
    },
    tabby: {
        walk: [0, 48],
        pose: [24, 48]
    },
    orange: {
        walk: [0, 72],
        pose: [24, 72]
    }
};

const catTypes = ["white", "tabby", "orange"];

// Entities
/** @constructor */
class Cat {
    constructor(yPos, xPos, speed, type) {
        this.y = Math.floor(Math.max(30, Math.random() * mainCanvasSize.y - 40)); // make sure there is no vertical overflow
        this.x = Math.floor(Math.random() * mainCanvasSize.x);
        this.speed = Math.random() < 0.5 ? -(Math.random() / 5) : Math.random() / 5;
        this.type = catTypes[Math.floor(Math.random() * catTypes.length)];
        this.isWalking = true;
    }
}

/** @constructor */
class Bichita extends Cat {
    constructor() {
        super();
        this.speed = 0.05;
        this.type = null;
        this.isDragging = false;
        this.isBichita = true;
    }
    startDragging() {
        this.isDragging = true;
    }
    endDragging() {
        this.isDragging = false;
    }
}

/** @constructor */
class Mother extends Cat {
    constructor() {
        super();
        this.type = null;
        this.isMother = true;
    }
}

// Data & state
let cats = [];
let gameState = GAME_STATE.TITLE;
let catTalking; // { text, x, y }
let motherGaveGreetings = false;
let musicPlaying = false;
let talkInterval;

const getScaleForDevice = () => {
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0);
    if (isTouch && mainCanvasSize.x <= 800) {
        // mobile
        return {
            catMultiplier: 0.25,
            catScale: 1.75
        }
    } else if (isTouch && mainCanvasSize.x <= 1200) {
        // tablet
        return {
            catMultiplier: 0.5,
            catScale: 1.5
        }
    } else if (!isTouch && mainCanvasSize.x >= 1920) {
        // desktop bigger than 1080p
        return {
            catMultiplier: 1.5,
            catScale: 1
        }
    } else {
        // desktop up to 1080p
        return {
            catMultiplier: 1,
            catScale: 1
        }
    }
}

const TOUCH_DRAGGING_OFFSET_X = Math.floor(-20 * getScaleForDevice().catScale);
const TOUCH_DRAGGING_OFFSET_Y = -120; // when dragging on touch devices, offset the sprite a bit to see where we are dragging

const initCats = numberOfCats => {
    const bichitaIndex = Math.floor(Math.random() * numberOfCats);
    const motherIndex = Math.floor(Math.random() * numberOfCats); // ! TODO: potential index collision
    for (let i = 0; i < numberOfCats; i++) {
        if (i === bichitaIndex) {
            cats.push(new Bichita());
        } else if (i === motherIndex) {
            cats.push(new Mother());
        } else {
            cats.push(new Cat());
        }
    }
    // sort cats from back to front so they are rendered in the correct order
    cats.sort((a, b) => a.y < b.y ? -1 : 1);
    // workaround (bichita has lower height and the ilusion of depth is broken as it appears on front of other cats)
    // let's move it a bit to the bottom
    getBichitaInstance().y += 15;
}

const initSprites = () => {
    sprites.atlas = textureInfos[0].image;
    sprites.grass = textureInfos[1].image;
    sprites.cover = textureInfos[2].image;
}

const checkMouseCollisionWithBichita = pos => {
    const coords = worldToScreen(pos);
    let collided = false;
    const newCats = structuredClone(cats);
    const reversedCats = newCats.reverse(); // the ones in the front go first
    const finalSpriteSize = SPRITE_SIZE * BICHITA_SCALE * getScaleForDevice().catScale;
    reversedCats.forEach(rc => {
        if (rc.isBichita && coords.x - rc.x > 0 && coords.x - rc.x < finalSpriteSize && 
            coords.y - rc.y > 0 && coords.y - rc.y < finalSpriteSize) {
                collided = true;
            }
        });
        return collided;
    }
    
    const checkMouseCollisionWithMother = pos => {
        let collided = false;
        const coords = worldToScreen(pos);
        const newCats = structuredClone(cats);
        const reversedCats = newCats.reverse(); // the ones in the front go first
        const finalSpriteSize = SPRITE_SIZE * getScaleForDevice().catScale;
        reversedCats.forEach(rc => {
            if (rc.isMother && coords.x - rc.x > 0 && coords.x - rc.x < finalSpriteSize && 
                coords.y - rc.y > 0 && coords.y - rc.y < finalSpriteSize) {
                collided = true;
            }
        });
    return collided;
}

const checkMouseCollisionWithOtherCats = pos => {
        let collided = false;
        const coords = worldToScreen(pos);
        const newCats = structuredClone(cats);
        const reversedCats = newCats.reverse(); // the ones in the front go first
        const finalSpriteSize = SPRITE_SIZE * getScaleForDevice().catScale;
        reversedCats.forEach(rc => {
            if (!rc.isMother && !rc.isBichita && coords.x - rc.x > 0 && coords.x - rc.x < finalSpriteSize && 
                            coords.y - rc.y > 0 && coords.y - rc.y < finalSpriteSize) {
                collided = true;
            }
        });
    return collided;
}

const drawSprite = (x, y, spriteX, spriteY, flip = false, scale = 1) => {
    mainContext.save();
    if (flip) {
        mainContext.scale(-1, 1);
        mainContext.drawImage(sprites.atlas, spriteX, spriteY, SPRITE_SIZE, SPRITE_SIZE, 
            -x - SPRITE_SIZE, y, SPRITE_SIZE * scale, SPRITE_SIZE * scale);
    } else {
        mainContext.drawImage(sprites.atlas, spriteX, spriteY, SPRITE_SIZE, SPRITE_SIZE, 
            x, y, SPRITE_SIZE * scale, SPRITE_SIZE * scale);
    }
    mainContext.restore();
}

const getBichitaInstance = () => {
    return cats.find(cat => cat.constructor.name === "Bichita");
}

const getMotherInstance = () => {
    return cats.find(cat => cat.constructor.name === "Mother");
}

const endScene = () => {
    // remove all cats from scene except Bichita and her mother
    const bichita = getBichitaInstance();
    const mother = getMotherInstance();
    cats = cats.filter(cat => cat.constructor.name === "Bichita" || cat.constructor.name === "Mother");
    bichita.x = mother.x - 15;
    bichita.y = mother.y + 8;
}

const startCatTalking = (text, pos, ttl = 2000) => {
    catTalking = {
        text,
        pos,
        ttl
    };
    setTimeout(() => {
        catTalking = null;
    }, ttl);
}

const setGrabbingPointer = enable => {
    if (enable) {
        document.getElementsByTagName("body")[0].style.cursor = "grabbing";
    } else {
        document.getElementsByTagName("body")[0].style.cursor = "grab";
    }
}

const getInitialCats = () => {
    const gamesPlayed = localStorage.getItem("gamesPlayed");
    const difficultyMap = {
        "1": CAT_DENSITY_SETUPS.lowest,
        "2": CAT_DENSITY_SETUPS.low,
        "3": CAT_DENSITY_SETUPS.medium,
        "4": CAT_DENSITY_SETUPS.high,
        "5": CAT_DENSITY_SETUPS.extreme,
        "6": CAT_DENSITY_SETUPS.ultra
    }
    return difficultyMap[gamesPlayed] || CAT_DENSITY_SETUPS.ultimate;
}

const incrementGamesPlayed = () => {
    localStorage.setItem("gamesPlayed", Number(localStorage.getItem("gamesPlayed")) + 1);
}

// Keep references to audio nodes so we can stop them
let audioContext;
let gainNode;
let oscillators = [];

const stopMusic = () => {
    if (audioContext) {
        oscillators.forEach(osc => {
            try { osc.stop(); } catch(e) { /* ignore already stopped */ }
        });
        oscillators = [];
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        musicPlaying = false;
    }
};

// music, created with https://xem.github.io/miniOrchestra/
const playMusic = () => {
    stopMusic(); // Stop any playing music first
    const a = (notes, center, duration, decaystart, decayduration, interval, volume, waveform) => {
        audioContext = new AudioContext();
        gainNode = audioContext.createGain();
        gainNode.connect(audioContext.destination);
        oscillators = []; // Clear old oscillators
        
        for (let i of notes) {
            const O = audioContext.createOscillator();
            oscillators.push(O); // Store reference
            O.connect(gainNode);
            O.start(i[0] * interval);
            O.frequency.setValueAtTime(center * 1.06 ** (13 - i[1]), i[0] * interval);
            O.type = waveform;
            gainNode.gain.setValueAtTime(volume, i[0] * interval);
            gainNode.gain.setTargetAtTime(1e-5, i[0] * interval + decaystart, decayduration);
            O.stop(i[0] * interval + duration);
        }
    };
    const randomTune = Math.floor(Math.random() * 3);
    switch(randomTune) {
        case 0:
            a(
            [
                [4,13],[4,10],[11,10],[7,10],[7,13],[11,13],[9,13],[13,13],[15,10],[16,14],[16,10],[18,10],[20,13],[20,10],[23,13],[23,10],[27,10],[27,13],[29,10],[31,13],[31,10],[32,13],[34,13],[36,10],[36,13],[39,10],[39,13],[41,13],[43,13],[45,13],[43,10],[60,10],[62,10],[47,10],[47,15],[48,10],[50,10],[52,13],[52,10],[55,13],[55,10],[57,10],[59,10],[59,13],[60,13],[25,13]
            ],
            400, .19, .18, .005, .2, .05, ''
            );
        break;
        case 1:
            a([[6,16],[1,14],[1,17],[4,17],[4,14],[8,14],[10,15],[12,14],[14,14],[14,17],[17,14],[17,17],[11,14],[19,16],[21,14],[23,15],[24,16],[25,16],[27,17],[27,14],[29,15],[29,12],[31,17],[31,14],[34,17],[34,14],[37,17],[37,14],[39,16],[41,14],[43,15],[44,14],[45,14],[47,14],[47,17],[49,14],[49,17],[51,14],[51,11],[54,14],[54,11],[56,13],[58,11],[60,12],[61,11],[62,11]],400,.19,.18,.005,.2,.1,'triangle');
        break;
        case 2:
            a([[0,3],[2,3],[4,3],[6,3],[8,3],[2,6],[3,6],[4,6],[5,6],[6,6],[7,6],[8,6],[9,7],[10,7],[11,7],[12,7],[13,7],[14,7],[15,7],[10,3],[12,3],[14,3],[16,8],[17,8],[18,8],[19,8],[20,8],[21,8],[22,8],[16,3],[18,3],[18,5],[16,5],[20,5],[20,3],[22,5],[22,3],[24,3],[24,10],[26,3],[26,10],[28,3],[28,10],[24,5],[26,5],[28,5],[30,3],[32,3],[31,3],[33,3],[34,3],[35,3],[30,6],[31,6],[32,6],[33,6],[34,6],[35,6],[37,4],[38,4],[39,4],[40,4],[41,4],[42,4],[37,7],[38,7],[39,7],[40,7],[41,7],[42,7],[44,5],[45,5],[46,5],[47,5],[48,5],[49,5],[44,8],[45,8],[46,8],[47,8],[48,8],[49,8],[51,3],[53,3],[55,3],[51,5],[51,10],[53,10],[55,10],[53,5],[55,5],[57,3],[58,3],[59,3],[60,4],[61,4],[62,4],[57,6],[58,6],[59,6],[60,7],[61,7],[62,7],[64,4],[65,4],[66,4],[67,5],[68,5],[69,5],[64,7],[65,7],[66,7],[67,8],[68,8],[69,8],[71,5],[72,5],[73,5],[71,8],[72,8],[73,8],[74,9],[75,9],[76,9],[78,3],[78,5],[78,10],[80,3],[80,5],[80,10],[82,3],[83,3],[82,5],[83,5],[82,10],[83,10],[24,6],[26,6],[28,6],[51,6],[53,6],[55,6],[78,6],[80,6],[82,6],[83,6],[74,5],[75,5],[76,5]],400,.19,.18,.005,.2,.1,'');
        break;
    }
    musicPlaying = true;
}

const renderTitleScreen = () => {
    const baseX = mainCanvasSize.x/2 - 80;
    const baseY = mainCanvasSize.y/2 - 100;
    mainContext.drawImage(sprites.cover, baseX, baseY - 20, 128, 128);
    drawTextScreen('Bichita the Cat  -  Js13kGames 2025\n Director\'s Cut\n by Eric Ros', 
        vec2(baseX + 60, baseY + 140), 16,
        hsl(0,0,0), 1, hsl(0,0,0));   
     drawTextScreen('The young cat is lost! Help it find his mother!', 
        vec2(baseX + 60, baseY + 180), 16,
        hsl(0,0,1), 6, hsl(0,0,0));
    drawTextScreen('To play, just find it and move it next \nto her mother using the mouse / touch', 
        vec2(baseX + 60, baseY + 210), 16,
        hsl(0,0,1), 6, hsl(0,0,0));
    drawSprite(baseX + 64, baseY + 230, ...SPRITE_MAP.bichita.pose, false, BICHITA_SCALE * getScaleForDevice().catScale);
    drawTextScreen('Click or tap to continue', 
        vec2(baseX + 60, baseY + 320), 16,
        hsl(0,0,1), 6, hsl(0,0,0));
}

const restartGame = () => {
    clearInterval(talkInterval);
    cats = [];
    catTalking = null;
    motherGaveGreetings = false;
    gameState = GAME_STATE.RUNNING;
    musicPlaying = false;
    gameInit();
};

const getRandomMotherText = () => {
    const texts = [
        "Have you seen my baby?",
        "I'm so worried about Bichita.",
        "Bichita is lost again!",
        "I miss my baby so much.",
        "Where could Bichita be?",
    ];
    return texts[Math.floor(Math.random() * texts.length)];
};


///////////////////////////////////////////////////////////////////////////////
function gameInit()
{
    // initialize gamesPlayed
    if (!localStorage.getItem("gamesPlayed")) {
        localStorage.setItem("gamesPlayed", 1);
    }
    mainCanvas.style.background = "white";
    initCats(Math.floor(getInitialCats().quantity*getScaleForDevice().catMultiplier));
    initSprites();
    // hint: every 30 seconds there is a chance of a short meow
    talkInterval = setInterval(() => {
        if (Math.random() < 0.5) {
            const pos = screenToWorld(vec2(getBichitaInstance().x, getBichitaInstance().y - 20));
            startCatTalking("Meow", pos, 2000);
        }
    }, 30000);
}

///////////////////////////////////////////////////////////////////////////////
function gameUpdate()
{
    switch (gameState) {
        case GAME_STATE.TITLE:
            if (mouseWasPressed(0))
            {
                gameState = GAME_STATE.RUNNING;
                playMusic();
            }
        break;
        case GAME_STATE.RUNNING:
            if (!musicPlaying) {
                playMusic(); // workaround to allow music to be played
            }
            if (!motherGaveGreetings) {
                const pos = screenToWorld(vec2(getMotherInstance().x, getMotherInstance().y - 20));
                const gamesPlayed = localStorage.getItem("gamesPlayed");
                if (gamesPlayed > 1) {
                    startCatTalking(getRandomMotherText(), pos, 5000);
                } else {
                    startCatTalking("Please, bring my baby back!", pos, 5000);
                }
                motherGaveGreetings = true;
            }
            if (mouseWasPressed(0))
            {
                setGrabbingPointer(true);
                // detect click with Bichita
                if (checkMouseCollisionWithBichita(mousePos)) {
                    getBichitaInstance().startDragging();
                    startCatTalking("Meow!", mousePos);
                } else if (checkMouseCollisionWithMother(mousePos)) {
                    startCatTalking("Please, find Bichita.", mousePos);
                } else if (checkMouseCollisionWithOtherCats(mousePos)) {
                    startCatTalking("Prrr", mousePos);
                }
            }
            if (mouseWasReleased(0)) {
                setGrabbingPointer(false);
                // check if we are dropping near mother
                if (checkMouseCollisionWithMother(mousePos) && cats.find(cat => cat.constructor.name === "Bichita" && cat.isDragging)) {
                    gameState = GAME_STATE.WIN;
                    incrementGamesPlayed();
                    endScene();
                } else if (getBichitaInstance().isDragging) {
                    const pos = screenToWorld(vec2(getBichitaInstance().x, getBichitaInstance().y - 20));
                    startCatTalking("Not my mother...", pos);
                }
                getBichitaInstance().endDragging();
            }
        // update cat positions
        cats.forEach(cat => {
            if (cat.isWalking) {
                cat.x += cat.speed;
                if (cat.x < 0 || cat.x > mainCanvasSize.x) {
                    cat.speed = -cat.speed;
                }
            }
            // small chance of state change
            if (Math.random() < 0.001) {
                cat.isWalking = !cat.isWalking;
            }
            // small chance of direction change
            if (Math.random() < 0.001) {
                cat.speed = -cat.speed;
            }
        });
        break;
        case GAME_STATE.WIN:
            if (mouseWasPressed(0))
            {
                restartGame();             
            }
        break;
    }      
}

///////////////////////////////////////////////////////////////////////////////
function gameUpdatePost()
{

}

///////////////////////////////////////////////////////////////////////////////
function gameRender()
{
    switch (gameState) {
        case GAME_STATE.TITLE:
            renderTitleScreen();
        break;
        case GAME_STATE.RUNNING:
        case GAME_STATE.WIN:
            // render grass background
            const grass = sprites.grass;
            if (grass) {
                const pattern = mainContext.createPattern(grass, 'repeat');
                mainContext.fillStyle = pattern;
                mainContext.fillRect(0, 0, mainCanvasSize.x, mainCanvasSize.y);
            }
        
            // render cats
            cats.forEach(cat => {
                if (cat.constructor.name === "Bichita") {
                    if (cat.isDragging) {
                        const coords = worldToScreen(mousePos);
                        if (isTouchDevice) {
                            drawSprite(coords.x + TOUCH_DRAGGING_OFFSET_X, coords.y + TOUCH_DRAGGING_OFFSET_Y, ...SPRITE_MAP.bichita.drag, false, BICHITA_SCALE * getScaleForDevice().catScale * 2);
                        } else {
                            drawSprite(coords.x, coords.y, ...SPRITE_MAP.bichita.drag, false, BICHITA_SCALE * getScaleForDevice().catScale);
                        }
                    } else {
                        if (!cat.isWalking) {
                            drawSprite(cat.x, cat.y, ...SPRITE_MAP.bichita.pose, false, BICHITA_SCALE * getScaleForDevice().catScale);
                        } else {
                            drawSprite(cat.x, cat.y, ...SPRITE_MAP.bichita.walk, cat.speed < 0, BICHITA_SCALE * getScaleForDevice().catScale);
                        }
                    }
                } else if (cat.constructor.name === "Mother") {
                    // Mother uses same sprites as Bichita
                    drawSprite(cat.x, cat.y, ...SPRITE_MAP.bichita.walk, cat.speed < 0, getScaleForDevice().catScale);
                } else {
                    const spriteCoords = SPRITE_MAP[cat.type] || SPRITE_MAP.white;
                    if (!cat.isWalking) {
                        drawSprite(cat.x, cat.y, ...spriteCoords.pose, cat.speed < 0, getScaleForDevice().catScale);
                    } else {
                        drawSprite(cat.x, cat.y, ...spriteCoords.walk, cat.speed < 0, getScaleForDevice().catScale);
                    }
                }
            });
        break;
    }
}

///////////////////////////////////////////////////////////////////////////////
function gameRenderPost()
{
    if (gameState !== GAME_STATE.TITLE) {
        // draw to overlay canvas for hud rendering
        drawTextScreen('Bichita the Cat', 
            vec2(40, mainCanvasSize.y - 10), 10,   // position, size
            hsl(0,0,1), 6, hsl(0,0,0));         // color, outline size and color
         // draw cat talking
        if (catTalking) {
            const pos = worldToScreen(catTalking.pos);
            pos.y -= 10;
            // float effect
            catTalking.pos.y += 0.001;
            drawTextScreen(catTalking.text,
                pos, 20,
                hsl(0,0,1), 6, hsl(0,0,0));
        }
    }
    // draw thank you message
    if (gameState === GAME_STATE.WIN) {
        const {x, y} = getBichitaInstance();
        drawTextScreen('Thank you!', 
        vec2(x, y - 20), 20,
        hsl(0,0,1), 6, hsl(0,0,0));
        
        drawTextScreen('Click anywhere to play again', 
        vec2(200, 20), 20,
        hsl(0,100,1), 6, hsl(0,0,0));
    }
}

///////////////////////////////////////////////////////////////////////////////
// Startup LittleJS Engine
engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost, 
    [
        'sprites.webp',
        'grass.webp',
        'bichita-cover.webp'
    ]);