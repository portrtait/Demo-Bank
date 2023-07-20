'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/* Data for Section 11
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];
*/

// Section 12. DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2023-07-14T17:01:17.194Z',
    '2023-07-17T23:36:17.929Z',
    '2023-07-19T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2023-07-18T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

// ----- ELEMENTS -----

// Numbers, dates
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

// Containers
const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

// Buttons
const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

// Input spaces
const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

// Format movement dates neatly [lecture 177+178]
const formatMovementDate = function (date, locale) {
  // Calculate how many days passed between today and the current movement (in days)
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date1 - date2) / (1000 * 60 * 60 * 24));
  const daysPassed = calcDaysPassed(new Date(), date);

  // Several options for the display (today, yesterday, week ago and just date)
  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  // Display in the format the 'locale' of this account is in
  return new Intl.DateTimeFormat(locale).format(date);
};

// Formats a number to display at the required currency format
const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

// Display movements array in the application [lecture 147]
const displayMovements = function (acc, sort = false) {
  //clear containerMovements from previous content
  containerMovements.innerHTML = '';

  // In this "display" function, we either use sorted array or original usual array.
  // It all depends on the "sort" boolean in the parameter of this function. This boolean is for the "Sort" button and "sort" function.
  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  //iterate through 'movements' array
  movs.forEach(function (mov, i) {
    // Determine type of the element
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    // Display the date when the movement occured (in the 'locale' congiguration of the account)
    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.locale);

    // Format a movement according to its locale and currency
    const formattedMov = formatCur(mov, acc.locale, acc.currency);

    //body of the html code to insert - main action of this function
    const html = `
    <div class="movements__row">
      <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
      <div class="movements__date">${displayDate}</div>
      <div class="movements__value">${formattedMov}</div>
    </div>`;

    //insert HTML element at each iteration of this array AND locate each element of the array on top of previous elements
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

// Displaying balance for the account [lecture 153]
const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0); //count up sum in the movements array
  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency); //display formatted number via DOM
};

// Display summary: total deposits, total withdrawals, total interest [lecture 155]
const calcDisplaySummary = function (acc) {
  // Calculate and display total deposits
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency); //display formatted number via DOM

  // Calculate and display total withdrawals
  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCur(Math.abs(out), acc.locale, acc.currency); //display formatted number via DOM

  // Calculate and display total interest
  const interests = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      //console.log(arr[i]);  //displays every array element
      return int >= 1;
    })
    .reduce((acc, interest) => acc + interest, 0);
  labelSumInterest.textContent = formatCur(interests, acc.locale, acc.currency); //display formatted number via DOM
};

// Creating Usernames [lecture 151]
const createUsernames = function (accs) {
  //for each object inside the array do the following
  accs.forEach(function (acc) {
    acc.username = acc.owner //for each object create new property 'username'
      .toLowerCase() //Steve Jobs --> steve jobs
      .split(' ') //steve jobs --> [steve, jobs]
      .map(name => name[0]) //[steve, jobs] --> [s, j]
      .join(''); //[s, j] --> sj
  });
};
createUsernames(accounts); // calling the function on accounts array
// console.log(accounts); // displaying array contents

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

// Function to log out after 5min
const startLogOutTimer = function () {
  const tick = function () {
    // Calculate min and sec from time
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);

    // In each call, display the remaining time
    labelTimer.textContent = `${min}:${sec}`;

    // When 0 seconds, stop timer and log out user
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Log in to get started';
      containerApp.style.opacity = 0;
    }

    // Decrease 1s
    time--;
  };

  // Set time to 5 mins
  let time = 300;

  // Call the timer every second
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

/////////////////////////////////////////////////////////////////////////////
// Event handlers

// temp var to hold account in the function below. we need it in global scope
let currentAccount, timer;

alert(
  'This website has only 2 accounts:\n\n1.\nUSERNAME: js\nPIN: 1111\n\n2.\nUSERNAME: jd\nPIN: 2222'
);

// FAKE ALWAYS LOGGED IN
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;

