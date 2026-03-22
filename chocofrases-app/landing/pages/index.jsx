import Head from 'next/head'
import { useState, useEffect, useRef } from 'react'

const WA_NUMBER = process.env.NEXT_PUBLIC_WA_NUMBER || '5493517890449'
const WA_BASE   = `https://wa.me/${WA_NUMBER}?text=`
const WA_ORDER  = WA_BASE + encodeURIComponent('Hola Chocofrases! Me gustaría hacer un pedido 🍫')

// ── Hero carousel slides ──────────────────────────────────────
const SLIDES = [
  {
    img:     'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=1920&q=90',
    tag:     'Bienvenidos a Chocofrases',
    title:   'El chocolate que\nse siente distinto',
    italic:  'se siente distinto',
    sub:     'Elaborados a mano en Córdoba con cacao seleccionado, sin conservantes artificiales.',
    cta:     'Hacer mi pedido',
  },
  {
    img:     'https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&w=1920&q=90',
    tag:     'Cajas & Bombones',
    title:   'Regalos que\nenamoran de verdad',
    italic:  'enamoran de verdad',
    sub:     'Bombones artesanales rellenos de ganache, maracuyá y dulce de leche cordobés. Perfectos para regalar.',
    cta:     'Ver productos',
    href:    '#productos',
  },
  {
    img:     'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?auto=format&fit=crop&w=1920&q=90',
    tag:     'Elaboración Artesanal',
    title:   'Cada pieza,\nhecha a mano',
    italic:  'hecha a mano',
    sub:     'Nuestro equipo controla cada detalle del proceso. Sin líneas industriales — solo pasión y dedicación.',
    cta:     'Nuestra historia',
    href:    '#nosotros',
  },
  {
    img:     'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1920&q=90',
    tag:     'Trufas & Tabletas',
    title:   'Sabores que\nno se olvidan',
    italic:  'no se olvidan',
    sub:     'Trufas de cacao belga, tabletas artesanales 100% puras y sachets para kioscos y distribuidoras.',
    cta:     'Pedir por WhatsApp',
  },
  {
    img:     'https://images.unsplash.com/photo-1481391032119-d89fee407e44?auto=format&fit=crop&w=1920&q=90',
    tag:     'Para Kioscos & Distribuidoras',
    title:   'Tu negocio merece\nlo mejor',
    italic:  'lo mejor',
    sub:     'Abastecemos kioscos y distribuidoras de toda la provincia. Pedidos rápidos por WhatsApp con remito incluido.',
    cta:     'Quiero ser distribuidor',
  },
]

// ── Unsplash images (free, high-res) ─────────────────────────
const IMG = {
  hero:    'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=1920&q=90',
  story:   'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?auto=format&fit=crop&w=900&q=85',
  making:  'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&w=900&q=85',
  p1:      'https://images.unsplash.com/photo-1548907040-4baa42d10919?auto=format&fit=crop&w=600&q=80',
  p2:      'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?auto=format&fit=crop&w=600&q=80',
  p3:      'https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&w=600&q=80',
  p4:      'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?auto=format&fit=crop&w=600&q=80',
  p5:      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80',
  p6:      'https://images.unsplash.com/photo-1481391032119-d89fee407e44?auto=format&fit=crop&w=600&q=80',
  g1:      'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=500&h=500&q=80',
  g2:      'https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&w=500&h=500&q=80',
  g3:      'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?auto=format&fit=crop&w=500&h=500&q=80',
  g4:      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=500&h=500&q=80',
  g5:      'https://images.unsplash.com/photo-1548907040-4baa42d10919?auto=format&fit=crop&w=500&h=500&q=80',
}

const products = [
  { name: 'Caja Especial x12',      price: '$1.800', desc: 'Una cuidadosa selección de nuestros chocolates más aclamados, presentada en caja de regalo.', img: IMG.p1, tag: 'MÁS VENDIDO' },
  { name: 'Caja Mixta x24',         price: '$3.200', desc: 'Variedad completa de sabores para compartir. Ideal para kioscos y distribuidores.',            img: IMG.p2, tag: 'IDEAL PARA REVENTA' },
  { name: 'Bombones Surtidos x6',   price: '$950',   desc: 'Bombones artesanales rellenos de ganache, maracuyá y dulce de leche cordobés.',               img: IMG.p3, tag: 'ARTESANAL' },
  { name: 'Tableta Artesanal 100g', price: '$650',   desc: 'Chocolate puro en tableta. Sin aditivos artificiales. Cacao seleccionado.',                    img: IMG.p4, tag: 'PURO CACAO' },
  { name: 'Trufas x10',             price: '$1.100', desc: 'Trufas de manteca de cacao envueltas en polvo de cacao belga y coco rallado tostado.',         img: IMG.p5, tag: 'PREMIUM' },
  { name: 'Sachets x50',            price: '$2.500', desc: 'Presentación para kioscos y puntos de venta. Alta rotación, excelente margen.',                 img: IMG.p6, tag: 'PARA KIOSCOS' },
]

