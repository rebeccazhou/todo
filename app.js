const CATEGORIES = [
  { id: "soft-services", label: "Soft Services" },
  { id: "idea-farm", label: "Idea Farm" },
  { id: "offhours", label: "Offhours" },
  { id: "personal", label: "Personal" },
  { id: "cooking", label: "Cooking" },
];

const TASK_STORAGE_KEY = "personal-todos-v1";
const PREF_STORAGE_KEY = "personal-todos-preferences-v1";
const AUTH_STORAGE_KEY = "personal-todos-auth-v1";
const AUTH_UNLOCKED_KEY = "personal-todos-unlocked-v1";
const AUTH_ITERATIONS = 150000;
const DEFAULT_ZIP = "10001";

const WEATHER_CODES = {
  0: { day: "Sunny", night: "Clear", color: "#dfdf6a", deep: "#c7c73b" },
  1: { day: "Mostly Sunny", night: "Mostly Clear", color: "#d7d878", deep: "#bfc052" },
  2: { day: "Partly Cloudy", night: "Partly Cloudy", color: "#b9c5ce", deep: "#8796a3" },
  3: { day: "Cloudy", night: "Cloudy", color: "#aeb5bb", deep: "#7c858c" },
  45: { day: "Fog", night: "Fog", color: "#c8c6ba", deep: "#9f9d92" },
  48: { day: "Fog", night: "Fog", color: "#c8c6ba", deep: "#9f9d92" },
  51: { day: "Drizzle", night: "Drizzle", color: "#8fb6ce", deep: "#5f93b1" },
  53: { day: "Drizzle", night: "Drizzle", color: "#8fb6ce", deep: "#5f93b1" },
  55: { day: "Drizzle", night: "Drizzle", color: "#8fb6ce", deep: "#5f93b1" },
  56: { day: "Freezing Drizzle", night: "Freezing Drizzle", color: "#a5c8d9", deep: "#72a6be" },
  57: { day: "Freezing Drizzle", night: "Freezing Drizzle", color: "#a5c8d9", deep: "#72a6be" },
  61: { day: "Rain", night: "Rain", color: "#7fb2d6", deep: "#4f8cb8" },
  63: { day: "Rain", night: "Rain", color: "#7fb2d6", deep: "#4f8cb8" },
  65: { day: "Rain", night: "Rain", color: "#7fb2d6", deep: "#4f8cb8" },
  66: { day: "Freezing Rain", night: "Freezing Rain", color: "#a5c8d9", deep: "#72a6be" },
  67: { day: "Freezing Rain", night: "Freezing Rain", color: "#a5c8d9", deep: "#72a6be" },
  71: { day: "Snow", night: "Snow", color: "#d8edf4", deep: "#9ecbd9" },
  73: { day: "Snow", night: "Snow", color: "#d8edf4", deep: "#9ecbd9" },
  75: { day: "Snow", night: "Snow", color: "#d8edf4", deep: "#9ecbd9" },
  77: { day: "Snow", night: "Snow", color: "#d8edf4", deep: "#9ecbd9" },
  80: { day: "Showers", night: "Showers", color: "#7fb2d6", deep: "#4f8cb8" },
  81: { day: "Showers", night: "Showers", color: "#7fb2d6", deep: "#4f8cb8" },
  82: { day: "Showers", night: "Showers", color: "#7fb2d6", deep: "#4f8cb8" },
  85: { day: "Snow Showers", night: "Snow Showers", color: "#d8edf4", deep: "#9ecbd9" },
  86: { day: "Snow Showers", night: "Snow Showers", color: "#d8edf4", deep: "#9ecbd9" },
  95: { day: "Thunderstorm", night: "Thunderstorm", color: "#b49ad5", deep: "#8060b4" },
  96: { day: "Thunderstorm", night: "Thunderstorm", color: "#b49ad5", deep: "#8060b4" },
  99: { day: "Thunderstorm", night: "Thunderstorm", color: "#b49ad5", deep: "#8060b4" },
};

