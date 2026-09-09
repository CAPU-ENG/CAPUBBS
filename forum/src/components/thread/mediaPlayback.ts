// Shared by inert HTML preparation and the isolated document's runtime bridge.
export function disableMediaAutoplay(root: ParentNode) {
  root.querySelectorAll<HTMLMediaElement>('audio[autoplay], video[autoplay]').forEach((media) => {
    media.removeAttribute('autoplay');
  });
  root.querySelectorAll<HTMLIFrameElement>('iframe').forEach((frame) => {
    const permissions = (frame.getAttribute('allow') || '').split(';')
      .map((permission) => permission.trim()).filter((permission) => permission && !/^autoplay(?:\s|$)/i.test(permission));
    permissions.push("autoplay 'none'");
    const allow = permissions.join('; ');
    if (frame.getAttribute('allow') !== allow) frame.setAttribute('allow', allow);
  });
}

// Install before embedded scripts run. A user gesture can start custom controls;
// later resume calls on that media remain available without enabling other media.
export function installMediaPlaybackGuard() {
  const permitted = new WeakSet<HTMLMediaElement>();
  const play = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function () {
    if (navigator.userActivation?.isActive) permitted.add(this);
    if (!permitted.has(this)) return Promise.reject(new DOMException('Playback requires user interaction.', 'NotAllowedError'));
    return play.call(this);
  };
  document.addEventListener('play', (event) => {
    const media = event.target;
    if (!(media instanceof HTMLMediaElement)) return;
    if (navigator.userActivation?.isActive) permitted.add(media);
    if (!permitted.has(media)) media.pause();
  }, true);
  // Native controls can dispatch play after transient activation has expired.
  const permitNativeControl = (event: Event) => {
    if (event.isTrusted && event.target instanceof HTMLMediaElement) permitted.add(event.target);
  };
  document.addEventListener('pointerdown', permitNativeControl, true);
  document.addEventListener('keydown', permitNativeControl, true);
}
