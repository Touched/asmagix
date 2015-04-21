# ASMAGIX

## Introduction
ASMAGIX is a command line tool assembly hackers can use to quickly modify code in a GBA ROM, with as little hassle as possible. Stop repetitive tasks getting in the way of your ASMAGIX.

## Features
- Automatically inserts your code into free space
- Apply hooks, overwrite existing code, etc. using simple comment directives.
- Scaffolds your ASM project
- Development mode watches for changes to your ASM files and automatically assemble and insert
- Start at emulator automatically

## Installation
First install DevkitARM and ensure its binaries are in your path.
If you have Node.js and NPM, you can just:
````bash
npm install -g asmagix
````

## Config
The *asmagixfile* holds the configuration information for your project. Place a file in the root of your project called `asmagixfile.json`. An asmagixfile resembles the following:

````json
{
  "src": "./src",
  "roms": {
    "bpre": "./roms/bpre.gba"
  },
  "default": "bpre",
  "build": "./build"
}
````

`src` - Holds the source code for your project. All .s and .asm files in this directory will be assembled when you run the build action.
`roms` - This is a key-value structure with a name as the key and a path as the value. When running actions you can choose a ROM from this list. The assembler is also passed the (uppercase) name so you can do conditional assembly.
`default` - The default key in the structure above.
`build` - Any output from the tool is placed here.

## Usage
Navigate into the directory containing your asmagixfile and run:

`asmagix $action $action` - where `$action` is one of the actions below and `$rom` is the optional key in the roms field in your asmagixfile. The default will be used if this is not present.

| Action | Description |
|--------|-------------|
| build  | Assembles everything and inserts it into your target ROM. |
| dev    | Watches source files for changes and runs `build` for your target ROM if it sees anything. |
| init   | Creates a basic project for you. You are responsible for populating the ROMS directory. |

## Directives
At the very top of each file in your source directory, you need to place comment directives in order to tell ASMAGIX what to do with the file. Comment directives look like

````asm
@@directiveName parameters

@ ...
````

Directives are allowed parameters. Directives that are just integers can be replaced with ASM constants (defined with `.equ` or similar) and ASMAGIX will automatically replace them.

### ignore
`@@ignore` - The ignore directive takes no parameters and simply tells ASMAGIX to skip processing this file entirely.

### action
`@@action NAME PARAMETERS` - The action directive is a collection of directives that control the way the file is inserted.

#### hook
`@@action hook OFFSET REGISTER MODE` - The hook action takes three parameters - an offset to place the hook code at, a (low) register number to use in this code (default 0) and the mode: "arm" or "thumb" (default is "thumb").
Examples:

- `@@action hook 0xDEADBEEF 0 arm` - select ARM mode
- `@@action hook 0xDEADBEEF 3` - select r3 to hook in
- `@@action hook 0xDEADBEEF` - defaults to r0 and thumb mode

#### insert
`@@action insert` - The insert action takes no parameters and simply inserts the code in free space. If you don't specify an action, ASMAGIX will default to this one.

## Direction
This is still in its early stages. I may eventually make some sort of package manager feature that allows easy installing of projects like this.