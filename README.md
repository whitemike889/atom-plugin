Kite for Atom
=============

This is the private repository with the plugin sources. The public version can be found in the [atom-plugin-public repository](https://github.com/kiteco/atom-plugin-public).

As long as this repository is private **never publish the package from here** (see more on publication below).

## Installation

To setup the development environment run the following commands:

```sh
git clone git@github.com:kiteco/atom-plugin.git
apm install
npm run setup
```

The `npm run setup` command will create a `public` directory in the project that will be a clone of the `atom-plugin-public` repository.

## Testing Your Local Changes

Run `apm link` in the private plugin directory and reload Atom.

## Testing The Public Version

Run `apm link` in the plugin plugin directory and reload Atom.

## Build The Public Plugin

Run the `npm run publish:prepare` command to copy all the files and obfuscate the sources into the `public directory`.

This command does not publish anything yet, it's just updating the public directory with the latest code and assets.

## Publish A New Version

To publish a new version of the public plugin a few operations are required, which are packaged in the `npm run publish:*` commands.

In a nutshell:

1. The `publish:prepare` command will be run, copying the assets and obfuscating the sources in the public directory.
2. The `package.json` file of the public plugin will be updated with the latest changes from the private one through the `package:public` command. Fields like `dependencies` and atom related fields will be updated using the private `package.json` as the source of trust.
3. Then the changes are committed using the `commit:public` command.
4. The new version is then published through `apm publish` and the version argument corresponding to the npm script used initially.
5. Once published, the new package's version is then copied back to the private `package.json` file, a new commit is created and tagged with that version so that the private and public repositories tags stay in sync. All of this is done using the `commit:private` command.
