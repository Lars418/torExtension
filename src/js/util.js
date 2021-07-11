// region i18n
const i18n = document.querySelectorAll("[data-intl]");
const i18nTitle = document.querySelectorAll("[data-intl-title]");
i18n.forEach(msg => {
    msg.innerHTML = chrome.i18n.getMessage(msg.dataset.intl || msg.id);
});
i18nTitle.forEach(msg => {
    msg.title = chrome.i18n.getMessage(msg.getAttribute('data-intl-title'));
});
// endregion

// Set language
chrome.i18n.getAcceptLanguages(languages => {
    document.documentElement.lang = languages[0];
});