const state = {
  view: "soft-services",
  tasks: loadTasks(),
  preferences: loadPreferences(),
  focusDraftPeriod: null,
  focusTaskId: null,
  weather: {
    status: "idle",
    temperature: null,
    summary: "Weather",
  },
};

const elements = {
  root: document.documentElement,
  authForm: document.querySelector("#authForm"),
  authTitle: document.querySelector("#authTitle"),
  authPassword: document.querySelector("#authPassword"),
  authSubmit: document.querySelector("#authSubmit"),
  authMessage: document.querySelector("#authMessage"),
  shell: document.querySelector(".app-shell"),
  viewTitle: document.querySelector("#viewTitle"),
  viewContext: document.querySelector("#viewContext"),
  viewTabs: document.querySelector("#viewTabs"),
  railToggle: document.querySelector("#railToggle"),
  themeToggle: document.querySelector("#themeToggle"),
  content: document.querySelector("#content"),
  weatherStamp: document.querySelector("#weatherStamp"),
  zipForm: document.querySelector("#zipForm"),
  zipInput: document.querySelector("#zipInput"),
  taskTemplate: document.querySelector("#taskTemplate"),
  draftTemplate: document.querySelector("#draftTemplate"),
};

function loadTasks() {
  try {
    const savedTasks = JSON.parse(localStorage.getItem(TASK_STORAGE_KEY));
    return Array.isArray(savedTasks) ? savedTasks.map(normalizeTask) : [];
  } catch {
    return [];
  }
}

function normalizeTask(task) {
  return {
    id: task.id ?? generateId(),
    text: task.text ?? "",
    category: task.category ?? "soft-services",
    period: task.period ?? "week",
    completed: Boolean(task.completed),
    completedAt: task.completedAt ?? null,
    createdAt: task.createdAt ?? new Date().toISOString(),
  };
}

function loadPreferences() {
  const fallback = {
    collapsed: false,
    theme: "light",
    zip: DEFAULT_ZIP,
  };

  try {
    return {
      ...fallback,
      ...JSON.parse(localStorage.getItem(PREF_STORAGE_KEY)),
    };
  } catch {
    return fallback;
  }
}

function saveTasks() {
  localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(state.tasks));
}

function savePreferences() {
  localStorage.setItem(PREF_STORAGE_KEY, JSON.stringify(state.preferences));
}

function generateId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getCategoryLabel(categoryId) {
  return CATEGORIES.find((category) => category.id === categoryId)?.label ?? "Soft Services";
}

function getDefaultCategory() {
  return state.view === "all-week" ? "soft-services" : state.view;
}

function getViewLabel(view = state.view) {
  return view === "all-week" ? "This Week" : getCategoryLabel(view);
}

function createTask(text, category, period) {
  return {
    id: generateId(),
    text,
    category,
    period,
    completed: false,
    completedAt: null,
    createdAt: new Date().toISOString(),
  };
}

function createTasksFromText(text, category, period) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => createTask(line, category, period));
}

function startOfThisWeek() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - date.getDay());
  return date;
}

function isCompletedThisWeek(task) {
  if (!task.completed || !task.completedAt) {
    return false;
  }

  return new Date(task.completedAt) >= startOfThisWeek();
}

function belongsToScope(task, scope = state.view) {
  return scope === "all-week" ? true : task.category === scope;
}

function shouldShowInWeek(task, scope = state.view) {
  if (!belongsToScope(task, scope) || task.period !== "week") {
    return false;
  }

  return !task.completed || isCompletedThisWeek(task);
}

function isArchivedComplete(task, scope = state.view) {
  return task.completed && belongsToScope(task, scope) && !shouldShowInWeek(task, scope);
}

function countThisWeek(scope) {
  return state.tasks.filter((task) => shouldShowInWeek(task, scope)).length;
}

function getOpenWeekTasks() {
  return state.tasks.filter((task) => belongsToScope(task) && task.period === "week" && !task.completed);
}

function getCompletedWeekTasks() {
  return state.tasks.filter((task) => shouldShowInWeek(task) && task.completed);
}

