/* import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config(); // Cargar variables de entorno

// Configurar el transporte de nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Tu correo
    pass: process.env.EMAIL_PASS, // Contraseña de aplicación (App Password)
  },
});

// Función para enviar correos
export const contacto = async (name, email,folioC, ) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email, // El destinatario (tu correo)
    subject: `Cotización ${name}`,
    text: `Gracias por cotizar con MudanzasMX ${name}\n Tu folio es ${folioC}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true, message: "Correo enviado con éxito" };
  } catch (error) {
    throw new Error(error.message);
  }
}; */

import puppeteer from "puppeteer";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const dirname = "./pdf/";

// Función para generar el PDF desde HTML
const generarPDF = async (name, folioC) => {
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }

  const filePath = path.join(dirname, `cotizacion_${folioC}.pdf`);
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Crear contenido HTML
  const htmlContent = `
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .container { text-align: center; border: 2px solid #000; padding: 20px; }
        h1 { color: #333; }
        .info { margin-top: 20px; font-size: 16px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Cotización de Mudanza</h1>
        <div class="info">
          <p><strong>Cliente:</strong> ${name}</p>
          <p><strong>Folio:</strong> ${folioC}</p>
          <p>Gracias por cotizar con <strong>MudanzasMX</strong></p>
        </div>
      </div>
    </body>
    </html>
  `;

  await page.setContent(htmlContent, { waitUntil: "load" });
  await page.pdf({ path: filePath, format: "A4", printBackground: true });

  await browser.close();
  return filePath;
};

// Función para enviar el correo con el PDF adjunto
export const contacto = async (name, email, folioC) => {
  try {
    const pdfPath = await generarPDF(name, folioC);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Cotización ${name}`,
      text: `Gracias por cotizar con MudanzasMX, ${name}\nTu folio es ${folioC}`,
      attachments: [{ filename: `Cotización_${folioC}.pdf`, path: pdfPath }],
    };

    await transporter.sendMail(mailOptions);

    // Eliminar el PDF después de enviarlo
    fs.unlinkSync(pdfPath);

    return { success: true, message: "Correo enviado con éxito" };
  } catch (error) {
    throw new Error(error.message);
  }
};
