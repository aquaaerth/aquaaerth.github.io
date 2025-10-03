# AquaEarth Secure Login – Changelog

## v3.9
- Revert: removed auto-launch after refresh.
- On refresh with session, show Welcome + Launch/Logout (manual launch).
- Kept session persistence until logout; launch opens in new window.

## v3.8
- Added `launchApp()` reusable function for app launch.
- On refresh, if user is still logged in, app auto-launches immediately.
- Unified logging for both manual launch and auto-launch.

## v3.7
- Added footer in `index.html` with version + changelog link.
- Synced version constant in `home.js` with footer display.
- Console logs version on load.

## v3.6
- Auto-launch app instantly on page refresh if logged in.
- Centered login/welcome UI.
- Maintained footer positioning at bottom.

## v3.5
- Kept user logged in until logout is pressed.
- On refresh, reloads resource automatically.
- Added Logout button.

## v3.4
- Welcome page after login with “Launch AquaEarth” button.
- Legal agreement prompt runs only at Launch.
- If declined, app does not load.

## v3.3
- Packaged project with index.html, home.js, bump-version.js, and changelog.
- Added automated versioning support.
