var lotteryProject = function() {
	this.users = [];
	this.count = 0;
	this.history = {};
	this.userSize = 12;
	this.usernames = [];
	
	this.levels = ['幸运奖', '三等奖', '二等奖', '一等奖', '特等奖'];
	this.nowLevel = 0;
	
	this.mx = canvas.width/2;
	this.my = canvas.height/2;
	this.radius = this.mx-20;
	this.fSize = 26;
	this.word = {width:27, height:32}; // 文字宽度 和 高度
	
	this.arcRecoup = -0.078;
	this.proportion = 3/2;
	
	this.winner = -1;
	
	this.nowIndex = 0;
	this.minSpeed = 600;
	this.maxSpeed = 30;
	this.acceleration = 80;
	this.speedMode = true;
	this.speed = this.minSpeed;
	this.runing = false;
	this.allowStop = false;
	
	this.colors = [
		"#50BEFA", "#CE52F8", "#BCEE68",
		"#50BEFA", "#CE52F8", "#BCEE68",
		"#50BEFA", "#CE52F8", "#BCEE68",
		"#50BEFA", "#CE52F8", "#BCEE68"
	];

    this.winColors = ['#ff00ff', '#ffff00', '#00ffff', '#ff0000', '#35E854', '#4E8FFE'];

    this.fill_images = [
        "./images/five_element_metal_r.jpg",
        "./images/five_element_wood_r.jpg",
        "./images/five_element_water_r.jpg",
        "./images/five_element_fire_r.jpg",
        "./images/five_element_earth_r.jpg",
        "./images/five_element_all_r.jpg"
    ];

	this.init = function() {
        if(db_staff.isempty()) {
		    this.users = users.split(",");
        }
        else {
		    this.refreshUser()
        }
		
		var winnerList = db.list();
		for(var i = 0, l = winnerList.length; i < l; i++) {
			this.winnerListAdd(winnerList[i]);
		}
	};
}

