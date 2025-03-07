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
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

dotenv.config(); // Cargar variables de entorno

// Configurar el transporte de nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Tu correo
    pass: process.env.EMAIL_PASS, // Contraseña de aplicación (App Password)
  },
});

const dirname = "./pdf/";

// Función para generar el PDF
const generarPDF = (name, folioC) => {
  return new Promise((resolve, reject) => {
    // Verificar si la carpeta 'pdf' existe, si no, crearla
    if (!fs.existsSync(dirname)) {
      fs.mkdirSync(dirname, { recursive: true });
    }

    const filePath = path.join(dirname, `cotizacion_${folioC}.pdf`);
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    doc.fontSize(20).text("Cotización de Mudanza", { align: "center" });
    doc.moveDown();
    doc.fontSize(14).text(`Cliente: ${name}`);
    doc.text(`Folio: ${folioC}`);
    doc.text("Gracias por cotizar con MudanzasMX");

    doc.end();

    stream.on("finish", () => resolve(filePath));
    stream.on("error", (err) => reject(err));
  });
};

// Función para enviar correos con adjunto
export const contacto = async (name, email, folioC) => {
  try {
    const pdfPath = await generarPDF(name, folioC);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Cotización ${name}`,
      text: `Gracias por cotizar con MudanzasMX, ${name}\nTu folio es ${folioC}`,
      attachments: [
        {
          filename: `Cotización_${folioC}.pdf`,
          path: pdfPath,
        },
      ],
    };

    await transporter.sendMail(mailOptions);

    // Eliminar el archivo después de enviarlo
    fs.unlinkSync(pdfPath);

    return { success: true, message: "Correo enviado con éxito" };
  } catch (error) {
    throw new Error(error.message);
  }
};
