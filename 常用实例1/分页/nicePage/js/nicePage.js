window.nicePage = {
    table: "div",
    bar: "bar",
    limit: "10",
    color: "#1E9FFF",
    layout: ["count", "prev", "page", "next", "limit", "skip"],
    setCfg: function (b) {
        nicePage.table = b.table;
        nicePage.bar = b.bar;
        nicePage.limit = b.limit;
        nicePage.color = b.color;
        nicePage.layout = b.layout
    },
    returnHtml: function (g, e) {
        var h = '<table class="layui-table" lay-size="sm"><colgroup>';
        for (var f in e) {
            h += " <col width=" + e[f] + ">"
        }
        h += " </colgroup><thead><tr>";
        for (var f in g) {
            h += "  <th>" + g[f] + "</th>"
        }
        h += " </tr></thead> <tbody>";
        return h
    },
    returnList: function (j) {
        var h = new Array();
        for (var f in j) {
            var x=Number(f)+1;
            var i = x+"_";
            for (var g in j[f]) {
                i += j[f][g] + "_"
            }
            i = i.substring(0, i.length - 1);
            h.push(i)
        }
        return h
    },
    returnTable: function (e) {
        var h = e.split("_");
        var g = "<tr>";
        for (var f in h) {
            g += "<td>" + h[f] + "</td>"
        }
        g += "</tr>";
        return g
    }
};