// Log in the user and show its UI (movements, balance, summary) [lecture 158]
btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting instantly
  e.preventDefault();
  // console.log('LOGIN array button pressed'); //temp line

  // Find account
  currentAccount = accounts.find(
    // First, check if username matches
    acc => acc.username === inputLoginUsername.value
  );
  // console.log(currentAccount); //temp line

  // Second, check if PIN is correct
  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // Display UI and welcome message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0] // Get first name from the object
    }`;
    containerApp.style.opacity = 100; //Show UI (turn opacity from 0 to 100)

    // Create current date and time using API
    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    };

    // Display current date and time using API
    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    // At every log in action, start timer
    if (timer) clearInterval(timer);
    timer = startLogOutTimer();

    // Update UI
    updateUI(currentAccount);
  }
});

// Transfer money [lecture 159]
btnTransfer.addEventListener('click', function (e) {
  // Prevents from default behavior (reloading the page when button is clicked)
  e.preventDefault();
  // console.log('btnTransfer was pressed');

  // Reading the amount to transfer
  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    //searching for a matching object in array via username
    acc => acc.username === inputTransferTo.value
  );

  // Clearing inputs after usage
  inputTransferAmount.value = inputTransferTo.value = '';

  // Do the money transfer
  if (
    amount > 0 &&
    receiverAcc && //does the receiver account exist?
    currentAccount.balance >= amount && //is the balance enough for money transfer?
    receiverAcc?.username !== currentAccount.username //are we transferring money to ourselves?
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount); //decrease own balance
    receiverAcc.movements.push(amount); //increase receiver balance

    // Add transfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    // Update UI after a transfer took place: (movements window, summary, balance)
    updateUI(currentAccount);

    //Reset timer {because an action was done (action: transfer)}
    clearInterval(timer);
    timer = startLogOutTimer();
  }
});

// Loan function [lecture 161]
btnLoan.addEventListener('click', function (e) {
  // Prevent default behavior, which is instantly reloading the page
  e.preventDefault();

  // Reading the value from the form. Making it a whole number without digits.
  const amount = Math.floor(inputLoanAmount.value);

  // Amount should be > 0 AND there must exist a movement which is larger than 10% of this new loan.
  // Otherwise, loan is not permissible and is just denied.
  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    // The UI will be updated in 2.5seconds via this setTimeout() function
    setTimeout(function () {
      // Insert the loan into movements array of this account
      currentAccount.movements.push(amount);

      // Add loan date
      currentAccount.movementsDates.push(new Date().toISOString());

      // Update UI (movements window, summary, balance)
      updateUI(currentAccount);

      //Reset timer {because an action was done (action: transfer)}
      clearInterval(timer);
      timer = startLogOutTimer();
    }, 2500);
  }

  // Clear the input field {after every click}
  inputLoanAmount.value = '';
});

// Deleting account [lecture 160]
btnClose.addEventListener('click', function (e) {
  // Prevent the page from automatically reloading
  e.preventDefault();
  console.log('Delete button pressed'); //temp line

  // Check whether login and PIN are correct. If yes, we delete.
  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    // 1. Find the index of this account in the original accounts array
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );

    // 2. Delete the account from the original array
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  // Clean the input form
  inputCloseUsername.value = inputClosePin.value = '';
});

// We need this variable for the logic of the function below
let sorted = false;

// Sorting movements [lecture 163]
btnSort.addEventListener('click', function (e) {
  // Prevent the page from automatically reloading
  e.preventDefault();

  // Call the displayMovements with the boolean being different each time
  displayMovements(currentAccount.movements, !sorted);

  //change the boolean between "sorted = true" and "sorted = false" at every click
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

/////////////////////////////////////////////////

// setIntervall(function () {
//   const now = new Date();
//   const hour = `${now.getHours()}`.padStart(2, 0);
//   const min = `${now.getMinutes()}`.padStart(2, 0);
//   const sec = `${now.getSeconds()}`.padStart(2, 0);
//   // 'abc'.padStart(10, "foo");  // "foofoofabc"
//   console.log(`${hour}:${min}:${sec}`);
// }, 1000);
