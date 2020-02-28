# KeepTrack - Gift-List Organiser
KeepTrack allows users to register and create an account that will enable them to create an event and
provide guests with the ability to see which presents you would like.

## Getting Started
There are several steps in order to start the server and access the website.

### Prerequisites
* Node Js - Latest Version
* Mysql Workbench / Notifier / Server

### Installing

#### Starting the MySQL Server
Open up MySQL Notifier and Start the Server. 
This should be shown as Localhost.

#### Open MySQL Workbench and Import Database.
Open MySQL Workbench and find Server and click on Data Import.
Use Import from Self-Conntained File.
Find the Dump file and import to the Workbench.
Once loaded everything should be working with the Database and can be left running.

### Starting NodeJs
Open File Explorer.
Find the Folder app which is inside the UserSystem directory.
Type CMD into the Browser on the folder as this will start CMD from the directory.

Firstly all Node Modules need to be installed.
```
npm install --save
```
This will download all Modules needed.

Secondaly install Nodemon as this will be sued to refresh the Server everytime an update is made.
```
npm install -g nodemon
```
This will be installed as a global.

Finally starting the NodeJs server and accessing the Website.
```
nodemon
```
The website will be accesable on http://localhost:3000/
All errors or console logs will be displayed in the CMD Prompt.

### Version
1.0.0-alpha

## Author
Provide your names here
* Kenneth Dayman

## References
