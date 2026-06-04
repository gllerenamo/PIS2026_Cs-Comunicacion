import { Stagehand } from "@browserbasehq/stagehand";
import * as assert from "assert";
import * as dotenv from "dotenv";

// Cargar variables de entorno de forma segura
dotenv.config();

const BASE_URL: string = "https://vida-unengrossing-clangorously.ngrok-free.dev"; 

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
  // Navegación mediante API v3
  
  await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
  
  await page.evaluate((users) => {
    localStorage.setItem("ssp_users_mock", JSON.stringify(users));
    localStorage.removeItem("ssp_session_token");
    localStorage.removeItem("ssp_user_role");
  }, MOCK_USERS_SEED);
  
  // Recarga usando las opciones nativas de la documentación de Page
  await page.reload({ waitUntil: "domcontentloaded" });
}

async function ejecutarSuiteLogin(): Promise<void> {
  console.log("Inicializando Stagehand v3 en entorno BROWSERBASE...");
  
  const stagehand: any = new Stagehand({
    env: "BROWSERBASE",
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

  // Evitar la pantalla de advertencia de ngrok inyectando la cabecera correspondiente
  await stagehand.context.setExtraHTTPHeaders({
    "ngrok-skip-browser-warning": "true"
  });
  
  // Extracción correcta del objeto Page a través del contexto
  const page: BrowserPage = stagehand.context.pages()[0]; 
  
  const sessionId: string = stagehand.browserbaseSessionID;
  const videoUrl: string = stagehand.browserbaseSessionURL; 
  
  console.log(`Sesión de Browserbase iniciada. ID: ${sessionId}`);
  console.log(`Enlace de evidencia en vivo: ${videoUrl}\n`);
  

  try {
    // ------------------------------------------------------------------------
    // PRECONDICIÓN
    // ------------------------------------------------------------------------
    console.log("Inyectando base de datos mock en el LocalStorage...");
    await prepararLocalStorage(page);

    // ------------------------------------------------------------------------
    // TC-HU1-01: Login Exitoso de Administrador
    // ------------------------------------------------------------------------
    console.log("Ejecutando TC-HU1-01: Login exitoso de Administrador...");
    
    // stagehand.act maneja de forma segura las variables bajo la estructura %variable%
    await stagehand.act("Digitar %email% en el campo Correo institucional", {
      variables: { email: "admin@unsa.edu.pe" }
    });
    
    await stagehand.act("Digitar %password% en el campo Contraseña", {
      variables: { password: "admin123" }
    });
    
    await stagehand.act("Hacer clic en el botón Ingresar");

    // CORRECCIÓN: Usamos waitForSelector nativo apuntando a un elemento del dashboard 
    // en lugar de waitForURL que no existe en el objeto page de Stagehand.
    // Reemplaza "main" o "nav" por algún selector CSS real de tu DashboardPage (como ".dash").
    await page.waitForSelector(".dash", { state: "visible", timeout: 5000 });
    
    const urlActual = page.url();
    assert.ok(urlActual.includes("/dashboard"), `Error: El flujo no redirigió a /dashboard. URL actual: ${urlActual}`);
    console.log("✅ TC-HU1-01: PASSED");

    // ------------------------------------------------------------------------
    // LIMPIEZA INTERMEDIA
    // ------------------------------------------------------------------------
    console.log("Limpiando sesión activa...");
    await page.evaluate(() => {
      localStorage.removeItem("ssp_session_token");
      localStorage.removeItem("ssp_user_role");
    });
    await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });

    // ------------------------------------------------------------------------
    // TC-HU1-02: Login Fallido por Credenciales Incorrectas
    // ------------------------------------------------------------------------
    console.log("Ejecutando TC-HU1-02: Login fallido...");
    
    await stagehand.act("Digitar %email% en el campo Correo institucional", {
      variables: { email: "error_user@unsa.edu.pe" }
    });
    
    await stagehand.act("Digitar %password% en el campo Contraseña", {
      variables: { password: "clave_erronea" }
    });
    
    await stagehand.act("Hacer clic en el botón Ingresar");

    // Esperamos a que la estabilidad del DOM se asiente tras el click fallido
    await page.waitForLoadState("domcontentloaded");

    const urlPostFallo = page.url();
    assert.ok(urlPostFallo.includes("/login"), `Error: El login fallido de ruta redirigió erróneamente a ${urlPostFallo}`);

    // Esperar y validar que aparezca la alerta de error en el DOM de forma directa y robusta
    await page.waitForSelector(".alert--error", { state: "visible", timeout: 5000 });
    const textoAlerta = await page.evaluate(() => document.querySelector(".alert--error")?.textContent);
    assert.ok(textoAlerta && textoAlerta.length > 0, "Error: No se encontró ninguna alerta visible de error en la interfaz.");
    console.log("✅ TC-HU1-02: PASSED");

    console.log("\n Suite de pruebas para HU-1 finalizada exitosamente.");
    
  } catch (error) {
    console.error("\n Excepción crítica detectada durante el test:");
    console.error(error);
    
    // Captura de pantalla nativa usando las opciones documentadas de page.screenshot()
    const screenshotPath = `error_hu1_${Date.now()}.png`;
    await page.screenshot({ path: screenshotPath, type: "png" });
    console.log(`Captura del estado de la pantalla guardada en: ${screenshotPath}`);
    
  } finally {
    console.log("\nTerminando proceso y liberando infraestructura en la nube...");
    await stagehand.close();
  }
}

ejecutarSuiteLogin();