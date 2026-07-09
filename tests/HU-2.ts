import { Stagehand } from "@browserbasehq/stagehand";
import * as assert from "assert";
import * as dotenv from "dotenv";
import * as fs from "fs";

// Cargar variables de entorno de forma segura
dotenv.config();

const BASE_URL: string = "https://cs-comunicacion.vercel.app";

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
  await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
  
  await page.evaluate((users) => {
    localStorage.setItem("ssp_users_mock", JSON.stringify(users));
    localStorage.removeItem("ssp_session_token");
    localStorage.removeItem("ssp_user_role");
    
    // Limpieza de claves de la aplicación actual
    localStorage.removeItem("ssp.token");
    localStorage.removeItem("ssp.session");
    localStorage.removeItem("ssp.users");
    localStorage.removeItem("ssp.login_attempts");
  }, MOCK_USERS_SEED);
  
  await page.reload({ waitUntil: "domcontentloaded" });
}

async function ejecutarSuiteRecuperacion(): Promise<void> {
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

  // Configuración de cabeceras en caso necesario
  await stagehand.context.setExtraHTTPHeaders({
    "ngrok-skip-browser-warning": "true"
  });
  
  const page: BrowserPage = stagehand.context.pages()[0]; 
  
  const sessionId: string = stagehand.browserbaseSessionID;
  const videoUrl: string = stagehand.browserbaseSessionURL; 
  
  console.log(`Sesión de Browserbase iniciada. ID: ${sessionId}`);
  console.log(`Enlace de evidencia en vivo: ${videoUrl}\n`);

  // Asegurar que exista el directorio de capturas en tests/screenshots
  if (!fs.existsSync("tests/screenshots")) {
    fs.mkdirSync("tests/screenshots", { recursive: true });
  }

  try {
    // Precondición: Inyección del LocalStorage
    console.log("Inyectando base de datos mock en el LocalStorage...");
    await prepararLocalStorage(page);

    // ------------------------------------------------------------------------
    // TC-HU2-01: Recuperar contraseña con correo registrado
    // ------------------------------------------------------------------------
    console.log("\nEjecutando TC-HU2-01: Recuperar contraseña con correo registrado...");
    
    // Navegar a la página de recuperar contraseña
    await page.goto(`${BASE_URL}/recuperar`, { waitUntil: "domcontentloaded" });
    
    await stagehand.act("Digitar %email% en el campo Correo institucional", {
      variables: { email: "admin@unsa.edu.pe" }
    });
    
    await stagehand.act("Hacer clic en el botón Enviar enlace de recuperación");
    
    // Esperar a que se muestre la alerta de éxito en verde (.alert--success)
    await page.waitForSelector(".alert--success", { state: "visible", timeout: 5000 });
    const textoAlertaExito = await page.evaluate(() => document.querySelector(".alert--success")?.textContent);
    console.log(`Mensaje de éxito obtenido: "${textoAlertaExito}"`);
    assert.ok(
      textoAlertaExito && textoAlertaExito.includes("Si el correo está registrado, recibirás un enlace"),
      `Error: Mensaje de éxito no coincide o no se mostró. Obtenido: ${textoAlertaExito}`
    );
    console.log("✅ TC-HU2-01: PASSED");

    // ------------------------------------------------------------------------
    // TC-HU2-02: Recuperar contraseña con correo no registrado (Mismo mensaje por seguridad)
    // ------------------------------------------------------------------------
    console.log("\nEjecutando TC-HU2-02: Recuperar contraseña con correo no registrado...");
    
    // Regresar al login y limpiar para la siguiente prueba
    await page.goto(`${BASE_URL}/recuperar`, { waitUntil: "domcontentloaded" });
    
    await stagehand.act("Digitar %email% en el campo Correo institucional", {
      variables: { email: "no_existe@unsa.edu.pe" }
    });
    
    await stagehand.act("Hacer clic en el botón Enviar enlace de recuperación");
    
    // Se debe mostrar la misma alerta de éxito uniforme
    await page.waitForSelector(".alert--success", { state: "visible", timeout: 5000 });
    const textoAlertaNoExiste = await page.evaluate(() => document.querySelector(".alert--success")?.textContent);
    console.log(`Mensaje uniforme obtenido: "${textoAlertaNoExiste}"`);
    assert.ok(
      textoAlertaNoExiste && textoAlertaNoExiste.includes("Si el correo está registrado, recibirás un enlace"),
      `Error: Mensaje uniforme para correo no registrado no se mostró correctamente.`
    );
    console.log("✅ TC-HU2-02: PASSED");

    // ------------------------------------------------------------------------
    // TC-HU2-03: Validación de formato de correo inválido
    // ------------------------------------------------------------------------
    console.log("\nEjecutando TC-HU2-03: Validación de correo inválido...");
    
    await page.goto(`${BASE_URL}/recuperar`, { waitUntil: "domcontentloaded" });
    
    await stagehand.act("Digitar %email% en el campo Correo institucional", {
      variables: { email: "correo_invalido" }
    });
    
    await stagehand.act("Hacer clic en el botón Enviar enlace de recuperación");
    
    // Al ser un formato inválido, el validador frontend debe mostrar el error local en el campo (.field__msg--error)
    // Busquemos el mensaje de error "Ingresa un correo válido." en la interfaz
    await page.waitForSelector(".field__msg--error", { state: "visible", timeout: 5000 });
    const textoErrorFormato = await page.evaluate(() => document.querySelector(".field__msg--error")?.textContent);
    console.log(`Mensaje de validación obtenido: "${textoErrorFormato}"`);
    assert.ok(
      textoErrorFormato && textoErrorFormato.includes("Ingresa un correo válido"),
      `Error: No se mostró la validación de formato incorrecto en el campo. Obtenido: ${textoErrorFormato}`
    );
    console.log("✅ TC-HU2-03: PASSED");

    console.log("\nSuite de pruebas para HU-2 finalizada exitosamente.");
    
  } catch (error) {
    console.error("\nExcepción crítica detectada durante el test de HU-2:");
    console.error(error);
    
    const screenshotPath = `tests/screenshots/error_hu2_${Date.now()}.png`;
    await page.screenshot({ path: screenshotPath, type: "png" });
    console.log(`Captura del estado de la pantalla guardada en: ${screenshotPath}`);
    
  } finally {
    console.log("\nTerminando proceso y liberando infraestructura en la nube...");
    await stagehand.close();
  }
}

ejecutarSuiteRecuperacion();
