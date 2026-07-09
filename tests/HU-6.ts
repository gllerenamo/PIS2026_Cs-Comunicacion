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

async function ejecutarSuiteAccesoClases(): Promise<void> {
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
    
    // Esperar redirección al dashboard (incrementado a 30s por posible cold start de la API)
    await page.waitForSelector(".dash", { state: "visible", timeout: 30000 });
    assert.ok(page.url().includes("/dashboard"), "Error: No redirigió al dashboard");
    console.log("Sesión de Alumno iniciada correctamente.");

    // ------------------------------------------------------------------------
    // NAVEGAR A SECCIÓN CLASES
    // ------------------------------------------------------------------------
    console.log("Navegando a clases programadas...");
    await page.waitForSelector('a[href="/clases"]', { state: "visible", timeout: 5000 });
    await page.evaluate(() => {
      const link = document.querySelector('a[href="/clases"]') as HTMLElement;
      if (link) link.click();
    });
    await page.waitForLoadState("domcontentloaded");

    // ------------------------------------------------------------------------
    // TC-HU6-01: Redirección de clases en horario activo
    // ------------------------------------------------------------------------
    console.log("\nEjecutando TC-HU6-01: Acceso a clase activa...");
    await page.waitForSelector(".proximas-grid", { state: "visible", timeout: 5000 });

    const redireccionaClase = await page.evaluate(() => {
      const card = document.querySelector(".proximas-grid .clase-card--futura");
      if (!card) return false;
      const btn = card.querySelector(".button-conectar") as HTMLAnchorElement;
      if (!btn) return false;
      
      const link = btn.getAttribute("href");
      // Debe existir un link de redirección real y activo (Meet / Zoom / etc)
      return !!link && link.startsWith("http");
    });

    assert.ok(redireccionaClase, "Error: El acceso a clase en horario no redirige correctamente.");
    console.log("✅ TC-HU6-01: PASSED");

    // ------------------------------------------------------------------------
    // TC-HU6-02: Bloqueo de clases fuera de horario
    // ------------------------------------------------------------------------
    console.log("\nEjecutando TC-HU6-02: Intento de acceso a clase finalizada/inactiva...");
    await page.waitForSelector(".pasadas-grid", { state: "visible", timeout: 5000 });

    const bloqueaInactiva = await page.evaluate(() => {
      const card = document.querySelector(".pasadas-grid .clase-card--pasada");
      if (!card) return false;
      
      const btn = card.querySelector(".clase-card__cta-btn") as HTMLButtonElement;
      if (!btn) return false;
      
      // Botón debe estar deshabilitado y tener texto de no disponible
      return btn.disabled && btn.textContent?.includes("finalizada");
    });

    assert.ok(bloqueaInactiva, "Error: Las clases finalizadas no bloquean el acceso al alumno.");
    console.log("✅ TC-HU6-02: PASSED");

    console.log("\nSuite de pruebas para HU-6 finalizada exitosamente.");

  } catch (error) {
    console.error("\nExcepción crítica detectada durante el test de HU-6:");
    console.error(error);
    
    const screenshotPath = `tests/screenshots/error_hu6_${Date.now()}.png`;
    await page.screenshot({ path: screenshotPath, type: "png" });
    console.log(`Captura del estado de la pantalla guardada en: ${screenshotPath}`);
    
  } finally {
    console.log("\nTerminando proceso y liberando infraestructura en la nube...");
    await stagehand.close();
  }
}

ejecutarSuiteAccesoClases();
