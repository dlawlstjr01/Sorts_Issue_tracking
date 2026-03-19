const db = require("../config/DB");

async function getAllGlossaryTerms() {
  const [rows] = await db.query(
    `
    SELECT id, category, word, alias, meaning, source_file, line_no
    FROM glossary_terms
    WHERE word IS NOT NULL
      AND TRIM(word) <> ''
      AND meaning IS NOT NULL
      AND TRIM(meaning) <> ''
    ORDER BY CHAR_LENGTH(word) DESC, id ASC
    `
  );

  return rows.map((row) => ({
    id: row.id,
    category: row.category || "",
    word: row.word || "",
    alias: row.alias || "",
    meaning: row.meaning || "",
    source_file: row.source_file || "",
    line_no: row.line_no || null,
  }));
}

module.exports = {
  getAllGlossaryTerms,
};