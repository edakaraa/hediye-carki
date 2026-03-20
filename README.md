# 🎁 AI Hediye Çarkı

Kişiye özel bilgileri gir, çarkı çevir — yapay zeka en iyi hediyeyi bulsun.

**[Canlı Demo →](https://hediye-carki.netlify.app)**

## Nasıl Çalışır?

1. Hediye alacağın kişinin **yaş, cinsiyet, ilgi alanları, bütçe ve vesile** bilgilerini seç
2. **Çarkı çevir** — rastgele bir hediye kategorisi belirlenir
3. Anthropic Claude AI, girilen bilgilere göre **5 kişiselleştirilmiş hediye önerisi** sunar

## Teknolojiler

- **Frontend:** Vanilla HTML/CSS/JS
- **Backend:** Netlify Functions (Serverless)
- **AI:** Anthropic Claude API
- **Deploy:** Netlify

## Kurulum

### 1. Repoyu klonla

```bash
git clone https://github.com/KULLANICI_ADIN/hediye-carki.git
cd hediye-carki
```

### 2. Netlify'a deploy et

- [Netlify](https://app.netlify.com) üzerinden GitHub reposunu bağla
- **Site configuration → Environment variables** kısmına şu değişkeni ekle:

| Key | Value |
|-----|-------|
| `ANTHROPIC_API_KEY` | Anthropic API anahtarın (`sk-ant-...`) |

API anahtarını [console.anthropic.com](https://console.anthropic.com) adresinden alabilirsin.

### 3. Deploy et

GitHub'a her push yaptığında Netlify otomatik olarak deploy eder.

## Proje Yapısı

```
hediye-carki/
├── index.html                  # Ana sayfa (frontend)
├── netlify.toml                # Netlify yapılandırması
├── package.json                # Proje bilgileri
└── netlify/
    └── functions/
        └── suggest.js          # Serverless API (Claude entegrasyonu)
```

## Lisans

MIT
