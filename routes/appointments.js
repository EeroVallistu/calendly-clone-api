const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');
const { isValidEmail } = require('../utils/validators');

// Schedule an appointment
router.post('/', auth, (req, res) => {
  const { eventId, userId, inviteeEmail, startTime, endTime } = req.body;
  const status = 'scheduled'; // Default status

  if (!eventId || !userId || !inviteeEmail || !startTime || !endTime) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (!isValidEmail(inviteeEmail)) {
    return res.status(400).json({ error: 'Invalid invitee email format' });
  }

  const id = Date.now().toString();
  db.run(
    'INSERT INTO appointments (id, eventId, userId, inviteeEmail, startTime, endTime, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, eventId, userId, inviteeEmail, startTime, endTime, status],
    (err) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.status(201).json({ id, eventId, userId, inviteeEmail, startTime, endTime, status });
    }
  );
});

// Partially update an appointment
router.patch('/:appointmentId', auth, (req, res) => {
  const { appointmentId } = req.params;
  const { eventId, userId, inviteeEmail, startTime, endTime, status } = req.body;

  if (!eventId && !userId && !inviteeEmail && !startTime && !endTime && !status) {
    return res.status(400).json({ error: 'At least one field is required' });
  }

  if (inviteeEmail && !isValidEmail(inviteeEmail)) {
    return res.status(400).json({ error: 'Invalid invitee email format' });
  }

  const fields = [];
  const values = [];

  if (eventId) {
    fields.push('eventId = ?');
    values.push(eventId);
  }
  if (userId) {
    fields.push('userId = ?');
    values.push(userId);
  }
  if (inviteeEmail) {
    fields.push('inviteeEmail = ?');
    values.push(inviteeEmail);
  }
  if (startTime) {
    fields.push('startTime = ?');
    values.push(startTime);
  }
  if (endTime) {
    fields.push('endTime = ?');
    values.push(endTime);
  }
  if (status) {
    fields.push('status = ?');
    values.push(status);
  }

  values.push(appointmentId);

  const query = `UPDATE appointments SET ${fields.join(', ')} WHERE id = ?`;

  db.run(query, values, function (err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json({ id: appointmentId, eventId, userId, inviteeEmail, startTime, endTime, status });
  });
});

// Delete an appointment
router.delete('/:appointmentId', auth, (req, res) => {
  const { appointmentId } = req.params;

  db.run('DELETE FROM appointments WHERE id = ?', [appointmentId], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.status(204).send(); // No content
  });
});

// Get all appointments
router.get('/', auth, (req, res) => {
  db.all('SELECT * FROM appointments', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// Get a specific appointment by ID
router.get('/:appointmentId', auth, (req, res) => {
  const { appointmentId } = req.params;

  db.get('SELECT * FROM appointments WHERE id = ?', [appointmentId], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json(row);
  });
});

module.exports = router;