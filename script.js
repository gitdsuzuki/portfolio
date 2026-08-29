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
    const deadline = Date.now() + 8000;

    const waitUntilReady = () => {
      if (window.grecaptcha && typeof window.grecaptcha.ready === "function") {
        window.grecaptcha.ready(() => {
          window.grecaptcha
            .execute(recaptchaSiteKey, { action: "contact" })
            .then(resolve)
            .catch(reject);
        });
        return;
      }

      if (Date.now() >= deadline) {
        reject(new Error("reCAPTCHA is unavailable"));
        return;
      }

      window.setTimeout(waitUntilReady, 100);
    };

    waitUntilReady();
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearStatus();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const payload = {
      name: form.elements.name.value.trim(),
      email: form.elements.email.value.trim(),
      subject: form.elements.subject.value.trim(),
      budget: form.elements.budget.value.trim(),
      message: form.elements.message.value.trim()
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
    } catch (error) {
      showStatus("error", "送信できませんでした。時間をおいて再度お試しいただくか、suzuki@suzuneko-works.com へ直接ご連絡ください。");
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = defaultButtonText;
    }
  });
})();
