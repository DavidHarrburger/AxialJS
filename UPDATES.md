# AxialJS UPDATES

Find here what happened and when.

## 2024 - 03 - 13 

* AxialMessageForm little review
* Add stat in backend and front  - not finished yet
* Intro / outro experimental layer

## 2024 - 02 - 26 
Mainly a front-end update
* Rework the base structure of the pages to have fixed header and whole scrolling, scope for sroll parallax
* Rework lifecycle of web components
* Remove unused packages and classes
* Move ```admin``` package to ```form``` and add ```AxialSignoutButton```
* Add ```AxialTickerBase``` class in the ```effect``` package

## 2024 - 01 - 23 - Hello 3D!
First, 1001 thanks to the 3D Community for your amazing work. Especially Three.js Community. You simply rocks and integrating your work in small framework is a real pleasure.
I would like to especially thanks Mr Doob, creator of Three.js and Bruno Simon, creator of the Three JS Journey that i strongly recommend to 3D newbie :)
Particles by Kenney
Dependencies to add: ```npm install three gsap lil-gui```

### Front-end
Please note that are more experimental (even if it works like a charm a saved me a lot of time)
* ```Axial3DViewer```, ```Axial3DGroup``` and ```Axial3DUtils``` can be now found in the axial/js/3d package.
* New 3d Template page (see below for the templates) available as 'three'

### Back-end
* ```axial-server``` package here where you can define your constants
* ```CryptoUtils``` just supports ```aes-256-cbc```

<span style="color: #f00; background-color: #dedede; padding: 4px; font-weight: bold; border-radius: 3px;">&#128680; WARNING : I'm not at all a Security expert, a Crypto expert etc. So please check all this stuff with a professionnal.</span>

## 2023 - 11 - 03
* Create a new page from the template/pages folder : ```axial newpage -name name_of_the_page -template base -path distant_path```
* Front-end : new components and styles to design websites faster

## 2023 - 10 - 09

* Add first routes into the back end and remove less.css vars.
* Add Raleway font
* Add first back-end components<br><br>


## 2023 - 09 - 22

Update packages with latest versions (important security fix in electron).<br>
Add AxialNotifier into front-end framework.<br><br>

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

Basic Electron JS scope ! Add package.json for electron, main.js et main-preload.js.

## 2023 - 06 - 29

Minor update : change pathes in the ```axial init``` command.

## 2023 - 06 - 28 

Add parameters to the ```axial init``` command. By default, axial init will just create a front-end page with its compilation logic.<br>
You can now pass the followings parameters (they speak by theirself) :
* ```axial init -front``` : default
* ```axial init -server``` : to add a basic node server running with express. Later, I will have the complete WebAdmin Page.
* ```axial init -electron``` : to create a programm with electron