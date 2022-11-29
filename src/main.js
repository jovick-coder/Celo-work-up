import Web3 from "web3";
import { newKitFromWeb3 } from "@celo/contractkit";
import BigNumber from "bignumber.js";
import CELOWORKUP from "../contract/celoWorkUp.abi.json";
import IERC from "../contract/IERC.abi.json";

const ERC20_DECIMALS = 18;
const contractAddress = "0x4EbC9873769e6A54C2D7cf465C56C2Dad96C4C6B";
const cUSDContractAddress = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1";

let kit;
let contract;
let talentList = [];

// get DOM elements
let sections = document.querySelectorAll("section");
let navLinkUl = document.querySelector(".nav-link-ul");
let talentListDiv = document.querySelector("#talent-list");
let navLinks = navLinkUl.querySelectorAll("li");
let logoutButton = navLinkUl.querySelector("button");
let notification = document.querySelector(".notification");
let profileInformation = document.querySelector("#profile-information");

async function approve(_price) {
  const cUSDContract = new kit.web3.eth.Contract(IERC, cUSDContractAddress);

  const result = await cUSDContract.methods
    .approve(contractAddress, _price)
    .send({ from: kit.defaultAccount });
  return result;
}

// on page load
window.addEventListener("load", async () => {
  await connectCeloWallet();
  await getBalance();
  await getTalentList();

  // page navigation
  openPage(0);

  // check if account is already logged in
  const accountLogIn = window.localStorage.getItem("workUpTalentLogin");
  const profile = window.localStorage.getItem("workUpTalent");

  if (accountLogIn === "true" && profile !== undefined) {
    showNotification({
      header: "Welcome Back",
      description: "Your account was logged in",
    });
    handelLogin();
  }
});

// connect to celo wallet
const connectCeloWallet = async function () {
  if (window.celo) {
    try {
      await window.celo.enable();

      const web3 = new Web3(window.celo);
      kit = newKitFromWeb3(web3);

      const accounts = await kit.web3.eth.getAccounts();
      kit.defaultAccount = accounts[0];

      fillWalletAddressInput(accounts[0]);

      contract = new kit.web3.eth.Contract(CELOWORKUP, contractAddress);
    } catch (error) {
      showNotification({
        header: `Celo Error`,
        description: `${error}.`,
      });
      console.log(error);
    }
  } else {
    showNotification({
      header: `Celo Error`,
      description: `  Please install the CeloExtensionWallet.`,
    });
  }
};

// get celo wallet balance
const getBalance = async function () {
  const totalBalance = await kit.getTotalBalance(kit.defaultAccount);
  const cUSDBalance = totalBalance.cUSD.shiftedBy(-ERC20_DECIMALS).toFixed(2);
  document.querySelector("#balance").innerHTML = cUSDBalance + " <b>cUSD</b>";
};

// get list of talents from block
const getTalentList = async function () {
  const _talentListLength = await contract.methods.getTalentListLength().call();
  const _talentList = [];
  for (let i = 0; i < _talentListLength; i++) {
    let _talent = new Promise(async (resolve, reject) => {
      let talent = await contract.methods.getTalentList(i).call();

      resolve({
        owner: talent[0],
        name: talent[1],
        priceType: talent[2],
        level: talent[3],
        skills: talent[4],
        description: talent[5],
        password: talent[6],
        date: talent[7],
        price: new BigNumber(talent[8]),
        hireCount: talent[9],
      });
    });
    _talentList.push(_talent);
  }
  talentList = await Promise.all(_talentList);

  // console.log("talentList", talentList);
  mapTalent(talentList);
};

