#!/usr/bin/env node

/// node imports
//import process from "process";

/// axial imports
import AxialCommands from "./commands/AxialCommands.js";

console.log("hello axial cli");
//console.log( process.argv );
//console.log( process.cwd());

const AXIAL_COMMANDS = new AxialCommands();
