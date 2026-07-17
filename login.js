document
.getElementById("loginForm")
.addEventListener("submit", function(e){

    e.preventDefault();

    const email =
    document.getElementById("loginEmail").value;

    const password =
    document.getElementById("loginPassword").value;

    const user =
    JSON.parse(localStorage.getItem("mamrajUser"));

    if(
        user &&
        user.email === email &&
        user.password === password
    ){

        localStorage.setItem("loggedIn","true");

        alert("Login Successful");

        window.location.href="index.html";

    }
    else{

        alert("Invalid Email or Password");

    }

});
