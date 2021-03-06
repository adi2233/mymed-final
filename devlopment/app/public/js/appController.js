var mymedical = angular.module("mymed",['ngRoute','ngCookies','ngTagsInput']);

$( ".cross" ).hide();
$( ".menu" ).hide();
$( ".hamburger" ).click(function() {
$( ".menu" ).slideToggle( "slow", function() {
$( ".hamburger" ).hide();
$( ".cross" ).show();
});
});


mymedical.controller('getPersonalCtrl',['$scope','$http','$cookies',function($scope,$http,$cookies) {
var emailCookie1 = $cookies.get('cookieEmail');
//http://localhost:3000/getPersonal
    $http.get("https://mymed2.herokuapp.com/getPersonal").success(function(data){
            var myData = [];
            var searchFilter;
            var allTags;
            
            //display data only for online email
            for(var t=0; t<data.length ;t++)
            {
              if(data[t].email == emailCookie1 )
              {
                myData.push(data[t]);
              }
              $scope.insertDataToDB = myData;
            }

            var shortBy;
            $scope.shortFunc= function(){
              shortBy = document.getElementById('shortData').value;
              

            switch(shortBy)
            {
              case 'AZ':{
                myData.sort(function(a, b) {
                  var textA = a.Title.toUpperCase();
                  var textB = b.Title.toUpperCase();
                return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                });
              break;
              }
              case 'ZA':{
                myData.reverse(function(a, b) {
                  var textA = a.Title.toUpperCase();
                  var textB = b.Title.toUpperCase();
                return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                });
                break;
              }
              case 'firstDate':{
                myData.sort(function(a,b) {
                  a = a.myDate.split('/').reverse().join('');
                  b = b.myDate.split('/').reverse().join('');
                  return a > b ? 1 : a < b ? -1 : 0;
                });
                break;
              }
              case 'lastDate':
                myData.reverse(function(a,b) {
                  a = a.myDate.split('/').sort().join('');
                  b = b.myDate.split('/').sort().join('');
                  return a > b ? 1 : a < b ? -1 : 0;
                });
                break;
            }

        }
   });

  

  var x= {};
  x.email = emailCookie1;
  //http://localhost:3000/getPersonalTags
    $http.post("https://mymed2.herokuapp.com/getPersonalTags",JSON.stringify(x)).then(function(res){
       var temp = res.data;
       var myPersonalTags = [];
       for(var i=0; i<temp.length ; i++)
       {
          myPersonalTags.push(temp[i].tags);
       }
       $scope.personalTag = myPersonalTags;
    });

    $scope.removeTag = function(val)
    { 

      console.log(val);
      var data ={};
      data.email = emailCookie1;
      data.tag = val;
      //http://localhost:3000/removePersonalTag
      $http.post("https://mymed2.herokuapp.com/removePersonalTag",JSON.stringify(data)).then(function(res){
          window.location = "getPrivateData.html";
      });
    }

    var modal = document.getElementById("myModal");
    var span = document.getElementsByClassName("close")[0];
   
    $scope.deletePopUp = function(value)
    {
      console.log(value);

       modal.style.display = "block";
      // When the user clicks on <span> (x), close the modal
        span.onclick = function() {
        modal.style.display = "none";
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    $scope.popUp = value;
    }

    $scope.closePopUp= function(){
      modal.style.display = "none";
    }

    var dataToDelete={};
    $scope.deleteInfo = function(val){
      dataToDelete.email = val.email;
      dataToDelete.Title = val.Title;
      dataToDelete.Info = val.Info;
      dataToDelete.Category = val.Category;
      dataToDelete.Tags = val.Tags;
      dataToDelete.Recommendation = val.Recommendation;
      dataToDelete.myDate = val.myDate;
//http://localhost:3000/deletePersonalInfo
//https://mymed2.herokuapp.com/deletePersonalInfo
      $http.post("https://mymed2.herokuapp.com/deletePersonalInfo", JSON.stringify(dataToDelete)).then(function(res){
          modal.style.display = "none";
          window.location = "getPrivateData.html";
      });
    }
var emailCookie = $cookies.get('cookieEmail');
   var userPermission=[];
      //get all users 
//http://localhost:3000/userInformation
      $http.get("https://mymed2.herokuapp.com/userInformation").success(function(data){
            
        //check who have premision to this user
        var choosenUser;

        console.log(emailCookie);

        for(var i=0 ; i< data.length ; i++)
        {
          for(var j=0;j<(data[i].permission).length; j++)
          {
            if(data[i].permission[j].perEmail == emailCookie)
              userPermission.push(data[i].email);
          }
        }
        });
        $scope.names = userPermission;  
        
    $scope.getAllAccess = function()
      {
       choosenUser = document.getElementById('selectedName').value;
        var selectUser = choosenUser.substr(7);
        var sendUser ={};
        sendUser.emailAccess = selectUser;
        sendUser.emailUser = emailCookie;
        //http://localhost:3000/getPersonalByEmail
        $http.post("https://mymed2.herokuapp.com/getPersonalByEmail", JSON.stringify(sendUser)).then(function(docs)
        {
          console.log(docs.data);
          $scope.getUserPer = docs.data;
        });
        
        
          
    }

$scope.viewCurrent = function(value){
  $cookies.put('cookieView',JSON.stringify(value));
  window.location = "viewDetails.html";
}


$scope.editData = function(valueEdit){
  $cookies.put('cookieEdit',JSON.stringify(valueEdit));
  window.location = "editData.html";
}


}]);


mymedical.controller('searchController',['$scope','$http',function($scope,$http) {
//http://localhost:3000/doctors
    $http.get("https://mymed2.herokuapp.com/doctors").success(function(myjson){       
    var mylat, mylng;
    var myName, myAddress;
    //$scope.input1 = null;
    var clickSubmit = 0;
    var hmo;
    var expertise;

  $('#sendButton').on('click', function() {
    var val = document.getElementById('input1').value;
    var hmoChoosen = document.getElementById('HMOSearch').value;    hmo = hmoChoosen;
    var choosenExp = document.getElementById('expertise').value;
    expertise = choosenExp;
    var Address = val;
    getLatitudeLongitude(showResult, Address);

  });
    //this function get the doctor around the lat lang
    function getDocAround(mylat,mylng){
      console.log("in getDocAround");
      var colsestDoc = [];
      var docArrayDis = Array();
      var docArrayAdd = Array();
      var docArrayName = Array();
      var docArrayHMO = Array();
      var docArrayExp = Array();
      var docArrayhours = Array();

      //goes over the json we got from DB to get it details
      for(var j=0; j<myjson.length; j++)
      {
        console.log("my json   " + myjson[j].Address);
        if(myjson[j].Expertise == expertise && myjson[j].HMO == hmo){
        console.log("in the if");
          var maxDic = 99999; 
          var p1 = new google.maps.LatLng(mylat, mylng);
          var p2 = new google.maps.LatLng(myjson[j].lat, myjson[j].lng);
          //calcDistance from my point
          var x = calcDistance(p1, p2);
          //add all the res to array
          docArrayDis.push(x);
          docArrayAdd.push(myjson[j].Address);
          docArrayName.push(myjson[j].name);
          docArrayHMO.push(myjson[j].HMO);
          docArrayExp.push(myjson[j].Expertise);
          docArrayhours.push(myjson[j].reception_hours);
        }
        else if(expertise == 'all' && hmo == 'all')
        {
          console.log("address   " + $scope.input1);
          var maxDic = 99999; 
          var p1 = new google.maps.LatLng(mylat, mylng);
          var p2 = new google.maps.LatLng(myjson[j].lat, myjson[j].lng);
          //calcDistance from my point
          var x = calcDistance(p1, p2);
          //add all the res to array
          docArrayDis.push(x);
          docArrayAdd.push(myjson[j].Address);
          docArrayName.push(myjson[j].name);
          docArrayHMO.push(myjson[j].HMO);
          docArrayExp.push(myjson[j].Expertise);
          docArrayhours.push(myjson[j].reception_hours);
        }
        else if(expertise == 'all' && myjson[j].HMO == hmo)
        {
          var maxDic = 99999; 
          var p1 = new google.maps.LatLng(mylat, mylng);
          var p2 = new google.maps.LatLng(myjson[j].lat, myjson[j].lng);
          //calcDistance from my point
          var x = calcDistance(p1, p2);
          //add all the res to array
          docArrayDis.push(x);
          docArrayAdd.push(myjson[j].Address);
          docArrayName.push(myjson[j].name);
          docArrayHMO.push(myjson[j].HMO);
          docArrayExp.push(myjson[j].Expertise);
          docArrayhours.push(myjson[j].reception_hours);
        }
        else if(hmo == 'all' && myjson[j].Expertise == expertise)
        {
          var maxDic = 99999; 
          var p1 = new google.maps.LatLng(mylat, mylng);
          var p2 = new google.maps.LatLng(myjson[j].lat, myjson[j].lng);
          //calcDistance from my point
          var x = calcDistance(p1, p2);
          //add all the res to array
          docArrayDis.push(x);
          docArrayAdd.push(myjson[j].Address);
          docArrayName.push(myjson[j].name);
          docArrayHMO.push(myjson[j].HMO);
          docArrayExp.push(myjson[j].Expertise);
          docArrayhours.push(myjson[j].reception_hours);
        }
      }

      for(var i=0;i<docArrayDis.length;i++){
        colsestDoc.push({distance:docArrayDis[i],addres:docArrayAdd[i],name:docArrayName[i],HMO:docArrayHMO[i],Expertise:docArrayExp[i],reception_hours:docArrayhours[i]});
      }
     
      console.log('get closest Doc' + colsestDoc);

      var docAroundMe = [];

      colsestDoc.sort(function (a, b) {   
        
        return a.distance - b.distance || a.Address - b.Address;
      });
        for(var j=0 ; j<colsestDoc.length ; j++){        
          if((colsestDoc[j].distance < 10) && (colsestDoc[j].HMO == hmo) && (colsestDoc[j].Expertise === expertise)){
            
            docAroundMe.push(colsestDoc[j]);
        }
          else if((colsestDoc[j].distance < 10) && (colsestDoc[j].HMO == hmo) && (expertise === 'all')){
            docAroundMe.push(colsestDoc[j]);  
          }
          else if((colsestDoc[j].distance < 10) && (hmo==='all') && (colsestDoc[j].Expertise === expertise)){
            docAroundMe.push(colsestDoc[j]);  
          }
          else if((colsestDoc[j].distance < 10) && (hmo==='all') && (expertise==='all')){
            docAroundMe.push(colsestDoc[j]);  
          }
      }
    return docAroundMe;  
 };      
  //calculates distance between two points in km's
  function calcDistance(p1, p2) {
    console.log("in cal to check distance");
    return (google.maps.geometry.spherical.computeDistanceBetween(p1, p2)/1000).toFixed(2);
  }
  
  function showResult(result) {
    mylat=result.geometry.location.lat();
    mylng=result.geometry.location.lng();
    listDoc = getDocAround(mylat,mylng);
    console.log("listDoc " + listDoc);
    $scope.docNearby = listDoc;
  }

    function getLatitudeLongitude(callback, address) {
      console.log('getLatitudeLongitude');
      var Address = address;
      // Initialize the Geocoder
      geocoder = new google.maps.Geocoder();
      if (geocoder) {
        geocoder.geocode({
        'address': Address
        }, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                callback(results[0]);
                //this callback calls the showResulat
            }
        });
      }
    }
 });
}]);

