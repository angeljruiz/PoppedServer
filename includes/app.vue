import Sortable from 'sortablejs'

Vue.directive('sortable', {
  inserted: function(el, binding, vnode) {
    let arr = binding.value || null
    let options = {}
    if (arr) {
      options.onUpdate = function(e) {
        arr.splice(e.newIndex, 0, arr.splice(e.oldIndex, 1)[0])
      }
    }
    Sortable.create(el, options)
  }
})
