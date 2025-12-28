import { useState } from "react";

export default function ThemeToggle({ setTheme }: { setTheme: (theme: string) => void }) {
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => {
    const newTheme = isDark ? "light" : "vs-dark";
    setIsDark(!isDark);
    setTheme(newTheme);
  };

  return (
    <button onClick={toggleTheme}>
      {isDark ? "Light Mode" : "Dark Mode"}
    </button>
  );
}
