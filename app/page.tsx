"use client";

import { useEffect, useState } from "react";
import { services } from "@/lib/services";

type BookingForm = { name: string; phone: string; email: string; service: string; date: string; time: string; notes: string };
const initialForm: BookingForm = { name: "", phone: "", email: "", service: "", date: "", time: "Flexible", notes: "" };

function LashArtwork() {
  return <div className="lash-artwork" role="img" aria-label="Illustration of softly lifted lashes">
    <span className="art-orbit" aria-hidden="true"/>
    <span className="art-sheen" aria-hidden="true"/>
    <span className="art-index">01 / THE DOYE LOOK</span>
    <svg className="lash-eye" viewBox="0 0 520 340" fill="none" aria-hidden="true">
      <path className="eye-shadow" d="M77 186C126 92 204 51 267 53c74 2 139 46 178 133-43 74-110 111-186 108-72-2-133-38-182-108Z"/>
      <path className="eye-line" d="M77 186C126 92 204 51 267 53c74 2 139 46 178 133-43 74-110 111-186 108-72-2-133-38-182-108Z"/>
      <path className="eye-lid" d="M115 183c41-61 94-91 153-90 60 1 113 32 154 91"/>
      <ellipse className="eye-iris" cx="260" cy="183" rx="57" ry="65"/><ellipse className="eye-pupil" cx="260" cy="184" rx="28" ry="38"/>
      <circle className="eye-glint" cx="278" cy="162" r="10"/><path className="lash-stroke" d="m98 146-33-33m55 8-22-46m57 24-11-52m48 43 2-53m47 43 15-51m32 54 29-44m6 60 40-36m-2 56 48-22"/>
      <path className="under-eye" d="M143 244c34 39 75 58 123 58 49 0 91-21 125-61"/>
    </svg>
    <span className="art-caption">A little detail.<br/><i>A whole new feeling.</i></span><span className="art-stamp">L<br/>D</span>
  </div>;
}

