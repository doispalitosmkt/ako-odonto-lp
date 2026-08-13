# AKO ODONTO — Landing Page Geral 2026

Landing page institucional/de conversão da **AKO ODONTO**, clínica odontológica tradicional há +30 anos na Zona Leste de São Paulo (Itaquera / Guaianases).

Página estática, rápida e mobile-first, voltada a tráfego pago, com CTA principal em WhatsApp.

## Stack

- HTML + CSS + JavaScript **vanilla** (sem build step, sem dependências de runtime)
- Fontes auto-hospedadas (Fraunces + Plus Jakarta Sans, `woff2`)
- Google Tag Manager para mensuração
- Marcação `schema.org/Dentist` para SEO local

## Estrutura

```
index.html          # a landing page
css/                # estilos (design system + seções)
js/                 # interações e animações
assets/img/         # imagens
assets/fonts/       # fontes woff2
```

## Rodar localmente

Não precisa instalar nada além de um servidor estático. Com Python:

```bash
python3 -m http.server 5173
```

Depois abra `http://localhost:5173`.

## Deploy

Qualquer hospedagem de site estático (GitHub Pages, Netlify, Vercel, Cloudflare Pages). Basta servir o conteúdo desta pasta.

---

Desenvolvido por **[Dois Palitos MKT](https://doispalitosmkt.com.br)** para a AKO ODONTO.
