// Remarquez les declaration de variable ci-dessous
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var modalLogin = false;
var token = null;
var btnLogin = document.querySelector(".btn-login");
btnLogin.addEventListener("click", function () {
    toggleModale();
    validateConnexion();
});
var disconect = function () {
    window.location.reload();
};
var headerCloser = document.querySelector("header");
headerCloser.addEventListener("click", function (e) {
    if (!e.target.closest("button")) {
        modalLogin = false;
        document.querySelector("main").classList.remove("blured");
        document.querySelector(".loginModal").classList.remove("active");
        document.querySelectorAll(".btn-view").forEach(function (btn) {
            btn.setAttribute("tabindex", "0");
            btn.classList.add("active");
        });
        document.querySelector("body").classList.remove("fixed");
        var recipeModal = document.querySelector(".recip-modal");
        recipeModal.classList.remove("active");
        recipeModal.classList.remove("add-recipe");
        recipeModal.innerHTML = "";
        document.querySelector("main").classList.remove("invisible");
    }
});
var btnCloseModale = document.querySelector(".close-modal");
btnCloseModale.addEventListener("click", function () {
    toggleModale();
});
function validateConnexion() {
    var loginInput = document.querySelector(".login");
    var passwordInput = document.querySelector(".password");
    var btnInscription = document.querySelector(".btn-inscription");
    var btnConnexion = document.querySelector(".btn-connection");
    if (loginInput.value.length > 2 && passwordInput.value.length > 2) {
        btnConnexion.setAttribute("tabindex", "0");
        btnConnexion.classList.add("active");
        btnInscription.setAttribute("tabindex", "0");
        btnInscription.classList.add("active");
        btnConnexion.addEventListener("click", connection);
        btnInscription.addEventListener("click", inscription);
    }
    else {
        btnConnexion.setAttribute("tabindex", "-1");
        btnConnexion.classList.remove("active");
        btnInscription.setAttribute("tabindex", "-1");
        btnInscription.classList.remove("active");
        btnConnexion.removeEventListener("click", connection);
        btnConnexion.removeEventListener("click", inscription);
    }
}
document.addEventListener("keyup", function () {
    validateConnexion();
});
function inscription() {
    return __awaiter(this, void 0, void 0, function () {
        var username, password, response, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    username = document.querySelector(".login").value;
                    password = document.querySelector(".password").value;
                    return [4 /*yield*/, fetch("http://localhost:3000/users/sign_up", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                username: username,
                                password: password,
                            }),
                        })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    if (response.ok) {
                        token = data.token;
                        toggleModale();
                        console.log(data.user);
                        show(token, data.user);
                        // Ci dessous nous ciblons le header et grace au ! nous precisons que cette balise existe bien dans le HTML
                        // Nous aurions put utiliser ? a la place ce qui signifi que si cette balise existe on lui ajoute la class connected
                        document.querySelector("header").classList.add("connected");
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function connection() {
    return __awaiter(this, void 0, void 0, function () {
        var username, password, response, data;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    username = document.querySelector(".login").value;
                    password = document.querySelector(".password").value;
                    return [4 /*yield*/, fetch("http://localhost:3000/users/log_in", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                username: username,
                                password: password,
                            }),
                        })];
                case 1:
                    response = _b.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _b.sent();
                    if (response.ok) {
                        token = data.token;
                        toggleModale();
                        show(token, data.user);
                        // Ci dessous vous voyez les syntaxes raccourci cité precedemment
                        // Ici nous affirmons que cette balise existe
                        document.querySelector("header").classList.add("connected");
                        data.user === "admin" &&
                            (
                            // Ici nous executons une action si la balise exxiste
                            (_a = document.querySelector("header")) === null || _a === void 0 ? void 0 : _a.classList.add("adminHeader"));
                        displayUsers(token);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
var btnLogout = document.querySelector(".btn-logout");
var header = document.querySelector("header");
btnLogout.addEventListener("click", function () {
    token = null;
    header.classList.remove("connected");
    header.classList.remove("adminHeader");
    document.querySelector("body").classList.remove("fixed");
    var recipeModal = document.querySelector(".recip-modal");
    recipeModal.classList.remove("active");
    recipeModal.classList.remove("add-recipe");
    recipeModal.innerHTML = "";
    document.querySelector("main").classList.remove("invisible");
    show(token, null);
});
function toggleModale() {
    modalLogin = !modalLogin;
    document.querySelector("main").classList.toggle("blured");
    document.querySelector(".loginModal").classList.toggle("active");
    document.querySelectorAll(".btn-view").forEach(function (btn) {
        modalLogin
            ? btn.setAttribute("tabindex", "-1")
            : btn.setAttribute("tabindex", "0");
        btn.classList.toggle("active");
    });
}
// Nous devons typer les variables attendu par notre fonction
// Nous pouvons aussi typer la valeur attendu en retour
function toggleFormRecipe(token, role) {
    document.querySelector(".add-recipe").addEventListener("click", function () {
        var recipeModal = document.querySelector(".recip-modal");
        recipeModal.classList.add("add-recipe");
        recipeModal.innerHTML = "\n    <h2>Ajoutez une recette</h2>\n    <div class=\"recipe-form\">\n      <form class=\"form-recipe\">\n              <input type=\"text\" name=\"title\" placeholder=\"Titre de la recette\" required>\n              <br>\n              <textarea name=\"description\" placeholder=\"Description de la recette\" required></textarea>\n              <br>\n              <div class=\"input-etape\">\n                <br>\n                <p>Etapes de la recette</p>\n                <textarea name=\"etapes\" placeholder=\"Etapes de la recette\" required></textarea>\n                <button type=\"button\" class=\"add-etape active\">  +  </button>\n              </div>\n              <br>\n              \n      </form>\n      <div class=\"upload-media\">\n              <p>(optionnel) Ajoutez une image ou une vid\u00E9o de votre recette</p>\n              <input type=\"file\" name=\"file\" accept=\".jpg, .jpeg, .gif, .webp, .mp4\">\n      </div>\n      </div>\n      <button type=\"button\" class=\"btn sendRecipe active\">Envoyer la recette</button>\n        ";
        document
            .querySelector(".add-etape")
            .addEventListener("click", function () {
            var inputEtape = document.querySelector(".input-etape");
            var newEtape = document.createElement("div");
            newEtape.innerHTML = "\n        <textarea class=\"etape-input\" name=\"etapes\" placeholder=\"Etapes de la recette\" required></textarea>\n        <button class=\"delete-etape-btn btn-recipe\">  -  </button>\n        ";
            newEtape.classList.add("one-etape");
            inputEtape.insertBefore(newEtape, document.querySelector(".add-etape"));
            newEtape.children[1].addEventListener("click", function () {
                inputEtape.removeChild(newEtape);
            });
        });
        recipeModal.classList.add("active");
        document.querySelector("body").classList.add("fixed");
        document.querySelector("main").classList.add("invisible");
        var closeRecipe = document.querySelector(".sendRecipe");
        closeRecipe.addEventListener("click", function () {
            return __awaiter(this, void 0, void 0, function () {
                var title, description, etapes, formData, recette, fileInput, response, data, recipeModal;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            title = document.querySelector('[name="title"]').value;
                            description = document.querySelector('[name="description"]').value;
                            etapes = Array.from(document.querySelectorAll('[name="etapes"]')).map(function (etape) { return etape.value; });
                            formData = new FormData();
                            if (title.length < 5 || description.length < 10 || etapes.length === 0) {
                                alert("Veuillez remplir tous les champs de la recette (titre, description, etapes)");
                                return [2 /*return*/];
                            }
                            recette = {
                                title: title,
                                description: description,
                                etapes: etapes,
                            };
                            formData.append("recette", JSON.stringify(recette));
                            fileInput = document.querySelector('[name="file"]');
                            if (fileInput.files && fileInput.files[0]) {
                                formData.append("file", fileInput.files[0]);
                            }
                            return [4 /*yield*/, fetch("http://localhost:3000/recettes", {
                                    method: "POST",
                                    headers: {
                                        Authorization: "Bearer " + token,
                                    },
                                    body: formData,
                                })];
                        case 1:
                            response = _a.sent();
                            return [4 /*yield*/, response.json()];
                        case 2:
                            data = _a.sent();
                            document.querySelector("body").classList.remove("fixed");
                            recipeModal = document.querySelector(".recip-modal");
                            recipeModal.classList.remove("active");
                            recipeModal.classList.remove("add-recipe");
                            recipeModal.innerHTML = "";
                            document.querySelector("main").classList.remove("invisible");
                            show(token, role);
                            return [2 /*return*/];
                    }
                });
            });
        });
    });
}
function show(token, role) {
    return __awaiter(this, void 0, void 0, function () {
        var response, _a, data;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    token !== null && toggleFormRecipe(token, role);
                    if (!(role === "admin")) return [3 /*break*/, 2];
                    return [4 /*yield*/, fetch("http://localhost:3000/recettes", {
                            headers: { Authorization: "Bearer " + token },
                        })];
                case 1:
                    _a = (response = _b.sent());
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, fetch("http://localhost:3000/recettes/validate")];
                case 3:
                    _a = (response = _b.sent());
                    _b.label = 4;
                case 4:
                    _a;
                    return [4 /*yield*/, response.json()];
                case 5:
                    data = _b.sent();
                    if (response.ok) {
                        document.querySelector(".recipe-grid").innerHTML = "";
                        data.forEach(function (recette) {
                            var card = document.createElement("article");
                            card.classList.add("recipe-card");
                            card.innerHTML = "\n        <div class=\"card\">\n          <img src=\"https://img.youtube.com/vi/".concat(recette.youtube !== null ? recette.youtube : "uOQapO-2awo", "/mqdefault.jpg\" alt=\"").concat(recette.title, "\" loading=\"lazy\">\n          ").concat(role === "admin"
                                ? "<div class=\"buttonSection\">\n                <button id=\"".concat(recette.status, "\" class=\"mini-btn visibility\" value=\"").concat(recette.id, "\">\n                  ").concat(recette.status === "visible"
                                    ? "<img class=\"eye\" value=\"visible\" src=\"./assets/eye.png\">"
                                    : "<img class=\"eye\" value=\"close\" src=\"./assets/noeye.png\">", "\n                </button>\n                <button class=\"mini-btn delette\" value=\"").concat(recette.id, "\"><img src=\"./assets/trash.png\">\n                </button>\n              </div>\n            ")
                                : "", "\n            <div class=\"card-content\">\n              <h3>").concat(recette.title, "</h3>\n              <p>").concat(recette.description, "</p>\n              <button class=\"btn active btn-view\" value=\"").concat(recette.id, "\">\n                Voir la recette\n              </button>\n            </div>\n          </div>\n      ");
                            document.querySelector(".recipe-grid").appendChild(card);
                            card.addEventListener("click", function (e) {
                                if (e.target.classList.contains("btn-view")) {
                                    document.querySelector(".recip-modal").innerHTML =
                                        "<article><h2>".concat(recette.title, "</h2>\n            <br>\n            <p>").concat(recette.description, "</p>\n            <br>\n            <ul>\n            ").concat(recette.etapes
                                            .map(function (etape) {
                                            return "<li>".concat(etape, "</li>");
                                        })
                                            .join(""), "\n            </ul>\n            <br>\n            <button class=\"btn closeRecip active\">Close</button>\n          </article>\n          <iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/").concat(recette.youtube, "\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen>\n          </iframe>");
                                    var recipeModal = document.querySelector(".recip-modal");
                                    recipeModal.classList.add("active");
                                    recipeModal.classList.remove("add-recipe");
                                    document.querySelector("body").classList.add("fixed");
                                    document.querySelector("main").classList.add("invisible");
                                    var closeRecipe = document.querySelector(".closeRecip");
                                    closeRecipe.addEventListener("click", function () {
                                        document.querySelector("body").classList.remove("fixed");
                                        var recipeModal = document.querySelector(".recip-modal");
                                        recipeModal.classList.remove("active");
                                        recipeModal.classList.remove("add-recipe");
                                        recipeModal.innerHTML = "";
                                        document.querySelector("main").classList.remove("invisible");
                                    });
                                }
                            });
                        });
                        if (role === "admin") {
                            listener();
                        }
                        else {
                            document.querySelector(".user-grid").innerHTML = "";
                        }
                    }
                    return [2 /*return*/];
            }
        });
    });
}
show(token, null);
// Dans la fonction ci-dessous nous DEVONS ! typer les elements HTML pour nous assurer de pouvoire acceder a leurs proprieté "value"
var listener = function () {
    document.querySelectorAll(".visibility").forEach(function (btn) {
        btn.addEventListener("click", function () {
            btn.id === "visible"
                ? changeVisibility(Number(btn.value), "validate")
                : changeVisibility(Number(btn.value), "visible");
        });
    });
    // Puisque nos fonctions deletteRecipe et promoteAdmin imposent un id de type number
    // nous devons transformer la value du type string au type number
    document.querySelectorAll(".delette").forEach(function (btn) {
        btn.addEventListener("click", function () {
            deletteRecipe(Number(btn.value), token);
        });
    });
    document.querySelectorAll(".btnAdmin").forEach(function (btn) {
        btn.addEventListener("click", function () {
            promoteAdmin(Number(btn.value), token);
        });
    });
};
function promoteAdmin(id, token) {
    return __awaiter(this, void 0, void 0, function () {
        var response, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch("http://localhost:3000/users/" + id, {
                        method: "PATCH",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: "Bearer " + token,
                        },
                    })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    if (response.ok) {
                        displayUsers(token);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function displayUsers(token) {
    return __awaiter(this, void 0, void 0, function () {
        var response, users;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch("http://localhost:3000/users", {
                        method: "GET",
                        headers: { Authorization: "Bearer " + token },
                    })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    users = _a.sent();
                    document.querySelector(".user-grid").innerHTML = "<h2>Utilisateurs</h2>";
                    if (response.ok) {
                        users.response.forEach(function (user) {
                            var card = document.createElement("article");
                            card.classList.add("user-card");
                            card.innerHTML = "<button value=\"".concat(user.id, "\" class=\"").concat(user.role, " btn active btnAdmin\"> ").concat(user.username).concat(user.role === "admin" ? "<span>👑</span>" : "", " </button>");
                            document.querySelector(".user-grid").appendChild(card);
                        });
                        listener();
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function deletteRecipe(id, token) {
    return __awaiter(this, void 0, void 0, function () {
        var response, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch("http://localhost:3000/recettes/" + id, {
                        method: "DELETE",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: "Bearer " + token,
                        },
                    })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    if (response.ok) {
                        show(token, "admin");
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function changeVisibility(id, visibility) {
    return __awaiter(this, void 0, void 0, function () {
        var response, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch("http://localhost:3000/recettes/" + id, {
                        method: "PATCH",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: "Bearer " + token,
                        },
                        body: JSON.stringify({
                            visible: visibility,
                        }),
                    })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    if (response.ok) {
                        show(token, "admin");
                    }
                    return [2 /*return*/];
            }
        });
    });
}
