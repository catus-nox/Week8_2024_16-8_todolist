function load(url) {
 return new Promise((resolve, reject) => {
  if (!url) {
   reject(new Error('URL is not provided'));
   return;
  }
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
   if (this.readyState === 4) {
    if (this.status === 200) {
     resolve(this.responseText);
    } else {
     reject(new Error('Failed to load: ' + url));
    }
   }
  };
  xhr.open('GET', url, true);
  xhr.send();
 });
}

let promisePagesInfo = [
 // { url: "/component/footer.html", pageName: "footer" },
 { url: "/component/header.html", pageName: "header" },

 { url: "/component/login.html", pageName: "login" },
 { url: "/component/register.html", pageName: "register" },
 { url: "/component/insidePage.html", pageName: "insidePage" }
]
//

let authorizationCode;
let insidePage_nickName;

//一開始頁面
let EnterWebsite = "login";
nowPage();

function nowPage() {
 promisePagesInfo.forEach((page) => {
  // 如果使用 Promise.all([]) .then可以多項載入
  load(page.url)
   .then((responsePage) => {
    // console.log(responsePage);
    let elementsGet = {
     body: document.getElementsByTagName("body")[0],
     header: document.getElementsByTagName("header")[0],
     main: document.getElementsByTagName("main")[0],
     // footer: document.getElementsByTagName("footer")[0],
     login: document.getElementsByClassName("login")[0],
     register: document.getElementsByClassName("register")[0],
     insidePage: document.getElementsByClassName("insidePage")[0],
    }

    elementsGet.main.classList = "";
    elementsGet.main.classList.add(EnterWebsite);

    if (page.pageName === EnterWebsite) {
     if (EnterWebsite != "insidePage") {
      elementsGet.body.classList = "";
      elementsGet["header"].innerHTML = '';
     }
     insidePage_nickName = "";
     elementsGet[page.pageName].innerHTML = responsePage;
     let itemElementsGet = [
      {
       elementName: "loginBtn",
       getElement: document.getElementById("login-btn"),
       nowPageName: "login",
       nextPageName: "register",
       reference: () => {
        checkLogin();
       }
      },
      {
       elementName: "loginPageBtn",
       getElement: document.getElementById("register-page-btn"),
       nowPageName: "login",
       nextPageName: "register",
       reference: (page) => {
        EnterWebsite = page.nextPageName;
        nowPage();
       }
      },
      {
       elementName: "registerBtn",
       getElement: document.getElementById("register-btn"),
       nowPageName: "register",
       nextPageName: "login",
       reference: () => {
        checkRegister();
       }
      },
      {
       elementName: "registerPageBtn",
       getElement: document.getElementById("login-page-btn"),
       nowPageName: "register",
       nextPageName: "login",
       reference: (page) => {
        EnterWebsite = page.nextPageName;
        nowPage();
       }
      }
     ];
     itemElementsGet.forEach((itemPage) => {
      if (itemPage.nowPageName === EnterWebsite) {
       itemPage.getElement.addEventListener("click", () => {
        itemPage.reference(itemPage);
       });
      }
     });
    } else if (EnterWebsite === "insidePage" && page.pageName === "header") {
     elementsGet.body.classList.add("inside-background-style");
     elementsGet[page.pageName].innerHTML = responsePage;
     let itemElementsGet2 = [
      {
       elementName: "logoutBtn",
       getElement: document.getElementById("logout-btn"),
       nowPageName: "insidePage",
       nextPageName: "login",
       reference: (page) => {
        EnterWebsite = page.nextPageName;
        checkLogout();
       }
      }
     ];
     let userNameGet = document.getElementById("user-name");
     userNameGet.innerHTML = insidePage_nickName + `的代辦`;
     itemElementsGet2.forEach((itemPage) => {
      if (itemPage.nowPageName === EnterWebsite) {
       itemPage.getElement.addEventListener("click", () => {
        itemPage.reference(itemPage);
       });
      }
     });
     getTodoListPageShow();
    }
   })
   .catch(error => {
    console.error('Error loading components:', error);
   });
 });
}

//-------------------

