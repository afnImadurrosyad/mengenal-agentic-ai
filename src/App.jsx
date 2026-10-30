import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

const chatSteps = [
  { who: 'me', text: 'Tolong ringkas PDF Metpen 12 halaman ini.' },
  { who: 'ai', text: 'Siap. Ini ringkasan 5 poin utamanya…' },
  { who: 'me', text: 'Bisa cek jadwal terbaru di Moodle?' },
  { who: 'ai', text: 'Maaf, aku tidak bisa membuka Moodle. Aku hanya menjawab dari teks yang kamu berikan.' },
]

export default function App() {
  const [tidy, setTidy] = useState(false)
  const [chatIdx, setChatIdx] = useState(1)
  const [pipe, setPipe] = useState(0) // 0 idle, 1..4 running/done, 99 stuck
  const [loopIdx, setLoopIdx] = useState(0)
  const [turn, setTurn] = useState(1)
  const [agents, setAgents] = useState(0) // 0 idle, 1 running, 2 done
  const [sent, setSent] = useState(false)
  const [choice, setChoice] = useState(null)
  const progressRef = useRef(null)
  const lenisRef = useRef(null)

  const goTo = (e, hash) => {
    e.preventDefault()
    if (lenisRef.current) lenisRef.current.scrollTo(hash, { offset: -70, duration: 1.2 })
    else document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.1 })
    lenisRef.current = lenis
    lenis.on('scroll', ScrollTrigger.update)
    const raf = (time) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)
    const ctx = gsap.context(() => {
      gsap.utils.toArray('.reveal').forEach((el) => {
        gsap.fromTo(el, { y: 36, opacity: 0 }, {
          y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%' },
        })
      })
    })
    const onScroll = () => {
      const h = document.documentElement
      const p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight)
      if (progressRef.current) progressRef.current.style.width = `${Math.round(p * 100)}%`
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => { window.removeEventListener('scroll', onScroll); ctx.revert(); gsap.ticker.remove(raf); lenis.destroy() }
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

  const loopNames = ['REASON', 'ACT', 'OBSERVE', 'ITERATE']
  const pipeNodes = ['1. Artikel masuk', '2. Dirangkas LLM', '3. Masuk Sheet', '4. Post terjadwal']

  return (
    <>
      <div className="topbar"><i ref={progressRef} /></div>
      <div className="wrap">
        <nav className="nav" aria-label="Navigasi level">
          <a href="#llm" onClick={(e) => goTo(e, '#llm')}>Level 1 · LLM</a><a href="#workflow" onClick={(e) => goTo(e, '#workflow')}>Level 2 · Workflow</a>
          <a href="#agent" onClick={(e) => goTo(e, '#agent')}>Level 3 · Agent</a><a href="#agentic" onClick={(e) => goTo(e, '#agentic')}>Level 4 · Agentic</a>
          <a href="#pilih" onClick={(e) => goTo(e, '#pilih')}>Pilih yang tepat</a>
        </nav>

        <section>
          <p className="kicker">Materi talk · Untuk mahasiswa</p>
          <h1>Mengenal <span className="hl">Agentic AI</span> dan Agentic Workflow <span className="hand">untuk produktivitas kerja</span></h1>
          <p className="lead">Dari AI yang cuma menjawab, ke AI yang ikut kerja. Bukan sulap — ini soal siapa yang memutuskan langkah berikutnya.</p>
          <div className="chain" aria-label="Rantai evolusi">
            <span>LLM</span><b>→</b><span>AI Workflow</span><b>→</b><span>AI Agent</span><b>→</b><span className="hl">Agentic Workflow</span>
          </div>
          <p className="scrollhint">Scroll pelan-pelan <span>↓</span> — tiap level akan berubah di depanmu.</p>
        </section>

        <section className="reveal">
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
          <p className="small">Coba tekan tombolnya. Inilah janji agentic workflow: bukan sekadar menjawab, tapi merapikan langkah kerja.</p>
        </section>

        <section id="llm" className="reveal">
          <p className="kicker">Level 1 · LLM</p>
          <h2>LLM: otak yang <span className="hl">pasif.</span></h2>
          <p className="lead">Kamu kasih input, dia kasih output. ChatGPT, Gemini, dan Claude adalah contohnya.</p>
          <div className="grid">
            <div className="card"><h3>✅ Kuat di</h3><p>Menulis, meringkas, menjelaskan, dan brainstorming. Untuk mengolah bahasa, dia sangat cepat.</p></div>
            <div className="card"><h3>⚠️ Batasnya</h3><p>Dia tidak bisa mengakses data pribadimu atau data real-time sendiri, dan tidak bisa bertindak. Tanpa dicek, dia bisa mengarang dengan percaya diri.</p></div>
          </div>
          <div className="chat" aria-live="polite">
            {chatSteps.slice(0, chatIdx).map((m, i) => (
              <div key={i} className={`bubble ${m.who}`}>{m.text}</div>
            ))}
          </div>
          <p className="hand">Analogi: teman pintar yang hanya menjawab kalau ditanya, tapi tidak pernah bangun dari kursi.</p>
        </section>

        <section id="workflow" className="reveal">
          <p className="kicker">Level 2 · AI Workflow</p>
          <h2>AI Workflow: jalurnya sudah <span className="hl">ditulis manusia.</span></h2>
          <p className="lead">LLM dirangkai dengan tools lewat jalur tetap: input → langkah yang sudah ditentukan → output. Manusia yang mendesain jalurnya.</p>
          <div className="flow">
            {pipeNodes.map((n, i) => (
              <span key={n} style={{ display: 'contents' }}>
                <div className={`node ${pipe === 99 && i === 1 ? 'stuck' : pipe > i ? 'done' : pipe === i + 1 ? 'on' : ''}`}>{n}{pipe === 99 && i === 1 ? ' — macet!' : ''}</div>
                {i < 3 && <span className="arrow">→</span>}
              </span>
            ))}
          </div>
          <button className="btn" onClick={runPipeline}>Jalankan workflow</button>{' '}
          <button className="btn" onClick={() => setPipe(99)}>Simulasi bahan tak terduga</button>
          <p className={pipe === 99 ? 'status bad' : 'status ok'}>
            {pipe === 99 ? 'Langkah 2 macet: format artikel tidak ada di skrip. Workflow yang kaku tidak bisa improvisasi — harus didesain ulang manusia.' : pipe === 4 ? 'Selesai: keempat node menyala hijau. Cocok untuk tugas berulang yang hasilnya harus bisa ditebak.' : 'Tekan “Jalankan workflow”, lalu coba simulasinya.'}
          </p>
          <p><strong>Kelebihan:</strong> stabil dan hemat. <strong>Kelemahan:</strong> kaku kalau kondisi di luar skrip muncul.</p>
          <p className="hand">Analogi: resep masak. Konsisten, tapi kalau bahan pengganti tidak ada di resep, kokinya bingung.</p>
        </section>

        <section id="agent" className="reveal">
          <p className="kicker">Level 3 · AI Agent</p>
          <h2>AI Agent: manusia memberi <span className="hl">tujuan, bukan langkah.</span></h2>
          <p className="lead">Inilah lompatan besarnya: pengambil keputusan manusianya diganti oleh LLM. Agent memutuskan sendiri langkah berikutnya dari hasil yang ia amati.</p>
          <div className="loop">
            {loopNames.map((n, i) => (
              <div key={n} className={`node ${loopIdx === i ? 'on' : ''}`}><strong>{n}</strong><br /><span className="small">{['Pikirkan cara terbaik', 'Pakai tools', 'Amati hasilnya', 'Perbaiki / ulangi'][i]}</span></div>
            ))}
          </div>
          <p><span className="pill">PUTARAN {turn}</span> — loop ini berputar otomatis sampai tujuan tercapai.</p>
          <div className="grid">
            <div className="card"><h3>ReAct</h3><p><strong>Reason + Act.</strong> Agent berpikir, lalu bertindak, dalam satu loop yang sama.</p></div>
            <div className="card"><h3>RAG</h3><p><strong>Retrieval-Augmented Generation.</strong> Sebelum menjawab, agent mengambil dulu data yang relevan — jadi jawabannya berdasar dokumen nyata, bukan cuma hafalan model.</p></div>
          </div>
          <p className="hand">Analogi: asisten yang disuruh “cari bahan terbaik”, lalu bolak-balik sendiri dan kembali membawa hasil.</p>
        </section>

        <section id="agentic" className="reveal">
          <p className="kicker">Level 4 · Agentic Workflow</p>
          <h2>Agentic Workflow: agent yang <span className="hl">diorkestrasi.</span></h2>
          <p className="lead">Ini bukan “agent yang lebih liar”. Ini sistem kerja lengkap: manusia menentukan tujuan, pagar, dan checkpoint — agent memilih langkah di dalam pagar itu, dan beberapa agent/tools bekerja sama.</p>
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
            <p className="status ok" style={{ marginTop: 14 }}>
              {sent ? '✅ TERKIRIM — setelah checkpoint manusia dilewati. Inilah gerbangnya.' : agents === 2 ? '⏳ Siap dikirim — tapi tombol kirim hanya aktif setelah kamu approve.' : agents === 1 ? '⏳ Para agent sedang bekerja…' : 'Jalankan orkestrasinya dulu, lalu perhatikan: status “terkirim” tidak akan muncul sebelum kamu approve.'}
            </p>
          </div>
          <p className="hand">Analogi: kalau agent itu satu koki hebat, agentic workflow itu dapur restoran — ada yang riset, ada yang masak, ada QC, dan kamu owner yang approve sebelum hidangan keluar.</p>
        </section>

        <section className="reveal">
          <p className="kicker">Perbandingan</p>
          <h2>Siapa yang memutuskan <span className="hl">langkah berikutnya?</span></h2>
          <div style={{ overflowX: 'auto' }}>
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
        </section>

        <section id="pilih" className="reveal">
          <p className="kicker">Panduan memilih</p>
          <h2>Jangan asal pakai agent. <span className="hl">Tanya dulu tugasnya.</span></h2>
          <div className="grid">
            <button className="card" style={{ textAlign: 'left' }} onClick={() => setChoice('workflow')}><h3>🛤️ Langkahnya sudah pasti?</h3><p>Pakai AI Workflow — lebih murah dan stabil.</p></button>
            <button className="card" style={{ textAlign: 'left' }} onClick={() => setChoice('agent')}><h3>🔍 Jalurnya berubah tergantung temuan?</h3><p>Pertimbangkan AI Agent.</p></button>
            <button className="card" style={{ textAlign: 'left' }} onClick={() => setChoice('agentic')}><h3>🧭 Panjang, multi-tools, dan salah kirim itu berisiko?</h3><p>Pakai Agentic Workflow + checkpoint manusia.</p></button>
          </div>
          {choice && <div className="note" style={{ marginTop: 16 }}><strong>Verdict: {choice === 'workflow' ? 'AI Workflow' : choice === 'agent' ? 'AI Agent' : 'Agentic Workflow'}</strong> — delegasikan eksekusi, bukan penilaian akhir.</div>}
          <div className="note" style={{ marginTop: 16 }}>
            <strong>Prinsipnya:</strong> delegasikan eksekusi, bukan penilaian akhir. Aksi yang tidak bisa dibatalkan — kirim, bayar, submit, hapus — tetap lewat approval manusia.
          </div>
        </section>

        <section className="reveal">
          <p className="kicker">Risiko &amp; tanggung jawab</p>
          <h2>Agent boleh cepat. <span className="hl">Verifikasi tetap milikmu.</span></h2>
          <div className="grid">
            <div className="card"><h3>🌀 Halusinasi</h3><p>Jawaban yang rapi belum tentu benar. Cek bukti akhirnya, bukan cuma klaimnya.</p></div>
            <div className="card"><h3>🔒 Data pribadi</h3><p>Jangan asal melempar data sensitif ke tools sembarangan.</p></div>
            <div className="card"><h3>🎓 Jangan serahkan belajar</h3><p>Agent boleh mempercepat riset dan draf, tapi pemahaman dan keputusan akhir tetap milikmu.</p></div>
          </div>
        </section>

        <section className="reveal">
          <p className="kicker">Penutup</p>
          <h2>AI tidak menggantikan kerja. <span className="hl">AI mengubah peranmu.</span></h2>
          <p className="lead">Dari eksekutor tiap langkah, menjadi pengarah, editor, dan approver. Tantangan minggu depan: pilih satu pekerjaan berulang, ubah jadi workflow dulu — baru naikkan ke agentic workflow kalau sudah stabil.</p>
          <p className="hand" style={{ fontSize: 28 }}>Mulai dari satu workflow kecil, minggu ini juga.</p>
        </section>

        <footer>
          <p><strong>Mengenal Agentic AI dan Agentic Workflow untuk Produktivitas Kerja</strong> — materi talk kampus untuk mahasiswa.</p>
          <p>Terinspirasi dari video Jeff Su, “AI Agents, Clearly Explained”: <a href="https://www.youtube.com/watch?v=FwOTs4UxQS4">youtube.com/watch?v=FwOTs4UxQS4</a></p>
          <p className="small">Versi web statis ini tidak memakai backend, database, atau environment variable — seluruh interaksinya berjalan di browser.</p>
        </footer>
      </div>
    </>
  )
}
