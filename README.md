# AKO ODONTO — Onepage

Página estática em HTML, CSS e JavaScript, com hero editorial, formulário de avaliação, quatro tratamentos em destaque, catálogo dos 13 serviços com fotografias ilustrativas, antes e depois com quatro casos reais, fachada, história da Dra. Elza Nara, carrossel de depoimentos e seção de localização com mapa.

## Prévia local

Na pasta do projeto:

```powershell
python -m http.server 5173 --bind 127.0.0.1
```

Abra http://127.0.0.1:5173/. Não há instalação de dependências nem etapa de build.

Prévia pública: https://doispalitosmkt.github.io/ako-odonto-preview/ . O repositório `ako-odonto-preview` serve apenas para revisão pelo GitHub Pages; o código principal está em `doispalitosmkt/ako-odonto-lp`.

## Compartilhamento social

Open Graph e Twitter Card usam uma imagem 1200 × 630 px criada a partir da fotografia real da Dra. Elza com o bebê. A URL da imagem aponta para a prévia pública, permitindo que as redes a carreguem antes da publicação no domínio definitivo. Na publicação final, esse endereço poderá ser trocado pelo mesmo arquivo em `akoodonto.com`.

## Formulário

Apenas interface, máscara de telefone e validação local. Não envia dados, não gera conversão de lead e não redireciona automaticamente. A integração com WhatsApp, RD Station ou ambos será definida depois pelo usuário. Ao tentar enviar dados válidos, a interface informa a indisponibilidade do agendamento e permite contato manual com a clínica.

Dados pessoais não são salvos em storage nem incluídos nos eventos de interface enviados ao dataLayer. O Google Tag Manager original permanece configurado para a versão pública; nas prévias em localhost e GitHub Pages, fica inativo para os testes não entrarem na medição da clínica.

## Interações

- Menu e navegação por âncoras, incluindo menu mobile com fechamento por Escape.
- Tratamentos encaminham ao formulário, sugerindo o assunto sem apagar texto escrito pelo visitante.
- Catálogo completo em três grupos de serviços, com 13 fotografias ilustrativas em WebP e carregamento sob demanda.
- Carrossel com 15 trechos de avaliações reais do Google e links individuais para a fonte. Mostra um cartão e metade do próximo, com arraste, botões, contador e navegação por setas, Home e End; sem reprodução automática.
- Comparadores de antes e depois independentes, com arraste, teclado e foco visível. Quatro casos reais da AKO; dois pares novos fornecidos pelo usuário foram convertidos para WebP sem retoque, e os outros dois pares permanecem nas fotografias originais.
- FAQ em acordeão.
- CTA de avaliação fixo no celular depois do hero.
- Animação Lottie de dente, local, pausada fora de tela e compatível com redução de movimento.
- Links de localização, avaliações, Instagram, telefone e contato manual.
- Mapa incorporado do Google, estações de acesso, bairros atendidos e link para abrir a rota até a clínica. O mapa carrega sob demanda ao se aproximar da seção; endereço e link de rota permanecem visíveis sem ele.
- Crédito do rodapé com “2P Growth Lab” em VT323, carregada localmente com licença OFL.

Fontes e arquivos de interface são auto-hospedados. As imagens de uso são WebP, exceto dois pares originais de antes e depois em JPG. Consulte [assets/CREDITS.md](assets/CREDITS.md) para origens, licenças e créditos. A verificação visual e funcional está documentada no relatório local `design-qa.md`, mantido fora do GitHub conforme a política existente do projeto.
