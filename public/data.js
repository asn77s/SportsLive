// Sample matchups for the interactive preview. Times are Eastern.
const sports = {
  Soccer: [
    ['Premier League', 'eng.1', 'Arsenal', 'Chelsea', '10:00 AM'],
    ['La Liga', 'esp.1', 'Barcelona', 'Real Madrid', '3:00 PM'],
    ['Serie A', 'ita.1', 'Inter', 'Milan', '2:45 PM'],
    ['Bundesliga', 'ger.1', 'Bayern Munich', 'Dortmund', '12:30 PM'],
    ['Ligue 1', 'fra.1', 'Paris Saint-Germain', 'Marseille', '3:05 PM']
  ],
  Football: [['NFL', 'nfl', 'Philadelphia Eagles', 'New York Giants', '8:15 PM']],
  Basketball: [['NBA', 'nba', 'Boston Celtics', 'New York Knicks', '7:00 PM']],
  UFC: [['Main card', 'ufc', 'Rafael Torres', 'Miles Carter', '10:00 PM']],
  Boxing: [['Main card', 'boxing', 'Elijah Moore', 'Victor Reyes', '9:00 PM']]
};
function easternToday() {
  return new Intl.DateTimeFormat('en-CA', {timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
}
function moveDay(date, offset) {
  const day = new Date(date + 'T12:00:00Z');
  day.setUTCDate(day.getUTCDate() + offset);
  return day.toISOString().slice(0,10);
}
if (typeof module !== 'undefined') module.exports = {sports, easternToday};
