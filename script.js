const WEDDING_DATETIME = "2027-02-01T09:00:00";
const INSIDE_MUSIC_DELAY = 3000;
const AUTO_SCROLL_DELAY = 2000;
const AUTO_SCROLL_SPEED = 1.4;
const API_URL = "https://wedding-invitation-i26z.onrender.com";

const urlParams = new URLSearchParams(window.location.search);
const recipient = (urlParams.get("to") || "Phụng").trim();

const recipientName = document.getElementById("recipientName");
if (recipientName) recipientName.textContent = recipient;

const cover = document.getElementById("cover");
const openBtn = document.getElementById("openInvite");
const coverMusic = document.getElementById("coverMusic");
const openMusic = document.getElementById("openMusic");
const insideMusic = document.getElementById("insideMusic");
const musicToggle = document.getElementById("musicToggle");

let invitationOpened = false;
let insideMusicStarted = false;
let autoScrollActive = false;
let autoScrollStarted = false;
let autoScrollTimer = null;
let userInteracting = false;
let lastTouchTime = 0;

function stopAllMusic() {
  [coverMusic, openMusic, insideMusic].forEach((audio) => {
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
  });
}

function setMusicButtonPlaying(isPlaying) {
  if (!musicToggle) return;
  musicToggle.classList.toggle("is-playing", isPlaying);
  musicToggle.setAttribute("aria-pressed", String(isPlaying));
}

function playCoverMusic() {
  if (invitationOpened || !coverMusic) return;

  coverMusic.volume = 0.75;
  coverMusic.muted = true;

  const promise = coverMusic.play();
  if (promise) promise.catch(() => {});
}

window.addEventListener("load", playCoverMusic);

function startInsideMusic() {
  if (insideMusicStarted || !insideMusic) return;

  insideMusicStarted = true;
  insideMusic.currentTime = 0;
  insideMusic.volume = 0;

  const promise = insideMusic.play();

  if (!promise) return;

  promise
    .then(() => {
      setMusicButtonPlaying(true);

      setTimeout(() => {
        const targetVolume = 0.8;
        const duration = 1000;
        const startTime = performance.now();

        function fadeIn(currentTime) {
          const progress = Math.min((currentTime - startTime) / duration, 1);

          insideMusic.volume = targetVolume * progress;

          if (progress < 1) {
            requestAnimationFrame(fadeIn);
          }
        }

        requestAnimationFrame(fadeIn);
      }, INSIDE_MUSIC_DELAY);
    })
    .catch(() => {
      insideMusicStarted = false;
      setMusicButtonPlaying(false);
    });
}

if (openBtn) {
  openBtn.addEventListener(
    "click",
    () => {
      if (invitationOpened) return;

      invitationOpened = true;

      if (coverMusic) {
        coverMusic.pause();
        coverMusic.currentTime = 0;
      }

      startInsideMusic();

      if (openMusic) {
        openMusic.currentTime = 0;
        openMusic.volume = 0.05;

        const promise = openMusic.play();
        if (promise) promise.catch(() => {});
      }

      cover.classList.add("is-open");
      document.body.style.overflow = "";

      setTimeout(() => {
        if (openMusic) {
          openMusic.pause();
          openMusic.currentTime = 0;
        }
      }, INSIDE_MUSIC_DELAY);

      setTimeout(() => {
        cover.style.display = "none";
      }, 1200);

      startAutoScrollAfterDelay();
    },
    { once: true },
  );
}

document.body.style.overflow = "hidden";

function startAutoScroll() {
  if (autoScrollActive) return;

  autoScrollActive = true;

  function scroll() {
    if (!autoScrollActive) return;

    window.scrollBy(0, AUTO_SCROLL_SPEED);
    requestAnimationFrame(scroll);
  }

  requestAnimationFrame(scroll);
}

function stopAutoScroll() {
  autoScrollActive = false;
}

function toggleAutoScroll() {
  if (!autoScrollStarted) return;

  if (autoScrollActive) {
    stopAutoScroll();
  } else {
    startAutoScroll();
  }
}

function startAutoScrollAfterDelay() {
  clearTimeout(autoScrollTimer);

  autoScrollTimer = setTimeout(() => {
    autoScrollStarted = true;
    startAutoScroll();
  }, AUTO_SCROLL_DELAY);
}

