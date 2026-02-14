import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { validateCommentContent } from "../lib/comments";
import { getOptimizedImageUrl } from "../lib/images";
import type { Comment } from "../types";

interface CommentsProps {
  postId: number;
  session: any;
  currentUser: any;
  isAdmin: boolean;
}

interface CommentItemProps {
  comment: Comment;
  isReply?: boolean;
  depth: number;
  session: any;
  currentUser: any;
  isAdmin: boolean;
  replyTo: number | null;
  setReplyTo: (id: number | null) => void;
  replyContent: string;
  setReplyContent: (content: string) => void;
  handleSubmit: (
    e: React.SyntheticEvent<HTMLFormElement>,
    parentId: number | null,
  ) => Promise<void>;
  handleDelete: (commentId: number) => Promise<void>;
  loading: boolean;
  index: number;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  isReply = false,
  depth,
  session,
  currentUser,
  isAdmin,
  replyTo,
  setReplyTo,
  replyContent,
  setReplyContent,
  handleSubmit,
  handleDelete,
  loading,
  index,
}) => {
  const isAuthor = currentUser?.id === comment.userId;
  const canDelete = isAuthor || isAdmin;

  return (
    <div
      className={`flex flex-col gap-4 reveal stagger-${(index % 5) + 1} ${isReply ? 'ml-8 md:ml-14 relative before:content-[""] before:absolute before:-left-6 md:before:-left-8 before:top-0 before:bottom-8 before:w-px before:bg-white/10' : ""}`}
    >
      <div className="bg-white/1 border border-white/3 p-5 md:p-6 rounded-3xl flex gap-4 md:gap-5 transition-all duration-300 hover:border-white/10 hover:bg-white/2 shadow-sm group">
        <div className="relative shrink-0">
          <img
            src={
              getOptimizedImageUrl(comment.user.image, 48) ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.user.name)}&background=f63049&color=fff`
            }
            alt={comment.user.name}
            className="w-11 h-11 md:w-12 md:h-12 rounded-xl object-cover ring-2 ring-white/5"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.user.name)}&background=f63049&color=fff`;
            }}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-baseline mb-2">
            <span className="font-bold text-white text-[1rem] truncate">
              {comment.user.name}
            </span>
            <span className="text-[0.7rem] text-text-muted whitespace-nowrap ml-2 uppercase tracking-wider font-medium opacity-60">
              {new Date(comment.createdAt).toLocaleDateString("th-TH", {
                day: "numeric",
                month: "short",
              })}
            </span>
          </div>

          <p className="text-slate-300 leading-relaxed text-[0.95rem] md:text-base mb-4 wrap-break-word whitespace-pre-wrap">
            {comment.content}
          </p>

          <div className="flex items-center gap-4">
            {session && depth < 1 && (
              <button
                onClick={() =>
                  setReplyTo(replyTo === comment.id ? null : comment.id)
                }
                className="text-[0.8rem] md:text-[0.85rem] font-bold text-primary hover:text-secondary hover:underline transition-all cursor-pointer"
              >
                {replyTo === comment.id ? "ยกเลิก" : "ตอบกลับ"}
              </button>
            )}

            {canDelete && (
              <button
                onClick={() => {
                  toast(
                    (t) => (
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-white">
                          ต้องการลบความคิดเห็นนี้?
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              toast.dismiss(t.id);
                            }}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                          >
                            ยกเลิก
                          </button>
                          <button
                            onClick={() => {
                              handleDelete(comment.id);
                              toast.dismiss(t.id);
                            }}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-lg transition-all"
                          >
                            ลบเลย
                          </button>
                        </div>
                      </div>
                    ),
                    {
                      style: {
                        background: "rgba(20, 20, 20, 0.9)",
                        backdropFilter: "blur(12px)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        color: "#fff",
                        borderRadius: "16px",
                        padding: "12px 16px",
                        boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
                      },
                      position: "top-center",
                      duration: 5000,
                    },
                  );
                }}
                className="text-text-muted hover:text-red-500 transition-colors cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100"
                title="ลบความคิดเห็น"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
              </button>
            )}

            <span className="text-[0.8rem] text-text-muted/40 font-mono ml-auto">
              #{comment.id}
            </span>
          </div>

          {replyTo === comment.id && (
            <form
              onSubmit={(e) => handleSubmit(e, comment.id)}
              className="mt-5 animate-slide-down"
            >
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder={`เขียนคำตอบให้ ${comment.user.name}...`}
                className="w-full bg-transparent border border-white/10 rounded-2xl p-4 text-white text-[0.95rem] outline-none focus:border-primary transition-all resize-none"
                rows={2}
                autoFocus
              />
              <div className="flex justify-end mt-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-primary hover:bg-secondary text-white px-6 py-2 rounded-full font-bold text-sm transition-all shadow-lg hover:shadow-primary/20 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? "..." : "ส่งคำตอบ"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="flex flex-col gap-4">
          {comment.replies.map((reply, idx) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              isReply={true}
              depth={depth + 1}
              session={session}
              currentUser={currentUser}
              isAdmin={isAdmin}
              replyTo={replyTo}
              setReplyTo={setReplyTo}
              replyContent={replyContent}
              setReplyContent={setReplyContent}
              handleSubmit={handleSubmit}
              handleDelete={handleDelete}
              loading={loading}
              index={idx + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const Comments: React.FC<CommentsProps> = ({
  postId,
  session,
  currentUser,
  isAdmin,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const buildCommentTree = (flatComments: any[]) => {
    const map: { [key: number]: Comment } = {};
    const roots: Comment[] = [];

    flatComments.forEach((comment) => {
      map[comment.id] = { ...comment, replies: [] };
    });

    flatComments.forEach((comment) => {
      if (comment.parentId && map[comment.parentId]) {
        map[comment.parentId].replies?.push(map[comment.id]);
      } else {
        roots.push(map[comment.id]);
      }
    });

    return roots;
  };

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/comments?postId=${postId}`);
      if (res.ok) {
        const data = await res.json();
        setComments(buildCommentTree(data));
        setFetchError(null);
      } else {
        const errorData = await res.json().catch(() => ({}));
        setFetchError(errorData.error || "ไม่สามารถโหลดความคิดเห็นได้");
      }
    } catch (err) {
      setFetchError("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handleDelete = async (commentId: number) => {
    try {
      const res = await fetch(`/api/comments?id=${commentId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("ลบความคิดเห็นสำเร็จ");
        await fetchComments();
      } else {
        const data = await res.json();
        toast.error(data.error || "ลบไม่สำเร็จ");
      }
    } catch (err) {
      toast.error("เกิดข้อผิดพลาดในการลบ");
    }
  };

  const handleSubmit = async (
    e: React.SyntheticEvent<HTMLFormElement>,
    parentId: number | null = null,
  ) => {
    e.preventDefault();
    const content = parentId ? replyContent : newComment;

    const validation = validateCommentContent(content);
    if (!validation.isValid) {
      toast.error(validation.message || "ข้อความไม่ถูกต้อง");
      return;
    }
    if (loading) return;

    setLoading(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        body: JSON.stringify({ postId, content, parentId }),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        toast.success(parentId ? "ตอบกลับสำเร็จ!" : "ส่งความคิดเห็นเรียบร้อย!");
        if (parentId) {
          setReplyContent("");
          setReplyTo(null);
        } else {
          setNewComment("");
        }
        await fetchComments();
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || "เกิดข้อผิดพลาดในการส่งคอมเมนต์");
      }
    } catch (err) {
      toast.error("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mt-24 w-full max-w-[850px] mx-auto reveal">
      <h3 className="text-2xl md:text-[2.2rem] font-bold text-center mb-12 h-gradient tracking-tight">
        Comments
      </h3>

      {session ? (
        <form
          onSubmit={(e) => handleSubmit(e)}
          className="bg-transparent border-none shadow-none p-0 mb-16 flex flex-col gap-6 relative group/form"
        >
          <div className="absolute inset-0 bg-linear-to-br from-primary/2 to-transparent pointer-events-none"></div>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="มีไรอยากบอกพิมเลยจ้า"
            className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-white text-l outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all min-h-[140px] resize-none relative z-10"
          />
          <button
            type="submit"
            disabled={loading}
            className="self-end bg-linear-to-r from-primary to-secondary text-white px-10 py-4 rounded-full font-bold text-base transition-all hover:-translate-y-1 hover:shadow-[0_10px_25px_-5px_#f63049] active:scale-95 disabled:opacity-50 cursor-pointer relative z-10"
          >
            {loading ? "กำลังส่ง..." : "Comment"}
          </button>
        </form>
      ) : (
        <div className="py-12 px-8 text-center rounded-[2.5rem] border border-dashed border-white/10 bg-white/1 mb-12 flex flex-col items-center gap-2">
          <p className="text-text-muted text-lg">
            ล็อกอินด้วย Google เพื่อร่วมเป็นส่วนหนึ่งของชุมชนนะจ๊ะ
          </p>
          <span className="text-sm opacity-40">เชื่อมต่อหัวใจผ่านตัวอักษร</span>
        </div>
      )}

      <div className="flex flex-col gap-8">
        {fetchError && (
          <div className="glass-premium p-10 text-center rounded-3xl border border-primary/20">
            <p className="text-primary font-bold mb-4">{fetchError}</p>
            <button
              onClick={() => fetchComments()}
              className="text-white bg-primary px-6 py-2 rounded-full font-bold"
            >
              ลองใหม่
            </button>
          </div>
        )}

        {!fetchError &&
          comments.map((comment, idx) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              depth={0}
              session={session}
              currentUser={currentUser}
              isAdmin={isAdmin}
              replyTo={replyTo}
              setReplyTo={setReplyTo}
              replyContent={replyContent}
              setReplyContent={setReplyContent}
              handleSubmit={handleSubmit}
              handleDelete={handleDelete}
              loading={loading}
              index={idx}
            />
          ))}

        {!fetchError && comments.length === 0 && (
          <div className="text-center py-20 opacity-40 flex flex-col items-center gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-message-square-dashed"
            >
              <path d="M5 3a2 2 0 0 0-2 2" />
              <path d="M19 3a2 2 0 0 1 2 2" />
              <path d="M5 21a2 2 0 0 1-2-2" />
              <path d="M19 21a2 2 0 0 0 2-2" />
              <path d="M9 3h1" />
              <path d="M14 3h1" />
              <path d="M9 21h1" />
              <path d="M14 21h1" />
              <path d="M3 9v1" />
              <path d="M3 14v1" />
              <path d="M21 9v1" />
              <path d="M21 14v1" />
            </svg>
            <p className="text-lg italic">เม้นแรกเป็นของคุณแล้ว</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Comments;
