// Part B: Express.js REST API with in-memory patient records.
const express = require("express");

const app = express();
const PORT = 4000;

app.use(express.json({ limit: "1mb" }));

let patients = [
  { id: 1, name: "Amit Kumar", age: 35, disease: "Fever", doctorName: "Dr. Sharma" },
  { id: 2, name: "Priya Singh", age: 28, disease: "Migraine", doctorName: "Dr. Verma" },
  { id: 3, name: "Rahul Gupta", age: 42, disease: "Diabetes", doctorName: "Dr. Mehta" }
];

const requiredFields = ["id", "name", "age", "disease", "doctorName"];

function validatePatient(body, { requireId = true } = {}) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return "Request body must be a JSON object.";
  }

  const fields = requireId ? requiredFields : requiredFields.filter(field => field !== "id");
  const missing = fields.filter(field =>
    body[field] === undefined || body[field] === null || body[field] === ""
  );
  if (missing.length) return `Missing required fields: ${missing.join(", ")}.`;

  if (requireId && (!Number.isInteger(Number(body.id)) || Number(body.id) <= 0)) {
    return "id must be a positive integer.";
  }
  if (!Number.isInteger(Number(body.age)) || Number(body.age) <= 0) {
    return "age must be a positive integer.";
  }
  for (const field of ["name", "disease", "doctorName"]) {
    if (typeof body[field] !== "string" || !body[field].trim()) {
      return `${field} must be a non-empty string.`;
    }
  }
  return null;
}

function normalizePatient(body, id = Number(body.id)) {
  return {
    id,
    name: body.name.trim(),
    age: Number(body.age),
    disease: body.disease.trim(),
    doctorName: body.doctorName.trim()
  };
}

// GET /patients - retrieve all patients.
app.get("/patients", (req, res) => {
  res.status(200).json(patients);
});

// GET /patients/:id - retrieve one patient.
app.get("/patients/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "Patient id must be a positive integer." });
  }
  const patient = patients.find(item => item.id === id);
  if (!patient) return res.status(404).json({ error: "Patient not found." });
  return res.status(200).json(patient);
});

// POST /patients - create a patient.
app.post("/patients", (req, res) => {
  const validationError = validatePatient(req.body);
  if (validationError) return res.status(400).json({ error: validationError });

  const id = Number(req.body.id);
  if (patients.some(item => item.id === id)) {
    return res.status(409).json({ error: "A patient with this id already exists." });
  }

  const patient = normalizePatient(req.body, id);
  patients.push(patient);
  return res.status(201).json({ message: "Patient added successfully", patient });
});

// PUT /patients/:id - update all patient details except the id.
app.put("/patients/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "Patient id must be a positive integer." });
  }

  const index = patients.findIndex(item => item.id === id);
  if (index === -1) return res.status(404).json({ error: "Patient not found." });

  const validationError = validatePatient(req.body, { requireId: false });
  if (validationError) return res.status(400).json({ error: validationError });

  patients[index] = normalizePatient({ ...req.body, id }, id);
  return res.status(200).json({
    message: "Patient updated successfully",
    patient: patients[index]
  });
});

// DELETE /patients/:id - delete a patient.
app.delete("/patients/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "Patient id must be a positive integer." });
  }

  const index = patients.findIndex(item => item.id === id);
  if (index === -1) return res.status(404).json({ error: "Patient not found." });

  const [deletedPatient] = patients.splice(index, 1);
  return res.status(200).json({
    message: "Patient deleted successfully",
    patient: deletedPatient
  });
});

// Malformed JSON and other parsing errors.
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({ error: "Invalid JSON request body." });
  }
  if (error.type === "entity.too.large") {
    return res.status(413).json({ error: "Request body is too large." });
  }
  return next(error);
});

// Unknown endpoint.
app.use((req, res) => {
  res.status(404).json({ error: "Route not found." });
});

app.listen(PORT, () => {
  console.log(`Express Server running at http://localhost:${PORT}`);
});
