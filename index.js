import {AppRegistry} from 'react-native';
import Login from './src';
import {name as appName} from './app.json';
import bgMessaging from './bgMessaging';

AppRegistry.registerComponent(appName, () => Login);
AppRegistry.registerHeadlessTask('RNFirebaseBackgroundMessage', () => bgMessaging);
