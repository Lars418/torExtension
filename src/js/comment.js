// region utils
const messageTypes = Object.freeze({
    COMMENT_PAGE: 'comment_page',
    SUBREDDIT_PAGE: 'subreddit_page',
    MAIN_PAGE: 'main_page',
    OTHER_PAGE: 'other_page',
});

const Selectors = Object.freeze({
    commentWrapper: 'div[style*="--commentswrapper-gradient-color"] > div, div[style*="max-height: unset"] > div',
    torComment: 'div[data-tor-comment]',
    postContent: 'div[data-test-id="post-content"]'
});

const UrlRegex = Object.freeze({
    commentPage: /\/r\/.*\/comments\/.*/,
    subredditPage: /\/r\/.*\//
});

const CommentUtils = Object.freeze({
    /**
     * Does not use the whole string, as it seems earlier versions did not include a link to the actual
     * subreddit. It also skips the beginning, as the "'" character might have some encoding issues.
     * @returns {boolean}
     * */
    isTorComment: (comment) => comment.querySelector('[data-test-id="comment"]') ? comment.querySelector('[data-test-id="comment"]').textContent.includes('m a human volunteer content transcriber for Reddit') : false,

    /**
     * Checks, whether a tor comment exists or not
     * @returns {boolean}
     * */
    torCommentsExist: () => !!document.querySelector(Selectors.torComment),

    /**
     * Checks, whether a comment wrapper exists or not
     * @returns {boolean}
     * */
    commentWrapperExists: () => !!document.querySelector('[data-reddit-comment-wrapper="true"]')
});
// endregion

// region page load
let directPage = false;
// This case occurs when the user directly opens the page
if (UrlRegex.commentPage.test(window.location.href)) {
    chrome.storage.local.get('debug', ({ debug }) => {
        if (debug) {
            console.log('[TOR]: Found direct page link..');
        }
    });
    directPage = true;
    moveComments();
}
// endregion

chrome.runtime.onMessage.addListener(msg => {
    if (msg.type === messageTypes.COMMENT_PAGE) {
        waitForComment(moveComments);
    }
});

function moveComments() {
    if (CommentUtils.commentWrapperExists()) {
        // Comments have already been parsed
        chrome.storage.local.get('debug', ({ debug }) => {
            if (debug) {
                console.log('[TOR]: Comment wrapper already exists. Skipping..');
            }
        });
        return;
    }

    const wrapper = document.querySelector(Selectors.commentWrapper);
    let comments = wrapper.querySelectorAll(`${Selectors.commentWrapper} > div`);
    const postContent = document.querySelector(Selectors.postContent);

    wrapper.dataset.redditCommentWrapper = 'true';
    wrapper.style.flexDirection = 'column';
    wrapper.style.display = 'flex';

    if (directPage) {
        comments = document.querySelectorAll("[data-reddit-comment-wrapper='true'] > div");
    }

    chrome.storage.local.get('settings', ({ settings }) => {
        // I don't expect to have more than one tor translation, that's why the last translation will be used for aria
        comments.forEach(comment => {
            if (CommentUtils.isTorComment(comment)) {
                comment.dataset.torComment = 'true';
                if (settings.background) {
                    comment.style.backgroundColor = 'var(--newCommunityTheme-buttonAlpha05)';
                }

                if (settings.border) {
                    comment.style.outline = '2px solid red';
                }

                comment.style.order = "-1";
                applyWaiAria(postContent, comment);
            }
        });
    })
}


function applyWaiAria(postContent, comment) {
    const postMedia = postContent.querySelector('img[class*="ImageBox-image"], video');
    const commentId = uuidv4();

    if (!postMedia) {
        console.warn('[TOR]: No media found. Skipping aria.');
        return;
    }

    comment.setAttribute('id', commentId);
    postMedia.setAttribute('aria-describedby', commentId);
}

/**
 * @description Observes page until comment wrapper has been found or until 10 seconds have passed by
 * @param callback {function}
 * */
function waitForComment(callback) {
    const config = { childList: true, subtree: true };
    const observer = new MutationObserver(mutations => {
        for (const mutation of mutations) {
            if (document.querySelector(Selectors.commentWrapper)) {
                callback();
                observer.disconnect();
                clearTimeout(timeout);
                break;
            }
        }
    });

    observer.observe(document.documentElement, config);
    const timeout = startObservingTimeout(observer, 10); // This prevents the observer being in an infinite loop
}

/**
 * Disconnects an observer after X seconds
 * @param observer {MutationObserver}
 * @param seconds {number}
 * @returns {number}
 * */
function startObservingTimeout(observer, seconds) {
    return setTimeout(() => {
        observer.disconnect();
        console.warn(`[TOR]: Observer did not find comment wrapper within ${seconds} seconds.`)
    }, 1000 * seconds);
}

/**
 * @description Creates a uuid v4
 * @returns {string}
 * */
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}