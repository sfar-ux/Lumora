"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import "./review.css";

interface Review {
  id: string;
  name: string;
  program: string;
  rating: number;
  text: string;
  date: string;
  initials: string;
  color: string;
}

const SEED_REVIEWS: Review[] = [
  {
    id: "s1",
    name: "Rohan Verma",
    program: "B2B SaaS",
    rating: 5,
    text: "Lumora took our fragmented internal tools and rebuilt them as a single, scalable SaaS platform in under 3 months. Our ops team saved 20+ hours a week. The quality of architecture decisions alone was worth every rupee.",
    date: "July 2026",
    initials: "RV",
    color: "#00aaff",
  },
  {
    id: "s2",
    name: "Ananya Kapoor",
    program: "Fintech",
    rating: 5,
    text: "We came to Lumora with a complex payments flow and a tight deadline. They didn't just deliver on time — they challenged our assumptions and redesigned the UX in a way that reduced support tickets by 40%. True partners.",
    date: "June 2026",
    initials: "AK",
    color: "#cc00ff",
  },
  {
    id: "s3",
    name: "Vikram Sethi",
    program: "Enterprise",
    rating: 5,
    text: "We'd failed with two other vendors before Lumora. The difference is that they actually understand SaaS from a business standpoint, not just a technical one. Our enterprise CRM now processes 10k+ records daily without issues.",
    date: "May 2026",
    initials: "VS",
    color: "#ff6600",
  },
  {
    id: "s4",
    name: "Meera Joshi",
    program: "HealthTech",
    rating: 4,
    text: "The team built our patient management portal from scratch. Their attention to data security and compliance was impressive. Communication was transparent throughout — no surprises, no hidden costs.",
    date: "July 2026",
    initials: "MJ",
    color: "#ff3366",
  },
  {
    id: "s5",
    name: "Siddharth Rao",
    program: "E-commerce",
    rating: 5,
    text: "Lumora redesigned our entire checkout and subscription billing system. Conversion rate went up 31% within the first month post-launch. They care about the outcome, not just the deliverable.",
    date: "August 2026",
    initials: "SR",
    color: "#00ccaa",
  },
  {
    id: "s6",
    name: "Divya Malhotra",
    program: "EdTech",
    rating: 4,
    text: "Working with Lumora felt like having an in-house product team without the overhead. They asked the right questions before writing a single line of code. The architecture they designed is something we can scale confidently.",
    date: "June 2026",
    initials: "DM",
    color: "#ffcc00",
  },
];

const AVATAR_COLORS = [
  "#00aaff", "#cc00ff", "#ff6600", "#ff3366", "#00ccaa",
  "#ffcc00", "#8844ff", "#00ff88", "#ff4488",
];

