var bgPx = {
    listToArray: function (aa) {
        try {
            return Array.prototype.slice.call(aa, 0);
        } catch (e) {
            var ary = [];
            for (var i = 0; i < aa.length; i++) {
                ary[ary.length] = aa[i];
            }
            return ary;
        }
    },
    jsonParse: function (bb) {
        return "JSON" in window ? JSON.parse(bb) : eval("(" + bb + ")");
    }
}
