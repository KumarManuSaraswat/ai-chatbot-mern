import { useEffect, useRef, useState } from "react";
import API from "./services/api";
import MessageBubble from "./components/MessageBubble";
import TypingIndicator from "./components/TypingIndicator";

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [chatId, setChatId] = useState(null);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingChatId, setEditingChatId] = useState(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // NEW

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
      setIsSidebarOpen(false); // close on mobile after selecting chat
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
    setIsSidebarOpen(false);
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
        error?.response?.data?.error ||
          "Something went wrong. Please try again."
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

  const deleteChat = async (id) => {
    try {
      await API.delete(`/chat/${id}`);

      if (chatId === id) {
        setChatId(null);
        setMessages([]);
      }

      fetchChats();
    } catch (error) {
      console.error("Error deleting chat:", error);
      setError("Could not delete chat.");
    }
  };

  const startRenameChat = (chat) => {
    setEditingChatId(chat._id);
    setEditedTitle(chat.title || "");
  };

  const saveRenameChat = async (id) => {
    try {
      await API.patch(`/chat/${id}`, {
        title: editedTitle,
      });

      setEditingChatId(null);
      setEditedTitle("");
      fetchChats();
    } catch (error) {
      console.error("Error renaming chat:", error);
      setError("Could not rename chat.");
    }
  };

  // Reusable sidebar content (for desktop + mobile)
  const SidebarContent = () => (
    <>
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
            <div
              key={chat._id}
              className={`w-full rounded-xl px-3 py-3 transition ${
                chatId === chat._id
                  ? "bg-white/10"
                  : "bg-white/5 hover:bg-white/10"
              }`}
            >
              {editingChatId === chat._id ? (
                <div className="space-y-2">
                  <input
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="w-full rounded-lg bg-black/20 border border-white/10 px-2 py-1 text-sm outline-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveRenameChat(chat._id)}
                      className="text-xs bg-blue-600 px-2 py-1 rounded-md"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingChatId(null);
                        setEditedTitle("");
                      }}
                      className="text-xs bg-zinc-700 px-2 py-1 rounded-md"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => openChat(chat._id)}
                    className="w-full text-left"
                  >
                    <p className="text-sm font-medium truncate">
                      {chat.title || "Untitled chat"}
                    </p>
                  </button>

                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => startRenameChat(chat)}
                      className="text-xs text-blue-400 hover:underline"
                    >
                      Rename
                    </button>
                    <button
                      onClick={() => deleteChat(chat._id)}
                      className="text-xs text-red-400 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </>
  );

  return (
    <div className="h-screen bg-[#0b0f19] text-white flex overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-72 bg-[#111827] border-r border-white/10 flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay + drawer */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          {/* Dark overlay */}
          <div
            className="fixed inset-0 bg-black/60"
            onClick={() => setIsSidebarOpen(false)}
          />

          {/* Slide-in panel */}
          <div className="relative z-50 w-72 max-w-full h-full bg-[#111827] border-r border-white/10 flex flex-col">
            <SidebarContent />
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col">
        <header className="border-b border-white/10 px-4 md:px-6 py-3 md:py-4 bg-[#0b0f19]/95 backdrop-blur flex items-center gap-3">
          {/* Mobile menu button */}
          <button
            className="md:hidden inline-flex items-center justify-center rounded-lg border border-white/10 w-9 h-9"
            onClick={() => setIsSidebarOpen(true)}
          >
            <span className="sr-only">Open chat list</span>
            <div className="space-y-1">
              <span className="block w-5 h-0.5 bg-white" />
              <span className="block w-5 h-0.5 bg-white" />
              <span className="block w-5 h-0.5 bg-white" />
            </div>
          </button>

          <div>
            <h1 className="text-lg font-semibold">Gemini Style AI Chatbot</h1>
            <p className="text-xs md:text-sm text-zinc-400">
              Built with React, Express, MongoDB, and Gemini API
            </p>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.length === 0 && !loading && (
              <div className="text-center mt-20">
                <h2 className="text-3xl font-semibold text-zinc-200">
                  Hello, User
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
                <div className="max-w-3xl px-4 py-3 rounded-2xl bg-white/5 border border-white/10">
                  <TypingIndicator />
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>
        </section>

        <div className="border-t border-white/10 p-4 bg-[#0b0f19]">
          <div className="max-w-4xl mx-auto">
            {error && (
              <div className="mb-3 text-sm text-red-400">{error}</div>
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