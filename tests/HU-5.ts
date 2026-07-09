import { Stagehand } from "@browserbasehq/stagehand";
import * as assert from "assert";
import * as dotenv from "dotenv";
import * as fs from "fs";

// Cargar variables de entorno
dotenv.config();

const BASE_URL: string = process.env.TEST_BASE_URL || "https://cs-comunicacion.vercel.app";

interface UserMock {
  email: string;
  password: string;
  role: string;
}

const MOCK_USERS_SEED: UserMock[] = [
  { email: "admin@unsa.edu.pe", password: "admin123", role: "ADMIN" },
  { email: "profesor@unsa.edu.pe", password: "profesor123", role: "PROFESOR" },
  { email: "alumno@unsa.edu.pe", password: "alumno123", role: "ALUMNO" }
];

interface BrowserPage {
  goto(url: string, options?: { waitUntil?: string }): Promise<void>;
  evaluate<T extends any[]>(fn: (...args: T) => any, ...args: T): Promise<any>;
  reload(options?: { waitUntil?: string }): Promise<void>;
  waitForSelector(selector: string, options?: { state?: string; timeout?: number }): Promise<void>;
  url(): string;
  waitForLoadState(state: string): Promise<void>;
  screenshot(options?: { path?: string; type?: string }): Promise<void>;
}

async function prepararLocalStorage(page: BrowserPage) {
  await page.goto(`${BASE_URL}`, { waitUntil: "domcontentloaded" });
  
  await page.evaluate((users) => {
    localStorage.setItem("ssp_users_mock", JSON.stringify(users));
    localStorage.removeItem("ssp_session_token");
    localStorage.removeItem("ssp_user_role");
    
    // Limpieza de claves
    localStorage.removeItem("ssp.token");
    localStorage.removeItem("ssp.session");
    localStorage.removeItem("ssp.users");
    localStorage.removeItem("ssp.login_attempts");
  }, MOCK_USERS_SEED);
  
  await page.goto(`${BASE_URL}`, { waitUntil: "domcontentloaded" });
}