const testimonials = [
  { name: 'María G.',   role: 'Kiosco El Centro, Córdoba',  text: 'Desde que empecé a vender Chocofrases, duplicé las ventas de chocolates. Los clientes los piden por nombre.' },
  { name: 'Carlos R.',  role: 'Distribuidora Norte',         text: 'La calidad es consistente en cada pedido. Y lo mejor es que puedo pedir por WhatsApp sin complicaciones.' },
  { name: 'Lucía M.',   role: 'Dietética Natural, Villa M.',text: 'Los bombones artesanales son un éxito total. Mis clientes los regalan en cumpleaños y aniversarios.' },
]

// ── WhatsApp SVG icon ─────────────────────────────────────────
const WhatsAppIcon = ({ size = 24 }) => (
  <svg width={size} height={size} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)

// ── Scroll reveal hook ────────────────────────────────────────
const useReveal = () => {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.15 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return [ref, visible]
}

const Reveal = ({ children, delay = 0, className = '' }) => {
  const [ref, visible] = useReveal()
  return (
    <div ref={ref} className={className} style={{
      opacity:    visible ? 1 : 0,
      transform:  visible ? 'translateY(0)' : 'translateY(32px)',
      transition: `opacity 0.8s ease ${delay}ms, transform 0.8s ease ${delay}ms`,
    }}>
      {children}
    </div>
  )
}

