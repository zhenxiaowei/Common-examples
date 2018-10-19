
var sweetTitles = {
    x : 10,
    y : 20,
    tipElements : "h1,a,p,div",
    init : function() {
        $(this.tipElements).mouseover(function(e){
            this.myTitle = this.title;
           // this.myHref = this.href;
            //this.myHref = (this.myHref.length > 200 ? this.myHref.toString().substring(0,200)+"..." : this.myHref);
            this.title = "";
            var tooltip = "";
            if(this.myTitle == "")
            {
                tooltip = "";
            }
            else
            {
                tooltip = "<div id='tooltip'><p>"+this.myTitle+"</p></div>";
            }
            $('body').append(tooltip);
            $('#tooltip')
                .css({
                    "opacity":"0.8",
                    "top":(e.pageY+20)+"px",
                    "left":(e.pageX+10)+"px"
                }).show('fast');
        }).mouseout(function(){
            this.title = this.myTitle;
            $('#tooltip').remove();
        }).mousemove(function(e){
            $('#tooltip')
                .css({
                    "top":(e.pageY+20)+"px",
                    "left":(e.pageX+10)+"px"
                });
        });
    }
};
$(function(){
    sweetTitles.init();
});