interface TextInputProps {
  text: string;
  onTextChange: (text: string) => void;
}

export function TextInput({ text, onTextChange }: TextInputProps) {
  return (
    <textarea
      value={text}
      onChange={(e) => onTextChange(e.target.value)}
      placeholder="Paste or type your text here to begin speed reading..."
      className="w-full h-64 bg-black text-white p-4 text-lg resize-none border-none outline-none focus:outline-none focus:ring-0 placeholder-gray-500"
      aria-label="Text input for speed reading"
    />
  );
}
