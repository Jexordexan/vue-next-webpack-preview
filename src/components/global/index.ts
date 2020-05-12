import { App } from 'vue';
import Button from './Button.vue';
import Modal from './Modal.vue';

export default function install(vueApp: App) {
  vueApp.component('p-button', Button);
  vueApp.component('a-modal', Modal);
}
