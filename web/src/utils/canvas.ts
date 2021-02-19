export function setupCanvasDpi(canvas: HTMLCanvasElement, drawingContext?: CanvasRenderingContext2D) {
    const dpr = window.devicePixelRatio || 1;
    
    let oldWidth = canvas.width;
    let oldHeight = canvas.height;
    canvas.width = oldWidth * dpr;
    canvas.height = oldHeight * dpr;
    canvas.style.width = oldWidth + 'px';   
    canvas.style.height = oldHeight + 'px';

    drawingContext?.scale(dpr, dpr);
}