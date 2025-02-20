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

  const urlPatternInput = document.createElement("input");
  urlPatternInput.type = "text";
  urlPatternInput.placeholder = "URL Regex (e.g., ^https://example\\.com.*)";
  urlPatternInput.value = rule ? rule.urlPattern : "";
  ruleDiv.appendChild(urlPatternInput);

  // Add a warning label:
  const regexWarning = document.createElement("p");
  regexWarning.textContent = "Warning: Use regular expressions carefully. Incorrect regex can break the extension or cause unexpected behavior.";
  regexWarning.style.color = "red";
  regexWarning.style.fontSize = "0.8em";
  ruleDiv.appendChild(regexWarning);

  const containerSelect = document.createElement("select");
  if (containers && containers.length > 0) { // Check if containers exist
      containers.forEach(container => {
          const option = document.createElement("option");
          option.value = container.name;
          option.textContent = container.name;
          containerSelect.appendChild(option);
      });
  } else {
      console.warn("createRuleElement: No containers provided.");
      const noContainersOption = document.createElement("option");
      noContainersOption.textContent = "No Containers Available";
      noContainersOption.disabled = true; // Disable the option
      containerSelect.appendChild(noContainersOption);

  }
  if (rule) {
      containerSelect.value = rule.containerName;
  }
  ruleDiv.appendChild(containerSelect);


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
      rulesContainer.textContent = "No containers found.  Create some containers!";
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
      const urlPatternInput = ruleElement.querySelector("input");
      const containerSelect = ruleElement.querySelector("select");

      if(!urlPatternInput || !containerSelect) {
        console.warn("saveRules: input or select missing.");
        return;
      }

      const urlPattern = urlPatternInput.value;
      const containerName = containerSelect.value;

      if (urlPattern && containerName) {
          rules.push({ urlPattern, containerName });
      }
    else{
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

      // Make the text black:
      warningDiv.style.color = "black";

      // Insert the warning at the top of the body:
      document.body.insertBefore(warningDiv, document.body.firstChild);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await checkPermissions(); //CHECK PERMISSIONS
  await loadRules();
});