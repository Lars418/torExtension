const whoami = document.getElementById('whoami');
const settingsBtn = document.querySelector('button');
const manifest = chrome.runtime.getManifest();


whoami.textContent = `${manifest.name} (${manifest.version_name})`;

settingsBtn.addEventListener('click', () => {
   chrome.runtime.openOptionsPage();
});