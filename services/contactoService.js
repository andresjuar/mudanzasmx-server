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
export const sendEmail = async ({ name, email, message }) => {
  const mailOptions = {
    from: email,
    to: process.env.EMAIL_USER, // El destinatario (tu correo)
    subject: `Nuevo contacto de ${name}`,
    text: `Nombre: ${name}\nEmail: ${email}\nMensaje:\n${message}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true, message: "Correo enviado con éxito" };
  } catch (error) {
    throw new Error(error.message);
  }
};
