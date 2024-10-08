import {
  auth,
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  addDoc,
  collection,
  db,
} from "./firebase.js";

async function signupFunc() {
  var email = document.getElementById("email");
  var password = document.getElementById("password");
  var fname = document.getElementById("fname");
  var lname = document.getElementById("lname");
  var error = document.getElementById("error");

  if (
    email.value === "" ||
    password.value === "" ||
    fname.value === "" ||
    lname.value === ""
  ) {
    // Validation error handling
    error.style.display = "block";
    // ... (your existing validation logic)
    return; // Exit the function if validation fails
  }

  try {
    // Create user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email.value,
      password.value
    );

    // User created successfully, now add to Firestore
    const fullName = `${fname.value} ${lname.value}`;
    const userObj = {
      fullName: fullName,
      email: email.value,
      // Don't store password in Firestore for security reasons
    };

    // Add user to Firestore
    const docRef = await addDoc(collection(db, "Users"), {
      ...userObj,
      userId: userCredential.user.uid, // Store the Firebase UID for reference
    });

    console.log("User added to Firestore with ID: ", docRef.id);

    // Redirect to home page
    window.location.assign("./index.html");
  } catch (Error) {
    if (Error.code === "auth/invalid-email") {
      error.style.display = "block";
      error.innerHTML = "* Invalid Email Address";
      email.style.border = "1px solid red";
    } else if (Error.code === "auth/email-already-in-use") {
      error.style.display = "block";
      error.innerHTML = "* Email already exists";
      email.style.border = "1px solid red";
    } else {
      // Handle other errors
      console.error("Signup error:", Error);
    }
  }
}

function loginFunc() {
  var email = document.getElementById("email");
  var password = document.getElementById("password");

  signInWithEmailAndPassword(auth, email.value, password.value)
    .then(function (success) {
      localStorage.setItem("userID", success.user.uid);
      localStorage.setItem("userEmail", success.user.email);
      window.location.replace("./home.html");
    })
    .catch(function (Error) {
      var error = document.getElementById("error");
      email.style.border = "1px solid red";
      password.style.border = "1px solid red";
      error.style.display = "block";
    });
}

window.addEventListener("load", function () {
  var userID = localStorage.getItem("userID");

  if (userID) {
    location.replace("./home.html");
    return;
  }
});

window.signupFunc = signupFunc;
window.loginFunc = loginFunc;
