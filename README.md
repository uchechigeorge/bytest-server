# BY Test Server

## Scripts

- To install necessary dependencies, run `npm install`
- To start up development server, run `npm run dev`
- To compile typescript code, run `npm run build`

## Database

- The SQL script user for this project can be found in `src/database/model.sql`
- If database is created, the environment variables for the database login details are updated.

> Note: `.env.txt`(in the root folder) contains the template for variablies used in the project

- The following values should be updated
  - DB_SERVER = The database server
  - DB_USER = The username login for the database
  - DB_PASSWORD = The password login for the database
  - DB_NAME - The name of the database

## API Docs

The API documentation can be viewed [here](https://documenter.getpostman.com/view/13534924/2s9Xy2Ps1h)
