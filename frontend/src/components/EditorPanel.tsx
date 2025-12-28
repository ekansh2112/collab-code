import { useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import * as Y from 'yjs'
import { MonacoBinding } from 'y-monaco'
import { WebsocketProvider } from 'y-websocket'

export default function EditorPanel({ roomId }: { roomId: string }) {
  const ydoc = useRef<Y.Doc>(null);
  const provider = useRef<WebsocketProvider>(null);
  const bindingRef = useRef<MonacoBinding>(null);
  const type = useRef<Y.Text>(null);

  useEffect(() => {
    ydoc.current = new Y.Doc();
    // provider.current = new WebsocketProvider("ws://localhost:3001?room=" + roomId, roomId, ydoc.current!);
    provider.current = new WebsocketProvider("wss://collab-code-uj27.onrender.com?room=" + roomId, roomId, ydoc.current!);
    type.current = ydoc.current!.getText("togethercoding123")
    
    provider.current.on("status", (event) => {
        console.log("WebSocket status:", event.status);
      });
    
    return () => {
        console.log("Cleanup WebSocket + Ydoc connection");
        bindingRef.current?.destroy();
        provider?.current?.destroy();
        ydoc.current?.destroy();
    }
  }, [roomId]);

  useEffect(() => {
    if (!ydoc.current) return;
    const update = Y.encodeStateAsUpdate(ydoc.current!);
    //POST call to backend to save the update
    console.log("update-------> ", update);
  }, [roomId]);

  //GET call to update from backend
//   useEffect(() => {
//     fetch(`http://localhost:3001/load?roomId=${roomId}`)
//       .then(res => res.json())
//       .then(data => {
//         if (data.encodedUpdate) {
//           const update = new Uint8Array(data.encodedUpdate);
//           Y.applyUpdate(ydoc.current, update);
//         }
//       });
//   }, [roomId]);

  return (
    <Editor
    onMount={(editor, monaco) => {
        const model = monaco.editor.createModel("", "text");
        editor.setModel(model);
        provider.current!.on('status', e => console.log('status:', e));
        bindingRef.current = new MonacoBinding(
           type.current!,
           model,
           new Set([editor]),
           provider.current!.awareness
        );
     }}
      defaultLanguage="text"
      theme="vs-dark"
      options={{ minimap: { enabled: false } }}
    />
  );
}
