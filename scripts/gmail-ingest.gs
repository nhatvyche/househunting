/**
 * HouseHunting Gmail Ingest — Apps Script
 *
 * Deploy on the shared Gmail account (e.g. househunting.betatest@gmail.com).
 *
 * Setup:
 * 1. Open script.google.com while logged into the shared inbox
 * 2. Create a new project and paste this file
 * 3. Project Settings → Script Properties:
 *    - INGEST_URL = https://your-app.vercel.app/api/ingest
 *    - INGEST_API_KEY = (same as INGEST_API_KEY in your Next.js env)
 * 4. Run createTrigger() once to schedule every-10-minute checks
 * 5. Authorize Gmail access when prompted
 */

const PROCESSED_LABEL = 'HouseHunting/Processed';

function getScriptProperty_(key) {
  return PropertiesService.getScriptProperties().getProperty(key);
}

function ensureProcessedLabel_() {
  const gmail = GmailApp;
  const existing = gmail.getUserLabelByName(PROCESSED_LABEL);
  if (existing) return existing;
  return gmail.createLabel(PROCESSED_LABEL);
}

function extractSenderEmail_(message) {
  const from = message.getFrom() || '';
  const match = from.match(/<([^>]+)>/) || from.match(/([\w.+-]+@[\w.-]+\.\w+)/);
  return (match ? match[1] : from).trim().toLowerCase();
}

function postToIngest_(payload) {
  const url = getScriptProperty_('INGEST_URL');
  const apiKey = getScriptProperty_('INGEST_API_KEY');

  if (!url || !apiKey) {
    throw new Error('Set INGEST_URL and INGEST_API_KEY in Script Properties');
  }

  const response = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    headers: { 'x-api-key': apiKey },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  });

  const code = response.getResponseCode();
  const body = response.getContentText();

  if (code >= 400) {
    Logger.log('Ingest failed (%s): %s', code, body);
    return { ok: false, code: code, body: body };
  }

  return { ok: true, body: body };
}

function processNewEmails() {
  const label = ensureProcessedLabel_();
  const query = 'in:inbox -label:"' + PROCESSED_LABEL + '"';
  const threads = GmailApp.search(query, 0, 20);

  threads.forEach(function (thread) {
    const messages = thread.getMessages();
    messages.forEach(function (message) {
      if (message.getLabelIds && message.isInInbox && !message.isInInbox()) {
        return;
      }

      const senderEmail = extractSenderEmail_(message);
      const subject = message.getSubject() || '';
      const body = message.getPlainBody() || message.getBody() || '';

      const result = postToIngest_({
        senderEmail: senderEmail,
        subject: subject,
        body: body,
        source: 'email',
      });

      if (result.ok) {
        thread.addLabel(label);
        message.markRead();
      }
    });
  });
}

function createTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (trigger) {
    if (trigger.getHandlerFunction() === 'processNewEmails') {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  ScriptApp.newTrigger('processNewEmails')
    .timeBased()
    .everyMinutes(10)
    .create();

  Logger.log('Trigger created: processNewEmails every 10 minutes');
}

/** Manual test with a sample payload */
function testIngest() {
  const result = postToIngest_({
    senderEmail: 'tester@example.com',
    subject: 'Check out this home',
    body: 'https://www.zillow.com/homedetails/example/123_zpid/',
    source: 'email',
  });
  Logger.log(JSON.stringify(result));
}
