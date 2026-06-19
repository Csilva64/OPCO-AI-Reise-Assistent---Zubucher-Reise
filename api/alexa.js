// Alexa Skill handler — OPCO-AI Reise-Assistent Brasilien Rundreise

const SYSTEM_PROMPT = `Du bist der offizielle Sprach-Reiseassistent für die Brasilien Rundreise von OPCO Tours.
Antworte in natürlicher Sprache, keine Markdown, keine Sternchen, keine Listen.
Reise: 11 Tage, Rio de Janeiro → Foz do Iguaçu → Manaus → Amazon Ecopark.
Hotels: Hilton Copacabana (3 Nächte), Recanto Cataratas (2 Nächte), Blue Tree Manaus (1 Nacht), Amazon Ecopark Lodge (3 Nächte).
Preis: ab 2820 USD pro Person. Anzahlung 20%, Rest 60 Tage vor Reise. Storno unter 59 Tagen: 100%.
Inklusive: Transfers, deutschsprachige Führung, Zuckerhut, Corcovado, beide Iguazú-Seiten, alle Lodge-Aktivitäten.
Kontakt: carlos@opcotours.com, +5521975655173.`

const CHUNK_SIZE = 600 // chars Alexa speaks comfortably (~45 sec)

function chunkText(text) {
  if (text.length <= CHUNK_SIZE) return [text]
  const chunks = []
  let remaining = text
  while (remaining.length > 0) {
    if (remaining.length <= CHUNK_SIZE) {
      chunks.push(remaining)
      break
    }
    // break at last sentence boundary within CHUNK_SIZE
    let cut = remaining.lastIndexOf('. ', CHUNK_SIZE)
    if (cut === -1) cut = remaining.lastIndexOf(', ', CHUNK_SIZE)
    if (cut === -1) cut = CHUNK_SIZE
    else cut += 1 // include the period
    chunks.push(remaining.slice(0, cut).trim())
    remaining = remaining.slice(cut).trim()
  }
  return chunks
}

function speak(text, sessionAttrs = {}, endSession = false) {
  return {
    version: '1.0',
    sessionAttributes: sessionAttrs,
    response: {
      outputSpeech: { type: 'PlainText', text },
      reprompt: endSession ? undefined : {
        outputSpeech: { type: 'PlainText', text: 'Haben Sie noch eine Frage? Oder sagen Sie "weiter" für mehr.' }
      },
      shouldEndSession: endSession,
    },
  }
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
  return data?.content?.[0]?.text || 'Es tut mir leid, ich konnte keine Antwort finden.'
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Content-Type', 'application/json')
    return res.status(405).end()
  }

  let body = req.body
  if (Buffer.isBuffer(body)) {
    try { body = JSON.parse(body.toString('utf8')) } catch { body = {} }
  } else if (typeof body === 'string') {
    try { body = JSON.parse(body) } catch { body = {} }
  }
  if (!body || typeof body !== 'object') body = {}

  const type = body?.request?.type
  const session = body?.session?.attributes || {}

  // Debug: always return valid Alexa response for unknown type
  if (!type) {
    res.setHeader('Content-Type', 'application/json')
    return res.status(200).end(JSON.stringify(speak('Skill empfangen. Kein Anfragetyp erkannt.')))
  }

  // Launch
  if (type === 'LaunchRequest') {
    return res.json(speak(
      'Willkommen beim OPCO Brasilien Reise Assistenten! ' +
      'Ich beantworte Ihre Fragen zur Brasilien Rundreise durch Rio de Janeiro, Iguazú und den Amazonas. ' +
      'Was möchten Sie wissen?'
    ))
  }

  if (type === 'IntentRequest') {
    const intent = body.request.intent.name

    // CONTINUE intent — deliver next chunk
    if (intent === 'ContinueIntent' || intent === 'AMAZON.NextIntent') {
      const remaining = session.remaining || ''
      if (!remaining) {
        return res.json(speak('Es gibt nichts mehr hinzuzufügen. Haben Sie eine neue Frage?'))
      }
      const chunks = chunkText(remaining)
      const first = chunks[0]
      const rest = chunks.slice(1).join(' ')
      const hasMore = rest.length > 0
      const suffix = hasMore ? ' Sagen Sie "weiter" für mehr.' : ''
      return res.json(speak(first + suffix, { remaining: rest }))
    }

    if (intent === 'AMAZON.HelpIntent') {
      return res.json(speak(
        'Sie können mich zu Ihrer Brasilien Rundreise befragen. ' +
        'Zum Beispiel: Was ist im Preis inbegriffen? Oder: Welche Hotels sind buchbar? ' +
        'Bei langen Antworten sagen Sie einfach "weiter".'
      ))
    }

    if (intent === 'AMAZON.CancelIntent' || intent === 'AMAZON.StopIntent') {
      return res.json(speak('Auf Wiedersehen und eine gute Reise nach Brasilien!', {}, true))
    }

    if (intent === 'AskQuestionIntent') {
      const question = body.request.intent.slots?.question?.value
      if (!question) {
        return res.json(speak('Ich habe Ihre Frage leider nicht verstanden. Bitte wiederholen Sie.'))
      }
      try {
        const fullAnswer = await askClaude(question)
        const chunks = chunkText(fullAnswer)
        const first = chunks[0]
        const rest = chunks.slice(1).join(' ')
        const hasMore = rest.length > 0
        const suffix = hasMore ? ' Sagen Sie "weiter" für den Rest.' : ''
        return res.json(speak(first + suffix, { remaining: rest }))
      } catch {
        return res.json(speak('Es ist ein technischer Fehler aufgetreten. Bitte kontaktieren Sie OPCO Tours.'))
      }
    }

    return res.json(speak('Das habe ich leider nicht verstanden. Stellen Sie mir eine Frage zur Brasilien Rundreise.'))
  }

  if (type === 'SessionEndedRequest') {
    return res.status(200).json({ version: '1.0', response: {} })
  }

  return res.status(400).json({ error: 'Unknown request type' })
}
