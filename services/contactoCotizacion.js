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
export const contacto = async (name, email,folioC ) => {
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
};
