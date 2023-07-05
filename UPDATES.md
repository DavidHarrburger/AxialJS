# AxialJS UPDATES

Find here what happened and when.

## 2023 - 07 - 05

Add commands tu run Electron and Electron Forge from axial.<br><br>

**IMPORTANT NOTES** 
* Tested only on Windows 11
* Very basic scope
* Not a lot of "make" options ;)
* Please refer to [Electron](https://www.electronjs.org/) docs and [Electron Forge](https://www.electronforge.io/) docs.<br>

Commands :<br>

* ```axial electron ``` || ```axial electron -start``` to start the app. Run ```axial build -prod``` before ;)
* ```axial electron -package``` to package the app.
* ```axial electron -make``` to make the app. 

## 2023 - 06 - 30

Basic Electron JS scope ! Add package.json for electron, main.js et preload-main.js.

## 2023 - 06 - 29

Minor update : change pathes in the ```axial init``` command.

## 2023 - 06 - 28 

Add parameters to the ```axial init``` command. By default, axial init will just create a front-end page with its compilation logic.<br>
You can now pass the followings parameters (they speak by theirself) :
* ```axial init -front``` : default
* ```axial init -server``` : to add a basic node server running with express. Later, I will have the complete WebAdmin Page.
* ```axial init -electron``` : to create a programm with electron