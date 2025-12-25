import { useNavigate } from "react-router-dom";
import { v4 as uuid } from "uuid";

export default function Home() {
  const navigate = useNavigate();

  const createRoom = () => {
    const id = uuid();
    navigate(`/room/${id}`);
  };

  return (
    <div style={{ display: "flex", height: "100vh", justifyContent: "center",
                  alignItems: "center", flexDirection: "column" }}>
      <h2>Collaborative Code Editor</h2>
      <button onClick={createRoom}>Create Room</button>
    </div>
  );
}
