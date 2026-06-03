import { useState, useEffect, useRef } from 'react'

const LANGS = {
  de: {
    placeholder: 'Stellen Sie eine Frage zur Reise...',
    welcome: 'Herzlich willkommen! Ich bin Ihr persönlicher **OPCO-AI Reise-Assistent** für die **Brasilien Rundreise**.\n\nIch begleite Sie auf Ihrer **11-tägigen Reise** durch Rio de Janeiro, Iguazú und den Amazonas-Dschungel.\n\n**Wie kann ich Ihnen heute helfen?**',
    suggestions: ['Tagesablauf anzeigen', 'Hotels & Unterkünfte', 'Was ist inbegriffen?', 'Amazonas-Tipps', 'Preise & Termine', 'Notfall-Kontakte'],
    sysLang: 'Antworte IMMER auf Deutsch. Sei freundlich, präzise und enthusiastisch. Nutze Emojis sparsam.',
  },
  pt: {
    placeholder: 'Faça uma pergunta sobre a viagem...',
    welcome: 'Olá! Bem-vindo ao **OPCO-AI Reise-Assistent** para o **Roteiro Brasil**!\n\nEstou aqui para ajudá-lo durante os **11 dias** pelo Rio de Janeiro, Iguaçu e Amazônia.\n\n**Como posso te ajudar hoje?**',
    suggestions: ['Ver roteiro dia a dia', 'Hotéis e hospedagem', 'O que está incluído?', 'Dicas Amazônia', 'Preços e datas', 'Contatos de emergência'],
    sysLang: 'Responda SEMPRE em português brasileiro. Seja amigável, preciso e entusiasmado. Use emojis com moderação.',
  },
  en: {
    placeholder: 'Ask a question about the trip...',
    welcome: "Welcome! I'm your **OPCO-AI Travel Assistant** for the **Brazil Roundtrip**.\n\nI'm here to help throughout your **11-day journey** through Rio de Janeiro, Iguazú and the Amazon.\n\n**How can I help you today?**",
    suggestions: ['Show daily itinerary', 'Hotels & accommodation', "What's included?", 'Amazon tips', 'Prices & dates', 'Emergency contacts'],
    sysLang: 'ALWAYS respond in English. Be friendly, precise and enthusiastic. Use emojis sparingly.',
  },
  es: {
    placeholder: 'Haz una pregunta sobre el viaje...',
    welcome: '¡Bienvenido! Soy tu **OPCO-AI Asistente de Viaje** para el **Circuito por Brasil**.\n\nEstoy aquí para ayudarte durante los **11 días** por Río de Janeiro, Iguazú y la Amazonia.\n\n**¿En qué puedo ayudarte hoy?**',
    suggestions: ['Ver itinerario día a día', 'Hoteles y alojamiento', '¿Qué está incluido?', 'Consejos Amazonia', 'Precios y fechas', 'Contactos de emergencia'],
    sysLang: 'Responde SIEMPRE en español. Sé amigable, preciso y entusiasta. Usa emojis con moderación.',
  },
}