mymedical.controller('insertPersonalCtrl',['$scope','$http',function($scope,$http){   
  
  $scope.clickme = function(){  
    var data = {};
  
    console.log($scope.tags);     
    data.email = $scope.email;
    data.Title = $scope.Title;
    data.Info = $scope.Info;
    data.Category=$scope.Category;
    data.Recommendation = $scope.Recommendation;
    data.file = $scope.file;
                
            //$http.post('http://localhost:3000/addPersonal', JSON.stringify(data.Tags)).then()
  }                
}]);

mymedical.controller('loginCtrl',['$scope','$http','$cookies', function($scope,$http,$cookies){
        $scope.cookieAndCheck = function(value){
        var user = {};

        user.email=$scope.myemail;
        user.pass = $scope.pass;
        $cookies.put('cookieEmail',value);
        console.log(value);
//http://localhost:3000/login
        $http.post("https://mymed2.herokuapp.com/login", JSON.stringify(user)).then(function(res){
            if(res.data.val == 204)
            {
              alert("login successfull");
              window.location = "index.html";
            }
            else
              
            {
              alert("the user does not exist please register");
              window.location = "register.html";
            }
        })
      
  }
}]);

mymedical.controller('registerCtrl',['$scope','$http','$cookies', function($scope,$http,$cookies){
  $scope.registerUser = function(valEmail){
        var user = {};
        user.email=$scope.myemail;
        user.pass = $scope.pass;
        user.userName = $scope.userName;
        $cookies.put('cookieEmail',valEmail);
        //http://localhost:3000/saveUser
        $http.post("https://mymed2.herokuapp.com/saveUser", JSON.stringify(user)).then(function(res){
          if(res.data.val == 204)
          {
            window.location = "index.html";
          }
          else
          {
            window.location = "login.html";
          }
        }) 
  }
}]);

