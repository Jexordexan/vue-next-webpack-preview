import { App } from 'vue';
import Button from './Button.vue';
import Modal from './Modal.vue';
import TextInput from './TextInput.vue';

export default function install(vueApp: App) {
  vueApp.component('a-button', Button);
  vueApp.component('a-modal', Modal);
  vueApp.component('a-text-input', TextInput);
}
