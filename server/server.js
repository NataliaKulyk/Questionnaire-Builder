const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

app.get('/api/questionnaires', (req, res) => {
  db.getAllQuestionnaires((rows) => {
    const promises = rows.map(
      (row) =>
        new Promise((resolve) => {
          db.getCompletionsCount(row.id, (count) => {
            row.completions = count;
            resolve(row);
          });
        })
    );
    Promise.all(promises).then((updatedRows) => res.json(updatedRows));
  });
});

app.post('/api/questionnaires', (req, res) => {
  const { name, description, questions } = req.body;
  db.createQuestionnaire(name, description, questions, (id) => {
    res.json({ id });
  });
});

app.get('/api/questionnaires/:id', (req, res) => {
  db.getQuestionnaireById(req.params.id, (row) => {
    if (!row) return res.status(404).json({ error: 'Questionnaire not found' });
    res.json(row);
  });
});

app.delete('/api/questionnaires/:id', (req, res) => {
  db.deleteQuestionnaire(req.params.id, () => {
    res.json({ success: true });
  });
});

app.post('/api/responses', (req, res) => {
  const { questionnaireId, answers, timeTaken } = req.body;
  db.saveResponse(questionnaireId, answers, timeTaken, (id) => {
    res.json({ id });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});