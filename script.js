const inputs = document.querySelectorAll(".input");
const leftZone = document.querySelector(".friends--all");
const rightZone = document.querySelector(".friends--best");

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

let currentDrag;

function getCurrentZone(from) {
  return from.closest(".friends__list");
}

document.addEventListener("dragstart", (e) => {
  const zone = getCurrentZone(e.target);

  if (zone) {
    currentDrag = { startZone: zone, node: e.target.closest(".friend") };

    e.dataTransfer.setData("text/html", "...");
  }
});
document.addEventListener("dragover", (e) => {
  const zone = getCurrentZone(e.target);

  if (zone) {
    e.preventDefault();
  }
});
document.addEventListener("drop", (e) => {
  e.preventDefault();
  const zone = getCurrentZone(e.target);

  if (currentDrag) {
    if (zone && currentDrag.startZone !== zone) {
      if (
        e.target.classList.contains("friend__item") ||
        e.target.closest(".friend__item")
      ) {
        zone.appendChild(currentDrag.node);
      } else {
        zone.insertBefore(currentDrag.node, zone.lastElementChild);
      }
    }
    currentDrag = null;
  }
});

let friends = [];
let bestFriends = [];
let friendsFilterValue = "";
let bestFriendsFilterValue = "";

function moveFriend(friendsToRemove, friendsToAdd, friendId) {
  const friendIndex = friendsToRemove.findIndex(
    (friend) => friend.id === friendId
  );

  const deletedFriends = friendsToRemove.splice(friendIndex, 1);
  friendsToAdd.unshift(deletedFriends[0]);
}

function filterFriends(filterValue, friendsArr) {
  const filteredFriends = friendsArr.filter(
    (friend) =>
      friend.first_name.toLowerCase().includes(filterValue.toLowerCase()) ||
      friend.last_name.toLowerCase().includes(filterValue.toLowerCase())
  );
  return filteredFriends;
}

inputs.forEach((input) => {
  input.addEventListener("keyup", (e) => {
    if (e.target.closest(".friends").classList.contains("friends--best")) {
      bestFriendsFilterValue = e.target.value;
      render(
        filterFriends(bestFriendsFilterValue, bestFriends),
        ".friends--best"
      );
    } else {
      friendsFilterValue = e.target.value;
      render(filterFriends(friendsFilterValue, friends), ".friends");
    }
  });
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

    render(filterFriends(friendsFilterValue, friends), ".friends");
    render(
      filterFriends(bestFriendsFilterValue, bestFriends),
      ".friends--best"
    );
  }
});

function render(friendsArr, selector) {
  const template = document.querySelector("#user-template").textContent;
  const render = Handlebars.compile(template);
  const html = render({ items: friendsArr });
  const results = document.querySelector(`${selector} .friends__list`);
  results.innerHTML = html;
}

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
