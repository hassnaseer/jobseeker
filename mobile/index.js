/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { registerBackgroundHandler } from './src/notifications/pushNotifications';

// Must run before registerComponent so FCM messages are handled while the app
// is backgrounded or killed, not just while a JS instance is already running.
registerBackgroundHandler();

AppRegistry.registerComponent(appName, () => App);
