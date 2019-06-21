
!
    function(t, i) {

        "function" == typeof define && define.amd ? define(["jquery"], i) : "object" == typeof exports ? module.exports = i() : t.loadingmodal = i(window.Zepto || window.jQuery || $)
    } (this,
        function(t) {

            var i = function(t) {
                t = t || {},
                    this.loadingTpl = t.loadingTpl || this.loadingTpl,
                    this.target = t.target || "html",
                    this.bindEvent()
            };
            return i.prototype = {
                version: "0.1.0",
                author: "OvO",
                defaults: {},
                loadingTpl: '<div class="loadingmodal"><div class="loadingmodal-mask"></div><i></i></div>',
                stop: function() {
                    t(this.target);
                    this.loading.remove()
                },
                start: function() {
                    var i = this,
                        o = i.target,
                        d = t(o),
                        n = this.loading;
                    n || (n = t(i.loadingTpl), t("body").append(n)),
                        this.loading = n;
                    var e = t(d).outerHeight(),
                        h = t(d).outerWidth();
                    "HTML" == t(o)[0].tagName && (e = Math.max(t(o).height(), t(window).height()), h = Math.max(t(o).width(), t(window).width())),
                        n.height(e).width(h),
                        n.find("div").height(e).width(h),
                    100 > e && n.find("i").height(e).width(e);
                    var a = t(d).offset();
                    n.css({
                        top: a.top,
                        left: a.left
                    });
                    var w = n.find("i"),
                        s = e,
                        l = h,
                        g = 0,
                        r = 0;
                    "HTML" == t(o)[0].tagName ? (s = t(window).height(), l = t(window).width(), g = (s - w.height()) / 2 + t(window).scrollTop(), r = (l - w.width()) / 2 + t(window).scrollLeft(), t(window).resize(function() {
                        s = t(window).height(),
                            l = t(window).width(),
                            g = (s - w.height()) / 2 + t(window).scrollTop(),
                            r = (l - w.width()) / 2 + t(window).scrollLeft(),
                            w.css({
                                top: g,
                                left: r
                            }),
                            n.height(s).width(l),
                            n.find("div").height(s).width(l)
                    })) : (g = (s - w.height()) / 2, r = (l - w.width()) / 2),
                        w.css({
                            top: g,
                            left: r
                        })
                },
                bindEvent: function() {
                    var i = this;
                    t(this.target).on("stop",
                        function() {
                            i.stop()
                        })
                }
            },
                i
        });