// page navigation function
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
function mapTalent(talentArray) {

  talentListDiv.innerHTML = "";
  document.querySelector(".loading-screen").style.display = "none";
  if (talentArray.length === 0) {
    return (talentListDiv.innerHTML = `
 <h3 class='text-center text-lg py-20'> No Talent Found</h3>
 `);
  }
  talentArray.map((talent, id) => {
    const {
      owner,
      name,
      skills,
      description,
      priceType,
      level,
      price,
      date,
      hireCount,
    } = talent;

    // conditionally generate button component
    const buttonComponent =
      owner === kit.defaultAccount
        ? `<div  class="text-green-600 ml-auto float-end">owner</div>`
        : `                          
              <button
              class="bg-green-600 text-white p-3 mt-2 ml-auto hire-talent-button float-end"
              >
                Hire for $${price}
              </button>
            `;

    // generate card component
    const cardComponent = `
          <div class="w-full py-12 lg:flex border border-gray-200" id="${id}">
            <div
            class="lg:border-gray-400 bg-white rounded-b lg:rounded-b-none lg:rounded-r flex flex-col justify-between leading-normal px-8 w-full"
            >
              <div class="mb-8">
                <div class="text-gray-900 font-bold text-xl">${name}</div>
                <div class="text-gray-900 font-bold">${skills}</div>
                  <p class="text-gray-700 text-base pt-0 pb-0">
                    <span class="text-black">Hired</span>
                    ${hireCount} times
                  </p>
                  <p class="text-gray-700 text-base pt-5 pb-2">
                    <span class="text-black">${priceType} Price-</span>
                    ${level} -Est budget $${price}
                  </p>
                  <p class="text-gray-700 text-base">${description}</p>
                </div>
                <div class="flex items-center">
                  <div class="text-sm">
                    <p class="text-gray-600">${date}</p>
                  </div>
                  ${buttonComponent}
              </div>
            </div>
          </div>
         `;

    //  render card component
    return (talentListDiv.innerHTML += cardComponent);
  });

  // get hire buttons
  let hireTalentButtons = document.querySelectorAll(".hire-talent-button");
  hireTalentButtons.forEach((talent, i) => {
    talent.addEventListener("click", () => hireTalent(i));
  });
}

// hire talent function
async function hireTalent(index) {
  // console.log(`ID${index}`, talentList[index]);
  const talent = talentList[index];
  showNotification({
    header: `Precessing Hire Talent ${talent.name}`,
    description: `Talent ${talent.name} is hired for ${talent.price}`,
  });
  try {
    await approve(talentList[index].price);
  } catch (error) {
    showNotification({
      header: `Celo Error`,
      description: `${error}.`,
    });
    console.log(error);
  }

  try {
    const result = await contract.methods
      .hireTalent(index)
      .send({ from: kit.defaultAccount });
    showNotification({
      header: `Hire Successful`,
      description: `You successfully Hire ${talentList[index].name}`,
    });
    getTalentList();
    getBalance();
  } catch (error) {
    showNotification({
      header: `Celo Error`,
      description: `${error}.`,
    });
    console.log(error);
  }
}

// show notification function
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

// hide notification function
function hideNotification() {
  notification.style.display = "none";
}

document.querySelector("#registration-form").addEventListener("submit", (e) => {
  // onsubmit run function
  handelRegistrationFormSubmission(e);
});

// register talent function
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

  // check for account duplicate
  talentList.forEach((talent) => {
    if (talent.owner === kit.defaultAccount) {
      return showNotification({
        header: "Registration Error",
        description:
          "Account duplicate detected, try login your previous account",
      });
    }

    // const newTalent = {
    //   address: formElement[0].value,
    //   name: formElement[1].value,
    //   priceType: formElement[2].value,
    //   level: formElement[4].value,
    //   skills: formElement[5].value,
    //   description: formElement[6].value,
    //   password: formElement[7].value,
    //   // date: dateFunction(),
    //   price: formElement[3].value,
    // };
    const newTalent = [
      formElement[1].value,
      formElement[2].value,
      formElement[4].value,
      formElement[5].value,
      formElement[6].value,
      formElement[7].value,
      dateFunction(),
      formElement[3].value,
    ];
    saveNewTalent(newTalent);
  });
}

// get current date function
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

// save talent profile function
async function saveNewTalent(newTalent) {
  try {
    const result = await contract.methods
      .registerTalent(...newTalent)
      .send({ from: kit.defaultAccount });
  } catch (error) {
    console.log(error);
    return showNotification({
      header: "Registration Error",
      description: `${error}.`,
    });
  }

  showNotification({
    header: "Registration Successful",
    description: "Account successfully created login account.",
  });
  // window.localStorage.setItem("workUpTalent", JSON.stringify(newTalent));
  getTalentList();
  openPage(2);
}

