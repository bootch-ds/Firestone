
app.controller('FS_Controller', function ($scope, $route, $routeParams, $location, $rootScope) {
    $rootScope.Name = 'ROOT_SCOPE';
    $scope.Name = 'FS_SCOPE';
    $scope.AppData = {};
    $scope.DataSize = 0.0;
    $scope.ShowInactive = false;

    //link to child controllers     
    $scope.Child_Settings = {};
    $scope.Child_Roster = {};
    $scope.Child_Members = {};    

    $scope.$route = $route;
    $scope.$location = $location;
    $scope.$routeParams = $routeParams;

    $scope.Init = function () {
        $scope.AppData = getData();
        $scope.DataSize = getStorageSize($scope.AppData);
    };
    $scope.SaveData = function () {
        //pass to javascript function
        saveData($scope.AppData);
        $scope.DataSize = getStorageSize($scope.AppData);
    };
    $scope.DownloadData = function () {
        //pass to javascript function
        downLoadData($scope.AppData.GuildName + '.json');
    };
    $scope.UploadData = function (oFile) {
        //pass to javascript function
        if (uploadData(oFile.File)) {
            $scope.Init();
        }
    };
    $scope.ClearData = function () {
        //pass to javascript function
        clearData();
        $scope.Init();        
    };

    $scope.OpenModal = function (sTargetModal, oModalData) {
        $rootScope.Current_ModalData = oModalData;
        $rootScope.$broadcast('LoadModal', { Target: sTargetModal });
    };
    $scope.CloseModal = function () {
        $rootScope.Current_ModalData = '';
        $rootScope.$broadcast('UnLoadModal', { });
    };
  
    $scope.Init();
});

//only task is load html content
app.controller('Modal_Contoller', function ($scope, $rootScope) {
    $scope.ModalData = {};
    $scope.ModalData.Name = 'SCOPE_MODAL';
    $scope.ModalData.TargetModal = '';
    $scope.ModalData.URL = '';

    $rootScope.$on('LoadModal', function (event, data) { $scope.LoadModal(data); });
    $rootScope.$on('UnLoadModal', function (event, data) { $scope.UnLoadModal(); });

    $scope.LoadModal = function (data) {
        $scope.ModalData.TargetModal = data.Target;
        switch ($scope.ModalData.TargetModal) {
            case 'NEW_MEMBER':
                $scope.ModalData.URL = 'WebParts/Members/Create.html';
                break;
            case 'EDIT_MEMBER':
                $scope.ModalData.URL = 'WebParts/Members/Edit.html';
                break;
            case 'ADD_POINTS':
                $scope.ModalData.URL = 'WebParts/Roster/AddPoints.html';
                break;
            default:
                $scope.ModalData.URL = 'Testing/modalContent.html';
                break;
        }
    };
    $scope.UnLoadModal = function (data) {
        $scope.ModalData.TargetModal = "";
        $scope.ModalData.URL = 'WebParts/DummyModal.html';

        //since the Modal does not re-draw at this point the Content for the Modal is Maintained (html/Controller/Scope)
        // => force an update to the Modal_Controller.$scope
        //this will replace the current content of the Modal with a dummy
        //this dummy will ensure the Content for the Modal is updated (html/Controller/Scope)
        $scope.$apply();
    };
});

app.controller('Roster_Controller', function ($scope, $rootScope, $timeout) {
    $scope.Name = 'SCOPE_ROSTER';
    var parentScope = $scope.$parent;
    parentScope.Child_Roster = $scope;

    $scope.EntryDate = '';
    $scope.RosterData = [];

    $scope.Init = function () {
        oParentData = parentScope.AppData;

        $scope.EntryDate = new Date().toLocaleDateString();
        oParentData.Members.forEach(ele => {
            var bo = ele.Clone('DEEP');
            bo.CurrentPoints = bo.TotalPoints;
            $scope.RosterData.push(bo);
        });

        //check if scrollbars were added/removed due to edit
       // $timeout(function () { ScrollCheck(); });
    };

    $scope.AddPoints = function () {
        oParentData = parentScope.AppData;
        if (!oParentData) {
            //ERROR
            return;
        }

        $scope.RosterData.forEach(ele => {
            if (ele.IsActive) {
                var oMember = ele.Clone('DEEP');
                var oPoint = new PointEntryBO();
                oPoint.Points = ele.CurrentPoints;
                oPoint.Date = new Date($scope.EntryDate).toLocaleDateString();

                oMember.AddPoint(oPoint);
                oParentData.UpdateMember(oMember);
            }
        });

        parentScope.SaveData();
        $scope.RosterData = [];
        $scope.EntryDate = '';
    };

    $scope.Init();
});

