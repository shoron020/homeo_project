"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

const FAQS = [
  { q: "What potency should I start with?", a: "For most acute conditions and self-treatment, 30C is the recommended starting potency. It is safe, effective, and widely available. For chronic conditions, consult a qualified homeopath who may prescribe higher potencies like 200C or 1M." },
  { q: "How should I store my homeopathic remedies?", a: "Store in a cool, dry place away from direct sunlight, strong odors (especially camphor, eucalyptus, and coffee), electromagnetic fields, and heat. Keep the caps tightly closed." },
  { q: "Can I take homeopathic medicines during pregnancy?", a: "Many homeopathic remedies are considered safe during pregnancy, but always consult your healthcare provider and a qualified homeopath before starting any treatment during pregnancy." },
  { q: "How long does delivery take?", a: "We deliver within Dhaka in 1-2 business days. For other districts across Bangladesh, delivery takes 3-5 business days." },
  { q: "What payment methods do you accept?", a: "We accept bKash, Nagad, Credit/Debit Cards, and Cash on Delivery (COD) for all orders across Bangladesh." },
  { q: "Can homeopathic medicines be taken with allopathic drugs?", a: "Generally yes, but they should not be taken at the same time. Leave at least 30 minutes between taking homeopathic and allopathic medicines. Consult your doctor for specific guidance." },
  { q: "What is a Mother Tincture (Q)?", a: "A Mother Tincture is the most concentrated extract of a plant or substance used in homeopathy. It is prepared by soaking fresh plant material in alcohol. Unlike diluted remedies, tinctures are used in drop doses diluted in water." },
  { q: "How do I select the right remedy?", a: "Remedy selection in homeopathy is based on matching the \"totality of symptoms\" – your physical, mental, and emotional state. Our blog has guidance, but for best results, consult a qualified homeopathic practitioner." },
  { q: "What is your return policy?", a: "We accept returns within 7 days of delivery for unopened, unused products in original packaging. Contact us via WhatsApp or email and we will arrange a pickup." },
  { q: "Are Biochemic Tablets (tissue salts) the same as homeopathic remedies?", a: "Biochemic tissue salts (developed by Dr. Schuessler) are a branch of homeopathic medicine. While prepared differently, they are used within the homeopathic philosophy and are safe for long-term use at low potencies like 6X or 12X." },
];

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-green-700">Help Center</p>
        <h1 className="section-title mt-1">Frequently Asked Questions</h1>
        <p className="mt-3 text-sm text-gray-600">Everything you need to know about homeopathy, our products, and services.</p>
      </div>
      <div className="space-y-3">
        {FAQS.map((faq, i) => (
          <div key={i} className="glass-card overflow-hidden">
            <button onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full items-center justify-between p-5 text-left">
              <span className="pr-4 text-sm font-bold text-gray-900">{faq.q}</span>
              {open === i ? <ChevronUp className="h-5 w-5 shrink-0 text-green-700" /> : <ChevronDown className="h-5 w-5 shrink-0 text-gray-400" />}
            </button>
            {open === i && (
              <div className="border-t border-gray-100 px-5 pb-5 pt-3">
                <p className="text-sm text-gray-700 leading-relaxed">{faq.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
