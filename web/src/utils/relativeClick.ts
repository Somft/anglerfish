function relativeMouseCoords(event: MouseEvent){
    var totalOffsetX = 0;
    var totalOffsetY = 0;
    var canvasX = 0;
    var canvasY = 0;
    var currentElement = event.target as HTMLElement;

    do{
        totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
        totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
    }
    while(currentElement = currentElement.offsetParent as HTMLElement)

    canvasX = event.pageX - totalOffsetX;
    canvasY = event.pageY - totalOffsetY;

    return {x:canvasX, y:canvasY}
}

export {relativeMouseCoords as relMouseCoords};