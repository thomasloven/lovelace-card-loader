customElements.whenDefined('card-tools').then(() => {
class CardLoader extends cardTools.litElement() {
  setConfig(config) {
    if(!config || !config.wait || !config.card)
      throw new Error("Invalid configuration")

    let ok = true;
    config.wait.forEach((tag) => {
      if(!ok) return;
      if(tag.startsWith("custom:"))
        tag = tag.substr(7);
      if(!customElements.get(tag)) {
        ok = false;
        customElements.whenDefined(tag).then(() => {
          this.setConfig(config);
        });
        this.card = cardTools.createCard({
          type: "error",
          error: `Still waiting for ${tag} to load`,
          config: config,
        });
      }
    });
    if(ok)
      this.card = cardTools.createCard(config.card);
    this.requestUpdate();
    if(this._hass) this.card.hass = this._hass;

  }

  render() {
    return cardTools.litHtml()`
    ${this.card}
    `;
  }

  set hass(hass) {
    this._hass = hass;
    if(this.card) this.card.hass = hass;
  }
}

cardTools.hass.callService('persistent_notification', 'create', {
  notification_id: 'cardloader-deprecation',
  title: 'Deprecated lovelace plugin',
  message: "The `card-loader` plugin you are using was made for a very specific purpose which doesn't exist anymore. At this point, it is hurting your lovelace experience. It's time to let it go.",
});

customElements.define('card-loader', CardLoader);
});

window.setTimeout(() => {
  if(customElements.get('card-tools')) return;
  customElements.define('card-loader', class extends HTMLElement{
    setConfig() { throw new Error("Can't find card-tools. See https://github.com/thomasloven/lovelace-card-tools");}
  });
}, 2000);
