var staffProject = function() {
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
        
        key_name = 'staff-' + obj.name
		saveToDb && db_staff.set(key_name, obj);
	}
};

// 本地 key-value 数据库操作
class localDatabaseStaff {
    constructor() {
    }
    isempty() {
        if (localStorage.length == 0)
            return true
        else {
            var k = '', cnt = 0
            for (var i =0, l = localStorage.length; i < l; i++) {
                k = localStorage.key(i);
                if (k.indexOf('staff-') >= 0) {
                    return false
                }
            }
            return true
        }
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
            if (k.indexOf('staff-') >= 0) {
                val = this.item(k);
                if (val)
                    rList.push(val);
                    // console.log(val);
            }
        }
        return rList;
    }
    clear() {
        var k ='';
        for (var i =0, l = localStorage.length; i < l; i++) {
            k = localStorage.key(i);
            if (k.indexOf('staff-') >= 0) {
                this.del(k)
            }
        }
    }
    del(k) {
        localStorage.removeItem(k);
    }
}
