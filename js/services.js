var noop = function() {};

angular.module('starter.services', [])
  .factory('Login', function () {
    var url = URL + '/auth_user';

    var actions = {
      login: function (email, password, callback) {
        $http.post(url, { email: email, password: password }).then(function (response) {
          console.log(response);
          callback();
        }, function () {
          console.log('error!');
        });
      }
    }
  })
  .factory('Message', function () {
    function Message(attrs) {
      Object.assign(this, attrs);
      this.avatar_url = 'https://randomuser.me/api/portraits/men/' + (this.user_id || 1) + '.jpg';
    }

    return Message;
  })
  .factory('Topic', function (Message) {
    function Topic(options) {
      var that = this;

      that.id = options.id;
      that.name = options.name;
      that.messages = [];

      angular.forEach(options.messages, function (message) {
        that.messages.push(new Message(message));
      });
    }

    return Topic;
  })
  .factory('Room', function (Chat, Topic, Message, $http, $rootScope) {
    function Room(roomName) {
      var that = this;

      that.roomName = roomName;
      that.onConnect = noop;
      that.onMessage = noop;
      that.getArchive = function() {
        return $http.get("https://slaq-backend.herokuapp.com/rooms/show.json",
                         { headers: {'Authorization': $rootScope.authToken }}).then(function(response) {
          var topics = [];

          angular.forEach(response.data.rooms, function (room) {
            topics.push(new Topic(room));
          })

          return topics;
        });
      }
      that.speak = function(body) {
        that._room.speak(body);
      }
      that.login = function(authToken) {
        that._room.login(authToken);
      }
      that._room = Chat.subscriptions.create(roomName, {
        connected: function() {
          that.onConnect();
        },
        received: function(data) {
          that.onMessage(new Message(data.message));
        },
        login: function(authToken) {
          this.perform('login', { token: authToken });
        },
        speak: function(message) {
          this.perform('speak', message);
        }
      });
    }

    return Room;
  })
  .factory('MainRoom', function ($rootScope, Room) {
    var MainRoom = {};
    var instance = null;

    MainRoom.getInstance = function(cb) {
      if (instance) {
        cb(instance);
        return;
      }

      instance = new Room('RoomChannel');
      instance.onConnect = function() {
        console.log('connected');
        instance.login();
      };
      instance.onMessage = function(message) {
        topic = _.find(instance.topics, { id: message.room_id });
        topic.messages.push(message);

        $rootScope.$apply();

        console.log(message, topic);
        // $scope.messages.push(message);

        // $rootScope.$apply();
        // $ionicScrollDelegate.scrollBottom(true);
      };
      instance.getArchive().then(function(topics) {
        instance.topics = topics;

        cb(instance);
      });
    }

    return MainRoom;
  })
  .factory('Chat', function () {
    var chat = ActionCable.createConsumer("ws://slaq-backend.herokuapp.com/cable");

    return chat;
  })
  .factory('Chats', function() {

    // Some fake testing data
    var chats = [{
      id: 0,
      name: 'Ben Sparrow',
      lastText: 'You on your way?',
      face: 'img/ben.png'
    }, {
      id: 1,
      name: 'Max Lynx',
      lastText: 'Hey, it\'s me',
      face: 'img/max.png'
    }, {
      id: 2,
      name: 'Adam Bradleyson',
      lastText: 'I should buy a boat',
      face: 'img/adam.jpg'
    }, {
      id: 3,
      name: 'Perry Governor',
      lastText: 'Look at my mukluks!',
      face: 'img/perry.png'
    }, {
      id: 4,
      name: 'Mike Harrington',
      lastText: 'This is wicked good ice cream.',
      face: 'img/mike.png'
    }];

    return {
      all: function() {
        return chats;
      },
      remove: function(chat) {
        chats.splice(chats.indexOf(chat), 1);
      },
      get: function(chatId) {
        for (var i = 0; i < chats.length; i++) {
          if (chats[i].id === parseInt(chatId)) {
            return chats[i];
          }
        }
        return null;
      }
    };
  });
