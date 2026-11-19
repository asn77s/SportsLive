const express = require('express');
const path = require('node:path');
const {sports} = require('./public/data');
const app = express();
app.use(express.static(path.join(__dirname, 'public')));
const leagues = new Set(sports.Soccer.map(row => row[1]));
const cache = new Map();
app.get('/api/soccer', async (req, res) => {
  const {league, date} = req.query;
  if (!leagues.has(league) || typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({error:'Choose a listed league and a valid date.'});
  }
  const day = new Date(date + 'T12:00:00Z');
  if (!Number.isFinite(day.getTime()) || day.toISOString().slice(0,10) !== date) {
    return res.status(400).json({error:'Choose a valid calendar day.'});
  }
  const key = league + date;
  const saved = cache.get(key);
  if (saved && saved.expires > Date.now()) return res.json(saved.data);
  try {
    const url = new URL('https://site.api.espn.com/apis/site/v2/sports/soccer/' + league + '/scoreboard');
    const next = new Date(day);
    next.setUTCDate(day.getUTCDate()+1);
    url.searchParams.set('dates', date.replaceAll('-','') + '-' + next.toISOString().slice(0,10).replaceAll('-',''));
    const response = await fetch(url, {signal: AbortSignal.timeout(6000)});
    if (!response.ok) throw new Error('Feed unavailable');
    const {events} = await response.json();
    const games = events.filter(event => new Intl.DateTimeFormat('en-CA',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(event.date)) === date).map(event => {
      const teams = event.competitions[0].competitors;
      const home = teams.find(team => team.homeAway === 'home');
      const away = teams.find(team => team.homeAway === 'away');
      const started = event.status.type.state !== 'pre';
      return {home:home.team.displayName, away:away.team.displayName, score:started ? home.score+' – '+away.score : 'vs', status:started ? event.status.type.shortDetail : new Date(event.date).toLocaleTimeString('en-US',{timeZone:'America/New_York',hour:'numeric',minute:'2-digit'})+' ET'};
    });
    const data = {games, updated:new Date().toISOString()};
    if (cache.size >= 200) cache.delete(cache.keys().next().value);
    cache.set(key,{data,expires:Date.now()+60000});
    res.json(data);
  } catch {
    res.status(502).json({error:'The soccer feed is unavailable. Try again or select Demo.'});
  }
});
module.exports = app;
if (require.main === module) app.listen(process.env.PORT || 3000);
