var app = {
    jsonServerUrl: "http://localhost:3000/",
    requiredData: "",
    errorParagraph: "<h1 class='server_error'>INTERNAL SERVER ERROR</h1>",
    invalidSessionError: "<div  class='invalid_session_error'><h1>INVALID SESSION</h1><a href='index.html'>Login Again</a></div>",

    // Create new XMLHTTP request
    initRequest: function() {
        var xhr;
        if (window.XMLHttpRequest) {
            xhr = new XMLHttpRequest();
        } else {
            xhr = new ActiveXObject("Microsoft.XMLHTTP");
        }
        return xhr;
    },

    // To make ajax calls and return objects from JSON data
    ajaxRequest: function(type, url, data, dataHandler) {
        var xhr = (typeof xhr === 'undefined') ? this.initRequest() : xhr;
        var url = app.jsonServerUrl + url;
        xhr.open(type, url, true);
        xhr.setRequestHeader("Content-Type", 'application/json');
        data = JSON.stringify(data);
        xhr.send(data);
        xhr.onreadystatechange = (function(xhr, dataHandler) {
            return function() {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    if (dataHandler) {
                        dataHandler(xhr);
                    }
                } else if (xhr.readyState == 4 && xhr.status == 404) {
                    if (dataHandler) {
                        dataHandler(404);
                    }
                } else if (xhr.readyState == 4 && xhr.status == 0) {
                    if (dataHandler) {
                        document.getElementsByTagName('section')[0].innerHTML = app.errorParagraph;
                    }
                }
            }
        })(xhr, dataHandler);
    },

    // To get entire JSON object
    getObject: function(url, Func) {
        this.ajaxRequest("GET", url, null, function(xhr) {
            if (xhr == 404) {
                Func(null);
            } else {
                requiredData = JSON.parse(xhr.responseText);
                Func(requiredData);
            }

        });
    },

    // To get specific object by id from JSON data
    getObjectById: function(url, id, Func) {
        this.ajaxRequest("GET", url + "/" + id, null, function(xhr) {
            if (xhr == 404) {
                Func(null);
            } else {
                requiredData = JSON.parse(xhr.responseText);
                Func(requiredData);

            }
        });
    },

    // To put specific object by id to JSON data
    putObjectById: function(url, id, data, Func) {
        this.ajaxRequest("PUT", url + "/" + id, data, function(xhr) {
            if (xhr == 404) {
                Func(null);
            } else {
                requiredData = JSON.parse(xhr.responseText);
                Func(requiredData);
            }
        });
    },

    // Cookie functionalities

    deleteCookie: function(keyValue) {
        if (app.checkCookie(keyValue)) {
            document.cookie = keyValue + "=" + "" + ";path=/";
        }
    },

    setCookie: function(keyValue, cvalue) {
        document.cookie = keyValue + "=" + cvalue + ";" + "path=/";
    },

    getCookie: function(keyValue) {
        var name = keyValue + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var pair = decodedCookie.split(';');
        for (var i = 0; i < pair.length; i++) {
            var c = pair[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    },

    checkCookie: function(keyValue) {
        var user = app.getCookie(keyValue);
        if (user != "") {
            return true;
        } else {
            return false;
        }
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

    // Modal display add class
    modalDisplayTrue: function(modalElement) {
        modalElement.classList.add('display_flex');
    },

    // Modal display remove class
    modalDisplayFalse: function(modalElement) {
        modalElement.classList.remove('display_flex');
    },

    // To initialise Profile page after fetching data from server
    initProfile: function(userType, id, dataHandler) {
        app.getObjectById(userType, id, function(data) {
            app.renderProfile(data);
            app.renderHeader();
            if (dataHandler)
                dataHandler(data);
        });
    },

    // To dynamically render Profile page
    renderProfile: function(renderData) {
        var superDetails = '';
        var $image = app.getElement('#profile_img');
        $image.src = renderData.image;
        superDetails = "<p id='profile_name' class='profile_name' data-name='" + renderData.name + "'>" + renderData.name + "</p>" +
            "<p class='profile_detail' data-id='" + renderData.id + "'>" + renderData.id + "</p>" +
            "<p class='profile_detail' data-email='" + renderData.email + "'>" + renderData.email + "</p>" +
            "<p class='profile_detail' data-role='" + renderData.role + "'>" + renderData.role + "</p>" +
            "<p class='profile_detail' data-address='" + renderData.address + "'>" + renderData.address + " </p>";
        app.getElement('#profile_details').innerHTML = superDetails;
        if (renderData.id == app.getCookie('supervisee_id')) {
            var superviseeProfile = "<h2>" + renderData.name + "</h2>" + "<h3>" + renderData.id + "</h3>";
            app.getElement('.profile_img_mob')[0].src = renderData.image;
            app.getElement('.profile_name')[1].innerHTML = superviseeProfile;
        }
    },

    // To render Supervisor data in header
    renderHeader: function() {
        var headerProfilePic;
        var dropDownContent;
        var logOut;

        //to dynamically display the logged in user name.
        this.getObject("supervisor", function(supervisorsData) {
            for (var i = 0; i < supervisorsData.length; i++) {
                if (app.getCookie('supervisor_id') == supervisorsData[i].id) {
                    app.getElement('#header_dropdown_profile_pic').src = supervisorsData[i].image;
                    app.getElement('#header_profile_pic').src = supervisorsData[i].image;
                    app.getElement('.header_profile_name')[0].innerHTML = supervisorsData[i].name;
                    break;
                }
            }
        });

        // when clicked on the profile image the drpdown sould appear and disappear
        headerProfilePic = app.getElement(".profile_pic")[0];
        dropDownContent = app.getElement("#dropdown_content");
        headerProfilePic.addEventListener("click", function() {
            dropDownContent.classList.toggle("show");
        });

        //when clicked outside the dropdown should close
        window.addEventListener('click', function() {
            if (!event.target.matches('.profile_pic')) {
                if (dropDownContent.classList.contains('show')) {
                    dropDownContent.classList.toggle("show");
                }
            }
        });

        //logout functionality
        logOut = app.getElement('#logout');
        logOut.addEventListener('click', function() {
            app.deleteSession(true);
        });
    },

    // To delete cookie data and set flag in database and redirect to index page
    deleteSession: function(ifRedirect) {
        app.getObjectById('session', app.getCookie('supervisor_id'), function(data) {
            if (data != null) {
                console.log('d')
                data.session_flag = 'false';
                app.putObjectById('session', app.getCookie('supervisor_id'), data, function() {
                    app.deleteCookie('supervisee_id');
                    app.deleteCookie('supervisor_id');
                    if (ifRedirect)
                        window.location.href = "index.html";
                });
            } else {
                window.location.href = "index.html";
            }
        });
    }
}
