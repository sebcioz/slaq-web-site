var URL = 'http://slaq-backend.herokuapp.com/';

console.log('dupa');

angular.module('starter.controllers', [])

  .controller('LoginCtrl', function($scope, $rootScope, $location, $http) {
    $scope.user = {};

    $scope.login = function () {
      console.log($scope.user);

      console.log('dupa2');
      $http.
        post(URL + "/auth_user", $scope.user).
        success(function(response) {
          console.log(response);
          $rootScope.authToken = response.auth_token;
          $scope.failed = false;
          $location.path("/chat/topics");
        })
        .error(function(response) {
          $scope.failed = true;
        });
    }
  })

  .controller('DashCtrl', function($scope) {})

  .controller('TopicsCtrl', function($scope, MainRoom) {
    MainRoom.getInstance(function (instance) {
      $scope.mainRoom = instance;
    });
    console.log('topics');
  })
  .controller('TopicCtrl', function($scope, $stateParams, $ionicScrollDelegate, $rootScope, MainRoom) {
    id = parseInt($stateParams.topicId, 10);
    console.log('topic');

    $scope.newMessageBody = "";

    MainRoom.getInstance(function (instance) {
      $scope.mainRoom = instance;

      $scope.topic = _.find($scope.mainRoom.topics, { id: id });
    });

    $scope.send = function() {
      $scope.mainRoom.speak({ message: $scope.newMessageBody, room_id: id, login: { token: $rootScope.authToken } });
      $scope.newMessageBody = "";
    };

    $scope.$watchCollection("topic.messages", function () {
      $ionicScrollDelegate.scrollBottom(true);
    })
  })
  .controller('ChatsCtrl', function($scope, $ionicScrollDelegate, Chats, Room) {
    $scope.messages = []

    $scope.room = new Room('RoomChannel');
    $scope.room.onConnect = function() {
      console.log('connected');
    };
    $scope.room.onMessage = function(message) {
      $scope.messages.push(message);

      $scope.$apply();
      $ionicScrollDelegate.scrollBottom(true);
    };
    $scope.room.getArchive().then(function(topics) {
      console.log(topics);
      $scope.topics = topics;

      $ionicScrollDelegate.scrollBottom(true);
    });

    $scope.send = function() {
      $scope.room.speak($scope.newMessageBody);
      $scope.newMessageBody = "";
    };
  })
  .controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
    $scope.chat = Chats.get($stateParams.chatId);
  })
  .controller('AccountCtrl', function($scope) {
    $scope.settings = {
      enableFriends: true
    };
  });
