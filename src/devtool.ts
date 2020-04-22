// const target: any = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : {};
// const devtoolHook = target.__VUE_DEVTOOLS_GLOBAL_HOOK__;

// export default function devtoolPlugin(state: any) {
//   if (!devtoolHook) return;

//   const store = {
//     state,
//     replaceState: console.log,
//     _devtoolHook: devtoolHook,
//   };

//   devtoolHook.emit('vuex:init', store);

//   devtoolHook.on('vuex:travel-to-state', (targetState: any) => {
//     store.replaceState(targetState);
//   });

//   subscribe(state, (mutation, state) => {
//     devtoolHook.emit('vuex:mutation', mutation, state);
//   });
// }
