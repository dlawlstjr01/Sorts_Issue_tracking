const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const db = require("../config/DB");

// text 컬럼 예시:
// Absolute Advantage(절대우위): 다른 나라보다 더 적은 비용으로 생산할 수 있는 능력
function parseTerm(text) {
  const raw = String(text || "").trim();
  if (!raw) return null;

  const [left, ...rest] = raw.split(":");
  const meaning = rest.join(":").trim();
  const head = (left || "").trim();

  const match = head.match(/^(.+?)\((.+?)\)$/);

  if (match) {
    return {
      word: match[1].trim(),
      alias: match[2].trim(),
      meaning,
      raw_text: raw,
    };
  }

  return {
    word: head,
    alias: "",
    meaning,
    raw_text: raw,
  };
}

async function insertGlossaryFromCsv() {
  const csvFilePath = path.join(__dirname, "glossary.csv"); 
  // ↑ CSV 파일을 scripts 폴더 안에 glossary.csv 이름으로 둘 예정

  const rows = [];

  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on("data", (data) => {
      try {
        // CSV 컬럼명:
        // id, source_file, category, line_no, text
        const parsed = parseTerm(data.text);

        if (!parsed) return;
        if (!parsed.word || !parsed.meaning) return;

        rows.push([
          data.category || null,
          parsed.word,
          parsed.alias || null,
          parsed.meaning,
          data.source_file || null,
          data.line_no ? Number(data.line_no) : null,
          parsed.raw_text,
        ]);
      } catch (err) {
        console.error("CSV 한 줄 처리 중 오류:", err);
      }
    })
    .on("end", async () => {
      let conn;
      try {
        console.log(`읽은 데이터 수: ${rows.length}`);

        if (rows.length === 0) {
          console.log("삽입할 데이터가 없습니다.");
          process.exit(0);
        }

        // 중복 방지 없이 그냥 insert
        for (const row of rows) {
          await db.query(
            `
            INSERT INTO glossary_terms
            (category, word, alias, meaning, source_file, line_no, raw_text)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            `,
            row
          );
        }

        console.log("glossary_terms 테이블에 CSV 데이터 삽입 완료");
        process.exit(0);
      } catch (err) {
        console.error("DB 삽입 중 오류:", err);
        process.exit(1);
      }
    })
    .on("error", (err) => {
      console.error("CSV 파일 읽기 오류:", err);
      process.exit(1);
    });
}

insertGlossaryFromCsv();