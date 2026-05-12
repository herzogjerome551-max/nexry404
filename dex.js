require('dotenv').config();
const express = require('express');
const { MessagingResponse } = require('twilio').twiml;

const app = express();
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('cave-bot ist bereit. Sende eine Nachricht an deinen WhatsApp-Sandbox-Webhook.');
});

app.post('/webhook', (req, res) => {
  const incomingMessage = (req.body.Body || '').trim();
  const incomingFrom = req.body.From || '';
  const incomingMediaCount = Number(req.body.NumMedia || 0);

  console.log(`Eingehende Nachricht von ${incomingFrom}: ${incomingMessage}`);
  if (incomingMediaCount > 0) {
    console.log(`Eingehende Medien: ${incomingMediaCount}`);
  }

  const twiml = new MessagingResponse();
  const reply = generateReply(incomingMessage, incomingMediaCount, req.body);
  twiml.message(reply);

  res.type('text/xml').send(twiml.toString());
});

function generateReply(message, mediaCount, body) {
  const text = (message || '').toLowerCase();

  if (mediaCount > 0) {
    return handleMediaMessage(mediaCount, body);
  }

  if (!text) {
    return 'Ich habe deine Nachricht nicht verstanden. Schreibe bitte etwas auf WhatsApp.';
  }

  const [command, ...args] = text.split(/\s+/);

  switch (command) {
    case 'hallo':
    case 'hi':
    case 'hey':
      return 'Hallo! Ich bin dein WhatsApp-Bot. Sende "Hilfe" für eine Liste meiner Befehle.';
    case 'hilfe':
    case 'help':
    case 'menu':
      return getHelpText();
    case 'info':
      return getInfoText();
    case 'status':
      return 'Der Bot läuft und ist bereit für deine Nachrichten.';
    case 'echo':
      return args.length > 0 ? args.join(' ') : 'Sende "echo <Text>", um den Text zurückzuerhalten.';
    case 'zeit':
    case 'time':
      return `Aktuelle Serverzeit ist: ${new Date().toLocaleString('de-DE')}`;
    case 'quote':
      return getQuote();
    case 'kontakt':
      return 'Du kannst uns per E-Mail unter support@example.com erreichen.';
    default:
      return `Danke für deine Nachricht: "${message}"\nIch kann dir helfen mit: "Hilfe", "Info", "Status", "Echo", "Zeit", "Quote".`;
  }
}

function getHelpText() {
  return [
    'Ich bin dein WhatsApp-Bot. Du kannst folgende Befehle nutzen:',
    '- Hilfe / Help / Menu: Zeigt diese Nachricht.',
    '- Info: Zeigt Bot-Informationen.',
    '- Status: Prüft, ob der Bot läuft.',
    '- Echo <Text>: Wiederholt deine Nachricht.',
    '- Zeit / Time: Gibt die aktuelle Serverzeit zurück.',
    '- Quote: Sendet ein kurzes Zitat.',
    '- Kontakt: Zeigt Kontaktdaten.',
    'Sende ein Bild oder eine Datei, und ich bestätige den Empfang.'
  ].join('\n');
}

function getInfoText() {
  return 'Dies ist der cave-bot: Ein Beispiel-WhatsApp-Bot, der Nachrichten versteht, Befehle verarbeitet und Medien erkennt.';
}

function getQuote() {
  const quotes = [
    'Ein guter Plan heute ist besser als ein perfekter Plan morgen.',
    'Fortschritt entsteht, wenn man beginnt.',
    'Kleines Ziel, großer Schritt.',
    'Erfolg besteht aus kleinen Schritten, die man jeden Tag geht.'
  ];
  return quotes[Math.floor(Math.random() * quotes.length)];
}

function handleMediaMessage(mediaCount, body) {
  const mediaTypes = [];
  for (let i = 0; i < mediaCount; i++) {
    const contentType = body[`MediaContentType${i}`] || 'unbekannt';
    mediaTypes.push(contentType);
  }

  return `Danke! Ich habe deine Nachricht mit ${mediaCount} Mediendatei(en) empfangen. Typen: ${mediaTypes.join(', ')}.`;
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`cave-bot läuft auf http://localhost:${port}`);
});