function getLaterTasks() {
  return state.tasks.filter((task) => belongsToScope(task) && task.period === "future" && !task.completed);
}

function getArchivedCompletedTasks() {
  return state.tasks.filter((task) => isArchivedComplete(task));
}

function addDraftTasks(text, period) {
  const tasks = createTasksFromText(text, getDefaultCategory(), period);
  if (tasks.length === 0) {
    return false;
  }

  state.tasks = [...state.tasks, ...tasks];
  state.focusDraftPeriod = period;
  saveTasks();
  render();
  return true;
}

function insertTasksAfter(taskId, text) {
  const sourceTask = state.tasks.find((task) => task.id === taskId);
  if (!sourceTask) {
    return;
  }

  const tasks = createTasksFromText(text, sourceTask.category, sourceTask.period);
  if (tasks.length === 0) {
    return;
  }

  const index = state.tasks.findIndex((task) => task.id === taskId);
  state.tasks = [
    ...state.tasks.slice(0, index + 1),
    ...tasks,
    ...state.tasks.slice(index + 1),
  ];
  state.focusTaskId = tasks.at(-1).id;
  saveTasks();
  render();
}

function updateTaskText(taskId, text) {
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task) {
    return;
  }

  if (!text.trim()) {
    state.tasks = state.tasks.filter((item) => item.id !== taskId);
    state.focusDraftPeriod = task.period;
    saveTasks();
    render();
    return;
  }

  state.tasks = state.tasks.map((item) =>
    item.id === taskId ? { ...item, text } : item,
  );
  saveTasks();
}

function moveTaskToPeriod(taskId, period) {
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task || task.completed || task.period === period) {
    return;
  }

  state.tasks = state.tasks.map((item) =>
    item.id === taskId ? { ...item, period } : item,
  );
  saveTasks();
  render();
}

function toggleTask(taskId) {
  const completedAt = new Date().toISOString();

  state.tasks = state.tasks.map((task) => {
    if (task.id !== taskId) {
      return task;
    }

    const completed = !task.completed;
    return {
      ...task,
      completed,
      completedAt: completed ? completedAt : null,
    };
  });

  saveTasks();
  render();
}

function setView(view) {
  state.view = view;
  state.focusDraftPeriod = null;
  render();
}

function toggleRail() {
  state.preferences.collapsed = !state.preferences.collapsed;
  savePreferences();
  render();
}

function toggleTheme() {
  state.preferences.theme = state.preferences.theme === "dark" ? "light" : "dark";
  savePreferences();
  applyPreferences();
}

function applyPreferences() {
  elements.root.dataset.theme = state.preferences.theme;
  elements.shell.classList.toggle("is-rail-collapsed", state.preferences.collapsed);
  elements.railToggle.setAttribute(
    "aria-label",
    state.preferences.collapsed ? "Expand categories" : "Collapse categories",
  );
}

function renderTabs() {
  const allTabs = [...CATEGORIES, { id: "all-week", label: "This Week" }];
  const activeTab = allTabs.find((tab) => tab.id === state.view) ?? allTabs[0];
  const tabs = [activeTab, ...allTabs.filter((tab) => tab.id !== activeTab.id)];

  elements.viewTabs.replaceChildren();

  tabs.forEach((tab) => {
    const button = document.createElement("button");
    button.className = "view-tab";
    button.type = "button";
    button.classList.toggle("active", tab.id === state.view);
    button.dataset.view = tab.id;

    const label = document.createElement("span");
    label.textContent = tab.label;

    const count = document.createElement("span");
    count.className = "view-tab-count";
    count.textContent = countThisWeek(tab.id);

    button.append(label, count);
    button.addEventListener("click", () => setView(tab.id));
    elements.viewTabs.append(button);
  });
}

