import { createApp } from 'vue';
import './main.css';
import App from './App.vue';
import addComponents from './components/global';

const app = createApp(App);

addComponents(app);

app.mount('#app');
