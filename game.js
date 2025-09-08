/*
    Bichita the Cat
    Created by Eric Ros for the 2025' js13kgames competition
*/

'use strict';

// show the LittleJS splash screen
setShowSplashScreen(true);

// sound effects
const sound_click = new Sound([1,.5]);

/*
! GAME DESCRIPTION (TO BE REMOVED)
Blacky is lost and you have to bring it with her mother.
But there is a problem... the screen is full of cats.
To pass the level you have to find the little Blacky and drag it with her mother.
So basically (you have to locate both the kitten and the mother).

Steps for development:
- Game data structure: an array of cats, that are rendered from back to front.
    - Every cat has:
        -
*/

///////////////////////////////////////////////////////////////////////////////
function gameInit()
{

}

///////////////////////////////////////////////////////////////////////////////
function gameUpdate()
{
    if (mouseWasPressed(0))
    {
        // play sound when mouse is pressed
        sound_click.play(mousePos);
    }
}

///////////////////////////////////////////////////////////////////////////////
function gameUpdatePost()
{

}

///////////////////////////////////////////////////////////////////////////////
function gameRender()
{

}

///////////////////////////////////////////////////////////////////////////////
function gameRenderPost()
{
    // draw to overlay canvas for hud rendering
    drawTextScreen('Bichita the Cat', 
        vec2(mainCanvasSize.x/2, 70), 80,   // position, size
        hsl(0,0,1), 6, hsl(0,0,0));         // color, outline size and color
}

///////////////////////////////////////////////////////////////////////////////
// Startup LittleJS Engine
engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost);