/**
 * Created by seal on 1/9/18.
 */
;(function () {
    'use strict';

    var Event = new Vue();

    var alert_sound = document.getElementById('alert-sound');
    function copy(obj) {
        return Object.assign({}, obj)
    }
    Vue.component('task', {
        template: '#task-tpl',
        props: ['todo'],
        methods: {
            action: function (name, params) {
                Event.$emit(name, params)
            }
        }
    })
    new Vue({
       el: '#main',
       data: {
           list: [],
           last_id: 0,
           current: {}
       },
       mounted: function () {
           var me = this;
           this.list = ms.get('list') || this.list;
           this.last_id = ms.get('last_id') || this.last_id;
           Event.$on('remove', function (id) {
               if (id) {
                   me.remove(id);
               }
           });
           Event.$on('toggle', function (id) {
               if (id) {
                   me.toggleComplete(id);
               }
           });
           Event.$on('update', function (todo) {
               if (todo) {
                   me.setCurrent(todo);
               }
           });
           Event.$on('toggle_detail', function (todo) {
               if (todo) {
                   me.toggle_detail(todo);
               }
           });
           setInterval(function () {
               me.checkAlerts();
           }, 1000)
       },
       methods: {
           merge: function () {
               var is_update, id;
               is_update = id = this.current.id;
               if (is_update) {
                    var index = this.findIndexById(id)
                   Vue.set(this.list, index, copy(this.current));
               } else {
                   var title = this.current.title;
                   if (!title && title !== 0) return;
                   var todo = copy(this.current);
                   this.last_id ++;
                   ms.set('last_id', this.last_id);
                   todo.id = this.last_id;
                   this.list.push(todo);
               }
               this.resetCurrent()
           },
           checkAlerts: function() {
               var me = this;
               this.list.forEach(function (row, i) {
                   var alert_at = row.alert_at
                   if (!alert_at || row.alert_confirmed) return;

                   var alert_at = (new Date(alert_at)).getTime();
                   var now = (new Date()).getTime();
                   if (now >= alert_at) {
                       var confirmed = confirm(row.title)
                       Vue.set(me.list[i], 'alert_confirmed', confirmed);
                       alert_sound.play();
                   }

               })
           },
           remove: function (id) {
               var index = this.findIndexById(id)
               this.list.splice(index, 1);
           },
           next_id: function () {
               return this.list.length + 1;
           },
           setCurrent: function (todo) {
               this.current = copy(todo);
           },
           resetCurrent: function () {
               this.setCurrent({});
           },
           findIndexById: function (id) {
               return this.list.findIndex(function(item) {
                   return item.id === id;
               })
           },
           toggleComplete: function (id) {
               var i = this.findIndexById(id)
               Vue.set(this.list[i], 'completed', !this.list[i].completed)
           },
           toggle_detail: function (id) {
               var index = this.findIndexById(id);
               Vue.set(this.list[index], 'show_detail', !this.list[index].show_detail)
           }
           
       },
       watch:{
           list: {
               deep: true,
               handler: function (n, o) {
                   if (n){
                       ms.set('list', n);
                   } else {
                       ms.set('list', [])
                   }
               }
           }
       }
    });
})();