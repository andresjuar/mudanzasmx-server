import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

const dirname = "./pdf/";

export const convertirCotizacionAPDF = async (cotizacion) => {
  try {
    if (!fs.existsSync(dirname)) {
      fs.mkdirSync(dirname, { recursive: true });
    }

    const filePath = path.join(dirname, `cotizacion_${cotizacion.folio}.pdf`);
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    const htmlContent = `
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .container { text-align: center; border: 2px solid #000; padding: 20px; }
        h1 { color: #333; }
        .info { margin-top: 20px; font-size: 16px; }
        .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .table th, .table td { border: 1px solid #000; padding: 10px; text-align: left; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Cotización de Mudanza</h1>
        <div class="info">
          <p><strong>Cliente:</strong> ${cotizacion.nombre}</p>
          <p><strong>Folio:</strong> ${cotizacion.folio}</p>
          <p><strong>Origen:</strong> ${cotizacion.origen}</p>
          <p><strong>Destino:</strong> ${cotizacion.destino}</p>
          <p><strong>Volumen:</strong> ${cotizacion.volumen} m³</p>
          <p><strong>Seguro:</strong> ${cotizacion.seguro}</p>
          <p><strong>Total:</strong> $${cotizacion.total}</p>
        </div>
      </div>
    </body>
    </html>`;

    await page.setContent(htmlContent, { waitUntil: "load" });
    await page.pdf({ path: filePath, format: "A4", printBackground: true });

    await browser.close();
    return filePath;
  } catch (error) {
    console.error("Error generando el PDF:", error);
    throw error;
  }
};
