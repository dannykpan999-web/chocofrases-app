import Head from 'next/head'

const WA_NUMBER = process.env.NEXT_PUBLIC_WA_NUMBER || '5493517890449'
const WA_LINK   = `https://wa.me/${WA_NUMBER}?text=Hola%20Chocofrases%2C%20me%20gustar%C3%ADa%20hacer%20un%20pedido`

const BROWN = '#4A1C0A'
const AMBER = '#C88C50'

const products = [
  { name: 'Caja Especial x12',      price: '$1.800', desc: 'Selección artesanal de nuestros chocolates más queridos.',   emoji: '🍫' },
  { name: 'Caja Mixta x24',         price: '$3.200', desc: 'Variedad de sabores para compartir en cualquier ocasión.',    emoji: '🎁' },
  { name: 'Bombones Surtidos x6',   price: '$950',   desc: 'Bombones rellenos con ganache, maracuyá, dulce de leche.', emoji: '🍬' },
  { name: 'Tableta Artesanal 100g', price: '$650',   desc: 'Chocolate puro en barra, sin aditivos artificiales.',        emoji: '🍫' },
  { name: 'Trufas x10',             price: '$1.100', desc: 'Trufas envueltas en cacao y coco rallado.',                 emoji: '✨' },
  { name: 'Sachets x50',            price: '$2.500', desc: 'Ideal para kioscos y reventa.',                             emoji: '📦' },
]

const steps = [
  { n:'1', title:'Escribinos por WhatsApp', desc:'Mandanos un mensaje, audio o foto de tu lista. Nuestro sistema lo entiende todo.' },
  { n:'2', title:'Confirmamos tu pedido',   desc:'Te mostramos el resumen y el total. Vos solo decís SÍ para confirmar.' },
  { n:'3', title:'Lo preparamos y enviamos',desc:'Te avisamos cuando tu pedido está listo y cuándo llega a tu puerta.' },
]

export default function Home() {
  return (
    <>
      <Head>
        <title>Chocofrases — Chocolates Artesanales | Pedidos por WhatsApp</title>
        <meta name="description" content="Fábrica de chocolates artesanales en Córdoba, Argentina. Hacé tu pedido fácil y rápido por WhatsApp. Cajas, bombones, trufas y más." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="Chocofrases — Chocolates Artesanales" />
        <meta property="og:description" content="Pedidos por WhatsApp en segundos. Chocolates artesanales de Córdoba." />
        <meta property="og:type" content="website" />
      </Head>

      <div style={{ fontFamily: 'Inter, Calibri, sans-serif' }}>
        {/* NAVBAR */}
        <nav style={{ background: BROWN }} className="sticky top-0 z-50 shadow-md">
          <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
            <div>
              <span className="text-white font-bold text-xl">🍫 Chocofrases</span>
              <span className="text-amber-300 text-xs ml-3 hidden sm:inline">Fábrica Artesanal • Córdoba</span>
            </div>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-full transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Hacer pedido
            </a>
          </div>
        </nav>

        {/* HERO */}
        <section style={{ background: `linear-gradient(135deg, ${BROWN} 0%, #7B3F1A 100%)` }}
          className="py-20 px-5 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="text-7xl mb-6">🍫</div>
            <h1 className="text-white font-bold text-4xl sm:text-5xl leading-tight mb-4">
              Chocolates artesanales<br />
              <span style={{ color: AMBER }}>que se sienten distintos</span>
            </h1>
            <p className="text-amber-100 text-lg mb-8 max-w-xl mx-auto">
              Fabricados con amor en Córdoba. Pedidos rápidos por WhatsApp — en segundos tenés la confirmación.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white font-bold text-lg px-8 py-4 rounded-2xl transition-colors shadow-lg">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Hacer pedido por WhatsApp
              </a>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="py-16 px-5" style={{ background: '#FFF8F0' }}>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-center font-bold text-3xl mb-2" style={{ color: BROWN }}>¿Cómo funciona?</h2>
            <p className="text-center text-stone-500 mb-12">Tres pasos y tu pedido está confirmado</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {steps.map(s => (
                <div key={s.n} className="text-center">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4"
                    style={{ background: BROWN }}>
                    {s.n}
                  </div>
                  <h3 className="font-bold text-lg mb-2" style={{ color: BROWN }}>{s.title}</h3>
                  <p className="text-stone-500 text-sm leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRODUCTS */}
        <section className="py-16 px-5 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-center font-bold text-3xl mb-2" style={{ color: BROWN }}>Nuestros productos</h2>
            <p className="text-center text-stone-500 mb-12">Todos elaborados artesanalmente, sin conservantes</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(p => (
                <div key={p.name}
                  className="rounded-2xl p-6 border border-stone-100 shadow-sm hover:shadow-md transition-shadow"
                  style={{ background: '#FFF8F0' }}>
                  <div className="text-4xl mb-3">{p.emoji}</div>
                  <h3 className="font-bold text-lg" style={{ color: BROWN }}>{p.name}</h3>
                  <p className="text-stone-500 text-sm mt-1 mb-3 leading-relaxed">{p.desc}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xl" style={{ color: AMBER }}>{p.price}</span>
                    <a href={`${WA_LINK}&text=Hola%20Chocofrases%2C%20quiero%20pedir%20${encodeURIComponent(p.name)}`}
                      target="_blank" rel="noopener noreferrer"
                      className="text-sm font-medium underline" style={{ color: BROWN }}>
                      Pedir →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section style={{ background: BROWN }} className="py-16 px-5 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="text-5xl mb-4">🍫</div>
            <h2 className="text-white font-bold text-3xl mb-3">¿Listo para hacer tu pedido?</h2>
            <p className="text-amber-200 mb-8">Escribinos por WhatsApp. Texto, audio o foto — lo que te sea más cómodo.</p>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white font-bold text-lg px-8 py-4 rounded-2xl transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Escribinos ahora
            </a>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ background: '#2D0E05' }} className="py-8 px-5 text-center">
          <p className="text-amber-400 font-semibold">🍫 Chocofrases</p>
          <p className="text-stone-500 text-sm mt-1">Fábrica de Chocolates Artesanales · Córdoba, Argentina</p>
          <p className="text-stone-600 text-xs mt-3">© {new Date().getFullYear()} Chocofrases. Todos los derechos reservados.</p>
        </footer>

        {/* WhatsApp FAB */}
        <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
          className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-xl transition-colors z-50"
          title="Hacer pedido por WhatsApp">
          <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </a>
      </div>
    </>
  )
}