mymedical.controller('detailsCtrl',['$scope','$http','$cookies', function($scope,$http,$cookies){

  var emailCookie = $cookies.get('cookieEmail');
  $scope.showEmail = emailCookie;
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1; //January is 0!
  var yyyy = today.getFullYear();

    if(dd<10) {
        dd='0'+dd
    } 

    if(mm<10) {
        mm='0'+mm
    } 
    today = dd+'/'+mm+'/'+yyyy;
    $scope.showDate = today;
    
    //get category from db by email
    var catData = {};
    catData.email = emailCookie;
    //http://localhost:3000/getCategory
    $http.post("https://mymed2.herokuapp.com/getCategory",JSON.stringify(catData)).then(function(res){
      console.log(res.data);
      var catNames = [];
      for(var i=0; i<res.data.length; i++)
      {
        catNames.push(res.data[i].category);
      }
      $scope.names = catNames;
    });    

    $scope.personalSave =function(){
      
      var saveInfo ={};
      saveInfo.email = emailCookie;
      saveInfo.Title = $scope.Title;
      saveInfo.Category = $scope.selectedCat;
      saveInfo.Info = $scope.Info;
      saveInfo.Recommendation = $scope.Recommendation;
      saveInfo.mydate = today;

      // $http.post('http://localhost:3000/getKeywords',JSON.stringify(saveInfo)).then(function(tags){
      //   $cookies.put('Tags', JSON.stringify(tags.data));
         $cookies.put('cookieSave',JSON.stringify(saveInfo));
         //window.location ="insertTagsPermission.html";
      // });


  }
}]);