window.addEventListener(
  "wheel",
  () => {
    if (!autoScrollStarted) return;

    userInteracting = true;
    stopAutoScroll();
  },
  { passive: true },
);

window.addEventListener(
  "touchstart",
  () => {
    if (!autoScrollStarted) return;
    lastTouchTime = Date.now();
  },
  { passive: true },
);

window.addEventListener(
  "touchmove",
  () => {
    if (!autoScrollStarted) return;

    userInteracting = true;
    lastTouchTime = Date.now();
    stopAutoScroll();
  },
  { passive: true },
);

window.addEventListener(
  "touchend",
  () => {
    if (!autoScrollStarted) return;
    lastTouchTime = Date.now();
  },
  { passive: true },
);

window.addEventListener("pointerdown", (e) => {
  if (!autoScrollStarted) return;

  if (
    e.target.closest(
      "button, a, input, textarea, select, .gallery__item, .lightbox",
    )
  ) {
    return;
  }

  const now = Date.now();

  if (now - lastTouchTime < 500) return;

  if (userInteracting) {
    toggleAutoScroll();
    userInteracting = false;
  }
});

window.addEventListener("keydown", (e) => {
  if (!autoScrollStarted) return;

  const scrollKeys = [
    "ArrowDown",
    "ArrowUp",
    "PageDown",
    "PageUp",
    " ",
    "Home",
    "End",
  ];

  if (scrollKeys.includes(e.key)) {
    stopAutoScroll();
    userInteracting = true;
  }
});

(function scatterPetals() {
  const wrap = document.querySelector(".cover__petals");

  if (!wrap) return;

  const count = 16;

  for (let i = 0; i < count; i++) {
    const p = document.createElement("span");

    p.style.left = Math.random() * 100 + "%";
    p.style.animationDuration = 6 + Math.random() * 6 + "s";
    p.style.animationDelay = Math.random() * 6 + "s";
    p.style.opacity = 0.35 + Math.random() * 0.4;

    wrap.appendChild(p);
  }
})();

const revealItems = document.querySelectorAll("[data-reveal]");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 },
);

revealItems.forEach((el) => {
  revealObserver.observe(el);
});

const galleryItems = Array.from(document.querySelectorAll(".gallery__item"));

const moreCount = document.querySelector(".gallery__more-count");

if (moreCount) {
  const visiblePhotoCount = 3;
  const extraPhotoCount = galleryItems.length - visiblePhotoCount;
  moreCount.textContent = `+${extraPhotoCount}`;
}

const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxCount = document.getElementById("lightboxCount");
const lightboxClose = document.getElementById("lightboxClose");
const lightboxPrev = document.getElementById("lightboxPrev");
const lightboxNext = document.getElementById("lightboxNext");

let currentPhoto = 0;

function openLightbox(index) {
  if (!galleryItems.length || !lightbox) return;

  currentPhoto = index;
  updateLightbox();

  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");

  stopAutoScroll();
}

function closeLightbox() {
  if (!lightbox) return;

  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
}

function updateLightbox() {
  if (!galleryItems.length || !lightboxImage || !lightboxCount) return;

  const item = galleryItems[currentPhoto];
  const img = item.querySelector("img");

  if (!img) return;

  lightboxImage.src = img.src;
  lightboxImage.alt = img.alt;
  lightboxCount.textContent = `${currentPhoto + 1} / ${galleryItems.length}`;
}

function stepPhoto(delta) {
  if (!galleryItems.length) return;

  currentPhoto =
    (currentPhoto + delta + galleryItems.length) % galleryItems.length;

  updateLightbox();
}

galleryItems.forEach((btn, index) => {
  btn.addEventListener("click", () => {
    openLightbox(index);
  });
});

if (lightboxClose) {
  lightboxClose.addEventListener("click", closeLightbox);
}

if (lightboxPrev) {
  lightboxPrev.addEventListener("click", () => {
    stepPhoto(-1);
  });
}

if (lightboxNext) {
  lightboxNext.addEventListener("click", () => {
    stepPhoto(1);
  });
}

if (lightbox) {
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });
}

document.addEventListener("keydown", (e) => {
  if (!lightbox || !lightbox.classList.contains("is-open")) return;

  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowLeft") stepPhoto(-1);
  if (e.key === "ArrowRight") stepPhoto(1);
});

