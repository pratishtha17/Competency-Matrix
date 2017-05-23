(function() {
    var found;
    var passMatch = 0;
    var userName;
    var password;
    var checkBox;
    var form = app.getElement("#login_form");
    var loginButton = app.getElement('#login_button');
    var errorUname = app.getElement('#login_error_uname');
    var errorPsw = app.getElement('#login_error_psw');
    var rememMe = app.getElement('#remember_text');
    userName = app.getElement("#uname");
    password = app.getElement("#psw");
    onLoad();


    function onLoad() //to display the remembered username when the page loads.
    {
        checkRememberedUser();
        bindEvents();
    }

    function checkRememberedUser() {
        if (typeof(Storage) !== "undefined") {
            if (userName.value === "" && localStorage.getItem("userid")) {
                userName.value = localStorage.userid;
                checkBox = app.getElement("#customcheckbox");
                checkBox.checked = true;
            }
        }
    }

    function bindEvents() {
        window.addEventListener('load', switchTab); //if user is logged in one tab and opens the index page in other tab,he should be redirected to the home.html
        loginButton.addEventListener('click', validate);
        form.addEventListener('submit', returnFalseValue);
        rememMe.addEventListener('click', toggleCheckBox);
        userName.addEventListener('keyup',validateUsername);
    }

    function validateUsername(){
        var uname = event.currentTarget.value;
        if(isNaN(uname)){
            if (!errorUname.classList.contains("visibility")) {
                    errorUname.classList.add("visibility");
                }
                if (errorPsw.classList.contains("visibility")) {
                    errorPsw.classList.remove("visibility");
                }
                login_button.disabled=true;
        }
        else{
                    errorUname.classList.remove("visibility");
                    login_button.disabled=false;          
                }
    }
    // triggers when enter key is pressed - login using enter key
    function enterKey(event) {
        if (event.which == "13") {
            validate();
        }
    }

    function returnFalseValue() {

        event.preventDefault();
        return false;
    }

    function rememberMe() //the remember me functionality (storing in localStorage)
    {
        checkBox = app.getElement("#customcheckbox");
        if (checkBox.checked === false) {
            userName = app.getElement("#uname");
            if (userName.value == localStorage.getItem("userid")) {
                localStorage.removeItem("userid");
            }
        } else {

            localStorage.setItem("userid", userName.value);
        }
    }
    // Toggle on/off checkbox
    function toggleCheckBox() {
        checkBox = app.getElement("#customcheckbox");
        if (checkBox.checked === false) {
            checkBox.checked = true;
        } else {
            checkBox.checked = false;
        }
    }
    //When user opens index in new tab
    function switchTab() {
        if (app.checkCookie("supervisor_id")) {
            app.setCookie("supervisor_id", app.getCookie("supervisor_id"));
            window.location.assign("home.html");
        }
    }
    //checking the credentials if they are valid or not.
    function validate() {
        found = 0;
        if (userName.value != "" && password.value != "" && userName.value.length==4) {
            app.getObject("supervisor", checkCredentials);
        } else {
            if (errorUname.classList.contains("visibility")) {
                errorUname.classList.remove("visibility");
            }
            else{
                errorUname.classList.add("visibility");
            }
            if (errorPsw.classList.contains("visibility")) {
                errorPsw.classList.remove("visibility");
            }
        }
        password.classList.remove("display_border_highlight");
        userName.classList.remove("display_border_no_highlight");
        userName.classList.remove("display_border_highlight");
        password.classList.remove("display_border_no_highlight");
    }

    function checkCredentials(supervisorDetails) {
        if (supervisorDetails !== null) {
            for (var i = 0; i < supervisorDetails.length; i += 1) {
                if (userName.value == supervisorDetails[i].id) {
                    found = 1;
                    if (password.value == supervisorDetails[i].password) {
                        rememberMe();
                        passMatch = 1;
                        app.getObjectById('session', userName.value, function(data) {
                            data.session_flag = "true";
                            app.putObjectById('session', userName.value, data, function() {
                                app.setCookie('supervisor_id', userName.value);
                                window.location.href = "home.html";
                            });
                        });
                        break;
                    }
                }
            }
            if (found != 1) {
                errorUname.innerHTML = "The username is invalid";
                if (!errorUname.classList.contains("visibility")) {
                    errorUname.classList.add("visibility");
                }
                if (errorPsw.classList.contains("visibility")) {
                    errorPsw.classList.remove("visibility");
                }
                userName.classList.add("display_border_highlight");
                password.classList.add("display_border_no_highlight");
                form.reset();
                userName.focus();
                userName.select();
            } else if (passMatch != 1) {
                errorPsw.innerHTML = "The password is invalid";

                if (!errorPsw.classList.contains("visibility")) {
                    errorPsw.classList.add("visibility");
                }
                if (errorUname.classList.contains("visibility")) {
                    errorUname.classList.remove("visibility");
                }
                password.classList.add("display_border_highlight");
                userName.classList.add("display_border_no_highlight");
                password.value = "";
                password.focus();
            }
        } else {
            errorUname.innerHTML = "Internal server error";
            errorUname.classList.add("visibility");
        }
    }
})();
