# NC News Seeding

A RESTful API built with Node.js, Express, and PostgreSQL that serves articles, comments, topics, and user data.

## Project Setup

### Prerequisites
- Node.js
- PostgreSQL
- npm

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd nc-news
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
   - Create two .env files in the root directory:
     - `.env.test` - for the test database
     - `.env.development` - for the development database
   
   - Add the following contents to each file:

   For `.env.test`:
   ```
   PGDATABASE=nc_news_test
   ```

   For `.env.development`:
   ```
   PGDATABASE=nc_news
   ```

   Note: If you're running PostgreSQL on a non-default port or with different credentials, you may also need to add:
   ```
   PGUSER=your_postgres_username
   PGPASSWORD=your_postgres_password
   PGHOST=localhost
   PGPORT=5432
   ```

4. Set up the databases
```bash
npm run setup-dbs
```

5. Seed the development database
```bash
npm run seed-dev
```

6. Run tests
```bash
npm test
```

## API Endpoints

[API documentation to be added]

## Features

- Articles with comments
- User accounts
- Topics
- Voting on articles and comments

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)