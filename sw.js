// region utils
const messageTypes = Object.freeze({
    COMMENT_PAGE: 'comment_page',
    SUBREDDIT_PAGE: 'subreddit_page',
    MAIN_PAGE: 'main_page',
    OTHER_PAGE: 'other_page',
});

const UrlRegex = Object.freeze({
    commentPage: /\/r\/.*\/comments\/.*/,
    subredditPage: /\/r\/.*\//
});

const Utils = Object.freeze({
    /**
     * @description Gets the type of a page
     * @returns {messageTypes}
     * */
    getPageType: (url) => {
        if (new URL(url).pathname === '/') {
            return messageTypes.MAIN_PAGE;
        } else if (UrlRegex.commentPage.test(url)) {
            return messageTypes.COMMENT_PAGE;
        } else if (UrlRegex.subredditPage.test(url)) {
            return messageTypes.SUBREDDIT_PAGE;
        }

        return messageTypes.OTHER_PAGE;
    }
});
// endregion

chrome.webNavigation.onHistoryStateUpdated.addListener(async ({ url }) => {
    const [{ id: tabId }] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.tabs.sendMessage(tabId, {
        type: Utils.getPageType(url),
        url
    });
});