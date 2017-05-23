var app = {
    required_data: "",
    initRequest: function() {
        var xhr;
        if (window.XMLHttpRequest) {
            xhr = new XMLHttpRequest();
        } else {
            xhr = new ActiveXObject("Microsoft.XMLHTTP");
        }
        return xhr;
    },
    ajax_request: function(type, url, data, callback) {
        var xhr = (typeof xhr === 'undefined') ? this.initRequest() : xhr;
        var url = "http://localhost:3000/" + url;
        xhr.open(type, url, true);
        xhr.setRequestHeader("Content-Type", 'application/json');
        data = JSON.stringify(data);
        xhr.send(data);
        xhr.onreadystatechange = (function(xhr, callback) {
            return function() {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    if (callback) {
                        callback(xhr);
                    }
                } else if (xhr.readyState == 4 && xhr.status == 0) {
                    if (callback) {
                        callback(404);
                    }
                }
            }
        })(xhr, callback);
    },
    getObject: function(url, Func) {

        this.ajax_request("GET", url, null, function(xhr) {
            if (xhr == 404) {
                Func(null);
            } else {
                required_data = JSON.parse(xhr.responseText);
                Func(required_data);
            }

        });
    },
    getEmployeeData: function(url, id, Func) {
        this.ajax_request("GET", url + "/" + id, null, function(xhr) {
            if (xhr == 404) {
                Func(null);
            } else {
                required_data = JSON.parse(xhr.responseText);
                Func(required_data);
            }
        });
    },
    putEmployeeData: function(url, id, data, Func) {
        this.ajax_request("PUT", url + "/" + id, data, function(xhr) {
            if (xhr == 404) {
                Func(null);
            } else {
                required_data = JSON.parse(xhr.responseText);
                Func(required_data);
            }
        });
    },
    /*Function to get Elements by their respective selector*/
    getElement: function(selector) {
        var element;
        if ((selector.charAt(0)) == '#') {
            element = document.getElementById(selector.slice(1));
        } else if ((selector.charAt(0)) == '.') {
            element = document.getElementsByClassName(selector.slice(1));
        } else {
            element = document.getElementsByTagName(selector);
        }
        return element;
    },
    headerName: function() {
        var headerProfilePic;
        var dropDownContent;
        var logOut;
        //to dynamically display the logged in user name.
        //maintain proper indentation
        app.getObject("supervisor", function(supervisorsData) {
            for (var i = 0; i < supervisorsData.length; i++) {
                if (localStorage.session_userID == supervisorsData[i].id) {
                    app.getElement('#header_dropdown_profile_pic').src = supervisorsData[i].image;
                    app.getElement('#header_profile_pic').src = supervisorsData[i].image;
                    app.getElement('.header_profile_name')[0].innerHTML = supervisorsData[i].name;
                    break;
                }
            }
        });
        window.addEventListener('load', function() { //two logged in tabs :when logged out in one tab and if reload in the other tab,the index page should appear.
            if (!localStorage.getItem('session_userID')) {
                window.location.assign('index.html');
            }
        });
        headerProfilePic = app.getElement(".profile_pic")[0]; // when clicked on the profile image the drpdown sould appear and disappear
        dropDownContent = app.getElement("#dropdown_content");
        headerProfilePic.addEventListener("click", function() {
            dropDownContent.classList.toggle("show");
        });
        window.addEventListener('click', function() { //when clicked outside the dropdown should close
            if (!event.target.matches('.profile_pic')) {
                if (dropDownContent.classList.contains('show')) {
                    dropDownContent.classList.toggle("show");
                }
            }
        });
        logOut = app.getElement('#logout'); //logout functionality 
        logOut.addEventListener('click', function() {
            localStorage.removeItem('session_userID');
            sessionStorage.removeItem('userID');

        });
    }
}
