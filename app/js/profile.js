(function() {
    var sessionId = app.getCookie("supervisee_id");
    var localData = "";
    var skillSetPrimary = new Set();
    var skillSetSecondary = new Set();
    var msg = "";
    var helpModalView = app.getElement("#help_modal");
    var helpBtn = app.getElement("#help_btn");
    var helpOkBtn = app.getElement("#modal_ok_help");
    var starOn = "img/star_filled.png"; // images source
    var starOff = "img/star_nonfilled.png";
    var starsArray = []; // Array to hold the rating star images
    var subskillModalHolder = app.getElement("#subskillholder");
    var subSkillModalDiv = app.getElement(".sub_skill_modal_item")[0];
    var subskillModalInput = app.getElement(".sub_skill_modal_input");
    var cloneIndex = 0;
    var newsubskill = app.getElement(".newsubskill");
    var deviceType;
    var previous = null;
    var editButtonPrimary = app.getElement(".edit_primary");
    var editButtonSecondary = app.getElement(".edit_secondary");
    var flag;
    var close = app.getElement("#cancel_add_skills");
    var pskillsSecMob = app.getElement(".pskills_sec_mob")[0];
    var sskillsSecMob = app.getElement(".sskills_sec_mob")[0];
    var mobPrimarySkills = app.getElement(".mob_pskills")[0];
    var mobSecondarySkills = app.getElement(".mob_sskills")[0];
    var primaryFocus = app.getElement("#primaryFocus");
    var secondary_focus = app.getElement("#secondary_focus");
    var addSkillButtons = app.getElement(".add_skills");
    var dataListPrimary;
    var dataListSecondary;
    var modal = app.getElement(".modal")[0];

    load();

    function load() {
        if (sessionId != "") {
            app.getObjectById("supervisee", sessionId, function(data) {
                localData = data;
                if (data != null && localData.id == app.getCookie('supervisee_id')) {
                    populate(data);
                    initializePage();
                    var show = app.getElement(".list_element");

                    for (var i = 0; i < show.length; i++) {
                        show[i].addEventListener("click", showSublist);
                        editRating(show[i]);
                    }

                } else {
                    document.getElementsByTagName('section')[0].innerHTML = app.invalidSessionError;
                    app.deleteSession(false);
                }
            });

        } else {
            window.location.href = "home.html";
        }

    }



    function initializePage() {
        for (var i = 0; i < 2; i++) {
            editButtonPrimary[i].addEventListener("click", disableEdit);
            editButtonSecondary[i].addEventListener("click", disableEdit);
            if (i == 0) {
                editButtonPrimary[i].deviceType = 0;
                editButtonSecondary[i].deviceType = 0;
            } else {
                editButtonPrimary[i].deviceType = 1;
                editButtonSecondary[i].deviceType = 1;
            }
        }
        for (var i = 0; i < addSkillButtons.length; i++) {
            addSkillButtons[i].addEventListener("click", displayModal);
            addSkillButtons[i].flag = i;
        }
        sskillsSecMob.classList.add('display_none');
        mobPrimarySkills.addEventListener("click", callBackMobileDisplay);
        mobSecondarySkills.addEventListener("click", callBackMobileDisplay);
        close.addEventListener("click", closeModal);
        app.getElement("#button_modal_save").addEventListener("click", modalSave);
        newsubskill[0].addEventListener("click", addNewSubSkill);
        app.initProfile("supervisee", sessionId);

    }

    function editRating(sublist) {
        var sublistItems = sublist.nextElementSibling;
        for (var x = 0; x < sublistItems.childNodes.length; x++) {
            var node = sublistItems.childNodes[x].childNodes;
            var child = node[0];
            child = child.nextElementSibling;
            for (var y = 0; y < 5; y++) {
                child = child.nextElementSibling;
                child.addEventListener("click", checkEnable); // Adding listener to all star images of this particular sublist
            }
        }
    }

    // function to set the editRating
    function checkEnable(event) {
        starsArray = [];
        var currentClicked = event.currentTarget;
        var level = parseInt(currentClicked.getAttribute("data-level")); // Current rating level
        var parnt = currentClicked.parentElement;
        var node = parnt.childNodes[1];
        var checkBox = parnt.childNodes[0].childNodes[0]; // get the check box for the current clicked star
        for (var x = 0; x < 5; x++) {
            node = node.nextElementSibling;
            starsArray.push(node); // Pushing all adjacent star images of clicked star to starsArray array
        }
        checkBox.addEventListener("change", "");

        if (checkBox.disabled == false && checkBox.checked == true) {
            setLevel(starsArray, level - 1);
        }
    }

    // Function to set the level of subskills
    function setLevel(starsArray, indexOfStar) {
        var index = parseInt(indexOfStar);
        var newTotalStars = 0;
        var level = index + 1;
        var previousSublevelStars = parseInt(starsArray[index].parentNode.getAttribute("data-subleveltotal"));
        starsArray[index].parentNode.setAttribute("data-subleveltotal", index + 1);
        if (starsArray[index].getAttribute("src") == starOff) {
            for (var j = 0; j <= index; j++) {
                starsArray[j].setAttribute("src", starOn);
            }
        } else {
            for (var k = index + 1; k < 5; k++) {
                starsArray[k].setAttribute("src", starOff);
            }
        }
        var subSkillName = starsArray[0].previousElementSibling.childNodes[0].nodeValue; // Name of the subskill like localStorage
        var parents = event.currentTarget.parentNode.parentNode;
        var skillType = parents.parentNode.parentNode;
        parents = parents.previousSibling;
        skillType = skillType.getAttribute("class"); //Type of skill whether it is primary or secondary
        newTotalStars = parseInt(parents.getAttribute("data-total_stars")) - previousSublevelStars + index + 1;
        var avgLevel = newTotalStars / parseInt(parents.getAttribute("data-no_of_skills"));
        var displayLevel = "";
        var bgColorLevel = "";
        if (avgLevel < 2) {
            displayLevel = "BEGINNER";
            bgColorLevel = "#2e6e89";
        } else if (avgLevel < 4.5) {
            displayLevel = "MEDIOCRE";
            bgColorLevel = "#968107"
        } else {
            displayLevel = "EXPERT";
            bgColorLevel = "#569406";
        }
        parents.setAttribute("data-total_stars", newTotalStars);
        parents.childNodes[2].innerHTML = displayLevel; //Setting the expertise as beginner or expert
        parents.childNodes[2].style.background = bgColorLevel;
        changeInJson(subSkillName, skillType, newTotalStars.toString(), level.toString());
    }

    function changeInJson(subSkillName, skillType, newTotalStars, level) {
        if (skillType == "primary-list") {
            for (var i = 0; i < localData.primaryskill.length; i++) {
                for (var j = 0; j < localData.primaryskill[i].subskills.length; j++) {
                    if (localData.primaryskill[i].subskills[j].name == subSkillName) {
                        localData.primaryskill[i].subskills[j].level = level;
                        localData.primaryskill[i].total_stars = newTotalStars;
                    }
                }
            }
        } else {
            for (var i = 0; i < localData.secondaryskill.length; i++) {
                for (var j = 0; j < localData.secondaryskill[i].subskills.length; j++) {
                    if (localData.secondaryskill[i].subskills[j].name == subSkillName) {
                        localData.secondaryskill[i].subskills[j].level = level;
                        localData.secondaryskill[i].total_stars = newTotalStars;
                    }
                }
            }
        }
    }

    // Dynamically populate data
    function populate(user) {
        if (user == "") {
            alert("superviseeid : " + sessionId + " not found in database");
        } else { //pskills
            var primarySkill = user.primaryskill;
            var secondarySkill = user.secondaryskill;
            var primaryList = app.getElement(".primary-list");
            var secondaryList = app.getElement(".secondary-list");

            dataListPrimary = document.createElement('datalist')
            dataListSecondary = document.createElement('datalist');
            dataListPrimary.classList.add("display_none");
            dataListSecondary.classList.add("display_none");
            dataListPrimary.id = 'dataListPrimary';
            dataListSecondary.id = 'dataListSecondary';
            document.getElementsByTagName('section')[0].appendChild(dataListPrimary)
            document.getElementsByTagName('section')[0].appendChild(dataListSecondary)

            populateSkills(primarySkill, "desktop", 0, primaryList[0]);
            populateSkills(secondarySkill, "desktop", 1, secondaryList[0]);
            populateSkills(primarySkill, "mobile", 0, primaryList[1]);
            populateSkills(secondarySkill, "mobile", 1, secondaryList[1]);
        }
    }

    function populateSkills(skill, displayType, index, skillList) {
        var avgLevel;
        var displayLevel;
        var bgColorLevel;
        var checkBoxDiv;
        var idCheck;
        var img;
        var subName;
        var subLevel;
        dataListPrimary.id = "dataListPrimary";
        dataListSecondary.id = "dataListSecondary";
        var skillsContainer = "";
        for (var j = 0; j < skill.length; j++) {
            var pSkillName = skill[j].name;
            if (displayType == "desktop" && index == "0") {
                addToDatalist(dataListPrimary, pSkillName);
                skillSetPrimary.add(pSkillName);
            } else if (displayType == "desktop" && index == "1") {
                addToDatalist(dataListSecondary, pSkillName);
                skillSetSecondary.add(pSkillName);
            }
            var container = "";
            //subskills
            var subSkill = skill[j].subskills;
            var noOfSkills = skill[j].no_of_skills;
            var total_stars = skill[j].total_stars;
            var subContainer = "";
            subContainer += "<div class='sub_list_group' >";
            var totLevel = 0;
            for (var k = 0; k < subSkill.length; k++) {
                subName = subSkill[k].name;
                subLevel = subSkill[k].level;
                subLevel = parseInt(subLevel);
                totLevel += subLevel;
                idCheck = index + "" + j + "" + k;
                idCheck = displayType + idCheck;
                img = "";
                for (var x = 1; x <= subLevel; x++) {
                    img += '<img src="img/star_filled.png" alt="Stars" class="rating_star" data-level=' + x + '/>';
                }
                for (var y = subLevel + 1; y <= 5; y++) {
                    img += '<img src="img/star_nonfilled.png" alt="Stars" class="rating_star" data-level=' + y + '/>';
                }
                checkBoxDiv = "";
                if (index == 0)
                    checkBoxDiv = '<div class="checkbox_primary"><input type="checkbox" disabled  checked name="customcheckbox"' +
                    ' value="" aria-label="customcheckbox" id="customcheckbox' + idCheck + '"><label for="customcheckbox' + idCheck + '">' +
                    '</label></div>';
                else
                    checkBoxDiv = '<div class="checkbox_secondary"><input type="checkbox" disabled checked name="customcheckbox"' +
                    'value="" aria-label="checkbox" id="customcheckbox' + idCheck + '"><label for="customcheckbox' + idCheck + '">' +
                    '</label></div>';
                subContainer +=
                    '<div class="sub_list_element" data-subleveltotal=' + subLevel + '>' +
                    checkBoxDiv +
                    '<div class="sub_skill_item" title='+trimSpace(subName)+'>' + trim(subName) + '</div>' +
                    img + '<br>' +
                    '</div>';
            }
            subContainer += "</div>";
            avgLevel = totLevel / subSkill.length;
            displayLevel = "";
            bgColorLevel = "";
            if (avgLevel < 2) {
                displayLevel = "BEGINNER";
                bgColorLevel = "#2e6e89";
            } else if (avgLevel < 4.5) {
                displayLevel = "MEDIOCRE";
                bgColorLevel = "#968107"
            } else {
                displayLevel = "EXPERT";
                bgColorLevel = "#569406";
            }
            container += '<li><div class="list_element" data-no_of_skills=' +
                noOfSkills + ' data-total_stars=' + total_stars +
                '><span class="down_arrow"><i class="fa fa-chevron-down" aria-hidden="true"></i></span><div class="skill_item" title='+trimSpace(pSkillName)+'> ' +
                trim(pSkillName) + '</div><div class="skill_level" style="background:' + bgColorLevel + '">' +
                displayLevel + '</div></div>' + subContainer + '</li>';
            skillsContainer += container;
        }
        skillList.innerHTML = skillsContainer;
    }


    function trim(string) {
        return (string.length < 18) ? string : string.replace(string.substr(15, string.length - 15), '...');
    }

    function trimSpace(string) {
        return string.replace(/ /g, '_');
    }


    function addToDatalist(datalist, item) {
        var options = document.createElement("option");
        options.value = item;
        datalist.appendChild(options);
    }

    //Display dropdown on click
    function showSublist() {
        var heightSublist = event.currentTarget.getAttribute("data-no_of_skills") * 50;
        if (previous) {
            previous.setAttribute("style", "height:0px;opacity:0;transition: all 0.4s ease-in-out");
            previous.previousSibling.childNodes[0].innerHTML = '<i class="fa fa-chevron-down" aria-hidden="true"></i>';
        }
        if (previous != event.currentTarget.nextSibling) {
            previous = event.currentTarget.nextSibling;
            previous.setAttribute("style", "height:" + heightSublist + "px;opacity:1;transition: all 0.2s ease-in-out");
            previous.previousSibling.childNodes[0].innerHTML = '<i class="fa fa-chevron-up" aria-hidden="true"></i>';
        } else {
            previous = null;
        }
    }

    function change(name, oldLevel, newLevel, mainSkill) {
        msg = msg + name + " skill of " + mainSkill + " in your competency matrix has been changed from level " + oldLevel + " to level " + newLevel + ".\n";
    }

    function update(prev, type) {
        var leng
        prev = JSON.parse(prev);
        if (type == "primarySkill") {
            var len = prev.primaryskill.length;
            for (var i = 0; i < len; i++) {
                leng = prev.primaryskill[i].subskills.length;
                for (var j = 0; j < leng; j++) {
                    if (prev.primaryskill[i].subskills[j].level != localData.primaryskill[i].subskills[j].level) {
                        change(prev.primaryskill[i].subskills[j].name, prev.primaryskill[i].subskills[j].level, localData.primaryskill[i].subskills[j].level, prev.primaryskill[i].name);
                    }
                }
            }
        } else if (type == "secondarySkill") {
            var len = prev.secondaryskill.length;
            for (var i = 0; i < len; i++) {
                leng = prev.secondaryskill[i].subskills.length;
                for (var j = 0; j < leng; j++) {
                    if (prev.secondaryskill[i].subskills[j].level != localData.secondaryskill[i].subskills[j].level) {
                        change(prev.secondaryskill[i].subskills[j].name, prev.secondaryskill[i].subskills[j].level, localData.secondaryskill[i].subskills[j].level, prev.secondaryskill[i].name);
                    }
                }
            }
        }
        app.putObjectById("supervisee", sessionId, localData, function() {
            if (msg != "") {
                //emailjs.send("gmail", "competency", { "email": "prev.email", "name": prev.name, "message": "<b>" + msg + "</b>" });
            }
            msg = "";
        });
    }

    function disableEdit() {
        deviceType = event.target.deviceType;
        if (this.classList[0] == "edit_primary") {
            disableCheckbox('.checkbox_primary', editButtonPrimary[deviceType], "primarySkill");
        } else {
            disableCheckbox('.checkbox_secondary', editButtonSecondary[deviceType], "secondarySkill");
        }
    }

    function disableCheckbox(checkBoxType, buttonType, skillFlagForEmail) {
        flag = 0;
        var check = app.getElement(checkBoxType);
        for (var i = 0; i < check.length; i++) {
            if (check[i].childNodes[0].disabled) {
                flag = 0;
                check[i].childNodes[0].disabled = false;
                check[i].parentNode.classList.remove('opacity_half');
                check[i].parentNode.classList.add('opacity_one');
                check[i].classList.remove('visibility_hidden');
                check[i].classList.add('visibility_visible');
                check[i].classList.add('checkbox_edit');
            } else {
                check[i].childNodes[0].disabled = true;
                check[i].parentNode.classList.remove('opacity_one');
                check[i].parentNode.classList.add('opacity_half');
                check[i].classList.remove('visibility_visible');
                check[i].classList.add('visibility_hidden');
                flag = 1;
            }
        }
        if (flag == 0) {
            prevData = JSON.stringify(localData);
            Object.freeze(prevData);
            buttonType.value = "Save";
            buttonType.classList.remove('edit_button_image');
            buttonType.classList.add('save_button_image');
        }
        if (flag == 1) {
            update(prevData, skillFlagForEmail);
            buttonType.value = "Edit";
            buttonType.classList.remove('save_button_image');
            buttonType.classList.add('edit_button_image');
        }
    }


    function displayModal() {
        modal.setAttribute("data-flag", event.currentTarget.flag);
        modal.classList.remove('display_none');
        app.modalDisplayTrue(modal);
        app.getElement("#error_text").classList.add('display_none');
        if (event.currentTarget.flag == "0" || event.currentTarget.flag == "2")
            app.getElement("#skill_modal").setAttribute("list", dataListPrimary.id);
        else
            app.getElement("#skill_modal").setAttribute("list", dataListSecondary.id);
        subSkillModalDiv = app.getElement(".sub_skill_modal_item")[0];
        subSkillModalDiv.childNodes[3].classList.remove('display_none');
        subSkillModalDiv.childNodes[3].classList.add('display_inline');
        subSkillModalDiv.childNodes[1].value = "";
        app.getElement("#skill_modal").value = "";
    }

    function addNewSubSkill() {
        var newSubskillModalDiv = subSkillModalDiv.cloneNode(true);
        newSubskillModalDiv.childNodes[1].value = "";
        newSubskillModalDiv.id = cloneIndex++;
        newSubskillModalDiv.childNodes[3].addEventListener("click", addNewSubSkill);
        subSkillModalDiv.childNodes[3].classList.remove('display_inline');
        subSkillModalDiv.childNodes[3].classList.add('display_none');
        subSkillModalDiv.removeEventListener("click", addNewSubSkill);
        subSkillModalDiv = newSubskillModalDiv;
        newSubskillModalDiv.childNodes[1].classList.remove('error_border');
        newSubskillModalDiv.childNodes[1].classList.add('input_border');
        subskillModalHolder.appendChild(newSubskillModalDiv);
        subskillModalInput[0].addEventListener("onkeypress", "");
    }

    function modalSave() {

        app.getElement("#error_text").classList.remove('display_block');
        app.getElement("#error_text").classList.add('display_none');
        var mainskill = {};

        var subskill = [];
        var oldNoSkills = 0;
        var oldStars = 0;
        var exists = false;
        var subskillSet = new Set();
        var disableSave = false;
        var existSubskill = false;
        var subskills = app.getElement(".sub_skill_modal_input");
        var mainSkillSet = new Set();
        var flag_modal = app.getElement("#modal1").getAttribute("data-flag");
        var skillModal;
        var isAnyInputEmpty = false;
        var flag = app.getElement(".modal")[0].getAttribute("data-flag");

        var skill_name = app.getElement("#skill_modal").value.toUpperCase();
        if (skill_name.replace(/ /g, '') == "")
            return;
        mainskill.name = skill_name;

        if (flag_modal == "0" || flag_modal == "2") {
            mainSkillSet = skillSetPrimary;
            skillModal = localData.primaryskill;
        } else {
            mainSkillSet = skillSetSecondary;
            skillModal = localData.secondaryskill;
        }
        if (mainSkillSet.has(mainskill.name.toUpperCase())) {
            for (var i = 0; i < skillModal.length; i++) {
                if (skillModal[i].name == skill_name) {
                    mainskill = skillModal[i];
                    subskill = skillModal[i].subskills;
                    oldNoSkills = skillModal[i].no_of_skills;
                    oldStars = skillModal[i].total_stars;
                    for (var j = 0; j < subskill.length; j++) {
                        subskillSet.add(subskill[j].name.toUpperCase());
                    }
                    exists = true;
                }
            }
        }
        mainskill.no_of_skills = parseInt(oldNoSkills);
        mainskill.total_stars = parseInt(oldStars);
        for (var i = 0; i < subskills.length; i++) {
            if (subskillSet.has(subskills[i].value.toUpperCase())) {
                subskills[i].classList.remove('input_border');
                subskills[i].classList.add('error_border');
                app.getElement("#error_text").classList.remove('display_none');
                app.getElement("#error_text").classList.add('display_block');
                disableSave = true;
                existSubskill = true;
            } else {
                subskills[i].classList.remove('error_border');
                subskills[i].classList.add('input_border');
            }
        }
        for (var i = 0; i < subskills.length; i++) {
            if (subskills[i].value == "") {
                isAnyInputEmpty = true;
                break;
            }
        }
        if (!existSubskill && !isAnyInputEmpty) {
            disableSave = false;
            for (var i = 0; i < subskills.length; i++) {
                var sname = {};
                sname.name = subskills[i].value;
                sname.level = "1";
                mainskill.no_of_skills++;
                mainskill.total_stars++;
                subskill.push(sname);
            }
        }
        if (!disableSave) {
            var subskills = app.getElement(".sub_skill_modal_input");
            if (!isAnyInputEmpty) {
                mainskill.subskills = subskill;
                if (!exists) {
                    if (flag == "0" || flag == "2") {

                        localData.primaryskill.push(mainskill);
                    } else {

                        localData.secondaryskill.push(mainskill);
                    }
                }
                app.putObjectById("supervisee", sessionId, localData, function(user) {
                    document.getElementsByTagName('section')[0].removeChild(document.getElementById('dataListPrimary'));
                    document.getElementsByTagName('section')[0].removeChild(document.getElementById('dataListSecondary'));

                    populate(user);
                    var show = app.getElement(".list_element");
                    for (var i = 0; i < show.length; i++) {
                        show[i].addEventListener("click", showSublist);
                        editRating(show[i]);
                    }
                });
                closeModal();
            }
        }
    }

    function closeModal() {
        var j = 0;
        var subskill_items = app.getElement("#subskillholder");
        subskill_items.childNodes[0].value = "";
        subskill_items.childNodes[1].childNodes[1].classList.remove('error_border');
        subskill_items.childNodes[1].childNodes[1].classList.add('input_border');
        for (var i = 0; i < cloneIndex; i++) {
            j++;
            var clone_id = app.getElement("#" + i);
            subskill_items.removeChild(clone_id);
        }
        cloneIndex = 0;
        app.getElement('#error_text').classList.remove('display_block');
        app.getElement('#error_text').classList.add('display_none');


        app.modalDisplayFalse(modal);
        modal.classList.add('display_none');
    }

    function callBackMobileDisplay() {
        if (event.currentTarget.className == 'mob_pskills') {
            mobSkillsDisplay(sskillsSecMob, pskillsSecMob, secondary_focus, primary_focus);
        } else {
            mobSkillsDisplay(pskillsSecMob, sskillsSecMob, primary_focus, secondary_focus);
        }
    }

    function mobSkillsDisplay(skillType1, skillType2, focusType1, focusType2) {
        skillType1.classList.remove('display_block');
        skillType1.classList.add('display_none');
        skillType2.classList.remove('display_none');
        skillType2.classList.add('display_block');
        focusType1.classList.remove('primary_focus');
        focusType2.classList.add('primary_focus');
    }

    helpBtn.addEventListener("click", function() {
        helpModalView.classList.remove('display_none');
        app.modalDisplayTrue(helpModalView)
    })
    helpOkBtn.addEventListener("click", function() {
        app.modalDisplayFalse(helpModalView);
        helpModalView.classList.add('display_none');
    })
    window.addEventListener("click", function() { //when clicked outside the modals should close

        if (!event.target.matches(".inside_modal") && event.target.matches(".modal")) {
            if (helpModalView) {
                helpOkBtn.click();
            }
            if (modal) {
                closeModal();
            }
        }
    });
})();