mymedical.controller('TagsPerCtrl',['$scope','$http','$cookies','dateFilter', function($scope,$http,$cookies,dateFilter){

 
var myinfo;
var myTags;

  $(body).ready(function() {
    console.log( "ready!" );
     $scope.myinfo = JSON.parse($cookies.get('cookieSave'));
      myinfo = JSON.parse($cookies.get('cookieSave'));
      //http://localhost:3000/getKeywords
      $http.post("https://mymed2.herokuapp.com/getKeywords",JSON.stringify(myinfo)).then(function(res){
      console.log(res);
      myTags = res.data;
      var newArrayTags = Object.values(myTags)
      $scope.Tags = newArrayTags;
      });
    });

    var element_input = document.getElementById('inputAdd');
    var element_btn = document.getElementById('buttonAdd');
    console.log(element_input + " " + element_btn);
    element_btn.style.display = "none";
    element_input.style.display = "none"; 

    $scope.addOtherUser = function() {
      console.log("click");
      element_btn.style.display = "block";
      element_input.style.display = "block";
    }

  $scope.callfunction = function()
  {
    var element_input = document.getElementById('inputAdd').value;
    var saveEmailPer = {};
    saveEmailPer.email = element_input;
    saveEmailPer.myemail = emailCookie;

//http://localhost:3000/addPerUser
    $http.post("https://mymed2.herokuapp.com/addPerUser",JSON.stringify(saveEmailPer)).then(function(res){
        if(res.data === "success"){
          console.log(res.data);
          window.location="insertTagsPermission.html";
         }
        else
        {
          alert("can't add user");
        }
    });  
  }



  var sendData ={};
  var emailCookie = $cookies.get('cookieEmail');
  sendData.email =emailCookie;
  var arrayPermission = [];
//http://localhost:3000/userInfo
$http.post("https://mymed2.herokuapp.com/userInfo",JSON.stringify(sendData)).success(function(data){
  for(var i=0; i<data.length; i++)
  {
    for(var j=0; j<(data[i].permission).length; j++)
    {
      arrayPermission.push(data[i].permission[j].perEmail);
    }
  }
  $scope.names = arrayPermission;
  console.log('this is the arrayPermission');
  console.log(arrayPermission+ "<br>");

  $scope.$watch('permission', function() {
  var getPremission = $scope.permission;
  var showPermission = document.getElementById('userPermission');

  if(getPremission ==1 && showPermission!=null)
  {
      showPermission.style.display = "block";
  } 
  else
  {
    if(showPermission!=null)
      showPermission.style.display = "none";
  }
});

});

var choice = [];

$scope.getChocie = function(val) {

  var myPosition = choice.indexOf(val);
  if(myPosition==-1)
    choice.push(val);
  else
    choice.splice(myPosition,1);

}
var modal = document.getElementById('myModal');

  $scope.addTagsPer = function(){
    
//get category sub tags
  var categoryName = myinfo.Category;
  var data = {};
  data.email = emailCookie;
  data.name = categoryName;
  console.log("dattaaaaaa  " + data);
  var subCategory = [];
  //http://localhost:3000/getSubTags
  if(!categoryName == '')
  {
  $http.post("https://mymed2.herokuapp.com/getSubTags",JSON.stringify(data)).success(function(res){
      console.log(res[0].tags);
      for(var i=0 ;i<res[0].tags.length; i++)
      {
        subCategory.push(res[0].tags[i].name);
      }
      callme(subCategory);
  });
  }
  else{
    callme("none");
  }


function callme(sub){
    var tagsPer = {};
    tagsPer.email = emailCookie;
    tagsPer.Title = myinfo.Title;
    tagsPer.Info = myinfo.Info;
    tagsPer.Category = categoryName;
    tagsPer.subTags = sub;
    tagsPer.Recommendation = myinfo.Recommendation;
    tagsPer.mydate = myinfo.mydate;
    tagsPer.Tags = $scope.Tags;
    tagsPer.Permission = choice;
    console.log("tagsPer   " + tagsPer.categoryName);
    //http://localhost:3000/addPerTags
    $http.post("https://mymed2.herokuapp.com/addPerTags",JSON.stringify(tagsPer)).then(function(docs){
    var notiDate = docs.data.date;
    var mytype = (typeof(notiDate));
    $scope.date = new Date();
    var todayDate = new Date();
    $scope.$watch('date', function (date)
    {
      var somedate = date;
      var reminderDay = document.getElementsByName('reminder');        
      if(mytype != typeof(1))
      {
        if(notiDate.includes("every"))
        {
          var getRepeat = notiDate.replace("every", "");
          for (var i = 0, length = reminderDay.length; i < length; i++) {
            if (reminderDay[i].value == Number(getRepeat)) {
                reminderDay[i].checked = true;
              break;
            }
          }
          $scope.dateString = todayDate;       
        }
        else if(notiDate.includes("-"))
        {
          var myDate = new Date(notiDate.split('-').reverse().join('/'));
          $scope.dateString = myDate;
        }
        else if(notiDate.includes("/"))
        {
          var myDate = new Date(notiDate.split('/').reverse().join('/'));
          $scope.dateString = myDate;
        }
        else if( notnotiDateiDay.includes("."))
        {
          var myDate = new Date(notiDate.split('.').reverse().join('/'));
          $scope.dateString = myDate;
        }
      }
      else
      {
        var numberOfDaysToAdd = notiDate;
        somedate.setDate(somedate.getDate() + numberOfDaysToAdd);
        somedate = new Date(somedate);     
        $scope.dateString = somedate;
      }
    });
      

          // Get the <span> element that closes the modal
          var span = document.getElementsByClassName("close")[0];
       
          modal.style.display = "block";
          // When the user clicks on <span> (x), close the modal
          span.onclick = function() {
              modal.style.display = "none";
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    } 
    });
  }
  }
  
    $scope.loadTags = function($query) {
      var tags = [];
      console.log("in loadTags client");
      console.log("emailCookie  " + emailCookie);
      //http://localhost:3000/getTags/
    return $http.get("https://mymed2.herokuapp.com/getTags/"+emailCookie,{ cache: true}).then(function(response) {
      console.log("tag in app  " + response.data);
      tags = response.data;
      console.log("tags   " + tags);
      return tags.filter(function(tag) {
        console.log("tag   " + tag);
        return tag.toLowerCase().indexOf($query.toLowerCase()) != -1;
      });
    });
  };

//save notification for each user by email
$scope.SaveNoti = function(val)
{
  var saveNoti = {};
  console.log("val  " + val);
    if(val == 'no')
    {
      window.location ="getPrivateData.html";
    }
    if(val == 'yes')
    {
      console.log("in yes");
      console.log("dateString  " + $scope.dateString);
      
      saveNoti.email = emailCookie;
      saveNoti.Recommendation = myinfo.Recommendation;
      saveNoti.dateNoti = $scope.dateString;
      var reminderDay = document.getElementsByName('reminder');        
      for (var i = 0, length = reminderDay.length; i < length; i++) {
        if (reminderDay[i].checked) {
          saveNoti.repeat=reminderDay[i].value;
          break;
        }
      }
      console.log("saveNoti  "  + saveNoti.dateNoti);
      modal.style.display = "none";
      //http://localhost:3000/addNotification
      $http.post("https://mymed2.herokuapp.com/addNotification",JSON.stringify(saveNoti)).then(function(res){
          window.location ="getPrivateData.html";
      }); 
    }

    
}

}]);