const TRIP = `VIAJE: Brasilien Rundreise — Rio de Janeiro · Iguazú · Amazonas-Dschungel (Zubucherreise)
RUTA: Rio de Janeiro → Foz do Iguaçu → Manaus → Amazon Ecopark → Frankfurt
OPERADOR: OPCO Tours | opcotours.com | +5521975655173 | carlos@opcotours.com | Kontakt: Carlos Silva
DURACIÓN: 11 Tage / 10 Nächte | GRUPO: ab 2 Personen | GUÍAS: Deutschsprachige Privatführung bei jeder Ankunft und Hauptaktivität

PREISE:
- 02/04 Personen: USD 3.912,00 pro Person
- 05/08 Personen: USD 3.084,00 pro Person
- 09/15 Personen: USD 2.937,00 pro Person
- 16+ Personen: USD 2.820,00 pro Person
- Einzelzimmer-Zuschlag: USD 1.173,00

GEPLANTE ABREISEDATEN:
- 12.11.2026 → 22.11.2026
- 15.11.2026 → 25.11.2026
- 22.11.2026 → 02.12.2026
- 29.11.2026 → 09.12.2026
- 01.12.2026 → 11.12.2026
- 03.01.2027 → 13.01.2027
- 19.01.2027 → 29.01.2027

Diese Reise passt zu den folgenden Kreuzfahrtschiff-Ankünften in Rio de Janeiro:
AIDA Sol (12.11.2026), MSC Divina (15.11.2026), Costa Diadema (22.11.2026), MSC Splendida (29.11.2026), MSC Vistuosa (01.12.2026), Amadea (03.01.2027), Costa Serena / MSC Musica (19.01.2027)

UNTERKÜNFTE:
1. Hilton Rio de Janeiro Copacabana — Rio de Janeiro | 3 Nächte | ÜF (Übernachtung mit Frühstück)
   Avenida Atlantica 1020, Rio de Janeiro, 22010-000 | Tel: +55 21 3501-8000
   Direkt an der Copacabana-Strandpromenade. Rooftop-Pool, Restaurants, Spa, Fitnesscenter.

2. Recanto Cataratas Thermas Resort & Convention — Foz do Iguacu | 2 Nächte | ÜF
   Avenida Costa e Silva 3500, Foz do Iguaçu | Tel: +55 45 2102-3000
   501 Zimmer und Suiten, Thermalbäder, Spa, Poolanlage, in Naturnähe.

3. Blue Tree Premium Manaus — Manaus | 1 Nacht | VP+ (Vollpension Plus: Frühstück, Mittagessen, Abendessen + Aktivitäten)
   Av Umberto Calderaro Filho 817, Adrianópolis, Manaus | Tel: +55 92 3303-2000
   153 Apartments, Pool, Spa, Restaurant, Businesscenter.

4. Amazon Ecopark Jungle Lodge — Staat Amazonas | 3 Nächte | ÜF
   Igarapé Ecopark s/n, Tarumã, Manaus, AM 69025-090 | Tel: +55 92 3622-2612
   70 Apartments (Standard, Superior, Superior-Plus), natürliche Pools, Privatstrand am Rio Tarumã (Nebenfluss des Rio Negro).

5. Reise über Nacht — 1 Nacht (Bootsrückfahrt / Flug Richtung Frankfurt)

LEGENDE:
ÜF = Übernachtung mit Frühstück
VP+ = Vollpension Plus (Frühstück, Mittagessen, Abendessen und Aktivitäten)

--- TAGESPLAN ---

Tag 1: ANKUNFT IN RIO DE JANEIRO | Willkommen in der Cidade Maravilhosa
Ankunft am Hafen Rio de Janeiro. Deutschsprachiger Reiseleiter empfängt Sie mit Namensschild. Komfortabler Transfer zum Hilton Copacabana (ca. 20 Min.). Check-in. Freier Abend: Caipirinha auf der Terrasse, Füße im Sand, Carioca-Sonnenuntergang mit Blick auf den Zuckerhut.
Bonus: Im Reiseprogramm enthalten ist ein Hubby-eSIM-Gutschein mit 1 GB Datenvolumen — kostenloses Internet während des gesamten Brasilien-Aufenthalts. Code erhalten Sie von der Reiseleitung.
INKLUSIVE: Transfer Hafen → Hotel | Check-in | Willkommens-Caipirinha
MAHLZEITEN: —
UNTERKUNFT: Hilton Rio de Janeiro Copacabana

Tag 2: RIO — ZUCKERHUT
Halbtagesausflug (ca. 4 Std.) auf den Pão de Açúcar (396 m). Seilbahn in zwei Etappen: Morro da Urca → Zuckerhut-Gipfel. Panoramablick über Copacabana, Ipanema, Leblon, Guanabara-Bucht, Corcovado. Deutschsprachige Reiseleitung erklärt Geschichte und Geologie. Nachmittag frei für Strand oder Pool.
AKTIVITÄTEN: Stadtrundfahrt mit Besichtigung Zuckerhut
MAHLZEITEN: F (Frühstück)
UNTERKUNFT: Hilton Rio de Janeiro Copacabana

Tag 3: RIO — CORCOVADO & CHRISTUS DER ERLÖSER
Halbtagesausflug (ca. 4 Std.) auf den Corcovado (710 m) — eines der Neuen Sieben Weltwunder. Fahrt durch den Tijuca-Nationalpark (größter städtischer Regenwald der Welt). 38 m hohe Christusstatue im Art-déco-Stil. 360-Grad-Panorama über Rio: Strände, Guanabara-Bucht, Zuckerhut.
AKTIVITÄTEN: Stadtrundfahrt mit Besichtigung Corcovado
MAHLZEITEN: F
UNTERKUNFT: Hilton Rio de Janeiro Copacabana

Tag 4: FLUG NACH FOZ DO IGUAÇU — BRASILIANISCHE SEITE DER FÄLLE
Nach dem Frühstück Transfer zum Flughafen GIG. Flug nach Foz do Iguaçu (Umsteigen möglich in GRU oder BSB). Empfang am Flughafen IGU, Transfer zum Recanto Cataratas Resort (ca. 20 Min.). Ausflug zur brasilianischen Seite der Iguaçu-Wasserfälle: ca. 20 Hauptfälle + 200 kleinere Kaskaden, gut angelegte Stege, spektakuläre Panoramablicke. Rest des Tages frei oder Resort genießen.
AKTIVITÄTEN: Besichtigung der brasilianischen Seite der Wasserfälle
MAHLZEITEN: F
UNTERKUNFT: Recanto Cataratas Thermas Resort & Convention

Tag 5: FOZ DO IGUAÇU — ARGENTINISCHE SEITE DER FÄLLE
Ausflug zur argentinischen Seite (Nationalpark-Eintritt inklusive). Obere und untere Rundwege mitten ins Naturschauspiel. Nähe zu den tosenden Wassermassen, Nasenbären möglich. Eintritt argentinischer Nationalpark inbegriffen. Nachmittag frei: Hotelpool oder Eindrücke verarbeiten.
AKTIVITÄTEN: Besichtigung der argentinischen Seite der Wasserfälle
MAHLZEITEN: F
UNTERKUNFT: Recanto Cataratas Thermas Resort & Convention

Tag 6: FLUG NACH MANAUS — TOR ZUM AMAZONAS
Flug von Foz do Iguaçu (IGU) nach Manaus (MAO) — Umsteigen in GRU oder GIG möglich, TAP hat eine Direktverbindung Manaus → Lissabon (Mo, Mi, Fr). Transfer zum Blue Tree Premium Manaus (ca. 20 Min.). Freier Nachmittag: Spaziergang über den Mercado Adolpho Lisboa oder entspannter Abend vor dem Dschungelabenteuer.
EMPFEHLUNGEN FÜR DEN AMAZONAS-AUFENTHALT: Leichte Regenjacke, Hut, bequeme Wanderschuhe, langärmlige Kleidung, Insektenschutzmittel, Sonnencreme, Fernglas, Taschenlampe, Badebekleidung, Powerbank, Kamera.
MAHLZEITEN: F + Vollpension Plus (alle Mahlzeiten)
UNTERKUNFT: Blue Tree Premium Manaus

Tag 7: IN DEN DSCHUNGEL — AMAZON ECOPARK LODGE
Transfer per Bus, dann Boot (ca. 30 Min.) zum Amazon Ecopark am Tarumã-Mirim-See. Check-in, Welcome-Drink. Geführter Öko-Wanderung im Dschungel, Besuch des Affenwaldes und einer Caboclo-Siedlung. Kanu-Tour in den Igapó (überfluteten Wald). Piranha-Angeln auf dem See. Abendessen und Abend zur freien Verfügung.
AKTIVITÄTEN: Öko-Wanderung, Affenwald, Kanu-Tour Igapó, Piranha-Angeln
MAHLZEITEN: F, M, A (alle Mahlzeiten)
UNTERKUNFT: Amazon Ecopark Jungle Lodge

Tag 8: TIEFER IM AMAZONAS — MEETING OF THE WATERS
Ganztägiger Bootsausflug zum "Treffen der Gewässer" (Encontro das Águas): Rio Negro (dunkel, tanninreich) und Rio Solimões (sandfarben) fließen km-weit nebeneinander ohne sich zu mischen — sichtbare natürliche Grenze durch unterschiedliche Temperaturen und Fließgeschwindigkeiten. Abends: Kaiman-Beobachtung.
AKTIVITÄTEN: Bootsausflug "Meeting of the Waters", Kaiman-Beobachtung
MAHLZEITEN: F, M, A
UNTERKUNFT: Amazon Ecopark Jungle Lodge

Tag 9: DER AMAZONAS OFFENBART SICH
Freier Tag im Rhythmus des Waldes: Hängematte auf der Loggia, Totenkopfaffen beobachten, Schwimmen im Schwarzwassersee (gelegentlich rosa Flussdelfine), letzter Aufstieg auf den Baumkronenturm — Panorama über endlosen Regenwald.
MAHLZEITEN: F, M, A
UNTERKUNFT: Amazon Ecopark Jungle Lodge

Tag 10: ABSCHIED VOM AMAZONAS — HEIMREISE
Nach dem Frühstück Bootstrap-Transfer zurück nach Manaus (ca. 30 Min.). Mittagessen + Panoramafahrt durch Manaus mit Besichtigung des Teatro Amazonas (historisches Opernhaus aus der Kautschuk-Ära). Transfer zum Flughafen MAO. Flug Manaus → Lissabon (TAP, Mo/Mi/Fr direkt) → Frankfurt. Mit Erinnerungen, die ein Leben lang halten.
TIPP: TAP-Direktflug MAO → LIS spart die Strecke MAO → GRU/GIG.
MAHLZEITEN: F, M
UNTERKUNFT: Overnight-Flug/-Fahrt

Tag 11: ANKUNFT IN FRANKFURT
Ende der Reise.

--- FLUGVERBINDUNGEN (Referenz) ---
GIG → IGU: Umsteigen in GRU oder BSB möglich
IGU → MAO: Umsteigen in GRU oder GIG, TAP hat Direktverbindung LIS (Mo, Mi, Fr)
MAO → FRA: Über LIS (TAP direkt Mo/Mi/Fr) oder über GRU/GIG

--- TRANSFERS INKLUSIVE ---
- Hafen Rio → Hilton Copacabana (ca. 20 Min.)
- Hilton Copacabana → Flughafen GIG (ca. 45 Min.)
- Flughafen IGU → Recanto Cataratas (ca. 20 Min.)
- Recanto Cataratas → Flughafen IGU (ca. 20 Min.)
- Flughafen MAO → Blue Tree Premium Manaus (ca. 20 Min.)
- Blue Tree Premium Manaus → Porto de Manaus (ca. 20 Min.)
- Porto de Manaus → Amazon Ecopark (Boot, ca. 30 Min.)
- Amazon Ecopark → Porto de Manaus (Boot, ca. 30 Min.)
- Porto de Manaus → Flughafen MAO (ca. 20 Min.)

--- INKLUSIVE LEISTUNGEN ---
- Alle Unterkünfte wie beschrieben (9 Nächte + 1 Reisenacht)
- Mahlzeiten gemäß Tagesangabe (F = Frühstück, M = Mittagessen, A = Abendessen)
- Deutschsprachige Privatführung bei jeder Ankunft und Hauptaktivität
- Alle Transfers gemäß Reiseplan (Flughafen ↔ Hotel, Stadttransfers, Bus/Boot zur Lodge)
- Halbtagesausflug Zuckerhut (ca. 4 Std.)
- Halbtagesausflug Corcovado / Christus Erlöser (ca. 4 Std.)
- Brasilianische Seite Iguazú (Nationalpark-Eintritt inklusive)
- Argentinische Seite Iguazú (Nationalpark-Eintritt inklusive)
- Alle Lodge-Aktivitäten im Amazon Ecopark: geführte Waldspaziergänge, Kanufahrten, Nachtsafari, Piranha-Angeln, Affenwald, Kaiman-Beobachtung, Baumkronenturm
- Bootsausflug "Meeting of the Waters" inkl. Mittagessen
- Hubby-eSIM-Gutschein 1 GB Daten (freies Internet in Brasilien)
- Willkommens-Caipirinha bei Ankunft

--- NICHT ENTHALTEN ---
- Internationale Flüge
- Inlandsflüge (GIG→IGU, IGU→MAO, MAO→FRA)
- Reiseversicherung
- Persönliche Ausgaben, Trinkgelder
- Optionale, nicht aufgeführte Aktivitäten
- VISA-Services (Schengen-Besucher benötigen derzeit kein Visum für Brasilien)

REISEINFORMATIONEN BRASILIEN:
Währung: Brasilianischer Real (R$, BRL). Scheine: R$2, 5, 10, 20, 50, 100. Münzen: 5, 10, 25, 50 Centavos, R$1.
Bankzeiten: Mo–Fr 9:00–16:00. Karten: Mastercard, Visa, Amex, Diners. Geldautomaten: verfügbar.
Klima Rio (Nov–Dez): Sommer, 25–32°C, warm und feucht.
Klima Iguazú: Ähnlich, tropisch.
Klima Amazonas: Tropisch, 28–35°C, Regenwahrscheinlichkeit täglich.
Stecker: Typ N, 127V/220V, 60 Hz. Reiseadapter empfohlen.
Leitungswasser: NICHT trinken — Flaschenwasser verwenden.
Trinkgeld: 10–15% üblich.

SICHERHEITSHINWEISE:
- Schmuck im Hotel-Safe lassen
- In der Lodge: Insektenschutz, geschlossene Schuhe am Abend
- Sonnenschutz besonders im Amazonas wichtig
- Medikamente (Malariaprophylaxe je nach Arztempfehlung) mitbringen
- Anweisungen der Reiseleitung in der Natur befolgen`

