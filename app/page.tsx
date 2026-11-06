"use client";

import { useEffect, useState } from "react";
import { services } from "@/lib/services";

type BookingForm = { name: string; phone: string; email: string; service: string; date: string; time: string; notes: string };
const torontoToday = () => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
const initialForm: BookingForm = { name: "", phone: "", email: "", service: "", date: "", time: "Flexible", notes: "" };

// One full lash line fanning out from a closed lid. Every 3rd lash is longest, so it reads as hand-placed.
const lashPaths = Array.from({ length: 73 }, (_, index) => {
  const t = (index + 0.5) / 73;
  const spread = 2 * t - 1;
  const rootX = t * 1000;
  const rootY = 20 + 120 * (1 - spread * spread);
  const angle = spread * 1.05;
  const length = (index % 3 === 0 ? 150 : index % 3 === 1 ? 104 : 124) * (0.5 + 0.5 * Math.sin(Math.PI * t) ** 0.6);
  const tipX = rootX + Math.sin(angle) * length;
  const tipY = rootY + Math.cos(angle) * length;
  const bendX = rootX + Math.sin(angle) * length * 0.3;
  const bendY = rootY + Math.cos(angle) * length * 0.72;
  return `M${(rootX - 3).toFixed(1)} ${rootY.toFixed(1)}Q${bendX.toFixed(1)} ${bendY.toFixed(1)} ${tipX.toFixed(1)} ${tipY.toFixed(1)}Q${(bendX + 5).toFixed(1)} ${bendY.toFixed(1)} ${(rootX + 3).toFixed(1)} ${rootY.toFixed(1)}Z`;
}).join("");