app.controller('Member_Controller', function ($scope, $rootScope, $timeout, $routeParams) {
    $scope.Name = 'SCOPE_MEMBER';
    var parentScope = $scope.$parent;
    parentScope.Child_Members = $scope;

    $scope.MemberData = {};
    $scope.PointData = [];
    $scope.MemberID = $routeParams.MemberID;

    $scope.Init = function () {       
        var boMember = new MemberBO();
        if ($rootScope.Current_ModalData) {
            boMember = $rootScope.Current_ModalData.Clone('DEEP');
        }
        else if ($scope.MemberID) {            
            boMember = new MemberBO();
            boMember.ID = parseInt($scope.MemberID);
            boMember = parentScope.AppData.GetMember(boMember).Clone('DEEP');
        }
        else {
            boMember = new MemberBO();
            boMember.Name = parentScope.AppData.UserName;
            boMember = parentScope.AppData.GetMember(boMember).Clone('DEEP');
        }
        $scope.MemberData = boMember;  
        $scope.PointData = $scope.getPoints();
    };

    //build object to display points as a calendar
    $scope.getPoints = function () {
        bc = new PointEntryBC();

        //add empty beginning points
        var dtStart = new Date($scope.MemberData.Points.Values[0].Date);
        nDayOfWeek = dtStart.getDay();
        nDate = dtStart.getDate() - nDayOfWeek;

        for (i = 0; i < nDayOfWeek; i++) {
            boPoint = new PointEntryBO();
            boPoint.Date = '1/' + (nDate + i) + '/2000';
            boPoint.IsDummy = true;
            bc.Values.push(boPoint);
        }

        $scope.MemberData.Points.Sort();
        $scope.MemberData.Points.Values.forEach(ele => {
            bc.Values.push(ele);
        });

        //add empty ending points
        var dtLast = new Date($scope.MemberData.Points.Values[$scope.MemberData.Points.Values.length - 1].Date);
        nDayOfWeek = dtLast.getDay();
        nDate = dtLast.getDate();
        for (i = 1; i < (7 - nDayOfWeek); i++) {
            boPoint = new PointEntryBO();
            boPoint.Date = '1/' + (nDate + i) + '/2000';
            boPoint.IsDummy = true;
            bc.Values.push(boPoint);
        }

        bc.Values.forEach((ele, index) => {
            if (index === 0 && !ele.IsDummy) {
                ele.DailyGain = 0; //boPoint.Points; 
            }
            else if (!ele.IsDummy) {
                if (bc.Values[index - 1].Points === 0) {
                    ele.DailyGain = '---';
                }
                else {
                    ele.DailyGain = bc.Values[index].Points - bc.Values[index - 1].Points;
                }
            }
            else {
                ele.DailyGain = '---';
            }
        });
        return bc;
    };
    
    $scope.UpdateMember = function (sAction) {
        oParentData = parentScope.AppData;
        if (!oParentData) {
            //ERROR
            return;
        }
        var oMember = $scope.MemberData.Clone('DEEP');

        switch (sAction) {
            case 'NEW':
                oPointEntry = new PointEntryBO();
                oPointEntry.Date = new Date(oMember.JoinDate).toLocaleDateString();
                oPointEntry.Points = parseInt(oMember.InitialPoints);
                oMember.AddPoint(oPointEntry);
                oParentData.AddMember(oMember);
                break;
            case 'EDIT':
                oParentData.UpdateMember(oMember);
                break;
            case 'DELETE':
                oParentData.DeleteMember(oMember);
                break;
            default:
                return;
        }
        
        parentScope.SaveData();
        $scope.MemberData = {};

        //check if scrollbars were added/removed due to edit
        $timeout(function () { ScrollCheck(); });

    };

    $scope.Init();
});

app.controller('Settings_Controller', ['$scope', function ($scope) {    
    $scope.Name = 'SCOPE_SETTINGS';
    $scope.SettingsData = {};

    $scope.FileData = {};
    $scope.FileData.File = '';
    $scope.FileData.FileName = '';

    //note:
    //  $scope.$parent == template manager/loader
    //  $scope.$parent.$parent == FS_Controller
    //link to FS_Controller (parent)
    var parentScope = $scope.$parent.$parent;
    parentScope.Child_Settings = $scope;

    $scope.Init = function () {
        oParentData = parentScope.AppData;
        //copy parent data to local scope
        //this prevents live updating till validated 
        var oData = {};
        oData.UserName = oParentData.UserName; 
        oData.GuildName = oParentData.GuildName;
        oData.MaxMembers = oParentData.MaxMembers;
        oData.Member_Count = oParentData.Member_Count;
        oData.DaysToTrack = oParentData.DaysToTrack;

        $scope.SettingsData = oData;
        $scope.FileData = {};
        $scope.FileData.File = '';
        $scope.FileData.FileName = '';
    };

    $scope.SaveData = function () {
        oParentData = parentScope.AppData;
        if (!oParentData) {
            //ERROR
            return;
        }

        //push the data to parent object
        oParentData.UserName = $scope.SettingsData.UserName;
        oParentData.GuildName = $scope.SettingsData.GuildName;
        oParentData.MaxMembers = $scope.SettingsData.MaxMembers;
        oParentData.DaysToTrack = $scope.SettingsData.DaysToTrack;
        oParentData.UpdateGlobals();
        parentScope.SaveData();
    };

    $scope.FileDropped = function () {
        parentScope.UploadData($scope.FileData);
        $scope.Init();
    };

    $scope.ClearData = function () {
        parentScope.ClearData();
        $scope.Init();
    };

    $scope.Init();
}]);
