let modalLogin = false;
let token;

document.querySelector(".btn-login").addEventListener("click", function () {
  toggleModale();
  validateConnexion();
});

document.querySelector(".close-modal").addEventListener("click", function () {
  toggleModale();
});

function validateConnexion() {
  if (
    document.querySelector(".login").value.length > 2 &&
    document.querySelector(".password").value.length > 2
  ) {
    document.querySelector(".btn-connection").setAttribute("tabindex", "0");
    document.querySelector(".btn-connection").classList.add("active");
    document.querySelector(".btn-insciption").setAttribute("tabindex", "0");
    document.querySelector(".btn-insciption").classList.add("active");
    document
      .querySelector(".btn-connection")
      .addEventListener("click", connection);
    document
      .querySelector(".btn-insciption")
      .addEventListener("click", inscription);
  } else {
    document.querySelector(".btn-connection").setAttribute("tabindex", "-1");
    document.querySelector(".btn-connection").classList.remove("active");
    document.querySelector(".btn-insciption").setAttribute("tabindex", "-1");
    document.querySelector(".btn-insciption").classList.remove("active");
    document
      .querySelector(".btn-connection")
      .removeEventListener("click", connection);
    document
      .querySelector(".btn-insciption")
      .removeEventListener("click", inscription);
  }
}

document.addEventListener("keyup", function () {
  validateConnexion();
});

async function inscription() {
  const response = await fetch("http://localhost:3000/users/sign_up", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: document.querySelector(".login").value,
      password: document.querySelector(".password").value,
    }),
  });
  const data = await response.json();
  if (response.ok) {
    token = data.token;
    toggleModale();
    show(token, data.user);
    document.querySelector("header").classList.add("connected");
  }
}

async function connection() {
  const response = await fetch("http://localhost:3000/users/log_in", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: document.querySelector(".login").value,
      password: document.querySelector(".password").value,
    }),
  });
  const data = await response.json();

  if (response.ok) {
    token = data.token;
    toggleModale();
    show(token, data.user);
    document.querySelector("header").classList.add("connected");
    data.user === "admin" &&
      document.querySelector("header").classList.add("adminHeader");
    displayUsers(token);
  }
}

document.querySelector(".btn-logout").addEventListener("click", function () {
  token = null;
  document.querySelector("header").classList.remove("connected");
  document.querySelector("header").classList.remove("adminHeader");
  role = "";
  show(token);
});

function toggleModale() {
  modalLogin = !modalLogin;
  document.querySelector("main").classList.toggle("blured");
  document.querySelector(".loginModal").classList.toggle("active");
  document.querySelectorAll(".btn-view").forEach((btn) => {
    modalLogin
      ? btn.setAttribute("tabindex", "-1")
      : btn.setAttribute("tabindex", "0");
    btn.classList.toggle("active");
  });
}

async function show(token, role) {
  let response;
  role === "admin"
    ? (response = await fetch("http://localhost:3000/recettes", {
        headers: { Authorization: "Bearer " + token },
      }))
    : (response = await fetch("http://localhost:3000/recettes/validate"));
  const data = await response.json();
  if (response.ok) {
    document.querySelector(".recipe-grid").innerHTML = "";
    data.forEach((recette) => {
      const card = document.createElement("article");
      card.classList.add("recipe-card");
      card.innerHTML = `
                <div class="card">
                    <img src="https://img.youtube.com/vi/${recette.youtube}/mqdefault.jpg" alt="${recette.title}" loading="lazy">
                   ${
                     role === "admin"
                       ? `<div class="buttonSection">
  <button id="${recette.status}" class="mini-btn visibility" value="${recette.id}">
    ${
      recette.status === "visible"
        ? `<img class="eye" value="visible" src="./assets/eye.png">`
        : `<img class="eye" value="close" src="./assets/noeye.png">`
    }
  </button>
  <button class="mini-btn delette" value="${recette.id}"><img src="./assets/trash.png"></button></div>
`
                       : ""
                   }
                <div class="card-content">
                    <h3>${recette.title}</h3>
                    <p>${recette.description}</p>

                        <button class="btn active btn-view" value="${recette.id}">
                            Voir la recette
                        </button>

                </div>
                </div>
            `;
      document.querySelector(".recipe-grid").appendChild(card);
      card.addEventListener("click", function (e) {
        document.querySelector(".recip-modal").innerHTML =
          `<p>${recette.title}</p>`;
        document.querySelector(".recip-modal").classList.add("active");
        console.log(e.target.value);
      });
    });

    if (role === "admin") {
      listener();
    } else {
      document.querySelector(".user-grid").innerHTML = "";
    }
  }
}
show(token, "none");

const listener = function () {
  document.querySelectorAll(".visibility").forEach((btn) => {
    btn.addEventListener("click", function () {
      btn.id === "visible"
        ? changeVisibility(btn.value, "validate")
        : changeVisibility(btn.value, "visible");
    });
  });
  document.querySelectorAll(".delette").forEach((btn) => {
    btn.addEventListener("click", function () {
      deletteRecipe(btn.value, token);
    });
  });
  document.querySelectorAll(".btnAdmin").forEach((btn) => {
    btn.addEventListener("click", function () {
      promoteAdmin(btn.value, token);
    });
  });
};

async function promoteAdmin(id, token) {
  const response = await fetch("http://localhost:3000/users/" + id, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  });
  const data = await response.json();
  console.log("pouet");
  if (response.ok) {
    displayUsers(token);
  }
}
async function displayUsers(token) {
  const response = await fetch("http://localhost:3000/users", {
    method: "GET",
    headers: { Authorization: "Bearer " + token },
  });
  const users = await response.json();
  document.querySelector(".user-grid").innerHTML = "<h2>Utilisateurs</h2>";
  if (response.ok) {
    users.response.forEach((user) => {
      const card = document.createElement("article");
      card.classList.add("user-card");
      card.innerHTML = `<button value="${user.id}" class="${user.role} btn active btnAdmin"> ${user.username}${user.role === "admin" ? "<span>👑</span>" : ""} </button>`;
      document.querySelector(".user-grid").appendChild(card);
    });
    listener();
  }
}

async function deletteRecipe(id, token) {
  const response = await fetch("http://localhost:3000/recettes/" + id, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  });
  const data = await response.json();
  if (response.ok) {
    show(token, "admin");
  }
}

async function changeVisibility(id, visibility) {
  const response = await fetch("http://localhost:3000/recettes/" + id, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({
      visible: visibility,
    }),
  });
  const data = await response.json();

  if (response.ok) {
    show(token, "admin");
  }
}