const ERROR_MSGS = {
  de: 'Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut oder kontaktieren Sie uns: carlos@opcotours.com | +5521975655173',
  pt: 'Ocorreu um erro. Tente novamente ou contate: carlos@opcotours.com | +5521975655173',
  en: 'An error occurred. Please try again or contact: carlos@opcotours.com | +5521975655173',
  es: 'Ocurrió un error. Inténtalo de nuevo o contacta: carlos@opcotours.com | +5521975655173',
}

function BubbleText({ text }) {
  return (
    <div
      className="bubble"
      dangerouslySetInnerHTML={{
        __html: text
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\n/g, '<br>'),
      }}
    />
  )
}

function TypingDots() {
  return (
    <div className="bubble">
      <div className="typing-dots">
        <span /><span /><span />
      </div>
    </div>
  )
}

export default function App() {
  const [lang, setLangState] = useState('de')
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const historyRef = useRef([])
  const messagesRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    const t = setTimeout(() => {
      setMessages([{ role: 'bot', text: LANGS['de'].welcome }])
    }, 300)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight
    }
  }, [messages])

  function switchLang(l) {
    setLangState(l)
    historyRef.current = []
    setMessages([{ role: 'bot', text: LANGS[l].welcome }])
  }

  async function sendMessage(text) {
    const msg = (text ?? input).trim()
    if (!msg || loading) return
    setInput('')
    setLoading(true)

    const newHistory = [...historyRef.current, { role: 'user', content: msg }]
    historyRef.current = newHistory

    setMessages(prev => [
      ...prev,
      { role: 'user', text: msg },
      { role: 'bot', typing: true },
    ])

    const sys =
      LANGS[lang].sysLang +
      '\n\nDu bist der offizielle Reise-Assistent für die Brasilien Rundreise von OPCO Tours. Beantworte Fragen präzise anhand der Reiseinformationen unten. Falls etwas nicht in den Infos steht, sag es ehrlich und verweise auf den Operator. Sei prägnant.\n\n' +
      TRIP

    try {
      const r = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newHistory, system: sys }),
      })
      const data = await r.json()
      const reply = data?.content?.[0]?.text
      if (!reply) throw new Error('empty')

      historyRef.current = [...newHistory, { role: 'assistant', content: reply }]
      setMessages(prev => [
        ...prev.filter(m => !m.typing),
        { role: 'bot', text: reply },
      ])
    } catch {
      setMessages(prev => [
        ...prev.filter(m => !m.typing),
        { role: 'bot', text: ERROR_MSGS[lang] },
      ])
    }

    setLoading(false)
    inputRef.current?.focus()
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  function handleInput(e) {
    const el = e.target
    setInput(el.value)
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 80) + 'px'
  }

  return (
    <>
      <div className="header">
        <span className="header-flag">🌿</span>
        <h1>OPCO-AI Reise-Assistent &mdash; <em>Brasilien Rundreise</em></h1>
        <p>OPCO Tours &middot; 11 Tage &middot; Rio · Iguazú · Amazonas</p>
        <div className="destinos-pills">
          <span className="pill">✈ Rio de Janeiro</span>
          <span className="pill">💧 Iguazú-Fälle</span>
          <span className="pill">🌿 Amazonas-Lodge</span>
          <span className="pill">⛪ Cristo Redentor</span>
          <span className="pill">🐊 Kaiman-Safari</span>
          <span className="pill">🐟 Piranha-Angeln</span>
        </div>
        <div className="lang-bar">
          {['de', 'pt', 'en', 'es'].map(l => (
            <button
              key={l}
              className={`lang-btn${lang === l ? ' active' : ''}`}
              onClick={() => switchLang(l)}
            >
              {l === 'de' ? '🇩🇪 Deutsch' : l === 'pt' ? '🇧🇷 Português' : l === 'en' ? '🇬🇧 English' : '🇪🇸 Español'}
            </button>
          ))}
        </div>
      </div>

      <div className="chat-wrapper">
        <div className="chat-box">
          <div className="messages" ref={messagesRef}>
            {messages.map((m, i) => (
              <div key={i} className={`msg ${m.role}`}>
                <div className={`avatar ${m.role}`}>
                  {m.role === 'bot' ? '🌿' : '👤'}
                </div>
                {m.typing ? <TypingDots /> : <BubbleText text={m.text} />}
              </div>
            ))}
          </div>

          <div className="suggestions">
            {LANGS[lang].suggestions.map(s => (
              <button
                key={s}
                className="sugg-btn"
                onClick={() => sendMessage(s)}
                disabled={loading}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="input-area">
          <textarea
            ref={inputRef}
            id="userInput"
            rows={1}
            value={input}
            placeholder={LANGS[lang].placeholder}
            onKeyDown={handleKey}
            onInput={handleInput}
            onChange={e => setInput(e.target.value)}
            disabled={loading}
          />
          <button
            id="sendBtn"
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>

        <p className="footer-note">Powered by OPCO Tours &middot; claude.ai</p>
      </div>
    </>
  )
}
