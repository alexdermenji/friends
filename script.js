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

function moveFriend(friendsToRemove, friendsToAdd, friendId) {
  const friendIndex = friendsToRemove.findIndex(
    (friend) => friend.id === friendId
  );

  const deletedFriends = friendsToRemove.splice(friendIndex, 1);
  friendsToAdd.unshift(deletedFriends[0]);
}

const input = document.querySelector(".input");

input.addEventListener("keyup", (e) => {
  // TODO: check e.target.closest(".friends").classList.contains("friends--best")
  // TODO: move to separate function
  const filteredFriends = friends.filter(
    (friend) =>
      friend.first_name.toLowerCase().includes(e.target.value.toLowerCase()) ||
      friend.last_name.toLowerCase().includes(e.target.value.toLowerCase())
  );
  console.log(friends);
  render(filteredFriends, "");
});

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("btn")) {
    const parent = e.target.closest(".friend");
    const friendId = +parent.getAttribute("data-id");
    if (e.target.closest(".friends").classList.contains("friends--best")) {
      moveFriend(bestFriends, friends, friendId);
    } else {
      moveFriend(friends, bestFriends, friendId);
    }

    // TODO: ??? apply filter on friends and bestFriends
    render(friends, "");
    render(bestFriends, ".friends--best");
  }
});

function render(friendsArr, selector) {
  const template = document.querySelector("#user-template").textContent;
  const render = Handlebars.compile(template);
  const html = render({ items: friendsArr });
  const results = document.querySelector(`${selector} .friends__list`);
  results.innerHTML = html;
}

let friends = [];
let bestFriends = [];

(async () => {
  try {
    await auth();
    const [me] = await callApi("users.get", { name_case: "gen" });
    const title = document.querySelector(".friends__title");
    title.textContent = `Друзья ${me.first_name} ${me.last_name}`;
    const friendsApi = await callApi("friends.get", {
      fields: "city, country, photo_100",
    });
    friends = friendsApi.items;
    render(friends, "");
  } catch (e) {
    console.error(e);
  }
})();