function LashArtwork() {
  return <div className="lash-artwork" role="img" aria-label="Illustration of softly lifted lashes">
    <span className="art-orbit" aria-hidden="true"/>
    <span className="art-sheen" aria-hidden="true"/>
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

// Eyelid contours with one fanned lash line, drawn around the same centre as a wide open eye.
const eyeCenter = { x: 1130, y: 600 };
const lidContours = Array.from({ length: 8 }, (_, index) => {
  const width = 300 + index * 92;
  const height = 300 + index * 66;
  return `M${eyeCenter.x - width} ${eyeCenter.y}Q${eyeCenter.x} ${eyeCenter.y - height * 2} ${eyeCenter.x + width} ${eyeCenter.y}`;
}).join("");
const bannerLashes = Array.from({ length: 31 }, (_, index) => {
  const angle = (index / 30 - 0.5) * 2.5;
  const radiusX = 300;
  const radiusY = 300;
  const rootX = eyeCenter.x + Math.sin(angle) * radiusX;
  const rootY = eyeCenter.y - Math.cos(angle) * radiusY;
  const length = index % 2 === 0 ? 150 : 104;
  const tipX = rootX + Math.sin(angle * 1.14) * length;
  const tipY = rootY - Math.cos(angle * 1.14) * length;
  const bendX = rootX + Math.sin(angle * 0.9) * length * 0.55;
  const bendY = rootY - Math.cos(angle * 0.9) * length * 0.55;
  return `M${(rootX - 4).toFixed(1)} ${rootY.toFixed(1)}Q${bendX.toFixed(1)} ${bendY.toFixed(1)} ${tipX.toFixed(1)} ${tipY.toFixed(1)}Q${(bendX + 6).toFixed(1)} ${bendY.toFixed(1)} ${(rootX + 4).toFixed(1)} ${rootY.toFixed(1)}Z`;
}).join("");
const bannerSparkles = [[1330, 86, 20], [884, 92, 11], [1402, 300, 11], [716, 512, 9], [1208, 40, 7]]
  .map(([x, y, r]) => `M${x} ${y - r}Q${x} ${y} ${x + r} ${y}Q${x} ${y} ${x} ${y + r}Q${x} ${y} ${x - r} ${y}Q${x} ${y} ${x} ${y - r}Z`)
  .join("");

function InvitationArt() {
  return <svg className="invitation-art" viewBox="0 0 1440 560" preserveAspectRatio="xMaxYMax slice" aria-hidden="true">
    <path className="invitation-contours" d={lidContours}/>
    <path className="invitation-lashes" d={bannerLashes}/>
    <path className="invitation-sparkles" d={bannerSparkles}/>
  </svg>;
}

function ClosedEye() {
  return <svg className="closed-eye" viewBox="0 0 1000 300" aria-hidden="true">
    <path className="closed-eye-lid" d="M0 20Q500 260 1000 20"/>
    <path className="closed-eye-lashes" d={lashPaths}/>
  </svg>;
}

export default function Home() {
  const [form, setForm] = useState<BookingForm>(initialForm);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [minDate, setMinDate] = useState("");
  const selected = services.find((service) => service.name === form.service);

  useEffect(() => { setMinDate(torontoToday()); }, []);

  useEffect(() => {
    // Supabase sends reset links here when it rejects the redirect address.
    const hash = new URLSearchParams(window.location.hash.slice(1));
    if (hash.get("type") === "recovery" || hash.has("error_code")) {
      window.location.replace(`/admin/reset-password${window.location.hash}`);
    }
  }, []);

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
    const formData = new FormData(formElement);
    const consent = formData.get("consent") === "on";
    const company = formData.get("company");
    setBusy(true); setStatus("");
    try {
      const response = await fetch("/api/bookings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, consent, company }) });
      const data = await response.json() as { error?: string; customerEmail?: string };
      if (!response.ok) throw new Error(data.error || "Unable to submit request.");
      setStatus(data.customerEmail === "sent"
        ? "Thank you! Your request is received. We’ve emailed you a receipt and will email you when its status changes."
        : "Thank you! Your request has been received. We’ll contact you to confirm your appointment.");
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
      <a className="wordmark" href="#" aria-label="Lash by Doye home"><span className="wordmark-monogram">LD</span><span className="wordmark-name">LASH BY DOYE</span></a>
      <nav className="main-nav" aria-label="Main navigation"><a href="#services">The menu</a><a href="#about">Our story</a><a className="nav-book" href="#booking">Book your set</a></nav>
    </header>
    <section className="hero">
      <div className="hero-copy">
        <h1>For the days<br/>you want to feel<br/><em>a little extra<br/>you.</em></h1>
        <p className="hero-intro">Lashes chosen around your eyes, your style, your kind of beautiful. Made with care, one appointment at a time.</p>
        <a className="button button-dark" href="#booking">Find your set</a>
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
          return <a className="service-row" href="#booking" key={name} onClick={() => setForm((current) => ({ ...current, service: name }))}><span>{name}<small>CAD · grand opening price</small></span><span className="service-prices"><del>${service.regularPrice}</del><strong>${service.launchPrice}</strong></span></a>;
        })}</div></article>)}</div>
      <p className="menu-footnote">All prices in CAD. Promotional prices reflect the grand opening discount. Service suitability and appointment details are confirmed by the studio.</p>
    </section>
    <section className="invitation" data-reveal><InvitationArt/><div className="invitation-content"><h2>Come as you are.<br/><em>Leave a little brighter.</em></h2><div className="invitation-action"><p>Tell Doye what you have in mind, and she’ll confirm your time.</p><a className="button button-light" href="#booking">Request your appointment</a></div></div></section>
    <section className="booking-section" id="booking">
      <div className="booking-aside" data-reveal><p className="eyebrow">THE FIRST LITTLE STEP</p><h2>Let’s make<br/><em>it yours.</em></h2><p>Tell us what you have in mind and when you’d like to come in. Doye will personally review your request and get back to you to confirm the details.</p>
        <div className="booking-points"><span><b>01</b> Pick your look</span><span><b>02</b> Choose a day</span><span><b>03</b> We’ll be in touch</span></div></div>
      <form className="booking-form" data-reveal onSubmit={submit}>
        <div className="form-heading">
          <span className="form-step"><span className="form-step-title"><i className="form-step-dot"/>YOUR APPOINTMENT REQUEST</span><b><small>STEP</small> 01 <i>/ 01</i></b></span>
          <h3>Tell us a little about you.</h3>
          <p>Share your details and the look you have in mind.</p>
          <span className="form-monogram" aria-hidden="true">LD</span>
        </div>
        <label className="form-trap" aria-hidden="true">Company<input type="text" name="company" tabIndex={-1} autoComplete="off"/></label>
        <fieldset className="form-group">
          <legend><span>01</span> Your details</legend>
          <label>Your name<input required maxLength={100} name="name" value={form.name} onChange={change} placeholder="First and last name" autoComplete="name"/></label>
          <div className="field-pair"><label>Phone number<input required maxLength={30} name="phone" type="tel" value={form.phone} onChange={change} placeholder="(519) 000-0000" autoComplete="tel"/></label><label>Email address<input required maxLength={254} name="email" type="email" value={form.email} onChange={change} placeholder="you@email.com" autoComplete="email"/></label></div>
        </fieldset>
        <fieldset className="form-group">
          <legend><span>02</span> Appointment preferences</legend>
          <label>Choose your service<select required name="service" value={form.service} onChange={change}><option value="">Select a lash service</option>{services.map((service) => <option key={service.name} value={service.name}>{service.name} — ${service.launchPrice} CAD</option>)}</select></label>
          {selected && <p className="selected-price"><span>Grand opening price</span><strong>${selected.launchPrice} CAD</strong></p>}
          <div className="field-pair"><label>Preferred date<input required type="date" name="date" min={minDate || undefined} value={form.date} onChange={change}/></label><label>Preferred time<select name="time" value={form.time} onChange={change}><option>Flexible</option><option>Morning</option><option>Afternoon</option><option>Evening</option></select></label></div>
          <label>Anything else we should know? <span className="optional">(optional)</span><textarea rows={3} maxLength={1000} name="notes" value={form.notes} onChange={change} placeholder="Lash inspiration, sensitivities or questions…"/></label>
        </fieldset>
        <p className="payment-note"><span>PAYMENT</span><span>Payment is due upon arrival for your appointment. Cancelling with less than 24 hours’ notice or missing your appointment has a $10 fee, payable before your next booking.</span></p>
        <label className="consent-check"><input required type="checkbox" name="consent"/><span>I’m 17 or older, and I agree that Lash by Doye may contact me about this request.</span></label>
        <button className="button button-dark submit-button" disabled={busy}>{busy ? "Sending request…" : <>Send appointment request</>}</button>
        {status && <p className="form-status" role="status">{status}</p>}<p className="form-privacy">Your appointment isn’t reserved until the studio contacts you directly. By sending a request, you agree to our <a href="/terms">Terms of Use</a> and <a href="/privacy">Privacy Policy</a>.</p>
      </form>
    </section>
    <section className="closing-note">
      <div className="closing-copy" data-reveal><h2>Can’t wait to meet you.</h2><p>Thank you for supporting a dream. Every booking, referral and kind word means more than you know.</p></div>
      <ClosedEye/>
    </section>
    <footer className="site-footer"><a className="wordmark footer-wordmark" href="#"><span className="wordmark-monogram">LD</span><span className="wordmark-name">LASH BY DOYE</span></a><span>© {new Date().getFullYear()} Lash by Doye</span><nav className="footer-legal" aria-label="Legal"><a href="/privacy">Privacy Policy</a><a href="/terms">Terms of Use</a></nav><a className="studio-credit" href="https://yagildigitalstudios.com" target="_blank" rel="noopener noreferrer">Concept &amp; Design by <strong>YAGIL DIGITAL STUDIOS</strong></a></footer>
  </main>;
}
