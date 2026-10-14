# Gator 🐊

Gator is a multi-user command-line RSS aggregator written in TypeScript. You add RSS feeds and follow the ones you like. A long-running background worker fetches new posts and stores them in PostgreSQL, and you browse the latest posts right in your terminal.

## Requirements

- **Node.js** 22+ (the repo includes an `.nvmrc`, so `nvm use` picks the right version)
- **npm** (comes with Node)
- **PostgreSQL** 16+

## Installation

```bash
git clone https://github.com/foreverjamila/Blog-Aggregator.git
cd Blog-Aggregator
npm install
```

## Database setup

1. Make sure Postgres is running:

   ```bash
   # Linux / WSL
   sudo service postgresql start
   # macOS (Homebrew)
   brew services start postgresql@16
   ```

2. Create a database called `gator`:

   ```bash
   # Linux / WSL
   sudo -u postgres psql -c "CREATE DATABASE gator;"
   # macOS
   psql postgres -c "CREATE DATABASE gator;"
   ```

3. Create the config file (see below), then run the migrations to create the tables:

   ```bash
   npm run migrate
   ```

## Configuration

Gator reads its settings from a JSON file in your **home directory** (not the project folder): `~/.gatorconfig.json`.

Create it with your Postgres connection string:

```json
{
  "db_url": "postgres://USERNAME:PASSWORD@localhost:5432/gator?sslmode=disable"
}
```

- The format is `postgres://username:password@host:port/database`.
- On a default Linux install, the username is usually `postgres`. On macOS with Homebrew it's your system username, often with no password.
- `?sslmode=disable` is needed for a local database without SSL.
- You don't need to add `current_user_name`. Gator sets it when you run `register` or `login`.

To check your connection string, run `psql "postgres://USERNAME:PASSWORD@localhost:5432/gator"`. If you land at a `gator=#` prompt, it works.

> Your config file holds your database password. It lives outside the repo, so it never gets committed.

## Usage

Run commands with:

```bash
npm run start <command> [arguments]
```

### Quick start

```bash
# create a user (this also logs you in)
npm run start register alice

# add a feed (you automatically follow feeds you add)
npm run start addfeed "Hacker News" "https://news.ycombinator.com/rss"

# in a separate terminal: fetch new posts every minute (Ctrl+C to stop)
npm run start agg 1m

# read the 10 newest posts from the feeds you follow
npm run start browse 10
```

### Commands

| Command | Description |
|---|---|
| `register <name>` | Create a new user and log in as them |
| `login <name>` | Switch to an existing user |
| `users` | List all users and mark the logged-in one with `(current)` |
| `addfeed <name> <url>` 🔒 | Add an RSS feed and follow it |
| `feeds` | List every feed in the database and who added it |
| `follow <url>` 🔒 | Follow a feed someone else added |
| `following` 🔒 | List the feeds you follow |
| `unfollow <url>` 🔒 | Stop following a feed |
| `agg <interval>` | Keep fetching feeds in a loop, one feed per interval (e.g. `30s`, `1m`, `1h`). Stop it with Ctrl+C. |
| `browse [limit]` 🔒 | Show the newest posts from feeds you follow (default: 2) |
| `reset` | ⚠️ Delete **all** users, feeds, follows and posts. Meant for development only. |

🔒 = requires a logged-in user.

### How the aggregator works

`agg` is meant to run in the background while you use other commands in a second terminal. On each tick it:

1. picks the feed that was fetched longest ago (feeds that have never been fetched come first),
2. downloads and parses its RSS,
3. saves any new posts. Posts it has already saved are skipped, so re-running it never creates duplicates.

Please choose a reasonable interval. Gator fetches one feed per tick, but there's no reason to hit other people's servers more than every few seconds.

## Development

```bash
npm run generate   # create a new migration after changing src/lib/db/schema.ts
npm run migrate    # apply pending migrations
npx tsc --noEmit   # type-check the project
```

### Project structure

```
src/
├── index.ts          # entry point: registers commands and runs one
├── commands.ts       # command registry (name → handler)
├── handler.ts        # command handlers
├── middleware.ts     # logged-in middleware for user commands
├── aggregate.ts      # scraper loop + duration parsing
├── config.ts         # reads/writes ~/.gatorconfig.json
└── lib/
    ├── rss.ts        # fetches and parses RSS feeds
    └── db/
        ├── index.ts      # database connection (Drizzle + postgres.js)
        ├── schema.ts     # table definitions
        ├── queries/      # query functions per table
        └── migrations/   # generated SQL migrations
```

### Built with

- [TypeScript](https://www.typescriptlang.org/) + [tsx](https://github.com/privatenumber/tsx)
- [PostgreSQL](https://www.postgresql.org/) + [Drizzle ORM](https://orm.drizzle.team/)
- [fast-xml-parser](https://github.com/NaturalIntelligence/fast-xml-parser)

Built as part of the [Boot.dev](https://www.boot.dev) "Build a Blog Aggregator in TypeScript" course.
