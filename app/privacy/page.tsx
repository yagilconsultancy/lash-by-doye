import type { Metadata } from "next";
import LegalPage from "../legal-page";

export const metadata: Metadata = { title: "Privacy Policy | Lash by Doye", description: "How Lash by Doye collects, uses and protects your booking details." };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <p>Lash by Doye is a small lash studio in London, Ontario. When you book with me, you trust me with your details, and I take that seriously. This page explains what I collect, why I need it, and what choices you have.</p>

      <h2>What I collect</h2>
      <p>When you send an appointment request, I ask for:</p>
      <ul>
        <li>your name, phone number and email address</li>
        <li>the service you want</li>
        <li>your preferred date and time</li>
        <li>anything you choose to add in the notes</li>
      </ul>
      <p>Notes are optional. You can use them to mention allergies or sensitivities. Please only share what you’re comfortable with and what will help me look after you.</p>
      <p>I don’t take payment on this website. Payment is due when you arrive for your appointment, so the site never asks for your card details.</p>

      <h2>How I use your details</h2>
      <ul>
        <li>to review your request and arrange your appointment</li>
        <li>to contact you by email, phone or WhatsApp about your booking</li>
        <li>to send a receipt and updates when your appointment is confirmed, moved, declined, cancelled or completed</li>
        <li>to keep track of my appointments and business records</li>
      </ul>
      <p>I don’t sell your details, and I won’t add you to a marketing list because you booked.</p>

      <h2>Who else handles your details</h2>
      <p>I use a few trusted services to run this website. They only handle your details so the site can work:</p>
      <ul>
        <li><strong>Supabase</strong> stores booking requests and secures the studio login.</li>
        <li><strong>Resend</strong> delivers booking emails.</li>
        <li><strong>Cloudflare</strong> hosts the site and helps protect it from spam and attacks.</li>
        <li><strong>Google Fonts</strong> supplies the fonts on the site, so your browser connects to Google when a page loads.</li>
      </ul>
      <p>If you message me on WhatsApp, WhatsApp’s own privacy terms apply to that chat. Some of these companies may store or process information outside Canada, where different privacy laws can apply.</p>
      <p>I may also share information if the law requires it.</p>

      <h2>Cookies</h2>
      <p>I don’t use advertising cookies or tracking tools on this site. The studio login uses cookies to keep me signed in, and Cloudflare may use a security cookie to help tell real visitors from bots.</p>

      <h2>How long I keep your details</h2>
      <p>I delete booking details by hand about 30 to 90 days after your appointment is completed. You can ask me to delete them sooner. I may need to keep some records for longer if the law requires it.</p>

      <h2>Keeping your details safe</h2>
      <p>Booking requests are only available through a private, password-protected studio dashboard. No website can promise perfect security, but I work to keep your details protected and limit who can see them.</p>

      <h2>Your choices</h2>
      <p>You can ask to see the details I hold about you, correct anything that’s wrong, or withdraw your consent and have your details deleted. If you withdraw consent while a booking is open, I may not be able to complete it.</p>

      <h2>Age</h2>
      <p>Bookings are for clients aged 17 and older, so I don’t knowingly collect details from anyone younger. If you think someone under 17 has sent a request, let me know and I’ll delete it.</p>

      <h2>Contact me</h2>
      <p>For a privacy question or request, reply to any email you’ve received from Lash by Doye. If you’re not happy with how I’ve handled your request, you can contact the <a href="https://www.priv.gc.ca/" target="_blank" rel="noopener noreferrer">Office of the Privacy Commissioner of Canada</a>.</p>

      <h2>Changes to this policy</h2>
      <p>If the way I handle your details changes, I’ll update this page and the date at the top.</p>
    </LegalPage>
  );
}
