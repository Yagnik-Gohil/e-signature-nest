# E-Signature Backend | NestJS

### Clone Repository

- Clone The Repository And install packages
```
git clone https://github.com/Yagnik-Gohil/e-signature-nest.git
```
- Move to directory
```
cd e-signature-nest
```
- Install dependency
```
npm install
```

### ENV & Database Setup
- Create database `e_signature_dev` in PostgreSQL
- Create `config/env/development.env` from `config/env/example.env`
- Go to `config/env/development.env` and update the database & AWS credentials
- Run Below command to migrate & seed the database
```
npm run migration:up:development
```

### Run Project
```
npm run start:development
```
- Go to `http://localhost:3000/api` and verify server is live.

- After completing the backend setup, Go to https://github.com/Yagnik-Gohil/e-signature-react and setup the e-signature frontend.


## Migration Commands (For development purpose)

#### Migration create command: (Auto detect)

```
npm run migration:generate src/migrations/name
```

#### Migration create command: (Custom)

```
npx typeorm migration:create src/migrations/name
```

#### Seeder create command:

```
npx typeorm migration:create src/seeders/name
```