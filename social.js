import {
    db,
    collection,
    getDocs,
    doc,
    getDoc,
    query,
    orderBy,
} from "./firebase.js"

var pageWidth = window.innerWidth

window.addEventListener('resize', function () {
    pageWidth = window.innerWidth
});

var menuHide = false
var myBlogArr = []

var userID = localStorage.getItem("userID");
var parent = document.getElementById("parent")
var mainContent = document.getElementById("mainContent")
var toggle = document.getElementById("toggle")
var menuPane = document.getElementById("menuPane")

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
            blogType: doc.data().blogType,
        });
    });

    parent.innerHTML = "";
    if (myBlogArr.length === 0) {
        var emptySearch = `<h4 class="errSearch" >No blogs found</h4>`
        parent.innerHTML += emptySearch
    } else {
        var noBlogs = true
        for (var i = 0; i < myBlogArr.length; i++) {
            if (myBlogArr[i].blogType === "Social") {
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
                    <i class="fa-solid fa-pen-to-square editIcon" onclick="showTaskContent('${myBlogArr[i].id}')"
                    style="color: #000000;"></i>
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
    // Clear the previous timeout (if any)
    clearTimeout(debounceTimeout);

    // Set a new timeout to call searchFunc after a delay (e.g., 300 milliseconds)
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
            if (myBlogArr[i].blogType === "Social") {
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
                    <i class="fa-solid fa-pen-to-square editIcon" onclick="showTaskContent('${myBlogArr[i].id}')"
                    style="color: #000000;"></i>
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
    modalTitle.innerHTML = taskTitle
    modalBody.innerHTML = taskPara
    modalImage.src = taskImage;
    modalName.innerHTML = "Written By: " + fullName
    myModal.show();
}

showLoading();

window.hideMenu = hideMenu
window.showMenu = showMenu
window.signout = signout
window.openModal = openModal
window.searchFunc = searchFunc
window.debounceSearchFunc = debounceSearchFunc
window.blogTypeFunc = blogTypeFunc