function renderTask(task, options = {}) {
  const node = elements.taskTemplate.content.firstElementChild.cloneNode(true);
  const checkbox = node.querySelector("input");
  const title = node.querySelector(".task-title");

  node.classList.toggle("is-complete", task.completed);
  node.classList.toggle("is-dim", options.dim);
  node.dataset.taskId = task.id;
  node.draggable = options.draggable ?? !task.completed;
  checkbox.checked = task.completed;
  title.value = task.text;
  title.dataset.taskId = task.id;

  node.addEventListener("dragstart", (event) => {
    if (task.completed) {
      event.preventDefault();
      return;
    }

    node.classList.add("is-dragging");
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", task.id);
    event.dataTransfer.setData("application/x-todo-id", task.id);
  });
  node.addEventListener("dragend", () => {
    node.classList.remove("is-dragging");
  });
  checkbox.addEventListener("change", () => toggleTask(task.id));
  title.addEventListener("input", () => {
    resizeTextArea(title);
    updateTaskText(task.id, title.value);
  });
  title.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      const remainingText = title.value.slice(title.selectionStart).trim();
      title.value = title.value.slice(0, title.selectionStart).trim();
      updateTaskText(task.id, title.value);
      insertTasksAfter(task.id, remainingText || "");

      if (!remainingText) {
        state.focusDraftPeriod = task.period;
        render();
      }
    }
  });

  requestAnimationFrame(() => resizeTextArea(title));
  return node;
}

function resizeTextArea(input) {
  input.style.height = "auto";
  input.style.height = `${input.scrollHeight + 2}px`;
}

function renderDraftTask(period) {
  const node = elements.draftTemplate.content.firstElementChild.cloneNode(true);
  const input = node.querySelector(".draft-input");

  node.dataset.period = period;
  input.dataset.period = period;

  input.addEventListener("input", () => resizeTextArea(input));
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      addDraftTasks(input.value, period);
    }
  });

  input.addEventListener("paste", (event) => {
    const text = event.clipboardData?.getData("text/plain") ?? "";
    if (!text.includes("\n")) {
      return;
    }

    event.preventDefault();
    addDraftTasks(text, period);
  });

  requestAnimationFrame(() => resizeTextArea(input));
  return node;
}

function addDropTarget(section, period) {
  section.dataset.dropPeriod = period;

  section.addEventListener("dragover", (event) => {
    if (!event.dataTransfer.types.includes("application/x-todo-id")) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    section.classList.add("is-drop-target");
  });

  section.addEventListener("dragleave", (event) => {
    if (!section.contains(event.relatedTarget)) {
      section.classList.remove("is-drop-target");
    }
  });

  section.addEventListener("drop", (event) => {
    const taskId = event.dataTransfer.getData("application/x-todo-id");
    if (!taskId) {
      return;
    }

    event.preventDefault();
    section.classList.remove("is-drop-target");
    moveTaskToPeriod(taskId, period);
  });
}

function renderSection(title, tasks, options = {}) {
  const section = document.createElement("section");
  section.className = "task-section";
  section.classList.toggle("is-week", options.week);

  if (options.dropPeriod) {
    addDropTarget(section, options.dropPeriod);
  }

  if (title) {
    const heading = document.createElement("div");
    heading.className = "section-heading";
    heading.classList.toggle("is-muted", options.muted);

    const label = document.createElement("span");
    label.textContent = title;

    heading.append(label);

    if (options.showCount) {
      const count = document.createElement("span");
      count.className = "section-count";
      count.textContent = tasks.length;
      heading.append(count);
    }

    section.append(heading);
  }

  const list = document.createElement("div");
  list.className = "task-list";
  tasks.forEach((task) =>
    list.append(
      renderTask(task, {
        dim: options.muted || task.completed,
        draggable: Boolean(options.dropPeriod) && !task.completed,
      }),
    ),
  );

  if (options.addable) {
    list.append(renderDraftTask(options.period));
  }

  options.tailTasks?.forEach((task) => list.append(renderTask(task, { dim: true, draggable: false })));

  section.append(list);

  return section;
}

