import { useParams } from "react-router-dom";
import EditorPanel from "../components/EditorPanel";
import Navbar from "../components/Navbar";
import "../styles/layout.css";

export default function Room() {
  const { roomId } = useParams();

  return (
    <div style={{ 
        width: "100%", 
        height: "100%", 
        display: "flex",
        flexDirection: "column"
      }} className="room-container">
      <Navbar roomId={roomId} />
      <EditorPanel roomId={roomId!} />
    </div>
  );
}