mymedical.controller('profileCtrl',['$scope','$http','$cookies', function($scope,$http,$cookies){
      
      var user = {};
      var emailCookie = $cookies.get('cookieEmail');
      $scope.showEmail = emailCookie;
      user.email = emailCookie;

      var addPermission ={};
      $scope.addUser = function()
      {
        console.log("adding user");
        addPermission.email = $scope.userEmail;
        addPermission.myemail = emailCookie;
        console.log(addPermission);
//http://localhost:3000/addPerUser
        $http.post("https://mymed2.herokuapp.com/addPerUser",JSON.stringify(addPermission)).then(function(res){
            alert("User successfully added");
            //window.location = "profile.html";
        });
      }

      var deletePermission ={};
      $scope.deleteUser = function()
      {
        console.log("delete user");
        deletePermission.email = $scope.delEmail;
        deletePermission.myemail = emailCookie;
        console.log(deletePermission);
//http://localhost:3000/deletePerUser
        $http.post("https://mymed2.herokuapp.com/deletePerUser",JSON.stringify(deletePermission)).then(function(res){
            alert("User deleted successfully");
            //window.location = "profile.html";
        });
      }
//http://localhost:3000/userInfo
       $http.post("https://mymed2.herokuapp.com/userInfo",JSON.stringify(user)).then(function(response){
          console.log(response.data);
          var userDetails = response.data;
           $scope.key = userDetails[0].key;
           $scope.username =userDetails[0].userName;  
       });
}]);

