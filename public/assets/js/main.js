function smartForm(form, cb) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const action = form.action || window.location.href;
    const method = form.method || "POST";

    try {
      const response = await fetch(action, {
        method: method,
        body: formData,
        credentials: "include",
        headers: {}
      });

      if (response.redirected) {
        window.location.href = response.url;
      } else {
        const data = await response.json();
        cb(data);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  });
}

function popError(msg) {
  console.error(msg);

  // TODO
  alert(msg);
}

function registerLoginOutButton() {
  const loginButton = document.getElementById("loginButton");
  const logoutButton = document.getElementById("logoutButton");

  window.user = fetch("/api/self", {
    credentials: "include",
  }).then(r => r.json());

  window.user.then(u => {
    if (u) {
      if (loginButton) loginButton.style.display = "none";
      console.log(u);
      if (logoutButton) logoutButton.querySelector("h3").innerText = `Logged in as ${u.username}`;
    } else {
      if (logoutButton) {
        logoutButton.style.display = "none";
      }
    };
  });
}

registerLoginOutButton();

function registerSearchField() {
  document.querySelector("#search > input").addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      document.querySelector("#search").submit();
      return false;
    }
  });
}
