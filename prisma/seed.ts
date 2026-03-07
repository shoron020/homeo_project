import { PrismaClient } from "../generated/prisma/index.js";

const db = new PrismaClient();

async function main() {
  // Categories
  const cats = await Promise.all([
    db.category.upsert({
      where: { slug: "remedies-by-ailment" },
      update: {},
      create: { name: "Remedies by Ailment", slug: "remedies-by-ailment", description: "Targeted homeopathic remedies for specific ailments", image: "/images/cat-ailment.jpg" },
    }),
    db.category.upsert({
      where: { slug: "mother-tinctures" },
      update: {},
      create: { name: "Mother Tinctures", slug: "mother-tinctures", description: "Pure herbal mother tinctures (Q potency)", image: "/images/cat-tincture.jpg" },
    }),
    db.category.upsert({
      where: { slug: "biochemic-tablets" },
      update: {},
      create: { name: "Biochemic Tablets", slug: "biochemic-tablets", description: "12 tissue salts and biochemic combinations", image: "/images/cat-biochemic.jpg" },
    }),
    db.category.upsert({
      where: { slug: "topical-ointments" },
      update: {},
      create: { name: "Topical Ointments", slug: "topical-ointments", description: "External application creams and ointments", image: "/images/cat-ointment.jpg" },
    }),
  ]);

  const [ailment, tincture, biochemic, topical] = cats;

  // Products
  const products = [
    { name: "Arnica Montana 30C", slug: "arnica-montana-30c", categoryId: ailment!.id, potency: "30C", price: 120, stock: 50, isFeatured: true, indications: "Bruising, muscle soreness, post-surgery recovery, shock", dosage: "4 pills 3 times daily", ingredients: "Arnica montana dilution", directions: "Let pills dissolve under tongue. Avoid coffee/mint.", image: "/images/arnica.jpg" },
    { name: "Belladonna 200C", slug: "belladonna-200c", categoryId: ailment!.id, potency: "200C", price: 150, stock: 35, isFeatured: false, indications: "High fever with redness, throbbing headaches, sore throat", dosage: "4 pills every 2 hours during acute phase", ingredients: "Belladonna dilution", directions: "Take away from food/drink. Store in cool dark place.", image: "/images/belladonna.jpg" },
    { name: "Nux Vomica 30C", slug: "nux-vomica-30c", categoryId: ailment!.id, potency: "30C", price: 110, stock: 60, isFeatured: true, indications: "Indigestion, nausea, hangover, irritability, constipation", dosage: "4 pills twice daily", ingredients: "Nux vomica dilution", directions: "Best taken in the morning. Avoid spicy food during treatment.", image: "/images/nux-vomica.jpg" },
    { name: "Rhus Toxicodendron 200C", slug: "rhus-tox-200c", categoryId: ailment!.id, potency: "200C", price: 160, stock: 40, isFeatured: true, indications: "Joint pain worse at rest, back pain, stiffness, eczema", dosage: "4 pills twice daily", ingredients: "Rhus toxicodendron dilution", directions: "Take 30 min before meals.", image: "/images/rhus-tox.jpg" },
    { name: "Echinacea Q (Mother Tincture)", slug: "echinacea-q", categoryId: tincture!.id, potency: "Q", price: 220, stock: 25, isFeatured: true, indications: "Immune booster, recurrent infections, wound healing", dosage: "20 drops in water 3 times daily", ingredients: "Echinacea purpurea mother tincture", directions: "Dilute in half cup of water. Use for 3-week cycles.", image: "/images/echinacea.jpg" },
    { name: "Thuja Occidentalis Q", slug: "thuja-q", categoryId: tincture!.id, potency: "Q", price: 180, stock: 30, isFeatured: false, indications: "Warts, polyps, skin conditions, effects of vaccination", dosage: "15 drops 3 times daily", ingredients: "Thuja occidentalis mother tincture", directions: "Can be applied topically on warts diluted 1:1 with water.", image: "/images/thuja.jpg" },
    { name: "Kali Phos 6X (Biochemic)", slug: "kali-phos-6x", categoryId: biochemic!.id, potency: "6X", price: 90, stock: 80, isFeatured: false, indications: "Nerve exhaustion, brain fatigue, anxiety, poor memory", dosage: "4 tablets 3 times daily", ingredients: "Kalium phosphoricum 6X", directions: "Dissolve under tongue. Safe for long-term use.", image: "/images/kali-phos.jpg" },
    { name: "Calc Fluor 12X (Biochemic)", slug: "calc-fluor-12x", categoryId: biochemic!.id, potency: "12X", price: 95, stock: 70, isFeatured: false, indications: "Tooth enamel weakness, varicose veins, hard lump in breast", dosage: "4 tablets 3 times daily", ingredients: "Calcarea fluorica 12X", directions: "Can be taken long-term. Ensure regular dental checkups.", image: "/images/calc-fluor.jpg" },
    { name: "Calendula Ointment 1X", slug: "calendula-ointment", categoryId: topical!.id, potency: "1X", price: 130, stock: 45, isFeatured: true, indications: "Minor cuts, burns, skin irritation, post-surgical scars", dosage: "Apply thin layer 2-3 times daily", ingredients: "Calendula officinalis 1X in petroleum jelly base", directions: "External use only. Clean wound before application.", image: "/images/calendula.jpg" },
    { name: "Arnica Gel 30C", slug: "arnica-gel-30c", categoryId: topical!.id, potency: "30C", price: 145, stock: 38, isFeatured: false, indications: "Bruises, sprains, sports injuries, muscle pain", dosage: "Apply 2-3 times daily on affected area", ingredients: "Arnica montana 30C in gel base", directions: "Do not apply on broken skin or open wounds.", image: "/images/arnica-gel.jpg" },
  ];

  for (const p of products) {
    await db.product.upsert({ where: { slug: p.slug }, update: {}, create: p });
  }

  // Blog Posts
  const blogs = [
    { title: "Top 5 Homeopathic Remedies for Monsoon Ailments", slug: "top-5-monsoon-remedies", excerpt: "Stay healthy this monsoon with these essential homeopathic remedies for flu, fever, and digestive issues.", content: "Monsoon season brings humidity, flooding, and a surge in viral infections...\n\n**1. Gelsemium** – For flu with weakness and trembling.\n**2. Rhus Tox** – For joint pains that worsen in damp weather.\n**3. Arsenicum Album** – For food poisoning and gastroenteritis.\n**4. Bryonia** – For dry cough and headaches worse from movement.\n**5. Natrum Sulph** – The monsoon remedy, for conditions aggravated by wet weather.\n\nAlways consult a qualified homeopath before starting any remedy.", category: "Seasonal", image: "/images/blog-monsoon.jpg" },
    { title: "Understanding Potency in Homeopathy: 6C vs 30C vs 200C", slug: "understanding-potency", excerpt: "Confused by 30C, 200C, or 1M? Here's a simple guide to choosing the right potency for your condition.", content: "Potency selection is one of the most discussed topics in homeopathy...\n\n**Low potencies (6C, 12C, 6X, 12X)** are best for physical complaints with clear pathology.\n**Medium potencies (30C)** are the most commonly used for acute and chronic conditions.\n**High potencies (200C, 1M)** are reserved for constitutional treatment by experienced practitioners.\n\nFor self-treatment, 30C is generally considered safe and effective.", category: "Health Awareness", image: "/images/blog-potency.jpg" },
    { title: "Mother Tinctures: Nature's Most Powerful Herbal Extracts", slug: "mother-tinctures-guide", excerpt: "Mother tinctures (Q) are the most concentrated form of homeopathic medicines. Learn how to use them safely.", content: "Mother tinctures are prepared by macerating fresh plant material in alcohol...\n\nPopular mother tinctures include:\n- **Echinacea Q** – Immune system support\n- **Thuja Q** – Warts and skin conditions\n- **Ginkgo Biloba Q** – Memory and circulation\n\nDosage: Typically 10-20 drops in half a cup of water, 2-3 times daily.", category: "Remedies", image: "/images/blog-tincture.jpg" },
  ];

  for (const b of blogs) {
    await db.blogPost.upsert({ where: { slug: b.slug }, update: {}, create: b });
  }

  console.log("✅ Seed complete");
}

main().catch(console.error).finally(() => db.$disconnect());
