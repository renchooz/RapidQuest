import React from "react";

export default function ConversationsList({ conversations = [], onSelectChat }) {
  return (
    <div className="overflow-y-auto h-full scrollbar-hide bg-white">
      {conversations.length === 0 && (
        <div className="p-4 text-center text-gray-500">No conversations</div>
      )}

      {conversations.map((conv, idx) => {
        const name = conv?.name || conv?.wa_id || "Unknown";
        const avatarLetter = name.charAt(0).toUpperCase();

        const lastMsg = conv?.lastMessage || {};
        const time = lastMsg?.timestamp
          ? new Date(Number(lastMsg.timestamp) * 1000).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "";

        

        return (
          <div
            key={conv?.wa_id || idx}
            onClick={() => onSelectChat(conv)}
            className="flex items-center gap-4 p-3 cursor-pointer hover:bg-gray-100 transition rounded-r-lg"
          >
            {/* Avatar */}
            <div className="relative w-14 h-14 flex-shrink-0 rounded-full bg-green-500 text-white flex items-center justify-center text-xl font-semibold shadow-md overflow-hidden">
             
              {avatarLetter}
            
            </div>

            {/* Chat info */}
            <div className="flex-1 border-b border-gray-200 pb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-gray-900 truncate max-w-[70%]">
                  {name}
                </span>
                <span className="text-xs text-gray-500 whitespace-nowrap">{time}</span>
              </div>
              <p className="text-sm text-gray-600 truncate max-w-[95%]">
                {lastMsg?.text || ""}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
