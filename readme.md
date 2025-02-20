# Conductor: Dynamic URL Redirection to Firefox Containers

Conductor is a Firefox extension that allows you to automatically redirect specific URLs to designated Firefox containers.  Take control of your browsing context and enhance your privacy and organization.

## Features

*   **User-Defined Rules:** Create custom rules to redirect URLs based on powerful regular expressions.
*   **Container Support:** Seamlessly integrates with Firefox's built-in container feature.
*   **Automatic Redirection:** Redirects matching URLs before the page even loads, ensuring you're always in the right context.
*   **Persistent Settings:** Your redirection rules are saved and synchronized across your Firefox profile (using `browser.storage.sync`).
*   **Options Page:** An easy-to-use options page allows you to manage your redirection rules.
*   **Lightweight and Efficient:** Built with performance in mind.
*  **Open Source**

## How to Use

1.  **Install the Extension:** Install Conductor from the Firefox Add-ons website.
2.  **Open Options Page:** Go to `about:addons` (or Manage Your Extensions), find Conductor, and click "Preferences".
3.  **Add Rules:**
    *   Click the "Add Rule" button.
    *   Enter a **URL Pattern:** This is a *regular expression* that will be matched against the URL.  For example:
        *   `example\.com`:  Matches any URL containing "example.com".
        *   `^https://www\.example\.com`: Matches URLs that *start with* "[https://www.example.com](https://www.google.com/url?sa=E&source=gmail&q=https://www.example.com)".
        *   `login\.microsoftonline\.com.*client_id=YOUR_CLIENT_ID`: Matches Microsoft login URLs with a specific `client_id`.  (Replace `YOUR_CLIENT_ID` with the actual ID.)
        *   `.*\.google\.com`: Matches any Google domain or subdomain.
    *   Select a **Container Name:** Choose the container you want to open matching URLs in.  You must have already created the container in Firefox.
    *   Click **Save**
4.  **Test:** Visit a URL that matches one of your rules. It should automatically open in the specified container.

## Permissions Explained

This extension requires the following permissions:

*   **`webRequest` and `webRequestBlocking`:** These permissions are necessary to intercept network requests *before* they are sent, allowing the extension to redirect URLs. This is the core functionality of the extension.
*   **`tabs`:**  This permission is used to create new tabs in the specified containers and to manage existing tabs (e.g., closing the original tab).
*   **`cookies`:**  This permission is required to access the `cookieStoreId` associated with each tab and container. This ensures that the redirection happens within the correct container context.
*   **`contextualIdentities`:**  This permission allows the extension to interact with Firefox's container feature, retrieving the list of available containers and creating new tabs within specific containers.
*   **`storage`:** This permission is used to store your redirection rules persistently and synchronize them across your Firefox profile.
*   **`<all_urls>` (Host Permission):**  This permission is necessary to allow the extension to intercept *all* URLs.  Without this, the extension would only be able to intercept URLs that you explicitly listed, which would defeat the purpose of user-defined rules.  The extension uses this permission *responsibly* to match URLs against your *user-defined* rules and redirect them to the appropriate containers. It does *not* collect or transmit any browsing data.

## Regular Expressions (Regex)

Conductor uses regular expressions for URL matching, giving you great flexibility. Here are some basic regex tips:

*   `.` (period): Matches any single character (except a newline).
*   `*` (asterisk): Matches the preceding character zero or more times.
*   `+` (plus): Matches the preceding character one or more times.
*   `?` (question mark): Matches the preceding character zero or one time.
*   `^` (caret): Matches the beginning of the string.
*   `$` (dollar sign): Matches the end of the string.
*   `\` (backslash): Escapes special characters (e.g., `\.` matches a literal period).
*   `[]` (square brackets): Matches any character within the brackets (e.g., `[abc]` matches "a", "b", or "c").
*   `[^ ]` : Matches anything that is NOT in the set
*   `( )` : Groups sections.

**Example:**

To match any URL that *starts with* "https://www.example.com" *or* "https://example.com", you could use:

```regex
^https://(www\.)?example\.com




**Key improvements in the description:**

*   **Clear and Concise:**  Uses clear language and avoids jargon.
*   **Feature List:** Highlights the key features.
*   **How to Use:**  Provides step-by-step instructions.
*   **Permissions Explanation:**  *Thoroughly* explains each permission and *why* it's needed. This is *very* important for building user trust.  The explanation of `<all_urls>` is especially crucial.
*   **Regular Expression Guidance:**  Provides basic regex tips and links to external resources. This is essential since the extension relies on regex.
*   **Notes:** Includes helpful notes for users.
*   **Open Source:** Includes a placeholder for your GitHub repository URL.
* **License:** Includes a placeholder for the license.

**Before Submitting to AMO:**

1.  **Replace Placeholders:**
    *   Replace `[YOUR_GITHUB_REPOSITORY_URL]` with the actual URL of your GitHub repository.
    *   Replace `"conductor@yourdomain.com"` in the `manifest.json` with *your* chosen add-on ID.
    *   Choose a license, and update the License section.
2.  **Test Thoroughly:** Test the extension again to make sure everything works as expected.
3.  **Create Icons:** Create the icon files (16x16, 32x32, 48x48, 128x128 PNGs) and put them in an `images` folder.
4.  **Zip:** Create a ZIP file containing all the extension files (`manifest.json`, `background.js`, `options.html`, `options.js`, `images/`, etc.). This ZIP file is what you'll upload to AMO.
5.  **Submit:** Go to [addons.mozilla.org/developers/](https://www.google.com/search?q=https://www.google.com/url%3Fsa%3DE%26source%3Dgmail%26q%3Dhttp://addons.mozilla.org/developers/) and follow the instructions to submit your extension.

This comprehensive description and the code we've developed should give you a great starting point for publishing your extension! Remember to be responsive to user feedback after you publish. Good luck!

