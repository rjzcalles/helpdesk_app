# helpdesk_app

version 1.0.0

## Installation -dev

1. Clone the repository

on the server folder client run this command:
1. Run `npm install`
2. Run `npm start`

on the server folder server run this command:
1. Modify the .env file
2. Run `npm install`
3. Run `npx sequelize-cli db:migrate`
4. Run `node index.js`

## Installation -pro

1. `git pull`
2. `npm run build` on client
3. `git add .`
4. `git commit -m ""`
5. `git push`

## Authors

- Rodrigo Zaldaña
- Marcos Gómez
------------------------------------------------------------

## .env --dev
`# Autenticación`
`JWT_SECRET="MI_PALABRA_SECRETA_SUPER_SEGURA"`

`# Base de Datos`
`DB_USER="root"`
`DB_PASS=""`
`DB_NAME="helpdesk_db"`
`DB_HOST="127.0.0.1"`

