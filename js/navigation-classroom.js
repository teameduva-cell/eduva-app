// Stack-based Navigation Handler with Back Button Support
function goBack() {
  if (navigationHistory.length > 1) {
    navigationHistory.pop();
    const previousTab = navigationHistory[navigationHistory.length - 1];
    switchTab(previousTab, true);
    try {
      history.pushState({ eduva: true }, "", location.href);
    } catch (_) {}
  } else {
    switchTab("home", true);
  }
}

function switchTab(tabId, isBackAction = false) {
  if (
    !isBackAction &&
    navigationHistory[navigationHistory.length - 1] !== tabId
  ) {
    navigationHistory.push(tabId);
    try {
      history.pushState({ eduva: true, tab: tabId }, "", location.href);
    } catch (_) {}
  }

  [
    "home",
    "chat",
    "classroom",
    "feedback",
    "timetable",
    "health",
    "counseling",
    "about",
    "contact",
    "courses",
    "flashcards",
    "mocktest",
    "vault",
    "community",
    "faq",
    "learning",
    "profile",
    "avatar-lectures",
    "memory",
    "motivation",
  ].forEach((t) => {
    const el = document.getElementById(`view-${t}`);
    if (el) el.classList.add("hidden");

    const tabBtn = document.getElementById(`tab-${t}`);
    if (tabBtn) {
      tabBtn.classList.remove("text-slate-900", "font-extrabold");
      tabBtn.classList.add("text-slate-500", "font-bold");
    }
  });

  const activeEl = document.getElementById(`view-${tabId}`);
  if (activeEl) activeEl.classList.remove("hidden");

  const activeTab = document.getElementById(`tab-${tabId}`);
  if (activeTab) {
    activeTab.classList.add("text-slate-900", "font-extrabold");
    activeTab.classList.remove("text-slate-500", "font-bold");
  }

  if (tabId === "classroom") setTimeout(initWhiteboard, 50);
  if (tabId === "vault") loadVaultItems();
  if (tabId === "community") loadCommunityDoubts();
  if (tabId === "memory") updateMemoryDashboard();
}

// Handle Browser Popstate / Back Button Stack Navigation
window.addEventListener("popstate", () => {
  if (navigationHistory.length > 1) {
    navigationHistory.pop();
    const previousTab = navigationHistory[navigationHistory.length - 1];
    switchTab(previousTab, true);
  } else {
    switchTab("home", true);
  }
  try {
    history.pushState({ eduva: true }, "", location.href);
  } catch (_) {}
});

let canvas,
  ctx,
  painting = false;
function initWhiteboard() {
  canvas = document.getElementById("whiteboard");
  if (!canvas) return;
  ctx = canvas.getContext("2d");
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;

  canvas.addEventListener("mousedown", () => (painting = true));
  window.addEventListener("mouseup", () => {
    painting = false;
    ctx.beginPath();
  });
  canvas.addEventListener("mousemove", (e) => {
    if (!painting) return;
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#38BDF8";
    const r = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - r.left, e.clientY - r.top);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.clientX - r.left, e.clientY - r.top);
  });
}
function clearCanvas() {
  if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
}
function setBoardMode(m) {
  if (m === "draw") {
    document.getElementById("board-container-draw").classList.remove("hidden");
    document.getElementById("board-container-3d").classList.add("hidden");
    document.getElementById("classroom-3d-selectors").classList.add("hidden");
    initWhiteboard();
  } else {
    document.getElementById("board-container-draw").classList.add("hidden");
    document.getElementById("board-container-3d").classList.remove("hidden");
    document
      .getElementById("classroom-3d-selectors")
      .classList.remove("hidden");
    init3DClassroom();
  }
}

let cScene,
  cCamera,
  cRenderer,
  cGroup,
  is3DInit = false;
function init3DClassroom() {
  const container = document.getElementById("classroom-three-canvas");
  if (!container || is3DInit) return;
  cScene = new THREE.Scene();
  cCamera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  cCamera.position.z = 7;
  cRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  cRenderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(cRenderer.domElement);
  cScene.add(new THREE.AmbientLight(0xffffff, 0.9));
  cGroup = new THREE.Group();
  cScene.add(cGroup);
  cGroup.add(
    new THREE.Mesh(
      new THREE.TorusKnotGeometry(1.5, 0.45, 100, 16),
      new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 })
    )
  );

  function animate() {
    requestAnimationFrame(animate);
    cGroup.rotation.y += 0.008;
    cRenderer.render(cScene, cCamera);
  }
  animate();
  is3DInit = true;
}

function switch3DModel(type) {
  if (!cGroup) return;
  while (cGroup.children.length > 0) cGroup.remove(cGroup.children[0]);
  if (type === "heart") {
    cGroup.add(
      new THREE.Mesh(
        new THREE.TorusKnotGeometry(1.5, 0.45, 100, 16),
        new THREE.MeshStandardMaterial({ color: 0xef4444 })
      )
    );
  } else {
    cGroup.add(
      new THREE.Mesh(
        new THREE.SphereGeometry(0.8, 32, 32),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b })
      )
    );
  }
}