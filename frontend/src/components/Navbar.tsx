
export default function Navbar({ roomId }: { roomId?: string }) {

  const shareRoom = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("URL copied! Share with your friend");
  };

  return (
    <div className="navbar">
      <h3 className="logo">Collab Code</h3>

      <div className="nav-actions">
        {roomId && <button onClick={shareRoom}>Share</button>}

        <select className="placeholder-dropdown">
          <option>Recent Rooms</option>
          <option disabled>Room list coming soon…</option>
        </select>

        <button className="login-btn">Login / Signup</button>
      </div>
    </div>
  );
}
