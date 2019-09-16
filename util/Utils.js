/**
 * 公用的工具类（公用的处理方法）
 */
export default class Utils {
    /**
     * 去除非数字
     * @param value
     * @returns {*}
     */
    static clearNoNum(value) {
        //先把非数字的都替换掉，除了数字和.
        value = value.replace(/[^\d.]/g, "");
        //必须保证第一个为数字而不是.
        value = value.replace(/^\./g, "");
        //保证只有出现一个.而没有多个.
        value = value.replace(/\.{2,}/g, ".");
        //保证.只出现一次，而不能出现两次以上
        value = value.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
        return value;
    }

    /**
     * 自动补0，保留两位小数
     * @param value
     * @returns {*}
     */
    static returnFloat(value) {
        if(value === '') return '0.00';
        var value = Math.round(parseFloat(value) * 100) / 100;
        var xsd = value.toString().split(".");
        if (xsd.length == 1) {
            value = value.toString() + ".00";
            return value;
        }
        if (xsd.length > 1) {
            if (xsd[1].length < 2) {
                value = value.toString() + "0";
            }
            return value;
        }
    }
}
