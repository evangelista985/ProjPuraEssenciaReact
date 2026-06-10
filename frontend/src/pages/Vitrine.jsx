import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';

// ─────────────────────────────────────────────────────────────
//  CARROSSEL — edite os slides aqui para personalizar o conteúdo
// ─────────────────────────────────────────────────────────────
const SLIDES = [
  {
    src:      '/img/chaCamomila4.png',
    alt:      'Chás Naturais',
    badge:    '🍃 Chás & Ervas',
    title:    'Ritual de\nbem-estar\nnatural',
    subtitle: 'Camomila, hortelã, mate e muito mais — natureza em cada infusão.',
    cta1:     { label: 'Explorar Chás',  path: '/chas' },
    cta2:     { label: 'Ver Novidades',  path: '/produtos' },
  },
  {
    src:      '/img/temperoOregano_1.jpg',
    alt:      'Temperos & Especiarias',
    badge:    '🌿 Gastronomia & Aroma',
    title:    'Sabor\nautêntico\nda natureza',
    subtitle: 'Orégano, alecrim, manjericão — aroma e sabor em cada pitada.',
    cta1:     { label: 'Ver Temperos',   path: '/temperos' },
    cta2:     { label: 'Conhecer Tudo',  path: '/produtos' },
  },
  {
    src:      '/img/organicoCafe.jpg',
    alt:      'Produtos Orgânicos',
    badge:    '☕ Orgânicos Selecionados',
    title:    'Da terra\ndireto à\nsua mesa',
    subtitle: 'Do campo à sua xícara, sem aditivos e sem compromisso com a qualidade.',
    cta1:     { label: 'Ver Orgânicos',  path: '/organicos' },
    cta2:     { label: 'Todos os Produtos', path: '/produtos' },
  },
  {
    src:      'https://ciclovivo.com.br/wp-content/uploads/2019/09/cosmeticos-naturais-imagem.jpg',
    alt:      'Cosméticos Naturais',
    badge:    '🌸 Beleza Natural',
    title:    'Cuide-se\ncom a pureza\nda natureza',
    subtitle: 'Cosméticos desenvolvidos com ingredientes naturais e sustentáveis, respeitando sua pele.',
    cta1:     { label: 'Ver Cosméticos', path: '/cosmeticos' },
    cta2:     { label: 'Conhecer Tudo',  path: '/produtos' },
  },
];

