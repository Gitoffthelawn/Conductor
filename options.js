async function loadContainers() {
  try {
      const containers = await browser.contextualIdentities.query({});
      return containers;
  } catch (error) {
      console.error("loadContainers: Error retrieving containers:", error);
      return []; // Return an empty array on error
  }
}

function createRuleElement(rule, containers) {
    const ruleDiv = document.createElement("div");
    ruleDiv.classList.add("rule");

    // 1. URL Pattern (Top Line)
    const urlPatternInput = document.createElement("input");
    urlPatternInput.type = "text";
    urlPatternInput.placeholder = "URL Regex (e.g., ^https://example\\.com.*)";
    urlPatternInput.classList.add("rule-pattern"); // Class for styling
    urlPatternInput.value = rule ? rule.urlPattern : "";
    ruleDiv.appendChild(urlPatternInput);

    // 2. Container Select (Bottom Left)
    const containerSelect = document.createElement("select");
    if (containers && containers.length > 0) { 
        containers.forEach(container => {
            const option = document.createElement("option");
            option.value = container.name;
            option.textContent = container.name;
            containerSelect.appendChild(option);
        });
    } else {
        const noContainersOption = document.createElement("option");
        noContainersOption.textContent = "No Containers Available";
        noContainersOption.disabled = true; 
        containerSelect.appendChild(noContainersOption);
    }
    if (rule) {
        containerSelect.value = rule.containerName;
    }
    ruleDiv.appendChild(containerSelect);

    // 3. Rule Name (Bottom Middle - To the right of dropdown)
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.placeholder = "Rule Name (Optional)";
    nameInput.classList.add("rule-name"); // Class for styling
    nameInput.value = (rule && rule.name) ? rule.name : "";
    ruleDiv.appendChild(nameInput);

    // 4. Delete Button (Bottom Right)
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete Rule";
    deleteButton.addEventListener("click", () => {
        ruleDiv.remove();
    });
    ruleDiv.appendChild(deleteButton);

    return ruleDiv;
}

async function loadRules() {
  const rulesContainer = document.getElementById("rulesContainer");
  if (!rulesContainer) {
    console.error("loadRules: rulesContainer not found!");
    return;
  }
  rulesContainer.innerHTML = ""; // Clear existing rules

  const containers = await loadContainers();
  if (containers.length === 0) {
      rulesContainer.textContent = "No containers found. Create some containers!";
      return;
  }

  try {
      const data = await browser.storage.sync.get("redirectRules");
      const rules = data.redirectRules || [];

      rules.forEach(rule => {
          const ruleElement = createRuleElement(rule, containers);
          rulesContainer.appendChild(ruleElement);
      });
  } catch (error) {
      console.error("loadRules: Error retrieving rules:", error);
  }
}

function saveRules() {
  const rulesContainer = document.getElementById("rulesContainer");
  if (!rulesContainer) {
    console.error("saveRules: rulesContainer not found!");
    return;
  }
  const ruleElements = rulesContainer.querySelectorAll(".rule");
  const rules = [];

  ruleElements.forEach(ruleElement => {
      // Updated selectors to use the specific classes added in createRuleElement
      const nameInput = ruleElement.querySelector(".rule-name");
      const urlPatternInput = ruleElement.querySelector(".rule-pattern");
      const containerSelect = ruleElement.querySelector("select");

      if(!nameInput || !urlPatternInput || !containerSelect) {
        console.warn("saveRules: input or select missing.");
        return;
      }

      const name = nameInput.value;
      const urlPattern = urlPatternInput.value;
      const containerName = containerSelect.value;

      // Only require urlPattern and containerName to be valid to save
      if (urlPattern && containerName) {
          rules.push({ name, urlPattern, containerName });
      } else {
         console.warn("saveRules: Skipping rule due to missing URL pattern or container name.");
      }
  });

  browser.storage.sync.set({ redirectRules: rules })
      .then(() => {
          const status = document.createElement('div');
          status.textContent = 'Options saved.';
          document.body.appendChild(status);
          setTimeout(() => { status.remove(); }, 2000);
      })
      .catch(error => console.error("saveRules: Error saving rules:", error));
}

document.getElementById("addRule").addEventListener("click", async () => {
   const rulesContainer = document.getElementById("rulesContainer");
  if (!rulesContainer) {
      console.error("addRule: rulesContainer not found!");
      return;
    }
  const containers = await loadContainers();
  const ruleElement = createRuleElement(null, containers); // Pass null for new rule
  rulesContainer.appendChild(ruleElement);
});

document.getElementById("saveRules").addEventListener("click", saveRules);

async function checkPermissions() {
  const hasPermissions = await browser.permissions.contains({
      origins: ["<all_urls>"]
  });

  if (!hasPermissions) {
      const warningDiv = document.createElement("div");
      warningDiv.style.backgroundColor = "yellow";
      warningDiv.style.padding = "10px";
      warningDiv.style.border = "1px solid black";
      warningDiv.innerHTML = `<b>Warning:</b> This extension requires the "Access your data for all websites" permission to function.  
        Please go to the Add-ons Manager (about:addons), find "Conductor", click the three dots, choose "Permissions", 
        and grant this permission.  Without it, the extension <b>will not work</b>.  
        <b>You will need to reload this page after granting the permission.</b>
        This permission is used *only* to match URLs against your *own* redirection rules.  
        No data is collected or transmitted.`;

      warningDiv.style.color = "black";
      document.body.insertBefore(warningDiv, document.body.firstChild);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await checkPermissions(); 
  await loadRules();
});