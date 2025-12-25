import { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";

function App() {
  const ws = useRef<WebSocket | null>(null);
  const skipNextUpdate = useRef(false); // avoid infinite loops
  const [value, setValue] = useState<string>("");

  // Connect WS when component loads
  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:3001");

    ws.current.onopen = () => console.log("Connected to WS");
    ws.current.onmessage = async(event) => {
      const text = await event.data.text();
      console.log("received message", text);
      skipNextUpdate.current = true; // next change should not be broadcast
      setValue(text);
    };

    return () => ws.current?.close(); // type guard not needed since useRef ensures it's not null
  }, []);

  // Handle local input
  const handleEditorChange = (text: string) => {
    if (!skipNextUpdate.current) {
      console.log("sending message", text,typeof text);
      ws.current?.send(text);
    }
    skipNextUpdate.current = false;
    setValue(text);
  };

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <Editor
        defaultLanguage="javascript"
        theme="vs-dark"
        value={value}
        onChange={(text) => handleEditorChange(text || "")}
        options={{ minimap: { enabled: false } }}
      />
    </div>
  );
}

export default App;
