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
  createdAt: number;
  opacity: number;
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

  function drawShape(shape: Drawing) {
    const ctx = canvasRef.current!.getContext("2d")!;
    if (!shape.points || !shape.points.length) return;
  
    // const now = Date.now();
    // const AGE = now - shape.createdAt;
    // const FADE = 4000; // total fade animation duration (ms)

    // // Compute opacity: 1 → 0 smoothly
    // const opacity = Math.max(0, 1 - AGE / FADE);

    // // ✨ Apply glow + fade
    // ctx.strokeStyle = `rgba(0, 255, 149, ${opacity})`; //replace with shape.color later.
    // ctx.shadowColor = `rgba(0, 255, 149, ${opacity * 0.8})`;
    // ctx.shadowBlur = 20;
    ctx.strokeStyle = shape.color;
    ctx.beginPath();
  
    shape.points.forEach((p, i) => {
      i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
    });
  
    ctx.stroke();
    
    // Reset glow settings for safety
    // ctx.shadowBlur = 0;
  }

  function redraw() {
    const canvas = canvasRef.current!;
    const editorEl = editorContainerRef.current!;
    if(!canvas || !editorEl) return;
    if (canvas.width !== editorEl.clientWidth || canvas.height !== editorEl.clientHeight) {
      canvas.width = editorEl.clientWidth;
      canvas.height = editorEl.clientHeight;
    }

    const now = Date.now();
    const FADE_DURATION = 5000;

    const toRemove: number[] = [];
    
    const ctx = canvas.getContext("2d")!;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const arr = drawings.current!.toArray();
    arr.forEach((shape, index) => {
      const age = now - shape.createdAt;

      if (age >= FADE_DURATION) {
        toRemove.push(index);
      } else {
        drawShape(shape); 
    }
    });

    // Delete expired after iteration (reverse prevents index shift issues)
    toRemove.reverse().forEach(i => drawings.current!.delete(i, 1));

    provider.current?.awareness.getStates().forEach((state) => {
      if (state.drawing) drawShape(state.drawing);
    });

    // Draw active line (local preview)
    if (activeLineRef.current) {
      drawShape(activeLineRef.current);
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

    provider.current.awareness.on("update", () => {
      redraw();
    });

    return () => {
      bindingRef.current?.destroy();
      provider.current?.destroy();
      ydoc.current?.destroy();
    };
  }, [roomId]);

  const activeLineRef = useRef<Drawing | null>(null);

  function initDrawingCanvas() {
    const canvas = canvasRef.current!;
    const editorEl = editorContainerRef.current!;
    if(!canvas || !editorEl) return;
    
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const ctx = canvas.getContext("2d")!;
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#00ff95";

    canvas.onmousedown = (e) => {
      if (!drawModeRef.current) return;
      resizeCanvas(); // ensure correct size before drawing
      activeLineRef.current = {
        id: uuid(),
        type: "line",
        //color: glowing red color like neon
        color: "#ff0000",
        points: [{ x: e.offsetX, y: e.offsetY }],
        createdAt: Date.now(),
        opacity: 1,
      };
      provider.current!.awareness.setLocalStateField("drawing", activeLineRef.current);
    };

    canvas.onmousemove = (e) => {
      if (!activeLineRef.current) return;
      const point = { x: e.offsetX, y: e.offsetY };
      activeLineRef.current.points.push(point);

      // Push just the new point to Yjs
      drawings.current!.push([{
        ...activeLineRef.current,
        points: [point], // Only latest point
      }]);

      redraw();

      provider.current!.awareness.setLocalStateField("drawing", activeLineRef.current);
    };

    canvas.onmouseup = () => {
      if (!activeLineRef.current) return;
      drawings.current!.push([activeLineRef.current]);
      activeLineRef.current = null;
      provider.current!.awareness.setLocalStateField("drawing", activeLineRef.current);
    };
  }

  function resizeCanvas() {
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
