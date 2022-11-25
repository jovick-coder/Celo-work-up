const talentList = [
  {
    name: "John",
    skills: "FrontEnd Developer",
    description:
      "Immediate need-web research, I am seeking a professional to assist in web research and phone calls to create an excel sheet. Need to find companies in Romania make uniforms, especially for private securities companies and the army; for each company, I need the production manager's email contact.",
    priceType: "Fixed",
    level: "Entry level",
    price: "25",
    data: "Aug 18",
  },
  {
    name: "Paul",
    skills: "BackEnd Developer",
    description:
      "Immediate need-web research, I am seeking a professional to assist in web research and phone calls to create an excel sheet. Need to find companies in Romania make uniforms, especially for private securities companies and the army; for each company, I need the production manager's email contact.",
    priceType: "Fixed",
    level: "Senor level",
    price: "50",
    data: "Aug 18",
  },
];

let sections = document.querySelectorAll("section");
let navLinkUl = document.querySelector(".nav-link-ul");
let talentListDiv = document.querySelector("#talent-list");
let navLinks = navLinkUl.querySelectorAll("li");
let logoutButton = navLinkUl.querySelector("button");
let notification = document.querySelector(".notification");
let profileInformation = document.querySelector("#profile-information");

// page navigation
openPage(0);

function openPage(pageId) {
  navLinks.forEach((link, i) => {
    link.addEventListener("click", () => openPage(i));
    link.classList = " cursor-pointer m-2";
  });
  sections.forEach((page) => {
    page.style.display = "none";
  });
  sections[pageId].style.display = "block";
  navLinks[pageId].classList = "m-2 cursor-pointer text-green-600";
}

// map talents to DOM
mapTalent(talentList);
function mapTalent(talentArray) {
  // console.log();

  talentArray.map((talent, id) => {
    const { name, skills, description, priceType, level, price, data } = talent;
    const component = `
              <div class="w-full py-12 lg:flex border border-gray-200" id="${id}">
                <div
                  class="lg:border-gray-400 bg-white rounded-b lg:rounded-b-none lg:rounded-r flex flex-col justify-between leading-normal px-8">
                  <div class="mb-8">
                    <div class="text-gray-900 font-bold text-xl">${name}</div>
                    <div class="text-gray-900 font-bold">${skills}</div>
                    <p class="text-gray-700 text-base pt-5 pb-2">
                      <span class="text-black">${priceType} Price-</span>
                      ${level} -Est budget $${price}
                    </p>
                    <p class="text-gray-700 text-base">${description}</p>
                  </div>
                  <div class="flex items-center">
                    <div class="text-sm">
                      <p class="text-gray-600">${data}</p>
                    </div>
                    <button class="bg-green-600 text-white p-3 mt-2 ml-auto hire-talent-button">
                      Hire for $${price}
                    </button>
                  </div>
                </div>
              </div>
    `;
    // <p class="text-gray-900 leading-none">Jonathan Reinink</p>

    return (talentListDiv.innerHTML += component);
  });

  let hireTalentButtons = document.querySelectorAll(".hire-talent-button");
  hireTalentButtons.forEach((talent, i) => {
    talent.addEventListener("click", () => hireTalent(i));
  });
}

function hireTalent(id) {
  console.log(talentList[id]);
  const talent = talentList[id];
  showNotification({
    header: `Hire Talent ${talent.name}`,
    description: `Talent ${talent.name} is hired for ${talent.price}`,
  });
}
function showNotification(object) {
  let notificationHeader = notification.querySelector(".header");
  let notificationDescription = notification.querySelector(".description");
  let closeButton = notification.querySelector("button");

  notificationHeader.innerHTML = object.header;
  notificationDescription.innerHTML = object.description;
  notification.style.display = "block";
  closeButton.addEventListener("click", () => hideNotification());
  setTimeout(() => hideNotification(), 5000);
}
function hideNotification() {
  notification.style.display = "none";
}
// setInterval(showNotification, 1000);

document.querySelector("#registration-form").addEventListener("submit", (e) => {
  handelRegistrationFormSubmission(e);
});