function Stars({ count, interactive = false, onSet }: { count: number; interactive?: boolean; onSet?: (n: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="rv-stars" aria-label={`${count} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={`rv-star ${n <= (interactive ? hover || count : count) ? "filled" : ""}`}
          onMouseEnter={() => interactive && setHover(n)}
          onMouseLeave={() => interactive && setHover(0)}
          onClick={() => interactive && onSet?.(n)}
          style={{ cursor: interactive ? "pointer" : "default" }}
        >★</span>
      ))}
    </div>
  );
}

function ReviewCard({ r }: { r: Review }) {
  return (
    <article className="rv-card">
      <div className="rv-card-top">
        <div className="rv-avatar" style={{ background: r.color }}>{r.initials}</div>
        <div>
          <p className="rv-name">{r.name}</p>
          <p className="rv-program">{r.program} · {r.date}</p>
        </div>
        <Stars count={r.rating} />
      </div>
      <p className="rv-text">&ldquo;{r.text}&rdquo;</p>
    </article>
  );
}

export default function ReviewPage() {
  const [reviews, setReviews] = useState<Review[]>(SEED_REVIEWS);
  const [form, setForm] = useState({ name: "", program: "AI / Data", rating: 5, text: "" });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("lumora_reviews");
      if (saved) {
        const parsed: Review[] = JSON.parse(saved);
        setReviews([...SEED_REVIEWS, ...parsed]);
      }
    } catch { /* ignore */ }
  }, []);

  const avg = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.text.trim()) {
      setError("Please fill in your name and review.");
      return;
    }
    if (form.text.trim().length < 20) {
      setError("Review must be at least 20 characters.");
      return;
    }
    setError("");
    const newReview: Review = {
      id: Date.now().toString(),
      name: form.name.trim(),
      program: form.program,
      rating: form.rating,
      text: form.text.trim(),
      date: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      initials: form.name.trim().split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase(),
      color: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
    };

    try {
      const existing = JSON.parse(localStorage.getItem("lumora_reviews") || "[]");
      localStorage.setItem("lumora_reviews", JSON.stringify([...existing, newReview]));
    } catch { /* ignore */ }

    setReviews((prev) => [...prev, newReview]);
    setForm({ name: "", program: "AI / Data", rating: 5, text: "" });
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <main className="rv-root">
      {/* Nav */}
      <nav className="rv-nav">
        <Link href="/" className="rv-brand">LUMOR<span>A°</span></Link>
        <span className="rv-nav-label">CLIENT TESTIMONIALS</span>
        <Link href="/#contact" className="rv-nav-cta">JOIN NOW ↗</Link>
      </nav>

      {/* Hero */}
      <header className="rv-hero">
        <div className="rv-hero-glow" />
        <p className="rv-eyebrow">VOICES FROM OUR CLIENTS</p>
        <h1 className="rv-hero-h1">WHAT OUR<br /><em>CLIENTS</em><br />SAY.</h1>
        <div className="rv-stats">
          <div className="rv-stat">
            <span className="rv-stat-num">{avg}</span>
            <span className="rv-stat-label">Average Rating</span>
            <Stars count={Math.round(parseFloat(avg))} />
          </div>
          <div className="rv-stat-sep" />
          <div className="rv-stat">
            <span className="rv-stat-num">{reviews.length}</span>
            <span className="rv-stat-label">Total Reviews</span>
          </div>
          <div className="rv-stat-sep" />
          <div className="rv-stat">
            <span className="rv-stat-num">100%</span>
            <span className="rv-stat-label">Would Recommend</span>
          </div>
        </div>
      </header>

      {/* Review Grid */}
      <section className="rv-grid-section">
        <div className="rv-grid">
          {reviews.map((r) => <ReviewCard key={r.id} r={r} />)}
        </div>
      </section>

      {/* Add Review Form */}
      <section className="rv-form-section" id="add-review">
        <div className="rv-form-inner">
          <p className="eyebrow">SHARE YOUR EXPERIENCE</p>
          <h2 className="rv-form-h2">ADD YOUR<br /><em>REVIEW</em></h2>

          {submitted && (
            <div className="rv-success">
              ✦ Thank you for your feedback!
            </div>
          )}

          <form className="rv-form" onSubmit={handleSubmit} noValidate>
            <div className="rv-form-row">
              <div className="rv-field">
                <label htmlFor="rv-name">Your Name / Company</label>
                <input
                  id="rv-name"
                  type="text"
                  placeholder="e.g. Aryan Mehta"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  maxLength={60}
                />
              </div>
              <div className="rv-field">
                <label htmlFor="rv-program">Industry</label>
                <select
                  id="rv-program"
                  value={form.program}
                  onChange={(e) => setForm({ ...form, program: e.target.value })}
                >
                  <option>B2B SaaS</option>
                  <option>Fintech</option>
                  <option>Enterprise</option>
                  <option>HealthTech</option>
                  <option>E-commerce</option>
                  <option>EdTech</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <div className="rv-field">
              <label>Your Rating</label>
              <Stars count={form.rating} interactive onSet={(n) => setForm({ ...form, rating: n })} />
            </div>

            <div className="rv-field">
              <label htmlFor="rv-text">Your Review</label>
              <textarea
                id="rv-text"
                placeholder="Tell us about your experience at Lumora..."
                rows={5}
                value={form.text}
                onChange={(e) => setForm({ ...form, text: e.target.value })}
                maxLength={600}
              />
              <span className="rv-char">{form.text.length} / 600</span>
            </div>

            {error && <p className="rv-error">{error}</p>}

            <button type="submit" className="rv-submit">
              SUBMIT REVIEW <span>↗</span>
            </button>
          </form>
        </div>
      </section>

      <footer className="rv-footer">
        <Link href="/">← Back to Lumora°</Link>
        <span>© 2026 LUMORA — FUTURE UNIVERSITY</span>
      </footer>
    </main>
  );
}
