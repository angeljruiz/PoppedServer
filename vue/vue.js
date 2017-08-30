var vm = new Vue({
  el: '#main',
  data: {
    title: 'Vue instance'
  },
  methods: {
    deleteMessage: (id) => {
      console.log(id);
    },
    hover: () => {
      event.target.classList.toggle('selected');
    }
  }
});
