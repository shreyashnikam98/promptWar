const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const aiService = require('../src/services/aiService');
const weatherService = require('../src/services/weatherService');

describe('City Life Core Backend & Intelligence Tests', () => {

  test('AI Service: Baseline NLP Complaint Classification recognizes road cavity hazard', async () => {
    const result = await aiService.classifyReport(
      'Deep pothole cavity near highway corner',
      'There is a broken asphalt crater causing bikes to skid.'
    );

    assert.strictEqual(result.predictedCategory, 'Dangerous road');
    assert.ok(result.confidence > 0.6, 'Confidence score should be above baseline threshold');
    assert.ok(result.source, 'Should declare source baseline');
  });

  test('AI Service: Priority triage calculates appropriate severity for critical accidents', () => {
    const triage = aiService.estimatePriority(
      'Road accident',
      'critical',
      'Two vehicles collided, ambulance requested',
      2
    );

    assert.strictEqual(triage.priority, 'urgent');
    assert.ok(triage.score >= 65, 'Urgent priority score expected');
    assert.ok(triage.disclaimer.includes('triage suggestion'), 'Must contain transparent disclaimer');
  });

  test('AI Service: Proximity Duplicate Candidate Detection identifies nearby reports', () => {
    const existing = [
      {
        _id: '507f1f77bcf86cd799439011',
        title: 'Waterlogged ditch on FC road',
        description: 'Road inundated with rainwater puddles',
        category: 'Waterlogging',
        reportedAt: new Date(),
        location: { coordinates: [73.8402, 18.5246] },
        status: 'pending'
      }
    ];

    const candidate = {
      title: 'Waterlogged flooded street on FC road',
      description: 'Severe water logging near college road',
      category: 'Waterlogging',
      reportedAt: new Date(),
      location: { coordinates: [73.8405, 18.5248] } // ~40m away
    };

    const duplicates = aiService.findDuplicateCandidates(candidate, existing);
    assert.strictEqual(duplicates.length, 1);
    assert.strictEqual(duplicates[0].category, 'Waterlogging');
    assert.ok(duplicates[0].distanceMeters < 100);
  });

  test('Weather Service: Fallback returns honest labeled climatological baseline when unconfigured', async () => {
    const weather = await weatherService.getWeather('Pune');
    assert.strictEqual(weather.city, 'Pune');
    assert.ok(typeof weather.temp === 'number');
    assert.ok(weather.source.includes('Reference Standard') || weather.source.includes('Live Feed'));
  });

  test('Security: Bcrypt correctly hashes passwords and rejects incorrect passwords', async () => {
    const plain = 'SecretPass@2026';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(plain, salt);

    const isMatch = await bcrypt.compare(plain, hash);
    const isWrong = await bcrypt.compare('WrongPassword', hash);

    assert.strictEqual(isMatch, true);
    assert.strictEqual(isWrong, false);
  });

  test('Authentication: JWT generates and verifies valid payloads', () => {
    const secret = 'test_secret_key_123';
    const payload = { id: 'usr_9921', role: 'moderator' };
    const token = jwt.sign(payload, secret, { expiresIn: '1h' });

    const decoded = jwt.verify(token, secret);
    assert.strictEqual(decoded.id, 'usr_9921');
    assert.strictEqual(decoded.role, 'moderator');
  });

});
