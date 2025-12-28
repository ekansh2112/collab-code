import { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import * as Y from "yjs";
import { MonacoBinding } from "y-monaco";
import { WebsocketProvider } from "y-websocket";
import LanguageSelect from "./LanguageSelect";
import ThemeToggle from "./ThemeToggle";

export default function EditorPanel({ roomId }: { roomId: string }) {

  const [theme, setTheme] = useState("vs-dark");
  const [lang, setLang] = useState("javascript");

  // ✅ Properly typed refs with initial nulls
  const ydoc = useRef<Y.Doc | null>(null);
  const provider = useRef<WebsocketProvider | null>(null);
  const bindingRef = useRef<MonacoBinding | null>(null);
  const type = useRef<Y.Text | null>(null);

  useEffect(() => {
    ydoc.current = new Y.Doc();
    provider.current = new WebsocketProvider(
      `wss://collab-code-uj27.onrender.com?room=${roomId}`,
      roomId,
      ydoc.current
    );

    type.current = ydoc.current.getText("togethercoding123");

    return () => {
      bindingRef.current?.destroy();
      provider.current?.destroy();
      ydoc.current?.destroy();
    };
  }, [roomId]);

  return (
    <div className="editor-wrapper">
      <div className="editor-controls">
        <LanguageSelect setLang={setLang} />
        <ThemeToggle setTheme={setTheme} />
      </div>

      <Editor
        language={lang}
        theme={theme}
        onMount={(editor, monaco) => {
          if (!provider.current || !type.current) return;

          const model = monaco.editor.createModel("", lang);
          editor.setModel(model);

          bindingRef.current = new MonacoBinding(
            type.current,
            model,
            new Set([editor]),
            provider.current.awareness
          );
        }}
        options={{ minimap: { enabled: false } }}
      />
    </div>
  );
}