async function ejecutarSuiteClasesProgramadas(): Promise<void> {
  const STAGEHAND_ENV = process.env.STAGEHAND_ENV || "BROWSERBASE";
  console.log(`Inicializando Stagehand v3 en entorno: ${STAGEHAND_ENV}...`);
  
  const stagehand: any = new Stagehand({
    env: STAGEHAND_ENV as "LOCAL" | "BROWSERBASE",
    apiKey: process.env.BROWSERBASE_API_KEY,
    domSettleTimeout: 3000,
    verbose: 1,
    browserbaseSessionCreateParams: {
      browserSettings: {
        blockAds: true,
        recordSession: true
      }
    }
  });

  await stagehand.init();

  if (stagehand.context && typeof stagehand.context.setExtraHTTPHeaders === "function") {
    await stagehand.context.setExtraHTTPHeaders({
      "ngrok-skip-browser-warning": "true"
    });
  }
  
  const page: BrowserPage = stagehand.context ? stagehand.context.pages()[0] : (stagehand as any).page;
  const sessionId: string = stagehand.browserbaseSessionID || "N/A (Local)";
  const videoUrl: string = stagehand.browserbaseSessionURL || "N/A (Local)";
  
  console.log(`Sesión iniciada. ID: ${sessionId}`);
  console.log(`Enlace de evidencia: ${videoUrl}\n`);

  if (!fs.existsSync("tests/screenshots")) {
    fs.mkdirSync("tests/screenshots", { recursive: true });
  }

  try {
    // ------------------------------------------------------------------------
    // PRECONDICIÓN: Inyección de usuarios en localStorage
    // ------------------------------------------------------------------------
    console.log("Inyectando base de datos mock...");
    await prepararLocalStorage(page);

    // ------------------------------------------------------------------------
    // LOGIN COMO ALUMNO
    // ------------------------------------------------------------------------
    console.log("Iniciando sesión como alumno (sin usar IA)...");
    
    await page.waitForSelector("input[type='email']", { state: "visible", timeout: 5000 });
    
    // Rellenar email
    await page.evaluate(() => {
      const emailInput = document.querySelector("input[type='email']") as HTMLInputElement;
      if (emailInput) {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
        if (setter) {
          setter.call(emailInput, "alumno@unsa.edu.pe");
          emailInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }
    });

    // Rellenar password
    await page.evaluate(() => {
      const passwordInput = document.querySelector("input[type='password']") as HTMLInputElement;
      if (passwordInput) {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
        if (setter) {
          setter.call(passwordInput, "alumno123");
          passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }
    });

    // Click en Ingresar
    await page.evaluate(() => {
      const submitBtn = document.querySelector("button[type='submit']") as HTMLButtonElement;
      if (submitBtn) {
        submitBtn.click();
      }
    });
    
    // Esperar redirección al dashboard
    await page.waitForSelector(".dash", { state: "visible", timeout: 5000 });
    assert.ok(page.url().includes("/dashboard"), "Error: No redirigió al dashboard");
    console.log("Sesión de Alumno iniciada correctamente.");

    // ------------------------------------------------------------------------
    // TC-HU5-01: Visualizar clases programadas (Próximas clases)
    // ------------------------------------------------------------------------
    console.log("\nEjecutando TC-HU5-01: Acceso a próximas clases...");
    
    // Hacer clic en Clases programadas en la barra lateral usando selector nativo en evaluate
    await page.waitForSelector('a[href="/clases"]', { state: "visible", timeout: 5000 });
    
    await page.evaluate(() => {
      const link = document.querySelector('a[href="/clases"]') as HTMLElement;
      if (link) {
        link.click();
      }
    });
    
    await page.waitForLoadState("domcontentloaded");
    
    const urlActual = page.url();
    assert.ok(urlActual.includes("/clases"), `Error: No navegó a la sección de clases. URL: ${urlActual}`);
    
    // Verificar que existe la sección de Próximas Clases y sus tarjetas
    await page.waitForSelector(".proximas-grid", { state: "visible", timeout: 5000 });
    
    // Verificar los elementos requeridos: título, fecha/hora, asesor y enlace
    const tieneProximas = await page.evaluate(() => {
      const grid = document.querySelector(".proximas-grid");
      if (!grid) return false;
      const cards = grid.querySelectorAll(".clase-card--futura");
      if (cards.length === 0) return false;
      
      const primerCard = cards[0];
      const titulo = primerCard.querySelector(".clase-card__title")?.textContent;
      const detalles = primerCard.querySelector(".clase-card__details")?.textContent;
      const link = primerCard.querySelector(".button-conectar")?.getAttribute("href");
      
      return !!(titulo && detalles && detalles.includes("Asesor") && link);
    });
    
    assert.ok(tieneProximas, "Error: Las próximas clases no muestran título, fecha, asesor o enlace de acceso.");
    console.log("✅ TC-HU5-01: PASSED");

    // ------------------------------------------------------------------------
    // TC-HU5-02: Visualizar historial de clases pasadas
    // ------------------------------------------------------------------------
    console.log("\nEjecutando TC-HU5-02: Acceso a clases pasadas (Historial)...");
    
    // Verificar que existe la sección de clases pasadas
    await page.waitForSelector(".pasadas-grid", { state: "visible", timeout: 5000 });
    
    // Verificar los elementos de clases pasadas y que el botón esté deshabilitado
    const tienePasadas = await page.evaluate(() => {
      const grid = document.querySelector(".pasadas-grid");
      if (!grid) return false;
      const cards = grid.querySelectorAll(".clase-card--pasada");
      if (cards.length === 0) return false;
      
      const primerCard = cards[0];
      const titulo = primerCard.querySelector(".clase-card__title")?.textContent;
      const detalles = primerCard.querySelector(".clase-card__details")?.textContent;
      const botonFin = primerCard.querySelector("button[disabled]");
      
      return !!(titulo && detalles && detalles.includes("Asesor") && botonFin);
    });
    
    assert.ok(tienePasadas, "Error: Las clases pasadas no muestran detalles o no tienen el botón deshabilitado.");
    console.log("✅ TC-HU5-02: PASSED");

    console.log("\nSuite de pruebas para HU-5 finalizada exitosamente.");

  } catch (error) {
    console.error("\nExcepción crítica detectada durante el test de HU-5:");
    console.error(error);
    
    const screenshotPath = `tests/screenshots/error_hu5_${Date.now()}.png`;
    await page.screenshot({ path: screenshotPath, type: "png" });
    console.log(`Captura del estado de la pantalla guardada en: ${screenshotPath}`);
    
  } finally {
    console.log("\nTerminando proceso y liberando infraestructura en la nube...");
    await stagehand.close();
  }
}

ejecutarSuiteClasesProgramadas();
