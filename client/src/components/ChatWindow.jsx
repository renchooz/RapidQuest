import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft } from "lucide-react";
import api from "../api/axios";
import { io } from "socket.io-client";


const SOCKET_URL ="https://rapidquest-1sx1.onrender.com";

export default function ChatWindow({ contact, currentUserId, refreshConversations, onBack }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const messagesEndRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const socketRef = useRef(null);


  const formatTime = (ts) => {
    if (!ts && ts !== 0) return "";
   
    if (typeof ts === "string" && isNaN(Number(ts))) {
      const d = new Date(ts);
      return isNaN(d.getTime())
        ? ""
        : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
 
    const n = Number(ts);
    const ms = n < 1e12 ? n * 1000 : n; 
    const d = new Date(ms);
    return isNaN(d.getTime())
      ? ""
      : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // init socket once
  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, { withCredentials: true });
    }
    const s = socketRef.current;

    const onReceive = (msg) => {
    
      if (
        (msg.from === contact.wa_id && msg.to === currentUserId) ||
        (msg.from === currentUserId && msg.to === contact.wa_id)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    const onStatus = (update) => {
      
      setMessages((prev) =>
        prev.map((m) =>
          m.messageId === update.messageId ? { ...m, status: update.status } : m
        )
      );
    };

    s.on("receive_message", onReceive);
    s.on("message:status", onStatus);

    return () => {
      s.off("receive_message", onReceive);
      s.off("message:status", onStatus);
    };
  }, [contact?.wa_id, currentUserId]);

  const fetchMessages = async () => {
    try {
      const { data } = await api.get(`/messages/${contact.wa_id}`, {
        params: { from: currentUserId },
      });
      setMessages(data || []);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  const sendMessage = async () => {
    if (!text.trim() || loading) return;
    setLoading(true);
    const textToSend = text.trim();
    const now = Date.now();

    try {
      
      const { data: saved } = await api.post(`/messages/${contact.wa_id}`, {
        from: currentUserId,
        text: textToSend,
      });

      
      const outgoing =
        saved && (saved.messageId || saved._id)
          ? {
              ...saved,
              messageId: saved.messageId || saved._id,
              status: saved.status || "sent",
              timestamp: saved.timestamp ?? now,
              to: saved.to ?? contact.wa_id,
              from: saved.from ?? currentUserId,
              text: saved.text ?? textToSend,
            }
          : {
              messageId: crypto?.randomUUID?.() || `${currentUserId}-${now}`,
              from: currentUserId,
              to: contact.wa_id,
              text: textToSend,
              timestamp: now, 
              status: "sent", 
            };

      
      setMessages((prev) => [...prev, outgoing]);

      
      socketRef.current?.emit("send_message", outgoing);

      setText("");
      refreshConversations?.();

      
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [contact?.wa_id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const tickFor = (status) => {
    if (status === "read") return "✓✓";
    if (status === "delivered") return "✓✓";
    if (status === "sent") return "✓";
    return ""; 
  };

  return (
    <div className="flex flex-col h-full bg-white">
      
      <div className="flex items-center p-4 border-b bg-gray-50">
        {onBack && (
          <button
            onClick={onBack}
            className="md:hidden p-2 hover:bg-gray-200 rounded-full mr-3"
            aria-label="Back to conversations"
          >
            <ArrowLeft size={24} className="text-gray-700" />
          </button>
        )}

        <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-semibold text-lg shadow-md mr-3">
          {(contact.name || contact.wa_id).charAt(0).toUpperCase()}
        </div>

        <div>
          <h2 className="font-semibold text-gray-900">{contact.name || contact.wa_id}</h2>
          <p className="text-sm text-gray-500">Online</p>
        </div>
      </div>

     
      <div className="flex-1 p-4 overflow-y-auto scrollbar-hide bg-gray-100 space-y-2">
        {messages.map((msg, index) => {
          const isOwn = msg.from === currentUserId;
          return (
            <div
              key={msg.messageId || `${index}-${msg.timestamp}`}
              className={`max-w-xs p-3 rounded-lg shadow ${
                isOwn
                  ? "bg-green-500 text-white self-end ml-auto"
                  : "bg-white text-gray-800 self-start mr-auto"
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>
              <div className="text-xs mt-1 flex justify-end items-center space-x-1">
                <span>{formatTime(msg.timestamp)}</span>
                {isOwn && <span>{tickFor(msg.status)}</span>}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

     
      <div className="p-4 border-t bg-white flex gap-2">
        <textarea
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type a message..."
          className="flex-1 resize-none border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-green-500"
          style={{ maxHeight: 128 }}
        />
        <button
          onClick={sendMessage}
          disabled={!text.trim() || loading}
          className={`px-5 py-2 rounded-lg text-white font-semibold transition ${
            text.trim() && !loading
              ? "bg-green-600 hover:bg-green-700"
              : "bg-green-300 cursor-not-allowed"
          }`}
        >
          Send
        </button>
      </div>
    </div>
  );
}