mymedical.controller('calCtrl',['$scope','$http','$cookies', function($scope,$http,$cookies){
 //go top button when scroll
  window.onscroll = function() {scrollFunction()};

  function scrollFunction() {
      if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
          document.getElementById("myBtn").style.display = "block";
      } else {
          document.getElementById("myBtn").style.display = "none";
      }
  }

  $scope.topFunction = function()
  {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }
//http://localhost:3000/doctors
  $http.get("https://mymed2.herokuapp.com/doctors").then(function(doctors) {
        var temp = [];
        $scope.general = doctors.data;
        
    });

  var emailCookie = $cookies.get('cookieEmail');

  $scope.user = function()
  {
    if(emailCookie == 'admin@gmail.com')
      return true;
    else
      return false;
  }

  $scope.edit = function(valueEdit)
  {
      $cookies.put('cookieEditGeneral',JSON.stringify(valueEdit));
      window.location = "editGeneralData.html";
  }

    $scope.deleteDoc=function(doc)
    {
      console.log("deleteDoc");
      var deletemodal = document.getElementById('deletePopup');

      // Get the <span> element that closes the modal
      var deletespan = document.getElementsByClassName("closeDelete")[0];
 
      console.log("fgefe");
      console.log(doc);
      deletemodal.style.display = "block";
      // When the user clicks on <span> (x), close the modal
      deletespan.onclick = function() {
          deletemodal.style.display = "none";
      }

      // When the user clicks anywhere outside of the modal, close it
      window.onclick = function(event) {
          if (event.target == deletemodal) {
              deletemodal.style.display = "none";
          }
      }
      $scope.delAddress = doc.Address; 
      $scope.delName = doc.name; 
      $scope.delEntity = doc.Entity;

      $scope.delYes= function(){
        
        $http.post("https://mymed2.herokuapp.com/delGeneral",JSON.stringify(doc)).then(function(response){
            deletemodal.style.display = "none";
            window.location = "generalRanking.html";
        });
        //http://localhost:3000/delGeneral
       // $http.post("https://mymed2.herokuapp.com/delGeneral",JSON.stringify(doc));
      }

      $scope.delNo = function(){
        deletemodal.style.display = "none";
      }

    }
  $scope.PA = 0;
  $scope.Pro = 0;
  $scope.AV = 0;
  $scope.AT = 0;
  $scope.Rec = 0;

var userRank ={};

  $scope.rankDoc = function(entity,name,expertise, address, rank,lastUp,numAll, numMy){
    $scope.dataName = name;
    $scope.dataAddress = address;
    $scope.dataRank = rank;
    $scope.lastUpdate = lastUp;
    $scope.Credibility = Math.round((numMy/numAll)*100);
    userRank.name = name;
    userRank.address = address;
    userRank.entity = entity;
    userRank.expertise =expertise;

    // Get the modal
    console.log("im in the right function");

    var modal = document.getElementById('myModal');

    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];
 
    modal.style.display = "block";
    // When the user clicks on <span> (x), close the modal
    span.onclick = function() {
        modal.style.display = "none";
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    var star = document.getElementById("showMyRank");
    
    while (star.hasChildNodes()) {
        star.removeChild(star.lastChild);
    }
    switch(Math.round(rank)){
      case 0:
      {
        for(var i=0; i<5; i++)
        {
          var node = document.createElement("img");
          node.src = "../images/star-empty-lg.png";
          star.appendChild(node);
        }
        break;
      }
      case 1:
      {
        for(var i=0; i<1; i++)
        {
          var node = document.createElement("img");
          node.src = "../images/star-fill-lg.png";
          star.appendChild(node);
        }
        for(var i=0; i<4; i++)
        {
          var node = document.createElement("img");
          node.src = "../images/star-empty-lg.png";
          star.appendChild(node);
        }
        break;
      }
      case 2:
      {
        for(var i=0; i<2; i++)
        {
          var node = document.createElement("img");
          node.src = "../images/star-fill-lg.png";
          star.appendChild(node);
        }
        for(var i=0; i<3; i++)
        {
          var node = document.createElement("img");
          node.src = "../images/star-empty-lg.png";
          star.appendChild(node);
        }

        break;
      }
      case 3:
      {
        for(var i=0; i<3; i++)
        {
          var node = document.createElement("img");
          node.src = "../images/star-fill-lg.png";
          star.appendChild(node);
        }
        for(var i=0; i<2; i++)
        {
          var node = document.createElement("img");
          node.src = "../images/star-empty-lg.png";
          star.appendChild(node);
        }
        break;
      }
      case 4:
      {
        for(var i=0; i<4; i++)
        {
          var node = document.createElement("img");
          node.src = "../images/star-fill-lg.png";
          star.appendChild(node);
        }
        for(var i=0; i<1; i++)
        {
          var node = document.createElement("img");
          node.src = "../images/star-empty-lg.png";
          star.appendChild(node);
        }

        break;
      }
      case 5:
      {
        for(var i=0; i<5; i++)
        {
          var node = document.createElement("img");
          node.src = "../images/star-fill-lg.png";
          star.appendChild(node);
        }

        break;
      }
    }

    $scope.clickPA = function (param) {
        console.log("ranking of personal attention " + param );
        userRank.attention = param;
    };
    $scope.clickPro = function (param) {
        console.log("ranking of proff " + param );
        userRank.proffessional = param;
    };
    $scope.clickAV = function (param) {
        console.log("ranking of availiable " + param );
        userRank.availability = param;
    };
    $scope.clickAT = function (param) {
        console.log("ranking of atmosphere " + param );
        userRank.atmosphere = param;
    };
    $scope.clickRec = function (param) {
        console.log("ranking of personal recommendation " + param );
        userRank.recommendation = param;
    };

    $scope.sendRank= function()
    {
      console.log("sendRank");
      var today = new Date();
      var dd = today.getDate();
      var mm = today.getMonth()+1; //January is 0!
      var yyyy = today.getFullYear();

        if(dd<10) {
            dd='0'+dd
        } 

        if(mm<10) {
            mm='0'+mm
        } 
        today = dd+'/'+mm+'/'+yyyy;
        userRank.insertDate = today;
      if(userRank.attention!=null && userRank.proffessional!=null && userRank.availability!=null
        && userRank.atmosphere!=null && userRank.recommendation!=null){
        console.log("userRank   " + userRank);
        //http://localhost:3000/getOneRank
        //https://mymed2.herokuapp.com/getOneRank
          $http.post("https://mymed2.herokuapp.com/getOneRank",JSON.stringify(userRank)).then(function(res){
              modal.style.display = "none"; 
              window.location = "generalRanking.html";
          });
      }
      else{
        var error = document.getElementById('errorLog');
        error.innerHTML="please rank all categories";
      }

      //location.reload();
    }
  }
  

}]);



