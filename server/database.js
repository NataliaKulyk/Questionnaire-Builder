const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('../database/questionnaires.db');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS questionnaires (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      questions TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS responses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      questionnaire_id INTEGER,
      answers TEXT NOT NULL,
      time_taken INTEGER,
      FOREIGN KEY (questionnaire_id) REFERENCES questionnaires(id)
    )
  `);
});

const dbOperations = {
  getAllQuestionnaires: (callback) => {
    db.all('SELECT * FROM questionnaires', [], (err, rows) => {
      if (err) throw err;
      callback(rows);
    });
  },


  createQuestionnaire: (name, description, questions, callback) => {
    db.run(
      'INSERT INTO questionnaires (name, description, questions) VALUES (?, ?, ?)',
      [name, description, JSON.stringify(questions)],
      function (err) {
        if (err) throw err;
        callback(this.lastID);
      }
    );
  },

  getQuestionnaireById: (id, callback) => {
    db.get('SELECT * FROM questionnaires WHERE id = ?', [id], (err, row) => {
      if (err) throw err;
      callback(row);
    });
  },

  deleteQuestionnaire: (id, callback) => {
    db.run('DELETE FROM questionnaires WHERE id = ?', [id], (err) => {
      if (err) throw err;
      callback();
    });
  },

  saveResponse: (questionnaireId, answers, timeTaken, callback) => {
    db.run(
      'INSERT INTO responses (questionnaire_id, answers, time_taken) VALUES (?, ?, ?)',
      [questionnaireId, JSON.stringify(answers), timeTaken],
      function (err) {
        if (err) throw err;
        callback(this.lastID);
      }
    );
  },

  getCompletionsCount: (questionnaireId, callback) => {
    db.get(
      'SELECT COUNT(*) as count FROM responses WHERE questionnaire_id = ?',
      [questionnaireId],
      (err, row) => {
        if (err) throw err;
        callback(row.count);
      }
    );
  },
};

module.exports = dbOperations;