VK.init({ apiId: 7870754 });

function auth() {
  return new Promise((resolve, reject) => {
    VK.Auth.login((data) => {
      if (data.session) {
        resolve();
      } else {
        reject(new Error("Не удалось авторизироваться"));
      }
    }, 2);
  });
}

function callApi(method, params) {
  params.v = "5.76";
  return new Promise((resolve, reject) => {
    VK.api(method, params, (data) => {
      if (data.error) {
        reject(data.error);
      } else {
        resolve(data.response);
      }
    });
  });
}

(async () => {
  try {
    await auth();
    const [me] = await callApi("users.get", { name_case: "gen" });
    const title = document.querySelector(".friends__title");
    title.textContent = `Друзья ${me.first_name} ${me.last_name}`;
    const friends = await callApi("friends.get", {
      fields: "city, country, photo_100",
    });
    const template = document.querySelector("#user-template").textContent;
    const render = Handlebars.compile(template);
    const html = render(friends);
    const results = document.querySelector(".friends__list");
    results.innerHTML = html;

    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("btn")) {
        const parent = e.target.closest(".friend");
        parent.remove();
      }
    });
  } catch (e) {
    console.error(e);
  }
})();
