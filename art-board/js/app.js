console.log("Loaded");

var x = 0,
    y = 0,
    dragElement = null,
    startX = 0,
    startY = 0;
var artBoard = document.querySelector('.art-board');
var offset = {};

function drag(ev) {
    startX = ev.x;
    startY = ev.y;
    ev.dataTransfer.setData("text", ev.target.getAttribute('data-component'));
    if (ev.target.getAttribute('data-added')) {
        dragElement = ev.target;
        var targetBounds = ev.target.getBoundingClientRect();
        console.log("",targetBounds.x, startX);
    } else {
        dragElement = null;
    }
}

function drop(event) {
    event.preventDefault();
    if (dragElement) {
        var targetBounds  = dragElement.getBoundingClientRect();
        dragElement.style.left = (x - (startX - targetBounds.x)) + 'px';
        dragElement.style.top = (y - (startY - targetBounds.y)) + 'px';
    }  else {
        var data = event.dataTransfer.getData("text");
        console.log("data", data);
        var componentTag = document.querySelector('[data-component="' + data + '"]');
        var clonedTag = componentTag.cloneNode(true);
        clonedTag.style.position = 'absolute';
    
        clonedTag.style.left = x + 'px';
        clonedTag.style.top = y + 'px';
        clonedTag.setAttribute('data-added', 'true');
        artBoard.appendChild(clonedTag);
    }
}

function allowDrop(ev) {
    var bounds = artBoard.getBoundingClientRect();
    x  = ev.x - bounds.x;
    y = ev.y - bounds.y;
    ev.preventDefault();
}