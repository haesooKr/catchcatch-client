import React, { useRef, useEffect } from "react";
import "./Paint.scss";

const Paint = ({ canPaint, paintedData, setPaintData }) => {

  const canvasRef = useRef(null);

  useEffect(() => {

    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const colors = document.querySelectorAll(".js-color");
    const range = document.querySelector(".js-range");
    const mode = document.querySelector(".js-mode");
    const erase = document.querySelector(".js-erase");

    const INITIAL_COLOR = "#2c2c2c";
    const CANVAS_SIZE = 500;

    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = INITIAL_COLOR;
    ctx.fillStyle = INITIAL_COLOR;
    ctx.lineWidth = 2.5;

    if(paintedData != null && canPaint === false){
      const imageData = ctx.createImageData(canvas.width, canvas.height);
      imageData.data.set(new Uint8Array(paintedData));
      ctx.putImageData(imageData, 0, 0)
    } else {
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    let painting = false;
    let filling = false;

    function stopPainting(e) {
      e.preventDefault();
      painting = false;
    }

    function startPainting(e) {
      e.preventDefault();
      painting = true;
    }

    function onMouseMove(e) {
      e.preventDefault();
      let rect = canvas.getBoundingClientRect();
      const x = e.offsetX || e.touches[0].clientX - rect.left;;
      const y = e.offsetY || e.touches[0].clientY - rect.top;;
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
      sendData();
    }

    function handleContextMenu(e) {
      e.preventDefault();
    }

    function handleEraseClick() {
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      sendData();
    }

    function sendData(){
      setPaintData(ctx.getImageData(0, 0, canvas.width, canvas.height));
    }

    Array.from(colors).forEach(color =>
      color.addEventListener("click", changeColor)
    );
    // color change buttons
    range.addEventListener("change", changeRange);

    if (canvas && canPaint) {
      canvas.addEventListener("touchmove", onMouseMove);
      canvas.addEventListener("touchstart", startPainting);
      canvas.addEventListener("touchend", stopPainting);
      canvas.addEventListener("touchcancel", stopPainting);

      canvas.addEventListener("mousemove", onMouseMove);
      canvas.addEventListener("mousedown", startPainting);
      canvas.addEventListener("mouseup", stopPainting);
      canvas.addEventListener("mouseleave", stopPainting);
      canvas.addEventListener("click", handleCanvasClick);
      canvas.addEventListener("contextmenu", handleContextMenu);
    }

    if (mode && canPaint) {
      mode.addEventListener("click", handleModeClick);
    }

    if (erase && canPaint) {
      erase.addEventListener("click", handleEraseClick);
    }

    return () => {
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      canvas.removeEventListener("touchmove", onMouseMove);
      canvas.removeEventListener("touchstart", startPainting);
      canvas.removeEventListener("touchend", stopPainting);
      canvas.removeEventListener("touchcancel", stopPainting);

      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mousedown", startPainting);
      canvas.removeEventListener("mouseleave", stopPainting);
      canvas.removeEventListener("click", handleCanvasClick);
      canvas.removeEventListener("contextmenu", handleContextMenu);
      canvas.removeEventListener("mouseup", stopPainting);
      erase.removeEventListener("click", handleEraseClick);
      mode.removeEventListener("click", handleModeClick);
      range.removeEventListener("change", changeRange);
      Array.from(colors).forEach(color =>
        color.removeEventListener("click", changeColor)
      );
    }

  }, [setPaintData, paintedData, canPaint]);

  useEffect(() => {
    if(canPaint === false){
      document.querySelector(".control").style.display = "none";
    } else {
      document.querySelector(".control").style.display = "block";
    }

  }, [canPaint])

  return (
    <div className="paintContainer">
      <canvas ref={canvasRef} className="canvas"/>
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
