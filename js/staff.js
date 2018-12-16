var staffProject = function() {
    this.levels = ['幸运奖', '三等奖', '二等奖', '一等奖', '特等奖'];
    
    this.init = function() {
        var staffList = db_staff.list();
        
		for(var i = 0, l = staffList.length; i < l; i++) {
			this.staffListAdd(staffList[i]);
		}
    };
}

staffProject.prototype = {
    staffListAdd: function(obj, saveToDb) {
		if( $("#staff_list .list div[name='"+obj.name+"']").length ) return;
		
		var html = '<tr><td name="'+obj.name+'">'
			+ obj.name
            + '</td>'
            
        html += '<td number="'+obj.number+'">'
            + obj.number
            + '</td>'

        html += '<td enable="'+obj.enable+'">'
            + (obj.enable == "on"? "是": "否")
            + '</td></tr>'

		// html +=
		// 	+ '<td><input name="boxs" type="checkbox" />'
		// 	+ '</td></tr>';

		$("#staff_list .list").prepend(html);
		
		saveToDb && db_staff.set(obj.name, obj);
	}
};

// 本地 key-value 数据库操作
class localDatabaseStaff {
    constructor() {
    }
    staff_list() {
        var staff_users = '';
        for (var i =0, l = localStorage.length; i < l; i++) {
            staff_users += localStorage.key(i).replace('\t', '') + ",";
            //staff_users += "抽奖"+i+",";
        }
        staff_users = staff_users.substr(0, staff_users.length-1);
        return staff_users;
    }
    isempty() {
        if (localStorage.length == 0)
            return true
        else
            return false
    }
    item(k) {
        var val = localStorage.getItem(k);
        if (!val)
            return null;
        try {
            val = JSON.parse(val);
        }
        catch (e) {
            console.log(e);
            val = val;
        }
        return val;
    }
    set(k, val) {
        try {
            if (typeof (val) != 'string')
                val = JSON.stringify(val);
            localStorage.setItem(k, val);
        }
        catch (e) {
            console.log(e);
        }
    }
    list() {
        var k ='', val = null, rList = [];
        for (var i =0, l = localStorage.length; i < l; i++) {
            k = localStorage.key(i);
            val = this.item(k);
            if (val)
                rList.push(val);
        }
        return rList;
    }
    clear() {
        localStorage.clear();
    }
    del(k) {
        localStorage.removeItem(k);
    }
}
