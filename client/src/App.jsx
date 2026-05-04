import { useEffect, useRef, useState } from "react";
import API from "./services/api";
import MessageBubble from "./components/MessageBubble";

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [chatId, setChatId] = useState(null);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const chatEndRef = useRef(null);

  const fetchChats = async () => {
    try {
      const res = await API.get("/chat");
      setChats(res.data);
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  };

  const openChat = async (id) => {
    try {
      setError("");
      const res = await API.get(`/chat/${id}`);
      setChatId(res.data._id);
      setMessages(res.data.messages || []);
    } catch (error) {
      console.error("Error opening chat:", error);
      setError("Could not open this chat.");
    }
  };

  const createNewChat = () => {
    setChatId(null);
    setMessages([]);
    setMessage("");
    setError("");
  };

  const sendMessage = async () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || loading) return;

    const userMessage = {
      role: "user",
      content: trimmedMessage,
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await API.post("/chat", {
        message: trimmedMessage,
        chatId,
      });

      setChatId(res.data.chatId);
      setMessages(res.data.messages || []);
      await fetchChats();
    } catch (error) {
      console.error("Frontend error:", error);
      setError(
        error?.response?.data?.error || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div className="h-screen bg-[#0b0f19] text-white flex overflow-hidden">
      <aside className="hidden md:flex md:w-72 bg-[#111827] border-r border-white/10 flex-col">
        <div className="p-4 border-b border-white/10">
          <button
            onClick={createNewChat}
            className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-3 font-medium"
          >
            + New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <h2 className="text-sm uppercase tracking-wide text-zinc-400 px-2">
            Recent Chats
          </h2>

          {chats.length === 0 ? (
            <p className="text-sm text-zinc-500 px-2">No chats yet</p>
          ) : (
            chats.map((chat) => (
              <button
                key={chat._id}
                onClick={() => openChat(chat._id)}
                className={`w-full text-left rounded-xl px-3 py-3 transition ${
                  chatId === chat._id
                    ? "bg-white/10"
                    : "bg-white/5 hover:bg-white/10"
                }`}
              >
                <p className="text-sm font-medium truncate">
                  {chat.title || "Untitled chat"}
                </p>
              </button>
            ))
          )}
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="border-b border-white/10 px-6 py-4 bg-[#0b0f19]/95 backdrop-blur">
          <h1 className="text-lg font-semibold">Gemini Style AI Chatbot</h1>
          <p className="text-sm text-zinc-400">
            Built with React, Express, MongoDB, and Gemini API
          </p>
        </header>

        <section className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.length === 0 && !loading && (
              <div className="text-center mt-20">
                <h2 className="text-3xl font-semibold text-zinc-200">
                  Hello, Manu
                </h2>
                <p className="text-zinc-400 mt-3">
                  Ask anything to start your Gemini-like chatbot.
                </p>
              </div>
            )}

            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <MessageBubble msg={msg} />
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="max-w-3xl px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-zinc-300">
                  Thinking...
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>
        </section>

        <div className="border-t border-white/10 p-4 bg-[#0b0f19]">
          <div className="max-w-4xl mx-auto">
            {error && (
              <div className="mb-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <div className="flex items-end gap-3">
              <textarea
                rows="1"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Ask Gemini-style chatbot..."
                className="flex-1 resize-none rounded-2xl bg-white/5 border border-white/10 px-4 py-3 outline-none text-white placeholder:text-zinc-500"
              />
              <button
                onClick={sendMessage}
                disabled={loading}
                className="rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed px-5 py-3 font-medium"
              >
                {loading ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;