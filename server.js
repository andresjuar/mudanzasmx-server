import dotenv from "dotenv";
dotenv.config();
import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import bodyParser from "body-parser";
import rateLimit from "express-rate-limit";
import { sendEmail } from "./services/contactoService.js";
import {getDistance} from "./services/googleMapsService.js";
import {contacto} from "./services/contactoCotizacion.js";

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
function letraRandom() {
    const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    return letras[Math.floor(Math.random() * letras.length)];
}




app.post('/quote', async (req, res) => {
    try {
        const quoteData = req.body;
        const origen = quoteData.origen[1];
        const destino = quoteData.destino[1];
        const volumenTotal = quoteData.VolumenTotal;
        const distancia = await getDistance(origen, destino);
        const metrosAcarreo = quoteData.metrosAcarreo[0] + quoteData.metrosAcarreo[1];
        const pisosOrigen = quoteData.tipoOrigen[1];
        const pisosDestino = quoteData.tipoDestino[1];
        const elevadorOrigen = quoteData.tipoOrigen[2] === "true";
        const elevadorDestino = quoteData.tipoDestino[2] === "true";
        const empaque = quoteData.empaque;
        const seguro = quoteData.seguro;

        const email =quoteData.contactoCliente[0];
       const nombre =quoteData.nombreCliente[0];

        // Definir tipos de camiones
        const camiones = [
            { nombre: "Mini", capacidad: 5, costoBase: 1200, costoKmExtra: 2, costoAcarreo: 1, costoPiso: 100, costoEmpaque: 200, costoSeguro: 100 },
            { nombre: "Chico", capacidad: 10, costoBase: 1800, costoKmExtra: 3, costoAcarreo: 2, costoPiso: 150, costoEmpaque: 400, costoSeguro: 200 },
            { nombre: "Mediano", capacidad: 20, costoBase: 2500, costoKmExtra: 4, costoAcarreo: 3, costoPiso: 200, costoEmpaque: 600, costoSeguro: 300 },
            { nombre: "Grande", capacidad: 30, costoBase: 3000, costoKmExtra: 5, costoAcarreo: 4, costoPiso: 250, costoEmpaque: 800, costoSeguro: 400 },
            { nombre: "XL", capacidad: 45, costoBase: 4000, costoKmExtra: 7, costoAcarreo: 5, costoPiso: 300, costoEmpaque: 1000, costoSeguro: 500 },
            { nombre: "Trailer", capacidad: 120, costoBase: 6500, costoKmExtra: 12, costoAcarreo: 10, costoPiso: 600, costoEmpaque: 2500, costoSeguro: 1000 }
        ];

        // Seleccionar camión según volumen total
        const camion = camiones.find(c => volumenTotal <= c.capacidad) || camiones[camiones.length - 1];

        // Calcular costos adicionales
        const kmExtra = Math.max(0, distancia - 600);
        const costoKm = kmExtra * camion.costoKmExtra;
        const costoEmpaque = empaque === "plus" ? camion.costoEmpaque : 0;
        const costoSeguro = seguro === "amplia" ? camion.costoSeguro : 0;
        const costoAcarreo = Math.max(0, metrosAcarreo - 20) * camion.costoAcarreo;

        let totalPisos = 0;
        if (!elevadorOrigen) totalPisos += pisosOrigen;
        if (!elevadorDestino) totalPisos += pisosDestino;
        const costoPisos = totalPisos * camion.costoPiso;

        // Calcular costos de cada paquete
        const precioDirecto = camion.costoBase + costoKm + costoEmpaque + costoSeguro + costoAcarreo + costoPisos;
        const precioCompartido = (camion.costoBase + costoKm) * 0.6 + costoEmpaque + costoSeguro + costoAcarreo + costoPisos;
        const precioDirectoUSA = (camion.costoBase + costoKm) * 0.8 + costoEmpaque + costoSeguro + costoAcarreo + costoPisos;

        // Calcular tiempos de entrega
        const entregaDirecto = 3 + Math.floor(kmExtra / 500);
        const entregaCompartido = 30 + Math.floor(kmExtra / 100);
        const entregaDirectoUSA = 15 + Math.floor(kmExtra / 100);

        // Generar folio único
        const folio = Math.floor(Math.random() * 10000);
        const letra = letraRandom()
        const folioC = `${letra}${folio}`

        const response = await contacto(nombre,email,folioC);
   
        // Responder con la cotización
        res.json({
            message: 'Cotización generada',
            folio: [letra,folio],
            distancia: distancia,
            paquetes: {
                compartido: { precio: precioCompartido.toFixed(2), tiempoEntrega: entregaCompartido },
                directo: { precio: precioDirecto.toFixed(2), tiempoEntrega: entregaDirecto },
                DirectoUSA: { precio: precioDirectoUSA.toFixed(2), tiempoEntrega: entregaDirectoUSA }
            }
        }
        
      
    );} catch (error) {
        console.error("Error en la cotización:", error);
        res.status(500).json({ error: "Error al calcular la cotización" });
    }
});

app.listen(port, () => console.log("Servidor corriendo en puerto 3000"));
