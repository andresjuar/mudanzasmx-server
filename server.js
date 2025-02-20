import dotenv from "dotenv";
dotenv.config();
import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import bodyParser from "body-parser";
import rateLimit from "express-rate-limit";
import { sendEmail } from "./services/contactoService.js";
import {getDistance} from "./services/googleMapsService.js"

const port = 3000;

const app = express();
app.use(cors());
app.use(bodyParser.json());

const emailLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 30 segundos
    max: 1, // Máximo 1 petición por ventana de tiempo
    message: { error: "Demasiados intentos. Espera 5 minutos." },
});

// Configurar Nodemailer con tu correo y contraseña (usa variables de entorno)
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER, // Tu correo
        pass: process.env.EMAIL_PASS, // Contraseña o App Password
    },
});

app.post("/send-email", emailLimiter, async (req, res) => {
    try {
        const response = await sendEmail(req.body);
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/quote', async (req, res) => {
    const destino=req.body.destino[1];
    const origen=req.body.origen[1];

    const distance = await getDistance(origen, destino);

   
    const quoteData = req.body;
    const price = Math.floor(Math.random() * 5000) + 1000; // Simulación de precio
    console.log(quoteData);
    console.log(distance);
    res.json({ 
        message: 'Cotización recibida', 
        estimatedPrice: price, 
        distance 
    });
});

app.listen(port, () => console.log("Servidor corriendo en puerto 3000"));
