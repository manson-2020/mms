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
    /**
     * 日期格式化
     * @param date（日期）
     * @param fmt（格式化的格式字符串，类似于 yyyy-MM-dd hh:mm:ss 这种组合）
     * @returns {string}（格式化后的日期）
     */
    static format(date, fmt = 'yyyy-MM-dd hh:mm:ss') {
        let gDate = new Date(date);
        const o = {
            "M+": gDate.getMonth() + 1,                 //月份
            "d+": gDate.getDate(),                    //日
            "h+": gDate.getHours(),                   //小时
            "m+": gDate.getMinutes(),                 //分
            "s+": gDate.getSeconds(),                 //秒
            "q+": Math.floor((gDate.getMonth() + 3) / 3), //季度
            "S": gDate.getMilliseconds()             //毫秒
        };
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (gDate.getFullYear() + "").substr(4 - RegExp.$1.length));
        }
        for (var k in o) {
            if (new RegExp("(" + k + ")").test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            }
        }
        return fmt;
    }
}
