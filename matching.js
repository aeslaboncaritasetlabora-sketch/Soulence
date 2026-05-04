const svg = document.getElementById("rings-svg");
const profilesContainer = document.getElementById("profiles-container");

const profileImages = [
  "https://randomuser.me/api/portraits/men/32.jpg",
  "https://randomuser.me/api/portraits/women/45.jpg",
  "https://randomuser.me/api/portraits/men/12.jpg",
  "https://randomuser.me/api/portraits/women/67.jpg",
  "https://randomuser.me/api/portraits/men/76.jpg",
  "https://randomuser.me/api/portraits/women/21.jpg"
];

function createRing() {
  
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  const ring = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  ring.setAttribute("cx", 300);
  ring.setAttribute("cy", 300);

  const minR = 150;
  const maxR = 260;
  const r = Math.floor(minR + Math.random() * (maxR - minR));
  ring.setAttribute("r", r);

  ring.classList.add("ring-path"); 
  ring.setAttribute("stroke-dasharray", ${Math.floor(r / 2)} ${Math.floor(r / 6)});

  g.appendChild(ring);
  svg.appendChild(g);

  setTimeout(() => {
    if (g.parentNode) g.parentNode.removeChild(g);
  }, 3000);
}

function createProfile() {
  const profile = document.createElement("div");
  profile.className = "profile";

  profile.style.top = "50%";
  profile.style.left = "50%";

  const img = document.createElement("img");
  img.src = profileImages[Math.floor(Math.random() * profileImages.length)];
  profile.appendChild(img);

  const angle = Math.random() * Math.PI * 2;

  const minDist = 160;
  const maxDist = 260;
  const radius = minDist + Math.random() * (maxDist - minDist);

  const tx = Math.cos(angle) * radius;
  const ty = Math.sin(angle) * radius;

  profile.style.setProperty("--tx", ${tx}px);
  profile.style.setProperty("--ty", ${ty}px);

  profilesContainer.appendChild(profile);

  setTimeout(() => {
    if (profile.parentNode) profile.parentNode.removeChild(profile);
  }, 3000);
}

function tick() {
  createRing();
  const profilesPerTick = 3; // adjust number as desired
  for (let i = 0; i < profilesPerTick; i++) { createProfile(); }
}

const intervalMs = 900;
tick();
const loop = setInterval(tick, intervalMs);

window.addEventListener("beforeunload", () => clearInterval(loop));

function declineCall() { alert("Call declined."); }
function acceptCall() { alert("Call accepted."); }
function editProfile() { alert("Edit profile clicked."); }
function openKeyboard() { alert("Keyboard opened."); }
function activateSoulLink() { alert("SOULLINK activated."); }