function renderContent() {
  const openWeekTasks = getOpenWeekTasks();
  const completedWeekTasks = getCompletedWeekTasks();
  const laterTasks = state.view === "all-week" ? [] : getLaterTasks();
  const archivedCompleted = getArchivedCompletedTasks();
  const canAddInView = state.view !== "all-week";

  elements.content.replaceChildren();
  elements.content.append(
    renderSection(null, openWeekTasks, {
      week: true,
      addable: canAddInView,
      period: "week",
      dropPeriod: canAddInView ? "week" : null,
      tailTasks: completedWeekTasks,
    }),
  );

  if (state.view !== "all-week") {
    elements.content.append(
      renderSection("Later", laterTasks, {
        addable: true,
        period: "future",
        dropPeriod: "future",
      }),
    );
  }

  elements.content.append(
    renderSection("Complete", archivedCompleted, {
      muted: true,
      showCount: true,
    }),
  );
}

function renderWeatherStamp() {
  const today = new Date();
  const date = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(today);

  const secondLine =
    state.weather.status === "loading"
      ? "Loading weather"
      : state.weather.temperature === null
        ? state.weather.summary
        : `${Math.round(state.weather.temperature)}° ${state.weather.summary}`;

  elements.weatherStamp.textContent = `${date}\n${secondLine}`;
}

function render() {
  applyPreferences();
  renderTabs();

  elements.viewTitle.textContent = "This Week";
  elements.viewContext.textContent = state.view === "all-week" ? "" : getViewLabel();

  renderContent();
  renderWeatherStamp();
  focusRequestedDraft();
  focusRequestedTask();
}

function focusRequestedDraft() {
  if (!state.focusDraftPeriod) {
    return;
  }

  const period = state.focusDraftPeriod;
  state.focusDraftPeriod = null;

  requestAnimationFrame(() => {
    const input = elements.content.querySelector(`.draft-input[data-period="${period}"]`);
    input?.focus();
  });
}

function focusRequestedTask() {
  if (!state.focusTaskId) {
    return;
  }

  const taskId = state.focusTaskId;
  state.focusTaskId = null;

  requestAnimationFrame(() => {
    const input = elements.content.querySelector(`.task-title[data-task-id="${taskId}"]`);
    input?.focus();
    input?.setSelectionRange(input.value.length, input.value.length);
  });
}

function getWeatherDescription(code, isDay) {
  const weather = WEATHER_CODES[code] ?? WEATHER_CODES[0];
  return {
    label: isDay ? weather.day : weather.night,
    color: weather.color,
    deep: weather.deep,
  };
}

function setWeatherAccent(color, deep) {
  elements.root.style.setProperty("--weather-accent", color);
  elements.root.style.setProperty("--weather-accent-deep", deep);
}

async function fetchWeather() {
  const zip = state.preferences.zip;
  state.weather.status = "loading";
  renderWeatherStamp();

  try {
    const locationUrl = new URL("https://geocoding-api.open-meteo.com/v1/search");
    locationUrl.search = new URLSearchParams({
      name: zip,
      count: "1",
      language: "en",
      format: "json",
      countryCode: "US",
    }).toString();

    const locationResponse = await fetch(locationUrl);
    const locationData = await locationResponse.json();
    const location = locationData.results?.[0];

    if (!location) {
      throw new Error("No location found");
    }

    const weatherUrl = new URL("https://api.open-meteo.com/v1/forecast");
    weatherUrl.search = new URLSearchParams({
      latitude: location.latitude,
      longitude: location.longitude,
      current: "temperature_2m,weather_code,is_day",
      temperature_unit: "fahrenheit",
      timezone: "auto",
    }).toString();

    const weatherResponse = await fetch(weatherUrl);
    const weatherData = await weatherResponse.json();
    const current = weatherData.current;

    if (!current) {
      throw new Error("No weather found");
    }

    const description = getWeatherDescription(current.weather_code, Boolean(current.is_day));
    state.weather = {
      status: "ready",
      temperature: current.temperature_2m,
      summary: description.label,
    };
    setWeatherAccent(description.color, description.deep);
  } catch {
    state.weather = {
      status: "error",
      temperature: null,
      summary: "Set ZIP",
    };
    setWeatherAccent("#dfdf6a", "#c7c73b");
  }

  renderWeatherStamp();
}

