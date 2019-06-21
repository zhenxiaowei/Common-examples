/**
 * Created by Administrator on 2018/5/10.
 */
var fuhao={

};
fuhao.huofang= function () {
    return "馒头"
};
fuhao.chuliliangshi= function () {
    return "面粉"
};
fuhao.mantou= function () {
    this.chuliliangshi();
    this.huofang()
};
fuhao.men= function () {
    return this.mantou()
};