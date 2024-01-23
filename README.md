# AxialJS

Axial JS is a small Javascript fullstack framework. 
This framework is under development but you can test it and have fun with it.
See the [Roadmap](##Roadmap) below to know what's goin' on!

## Installation

Below the basic infos you need to start with Axial. Here you will install the framework. <br>

* Install Node JS : [https://nodejs.org/](https://nodejs.org/)
* Download and save this repository on your local hard drive, unzip
* From the directory where you have unzipped Axial, run the following command to install the framework globally
```
npm install -g
```
<br>

* Now create a new directory (for example, MyFirstAxialProject)
* From this directory, run the following command
```
axial init
```
<br>

* Run the following command to add the required dependencies (most of them for the server side)
```
npm install
```
<br>

* You now have a local server that you can start:
```
npm start
```
<br>

* Still on the same directory (MyFirstAxialProject), run this command to build the pages and your web admin.
```
axial build
```
<br>

* Run the following commmand to "upload" the files on the local server (the ```static``` folder as default)
```
axial upload
```
<br>

* Open your browser, navigate to localhost to check your homepage.


***You are ready to have fun, see the [Getting Started](##GettingStarted) section to learn how to create new pages and build them!***

## Roadmap
* Move to Vite instead of webpack
* Remove Less to go only w/ pure css
* Add SSH and FTP support in the configuration file (to upload your build once it is created)
* Finalize basic Web components (Calendar, Dropdown ...)
* Add Database MongoDB start script

## Getting Started
