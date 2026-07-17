document
.getElementById("signupForm")
.addEventListener("submit", function(e){

    e.preventDefault();

    const user = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value
    };

    localStorage.setItem("mamrajUser", JSON.stringify(user));

    alert("Account Created Successfully!");

    window.location.href = "login.html";

});
