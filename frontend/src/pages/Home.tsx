import { useNavigate } from "react-router-dom";
import { v4 as uuid } from "uuid";

export default function Home() {
  const navigate = useNavigate();

  const createRoom = () => {
    const id = uuid();
    navigate(`/room/${id}`);
  };

  return (
    <div style={{ 
        width: "100%", 
        height: "100%", 
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column"
      }}>
      <h2>Collaborative Code Editor</h2>
      <button onClick={createRoom}>Create Room</button>
    </div>
  );
}
