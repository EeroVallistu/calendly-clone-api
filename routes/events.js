const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');
const { isValidHexColor } = require('../utils/validators');

// Create a new event type
router.post('/', auth, (req, res) => {
  const { name, duration, description, color } = req.body;

  if (!name || !duration) {
    return res.status(400).json({ error: 'Name and duration are required' });
  }

  if (color && !isValidHexColor(color)) {
    return res.status(400).json({ error: 'Color must be a valid hex color (e.g., #FF0000)' });
  }

  const id = Date.now().toString(); // Simple ID generation
  db.run(
    'INSERT INTO events (id, name, duration, description, color) VALUES (?, ?, ?, ?, ?)',
    [id, name, duration, description, color],
    (err) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.status(201).json({ id, name, duration, description, color });
    }
  );
});

router.get('/:eventId', (req, res) => {
  const { eventId } = req.params;

  db.get('SELECT * FROM events WHERE id = ?', [eventId], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(row);
  });
});

// Partially update an event
router.patch('/:eventId', (req, res) => {
  const { eventId } = req.params;
  const { name, duration, description, color } = req.body;

  if (!name && !duration && !description && !color) {
    return res.status(400).json({ error: 'At least one field is required' });
  }

  if (color && !isValidHexColor(color)) {
    return res.status(400).json({ error: 'Color must be a valid hex color (e.g., #FF0000)' });
  }

  const fields = [];
  const values = [];

  if (name) {
    fields.push('name = ?');
    values.push(name);
  }
  if (duration) {
    fields.push('duration = ?');
    values.push(duration);
  }
  if (description) {
    fields.push('description = ?');
    values.push(description);
  }
  if (color) {
    fields.push('color = ?');
    values.push(color);
  }

  values.push(eventId);

  const query = `UPDATE events SET ${fields.join(', ')} WHERE id = ?`;

  db.run(query, values, function (err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json({ id: eventId, name, duration, description, color });
  });
});

// Delete an event
router.delete('/:eventId', (req, res) => {
  const { eventId } = req.params;

  db.run('DELETE FROM events WHERE id = ?', [eventId], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.status(204).send(); // No content
  });
});

// Get all events
router.get('/', (req, res) => {
  db.all('SELECT * FROM events', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

module.exports = router;