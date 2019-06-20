define(['vue', 'VueDatepickerLocal'], function (Vue) {
    let vm=new Vue({
        el: "#app",
        data: {
            timeRange: [new Date(2017, 5, 1, 0, 0, 0), new Date(2017, 8, 30, 0, 0, 0)],
        },
        methods: {
            disabledDate (time) {
                return time < this.min || time > this.max
            },
            change (val) {
                console.log(val)
            }
        }

    })
})