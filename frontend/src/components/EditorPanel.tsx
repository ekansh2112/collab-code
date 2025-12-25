import { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";

export default function EditorPanel({ roomId }: { roomId: string }) {
  const ws = useRef<WebSocket | null>(null);
  const skipNext = useRef(false);
  const [value, setValue] = useState("");

  useEffect(() => {
    ws.current = new WebSocket(`ws://localhost:3001?room=${roomId}`);

    ws.current.onopen = () => {
      console.log("WS connected in room:", roomId);
    };

    ws.current.onmessage = async (event) => {
      const text = await event.data.text();
      skipNext.current = true;
      setValue(text);
    };

    return () => ws.current?.close();
  }, [roomId]);

  const handleChange = (text: string) => {
    if (!skipNext.current) {
    ws.current?.send(text);
    }
    skipNext.current = false;
    setValue(text);
  };

  return (
    <Editor
      defaultLanguage="javascript"
      theme="vs-dark"
      value={value}
      onChange={(v) => handleChange(v || "")}
      options={{ minimap: { enabled: false } }}
    />
  );
}
