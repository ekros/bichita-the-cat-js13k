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
const INITIAL_SETUP = CAT_DENSITY_SETUPS.lowest;
const GAME_STATE = {
    RUNNING: 0,
    WIN: 1
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
        this.y = Math.floor(Math.max(0, Math.random() * mainCanvasSize.y - 40)); // make sure there is no vertical overflow
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
let gameState = GAME_STATE.RUNNING;
let catTalking; // { text, x, y }
let motherGaveGreetings = false;

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
}

const checkMouseCollisionWithBichita = pos => {
    const coords = worldToScreen(pos);
    let collided = false;
    const newCats = structuredClone(cats);
    const reversedCats = newCats.reverse(); // the ones in the front go first
    reversedCats.forEach(rc => {
        if (rc.isBichita && Math.abs(rc.x - coords.x) < 15 && Math.abs(rc.y - coords.y) < 15) {
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
        reversedCats.forEach(rc => {
            if (rc.isMother && Math.abs(rc.x - coords.x) < 18 && Math.abs(rc.y - coords.y) < 18) {
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
        reversedCats.forEach(rc => {
            if (!rc.isMother && !rc.isBichita && Math.abs(rc.x - coords.x) < 18 && Math.abs(rc.y - coords.y) < 18) {
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

///////////////////////////////////////////////////////////////////////////////
function gameInit()
{
    // initialize gamesPlayed
    if (!localStorage.getItem("gamesPlayed")) {
        localStorage.setItem("gamesPlayed", 1);
    }
    mainCanvas.style.background = "white";
    initCats(getInitialCats().quantity);
    initSprites();
    // hint: every 30 seconds there is a chance of a short meow
    setInterval(() => {
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
        case GAME_STATE.RUNNING:
            if (!motherGaveGreetings) {
                const pos = screenToWorld(vec2(getMotherInstance().x, getMotherInstance().y - 20));
                startCatTalking("Please, bring my baby back!", pos, 5000);
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
                location.reload();                
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
                drawSprite(coords.x, coords.y, ...SPRITE_MAP.bichita.drag, false, BICHITA_SCALE);
            } else {
                if (!cat.isWalking) {
                    drawSprite(cat.x, cat.y, ...SPRITE_MAP.bichita.pose, false, BICHITA_SCALE);
                } else {
                    drawSprite(cat.x, cat.y, ...SPRITE_MAP.bichita.walk, cat.speed < 0, BICHITA_SCALE);
                }
            }
        } else if (cat.constructor.name === "Mother") {
            // Mother uses same sprites as Bichita
            drawSprite(cat.x, cat.y, ...SPRITE_MAP.bichita.walk, cat.speed < 0);
        } else {
            const spriteCoords = SPRITE_MAP[cat.type] || SPRITE_MAP.white;
            if (!cat.isWalking) {
                drawSprite(cat.x, cat.y, ...spriteCoords.pose, cat.speed < 0);
            } else {
                drawSprite(cat.x, cat.y, ...spriteCoords.walk, cat.speed < 0);
            }
        }
    });
}

///////////////////////////////////////////////////////////////////////////////
function gameRenderPost()
{
    // draw to overlay canvas for hud rendering
    drawTextScreen('Bichita the Cat', 
        vec2(40, mainCanvasSize.y - 10), 10,   // position, size
        hsl(0,0,1), 6, hsl(0,0,0));         // color, outline size and color
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

///////////////////////////////////////////////////////////////////////////////
// Startup LittleJS Engine
engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost, 
    [
        'sprites.webp',
        'grass.webp'
    ]);