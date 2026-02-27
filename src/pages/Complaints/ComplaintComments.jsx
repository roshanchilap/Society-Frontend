import { useEffect, useRef, useState } from "react";
import axiosClient from "../../api/axiosClient";
import toast from "react-hot-toast";
import { useAuthStore } from "../../auth/useAuthStore";
import { io } from "socket.io-client";

export default function ComplaintComments({ complaintId }) {
  const user = useAuthStore((s) => s.user);

  const socketRef = useRef(null);
  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const [comments, setComments] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState([]);

  const me = user?._id?.toString();

  /* =========================
     Load history
  ========================= */
  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(
        `/complaints/${complaintId}/comments`
      );
      setComments(res.data.comments || []);
    } catch {
      toast.error("Failed to load discussion");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (complaintId) fetchComments();
  }, [complaintId]);



  /* =========================
     Socket Connection
  ========================= */
  useEffect(() => {
    if (!complaintId) return;

    const token = localStorage.getItem("token");

    const socket = io(import.meta.env.VITE_API_URL2, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
    });
    socketRef.current = socket;

    socket.emit("joinComplaint", complaintId);

    /* ---------- new message ---------- */
    socket.on("newMessage", (msg) => {
      setComments((prev) => {
        if (prev.some((c) => c._id === msg._id)) return prev;
        return [...prev, msg];
      });
    });

    /* ---------- typing start ---------- */
    socket.on("userTyping", ({ userId, name }) => {
      if (!userId || userId === me) return;

      setTypingUsers((prev) => {
        if (prev.some((u) => u.id === userId)) return prev;
        return [
          ...prev,
          {
            id: userId,
            name: name || "User",
          },
        ];
      });
    });

    /* ---------- typing stop ---------- */
    socket.on("userStoppedTyping", ({ userId }) => {
      setTypingUsers((prev) =>
        prev.filter((u) => u.id !== userId)
      );
    });

    socket.on("connect_error", (err) => {
      console.error("Socket error:", err.message);
      toast.error("Realtime connection failed");
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setTypingUsers([]);
      clearTimeout(typingTimeoutRef.current);
    };
  }, [complaintId]);



  /* =========================
     Auto Scroll
  ========================= */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);



  /* =========================
     Send Message
  ========================= */
  const handleAddComment = () => {
    if (!message.trim()) return;

    socketRef.current?.emit("sendMessage", {
      complaintId,
      message,
    });

    socketRef.current?.emit("stopTyping", { complaintId });

    setMessage("");
  };



  /* =========================
     Typing Logic
  ========================= */
  const handleTyping = (value) => {
    console.log("USER:", user);
    setMessage(value);

    if (!socketRef.current) return;

    socketRef.current.emit("typing", {
      complaintId,
      name: user?.name || "User",
    });
    clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit("stopTyping", { complaintId });
    }, 1200);
  };



  /* =========================
     Typing Text Formatter
  ========================= */
  const typingText = () => {
    if (typingUsers.length === 0) return null;

    if (typingUsers.length === 1) {
      return `${typingUsers[0].name} is typing…`;
    }

    if (typingUsers.length === 2) {
      return `${typingUsers[0].name} and ${typingUsers[1].name} are typing…`;
    }

    return `${typingUsers[0].name} and ${
      typingUsers.length - 1
    } others are typing…`;
  };



  /* =========================
     UI
  ========================= */
  if (loading) {
    return (
      <div className="p-4 text-xs text-gray-400">
        Loading discussion…
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[420px] bg-gray-50 rounded-lg p-4">

      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2 h-2 rounded-full bg-gray-400" />
        <h4 className="text-sm font-semibold text-gray-800">
          Discussion
        </h4>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">

        {comments.length === 0 ? (
          <p className="text-xs text-gray-400">
            No discussion yet
          </p>
        ) : (
          comments.map((c) => {
            const isMine = me && c.createdBy?._id === me;
            const isAdmin = c.createdBy?.role === "admin";

            return (
              <div
                key={c._id}
                className={`flex ${
                  isMine ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-xl text-sm break-words
                    ${
                      isMine
                        ? "bg-gray-200 text-gray-800 rounded-br-sm"
                        : isAdmin
                        ? "bg-emerald-50 text-emerald-800 rounded-bl-sm"
                        : "bg-white text-gray-800 rounded-bl-sm shadow-sm"
                    }`}
                >
                  {!isMine && (
                    <div
                      className={`text-[11px] font-medium mb-0.5
                        ${
                          isAdmin
                            ? "text-emerald-700"
                            : "text-gray-600"
                        }`}
                    >
                      {c.createdBy?.name || "User"}
                    </div>
                  )}

                  <p className="whitespace-pre-wrap">
                    {c.message}
                  </p>

                  <div
                    className={`mt-1 text-[10px]
                      ${
                        isMine
                          ? "text-gray-500 text-right"
                          : "text-gray-400"
                      }`}
                  >
                    {new Date(c.createdAt).toLocaleTimeString(
                      [],
                      { hour: "2-digit", minute: "2-digit" }
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}

        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div className="pt-3">

        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <div className="mb-3 flex items-center gap-2">

            {/* avatar bubble */}
            <div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center text-xs font-semibold text-white">
              {typingUsers[0].name?.charAt(0)?.toUpperCase()}
            </div>

            {/* typing box */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white border shadow-sm">

              {/* animated dots */}
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" />
              </div>

              {/* text */}
              <span className="text-xs text-gray-500">
                {typingText()}
              </span>
            </div>
          </div>
        )}
        <textarea
          rows={2}
          value={message}
          onChange={(e) => handleTyping(e.target.value)}
          placeholder="Write a reply…"
          className="w-full resize-none px-3 py-2 rounded-lg
                     border border-gray-300 text-sm
                     focus:outline-none focus:ring-2 focus:ring-gray-300"
        />

        <div className="mt-2 flex justify-end">
          <button
            onClick={handleAddComment}
            disabled={!message.trim()}
            className="px-4 py-2 rounded-lg
                       bg-gray-800 text-white text-sm
                       hover:bg-gray-900
                       disabled:opacity-40"
          >
            Send
          </button>
        </div>

      </div>
    </div>
  );
}