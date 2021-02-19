import { Col, Row, Checkbox, InputNumber } from "antd";
import React, { useEffect, useRef } from "react";
import { setupCanvasDpi } from "../../utils/canvas";
import { relMouseCoords } from "../../utils/relativeClick";

type Props = {
    
}

type Point = {
    x: number, 
    y: number,
}

type GraphState = {
    width: number,
    height: number,

    drag: boolean,
    dragStart: Point | null,
    mousePosition: Point | null,

    values: number[]
}

function pointCenter(state: GraphState, index: number): Point {
    const margin = 12;
    const start = { x: 60, y: margin, }
    const end = { x: state.width - margin, y: state.height - margin, }
    const size = { width: end.x - start.x, height: end.y - start.y }

    return {
        x: start.x + size.width / state.values.length * index,
        y: end.y - size.height * state.values[index % state.values.length],
    }
}

function drawCircle({x, y}: Point, context: CanvasRenderingContext2D){
    const radious = 6;

    context.beginPath();
    context.arc(x, y, radious, 0, 2 * Math.PI, false);
    context.fillStyle = 'blue';
    context.fill();
    context.lineWidth = 1;
    context.strokeStyle = 'black';
    context.stroke();   
    context.closePath();
}

function drawGraphB(context: CanvasRenderingContext2D, state: GraphState) {
    const margin = 12;
    const start = { x: 60, y: margin, }
    const end = { x: state.width - margin, y: state.height - margin, }
    const size = { width: end.x - start.x, height: end.y - start.y }

    const out = 10;
    const horizontalLines = 5;

    // y lines
    context.beginPath();
    for (let i = 0; i < horizontalLines; i++ )  {
        const of = (size.height / (horizontalLines - 1)) * i;
        context.moveTo(start.x - out, start.y + of);
        context.lineTo(end.x + out, start.y + of);
    }
    context.lineWidth = 1;
    context.strokeStyle = 'gray';
    context.stroke();
    context.closePath();

    context.font = "16px Arial";
    context.fillStyle = "gray";
    context.textAlign = "right";


    for (let i = 0; i < horizontalLines; i++ )  {
        const of = (size.height / (horizontalLines - 1)) * i;
        context.fillText(
            `${100 - Math.floor(i / (horizontalLines - 1) * 100)}%`, 
            start.x - out - 3, 
            start.y + of + 8
            );
    }

    // axes
    context.beginPath();
    context.moveTo(start.x, start.y - out);
    context.lineTo(start.x, end.y);
    context.lineTo(end.x + out, end.y);
    context.lineWidth = 2;
    context.strokeStyle = 'black';
    context.stroke();
    context.closePath();
}

function drawGraph(context: CanvasRenderingContext2D, state: GraphState) {
    const { width, height } = state;
    
    context.fillStyle = 'rgb(255, 255, 255)';
    context.fillRect(0, 0, width, height);

    drawGraphB(context, state);

    context.beginPath();
    context.lineWidth = 2;
    context.strokeStyle = 'black';
    for (let i = 0; i < state.values.length; i++) {
        const start = pointCenter(state, i);
        const end = pointCenter(state, i + 1);
        context.moveTo(start.x, start.y);
        context.lineTo(end.x, end.y);
    }
    context.stroke();
    context.closePath();

    state.values.forEach((value, index) => {
        drawCircle(pointCenter(state, index), context);
    });
}

function useGraph(initialValues: number[]) {
    const canvas = useRef<HTMLCanvasElement>(null);
    const container = useRef<HTMLDivElement>(null);

    const stateRef = useRef<GraphState>({
        values: [0,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1],
        mousePosition: null,
        drag: false,
        dragStart: null,
        width: 0,
        height: 0,
    });

    useEffect(() => {
        const canvasEl = canvas.current!;    
        const state = stateRef.current;      
        const drawingContext = canvasEl.getContext('2d')!; 
       
        const rerender = () => drawGraph(drawingContext, state);

        const setupCanvas = () => {
            const width = container.current?.getBoundingClientRect().width! - 10;
            state.width = width;
            state.height = width * 0.4;
            canvasEl.width = state.width;
            canvasEl.height = state.height;
            setupCanvasDpi(canvasEl, drawingContext);
        }

        canvasEl.onclick = (e) => {
            state.mousePosition = relMouseCoords(e);
            rerender();
        }

        canvasEl.onmousedown = (e) => {
            state.drag =  true;
            state.dragStart = relMouseCoords(e);
            rerender();
        }

        window.addEventListener('mouseup', (e) => {
            state.drag = false;
            rerender();
        });

        canvasEl.onmousemove = (e) => {
            state.mousePosition = relMouseCoords(e);
            rerender();
        }

        /*canvasEl.onmouseleave = (e) => {
            state.mousePosition = null;
            rerender();
        }*/

        window.onresize = () => {
            setupCanvas();
            rerender();
        }

        setupCanvas();
        rerender();
    }, []);

    return {
        canvas: canvas,
        container: container,
    }
}

function Graph(props: Props) {
   const graph = useGraph([]);

    return (     
        <Row>
            <Col span={18}>
                <div ref={graph.container} style={{border: 'solid' }}>
                    <canvas ref={graph.canvas}/> 
                </div>
            </Col>
            <Col span={6}>
                <Checkbox>
                    Snap to grid
                </Checkbox>
                <InputNumber
                    defaultValue={10}
                    min={0}
                    max={100}
                    formatter={value => value === '' ? '' : `${value}%`}
                    parser={value => value?.replace('%', '') ?? 0}
                />
            </Col>
        </Row>        
    );  
}

export { Graph }