console.log("Container Redirector extension loaded");

async function handleRedirect(details) {
    try {
        const rules = await browser.storage.sync.get("redirectRules");

        if (!rules.redirectRules) {
            return { cancel: false };
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

                    if (details.cookieStoreId === targetContainer.cookieStoreId) {
                        return { cancel: false };
                    }

                    const tabs = await browser.tabs.query({ cookieStoreId: targetContainer.cookieStoreId });
                    const existingTab = tabs.find(tab => regex.test(tab.url));

                    if (existingTab) {
                        await browser.tabs.update(existingTab.id, { active: true });
                    } else {
                        try {
                            const newTab = await browser.tabs.create({
                                url: details.url,
                                cookieStoreId: targetContainer.cookieStoreId,
                                active: true
                            });
                            if (details.tabId && details.tabId !== newTab.id && details.type) { //close tab if we are in webRequest
                                try {
                                     await browser.tabs.remove(details.tabId);
                                }
                                catch(e){
                                    console.error("Failed to close tab",e);
                                }
                            }
                        }
                        catch(e){
                            console.error("Failed to open new tab", e);
                            return {cancel: false};
                        }
                    }
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