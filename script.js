// =========================================================================
// MOCK DATA — replace this with a real fetch() call once the n8n webhook
// that serves cached France Travail listings exists. Shape matches (a
// simplified version of) what France Travail's API actually returns, so
// swapping this out later should be a small change, not a rewrite.
//
//   const res = await fetch("https://n8n.yourdomain.tech/webhook/jobs");
//   const jobs = await res.json();
// =========================================================================
const MOCK_JOBS = [
  {
    id: "job-001",
    title: "Administrateur Systèmes et Réseaux (H/F)",
    company: "Capgemini",
    location: "Strasbourg",
    departement: "67",
    date: "2026-10-18",
    url: "https://candidat.francetravail.fr/offres/exemple-001",
  },
  {
    id: "job-002",
    title: "Alternant DevOps Cloud",
    company: "Orange Business",
    location: "Colmar",
    departement: "68",
    date: "2026-10-17",
    url: "https://candidat.francetravail.fr/offres/exemple-002",
  },
  {
    id: "job-003",
    title: "Technicien Infrastructure IT",
    company: "CGI France",
    location: "Mulhouse",
    departement: "68",
    date: "2026-10-16",
    url: "https://candidat.francetravail.fr/offres/exemple-003",
  },
  {
    id: "job-004",
    title: "Alternant Ingénieur Cloud/DevOps",
    company: "Sopra Steria",
    location: "Strasbourg",
    departement: "67",
    date: "2026-10-15",
    url: "https://candidat.francetravail.fr/offres/exemple-004",
  },
];

// =========================================================================
// "Seen" tracking — purely client-side, stored in this browser only.
// A Set of job IDs the visitor has clicked "VOIR L'OFFRE" on before.
// =========================================================================
const SEEN_KEY = "emploi_3615_seen_jobs";

function getSeenJobs() {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch (e) {
    // localStorage can throw in private browsing / locked-down contexts —
    // fail quietly and just treat nothing as seen.
    return new Set();
  }
}

function markJobSeen(jobId) {
  try {
    const seen = getSeenJobs();
    seen.add(jobId);
    localStorage.setItem(SEEN_KEY, JSON.stringify([...seen]));
  } catch (e) {
    // Ignore — worst case, "seen" just doesn't persist this time.
  }
}

// =========================================================================
// Rendering
// =========================================================================
const jobListEl = document.getElementById("job-list");
const emptyStateEl = document.getElementById("empty-state");
const keywordInput = document.getElementById("keyword-input");
const departementInput = document.getElementById("departement-input");

function formatDate(isoDate) {
  const d = new Date(isoDate);
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }).toUpperCase();
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function jobMatchesFilters(job, keyword, departement) {
  const keywordMatch =
    !keyword ||
    job.title.toLowerCase().includes(keyword.toLowerCase()) ||
    job.company.toLowerCase().includes(keyword.toLowerCase());

  const departementMatch = !departement || job.departement === departement.trim();

  return keywordMatch && departementMatch;
}

function renderJobs(jobs) {
  const seen = getSeenJobs();
  jobListEl.innerHTML = "";

  if (jobs.length === 0) {
    emptyStateEl.hidden = false;
    return;
  }
  emptyStateEl.hidden = true;

  jobs.forEach((job, i) => {
    const isSeen = seen.has(job.id);

    const row = document.createElement("article");
    row.className = "job-row " + (isSeen ? "seen" : "unseen");

    row.innerHTML = `
      <div class="idx">${pad2(i + 1)}</div>
      <div class="content">
        <h3>${job.title}</h3>
        <p class="meta">${job.company}   ${job.location}   <span class="cyan">dépt. ${job.departement}</span>   ${formatDate(job.date)}</p>
        <a class="apply-link" href="${job.url}" target="_blank" rel="noopener" data-job-id="${job.id}">
          VOIR L'OFFRE
        </a>
      </div>
    `;

    jobListEl.appendChild(row);
  });

  // Mark as seen the moment the link is actually clicked (not just displayed)
  jobListEl.querySelectorAll(".apply-link").forEach((link) => {
    link.addEventListener("click", () => {
      markJobSeen(link.dataset.jobId);
      // Re-render shortly after so the seen state shows up without a reload.
      setTimeout(applyFilters, 150);
    });
  });
}

function applyFilters() {
  const keyword = keywordInput.value;
  const departement = departementInput.value;
  const filtered = MOCK_JOBS.filter((job) => jobMatchesFilters(job, keyword, departement));
  renderJobs(filtered);
}

document.getElementById("filter-btn").addEventListener("click", applyFilters);
document.getElementById("reset-btn").addEventListener("click", () => {
  keywordInput.value = "";
  departementInput.value = "";
  applyFilters();
});

// Filter live as you type, not just on button click
keywordInput.addEventListener("input", applyFilters);
departementInput.addEventListener("input", applyFilters);

// Initial render
renderJobs(MOCK_JOBS);

// =========================================================================
// Signup form — currently just logs locally. Once the n8n "subscribe"
// webhook exists, replace the TODO block below with a real POST:
//
//   await fetch("https://n8n.yourdomain.tech/webhook/subscribe", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ email, keywords, departements }),
//   });
// =========================================================================
const signupForm = document.getElementById("signup-form");
const signupFeedback = document.getElementById("signup-feedback");

signupForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.getElementById("signup-email").value;
  const keywords = document.getElementById("signup-keywords").value;
  const departements = document.getElementById("signup-departement").value;

  // --- TODO: replace with the real fetch() to the n8n webhook ---
  console.log("Signup (mock):", { email, keywords, departements });
  // ---------------------------------------------------------------

  signupFeedback.hidden = false;
  signupFeedback.textContent = "Inscription enregistrée (mode démo — pas encore connecté à l'envoi d'emails réel).";
  signupForm.reset();
});