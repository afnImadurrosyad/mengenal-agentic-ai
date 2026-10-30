# Mengenal Agentic AI dan Agentic Workflow

Materi talk kampus interaktif (bahasa Indonesia, untuk mahasiswa) tentang
produktivitas kerja dengan AI — dalam bentuk web scrollytelling, bukan deck slide.

Alurnya: **LLM → AI Workflow → AI Agent → Agentic Workflow**.

Tema visualnya mengikuti video Jeff Su yang menginspirasi materi ini:
whiteboard explainer — kertas terang bertitik, tinta hitam, aksen stabilo kuning
dan biru, bersih dan ramah pemula. Bukan tema gelap futuristik.

## Yang ada di dalamnya

- Hero dengan rantai evolusi LLM → AI Workflow → AI Agent → Agentic Workflow
- Pembuka interaktif: chip tugas berserakan yang dirapikan jadi satu alur
- Level 1 LLM: demo chat yang menunjukkan batas pasif LLM
- Level 2 AI Workflow: pipeline 4 node yang bisa dijalankan, plus simulasi
  bahan tak terduga yang membuat satu langkah macet (menunjukkan kekakuan workflow)
- Level 3 AI Agent: loop Reason → Act → Observe → Iterate yang berputar otomatis,
  plus penjelasan singkat ReAct dan RAG
- Level 4 Agentic Workflow: demo orkestrasi multi-agent (digest tugas:
  cek Moodle, cek Classroom, gabung + prioritaskan) dengan gerbang checkpoint
  manusia — tombol "Approve & kirim" harus ditekan sebelum status terkirim muncul
- Perbandingan 4 level, panduan memilih, risiko, dan tantangan penutup

## Cara menjalankan

```bash
npm install
npm run dev      # server pengembangan
npm run build    # build produksi ke dist/
npm run preview  # pratinjau hasil build
```

Stack: Vite + React, GSAP ScrollTrigger + Lenis untuk magic scroll,
CSS polos. Tidak ada backend, database, atau environment variable —
semuanya berjalan di sisi klien.

## Deploy ke GitHub Pages

Project ini sudah disiapkan untuk GitHub Pages sebagai project site:

- `vite.config.js` memakai `base: '/mengenal-agentic-ai/'`
- `.github/workflows/deploy.yml` akan, pada setiap push ke branch `main`:
  checkout → install (`npm ci`) → build (`npm run build`) → upload `dist/`
  → deploy via `actions/deploy-pages`
- Workflow ini memakai permission `pages:write`, `id-token:write`,
  dan `contents:read`, dengan concurrency group `pages`.

Di repo GitHub, aktifkan Pages dengan source **GitHub Actions**
(Settings → Pages → Build and deployment → GitHub Actions).
URL jadinya: `https://afnimadurrosyad.github.io/mengenal-agentic-ai/`
(sesuaikan nama pemilik repo bila berbeda).

Inspirasi: video Jeff Su, "AI Agents, Clearly Explained" —
https://www.youtube.com/watch?v=FwOTs4UxQS4
