<template>
  <input
    type="text"
    :value="modelValue"
    @input="update"
    class="bg-white focus:outline-none focus:shadow-outline border border-gray-300 rounded-lg py-2 px-4 appearance-none leading-normal"
  />
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    modelValue: String,
  },
  setup(props, { attrs, emit }) {
    console.log('props', props);
    console.log('attrs', attrs);

    return {
      log: console.log,
      update: (e: InputEvent) => emit('update:modelValue', e.target.value),
    };
  },
});
</script>
