Competency Matrix is a tool for SUpervisors to check the supervisees under them.
Supervisors can see the skills each of the supervisees possess, and can also add new skills for them and also edit the level of knowledge they possess.

To start working on this:

***Installation

1. First Node Js Server needs to be installed. Use the below link
     	https://nodejs.org/en/
2. Download the current version and Install.
3. Go to Command Prompt and type the command 
	npm install -g json-server

***Starting the Server

1.For Client server
	Go to the directory containing all the files. Open in Command Propmt and type the command - 
	npm start
 	This will start the client side server.

2.For Database Server
	Go to the directory containg the database file and open the command prompt. Type the command -
   	json-server --watch databasename.json
	Note : write the name of your json file in place of "databsename"
	This will start the json-server

***Running the application

Step0: Go to browser and enter the URL- http://localhost:3001

Step1: Logging in. A supervisor can login using his/her User ID and the associated password. After a successful login he/she will be taken to his/her dashboard from where he/she could edit his/her profile, and also his/her supervisees' profile. He/she could also delete his/her supervisees.--> Step3

Step2: If login was not success, the supervisor could press on forgot password and then enter his/her user ID to request a new password which will be sent to his/her registered email id.-->Step1

Step3: The supervisor can click on any supervisee to visit the competency dashboard of that supervisee. Here he/she could see all the skills that the supervisee has. Supervisor could add a new skill for a supervisee and can also edit the level of the skills.

Step4: Any change in the competency matrix triggers an email with the changes mentioned sent to the supervisee and the supervisor both.

Step5: After the work is done supervisor can logout after clicking on his/her image on the header.