/**
 * HCOE World Cup Fan Zone — Prediction collector.
 *
 * Deploy:
 *  1. sheets.new → name the sheet "WC2026 Predictions".
 *  2. Extensions → Apps Script → paste this file.
 *  3. Project Settings → Script properties → add SECRET (any long random string).
 *     Put the same value in the Next.js env as GOOGLE_SCRIPT_SECRET.
 *  4. Deploy → New deployment → Web app:
 *       Execute as: Me
 *       Who has access: Anyone
 *  5. Copy the web app URL into the Next.js env as GOOGLE_SCRIPT_URL.
 */

var HEADERS = [
  "Timestamp",
  "Full Name",
  "Student ID",
  "Program",
  "Golden Ball",
  "Golden Boot",
  "Young Player",
  "Golden Gloves",
  "Final Score",
  "Final Team",
  "Final Match Goal Scorer",
  "Best XI",
  "1st Place",
  "2nd Place",
  "3rd Place",
];

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    var secret = PropertiesService.getScriptProperties().getProperty("SECRET");
    if (secret && data.secret !== secret) {
      return jsonResponse({ ok: false, error: "unauthorized" });
    }

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
    }

    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      String(data.fullName || "").slice(0, 80),
      String(data.studentId || "").slice(0, 20),
      String(data.program || "").slice(0, 60),
      String(data.goldenBall || "").slice(0, 80),
      String(data.goldenBoot || "").slice(0, 80),
      String(data.youngPlayer || "").slice(0, 80),
      String(data.goldenGloves || "").slice(0, 80),
      String(data.finalScore || "").slice(0, 80),
      String(data.finalTeam || "").slice(0, 60),
      String(data.finalMatchGoalScorer || "").slice(0, 80),
      String(data.bestXI || "").slice(0, 600),
      String(data.firstPlace || "").slice(0, 60),
      String(data.secondPlace || "").slice(0, 60),
      String(data.thirdPlace || "").slice(0, 60),
    ]);

    return jsonResponse({ ok: true });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