export default function Home() {
  const [form, setForm] = useState<BookingForm>(initialForm);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const selected = services.find((service) => service.name === form.service);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMotion.matches) return;

    document.documentElement.classList.add("motion-enabled");
    const targets = document.querySelectorAll<HTMLElement>("[data-reveal]");
    if (!("IntersectionObserver" in window)) {
      targets.forEach((target) => target.classList.add("is-visible"));
      return () => document.documentElement.classList.remove("motion-enabled");
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -36px 0px" });
    targets.forEach((target) => observer.observe(target));
    return () => {
      observer.disconnect();
      document.documentElement.classList.remove("motion-enabled");
    };
  }, []);
  function change(event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const consent = new FormData(formElement).get("consent") === "on";
    setBusy(true); setStatus("");
    try {
      const response = await fetch("/api/bookings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, consent }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to submit request.");
      setStatus("Thank you! Your request has been received. We’ll contact you to confirm your appointment.");
      formElement.reset(); setForm(initialForm);
    } catch (error) { setStatus(error instanceof Error ? error.message : "Something went wrong."); }
    finally { setBusy(false); }
  }

  const menus = [
    { title: "Lash extensions", note: "A fresh set, made yours.", names: ["Classics", "Hybrids", "Light Volume", "Volume"], number: "01" },
    { title: "Customized sets", note: "A little more personality.", names: ["Anime", "Medusa", "Wispy / Spiky", "Foreign Fill", "Mini Fill"], number: "02" },
    { title: "Refills & removal", note: "Keep your look feeling fresh.", names: ["Classic Refill", "Hybrid Refill", "Light Volume Refill", "Volume Refill", "Removal"], number: "03" },
  ];
  return <main>
    <header className="site-header">
      <a className="wordmark" href="#" aria-label="Lash by Doye home"><span className="wordmark-monogram">LD</span><span className="wordmark-name">LASH BY DOYE<small>LONDON, ONTARIO</small></span></a>
      <nav className="main-nav" aria-label="Main navigation"><a href="#services">The menu</a><a href="#about">Our story</a><a className="nav-book" href="#booking">Book your set <span aria-hidden="true">↗</span></a></nav>
    </header>
    <section className="hero">
      <div className="hero-copy">
        <p className="eyebrow"><span className="eyebrow-dot"/> Now welcoming new clients <span className="eyebrow-place">· London, Ontario</span></p>
        <h1>For the days<br/>you want to feel<br/><em>a little extra<span className="headline-mobile-break"><br/></span> you.</em></h1>
        <p className="hero-intro">Lashes chosen around your eyes, your style, your kind of beautiful. Made with care, one appointment at a time.</p>
        <a className="button button-dark" href="#booking">Find your set <span aria-hidden="true">↗</span></a>
        <div className="offer-note"><span className="offer-amount">$10</span><span><strong>OFF EVERY LASH SERVICE</strong><small>A little welcome from Doye · limited time</small></span></div>
      </div>
      <div className="hero-visual"><LashArtwork/></div>
      <div className="hero-foot"><span>YOUR EYES, YOUR EXPRESSION</span><a href="#services">EXPLORE THE MENU <span aria-hidden="true">↓</span></a><span>01 — 04</span></div>
    </section>
    <div className="brand-ticker" aria-label="Soft glam. Personal style. Good energy.">
      <div className="ticker-track" aria-hidden="true">
        <div className="ticker-group"><span>SOFT GLAM</span><i/><span>PERSONAL STYLE</span><i/><span>GOOD ENERGY</span><i/><span>MADE FOR YOUR EYES</span><i/></div>
        <div className="ticker-group"><span>SOFT GLAM</span><i/><span>PERSONAL STYLE</span><i/><span>GOOD ENERGY</span><i/><span>MADE FOR YOUR EYES</span><i/></div>
      </div>
    </div>
    <section className="intro-section" id="about" data-reveal>
      <div className="intro-mark" aria-hidden="true">“</div>
      <div><p className="eyebrow">A NOTE FROM DOYE</p><p className="intro-statement">I’m a beginner lash artist with a big love for the little details. I’m learning, growing, and perfecting my craft — <em>and I’d love for you to be part of the journey.</em></p><span className="signature">With love, Doye</span></div>
      <div className="intro-side">SOFT GLAM<br/>PERSONAL STYLE<br/>GOOD ENERGY</div>
    </section>
    <section className="menu-section" id="services">
      <div className="section-heading" data-reveal><div><p className="eyebrow">THE SERVICE MENU <span className="heading-rule"/></p><h2>Your eyes.<br/><em>Your kind of beautiful.</em></h2></div><p className="section-description">A soft flutter or a little more drama. Explore the looks and find the one that feels like you.</p></div>
      <div className="service-grid">{menus.map((group) => <article className="service-column" data-number={group.number} data-reveal key={group.title}>
        <div className="service-column-top"><span>{group.number}</span><span>− $10 LAUNCH OFFER</span></div><h3>{group.title}</h3><p className="service-note">{group.note}</p>
        <div className="service-list">{group.names.map((name) => { const service = services.find((item) => item.name === name); if (!service) return null;
          return <a className="service-row" href="#booking" key={name} onClick={() => setForm((current) => ({ ...current, service: name }))}><span>{name}<small>CAD · grand opening price</small></span><span className="service-prices"><del>${service.regularPrice}</del><strong>${service.launchPrice}</strong><i aria-hidden="true">↗</i></span></a>;
        })}</div></article>)}</div>
      <p className="menu-footnote">All prices in CAD. Promotional prices reflect the grand opening discount. Service suitability and appointment details are confirmed by the studio.</p>
    </section>
    <section className="invitation" data-reveal><div className="invitation-meta"><span>A GOOD DAY STARTS WITH YOU</span><span>LD · LONDON, ON</span></div><div className="invitation-content"><p className="eyebrow">YOUR MOMENT IS WAITING</p><h2>Come as you are.<br/><em>Leave a little brighter.</em></h2><a className="button button-light" href="#booking">Request your appointment <span aria-hidden="true">↗</span></a></div><span className="invitation-monogram" aria-hidden="true">LD</span></section>
    <section className="booking-section" id="booking">
      <div className="booking-aside" data-reveal><p className="eyebrow">THE FIRST LITTLE STEP</p><h2>Let’s make<br/><em>it yours.</em></h2><p>Tell us what you have in mind and when you’d like to come in. Doye will personally review your request and get back to you to confirm the details.</p>
        <div className="booking-points"><span><b>01</b> Pick your look</span><span><b>02</b> Choose a day</span><span><b>03</b> We’ll be in touch</span></div><p className="booking-location">LONDON, ONTARIO <span>·</span> BY APPOINTMENT</p></div>
      <form className="booking-form" data-reveal onSubmit={submit}>
        <div className="form-heading"><span className="form-step">YOUR APPOINTMENT REQUEST <b>01 / 01</b></span><h3>Tell us a little about you.</h3><p>We’ll take it from here.</p></div>
        <label>Your name<input required name="name" value={form.name} onChange={change} placeholder="First and last name" autoComplete="name"/></label>
        <div className="field-pair"><label>Phone number<input required name="phone" type="tel" value={form.phone} onChange={change} placeholder="(519) 000-0000" autoComplete="tel"/></label><label>Email address<input required name="email" type="email" value={form.email} onChange={change} placeholder="you@email.com" autoComplete="email"/></label></div>
        <label>Choose your service<select required name="service" value={form.service} onChange={change}><option value="">Select a lash service</option>{services.map((service) => <option key={service.name} value={service.name}>{service.name} — ${service.launchPrice} CAD</option>)}</select></label>
        {selected && <p className="selected-price"><span>Grand opening price</span><strong>${selected.launchPrice} CAD</strong></p>}
        <div className="field-pair"><label>Preferred date<input required type="date" name="date" min={new Date().toISOString().slice(0, 10)} value={form.date} onChange={change}/></label><label>Preferred time<select name="time" value={form.time} onChange={change}><option>Flexible</option><option>Morning</option><option>Afternoon</option><option>Evening</option></select></label></div>
        <label>Anything else we should know? <span className="optional">(optional)</span><textarea rows={3} name="notes" value={form.notes} onChange={change} placeholder="Lash inspiration, sensitivities or questions…"/></label>
        <label className="consent-check"><input required type="checkbox" name="consent"/><span>I agree that Lash by Doye may contact me about this request.</span></label>
        <button className="button button-dark submit-button" disabled={busy}>{busy ? "Sending request…" : <>Send appointment request <span aria-hidden="true">↗</span></>}</button>
        {status && <p className="form-status" role="status">{status}</p>}<p className="form-privacy">Your appointment isn’t reserved until the studio contacts you directly.</p>
      </form>
    </section>
    <section className="closing-note" data-reveal><span className="closing-heart" aria-hidden="true">♡</span><p className="eyebrow">THANK YOU FOR SUPPORTING A DREAM</p><h2>Can’t wait to meet you.</h2><p>Every booking, referral and kind word means more than you know.</p></section>
    <footer className="site-footer"><a className="wordmark footer-wordmark" href="#"><span className="wordmark-monogram">LD</span><span className="wordmark-name">LASH BY DOYE<small>LONDON, ONTARIO</small></span></a><span>London, Ontario · By appointment</span><span>© {new Date().getFullYear()} Lash by Doye</span><a className="studio-credit" href="https://yagildigitalstudios.com" target="_blank" rel="noopener noreferrer">Concept &amp; Design by <strong>YAGIL DIGITAL STUDIOS</strong></a></footer>
  </main>;
}
