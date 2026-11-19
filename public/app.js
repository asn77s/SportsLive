const byId = id => document.getElementById(id);
const today = easternToday();
let selected = today;
let newsType = '';
let frontPage = true;
let soccerMode = 'Demo';
let revision = 0;
const expanded = new Set(['Basketball']);
function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}
function option(value) { return new Option(value,value); }
function match(home, away, score, status) {
  const row = element('div', undefined, 'match');
  row.append(element('b',home),element('i',score),element('b',away),element('time',status));
  return row;
}
function demoGames(panel, sport) {
  const yesterday = moveDay(today,-1);
  if (![today,yesterday,moveDay(today,1)].includes(selected)) {
    panel.append(element('p','No demo events for this date.')); return;
  }
  sports[sport].forEach(([league,code,home,away,time]) => {
    panel.append(element('h3',league));
    if (selected === yesterday) {
      const result = {Soccer:'2 – 1', Football:'21 – 17', Basketball:'104 – 98', UFC:'Decision', Boxing:'TKO'}[sport];
      panel.append(match(home,away,result,'Final'));
    } else {
      panel.append(match(selected === today ? home : away,selected === today ? away : home,'vs',time+' ET'));
    }
  });
}
async function liveLeague(target, code, requestedDate, version) {
  try {
    const response = await fetch('/api/soccer?'+new URLSearchParams({league:code,date:requestedDate}));
    if (!response.ok) throw new Error();
    const {games} = await response.json();
    if (version !== revision) return;
    target.replaceChildren(...games.map(game => match(game.home,game.away,game.score,game.status)));
    if (!games.length) target.textContent = 'No matches scheduled.';
  } catch {
    if (version === revision) target.textContent = 'Live feed unavailable. Select Demo or refresh to retry.';
  }
}
function showPanel(panel,sport) {
  panel.replaceChildren();
  if (sport === 'Soccer') {
    const select = element('select');
    select.setAttribute('aria-label','Soccer data source');
    select.append(option('Demo'),option('Live scores'));
    select.value = soccerMode;
    select.onchange = () => { soccerMode = select.value; render(); };
    panel.append(select);
    if (soccerMode === 'Live scores') {
      if (location.protocol === 'file:') {
        panel.append(element('p','Start the Express server to load live scores.')); return;
      }
      for (const [league,code] of sports.Soccer) {
        const target = element('div','Loading…');
        panel.append(element('h3',league),target);
        liveLeague(target,code,selected,revision);
      }
      return;
    }
  }
  panel.append(element('p','Demo schedule','tag'));
  demoGames(panel,sport);
}
function render() {
  revision++;
  byId('front').hidden = !frontPage;
  document.querySelector('.days').hidden = frontPage;
  byId('dateline').hidden = frontPage;
  if (frontPage) {
    byId('board').hidden = true;
    byId('press').hidden = true;
    return;
  }
  byId('date').value = selected;
  byId('dateline').textContent = new Date(selected+'T12:00:00Z').toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric',timeZone:'UTC'})+' · All times Eastern';
  document.querySelectorAll('[data-day]').forEach(b => b.setAttribute('aria-pressed',moveDay(today,Number(b.dataset.day)) === selected));
  byId('board').hidden = Boolean(newsType);
  byId('press').hidden = !newsType;
  if (newsType) { showNews(); return; }
  byId('board').replaceChildren();
  for (const sport of Object.keys(sports)) {
    const details = element('details',undefined,'sport');
    const panel = element('div',undefined,'panel');
    details.open = expanded.has(sport);
    details.append(element('summary',sport),panel);
    byId('board').append(details);
    if (details.open) showPanel(panel,sport);
    details.ontoggle = () => {
      if (details.open) {
        expanded.add(sport);
        if (!panel.childElementCount) showPanel(panel,sport);
      } else { expanded.delete(sport); panel.replaceChildren(); }
    };
  }
}
function updateTeams() {
  const sport = byId('sport').value;
  byId('entity').textContent = ['UFC','Boxing'].includes(sport) ? 'Fighter' : 'Team';
  const names = sports[sport].flatMap(row => row.slice(2,4));
  byId('team').replaceChildren(...names.map(option));
}
function showNews() {
  const name = byId('team').value;
  byId('headline').textContent = name+' · '+newsType;
  const article = byId('story');
  article.replaceChildren(element('small','DEMO STORIES','tag'));
  if (selected !== today || newsType === 'Transfer News' && byId('sport').value !== 'Soccer') {
    article.append(element('p','No sample stories for this selection.')); return;
  }
  const title = newsType === 'Transfer News' ? name+' summer transfer watch' : 'Inside training with '+name;
  article.append(element('h2',title),element('p','Sample headline for this edition of Matchday Press.'));
}
byId('sport').append(...Object.keys(sports).map(option));
updateTeams();
byId('sport').onchange = () => { updateTeams(); showNews(); };
byId('team').onchange = showNews;
byId('scores').onclick = () => { frontPage=false; newsType=''; byId('menu').open=false; render(); };
document.querySelectorAll('[data-news]').forEach(b => b.onclick = () => { frontPage=false; newsType=b.dataset.news; byId('menu').open=false; render(); });
document.querySelectorAll('[data-day]').forEach(b => b.onclick = () => { selected=moveDay(today,Number(b.dataset.day)); render(); });
document.querySelectorAll('[data-step]').forEach(b => b.onclick = () => { selected=moveDay(selected,Number(b.dataset.step)); render(); });
byId('date').onchange = event => { if (event.target.value) selected=event.target.value; render(); };
setInterval(() => {
  if (!document.hidden && !newsType && soccerMode === 'Live scores' && expanded.has('Soccer') && selected === easternToday()) render();
},60000);
render();

document.querySelectorAll('[data-open]').forEach(button => {
  button.onclick = () => {
    expanded.clear();
    expanded.add(button.dataset.open);
    byId('scores').click();
  };
});