export default function Home() {
  const [scrolled, setScrolled]     = useState(false)
  const [activeTest, setActiveTest] = useState(0)
  const [menuOpen, setMenuOpen]     = useState(false)
  const [slide, setSlide]           = useState(0)
  const [prevSlide, setPrevSlide]   = useState(null)
  const [animating, setAnimating]   = useState(false)

  const goToSlide = (idx) => {
    if (animating || idx === slide) return
    setPrevSlide(slide)
    setAnimating(true)
    setSlide(idx)
    setTimeout(() => { setPrevSlide(null); setAnimating(false) }, 900)
  }
  const nextSlide = () => goToSlide((slide + 1) % SLIDES.length)
  const prevSlideBtn = () => goToSlide((slide - 1 + SLIDES.length) % SLIDES.length)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Auto-advance carousel every 5 seconds
  useEffect(() => {
    const t = setInterval(nextSlide, 5000)
    return () => clearInterval(t)
  }, [slide, animating])

  useEffect(() => {
    const t = setInterval(() => setActiveTest(p => (p + 1) % testimonials.length), 4000)
    return () => clearInterval(t)
  }, [])

  const GOLD   = '#C9A84C'
  const DARK   = '#0F0600'
  const BROWN  = '#2C1000'
  const CREAM  = '#FDF6EC'
  const LIGHT  = '#F5EDD8'

  return (
    <>
      <Head>
        <title>Chocofrases — Chocolates Artesanales | Córdoba, Argentina</title>
        <meta name="description" content="Fábrica de chocolates artesanales en Córdoba. Bombones, cajas regalo, trufas y tabletas. Pedidos rápidos por WhatsApp con confirmación instantánea." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title"       content="Chocofrases — Chocolates Artesanales" />
        <meta property="og:description" content="Chocolates artesanales de Córdoba. Pedí por WhatsApp en segundos." />
        <meta property="og:image"       content={IMG.hero} />
        <meta property="og:type"        content="website" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </Head>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: ${DARK}; color: ${LIGHT}; font-family: 'Inter', sans-serif; }
        h1,h2,h3,h4 { font-family: 'Playfair Display', serif; }

        .nav-link { color: ${LIGHT}; text-decoration: none; font-size: 13px; letter-spacing: 0.08em; font-weight: 500; opacity: 0.85; transition: opacity 0.2s; }
        .nav-link:hover { opacity: 1; color: ${GOLD}; }

        .btn-gold {
          display: inline-flex; align-items: center; gap: 10px;
          background: ${GOLD}; color: ${DARK};
          padding: 14px 32px; border-radius: 0; border: none; cursor: pointer;
          font-family: 'Inter', sans-serif; font-weight: 600; font-size: 13px;
          letter-spacing: 0.12em; text-transform: uppercase; text-decoration: none;
          transition: background 0.3s, transform 0.2s;
        }
        .btn-gold:hover { background: #E8C56A; transform: translateY(-1px); }

        .btn-outline {
          display: inline-flex; align-items: center; gap: 10px;
          background: transparent; color: ${GOLD};
          padding: 13px 32px; border: 1px solid ${GOLD}; border-radius: 0; cursor: pointer;
          font-family: 'Inter', sans-serif; font-weight: 500; font-size: 13px;
          letter-spacing: 0.12em; text-transform: uppercase; text-decoration: none;
          transition: background 0.3s, color 0.3s;
        }
        .btn-outline:hover { background: ${GOLD}; color: ${DARK}; }

        .product-card {
          position: relative; overflow: hidden; cursor: pointer;
          transition: transform 0.4s ease;
        }
        .product-card:hover { transform: translateY(-6px); }
        .product-card img { width: 100%; height: 280px; object-fit: cover; display: block; transition: transform 0.6s ease; }
        .product-card:hover img { transform: scale(1.05); }
        .product-card .overlay {
          position: absolute; bottom: 0; left: 0; right: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.4) 60%, transparent 100%);
          padding: 24px 20px 20px;
          transform: translateY(0);
          transition: all 0.4s;
        }
        .product-card .order-btn {
          opacity: 0; transform: translateY(8px);
          transition: opacity 0.3s, transform 0.3s;
          margin-top: 10px;
        }
        .product-card:hover .order-btn { opacity: 1; transform: translateY(0); }

        .gallery-img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.5s; }
        .gallery-item:hover .gallery-img { transform: scale(1.05); }
        .gallery-item { overflow: hidden; }

        .ticker-wrap { overflow: hidden; background: ${GOLD}; padding: 12px 0; }
        .ticker { display: flex; animation: ticker 20s linear infinite; white-space: nowrap; }
        .ticker-item { padding: 0 40px; font-size: 11px; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: ${DARK}; }
        @keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }

        .gold-line { width: 48px; height: 1px; background: ${GOLD}; margin: 16px auto; }
        .gold-line-left { width: 48px; height: 1px; background: ${GOLD}; margin: 16px 0; }

        .step-number {
          width: 64px; height: 64px; border: 1px solid ${GOLD};
          display: flex; align-items: center; justify-center: center;
          font-family: 'Playfair Display', serif; font-size: 24px; color: ${GOLD};
          margin: 0 auto 20px; flex-shrink: 0;
        }

        @media (max-width: 768px) {
          .hero-title { font-size: 38px !important; }
          .grid-2 { grid-template-columns: 1fr !important; }
          .grid-3 { grid-template-columns: 1fr !important; }
          .hide-mobile { display: none !important; }
          .gallery-grid { grid-template-columns: repeat(2, 1fr) !important; height: auto !important; }
          .hero-content-wrap { padding: 0 24px !important; }
        }
      `}</style>

      {/* ── NAVBAR ─────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '20px 48px',
        background: scrolled ? 'rgba(10,4,0,0.97)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? `1px solid rgba(201,168,76,0.15)` : 'none',
        transition: 'all 0.4s ease',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 22 }}>🍫</span>
          <div>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, color: LIGHT, letterSpacing: '0.05em' }}>Chocofrases</div>
            <div style={{ fontSize: 9, letterSpacing: '0.2em', color: GOLD, textTransform: 'uppercase' }}>Córdoba · Argentina</div>
          </div>
        </div>

        <div className="hide-mobile" style={{ display: 'flex', gap: 36, alignItems: 'center' }}>
          {[['#nosotros','Nosotros'],['#productos','Productos'],['#como-funciona','Cómo funciona'],['#contacto','Contacto']].map(([href, label]) => (
            <a key={href} href={href} className="nav-link">{label}</a>
          ))}
        </div>

        <a href={WA_ORDER} target="_blank" rel="noopener noreferrer" className="btn-gold hide-mobile" style={{ padding: '11px 24px', fontSize: 11 }}>
          <WhatsAppIcon size={15} /> Hacer pedido
        </a>
      </nav>

      {/* ── HERO CAROUSEL ──────────────────────────────────── */}
      <section style={{ position: 'relative', height: '100vh', minHeight: 640, overflow: 'hidden' }}>

        {/* Slide images — crossfade */}
        {SLIDES.map((s, i) => (
          <div key={i} style={{
            position: 'absolute', inset: 0,
            opacity: i === slide ? 1 : 0,
            transition: 'opacity 1s ease',
            zIndex: i === slide ? 1 : 0,
          }}>
            <img src={s.img} alt={s.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center',
                transform: i === slide ? 'scale(1.04)' : 'scale(1)',
                transition: 'transform 6s ease',
              }} />
            {/* Gradient overlay */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(120deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.45) 60%, rgba(0,0,0,0.25) 100%)' }} />
          </div>
        ))}

        {/* Slide content */}
        <div style={{ position: 'relative', zIndex: 10, height: '100%', display: 'flex', alignItems: 'center', padding: '0 80px' }}>
          {SLIDES.map((s, i) => (
            <div key={i} style={{
              position: 'absolute',
              maxWidth: 680,
              opacity:    i === slide ? 1 : 0,
              transform:  i === slide ? 'translateY(0)' : 'translateY(24px)',
              transition: 'opacity 0.9s ease 0.2s, transform 0.9s ease 0.2s',
              pointerEvents: i === slide ? 'auto' : 'none',
            }}>
              {/* Tag pill */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
                <div style={{ width: 32, height: 1, background: GOLD }} />
                <span style={{ fontSize: 10, letterSpacing: '0.3em', color: GOLD, textTransform: 'uppercase' }}>{s.tag}</span>
                <div style={{ width: 32, height: 1, background: GOLD }} />
              </div>

              {/* Title */}
              <h1 className="hero-title" style={{ fontSize: 68, fontWeight: 700, color: '#FFFFFF', lineHeight: 1.1, marginBottom: 0 }}>
                {s.title.split('\n').map((line, li) =>
                  line === s.italic
                    ? <span key={li}><br /><em style={{ color: GOLD }}>{line}</em></span>
                    : <span key={li}>{line}</span>
                )}
              </h1>

              {/* Gold divider */}
              <div style={{ width: 56, height: 1, background: GOLD, margin: '28px 0' }} />

              {/* Subtitle */}
              <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.75)', lineHeight: 1.8, marginBottom: 40, fontWeight: 300, maxWidth: 480 }}>
                {s.sub}
              </p>

              {/* CTAs */}
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <a href={s.href || WA_ORDER}
                  target={s.href ? undefined : '_blank'}
                  rel={s.href ? undefined : 'noopener noreferrer'}
                  className="btn-gold">
                  <WhatsAppIcon size={17} /> {s.cta}
                </a>
                <a href="#productos" className="btn-outline">Ver catálogo</a>
              </div>
            </div>
          ))}
        </div>

        {/* ── Arrow buttons ── */}
        <button onClick={prevSlideBtn} aria-label="Anterior"
          style={{ position: 'absolute', left: 28, top: '50%', transform: 'translateY(-50%)', zIndex: 20,
            width: 52, height: 52, border: `1px solid rgba(201,168,76,0.5)`, background: 'rgba(0,0,0,0.35)',
            color: GOLD, fontSize: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(4px)', transition: 'background 0.2s, border-color 0.2s',
          }}
          onMouseOver={e => { e.currentTarget.style.background='rgba(201,168,76,0.2)'; e.currentTarget.style.borderColor=GOLD }}
          onMouseOut={e =>  { e.currentTarget.style.background='rgba(0,0,0,0.35)';      e.currentTarget.style.borderColor='rgba(201,168,76,0.5)' }}
        >‹</button>

        <button onClick={nextSlide} aria-label="Siguiente"
          style={{ position: 'absolute', right: 28, top: '50%', transform: 'translateY(-50%)', zIndex: 20,
            width: 52, height: 52, border: `1px solid rgba(201,168,76,0.5)`, background: 'rgba(0,0,0,0.35)',
            color: GOLD, fontSize: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(4px)', transition: 'background 0.2s, border-color 0.2s',
          }}
          onMouseOver={e => { e.currentTarget.style.background='rgba(201,168,76,0.2)'; e.currentTarget.style.borderColor=GOLD }}
          onMouseOut={e =>  { e.currentTarget.style.background='rgba(0,0,0,0.35)';      e.currentTarget.style.borderColor='rgba(201,168,76,0.5)' }}
        >›</button>

        {/* ── Slide counter + dots ── */}
        <div style={{ position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)', zIndex: 20,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>

          {/* Dot progress */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {SLIDES.map((_, i) => (
              <button key={i} onClick={() => goToSlide(i)} aria-label={`Slide ${i + 1}`}
                style={{ width: i === slide ? 36 : 8, height: 8, borderRadius: 4, border: 'none',
                  cursor: 'pointer', background: i === slide ? GOLD : 'rgba(255,255,255,0.3)',
                  transition: 'all 0.4s ease', padding: 0,
                }} />
            ))}
          </div>

          {/* Slide number */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, color: GOLD, fontFamily: 'Playfair Display, serif', fontWeight: 600 }}>
              0{slide + 1}
            </span>
            <div style={{ width: 40, height: 1, background: 'rgba(255,255,255,0.3)' }} />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>0{SLIDES.length}</span>
          </div>
        </div>

        {/* ── Progress bar ── */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'rgba(255,255,255,0.08)', zIndex: 20 }}>
          <div style={{
            height: '100%', background: GOLD,
            width: `${((slide + 1) / SLIDES.length) * 100}%`,
            transition: 'width 0.6s ease',
          }} />
        </div>

        {/* ── Thumbnail strip (right side) ── */}
        <div className="hide-mobile" style={{ position: 'absolute', right: 28, top: '50%', transform: 'translateY(-50%)', zIndex: 20,
          display: 'flex', flexDirection: 'column', gap: 8, marginTop: 60 }}>
          {SLIDES.map((s, i) => (
            <button key={i} onClick={() => goToSlide(i)}
              style={{ width: 56, height: 40, padding: 0, border: i === slide ? `2px solid ${GOLD}` : '2px solid rgba(255,255,255,0.15)',
                cursor: 'pointer', overflow: 'hidden', transition: 'border-color 0.3s', background: 'none',
              }}>
              <img src={s.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover',
                filter: i === slide ? 'none' : 'brightness(0.5)', transition: 'filter 0.3s' }} />
            </button>
          ))}
        </div>

        {/* ── Scroll indicator ── */}
        <div style={{ position: 'absolute', bottom: 48, left: 80, zIndex: 20,
          display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 1, height: 48, background: `linear-gradient(to bottom, ${GOLD}, transparent)`, animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: 9, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', writingMode: 'vertical-rl' }}>scroll</span>
        </div>
      </section>

      {/* ── TICKER ─────────────────────────────────────────── */}
      <div className="ticker-wrap">
        <div className="ticker">
          {[...Array(8)].map((_, i) => (
            <span key={i} className="ticker-item">
              🍫 Chocolates Artesanales &nbsp;·&nbsp; Sin Conservantes &nbsp;·&nbsp; Pedidos por WhatsApp &nbsp;·&nbsp; Córdoba Argentina &nbsp;·&nbsp; Entrega a Domicilio &nbsp;·&nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* ── STATS ──────────────────────────────────────────── */}
      <section style={{ background: BROWN, padding: '64px 48px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', textAlign: 'center', gap: 32 }} className="grid-3">
          {[
            { n: '+6 años', label: 'de experiencia artesanal' },
            { n: '+500',    label: 'clientes en toda Córdoba' },
            { n: '100%',    label: 'elaboración artesanal propia' },
          ].map(s => (
            <Reveal key={s.n}>
              <div style={{ borderRight: '1px solid rgba(201,168,76,0.2)' }} className="hide-mobile" />
              <div style={{ padding: '0 24px' }}>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 48, color: GOLD, fontWeight: 700 }}>{s.n}</div>
                <div style={{ fontSize: 12, letterSpacing: '0.12em', color: 'rgba(245,237,216,0.6)', textTransform: 'uppercase', marginTop: 8 }}>{s.label}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── STORY ──────────────────────────────────────────── */}
      <section id="nosotros" style={{ background: DARK, padding: '120px 48px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }} className="grid-2">
          <Reveal>
            <div style={{ position: 'relative' }}>
              <img src={IMG.story} alt="Elaboración artesanal"
                style={{ width: '100%', aspectRatio: '4/5', objectFit: 'cover', display: 'block' }} />
              <div style={{
                position: 'absolute', bottom: -32, right: -32, width: 180, height: 180,
                background: GOLD, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              }} className="hide-mobile">
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 36, color: DARK, fontWeight: 700 }}>2018</div>
                <div style={{ fontSize: 10, letterSpacing: '0.15em', color: DARK, textTransform: 'uppercase', marginTop: 4 }}>Fundación</div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={150}>
            <div>
              <div style={{ fontSize: 10, letterSpacing: '0.3em', color: GOLD, textTransform: 'uppercase', marginBottom: 20 }}>Nuestra Historia</div>
              <h2 style={{ fontSize: 48, color: LIGHT, lineHeight: 1.15, marginBottom: 24 }}>
                Hechos con pasión,<br />
                <em style={{ color: GOLD }}>desde Córdoba</em>
              </h2>
              <div className="gold-line-left" />
              <p style={{ fontSize: 15, color: 'rgba(245,237,216,0.7)', lineHeight: 1.9, marginBottom: 20, fontWeight: 300 }}>
                Chocofrases nació en 2018 con una idea simple: hacer chocolates que las personas realmente sientan especiales. No de fábrica masiva, sino elaborados a mano, con cacao cuidadosamente seleccionado y recetas propias que evolucionaron durante años.
              </p>
              <p style={{ fontSize: 15, color: 'rgba(245,237,216,0.7)', lineHeight: 1.9, marginBottom: 36, fontWeight: 300 }}>
                Hoy abastecemos a kioscos, dietéticas y distribuidoras de toda la provincia, con pedidos rápidos por WhatsApp y entrega en tiempo récord.
              </p>
              <a href="#productos" className="btn-outline">Conocer nuestros productos</a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── PRODUCTS ───────────────────────────────────────── */}
      <section id="productos" style={{ background: '#0A0400', padding: '120px 48px' }}>
        <Reveal>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ fontSize: 10, letterSpacing: '0.3em', color: GOLD, textTransform: 'uppercase', marginBottom: 16 }}>Catálogo</div>
            <h2 style={{ fontSize: 48, color: LIGHT, marginBottom: 8 }}>Nuestros Chocolates</h2>
            <div className="gold-line" />
            <p style={{ fontSize: 14, color: 'rgba(245,237,216,0.55)', marginTop: 16, fontWeight: 300, letterSpacing: '0.03em' }}>
              Todos elaborados artesanalmente, sin conservantes artificiales
            </p>
          </div>
        </Reveal>

        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }} className="grid-3">
          {products.map((p, i) => (
            <Reveal key={p.name} delay={i * 80}>
              <div className="product-card">
                {p.tag && (
                  <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 3, background: GOLD, color: DARK, fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', padding: '5px 10px' }}>
                    {p.tag}
                  </div>
                )}
                <img src={p.img} alt={p.name} />
                <div className="overlay">
                  <h3 style={{ fontSize: 18, color: '#FFFFFF', fontFamily: 'Playfair Display, serif', marginBottom: 6 }}>{p.name}</h3>
                  <div style={{ fontSize: 20, color: GOLD, fontFamily: 'Playfair Display, serif', marginBottom: 8 }}>{p.price}</div>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, fontWeight: 300 }}>{p.desc}</p>
                  <a href={`${WA_BASE}${encodeURIComponent(`Hola Chocofrases! Quiero pedir: ${p.name}`)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="order-btn btn-gold" style={{ padding: '10px 20px', fontSize: 11 }}>
                    <WhatsAppIcon size={14} /> Pedir ahora
                  </a>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────── */}
      <section id="como-funciona" style={{ background: BROWN, padding: '120px 48px' }}>
        <Reveal>
          <div style={{ textAlign: 'center', marginBottom: 80 }}>
            <div style={{ fontSize: 10, letterSpacing: '0.3em', color: GOLD, textTransform: 'uppercase', marginBottom: 16 }}>Simple y rápido</div>
            <h2 style={{ fontSize: 48, color: LIGHT }}>¿Cómo hacer un pedido?</h2>
            <div className="gold-line" />
          </div>
        </Reveal>

        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 48, textAlign: 'center' }} className="grid-3">
          {[
            { n: '01', title: 'Escribinos por WhatsApp', desc: 'Mandá un mensaje de texto, un audio con tu pedido, o una foto de tu lista. Lo entendemos todo.' },
            { n: '02', title: 'Confirmamos el total',     desc: 'Te mostramos el resumen del pedido y el precio exacto. Vos simplemente decís SÍ para confirmar.' },
            { n: '03', title: 'Preparamos y enviamos',    desc: 'Tu pedido entra en preparación y te avisamos en cada etapa hasta que llega a tu puerta.' },
          ].map((s, i) => (
            <Reveal key={s.n} delay={i * 120}>
              <div>
                <div style={{ width: 72, height: 72, border: `1px solid ${GOLD}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontFamily: 'Playfair Display, serif', fontSize: 22, color: GOLD }}>
                  {s.n}
                </div>
                <h3 style={{ fontSize: 20, color: LIGHT, marginBottom: 14, fontFamily: 'Playfair Display, serif' }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: 'rgba(245,237,216,0.6)', lineHeight: 1.8, fontWeight: 300 }}>{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={200}>
          <div style={{ textAlign: 'center', marginTop: 64 }}>
            <a href={WA_ORDER} target="_blank" rel="noopener noreferrer" className="btn-gold">
              <WhatsAppIcon size={18} /> Hacer mi primer pedido
            </a>
          </div>
        </Reveal>
      </section>

      {/* ── GALLERY STRIP ──────────────────────────────────── */}
      <div className="gallery-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', height: 320 }}>
        {[IMG.g1, IMG.g2, IMG.g3, IMG.g4, IMG.g5].map((src, i) => (
          <div key={i} className="gallery-item">
            <img src={src} alt={`Chocofrases ${i + 1}`} className="gallery-img" />
          </div>
        ))}
      </div>

      {/* ── MAKING OF ──────────────────────────────────────── */}
      <section style={{ background: DARK, padding: '120px 48px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }} className="grid-2">
          <Reveal delay={100}>
            <div>
              <div style={{ fontSize: 10, letterSpacing: '0.3em', color: GOLD, textTransform: 'uppercase', marginBottom: 20 }}>Elaboración Propia</div>
              <h2 style={{ fontSize: 44, color: LIGHT, lineHeight: 1.2, marginBottom: 24 }}>
                Cada pieza,<br />
                <em style={{ color: GOLD }}>hecha a mano</em>
              </h2>
              <div className="gold-line-left" />
              <p style={{ fontSize: 15, color: 'rgba(245,237,216,0.7)', lineHeight: 1.9, marginBottom: 20, fontWeight: 300 }}>
                No usamos líneas de producción industrial. Cada bombón, cada tableta y cada trufa pasa por las manos de nuestro equipo, que controla cada detalle del proceso.
              </p>
              <p style={{ fontSize: 15, color: 'rgba(245,237,216,0.7)', lineHeight: 1.9, marginBottom: 36, fontWeight: 300 }}>
                Trabajamos con cacao de origen seleccionado, manteca de cacao pura y rellenos elaborados en nuestra propia fábrica en Córdoba.
              </p>
              <div style={{ display: 'flex', gap: 32, marginBottom: 40 }}>
                {[['Sin conservantes artificiales'],['Cacao seleccionado'],['Rellenos propios']].map(([t]) => (
                  <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 6, height: 6, background: GOLD, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: 'rgba(245,237,216,0.7)', fontWeight: 300 }}>{t}</span>
                  </div>
                ))}
              </div>
              <a href={WA_ORDER} target="_blank" rel="noopener noreferrer" className="btn-gold">
                <WhatsAppIcon size={16} /> Quiero probarlos
              </a>
            </div>
          </Reveal>

          <Reveal>
            <img src={IMG.making} alt="Proceso de elaboración artesanal"
              style={{ width: '100%', aspectRatio: '4/5', objectFit: 'cover', display: 'block' }} />
          </Reveal>
        </div>
      </section>

      {/* ── TESTIMONIALS ───────────────────────────────────── */}
      <section style={{ background: '#0A0400', padding: '120px 48px', textAlign: 'center' }}>
        <Reveal>
          <div style={{ fontSize: 10, letterSpacing: '0.3em', color: GOLD, textTransform: 'uppercase', marginBottom: 16 }}>Lo que dicen</div>
          <h2 style={{ fontSize: 44, color: LIGHT, marginBottom: 8 }}>Nuestros Clientes</h2>
          <div className="gold-line" />
        </Reveal>

        <Reveal delay={150}>
          <div style={{ maxWidth: 640, margin: '48px auto 0', minHeight: 160 }}>
            {testimonials.map((t, i) => (
              <div key={i} style={{
                display: i === activeTest ? 'block' : 'none',
                animation: 'fadeIn 0.6s ease',
              }}>
                <div style={{ fontSize: 64, color: GOLD, fontFamily: 'Georgia, serif', lineHeight: 0.8, marginBottom: 24 }}>"</div>
                <p style={{ fontSize: 18, color: LIGHT, lineHeight: 1.8, fontStyle: 'italic', fontFamily: 'Playfair Display, serif', marginBottom: 28 }}>
                  {t.text}
                </p>
                <div style={{ fontSize: 13, color: GOLD, fontWeight: 600, letterSpacing: '0.05em' }}>{t.name}</div>
                <div style={{ fontSize: 11, color: 'rgba(245,237,216,0.45)', marginTop: 4, letterSpacing: '0.08em' }}>{t.role}</div>
              </div>
            ))}
          </div>

          {/* Dots */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 40 }}>
            {testimonials.map((_, i) => (
              <button key={i} onClick={() => setActiveTest(i)}
                style={{ width: i === activeTest ? 28 : 8, height: 8, borderRadius: 4, border: 'none', cursor: 'pointer', background: i === activeTest ? GOLD : 'rgba(201,168,76,0.3)', transition: 'all 0.3s' }} />
            ))}
          </div>
        </Reveal>
      </section>

      {/* ── CTA ────────────────────────────────────────────── */}
      <section id="contacto" style={{ position: 'relative', padding: '140px 48px', overflow: 'hidden' }}>
        <img src={IMG.hero} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.2)' }} />
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
          <Reveal>
            <div style={{ fontSize: 10, letterSpacing: '0.3em', color: GOLD, textTransform: 'uppercase', marginBottom: 20 }}>Contacto</div>
            <h2 style={{ fontSize: 52, color: '#FFFFFF', lineHeight: 1.15, marginBottom: 20 }}>
              ¿Listo para hacer<br />
              <em style={{ color: GOLD }}>tu pedido?</em>
            </h2>
            <div className="gold-line" />
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, margin: '24px auto 40px', maxWidth: 480, fontWeight: 300 }}>
              Escribinos por WhatsApp. Mandá un mensaje, un audio o la foto de tu lista — en minutos tenés la confirmación.
            </p>
            <a href={WA_ORDER} target="_blank" rel="noopener noreferrer" className="btn-gold" style={{ padding: '18px 48px', fontSize: 14 }}>
              <WhatsAppIcon size={20} /> Escribinos ahora
            </a>
          </Reveal>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer style={{ background: '#050200', padding: '64px 48px 32px', borderTop: `1px solid rgba(201,168,76,0.12)` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 48, marginBottom: 48 }} className="grid-3">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <span style={{ fontSize: 24 }}>🍫</span>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: LIGHT }}>Chocofrases</div>
              </div>
              <p style={{ fontSize: 13, color: 'rgba(245,237,216,0.45)', lineHeight: 1.8, maxWidth: 280, fontWeight: 300 }}>
                Fábrica de chocolates artesanales en Córdoba, Argentina. Elaboramos cada pieza con cuidado y pasión desde 2018.
              </p>
            </div>

            <div>
              <div style={{ fontSize: 10, letterSpacing: '0.2em', color: GOLD, textTransform: 'uppercase', marginBottom: 20 }}>Navegación</div>
              {[['#nosotros','Nosotros'],['#productos','Productos'],['#como-funciona','Cómo funciona'],['#contacto','Contacto']].map(([href, label]) => (
                <a key={href} href={href} style={{ display: 'block', color: 'rgba(245,237,216,0.5)', fontSize: 13, textDecoration: 'none', marginBottom: 10, transition: 'color 0.2s' }}
                  onMouseOver={e => e.target.style.color = GOLD} onMouseOut={e => e.target.style.color = 'rgba(245,237,216,0.5)'}>
                  {label}
                </a>
              ))}
            </div>

            <div>
              <div style={{ fontSize: 10, letterSpacing: '0.2em', color: GOLD, textTransform: 'uppercase', marginBottom: 20 }}>Contacto</div>
              <a href={WA_ORDER} target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#25D366', fontSize: 13, textDecoration: 'none', marginBottom: 12 }}>
                <WhatsAppIcon size={15} /> WhatsApp
              </a>
              <p style={{ fontSize: 13, color: 'rgba(245,237,216,0.45)', marginBottom: 8 }}>📍 Córdoba, Argentina</p>
              <p style={{ fontSize: 13, color: 'rgba(245,237,216,0.45)' }}>🕐 Lun – Sáb, 8:00 – 20:00 hs</p>
            </div>
          </div>

          <div style={{ borderTop: `1px solid rgba(201,168,76,0.1)`, paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <p style={{ fontSize: 11, color: 'rgba(245,237,216,0.3)', letterSpacing: '0.05em' }}>
              © {new Date().getFullYear()} Chocofrases. Todos los derechos reservados.
            </p>
            <p style={{ fontSize: 11, color: 'rgba(245,237,216,0.2)', letterSpacing: '0.05em' }}>
              Elaboración artesanal propia · Córdoba, Argentina
            </p>
          </div>
        </div>
      </footer>

      {/* ── FLOATING WhatsApp FAB ───────────────────────────── */}
      <a href={WA_ORDER} target="_blank" rel="noopener noreferrer"
        title="Hacer pedido por WhatsApp"
        style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 200,
          width: 58, height: 58, borderRadius: '50%',
          background: '#25D366', color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(37,211,102,0.4)',
          transition: 'transform 0.2s, box-shadow 0.2s',
          textDecoration: 'none',
        }}
        onMouseOver={e => { e.currentTarget.style.transform='scale(1.1)'; e.currentTarget.style.boxShadow='0 6px 28px rgba(37,211,102,0.55)' }}
        onMouseOut={e => { e.currentTarget.style.transform='scale(1)'; e.currentTarget.style.boxShadow='0 4px 20px rgba(37,211,102,0.4)' }}
      >
        <WhatsAppIcon size={28} />
      </a>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100% { opacity: 0.3; } 50% { opacity: 1; } }
      `}</style>
    </>
  )
}
