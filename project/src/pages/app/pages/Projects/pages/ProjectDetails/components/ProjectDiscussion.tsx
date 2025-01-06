import { useState } from 'react';
import { Card } from '../../../../../../../components/ui/Card';
import { Button } from '../../../../../../../components/ui/Button';
import { Avatar } from '../../../../../../../components/ui/Avatar';

interface Comment {
  id: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  createdAt: string;
  replies?: Comment[];
}

interface CommentProps {
  comment: Comment;
  isReply?: boolean;
}

function Comment({ comment, isReply = false }: CommentProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  const handleSubmitReply = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement reply submission
    setIsReplying(false);
    setReplyContent('');
  };

  return (
    <div className={`p-6 ${isReply ? 'bg-gray-50' : 'bg-white border border-gray-100'} rounded-xl`}>
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <Avatar
            src={comment.author.avatar}
            alt={comment.author.name}
            fallback={comment.author.name.charAt(0).toUpperCase()}
            size="md"
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium">{comment.author.name}</span>
            <span className="text-sm text-gray-500">•</span>
            <span className="text-sm text-gray-500">
              {new Date(comment.createdAt).toLocaleDateString()}
            </span>
          </div>
          <p className="text-gray-700">{comment.content}</p>
          
          {!isReply && (
            <button
              onClick={() => setIsReplying(!isReplying)}
              className="mt-2 text-sm text-primary-600 hover:text-primary-700"
            >
              Reply
            </button>
          )}

          {isReplying && (
            <form onSubmit={handleSubmitReply} className="mt-4">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={3}
                placeholder="Write your reply..."
                required
              />
              <div className="flex justify-end gap-2 mt-2">
                <Button
                  variant="secondary"
                  onClick={() => setIsReplying(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Reply
                </Button>
              </div>
            </form>
          )}

          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 space-y-4">
              {comment.replies.map((reply) => (
                <Comment key={reply.id} comment={reply} isReply />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ProjectDiscussion() {
  const [newComment, setNewComment] = useState('');
  const [comments] = useState<Comment[]>([]);

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement comment submission
      setNewComment('');
  };

  return (
    <Card>
      <div className="p-6">
      <h2 className="text-xl font-medium mb-6">Discussion</h2>
      
        <form onSubmit={handleSubmitComment} className="mb-8">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            rows={4}
            placeholder="Start a discussion..."
          required
        />
          <div className="flex justify-end mt-2">
            <Button type="submit">
              Post Comment
          </Button>
        </div>
      </form>

      <div className="space-y-6">
          {comments.map((comment) => (
            <Comment key={comment.id} comment={comment} />
          ))}
              </div>
      </div>
    </Card>
  );
}