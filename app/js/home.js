(function() {
    load();

    var count, target,
        currentSuperviseeId = app.getElement(".input_text_modal")[0],
        currentSuperviseeName = app.getElement(".input_text_modal")[1],
        currentSuperviseeRole = app.getElement(".input_text_modal")[2],
        profileOfSupervisee = app.getElement(".click_supervisee"),
        helpModalView = app.getElement("#help_modal"),
        azScroll = app.getElement("#az_scroll"),
        superviseeList = app.getElement("#super_list"),
        deleteModalView = app.getElement("#container_modal"),
        deleteYes = app.getElement("#modal_delete_btn"),
        deleteNo = app.getElement("#modal_delete_btn_deny"),
        deleteModalText = app.getElement("#delete_modal_text"),
        superviseeModalView = app.getElement("#container_modal_add"),
        saveButton = app.getElement("#submit_image_supervisee"),
        okDeleteBtn = app.getElement("#modal_ok_delete"),
        cancelBtnSupervisee = app.getElement("#cancel_image_supervisee"),
        helpOkBtn = app.getElement("#modal_ok_help"),
        scrollAlphabet = new Set(),
        supervisorModal = app.getElement('#container_modal_supervisor'),
        cancelBtnSupervisor = app.getElement('#cancel_image_supervisor'),
        fetchedSupervisorId = app.getElement('#id_supervisor'),
        fetchedSupervisorRole = app.getElement('#role_supervisor'),
        fetchedSupervisorName = app.getElement('#name_supervisor'),
        fetchedSupervisorEmail = app.getElement('#email_address_supervisor'),
        fetchedSupervisorAddress = app.getElement('#address_supervisor'),
        fetchedSupervisorImage = app.getElement('#profile_img'),
        editIcon = app.getElement(".icon_edit"),
        searchBarDesk = app.getElement("#search_bar_desk"),
        searchBarMob = app.getElement("#search_bar_mob");

    function load() {
        if (app.getCookie('supervisor_id') == '') {
            document.getElementsByTagName('section')[0].innerHTML = app.invalid_session_error;
            app.deleteSession(false);
            return;
        }
        app.getObjectById('session', app.getCookie('supervisor_id'), function(sessionData) {
            if (sessionData == null || sessionData.session_flag == "false") {
                document.getElementsByTagName('section')[0].innerHTML = app.invalid_session_error;
                app.deleteSession(false);
                return;
            }

        });
    }

    app.initProfile("supervisor", app.getCookie('supervisor_id'), function(data) {
        bindEditButton(data);
    });
    app.getObject("supervisee", function(superviseesData) {
        sorting(superviseesData, "name");
        search(superviseesData);
        registerEvent(superviseesData);
    });

    function bindEditButton(response) {
        populateModal(response);
        bindModalEvents(response);
        var editProfile = app.getElement('#supervisor_edit_profile');

        editProfile.addEventListener('click', function() {
            app.modalDisplayTrue(supervisorModal);
        });
    }



    function populateModal(supervisorObj) {
        fetchedSupervisorName.value = supervisorObj.name;
        fetchedSupervisorId.value = supervisorObj.id;
        fetchedSupervisorEmail.value = supervisorObj.email;
        fetchedSupervisorRole.value = supervisorObj.role;
        fetchedSupervisorAddress.value = supervisorObj.address;
    }

    /*Supervisor edit Profile updation on the database*/
    function bindModalEvents(data) {
        var saveProfileButton = app.getElement('#submit_profile_image');
        var emailErrorMessage = app.getElement('#email_error_placeholder');
        var nameErrorMessage = app.getElement('#name_error_placeholder');
        var addressErrorMessage = app.getElement('#address_error_placeholder');
        saveProfileButton.addEventListener('click', function() {
            data = {
                name: fetchedSupervisorName.value,
                role: fetchedSupervisorRole.value,
                address: fetchedSupervisorAddress.value,
                email: fetchedSupervisorEmail.value,
                image: fetchedSupervisorImage.src
            }
            var takeEmail = validateEmail(data.email);
            var takeName = validateNull(data.name);
            var takeAddress = validateNull(data.address);
            if (takeEmail && takeName && takeAddress) {
                app.putObjectById("supervisor", fetchedSupervisorId.value, data, function(response) {
                    app.renderProfile(response);
                    populateModal(response)
                    app.modalDisplayFalse(supervisorModal);
                    app.getElement('.header_profile_name')[0].innerHTML = data.name;
                });
            } else if (!takeName) {

                nameErrorDiv.classList.add('visibility');
                app.modalDisplayTrue(nameErrorDiv);
                nameErrorMessage.innerHTML = "Name cannot be empty";


            } else if (!takeAddress) {


                addressErrorDiv.classList.add('visibility');
                app.modalDisplayTrue(addressErrorDiv);
                addressErrorMessage.innerHTML = "Address cannot be empty";
            } else if (!takeEmail) {
                emailErrorDiv.classList.add('visibility');
                app.modalDisplayTrue(emailErrorDiv);
                emailErrorMessage.innerHTML = "Please enter a valid Email";
            }

            fetchedSupervisorEmail.addEventListener('focus', function() {

                emailErrorDiv.classList.remove('visibility');
                app.modalDisplayFalse(emailErrorDiv)
            })
            fetchedSupervisorAddress.addEventListener('focus', function() {

                addressErrorDiv.classList.remove('visibility');
                app.modalDisplayFalse(addressErrorDiv)
            })
            fetchedSupervisorName.addEventListener('focus', function() {

                nameErrorDiv.classList.remove('visibility');
                app.modalDisplayFalse(nameErrorDiv)
            })


        });
        var emailErrorMessage = app.getElement('#email_error_palceholder');
        var emailErrorDiv = app.getElement('#email_error');
        var nameErrorDiv = app.getElement('#name_error');
        var addressErrorDiv = app.getElement('#address_error');

        supervisorModal.addEventListener("keyup", function(event) {
            event.preventDefault();
            if (event.keyCode == 13) {
                saveProfileButton.click();
            }
        });

        cancelBtnSupervisor.addEventListener('click', function() {
            app.modalDisplayFalse(supervisorModal);
        });

        //when clicked outside the dropdown should close
        window.addEventListener('click', function() {
            if (!event.target.matches('.inside_modal') && event.target.matches('.modal')) {
                cancelBtnSupervisor.click();
            }
        });
    }
    // Functions to validate NULL Input values and Email Reg EX
    function validateEmail(emailInput) {
        var regEx = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$/;
        if (regEx.test(emailInput)) {
            return true;
        } else {
            return false;
        }
    }

    function validateNull(input) {
        if (input === "") {
            return false
        } else {
            return true;
        }
    }

    function search(superviseesData) {
        searchBarDesk.addEventListener("keyup", searchHandler);
        searchBarMob.addEventListener("keyup", searchHandler);
        searchBarDesk.addEventListener("search", searchBarDeskHandler);
        searchBarMob.addEventListener("search", searchBarMobHandler);
        searchBarDesk.data = superviseesData;
        searchBarMob.data = superviseesData;
    }

    function searchHandler() {
        var searchField;
        superviseesData = event.currentTarget.data;
        if (event.currentTarget.id == "search_bar_desk") {
            searchField = searchBarDesk.value.toLowerCase();
        } else if (event.currentTarget.id == "search_bar_mob") {
            searchField = searchBarMob.value.toLowerCase();
        }

        var searchList = [];
        superviseesData.forEach(function(item, index) {
            if ((item.name.toLowerCase().indexOf(searchField) > -1) || (item.id.indexOf(searchField) > -1)) {
                searchList.push(item);
            }
        });
        if (searchList.length > 0) {
            renderSuperviseesDivision(searchList);
            azScroll.classList.remove("display_none");
            azScroll.classList.add("display_block");
            searchList = null;
        } else {
            superviseeList.innerHTML = "<h3>No results found</h3>";
            azScroll.classList.remove("display_block");
            azScroll.classList.add("display_none");
        }
    }

    function searchBarDeskHandler() {
        superviseesData = event.currentTarget.data;
        renderSuperviseesDivision(superviseesData);
        azScroll.classList.remove("display_none");
        azScroll.classList.add("display_block");
    }

    function searchBarMobHandler() {
        superviseesData = event.currentTarget.data;
        renderSuperviseesDivision(superviseesData);
    }

    /*Adding Event Listeners to Headers of the Supervisee List*/
    function registerEvent(superviseesData) {

        var empId = app.getElement("#empid");
        var employeeName = app.getElement("#employee_name");
        var role = app.getElement("#role");
        var helpBtn = app.getElement("#help_btn");
        empId.addEventListener("click", empIdHandler);
        empId.data = superviseesData;
        employeeName.addEventListener("click", empNameHandler);
        employeeName.data = superviseesData;
        role.addEventListener("click", empRoleHandler);
        role.data = superviseesData;

        azScroll.addEventListener('click', azScrollHandler);
        helpBtn.addEventListener("click", function() {
            app.modalDisplayTrue(helpModalView);
        });



        function empIdHandler() {
            superviseesData = event.currentTarget.data;
            target = event.currentTarget.id;
            superviseeList.scrollTop = 0;
            sorting(superviseesData, "id");
        }

        function empNameHandler() {
            superviseesData = event.currentTarget.data;
            superviseeList.scrollTop = 0;
            sorting(superviseesData, "name");
        }

        function empRoleHandler() {
            superviseesData = event.currentTarget.data;
            target = event.currentTarget.id;
            superviseeList.scrollTop = 0;
            sorting(superviseesData, "role");
        }

        function azScrollHandler() {
            if (target == "empid" || target == "role") {
                target = "";
                app.getElement('#employee_name').click();
            }
        }

        helpBtn.addEventListener("click", function() {
            app.modalDisplayTrue(helpModalView);
        });

        helpOkBtn.addEventListener("click", function() {
            app.modalDisplayFalse(helpModalView);
        });
        cancelBtnSupervisee.addEventListener("click", function() {
            app.modalDisplayFalse(superviseeModalView);
        });

        okDeleteBtn.addEventListener("click", function() {
            app.modalDisplayFalse(deleteModalView);
            deleteYes.classList.remove("display_none");
            deleteNo.classList.remove("display_none");
        });

    }
    /*Rendering the complete list of supervisees*/
    function renderSuperviseesDivision(superviseesData) {
        var containerData = "";
        var assigned, sortedScroll;
        count = 0;
        scrollAlphabet.clear();
        for (var i = 0; i < superviseesData.length; i++) {
            if (superviseesData[i].supervisorid == app.getCookie('supervisor_id')) {
                count++;
                if (assigned == superviseesData[i].name[0].toUpperCase()) {
                    if (count % 2 == 0) {
                        containerData += "<div class='supervisee_details supervisee_even' ><div class='user_details supervisee_pic click_supervisee emp_image' data-id='" + superviseesData[i].id + "'><img src='" + superviseesData[i].image +
                            "' alt='Profile Picture' class='supervisee_image'></div><div class='user_details emp_id click_supervisee' data-id='" + superviseesData[i].id + "'>" + superviseesData[i].id +
                            "</div><div class='user_details emp_name click_supervisee'data-id='" + superviseesData[i].id + "'>" + trim(superviseesData[i].name) +
                            "</div><div class='user_details emp_role click_supervisee'data-id='" + superviseesData[i].id + "'>" + superviseesData[i].role +
                            "</div><div class='user_details emp_action '><p class='icon_edit' data-emp='" + superviseesData[i].id + "' data-name='" + superviseesData[i].name + "' data-role='" + superviseesData[i].role + "'><i class='fa fa-pencil' aria-hidden='true'></i></p><p class='icon_delete' data-emp='" + superviseesData[i].id + "'><i class='fa fa-trash' aria-hidden='true'></i></p></div> </div>";
                    } else {
                        containerData += "<div class='supervisee_details supervisee_odd' ><div class='user_details supervisee_pic click_supervisee emp_image' data-id='" + superviseesData[i].id + "'><img src='" + superviseesData[i].image +
                            "' alt='Profile Picture' class='supervisee_image'></div><div class='user_details emp_id click_supervisee' data-id='" + superviseesData[i].id + "'>" + superviseesData[i].id +
                            "</div><div class='user_details emp_name click_supervisee' data-id='" + superviseesData[i].id + "'>" + trim(superviseesData[i].name) +
                            "</div><div class='user_details emp_role click_supervisee' data-id='" + superviseesData[i].id + "'>" + superviseesData[i].role +
                            "</div><div class='user_details emp_action '><p class='icon_edit' data-emp='" + superviseesData[i].id + "' data-name='" + superviseesData[i].name + "' data-role='" + superviseesData[i].role + "'><i class='fa fa-pencil' aria-hidden='true'></i></p><p class='icon_delete' data-emp='" + superviseesData[i].id + "'><i class='fa fa-trash' aria-hidden='true'></i></p></div> </div>";
                    }
                } else {
                    assigned = superviseesData[i].name[0].toUpperCase();
                    if (count % 2 == 0) {
                        containerData += "<div class='supervisee_details supervisee_even' id='scroll" + assigned + "'><div class='user_details click_supervisee supervisee_pic emp_image' data-id='" + superviseesData[i].id + "'><img src='" + superviseesData[i].image +
                            "' alt='Profile Picture' class='supervisee_image'></div><div class='user_details emp_id click_supervisee' data-id='" + superviseesData[i].id + "'>" + superviseesData[i].id +
                            "</div><div class='user_details emp_name click_supervisee' data-id='" + superviseesData[i].id + "'>" + trim(superviseesData[i].name) +
                            "</div><div class='user_details emp_role click_supervisee' data-id='" + superviseesData[i].id + "'>" + superviseesData[i].role +
                            "</div><div class='user_details emp_action'><p class='icon_edit' data-emp='" + superviseesData[i].id + "' data-name='" + superviseesData[i].name + "' data-role='" + superviseesData[i].role + "'><i class='fa fa-pencil' aria-hidden='true'></i></p><p class='icon_delete' data-emp='" + superviseesData[i].id + "'><i class='fa fa-trash' aria-hidden='true'></i></p></div> </div>";
                    } else {
                        containerData += "<div class='supervisee_details supervisee_odd' id='scroll" + assigned + "'><div class='user_details click_supervisee supervisee_pic emp_image' data-id='" + superviseesData[i].id + "'><img src='" + superviseesData[i].image +
                            "' alt='Profile Picture' class='supervisee_image'></div><div class='user_details emp_id click_supervisee' data-id='" + superviseesData[i].id + "'>" + superviseesData[i].id +
                            "</div><div class='user_details emp_name click_supervisee' data-id='" + superviseesData[i].id + "'>" + trim(superviseesData[i].name) +
                            "</div><div class='user_details emp_role click_supervisee' data-id='" + superviseesData[i].id + "'>" + superviseesData[i].role +
                            "</div><div class='user_details emp_action'><p class='icon_edit' data-emp='" + superviseesData[i].id + "' data-name='" + superviseesData[i].name + "' data-role='" + superviseesData[i].role + "'><i class='fa fa-pencil' aria-hidden='true'></i></p><p class='icon_delete' data-emp='" + superviseesData[i].id + "'><i class='fa fa-trash' aria-hidden='true'></i></p></div> </div>";
                    }
                    scrollAlphabet.add(assigned);
                }
            }
        }
        superviseeList.innerHTML = containerData;
        deleteView(superviseesData);
        editView(superviseesData);
        linkingProfile(superviseesData);
        sortedScroll = Array.from(scrollAlphabet).sort();
        createScroll(sortedScroll);
    }
    /*Function to sort data according to the properties */
    function sorting(superviseesData, property) {
        superviseesData.sort(function(curr, next) {
            return curr[property] <= next[property] ? -1 : 1;
        });
        if (superviseesData.length > 0) {
            renderSuperviseesDivision(superviseesData);
        }
    }




    /*Delete function to delete the selected supervisee*/
    function deleteView(superviseesData) {
        var deleteIcon = app.getElement(".icon_delete");

        for (var i = 0; i < deleteIcon.length; i++) {
            deleteIcon[i].addEventListener("click", function() {
                empId = this.getAttribute("data-emp");
                app.modalDisplayTrue(deleteModalView);
                deleteModalText.innerHTML = "Confirm Delete?";
                app.modalDisplayTrue(deleteYes);
                app.modalDisplayTrue(deleteNo);
                okDeleteBtn.classList.add("display_none");
                registerDeleteEvent(superviseesData, empId);
            });
        }
    }
    /*Appearing of the supervisee_modal_details via edit button*/
    function editView(superviseesData) {
        var empId, empName, empRole;

        for (var i = 0; i < editIcon.length; i++) {
            editIcon[i].addEventListener("click", function() {
                superviseeModalView.classList.add("display_flex");
                empId = this.getAttribute("data-emp");
                empRole = this.getAttribute("data-role");
                empName = this.getAttribute("data-name");
                currentSuperviseeId.value = empId;
                currentSuperviseeName.value = empName;
                currentSuperviseeRole.value = empRole;
                registerEditEvent(superviseesData, currentSuperviseeName.value, currentSuperviseeRole.value, currentSuperviseeId.value);
            });
        }
    }

    function linkingProfile(superviseesData) {
        for (var i = 0; i < profileOfSupervisee.length; i++) {
            profileOfSupervisee[i].addEventListener("click", function(event) {
                app.setCookie('supervisee_id', this.getAttribute("data-id")); //supervisee_id in camelcase
                window.location.assign("../profile.html");
            })
        }
    }
    /*Creating A-Z scroll bar dynamically*/
    function createScroll(scrollAlphabet) {
        var anchorData = "";
        for (var item in scrollAlphabet) {
            anchorData += "<a href='#scroll" + scrollAlphabet[item] + "' class='alphabet_scroll'>" + scrollAlphabet[item] + "</a>";
        }
        azScroll.innerHTML = anchorData;
    }
    /*On clicking Yes, supervisee get deleted*/
    function registerDeleteEvent(superviseesData, empId) {
        deleteModalView.addEventListener("keyup", function(event) {
            event.preventDefault();
            if (event.keyCode == 13) {
                deleteYes.click();
            }
        });
        deleteYes.addEventListener("click", function() {
            for (var i = 0; i < superviseesData.length; i++) {
                var deletedName = "";
                if (superviseesData[i].id == empId) {
                    superviseesData[i].supervisorid = null;

                    deletedName = superviseesData[i].name;
                    deleteModalText.innerHTML = deletedName + " is no longer your Supervisee";
                    app.modalDisplayFalse(deleteYes);
                    deleteYes.classList.add("display_none");
                    app.modalDisplayFalse(deleteNo);
                    deleteNo.classList.add("display_none");
                    okDeleteBtn.classList.remove("display_none");

                    sorting(superviseesData, "name");
                    break;
                }
            }

            app.putObjectById("supervisee", empId, superviseesData[i], function() {});
            sorting(superviseesData, "name");
        })
        deleteNo.addEventListener("click", deleteModalNohandler);
    }

    function deleteModalNohandler() {
        app.modalDisplayFalse(deleteModalView);
        app.modalDisplayFalse(deleteYes);
        app.modalDisplayFalse(deleteNo);
        okDeleteBtn.classList.remove("display_none");

    }




    /*Appearing of the supervisee_modal_details via edit button*/
    function editView(superviseesData) {
        var empId, empName, empRole;

        for (var i = 0; i < editIcon.length; i++) {
            editIcon[i].addEventListener("click", function() {
                superviseeModalView.classList.add("display_flex");
                empId = this.getAttribute("data-emp");
                empRole = this.getAttribute("data-role");
                empName = this.getAttribute("data-name");
                currentSuperviseeId.value = empId;
                currentSuperviseeName.value = empName;
                currentSuperviseeRole.value = empRole;
                registerEditEvent(superviseesData, currentSuperviseeName.value, currentSuperviseeRole.value, currentSuperviseeId.value);
            });
        }
    }

    function trim(string) {
        return (string.length < 15) ? string : string.replace(string.substr(12, string.length - 12), '...');
    }

    /*Updating of the supervisee_modal_details via save button in the database*/
    function registerEditEvent(superviseesData, empName, empRole, empId) {
        superviseeModalView.addEventListener("keyup", function(event) {
            event.preventDefault();
            if (event.keyCode == 13) {
                saveButton.click();
                /*Updating of the supervisee_modal_details via save button in the database*/
            }
        });
        var superviseeErrorMessage = app.getElement("#supervisee_name_error_palceholder");
        var superviseeErrorDiv = app.getElement("#supervisee_name_error");


        saveButton.addEventListener("click", function() {
            empId = currentSuperviseeId.value;
            empName = currentSuperviseeName.value.charAt(0).toUpperCase() + currentSuperviseeName.value.slice(1);
            empRole = currentSuperviseeRole.value.charAt(0).toUpperCase() + currentSuperviseeRole.value.slice(1);
            var takeSupervisee = validateNull(empName);
            for (var i = 0; i < superviseesData.length; i++) {
                if (superviseesData[i].id == empId) {
                    superviseesData[i].name = empName;
                    superviseesData[i].role = empRole;
                    break;
                }
            }

            if (takeSupervisee) {
                app.putObjectById("supervisee", empId, superviseesData[i], function() {});
                superviseeModalView.classList.remove("display_flex");
                sorting(superviseesData, "name");
            } else {
                superviseeErrorDiv.classList.add('visibility');
                app.modalDisplayTrue(superviseeErrorDiv);
                superviseeErrorMessage.innerHTML = "Please enter some value";
            }
        });
        sorting(superviseesData, "name");
        currentSuperviseeName.addEventListener('focus', function() {

            superviseeErrorDiv.classList.remove('visibility');
            app.modalDisplayFalse(superviseeErrorDiv)
        })
    }



    function linkingProfile(superviseesData) {
        for (var i = 0; i < profileOfSupervisee.length; i++) {
            profileOfSupervisee[i].addEventListener("click", function(event) {
                app.setCookie('supervisee_id', this.getAttribute("data-id")); //supervisee_id in camelcase
                window.location.assign("../profile.html");
            })
        }
    }


    window.addEventListener("click", function() {
        //when clicked outside the modals should close
        if (!event.target.matches(".inside_modal") && event.target.matches(".modal")) {
            if (deleteModalView) {
                deleteNo.click();
            }
            if (superviseeModalView) {

                cancelBtnSupervisee.click();
            }
            if (helpModalView) {
                helpOkBtn.click();
            }
        }
    });
})();
