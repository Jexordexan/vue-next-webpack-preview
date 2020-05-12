<template>
  <div>
    <teleport to="#endofbody">
      <div class="modal fixed w-full h-full top-0 left-0 flex items-center justify-center" v-if="visible">
        <div class="modal-overlay absolute w-full h-full bg-gray-900 opacity-50" @click="close"></div>

        <div class="modal-container bg-white w-11/12 md:max-w-md mx-auto rounded shadow-lg z-50 overflow-y-auto">
          <button
            class="modal-close absolute top-0 right-0 cursor-pointer flex flex-col items-center mt-4 mr-4 text-white text-sm z-50"
            @click="close"
          >
            <svg
              class="fill-current text-white"
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 18 18"
            >
              <path
                d="M14.53 4.53l-1.06-1.06L9 7.94 4.53 3.47 3.47 4.53 7.94 9l-4.47 4.47 1.06 1.06L9 10.06l4.47 4.47 1.06-1.06L10.06 9z"
              ></path>
            </svg>
            <span class="text-sm">(Esc)</span>
          </button>
          <div class="modal-content p-3">
            <slot />
          </div>
          <slot />
        </div>
      </div>
    </teleport>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  props: {
    visible: [Boolean, String, Number, Object],
  },
  setup(props, { emit }) {
    return {
      close: () => emit('close'),
    };
  },
});
</script>
