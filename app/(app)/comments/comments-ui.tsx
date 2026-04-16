"use client";

import { useEffect, useState } from "react";
import { SectionHeader, Card, CardHeader, CardTitle } from "@/components/ui";
import { MessageCircle, Sparkles, Copy, Check, ExternalLink } from "lucide-react";
import {
  getRecentComments,
  generateReplies,
  type PostComments,
  type CommentWithReply,
} from "@/lib/actions/comments-ai";

export function CommentsUI() {
  const [posts, setPosts] = useState<PostComments[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getRecentComments().then((res) => {
      if (res.ok) {
        setPosts(res.posts ?? []);
      } else {
        setError(res.error ?? "Erreur inconnue.");
      }
      setLoading(false);
    });
  }, []);

  const totalComments = posts.reduce((s, p) => s + p.comments.length, 0);

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Commentaires IA"
        description={
          loading
            ? "Chargement des commentaires..."
            : `${totalComments} commentaire${totalComments !== 1 ? "s" : ""} sur ${posts.length} post${posts.length !== 1 ? "s" : ""}`
        }
      />

      {loading && (
        <Card>
          <div className="p-8 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            <p className="mt-3 text-sm text-text-secondary">
              Récupération des commentaires Instagram...
            </p>
          </div>
        </Card>
      )}

      {error && (
        <div className="rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
          {error}
        </div>
      )}

      {!loading && !error && posts.length === 0 && (
        <Card>
          <div className="p-8 text-center text-sm text-text-secondary">
            <MessageCircle className="mx-auto h-10 w-10 text-text-muted mb-3" />
            Aucun commentaire récent sur tes posts. Publie et reviens ici quand les commentaires arrivent.
          </div>
        </Card>
      )}

      {posts.map((post) => (
        <PostCard key={post.igMediaId} post={post} setPosts={setPosts} />
      ))}
    </div>
  );
}

function PostCard({
  post,
  setPosts,
}: {
  post: PostComments;
  setPosts: React.Dispatch<React.SetStateAction<PostComments[]>>;
}) {
  const [generating, setGenerating] = useState(false);
  const hasReplies = post.comments.some((c) => c.suggestedReply);

  async function handleGenerateReplies() {
    setGenerating(true);
    const res = await generateReplies(
      post.comments.map((c) => ({ id: c.id, text: c.text, username: c.username })),
      post.caption,
    );
    setGenerating(false);

    if (res.ok && res.replies) {
      setPosts((prev) =>
        prev.map((p) =>
          p.igMediaId === post.igMediaId
            ? {
                ...p,
                comments: p.comments.map((c) => ({
                  ...c,
                  suggestedReply: res.replies![c.id] ?? c.suggestedReply,
                })),
              }
            : p,
        ),
      );
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-accent flex-shrink-0" />
              {post.comments.length} commentaire{post.comments.length !== 1 ? "s" : ""}
            </CardTitle>
            {post.caption && (
              <p className="mt-1 text-xs text-text-muted truncate max-w-md">
                {post.caption.slice(0, 100)}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {post.permalink && (
              <a
                href={post.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-surface-2 p-2 text-text-muted hover:text-foreground transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
            <button
              onClick={handleGenerateReplies}
              disabled={generating}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-3 py-2 text-xs font-medium text-white hover:bg-accent-hover disabled:opacity-50"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {generating ? "Génération..." : hasReplies ? "Régénérer" : "Suggérer des réponses"}
            </button>
          </div>
        </div>
      </CardHeader>

      <div className="space-y-2">
        {post.comments.map((comment) => (
          <CommentRow key={comment.id} comment={comment} />
        ))}
      </div>
    </Card>
  );
}

function CommentRow({ comment }: { comment: CommentWithReply }) {
  const [copied, setCopied] = useState(false);

  function copyReply() {
    if (!comment.suggestedReply) return;
    navigator.clipboard.writeText(comment.suggestedReply);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const date = new Date(comment.timestamp).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="rounded-lg bg-surface-2 p-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-semibold text-accent">@{comment.username}</span>
        <span className="text-[10px] text-text-muted">{date}</span>
        {comment.likeCount > 0 && (
          <span className="text-[10px] text-text-muted">❤️ {comment.likeCount}</span>
        )}
      </div>
      <p className="text-sm text-foreground">{comment.text}</p>

      {comment.suggestedReply && (
        <div className="mt-2 flex items-start gap-2 rounded-lg border border-accent/20 bg-accent/5 p-2">
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-medium text-accent uppercase tracking-wider mb-0.5">
              Réponse suggérée
            </div>
            <p className="text-sm text-foreground">{comment.suggestedReply}</p>
          </div>
          <button
            onClick={copyReply}
            className="flex-shrink-0 rounded p-1 text-text-muted hover:text-accent transition-colors"
            title="Copier"
          >
            {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
      )}
    </div>
  );
}