export default function Vitrine() {
  const nav = useNavigate();
  const { adicionar } = useCart();
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slide, setSlide] = useState(0);
  const [prevSlide, setPrevSlide] = useState(null);
  const [slideProgress, setSlideProgress] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth <= 640);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 640);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const [gifUrl, setGifUrl] = useState('https://www.pexels.com/pt-br/download/video/11012202/');
  const [editingGif, setEditingGif] = useState(false);
  // ⚠️ INSIRA AS URLs DOS SEUS GIFs ABAIXO:
  const [aboutGifUrl, setAboutGifUrl] = useState('https://www.pexels.com/pt-br/download/video/4809178/');
  const [heroGifUrl, setHeroGifUrl] = useState('https://www.pexels.com/pt-br/download/video/11012202/');
  const [showSocialMenu, setShowSocialMenu] = useState(false);
  
  const SOCIAL_LINKS = [
    { icon: '📘', label: 'Facebook', url: 'https://www.facebook.com/friends/requests/?profile_id=100092841157612', color: '#1877F2' },
    { icon: '📷', label: 'Instagram', url: 'https://www.instagram.com/pura_essencia.official/', color: '#E4405F' },
    { icon: '💬', label: 'WhatsApp', url: 'https://wa.me', color: '#25D366' },
    { icon: '𝕏', label: 'Twitter', url: 'https://x.com/PuraEssenc91630', color: '#000000' },
    { icon: '✉️', label: 'Email', url: 'mailto:puraessenciaetec@gmail.com', color: '#D4AF37' },
  ];

  useEffect(() => { carregarProdutos(); }, []);

  // Auto-advance: loop infinito sem travar na animação
  useEffect(() => {
    setSlideProgress(0);
    const DURATION = 4000;
    const STEP = 50;
    let elapsed = 0;
    const prog = setInterval(() => {
      elapsed += STEP;
      setSlideProgress(Math.min((elapsed / DURATION) * 100, 100));
    }, STEP);
    const t = setTimeout(() => {
      // Avança direto pelo setter funcional, ignorando guard de animação
      setSlide(s => (s + 1) % SLIDES.length);
      setPrevSlide(s => s);
      setAnimating(true);
      setTimeout(() => {
        setPrevSlide(null);
        setAnimating(false);
      }, 900);
    }, DURATION);
    return () => { clearInterval(prog); clearTimeout(t); };
  }, [slide]);

  function goToSlide(next) {
    if (animating) return;
    if (next === slide) return;
    setPrevSlide(slide);
    setAnimating(true);
    setSlide(next);
    setTimeout(() => {
      setPrevSlide(null);
      setAnimating(false);
    }, 900);
  }

  async function carregarProdutos() {
    setLoading(true);
    try {
      const { data } = await api.get('/produtos');
      setProdutos(data);
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
      setProdutos([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={st.wrapper}>

      {/* ── Faixa promocional mobile ── */}
      {isMobile && (
        <div className="mobile-promo-banner" style={{ background: '#1C3A2A', color: '#F5F0E8', textAlign: 'center', padding: '0.5rem', fontSize: '0.75rem' }}>
          🌿 FRETE GRÁTIS <span>em pedidos acima de R$ 89</span>
        </div>
      )}

      {/* ── HERO BANNER ── */}
      <section style={{
        ...st.hero,
        ...(isMobile ? {display:'flex', flexDirection:'column', paddingTop:'0', minHeight:'auto'} : {}),
      }} className="vitrine-hero">
        <div style={{
          ...st.heroText,
          ...(isMobile ? {padding:'1.6rem 1rem 1.4rem', order:1, textAlign:'center'} : {}),
        }} className="vitrine-hero-text">
          <div style={{
            ...st.heroBadge,
            ...(isMobile ? {fontSize:'0.48rem', padding:'0.2rem 0.55rem', marginBottom:'0.6rem', alignSelf:'center', letterSpacing:'0.1em'} : {}),
          }}>
            <span style={st.heroBadgeDot} />
            100% natural · orgânico · sustentável
          </div>
          <h1 style={{
            ...st.heroTitle,
            ...(isMobile ? {fontSize:'clamp(1.1rem, 5vw, 1.45rem)', marginBottom:'0.5rem', lineHeight:1.2} : {}),
          }}>
            Natureza em cada<br /><em style={st.heroTitleEm}>detalhe da sua vida</em>
          </h1>
          <p style={{
            ...st.heroDesc,
            ...(isMobile ? {fontSize:'0.65rem', lineHeight:1.55, marginBottom:'0.85rem', maxWidth:'88%', margin:'0 auto 0.85rem', color:'#7A7060', fontWeight:400, letterSpacing:'0.01em'} : {}),
          }}>
            {isMobile ? (
              <>Cosméticos, suplementos e alimentos naturais<br />selecionados para sua saúde e bem-estar.</>
            ) : (
              'Cosméticos, suplementos e alimentos naturais cuidadosamente selecionados para sua saúde e bem-estar. Da natureza para você.'
            )}
          </p>
          <div style={{
            ...st.heroCta,
            ...(isMobile ? {justifyContent:'center', gap:'6px'} : {}),
          }}>
            <button className="btn-primary" style={{
              ...st.heroBtnPrimary,
              ...(isMobile ? {padding:'0.5rem 0.9rem', fontSize:'0.62rem', letterSpacing:'0.08em'} : {}),
            }} onClick={() => nav('/produtos')}>
              Explorar Produtos
            </button>
            <button className="btn-outline" style={{
              ...st.heroBtnOutline,
              ...(isMobile ? {padding:'0.5rem 0.9rem', fontSize:'0.62rem', letterSpacing:'0.08em'} : {}),
            }}
              onClick={() => document.getElementById('sobre')?.scrollIntoView({ behavior: 'smooth' })}>
              Nossa História
            </button>
          </div>
        </div>
        <div style={{
          ...st.heroImage,
          ...(isMobile ? {order:2, minHeight:'190px', maxHeight:'230px', height:'38vw'} : {}),
        }} className="vitrine-hero-image">
          <video
            src={heroGifUrl}
            autoPlay
            muted
            loop
            playsInline
            style={st.heroGif}
          />
          <div style={st.heroGifOverlay} />
          <div style={{...st.heroStats, ...(isMobile ? {display:'none'} : {})}}>
            <div style={st.heroStat}>
              <div style={st.statNum}>500+</div>
              <div style={st.statLabel}>Produtos</div>
            </div>
            <div style={st.heroStat}>
              <div style={st.statNum}>12k</div>
              <div style={st.statLabel}>Clientes</div>
            </div>
            <div style={st.heroStat}>
              <div style={st.statNum}>100%</div>
              <div style={st.statLabel}>Natural</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={st.statsSection} className="vitrine-stats">
        {[
          { num: '100%', label: 'Natural & Orgânico' },
          { num: '+500', label: 'Clientes Satisfeitos' },
          { num: '15+',  label: 'Produtos Premium' },
        ].map(s => (
          <div key={s.num} style={st.statItem}>
            <div style={st.statNum}>{s.num}</div>
            <div style={st.statLabel}>{s.label}</div>
          </div>
        ))}
      </section>

      {/* ── PRODUTOS ── */}
      <section style={{
        ...st.produtosSection,
        ...(isMobile ? {padding:'1.5rem 0.75rem'} : {}),
      }} className="vitrine-produtos-section">
        <div style={{...st.sectionHead, ...(isMobile ? {marginBottom:'1rem'} : {})}}>
          <span style={st.sectionLabel}>Catálogo</span>
          <h2 style={{
            ...st.secTitle,
            ...(isMobile ? {fontSize:'clamp(1.4rem, 5vw, 1.8rem)'} : {}),
          }}>Nossos Produtos</h2>
          {!isMobile && <p style={st.secDesc}>Seleção cuidadosa de produtos naturais para sua saúde e bem-estar</p>}
        </div>

        {loading ? (
          <p style={st.loading}>🌿 Carregando produtos...</p>
        ) : produtos.length === 0 ? (
          <p style={st.vazio}>Nenhum produto disponível no momento.</p>
        ) : (
          <div style={{
            ...st.produtosGrid,
            ...(isMobile ? {gridTemplateColumns:'repeat(2,1fr)', gap:'8px', marginBottom:'1.2rem'} : {}),
          }} className="vitrine-produtos-grid">
            {produtos.slice(0, 6).map(p => (
              <ProductCard
                key={p.id}
                produto={p}
                onClick={() => nav(`/produto/${p.id}`)}
                onAdd={e => { e.stopPropagation(); adicionar(p); }}
              />
            ))}
          </div>
        )}

        <div style={st.viewAllBtn}>
          <button className="btn-primary" onClick={() => nav('/produtos')}>
            Ver Todos os Produtos
          </button>
        </div>
      </section>

      {/* ── CARROSSEL COVERFLOW 3D ── */}
      <section style={st.carouselSection} className="vitrine-carousel-section">
        <style>{`
          .coverflow-wrap {
            perspective: none;
            perspective-origin: 50% 50%;
          }
          .cf-card {
            transition: transform 0.65s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                        opacity  0.65s ease;
            cursor: pointer;
            border-radius: 16px;
            overflow: hidden;
            will-change: transform, opacity;
          }
          .cf-card:hover { filter: brightness(1.07); }
          .cf-arrow-btn {
            background: rgba(255,255,255,0.15);
            backdrop-filter: blur(12px);
            border: 1.5px solid rgba(255,255,255,0.3);
            color: #F5F0E8;
            border-radius: 50%;
            width: 54px; height: 54px;
            font-size: 1.7rem;
            cursor: pointer;
            display: flex; align-items: center; justify-content: center;
            transition: background 0.2s, transform 0.15s;
            flex-shrink: 0;
            user-select: none;
            z-index: 20;
            position: relative;
          }
          .cf-arrow-btn:hover { background: rgba(255,255,255,0.28); transform: scale(1.1); }
          @media (max-width: 640px) {
            .cf-arrow-btn {
              width: 38px !important;
              height: 38px !important;
              font-size: 1.3rem !important;
            }
          }
          .cf-dot {
            width: 8px; height: 8px; border-radius: 50%;
            background: rgba(245,240,232,0.3);
            cursor: pointer;
            transition: background 0.3s, transform 0.3s;
          }
          .cf-dot.active { background: #C8A96E; transform: scale(1.45); }
        `}</style>

        <div style={st.cfSectionHead}>
          <span style={st.cfSectionLabel}>Destaques</span>
          <h2 style={st.cfSectionTitle}>Explore Nossa Coleção</h2>
        </div>

        <div style={{...st.cfOuter, gap: isMobile ? '0.8rem' : '2rem', padding: isMobile ? '0 0.8rem' : '0 2rem'}}>
          <button className="cf-arrow-btn" onClick={() => goToSlide((slide - 1 + SLIDES.length) % SLIDES.length)}>‹</button>

          <div className="coverflow-wrap" style={{...st.cfStage, height: isMobile ? '300px' : '460px'}}>
            {SLIDES.map((img, i) => {
              const total = SLIDES.length;
              let offset = i - slide;
              if (offset >  Math.floor(total / 2)) offset -= total;
              if (offset < -Math.floor(total / 2)) offset += total;
              const isCenter = offset === 0;
              const absOff   = Math.abs(offset);
              // No mobile mostra apenas o card central
              if (isMobile && absOff > 0) return null;
              // No desktop mostra centro + 1 de cada lado
              if (!isMobile && absOff > 1) return null;

              const cardW      = isMobile ? 240 : 330;
              const cardH      = isMobile ? 290 : 450;
              const translateX = isMobile ? 0 : offset * 280;
              const scale      = isCenter ? 1 : 0.78;
              const opacity    = isCenter ? 1 : 0.60;
              const zIdx       = isCenter ? 10 : 5;
              const translateZ = isCenter ? 0 : -130;
              return (
                <div
                  key={i}
                  className="cf-card"
                  onClick={() => !isCenter && goToSlide(i)}
                  style={{
                    position: 'absolute',
                    width: cardW,
                    height: cardH,
                    top: '50%',
                    left: '50%',
                    marginLeft: -cardW / 2,
                    marginTop: -cardH / 2,
                    zIndex: zIdx,
                    transform: `translateX(${translateX}px) translateZ(${translateZ}px) scale(${scale})`,
                    opacity,
                    boxShadow: isCenter
                      ? '0 32px 80px rgba(0,0,0,0.72)'
                      : '0 12px 36px rgba(0,0,0,0.45)',
                  }}
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    onError={e => { e.target.src = 'https://via.placeholder.com/300x420/1C3A2A/C8A96E?text=Pura+Ess%C3%AAncia'; }}
                  />
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: isCenter
                      ? 'linear-gradient(to top, rgba(10,25,16,0.96) 0%, rgba(10,25,16,0.5) 42%, transparent 100%)'
                      : 'linear-gradient(to top, rgba(10,25,16,0.98) 0%, rgba(10,25,16,0.6) 55%, rgba(0,0,0,0.25) 100%)',
                    borderRadius: 'inherit',
                  }} />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.4rem 1.3rem', zIndex: 2 }}>
                    <span style={{
                      display: 'inline-block',
                      fontSize: '0.58rem',
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                      color: '#E2C98A',
                      background: 'rgba(200,169,110,0.15)',
                      border: '1px solid rgba(200,169,110,0.4)',
                      borderRadius: '2px',
                      padding: '0.22rem 0.65rem',
                      marginBottom: '0.55rem',
                    }}>{img.badge}</span>
                    <h3 style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: isMobile ? '1.15rem' : (isCenter ? '1.45rem' : '1.1rem'),
                      fontWeight: 700,
                      color: '#F5F0E8',
                      lineHeight: 1.2,
                      marginBottom: '0.3rem',
                      transition: 'font-size 0.4s',
                    }}>{img.alt}</h3>
                    <p style={{
                      fontSize: isMobile ? '0.65rem' : '0.7rem',
                      color: 'rgba(245,240,232,0.6)',
                      lineHeight: 1.5,
                      marginBottom: isCenter ? '1rem' : '0',
                      maxHeight: isCenter ? '60px' : '0',
                      overflow: 'hidden',
                      transition: 'max-height 0.4s ease, margin 0.3s',
                    }}>{img.subtitle}</p>
                    {isCenter && (
                      <button
                        onClick={e => { e.stopPropagation(); nav(img.cta1.path); }}
                        style={{
                          background: 'rgba(245,240,232,0.95)',
                          color: '#1C3A2A',
                          border: 'none',
                          padding: '0.6rem 1.6rem',
                          borderRadius: '3px',
                          fontSize: '0.66rem',
                          fontWeight: 700,
                          letterSpacing: '0.12em',
                          textTransform: 'uppercase',
                          cursor: 'pointer',
                          fontFamily: "'Jost', sans-serif",
                          transition: 'background 0.2s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#C8A96E'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(245,240,232,0.95)'; }}
                      >{img.cta1.label}</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <button className="cf-arrow-btn" onClick={() => goToSlide((slide + 1) % SLIDES.length)}>›</button>
        </div>

        <div style={st.cfFooter}>
          <div style={st.cfDots}>
            {SLIDES.map((_, i) => (
              <div key={i} className={`cf-dot${i === slide ? ' active' : ''}`} onClick={() => goToSlide(i)} />
            ))}
          </div>
          <div style={st.cfProgressTrack}>
            <div style={{ ...st.cfProgressFill, width: `${slideProgress}%`, transition: 'width 0.05s linear' }} />
          </div>
        </div>
      </section>

      {/* ── SOBRE ── */}
      <section style={st.aboutSection} id="sobre" className="vitrine-about">
        <div style={{...st.aboutVisual, ...(isMobile ? {minHeight:200, maxHeight:220, padding:0} : {})}} className="vitrine-about-visual">
          <video
            src={aboutGifUrl}
            autoPlay
            muted
            loop
            playsInline
            style={{
              ...st.aboutAnimatedGif,
              ...(isMobile ? {height:'100%', maxHeight:'220px', objectFit:'cover'} : {}),
            }}
          />
        </div>
        <div style={st.aboutText} className="vitrine-about-text">
          <span style={st.sectionLabel}>Nossa história</span>
          <h2 style={st.sectionTitle}>
            Nascemos do <em style={{ fontStyle:'italic', color:'#A07840' }}>amor</em><br />pela natureza
          </h2>
          <p style={st.aboutPara}>
            A Pura Essência surgiu em 2018 de um desire simples: oferecer produtos realmente naturais,
            sem greenwashing, sem promessas vazias. Somos uma empresa familiar do interior de Minas Gerais.
          </p>
          <p style={st.aboutPara}>
            Cada produto em nosso catálogo é cuidadosamente selecionado ou produzido com ingredientes
            rastreáveis, respeito ao meio ambiente e aos produtores locais.
          </p>
          <div style={st.statsAbout}>
            {isMobile ? (
              /* Layout triangular no mobile: 2 em cima, 1 centralizado embaixo */
              <div style={{width:'100%'}}>
                <div style={{display:'flex', justifyContent:'center', alignItems:'flex-start', gap:0}}>
                  {[['6+','Anos de mercado'],['48','Fornecedores locais']].map(([n,l], i) => (
                    <>
                      <div key={n} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'4px',padding:'10px 20px'}}>
                        <div style={{...st.statAboutNum, fontSize:'2.2rem'}}>{n}</div>
                        <div style={{...st.statAboutLabel, textAlign:'center', fontSize:'0.62rem'}}>{l}</div>
                      </div>
                      {i === 0 && <div key="div" style={{width:'1px', height:'52px', background:'rgba(160,120,64,0.25)', alignSelf:'center', margin:'0 4px'}} />}
                    </>
                  ))}
                </div>
                {/* Linha conectora vertical */}
                <div style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
                  <div style={{width:'1px', height:'22px', background:'rgba(160,120,64,0.25)'}} />
                  <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'4px',padding:'6px 20px 10px'}}>
                    <div style={{...st.statAboutNum, fontSize:'2.2rem'}}>12k</div>
                    <div style={{...st.statAboutLabel, textAlign:'center', fontSize:'0.62rem'}}>Clientes felizes</div>
                  </div>
                </div>
              </div>
            ) : (
              [['6+','Anos de mercado'],['48','Fornecedores locais'],['12k','Clientes felizes']].map(([n,l]) => (
                <div key={n}>
                  <div style={st.statAboutNum}>{n}</div>
                  <div style={st.statAboutLabel}>{l}</div>
                </div>
              ))
            )}
          </div>
          
          {/* Caixa Expansível de Redes Sociais */}
          <div style={st.socialBoxContainer}>
            <button 
              style={st.socialBoxToggle}
              onClick={() => setShowSocialMenu(!showSocialMenu)}
            >
              <span style={st.socialBoxLabel}>
                {showSocialMenu ? '✕ Fechar' : '🌐 Conecte-se Conosco'}
              </span>
              <span style={{...st.socialBoxArrow, transform: showSocialMenu ? 'rotate(180deg)' : 'rotate(0deg)'}}>▼</span>
            </button>
            
            {showSocialMenu && (
              <div style={st.socialBoxContent}>
                <p style={st.socialBoxText}>Siga-nos nas redes sociais e fique por dentro das novidades:</p>
                <div style={st.socialLinksGrid}>
                  {SOCIAL_LINKS.map((link, idx) => (
                    <a
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{...st.socialLink, borderColor: link.color}}
                      title={link.label}
                    >
                      <span style={{fontSize: '1.5rem'}}>{link.icon}</span>
                      <span style={st.socialLinkLabel}>{link.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── ÁREA DO CLIENTE ── */}
      <section style={st.userSection} id="conta" className="vitrine-user-section">
        <div style={st.sectionHeader}>
          <span style={st.sectionLabel}>Área do Cliente</span>
          <h2 style={st.sectionTitle}>
            Sua conta <em style={{ fontStyle:'italic', color:'#A07840' }}>Pura Essência</em>
          </h2>
          <p style={st.sectionSub}>Gerencie seus pedidos, endereços e preferências com facilidade</p>
        </div>
        <div style={st.benefitCards}>
          {[
            { icon:'📦', t:'Acompanhe seus Pedidos', d:'Visualize o status de cada compra em tempo real, do pagamento até a entrega.' },
            { icon:'⭐', t:'Lista de Favoritos', d:'Salve os produtos que você ama e receba alertas de disponibilidade.' },
            { icon:'📍', t:'Endereços Salvos', d:'Cadastre seus endereços e finalize compras com muito mais praticidade.' },
          ].map(c => (
            <div key={c.t} style={st.benefitCard}>
              <div style={st.benefitIcon}>{c.icon}</div>
              <h4 style={st.benefitTitle}>{c.t}</h4>
              <p style={st.benefitDesc}>{c.d}</p>
            </div>
          ))}
        </div>
        <div style={st.authActions}>
          <Link to="/login" style={st.authBtnPrimary}>Acessar Minha Conta</Link>
          <Link to="/cadastro" style={st.authBtnOutline}>Criar Conta Grátis</Link>
        </div>
        <p style={st.authNote}>
          Já tem conta? <Link to="/login" style={{ color:'#1C3A2A', fontWeight:600 }}>Entre aqui</Link>
        </p>
      </section>

      {/* ── CTA FINAL ── */}
      <section style={st.ctaSection} className="vitrine-cta-section">
        <h2 style={st.ctaTitle}>Qualidade Garantida</h2>
        <p style={st.ctaDesc}>
          Todos os nossos produtos são certificados e selecionados com rigor para garantir sua qualidade e pureza.
        </p>
        <button className="btn-primary" style={{ marginTop:'2rem', background: '#1C3A2A', color: '#F5F0E8' }} onClick={() => nav('/produtos')}>
          Começar a Comprar
        </button>
      </section>
    </div>
  );
}

/* ── PRODUCT CARD ── */
function ProductCard({ produto, onClick, onAdd }) {
  const temEstoque = produto.quantidade > 0;
  const [added, setAdded] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth <= 640);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 640);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  function handleAdd(e) {
    e.stopPropagation();
    if (!temEstoque) return;
    onAdd(e);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  return (
    <div
      style={st.productCard}
      onClick={onClick}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(28,58,42,0.14)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.07)'; }}
    >
      {!temEstoque && <div style={st.productBadge}>Indisponível</div>}
      <div style={{...st.productImg, ...(isMobile ? {height:'130px'} : {})}}>
        <img
          src={produto.imagem || 'https://via.placeholder.com/300x220/F5F0E8/1C3A2A?text=Produto'}
          alt={produto.nome}
          style={st.productImgInner}
          onError={e => { e.target.src = 'https://via.placeholder.com/300x220/F5F0E8/1C3A2A?text=Produto'; }}
        />
        <div style={st.imgShimmer} />
      </div>
      <div style={{...st.productInfo, ...(isMobile ? {padding:'0.65rem 0.7rem 0.8rem'} : {})}}>
        <div style={{...st.productCategory, ...(isMobile ? {fontSize:'0.58rem'} : {})}}>{produto.categoria_nome || 'Natural'}</div>
        <div style={{...st.productName, ...(isMobile ? {fontSize:'0.8rem', minHeight:'2rem'} : {})}}>{produto.nome}</div>
        {!isMobile && <div style={st.productDesc}>{(produto.descricao || '').slice(0, 65)}{produto.descricao?.length > 65 ? '…' : ''}</div>}
        <div style={st.productFooter}>
          <span style={{...st.productPrice, ...(isMobile ? {fontSize:'0.95rem'} : {})}}>R$ {Number(produto.preco).toFixed(2).replace('.', ',')}</span>
          <button
            style={{
              ...st.addBtn,
              ...(isMobile ? {width:'30px', height:'30px', minWidth:'30px', minHeight:'30px', fontSize:'1.15rem', borderRadius:'50%', padding:0} : {}),
              ...(added ? st.addBtnAdded : {}),
              ...(!temEstoque ? st.addBtnDisabled : {}),
            }}
            disabled={!temEstoque}
            onClick={handleAdd}
            title="Adicionar ao carrinho"
          >
            {added ? '✓' : '+'}
          </button>
        </div>
      </div>
    </div>
  );
}

const st = {
  wrapper: { background: '#F5F0E8', minHeight: '100vh' },

  /* Hero */
  hero: {
    minHeight: '100vh',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    paddingTop: '68px',
  },
  heroText: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '5rem 3rem 5rem 4rem',
    background: '#F5F0E8',
  },
  heroBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: '#EDE7D8',
    border: '1px solid rgba(200,169,110,0.25)',
    padding: '0.4rem 1rem',
    borderRadius: '2rem',
    fontSize: '0.72rem',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    color: '#A07840',
    fontWeight: 500,
    width: 'fit-content',
    marginBottom: '2rem',
  },
  heroBadgeDot: {
    display: 'inline-block',
    width: 6,
    height: 6,
    background: '#C8A96E',
    borderRadius: '50%',
  },
  heroTitle: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 'clamp(3rem, 5vw, 4.5rem)',
    fontWeight: 300,
    lineHeight: 1.1,
    color: '#1C3A2A',
    marginBottom: '1.5rem',
  },
  heroTitleEm: {
    fontStyle: 'italic',
    color: '#A07840',
  },
  heroDesc: {
    color: '#6B6050',
    fontWeight: 300,
    maxWidth: '400px',
    marginBottom: '2.5rem',
    fontSize: '1rem',
    lineHeight: 1.8,
  },
  heroCta: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  heroBtnPrimary: {
    background: '#1C3A2A',
    color: '#F5F0E8',
  },
  heroBtnOutline: {
    borderColor: '#1C3A2A',
    color: '#1C3A2A',
  },
  heroImage: {
    background: '#1C3A2A',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroGif: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  heroGifOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(to top, rgba(28,58,42,0.75) 0%, rgba(28,58,42,0.25) 60%, rgba(28,58,42,0.15) 100%)',
    zIndex: 1,
  },
  heroStats: {
    zIndex: 2,
    position: 'absolute',
    bottom: '3rem',
    left: '3rem',
    display: 'flex',
    gap: '2.5rem',
  },
  heroStat: { color: '#F5F0E8' },

  /* Stats bar */
  statsSection: {
    display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
    background: '#FAF7F2', textAlign: 'center',
  },
  statItem: {
    padding: '2.5rem 1rem',
    borderRight: '1px solid rgba(200,169,110,0.18)',
  },
  statNum: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: '2.4rem', fontWeight: 300, color: '#C8A96E', lineHeight: 1, marginBottom: '0.4rem',
  },
  statLabel: { color: '#6B6050', fontSize: '0.85rem', fontWeight: 500, letterSpacing: '0.04em' },

  /* Produtos */
  produtosSection: {
    padding: 'clamp(3rem,6vw,5rem) clamp(1rem,4vw,3rem)',
    background: '#F5F0E8',
    maxWidth: 1280, margin: '0 auto', width: '100%',
  },
  sectionHead: { textAlign: 'center', marginBottom: '3rem' },
  secTitle: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 'clamp(2rem,3vw,2.6rem)',
    color: '#1C3A2A', marginBottom: '0.5rem', fontWeight: 600,
  },
  secDesc: { color: '#6B6050', fontSize: '1rem' },
  loading: { textAlign: 'center', padding: '3rem', color: '#1C3A2A' },
  vazio: { textAlign: 'center', padding: '3rem', color: '#6B6050' },
  produtosGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1.5rem',
    marginBottom: '3rem',
  },
  viewAllBtn: { textAlign: 'center' },

  /* Product card */
  productCard: {
    background: '#FAF7F2',
    borderRadius: '14px',
    overflow: 'hidden',
    cursor: 'pointer',
    position: 'relative',
    boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
    transition: 'transform 0.25s ease, box-shadow 0.25s ease',
    display: 'flex', flexDirection: 'column',
  },
  productBadge: {
    position: 'absolute', top: '0.6rem', right: '0.6rem',
    background: '#dc3545', color: '#fff',
    fontSize: '0.68rem', fontWeight: 700, padding: '3px 10px',
    borderRadius: '20px', zIndex: 10,
  },
  productImg: {
    width: '100%', height: '200px',
    background: '#EDE7D8',
    overflow: 'hidden', position: 'relative',
    flexShrink: 0,
  },
  productImgInner: {
    width: '100%', height: '100%', objectFit: 'cover', display: 'block',
    transition: 'transform 0.4s ease',
  },
  imgShimmer: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(180deg, transparent 60%, rgba(28,58,42,0.08) 100%)',
    pointerEvents: 'none',
  },
  productInfo: { padding: '1rem 1.1rem 1.2rem', flex: 1, display: 'flex', flexDirection: 'column' },
  productCategory: {
    fontSize: '0.65rem', color: '#A07840', fontWeight: 700,
    letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.35rem',
  },
  productName: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: '1.08rem', color: '#1C3A2A', fontWeight: 600,
    marginBottom: '0.4rem', lineHeight: 1.35,
    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
    minHeight: '2.7rem',
  },
  productDesc: {
    fontSize: '0.78rem', color: '#6B6050', lineHeight: 1.5,
    marginBottom: '0.9rem', flex: 1,
  },
  productFooter: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 'auto',
  },
  productPrice: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: '1.25rem', color: '#A07840', fontWeight: 700,
  },
  addBtn: {
    background: '#1C3A2A', color: '#F5F0E8', border: 'none',
    width: '34px', height: '34px', minWidth: '34px', minHeight: '34px',
    borderRadius: '50%', cursor: 'pointer',
    fontSize: '1.3rem', lineHeight: 1, padding: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'background 0.2s, transform 0.15s',
    fontWeight: 700, flexShrink: 0,
  },
  addBtnAdded: { background: '#3E7A52', transform: 'scale(1.15)' },
  addBtnDisabled: { background: '#C8C4BC', cursor: 'not-allowed' },

  /* ── CARROSSEL COVERFLOW ── */
  carouselSection: {
    background: '#0B1F12',
    overflow: 'hidden',
    paddingTop: '3.5rem',
    paddingBottom: '3rem',
  },
  cfSectionHead: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  cfSectionLabel: {
    display: 'inline-block',
    fontSize: '0.68rem',
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    color: '#C8A96E',
    fontWeight: 600,
    marginBottom: '0.5rem',
  },
  cfSectionTitle: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 'clamp(1.8rem, 3vw, 2.4rem)',
    fontWeight: 300,
    color: '#F5F0E8',
    margin: 0,
  },
  cfOuter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '2rem',
    padding: '0 2rem',
  },
  cfStage: {
    position: 'relative',
    width: '100%',
    maxWidth: '1000px',
    height: '460px',
    flexShrink: 1,
  },
  cfFooter: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
    marginTop: '2rem',
    padding: '0 2rem',
  },
  cfDots: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },
  cfProgressTrack: {
    width: '160px',
    height: '4px',
    background: 'rgba(245,240,232,0.15)',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  cfProgressFill: {
    height: '100%',
    background: '#C8A96E',
    borderRadius: '2px',
  },

  /* About */
  aboutSection: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    minHeight: 680,
  },
  aboutVisual: {
    background: '#2D5A3D',
    position: 'relative',
    overflow: 'hidden',
    minHeight: 680,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: '2rem',
  },
  gifContainer: {
    width: '320px',
    height: '320px',
    background: '#2D5A3D',
    borderRadius: '16px',
    overflow: 'hidden',
    flexShrink: 0,
    marginRight: '20px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.35), 0 0 1px rgba(0,0,0,0.1)',
    border: '2px solid rgba(200,169,110,0.2)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  },
  aboutGif: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  aboutSvgDecor: {
    display: 'none',
  },
  aboutGifOverlay: {
    display: 'none',
  },
  aboutText: {
    padding: 'clamp(4rem,8vw,7rem) clamp(2.5rem,5vw,5rem)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    background: '#F5F0E8',
  },
  sectionLabel: {
    display: 'inline-block', fontSize: '0.68rem', letterSpacing: '0.2em',
    textTransform: 'uppercase', color: '#A07840', fontWeight: 600, marginBottom: '0.8rem',
  },
  sectionTitle: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 'clamp(2rem,3vw,2.8rem)', fontWeight: 300, color: '#1C3A2A', lineHeight: 1.2,
  },
  aboutPara: { color: '#6B6050', fontWeight: 300, lineHeight: 1.9, marginBottom: '1rem' },
  statsAbout: { display: 'flex', gap: '2rem', marginTop: '1rem', flexWrap: 'wrap' },
  statAboutNum: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: '2rem', color: '#A07840', fontWeight: 300,
  },
  statAboutLabel: { fontSize: '0.75rem', color: '#6B6050', textTransform: 'uppercase', letterSpacing: '0.1em' },

  /* Área do Cliente */
  userSection: { background: '#EDE7D8', padding: 'clamp(3rem,6vw,5rem) 1.5rem' },
  sectionHeader: { textAlign: 'center', marginBottom: '3rem' },
  sectionSub: { color: '#6B6050', marginTop: '0.8rem', fontWeight: 300, fontSize: '0.92rem' },
  benefitCards: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1.5rem', maxWidth: 860, margin: '0 auto 3rem',
  },
  benefitCard: {
    background: '#FAF7F2', border: '1px solid rgba(200,169,110,0.2)',
    borderRadius: '12px', padding: '2rem 1.5rem', textAlign: 'center',
    transition: 'box-shadow 0.2s',
  },
  benefitIcon: { fontSize: '2rem', marginBottom: '1rem' },
  benefitTitle: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: '1.15rem', color: '#1C3A2A', fontWeight: 600, marginBottom: '0.5rem',
  },
  benefitDesc: { fontSize: '0.85rem', color: '#6B6050', lineHeight: 1.6 },
  authActions: {
    display: 'flex', gap: '1rem', justifyContent: 'center',
    flexWrap: 'wrap', marginBottom: '1rem',
  },
  authBtnPrimary: {
    background: '#1C3A2A', color: '#F5F0E8',
    padding: '0.9rem 2.5rem', borderRadius: '2px',
    fontFamily: "'Jost', sans-serif", fontSize: '0.78rem',
    fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase',
    textDecoration: 'none', display: 'inline-block',
  },
  authBtnOutline: {
    background: 'transparent', color: '#1C3A2A',
    padding: '0.9rem 2.5rem', borderRadius: '2px',
    border: '1px solid #1C3A2A',
    fontFamily: "'Jost', sans-serif", fontSize: '0.78rem',
    fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase',
    textDecoration: 'none', display: 'inline-block',
  },
  authNote: { textAlign: 'center', fontSize: '0.83rem', color: '#6B6050' },

  /* CTA */
  ctaSection: {
    background: '#E8F3ED', color: '#1C3A2A',
    padding: 'clamp(3rem,6vw,5rem) 2rem', textAlign: 'center',
    marginBottom: '2rem',
    borderTop: '1px solid rgba(45,90,61,0.1)',
  },
  ctaTitle: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 'clamp(2rem,3vw,2.8rem)', marginBottom: '1rem', fontWeight: 600,
    color: '#2D5A3D',
  },
  ctaDesc: {
    fontSize: '1rem', maxWidth: 560, margin: '0 auto',
    lineHeight: 1.75, color: '#4A5D52',
  },
  gifEditForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    padding: '20px',
    background: 'rgba(255,255,255,0.95)',
    borderRadius: '8px',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gifInput: {
    width: '100%',
    padding: '10px',
    border: '1px solid #C8A96E',
    borderRadius: '4px',
    fontSize: '0.9rem',
    fontFamily: "'Jost', sans-serif",
  },
  gifSaveBtn: {
    background: '#2D5A3D',
    color: '#FFF',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: 600,
  },
  gifCancelBtn: {
    background: '#E0E0E0',
    color: '#333',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: 600,
  },
  gifEditBtn: {
    position: 'absolute',
    bottom: '10px',
    right: '10px',
    background: 'rgba(200,169,110,0.8)',
    border: 'none',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    cursor: 'pointer',
    fontSize: '1.2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.2s',
  },
  aboutAnimatedGif: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
    animation: 'fadeIn 0.8s ease-in-out',
  },
  socialBoxContainer: {
    marginTop: '2rem',
    border: '2px solid #C8A96E',
    borderRadius: '12px',
    overflow: 'hidden',
    background: '#FAF7F2',
  },
  socialBoxToggle: {
    width: '100%',
    padding: '1.2rem 1.5rem',
    background: 'linear-gradient(135deg, #2D5A3D 0%, #1C3A2A 100%)',
    color: '#D4AF37',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    transition: 'all 0.3s ease',
    fontFamily: "'Jost', sans-serif",
  },
  socialBoxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  socialBoxArrow: {
    transition: 'transform 0.3s ease',
    fontSize: '0.8rem',
  },
  socialBoxContent: {
    padding: '1.5rem',
    background: '#FFF',
    animation: 'slideDown 0.3s ease-out',
  },
  socialBoxText: {
    color: '#6B6050',
    fontSize: '0.95rem',
    marginBottom: '1.2rem',
    fontWeight: 300,
    lineHeight: 1.6,
  },
  socialLinksGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
    gap: '1rem',
  },
  socialLink: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '1rem',
    borderRadius: '8px',
    border: '2px solid',
    textDecoration: 'none',
    color: '#1C3A2A',
    background: '#F5F0E8',
    transition: 'all 0.3s ease',
    fontFamily: "'Jost', sans-serif",
  },
  socialLinkLabel: {
    fontSize: '0.75rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
};