function checkLogin() {
 let formData = {
  loginEmail: document.getElementById("login-email").value,
  loginPassword: document.getElementById("login-password").value,
 };
 function validate({ loginEmail, loginPassword }) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (loginEmail === "") {
   alert("請輸入信箱");
   return false;
  }
  if (!emailRegex.test(loginEmail)) {
   alert("信箱格式錯誤，例：example@example.com");
   return false;
  }
  if (loginPassword === "") {
   alert("請輸入密碼");
   return false;
  }
  return true;
 }
 const validData = validate(formData);
 if (!validData) return;

 fetch('https://todoo.5xcamp.us/users/sign_in', {
  method: 'POST',
  headers: {
   'Accept': 'application/json',
   'Content-Type': 'application/json'
  },
  body: JSON.stringify(
   data = {
    user: {
     email: formData.loginEmail,
     password: formData.loginPassword
    }
   }
  )
 })
  // try
  // catch

  .then(response => {
   authorizationCode = response.headers.get("authorization");
   console.log(authorizationCode);
   if (response.status === 200) {
    alert("登入成功");
    loginState();
   }
   if (response.status === 401) {
    alert("電子信箱或密碼錯誤");
   }
   if (!response.ok) {
    throw new Error('Network response was not ok ' + response.statusText);
   }

   return response.json();
  })
  .then(data => {
   // console.log('checkLogin Success:', data);
   insidePage_nickName = data.nickname;
  })
  .catch(error => {
   console.error('There was a problem with the fetch operation:', error);
  });
}
function loginState() {
 fetch('https://todoo.5xcamp.us/check', {
  method: 'GET',
  headers: {
   'Accept': 'application/json',
   'authorization': authorizationCode
  }
 })
  .then(data => {
   // console.log('Success:', data);
   if (data.status === 200) {
    // alert("目前為登入狀態");
    EnterWebsite = "insidePage";
    nowPage();
   }

   if (data.status === 401) {
    alert("未授權");
   }
  })
  .catch(error => {
   console.error('There was a problem with the fetch operation:', error);
  });
}
function checkRegister() {
 let formData = {
  registerEmail: document.getElementById("register-email").value,
  nickName: document.getElementById("nick-name").value,
  registerPassword: document.getElementById("register-password").value,
  confirmPassword: document.getElementById("confirm-password").value,
 };

 function validate({ registerEmail, nickName, registerPassword, confirmPassword }) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^.{6,}$/;
  if (registerEmail === "") {
   alert("請輸入信箱");
   return false;
  }
  if (!emailRegex.test(registerEmail)) {
   alert("信箱格式錯誤，例：example@example.com");
   return false;
  }
  if (nickName === "") {
   alert("請輸入暱稱");
   return false;
  }
  if (registerPassword === "") {
   alert("請輸入密碼");
   return false;
  }
  if (!passwordRegex.test(registerPassword)) {
   alert("密碼字數太少，至少需要 6 個字");
   return false;
  }
  if (confirmPassword !== registerPassword) {
   alert("確認密碼錯誤，請重新輸入");
   return false;
  }
  return true;
 }
 let validData = validate(formData);
 if (!validData) return;

 fetch('https://todoo.5xcamp.us/users', {
  method: 'POST',
  headers: {
   'accept': 'application/json',
   'Content-Type': 'application/json'
  },
  body: JSON.stringify(
   data = {
    "user": {
     "email": formData.registerEmail,
     "nickname": formData.nickName,
     "password": formData.registerPassword
    }
   }
  )
 })
  .then(data => {
   console.log('Success:', data);

   if (data.status === 201) {
    alert("註冊成功");
    nowPage()
   }
   if (data.status === 422) {
    // alert("密碼 字數太少，至少需要 6 個字；電子信箱 格式有誤");
    alert("此信箱已註冊");
   }
  })
  .catch(error => {
   console.error('There was a problem with the fetch operation:', error);
  });
}
function checkLogout() {
 fetch('https://todoo.5xcamp.us/users/sign_out', {
  method: 'DELETE',
  headers: {
   'Accept': 'application/json',
   'authorization': authorizationCode
  }
 })
  .then(data => {
   // console.log('Success:', data);
   if (data.status === 200) {
    alert("登出成功");
    nowPage();
   }
   if (data.status === 401) {
    alert("登出失敗");
   }
  })
  .catch(error => {
   console.error('There was a problem with the fetch operation:', error);
  });
}

//-------------------

let todoStatusOption_valus = "all";


