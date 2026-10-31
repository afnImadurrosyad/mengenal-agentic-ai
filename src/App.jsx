import { useEffect, useRef, useState } from 'react'

const SLIDES = [
  'Judul', 'Video pembuka', 'Tren: komputasi', 'Tren: kemampuan', 'Tren: investasi', 'Apa Itu LLM?', 'Apa itu LLM', 'Diagram LLM', 'Batasan LLM',
  'Apa Itu AI Workflow?', 'Level 2 · AI Workflow', 'Diagram Workflow Kalender', 'Batasan Workflow', 'RAG',
  'Contoh Workflow Konten', 'Apa Itu AI Agent?', 'Level 3 · AI Agent', 'Agent: Reason + Act', 'ReAct + Iterasi',
  'Ringkasan 3 Level', 'Apa Itu Agentic Workflow?', 'Level 4 · Agentic Workflow', 'Demo Agentic Workflow',
  'Perbandingan', 'Panduan memilih', 'Risiko', 'Penutup',
]

const loopNames = ['REASON', 'ACT', 'OBSERVE', 'ITERATE']
const loopSubs = ['Pikirkan cara terbaik', 'Pakai tools', 'Amati hasilnya', 'Perbaiki / ulangi']
const n8nNodes = [
  { icon: '⏰', name: 'Schedule Trigger', sub: 'Setiap hari 08.00', step: 1, kind: 'trigger', detail: 'Pemicu workflow ini.', settings: [['Pemicu', 'Setiap hari'], ['Jam', '08.00'], ['Mode', 'Otomatis (bukan manual)']] },
  { icon: '📊', name: 'Google Sheets', sub: 'Kumpulkan tautan', step: 2, detail: 'Mengumpulkan bahan dari Sheets.', settings: [['Aksi', 'Baca baris'], ['Dokumen', 'Daftar tautan artikel berita']], sheet: [['AI agents are changing how teams work', 'example.com/artikel-1', 'Baru'], ['How LLMs reason step by step', 'example.com/artikel-2', 'Baru'], ['Agentic workflows, explained simply', 'example.com/artikel-3', 'Baru']] },
  { icon: '🔍', name: 'Perplexity', sub: 'Rangkum artikel', step: 3, detail: 'Meringkas bahan sebelum ditulis.', settings: [['Aksi', 'Ringkas artikel'], ['Input', 'Tautan dari Google Sheets']], rules: ['Ringkas tiap artikel jadi 3 poin utama.', 'Fokus pada hal yang baru & relevan untuk audiens profesional.', 'Jangan tambah opini di luar isi artikel.'], output: 'Contoh output: “Artikel 1 — (1) Agent kini bisa memakai tools sendiri, (2) alurnya masih butuh pengawasan manusia, (3) dampak terbesar di tugas berulang.”' },
  { icon: '✍️', name: 'Claude', sub: 'Draf prompt custom', step: 4, detail: 'Menulis draf dengan prompt yang diatur manusia.', settings: [['Model', 'Claude'], ['Input', 'Ringkasan dari Perplexity']], rules: ['Gaya: profesional tapi santai, bukan kaku.', 'Satu ide utama per postingan.', 'Akhiri dengan ajakan diskusi.', 'Panjang: 2–3 paragraf pendek.'], output: 'Contoh output (draf): “Agent AI bukan lagi sekadar chatbot — ia bisa menjalankan tugas lewat tools. Menurutmu, tugas apa yang paling layak didelegasikan duluan?”' },
  { icon: '💼', name: 'LinkedIn', sub: 'Draf postingan', step: 5, detail: 'Hasil akhir untuk LinkedIn.', settings: [['Aksi', 'Buat draf postingan'], ['Input', 'Draf dari Claude'], ['Status', 'Draf — siap diperiksa, bukan langsung terbit']], output: 'Draf LinkedIn siap diperiksa (dari draf Claude di atas).' },
  { icon: '📸', name: 'Instagram', sub: 'Draf postingan', step: 5, detail: 'Hasil akhir untuk Instagram.', settings: [['Aksi', 'Buat draf postingan'], ['Input', 'Draf dari Claude'], ['Status', 'Draf — siap diperiksa, bukan langsung terbit']], output: 'Draf Instagram siap diperiksa (dari draf Claude di atas).' },
]
const reactVersions = [
  { t: 'Draf v1', d: 'Masih datar, belum terasa khas.' },
  { t: 'Kritik oleh LLM lain', d: 'Pembuka kurang kuat, contoh kurang konkret.' },
  { t: 'Revisi', d: 'Diperbaiki dari kritik itu.' },
  { t: 'Output final', d: 'Versi teroptimasi.' },
]

