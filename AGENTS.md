# SportsLive proposal

Adrian Nogueira is the sole member. Sports fans who currently check individual league sites can select a day, open a sport and see matchups, scores and fight results. The main screen has date shortcuts above five expandable sport sections. Matchday Press groups news by sport, team or fighter, and date.

The minimum version is a phone- and laptop-friendly scores page on Vercel that requests a validated Express route. GET /api/soccer accepts a league and ISO calendar date and returns games or an error. The advanced feature is external sports data, owned by Adrian. Priorities after the demo are live results for other sports, tested backup feeds, and sourced news. Outages show a feed error and an explicitly selected demo remains available.

Use server.js in the root and plain HTML, CSS and JavaScript in public. Read secrets from environment variables and exclude .env from Git. Use free services with no payment card. End each task with a commit and push. Work through deployment, route, application features and advanced features in order, checking each stage on the deployed site. Record actual manual test outcomes and the report's prompts and error.
