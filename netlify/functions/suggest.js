const CATEGORY_DESCRIPTIONS = {
  Deneyim:
    "aktivite, etkinlik, kurs, macera veya konsept deneyim (spa günü, yemek kursu, tırmanma, konser, kaçış odası)",
  Teknoloji:
    "elektronik ürün, akıllı aksesuar, gadget veya dijital abonelik (kulaklık, akıllı saat, e-kitap okuyucu)",
  "Kişisel Bakım":
    "cilt bakımı, parfüm, spa seti, wellness ürünü veya bakım rutini hediyesi",
  "Kitap & Kültür":
    "kitap, dergi/podcast aboneliği, müze üyeliği, sanat malzemesi veya kültürel içerik",
  "Yiyecek & İçecek":
    "gurme ürün, çikolata kutusu, özel kahve/çay seti, özel yemek deneyimi veya gıda aboneliği",
  "Aksesuar & Stil":
    "takı, çanta, şapka, güneş gözlüğü veya kişiselleştirilebilir moda parçası",
  "Ev & Yaşam":
    "dekorasyon, mutfak aleti, bitki/tohum seti, mum koleksiyonu veya konfor ürünü",
  "Hobi & Aktivite":
    "hobi malzemesi, kutu oyunu, spor ekipmanı, yaratıcı DIY kit veya koleksiyon ürünü",
};

const BUDGET_MAP = {
  "100-250₺": { min: 100, max: 250 },
  "250-500₺": { min: 250, max: 500 },
  "500-1000₺": { min: 500, max: 1000 },
  "1000-2500₺": { min: 1000, max: 2500 },
  "2500₺+": { min: 2500, max: null },
};

exports.handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "API key yapılandırılmamış. Netlify ortam değişkenlerini kontrol edin.",
      }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Geçersiz istek" }),
    };
  }

  const { yas, cinsiyet, ilgi, butce, vesile, ekstra, category } = body;

  const catDesc = CATEGORY_DESCRIPTIONS[category] || category;
  const ilgiList = ilgi || "belirtilmedi";
  const budget = BUDGET_MAP[butce] || {};
  const budgetNote = budget.max
    ? `${budget.min}₺ ile ${budget.max}₺ arasında`
    : `${budget.min || 0}₺ ve üzeri`;

  const prompt = `Sen kişiye özel hediye öneren Türkçe konuşan bir uzmansın.

ÇARK SONUCU: "${category}" kategorisi seçildi.
Kategori kapsamı: ${catDesc}

ALICI PROFİLİ:
- Yaş: ${yas}
- Cinsiyet: ${cinsiyet}
- İlgi alanları: ${ilgiList}
- Bütçe: ${butce} (${budgetNote})
- Vesile: ${vesile}
${ekstra ? `- Ek not: ${ekstra}` : ""}

KURALLAR:
1. Tam 5 öneri sun, hepsi kesinlikle "${category}" kategorisinde olmalı
2. Her önerinin fiyatı ${budgetNote} arasında OLMALI
3. Her öneri kişinin yaşına (${yas}), cinsiyetine (${cinsiyet}) ve ilgi alanlarına (${ilgiList}) özel olmalı
4. "why" alanında kişinin ilgi alanlarına veya ${vesile} vesilesine mutlaka değin
5. İlk öneri en yaratıcı ve kişiselleştirilmiş olsun; diğerleri farklı alt seçenekler sunsun
6. Gerçekçi, Türkiye'de bulunabilir ürün/deneyimler öner

SADECE şu JSON formatında yanıt ver, başka hiçbir metin ekleme:
{"gifts":[{"name":"Hediye adı","why":"Bu kişiye neden uygun (1-2 cümle)","price":"Tahmini fiyat ₺"}]}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 1024,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({
          error: err.error?.message || `Gemini API hatası (${response.status})`,
        }),
      };
    }

    const result = await response.json();
    const text = result.candidates[0].content.parts[0].text;
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(parsed),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message || "Sunucu hatası" }),
    };
  }
};