export default function App() {
  const [idx, setIdx] = useState(() => {
    const n = parseInt((window.location.hash || '').replace('#', ''), 10)
    return Number.isFinite(n) && n >= 1 && n <= SLIDES.length ? n - 1 : 0
  })
  // Demo states are deliberately separate per slide: no shared pipe state.
  const [emailShown, setEmailShown] = useState(false)
  const [calPhase, setCalPhase] = useState(0) // 0 idle, 1 query, 2 found, 3 answer
  const [weatherAsked, setWeatherAsked] = useState(false)
  const [contentStep, setContentStep] = useState(0) // 0 idle, 1 trigger, 2 sheets, 3 perplexity, 4 claude, 5 outputs
  const [contentRunning, setContentRunning] = useState(false)
  const [contentDetail, setContentDetail] = useState(null)
  const [reactVer, setReactVer] = useState(0)
  const [loopIdx, setLoopIdx] = useState(0)
  const [turn, setTurn] = useState(1)
  const [loopEpoch, setLoopEpoch] = useState(0)
  const [agents, setAgents] = useState(0) // 0 idle, 1 running, 2 done
  const [sent, setSent] = useState(false)
  const [choice, setChoice] = useState(null)
  const calTimers = useRef([])
  const contentTimers = useRef([])

  const next = () => setIdx((v) => Math.min(SLIDES.length - 1, v + 1))
  const prev = () => setIdx((v) => Math.max(0, v - 1))

  useEffect(() => {
    window.history.replaceState(null, '', `#${idx + 1}`)
  }, [idx])

  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || (e.key === ' ' && tag !== 'BUTTON')) { e.preventDefault(); next() }
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); prev() }
      if (e.key === 'Home') setIdx(0)
      if (e.key === 'End') setIdx(SLIDES.length - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    const t = setInterval(() => {
      setLoopIdx((v) => {
        if (v === 3) setTurn((n) => n + 1)
        return (v + 1) % 4
      })
    }, 1400)
    return () => clearInterval(t)
  }, [loopEpoch])

  useEffect(() => () => {
    calTimers.current.forEach(clearTimeout)
    contentTimers.current.forEach(clearTimeout)
  }, [])

  const runCalendar = () => {
    calTimers.current.forEach(clearTimeout)
    setCalPhase(1)
    calTimers.current = [
      setTimeout(() => setCalPhase(2), 1000),
      setTimeout(() => setCalPhase(3), 2000),
    ]
  }
  const resetCalendar = () => {
    calTimers.current.forEach(clearTimeout)
    calTimers.current = []
    setCalPhase(0)
  }
  const runContent = () => {
    contentTimers.current.forEach(clearTimeout)
    setContentDetail(null)
    setContentRunning(true)
    setContentStep(1)
    contentTimers.current = [2, 3, 4, 5].map((n, i) => setTimeout(() => {
      setContentStep(n)
      if (n === 5) setContentRunning(false)
    }, 800 * (i + 1)))
  }
  const resetContent = () => {
    contentTimers.current.forEach(clearTimeout)
    contentTimers.current = []
    setContentRunning(false)
    setContentDetail(null)
    setContentStep(0)
  }
  const resetReact = () => {
    setReactVer(0)
    setLoopIdx(0)
    setTurn(1)
    setLoopEpoch((e) => e + 1)
  }
  const runAgents = () => {
    setAgents(1); setSent(false)
    setTimeout(() => setAgents(2), 1800)
  }
  const resetDigest = () => { setAgents(0); setSent(false) }

  const calStatus = calPhase === 0
    ? 'Tanya dulu ke kalender, bukan menebak.'
    : calPhase === 1
      ? 'Search Query dikirim ke Google Calendar…'
      : calPhase === 2
        ? 'Kalender menjawab: coffee chat tanggal 31.'
        : 'Output: coffee chat tanggal 31 — dari data, bukan hafalan.'

  return (
    <div className="deck">
      <div className="topbar"><i style={{ width: `${((idx + 1) / SLIDES.length) * 100}%` }} /></div>

      <main className="slide" aria-label={`Slide ${idx + 1}: ${SLIDES[idx]}`}>
        <div className="slide-inner" key={idx}>
          {idx === 0 && (
            <>
              <p className="kicker">Materi Itera Career Day</p>
              <h1>Mengenal <span className="hl">Agentic AI</span> dan Agentic Workflow <span className="hand">untuk produktivitas kerja</span></h1>
              <p className="lead">LLM → AI Workflow → AI Agent → Agentic Workflow</p>
              <p className="identity">Afnan Imadurrosyad — 124140125 — Informatika, Institut Teknologi Sumatera</p>
            </>
          )}

          {idx === 1 && (
            <>
              <p className="kicker">Video pembuka · 18 detik</p>
              <h2>Tonton dulu: AI, dijelaskan singkat.</h2>
              <video className="video-frame" controls preload="metadata" src={`${import.meta.env.BASE_URL}video-opening.mp4`} title="Jeff Su — AI Agents, Clearly Explained (0:00–0:18)"></video>
              <p className="small">Sumber: Jeff Su, “AI Agents, Clearly Explained” — klip pembuka 0:00–0:18, berakhir di layar hitam. Video lokal, bukan embed.</p>
            </>
          )}

          {idx === 2 && (
            <>
              <p className="kicker">Tren AI · 8 dekade</p>
              <h2>Komputasi pelatihan AI terus melesat.</h2>
              <img className="trend-img" src={`${import.meta.env.BASE_URL}trend-compute.webp`} alt="Grafik Our World in Data: komputasi pelatihan sistem AI selama 8 dekade" />
              <p className="small">Sumber: Our World in Data, “The brief history of AI” — data Sevilla et al. (CC BY).</p>
            </>
          )}

          {idx === 3 && (
            <>
              <p className="kicker">Tren AI · Kemampuan vs manusia</p>
              <h2>AI menyusul manusia di berbagai tes.</h2>
              <img className="trend-img" src={`${import.meta.env.BASE_URL}trend-capabilities.png`} alt="Grafik Our World in Data: skor tes kemampuan AI relatif terhadap performa manusia" />
              <p className="small">Sumber: Our World in Data, “The brief history of AI” (CC BY).</p>
            </>
          )}

          {idx === 4 && (
            <>
              <p className="kicker">Tren AI · Investasi korporat</p>
              <h2>Investasi AI melonjak sejak 2018.</h2>
              <img className="trend-img" src={`${import.meta.env.BASE_URL}trend-investment.png`} alt="Grafik Our World in Data: investasi korporat di AI menurut jenisnya" />
              <p className="small">Sumber: Our World in Data, Max Roser (2023), “AI investments” (CC BY).</p>
            </>
          )}

          {idx === 5 && (
            <div className="q-slide">
              <p className="kicker">Topik berikutnya</p>
              <h2>Apa Itu LLM?</h2>
            </div>
          )}

          {idx === 6 && (
            <>
              <p className="kicker">Level 1 · Apa itu LLM?</p>
              <h2>LLM adalah <span className="hl">fondasi</span> chatbot.</h2>
              <ul className="points">
                <li>Dilatih dari teks dalam jumlah sangat besar.</li>
                <li>ChatGPT, Gemini, Claude = aplikasi di atas LLM, bukan LLM itu sendiri.</li>
                <li>Kuat: menulis, menyunting, meringkas, menjelaskan.</li>
              </ul>
            </>
          )}

          {idx === 7 && (
            <>
              <p className="kicker">Level 1 · Diagram LLM</p>
              <h2>Input → LLM → Output.</h2>
              <div className="dark-diagram">
                <div className="diag-row">
                  <span className="diag-label">Input</span><span className="diag-arrow">→</span>
                  <div className="llm-box">LLM</div><span className="diag-arrow">→</span><span className="diag-label">Output</span>
                </div>
                <p className="diag-text">Input: “Buatkan draf email untuk mengajak coffee chat.”</p>
                {emailShown ? <img className="email-photo" src={`${import.meta.env.BASE_URL}coffee-chat-email.png`} alt="Screenshot draf email coffee chat" /> : <p className="diag-text">Output: — (tekan tombol untuk melihat hasilnya)</p>}
              </div>
              <button className="btn" onClick={() => setEmailShown(!emailShown)}>{emailShown ? 'Ulangi demo' : 'Ubah input jadi email →'}</button>
            </>
          )}

          {idx === 8 && (
            <>
              <p className="kicker">Level 1 · Batasan LLM</p>
              <h2>Dua batas yang <span className="hl">penting.</span></h2>
              <ul className="points">
                <li>Pasif — menunggu perintah, lalu menjawab.</li>
                <li>Tidak tahu data pribadimu: kalender, data internal, dokumenmu.</li>
                <li>Contoh: “Kapan coffee chat-ku?” → gagal, ia tak bisa membuka kalendermu.</li>
              </ul>
              <img className="email-photo" src={`${import.meta.env.BASE_URL}coffee-chat-fail.png`} alt="Screenshot jawaban LLM saat ditanya kapan coffee chat diadakan" />
            </>
          )}

          {idx === 9 && (
            <div className="q-slide">
              <p className="kicker">Topik berikutnya</p>
              <h2>Apa Itu AI Workflow?</h2>
            </div>
          )}

          {idx === 10 && (
            <>
              <p className="kicker">Level 2 · AI Workflow</p>
              <h2>LLM + <span className="hl">jalur yang sudah ditentukan.</span></h2>
              <ul className="points">
                <li>LLM dirangkai dengan informasi dan perkakas dari luar.</li>
                <li>Control Logic ditulis manusia: langkah, alat, urutan.</li>
                <li>Manusia tetap pengambil keputusan.</li>
              </ul>
            </>
          )}

          {idx === 11 && (
            <>
              <p className="kicker">Level 2 · Diagram Workflow Kalender</p>
              <h2>LLM yang bisa <span className="hl">bertanya ke kalender.</span></h2>
              <div className="dark-diagram compact">
                <div className="diag-row">
                  <span className="diag-label">Input</span><span className="diag-arrow">→</span>
                  <div className="llm-box">LLM</div><span className="diag-arrow">→</span><span className="diag-label">Output</span>
                </div>
                <div className="diag-down">
                  <span className="search-label">Search Query</span>
                  <span className="down-arrow">↓</span>
                </div>
                <div className="cal-wrap">
                  <div className="cal-tile" aria-label="Google Calendar">
                    <div className="cal-white"><span>31</span></div>
                    <div className="cal-yellow" />
                    <div className="cal-green" />
                    <div className="cal-red" />
                  </div>
                  <span className="cal-name">Google Calendar</span>
                </div>
                <p className="diag-status">{calStatus}</p>
              </div>
              <button className="btn" onClick={runCalendar} disabled={calPhase !== 0}>Tanya: kapan coffee chat-ku berikutnya?</button>{' '}
              <button className="btn" onClick={resetCalendar}>Ulangi demo</button>
            </>
          )}

          {idx === 12 && (
            <>
              <p className="kicker">Level 2 · Batasan Workflow</p>
              <h2>Jalur sama, <span className="hl">pertanyaan berbeda.</span></h2>
              <div className="dark-diagram compact">
                <div className="diag-row">
                  <span className="diag-label">Input: cuaca hari itu?</span><span className="diag-arrow">→</span>
                  <div className="llm-box">LLM</div><span className="diag-arrow">→</span><span className="diag-label">Output: ?</span>
                </div>
                <div className="diag-down">
                  <span className="search-label">Search Query → hanya ke kalender</span>
                  <span className="down-arrow">↓</span>
                </div>
                <div className="cal-wrap" style={{ marginTop: 6 }}>
                  <div className="cal-tile">
                    <div className="cal-white"><span>31</span></div>
                    <div className="cal-yellow" /><div className="cal-green" /><div className="cal-red" />
                    {weatherAsked && <span className="big-x" aria-label="Tidak ada data cuaca">✕</span>}
                  </div>
                  <span className="cal-name">Google Calendar</span>
                  {weatherAsked && <span style={{ color: '#f87171', fontWeight: 800, fontSize: 13 }}>✕ Tidak ada data cuaca di jalur ini</span>}
                </div>
                <p className="diag-status" style={{ textAlign: 'center' }}>{weatherAsked ? 'Gagal: jalur ini hanya ke kalender. Kalender tahu tanggal, bukan cuaca.' : 'Tekan tombolnya untuk melihat apa yang terjadi.'}</p>
              </div>
              <button className="btn" onClick={() => setWeatherAsked(true)} disabled={weatherAsked}>Tanya cuaca hari itu</button>{' '}
              <button className="btn" onClick={() => setWeatherAsked(false)}>Ulangi demo</button>
            </>
          )}

          {idx === 13 && (
            <>
              <p className="kicker">Level 2 · RAG</p>
              <h2>RAG: <span className="hl">mencari dulu, baru menjawab.</span></h2>
              <ul className="points">
                <li>Sebelum menjawab, model mengambil informasi yang relevan.</li>
                <li>Sumbernya: kalender, layanan cuaca, dokumen yang diizinkan.</li>
                <li>RAG = salah satu bentuk AI workflow — jalurnya tetap ditentukan manusia.</li>
              </ul>
            </>
          )}

          {idx === 14 && (
            <>
              <p className="kicker">Level 2 · Contoh nyata: Workflow Konten</p>
              <h2>Konten harian, <span className="hl">tanpa menulis dari nol.</span></h2>
              {contentDetail === null && (
              <ul className="n8n-points hide-m">
                <li>Contoh nyata ala Helena Liu — workflow konten harian.</li>
                <li>Jalur sudah ditentukan manusia, bukan diputuskan agent.</li>
              </ul>
              )}
              <div className="n8n-canvas">
                <div className="n8n-top"><span>● workflow-konten</span><span className="n8n-active">● Active</span></div>
                <div className="n8n-chain">
                  <div className="n8n-main">
                    {n8nNodes.slice(0, 4).map((n, i) => {
                      const st = contentStep === n.step ? 'on' : contentStep > n.step ? 'done' : ''
                      return (
                        <span key={n.name} style={{ display: 'contents' }}>
                          <button type="button" className={`n8n-node ${n.kind === 'trigger' ? 'trigger' : ''} ${st} ${contentDetail === i ? 'selected' : ''}`} onClick={() => setContentDetail(i)} aria-label={`${n.name}: ${n.sub}`}>
                            <span className="n8n-icon">{n.icon}</span>
                            <span className="n8n-name">{n.name}</span>
                            <span className="n8n-sub">{n.sub}</span>
                            <span className={`n8n-status ${st}`}>{st === 'done' ? '✓ Selesai' : st === 'on' ? '● Jalan' : '○ Siap'}</span>
                          </button>
                          {i < 3 && <span className="n8n-arrow">→</span>}
                        </span>
                      )
                    })}
                  </div>
                  <span className="n8n-arrow">→</span>
                  <div className="n8n-branch">
                    {n8nNodes.slice(4).map((n, i) => {
                      const st = contentStep === 5 ? 'done' : ''
                      return (
                        <button key={n.name} type="button" className={`n8n-node ${st} ${contentDetail === 4 + i ? 'selected' : ''}`} onClick={() => setContentDetail(4 + i)} aria-label={`${n.name}: ${n.sub}`}>
                          <span className="n8n-icon">{n.icon}</span>
                          <span className="n8n-name">{n.name}</span>
                          <span className="n8n-sub">{n.sub}</span>
                          <span className={`n8n-status ${st}`}>{st === 'done' ? '✓ Selesai' : '○ Siap'}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
                {contentDetail !== null && (
                  <div className="n8n-detail-card">
                    <div className="n8n-detail-head"><span>{n8nNodes[contentDetail].icon} <strong>{n8nNodes[contentDetail].name}</strong> <span className="small">— {n8nNodes[contentDetail].detail}</span></span><button type="button" className="n8n-close" onClick={() => setContentDetail(null)} aria-label="Tutup detail">✕</button></div>
                    {n8nNodes[contentDetail].settings.map(([k, v]) => (
                      <div className="n8n-setting" key={k}><span>{k}</span><strong>{v}</strong></div>
                    ))}
                    {n8nNodes[contentDetail].rules && (
                      <div className="n8n-rules"><strong>Aturan prompt:</strong>{n8nNodes[contentDetail].rules.map((r) => (<div key={r}>• {r}</div>))}</div>
                    )}
                    {n8nNodes[contentDetail].sheet && (
                      <div className="n8n-sheet"><strong>Data sheet (dummy — contoh saja):</strong><table><thead><tr><th>Judul artikel</th><th>Tautan</th><th>Status</th></tr></thead><tbody>{n8nNodes[contentDetail].sheet.map((row) => (<tr key={row[1]}><td>{row[0]}</td><td>{row[1]}</td><td>{row[2]}</td></tr>))}</tbody></table></div>
                    )}
                    {n8nNodes[contentDetail].output && (<div className="n8n-output">{n8nNodes[contentDetail].output}</div>)}
                  </div>
                )}
              </div>
              <button className="btn" onClick={runContent} disabled={contentRunning || contentStep === 5}>Jalankan workflow →</button>{' '}
              <button className="btn" onClick={resetContent}>Ulangi demo</button>
              <p className={contentStep === 5 ? 'status bad' : 'status ok'}>
                {contentStep === 5
                  ? 'Hasil kurang lucu? Manusia yang menulis ulang prompt Claude secara manual.'
                  : 'Tekan Jalankan workflow — node menyala berurutan. Klik node untuk detailnya.'}
              </p>
            </>
          )}

          {idx === 15 && (
            <div className="q-slide">
              <p className="kicker">Topik berikutnya</p>
              <h2>Apa Itu AI Agent?</h2>
            </div>
          )}

          {idx === 16 && (
            <>
              <p className="kicker">Level 3 · AI Agent</p>
              <h2>Perubahan besar: <span className="hl">pengambil keputusan diganti.</span></h2>
              <ul className="points">
                <li>Agent menerima tujuan, bukan daftar langkah.</li>
                <li>LLM menjadi pengambil keputusan di dalam sistem.</li>
                <li>Bernalar → bertindak dengan tools → amati → ulang → output akhir.</li>
              </ul>
            </>
          )}

          {idx === 17 && (
            <>
              <p className="kicker">Level 3 · Agent: Reason + Act</p>
              <h2>Agent <span className="hl">berpikir</span> sebelum bertindak.</h2>
              <div className="thought">“Kumpulkan tautan saja, bukan salin-tempel satu per satu.”</div>
              <div className="thought">“Simpan di Google Sheets — pengguna sudah menghubungkan Google.”</div>
            </>
          )}

          {idx === 18 && (
            <>
              <p className="kicker">Level 3 · ReAct + Iterasi</p>
              <h2>ReAct = Reason + Act, <span className="hl">diulang mandiri.</span></h2>
              <div className="loop">
                {loopNames.map((n, i) => (
                  <div key={n} className={`node ${loopIdx === i ? 'on' : ''}`}><strong>{n}</strong><br /><span className="small">{loopSubs[i]}</span></div>
                ))}
              </div>
              <p><span className="pill">PUTARAN {turn}</span></p>
              <div className="card" style={{ marginTop: 10 }}>
                <h3>{reactVersions[reactVer].t}</h3>
                <p>{reactVersions[reactVer].d}</p>
              </div>
              <button className="btn" onClick={() => setReactVer((v) => Math.min(3, v + 1))} disabled={reactVer === 3} style={{ marginTop: 10 }}>Iterasi berikutnya →</button>{' '}
              <button className="btn" onClick={resetReact}>Ulangi dari draf v1</button>
            </>
          )}

          {idx === 19 && (
            <>
              <p className="kicker">Ringkasan · 3 Level</p>
              <h2>Tiga level, <span className="hl">satu garis besar.</span></h2>
              <div className="step-list">
                <div className="step"><strong>Level 1 — LLM</strong><span>Masukan → keluaran, dari data latih.</span></div>
                <div className="step"><strong>Level 2 — AI Workflow</strong><span>Masukan + jalur manusia, kadang lewat tools.</span></div>
                <div className="step on"><strong>Level 3 — AI Agent</strong><span>Tujuan → LLM bernalar, bertindak, amati, ulang → output akhir.</span></div>
              </div>
            </>
          )}

          {idx === 20 && (
            <div className="q-slide">
              <p className="kicker">Topik berikutnya</p>
              <h2>Apa Itu Agentic Workflow?</h2>
            </div>
          )}

          {idx === 21 && (
            <>
              <p className="kicker">Level 4 · Lanjutan dari video</p>
              <h2>Agentic Workflow: agent yang <span className="hl">diorkestrasi.</span></h2>
              <p><span className="badge-ext">⚠️ Ini lanjutan kami, bukan bagian dari video Jeff Su</span></p>
              <ul className="points">
                <li>Tujuan + batasan ditentukan manusia.</li>
                <li>Banyak agent dan tools diorkestrasi dalam satu alur.</li>
                <li>Checkpoint manusia untuk aksi penting.</li>
                <li>Fleksibel untuk tugas nyata, terkontrol untuk bisa dipercaya.</li>
              </ul>
            </>
          )}

          {idx === 22 && (
            <>
              <p className="kicker">Level 4 · Demo Agentic Workflow</p>
              <h2>Digest tugas, <span className="hl">dengan gerbang approve.</span></h2>
              <div className="card">
                <div className="flow">
                  <div className={`node ${agents >= 1 ? 'done' : ''}`}>🤖 Agent Moodle<br /><span className="small">Cek deadline</span></div><span className="arrow">+</span>
                  <div className={`node ${agents >= 1 ? 'done' : ''}`}>🤖 Agent Classroom<br /><span className="small">Cek tugas</span></div><span className="arrow">→</span>
                  <div className={`node ${agents === 2 ? 'done' : agents === 1 ? 'on' : ''}`}>🤖 Agent Perangkum<br /><span className="small">Gabung + prioritaskan</span></div>
                </div>
                <button className="btn" onClick={runAgents} disabled={agents === 1}>Jalankan orkestrasi</button>{' '}
                <button className="btn blue" onClick={() => setSent(true)} disabled={agents !== 2 || sent}>Approve &amp; kirim</button>{' '}
                <button className="btn" onClick={resetDigest}>Ulangi demo</button>
                <p className="status ok" style={{ marginTop: 10 }}>
                  {sent ? '✅ TERKIRIM — setelah checkpoint manusia dilewati.' : agents === 2 ? '⏳ Siap dikirim — tunggu approve.' : agents === 1 ? '⏳ Para agent sedang bekerja…' : 'Jalankan dulu — TERKIRIM hanya setelah approve.'}
                </p>
              </div>
            </>
          )}

          {idx === 23 && (
            <>
              <p className="kicker">Perbandingan</p>
              <h2>Siapa yang memutuskan <span className="hl">langkah berikutnya?</span></h2>
              <div className="tablewrap">
                <table>
                  <thead><tr><th></th><th>Siapa memutuskan?</th><th>Bisa ditebak?</th><th>Fleksibel?</th><th>Cocok untuk</th></tr></thead>
                  <tbody>
                    <tr><td><strong>LLM</strong></td><td>Manusia, tiap prompt</td><td>Tinggi</td><td>Rendah (nol aksi)</td><td>Menulis &amp; meringkas</td></tr>
                    <tr><td><strong>AI Workflow</strong></td><td>Manusia, saat desain</td><td>Sangat tinggi</td><td>Rendah</td><td>Tugas berulang &amp; terstruktur</td></tr>
                    <tr><td><strong>AI Agent</strong></td><td>LLM, saat jalan</td><td>Rendah</td><td>Sangat tinggi</td><td>Tugas yang jalurnya berubah-ubah</td></tr>
                    <tr><td><strong>Agentic Workflow</strong></td><td>Manusia: tujuan + batasan; agent: langkah di dalamnya</td><td>Terkontrol</td><td>Tinggi, dalam batasan</td><td>Kerja panjang multi-tools yang butuh kontrol</td></tr>
                  </tbody>
                </table>
              </div>
              <div className="compare-cards">
                <div className="card"><h3>LLM</h3><p>Manusia, tiap prompt · Bisa ditebak: tinggi · Fleksibel: rendah · Menulis &amp; meringkas</p></div>
                <div className="card"><h3>AI Workflow</h3><p>Manusia, saat desain · Bisa ditebak: sangat tinggi · Fleksibel: rendah · Tugas berulang &amp; terstruktur</p></div>
                <div className="card"><h3>AI Agent</h3><p>LLM, saat jalan · Bisa ditebak: rendah · Fleksibel: sangat tinggi · Tugas yang jalurnya berubah-ubah</p></div>
                <div className="card"><h3>Agentic Workflow</h3><p>Manusia: tujuan + batasan; agent: langkah di dalamnya · Bisa ditebak: terkontrol · Fleksibel: tinggi, dalam batasan · Kerja panjang multi-tools yang butuh kontrol</p></div>
              </div>
            </>
          )}

          {idx === 24 && (
            <>
              <p className="kicker">Panduan memilih</p>
              <h2>Jangan asal pakai agent. <span className="hl">Tanya dulu tugasnya.</span></h2>
              <div className="grid">
                <button className="card" style={{ textAlign: 'left' }} onClick={() => setChoice('workflow')}><h3>🛤️ Langkahnya sudah pasti?</h3><p>Pakai AI Workflow.</p></button>
                <button className="card" style={{ textAlign: 'left' }} onClick={() => setChoice('agent')}><h3>🔍 Jalurnya berubah?</h3><p>Pertimbangkan AI Agent.</p></button>
                <button className="card" style={{ textAlign: 'left' }} onClick={() => setChoice('agentic')}><h3>🧭 Panjang &amp; berisiko?</h3><p>Agentic Workflow + checkpoint manusia.</p></button>
              </div>
              {choice && <div className="note" style={{ marginTop: 14 }}><strong>Verdict: {choice === 'workflow' ? 'AI Workflow' : choice === 'agent' ? 'AI Agent' : 'Agentic Workflow'}</strong></div>}
              <div className="note" style={{ marginTop: 14 }}>
                <strong>Prinsip:</strong> delegasikan eksekusi, bukan penilaian akhir. Kirim / bayar / submit / hapus → tetap approve manusia.
              </div>
            </>
          )}

          {idx === 25 && (
            <>
              <p className="kicker">Risiko &amp; tanggung jawab</p>
              <h2>Agent boleh cepat. <span className="hl">Verifikasi tetap milikmu.</span></h2>
              <div className="grid">
                <div className="card"><h3>🌀 Halusinasi</h3><p>Cek bukti akhir.</p></div>
                <div className="card"><h3>🔒 Data pribadi</h3><p>Jangan asal dilempar ke tools.</p></div>
                <div className="card"><h3>🎓 Jangan serahkan belajar</h3><p>Pemahaman &amp; keputusan akhir tetap milikmu.</p></div>
              </div>
            </>
          )}

          {idx === 26 && (
            <>
              <p className="kicker">Penutup</p>
              <h2>AI tidak menggantikan kerja. <span className="hl">AI mengubah peranmu.</span></h2>
              <ul className="points">
                <li>Dari eksekutor → pengarah / editor / approver.</li>
                <li>Tantangan: 1 pekerjaan berulang → workflow dulu → agentic bila stabil.</li>
              </ul>
              <footer>
                <p>Terinspirasi dari video Jeff Su, “AI Agents, Clearly Explained”: <a href="https://www.youtube.com/watch?v=FwOTs4UxQS4">youtube.com/watch?v=FwOTs4UxQS4</a></p>
              </footer>
            </>
          )}
        </div>
      </main>

      <nav className="controls" aria-label="Navigasi slide">
        <button className="btn" onClick={prev} disabled={idx === 0}>← Prev</button>
        <div className="dots" role="tablist" aria-label="Pilih slide">
          {SLIDES.map((label, i) => (
            <button key={label} className={`dot ${i === idx ? 'on' : ''}`} onClick={() => setIdx(i)} aria-label={`Slide ${i + 1}: ${label}`} title={`${i + 1}. ${label}`} />
          ))}
        </div>
        <span className="counter">{idx + 1} / {SLIDES.length}</span>
        <button className="btn blue" onClick={next} disabled={idx === SLIDES.length - 1}>Next →</button>
      </nav>
      <p className="keyhint">Panah ← → · Spasi · PageUp / PageDown · klik titik untuk lompat slide · hash #1–#{SLIDES.length} di URL</p>
    </div>
  )
}
