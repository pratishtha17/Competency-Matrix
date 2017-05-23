(function() {
    var mail,
        userInput = app.getElement("#username"), //Getting the user input field
        hasMatch = false, //Flag to see if the username exists or not
        sendButton = app.getElement("#send_password"); //Getting the send password button
    function newPassword() {
        var newPassword = "", //Declaring a new password
            length = 8, //Declaring the length of the password
            charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@_-#$%"; //Declaring the character set used to generate the new password
        for (var i = 0; i < length; i++) {
            newPassword += charset.charAt(Math.floor((Math.random() * charset.length))); //Randomly generating a new password using the defined character set
        }
        return newPassword;
    }

    function changePassword(user) {
        errorMessage = app.getElement("#error_message");
        if (hasMatch) {
            mail = user.email; //Getting the emailID of the user
            user.password = newPassword(); //getting a new password
            app.putObjectById("supervisor", user.id, user, function(data) {
                emailjs.send("gmail", "password", { "email": mail, "name": user.name, "message": "<b>" + newPassword + "</b>" }); //Sending the new password through emailJS to the specified emailID
                redirect(); //Redirecting to login page
            }); //Generating a put request to replace the old JSON valuse with the new one
        } else {
            if (user == "") {
                errorMessage.innerHTML = "Username cannot be empty!";
            } else {
                errorMessage.innerHTML = "Invalid username!";
            }
            errorMessage.classList.add("visibility");
            userInput.focus();
        }
    }

    function redirect() { //To redirect the user to the login page once the password has been sent
        var hiddenMail = "";
        for (var i = 0; i < mail.length; i++) {
            if (mail.charAt(i) != "@") {
                hiddenMail = hiddenMail + mail.charAt(i);
            } else {
                mail = "";
                for (var j = 0; j < hiddenMail.length / 2; j++) {
                    mail = mail + hiddenMail.charAt(j);
                }
                mail = mail + "****";
                break;
            }
        }
        var timecount = 10; //Setting 5 seconds timer for redirecting
        var message = app.getElement("#recovery"); //Changing the recovery division to a display message
        message.innerHTML = "Recovery password is sent to the email : " + mail + ". You will be redirected to the login page in <span id=\"time\">" + timecount + "</span> seconds"; //Changing the recovery division to a display message
        message.classList.add("redirect");
        setInterval(function() { //Changing the recovery division to a display message
            timecount--;
            app.getElement("#time").innerHTML = timecount;
            if (timecount == 1) {
                window.location = "index.html"; //Counting
            }
        }, 1000);
    }

    function getData() {
        userId = userInput.value; //Getting the username entered by the user
        if (userId == "") { //Checking if user input is null or not
            hasMatch = false;
            changePassword(userId);
        } else {
            app.getObjectById("supervisor", userId, function(data) { //Creating a get request from global js file
                if (data === null) { //checking if the user input exists in the database or not
                    hasMatch = false;
                    changePassword(data);
                } else {
                    hasMatch = true;
                    changePassword(data);
                }

            });
        }
    }
    sendButton.addEventListener("click", getData);
    userInput.addEventListener("keydown", function(value) {
        if (value.keyCode == 13) {
            getData();
        }
    })
})();
