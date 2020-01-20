var gameState = {
    left: 0,
    top: 20
};
var maxRenderingCount = 2000;
var renderingCount = 0;
var canvasElem = null;

var renderGame = function() {
    gameState.left = gameState.left + 30;
    if (gameState.left < window.innerWidth) {

        renderingCount += 10;
        if (renderingCount < maxRenderingCount) {
            requestAnimationFrame(renderGame);
        }
    }
};

function bodyLoaded() {
    canvasElem = document.querySelector('#pageCanvas');
    canvasElem.style.width = window.innerWidth + 'px';
    canvasElem.style.height = window.innerHeight + 'px';
    // requestAnimationFrame(renderGame);
}