(() => {
  "use strict";

  const header = document.getElementById("site-header");
  const menuButton = document.getElementById("menu-toggle");
  const navigation = document.getElementById("site-nav");
  const year = document.getElementById("current-year");

  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  if (header) {
    const updateHeader = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 12);
    };

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
  }

  if (menuButton && navigation) {
    const isMenuOpen = () => menuButton.getAttribute("aria-expanded") === "true";
    const menuLinks = Array.from(navigation.querySelectorAll("a"));

    const closeMenu = (restoreFocus = false) => {
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "メニューを開く");
      navigation.classList.remove("is-open");
      document.body.classList.remove("menu-open");

      if (restoreFocus) {
        menuButton.focus();
      }
    };

    const openMenu = () => {
      menuButton.setAttribute("aria-expanded", "true");
      menuButton.setAttribute("aria-label", "メニューを閉じる");
      navigation.classList.add("is-open");
      document.body.classList.add("menu-open");

      if (menuLinks[0]) {
        menuLinks[0].focus();
      }
    };

    menuButton.addEventListener("click", () => {
      if (isMenuOpen()) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    menuLinks.forEach((link) => {
      link.addEventListener("click", () => closeMenu());
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && isMenuOpen()) {
        closeMenu(true);
        return;
      }

      if (event.key === "Tab" && isMenuOpen()) {
        const focusableItems = [menuButton, ...menuLinks];
        const firstItem = focusableItems[0];
        const lastItem = focusableItems[focusableItems.length - 1];

        if (event.shiftKey && document.activeElement === firstItem) {
          event.preventDefault();
          lastItem.focus();
        } else if (!event.shiftKey && document.activeElement === lastItem) {
          event.preventDefault();
          firstItem.focus();
        }
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 780) {
        closeMenu();
      }
    });
  }

  const trackEvent = (eventName, parameters = {}) => {
    if (typeof window.gtag === "function") {
      try {
        window.gtag("event", eventName, parameters);
      } catch (_) {
        // Analytics must never interrupt navigation or an accepted inquiry.
      }
    }
  };

  document.querySelectorAll("a[data-track]").forEach((link) => {
    link.addEventListener("click", () => {
      const eventName = link.dataset.track;
      if (eventName === "resource_download") {
        trackEvent(eventName, { resource_name: link.dataset.resource });
      } else if (eventName === "training_consultation_click") {
        trackEvent(eventName, { page_type: document.querySelector("form[data-kind='training']") ? "training" : "learning" });
      }
    });
  });

  const form = document.getElementById("contact-form");
  const status = document.getElementById("form-status");
  const submitButton = document.getElementById("form-submit-btn");

  if (!form || !status || !submitButton) {
    return;
  }

  const endpoint = "https://script.google.com/macros/s/AKfycbzXtSUlLGOPS_rRAF9vD6ffvBR4D7z-tPLMZfiXEC0WAQtOQPis73Pvq4lG-VyP14mj/exec";
  const recaptchaSiteKey = "6LdiObcsAAAAAOc2ZND68FfgRgDd2CHNwrod0RjC";
  const defaultButtonText = submitButton.textContent;

  const showStatus = (type, message) => {
    status.className = `form-status is-visible is-${type}`;
    status.textContent = message;
  };

  const clearStatus = () => {
    status.className = "form-status";
    status.textContent = "";
  };

  const getRecaptchaToken = () => new Promise((resolve, reject) => {
    let finished = false;
    let pollTimer;
    const finish = (error, token) => {
      if (finished) return;
      finished = true;
      window.clearTimeout(timeout);
      window.clearTimeout(pollTimer);
      if (error) reject(error);
      else resolve(token);
    };
    const timeout = window.setTimeout(() => finish(new Error("reCAPTCHA timed out")), 8000);

    const waitUntilReady = () => {
      if (finished) return;
      if (window.grecaptcha && typeof window.grecaptcha.ready === "function") {
        try {
          window.grecaptcha.ready(() => {
            if (finished) return;
            Promise.resolve().then(() => window.grecaptcha.execute(recaptchaSiteKey, { action: "contact" }))
              .then((token) => token ? finish(null, token) : finish(new Error("Empty reCAPTCHA token")))
              .catch((error) => finish(error));
          });
        } catch (error) {
          finish(error);
        }
        return;
      }
      pollTimer = window.setTimeout(waitUntilReady, 100);
    };

    waitUntilReady();
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (submitButton.disabled) return;
    clearStatus();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const value = (fieldName) => form.elements.namedItem(fieldName)?.value.trim() || "";
    const payload = {
      name: value("name"),
      email: value("email"),
      subject: value("subject"),
      budget: value("budget"),
      message: value("message")
    };

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(payload.email)) {
      showStatus("error", "メールアドレスの形式をご確認ください。");
      return;
    }

    if (!payload.name || !payload.subject || !payload.message) {
      showStatus("error", "必須項目をご入力ください。");
      return;
    }

    const isTraining = form.dataset.kind === "training";
    if (isTraining) {
      if (["company", "audience", "participants", "timing"].some((field) => !value(field))) {
        showStatus("error", "会社名・受講対象・人数・希望時期をご入力ください。未定の場合は「未定」とご記入いただけます。");
        return;
      }
      payload.subject = `法人研修相談：${payload.subject}`;
      // Keep the existing Apps Script contract; include all training fields in message.
      payload.message = [
        `会社名：${value("company")}`,
        `受講対象：${value("audience")}`,
        `人数：${value("participants")}`,
        `希望時期：${value("timing")}`,
        `最初に知ったきっかけ：${value("discovery") || "未回答"}`,
        `相談の決め手：${value("decision") || "未回答"}`,
        "受付ページ：法人研修",
        "", "【困っていること・相談内容】", payload.message
      ].join("\n");
    }

    submitButton.disabled = true;
    submitButton.textContent = "送信しています…";

    try {
      payload.recaptchaToken = await getRecaptchaToken();

      const response = await fetch(endpoint, {
        method: "POST",
        redirect: "follow",
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      if (result.status !== "ok") {
        throw new Error(result.message || "Submission failed");
      }

      form.reset();
      showStatus("success", "お問い合わせを受け付けました。内容を確認のうえ、ご入力のメールアドレスへご連絡します。");
      if (isTraining) trackEvent("training_inquiry_submitted", { page_type: "training" });
    } catch (error) {
      showStatus("error", "送信できませんでした。時間をおいて再度お試しいただくか、suzuki@suzuneko-works.com へ直接ご連絡ください。");
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = defaultButtonText;
    }
  });
})();
