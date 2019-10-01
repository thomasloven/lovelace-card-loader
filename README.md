# card-loader

# DEPRECATED
## This card was created to work around a very specific problem with very few custom lovelace cards until the developers could fix them.
## There should be no reason to use it anymore.

A fix for custom cards wrapping other custom cards not loading correctly.

This card requires [card-tools](https://github.com/thomasloven/lovelace-card-tools) to be installed.

For installation instructions [see this guide](https://github.com/thomasloven/hass-config/wiki/Lovelace-Plugins).

## Options
| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| wait | list | **Required** | List of cards to wait for
| card | object | **Required** | Card configuration

# The problem
- When you load a view, lovelace gets bussy putting stuff on the screen. You should have a working view as soon as possible.
- Plugins like custom cards have a lower priority at this point, and any custom cards are replaced with a placeholder.
- When the initial loading is done, lovelace starts loading in custom plugins, and replacing the cards when a plugin loads.
- This might mean that if a custom card wraps another custom card, the outside card may be loaded before the inside one exists, which may cause it to crash if it's not programmed to set up placeholders in the same way.

## Why did it work before?
Before Home Assistant version 0.86, when a custom plugin was loaded, the *entire* view was rebuilt from scratch. This took a lot of time, and during this time other plugins kept loading in. By pure luck, this was often enough to avoid the problem above.
Unfortunately, this approach caused the entire view to flash several times during loading, and with the recent speed improvements to lovelace, it was only a matter of time before this race condition would start causing problems anyway.

# The solution
## For users
If you have a custom card which is acting up and you know it takes another card inside it, this might be the solution.
The problem is often characterized by the card not working on first load, but if you navigate to another view and then back, it suddenly appears.

Simply wrap your card with this and add a list of which cards should be loaded before lovelace attempts to put the card in the view.

E.g. the otherwise excelent [`vertical-stack-in-card`](https://github.com/custom-cards/vertical-stack-in-card) by Ofek Ashery is known to have this problem if used to display other custom cards such as [`mini-media-player`](https://github.com/kalkih/mini-media-player)

The config for this setup would normally look something like this:

``` yaml
type: custom:vertical-stack-in-card
cards:
  - type: custom:mini-media-player
    entity: media_player.kitchen
  - type: custom:mini-media-player
    entity: media_player.bathroom
```

To make sure that both `mini-media-player` and `vertical-stack-in-card` is loaded, change the config to this:

```yaml
type: custom:card-loader
wait:
  - vertical-stack-in-card
  - mini-media-player
card:
  type: custom:vertical-stack-in-card
  cards:
    - type: custom:mini-media-player
      entity: media_player.kitchen
    - type: custom:mini-media-player
      entity: media_player.bathroom
```

## For card developers

For inspiration on how to handle not-yet-existing elements, you can look at [how card-tools does it](https://github.com/kalkih/mini-media-player) (specifically lines 89 and forward.

The easy way out is to simply add `card-tools` to your project. See [card-tools](https://github.com/thomasloven/lovelace-card-tools) for information on how to do that, or you could take inspiration from how `card-tools` does it and implement your own version.

> If you don't catch the `ll-rebuild` event it will fall through all the way down to the lovelace view and your entire card will be rebuilt. If you don't want this to happen, you can catch it and rebuild the card yourself.
