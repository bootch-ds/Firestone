var gDaysToTrack = 14;
const _MS_PER_DAY = 1000 * 60 * 60 * 24;

class DataBO {
	get Member_Count() { return this.Members.filter(zz => zz.IsActive).length; }

	constructor(sData) {
		this.UserName = 'Guest';
		this.GuildName = 'Unknown';
		this.MaxMembers = 15;
		this.DaysToTrack = 14;
		this.MemberIndex = 0;
		this.Members = [];

		if (sData) {
			var jsonData = JSON.parse(sData);
		
			if (jsonData) {
				this.UserName = jsonData.UserName;
				this.GuildName = jsonData.GuildName;
				this.MaxMembers = parseInt(jsonData.MaxMembers);
				this.DaysToTrack = parseInt(jsonData.DaysToTrack);				
				this.MemberIndex = parseInt(jsonData.MemberIndex);

				this.Members = [];
				jsonData.Members.forEach(ele => { this.Members.push(new MemberBO(ele)); });

				gDaysToTrack = this.DaysToTrack;
			}
		}
	}

	Clone(sIsDeep) {
		var bo = new DataBO();

		bo.UserName = this.UserName;
		bo.GuildName = this.GuildName;
		bo.MaxMembers = this.MaxMembers;
		bo.MemberIndex = this.MemberIndex;
		bo.DaysToTrack = this.DaysToTrack;

		bo.Members = [];
		if (sIsDeep === 'DEEP') { this.Members.forEach(ele => { bo.Members.push(ele.Clone(sIsDeep)); }); }

		return bo;
	}
	UpdateGlobals() {
		gDaysToTrack = this.gDaysToTrack;
	}
	GetMember(boMember) {
		var boFound = this.Members.filter(ele => { return ele.Name === boMember.Name || ele.ID === boMember.ID; });
		if (boFound && boFound.length > 0) {
			return boFound[0];
		}
		return null;
	}
	AddMember(boMember) {		
		var nNameInUseCount = this.Members.filter(ele => { return ele.Name === boMember.Name; }).length;
		if (nNameInUseCount > 0) {
			boMember.Name = boMember.Name + ' - ' + (nNameInUseCount + 1).toString();
		}		
		
		this.MemberIndex += 1;
		boMember.ID = this.MemberIndex;
		this.Members.push(boMember);				
	}
	UpdateMember(boMember) {
		var boFound = this.GetMember(boMember);
		if (boFound && boFound.length > 0) {
			var nIndex = this.Members.findIndex(zz => zz.ID === boMember.ID);

			if (nIndex > -1) {
				this.Members[nIndex] = boMember;
			}
		}
	}
	UpdateMemberPoints(boMember) {
		var boFound = this.GetMember(boMember);
		if (boFound && boFound.length > 0) {
			var nIndex = this.Members.findIndex(zz => zz.ID === boMember.ID);

			if (nIndex > -1) {
				this.Members[nIndex] = boMember;
			}
		}
	}
	DeleteMember(boMember) {
		var boFound = this.GetMember(boMember);
		if (boFound && boFound.length > 0) {
			var nIndex = this.Members.findIndex(zz => zz.ID === boMember.ID);

			if (nIndex > -1) {
				this.Members.splice(nIndex, 1);
			}
		}
	}
}

class MemberBO {
	
	get TotalPoints() { return this.Points.TotalPoints; }
	get DailyAverage() { return this.Points.DailyAverage(this.JoinDate); }
	get RunningAverage() { return this.Points.RunningAverage; }
	get InitialPoints() { return this.Points.InitialPoints; }

	constructor(jsonData) {
		this.ID = 0;
		this.Name = '';
		this.Rank = '';			
		
		this.IsActive = true;
		this.JoinDate = new Date().toLocaleDateString();
		this.ExitDate = new Date('1/1/2000').toLocaleDateString();

		this.Points = [];

		if (jsonData) {
			this.ID = parseInt(jsonData.ID);
			this.Name = jsonData.Name;
			this.Rank = jsonData.Rank;			

			this.IsActive = jsonData.IsActive;
			this.JoinDate = new Date(jsonData.JoinDate).toLocaleDateString();
			this.ExitDate = new Date(jsonData.ExitDate).toLocaleDateString();

			this.Points = new PointEntryBC(jsonData.Points);
		}
	}
	
	Clone(sIsDeep) {
		var bo = new MemberBO();

		bo.ID = this.ID;
		bo.Name = this.Name;
		bo.Rank = this.Rank;

		bo.IsActive = this.IsActive;
		bo.JoinDate = this.JoinDate;
		bo.ExitDate = this.ExitDate;
		
		bo.Points = new PointEntryBC();
		if (sIsDeep === 'DEEP') {
			bo.Points = this.Points.Clone(sIsDeep);
		}

		return bo;
	}	
}

