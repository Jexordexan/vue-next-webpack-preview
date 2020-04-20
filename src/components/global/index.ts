import { App } from 'vue';
import Button from './Button.vue';

export default function install(vueApp: App) {
  vueApp.component('p-button', Button);
}
