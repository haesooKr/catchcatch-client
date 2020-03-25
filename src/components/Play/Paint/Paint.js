import React, { useRef, useEffect } from "react";
import "./Paint.scss";

const Paint = ({ paintedData, setPaintData }) => {

  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const colors = document.querySelectorAll(".js-color");
    const range = document.querySelector(".js-range");
    const mode = document.querySelector(".js-mode");
    const erase = document.querySelector(".js-erase");
    const send = document.querySelector(".js-send");

    const INITIAL_COLOR = "#2c2c2c";
    const CANVAS_SIZE = 500;

    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = INITIAL_COLOR;
    ctx.fillStyle = INITIAL_COLOR;
    ctx.lineWidth = 2.5;

    if(paintedData != null){
      console.log(paintedData);
      console.log('타입', typeof paintedData)
      console.log(new Uint8Array(paintedData))
      const imageData = ctx.createImageData(canvas.width, canvas.height);
      imageData.data.set(new Uint8Array(paintedData));
      console.log(imageData);
      ctx.putImageData(imageData, 0, 0)
    }

    let painting = false;
    let filling = false;

    function stopPainting() {
      painting = false;
    }

    function startPainting(e) {
      painting = true;
    }

    function onMouseMove(e) {
      const x = e.offsetX;
      const y = e.offsetY;
      if (!painting) {
        ctx.beginPath();
        ctx.moveTo(x, y);
      } else {
        if (!filling) {
          ctx.lineTo(x, y);
          ctx.stroke();
        }
      }
    }

    function changeColor(e) {
      const color = e.target.style.backgroundColor;
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
    }
    function changeRange(e) {
      const rangeValue = e.target.value;
      ctx.lineWidth = rangeValue;
    }
    function handleModeClick() {
      if (filling) {
        filling = false;
        mode.innerText = "Fill";
      } else {
        filling = true;
        mode.innerText = "Paint";
      }
    }

    function handleCanvasClick() {
      if (filling) {
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }

    function handleContextMenu(e) {
      e.preventDefault();
    }

    function handleEraseClick() {
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    Array.from(colors).forEach(color =>
      color.addEventListener("click", changeColor)
    );
    // color change buttons
    range.addEventListener("change", changeRange);

    if (canvas) {
      canvas.addEventListener("mousemove", onMouseMove);
      canvas.addEventListener("mousedown", startPainting);
      canvas.addEventListener("mouseup", stopPainting);
      canvas.addEventListener("mouseleave", stopPainting);
      canvas.addEventListener("click", handleCanvasClick);
      canvas.addEventListener("contextmenu", handleContextMenu);
    }

    if (mode) {
      mode.addEventListener("click", handleModeClick);
    }

    if (erase) {
      erase.addEventListener("click", handleEraseClick);
    }

    if (send){
      send.addEventListener('click', () => {
        console.log("data", ctx.getImageData(0, 0, canvas.width, canvas.height));
        setPaintData(ctx.getImageData(0, 0, canvas.width, canvas.height))
      })
    }
  }, [setPaintData, paintedData]);

  return (
    <div className="paintContainer">
      <canvas ref={canvasRef}/>
      <div className="control">
        <div className="control_range">
          <input
            type="range"
            className="js-range"
            min="0.1"
            max="5.0"
            step="0.1"
          />
        </div>
        <div className="control_btns">
          <button className="js-mode">Fill</button>
          <button className="js-erase">Erase All</button>
          <button className="js-send">Send</button>
        </div>
        <div className="js-colors control_colors">
          <div className="js-color control_color" style={{backgroundColor: '#2c2c2c'}}></div>
          <div className="js-color control_color" style={{backgroundColor: '#eee'}}></div>
          <div className="js-color control_color" style={{backgroundColor: '#ff3b30'}}></div>
          <div className="js-color control_color" style={{backgroundColor: '#ff9500'}}></div>
          <div className="js-color control_color" style={{backgroundColor: '#ffcc00'}}></div>
          <div className="js-color control_color" style={{backgroundColor: '#4cd963'}}></div>
          <div className="js-color control_color" style={{backgroundColor: '#5ac8fa'}}></div>
          <div className="js-color control_color" style={{backgroundColor: '#0579ff'}}></div>
          <div className="js-color control_color" style={{backgroundColor: '#5856d6'}}></div>
        </div>
      </div>
    </div>
  );
};

export default Paint;