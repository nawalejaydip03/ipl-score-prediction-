const { readFileSync } = require('fs');
const { join } = require('path');

const TEAMS = [
  'Chennai Super Kings',
  'Delhi Daredevils',
  'Kings XI Punjab',
  'Kolkata Knight Riders',
  'Mumbai Indians',
  'Rajasthan Royals',
  'Royal Challengers Bangalore',
  'Sunrisers Hyderabad'
];

const MODEL = JSON.parse(readFileSync(join(__dirname, '..', '..', 'netlify-model.json'), 'utf8'));

function encodeTeam(teamName) {
  const encoding = new Array(8).fill(0);
  const index = TEAMS.indexOf(teamName);
  if (index >= 0) encoding[index] = 1;
  return encoding;
}

function predictScore(payload) {
  const features = [
    ...encodeTeam(payload.batting_team),
    ...encodeTeam(payload.bowling_team),
    Number(payload.overs),
    Number(payload.runs),
    Number(payload.wickets),
    Number(payload.runs_in_prev_5),
    Number(payload.wickets_in_prev_5)
  ];

  const score = MODEL.intercept + features.reduce((sum, value, index) => sum + value * MODEL.coef[index], 0);
  const predictedScore = Math.round(score);

  return {
    success: true,
    predicted_score: predictedScore,
    range_low: predictedScore - 10,
    range_high: predictedScore + 5
  };
}

exports.handler = async (event) => {
  const path = event.path.replace('/.netlify/functions/api', '');

  if (event.httpMethod === 'GET' && path === '/teams') {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ teams: TEAMS })
    };
  }

  if (event.httpMethod === 'POST' && path === '/predict') {
    try {
      const body = JSON.parse(event.body || '{}');

      if (!body.batting_team || !body.bowling_team) {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify({ success: false, error: 'Teams are required' })
        };
      }

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify(predictScore(body))
      };
    } catch (error) {
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ success: false, error: `Error: ${error.message}` })
      };
    }
  }

  return {
    statusCode: 404,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ success: false, error: 'Not found' })
  };
};