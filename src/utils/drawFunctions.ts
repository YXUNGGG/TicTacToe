import { Wins_positins } from "../engine";
import { symbolType } from "../types/GameContext";

const Colors = [
  "#66BA66",
  "#FF4E4E"
];

export const getCanvasPosition = (cell: number) => {
  const cellElement = document.querySelectorAll(".cell")[cell] as HTMLDivElement;
  const boardElement = document.querySelector("canvas")!;

  const boardRect = boardElement.getBoundingClientRect();
  const tileRect = cellElement.getBoundingClientRect();
  
  const offsetX = Math.trunc(tileRect.x - boardRect.x);
  const offsetY = Math.trunc(tileRect.y - boardRect.y);
  const centerX = offsetX + tileRect.width / 2;
  const centerY = offsetY + tileRect.height / 2;

  return {
    cellElement,
    cellPadding: 44,
    boardRect,
    tileRect,
    centerX,
    centerY,
    offsetX,
    offsetY
  }
}

export const renderSymbol = async (
  ctx: CanvasRenderingContext2D, 
  tile: number, 
  userTurn: symbolType, 
  color = "", 
  instantly = false,
  isBot = true
) => {
  ctx.lineWidth = 18;
  ctx.lineCap = "round";

  if (userTurn === "X") {
    ctx.strokeStyle = color || Colors[0];
    await drawCross(ctx, tile, instantly, isBot);
  } else {
    ctx.strokeStyle = color || Colors[1];
    await drawCircle(ctx, tile, instantly, isBot);
  }
}

const drawCircle = (
  ctx: CanvasRenderingContext2D, 
  tile: number, 
  instantly: boolean,
  isBot = true
) => {
  const {offsetX, offsetY, tileRect, centerX, centerY, cellPadding} = getCanvasPosition(tile);

  const radius = tileRect.width / 2 - cellPadding;

  const drawGrayCircle = () => {
    ctx.beginPath();
    ctx.strokeStyle = "#cecece"; // circle color
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2); // full circle
    ctx.stroke();
  };

  return new Promise<void>(resolve => {
    const animate = (angle: number) => {
      ctx.clearRect(offsetX, offsetY, tileRect.width, tileRect.height);

      if (!instantly && !isBot) {
        drawGrayCircle();
        ctx.strokeStyle = Colors[1];
      }
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, Math.PI / 2, angle * (Math.PI / 2));
      ctx.stroke();

      if (angle >= 5) return resolve();

      requestAnimationFrame(() => animate(angle + 0.2));
    }

    animate(instantly ? 8 : 1);
  })
}

const drawCross = async (
  ctx: CanvasRenderingContext2D, 
  tile: number, 
  instantly: boolean, 
  isBot = true
) => {
  const {offsetX, offsetY, tileRect, cellPadding} = getCanvasPosition(tile);

  //ctx.clearRect(offsetX, offsetY, tileRect.width, tileRect.height);

  const startX = offsetX + cellPadding;
  const startY = offsetY + cellPadding;

  const EndX = offsetX + tileRect.width - cellPadding;
  const EndY = offsetY + tileRect.height - cellPadding;
  
  const drawGrayCross = () => {
    drawLine(ctx, startX, startY, EndX, EndY, true);
    drawLine(ctx, EndX, startY, startX, EndY, true);
  }
  if (!instantly && !isBot) {
    ctx.strokeStyle = "#cecece";
    drawGrayCross();
    ctx.strokeStyle = Colors[0];
  }

  await drawLine(ctx, startX, startY, EndX, EndY, instantly, 0.1);
  await drawLine(ctx, EndX, startY, startX, EndY, instantly, 0.1);
  return;
}

const drawLine = (
  ctx: CanvasRenderingContext2D, 
  startx: number, 
  starty: number, 
  endx: number, 
  endy: number,
  instantly: boolean,
  speed: number = 0.1,
) => {
  return new Promise<void>(resolve => {
    const animate = (counterProgress: number) => {
      ctx.beginPath();
      ctx.moveTo(startx, starty);
      ctx.lineTo(endx - (endx - startx) * counterProgress, endy - (endy - starty) * counterProgress);
      ctx.stroke();

      if (counterProgress <= 0.1) return resolve();
      requestAnimationFrame(() => animate(counterProgress - speed));
    }
    animate(instantly ? 0 : 1);
  });
}

export const drawWinLine = async (ctx: CanvasRenderingContext2D, arr: number[]) => {   // issues with adapt.
  const [startPos, , endPos] = arr;

  let direction: "horizontal" | "vertical" | "diagonal" | "diagonal-inverted";
  Wins_positins.forEach((array, index) => {
    if (array.toString() === arr.toString()) {
      if (index < 3) direction = "horizontal";
      else if (index < 6) direction = "vertical";
      else if (index === 6) direction = "diagonal";
      else direction = "diagonal-inverted";
    }
  });
  
  const {tileRect: startRect, cellPadding, offsetX: startOffsetX, offsetY: startOffsetY, centerX: startCenterX, centerY: startCenterY} = getCanvasPosition(startPos);
  const {tileRect: endRect, offsetX: endOffsetX, offsetY: endOffsetY, centerY: endCenterY, centerX: endCenterX} = getCanvasPosition(endPos);

  let startX, 
    startY, 
    endX, 
    endY;

  switch(direction!) {
    case "horizontal":
      startX = startOffsetX + cellPadding / 2;
      startY = startCenterY;
      endX = endOffsetX + endRect.width + cellPadding;
      endY = endCenterY;
      break;
    case "vertical":
      startX = startCenterX;
      startY = startOffsetY + cellPadding / 2;
      endX = endCenterX;
      endY = endOffsetY + endRect.height + cellPadding;
      break;
    case "diagonal":
      startX = startOffsetX + cellPadding / 2;
      startY = startOffsetY + cellPadding / 2;
      endX = endOffsetX + endRect.width + cellPadding;
      endY = endOffsetY + endRect.height + cellPadding;
      break;
    case "diagonal-inverted":
      startX = startOffsetX + startRect.width - cellPadding / 2;
      startY = startOffsetY + cellPadding / 2;
      endX = endOffsetX - cellPadding;
      endY = endOffsetY + endRect.height + cellPadding;
  }

  ctx.lineWidth = 10;
  ctx.strokeStyle = "#313131";

  await drawLine(ctx, startX, startY, endX, endY, false, 0.05);
}