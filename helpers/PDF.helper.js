const puppeteer = require("puppeteer"),
  hbs = require("handlebars"),
  fs = require("fs-extra"),
  path = require("path"),
  { createDirIfNotExits } = require("./File.helper");
const { CHROME_EXECUTABLE_PATH } = require("../constant/App.constant");

async function generatePdf(template, pdf, data) {
  try {
    const browser = await puppeteer.launch({ headless: "new" }),
      page = await browser.newPage(),
      html = await fs.readFile(
        path.join(process.cwd(), "/assets/", `${template}.hbs`),
        "utf-8"
      ),
      pageContent = hbs.compile(html)(data);

    pdf = path.join(process.cwd(), `/${pdf}.pdf`);

    await page.setContent(pageContent);

    const generatedPdf = await page.pdf({
      path: pdf,
      format: "A4",
      printBackground: true,
      margin: {
        top: "50px",
        bottom: "50px",
        right: "0",
        left: "0",
      },
    });

    await browser.close();

    const buffer = Buffer.from(generatedPdf),
      base64 = buffer.toString("base64"),
      base64Url = buffer.toString("base64url");

    return {
      pdf,
      buffer: generatedPdf,
      base64,
      base64Url,
    };
  } catch (e) {
    return false;
  }
}

async function generatePdfByHbs(hbsFile, pdfFile, data) {
  if (!hbsFile) new Error("hbsFile is required to generate a pdf");
  if (!pdfFile) new Error("pdfFile is required to generate a pdf");

  if (!fs.existsSync(hbsFile)) new Error("hbsFile not found");
  createDirIfNotExits(path.dirname(pdfFile));

  try {
    const puppeteerOptions = { headless: "new" };
    if (CHROME_EXECUTABLE_PATH) {
      puppeteerOptions["executablePath"] = CHROME_EXECUTABLE_PATH;
      puppeteerOptions["args"] = ["--no-sandbox", "--disable-setuid-sandbox"];
    }
    const browser = await puppeteer.launch(puppeteerOptions),
      page = await browser.newPage(),
      html = await fs.readFile(hbsFile, "utf-8"),
      pageContent = hbs.compile(html)(data);

    await page.setContent(pageContent);

    const generatedPdf = await page.pdf({
      path: pdfFile,
      format: "A4",
      printBackground: true,
      margin: {
        top: "50px",
        bottom: "50px",
        right: "0",
        left: "0",
      },
    });

    await browser.close();

    const buffer = Buffer.from(generatedPdf);
    return buffer.toString("base64");
  } catch (e) {
    return false;
  }
}

module.exports = { generatePdf, generatePdfByHbs };
