import { useEffect, useState } from 'react'

const chatSteps = [
  { who: 'me', text: 'Tolong ringkas PDF Metpen 12 halaman ini.' },
  { who: 'ai', text: 'Siap. Ini ringkasan 5 poin utamanya…' },
  { who: 'me', text: 'Bisa cek jadwal terbaru di Moodle?' },
  { who: 'ai', text: 'Maaf, aku tidak bisa membuka Moodle. Aku hanya menjawab dari teks yang kamu berikan.' },
]

const loopNames = ['REASON', 'ACT', 'OBSERVE', 'ITERATE']
const loopSubs = ['Pikirkan cara terbaik', 'Pakai tools', 'Amati hasilnya', 'Perbaiki / ulangi']
const pipeNodes = ['1. Artikel masuk', '2. Dirangkas LLM', '3. Masuk Sheet', '4. Post terjadwal']

const SLIDES = [
  'Judul', 'Pembuka', 'Level 1 · LLM', 'Level 2 · AI Workflow', 'Workflow yang kaku',
  'Level 3 · AI Agent', 'Level 4 · Agentic Workflow', 'Perbandingan', 'Panduan memilih',
  'Risiko', 'Penutup',
]

export default function App() {
  const [idx, setIdx] = useState(() => {
    const n = parseInt((window.location.hash || '').replace('#', ''), 10)
    return Number.isFinite(n) && n >= 1 && n <= SLIDES.length ? n - 1 : 0
  })
  const [tidy, setTidy] = useState(false)
  const [chatIdx, setChatIdx] = useState(1)
  const [pipe, setPipe] = useState(0) // 0 idle, 1..4 running/done, 99 stuck
  const [simStuck, setSimStuck] = useState(false) // slide 5 only: false = normal, true = simulation stuck
  const [loopIdx, setLoopIdx] = useState(0)
  const [turn, setTurn] = useState(1)
  const [agents, setAgents] = useState(0) // 0 idle, 1 running, 2 done
  const [sent, setSent] = useState(false)
  const [choice, setChoice] = useState(null)

  const next = () => setIdx((v) => Math.min(SLIDES.length - 1, v + 1))
  const prev = () => setIdx((v) => Math.max(0, v - 1))

  // Hash reflects current slide; loading with a hash opens that slide.
  // Transition is a CSS keyframe on .slide-inner (keyed by idx), so it
  // always ends at full opacity even in headless screenshots.
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
    const t = setInterval(() => setChatIdx((v) => (v >= chatSteps.length ? 1 : v + 1)), 2600)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const t = setInterval(() => {
      setLoopIdx((v) => {
        if (v === 3) setTurn((n) => n + 1)
        return (v + 1) % 4
      })
    }, 1400)
    return () => clearInterval(t)
  }, [])

  const runPipeline = () => {
    setPipe(1)
    ;[2, 3, 4].forEach((n, i) => setTimeout(() => setPipe(n), 900 * (i + 1)))
  }
  const runAgents = () => {
    setAgents(1); setSent(false)
    setTimeout(() => setAgents(2), 1800)
  }

  const flow = (stuck) => (
    <div className="flow">
      {pipeNodes.map((n, i) => (
        <span key={n} style={{ display: 'contents' }}>
          <div className={`node ${stuck && i === 1 ? 'stuck' : pipe > i ? 'done' : pipe === i + 1 ? 'on' : ''}`}>{n}{stuck && i === 1 ? ' — macet!' : ''}</div>
          {i < 3 && <span className="arrow">→</span>}
        </span>
      ))}
    </div>
  )

  return (
    <div className="deck">
      <div className="topbar"><i style={{ width: `${((idx + 1) / SLIDES.length) * 100}%` }} /></div>

      <main className="slide" aria-label={`Slide ${idx + 1}: ${SLIDES[idx]}`}>
        <div className="slide-inner" key={idx}>
          {idx === 0 && (
            <>
              <p className="kicker">Materi talk · Untuk mahasiswa</p>
              <h1>Mengenal <span className="hl">Agentic AI</span> dan Agentic Workflow <span className="hand">untuk produktivitas kerja</span></h1>
              <p className="lead">Dari AI yang cuma menjawab, ke AI yang ikut kerja. Bukan sulap — ini soal siapa yang memutuskan langkah berikutnya.</p>
              <div className="chain" aria-label="Rantai evolusi">
                <span>LLM</span><b>→</b><span>AI Workflow</span><b>→</b><span>AI Agent</span><b>→</b><span className="hl">Agentic Workflow</span>
              </div>
              <p className="navhint">Tekan <strong>Next →</strong> atau tombol panah kanan untuk mulai.</p>
            </>
          )}

          {idx === 1 && (
            <>
              <p className="kicker">Pembuka</p>
              <h2>Waktumu habis bukan cuma buat kerja — tapi buat <span className="hl">mindahin info.</span></h2>
              <p className="lead">Cek Moodle, cek Classroom, cek grup WA, cek kalender, salin lagi ke catatan. Pekerjaan intinya belum mulai, energinya sudah habis duluan.</p>
              <div className={`chips ${tidy ? 'tidy' : ''}`}>
                {tidy ? (<>
                  <span className="chip">📌 Moodle: 2 deadline</span><span className="arrow">→</span>
                  <span className="chip">📌 Classroom: 1 tugas</span><span className="arrow">→</span>
                  <span className="chip">✅ Satu daftar prioritas</span>
                </>) : (<>
                  <span className="chip">📄 Moodle?</span><span className="chip">💬 WA grup?</span>
                  <span className="chip">📅 Kalender?</span><span className="chip">📚 Classroom?</span>
                  <span className="chip">📝 Catatan acak?</span>
                </>)}
              </div>
              <button className="btn" onClick={() => setTidy(!tidy)}>{tidy ? 'Acak lagi' : 'Rapikan dengan AI →'}</button>
              <p className="small">Inilah janji agentic workflow: bukan sekadar menjawab, tapi merapikan langkah kerja.</p>
            </>
          )}

          {idx === 2 && (
            <>
              <p className="kicker">Level 1 · LLM</p>
              <h2>LLM: otak yang <span className="hl">pasif.</span></h2>
              <p className="lead">Kamu kasih input, dia kasih output. ChatGPT, Gemini, dan Claude adalah contohnya.</p>
              <div className="grid">
                <div className="card"><h3>✅ Kuat di</h3><p>Menulis, meringkas, menjelaskan, dan brainstorming. Untuk mengolah bahasa, dia sangat cepat.</p></div>
                <div className="card"><h3>⚠️ Batasnya</h3><p>Tidak bisa mengakses data pribadimu atau data real-time sendiri, dan tidak bisa bertindak. Tanpa dicek, dia bisa mengarang dengan percaya diri.</p></div>
              </div>
              <div className="chat" aria-live="polite">
                {chatSteps.slice(0, chatIdx).map((m, i) => (
                  <div key={i} className={`bubble ${m.who}`}>{m.text}</div>
                ))}
              </div>
              <p className="hand">Analogi: teman pintar yang hanya menjawab kalau ditanya, tapi tidak pernah bangun dari kursi.</p>
            </>
          )}

          {idx === 3 && (
            <>
              <p className="kicker">Level 2 · AI Workflow</p>
              <h2>AI Workflow: jalurnya sudah <span className="hl">ditulis manusia.</span></h2>
              <p className="lead">LLM dirangkai dengan tools lewat jalur tetap: input → langkah yang sudah ditentukan → output. Manusia yang mendesain jalurnya.</p>
              {flow(false)}
              <button className="btn" onClick={runPipeline}>Jalankan workflow</button>
              <p className="status ok">
                {pipe === 4 ? 'Selesai: keempat node menyala hijau. Cocok untuk tugas berulang yang hasilnya harus bisa ditebak.' : 'Tekan “Jalankan workflow” — keempat node akan menyala berurutan.'}
              </p>
              <p><strong>Kelebihan:</strong> stabil dan hemat.</p>
            </>
          )}

          {idx === 4 && (
            <>
              <p className="kicker">Level 2 · Lanjutan</p>
              <h2>Workflow yang <span className="hl">kaku</span> kalau kondisi berubah.</h2>
              <p className="lead">Coba simulasinya: format artikel tidak ada di skrip, langkah 2 langsung macet.</p>
              <div className="flow">
                {pipeNodes.map((n, i) => (
                  <span key={n} style={{ display: 'contents' }}>
                    <div className={`node ${simStuck && i === 1 ? 'stuck' : ''}`}>{n}{simStuck && i === 1 ? ' — macet!' : ''}</div>
                    {i < 3 && <span className="arrow">→</span>}
                  </span>
                ))}
              </div>
              <button className="btn" onClick={() => setSimStuck(true)}>Simulasi bahan tak terduga</button>{' '}
              <button className="btn" onClick={() => setSimStuck(false)}>Kembalikan ke jalur normal</button>
              <p className={simStuck ? 'status bad' : 'status ok'}>
                {simStuck
                  ? 'Workflow yang kaku tidak bisa improvisasi — harus didesain ulang manusia.'
                  : 'Jalur normal: semua node siap. Tekan “Simulasi bahan tak terduga” untuk melihat langkah 2 macet, lalu “Kembalikan ke jalur normal” untuk meresetnya.'}
              </p>
              <p className="hand">Analogi: resep masak. Konsisten, tapi kalau bahan pengganti tidak ada di resep, kokinya bingung.</p>
            </>
          )}

          {idx === 5 && (
            <>
              <p className="kicker">Level 3 · AI Agent</p>
              <h2>AI Agent: manusia memberi <span className="hl">tujuan, bukan langkah.</span></h2>
              <p className="lead">Lompatan besarnya: pengambil keputusan manusianya diganti oleh LLM. Agent memutuskan sendiri langkah berikutnya dari hasil yang ia amati.</p>
              <div className="loop">
                {loopNames.map((n, i) => (
                  <div key={n} className={`node ${loopIdx === i ? 'on' : ''}`}><strong>{n}</strong><br /><span className="small">{loopSubs[i]}</span></div>
                ))}
              </div>
              <p><span className="pill">PUTARAN {turn}</span> — loop ini berputar otomatis sampai tujuan tercapai.</p>
              <div className="grid">
                <div className="card"><h3>ReAct</h3><p><strong>Reason + Act.</strong> Agent berpikir, lalu bertindak, dalam satu loop yang sama.</p></div>
                <div className="card"><h3>RAG</h3><p><strong>Retrieval-Augmented Generation.</strong> Sebelum menjawab, agent mengambil dulu data yang relevan — jawabannya berdasar dokumen nyata, bukan cuma hafalan model.</p></div>
              </div>
              <p className="hand">Analogi: asisten yang disuruh “cari bahan terbaik”, lalu bolak-balik sendiri dan kembali membawa hasil.</p>
            </>
          )}

          {idx === 6 && (
            <>
              <p className="kicker">Level 4 · Agentic Workflow</p>
              <h2>Agentic Workflow: agent yang <span className="hl">diorkestrasi.</span></h2>
              <p className="lead">Bukan “agent yang lebih liar”. Sistem kerja lengkap: manusia menentukan tujuan, pagar, dan checkpoint — agent memilih langkah di dalam pagar itu.</p>
              <div className="card">
                <h3>Demo: digest tugas Afnan (contoh nyata)</h3>
                <p>Satu bagian cek Moodle, satu bagian cek Classroom, satu bagian menggabungkan dan menyusun prioritas — lalu manusia approve sebelum dikirim.</p>
                <div className="flow">
                  <div className={`node ${agents >= 1 ? 'done' : ''}`}>🤖 Agent Moodle<br /><span className="small">Cek deadline</span></div><span className="arrow">+</span>
                  <div className={`node ${agents >= 1 ? 'done' : ''}`}>🤖 Agent Classroom<br /><span className="small">Cek tugas</span></div><span className="arrow">→</span>
                  <div className={`node ${agents === 2 ? 'done' : agents === 1 ? 'on' : ''}`}>🤖 Agent Perangkum<br /><span className="small">Gabung + prioritaskan</span></div>
                </div>
                <button className="btn" onClick={runAgents} disabled={agents === 1}>Jalankan orkestrasi</button>{' '}
                <button className="btn blue" onClick={() => setSent(true)} disabled={agents !== 2 || sent}>Approve &amp; kirim</button>
                <p className="status ok" style={{ marginTop: 12 }}>
                  {sent ? '✅ TERKIRIM — setelah checkpoint manusia dilewati. Inilah gerbangnya.' : agents === 2 ? '⏳ Siap dikirim — tapi tombol kirim hanya aktif setelah kamu approve.' : agents === 1 ? '⏳ Para agent sedang bekerja…' : 'Jalankan orkestrasinya dulu: status “terkirim” tidak akan muncul sebelum kamu approve.'}
                </p>
              </div>
              <p className="hand">Analogi: agent itu satu koki hebat, agentic workflow itu dapur restoran — ada QC, dan kamu owner yang approve sebelum hidangan keluar.</p>
            </>
          )}

          {idx === 7 && (
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
                    <tr><td><strong>Agentic Workflow</strong></td><td>Manusia: tujuan + pagar; agent: langkah di dalamnya</td><td>Terkontrol</td><td>Tinggi, dalam pagar</td><td>Kerja panjang multi-tools yang butuh kontrol</td></tr>
                  </tbody>
                </table>
              </div>
              <div className="compare-cards">
                <div className="card"><h3>LLM</h3><p>Manusia, tiap prompt · Bisa ditebak: tinggi · Fleksibel: rendah · Menulis &amp; meringkas</p></div>
                <div className="card"><h3>AI Workflow</h3><p>Manusia, saat desain · Bisa ditebak: sangat tinggi · Fleksibel: rendah · Tugas berulang &amp; terstruktur</p></div>
                <div className="card"><h3>AI Agent</h3><p>LLM, saat jalan · Bisa ditebak: rendah · Fleksibel: sangat tinggi · Tugas yang jalurnya berubah-ubah</p></div>
                <div className="card"><h3>Agentic Workflow</h3><p>Manusia: tujuan + pagar; agent: langkah di dalamnya · Bisa ditebak: terkontrol · Fleksibel: tinggi, dalam pagar · Kerja panjang multi-tools yang butuh kontrol</p></div>
              </div>
            </>
          )}

          {idx === 8 && (
            <>
              <p className="kicker">Panduan memilih</p>
              <h2>Jangan asal pakai agent. <span className="hl">Tanya dulu tugasnya.</span></h2>
              <div className="grid">
                <button className="card" style={{ textAlign: 'left' }} onClick={() => setChoice('workflow')}><h3>🛤️ Langkahnya sudah pasti?</h3><p>Pakai AI Workflow — lebih murah dan stabil.</p></button>
                <button className="card" style={{ textAlign: 'left' }} onClick={() => setChoice('agent')}><h3>🔍 Jalurnya berubah tergantung temuan?</h3><p>Pertimbangkan AI Agent.</p></button>
                <button className="card" style={{ textAlign: 'left' }} onClick={() => setChoice('agentic')}><h3>🧭 Panjang, multi-tools, dan salah kirim itu berisiko?</h3><p>Pakai Agentic Workflow + checkpoint manusia.</p></button>
              </div>
              {choice && <div className="note" style={{ marginTop: 14 }}><strong>Verdict: {choice === 'workflow' ? 'AI Workflow' : choice === 'agent' ? 'AI Agent' : 'Agentic Workflow'}</strong> — delegasikan eksekusi, bukan penilaian akhir.</div>}
              <div className="note" style={{ marginTop: 14 }}>
                <strong>Prinsipnya:</strong> delegasikan eksekusi, bukan penilaian akhir. Aksi yang tidak bisa dibatalkan — kirim, bayar, submit, hapus — tetap lewat approval manusia.
              </div>
            </>
          )}

          {idx === 9 && (
            <>
              <p className="kicker">Risiko &amp; tanggung jawab</p>
              <h2>Agent boleh cepat. <span className="hl">Verifikasi tetap milikmu.</span></h2>
              <div className="grid">
                <div className="card"><h3>🌀 Halusinasi</h3><p>Jawaban yang rapi belum tentu benar. Cek bukti akhirnya, bukan cuma klaimnya.</p></div>
                <div className="card"><h3>🔒 Data pribadi</h3><p>Jangan asal melempar data sensitif ke tools sembarangan.</p></div>
                <div className="card"><h3>🎓 Jangan serahkan belajar</h3><p>Agent boleh mempercepat riset dan draf, tapi pemahaman dan keputusan akhir tetap milikmu.</p></div>
              </div>
            </>
          )}

          {idx === 10 && (
            <>
              <p className="kicker">Penutup</p>
              <h2>AI tidak menggantikan kerja. <span className="hl">AI mengubah peranmu.</span></h2>
              <p className="lead">Dari eksekutor tiap langkah, menjadi pengarah, editor, dan approver. Tantangan minggu depan: pilih satu pekerjaan berulang, ubah jadi workflow dulu — baru naikkan ke agentic workflow kalau sudah stabil.</p>
              <p className="hand" style={{ fontSize: 28 }}>Mulai dari satu workflow kecil, minggu ini juga.</p>
              <footer>
                <p><strong>Mengenal Agentic AI dan Agentic Workflow untuk Produktivitas Kerja</strong> — materi talk kampus untuk mahasiswa.</p>
                <p>Terinspirasi dari video Jeff Su, “AI Agents, Clearly Explained”: <a href="https://www.youtube.com/watch?v=FwOTs4UxQS4">youtube.com/watch?v=FwOTs4UxQS4</a></p>
                <p className="small">Versi web statis ini tidak memakai backend, database, atau environment variable — seluruh interaksinya berjalan di browser.</p>
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
