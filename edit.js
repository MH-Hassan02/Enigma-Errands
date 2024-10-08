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
var parent = document.getElementById("parent")
var mainContent = document.getElementById("mainContent")
var taskContent = document.getElementById("taskContent");
var contentTitleTextarea = document.getElementById("contentTitleTextarea");
var contentDescription = document.getElementById("contentDescription");
var toggle = document.getElementById("toggle")
var menuPane = document.getElementById("menuPane")
var taskDetails = document.getElementById("taskDetails")
var overlay = document.getElementById("overlay")

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

async function showTaskContent(taskId) {

    const taskRef = doc(db, "Tasks", taskId);
    const taskSnapshot = await getDoc(taskRef);
    const taskData = taskSnapshot.data();

    contentTitleTextarea.value = taskData.title
    contentDescription.value = taskData.description

    idValue = taskId

    if (menuHide === true) {
        taskContent.style.display = "flex";
        mainContent.style.width = "55%";
    } else {
        taskContent.style.display = "flex";
        mainContent.style.width = "45%";
    }

    if (pageWidth < 768) {
        taskContent.style.width = "80%"
        overlay.style.display = "block"
    } else if (pageWidth > 1920) {
        taskContent.style.width = "18%"
    } else
        taskContent.style.width = "25%"
}



function hideTaskContent() {
    overlay.style.display = "none"

    if (menuHide === true) {
        taskContent.style.display = "none"
        mainContent.style.width = "80%"
    }
    else {
        taskContent.style.display = "none"
        mainContent.style.width = "70%"
    }
}

async function editTask(taskId) {
    const title = contentTitleTextarea.value.trim().replace(/"/g, '~').replace(/'/g, '^').replace(/\n/g, '|')
    const description = contentDescription.value.trim().replace(/"/g, '~').replace(/'/g, '^').replace(/\n/g, '|')



    const taskRef = doc(db, "Tasks", idValue);
    await updateDoc(taskRef, {
        title: title,
        description: description,
    });
    hideTaskContent()
    showLoading();
}

async function deleteTodo() {
    const querySnapshot = await getDocs(collection(db, "Tasks"));
    querySnapshot.forEach(function (doc) {
        myBlogArr.push({
            id: doc.id,
            todoValue: doc.data().title,
        });
    });

    for (var i = 0; i < myBlogArr.length; i++) {
        if (myBlogArr[i].id === idValue) {
            await deleteDoc(doc(db, "Tasks", myBlogArr[i].id));
        }
    }
    showLoading();
    hideTaskContent()
}

async function deleteTask() {
    taskContent.style.display = "none"
    for (var i = 0; i < myBlogArr.length; i++) {
        await deleteDoc(doc(db, "Tasks", myBlogArr[i].id));
    }

    if (menuHide === true) {
        taskDetails.style.display = "none"
        mainContent.style.width = "80%"
    }
    else {
        taskDetails.style.display = "none"
        mainContent.style.width = "70%"
    }
    showLoading()
    hideTaskContent()
};

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
        deleteBtn.style.display = "none"
        var emptySearch = `<h4 class="errSearch" >No blogs found</h4>`
        parent.innerHTML += emptySearch
    } else {
        var noBlogs = true
        for (var i = 0; i < myBlogArr.length; i++) {
            if (myBlogArr[i].userID === userID) {
                noBlogs = false
                deleteBtn.style.display = "block"
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
                    </div>
                    </div>`
            }
        }
        if (noBlogs === true) {
            deleteBtn.style.display = "none"
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
        deleteBtn.style.display = "none"
        var emptySearch = `<h4 class="errSearch" >No blogs found</h4>`
        parent.innerHTML += emptySearch
    } else {
        var noBlogs = true
        for (var i = 0; i < myBlogArr.length; i++) {
            if (myBlogArr[i].userID === userID) {
                noBlogs = false
                deleteBtn.style.display = "block"
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
            deleteBtn.style.display = "none"
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

window.showTaskContent = showTaskContent
window.hideMenu = hideMenu
window.showMenu = showMenu
window.hideTaskContent = hideTaskContent
window.deleteTask = deleteTask
window.signout = signout
window.editTask = editTask
window.deleteTodo = deleteTodo
window.openModal = openModal
window.searchFunc = searchFunc
window.debounceSearchFunc = debounceSearchFunc
window.blogTypeFunc = blogTypeFunc