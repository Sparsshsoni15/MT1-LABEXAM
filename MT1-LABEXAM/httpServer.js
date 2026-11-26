// Part A: Node.js built-in HTTP and FS modules (no Express in this file).
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;

let patients = [
  { id: 1, name: "Amit Kumar", age: 35, disease: "Fever", doctorName: "Dr. Sharma" },
  { id: 2, name: "Priya Singh", age: 28, disease: "Migraine", doctorName: "Dr. Verma" },
  { id: 3, name: "Rahul Gupta", age: 42, disease: "Diabetes", doctorName: "Dr. Mehta" }
];

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data, null, 2));
}

function sendHtml(res, statusCode, html) {
  res.writeHead(statusCode, { "Content-Type": "text/html; charset=utf-8" });
  res.end(html);
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error("Request body is too large."));
        req.destroy();
      }
    });
    req.on("end", () => {
      if (!body.trim()) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error("Invalid JSON in request body."));
      }
    });
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  const pathname = new URL(req.url, `http://${req.headers.host || "localhost"}`).pathname;

  if (req.method === "GET" && pathname === "/") {
    return sendHtml(res, 200, `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Hospital Patient Management</title></head>
<body><h1>Welcome to City Care Hospital</h1>
<p>Hospital Patient Management System - Node.js HTTP Module</p>
<nav><a href="/patients">View patients (JSON)</a> | <a href="/about">About hospital</a> | <a href="/hospital-info">Static hospital information</a></nav>
</body></html>`);
  }

  if (req.method === "GET" && pathname === "/patients") {
    return sendJson(res, 200, patients);
  }

  if (req.method === "POST" && pathname === "/add-patient") {
    try {
      const patient = await readJsonBody(req);
      const required = ["id", "name", "age", "disease", "doctorName"];
      const missing = required.filter(field => patient[field] === undefined || patient[field] === null || patient[field] === "");
      if (missing.length) {
        return sendJson(res, 400, { error: "Missing required fields.", missing });
      }
      if (!Number.isInteger(Number(patient.id)) || Number(patient.id) <= 0 ||
          !Number.isInteger(Number(patient.age)) || Number(patient.age) <= 0) {
        return sendJson(res, 400, { error: "Patient id and age must be positive integers." });
      }
      if (patients.some(item => item.id === Number(patient.id))) {
        return sendJson(res, 409, { error: "A patient with this id already exists." });
      }

      const newPatient = {
        id: Number(patient.id),
        name: String(patient.name).trim(),
        age: Number(patient.age),
        disease: String(patient.disease).trim(),
        doctorName: String(patient.doctorName).trim()
      };
      if (!newPatient.name || !newPatient.disease || !newPatient.doctorName) {
        return sendJson(res, 400, { error: "Name, disease and doctorName cannot be empty." });
      }
      patients.push(newPatient);
      return sendJson(res, 201, { message: "Patient added successfully", patient: newPatient });
    } catch (error) {
      return sendJson(res, 400, { error: error.message || "Unable to process request." });
    }
  }

  if (req.method === "GET" && pathname === "/about") {
    return sendHtml(res, 200, `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>About</title></head>
<body><h1>About City Care Hospital</h1><p>City Care Hospital provides patient-focused care through experienced doctors and staff.</p>
<a href="/">Back to home</a></body></html>`);
  }

  // Demonstrates serving a real static file with the built-in FS module.
  if (req.method === "GET" && pathname === "/hospital-info") {
    const filePath = path.join(__dirname, "public", "hospital-info.html");
    return fs.readFile(filePath, "utf8", (error, content) => {
      if (error) {
        console.error("Static file read error:", error.message);
        return sendJson(res, 500, { error: "Unable to load hospital information." });
      }
      sendHtml(res, 200, content);
    });
  }

  return sendJson(res, 404, { error: "Route not found." });
});

server.listen(PORT, () => {
  console.log(`HTTP Server running at http://localhost:${PORT}`);
});

server.on("error", error => {
  console.error("HTTP server error:", error.message);
  process.exitCode = 1;
});