document.querySelector("#login-form").addEventListener("submit", (e) => {
  // onsubmit run function
  handelLoginFormSubmission(e);
});

function fillWalletAddressInput(address) {
  // auto fill wallet address on forms
  document.querySelectorAll(".wallet-address-input").forEach((addressInput) => {
    addressInput.value = address;
  });
}

// handel login function
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

  talentList.forEach((talent) => {
    if (
      talent.owner === kit.defaultAccount &&
      talent.password === formElement[1].value
    ) {
      showNotification({
        header: "Login successful",
        description: "Account successfully logged in",
      });
      window.localStorage.setItem("workUpTalentLogin", true);
      window.localStorage.setItem("workUpTalent", JSON.stringify(talent));
      handelLogin();
    } else {
      showNotification({
        header: "Login Error",
        description: "Invalid password try again",
      });
    }
  });
}

// render login state
function handelLogin() {
  navLinks[1].style.display = "none";
  navLinks[2].style.display = "none";
  navLinks[3].style.display = "block";
  logoutButton.style.display = "block";

  logoutButton.addEventListener("click", () => handelLogout());

  // fill Profile
  const profileDivElement = profileInformation.children;
  const profile = JSON.parse(window.localStorage.getItem("workUpTalent"));
  profileDivElement[0].innerHTML = profile.owner;
  profileDivElement[1].innerHTML = profile.name;
  profileDivElement[2].innerHTML = profile.skills;
  profileDivElement[3].innerHTML = profile.description;
  profileDivElement[4].innerHTML = profile.priceType;
  profileDivElement[5].innerHTML = profile.level;
  profileDivElement[6].innerHTML = `$${profile.price}`;
  profileDivElement[7].innerHTML = `${profile.hireCount} times`;
  profileDivElement[8].innerHTML = profile.date;

  openPage(0);
}

// handel Logout function
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

// get delete profile button
document
  .querySelector("#delete-account-button")
  .addEventListener("click", (e) => {
    const confirmPassword = prompt("Ender password to delete account");
    const profile = JSON.parse(window.localStorage.getItem("workUpTalent"));
    if (confirmPassword === "" || confirmPassword === null) return;
    if (confirmPassword !== profile.password) {
      return showNotification({
        header: "Action denied",
        description: "Confirm Password do not match profile password",
      });
    }
    talentList.forEach((talent, i) => {
      if (
        talent.owner === kit.defaultAccount &&
        talent.password === confirmPassword
      ) {
        //run delete account function
        deleteTalent(i);
      }
    });
  });

// delete account function
async function deleteTalent(index) {
  try {
    await contract.methods
      .deleteProfile(index)
      .send({ from: kit.defaultAccount });
  } catch (error) {
    console.log(error);
  } finally {
    handelLogout();
    localStorage.removeItem("workUpTalent");
    getTalentList();
  }
}

document.querySelector(".search-form").addEventListener("submit", e=>{
e.preventDefault()
const searchInput = e.target[0].value.toLowerCase()
const searchResult = []
if (searchInput === "") return

talentList.map(talent =>{
  if( 
    talent.name.toLowerCase().includes(searchInput) || 
    talent.skills.toLowerCase().includes(searchInput)|| 
    talent.description.toLowerCase().includes(searchInput)
    ){
searchResult.push(talent)
  }
})

// on search hide search button and show cancel button
e.target[1].style.display = "none"
e.target[2].style.display = "block"

e.target[2].addEventListener("click", () =>{
// on search cancel hide cancel button  and show search button
  e.target[0].value = ""
  e.target[1].style.display = "block"
  e.target[2].style.display = "none"
  
  mapTalent(talentList)
})

 e.target[0].addEventListener("input", () =>{
// on input change hide cancel button  and show search button
  e.target[1].style.display = "block"
  e.target[2].style.display = "none"
  
})

if (searchResult.length === 0){
 return (talentListDiv.innerHTML = `
 <h3 class='text-center text-lg py-20'> No Talent Found from Search </h3>
 `);
}

mapTalent(searchResult)
})