function handelRegistrationFormSubmission(e) {
  e.preventDefault();

  const formElement = e.target;
  // form error handling
  if (formElement[0].value === "") {
    return showNotification({
      header: "Invalid wallet address",
      description: "Connect wallet before submission",
    });
  }
  if (formElement[1].value === "") {
    return showNotification({
      header: "Form Error",
      description: "Please enter a Name value before submission",
    });
  }
  if (formElement[2].value === "") {
    return showNotification({
      header: "Form Error",
      description: "Please Select a Price before submission",
    });
  }
  if (formElement[3].value === "") {
    return showNotification({
      header: "Form Error",
      description: "Please enter a Price value before submission",
    });
  }
  if (formElement[4].value === "") {
    return showNotification({
      header: "Form Error",
      description: "Please Select a Level before submission",
    });
  }
  if (formElement[5].value === "") {
    return showNotification({
      header: "Form Error",
      description: "Please Select a Skill before submission",
    });
  }
  if (formElement[6].value === "") {
    return showNotification({
      header: "Form Error",
      description: "Please enter a Description value before submission",
    });
  }
  if (formElement[7].value === "") {
    return showNotification({
      header: "Form Error",
      description: "Please enter a Password value before submission",
    });
  }

  const newTalent = {
    address: formElement[0].value,
    name: formElement[1].value,
    priceType: formElement[2].value,
    price: formElement[3].value,
    level: formElement[4].value,
    skills: formElement[5].value,
    description: formElement[6].value,
    password: formElement[7].value,
    date: dateFunction(),
  };
  saveNewTalent(newTalent);
}

function dateFunction() {
  var getDate = new Date();
  var monthsArray = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "June",
    "July",
    "Aug",
    "Sept",
    "Oct",
    "Nov",
    "Dec",
  ];

  return `${monthsArray[getDate.getMonth()]} ${getDate.getDate()}`;
}

function saveNewTalent(newTalent) {
  // console.log(newTalent);
  talentList.push(newTalent);
  showNotification({
    header: "Registration Successful",
    description: "Account successfully created login account.",
  });
  window.localStorage.setItem("workUpTalent", JSON.stringify(newTalent));
  openPage(2);
  mapTalent(talentList);
}

document.querySelector("#login-form").addEventListener("submit", (e) => {
  handelLoginFormSubmission(e);
});

function handelLoginFormSubmission(e) {
  e.preventDefault();

  const formElement = e.target;
  // form error handling
  if (formElement[0].value === "") {
    return showNotification({
      header: "Invalid wallet address",
      description: "Connect wallet before submission",
    });
  }
  if (formElement[1].value === "") {
    return showNotification({
      header: "Form Error",
      description: "Please enter Password value before submission",
    });
  }

  const profile = window.localStorage.getItem("workUpTalent");

  if (!profile) {
    showNotification({
      header: "Login Error",
      description: "Account not found, register new account",
    });
    return openPage(1);
  }
  if (formElement[1].value !== JSON.parse(profile).password) {
    return showNotification({
      header: "Login Error",
      description: "Invalid password reenter password",
    });
  }
  showNotification({
    header: "Login successful",
    description: "Account successfully logged in",
  });
  window.localStorage.setItem("workUpTalentLogin", true);

  handelLogin();
}

// check if account is already logged in
const accountLogIn = window.localStorage.getItem("workUpTalentLogin");
if (accountLogIn === "true") {
  showNotification({
    header: "Welcome Back",
    description: "Account successfully logged in",
  });
  handelLogin();
}

function handelLogin() {
  navLinks[1].style.display = "none";
  navLinks[2].style.display = "none";
  navLinks[3].style.display = "block";
  logoutButton.style.display = "block";

  logoutButton.addEventListener("click", () => handelLogout());

  const profileDivElement = profileInformation.children;
  const profile = JSON.parse(window.localStorage.getItem("workUpTalent"));
  profileDivElement[0].innerHTML = profile.address;
  profileDivElement[1].innerHTML = profile.name;
  profileDivElement[2].innerHTML = profile.skills;
  profileDivElement[3].innerHTML = profile.description;
  profileDivElement[4].innerHTML = profile.priceType;
  profileDivElement[5].innerHTML = profile.level;
  profileDivElement[6].innerHTML = profile.price;
  profileDivElement[7].innerHTML = profile.date;

  openPage(0);
}

function handelLogout() {
  let confirmLogout = confirm("You will be logged out of your account!!!");
  if (!confirmLogout) {
    return;
  }
  window.localStorage.setItem("workUpTalentLogin", false);
  navLinks[1].style.display = "block";
  navLinks[2].style.display = "block";
  navLinks[3].style.display = "none";
  logoutButton.style.display = "none";
  openPage(0);
}

document
  .querySelector("#delete-account-button")
  .addEventListener("click", (e) => {
    const confirmPassword = prompt("Ender password to delete account");
    const profile = JSON.parse(window.localStorage.getItem("workUpTalent"));

    if (confirmPassword !== profile.password) {
      return showNotification({
        header: "Action denied",
        description: "Confirm Password do not match profile password",
      });
    }
    handelLogout();
    localStorage.removeItem("workUpTalent");
  });