const target = new Date(WEDDING_DATETIME).getTime();

const cdDays = document.getElementById("cdDays");
const cdHours = document.getElementById("cdHours");
const cdMinutes = document.getElementById("cdMinutes");
const cdSeconds = document.getElementById("cdSeconds");

const pad = (n) => String(n).padStart(2, "0");

function tickCountdown() {
  const diff = target - Date.now();

  if (diff <= 0) {
    cdDays.textContent = "00";
    cdHours.textContent = "00";
    cdMinutes.textContent = "00";
    cdSeconds.textContent = "00";
    return;
  }

  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);

  cdDays.textContent = pad(d);
  cdHours.textContent = pad(h);
  cdMinutes.textContent = pad(m);
  cdSeconds.textContent = pad(s);
}

tickCountdown();
setInterval(tickCountdown, 1000);

function toGCalStamp(isoLocal) {
  return isoLocal.replace(/[-:]/g, "");
}

document.querySelectorAll("[data-cal]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const title = encodeURIComponent(btn.dataset.calTitle);
    const loc = encodeURIComponent(btn.dataset.calLoc);
    const start = toGCalStamp(btn.dataset.calStart);
    const end = toGCalStamp(btn.dataset.calEnd);

    const url =
      `https://calendar.google.com/calendar/render` +
      `?action=TEMPLATE` +
      `&text=${title}` +
      `&dates=${start}/${end}` +
      `&location=${loc}`;

    window.open(url, "_blank", "noopener");
  });
});

const wishForm = document.getElementById("wishForm");
const wishList = document.getElementById("wishList");
const nameInput = document.getElementById("wishName");
const messageInput = document.getElementById("wishMessage");

function createWishElement(wish) {
  const li = document.createElement("li");
  li.className = "wish-card";

  const head = document.createElement("div");
  head.className = "wish-card__head";

  const name = document.createElement("span");
  name.className = "wish-card__name";
  name.textContent = wish.name;

  const time = document.createElement("span");
  time.className = "wish-card__time";

  if (wish.createdAt) {
    const date = new Date(wish.createdAt);
    time.textContent = date.toLocaleString("vi-VN");
  } else {
    time.textContent = "Vừa xong";
  }

  const message = document.createElement("p");
  message.className = "wish-card__text";
  message.textContent = wish.message;

  head.appendChild(name);
  head.appendChild(time);
  li.appendChild(head);
  li.appendChild(message);

  return li;
}

async function loadWishes() {
  try {
    const response = await fetch(`${API_URL}/${encodeURIComponent(recipient)}`);

    if (!response.ok) {
      throw new Error("Không thể lấy lời chúc");
    }

    const wishes = await response.json();

    wishList.innerHTML = "";

    wishes.forEach((wish) => {
      wishList.appendChild(createWishElement(wish));
    });
  } catch (error) {
    console.error("Lỗi lấy lời chúc:", error);
  }
}

if (wishForm) {
  wishForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = nameInput.value.trim();
    const message = messageInput.value.trim();

    if (!name || !message) return;

    const submitButton = wishForm.querySelector('button[type="submit"]');

    try {
      submitButton.disabled = true;
      submitButton.textContent = "Đang gửi...";

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipient,
          name,
          message,
        }),
      });

      if (!response.ok) {
        throw new Error("Không thể gửi lời chúc");
      }

      const data = await response.json();

      wishList.prepend(createWishElement(data.wish));
      wishForm.reset();
    } catch (error) {
      console.error("Lỗi gửi lời chúc:", error);
      alert("Không thể gửi lời chúc. Vui lòng thử lại.");
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Gửi Lời Chúc";
    }
  });

  loadWishes();
}

if (musicToggle) {
  musicToggle.addEventListener("click", () => {
    if (!insideMusicStarted || !insideMusic) return;

    if (insideMusic.paused) {
      insideMusic
        .play()
        .then(() => {
          setMusicButtonPlaying(true);
        })
        .catch(() => {
          setMusicButtonPlaying(false);
        });
    } else {
      insideMusic.pause();
      setMusicButtonPlaying(false);
    }
  });
}

window.addEventListener("beforeunload", () => {
  clearTimeout(autoScrollTimer);
  stopAutoScroll();
  stopAllMusic();
});
