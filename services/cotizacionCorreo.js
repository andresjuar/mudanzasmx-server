import nodemailer from "nodemailer";
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
export const cotizacionCorreo = async (name,folioC,quoteData) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER, // El destinatario (tu correo)
    subject: `Cotización de ${name} con ${folioC}`,
    text: `Cotización de ${name}\n con folio es ${folioC} \n Los datos son ${JSON.stringify(quoteData, null, 2)} `,
  };try {
    await transporter.sendMail(mailOptions);
    return { success: true, message: "Correo enviado con éxito" };
  } catch (error) {
    throw new Error(error.message);
  }
};
