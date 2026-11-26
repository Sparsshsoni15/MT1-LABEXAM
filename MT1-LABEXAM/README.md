# MT1-LABEXAM — Hospital Patient Management

A Node.js lab-exam solution implementing:
- **Part A:** Built-in `http` and `fs` modules on port **3000**.
- **Part B:** Express.js CRUD REST API on port **4000**.
- In-memory JavaScript arrays only; no database is used.

## Requirements
- Node.js (LTS recommended)
- npm

## Setup

```bash
npm install
```

## Run Part A — Node HTTP + FS

In terminal 1:

```bash
node httpServer.js
```

Expected message:

```text
HTTP Server running at http://localhost:3000
```

Open:
- `http://localhost:3000/` — HTML welcome page
- `http://localhost:3000/patients` — patient list as JSON
- `http://localhost:3000/about` — hospital information
- `http://localhost:3000/hospital-info` — HTML file read and served using `fs.readFile()`

Add a patient with:

```bash
curl -X POST http://localhost:3000/add-patient ^
  -H "Content-Type: application/json" ^
  -d "{\"id\":4,\"name\":\"Amit Kumar\",\"age\":35,\"disease\":\"Fever\",\"doctorName\":\"Dr. Sharma\"}"
```

On macOS/Linux, replace the `^` line continuations with `\`.

## Run Part B — Express REST API

In terminal 2:

```bash
node expressApp.js
```

Expected message:

```text
Express Server running at http://localhost:4000
```

### Endpoints

| Method | URL | Purpose |
|---|---|---|
| GET | `http://localhost:4000/patients` | Get all patients |
| GET | `http://localhost:4000/patients/1` | Get patient by ID |
| POST | `http://localhost:4000/patients` | Add a patient |
| PUT | `http://localhost:4000/patients/1` | Update patient 1 |
| DELETE | `http://localhost:4000/patients/1` | Delete patient 1 |

### POST body (Body → raw → JSON)

```json
{
  "id": 4,
  "name": "Amit Kumar",
  "age": 35,
  "disease": "Fever",
  "doctorName": "Dr. Sharma"
}
```

### PUT body (Body → raw → JSON)

The ID is taken from the URL; send the fields to update:

```json
{
  "name": "Amit Kumar",
  "age": 36,
  "disease": "Viral Fever",
  "doctorName": "Dr. Sharma"
}
```

### Expected status codes
- `200` — successful GET, update or delete
- `201` — patient created
- `400` — invalid ID, missing/invalid fields or malformed JSON
- `404` — unknown route or patient not found
- `409` — duplicate patient ID
- `413` — request body too large

> Data is stored in memory. Restarting either server resets its patient array to the three sample records.

## Suggested Git workflow

Create the repository on GitHub with the exact name `MT1-LABEXAM`, then from this project folder:

```bash
git init
git add .
git commit -m "Initial project setup"
git branch -M main
git remote add origin https://github.com/<your-username>/MT1-LABEXAM.git
git push -u origin main
```

Use meaningful commits as you complete and test each part, for example:

```bash
git add httpServer.js public/hospital-info.html
git commit -m "Implement HTTP routes and FS static file serving"

git add expressApp.js
git commit -m "Implement patient CRUD REST API with Express"

git add README.md .gitignore
git commit -m "Add project documentation and gitignore"
```

## Submission checklist
- [ ] Run both servers independently on ports 3000 and 4000.
- [ ] Capture HTTP server routes and the `/hospital-info` static file route.
- [ ] Capture Postman tests for GET all, GET by ID, POST, PUT and DELETE.
- [ ] Save screenshots in `screenshots/`.
- [ ] Push the complete project to a GitHub repository named `MT1-LABEXAM`.

## Project structure

```text
MT1-LABEXAM/
├── .gitignore
├── package.json
├── README.md
├── httpServer.js
├── expressApp.js
├── public/
│   └── hospital-info.html
└── screenshots/
    └── .gitkeep
```
