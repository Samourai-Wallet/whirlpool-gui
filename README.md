[![Build Status](https://travis-ci.org/Samourai-Wallet/whirlpool-client-cli.svg?branch=develop)](https://travis-ci.org/Samourai-Wallet/whirlpool-client-cli)
[![](https://jitpack.io/v/Samourai-Wallet/whirlpool-client-cli.svg)](https://jitpack.io/#Samourai-Wallet/whirlpool-client-cli)

# whirlpool-client-gui

Desktop GUI for [Whirlpool](https://github.com/Samourai-Wallet/Whirlpool) by Samourai-Wallet.

## Files
The following files are stored in ```userData``` which varies depending on your OS:
- MacOS: ```~/Library/Application Support/whirlpool-gui```
- Windows: ```%APPDATA%/whirlpool-gui```
- Linux: ```$XDG_CONFIG_HOME/whirlpool-gui``` or ```~/.config/whirlpool-gui```


### Logs
- logs for GUI: ```whirlpool-gui.log```
- logs for CLI (when local): ```whirlpool-cli.log```

### Configuration files
- CLI configuration: ```whirlpool-cli-config.properties```

### System files
- CLI state for wallet: ```whirlpool-cli-state-xxx.properties```
- CLI state for utxos: ```whirlpool-cli-utxos-xxx.properties```



## Development
### Install
- npm (sudo apt install npm)
- yarn (sudo npm install -g yarn) or see www.yarnpkg.com


```
cd whirlpool-gui
yarn
```

### Debug

```
cd whirlpool-gui
yarn dev
```

### Build

```
cd whirlpool-gui
yarn dev
```

## Resources

- [whirlpool](https://github.com/Samourai-Wallet/Whirlpool)
- [whirlpool-protocol](https://github.com/Samourai-Wallet/whirlpool-protocol)
- [whirlpool-client](https://github.com/Samourai-Wallet/whirlpool-client)
- [whirlpool-server](https://github.com/Samourai-Wallet/whirlpool-server)
