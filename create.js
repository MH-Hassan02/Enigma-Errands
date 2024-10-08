import {
    db,
    storage,
    getFirestore,
    collection,
    addDoc,
    getDocs,
    doc,
    deleteDoc,
    getDoc,
    updateDoc,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    ref,
    getDownloadURL,
    uploadBytes,
} from "./firebase.js"

var pageWidth = window.innerWidth

window.addEventListener('resize', function () {
    pageWidth = window.innerWidth
});

var menuHide = false
var idValue = ""
var myBlogArr = []

var userID = localStorage.getItem("userID");
var userEmail = localStorage.getItem("userEmail")
var parent = document.getElementById("parent")
var mainContent = document.getElementById("mainContent")
var toggle = document.getElementById("toggle")
var menuPane = document.getElementById("menuPane")
var taskDetails = document.getElementById("taskDetails")
var descTextArea = document.getElementById("descTextArea")
var titleTextarea = document.getElementById("titleTextarea")
var overlay = document.getElementById("overlay")
var blogType = document.getElementById("blogType")

const today = new Date();
document.getElementById('dateInput').valueAsDate = today;
const formattedDateString = today.toLocaleDateString('en-GB');

function showTaskDetails() {
    descTextArea.value = ""
    titleTextarea.value = ""

    if (menuHide === true) {
        taskDetails.style.display = "flex"
        mainContent.style.width = "55%"
    } else {
        taskDetails.style.display = "flex"
        mainContent.style.width = "45%"
    }

    if (pageWidth < 768) {
        taskDetails.style.width = "80%"
        taskDetails.style.position = "absolute"
        overlay.style.display = "block"
    } else if (pageWidth > 1920) {
        taskDetails.style.width = "18%"
    } else
        taskDetails.style.width = "25%"
    taskDetails.style.position = "fixed"
}

function hideTaskDetails() {
    overlay.style.display = "none"
    if (menuHide === true) {
        taskDetails.style.display = "none"
        mainContent.style.width = "80%"

    }
    else {
        taskDetails.style.display = "none"
        mainContent.style.width = "70%"
    }
}

function hideMenu() {
    var toggle = document.getElementById("toggle")
    menuPane.style.display = "none"
    toggle.style.display = "block"
    mainContent.style.width = "80%"
    mainContent.style.left = "10%"
    menuHide = true
}

function showMenu() {
    menuPane.style.display = "block"
    toggle.style.display = "none"
    mainContent.style.width = "70%"
    mainContent.style.left = "25%"
    menuHide = false
    if (pageWidth < 768) {
        menuPane.style.width = "60%"
    } else if (pageWidth > 1920) {
        menuPane.style.width = "17%"
    } else
        menuPane.style.width = "20%"
}

