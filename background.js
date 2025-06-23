console.log("Container Redirector extension loaded");

async function handleRedirect(details) {
    // Only process main frame navigations (when a new page is being loaded).
    if (details.type !== 'main_frame') {
        return { cancel: false };
    }

    try {
        const rules = await browser.storage.sync.get("redirectRules");

        if (!rules.redirectRules) {
            return { cancel: false };
        }

        // Determine if the originating tab is a 'moz-extension://' page, 'about:newtab', or 'about:blank'
        let shouldCloseOriginatingTab = false;
        let originatingTabIdToClose = null;

        if (details.tabId) { // Check if the request originated from an existing tab
            try {
                const originatingTab = await browser.tabs.get(details.tabId);
                // Check if the originating tab's URL matches any of the specified types
                if (originatingTab && originatingTab.url && 
                    (originatingTab.url.startsWith("moz-extension://") || 
                     originatingTab.url === "about:newtab" || 
                     originatingTab.url === "about:blank")) {
                    shouldCloseOriginatingTab = true;
                    originatingTabIdToClose = originatingTab.id;
                }
            } catch (error) {
                console.error("Error getting originating tab details:", error);
                // Continue execution even if we can't get tab details
            }
        }

        for (const rule of rules.redirectRules) {
            try {
                let regex;
                try {
                    regex = new RegExp(rule.urlPattern);
                } catch (error) {
                    console.error("Invalid regular expression:", rule.urlPattern, error);
                    continue;
                }

                if (regex.test(details.url)) {
                    const containers = await browser.contextualIdentities.query({});
                    const targetContainer = containers.find(c => c.name === rule.containerName);
        
                    if (!targetContainer) {
                        console.warn(`Target container not found: ${rule.containerName}`);
                        continue;
                    }

                    // If the request is already in the target container, do nothing.
                    if (details.cookieStoreId === targetContainer.cookieStoreId) {
                        return { cancel: false };
                    }

                    // Always create a new tab in the target container for main_frame navigations.
                    try {
                        await browser.tabs.create({
                            url: details.url,
                            cookieStoreId: targetContainer.cookieStoreId,
                            active: true // Make the new tab active
                        });

                        // If the originating tab is a detected new tab page, close it.
                        if (shouldCloseOriginatingTab && originatingTabIdToClose) {
                            try {
                                await browser.tabs.remove(originatingTabIdToClose);
                            }
                            catch(e){
                                console.error("Failed to close tab:", e);
                            }
                        }
                    }
                    catch(e){
                        console.error("Failed to open new tab:", e);
                        return {cancel: false}; // If new tab creation fails, don't cancel the original request
                    }
                    
                    // Cancel the original request to prevent it from loading in the old tab.
                    return { cancel: true }; 
                }
            } catch (error) {
                console.error("Error processing rule:", rule, error);
            }
        }
    } catch (error) {
        console.error("Error retrieving redirect rules:", error);
    }
    return { cancel: false };
}

browser.webRequest.onBeforeRequest.addListener(
    handleRedirect,
    { urls: ["<all_urls>"] },
    ["blocking"]
);
browser.runtime.onInstalled.addListener(() => {
    browser.storage.sync.get("redirectRules").then(result => {
        if (!result.redirectRules) {
            browser.storage.sync.set({ redirectRules: [] });
        }
    });
});