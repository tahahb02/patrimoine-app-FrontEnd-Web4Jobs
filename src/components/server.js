const express = require("express");
const multer = require("multer");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors()); // Autoriser les requêtes CORS
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Servir les fichiers statiques

// Configuration de Multer pour stocker les fichiers dans le dossier "uploads"
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Nom unique pour chaque fichier
  },
});

const upload = multer({ storage });

// Route pour téléverser une image
app.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Aucun fichier téléversé." });
  }

  // Générer l'URL permanente de l'image
  const imageUrl = `http://localhost:8080/uploads/${req.file.filename}`;

  res.json({ imageUrl });
});

// Middleware pour logger les erreurs
app.use((err, req, res, next) => {
  console.error("Erreur:", err);
  res.status(500).json({ message: "Erreur interne du serveur" });
});

// Démarrer le serveur
app.listen(8080, () => {
  console.log("Serveur backend en écoute sur le port 8080");
});