const API_URL =
  https://script.google.com/macros/s/AKfycbzVE13tL1HrIoJELuI3xjQeTlxW7cBdIKiEWSyYT_PnKYFRi3mINo2qybIQTp6vNXGR/exec;


// ============================
// STATE
// ============================

let members = [];

let adminPin = sessionStorage.getItem(
  "aim_admin_pin"
);

let editingMemberId = null;


// ============================
// DOM
// ============================

const loading =
  document.getElementById("loading");

const rankingSection =
  document.getElementById("rankingSection");

const topThree =
  document.getElementById("topThree");

const rankingList =
  document.getElementById("rankingList");

const adminSection =
  document.getElementById("adminSection");

const adminMemberList =
  document.getElementById(
    "adminMemberList"
  );

const adminButton =
  document.getElementById("adminButton");

const refreshButton =
  document.getElementById("refreshButton");

const logoutButton =
  document.getElementById("logoutButton");

const loginModal =
  document.getElementById("loginModal");

const closeModal =
  document.getElementById("closeModal");

const loginForm =
  document.getElementById("loginForm");

const adminPinInput =
  document.getElementById("adminPin");

const loginError =
  document.getElementById("loginError");

const addMemberForm =
  document.getElementById(
    "addMemberForm"
  );

const memberName =
  document.getElementById("memberName");

const memberScore =
  document.getElementById("memberScore");

const editModal =
  document.getElementById("editModal");

const closeEditModal =
  document.getElementById(
    "closeEditModal"
  );

const editScoreForm =
  document.getElementById(
    "editScoreForm"
  );

const editScore =
  document.getElementById(
    "editScore"
  );

const editMemberName =
  document.getElementById(
    "editMemberName"
  );

const toast =
  document.getElementById("toast");


// ============================
// INIT
// ============================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    loadMembers();

    if (adminPin) {
      showAdmin();
    }

  }
);


// ============================
// GET MEMBERS
// ============================

async function loadMembers() {

  loading.classList.remove(
    "hidden"
  );

  rankingSection.classList.add(
    "hidden"
  );

  try {

    const response =
      await fetch(
        `${API_URL}?action=list&t=${Date.now()}`
      );

    const data =
      await response.json();

    if (!data.success) {
      throw new Error(
        data.message ||
        "データ取得に失敗しました。"
      );
    }

    members = data.members || [];

    renderRanking();

    if (adminPin) {
      renderAdminMembers();
    }

  } catch (error) {

    console.error(error);

    showToast(
      "ランキングの取得に失敗しました。"
    );

  } finally {

    loading.classList.add(
      "hidden"
    );

    rankingSection.classList.remove(
      "hidden"
    );
  }
}


// ============================
// RANKING
// ============================

function renderRanking() {

  const sorted =
    [...members].sort(
      (a, b) => b.score - a.score
    );

  renderTopThree(
    sorted.slice(0, 3)
  );

  renderRankingList(
    sorted.slice(3)
  );
}


// ============================
// TOP 3
// ============================

function renderTopThree(topMembers) {

  topThree.innerHTML = "";

  const medals = [
    "🥇",
    "🥈",
    "🥉"
  ];

  topMembers.forEach(
    (member, index) => {

      const card =
        document.createElement("div");

      card.className =
        "top-card";

      if (index === 0) {
        card.classList.add(
          "first"
        );
      }

      const rank =
        document.createElement("div");

      rank.className =
        "rank-number";

      rank.textContent =
        medals[index];

      const name =
        document.createElement("div");

      name.className =
        "top-name";

      name.textContent =
        member.name;

      const score =
        document.createElement("div");

      score.className =
        "top-score";

      score.textContent =
        formatScore(member.score);

      card.appendChild(rank);
      card.appendChild(name);
      card.appendChild(score);

      topThree.appendChild(card);

    }
  );
}


// ============================
// OTHER RANKINGS
// ============================