lotteryProject.prototype = {
    // 从数据库更新抽奖名单
    refreshUser: function() {
        this.users = [];
        user_list = db_staff.list()
        for (var i=0; i<user_list.length; i++) {
            this.users.push(user_list[i].name)
        }
		this.count = this.users.length;
        console.log(this.users)
    },

	// 随机出 12个用户
	randUsers: function() {
		this.users.sort(function () { // 在取出用户前 先进行乱序排列，打乱顺序
			return 0.5 - Math.random();
		});
  	
		this.usernames = [];
        this.user_five_element = true;
		var keys = {}, k = 0, u = '', len = 0;
		
		while(true) {
			k = Math.floor( Math.random()*this.count );
			u = this.users[k];
			
			if(!keys[k] && !db.item(u)) {
                if (this.user_five_element && 
                    (u.indexOf('金') < 0) &&
                    (u.indexOf('木') < 0) &&
                    (u.indexOf('水') < 0) &&
                    (u.indexOf('火') < 0) &&
                    (u.indexOf('土') < 0))
                    this.user_five_element = false;

				len = this.usernames.push(u);
				keys[k] = k;
				
				if(len >= this.userSize) break;
			}
		}
		
	},
	
	create: function(i, color_type, isWin) {
        if (color_type == 0)
            color = this.colors[i];
        else if (color_type == 1)
            color = this.createHoverColor();
        else if (color_type == 2)
            color = "white";
        else if (color_type == 3)
            color = this.createWinColor()
        
        if (this.user_five_element) {
            if (color_type == 0)
                this.create_five_element(i, isWin)
            else if ((color_type == 1) || (color_type == 2) || (color_type == 3))
                this.create_five_element_cursor(i, color, isWin)
        }
        else
            this.create_color(i, color, isWin)
    },

	// 绘制格子
	create_color: function(i, color, isWin) {
		var start = 0.1666*i+this.arcRecoup,
				finish = 0.1666*(i+1)-0.01+this.arcRecoup; 
		
		var s1 = Math.sin(Math.PI*start), c1 = Math.cos(Math.PI*start),
				s2 = Math.sin(Math.PI*finish), c2 = Math.cos(Math.PI*finish);
		
		var ratio = this.radius/this.proportion,
				point = {x: this.mx + ratio*c1, y: this.my + ratio*s1},
				lineTo1 = {x: this.mx + this.radius*c1, y: this.my + this.radius*s1},
				lineTo2 = {x: this.mx + ratio*c2, y: this.my + ratio*s2};
		
		ctx.fillStyle = color;
		ctx.beginPath();
		ctx.moveTo(point.x, point.y);
		ctx.lineTo(lineTo1.x, lineTo1.y);
		ctx.arc(this.mx, this.my, this.radius, Math.PI*start, Math.PI*finish); // 外圈
		ctx.lineTo(lineTo2.x, lineTo2.y);
		ctx.arc(this.mx, this.my, ratio, Math.PI*finish, Math.PI*start, true); // 内圈
		ctx.lineTo(point.x, point.y);
		ctx.fill();
		
		this.drawFont(i, start, isWin);
	},
	
	create_five_element_cursor: function(i, color, isWin) {
		//TODO: change cursor from circle to cursor.
		var start = 0.1666*i+this.arcRecoup,
				finish = 0.1666*(i+1)-0.01+this.arcRecoup;
                
        var ratio = this.radius*0.61;

        origin_x = this.mx;
        origin_y = this.my;
        rotate_r = Math.PI*((start + finish)/2);

        ctx.translate(origin_x, origin_y);
        ctx.rotate(rotate_r)
		ctx.fillStyle = color;
		ctx.beginPath();
		ctx.arc(ratio, 0, 10, 0, 2*Math.PI);
        ctx.fill();
        ctx.stroke();
        ctx.rotate(-rotate_r)
        ctx.translate(-origin_x, -origin_y);
    },

    create_five_element: function(i, isWin) {

        var img = new Image();
        var fe_index=0;
        if(this.usernames[i].indexOf('金') >= 0)
            fe_index = 0;
        else if(this.usernames[i].indexOf('木') >= 0)
            fe_index = 1;
        else if(this.usernames[i].indexOf('水') >= 0)
            fe_index = 2;
        else if(this.usernames[i].indexOf('火') >= 0)
            fe_index = 3;
        else if(this.usernames[i].indexOf('土') >= 0)
            fe_index = 4;

        start = 0.1666*i+this.arcRecoup,
        finish = 0.1666*(i+1)-0.01+this.arcRecoup;
        s1 = Math.sin(Math.PI*start), c1 = Math.cos(Math.PI*start),
        s2 = Math.sin(Math.PI*finish), c2 = Math.cos(Math.PI*finish);

        ratio = this.radius/this.proportion,
        point = {x: this.mx + ratio*c1, y: this.my + ratio*s1},
        lineTo1 = {x: this.mx + this.radius*c1, y: this.my + this.radius*s1},
        lineTo2 = {x: this.mx + ratio*c2, y: this.my + ratio*s2};

        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
        ctx.lineTo(lineTo1.x, lineTo1.y);
        ctx.arc(this.mx, this.my, this.radius, Math.PI*start, Math.PI*finish); // 外圈
        ctx.lineTo(lineTo2.x, lineTo2.y);
        ctx.arc(this.mx, this.my, ratio, Math.PI*finish, Math.PI*start, true); // 内圈
        ctx.lineTo(point.x, point.y);

        origin_x = this.mx;
        origin_y = this.my;
        rotate_r = Math.PI*(start);
		var _this = this;
        img.src = this.fill_images[fe_index];
        img.onload = function() {
            var pattern = ctx.createPattern(img,"no-repeat");
            ctx.fillStyle = pattern;
            //填充必须放于加载完成后执行，因为onload为异步操作
            ctx.translate(origin_x, origin_y)
            ctx.rotate(rotate_r)
            ctx.fill();
            ctx.rotate(-rotate_r)
            ctx.translate(-origin_x, -origin_y)
            _this.drawFont(i, start, isWin);
            //console.log("onload");
        }
        // console.log(i + this.usernames[i]);
        // console.log(this.fill_images[fe_index]);
    },

	// 绘制文字
	drawFont: function(i, start, isWin) {
		ctx.fillStyle = isWin ? "#f00" : "#333";
		ctx.font='bold '+this.fSize+'px Microsoft YaHei';
		ctx.textBaseline='top';
	  
		var nameLen = this.usernames[i].length;
		var wordWidth = nameLen > 3 ? this.word.width*4 : this.word.width*nameLen;
		wordWidth = 0;
		for(var k = 0; k < nameLen; k++) {
			var chr = this.usernames[i].charCodeAt(k);
			if(chr > 47 && chr < 58) wordWidth += this.word.width/2;
			else wordWidth += this.word.width;
		}
		
		var fontCoordinate = {};
		fontCoordinate.x = this.mx+this.radius*(0.5 + 0.5/this.proportion) * Math.cos(Math.PI*(start-this.arcRecoup)) - wordWidth/2;
		fontCoordinate.y = this.my+this.radius*(0.5 + 0.5/this.proportion) * Math.sin(Math.PI*(start-this.arcRecoup)) - this.word.height/2;
    
		ctx.fillText(this.usernames[i], fontCoordinate.x, fontCoordinate.y);
	},
	
	// 旋转
	whirling: function() {
		this.nowIndex = this.nowIndex%12;
		var fontIndex = this.nowIndex == 0 ? 11 : this.nowIndex-1;
		
		if(this.speedMode == true) { // 加速
			this.speed -= this.acceleration;
			if(this.speed < this.maxSpeed) {
				this.allowStop = true;
				this.speed = this.maxSpeed;
			}
		} else { // 减速
			this.speed += this.acceleration;
			if(this.speed > this.minSpeed) {
				this.winner = this.nowIndex;
			}
            var daxiao = "./data/music_rolling.wav";
            var daxiao = new Audio(daxiao);
            daxiao .play();
		}
		
        if (this.user_five_element == false) {
            this.create(fontIndex, 0);
            this.create(this.nowIndex, 1);
        }
        else {
            this.create(fontIndex, 2);
            this.create(this.nowIndex, 1);
        }

		this.nowIndex++;
		
		var _this = this;
		if(this.winner != -1) {
			setTimeout(function() {
				_this.showWinner();
			}, 1000);
			return false;
		}
		
		autoTime = setTimeout(function() {
			_this.whirling();
		}, this.speed);
	},
	
	nowColorIndex: 0,
	createHoverColor: function() {
		this.nowColorIndex++;
		this.nowColorIndex = this.nowColorIndex % colorCount;
		
		return colorList[this.nowColorIndex];
	},
	
    nowWinColorIndex: 0,
	createWinColor: function() {
		this.nowWinColorIndex++;
		this.nowWinColorIndex = this.nowWinColorIndex % this.winColors.length;
		
		return this.winColors[this.nowWinColorIndex];
    },

	// 显示获胜者
	showWinner: function() {
        var i = 0, time = 0, _this = this;
        nowWinColorIndex = 0;
		time = setInterval(function() {
			_this.create(_this.winner, 3);
			i++;
			
			if(i > 16) {
				clearTimeout(time);
				_this.create(_this.winner, 3, true);
				_this.runing = false;
			}
        }, 100);
        var daxiao = "./data/music_winner.wav";
        var daxiao = new Audio(daxiao);
        daxiao .play();
        name = this.usernames[this.winner]
        number = db_staff.item('staff-'+name).number
        level = this.nowLevel.toString()
        console.log("winner name:" + name + " number" + number + " prize" + level)
		this.winnerListAdd({name:name, number:number, level:level}, true);
	},
	
	winnerListAdd: function(obj, saveToDb) {
		if( $("#winner_list .list div[name='"+obj.name+"']").length ) return;
		
		var html = '<tr><td name="'+obj.name+'">'
			+ obj.name
			+ '</td>'
			+ '<td><select name="level" class="level">';

		for(var i = 0, l = this.levels.length; i < l; i++) {
			var s = i == obj.level ? ' selected="selected"' : '';
			html += '<option value="'+i+'"'+s+'>'+this.levels[i]+'</option>';
		}

        html += '<td number="'+obj.number+'">'
        + obj.number
        + '</td>'

		html += '</select></td>'
			+ '<td><a href="javascript:;" class="del">删除</a>'
			+ '</td></tr>';

		$("#winner_list .list").prepend(html);
		
        key_name = 'lottery-' + obj.name
		saveToDb && db.set(key_name, obj);
	},
	
	// 绘制
	draw: function() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		
		var m = 12, _this = this, k = 0;
		for(var i = 0; i <= m; i++) {
			setTimeout(function() {
				if(k < m) _this.create(k, 0);
				else if(k == m) _this.whirling();
				k++;
			}, 250*i);
		}
	},
	
	run: function() {
		if(this.runing) return;
		this.runing = true;
		
		this.acceleration = Math.floor( Math.random()*60+40 ); // 加速度 40-100
		this.speedMode = true;
		this.allowStop = false;
		this.winner = -1;
		this.speed = this.minSpeed;
		
		this.randUsers();
		this.draw();
	},
	
	stop: function() {
		if(this.allowStop) {
			this.allowStop = false;
			this.speedMode = false;
		}
	}
};

// 本地 key-value 数据库操作
class localDatabase {
    constructor() {
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
        var k = '', val = null, rList = [];
        for (var i = 0, l = localStorage.length; i < l; i++) {
            k = localStorage.key(i);
            val = this.item(k);
            if (k.indexOf('lottery-') >= 0) {
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
            if (k.indexOf('lottery-') >= 0) {
                this.del(k)
            }
        }
    }
    del(k) {
        localStorage.removeItem(k);
    }
}





