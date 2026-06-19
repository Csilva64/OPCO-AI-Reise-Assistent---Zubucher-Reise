// Alexa Skill handler — OPCO-AI Reise-Assistent Brasilien Rundreise
// Vercel Edge Runtime (Web API — no Node.js body parser issue)

export const config = { runtime: 'edge' }

const SYSTEM_PROMPT = `Du bist der offizielle Sprach-Reiseassistent für die Brasilien Rundreise von OPCO Tours.
Antworte in natürlicher Sprache, keine Markdown, keine Sternchen, keine Listen.
Reise: 11 Tage, Rio de Janeiro → Foz do Iguaçu → Manaus → Amazon Ecopark.
Hotels: Hilton Copacabana (3 Nächte), Recanto Cataratas (2 Nächte), Blue Tree Manaus (1 Nacht), Amazon Ecopark Lodge (3 Nächte).
Preis: ab 2820 USD pro Person. Anzahlung 20%, Rest 60 Tage vor Reise. Storno unter 59 Tagen: 100%.
Inklusive: Transfers, deutschsprachige Führung, Zuckerhut, Corcovado, beide Iguazú-Seiten, alle Lodge-Aktivitäten.
Kontakt: carlos@opcotours.com, +5521975655173.`

const CHUNK_SIZE = 600

function chunkText(text) {
  if (text.length <= CHUNK_SIZE) return [text]
  const chunks = []
  let remaining = text
  while (remaining.length > 0) {
    if (remaining.length <= CHUNK_SIZE) { chunks.push(remaining); break }
    let cut = remaining.lastIndexOf('. ', CHUNK_SIZE)
    if (cut === -1) cut = remaining.lastIndexOf(', ', CHUNK_SIZE)
    if (cut === -1) cut = CHUNK_SIZE
    else cut += 1
    chunks.push(remaining.slice(0, cut).trim())
    remaining = remaining.slice(cut).trim()
  }
  return chunks
}

function speak(text, sessionAttrs, endSession) {
  return new Response(JSON.stringify({
    version: '1.0',
    sessionAttributes: sessionAttrs || {},
    response: {
      outputSpeech: { type: 'PlainText', text: text },
      reprompt: endSession ? undefined : {
        outputSpeech: { type: 'PlainText', text: 'Haben Sie noch eine Frage? Sagen Sie weiter fuer mehr.' }
      },
      shouldEndSession: endSession || false,
    },
  }), { status: 200, headers: { 'Content-Type': 'application/json' } })
}

async function askClaude(question) {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: question }],
    }),
  })
  const data = await r.json()
  return (data.content && data.content[0] && data.content[0].text) || 'Es tut mir leid, ich konnte keine Antwort finden.'
}

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(null, { status: 405 })
  }

  let body = {}
  try {
    const parsed = await req.json()
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) body = parsed
  } catch (e) {
    body = {}
  }

  const type = (body.request && body.request.type) || ''
  const session = (body.session && body.session.attributes) || {}

  if (type === 'LaunchRequest') {
    return speak(
      'Willkommen beim OPCO Brasilien Reise Assistenten! ' +
      'Ich beantworte Ihre Fragen zur Brasilien Rundreise durch Rio de Janeiro, Iguazuu und den Amazonas. ' +
      'Was moechten Sie wissen?'
    )
  }

  if (type === 'IntentRequest') {
    const intent = body.request.intent && body.request.intent.name

    if (intent === 'ContinueIntent' || intent === 'AMAZON.NextIntent') {
      const remaining = session.remaining || ''
      if (!remaining) return speak('Es gibt nichts mehr hinzuzufuegen. Haben Sie eine neue Frage?')
      const chunks = chunkText(remaining)
      const first = chunks[0]
      const rest = chunks.slice(1).join(' ')
      const suffix = rest.length > 0 ? ' Sagen Sie weiter fuer mehr.' : ''
      return speak(first + suffix, { remaining: rest })
    }

    if (intent === 'AMAZON.HelpIntent') {
      return speak('Sie koennen mich zu Ihrer Brasilien Rundreise befragen. Bei langen Antworten sagen Sie weiter.')
    }

    if (intent === 'AMAZON.CancelIntent' || intent === 'AMAZON.StopIntent') {
      return speak('Auf Wiedersehen und eine gute Reise nach Brasilien!', {}, true)
    }

    if (intent === 'AskQuestionIntent') {
      const question = body.request.intent.slots && body.request.intent.slots.question && body.request.intent.slots.question.value
      if (!question) return speak('Ich habe Ihre Frage leider nicht verstanden. Bitte wiederholen Sie.')
      try {
        const fullAnswer = await askClaude(question)
        const chunks = chunkText(fullAnswer)
        const first = chunks[0]
        const rest = chunks.slice(1).join(' ')
        const suffix = rest.length > 0 ? ' Sagen Sie weiter fuer den Rest.' : ''
        return speak(first + suffix, { remaining: rest })
      } catch (e) {
        return speak('Es ist ein technischer Fehler aufgetreten. Bitte kontaktieren Sie OPCO Tours.')
      }
    }

    return speak('Das habe ich leider nicht verstanden. Stellen Sie mir eine Frage zur Brasilien Rundreise.')
  }

  if (type === 'SessionEndedRequest') {
    return new Response(JSON.stringify({ version: '1.0', response: {} }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    })
  }

  return speak('Hallo, ich bin der OPCO Brasilien Reise Assistent. Wie kann ich helfen?')
}