function renderRankingList(list) {

  rankingList.innerHTML = "";

  list.forEach(
    (member, index) => {

      const actualRank =
        index + 4;

      const item =
        document.createElement("div");

      item.className =
        "ranking-item";


      const rank =
        document.createElement("div");

      rank.className =
        "rank";

      rank.textContent =
        `#${actualRank}`;


      const name =
        document.createElement("div");

      name.className =
        "player-name";

      name.textContent =
        member.name;


      const score =
        document.createElement("div");

      score.className =
        "player-score";

      score.textContent =
        formatScore(member.score);


      item.appendChild(rank);
      item.appendChild(name);
      item.appendChild(score);

      rankingList.appendChild(item);

    }
  );
}


// ============================
// ADMIN LOGIN
// ============================

adminButton.addEventListener(
  "click",
  () => {

    if (adminPin) {

      adminSection.classList.toggle(
        "hidden"
      );

      if (
        !adminSection.classList.contains(
          "hidden"
        )
      ) {

        adminSection.scrollIntoView({
          behavior: "smooth"
        });

      }

      return;
    }

    loginModal.classList.remove(
      "hidden"
    );

    adminPinInput.focus();
  }
);


closeModal.addEventListener(
  "click",
  closeLoginModal
);


document
  .querySelector(
    "#loginModal .modal-overlay"
  )
  .addEventListener(
    "click",
    closeLoginModal
);


function closeLoginModal() {

  loginModal.classList.add(
    "hidden"
  );

  loginError.textContent = "";
}


// ============================
// LOGIN
// ============================

loginForm.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();

    const pin =
      adminPinInput.value.trim();

    if (!pin) {
      return;
    }

    loginError.textContent =
      "確認中...";

    try {

      const result =
        await postAction({
          action: "add",
          pin: pin,
          name: "__LOGIN_TEST__",
          score: 0,
          loginTest: true
        });

      /*
       * LOGIN_TESTは実際には追加しないよう
       * Apps Script側を変更する方法もありますが、
       * 今回は安全のため別途checkPin APIを使います。
       */

    } catch (error) {

      console.error(error);

    }

    // PIN検証専用
    try {

      const result =
        await verifyPin(pin);

      if (!result) {

        loginError.textContent =
          "管理PINが正しくありません。";

        return;
      }

      adminPin = pin;

      sessionStorage.setItem(
        "aim_admin_pin",
        pin
      );

      loginModal.classList.add(
        "hidden"
      );

      adminPinInput.value = "";

      showAdmin();

      showToast(
        "管理モードに入りました。"
      );

    } catch (error) {

      loginError.textContent =
        "ログインに失敗しました。";

    }

  }
);


// ============================
// VERIFY PIN
// ============================

async function verifyPin(pin) {

  const result =
    await postAction({
      action: "verify",
      pin: pin
    });

  return result.success === true;
}


// ============================
// SHOW ADMIN
// ============================

function showAdmin() {

  adminSection.classList.remove(
    "hidden"
  );

  renderAdminMembers();
}


// ============================
// LOGOUT
// ============================

logoutButton.addEventListener(
  "click",
  () => {

    adminPin = null;

    sessionStorage.removeItem(
      "aim_admin_pin"
    );

    adminSection.classList.add(
      "hidden"
    );

    showToast(
      "管理モードを終了しました。"
    );

  }
);


// ============================
// ADD MEMBER
// ============================

addMemberForm.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();

    const name =
      memberName.value.trim();

    const score =
      Number(memberScore.value);

    if (!name) {
      showToast(
        "メンバー名を入力してください。"
      );
      return;
    }

    if (
      !Number.isFinite(score) ||
      score < 0
    ) {

      showToast(
        "正しいスコアを入力してください。"
      );

      return;
    }

    const result =
      await postAction({
        action: "add",
        pin: adminPin,
        name: name,
        score: score
      });

    if (!result.success) {

      showToast(
        result.message
      );

      return;
    }

    memberName.value = "";
    memberScore.value = "";

    showToast(
      "メンバーを追加しました。"
    );

    await loadMembers();

  }
);


