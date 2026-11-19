# SportsLive

**Live website:** [https://sports-live-ten.vercel.app/](https://sports-live-ten.vercel.app/)

Adrian Nogueira · solo class project

SportsLive shows daily matchups for soccer, American football, basketball, UFC and boxing. Select Scores, choose a day, then expand a sport. Scores loads date-specific listings from ESPN for the NBA, NFL, UFC and five European soccer leagues. Boxing shows selected World Boxing Council listings. Use the rolling date strip or calendar to browse ahead. Team game times are Eastern. UFC times refer to the card, and boxing dates follow the organizer. The newspaper homepage and news stories include labeled demo content.

## Run locally

Install Node.js 22 or newer. From the repository folder run:

```sh
npm install
npm start
```

Open http://localhost:3000. Open Scores, choose a date and expand a sport. Server entry point: server.js. The earlier app.py is the original Flask welcome screen.

## Deployment

Import this GitHub repository into a personal Vercel Hobby project, select Express and use the repository root. The production site is https://sports-live-ten.vercel.app/.
