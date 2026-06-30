import { useState } from "react";
import { useReviews } from "../context/ReviewsContext";
import { useToast } from "../context/ToastContext";

const formatDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};

const ProductReviews = ({ productId, fallbackRating = 4.3 }) => {
  const { getReviews, addReview } = useReviews();
  const { showToast } = useToast();
  const reviews = getReviews(productId);

  const [draftRating, setDraftRating] = useState(5);
  const [draftAuthor, setDraftAuthor] = useState("");
  const [draftText, setDraftText] = useState("");

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : fallbackRating;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!draftText.trim()) {
      showToast("Add a few words before posting your review", "error");
      return;
    }
    addReview(productId, {
      rating: draftRating,
      author: draftAuthor.trim() || "Anonymous",
      text: draftText.trim(),
    });
    setDraftText("");
    setDraftAuthor("");
    setDraftRating(5);
    showToast("Thanks — your review is posted");
  };

  return (
    <div className="tn-reviews">
      <h5 style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)" }}>
        Customer reviews
      </h5>

      <div className="tn-review-summary">
        <span className="tn-review-score">{avgRating.toFixed(1)}</span>
        <div>
          <div className="tn-review-stars">{"★".repeat(Math.round(avgRating))}{"☆".repeat(5 - Math.round(avgRating))}</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
            {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
          </div>
        </div>
      </div>

      <form className="tn-review-form" onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
        <div className="tn-star-picker">
          {[1, 2, 3, 4, 5].map((n) => (
            <span
              key={n}
              className={n <= draftRating ? "is-filled" : ""}
              onClick={() => setDraftRating(n)}
              role="button"
              aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}
            >
              ★
            </span>
          ))}
        </div>
        <input
          type="text"
          placeholder="Your name (optional)"
          value={draftAuthor}
          onChange={(e) => setDraftAuthor(e.target.value)}
          style={{ width: "100%", border: "1px solid var(--line)", borderRadius: 10, padding: "10px 12px", marginBottom: 8, fontFamily: "var(--font-body)" }}
        />
        <textarea
          placeholder="Share your experience with this phone…"
          value={draftText}
          onChange={(e) => setDraftText(e.target.value)}
        />
        <button type="submit" className="btn-add-cart" style={{ marginTop: 10 }}>
          Post review
        </button>
      </form>

      {reviews.length === 0 ? (
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
          No reviews yet — be the first to share your experience.
        </p>
      ) : (
        reviews.map((r) => (
          <div key={r.id} className="tn-review-card">
            <div className="meta">
              <span className="author">{r.author}</span>
              <span className="date">{formatDate(r.date)}</span>
            </div>
            <span className="stars">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
            <p>{r.text}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default ProductReviews;