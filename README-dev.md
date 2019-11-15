# whirlpool-client-gui development


## Developers usage
### Install
- npm: sudo apt install npm
- yarn: sudo npm install -g yarn (or see www.yarnpkg.com)


```
cd whirlpool-gui
yarn
```

### Start in debug mode
GUI will look for a local CLI jar in from `DL_PATH_LOCAL` directory. 
Edit this path for your own needs.
```
cd whirlpool-gui
yarn dev
```

### Start in standard mode
GUI will automatically download CLI.
```
cd whirlpool-gui
yarn start
```

### Build

```
cd whirlpool-gui
yarn package
```
