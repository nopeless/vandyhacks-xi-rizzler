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

/**
 * Returns raw html
 */
function createStarRating(rating) {
  rating = Math.max(0, Math.min(10, rating));

  const fullStars = Math.floor(rating / 2);
  const halfStars = rating % 2;
  const emptyStars = 5 - fullStars - halfStars;

  let starsHtml = "";

  for (let i = 0; i < fullStars; i++) {
    starsHtml += "<i class=\"fas fa-star\"></i>";
  }

  for (let i = 0; i < halfStars; i++) {
    starsHtml += "<i class=\"fas fa-star-half-alt\"></i>";
  }

  for (let i = 0; i < emptyStars; i++) {
    starsHtml += "<i class=\"far fa-star\"></i>";
  }

  return `<div class="star-rating">${starsHtml}</div>`;
}

async function fixJoinAnchor() {
  if (await window.user) {
    const anchors = document.querySelectorAll("a[href=\"/sign-up\"]");

    [...anchors].forEach(
      a => {
        a.href = "/user";
        a.innerText = "My Page";
      }
    );
  }
}

fixJoinAnchor();