mymedical.directive('starRating', function () {
    return {
        scope: {
            rating: '=',
            maxRating: '@',
            readOnly: '@',
            click: "&",
            mouseHover: "&",
            mouseLeave: "&"
        },
        restrict: 'EA',
        template:
            "<div style='display: inline-block; margin: 0px; padding: 0px; cursor:pointer;' ng-repeat='idx in maxRatings track by $index'> \
                    <img ng-src='{{((hoverValue + _rating) <= $index) && \"http://www.codeproject.com/script/ratings/images/star-empty-lg.png\" || \"http://www.codeproject.com/script/ratings/images/star-fill-lg.png\"}}' \
                    ng-Click='isolatedClick($index + 1)' \
                    ng-mouseenter='isolatedMouseHover($index + 1)' \
                    ng-mouseleave='isolatedMouseLeave($index + 1)'></img> \
            </div>",
        compile: function (element, attrs) {
            if (!attrs.maxRating || (Number(attrs.maxRating) <= 0)) {
                attrs.maxRating = '5';
            };
        },
        controller: function ($scope, $element, $attrs) {
            $scope.maxRatings = [];

            for (var i = 1; i <= $scope.maxRating; i++) {
                $scope.maxRatings.push({});
            };

            $scope._rating = $scope.rating;
      
      $scope.isolatedClick = function (param) {
        if ($scope.readOnly == 'true') return;

        $scope.rating = $scope._rating = param;
        $scope.hoverValue = 0;
        $scope.click({
          param: param
        });
      };

      $scope.isolatedMouseHover = function (param) {
        if ($scope.readOnly == 'true') return;

        $scope._rating = 0;
        $scope.hoverValue = param;
        $scope.mouseHover({
          param: param
        });
      };

      $scope.isolatedMouseLeave = function (param) {
        if ($scope.readOnly == 'true') return;

        $scope._rating = $scope.rating;
        $scope.hoverValue = 0;
        $scope.mouseLeave({
          param: param
        });
      };
        }
    };
});

mymedical.controller('viewPersonalCtrl',['$scope','$http','$cookies', function($scope,$http,$cookies){
    $scope.myinfo=JSON.parse($cookies.get('cookieView'));
    console.log(typeof($scope.myinfo));
    
    $(window).load(function() { 
     $("img").each(function(){ 
        var image = $(this); 
        if(image.context.naturalWidth == 0 || 
        image.readyState == 'uninitialized'){  
           $(image).unbind("error").hide();
        } 
      }); 
    });


}]);

mymedical.controller('editPersonalCtrl',['$scope','$http','$cookies', function($scope,$http,$cookies){
var etidTag = [];
var editPer = [];
    var myEdit = JSON.parse($cookies.get('cookieEdit'));
    console.log(myEdit);
    
    $scope.myinfoEdit= myEdit;
    for(var i=0;i<myEdit.Tags.length;i++)
    {
        etidTag.push(myEdit.Tags[i].name);
    }

    $scope.Tags = etidTag;
    var perviousTag = etidTag;

    for(var i=0;i<myEdit.permission.length;i++)
    {
        editPer.push(myEdit.permission[i].perEmail);
    }
    
    $scope.Per = editPer;

    if(editPer.length == 0)
    {
      document.getElementById('TitlePer').style.display = "none";
    }
    var choice = [];
    $scope.currentAcess=function(){
      for(var i=0; i<editPer.length; i++){
      choice.push(editPer[i]);
    }
  }


    var data ={};

    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();

      if(dd<10) {
          dd='0'+dd
      } 

      if(mm<10) {
          mm='0'+mm
      } 

    today = dd+'/'+mm+'/'+yyyy;

    //opened new path
    $scope.loadTag = function($query) {
      //http://localhost:3000/getAllTags
        return $http.get("https://mymed2.herokuapp.com/getAllTags", { cache: true}).then(function(response) {
      var tags = response.data;
      console.log();
        return tags.filter(function(tag) {
          return tag.name.toLowerCase().indexOf($query.toLowerCase()) != -1;
      });
    });
  };

    $scope.submitEdit = function() {
      console.log("submitEdit");
      var info = document.getElementById('Info').value;
      var recommendation = document.getElementById('Recommendation').value;
      var title = document.getElementById('Title').value;

      var notChoosen=[];
      var checkedItem = {};
      checkedItem = ($("input:checkbox:not(:checked)"));
      for(var i=0; i<checkedItem.length; i++){
        notChoosen.push(checkedItem[i].value);
      }

    var newPer =[];
     for(var j=0; j<choice.length; j++){
      if(notChoosen.indexOf(choice[j])== -1){
          newPer.push({perEmail:choice[j]});    
      }
     }
     
     var data = {};
     data.beforeTags = perviousTag;
     data.Tags = $scope.Tags;
     data.Per = newPer;
     data.Info  = info;
     data.Recommendation  = recommendation;
     data.Title  = title;
     data.email = myEdit.email;
     data.oldInfo = myEdit.Info;
     data.oldRec =  myEdit.Recommendation;
     data.oldTitle = myEdit.Title;
     data.myDate = today;
    console.log("submit");
//https://mymed1.herokuapp.com/updatePersonalData
//http://localhost:3000/updatePersonalData
//https://mymed2.herokuapp.com/updatePersonalData
   $http.post("https://mymed2.herokuapp.com/updatePersonalData",JSON.stringify(data)).then(function(res){
        window.location = "getPrivateData.html";
   });
  }
}]);
mymedical.controller('insertGeneralCtrl',['$scope','$http','$cookies', function($scope,$http,$cookies){


    var data ={};

    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();

      if(dd<10) {
          dd='0'+dd
      } 

      if(mm<10) {
          mm='0'+mm
      } 

    today = dd+'/'+mm+'/'+yyyy;

//get resp hours
    $scope.saveGeneral = function() {
      var convertAddress = $scope.Address;
      var sunday,monday,tuesday,wednesday,thursday,friday;
      var receptionHours = [];
      
      var sundayFrom = document.getElementById("SundayHoursFrom").value;
      var sundayUntil = document.getElementById("SundayHoursUntil").value;
      var mondayFrom = document.getElementById("MondayHoursFrom").value;
      var mondayUntil = document.getElementById("MondayHoursUntil").value;
      var tuesdayFrom = document.getElementById("TuesdayHoursFrom").value;
      var tuesdayUntil = document.getElementById("TuesdayHoursUntil").value;
      var wednesdayFrom = document.getElementById("WednesdayHoursFrom").value;
      var wednesdayUntil = document.getElementById("WednesdayHoursUntil").value;
      var thursdayFrom = document.getElementById("ThursdayHoursFrom").value;
      var thursdayUntil = document.getElementById("ThursdayHoursUntil").value;
      var fridayFrom = document.getElementById("FridayHoursFrom").value;
      var fridayUntil = document.getElementById("FridayHoursUntil").value;
      var HMO = document.getElementById('hmoSelect').value;
      var Entity = document.getElementById('entitySelect').value;

      sunday = sundayFrom+' '+"-"+' '+sundayUntil;
      monday = mondayFrom+' '+"-"+' '+mondayUntil;
      tuesday = tuesdayFrom+' '+"-"+' '+tuesdayUntil;
      wednesday = wednesdayFrom+' '+"-"+' '+wednesdayUntil; 
      thursday = thursdayFrom+' '+"-"+' '+thursdayUntil; 
      friday =  fridayFrom+' '+"-"+' '+fridayUntil; 
      receptionHours.push({Sunday:sunday,Monday:monday,Tuesday:tuesday,Wednesday:wednesday,Thursday:thursday,Friday:friday});

      console.log(receptionHours);

     data.Entity = Entity;
     data.name  = $scope.name;
     data.Expertise  = $scope.Expertise;
     data.HMO  = HMO;
     data.Address = $scope.Address;
     data.reception_hours = receptionHours;
     data.address = convertAddress;
     data.LastUpdate = today;
//http://localhost:3000/getGeneralData
//https://mymed2.herokuapp.com/getGeneralData

  $http.post("https://mymed2.herokuapp.com/getGeneralData",JSON.stringify(data)).then(function(res){
      window.location = "generalRanking.html";
  });
  
  }

}]);

