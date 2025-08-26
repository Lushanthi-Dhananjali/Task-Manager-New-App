const { Builder, By, until, Key } = require('selenium-webdriver');
require('chromedriver');

const base = process.env.UI_BASE || 'http://localhost:8080';

const byCss = (s) => By.css(s);
async function waitOneOf(driver, selectors, timeout=12000) {
  const end = Date.now() + timeout;
  let lastErr;
  while (Date.now() < end) {
    for (const sel of selectors) {
      try {
        const el = await driver.findElement(byCss(sel));
        await driver.wait(until.elementIsVisible(el), 2000);
        return el;
      } catch (e) { lastErr = e; }
    }
    await driver.sleep(150);
  }
  throw new Error(`Timed out waiting for any of: ${selectors.join(' | ')}\nLast error: ${lastErr}`);
}

async function waitTasksUI(driver, timeout=15000) {
  await waitOneOf(driver, ['[data-test="task-title"]', '#task-title', '#title', '[name="title"]'], timeout);
  await waitOneOf(driver, ['[data-test="btn-add"]', '#btn-add', 'button#add', 'button+=Add Task'], timeout);
}

describe('UI (Selenium)', function () {
  this.timeout(70000);
  let driver;
  const uname = `ui_${Date.now()}`;
  const pw = '12345';

  before(async () => { driver = await new Builder().forBrowser('chrome').build(); });
  after(async () => { if (driver) await driver.quit(); });

  it('Register → Login → Tasks', async () => {
    // REGISTER
    await driver.get(`${base}/register.html`);

    const regUser = await waitOneOf(driver, ['[data-test="reg-username"]', '#reg-username', '#username', '[name="username"]']);
    await regUser.clear(); await regUser.sendKeys(uname);

    const regPass = await waitOneOf(driver, ['[data-test="reg-password"]', '#reg-password', '#password', '[name="password"]']);
    await regPass.clear(); await regPass.sendKeys(pw);

    const regBtn  = await waitOneOf(driver, ['[data-test="btn-register"]', '#btn-register', 'button+=Create Account', 'button+=Register']);
    await regBtn.click();

    // Go to login (auto or via link)
    await driver.sleep(400);
    let url = await driver.getCurrentUrl();
    if (!url.includes('login')) {
      const goto = await waitOneOf(driver, ['[data-test="goto-login"]', '#btn-goto-login', 'a+=I have an account', 'a+=Login'], 6000);
      await goto.click();
    }

    // LOGIN
    const loginUser = await waitOneOf(driver, ['[data-test="login-username"]', '#login-username', '#username', '[name="username"]']);
    await loginUser.clear(); await loginUser.sendKeys(uname);

    const loginPass = await waitOneOf(driver, ['[data-test="login-password"]', '#login-password', '#password', '[name="password"]']);
    await loginPass.clear(); await loginPass.sendKeys(pw);

    const loginBtn  = await waitOneOf(driver, ['[data-test="btn-login"]', '#btn-login', 'button+=Login']);
    await loginBtn.click();

    // Wait for token; if not redirected, go to tasks.html explicitly
    const start = Date.now();
    let token = null;
    while (Date.now() - start < 12000) {
      token = await driver.executeScript('return localStorage.getItem("token");');
      if (token) break;
      await driver.sleep(200);
    }
    if (!token) throw new Error('Login did not set localStorage.token – check API_BASE and backend status');

    url = await driver.getCurrentUrl();
    if (!url.includes('tasks')) await driver.get(`${base}/tasks.html`);

    await waitTasksUI(driver);
  });

  it('Add task shows in list', async () => {
    await waitTasksUI(driver);

    const titleInput = await waitOneOf(driver, ['[data-test="task-title"]', '#task-title', '#title', '[name="title"]']);
    await titleInput.clear(); await titleInput.sendKeys('Selenium Task', Key.TAB);

    const descInput  = await waitOneOf(driver, ['[data-test="task-desc"]', '#task-desc', '#description', '[name="description"]']);
    await descInput.clear(); await descInput.sendKeys('Created by Selenium');

    const addBtn = await waitOneOf(driver, ['[data-test="btn-add"]', '#btn-add', 'button+=Add Task', 'button+=Add']);
    await addBtn.click();

    const list = await waitOneOf(driver, ['[data-test="task-list"]', '#task-list', 'ul']);
    await driver.wait(async () => {
      const txt = await list.getText();
      return /Selenium Task/i.test(txt);
    }, 10000);
  });
});
