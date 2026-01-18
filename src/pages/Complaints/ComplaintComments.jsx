import { useEffect, useRef, useState } from "react";
import axiosClient from "../../api/axiosClient";
import toast from "react-hot-toast";
import { useAuthStore } from "../../auth/useAuthStore";

export default function ComplaintComments({ complaintId }) {
  const role = useAuthStore((s) => s.role);

  const [comments, setComments] = useState([]);
  const [me, setMe] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const bottomRef = useRef(null);

  /* ----------------------------------
     Fetch comments
  ---------------------------------- */
  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(`/complaints/${complaintId}/comments`);

      setComments(res.data.comments || []);
      setMe(res.data.me || null);
    } catch {
      toast.error("Failed to load comments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [complaintId]);

  /* ----------------------------------
     Auto scroll to bottom
  ---------------------------------- */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  /* ----------------------------------
     Add comment (optimistic)
  ---------------------------------- */
  const handleAddComment = async () => {
    if (!message.trim()) return;

    const optimistic = {
      _id: `tmp-${Date.now()}`,
      message,
      createdAt: new Date().toISOString(),
      createdBy: {
        _id: me,
        name: "You",
        role,
      },
    };

    setComments((prev) => [...prev, optimistic]);
    setMessage("");

    try {
      await axiosClient.post(`/complaints/${complaintId}/comments`, {
        message,
      });
    } catch {
      setComments((prev) => prev.filter((c) => c._id !== optimistic._id));
      toast.error("Failed to add comment");
    }
  };

  if (loading) {
    return <div className="p-4 text-xs text-gray-400">Loading discussion…</div>;
  }

  return (
    <div className="flex flex-col max-h-[420px] bg-gray-50 rounded-lg p-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2 h-2 rounded-full bg-gray-400" />
        <h4 className="text-sm font-semibold text-gray-800">Discussion</h4>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {comments.length === 0 ? (
          <p className="text-xs text-gray-400">No discussion yet</p>
        ) : (
          comments.map((c) => {
            const isMine = me && c.createdBy?._id === me;
            const isAdmin = c.createdBy?.role === "admin";

            return (
              <div
                key={c._id}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
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
                        ${isAdmin ? "text-emerald-700" : "text-gray-600"}`}
                    >
                      {c.createdBy?.name || "User"}
                    </div>
                  )}

                  <p className="whitespace-pre-wrap">{c.message}</p>

                  <div
                    className={`mt-1 text-[10px]
                      ${isMine ? "text-gray-500 text-right" : "text-gray-400"}`}
                  >
                    {new Date(c.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}

        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div className="mt-3 pt-3">
        <textarea
          rows={2}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
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
