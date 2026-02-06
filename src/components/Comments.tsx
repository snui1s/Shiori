import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { validateCommentContent } from '../lib/comments';
import { getOptimizedImageUrl } from '../lib/images';
import type { Comment } from '../types';

import '../styles/components/Comments.css';

interface CommentsProps {
  postId: number;
  session: any;
}

interface CommentItemProps {
  comment: Comment;
  isReply?: boolean;
  depth: number;
  session: any;
  replyTo: number | null;
  setReplyTo: (id: number | null) => void;
  replyContent: string;
  setReplyContent: (content: string) => void;
  handleSubmit: (e: React.SyntheticEvent<HTMLFormElement>, parentId: number | null) => Promise<void>;
  loading: boolean;
}

const CommentItem: React.FC<CommentItemProps> = ({ 
  comment, 
  isReply = false, 
  depth,
  session, 
  replyTo, 
  setReplyTo, 
  replyContent, 
  setReplyContent, 
  handleSubmit, 
  loading 
}) => (
  <div className={`comment-container ${isReply ? 'comment-reply' : ''}`}>
    <div className="comment-item glass">
      <img 
        src={getOptimizedImageUrl(comment.user.image, 48) || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.user.name)}&background=f63049&color=fff`} 
        alt={comment.user.name} 
        className="comment-avatar" 
        loading="lazy"
        onError={(e) => {
          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.user.name)}&background=f63049&color=fff`;
        }}
      />
      <div className="comment-body">
        <div className="comment-header">
          <span className="comment-author">{comment.user.name}</span>
          <span className="comment-date">
            {new Date(comment.createdAt).toLocaleString('th-TH', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })} น.
          </span>
        </div>
        <p className="comment-content">{comment.content}</p>
        
        {session && depth < 1 && (
          <button 
            onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
            className="btn-reply-toggle"
          >
            {replyTo === comment.id ? 'ยกเลิก' : 'ตอบกลับ'}
          </button>
        )}

        {replyTo === comment.id && (
          <form onSubmit={(e) => handleSubmit(e, comment.id)} className="reply-form">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder={`ตอบกลับ ${comment.user.name}...`}
              className="comment-textarea glass"
              rows={2}
              autoFocus
            />
            <div className="reply-actions">
              <button type="submit" disabled={loading} className="btn-comment btn-small">
                {loading ? '...' : 'ส่ง'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
    
    {comment.replies && comment.replies.length > 0 && (
      <div className="replies-list">
        {comment.replies.map(reply => (
          <CommentItem 
            key={reply.id} 
            comment={reply} 
            isReply={true} 
            depth={depth + 1}
            session={session}
            replyTo={replyTo}
            setReplyTo={setReplyTo}
            replyContent={replyContent}
            setReplyContent={setReplyContent}
            handleSubmit={handleSubmit}
            loading={loading}
          />
        ))}
      </div>
    )}
  </div>
);

const Comments: React.FC<CommentsProps> = ({ postId, session }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(false);

  const buildCommentTree = (flatComments: any[]) => {
    const map: { [key: number]: Comment } = {};
    const roots: Comment[] = [];

    flatComments.forEach(comment => {
      map[comment.id] = { ...comment, replies: [] };
    });

    flatComments.forEach(comment => {
      if (comment.parentId && map[comment.parentId]) {
        map[comment.parentId].replies?.push(map[comment.id]);
      } else {
        roots.push(map[comment.id]);
      }
    });

    return roots;
  };

  const fetchComments = async () => {
    const res = await fetch(`/api/comments?postId=${postId}`);
    if (res.ok) {
      const data = await res.json();
      setComments(buildCommentTree(data));
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>, parentId: number | null = null) => {
    e.preventDefault();
    const content = parentId ? replyContent : newComment;
    
    // Validation
    const validation = validateCommentContent(content);
    if (!validation.isValid) {
      toast.error(validation.message || 'ข้อความไม่ถูกต้อง');
      return;
    }
    if (loading) return;

    setLoading(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        body: JSON.stringify({ postId, content, parentId }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        toast.success(parentId ? 'ตอบกลับสำเร็จ!' : 'ส่งความคิดเห็นเรียบร้อย!');
        if (parentId) {
          setReplyContent('');
          setReplyTo(null);
        } else {
          setNewComment('');
        }
        await fetchComments();
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || 'เกิดข้อผิดพลาดในการส่งคอมเมนต์');
      }
    } catch (err) {
      toast.error('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="comments-section">
      <h3 className="comments-title">ความคิดเห็น</h3>

      {session ? (
        <form onSubmit={(e) => handleSubmit(e)} className="comment-form main-form">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="เล่าความรู้สึกของคุณผ่านคอมเมนต์นี้..."
            className="comment-textarea glass"
            rows={3}
          />
          <button type="submit" disabled={loading} className="btn-comment">
            {loading ? 'กำลังส่ง...' : 'ส่งความคิดเห็น'}
          </button>
        </form>
      ) : (
        <div className="login-prompt glass">
          <p>ล็อกอินด้วย Google เพื่อร่วมแสดงความคิดเห็นนะจ๊ะ 🏮</p>
        </div>
      )}

      <div className="comments-list">
        {comments.map((comment) => (
          <CommentItem 
            key={comment.id} 
            comment={comment} 
            depth={0}
            session={session}
            replyTo={replyTo}
            setReplyTo={setReplyTo}
            replyContent={replyContent}
            setReplyContent={setReplyContent}
            handleSubmit={handleSubmit}
            loading={loading}
          />
        ))}
        {comments.length === 0 && (
          <p className="no-comments">ยังไม่มีความคิดเห็น... เป็นคนแรกที่เริ่มบทสนทนากันเถอะ!</p>
        )}
      </div>
    </div>
  );
};

export default Comments;