mymedical.controller('editGeneralCtrl',['$scope','$http','$cookies', function($scope,$http,$cookies){

    var generalEdit = JSON.parse($cookies.get('cookieEditGeneral'));
    var cookieName = generalEdit.name;
    var cookieEntity = generalEdit.Entity;
    var cookieHMO = generalEdit.HMO;
    var cookieExpertise = generalEdit.Expertise;


    $scope.infoGeneral= generalEdit;

    for(var i=0; i<generalEdit.reception_hours.length; i++)
    {
      if(generalEdit.reception_hours[i].Sunday != null)
        $scope.sunday = generalEdit.reception_hours[i].Sunday;
      if(generalEdit.reception_hours[i].Monday != null)
        $scope.monday = generalEdit.reception_hours[i].Monday;
      if(generalEdit.reception_hours[i].Tuesday != null)
        $scope.tuesday = generalEdit.reception_hours[i].Tuesday;
      if(generalEdit.reception_hours[i].Wednesday != null)
        $scope.wednesday = generalEdit.reception_hours[i].Wednesday;
      if(generalEdit.reception_hours[i].Thursday != null)
        $scope.thursday = generalEdit.reception_hours[i].Thursday;
      if(generalEdit.reception_hours[i].Friday != null)
        $scope.friday = generalEdit.reception_hours[i].Friday;
    } 

    var reception = {};
    
    $scope.EditGeneral = function() {
      var data = {};
      console.log("EditGeneral");  
      console.log("cookieName   " + cookieName);
      console.log("cookieEntity    "  + cookieEntity);
      console.log("cookieHMO   " + cookieHMO);
      console.log("cookieExpertise   "  + cookieExpertise);
     data.entityBefore = cookieEntity;
     data.nameBefore = cookieName;
     data.hmoBefore = cookieHMO;
     data.expertiseBefore = cookieExpertise;

     data.Entity  = $scope.infoGeneral.Entity;
     data.Newname  = $scope.infoGeneral.name;
     data.Expertise  = $scope.infoGeneral.Expertise;
     data.HMO = $scope.infoGeneral.HMO;

//https://mymed2.herokuapp.com/updateGeneralData
//http://localhost:3000/updateGeneralData
      $http.post("https://mymed2.herokuapp.com/updateGeneralData",JSON.stringify(data)).then(function(success){
          window.location = "generalRanking.html";
      });
    }
      
}]);

