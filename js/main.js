/* =============================================================
   AKO ODONTO — LP Geral 2026 · interações, motion e tracking
   Vanilla JS, sem dependências.
   ============================================================= */
(function () {
  'use strict';

  var PAGE_VARIANT = 'trust_first_v1';
  var ATTRIBUTION_KEY = 'ako_attribution_v1';
  var CLICK_ID_KEYS = ['gclid', 'gbraid', 'wbraid', 'fbclid', 'msclkid', 'ttclid'];
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var dataLayer = (window.dataLayer = window.dataLayer || []);

  document.documentElement.setAttribute('data-page-variant', PAGE_VARIANT);

  /*
   * Observação operacional: o Meta Pixel duplicado está configurado no
   * container remoto do GTM. Sem acesso ao GTM, essa duplicidade não pode ser
   * corrigida com segurança neste código local.
   */

  /* ---------- 1. Atribuição: somente UTMs e IDs de clique permitidos ---------- */
  function isAllowedAttributionKey(key) {
    return key.indexOf('utm_') === 0 || CLICK_ID_KEYS.indexOf(key) !== -1;
  }

  function sanitizeAttribution(value) {
    var clean = {};
    if (!value || typeof value !== 'object' || Array.isArray(value)) return clean;

    Object.keys(value).forEach(function (rawKey) {
      var key = String(rawKey).toLowerCase();
      var item = value[rawKey];
      if (!isAllowedAttributionKey(key) || typeof item !== 'string') return;
      if (item) clean[key] = item.slice(0, 500);
    });

    return clean;
  }

  function readStoredAttribution() {
    try {
      return sanitizeAttribution(JSON.parse(window.sessionStorage.getItem(ATTRIBUTION_KEY) || '{}'));
    } catch (err) {
      return {};
    }
  }

  function readUrlAttribution() {
    var current = {};
    try {
      new URLSearchParams(window.location.search).forEach(function (value, rawKey) {
        var key = String(rawKey).toLowerCase();
        if (isAllowedAttributionKey(key) && value) current[key] = value.slice(0, 500);
      });
    } catch (err) {
      return current;
    }
    return current;
  }

  function captureAttribution() {
    var stored = readStoredAttribution();
    var current = readUrlAttribution();
    var merged = Object.assign({}, stored, current);

    try {
      window.sessionStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(merged));
    } catch (err) {
      // Tracking continua funcionando quando o storage estiver indisponível.
    }

    return merged;
  }

  var attribution = captureAttribution();

  function commonEventFields(ctaType, ctaLocation) {
    var fields = {
      page_variant: PAGE_VARIANT,
      cta_type: ctaType || 'nao_aplicavel',
      cta_location: ctaLocation || 'nao_aplicavel',
      attribution: Object.assign({}, attribution)
    };

    // Mantém a atribuição também no nível raiz para facilitar variáveis do GTM.
    Object.keys(attribution).forEach(function (key) {
      fields[key] = attribution[key];
    });

    return fields;
  }

  function pushEvent(eventName, details) {
    dataLayer.push(Object.assign(
      { event: eventName },
      commonEventFields(
        details && details.cta_type,
        details && details.cta_location
      ),
      details || {}
    ));
  }

  pushEvent('lp_view', {
    cta_type: 'nao_aplicavel',
    cta_location: 'page'
  });

  /* ---------- 1.1. Skip link: leva rolagem e foco ao conteúdo principal ---------- */
  var skipLink = document.querySelector('.skip-link');
  var mainContent = document.getElementById ? document.getElementById('conteudo') : null;
  if (skipLink && mainContent) {
    skipLink.addEventListener('click', function () {
      window.setTimeout(function () {
        mainContent.focus({ preventScroll: true });
      }, 0);
    });
  }

  /* ---------- 2. WhatsApp: mensagem contextual + código da variante ---------- */
  var WA_BASE = 'https://wa.me/5511966385267?text=';
  var ORIGIN_WA_CODES = {
    header: '[AKO-TF1-HEADER]',
    hero: '[AKO-TF1-HERO]',
    sintoma: '[AKO-TF1-SERVICOS]',
    servicos: '[AKO-TF1-SERVICOS]',
    medo: '[AKO-TF1-MEDO]',
    resultados: '[AKO-TF1-RESULTADOS]',
    localizacao: '[AKO-TF1-LOCAL]',
    cta_final: '[AKO-TF1-FINAL]',
    final: '[AKO-TF1-FINAL]',
    footer: '[AKO-TF1-FOOTER]',
    sticky_mobile: '[AKO-TF1-FINAL]'
  };

  function fallbackWaCode(el) {
    var origin = el.getAttribute('data-origin') || '';
    if (ORIGIN_WA_CODES[origin]) return ORIGIN_WA_CODES[origin];
    if (origin.indexOf('servico') === 0) return ORIGIN_WA_CODES.servicos;
    if (origin.indexOf('sintoma') === 0) return ORIGIN_WA_CODES.sintoma;
    return '[AKO-TF1-GERAL]';
  }

  function currentWaMessage(el) {
    var explicitMessage = el.getAttribute('data-wa-msg');
    if (explicitMessage) return explicitMessage;

    try {
      return new URL(el.getAttribute('href'), window.location.href).searchParams.get('text') || '';
    } catch (err) {
      return '';
    }
  }

  document.querySelectorAll('a[href*="wa.me/"], [data-wa-msg], [data-wa-code]').forEach(function (el) {
    var msg = currentWaMessage(el);
    var messageCode = msg.match(/^\[AKO-[^\]]+\]/);
    var code = el.getAttribute('data-wa-code') ||
      (messageCode ? messageCode[0] : fallbackWaCode(el));
    var codedMessage = msg.indexOf(code) === 0 ? msg : (code + (msg ? ' ' + msg : ''));

    el.setAttribute('data-wa-code', code);
    el.setAttribute('href', WA_BASE + encodeURIComponent(codedMessage));
  });

  /* ---------- 3. Tracking de CTAs + preservação dos eventos legados ---------- */
  function nearestSectionKey(el) {
    var section = el.closest ? el.closest('section') : null;
    if (!section) return 'page';
    return section.getAttribute('data-track-section') ||
      section.getAttribute('data-section') ||
      section.id ||
      'secao';
  }

  function ctaTypeFor(el) {
    var explicit = el.getAttribute('data-cta-type');
    var legacy = el.getAttribute('data-gtm') || '';
    var href = el.getAttribute('href') || '';
    if (explicit) return explicit;
    if (legacy === 'whatsapp_click' || href.indexOf('wa.me/') !== -1) return 'whatsapp';
    if (legacy === 'telefone_click' || href.indexOf('tel:') === 0) return 'telefone';
    if (legacy === 'agendar_online') return 'agendamento_online';
    if (href.charAt(0) === '#') return 'navegacao_interna';
    return legacy || 'link';
  }

  function ctaLocationFor(el) {
    var explicit = el.getAttribute('data-cta-location');
    var origin = el.getAttribute('data-origin') || '';
    if (explicit) return explicit;
    if (origin.indexOf('servico') === 0) return 'servicos';
    if (origin.indexOf('sintoma') === 0) return 'sintomas';
    return origin || nearestSectionKey(el);
  }

  // Privacidade: os eventos abaixo usam somente metadados fixos. Nunca leem
  // campos digitados, texto de sintomas, data-wa-msg ou a URL de destino.
  document.querySelectorAll('[data-gtm], [data-cta-type], a.btn, a.service-card__cta, a.symptom, a.header-phone').forEach(function (el) {
    el.addEventListener('click', function () {
      var ctaType = ctaTypeFor(el);
      var ctaLocation = ctaLocationFor(el);
      var legacyEvent = el.getAttribute('data-gtm');

      pushEvent('cta_click', {
        cta_type: ctaType,
        cta_location: ctaLocation
      });

      if (legacyEvent) {
        pushEvent(legacyEvent, {
          origem: el.getAttribute('data-origin') || 'nao_informado',
          cta_type: ctaType,
          cta_location: ctaLocation
        });
      }
    });
  });

  /* ---------- 4. Visualização de seção: uma vez por seção ---------- */
  var sections = Array.prototype.slice.call(document.querySelectorAll('main section'));
  var viewedSections = {};

  function sectionKey(section, index) {
    var raw = section.getAttribute('data-track-section') ||
      section.getAttribute('data-section') ||
      section.id ||
      section.getAttribute('aria-labelledby') ||
      ('secao_' + (index + 1));
    return String(raw).trim().replace(/[^a-zA-Z0-9_-]+/g, '_').toLowerCase();
  }

  function trackSection(section) {
    var index = sections.indexOf(section);
    var key = sectionKey(section, index);
    if (viewedSections[key]) return;
    viewedSections[key] = true;
    pushEvent('section_view', {
      section_id: key,
      section_position: index + 1,
      cta_type: 'nao_aplicavel',
      cta_location: key
    });
  }

  if (sections.length && 'IntersectionObserver' in window) {
    var sectionObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        trackSection(entry.target);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -12% 0px' });
    sections.forEach(function (section) { sectionObserver.observe(section); });
  } else {
    sections.forEach(trackSection);
  }

  /* ---------- 5. Header: estado ao rolar ---------- */
  var header = document.getElementById('site-header');
  var onScrollHeader = function () {
    if (!header) return;
    if (window.scrollY > 40) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
  };
  onScrollHeader();
  window.addEventListener('scroll', onScrollHeader, { passive: true });

  /* ---------- 6. Sticky CTA mobile: aparece depois do hero ---------- */
  var mobileCta = document.getElementById('mobile-cta');
  var hero = document.getElementById('topo');
  if (mobileCta && hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        mobileCta.classList.toggle('is-visible', !entry.isIntersecting);
      });
    }, { rootMargin: '-60% 0px 0px 0px' }).observe(hero);
  } else if (mobileCta) {
    mobileCta.classList.add('is-visible');
  }

  /* ---------- 7. Reveal on-scroll (com stagger) ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));

  // Define delay em stagger conforme a posição entre irmãos que também têm reveal.
  revealEls.forEach(function (el) {
    var parent = el.parentElement;
    if (!parent) return;
    var sibs = Array.prototype.filter.call(parent.children, function (child) {
      return child.hasAttribute('data-reveal');
    });
    if (sibs.length > 1) {
      var index = sibs.indexOf(el);
      el.style.transitionDelay = Math.min(index * 80, 480) + 'ms';
    }
  });

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var revObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { revObserver.observe(el); });

    // Rede de segurança: se o IO não disparar (ex.: aba em background que não
    // compõe frames), revela tudo para nunca deixar conteúdo preso invisível.
    window.addEventListener('load', function () {
      window.setTimeout(function () {
        var stuck = revealEls.some(function (el) {
          var rect = el.getBoundingClientRect();
          var inView = rect.top < window.innerHeight && rect.bottom > 0;
          return inView && !el.classList.contains('is-visible');
        });
        if (stuck) revealEls.forEach(function (el) { el.classList.add('is-visible'); });
      }, 1400);
    });
  }

  /* ---------- 8. Contadores animados ---------- */
  var counters = Array.prototype.slice.call(document.querySelectorAll('[data-count]'));

  function formatNum(number) {
    return Math.round(number).toLocaleString('pt-BR');
  }

  function animateCounter(el) {
    var target = parseFloat(el.getAttribute('data-count')) || 0;
    if (reduceMotion) {
      el.textContent = formatNum(target);
      return;
    }
    var duration = 1600;
    var start = null;
    function tick(timestamp) {
      if (start === null) start = timestamp;
      var progress = Math.min((timestamp - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = formatNum(target * eased);
      if (progress < 1) window.requestAnimationFrame(tick);
      else el.textContent = formatNum(target);
    }
    window.requestAnimationFrame(tick);
  }

  if (counters.length) {
    if (!('IntersectionObserver' in window)) {
      counters.forEach(animateCounter);
    } else {
      var countObserver = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.6 });
      counters.forEach(function (el) { countObserver.observe(el); });
    }
  }

  /* ---------- 9. FAQ: rastreia abertura e fecha os demais ---------- */
  var faqItems = Array.prototype.slice.call(document.querySelectorAll('.faq__item'));
  faqItems.forEach(function (item, index) {
    item.addEventListener('toggle', function () {
      if (!item.open) return;

      pushEvent('faq_open', {
        faq_id: item.getAttribute('data-faq-id') || item.id || ('faq_' + (index + 1)),
        faq_position: index + 1,
        cta_type: 'faq',
        cta_location: 'faq'
      });

      faqItems.forEach(function (other) {
        if (other !== item) other.open = false;
      });
    });
  });
})();
