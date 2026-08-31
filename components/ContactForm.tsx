"use client";

import React, { useState } from "react";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("https://formsubmit.co/ajax/lumoro.co.live@gmail.com", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setStatus("success");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch (error) {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="contact-form-success">
        <div className="success-icon">✓</div>
        <h3>Message Sent Successfully!</h3>
        <p>Thank you for reaching out. We will get back to you shortly.</p>
        <button onClick={() => setStatus("idle")} className="final-cta">
          SEND ANOTHER <span>↗</span>
        </button>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      {/* Required for formsubmit to work correctly */}
      <input type="hidden" name="_subject" value="New Project Inquiry from Lumoro Website" />
      <input type="hidden" name="_captcha" value="false" />
      <input type="hidden" name="_template" value="table" />

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input type="text" id="name" name="name" required placeholder="John Doe" />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" required placeholder="john@company.com" />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="company">Company / Organization</label>
        <input type="text" id="company" name="company" placeholder="Example Corp (Optional)" />
      </div>

      <div className="form-group">
        <label htmlFor="details">Project Details & Requirements</label>
        <textarea
          id="details"
          name="details"
          required
          rows={5}
          placeholder="Tell us about your project, goals, timeline, and any specific requirements..."
        ></textarea>
      </div>

      <button type="submit" className="final-cta submit-btn" disabled={status === "submitting"}>
        {status === "submitting" ? "SENDING..." : "SEND MESSAGE"} <span>↗</span>
      </button>

      {status === "error" && (
        <p className="form-error">Something went wrong. Please try again or email us directly at lumoro.co.live@gmail.com</p>
      )}
    </form>
  );
}
