// region load settings
const defaultSettings = Object.freeze({
    border: false,
    background: false,
});
const generalSection = document.getElementById('generalOptionsWrapper');
const advancedSection = document.getElementById('advancedOptionsWrapper');

chrome.storage.local.get('settings', ({ settings }) => {
   const options = settings ?? defaultSettings;
   if (!settings) {
       chrome.storage.local.set({
           settings: defaultSettings,
       });
   }

   const generalOptions = Object.keys(options).filter(x => !x.startsWith('advanced'));
   const advancedOptions = Object.keys(options).filter(x => x.startsWith('advanced'));

   generalOptions.map(option => createOption(option, options, generalSection));
   advancedOptions.map(option => createOption(option, options, advancedSection));
});
// endregion

// region helper functions
function createOption(setting, settingsObject, wrapper) {
    const settingWrapper = document.createElement("div");
    settingWrapper.classList.add("setting-item");
    settingWrapper.innerHTML = `
    <div class="label-wrapper">
        <label
        for="${setting}"
        id="${setting}Desc"
        >
            ${chrome.i18n.getMessage(`setting${setting}`)}
        </label>
    </div>

    <input
        type="checkbox"
        ${settingsObject[setting] ? 'checked' : ''}
        id="${setting}"
    />
    <label
        for="${setting}"
        tabindex="0"
        role="switch"
        aria-checked="${settingsObject[setting]}"
        aria-describedby="${setting}-desc"
        class="is-switch"
    ></label>
    `;

    const toggleSwitch = settingWrapper.querySelector("label.is-switch");
    const input = settingWrapper.querySelector("input");

    input.onchange = () => {
        toggleSwitch.setAttribute('aria-checked', input.checked);
        updateSetting(setting, input.checked);
    };

    toggleSwitch.onkeydown = e => {
        if(e.key === " " || e.key === "Enter") {
            e.preventDefault();
            toggleSwitch.click();
        }
    }

    wrapper.appendChild(settingWrapper);
}

function updateSetting(key, value) {
    chrome.storage.local.get('settings', ({ settings }) => {
        chrome.storage.local.set({
            settings: {
                ...settings,
                [key]: value
            }
        })
    });
}
// endregion