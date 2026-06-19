// Alexa Skill handler — OPCO-AI Reise-Assistent Brasilien Rundreise
// Alexa calls this endpoint directly (no Lambda needed)

const SYSTEM_PROMPT = `Du bist der offizielle Sprach-Reiseassistent für die Brasilien Rundreise von OPCO Tours.
Beantworte Fragen präzise und kurz (max 3 Sätze für Sprache). Keine Markdown, keine Listen mit Sternchen.
Sprich natürlich, als würdest du mit jemandem reden.
Reise: 11 Tage, Rio de Janeiro → Foz do Iguaçu → Manaus → Amazon Ecopark.
Hotels: Hilton Copacabana (3 Nächte), Recanto Cataratas (2 Nächte), Blue Tree Manaus (1 Nacht), Amazon Ecopark Lodge (3 Nächte).
Preis: ab 2820 USD pro Person. Anzahlung 20%, Rest 60 Tage vor Reise. Storno unter 59 Tagen: 100%.
Inklusive: Transfers, deutschsprachige Führung, Zuckerhut, Corcovado, beide Iguazú-Seiten, alle Lodge-Aktivitäten.
Kontakt: carlos@opcotours.com, +5521975655173.`

function speak(text, endSession = false) {
  return {
    version: '1.0',
    response: {
      outputSpeech: { type: 'PlainText', text },
      reprompt: endSession ? undefined : {
        outputSpeech: { type: 'PlainText', text: 'Haben Sie noch eine Frage zur Brasilien Rundreise?' }
      },
      shouldEndSession: endSession,
    },
  }
}

async function askClaude(question) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: question }],
    }),
  })
  const data = await r.json()
  return data?.content?.[0]?.text || 'Es tut mir leid, ich konnte keine Antwort finden.'
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const body = req.body
  const type = body?.request?.type

  // Launch
  if (type === 'LaunchRequest') {
    return res.json(speak(
      'Willkommen beim OPCO Brasilien Reise Assistenten! ' +
      'Ich beantworte Ihre Fragen zur Brasilien Rundreise durch Rio de Janeiro, Iguazú und den Amazonas. ' +
      'Was möchten Sie wissen?'
    ))
  }

  // Intent
  if (type === 'IntentRequest') {
    const intent = body.request.intent.name

    if (intent === 'AMAZON.HelpIntent') {
      return res.json(speak(
        'Sie können mich zu Ihrer Brasilien Rundreise befragen. ' +
        'Zum Beispiel: Was ist im Preis inbegriffen? Oder: Welche Hotels sind buchbar?'
      ))
    }

    if (intent === 'AMAZON.CancelIntent' || intent === 'AMAZON.StopIntent') {
      return res.json(speak('Auf Wiedersehen und eine gute Reise nach Brasilien!', true))
    }

    if (intent === 'AskQuestionIntent') {
      const question = body.request.intent.slots?.question?.value
      if (!question) {
        return res.json(speak('Ich habe Ihre Frage leider nicht verstanden. Bitte wiederholen Sie.'))
      }
      try {
        const answer = await askClaude(question)
        return res.json(speak(answer))
      } catch {
        return res.json(speak('Es ist ein technischer Fehler aufgetreten. Bitte kontaktieren Sie OPCO Tours.'))
      }
    }

    // Fallback intent
    return res.json(speak('Das habe ich leider nicht verstanden. Stellen Sie mir eine Frage zur Brasilien Rundreise.'))
  }

  // Session ended
  if (type === 'SessionEndedRequest') {
    return res.status(200).json({ version: '1.0', response: {} })
  }

  return res.status(400).json({ error: 'Unknown request type' })
}