class PointEntryBC {
	//get TotalPoints() { return Math.max.apply(null, this.PointEntries.map((Points) => Points)); }
	get TotalPoints() {
		if (!this.Values || this.Values.length < 1)
			return this.InitialPoints;

		var oMaxPoint = this.Values.reduce(function (x, y) { return x.Points > y.Points ? x : y; });
		return oMaxPoint.Points;
	}	
	get RunningAverage() {
		if (!this.Values || this.Values.length < 2) {
			return this.DailyAverage;
		}
		this.Sort();
		var firstPoint = this.Values[0];
		var lastPoint = this.Values[this.Values.length - 1];
		var startDate = new Date(firstPoint.Date);
		var endDate = new Date(lastPoint.Date);
		var nDays = (endDate - startDate) / _MS_PER_DAY;
		if (nDays === 0) { nDays = 1; }

		return parseInt((lastPoint.Points - firstPoint.Points) / nDays);
	}

	constructor(jsonData) {
		this.Values = [];
		this.InitialPoints = 0;
		this.MonthlyPoints = 0;
		
		if (jsonData) {			
			this.InitialPoints = parseInt(jsonData.InitialPoints);
			this.MonthlyPoints = parseInt(jsonData.MonthlyPoints);

			jsonData.Values.forEach(ele => {
				try {
					this.Values.push(new PointEntryBO(ele));
				}
				catch (ex) {
					//do something
				}
			});
		}
	}

	DailyAverage(sJoinDate) {
		var dtNow = new Date();
		dtNow = new Date(dtNow.getFullYear(), dtNow.getMonth(), dtNow.getDate());
		var dtStart = new Date(sJoinDate);
		var nDays = (dtNow - dtStart) / _MS_PER_DAY;
		if (nDays === 0) { nDays = 1; }
		return parseInt((this.TotalPoints - this.InitialPoints) / nDays);
	}

	Clone(sIsDeep) {
		var bo = new PointEntryBC();
		
		bo.InitialPoints = this.InitialPoints;
		bo.MonthlyPoints = this.MonthlyPoints;
		bo.Values = [];

		if (sIsDeep === 'DEEP') {
			this.Values.forEach(ele => {
				bo.Values.push(new PointEntryBO(ele));
			});
		}

		return bo;
	}

	Sort() {
		this.Values.sort(function (x, y) { return x.AsDateTime > y.AsDateTime; });
	}
	GetFirst() {
		this.Sort();
		return this.Values[0];
	}
	GetLast() {
		this.Sort();
		return this.Values[this.Values.length - 1];
	}
	HasPoint(boPoint) {
		var dtDate = new Date(boPoint.Date).toLocaleDateString();
		var boFound = this.PointEntries.filter(ele => { return ele.Date === dtDate; });

		return boFound && boFound.length > 0;
	}
	AddPoint(boPoint) {
		if (!this.HasPoint(boPoint)) {
			this.PointEntries.push(boPoint);
			if (this.PointEntries.length > gDaysToTrack) {
				this.Sort();
				this.PointEntries.splice(0, 1);
			}
		}
		else {
			this.UpdatePoint(boPoint);
		}
	}
	UpdatePoint(boPoint) {
		if (this.HasPoint(boPoint)) {
			var dtDate = new Date(boPoint.Date).toLocaleDateString();
			var nIndex = this.PointEntries.findIndex(ele => { return ele.Date === dtDate; });

			if (nIndex > -1) {
				this.PointEntries[nIndex] = boPoint;
			}
		}
	}
	DeletePoint(boPoint) {
		if (this.HasPoint(boPoint)) {
			var dtDate = new Date(boPoint.Date).toLocaleDateString();
			var nIndex = this.PointEntries.findIndex(ele => { return ele.Date === dtDate; });

			if (nIndex > -1) {
				this.PointEntries.splice(nIndex, 1);
			}
		}
	}
}
class PointEntryBO {
	get DayOfMonth() {
		var dtDate = new Date(this.Date);
		if (dtDate instanceof Date && !isNaN(dtDate)) {
			return dtDate.getDate();	
		}
		return;
	}
	get DayOfWeek() {
		var dtDate = new Date(this.Date);
		if (dtDate instanceof Date && !isNaN(dtDate)) {
			return dtDate.getDay();	
		}
		return;
	}
	get AsDateTime() {
		var dtDate = new Date(this.Date);
		if (dtDate instanceof Date && !isNaN(dtDate)) {
			return dtDate;
		}
		return;		
	}
	constructor(jsonData) { 
		this.Date = new Date('1/1/2000').toLocaleDateString();
		this.Points = 0;

		if (jsonData) {
			var dtDate = new Date(jsonData.Date);
			if (dtDate instanceof Date && !isNaN(dtDate)) {
				this.Date = dtDate.toLocaleDateString();
				this.Points = parseInt(jsonData.Points);
			}
			else {
				throw new Error('Invalid Date');
			}
		}
	}

	Clone(sIsDeep) {
		var bo = new PointEntryBO();

		bo.Date = this.Date;
		bo.Points = this.Points;
		
		return bo;
	}
}