function getTodoListPageShow() {
 fetch('https://todoo.5xcamp.us/todos', {
  method: 'GET',
  headers: {
   'Accept': 'application/json',
   'authorization': authorizationCode
  }
 })
  .then(response => {
   if (response.status === 200) {
    // alert("自己的 TODO List");
   }
   if (response.status === 401) {
    alert("未授權");
   }
   if (!response.ok) {
    throw new Error('Network response was not ok ' + response.statusText);
   }
   return response.json();
  })
  .then(data => {
   // console.log('Success:', data);
   console.log(todoStatusOption_valus);
   isTodoListPageStatus(data);
   addListButtonClick();
   doTodoStatusOption_ClickButton();
   addTodoList_checkListButtonClickId(data);
   removeTodoList_closeListButtonClickId(data);
   removeTodoList_allListButtonClickId(data);
  })
  .catch(error => {
   console.error('There was a problem with the fetch operation:', error);
  });
}
//----------
function isTodoListPageStatus(data) {
 let controlGroupClass = document.querySelector(".insidePage section .controlGroup");
 let str = ``;
 let pageStatus = {
  empty: () => {
   controlGroupClass.classList.add("none-todo");
   str = `<p class="empty-text">目前尚無代辦事項</p>
  <img class="empty1" src="img/empty1.png" alt="img" />`;
  },
  unEmpty: () => {
   controlGroupClass.classList.remove("none-todo");
   let toBeCompleteItemQuantity = data.todos.filter((todo) => todo.completed_at === null).length;
   str = `
       <ul class="controlGroup-menu">
         ${controlGroupMenuStatus()}

       </ul>
       <form class="todilist-control-form">
         <div class="todilist-control-form-itemGroup">
          ${addTodoList_dataShow(data.todos)}
         </div>
         <div class="todilist-control-form-state">
           <p class="todilist-control-form-state-text">${toBeCompleteItemQuantity} 個待完成項目</p>
           <input id="clear-finish-list" type="button" value="清除已完成項目" />
         </div>
       </form>
   `;
  }
 }
 if (data.todos.length < 1) {
  pageStatus.empty()
 } else {
  pageStatus.unEmpty();
 }
 controlGroupClass.innerHTML = str;
}
function addTodoList_dataShow(todos) {
 let allTodoLists = ``;

 todos.forEach((todo) => {
  if (todoStatusOption_valus === "all") {
   allTodoLists += addTodoList_statueItemShow(todo)
  } else if (todoStatusOption_valus === "done" && todo.completed_at !== null) {
   allTodoLists += addTodoList_statueItemShow(todo)

  } else if (todoStatusOption_valus === "undone" && todo.completed_at === null) {
   allTodoLists += addTodoList_statueItemShow(todo)
  }
 });

 return allTodoLists;
}
function addTodoList_statueItemShow(todo) {
 let completed_at_statue = todo.completed_at !== null ? { class: "done", check: "checked" } : "";
 let completed_atStatueBtnImg = todo.completed_at === null ? `<div class="delmark"></div>` : "";
 let str = `
 <div class="todilist-control-form-item ${completed_at_statue.class}">
   <div class="todilist-control-form-item-in" id="${todo.id}">
     <label>
       <div>
         <span class="check-group">
         <input class="check-btn" type="checkbox" ${completed_at_statue.check}/>
         <span class="checkmark"></span>
         </span>
         ${todo.content}
       </div>
     </label>
     ${completed_atStatueBtnImg}
   </div>
 </div>
`;
 return str;
}
//----------
function addTodoList_checkListButtonClickId(data) {
 data.todos.forEach((todo) => {

  if (todoStatusOption_valus === "all") {
   let addListCheckButton = document.getElementById(todo.id).getElementsByClassName("check-btn")[0];
   addListCheckButton.addEventListener('click', () => setTodoList_statueDone(todo.id))
  } else if (todoStatusOption_valus === "done" && todo.completed_at !== null) {
   let addListCheckButton = document.getElementById(todo.id).getElementsByClassName("check-btn")[0];
   addListCheckButton.addEventListener('click', () => setTodoList_statueDone(todo.id))

  } else if (todoStatusOption_valus === "undone" && todo.completed_at === null) {
   let addListCheckButton = document.getElementById(todo.id).getElementsByClassName("check-btn")[0];
   addListCheckButton.addEventListener('click', () => setTodoList_statueDone(todo.id))
  }
 })
}
function setTodoList_statueDone(id) {
 fetch(`https://todoo.5xcamp.us/todos/${id}/toggle`, {
  method: 'PATCH',
  headers: {
   'Accept': 'application/json',
   // 'Content-Type': 'application/json',
   'authorization': authorizationCode
  }
 })

  .then(response => {
   if (response.status === 200) {
    // alert("該筆 TODO 資料");
    getTodoListPageShow();
   }
   if (response.status === 401) {
    alert("未授權");
   }
   if (!response.ok) {
    throw new Error('Network response was not ok ' + response.statusText);
   }

   return response.json();
  })
  .then(data => {
   // console.log('Success:', data);
  })
  .catch(error => {
   console.error('There was a problem with the fetch operation:', error);
  });

}
//----------
function controlGroupMenuStatus(params) {
 let controlGroupMenuStatus_all, controlGroupMenuStatus_done, controlGroupMenuStatus_undone = "";
 if (todoStatusOption_valus === "all") {
  controlGroupMenuStatus_all = "check"
 } else if (todoStatusOption_valus === "done") {
  controlGroupMenuStatus_done = "check"
 } else if (todoStatusOption_valus === "undone") {
  controlGroupMenuStatus_undone = "check"
 }

 return `
 <li class="all ${controlGroupMenuStatus_all}" value="all">全部</li>
 <li class="done ${controlGroupMenuStatus_done}" value="done">已完成</li>
 <li class="undone ${controlGroupMenuStatus_undone}" value="undone">未完成</li>
 `
}
//----------
function addListButtonClick() {
 const addListButton = document.getElementById('add-todolist-btn');
 addListButton.addEventListener('click', () => setTodoInputList())
}
function setTodoInputList() {
 const todoInput = document.getElementById('input-todolist').value;
 if (!todoInput) return;
 fetch('https://todoo.5xcamp.us/todos', {
  method: 'POST',
  headers: {
   'Accept': 'application/json',
   'Content-Type': 'application/json',
   'authorization': authorizationCode
  },
  body: JSON.stringify(
   data = {
    "todo": {
     "content": todoInput
    }
   }
  )
 })

  .then(response => {
   if (response.status === 201) {
    // alert("該筆 TODO 資料");
    loginState();
   }
   if (response.status === 401) {
    alert("未授權");
   }
   if (!response.ok) {
    throw new Error('Network response was not ok ' + response.statusText);
   }

   return response.json();
  })
  .then(data => {
   // console.log('Success:', data);
   getTodoListPageShow();
  })
  .catch(error => {
   console.error('There was a problem with the fetch operation:', error);
  });


}
//----------
function removeTodoStatusOptionClickButtonClass() {
 let optionButtons = document.querySelectorAll(".controlGroup-menu li");
 optionButtons.forEach((tag) => {
  tag.classList.remove("check");
 })
}
function doTodoStatusOption_ClickButton() {
 let optionButtons = document.querySelectorAll(".controlGroup-menu li");
 optionButtons.forEach((tag) => {
  tag.addEventListener('click', (event) => {
   removeTodoStatusOptionClickButtonClass();
   event.target.classList.add("check")
   todoStatusOption_valus = event.target.getAttribute("value");
   getTodoListPageShow()
  })
 })
}
//----------
function removeTodoList_closeListButtonClickId(data) {
 data.todos.forEach((todo) => {
  if (todoStatusOption_valus === "all" && todo.completed_at === null) {
   let removeListCheckButton = document.getElementById(todo.id).getElementsByClassName("delmark")[0];
   removeListCheckButton.addEventListener('click', () => setTodoList_statueUnDone(todo.id))
  } else if (todoStatusOption_valus === "done" && todo.completed_at === null) {
   return;
  } else if (todoStatusOption_valus === "undone" && todo.completed_at === null) {
   let removeListCheckButton = document.getElementById(todo.id).getElementsByClassName("delmark")[0];
   removeListCheckButton.addEventListener('click', () => setTodoList_statueUnDone(todo.id))
  }
 })
}
function setTodoList_statueUnDone(id) {
 fetch(`https://todoo.5xcamp.us/todos/${id}`, {
  method: 'DELETE',
  headers: {
   'Accept': 'application/json',
   // 'Content-Type': 'application/json',
   'authorization': authorizationCode
  }
 })

  .then(response => {
   if (response.status === 200) {
    // alert("該筆 TODO 資料");
    getTodoListPageShow();
   }
   if (response.status === 401) {
    alert("未授權");
   }
   if (!response.ok) {
    throw new Error('Network response was not ok ' + response.statusText);
   }

   return response.json();
  })
  .then(data => {
   // console.log('Success:', data);
  })
  .catch(error => {
   console.error('There was a problem with the fetch operation:', error);
  });

}
//----------
function removeTodoList_allListButtonClickId(data) {
 let allListButton = document.getElementById('clear-finish-list');

 data.todos.forEach((todo) => {
  if (todoStatusOption_valus === "all" && todo.completed_at !== null) {
   allListButton.addEventListener('click', () => setTodoList_statueUnDone(todo.id))
  } else if (todoStatusOption_valus === "done" && todo.completed_at !== null) {
   allListButton.addEventListener('click', () => setTodoList_statueUnDone(todo.id))
  } else if (todoStatusOption_valus === "undone" && todo.completed_at === null) {
   return;
  }
 })


}