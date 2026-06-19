// Alexa Skill handler — OPCO-AI Reise-Assistent Brasilien Rundreise

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
  sessionAttrs = sessionAttrs || {}
  endSession = endSession || false
  return {
    version: '1.0',
    sessionAttributes: sessionAttrs,
    response: {
      outputSpeech: { type: 'PlainText', text: text },
      reprompt: endSession ? undefined : {
        outputSpeech: { type: 'PlainText', text: 'Haben Sie noch eine Frage? Oder sagen Sie weiter fuer mehr.' }
      },
      shouldEndSession: endSession,
    },
  }
}

function send(res, obj) {
  const json = JSON.stringify(obj)
  res.setHeader('Content-Type', 'application/json')
  res.statusCode = 200
  res.end(json)
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
  return (data && data.content && data.content[0] && data.content[0].text) || 'Es tut mir leid, ich konnte keine Antwort finden.'
}

async function readBody(req) {
  return new Promise((resolve) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8')
        resolve(JSON.parse(raw))
      } catch (e) {
        resolve({})
      }
    })
    req.on('error', () => resolve({}))
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405
    res.end()
    return
  }

  let body = {}
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
    body = req.body
  } else {
    body = await readBody(req)
  }

  const type = (body.request && body.request.type) || ''
  const session = (body.session && body.session.attributes) || {}

  if (type === 'LaunchRequest') {
    return send(res, speak(
      'Willkommen beim OPCO Brasilien Reise Assistenten! ' +
      'Ich beantworte Ihre Fragen zur Brasilien Rundreise durch Rio de Janeiro, Iguazuu und den Amazonas. ' +
      'Was moechten Sie wissen?'
    ))
  }

  if (type === 'IntentRequest') {
    const intent = body.request.intent && body.request.intent.name

    if (intent === 'ContinueIntent' || intent === 'AMAZON.NextIntent') {
      const remaining = session.remaining || ''
      if (!remaining) {
        return send(res, speak('Es gibt nichts mehr hinzuzufuegen. Haben Sie eine neue Frage?'))
      }
      const chunks = chunkText(remaining)
      const first = chunks[0]
      const rest = chunks.slice(1).join(' ')
      const suffix = rest.length > 0 ? ' Sagen Sie weiter fuer mehr.' : ''
      return send(res, speak(first + suffix, { remaining: rest }))
    }

    if (intent === 'AMAZON.HelpIntent') {
      return send(res, speak(
        'Sie koennen mich zu Ihrer Brasilien Rundreise befragen. ' +
        'Bei langen Antworten sagen Sie einfach weiter.'
      ))
    }

    if (intent === 'AMAZON.CancelIntent' || intent === 'AMAZON.StopIntent') {
      return send(res, speak('Auf Wiedersehen und eine gute Reise nach Brasilien!', {}, true))
    }

    if (intent === 'AskQuestionIntent') {
      const question = body.request.intent.slots && body.request.intent.slots.question && body.request.intent.slots.question.value
      if (!question) {
        return send(res, speak('Ich habe Ihre Frage leider nicht verstanden. Bitte wiederholen Sie.'))
      }
      try {
        const fullAnswer = await askClaude(question)
        const chunks = chunkText(fullAnswer)
        const first = chunks[0]
        const rest = chunks.slice(1).join(' ')
        const suffix = rest.length > 0 ? ' Sagen Sie weiter fuer den Rest.' : ''
        return send(res, speak(first + suffix, { remaining: rest }))
      } catch (e) {
        return send(res, speak('Es ist ein technischer Fehler aufgetreten. Bitte kontaktieren Sie OPCO Tours.'))
      }
    }

    return send(res, speak('Das habe ich leider nicht verstanden. Stellen Sie mir eine Frage zur Brasilien Rundreise.'))
  }

  if (type === 'SessionEndedRequest') {
    return send(res, { version: '1.0', response: {} })
  }

  // Fallback — return valid Alexa response for anything else
  return send(res, speak('Hallo, ich bin der OPCO Brasilien Reise Assistent. Wie kann ich helfen?'))
}
