function TypingIndicator() {
  return (
    <div className="inline-flex items-center gap-1">
      <span className="text-zinc-300 text-sm mr-1">Thinking</span>
      <span className="flex gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:0ms]" />
        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:150ms]" />
        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:300ms]" />
      </span>
    </div>
  );
}

export default TypingIndicator;