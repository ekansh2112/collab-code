import { useParams } from "react-router-dom";
import EditorPanel from "../components/EditorPanel";

export default function Room() {
  const { roomId } = useParams<{ roomId: string }>();

  return (
    <div style={{ height: "100vh" }}>
      <h3 style={{ color: "#fff", background: "#222", padding: "10px" }}>
        Room ID: {roomId}
      </h3>
      <EditorPanel roomId={roomId!} />
    </div>
  );
}
