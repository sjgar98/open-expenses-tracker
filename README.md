# Open Expenses Tracker

A self-hosted web app for tracking personal finances: expenses, income, savings and the accounts and payment methods behind them, in multiple currencies.

## Features

- **Expenses and income**: record one-time entries, or set up recurring ones using flexible recurrence rules (RRULE). Recurring entries are created automatically when they fall due.
- **Accounts and payment methods**: organize money by account, each with its own currency. Payment methods can be marked as credit, with recurring closing and due dates, so you can see what is coming up.
- **Savings and savings buckets**: put money aside into buckets, optionally with a target amount and a deadline, and track how much has been saved and spent from each one.
- **Categories, income sources and taxes**: classify expenses by category and income by source, and apply taxes to expenses.
- **Multi-currency**: manage your own list of currencies. Exchange rates are fetched from [Open Exchange Rates](https://openexchangerates.org) every 6 hours and kept as history, and totals are shown in your chosen display currency.
- **Dashboard**: rearrangeable widgets for the monthly summary (income, expenses, savings and unspent money), expenses by category and by payment method, income by account and by source, savings buckets, upcoming expenses and upcoming credit due dates.
- **Statistics**: charts and an expenses heatmap.
- **Multi-user**: each user has their own data. The first user to sign up becomes the administrator.
- **API access**: besides JWT login, the API accepts API keys through the `X-API-KEY` header.

## Self-hosting with Docker

The app ships as a single Docker image that serves both the web interface and the API:

```
ghcr.io/sjgar98/open-expenses-tracker:develop
```

### Requirements

- Docker with Docker Compose
- A running MariaDB or MySQL server, with an empty database and a user that has full privileges on it
- An [Open Exchange Rates](https://openexchangerates.org/signup) API key (the free plan is enough)

### 1. Create the `.env` file

```env
JWT_SECRET="<long secret>"
JWT_DURATION="7d"
OPENEXCHANGERATES_API_KEY="<api key>"
DB_HOST="<db host>"
DB_DRIVER="mariadb"
DB_USERNAME="openexpensestracker"
DB_PASSWORD="openexpensestracker"
DB_NAME="openexpensestracker"
TZ="Etc/UTC"
```

You can generate a strong secret with `openssl rand -base64 48`.

#### Environment variables

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `JWT_SECRET` | Yes | | Secret used to sign login tokens. |
| `JWT_DURATION` | No | `12h` | How long a login session lasts, for example `12h` or `7d`. |
| `OPENEXCHANGERATES_API_KEY` | Yes | | API key for Open Exchange Rates. |
| `DB_DRIVER` | No | `mariadb` | `mariadb` or `mysql`. |
| `DB_HOST` | No | `localhost` | Database host. |
| `DB_PORT` | No | `3306` | Database port. |
| `DB_USERNAME` | No | `openexpensestracker` | Database user. |
| `DB_PASSWORD` | No | `openexpensestracker` | Database password. |
| `DB_NAME` | No | `openexpensestracker` | Database name. |
| `DB_LOGGING` | No | `false` | Log SQL queries. |
| `TZ` | No | | Container time zone. |

### 2. Create `docker-compose.yml`

Put this next to your `.env` file:

```yaml
services:
  app:
    image: ghcr.io/sjgar98/open-expenses-tracker:develop
    restart: unless-stopped
    env_file: .env
    ports:
      - "3000:3000"
```

### 3. Start it

```sh
docker compose up -d
```

Open `http://localhost:3000` and sign up. The first account you create is the administrator.

Anyone who can reach the app can sign up, so keep that in mind before you expose it to the internet. To serve it on a domain with HTTPS, put a reverse proxy such as Caddy, Traefik or nginx in front of it.

## License

[MIT](LICENSE.md)