async function addTask() {
    if (titleTextarea.value.length == 0) {
        titleTextarea.style.border = "1px solid red"
        return
    }
    if (descTextArea.value.length == 0) {
        descTextArea.style.border = "1px solid red"
        return
    }
    var selectedOption = blogType.options[blogType.selectedIndex].value;
    console.log("selectedOption", selectedOption)

    if (selectedOption === "") {
        blogType.style.border = "1px solid red"
        return
    }
    hideTaskDetails()


    var userArr = []
    const queryHeadshot = await getDocs(collection(db, "Users"));
    queryHeadshot.forEach(function (doc) {
        userArr.push({
            email: doc.data().email,
            fullName: doc.data().fullName,
            passsword: doc.data().password,
        });
    });

    const fileInput = document.getElementById("file");
    const file = fileInput.files[0];

    let imageUrl = "./images/0_YYYvsBPHV6C3heG1.jpg";

    if (file) {
        const storageRef = ref(storage, 'images/' + file.name);
        const fileSnapshot = await uploadBytes(storageRef, file);
        imageUrl = await getDownloadURL(fileSnapshot.ref);
    }


    for (var i = 0; i < userArr.length; i++) {
        if (userEmail === userArr[i].email) {
            const filteredTitleTextarea = titleTextarea.value.replace(/"/g, '~').replace(/'/g, '^').replace(/\n/g, '|')
            const fileteredDescTextarea = descTextArea.value.replace(/"/g, '~').replace(/'/g, '^').replace(/\n/g, '|')
            var taskObj = {
                title: filteredTitleTextarea,
                description: fileteredDescTextarea,
                userID: userID,
                dateInput: formattedDateString,
                fullName: userArr[i].fullName,
                file: {
                    name: file ? file.name : "default-image.jpg",
                    url: imageUrl,
                },
                blogType: selectedOption
            }
            const docRef = await addDoc(collection(db, "Tasks"), taskObj);
            console.log("added")
            console.log("fileteredDescTextarea", fileteredDescTextarea)
        }
    }

    showLoading();
}

function signout() {
    localStorage.removeItem("userID")
    localStorage.removeItem("userEmail")
    window.location.replace("./index.html")
}

window.addEventListener("load", function () {
    if (!userID) {
        window.location.replace("./index.html");
        return;
    }
});

async function showLoading() {
    myBlogArr = [];
    const querySnapshot = await getDocs(
        query(collection(db, "Tasks"), orderBy("dateInput"))
    );
    querySnapshot.forEach(function (doc) {
        myBlogArr.push({
            id: doc.id,
            todoValue: doc.data().title,
            description: doc.data().description,
            userID: doc.data().userID,
            dateInput: doc.data().dateInput,
            fullName: doc.data().fullName,
            file: {
                name: doc.data().file.name,
                url: doc.data().file.url,
            },
            blogType: doc.data().blogType
        });
    });
    parent.innerHTML = "";
    if (myBlogArr.length === 0) {
        var emptySearch = `<h4 class="errSearch" >No blogs found</h4>`
        parent.innerHTML += emptySearch
    } else {
        var noBlogs = true
        for (var i = 0; i < myBlogArr.length; i++) {
            if (myBlogArr[i].userID === userID) {
                noBlogs = false
                blogTypeFunc(myBlogArr[i].blogType)
                parent.innerHTML += `
                <div class = "taskEnclosure">
            <div class="typeContainer" style="background-color: ${color};">
            </div>
            <div class="taskContainer">
                    <div class="taskImage">
                    <img src="${myBlogArr[i].file.url}" alt="">
                    </div>
                    <div class="taskSection">
                    <div class="taskSectionContent">
                    <i class="fa-regular fa-circle-check checkIcon" style="color: #000000;"></i>
                    <p class="taskContainerP" onclick="openModal('${myBlogArr[i].description}', '${myBlogArr[i].todoValue}', '${myBlogArr[i].file.url}', '${myBlogArr[i].fullName}')">${myBlogArr[i].todoValue}
                    </p>
                    <i class="fa-solid fa-angle-right arrowIcon" style="color: #000000;"></i>
                    </div>
                    <div class="taskSectionCreated">
                    <p>Blog by: <span style="color: #007BFF; margin-left: 20px;">${myBlogArr[i].fullName}</span></p>
                    <div class="dateInput">${myBlogArr[i].dateInput}</div>
                    </div>
                    </div>
                    </div>`
            }
        }
        if (noBlogs === true) {
            var emptySearch = `<h4 class="errSearch" >No blogs found</h4>`
            parent.innerHTML += emptySearch
        }
    }
}
// function to filter by type of task
var color = ""
function blogTypeFunc(blogType) {
    if (blogType === "Political") {
        color = "#ff6666"
    }
    if (blogType === "Sports") {
        color = "#66fffc"
    }
    if (blogType === "Education") {
        color = "#ffd875"
    }
    if (blogType === "Social") {
        color = "#ff7ece"
    }
    if (blogType === "Health") {
        color = "#bc75ff;"
    }
    if (blogType === "Other") {
        color = "#000000"
    }
}

let debounceTimeout;

function debounceSearchFunc() {
    clearTimeout(debounceTimeout);

    debounceTimeout = setTimeout(async () => {
        await searchFunc();
    }, 300);
}

async function searchFunc() {
    var searchInput = document.getElementById("searchInput").value.toLowerCase()

    if (searchInput.trim() === "") {
        await showLoading();
        return;
    }

    const querySnapshot = await getDocs(
        query(collection(db, "Tasks"), orderBy("dateInput"))
    );

    myBlogArr = [];
    querySnapshot.forEach(function (doc) {
        var titleLowerCase = doc.data().title.toLowerCase();

        if (titleLowerCase.includes(searchInput.toLowerCase())) {
            myBlogArr.push({
                id: doc.id,
                todoValue: doc.data().title,
                description: doc.data().description,
                userID: doc.data().userID,
                dateInput: doc.data().dateInput,
                fullName: doc.data().fullName,
                file: {
                    name: doc.data().file.name,
                    url: doc.data().file.url,
                },
                blogType: doc.data().blogType
            });
        }
    });

    parent.innerHTML = "";
    if (myBlogArr.length === 0) {
        var emptySearch = `<h4 class="errSearch" >No blogs found</h4>`
        parent.innerHTML += emptySearch
    } else {
        var noBlogs = true
        for (var i = 0; i < myBlogArr.length; i++) {
            if (myBlogArr[i].userID === userID) {
                noBlogs = false
                blogTypeFunc(myBlogArr[i].blogType)
                parent.innerHTML += `
                <div class = "taskEnclosure">
            <div class="typeContainer" style="background-color: ${color};">
            </div>
            <div class="taskContainer">
                    <div class="taskImage">
                    <img src="${myBlogArr[i].file.url}" alt="">
                    </div>
                    <div class="taskSection">
                    <div class="taskSectionContent">
                    <i class="fa-regular fa-circle-check checkIcon" style="color: #000000;"></i>
                    <p class="taskContainerP" onclick="openModal('${myBlogArr[i].description}', '${myBlogArr[i].todoValue}', '${myBlogArr[i].file.url}', '${myBlogArr[i].fullName}')">${myBlogArr[i].todoValue}
                    </p>
                    <i class="fa-solid fa-angle-right arrowIcon" style="color: #000000;"></i>
                    </div>
                    <div class="taskSectionCreated">
                    <p>Blog by: <span style="color: #007BFF; margin-left: 20px;">${myBlogArr[i].fullName}</span></p>
                    <div class="dateInput">${myBlogArr[i].dateInput}</div>
                    </div>
                    </div>`
            }
        }
        if (noBlogs === true) {
            var emptySearch = `<h4 class="errSearch" >No blogs found</h4>`
            parent.innerHTML += emptySearch
        }
    }
}


function openModal(taskPara, taskTitle, taskImage, fullName) {
    var myModal = new bootstrap.Modal(document.getElementById('blogModal'));
    var modalTitle = document.getElementById("modalTitle")
    var modalBody = document.getElementById("modalBody")
    var modalImage = document.getElementById("modalImage")
    var modalName = document.getElementById("modalName")
    console.log("taskPara", taskPara)
    var taskParaCorrect = taskPara.replace(/~/g, '"').replace(/\^/g, "'").replace(/\|/g, '<br>')
    console.log(taskParaCorrect, "taskParaCorrect")
    console.log("fullname", fullName)
    modalTitle.innerHTML = taskTitle
    modalBody.innerHTML = taskParaCorrect
    modalImage.src = taskImage;
    modalName.innerHTML = "Written By: " + fullName
    myModal.show();
}

showLoading();

window.showTaskDetails = showTaskDetails
window.hideMenu = hideMenu
window.showMenu = showMenu
window.addTask = addTask
window.signout = signout
window.hideTaskDetails = hideTaskDetails
window.openModal = openModal
window.searchFunc = searchFunc
window.debounceSearchFunc = debounceSearchFunc
window.blogTypeFunc = blogTypeFunc