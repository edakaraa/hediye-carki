import {
  getAssetFromKV,
  NotFoundError,
  serveSinglePageApp,
} from "@cloudflare/kv-asset-handler";

type SuggestRequestBody = {
  yas: string;
  cinsiyet: string;
  butce: string;
  vesile: string;
  ekstraNot?: string;
  spinKategorisi: string;
};

export interface Env {
  GROQ_API_KEY: string;
  __STATIC_CONTENT: unknown;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (url.pathname === "/api/suggest" && request.method === "POST") {
      try {
        const body = (await request.json()) as SuggestRequestBody;
        const { yas, cinsiyet, butce, vesile, ekstraNot, spinKategorisi } = body;

        const budgetMap: Record<string, string> = {
          "100-250₺": "100 TL ile 250 TL arasında",
          "250-500₺": "250 TL ile 500 TL arasında",
          "500-1K₺": "500 TL ile 1000 TL arasında",
          "1K-2.5K₺": "1000 TL ile 2500 TL arasında",
          "2.5K₺+": "en az 2500 TL ve üzeri (premium/lüks segment)",
        };
        const budgetDescription = budgetMap[butce] || butce;

        const systemPrompt = `Sen hediye danışmanısın. Yalnızca TÜRKÇE yanıt ver. Sonuçları sadece 5 maddelik numaralı liste olarak ver. KRİTİK KURAL: Önerdiğin her hediyenin fiyatı kullanıcının belirttiği bütçe aralığının İÇİNDE olmalıdır. Bütçenin altında veya üstünde fiyat YAZMA.`;

        const userPrompt = `Bütçe (KESİN UYULMALI): ${budgetDescription}.
Yaş: ${yas}, Cinsiyet: ${cinsiyet}, Vesile: ${vesile}, Not: ${ekstraNot || "Yok"}, Kategori: ${spinKategorisi}.
Bu bütçeye uygun SADECE 5 kısa hediye önerisi yap. Her madde: hediye adı, tahmini fiyat (${budgetDescription} aralığında), tek cümle açıklama. Doğrudan listeye başla.`;

        const messages = [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ];

        const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${env.GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages,
            stream: true,
            max_tokens: 400,
            temperature: 0.7,
          }),
        });

        if (!groqResponse.ok) {
          const errorBody = await groqResponse.text();
          return new Response(
            JSON.stringify({ error: "Groq API hatası", details: errorBody }),
            {
              status: groqResponse.status,
              headers: { "Content-Type": "application/json", ...corsHeaders },
            },
          );
        }

        return new Response(groqResponse.body, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            ...corsHeaders,
          },
        });
      } catch (err) {
        return new Response(
          JSON.stringify({
            error: "AI yanıt verirken bir hata oluştu.",
            details: err instanceof Error ? err.message : String(err),
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          },
        );
      }
    }

    try {
      if (!env.__STATIC_CONTENT) {
        return new Response("STATIC_CONTENT binding not found", { status: 500 });
      }

      return await getAssetFromKV(
        {
          request,
          waitUntil(promise) {
            return ctx.waitUntil(promise);
          },
        },
        {
          ASSET_NAMESPACE: env.__STATIC_CONTENT,
          mapRequestToAsset: serveSinglePageApp(),
        },
      );
    } catch (err) {
      if (err instanceof NotFoundError) {
        return new Response("Not found", { status: 404 });
      }
      const message = err instanceof Error ? err.message : String(err);
      return new Response(message, { status: 500 });
    }
  },
};
