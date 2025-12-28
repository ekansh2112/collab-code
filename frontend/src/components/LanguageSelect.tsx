export default function LanguageSelect({ setLang }: { setLang: (lang: string) => void }) {
    return (
      <select onChange={(e) => setLang(e.target.value)}>
        <option value="javascript">JavaScript</option>
        <option value="typescript">TypeScript</option>
        <option value="python">Python</option>
        <option value="c">C</option>
        <option value="cpp">C++</option>
      </select>
    );
  }
  