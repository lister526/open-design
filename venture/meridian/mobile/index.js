import { registerRootComponent } from 'expo';
import App from './App';

// Entry point. Expo will call registerRootComponent, which wraps App and
// mounts it — works in native (iOS/Android) and Expo Web alike.
registerRootComponent(App);
