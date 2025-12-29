import { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import * as Y from "yjs";
import { MonacoBinding } from "y-monaco";
import { WebsocketProvider } from "y-websocket";
import LanguageSelect from "./LanguageSelect";
import ThemeToggle from "./ThemeToggle";
import { v4 as uuid } from "uuid";

type Drawing = {
  id: string;
  type: "line";
  color: string;
  points: { x: number; y: number }[];
};
export default function EditorPanel({ roomId }: { roomId: string }) {

  const [theme, setTheme] = useState("vs-dark");
  const [lang, setLang] = useState("javascript");
  const [drawMode, setDrawMode] = useState(false);
  const drawModeRef = useRef(drawMode);

  // ✅ Properly typed refs with initial nulls
  const ydoc = useRef<Y.Doc | null>(null);
  const provider = useRef<WebsocketProvider | null>(null);
  const bindingRef = useRef<MonacoBinding | null>(null);
  const type = useRef<Y.Text | null>(null);

  const drawings = useRef<Y.Array<Drawing> | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const editorContainerRef = useRef<HTMLDivElement | null>(null);


  function redraw() {
    console.log("redraw");
    const canvas = canvasRef.current!;
    const editorEl = editorContainerRef.current!;

    if (canvas.width !== editorEl.clientWidth || canvas.height !== editorEl.clientHeight) {
      canvas.width = editorEl.clientWidth;
      canvas.height = editorEl.clientHeight;
    }


    
    const ctx = canvas.getContext("2d")!;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const arr = drawings.current!.toArray();
    arr.forEach((shape: Drawing) => {
      ctx.strokeStyle = shape.color;
      ctx.beginPath();
      shape.points.forEach((p: { x: number; y: number }, idx: number) => idx === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
      ctx.stroke();
    });

    // Draw active line (local preview)
    if (activeLineRef.current) {
      ctx.beginPath();
      activeLineRef.current.points.forEach((p: { x: number; y: number }, i: number) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
      ctx.stroke();
    }
  }

  useEffect(() => {
    drawModeRef.current = drawMode;
  }, [drawMode]);

  useEffect(() => {
    ydoc.current = new Y.Doc();
    provider.current = new WebsocketProvider(
      `wss://collab-code-uj27.onrender.com?room=${roomId}`,
      roomId,
      ydoc.current
    );

    type.current = ydoc.current.getText("text_togethercoding");
    drawings.current = ydoc.current.getArray("drawings_togethercoding");

    drawings.current.observe(() => redraw());


    return () => {
      bindingRef.current?.destroy();
      provider.current?.destroy();
      ydoc.current?.destroy();
    };
  }, [roomId]);

  const activeLineRef = useRef<Drawing | null>(null);

  function initDrawingCanvas() {
    console.log("initDrawingCanvas");
    const canvas = canvasRef.current!;
    const editorEl = editorContainerRef.current!;
    if(!canvas || !editorEl) return;
    
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const ctx = canvas.getContext("2d")!;
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#00ff95";

    canvas.onmousedown = (e) => {
      console.log("onmousedown",drawModeRef.current);
      if (!drawModeRef.current) return;
      resizeCanvas(); // ensure correct size before drawing
      activeLineRef.current = {
        id: uuid(),
        type: "line",
        color: "#00ff95",
        points: [{ x: e.offsetX, y: e.offsetY }],
      };
    };

    canvas.onmousemove = (e) => {
      console.log("onmousemove",activeLineRef.current);
      if (!activeLineRef.current) return;
      activeLineRef.current.points.push({ x: e.offsetX, y: e.offsetY });
      redraw();
    };

    canvas.onmouseup = () => {
      console.log("onmouseup",activeLineRef.current);
      if (!activeLineRef.current) return;
      drawings.current!.push([activeLineRef.current]);
      activeLineRef.current = null;
    };
  }

  function resizeCanvas() {
    console.log("resizeCanvas");
    const canvas = canvasRef.current;
    const editorEl = editorContainerRef.current;
    if (!canvas || !editorEl) return;
  
    const rect = editorEl.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    redraw();
  }

  


  return (
    <div className="editor-wrapper">
      <div className="editor-controls">
        <LanguageSelect setLang={setLang} />
        <ThemeToggle setTheme={setTheme} />
        {/* 🔹 Toggle Drawing Mode */}
        <button 
          className={`draw-btn ${drawMode ? "active" : ""}`} 
          onClick={() => setDrawMode(!drawMode)}
        >
          ✏️ Draw
        </button>
      </div>
      <div ref={editorContainerRef} style={{ position: "relative", height: "calc(100vh - 50px)", width: "100%" }}>
        <Editor
          language={lang}
          theme={theme}
          onMount={(editor, monaco) => {
            if (!provider.current || !type.current) return;

            const model = monaco.editor.createModel("", lang);
            editor.setModel(model);

            editor.onDidLayoutChange(() => resizeCanvas());
            resizeCanvas(); // initial sync AFTER Monaco is ready


            bindingRef.current = new MonacoBinding(
              type.current,
              model,
              new Set([editor]),
              provider.current.awareness
            );

            // Move init here → editor is fully mounted
            requestAnimationFrame(() => initDrawingCanvas());
          }}
          options={{ minimap: { enabled: false } }}
        />
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: drawMode ? 10 : -10, // hide canvas when not drawing,
            background: "transparent",
            cursor: drawMode ? "crosshair" : "default",
          }}
        />
      </div>
      
    </div>
  );
}
