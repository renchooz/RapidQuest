import React, { useState, useEffect } from "react";
import api from "./api/axios";
import ConversationsList from "./components/ConversationsList";
import ChatWindow from "./components/ChatWindow";
import { Menu } from "lucide-react";

export default function App() {
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [sidebarVisible, setSidebarVisible] = useState(window.innerWidth >= 768);
  const [loading, setLoading] = useState(false);
  const [currentUserId] = useState("918329446654");

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/messages/conversations", {
        params: { currentUserId },
      });
      setConversations(data);
    } catch (err) {
      console.error("Error fetching conversations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarVisible(true);
      } else {
        setSidebarVisible(!activeChat);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [activeChat]);

  const openSidebar = () => setSidebarVisible(true);
  const closeSidebar = () => setSidebarVisible(false);
  const handleBack = () => {
    setActiveChat(null);
    setSidebarVisible(true);
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden relative">
      {/* Loader overlay */}
      {loading && (
        <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-20 z-50">
          <div className="w-10 h-10 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
        </div>
      )}

      {/* Hamburger menu button for mobile */}
      {!sidebarVisible && (
        <button
          onClick={openSidebar}
          className="fixed top-4 left-4 z-40 p-2 rounded-full bg-white shadow-md hover:shadow-lg md:hidden"
          aria-label="Open conversations menu"
        >
          <Menu size={24} className="text-gray-700" />
        </button>
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-white border-r border-gray-200
          w-72 transform transition-transform duration-300 ease-in-out
          z-30
          md:relative md:translate-x-0
          ${sidebarVisible ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="p-4 font-bold border-b text-xl">Chats</div>
        <ConversationsList
          conversations={conversations}
          onSelectChat={(chat) => {
            setActiveChat(chat);
            closeSidebar();
          }}
        />
      </aside>

      {/* Overlay behind sidebar on mobile */}
      {sidebarVisible && window.innerWidth < 768 && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-20"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Main chat area */}
      <main className="flex-1 flex flex-col">
        {activeChat ? (
          <ChatWindow
            contact={activeChat}
            currentUserId={currentUserId}
            refreshConversations={fetchConversations}
            onBack={window.innerWidth < 768 ? handleBack : undefined}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-lg px-4 md:px-0">
            Select a conversation to start chatting
          </div>
        )}
      </main>
    </div>
  );
}
