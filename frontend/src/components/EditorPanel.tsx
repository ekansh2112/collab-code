import { useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import * as Y from 'yjs'
import { MonacoBinding } from 'y-monaco'
import { WebrtcProvider } from 'y-webrtc'
// import { WebsocketProvider } from 'y-websocket'

export default function EditorPanel({ roomId }: { roomId: string }) {
  const ydoc = useRef<Y.Doc>(null);
  const provider = useRef<WebrtcProvider>(null);
//   const provider = useRef<WebsocketProvider>(null);
  const bindingRef = useRef<MonacoBinding>(null);
  const type = useRef<Y.Text>(null);

  useEffect(() => {
    ydoc.current = new Y.Doc();
    provider.current = new WebrtcProvider(roomId, ydoc.current!);
    // provider.current = new WebsocketProvider("wss://collab-code-uj27.onrender.com", roomId, ydoc.current!);
    type.current = ydoc.current!.getText("togethercoding")
    return () => {
      bindingRef.current?.destroy()
      provider.current?.disconnect();
      provider?.current?.destroy()
      ydoc.current?.destroy()
    }
  }, [roomId]);

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
