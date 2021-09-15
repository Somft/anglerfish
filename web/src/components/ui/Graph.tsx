import {
    Col, Row, Checkbox, InputNumber, Button,
} from 'antd';
import React, { useEffect, useRef } from 'react';
import { setupCanvasDpi } from '../../utils/canvas';
import { relMouseCoords } from '../../utils/relativeClick';
import {ChannelResponse} from "../../dto";

type Props = {
    channel: ChannelResponse;
    webSocket: WebSocket;
}

type Point = {
    x: Readonly<number>,
    y: Readonly<number>,
}

type GraphState = {
    width: number,
    height: number,

    drag: boolean,
    dragStart: Point | null,
    dragPoint: number,
    mousePosition: Point | null,

    values: number[],
    baseValues: number[],
}

function pointCenter(state: GraphState, index: number): Point {
    const margin = 12;
    const start = { x: 60, y: margin };
    const end = { x: state.width - margin, y: state.height - margin };
    const size = { width: end.x - start.x, height: end.y - start.y };

    return {
        x: start.x + size.width / state.values.length * index,
        y: end.y - size.height * state.values[index % state.values.length],
    };
}

function distance(a: Point, b: Point) {
    // eslint-disable-next-line no-restricted-properties
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

function getPointIndex(position: Point, state: GraphState) {
    const radius = 10;

    for (let i = 0; i < state.values.length; i++) {
        if (distance(position, pointCenter(state, i)) <= radius) {
            return i;
        }
    }
    return null;
}

function drawCircle({ x, y }: Point, context: CanvasRenderingContext2D) {
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
    const start = { x: 60, y: margin };
    const end = { x: state.width - margin, y: state.height - margin };
    const size = { width: end.x - start.x, height: end.y - start.y };

    const out = 10;
    const horizontalLines = 5;

    // y lines
    context.beginPath();
    for (let i = 0; i < horizontalLines; i++) {
        const of = (size.height / (horizontalLines - 1)) * i;
        context.moveTo(start.x - out, start.y + of);
        context.lineTo(end.x + out, start.y + of);
    }
    context.lineWidth = 1;
    context.strokeStyle = 'gray';
    context.stroke();
    context.closePath();

    context.font = '16px Arial';
    context.fillStyle = 'gray';
    context.textAlign = 'right';


    for (let i = 0; i < horizontalLines; i++) {
        const of = (size.height / (horizontalLines - 1)) * i;
        context.fillText(
            `${100 - Math.floor(i / (horizontalLines - 1) * 100)}%`,
            start.x - out - 3,
            start.y + of + 8,
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

function useGraph(channel: ChannelResponse, initialValues: number[], webSocket: WebSocket) {
    const canvas = useRef<HTMLCanvasElement>(null);
    const container = useRef<HTMLDivElement>(null);

    const stateRef = useRef<GraphState>({
        values: initialValues,
        baseValues: [],

        mousePosition: null,
        drag: false,
        dragStart: null,
        dragPoint: 0,
        width: 0,
        height: 0,
    });

    const addPoint = () => {
        const canvasEl = canvas.current!;
        const state = stateRef.current;
        const drawingContext = canvasEl.getContext('2d')!;
        const render = () => drawGraph(drawingContext, state);

        if (state.values.length < 100) {
            state.values.push(0);
        }

        const message = JSON.stringify({
            channel_id: channel.id,
            values: state.values,
        });
        webSocket.send(message);

        render();
    }

    const removePoint = () => {
        const canvasEl = canvas.current!;
        const state = stateRef.current;
        const drawingContext = canvasEl.getContext('2d')!;
        const render = () => drawGraph(drawingContext, state);

        if (state.values.length >= 3) {
            state.values.pop();
        }

        const message = JSON.stringify({
            channel_id: channel.id,
            values: state.values,
        });
        webSocket.send(message);

        render();
    }

    useEffect(() => {
        const canvasEl = canvas.current!;
        const state = stateRef.current;
        const drawingContext = canvasEl.getContext('2d')!;

        const render = () => drawGraph(drawingContext, state);

        const setupCanvas = () => {
            const width = container.current?.getBoundingClientRect().width! - 10;
            state.width = width;
            state.height = width * 0.4;
            canvasEl.width = state.width;
            canvasEl.height = state.height;
            setupCanvasDpi(canvasEl, drawingContext);
        };

        canvasEl.onclick = (e) => {
            state.mousePosition = relMouseCoords(e);
            render();
        };

        canvasEl.onmousedown = (e) => {
            const dragStart = relMouseCoords(e);
            const pointIndex = getPointIndex(dragStart, state);
            console.log(pointIndex);

            if (pointIndex != null) {
                state.drag = true;
                state.dragStart = dragStart;
                state.dragPoint = pointIndex;
                state.baseValues = state.values.map(i => i);
            }

            render();
        };

        const onMouseUp = (e: MouseEvent) => {
            state.drag = false;
            render();
        };

        const onMouseMove = (e: MouseEvent) => {
            state.mousePosition = relMouseCoords(e, canvasEl);
            if (isNaN(state.mousePosition.y)) {
                render();
                return;
            }

            if (state.drag && state.dragStart) {
                const dif = (state.mousePosition.y - state.dragStart.y) / (state.height - 24);

                state.values[state.dragPoint] = Math.max(0, Math.min(1, state.baseValues[state.dragPoint] - dif));

                const message = JSON.stringify({
                    channel_id: channel.id,
                    values: state.values,
                });
                webSocket.send(message);
            }

            render();
        };

        const onResize = () => {
            setupCanvas();
            render();
        };

        window.addEventListener('mouseup', onMouseUp);
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('resize', onResize);

        setupCanvas();
        render();

        return () => {
            window.removeEventListener('mouseup', onMouseUp);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('resize', onResize);
        };
    }, []);

    return {
        canvas,
        container,
        addPoint,
        removePoint,
    };
}

function Graph(props: Props) {
    const graph = useGraph(props.channel, props.channel.values, props.webSocket);

    return (
        <Row>
            <Col span={18}>
                <div ref={graph.container} style={{ border: 'solid' }}>
                    <canvas ref={graph.canvas} />
                </div>
            </Col>
            <Col span={1}>

            </Col>
            <Col span={5}>

            </Col>
            <br/>
            <Button onClick={graph.removePoint}>
                -
            </Button>
            <Button onClick={graph.addPoint}>
                +
            </Button>
        </Row>
    );
}

export { Graph };
