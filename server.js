const express = require('express');
const path = require('node:path');
const {sports} = require('./public/data');
const app = express();
app.use(express.static(path.join(__dirname, 'public')));
const leagues = new Set(sports.Soccer.map(row => row[1]));
const feeds = new Map([...leagues].map(code => [code, 'soccer/'+code]));
feeds.set('nba', 'basketball/nba');
feeds.set('nfl', 'football/nfl');
feeds.set('ufc', 'mma/ufc');
const cache = new Map();
const easternDay = new Intl.DateTimeFormat('en-CA',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'});
const easternTime = new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',hour:'numeric',minute:'2-digit'});
// Selected dates from the WBC fight calendar. Times are unpublished.
const announced = [
  ['2026-11-20','Gabriela Fundora','Jasmina Zapotoczna'],
  ['2026-11-20','Lauren Price','Michaela Kotaskova'],
  ['2026-11-28','Agit Kabayel','Nelson Hysa'],
  ['2026-11-29','Erika Bolivar','Roxana Maria Colmenarez']
];
async function boxingSchedule(date) {
  const url = new URL('https://wbcboxing.com/en/wp-json/tribe/events/v1/events');
  url.search = new URLSearchParams({start_date:date+' 00:00:00',end_date:date+' 23:59:59',per_page:'100'});
  try {
    const response = await fetch(url,{signal:AbortSignal.timeout(4500)});
    if (response.ok) {
      const {events} = await response.json();
      const games = events.filter(e => e.start_date?.startsWith(date)).map(e => ({
        home:e.title.replace(/<[^>]*>/g,'').replaceAll('&amp;', '&'), away:'', score:'', status:'WBC event · local date'
      }));
      if (games.length) return {games};
    }
  } catch { /* Use the published listings below if the service is unavailable. */ }
  return {games:announced.filter(row=>row[0]===date).map(([,home,away])=>({home,away,score:'vs',status:'Time unconfirmed'})), note:'Selected WBC listings · dates as announced by the organizer.'};
}
app.get(['/api/soccer','/api/schedule'], async (req, res) => {
  const {league, date} = req.query;
  if ((!feeds.has(league) && league !== 'boxing') || (req.path === '/api/soccer' && !leagues.has(league)) || typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
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
    if (league === 'boxing') return res.set('Cache-Control','public, s-maxage=300').json(await boxingSchedule(date));
    const url = new URL('https://site.api.espn.com/apis/site/v2/sports/' + feeds.get(league) + '/scoreboard');
    const next = new Date(day);
    next.setUTCDate(day.getUTCDate()+1);
    url.searchParams.set('dates', date.replaceAll('-','') + '-' + next.toISOString().slice(0,10).replaceAll('-',''));
    const response = await fetch(url, {signal: AbortSignal.timeout(6000)});
    if (!response.ok) throw new Error('Feed unavailable');
    const {events} = await response.json();
    const games = [];
    for (const event of events) {
      if (easternDay.format(new Date(event.date)) !== date) continue;
      for (const contest of event.competitions) {
        const teams = contest.competitors || [];
        const home = teams.find(team => team.homeAway === 'home') || teams[0];
        const away = teams.find(team => team !== home);
        const status = contest.status || event.status;
        const started = status?.type?.state !== 'pre';
        const isFight = league === 'ufc';
        const name = side => side?.team?.displayName || side?.athlete?.displayName || 'TBD';
        const time = easternTime.format(new Date(isFight ? event.date : contest.date || event.date))+' ET';
        games.push({home:name(home),away:name(away),score:started && !isFight && home?.score != null && away?.score != null ? home.score+' – '+away.score : 'vs',
          status:started ? status.type.shortDetail : contest.timeValid === false ? 'Time TBA' : isFight ? 'Card starts '+time : time});
      }
      if (league === 'ufc' && !event.competitions.length) games.push({home:event.name,away:'',score:'',status:'Fight card'});
    }
    const data = {games, updated:new Date().toISOString()};
    if (cache.size >= 200) cache.delete(cache.keys().next().value);
    cache.set(key,{data,expires:Date.now()+60000});
    res.json(data);
  } catch {
    res.status(502).json({error:'The schedule feed is unavailable. Please retry.'});
  }
});
module.exports = app;
if (require.main === module) app.listen(process.env.PORT || 3000);
