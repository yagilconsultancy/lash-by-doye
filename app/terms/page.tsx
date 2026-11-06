import type { Metadata } from "next";
import LegalPage from "../legal-page";

export const metadata: Metadata = { title: "Terms of Use | Lash by Doye", description: "The terms for using the Lash by Doye website and requesting an appointment." };

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Use">
      <p>These terms cover your use of this website and your appointment requests with Lash by Doye in London, Ontario. By using the site or sending a request, you agree to them.</p>

      <h2>Your request isn’t a confirmed booking</h2>
      <p>The booking form sends me a request, not a reservation. The date and time you choose are your preference. Your appointment is only confirmed once I’ve contacted you with the final date and time. I may suggest another time, or decline a request if I can’t take it.</p>

      <h2>Age</h2>
      <p>You must be 17 or older to book an appointment.</p>

      <h2>Your details</h2>
      <p>Please give your real name and contact details so I can reach you. Please don’t submit requests for someone else without their permission, or use the form to send spam.</p>

      <h2>Before your appointment</h2>
      <p>Lash extensions involve adhesives and products close to your eyes. Before your appointment, please tell me about any allergies, sensitivities, eye conditions or recent eye treatments. Whether a service is right for you is confirmed by the studio, and I may change or decline a service if I don’t think it’s suitable or safe.</p>

      <h2>Your results</h2>
      <p>Every set gets my full care and attention to detail. Results can still vary with your natural lashes, your aftercare and the style you choose, so I can’t promise an exact look or how long your set will last.</p>

      <h2>Prices and payment</h2>
      <ul>
        <li>All prices are in Canadian dollars.</li>
        <li>Payment is due when you arrive for your appointment. There’s no online payment on this site.</li>
        <li>Grand opening prices and the $10 launch offer are for a limited time, and may end or change without notice.</li>
        <li>The price of your service is the price shown on this website when you send your request.</li>
      </ul>

      <h2>Changing or cancelling</h2>
      <p>If you need to change or cancel, please let me know as early as you can so the time can go to someone else. I’ll let you know as soon as possible if I need to change or cancel your appointment.</p>

      <h2>Website content</h2>
      <p>The words, images, logo and design on this site belong to Lash by Doye or the people who created them. Please don’t copy or reuse them without permission. Please don’t try to interfere with the site or get into any part of it that isn’t meant for you.</p>
      <p>I work to keep the site accurate and available, but it may sometimes be unavailable or contain mistakes. If a price or detail on the site is wrong, I’ll correct it and confirm the right details with you before your appointment.</p>

      <h2>Responsibility</h2>
      <p>To the extent the law allows, Lash by Doye isn’t responsible for indirect losses that come from using this website. Nothing in these terms takes away any rights you have under Ontario consumer protection law that can’t legally be waived.</p>

      <h2>Your privacy</h2>
      <p>The <a href="/privacy">Privacy Policy</a> explains how I handle your details.</p>

      <h2>Governing law</h2>
      <p>These terms are governed by the laws of Ontario and the federal laws of Canada that apply there.</p>

      <h2>Changes and questions</h2>
      <p>I may update these terms from time to time, and I’ll change the date at the top when I do. For any questions, reply to any email you’ve received from Lash by Doye.</p>
    </LegalPage>
  );
}
