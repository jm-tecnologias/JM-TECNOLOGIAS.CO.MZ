(function () {
  "use strict";

  /* ---- Hero background slider ---- */
  window.addEventListener("load", function () {
    var heroSlides = document.querySelectorAll(".hero-slide");
    if (heroSlides.length > 1) {
      var heroIndex = 0;
      setInterval(function () {
        heroSlides[heroIndex].classList.remove("active");
        heroIndex = (heroIndex + 1) % heroSlides.length;
        heroSlides[heroIndex].classList.add("active");
      }, 4500);
    }

    var showcaseScreens = document.querySelectorAll(".hero-showcase-screen");
    if (showcaseScreens.length > 1) {
      var showcaseIndex = 0;
      setInterval(function () {
        showcaseScreens[showcaseIndex].classList.remove("active");
        showcaseIndex = (showcaseIndex + 1) % showcaseScreens.length;
        showcaseScreens[showcaseIndex].classList.add("active");
      }, 3400);
    }
  });

  /* ---- Mobile nav: fechar com ESC ---- */
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && document.body.classList.contains("mobile-nav-active")) {
      var toggle = document.querySelector(".mobile-nav-toggle");
      if (toggle) toggle.click();
    }
  });

  /* ---- Mobile nav: fechar ao clicar fora ---- */
  document.addEventListener("click", function (event) {
    var body = document.body;
    var nav = document.querySelector("#navmenu ul");
    var toggle = document.querySelector(".mobile-nav-toggle");
    if (!body.classList.contains("mobile-nav-active") || !nav || !toggle) return;
    if (!nav.contains(event.target) && !toggle.contains(event.target)) {
      toggle.click();
    }
  });

  /* ---- Formulário de contacto profissional ---- */
  var contactForm = document.getElementById("jm-contact-form");
  if (contactForm) {
    var statusEl = document.getElementById("jm-form-status");
    var submitBtn = contactForm.querySelector(".btn-submit");
    var submitText = submitBtn ? submitBtn.querySelector(".btn-text") : null;
    var submitIcon = submitBtn ? submitBtn.querySelector("i") : null;
    var successModal = document.getElementById("jm-success-modal");
    var successModalCloseButtons = successModal ? successModal.querySelectorAll("[data-close-success-modal]") : [];
    var consentField = contactForm.querySelector("#form-consent");
    var replyToField = contactForm.querySelector('input[name="_replyto"]');
    var urlField = contactForm.querySelector('input[name="_url"]');
    var nextField = contactForm.querySelector('input[name="_next"]');
    var emailField = contactForm.querySelector('#f-email');

    function setButtonState(isLoading) {
      if (!submitBtn) return;
      submitBtn.disabled = !!isLoading;
      if (submitText) submitText.textContent = isLoading ? "A enviar…" : "Enviar mensagem";
      if (submitIcon) submitIcon.className = isLoading ? "bi bi-hourglass-split" : "bi bi-send";
    }

    function openSuccessModal() {
      if (!successModal) return;
      successModal.classList.add("is-visible");
      successModal.setAttribute("aria-hidden", "false");
      document.body.classList.add("jm-modal-open");
    }

    function closeSuccessModal() {
      if (!successModal) return;
      successModal.classList.remove("is-visible");
      successModal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("jm-modal-open");
    }

    if (successModalCloseButtons.length) {
      successModalCloseButtons.forEach(function (btn) {
        btn.addEventListener("click", closeSuccessModal);
      });
    }

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && successModal && successModal.classList.contains("is-visible")) {
        closeSuccessModal();
      }
    });

    function showStatus(type, msg) {
      if (!statusEl) return;
      statusEl.className = "jm-form-status " + type;
      var icon = type === "success" ? "bi-check-circle" : type === "loading" ? "bi-arrow-repeat" : "bi-exclamation-triangle";
      statusEl.innerHTML = '<i class="bi ' + icon + '"></i><span>' + msg + '</span>';
      if (type === "loading") {
        statusEl.classList.add("is-loading");
      }
    }

    function clearStatus() {
      if (!statusEl) return;
      statusEl.className = "jm-form-status";
      statusEl.innerHTML = "";
    }

    function resetFieldState(field) {
      field.classList.remove("is-invalid");
      field.classList.remove("is-valid");
    }

    function validateField(field) {
      var value = (field.value || "").trim();
      var valid = true;
      var minLength = field.getAttribute("minlength");

      if (field.required && !value) {
        valid = false;
      } else if (field.type === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        valid = false;
      } else if (field.type === "tel" && value && !/^[\d\s\+\-\(\)]{6,}$/.test(value)) {
        valid = false;
      } else if (minLength && value && value.length < parseInt(minLength, 10)) {
        valid = false;
      }

      field.classList.toggle("is-invalid", !valid);
      field.classList.toggle("is-valid", valid && !!value);
      return valid;
    }

    contactForm.querySelectorAll(".form-control").forEach(function (field) {
      field.addEventListener("blur", function () {
        validateField(field);
      });
      field.addEventListener("input", function () {
        validateField(field);
        if (field === emailField && replyToField) {
          replyToField.value = field.value.trim();
        }
      });
      field.addEventListener("change", function () {
        validateField(field);
      });
    });

    if (consentField) {
      consentField.addEventListener("change", function () {
        var wrap = consentField.closest(".form-check");
        if (wrap) wrap.classList.toggle("is-invalid", !consentField.checked);
        if (consentField.checked) clearStatus();
      });
    }

    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      clearStatus();

      var fields = contactForm.querySelectorAll(".form-control");
      var allValid = true;
      var firstInvalidField = null;

      fields.forEach(function (field) {
        if (!validateField(field)) {
          allValid = false;
          if (!firstInvalidField) firstInvalidField = field;
        }
      });

      var consentWrap = consentField ? consentField.closest(".form-check") : null;
      if (consentField && !consentField.checked) {
        if (consentWrap) consentWrap.classList.add("is-invalid");
        allValid = false;
        if (!firstInvalidField) firstInvalidField = consentField;
      } else if (consentWrap) {
        consentWrap.classList.remove("is-invalid");
      }

      if (!allValid) {
        showStatus("error", "Por favor corrija os campos assinalados antes de enviar.");
        if (firstInvalidField && typeof firstInvalidField.focus === "function") firstInvalidField.focus();
        return;
      }

      var currentPage = window.location.origin + window.location.pathname;
      if (replyToField && emailField) replyToField.value = emailField.value.trim();
      if (urlField) urlField.value = currentPage;
      if (nextField) nextField.value = currentPage + "?sent=1";

      setButtonState(true);
      showStatus("loading", "A enviar a sua mensagem...");

      var formData = new FormData(contactForm);
      formData.set("_replyto", emailField ? emailField.value.trim() : "");
      formData.set("_url", currentPage);
      formData.set("_next", currentPage + "?sent=1");

      fetch(contactForm.action, {
        method: "POST",
        body: formData,
        headers: {
          "Accept": "application/json"
        }
      })
        .then(function (response) {
          return response.json().catch(function () {
            return { success: response.ok };
          }).then(function (data) {
            return { ok: response.ok, data: data };
          });
        })
        .then(function (result) {
          if (!result.ok || result.data.success === false) {
            throw new Error((result.data && (result.data.message || result.data.error)) || "Falha no envio.");
          }

          contactForm.reset();
          contactForm.querySelectorAll(".form-control").forEach(function (field) {
            resetFieldState(field);
          });
          if (consentWrap) consentWrap.classList.remove("is-invalid");
          clearStatus();
          openSuccessModal();
        })
        .catch(function () {
          showStatus("error", "Ocorreu um erro ao enviar. Por favor tente novamente ou contacte-nos directamente.");
        })
        .finally(function () {
          setButtonState(false);
        });
    });
  }

})();

/* ---- Floating actions: evitar sobreposição agressiva com o footer ---- */
window.addEventListener("load", function () {
  var footer = document.getElementById("footer");
  if (!footer || !("IntersectionObserver" in window)) return;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      document.body.classList.toggle("footer-in-view", entry.isIntersecting);
    });
  }, {
    threshold: 0.18
  });

  observer.observe(footer);
});
