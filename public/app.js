const byId = id => document.getElementById(id);
const today = easternToday();
let selected = today;
let newsType = '';
let frontPage = true;

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

function drawDates() {
  const strip = byId('date-strip');
  strip.replaceChildren();
  for (let offset=-1; offset<=5; offset++) {
    const date = moveDay(selected,offset);
    const relative = {'-1':'Yesterday',0:'Today',1:'Tomorrow'};
    const difference = Math.round((Date.parse(date)-Date.parse(easternToday()))/86400000);
    const label = relative[difference] || new Date(date+'T12:00:00Z').toLocaleDateString('en-US',{timeZone:'UTC',weekday:'short',month:'short',day:'numeric'});
    const btn = element('button',label);
    btn.setAttribute('aria-pressed',date === selected);
    btn.onclick = () => {selected=date; render();};
    strip.append(btn);
  }
}
async function liveLeague(target, code, requestedDate, version) {
  try {
    const response = await fetch('/api/schedule?'+new URLSearchParams({league:code,date:requestedDate}));
    if (!response.ok) throw new Error();
    const {games,note} = await response.json();
    if (version !== revision || !target.isConnected) return;
    target.replaceChildren(...games.map(game => match(game.home,game.away,game.score,game.status)));
    if (!games.length) target.append(element('p','No events listed for this date.'));
    if (note) target.append(element('small',note));
  } catch {
    if (version !== revision) return;
    const retry = element('button','Retry');
    retry.onclick = () => {target.textContent='Loading…'; liveLeague(target,code,requestedDate,version);};
    target.replaceChildren(element('p','Schedule temporarily unavailable.'),retry);
  }
}
function showPanel(panel,sport) {
  panel.replaceChildren();
  for (const [league,code] of sports[sport]) {
    const target = element('div','Loading…');
    panel.append(element('h3',league === 'Main card' ? sport+' card' : league),target);
    liveLeague(target,code,selected,revision);
  }
  if (sport === 'Boxing') {
    const source = element('a','World Boxing Council fight calendar');
    source.href = 'https://wbcboxing.com/en/events/';
    panel.append(source);
  }
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
  drawDates();
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

document.querySelectorAll('[data-step]').forEach(b => b.onclick = () => { selected=moveDay(selected,Number(b.dataset.step)); render(); });
byId('date').onchange = event => { if (event.target.value) selected=event.target.value; render(); };
setInterval(() => {
  if (!document.hidden && !frontPage && !newsType && expanded.size && selected === easternToday()) render();
},60000);
render();

document.querySelectorAll('[data-open]').forEach(button => {
  button.onclick = () => {
    expanded.clear();
    expanded.add(button.dataset.open);
    byId('scores').click();
  };
});
