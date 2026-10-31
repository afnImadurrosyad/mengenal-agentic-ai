import { useEffect, useRef, useState } from 'react'

const SLIDES = [
  'Judul', 'Apa itu LLM', 'Diagram LLM', 'Batasan LLM',
  'Level 2 · AI Workflow', 'Diagram Workflow Kalender', 'Batasan Workflow', 'RAG',
  'Contoh Workflow Konten', 'Level 3 · AI Agent', 'Agent: Reason + Act', 'ReAct + Iterasi',
  'Contoh Agent: Video', 'Ringkasan 3 Level', 'Level 4 · Agentic Workflow', 'Demo Agentic Workflow',
  'Perbandingan', 'Panduan memilih', 'Risiko', 'Penutup',
]

const loopNames = ['REASON', 'ACT', 'OBSERVE', 'ITERATE']
const loopSubs = ['Pikirkan cara terbaik', 'Pakai tools', 'Amati hasilnya', 'Perbaiki / ulangi']
const contentSteps = [
  { t: '1. Kumpulkan di Google Sheets', d: 'Tautan artikel berita dikumpulkan jadi satu daftar.' },
  { t: '2. Perplexity merangkum', d: 'Setiap artikel diringkas jadi poin-poin penting.' },
  { t: '3. Claude menulis draf', d: 'Dengan prompt khusus, Claude menulis draf untuk LinkedIn dan Instagram.' },
  { t: '4. Terjadwal tiap hari 08.00', d: 'Postingan terbit otomatis sesuai jadwal.' },
]
const reactVersions = [
  { t: 'Draf v1', d: 'Postingan LinkedIn pertama — masih datar dan belum terasa khas.' },
  { t: 'Kritik oleh LLM lain', d: 'Draf dinilai dengan praktik terbaik LinkedIn: pembuka kurang kuat, contoh kurang konkret.' },
  { t: 'Revisi', d: 'Draf diperbaiki berdasarkan kritik itu, bukan berdasarkan tebakan.' },
  { t: 'Output final', d: 'Versi yang sudah dioptimasi — dan prosesnya bisa diulang lagi bila perlu.' },
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
  const [contentStep, setContentStep] = useState(0) // 0 idle, 1..4 highlighted
  const [reactVer, setReactVer] = useState(0)
  const [loopIdx, setLoopIdx] = useState(0)
  const [turn, setTurn] = useState(1)
  const [agents, setAgents] = useState(0) // 0 idle, 1 running, 2 done
  const [sent, setSent] = useState(false)
  const [choice, setChoice] = useState(null)
  const calTimers = useRef([])

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
  }, [])

  useEffect(() => () => calTimers.current.forEach(clearTimeout), [])

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
  const runAgents = () => {
    setAgents(1); setSent(false)
    setTimeout(() => setAgents(2), 1800)
  }
  const resetDigest = () => { setAgents(0); setSent(false) }

  const calStatus = calPhase === 0
    ? 'Tekan tombolnya: LLM akan bertanya dulu ke kalender, bukan menebak.'
    : calPhase === 1
      ? 'Search Query dikirim ke Google Calendar…'
      : calPhase === 2
        ? 'Kalender menjawab: ada coffee chat pada tanggal 31.'
        : 'Output: coffee chat-mu berikutnya adalah tanggal 31. Jawaban ini datang dari data, bukan dari hafalan.'

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
              <p className="navhint">Kita mulai dari yang paling dasar: apa itu LLM? Tekan <strong>Next →</strong> atau tombol panah kanan.</p>
            </>
          )}

          {idx === 1 && (
            <>
              <p className="kicker">Level 1 · Apa itu LLM?</p>
              <h2>LLM adalah <span className="hl">fondasi</span> chatbot yang kamu pakai.</h2>
              <p className="lead">Large Language Model dilatih dari teks dalam jumlah sangat besar, sehingga ia pandai mengolah bahasa.</p>
              <div className="grid">
                <div className="card"><h3>💬 Chatbot itu aplikasinya</h3><p>ChatGPT, Gemini, dan Claude adalah aplikasi yang dibangun di atas sebuah LLM — bukan LLM itu sendiri.</p></div>
                <div className="card"><h3>✍️ Ia hebat di teks</h3><p>Menulis, menyunting, meringkas, dan menjelaskan adalah kekuatan utamanya.</p></div>
              </div>
              <p className="small">Bayangkan ia seperti seseorang yang sudah membaca perpustakaan raksasa, lalu bisa merangkai kata dengan sangat luwes.</p>
            </>
          )}

          {idx === 2 && (
            <>
              <p className="kicker">Level 1 · Diagram LLM</p>
              <h2>Input → LLM → Output.</h2>
              <p className="lead">Pola dasarnya sesederhana ini: kamu memberi masukan, model mengolahnya, lalu mengeluarkan jawaban.</p>
              <div className="dark-diagram">
                <div className="diag-row">
                  <span className="diag-label">Input</span><span className="diag-arrow">→</span>
                  <div className="llm-box">LLM</div><span className="diag-arrow">→</span><span className="diag-label">Output</span>
                </div>
                <p className="diag-text">Input: “Buatkan draf email untuk mengajak ngobrol santai sambil minum kopi.”</p>
                <p className="diag-text">{emailShown ? 'Output: “Halo, bolehkah kita ngobrol santai sambil minum kopi minggu ini? Aku ingin bertukar cerita soal pekerjaanmu.” — sopan, singkat, dan siap dikirim setelah kamu baca ulang.' : 'Output: — (tekan tombol untuk melihat hasilnya)'}</p>
              </div>
              <button className="btn" onClick={() => setEmailShown(!emailShown)}>{emailShown ? 'Ulangi demo' : 'Ubah input jadi email →'}</button>
            </>
          )}

          {idx === 3 && (
            <>
              <p className="kicker">Level 1 · Batasan LLM</p>
              <h2>Dua batas yang <span className="hl">penting</span> diingat.</h2>
              <div className="grid">
                <div className="card"><h3>1. Ia pasif</h3><p>Ia menunggu perintahmu, lalu menjawab. Ia tidak bangun sendiri dan mengerjakan sesuatu tanpa diminta.</p></div>
                <div className="card"><h3>2. Ia tidak tahu datamu</h3><p>Kalender pribadimu, data internal perusahaan, dan dokumenmu bukan bagian dari hafalannya.</p></div>
              </div>
              <div className="card" style={{ marginTop: 12 }}>
                <h3>Contoh yang gagal</h3>
                <p>“Kapan coffee chat-ku berikutnya?” — LLM saja tidak bisa menjawab dengan benar, karena ia tidak bisa membuka kalendermu.</p>
              </div>
            </>
          )}

          {idx === 4 && (
            <>
              <p className="kicker">Level 2 · AI Workflow</p>
              <h2>LLM + <span className="hl">jalur yang sudah ditentukan.</span></h2>
              <p className="lead">Di level ini, LLM dirangkai dengan informasi dan perkakas dari luar, lewat jalur yang sudah ditetapkan sejak awal.</p>
              <div className="grid">
                <div className="card"><h3>🧭 Control Logic</h3><p>Manusia yang menulis logika kontrolnya: langkah apa, alat apa, dan urutannya bagaimana.</p></div>
                <div className="card"><h3>👤 Manusia tetap pengambil keputusan</h3><p>Sistem hanya mengikuti jalur itu. Kalau jalurnya tidak memuat sesuatu, sistem tidak akan mencarinya sendiri.</p></div>
              </div>
              <p className="small">Rumus singkatnya: masukan → jalur yang diprogram manusia → keluaran, kadang lewat perkakas luar.</p>
            </>
          )}

          {idx === 5 && (
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

          {idx === 6 && (
            <>
              <p className="kicker">Level 2 · Batasan Workflow</p>
              <h2>Jalur yang sama, <span className="hl">pertanyaan yang berbeda.</span></h2>
              <p className="lead">Sekarang tanyakan hal lain ke workflow yang sama: “Bagaimana cuaca pada hari coffee chat itu?”</p>
              <div className="dark-diagram compact">
                <div className="diag-row">
                  <span className="diag-label">Input: cuaca hari itu?</span><span className="diag-arrow">→</span>
                  <div className="llm-box">LLM</div><span className="diag-arrow">→</span><span className="diag-label">Output: ?</span>
                </div>
                <div className="cal-wrap" style={{ position: 'relative' }}>
                  <div className="cal-tile">
                    <div className="cal-white"><span>31</span></div>
                    <div className="cal-yellow" /><div className="cal-green" /><div className="cal-red" />
                  </div>
                  <span className="cal-name">Google Calendar</span>
                  {weatherAsked && <span className="big-x" aria-label="Tidak ada data cuaca">✕</span>}
                </div>
                <p className="diag-status">{weatherAsked ? 'Gagal: jalur ini hanya terhubung ke kalender. Kalender tahu tanggal, tapi tidak tahu cuaca.' : 'Tekan tombolnya untuk melihat apa yang terjadi.'}</p>
              </div>
              <button className="btn" onClick={() => setWeatherAsked(true)} disabled={weatherAsked}>Tanya cuaca hari itu</button>{' '}
              <button className="btn" onClick={() => setWeatherAsked(false)}>Ulangi demo</button>
            </>
          )}

          {idx === 7 && (
            <>
              <p className="kicker">Level 2 · RAG</p>
              <h2>RAG: model yang <span className="hl">mencari dulu, baru menjawab.</span></h2>
              <p className="lead">Retrieval-Augmented Generation, dalam bahasa sederhana: sebelum menjawab, model mengambil informasi yang relevan.</p>
              <div className="grid">
                <div className="card"><h3>📅 Kalender</h3><p>Untuk pertanyaan jadwal, ia memeriksa kalender.</p></div>
                <div className="card"><h3>🌤️ Layanan cuaca</h3><p>Untuk pertanyaan cuaca, ia memeriksa layanan cuaca.</p></div>
                <div className="card"><h3>📄 Dokumen</h3><p>Untuk pertanyaan dokumen, ia memeriksa dokumen yang diizinkan.</p></div>
                <div className="card"><h3>⚠️ Bukan sihir baru</h3><p>RAG adalah salah satu bentuk AI workflow — jalurnya tetap ditentukan manusia.</p></div>
              </div>
            </>
          )}

          {idx === 8 && (
            <>
              <p className="kicker">Level 2 · Contoh nyata: Workflow Konten</p>
              <h2>Konten harian, <span className="hl">tanpa menulis dari nol.</span></h2>
              <p className="lead">Contoh dari tutorial Helena Liu (make.com): satu rangkaian yang berjalan setiap hari.</p>
              <div className="step-list">
                {contentSteps.map((s, i) => (
                  <div key={s.t} className={`step ${contentStep === i + 1 ? 'on' : contentStep > i + 1 ? 'done' : ''}`}>
                    <strong>{s.t}</strong><span>{s.d}</span>
                  </div>
                ))}
              </div>
              <button className="btn" onClick={() => setContentStep((v) => Math.min(4, v + 1))} disabled={contentStep === 4}>Langkah berikutnya →</button>{' '}
              <button className="btn" onClick={() => setContentStep(0)}>Ulangi demo</button>
              <p className={contentStep === 4 ? 'status bad' : 'status ok'}>
                {contentStep === 4
                  ? 'Titik pentingnya: kalau hasil akhirnya kurang lucu, MANUSIA yang harus menulis ulang prompt Claude secara manual — coba, gagal, perbaiki, ulangi.'
                  : 'Tekan langkah berikutnya sampai ke ujung, lalu perhatikan siapa yang memperbaiki hasilnya.'}
              </p>
            </>
          )}

          {idx === 9 && (
            <>
              <p className="kicker">Level 3 · AI Agent</p>
              <h2>Perubahan besarnya: <span className="hl">pengambil keputusan diganti.</span></h2>
              <p className="lead">Bukan lagi manusia yang menuliskan tiap langkah. LLM-lah yang menjadi pengambil keputusan di dalam sistem.</p>
              <div className="grid">
                <div className="card"><h3>🎯 Agent menerima tujuan</h3><p>Bukan daftar langkah, melainkan hasil yang diinginkan.</p></div>
                <div className="card"><h3>🔁 Lalu ia bekerja sendiri</h3><p>Bernalar soal pendekatan, bertindak dengan perkakas, mengamati hasilnya, mengulang bila perlu, lalu memberi output akhir.</p></div>
              </div>
              <p className="small">Kalimat kuncinya: untuk mengubah workflow menjadi agent, pengambil keputusan manusia harus diganti oleh LLM.</p>
            </>
          )}

          {idx === 10 && (
            <>
              <p className="kicker">Level 3 · Agent: Reason + Act</p>
              <h2>Agent <span className="hl">berpikir keras</span> sebelum bertindak.</h2>
              <p className="lead">Dengan contoh konten yang sama, beginilah kira-kira penalaran agent itu berjalan.</p>
              <div className="thought">“Kumpulkan artikelnya bagaimana? Salin-tempel satu per satu? Tidak efisien — kumpulkan saja tautannya, lalu ambil isinya dengan perkakas lain. Itu jauh lebih masuk akal.”</div>
              <div className="thought">“Simpan di mana? Word? Excel? Tidak — pengguna sudah menghubungkan Google, jadi Google Sheets lebih masuk akal.”</div>
              <p className="small">Setelah bernalar seperti itu, barulah agent bertindak dengan perkakas yang ia pilih sendiri.</p>
            </>
          )}

          {idx === 11 && (
            <>
              <p className="kicker">Level 3 · ReAct + Iterasi</p>
              <h2>ReAct = Reason + Act, <span className="hl">diulang mandiri.</span></h2>
              <div className="loop">
                {loopNames.map((n, i) => (
                  <div key={n} className={`node ${loopIdx === i ? 'on' : ''}`}><strong>{n}</strong><br /><span className="small">{loopSubs[i]}</span></div>
                ))}
              </div>
              <p><span className="pill">PUTARAN {turn}</span> — loop ini berputar otomatis sampai tujuan tercapai.</p>
              <div className="card" style={{ marginTop: 10 }}>
                <h3>{reactVersions[reactVer].t}</h3>
                <p>{reactVersions[reactVer].d}</p>
              </div>
              <button className="btn" onClick={() => setReactVer((v) => Math.min(3, v + 1))} disabled={reactVer === 3} style={{ marginTop: 10 }}>Iterasi berikutnya →</button>{' '}
              <button className="btn" onClick={() => setReactVer(0)}>Ulangi dari draf v1</button>
              <p className="small hide-m">Bedanya dengan workflow: tidak ada manusia yang menulis ulang prompt di tengah jalan — LLM lain yang mengkritik, lalu draf diperbaiki.</p>
            </>
          )}

          {idx === 12 && (
            <>
              <p className="kicker">Level 3 · Contoh nyata: Agent Video</p>
              <h2>Ketik “skier”, agent <span className="hl">yang mencari.</span></h2>
              <p className="lead">Contoh dari demo Andrew Ng: pengguna cukup mengetik satu kata kunci.</p>
              <div className="step-list">
                <div className="step on"><strong>1. Bernalar</strong><span>Agent menyimpulkan: skier adalah seseorang yang bergerak di atas salju.</span></div>
                <div className="step"><strong>2. Mencari rekaman</strong><span>Ia menjelajahi rekaman video yang tersedia.</span></div>
                <div className="step"><strong>3. Mengindeks klip</strong><span>Klip yang cocok ditandai dan dikumpulkan.</span></div>
                <div className="step done"><strong>4. Hasil</strong><span>Pengguna menerima klip-klip yang relevan, tanpa menonton semuanya.</span></div>
              </div>
              <p className="small">Bandingkan dengan cara lama: manusia harus menonton semua rekaman dan memberi tag “salju, ski, gunung” satu per satu.</p>
            </>
          )}

          {idx === 13 && (
            <>
              <p className="kicker">Ringkasan · 3 Level</p>
              <h2>Tiga level, <span className="hl">satu garis besar.</span></h2>
              <div className="step-list">
                <div className="step"><strong>Level 1 — LLM</strong><span>Masukan → keluaran, berdasarkan data latihnya.</span></div>
                <div className="step"><strong>Level 2 — AI Workflow</strong><span>Masukan + jalur yang diprogram manusia, kadang lewat perkakas.</span></div>
                <div className="step on"><strong>Level 3 — AI Agent</strong><span>Tujuan → LLM bernalar, bertindak, mengamati, mengulang → keluaran akhir. LLM-lah pengambil keputusannya.</span></div>
              </div>
            </>
          )}

          {idx === 14 && (
            <>
              <p className="kicker">Level 4 · Lanjutan dari video</p>
              <h2>Agentic Workflow: agent yang <span className="hl">diorkestrasi.</span></h2>
              <p><span className="badge-ext">⚠️ Ini lanjutan kami, bukan bagian dari video Jeff Su</span></p>
              <p className="lead">Bukan “agent yang lebih liar”. Ini sistem kerja lengkap untuk pekerjaan nyata.</p>
              <div className="grid">
                <div className="card"><h3>🎯 Tujuan + pagar</h3><p>Manusia menentukan tujuan, batas, dan apa yang tidak boleh dilanggar.</p></div>
                <div className="card"><h3>🤖 Banyak agent, satu orkestrasi</h3><p>Beberapa agent dan perkakas bekerja sama dalam satu alur.</p></div>
                <div className="card"><h3>✅ Checkpoint manusia</h3><p>Aksi penting berhenti dulu di gerbang persetujuan manusia.</p></div>
                <div className="card"><h3>⚖️ Titik manisnya</h3><p>Cukup fleksibel untuk tugas nyata, cukup terkontrol untuk bisa dipercaya.</p></div>
              </div>
            </>
          )}

          {idx === 15 && (
            <>
              <p className="kicker">Level 4 · Demo Agentic Workflow</p>
              <h2>Digest tugas Afnan, <span className="hl">dengan gerbang approve.</span></h2>
              <div className="card">
                <h3>Demo: digest tugas (contoh nyata)</h3>
                <p className="small">Satu bagian cek Moodle, satu bagian cek Classroom, satu bagian menggabungkan dan menyusun prioritas — lalu manusia approve sebelum dikirim.</p>
                <div className="flow">
                  <div className={`node ${agents >= 1 ? 'done' : ''}`}>🤖 Agent Moodle<br /><span className="small">Cek deadline</span></div><span className="arrow">+</span>
                  <div className={`node ${agents >= 1 ? 'done' : ''}`}>🤖 Agent Classroom<br /><span className="small">Cek tugas</span></div><span className="arrow">→</span>
                  <div className={`node ${agents === 2 ? 'done' : agents === 1 ? 'on' : ''}`}>🤖 Agent Perangkum<br /><span className="small">Gabung + prioritaskan</span></div>
                </div>
                <button className="btn" onClick={runAgents} disabled={agents === 1}>Jalankan orkestrasi</button>{' '}
                <button className="btn blue" onClick={() => setSent(true)} disabled={agents !== 2 || sent}>Approve &amp; kirim</button>{' '}
                <button className="btn" onClick={resetDigest}>Ulangi demo</button>
                <p className="status ok" style={{ marginTop: 10 }}>
                  {sent ? '✅ TERKIRIM — setelah checkpoint manusia dilewati. Inilah gerbangnya.' : agents === 2 ? '⏳ Siap dikirim — tapi tombol kirim hanya aktif setelah kamu approve.' : agents === 1 ? '⏳ Para agent sedang bekerja…' : 'Jalankan orkestrasinya dulu: status “terkirim” tidak akan muncul sebelum kamu approve.'}
                </p>
              </div>
              <p className="hand hide-m">Analogi: agent itu satu koki hebat, agentic workflow itu dapur restoran — ada QC, dan kamu owner yang approve sebelum hidangan keluar.</p>
            </>
          )}

          {idx === 16 && (
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

          {idx === 17 && (
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

          {idx === 18 && (
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

          {idx === 19 && (
            <>
              <p className="kicker">Penutup</p>
              <h2>AI tidak menggantikan kerja. <span className="hl">AI mengubah peranmu.</span></h2>
              <p className="lead">Dari eksekutor tiap langkah, menjadi pengarah, editor, dan approver. Tantangan minggu ini: pilih satu pekerjaan berulang, ubah jadi workflow dulu — baru naikkan ke agentic workflow kalau sudah stabil.</p>
              <p className="hand" style={{ fontSize: 28 }}>Mulai dari satu workflow kecil, minggu ini juga.</p>
              <footer>
                <p><strong>Mengenal Agentic AI dan Agentic Workflow untuk Produktivitas Kerja</strong> — materi talk kampus untuk mahasiswa.</p>
                <p>Terinspirasi dari video Jeff Su, “AI Agents, Clearly Explained”: <a href="https://www.youtube.com/watch?v=FwOTs4UxQS4">youtube.com/watch?v=FwOTs4UxQS4</a> — diagram di deck ini dibuat ulang dengan gaya serupa dan seluruh teks diparafrase.</p>
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
