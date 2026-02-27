// 1. MOBILE MENU TOGGLE
      const menuBtn = document.getElementById("mobile-menu-btn");
      const mobileMenu = document.getElementById("mobile-menu");

      if (menuBtn && mobileMenu) {
        menuBtn.addEventListener("click", () => {
          mobileMenu.classList.toggle("is-open");
        });
      }

      // 2. BACK TO TOP BUTTON
      const backToTopBtn = document.getElementById("backToTopBtn");
      window.addEventListener("scroll", () => {
        if (window.scrollY > 400) {
          backToTopBtn.classList.add("is-visible");
        } else {
          backToTopBtn.classList.remove("is-visible");
        }
      });
      backToTopBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });

      // 3. SMOOTH SCROLLING (handles #top and closes mobile menu)
      document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", function (e) {
          e.preventDefault();
          const targetId = this.getAttribute("href");

          // Close mobile menu if open
          if (mobileMenu.classList.contains("is-open")) {
            mobileMenu.classList.remove("is-open");
          }

          if (targetId === "#top") {
            window.scrollTo({ top: 0, behavior: "smooth" });
          } else {
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
              targetSection.scrollIntoView({ behavior: "smooth" });
            }
          }
        });
      });

      // 4. TRACKING SIMULATION (production API)
      const API_BASE = "http://localhost:9090";

      const trackBtn = document.getElementById("trackBtn");
      const trackingInput = document.getElementById("trackingInput");
      const trackResult = document.getElementById("trackResult");
      const trackTimeline = document.getElementById("trackTimeline");

      // Timeline dots (5-step)
      const stepDots = [
        document.getElementById("step1Dot"),
        document.getElementById("step2Dot"),
        document.getElementById("step3Dot"),
        document.getElementById("step4Dot"),
        document.getElementById("step5Dot"),
      ];

      // Timeline styling helpers
      function setStepDone(dot) {
        if (!dot) return;
        dot.className = "step-dot step-dot--done";
        dot.textContent = "✓";
      }

      function setStepCurrent(dot, n) {
        if (!dot) return;
        dot.className = "step-dot step-dot--active";
        dot.textContent = String(n);
      }

      function setStepPending(dot, n) {
        if (!dot) return;
        dot.className = "step-dot step-dot--pending";
        dot.textContent = String(n);
      }

      // Map backend status -> current step (1..5)
      function getCurrentStepFromStatus(status) {
        const s = (status || "").toLowerCase();
        if (s.includes("book")) return 1;
        if (s.includes("depart")) return 2;
        if (s.includes("transit")) return 3;
        if (s.includes("customs")) return 4;
        if (s.includes("deliver")) return 5;
        return 3; // safe fallback
      }

      function renderTimeline(status) {
        const current = getCurrentStepFromStatus(status);
        for (let i = 1; i <= 5; i++) {
          const dot = stepDots[i - 1];
          if (!dot) continue;
          if (i < current) setStepDone(dot);
          else if (i === current) setStepCurrent(dot, i);
          else setStepPending(dot, i);
        }
      }

      async function handleTrack() {
        const ref = trackingInput.value.trim();

        // Reset UI
        trackResult.classList.remove("is-visible");
        trackResult.innerHTML = "";
        if (trackTimeline) trackTimeline.classList.remove("is-visible");

        if (!ref) {
          trackResult.classList.add("is-visible");
          trackResult.innerHTML =
            '<div class="alert alert--warning">Please enter a tracking reference.</div>';
          return;
        }

        // Loading state
        trackResult.classList.add("is-visible");
        trackResult.innerHTML =
          '<div class="alert alert--info">Loading shipment details...</div>';

        try {
          const res = await fetch(
            `${API_BASE}/api/track/${encodeURIComponent(ref)}`,
            { cache: "no-store" },
          );

          const data = await res.json();

          if (!res.ok) {
            trackResult.innerHTML = `<div class="alert alert--error">${data.message || "Shipment not found."}</div>`;
            return;
          }

          // Success
          const t = data.data;
          document.getElementById("shipmentStatusText").innerText = t.status;
          renderTimeline(t.status);

          trackResult.innerHTML = `
            <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px">
              <div>
                <div style="font-weight:600;color:var(--color-text)">Shipment ${t.ref || ref}</div>
                <div style="margin-top:4px;font-size:0.875rem;color:var(--color-text-muted)">Last update: ${t.updated_at || "-"}</div>
              </div>
              <span style="display:inline-flex;align-items:center;padding:4px 12px;border-radius:9999px;font-size:0.75rem;font-weight:600;background:var(--color-gold-light);color:var(--color-navy);border:1px solid var(--color-gold)">${t.status}</span>
            </div>
            <div style="margin-top:16px;display:grid;gap:8px;font-size:0.875rem">
              <div><span style="font-weight:600">Origin:</span> ${t.origin || "-"}</div>
              <div><span style="font-weight:600">Destination:</span> ${t.destination || "-"}</div>
              <div><span style="font-weight:600">ETA:</span> ${t.eta || "-"}</div>
            </div>
          `;

          if (trackTimeline) trackTimeline.classList.add("is-visible");
        } catch (err) {
          console.error(err);
          trackResult.classList.add("is-visible");
          trackResult.innerHTML =
            '<div class="alert alert--error">Network error. Please try again.</div>';
        }
      }

      // Bind tracking button (prevent duplicate)
      if (!window.__trackBound) {
        window.__trackBound = true;
        trackBtn.addEventListener("click", handleTrack);
      }

      // 5. CONTACT FORM SIMULATION
      const contactBtn = document.querySelector("#contact button");
      const contactInputs = document.querySelectorAll(
        "#contact input, #contact textarea",
      );

      if (contactBtn) {
        contactBtn.addEventListener("click", function () {
          let valid = true;
          contactInputs.forEach((i) => {
            if (!i.value) valid = false;
          });

          if (!valid) {
            alert("Please fill in all fields.");
            return;
          }

          this.innerText = "SENDING...";
          setTimeout(() => {
            this.innerText = "MESSAGE SENT ✓";
            this.classList.remove("btn-dark");
            this.classList.add("btn-primary");
            alert("Request received! We will contact you shortly.");
            contactInputs.forEach((i) => (i.value = ""));
            setTimeout(() => {
              this.innerText = "SEND MESSAGE";
              this.classList.remove("btn-primary");
              this.classList.add("btn-dark");
            }, 3000);
          }, 1000);
        });
      }