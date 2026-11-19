# SportsLive

Adrian Nogueira · solo class project

SportsLive shows daily matchups for soccer, American football, basketball, UFC and boxing. Select Scores, choose a day, then expand a sport. Basketball opens with sample data. Soccer includes the Premier League, La Liga, Serie A, Bundesliga and Ligue 1. Its Live scores selector requests ESPN data through Express. Today's live soccer view refreshes every minute while visible. Live coverage depends on the provider.

## Try the preview

Open public/index.html in a browser for the interactive demo. The sample schedule covers yesterday, today and tomorrow. News and transfer headlines are labeled samples. The real soccer feed requires the server.

## Run locally

Install Node.js 22 or newer. From the repository folder run:

```sh
npm install
npm start
```

Open http://localhost:3000. Expand Soccer and switch Demo to Live scores. Server entry point: server.js. The earlier app.py is the original Flask welcome screen.

## Deployment

Import this GitHub repository into a personal Vercel Hobby project, select Express and use the repository root. The public deployment URL is pending verification.