// ============================
// ADMIN MEMBER LIST
// ============================

function renderAdminMembers() {

  adminMemberList.innerHTML = "";

  const sorted =
    [...members].sort(
      (a, b) => b.score - a.score
    );

  if (sorted.length === 0) {

    const empty =
      document.createElement("p");

    empty.textContent =
      "まだメンバーが登録されていません。";

    empty.style.color =
      "var(--muted)";

    adminMemberList.appendChild(
      empty
    );

    return;
  }

  sorted.forEach(
    member => {

      const row =
        document.createElement("div");

      row.className =
        "admin-member";


      const name =
        document.createElement("div");

      name.className =
        "admin-member-name";

      name.textContent =
        member.name;


      const score =
        document.createElement("div");

      score.className =
        "admin-member-score";

      score.textContent =
        formatScore(member.score);


      const edit =
        document.createElement("button");

      edit.className =
        "edit-button";

      edit.textContent =
        "編集";

      edit.addEventListener(
        "click",
        () => openEditModal(member)
      );


      const deleteButton =
        document.createElement("button");

      deleteButton.className =
        "delete-button";

      deleteButton.textContent =
        "削除";

      deleteButton.addEventListener(
        "click",
        () => deleteMember(member)
      );


      row.appendChild(name);
      row.appendChild(score);
      row.appendChild(edit);
      row.appendChild(
        deleteButton
      );

      adminMemberList.appendChild(
        row
      );

    }
  );
}


// ============================
// EDIT SCORE
// ============================

function openEditModal(member) {

  editingMemberId =
    member.id;

  editMemberName.textContent =
    member.name;

  editScore.value =
    member.score;

  editModal.classList.remove(
    "hidden"
  );

  editScore.focus();
}


closeEditModal.addEventListener(
  "click",
  closeEdit
);


document
  .querySelector(
    "#editModal .modal-overlay"
  )
  .addEventListener(
    "click",
    closeEdit
);


function closeEdit() {

  editModal.classList.add(
    "hidden"
  );

  editingMemberId = null;

}


// ============================
// UPDATE SCORE
// ============================

editScoreForm.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();

    const score =
      Number(editScore.value);

    if (
      !Number.isFinite(score) ||
      score < 0
    ) {

      showToast(
        "正しいスコアを入力してください。"
      );

      return;
    }

    const result =
      await postAction({
        action: "update",
        pin: adminPin,
        id: editingMemberId,
        score: score
      });

    if (!result.success) {

      showToast(
        result.message
      );

      return;
    }

    closeEdit();

    showToast(
      "スコアを更新しました。"
    );

    await loadMembers();

  }
);


// ============================
// DELETE MEMBER
// ============================

async function deleteMember(member) {

  const confirmed =
    confirm(
      `${member.name} をランキングから削除しますか？`
    );

  if (!confirmed) {
    return;
  }

  const result =
    await postAction({
      action: "delete",
      pin: adminPin,
      id: member.id
    });

  if (!result.success) {

    showToast(
      result.message
    );

    return;
  }

  showToast(
    "メンバーを削除しました。"
  );

  await loadMembers();
}


// ============================
// POST API
// ============================

async function postAction(data) {

  const response =
    await fetch(
      API_URL,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "text/plain;charset=utf-8"
        },

        body: JSON.stringify(data)
      }
    );

  return await response.json();
}


// ============================
// REFRESH
// ============================

refreshButton.addEventListener(
  "click",
  async () => {

    refreshButton.textContent =
      "↻ 更新中...";

    await loadMembers();

    refreshButton.textContent =
      "↻ 更新";

  }
);


// ============================
// HELPERS
// ============================

function formatScore(score) {

  return Number(score)
    .toLocaleString(
      "ja-JP"
    );
}


function showToast(message) {

  toast.textContent =
    message;

  toast.classList.add(
    "show"
  );

  setTimeout(
    () => {
      toast.classList.remove(
        "show"
      );
    },
    2500
  );
}