function toggleZipForm() {
  elements.zipForm.hidden = !elements.zipForm.hidden;
  elements.zipInput.value = state.preferences.zip;
  elements.weatherStamp.hidden = !elements.zipForm.hidden;

  if (!elements.zipForm.hidden) {
    elements.zipInput.focus();
    elements.zipInput.select();
  }
}

function saveZip(event) {
  event.preventDefault();
  const zip = elements.zipInput.value.trim();

  if (!zip) {
    elements.zipInput.focus();
    return;
  }

  state.preferences.zip = zip;
  savePreferences();
  elements.zipForm.hidden = true;
  elements.weatherStamp.hidden = false;
  fetchWeather();
}

function bytesToBase64(bytes) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)));
}

function base64ToBytes(value) {
  return Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
}

async function derivePasswordHash(password, salt) {
  const passwordKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt,
      iterations: AUTH_ITERATIONS,
    },
    passwordKey,
    256,
  );

  return bytesToBase64(bits);
}

async function createAuthRecord(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return {
    salt: bytesToBase64(salt),
    hash: await derivePasswordHash(password, salt),
    iterations: AUTH_ITERATIONS,
  };
}

async function verifyPassword(password, record) {
  const hash = await derivePasswordHash(password, base64ToBytes(record.salt));
  return hash === record.hash;
}

function getAuthRecord() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY));
  } catch {
    return null;
  }
}

function setAuthMode() {
  const hasPassword = Boolean(getAuthRecord());
  elements.authTitle.textContent = hasPassword ? "Password" : "Set password";
  elements.authSubmit.textContent = hasPassword ? "Unlock" : "Save";
  elements.authPassword.autocomplete = hasPassword ? "current-password" : "new-password";
}

function unlockApp() {
  document.body.classList.remove("auth-pending");
  initializeApp();
}

async function handleAuthSubmit(event) {
  event.preventDefault();
  const password = elements.authPassword.value;

  if (!password) {
    elements.authMessage.textContent = "Enter a password";
    elements.authPassword.focus();
    return;
  }

  try {
    const record = getAuthRecord();

    if (!record) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(await createAuthRecord(password)));
      localStorage.setItem(AUTH_UNLOCKED_KEY, "true");
      unlockApp();
      return;
    }

    if (await verifyPassword(password, record)) {
      localStorage.setItem(AUTH_UNLOCKED_KEY, "true");
      unlockApp();
      return;
    }

    elements.authMessage.textContent = "Try again";
    elements.authPassword.value = "";
    elements.authPassword.focus();
  } catch {
    elements.authMessage.textContent = "Password protection needs this browser's crypto support";
  }
}

let appInitialized = false;

function initializeApp() {
  if (appInitialized) {
    return;
  }

  appInitialized = true;
  elements.railToggle.addEventListener("click", toggleRail);
  elements.themeToggle.addEventListener("click", toggleTheme);
  elements.weatherStamp.addEventListener("click", toggleZipForm);
  elements.zipForm.addEventListener("submit", saveZip);
  elements.zipInput.addEventListener("blur", (event) => {
    if (!elements.zipForm.hidden) {
      saveZip(event);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key.toLowerCase() === "n" && !event.metaKey && !event.ctrlKey && !event.altKey) {
      const activeTag = document.activeElement?.tagName;
      if (activeTag !== "INPUT" && activeTag !== "SELECT" && activeTag !== "TEXTAREA") {
        state.focusDraftPeriod = "week";
        focusRequestedDraft();
      }
    }

    if (event.key === "Escape") {
      elements.zipForm.hidden = true;
      elements.weatherStamp.hidden = false;
    }
  });

  render();
  fetchWeather();
}

function initializeAuth() {
  elements.root.dataset.theme = state.preferences.theme;

  if (localStorage.getItem(AUTH_UNLOCKED_KEY) === "true" && getAuthRecord()) {
    unlockApp();
    return;
  }

  setAuthMode();
  elements.authForm.addEventListener("submit", handleAuthSubmit);
  elements.authPassword.focus();
}

initializeAuth();
