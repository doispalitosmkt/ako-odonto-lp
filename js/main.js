/* AKO ODONTO — interface local. O formulário não envia nem persiste dados. */
(() => {
  "use strict";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const header = document.querySelector(".site-header");
  const menuButton = document.querySelector(".menu-toggle");
  const mobileNav = document.querySelector(".mobile-nav");
  const form = document.querySelector("#assessment-form");
  const nameInput = document.querySelector("#full-name");
  const phoneInput = document.querySelector("#phone");
  const interestInput = document.querySelector("#interest");
  const formStatus = document.querySelector(".form-status");
  const stickyCta = document.querySelector(".mobile-cta");
  const hero = document.querySelector(".hero");
  function track(event, details = {}) {
    // Nunca incluir nome, telefone ou conteúdo da mensagem no dataLayer.
    (window.dataLayer = window.dataLayer || []).push({
      event,
      page_variant: "ako_sorrisos_v2",
      ...details,
    });
  }
  function closeMenu() {
    mobileNav.hidden = true;
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Abrir menu");
    menuButton.querySelector("img").src = "assets/icons/tabler/menu-2.svg";
    document.body.classList.remove("menu-open");
  }
  menuButton.addEventListener("click", () => {
    const opening = menuButton.getAttribute("aria-expanded") !== "true";
    mobileNav.hidden = !opening;
    menuButton.setAttribute("aria-expanded", String(opening));
    menuButton.setAttribute(
      "aria-label",
      opening ? "Fechar menu" : "Abrir menu",
    );
    menuButton.querySelector("img").src = opening
      ? "assets/icons/tabler/x.svg"
      : "assets/icons/tabler/menu-2.svg";
    document.body.classList.toggle("menu-open", opening);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !mobileNav.hidden) {
      closeMenu();
      menuButton.focus();
    }
  });
  window
    .matchMedia("(min-width: 801px)")
    .addEventListener("change", (event) => {
      if (event.matches) closeMenu();
    });
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", () => {
      closeMenu();
      if (link.hash === "#avaliacao") {
        if (
          link.dataset.treatment &&
          (!interestInput.value.trim() ||
            interestInput.value === interestInput.dataset.suggestion)
        ) {
          const suggestion = `Quero saber mais sobre ${link.dataset.treatment.toLowerCase()}.`;
          interestInput.value = suggestion;
          interestInput.dataset.suggestion = suggestion;
        }
        track("avaliacao_cta_click", {
          cta_location:
            link.dataset.ctaLocation ||
            link.closest("section")?.id ||
            "navegacao",
          treatment: link.dataset.treatment || "",
        });
        window.setTimeout(
          () => nameInput.focus({ preventScroll: true }),
          reducedMotion.matches ? 0 : 600,
        );
      }
    });
  });
  document
    .querySelectorAll('a[href*="wa.me"], a[href^="tel:"]')
    .forEach((link) => {
      link.addEventListener("click", () =>
        track(
          link.href.includes("wa.me") ? "whatsapp_click" : "telefone_click",
        ),
      );
    });
  phoneInput.addEventListener("input", () => {
    const rawDigits = phoneInput.value.replace(/\D/g, "");
    const digits = (
      rawDigits.length > 11 && rawDigits.startsWith("55")
        ? rawDigits.slice(2)
        : rawDigits
    ).slice(0, 11);
    let formatted = digits;
    if (digits.length > 2) {
      const local = digits.slice(2),
        split = local.length > 8 ? 5 : 4;
      formatted = `(${digits.slice(0, 2)}) ${local.slice(0, split)}${local.length > split ? "-" + local.slice(split) : ""}`;
    } else if (digits) formatted = `(${digits}`;
    phoneInput.value = formatted;
  });
  function fieldError(input, message) {
    input.setAttribute("aria-invalid", String(Boolean(message)));
    input
      .closest(".input-wrap")
      .classList.toggle("has-error", Boolean(message));
    document.querySelector(
      `#${input === nameInput ? "name" : "phone"}-error`,
    ).textContent = message;
  }
  [nameInput, phoneInput].forEach((input) =>
    input.addEventListener("input", () => {
      if (input.getAttribute("aria-invalid") === "true") fieldError(input, "");
      formStatus.hidden = true;
    }),
  );
  interestInput.addEventListener("input", () => {
    formStatus.hidden = true;
  });
  let formStarted = false;
  form.addEventListener("focusin", () => {
    if (!formStarted) {
      formStarted = true;
      track("form_start");
    }
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    formStatus.hidden = true;
    const nameValid = nameInput.value.trim().length >= 2;
    const digits = phoneInput.value.replace(/\D/g, "");
    const phoneValid =
      /^\d{2}[2-9]\d{7,8}$/.test(digits) && !/^(\d)\1+$/.test(digits);
    fieldError(nameInput, nameValid ? "" : "Informe seu nome para continuar.");
    fieldError(
      phoneInput,
      phoneValid ? "" : "Informe um telefone válido com DDD.",
    );
    if (!nameValid || !phoneValid) {
      (!nameValid ? nameInput : phoneInput).focus({ preventScroll: true });
      document.querySelector("#avaliacao").scrollIntoView({
        behavior: reducedMotion.matches ? "instant" : "smooth",
        block: "start",
      });
      return;
    }
    // Deliberadamente sem POST, redirecionamento ou evento de conversão.
    formStatus.hidden = false;
    document.querySelector("#avaliacao").scrollIntoView({
      behavior: reducedMotion.matches ? "instant" : "smooth",
      block: "start",
    });
  });
  function updateHeader() {
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  }
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });
  if ("IntersectionObserver" in window) {
    const stickyObserver = new IntersectionObserver((entries) =>
      entries.forEach((entry) =>
        stickyCta.classList.toggle(
          "is-visible",
          !entry.isIntersecting && window.scrollY > 300,
        ),
      ),
    );
    stickyObserver.observe(hero);
    const formObserver = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            track("form_view");
            formObserver.unobserve(entry.target);
          }
        }),
      { threshold: 0.25 },
    );
    formObserver.observe(form);
    const activeObserver = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting)
            document
              .querySelectorAll(".desktop-nav a")
              .forEach((link) =>
                link.classList.toggle(
                  "is-active",
                  link.hash === "#" + entry.target.id,
                ),
              );
        }),
      { rootMargin: "-15% 0px -65% 0px" },
    );
    document
      .querySelectorAll("main section[id]")
      .forEach((section) => activeObserver.observe(section));
    if (!reducedMotion.matches) {
      document.documentElement.classList.add("motion-ready");
      const revealObserver = new IntersectionObserver(
        (entries) =>
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              revealObserver.unobserve(entry.target);
            }
          }),
        { threshold: 0.06, rootMargin: "0px 0px 35px 0px" },
      );
      document
        .querySelectorAll("[data-reveal]")
        .forEach((item) => revealObserver.observe(item));
    }
  }
  const reviewCarousel = document.querySelector("[data-review-carousel]");
  if (reviewCarousel) {
    const reviewTrack = reviewCarousel.querySelector(".review-track");
    const reviewCards = [...reviewTrack.querySelectorAll(".review-card")];
    const previousReview = reviewCarousel.querySelector("[data-review-prev]");
    const nextReview = reviewCarousel.querySelector("[data-review-next]");
    const reviewCounter = reviewCarousel.querySelector("[data-review-current]");
    const reviewProgress = reviewCarousel.querySelector(
      "[data-review-progress]",
    );
    let currentReview = -1;
    let reviewDrag = null;
    let suppressReviewClick = false;
    let reviewFramePending = false;
    function reviewIndexAtScroll() {
      const maximum = reviewTrack.scrollWidth - reviewTrack.clientWidth;
      if (reviewTrack.scrollLeft <= 1 || maximum <= 1) return 0;
      if (reviewTrack.scrollLeft >= maximum - 2) return reviewCards.length - 1;
      let closest = 0;
      reviewCards.forEach((card, index) => {
        if (
          Math.abs(card.offsetLeft - reviewTrack.scrollLeft) <
          Math.abs(reviewCards[closest].offsetLeft - reviewTrack.scrollLeft)
        )
          closest = index;
      });
      return closest;
    }
    function updateReviewControls() {
      const index = reviewIndexAtScroll();
      if (index !== currentReview) {
        currentReview = index;
        reviewCounter.textContent = String(index + 1).padStart(2, "0");
        reviewProgress.style.width = `${((index + 1) / reviewCards.length) * 100}%`;
      }
      previousReview.disabled = index === 0;
      nextReview.disabled = index === reviewCards.length - 1;
    }
    function goToReview(index) {
      const target = Math.max(0, Math.min(reviewCards.length - 1, index));
      reviewTrack.scrollTo({
        left: reviewCards[target].offsetLeft,
        behavior: reducedMotion.matches ? "auto" : "smooth",
      });
    }
    previousReview.addEventListener("click", () =>
      goToReview(currentReview - 1),
    );
    nextReview.addEventListener("click", () => goToReview(currentReview + 1));
    reviewTrack.addEventListener(
      "scroll",
      () => {
        if (reviewFramePending) return;
        reviewFramePending = true;
        window.requestAnimationFrame(() => {
          reviewFramePending = false;
          updateReviewControls();
        });
      },
      { passive: true },
    );
    reviewTrack.addEventListener("keydown", (event) => {
      if (event.target !== reviewTrack) return;
      const targets = {
        ArrowLeft: currentReview - 1,
        ArrowRight: currentReview + 1,
        Home: 0,
        End: reviewCards.length - 1,
      };
      if (!(event.key in targets)) return;
      event.preventDefault();
      goToReview(targets[event.key]);
    });
    reviewTrack.addEventListener("pointerdown", (event) => {
      if (
        !event.isPrimary ||
        event.pointerType !== "mouse" ||
        event.button !== 0
      )
        return;
      suppressReviewClick = false;
      reviewDrag = {
        id: event.pointerId,
        x: event.clientX,
        left: reviewTrack.scrollLeft,
        active: false,
      };
      if (!event.target.closest("a")) {
        event.preventDefault();
        reviewTrack.focus({ preventScroll: true });
      }
    });
    reviewTrack.addEventListener("pointermove", (event) => {
      if (!reviewDrag || event.pointerId !== reviewDrag.id) return;
      const distance = event.clientX - reviewDrag.x;
      if (!reviewDrag.active && Math.abs(distance) > 6) {
        reviewDrag.active = true;
        reviewTrack.classList.add("is-dragging");
        reviewTrack.setPointerCapture(event.pointerId);
        suppressReviewClick = true;
      }
      if (reviewDrag.active) {
        event.preventDefault();
        reviewTrack.scrollLeft = reviewDrag.left - distance;
      }
    });
    function finishReviewDrag(event) {
      if (!reviewDrag || event.pointerId !== reviewDrag.id) return;
      const moved = reviewDrag.active;
      const target = reviewIndexAtScroll();
      reviewDrag = null;
      if (reviewTrack.hasPointerCapture(event.pointerId))
        reviewTrack.releasePointerCapture(event.pointerId);
      reviewTrack.classList.remove("is-dragging");
      if (moved) goToReview(target);
    }
    reviewTrack.addEventListener("pointerup", finishReviewDrag);
    reviewTrack.addEventListener("pointercancel", finishReviewDrag);
    reviewTrack.addEventListener("lostpointercapture", finishReviewDrag);
    reviewTrack.addEventListener("dragstart", (event) =>
      event.preventDefault(),
    );
    reviewTrack.addEventListener(
      "click",
      (event) => {
        if (suppressReviewClick && event.detail > 0) {
          event.preventDefault();
          event.stopPropagation();
          suppressReviewClick = false;
        }
      },
      true,
    );
    if ("ResizeObserver" in window)
      new ResizeObserver(updateReviewControls).observe(reviewTrack);
    else window.addEventListener("resize", updateReviewControls);
    updateReviewControls();
  }
  document.querySelectorAll("[data-comparison]").forEach((comparison) => {
    const range = comparison.querySelector(".comparison-range");
    let dragPointer = null;
    function updateComparison(position) {
      const value = Math.max(0, Math.min(100, Math.round(position)));
      range.value = String(value);
      comparison.style.setProperty("--comparison-position", `${value}%`);
      range.setAttribute(
        "aria-valuetext",
        `${value}% da imagem antes e ${100 - value}% da imagem depois`,
      );
      comparison.classList.toggle("is-after-only", value === 0);
      comparison.classList.toggle("is-before-only", value === 100);
    }
    function updateFromPointer(event) {
      const bounds = comparison.getBoundingClientRect();
      if (bounds.width > 0)
        updateComparison(((event.clientX - bounds.left) / bounds.width) * 100);
    }
    range.addEventListener("input", () =>
      updateComparison(Number(range.value)),
    );
    range.addEventListener("pointerdown", (event) => {
      if (!event.isPrimary || event.button !== 0) return;
      event.preventDefault();
      range.focus({ preventScroll: true });
      dragPointer = event.pointerId;
      range.setPointerCapture(event.pointerId);
      updateFromPointer(event);
    });
    range.addEventListener("pointermove", (event) => {
      if (event.pointerId === dragPointer) updateFromPointer(event);
    });
    function stopDragging(event) {
      if (event.pointerId !== dragPointer) return;
      if (range.hasPointerCapture(event.pointerId))
        range.releasePointerCapture(event.pointerId);
      dragPointer = null;
    }
    range.addEventListener("pointerup", stopDragging);
    range.addEventListener("pointercancel", stopDragging);
    range.addEventListener("lostpointercapture", () => {
      dragPointer = null;
    });
    updateComparison(Number(range.value));
  });
  document.querySelectorAll(".faq-items details").forEach((detail) => {
    detail.addEventListener("toggle", () => {
      if (detail.open)
        document.querySelectorAll(".faq-items details").forEach((other) => {
          if (other !== detail) other.open = false;
        });
    });
  });
  const animationContainer = document.querySelector("[data-lottie]");
  if (animationContainer && window.lottie) {
    const animation = window.lottie.loadAnimation({
      container: animationContainer,
      renderer: "svg",
      loop: true,
      autoplay: false,
      path: "assets/animations/tooth.json",
    });
    animation.addEventListener("DOMLoaded", () => {
      animation.setSpeed(0.7);
      animation.goToAndStop(35, true);
      if (reducedMotion.matches) return;
      if ("IntersectionObserver" in window)
        new IntersectionObserver((entries) =>
          entries.forEach((entry) =>
            entry.isIntersecting
              ? animation.playSegments([27, 56], true)
              : animation.pause(),
          ),
        ).observe(animationContainer);
      else animation.playSegments([27, 56], true);
    });
    reducedMotion.addEventListener("change", () =>
      reducedMotion.matches
        ? animation.goToAndStop(35, true)
        : animation.play(),
    );
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) animation.pause();
    });
  }
})();
